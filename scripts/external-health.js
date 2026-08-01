import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {checkUrls} from './http-health.js';
import {getSiteUrl} from './seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'data', 'external-links.json');
const REPORT_DIR = path.join(ROOT, 'health-artifacts');

export function deriveProductionEntries(baseUrl) {
  const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  return [
    ['Production homepage', ''],
    ['Production projects', 'landing/projects.html'],
    ['Production resume', 'landing/resume.html'],
    ['Production resume PDF', 'assets/documents/cv.pdf', 'application/pdf'],
  ].map(([name, relative, expectedContentType]) => ({
    name,
    category: 'production',
    url: new URL(relative, base).href,
    ...(expectedContentType ? {expectedContentType} : {}),
  }));
}

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

export async function runExternalHealth({
  manifestPath = MANIFEST_PATH,
  reportDir = REPORT_DIR,
  baseUrl = process.env.PRODUCTION_URL || getSiteUrl(),
  fetchImpl = globalThis.fetch,
} = {}) {
  const externalEntries = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entries = [...deriveProductionEntries(baseUrl), ...externalEntries];
  const results = await checkUrls(entries, {
    fetchImpl,
    timeoutMs: 15_000,
    maxRedirects: 5,
    concurrency: 4,
  });

  fs.mkdirSync(reportDir, {recursive: true});
  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl: new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href,
    ok: results.every((result) => result.ok),
    results,
  };
  fs.writeFileSync(path.join(reportDir, 'external-health.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(reportDir, 'external-health.md'), toMarkdown(results));
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
