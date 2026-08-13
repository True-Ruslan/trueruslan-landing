import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { auditSite } from './editorial-ux-audit/runner.js';
import { renderMarkdownReport, withTotals } from './editorial-ux-audit/report.js';

test('internal prose is removed before audit output and report rendering', async () => {
  const siteDir = await mkdtemp(join(tmpdir(), 'editorial-output-site-'));
  const projectDir = await mkdtemp(join(tmpdir(), 'editorial-output-project-'));
  try {
    await mkdir(join(projectDir, 'docs', 'landing'), { recursive: true });
    await writeFile(
      join(siteDir, 'sitemap.xml'),
      '<urlset><url><loc>https://trueruslan.ru/resume/</loc></url></urlset>',
      'utf8'
    );
    await writeFile(
      join(projectDir, 'docs', 'landing', 'resume.md'),
      '# Experience\n\nINTERNAL_PROSE_MARKER belongs only to warning analysis.\n',
      'utf8'
    );

    const report = withTotals(await auditSite({ siteDir, projectDir, siteUrl: 'https://trueruslan.ru' }));
    assert.equal(Object.hasOwn(report.pages[0], '__proseText'), false);
    assert.equal(JSON.stringify(report).includes('INTERNAL_PROSE_MARKER'), false);
    assert.equal(renderMarkdownReport(report).includes('INTERNAL_PROSE_MARKER'), false);
  } finally {
    await rm(siteDir, { recursive: true, force: true });
    await rm(projectDir, { recursive: true, force: true });
  }
});
