import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function loadCli() {
  try {
    return await import('./editorial-ux-audit/cli.js');
  } catch (error) {
    assert.fail(`editorial UX audit CLI is missing: ${error.message}`);
  }
}

async function makeSite() {
  const root = await mkdtemp(join(tmpdir(), 'trueruslan-editorial-cli-'));
  await mkdir(join(root, 'resume'), { recursive: true });
  await writeFile(
    join(root, 'sitemap.xml'),
    `<?xml version="1.0"?><urlset>
      <url><loc>https://trueruslan.ru/</loc></url>
      <url><loc>https://trueruslan.ru/resume/</loc></url>
    </urlset>`,
    'utf8'
  );
  await writeFile(join(root, 'index.html'), '<!doctype html><html><head><title>Home</title></head><body><main><h1>Home</h1><p>Short.</p></main></body></html>', 'utf8');
  await writeFile(join(root, 'resume', 'index.html'), '<!doctype html><html><head><title>Resume</title></head><body><main><h1>Resume</h1><p>Short.</p></main></body></html>', 'utf8');
  return root;
}

test('renders deterministic report summaries and one route row per audited page', async () => {
  const { renderMarkdownReport } = await import('./editorial-ux-audit/index.js');
  const report = {
    generatedAt: '2026-08-13T13:00:00.000Z',
    siteUrl: 'https://trueruslan.ru',
    routeCount: 2,
    totals: {
      tier1: 1,
      tier2: 1,
      tier3: 0,
      warnings: 1,
      warningCodes: { PROCESS_JARGON: 1 }
    },
    pages: [
      { route: '/', tier: 'tier1', wordCount: 20, firstParagraphWords: 20, longestParagraphWords: 20, warnings: [] },
      { route: '/publications/', tier: 'tier2', wordCount: 40, firstParagraphWords: 12, longestParagraphWords: 30, warnings: [{ code: 'PROCESS_JARGON' }] }
    ]
  };

  const markdown = renderMarkdownReport(report);
  assert.match(markdown, /Generated: 2026-08-13T13:00:00\.000Z/);
  assert.match(markdown, /Routes: 2/);
  assert.match(markdown, /tier1: 1/);
  assert.match(markdown, /tier2: 1/);
  assert.match(markdown, /PROCESS_JARGON: 1/);
  assert.match(markdown, /\| \/ \| tier1 \|/);
  assert.match(markdown, /\| \/publications\/ \| tier2 \|/);
});

test('CLI writes JSON and Markdown reports while editorial warnings remain exit-success diagnostics', async () => {
  const { runCli } = await loadCli();
  const siteDir = await makeSite();
  const outputDir = await mkdtemp(join(tmpdir(), 'trueruslan-editorial-output-'));

  try {
    const result = await runCli([
      '--site-dir', siteDir,
      '--output-dir', outputDir,
      '--site-url', 'https://trueruslan.ru'
    ]);

    assert.equal(result.exitCode, 0);
    const json = JSON.parse(await readFile(join(outputDir, 'editorial-ux-audit.json'), 'utf8'));
    const markdown = await readFile(join(outputDir, 'editorial-ux-audit.md'), 'utf8');
    assert.equal(json.routeCount, 2);
    assert.equal(json.pages.length, 2);
    assert.match(markdown, /Editorial & UX Audit/);
  } finally {
    await rm(siteDir, { recursive: true, force: true });
    await rm(outputDir, { recursive: true, force: true });
  }
});

test('CLI fails closed on missing or incomplete inputs', async () => {
  const { runCli } = await loadCli();
  await assert.rejects(() => runCli([]), /site-dir.*output-dir.*site-url/i);
  await assert.rejects(
    () => runCli(['--site-dir', '/definitely/missing', '--output-dir', '/tmp/out', '--site-url', 'https://trueruslan.ru']),
    /ENOENT|no such file/i
  );
});
