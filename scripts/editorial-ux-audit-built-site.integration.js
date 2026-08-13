import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runCli } from './editorial-ux-audit/cli.js';

test('generated canonical site produces complete editorial UX evidence', async () => {
  const result = await runCli([
    '--site-dir', 'docs-html',
    '--output-dir', 'quality-artifacts',
    '--site-url', 'https://trueruslan.ru'
  ]);

  assert.equal(result.exitCode, 0);
  assert.ok(result.report.routeCount > 0);
  assert.equal(result.report.pages.length, result.report.routeCount);

  const json = JSON.parse(await readFile('quality-artifacts/editorial-ux-audit.json', 'utf8'));
  const markdown = await readFile('quality-artifacts/editorial-ux-audit.md', 'utf8');
  assert.equal(json.routeCount, result.report.routeCount);
  assert.match(markdown, /# Editorial & UX Audit/);
});
