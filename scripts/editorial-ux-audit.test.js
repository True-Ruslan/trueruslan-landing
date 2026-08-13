import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function loadAuditModule() {
  try {
    return await import('./editorial-ux-audit.js');
  } catch (error) {
    assert.fail(`editorial UX audit implementation is missing: ${error.message}`);
  }
}

function pageHtml({ title = 'Page', h1 = 'Page', paragraph = 'Короткий текст.' } = {}) {
  return `<!doctype html>
<html lang="ru">
<head><title>${title}</title></head>
<body>
<header><p>Navigation text must not count.</p></header>
<main>
  <h1>${h1}</h1>
  <p>${paragraph}</p>
</main>
<footer><p>Footer text must not count.</p></footer>
</body>
</html>`;
}

test('classifies decision, discovery and deep routes without skipping unknown canonical pages', async () => {
  const { classifyRoute } = await loadAuditModule();

  assert.equal(classifyRoute('/'), 'tier1');
  assert.equal(classifyRoute('/landing/resume/'), 'tier1');
  assert.equal(classifyRoute('/en/resume/'), 'tier1');
  assert.equal(classifyRoute('/landing/publications/'), 'tier2');
  assert.equal(classifyRoute('/landing/projects/notchhub/'), 'tier2');
  assert.equal(classifyRoute('/landing/notes/green-ci-is-not-product-verification/'), 'tier3');
  assert.equal(classifyRoute('/en/notes/server-authoritative-ai-npcs/'), 'tier3');
  assert.equal(classifyRoute('/some-new-canonical-page/'), 'tier3');
});

test('parses same-origin sitemap routes in stable order and rejects an empty canonical set', async () => {
  const { parseSitemapRoutes } = await loadAuditModule();
  const xml = `<?xml version="1.0"?>
<urlset>
  <url><loc>https://trueruslan.ru/</loc></url>
  <url><loc>https://trueruslan.ru/landing/resume/</loc></url>
  <url><loc>https://trueruslan.ru/landing/resume/</loc></url>
  <url><loc>https://trueruslan.ru/en/resume/</loc></url>
  <url><loc>https://example.com/not-ours/</loc></url>
</urlset>`;

  assert.deepEqual(parseSitemapRoutes(xml, 'https://trueruslan.ru'), [
    '/',
    '/landing/resume/',
    '/en/resume/'
  ]);
  assert.throws(
    () => parseSitemapRoutes('<urlset></urlset>', 'https://trueruslan.ru'),
    /no canonical routes/i
  );
});

test('extracts metrics only from main content and keeps action/link counts bounded', async () => {
  const { extractPageMetrics } = await loadAuditModule();
  const html = `<!doctype html>
<html lang="ru">
<head><title>Опыт — TrueRuslan</title></head>
<body>
<header><p>Этот текст не должен попадать в метрики.</p></header>
<main>
  <h1>Опыт</h1>
  <p>Короткий первый абзац.</p>
  <h2>Раздел</h2>
  <p>Второй абзац тоже короткий.</p>
  <ul><li>Пункт один.</li><li>Пункт два.</li></ul>
  <a href="/landing/projects/">Проекты</a>
  <div class="tr-home-actions"><a href="/landing/resume/">Опыт</a></div>
  <a href="https://example.com/">External</a>
</main>
<footer><p>И этот текст не должен попадать в метрики.</p></footer>
</body>
</html>`;

  const metrics = extractPageMetrics(html, '/landing/resume/');

  assert.equal(metrics.locale, 'ru');
  assert.equal(metrics.tier, 'tier1');
  assert.equal(metrics.title, 'Опыт — TrueRuslan');
  assert.equal(metrics.h1, 'Опыт');
  assert.equal(metrics.wordCount, 11);
  assert.equal(metrics.paragraphCount, 2);
  assert.equal(metrics.firstParagraphWords, 3);
  assert.equal(metrics.longestParagraphWords, 4);
  assert.equal(metrics.headingCount, 2);
  assert.equal(metrics.listItemCount, 2);
  assert.equal(metrics.internalLinkCount, 2);
  assert.equal(metrics.actionLinkCount, 1);
});

test('emits tier-specific scanability warnings without treating long-form depth as a defect', async () => {
  const { buildWarnings } = await loadAuditModule();

  const tier1Warnings = buildWarnings({
    tier: 'tier1',
    h1: 'Опыт',
    firstParagraphWords: 56,
    longestParagraphWords: 90,
    __proseText: 'Useful context followed by durable reconciliation and exact-head details.'
  });

  assert.deepEqual(tier1Warnings.map((warning) => warning.code), [
    'FIRST_PARAGRAPH_LONG',
    'PARAGRAPH_LONG',
    'PROCESS_JARGON'
  ]);

  const tier2Warnings = buildWarnings({
    tier: 'tier2',
    h1: 'Публикации',
    firstParagraphWords: 71,
    longestParagraphWords: 111,
    __proseText: 'Collection orientation.'
  });
  assert.deepEqual(tier2Warnings.map((warning) => warning.code), [
    'FIRST_PARAGRAPH_LONG',
    'PARAGRAPH_LONG'
  ]);

  const tier3Warnings = buildWarnings({
    tier: 'tier3',
    h1: 'Deep note',
    firstParagraphWords: 200,
    longestParagraphWords: 400,
    __proseText: 'Long technical evidence.'
  });
  assert.deepEqual(tier3Warnings, []);
});

test('audits every sitemap route and fails closed when a canonical clean route is missing', async () => {
  const { auditSite } = await loadAuditModule();
  const root = await mkdtemp(join(tmpdir(), 'trueruslan-editorial-audit-'));

  try {
    await mkdir(join(root, 'landing', 'resume'), { recursive: true });
    await writeFile(
      join(root, 'sitemap.xml'),
      `<?xml version="1.0"?><urlset>
        <url><loc>https://trueruslan.ru/</loc></url>
        <url><loc>https://trueruslan.ru/landing/resume/</loc></url>
      </urlset>`,
      'utf8'
    );
    await writeFile(join(root, 'index.html'), pageHtml({ title: 'Home', h1: 'Руслан Немыкин' }), 'utf8');
    await writeFile(
      join(root, 'landing', 'resume', 'index.html'),
      pageHtml({ title: 'Опыт', h1: 'Опыт' }),
      'utf8'
    );

    const report = await auditSite({ siteDir: root, siteUrl: 'https://trueruslan.ru' });
    assert.deepEqual(report.pages.map((page) => page.route), ['/', '/landing/resume/']);

    await rm(join(root, 'landing', 'resume', 'index.html'));
    await assert.rejects(
      () => auditSite({ siteDir: root, siteUrl: 'https://trueruslan.ru' }),
      /missing canonical route.*\/landing\/resume\//i
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
