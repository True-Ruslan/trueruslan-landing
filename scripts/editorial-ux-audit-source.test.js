import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { classifyRoute } from './editorial-ux-audit/core.js';
import { auditSite } from './editorial-ux-audit/runner.js';

async function loadSourceModule() {
  try {
    return await import('./editorial-ux-audit/source.js');
  } catch (error) {
    assert.fail(`clean-route source auditor is missing: ${error.message}`);
  }
}

test('classifies production clean routes by reader purpose', () => {
  assert.equal(classifyRoute('/'), 'tier1');
  assert.equal(classifyRoute('/projects/'), 'tier1');
  assert.equal(classifyRoute('/resume/'), 'tier1');
  assert.equal(classifyRoute('/work-with-me/'), 'tier1');
  assert.equal(classifyRoute('/about/'), 'tier1');
  assert.equal(classifyRoute('/now/'), 'tier1');
  assert.equal(classifyRoute('/materials/'), 'tier1');
  assert.equal(classifyRoute('/contacts/'), 'tier1');
  assert.equal(classifyRoute('/publications/'), 'tier2');
  assert.equal(classifyRoute('/engineering-map/'), 'tier2');
  assert.equal(classifyRoute('/notes/'), 'tier2');
  assert.equal(classifyRoute('/projects/notchhub/'), 'tier2');
  assert.equal(classifyRoute('/notes/green-ci-is-not-product-verification/'), 'tier3');
  assert.equal(classifyRoute('/en/projects/'), 'tier1');
  assert.equal(classifyRoute('/en/projects/notchhub/'), 'tier2');
  assert.equal(classifyRoute('/en/notes/server-authoritative-ai-npcs/'), 'tier3');
});

test('maps canonical clean routes to existing repository content owners', async () => {
  const { sourceOwnerForRoute } = await loadSourceModule();
  assert.equal(sourceOwnerForRoute('/'), 'templates/index.html');
  assert.equal(sourceOwnerForRoute('/en/'), 'templates/index.en.html');
  assert.equal(sourceOwnerForRoute('/projects/'), 'docs/landing/projects.md');
  assert.equal(sourceOwnerForRoute('/projects/notchhub/'), 'docs/landing/projects/notchhub.md');
  assert.equal(sourceOwnerForRoute('/notes/example/'), 'docs/landing/notes/example.md');
  assert.equal(sourceOwnerForRoute('/en/projects/'), 'docs/en/projects.md');
  assert.equal(sourceOwnerForRoute('/en/projects/notchhub/'), 'docs/en/projects/notchhub.md');
});

test('extracts scanability metrics from canonical markdown without counting code or directives as prose', async () => {
  const { extractMarkdownMetrics } = await loadSourceModule();
  const markdown = `# Проекты\n\nКороткий первый абзац.\n\n## Выбранные проекты\n\nВторой абзац тоже короткий.\n\n- Пункт один\n- Пункт два\n\n[Внутренняя ссылка](resume.md)\n\n{% note info %}\nТекст внутри заметки учитывается.\n{% endnote %}\n\n\`\`\`js\nconst ignored = 'code';\n\`\`\``;
  const metrics = extractMarkdownMetrics(markdown, '/projects/');
  assert.equal(metrics.tier, 'tier1');
  assert.equal(metrics.h1, 'Проекты');
  assert.equal(metrics.paragraphCount, 4);
  assert.equal(metrics.firstParagraphWords, 3);
  assert.equal(metrics.headingCount, 2);
  assert.equal(metrics.listItemCount, 2);
  assert.equal(metrics.internalLinkCount, 1);
  assert.equal(metrics.__proseText.includes('ignored'), false);
});

test('audits sitemap clean routes through repository source owners while keeping standalone homepage generated', async () => {
  const siteDir = await mkdtemp(join(tmpdir(), 'trueruslan-editorial-site-'));
  const projectDir = await mkdtemp(join(tmpdir(), 'trueruslan-editorial-project-'));

  try {
    await mkdir(join(projectDir, 'docs', 'landing'), { recursive: true });
    await writeFile(
      join(siteDir, 'sitemap.xml'),
      `<?xml version="1.0"?><urlset>
        <url><loc>https://trueruslan.ru/</loc></url>
        <url><loc>https://trueruslan.ru/resume/</loc></url>
      </urlset>`,
      'utf8'
    );
    await writeFile(
      join(siteDir, 'index.html'),
      '<!doctype html><html><head><title>Home</title></head><body><main><h1>Руслан Немыкин</h1><p>Главная.</p></main></body></html>',
      'utf8'
    );
    await writeFile(join(projectDir, 'docs', 'landing', 'resume.md'), '# Опыт\n\nКороткое описание опыта.\n', 'utf8');

    const report = await auditSite({
      siteDir,
      projectDir,
      siteUrl: 'https://trueruslan.ru'
    });

    assert.deepEqual(report.pages.map((page) => page.route), ['/', '/resume/']);
    assert.equal(report.pages[1].h1, 'Опыт');
    assert.equal(report.pages[1].tier, 'tier1');
  } finally {
    await rm(siteDir, { recursive: true, force: true });
    await rm(projectDir, { recursive: true, force: true });
  }
});
