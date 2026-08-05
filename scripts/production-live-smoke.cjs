const fs = require('fs');
const path = require('path');
const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  NOTE_URL,
  WWW_NOTE_URL,
  LEGACY_NOTE_URL,
  SEARCH_URL,
  PORTFOLIO_PLATFORM_URL,
  PORTFOLIO_PLATFORM_EN_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Production live smoke');

const FEED_URL = new URL('feed.xml', APEX).href;
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

async function verifyPortfolioPlatform(page, url, {locale, expectedAlternate}) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${locale} portfolio platform returned HTTP ${response?.status() ?? 'none'}`);
  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(heading.includes('TrueRuslan Landing'), `unexpected ${locale} portfolio heading: ${heading}`);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert(normalizeUrl(canonical) === normalizeUrl(url), `wrong ${locale} portfolio canonical: ${canonical}`);
  const alternate = await page.locator(`link[rel="alternate"][hreflang="${locale === 'ru' ? 'en' : 'ru'}"]`).getAttribute('href');
  assert(normalizeUrl(alternate) === normalizeUrl(expectedAlternate), `wrong ${locale} portfolio alternate: ${alternate}`);
  const bodyText = await page.locator('main').innerText();
  for (const marker of ['GitHub Pages', 'Production Live Smoke', 'Cloudflare', 'legacy .html']) {
    assert(bodyText.includes(marker), `${locale} portfolio case study misses ${marker}`);
  }
  if (locale === 'ru') {
    const evidence = page.locator('[data-project-evidence="portfolio-platform"]');
    await evidence.waitFor({state: 'visible', timeout: 10000});
    const evidenceText = await evidence.innerText();
    for (const marker of ['Build #836', 'Pages deployment #147', 'Production Live Smoke #58']) {
      assert(evidenceText.includes(marker), `deployed portfolio evidence misses ${marker}`);
    }
    const timeline = page.locator('.tr-project-timeline');
    await timeline.waitFor({state: 'visible', timeout: 10000});
    assert(await timeline.locator('.tr-project-timeline__item--current').count() === 1, 'portfolio timeline must have exactly one current milestone');
  }
  const html = await page.content();
  assert(!html.includes(LEGACY_ORIGIN), `${locale} portfolio page leaks legacy Pages origin`);
  await page.screenshot({path: path.join(ARTIFACTS_DIR, `portfolio-platform-${locale}.png`), fullPage: true});
  writeText(`portfolio-platform-${locale}.html`, html);
  return {
    url: page.url(),
    status: response.status(),
    title: await page.title(),
    heading,
    canonical,
    alternate,
    legacyOriginAbsent: true,
  };
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    apex: {},
    www: {},
    legacy: {},
    note: {},
    portfolioPlatform: {ru: {}, en: {}},
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
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
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
    const platformHref = await page.locator('[data-home-flagship="portfolio-platform"]').getAttribute('href');
    assert(platformHref && new URL(platformHref, page.url()).pathname === new URL(PORTFOLIO_PLATFORM_URL).pathname, `homepage platform flagship points to the wrong route: ${platformHref || 'missing'}`);
    summary.apex = {
      requested: APEX,
      finalUrl: page.url(),
      status: homeResponse.status(),
      title: homeTitle,
      cloudflareBeaconCount: beaconCount,
      platformFlagshipHref: new URL(platformHref, page.url()).href,
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
      canonicalPath: true,
    };

    const legacyRequested = new URL(LEGACY_NOTE_URL);
    legacyRequested.searchParams.set('source', 'production-smoke');
    legacyRequested.hash = 'legacy-route';
    const legacyResponse = await page.goto(legacyRequested.href, {waitUntil: 'networkidle', timeout: 45000});
    assert(legacyResponse?.ok(), `legacy Note returned HTTP ${legacyResponse?.status() ?? 'none'}`);
    await page.waitForURL((url) => (
      url.hostname === 'trueruslan.ru'
      && url.pathname === new URL(NOTE_URL).pathname
      && url.search === legacyRequested.search
      && url.hash === legacyRequested.hash
    ), {timeout: 10000});
    const legacyFinal = new URL(page.url());
    assert(legacyFinal.pathname === new URL(NOTE_URL).pathname, `legacy Note resolved to the wrong path: ${legacyFinal.pathname}`);
    assert(legacyFinal.search === legacyRequested.search, `legacy Note lost query parameters: ${legacyFinal.search}`);
    assert(legacyFinal.hash === legacyRequested.hash, `legacy Note lost fragment: ${legacyFinal.hash}`);
    summary.legacy = {
      requested: legacyRequested.href,
      finalUrl: legacyFinal.href,
      status: legacyResponse.status(),
      canonicalPath: true,
      queryPreserved: true,
      fragmentPreserved: true,
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

    summary.portfolioPlatform.ru = await verifyPortfolioPlatform(page, PORTFOLIO_PLATFORM_URL, {
      locale: 'ru',
      expectedAlternate: PORTFOLIO_PLATFORM_EN_URL,
    });
    summary.portfolioPlatform.en = await verifyPortfolioPlatform(page, PORTFOLIO_PLATFORM_EN_URL, {
      locale: 'en',
      expectedAlternate: PORTFOLIO_PLATFORM_URL,
    });

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
    const result = page.locator('a[href*="landing/notes/restart-persistence-is-a-product-contract"]').first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultText = (await result.innerText()).trim();
    const resultHref = await result.getAttribute('href');
    assert(resultText.includes('Restart'), `unexpected search result text: ${resultText}`);
    assert(new URL(resultHref, page.url()).pathname === new URL(NOTE_URL).pathname, `search returned wrong route: ${resultHref}`);
    await searchInput.fill('TrueRuslan Landing static-first');
    await searchButton.click();
    const platformResult = page.locator('a[href*="landing/projects/portfolio-platform"]').first();
    await platformResult.waitFor({state: 'visible', timeout: 15000});
    const platformResultHref = await platformResult.getAttribute('href');
    assert(new URL(platformResultHref, page.url()).pathname === new URL(PORTFOLIO_PLATFORM_URL).pathname, `search returned wrong portfolio platform route: ${platformResultHref}`);
    await page.screenshot({path: path.join(ARTIFACTS_DIR, 'persistence-search.png'), fullPage: true});
    summary.search = {
      url: page.url(),
      status: searchResponse.status(),
      query: SEARCH_QUERY,
      resultText,
      resultHref: new URL(resultHref, page.url()).href,
      platformResultHref: new URL(platformResultHref, page.url()).href,
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
