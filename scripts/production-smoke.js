import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {inspectAnalyticsHtml} from './analytics-deployment.js';
import {checkUrls} from './http-health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'production-smoke-report.json');
const ANALYTICS_EXPECTATIONS = new Set(['ignore', 'enabled', 'disabled']);

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

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {'user-agent': 'TrueRuslan-Production-Smoke/1.0'},
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function assertHomepageIdentity(baseUrl, fetchImpl = globalThis.fetch) {
  const homepage = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href;
  let html;
  try {
    html = await fetchText(homepage, fetchImpl);
  } catch (error) {
    throw new Error(`Homepage identity check failed with ${error.message}.`);
  }

  if (!html.includes('Руслан Немыкин') || !html.includes('Backend Engineer')) {
    throw new Error('Homepage identity markers were not found in deployed HTML.');
  }
}

async function assertFeedIdentity(baseUrl, fetchImpl = globalThis.fetch) {
  const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  let xml;
  try {
    xml = await fetchText(new URL('feed.xml', base).href, fetchImpl);
  } catch (error) {
    throw new Error(`Feed identity check failed with ${error.message}.`);
  }
  if (!xml.includes('<feed xmlns="http://www.w3.org/2005/Atom">') || !xml.includes('<title>TrueRuslan Engineering Notes</title>')) {
    throw new Error('Atom feed identity markers were not found in deployed XML.');
  }
}

async function verifyProductionAnalytics(baseUrl, {
  fetchImpl,
  expectation,
  token,
}) {
  const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  const routes = [
    {route: 'index.html', url: base.href},
    {route: 'en/index.html', url: new URL('en/index.html', base).href},
  ];

  const results = [];
  for (const entry of routes) {
    try {
      const html = await fetchText(entry.url, fetchImpl);
      results.push({
        route: entry.route,
        ...inspectAnalyticsHtml(html, {expectation, token}),
      });
    } catch (error) {
      results.push({
        route: entry.route,
        ok: false,
        beaconCount: 0,
        errors: [`Production analytics check failed: ${error.message}`],
      });
    }
  }

  return {
    expectation,
    ok: results.every((entry) => entry.ok),
    routes: results,
  };
}

export async function runProductionSmoke(baseUrl, {
  fetchImpl = globalThis.fetch,
  analyticsExpectation = 'ignore',
  analyticsToken,
} = {}) {
  const normalizedAnalyticsExpectation = String(analyticsExpectation || 'ignore').trim().toLowerCase();
  if (!ANALYTICS_EXPECTATIONS.has(normalizedAnalyticsExpectation)) {
    throw new Error(`invalid analytics expectation: ${analyticsExpectation}`);
  }

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

  const analytics = normalizedAnalyticsExpectation === 'ignore'
    ? null
    : await verifyProductionAnalytics(baseUrl, {
      fetchImpl,
      expectation: normalizedAnalyticsExpectation,
      token: analyticsToken,
    });

  if (analytics && !analytics.ok) {
    for (const route of analytics.routes.filter((entry) => !entry.ok)) {
      failures.push({
        name: `Analytics ${route.route}`,
        error: route.errors.join(' '),
      });
    }
  }

  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    ok: failures.length === 0,
    results,
    identityErrors,
    ...(analytics ? {analytics} : {}),
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  return report;
}

async function main() {
  const baseUrl = process.argv[2] || process.env.PRODUCTION_URL;
  if (!baseUrl) throw new Error('Provide production URL as argv[2] or PRODUCTION_URL.');

  const report = await runProductionSmoke(baseUrl, {
    analyticsExpectation: process.env.ANALYTICS_EXPECTATION || 'ignore',
    analyticsToken: process.env.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN,
  });
  for (const result of report.results) {
    const marker = result.ok ? 'OK' : 'FAIL';
    console.log(`[${marker}] ${result.name}: ${result.status ?? 'network'} ${result.finalUrl || result.url}`);
  }

  for (const identityError of report.identityErrors) console.error(`[FAIL] ${identityError}`);
  if (report.analytics) {
    for (const route of report.analytics.routes) {
      console.log(
        `[${route.ok ? 'OK' : 'FAIL'}] Analytics ${route.route}: expectation=${report.analytics.expectation} beacons=${route.beaconCount}`,
      );
      for (const error of route.errors) console.error(`[FAIL] Analytics ${route.route}: ${error}`);
    }
  }
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
