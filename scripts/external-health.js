import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {checkUrls} from './http-health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'data', 'external-links.json');
const REPORT_DIR = path.join(ROOT, 'health-artifacts');

function toMarkdown(results) {
  const lines = [
    '# External health report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Status | Endpoint | Category | HTTP | Final URL |',
    '|---|---|---|---:|---|',
  ];

  for (const result of results) {
    const marker = result.ok ? '✅' : '❌';
    const status = result.status ?? 'network';
    lines.push(`| ${marker} ${result.classification} | ${result.name} | ${result.category} | ${status} | ${result.finalUrl || result.url} |`);
  }

  const failures = results.filter((result) => !result.ok);
  if (failures.length) {
    lines.push('', '## Actionable failures', '');
    for (const failure of failures) {
      lines.push(`- **${failure.name}** — ${failure.error || `HTTP ${failure.status}`} — ${failure.url}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

export async function runExternalHealth({manifestPath = MANIFEST_PATH} = {}) {
  const entries = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = await checkUrls(entries, {
    timeoutMs: 15_000,
    maxRedirects: 5,
    concurrency: 4,
  });

  fs.mkdirSync(REPORT_DIR, {recursive: true});
  const report = {
    checkedAt: new Date().toISOString(),
    ok: results.every((result) => result.ok),
    results,
  };
  fs.writeFileSync(path.join(REPORT_DIR, 'external-health.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, 'external-health.md'), toMarkdown(results));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runExternalHealth()
    .then((report) => {
      for (const result of report.results) {
        console.log(`[${result.ok ? 'OK' : 'FAIL'}] ${result.name}: ${result.status ?? 'network'} ${result.finalUrl || result.url}`);
      }
      if (!report.ok) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
