const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  NOW_URL,
  NOW_EN_URL,
  SEARCH_URL,
  NOTCHHUB_EN_URL,
  VILLAIGENCE_EN_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'P3.5B English Now production smoke');
const NOW = JSON.parse(fs.readFileSync(path.resolve('data/now.json'), 'utf8'));
const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  return url.href;
}

function writeJson(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function assertSeoPair(page) {
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert(canonical && normalizeUrl(canonical) === normalizeUrl(NOW_EN_URL), `English Now canonical drifted: ${canonical || 'missing'}`);
  const ru = await page.locator('link[rel="alternate"][hreflang="ru"]').getAttribute('href');
  const en = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
  const fallback = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href');
  assert(ru && normalizeUrl(ru) === normalizeUrl(NOW_URL), `English Now RU alternate drifted: ${ru || 'missing'}`);
  assert(en && normalizeUrl(en) === normalizeUrl(NOW_EN_URL), `English Now EN alternate drifted: ${en || 'missing'}`);
  assert(fallback && normalizeUrl(fallback) === normalizeUrl(NOW_URL), `English Now x-default drifted: ${fallback || 'missing'}`);
  return {canonical, ru, en, fallback};
}

async function verifyRendered(page) {
  const response = await page.goto(NOW_EN_URL, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `English Now returned HTTP ${response?.status() ?? 'none'}`);
  assert(await page.locator('html').getAttribute('lang') === 'en', 'English Now html lang must be en');
  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(heading === 'Now', `unexpected English Now H1: ${heading}`);
  const seo = await assertSeoPair(page);
  const now = page.locator('[data-tr-now][lang="en"]').first();
  await now.waitFor({state: 'visible', timeout: 10000});
  const text = await now.innerText();
  for (const marker of ['Current work', "What I'm learning", "What I'm writing", 'VillAIgence', 'NotchHub', '0.1.0', 'Draft PR #10']) {
    assert(text.includes(marker), `English Now rendered content misses ${marker}`);
  }
  assert(text.includes(NOW.en.focus), 'English Now does not expose the canonical English focus text');
  assert(!/Vlezet|M7\.8B|Assisted Tracing/.test(text), 'English Now exposes the de-emphasized Vlezet spotlight');
  assert(!/Сейчас в работе|Что изучаю|Что пишу/.test(text), 'English Now contains Russian presentation headings');

  const links = await now.locator('a[data-project]').evaluateAll((nodes) => nodes.map((node) => ({
    project: node.getAttribute('data-project'),
    rawHref: node.getAttribute('href'),
    href: new URL(node.getAttribute('href') || '', document.baseURI).href,
  })));
  const notchhub = links.find(({project}) => project === 'notchhub');
  const livingworld = links.find(({project}) => project === 'livingworld');
  assert(notchhub && normalizeUrl(notchhub.href) === normalizeUrl(NOTCHHUB_EN_URL), `English Now NotchHub route drifted: ${JSON.stringify(notchhub)}`);
  assert(livingworld && normalizeUrl(livingworld.href) === normalizeUrl(VILLAIGENCE_EN_URL), `English Now VillAIgence route drifted: ${JSON.stringify(livingworld)}`);

  const html = await page.content();
  assert(!html.includes(LEGACY_ORIGIN), 'English Now leaks the legacy Pages origin');
  await page.screenshot({path: path.join(ARTIFACTS_DIR, 'p3-5b-english-now.png'), fullPage: true});
  return {status: response.status(), heading, seo, projectLinks: links};
}

async function verifyNoJavaScript(browser) {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 1280, height: 900}, colorScheme: 'dark'});
  const page = await context.newPage();
  try {
    const response = await page.goto(NOW_EN_URL, {waitUntil: 'load', timeout: 45000});
    assert(response?.ok(), `English Now no-JS returned HTTP ${response?.status() ?? 'none'}`);
    await assertSeoPair(page);
    const fallback = page.locator('[data-tr-now-noscript="en"] [data-tr-now][lang="en"]');
    await fallback.waitFor({state: 'visible', timeout: 10000});
    const text = await fallback.innerText();
    for (const marker of ['Current work', "What I'm learning", "What I'm writing", 'NotchHub', '0.1.0', 'Draft PR #10']) {
      assert(text.includes(marker), `English Now no-JS fallback misses ${marker}`);
    }
    assert(!/Vlezet|M7\.8B|Assisted Tracing/.test(text), 'English Now no-JS fallback exposes the de-emphasized Vlezet spotlight');
    assert(!/Сейчас в работе|Что изучаю|Что пишу/.test(text), 'English Now no-JS fallback contains Russian presentation headings');
    return {status: response.status(), fallbackVisible: true};
  } finally {
    await context.close();
  }
}

async function verifySearch(page) {
  const response = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `generated search returned HTTP ${response?.status() ?? 'none'}`);
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  await input.fill('deliberately bounded snapshot of current engineering focus');
  await button.click();
  await page.waitForFunction(() => [...document.querySelectorAll('a')]
    .some((link) => (link.getAttribute('href') || '').includes('en/now/')), null, {timeout: 10000});
  assert(await page.locator('a[href*="en/now/"]').count() >= 1, 'generated search does not expose English Now route');
  return {route: SEARCH_URL, englishNowFound: true};
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    rendered: null,
    noJavaScript: null,
    search: null,
    diagnostics: {pageErrors: [], firstPartyRequestFailures: []},
  };
  try {
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}, colorScheme: 'dark', reducedMotion: 'reduce'});
    const page = await context.newPage();
    page.on('pageerror', (error) => summary.diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown';
      if (failure.includes('ERR_ABORTED')) return;
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'trueruslan.ru' || hostname === 'www.trueruslan.ru') {
        summary.diagnostics.firstPartyRequestFailures.push({url: request.url(), failure});
      }
    });

    summary.rendered = await verifyRendered(page);
    summary.noJavaScript = await verifyNoJavaScript(browser);
    summary.search = await verifySearch(page);
    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(summary.diagnostics.firstPartyRequestFailures.length === 0, `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`);
    await context.close();
    writeJson('p3-5b-english-now-production-summary.json', summary);
    console.log(`P3.5B English Now production smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('p3-5b-english-now-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
