import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {checkUrls} from './http-health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'production-smoke-report.json');

export function deriveProductionEndpoints(baseUrl) {
  const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  const entries = [
    ['Homepage', ''],
    ['Projects', 'landing/projects.html'],
    ['Resume', 'landing/resume.html'],
    ['Resume PDF', 'assets/documents/cv.pdf', 'application/pdf'],
    ['Core stylesheet', '_assets/style/custom.css'],
    ['Core script', '_assets/script/custom.js'],
    ['Favicon', 'assets/images/favicon.svg'],
  ];

  return entries.map(([name, relative, expectedContentType]) => ({
    name,
    url: new URL(relative, base).href,
    ...(expectedContentType ? {expectedContentType} : {}),
  }));
}

async function assertHomepageIdentity(baseUrl, fetchImpl = globalThis.fetch) {
  const homepage = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href;
  const response = await fetchImpl(homepage, {
    headers: {'user-agent': 'TrueRuslan-Production-Smoke/1.0'},
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Homepage identity check failed with HTTP ${response.status}.`);
  }

  const html = await response.text();
  if (!html.includes('Руслан Немыкин') || !html.includes('Backend Engineer')) {
    throw new Error('Homepage identity markers were not found in deployed HTML.');
  }
}

export async function runProductionSmoke(baseUrl, {fetchImpl = globalThis.fetch} = {}) {
  const endpoints = deriveProductionEndpoints(baseUrl);
  const results = await checkUrls(endpoints, {
    fetchImpl,
    timeoutMs: 10_000,
    maxRedirects: 5,
    concurrency: 4,
  });

  let identityError = null;
  try {
    await assertHomepageIdentity(baseUrl, fetchImpl);
  } catch (error) {
    identityError = error.message;
  }

  const failures = results.filter((result) => !result.ok);
  if (identityError) failures.push({name: 'Homepage identity', error: identityError});

  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    ok: failures.length === 0,
    results,
    identityError,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  return report;
}

async function main() {
  const baseUrl = process.argv[2] || process.env.PRODUCTION_URL;
  if (!baseUrl) {
    throw new Error('Provide production URL as argv[2] or PRODUCTION_URL.');
  }

  const report = await runProductionSmoke(baseUrl);
  for (const result of report.results) {
    const marker = result.ok ? 'OK' : 'FAIL';
    console.log(`[${marker}] ${result.name}: ${result.status ?? 'network'} ${result.finalUrl || result.url}`);
  }

  if (report.identityError) {
    console.error(`[FAIL] Homepage identity: ${report.identityError}`);
  }

  if (!report.ok) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
