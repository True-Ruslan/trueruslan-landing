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
    ['Now', 'landing/now.html'],
    ['Engineering Map', 'landing/engineering-map.html'],
    ['Engineering Notes', 'landing/notes.html'],
    ['Photo Stories', 'photos/'],
    ['Atom feed', 'feed.xml'],
    ['Resume', 'landing/resume.html'],
    ['Resume PDF', 'assets/documents/cv.pdf', 'application/pdf'],
    ['Homepage OpenGraph card', 'assets/og/home.png', 'image/png'],
    ['Engineering Map OpenGraph card', 'assets/og/engineering-map.png', 'image/png'],
    ['Core stylesheet', '_assets/style/custom.css'],
    ['Command palette stylesheet', '_assets/style/command-palette.css'],
    ['Photo Stories stylesheet', '_assets/style/photo-stories.css'],
    ['Core script', '_assets/script/custom.js'],
    ['Command palette script', '_assets/script/command-palette.js'],
    ['Photo Stories script', '_assets/script/photo-stories.js'],
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

  if (!response.ok) throw new Error(`Homepage identity check failed with HTTP ${response.status}.`);

  const html = await response.text();
  if (!html.includes('Руслан Немыкин') || !html.includes('Backend Engineer')) {
    throw new Error('Homepage identity markers were not found in deployed HTML.');
  }
}

async function assertFeedIdentity(baseUrl, fetchImpl = globalThis.fetch) {
  const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  const response = await fetchImpl(new URL('feed.xml', base).href, {
    headers: {'user-agent': 'TrueRuslan-Production-Smoke/1.0'},
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Feed identity check failed with HTTP ${response.status}.`);
  const xml = await response.text();
  if (!xml.includes('<feed xmlns="http://www.w3.org/2005/Atom">') || !xml.includes('<title>TrueRuslan Engineering Notes</title>')) {
    throw new Error('Atom feed identity markers were not found in deployed XML.');
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

  const identityErrors = [];
  try {
    await assertHomepageIdentity(baseUrl, fetchImpl);
  } catch (error) {
    identityErrors.push(`Homepage identity: ${error.message}`);
  }
  try {
    await assertFeedIdentity(baseUrl, fetchImpl);
  } catch (error) {
    identityErrors.push(`Atom feed identity: ${error.message}`);
  }

  const failures = results.filter((result) => !result.ok);
  for (const error of identityErrors) failures.push({name: error.split(':', 1)[0], error});

  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    ok: failures.length === 0,
    results,
    identityErrors,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  return report;
}

async function main() {
  const baseUrl = process.argv[2] || process.env.PRODUCTION_URL;
  if (!baseUrl) throw new Error('Provide production URL as argv[2] or PRODUCTION_URL.');

  const report = await runProductionSmoke(baseUrl);
  for (const result of report.results) {
    const marker = result.ok ? 'OK' : 'FAIL';
    console.log(`[${marker}] ${result.name}: ${result.status ?? 'network'} ${result.finalUrl || result.url}`);
  }

  for (const identityError of report.identityErrors) console.error(`[FAIL] ${identityError}`);
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
