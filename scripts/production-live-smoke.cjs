const fs = require('fs');
const path = require('path');
const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');

const {chromium} = requireQualityTool('playwright', 'Production live smoke');

const APEX = 'https://trueruslan.ru/';
const WWW = 'https://www.trueruslan.ru/';
const NOTE_PATH = 'landing/notes/restart-persistence-is-a-product-contract.html';
const NOTE_URL = new URL(NOTE_PATH, APEX).href;
const WWW_NOTE_URL = new URL(NOTE_PATH, WWW).href;
const FEED_URL = new URL('feed.xml', APEX).href;
const SEARCH_URL = new URL('_search/ru/index.html', APEX).href;
const SEARCH_QUERY = 'persistence contract';
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';
const CLOUDFLARE_BEACON = 'static.cloudflareinsights.com/beacon.min.js';
const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const ARTIFACTS_DIR = path.resolve('production-artifacts');

function writeJson(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  return url.href;
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    apex: {},
    www: {},
    note: {},
    feed: {},
    search: {},
    diagnostics: {
      pageErrors: [],
      consoleErrors: [],
      firstPartyRequestFailures: [],
      thirdPartyRequestFailures: [],
    },
  };

  try {
    browser = await launchChromium(chromium);
    const context = await browser.newContext({
      viewport: {width: 1440, height: 1000},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    page.on('pageerror', (error) => {
      summary.diagnostics.pageErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') summary.diagnostics.consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown';
      if (failure.includes('ERR_ABORTED')) return;
      const record = {url: request.url(), failure};
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'trueruslan.ru' || hostname === 'www.trueruslan.ru') {
        summary.diagnostics.firstPartyRequestFailures.push(record);
      } else {
        summary.diagnostics.thirdPartyRequestFailures.push(record);
      }
    });

    const homeResponse = await page.goto(APEX, {waitUntil: 'networkidle', timeout: 45000});
    assert(homeResponse?.ok(), `apex homepage returned HTTP ${homeResponse?.status() ?? 'none'}`);
    const homeTitle = await page.title();
    assert(homeTitle.includes('Руслан Немыкин — Backend Engineer'), `unexpected homepage title: ${homeTitle}`);
    const homeHtml = await page.content();
    assert(!homeHtml.includes(LEGACY_ORIGIN), 'homepage leaks the legacy Pages origin');
    const beaconCount = await page.locator(`script[src*="${CLOUDFLARE_BEACON}"]`).count();
    assert(beaconCount === 1, `expected exactly one Cloudflare beacon, got ${beaconCount}`);
    summary.apex = {
      requested: APEX,
      finalUrl: page.url(),
      status: homeResponse.status(),
      title: homeTitle,
      cloudflareBeaconCount: beaconCount,
      legacyOriginAbsent: true,
    };

    const wwwResponse = await page.goto(WWW_NOTE_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(wwwResponse?.ok(), `www note returned HTTP ${wwwResponse?.status() ?? 'none'}`);
    const wwwFinal = new URL(page.url());
    assert(wwwFinal.hostname === 'trueruslan.ru', `www did not resolve to apex: ${wwwFinal.href}`);
    assert(wwwFinal.pathname === new URL(NOTE_URL).pathname, `www resolved to the wrong path: ${wwwFinal.pathname}`);
    summary.www = {
      requested: WWW_NOTE_URL,
      finalUrl: wwwFinal.href,
      status: wwwResponse.status(),
      apexHostname: true,
    };

    const noteResponse = await page.goto(NOTE_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(noteResponse?.ok(), `persistence Note returned HTTP ${noteResponse?.status() ?? 'none'}`);
    const noteHeading = (await page.locator('h1').first().innerText()).trim();
    assert(noteHeading.includes('Restart — это часть продукта'), `unexpected Note heading: ${noteHeading}`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    assert(normalizeUrl(canonical) === normalizeUrl(NOTE_URL), `wrong canonical URL: ${canonical}`);
    assert(normalizeUrl(ogUrl) === normalizeUrl(NOTE_URL), `wrong OpenGraph URL: ${ogUrl}`);
    const noteHtml = await page.content();
    assert(!noteHtml.includes(LEGACY_ORIGIN), 'persistence Note leaks the legacy Pages origin');
    await page.screenshot({path: path.join(ARTIFACTS_DIR, 'persistence-note.png'), fullPage: true});
    writeText('persistence-note.html', noteHtml);
    summary.note = {
      url: page.url(),
      status: noteResponse.status(),
      title: await page.title(),
      heading: noteHeading,
      canonical,
      ogUrl,
      legacyOriginAbsent: true,
    };

    const feedResponse = await context.request.get(FEED_URL, {timeout: 30000});
    assert(feedResponse.ok(), `Atom feed returned HTTP ${feedResponse.status()}`);
    const feedText = await feedResponse.text();
    const feedContentType = feedResponse.headers()['content-type'] || '';
    assert(/xml|atom/i.test(feedContentType), `unexpected feed content type: ${feedContentType}`);
    assert(feedText.includes('Restart — это часть продукта'), 'Atom feed misses the persistence Note title');
    assert(feedText.includes(NOTE_URL), 'Atom feed misses the persistence Note canonical URL');
    writeText('feed.xml', feedText);
    summary.feed = {
      url: FEED_URL,
      status: feedResponse.status(),
      contentType: feedContentType,
      containsNoteTitle: true,
      containsCanonicalUrl: true,
    };

    const searchResponse = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(searchResponse?.ok(), `production search returned HTTP ${searchResponse?.status() ?? 'none'}`);
    const searchInput = page.locator('.tr-search-input').first();
    const searchButton = page.locator('.tr-search-button').first();
    await searchInput.waitFor({state: 'visible', timeout: 10000});
    await searchButton.waitFor({state: 'visible', timeout: 10000});
    await searchInput.fill(SEARCH_QUERY);
    await searchButton.click();
    const result = page.locator(`a[href*="landing/notes/restart-persistence-is-a-product-contract"]`).first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultText = (await result.innerText()).trim();
    const resultHref = await result.getAttribute('href');
    assert(resultText.includes('Restart'), `unexpected search result text: ${resultText}`);
    assert(new URL(resultHref, page.url()).pathname === new URL(NOTE_URL).pathname, `search returned wrong route: ${resultHref}`);
    await page.screenshot({path: path.join(ARTIFACTS_DIR, 'persistence-search.png'), fullPage: true});
    summary.search = {
      url: page.url(),
      status: searchResponse.status(),
      query: SEARCH_QUERY,
      resultText,
      resultHref: new URL(resultHref, page.url()).href,
    };

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(summary.diagnostics.firstPartyRequestFailures.length === 0, `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`);

    writeJson('production-live-summary.json', summary);
    console.log(`Production live smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('production-live-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
