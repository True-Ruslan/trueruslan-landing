const fs = require('fs');
const path = require('path');
const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  NOTE_URL,
  WWW_NOTE_URL,
  LEGACY_NOTE_DIRECTORY_URL,
  LEGACY_NOTE_URL,
  SEARCH_URL,
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

async function assertPageLinkPolicy(page, label) {
  const report = await page.evaluate(() => {
    const exemptScheme = /^(?:mailto|tel|javascript|data):/i;
    const violations = [];
    let navigationalLinks = 0;

    for (const anchor of document.querySelectorAll('a[href]')) {
      const href = String(anchor.getAttribute('href') || '').trim();
      if (!href || href.startsWith('#') || exemptScheme.test(href)) continue;
      navigationalLinks += 1;

      let pathname = '';
      try {
        pathname = new URL(href, document.baseURI).pathname;
      } catch {}
      if (pathname.includes('/landing/')) violations.push(`legacy /landing href: ${href}`);

      const rel = new Set(String(anchor.getAttribute('rel') || '').toLowerCase().split(/\s+/).filter(Boolean));
      if (anchor.getAttribute('target') !== '_blank') violations.push(`missing target=_blank: ${href}`);
      if (!rel.has('noopener') || !rel.has('noreferrer')) violations.push(`missing noopener/noreferrer: ${href}`);
    }

    return {navigationalLinks, violations};
  });

  assert(report.navigationalLinks > 0, `${label}: no navigational links found`);
  assert(report.violations.length === 0, `${label}: link policy violations: ${report.violations.join(' | ')}`);
  return report;
}

async function assertLegacyRedirect(page, legacyUrl, label) {
  const requested = new URL(legacyUrl);
  requested.searchParams.set('source', `production-${label}`);
  requested.hash = 'legacy-route';
  const response = await page.goto(requested.href, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${label} returned HTTP ${response?.status() ?? 'none'}`);
  await page.waitForURL((url) => (
    url.hostname === 'trueruslan.ru'
    && url.pathname === new URL(NOTE_URL).pathname
    && url.search === requested.search
    && url.hash === requested.hash
  ), {timeout: 10000});
  const finalUrl = new URL(page.url());
  assert(finalUrl.pathname === new URL(NOTE_URL).pathname, `${label} resolved to the wrong path: ${finalUrl.pathname}`);
  assert(finalUrl.search === requested.search, `${label} lost query parameters: ${finalUrl.search}`);
  assert(finalUrl.hash === requested.hash, `${label} lost fragment: ${finalUrl.hash}`);
  return {
    requested: requested.href,
    finalUrl: finalUrl.href,
    status: response.status(),
    canonicalPath: true,
    queryPreserved: true,
    fragmentPreserved: true,
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
    assert(!homeHtml.includes('https://trueruslan.ru/landing/'), 'homepage exposes the legacy /landing namespace');
    const homeLinkPolicy = await assertPageLinkPolicy(page, 'homepage');
    const beaconCount = await page.locator(`script[src*="${CLOUDFLARE_BEACON}"]`).count();
    assert(beaconCount === 1, `expected exactly one Cloudflare beacon, got ${beaconCount}`);
    summary.apex = {
      requested: APEX,
      finalUrl: page.url(),
      status: homeResponse.status(),
      title: homeTitle,
      cloudflareBeaconCount: beaconCount,
      legacyOriginAbsent: true,
      legacyLandingAbsent: true,
      navigationalLinksChecked: homeLinkPolicy.navigationalLinks,
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

    summary.legacy.directory = await assertLegacyRedirect(page, LEGACY_NOTE_DIRECTORY_URL, 'legacy-directory');
    summary.legacy.html = await assertLegacyRedirect(page, LEGACY_NOTE_URL, 'legacy-html');

    const noteResponse = await page.goto(NOTE_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(noteResponse?.ok(), `persistence Note returned HTTP ${noteResponse?.status() ?? 'none'}`);
    const noteHeading = (await page.locator('h1').first().innerText()).trim();
    assert(noteHeading.includes('Restart — это часть продукта'), `unexpected Note heading: ${noteHeading}`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    assert(normalizeUrl(canonical) === normalizeUrl(NOTE_URL), `wrong canonical URL: ${canonical}`);
    assert(normalizeUrl(ogUrl) === normalizeUrl(NOTE_URL), `wrong OpenGraph URL: ${ogUrl}`);
    const noteLinkPolicy = await assertPageLinkPolicy(page, 'persistence Note');
    const noteHtml = await page.content();
    assert(!noteHtml.includes(LEGACY_ORIGIN), 'persistence Note leaks the legacy Pages origin');
    assert(!noteHtml.includes('https://trueruslan.ru/landing/'), 'persistence Note exposes the legacy /landing namespace');
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
      legacyLandingAbsent: true,
      navigationalLinksChecked: noteLinkPolicy.navigationalLinks,
    };

    const feedResponse = await context.request.get(FEED_URL, {timeout: 30000});
    assert(feedResponse.ok(), `Atom feed returned HTTP ${feedResponse.status()}`);
    const feedText = await feedResponse.text();
    const feedContentType = feedResponse.headers()['content-type'] || '';
    assert(/xml|atom/i.test(feedContentType), `unexpected feed content type: ${feedContentType}`);
    assert(feedText.includes('Restart — это часть продукта'), 'Atom feed misses the persistence Note title');
    assert(feedText.includes(NOTE_URL), 'Atom feed misses the persistence Note canonical URL');
    assert(!feedText.includes('https://trueruslan.ru/landing/'), 'Atom feed exposes legacy /landing URLs');
    writeText('feed.xml', feedText);
    summary.feed = {
      url: FEED_URL,
      status: feedResponse.status(),
      contentType: feedContentType,
      containsNoteTitle: true,
      containsCanonicalUrl: true,
      legacyLandingAbsent: true,
    };

    const searchResponse = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(searchResponse?.ok(), `production search returned HTTP ${searchResponse?.status() ?? 'none'}`);
    const searchInput = page.locator('.tr-search-input').first();
    const searchButton = page.locator('.tr-search-button').first();
    await searchInput.waitFor({state: 'visible', timeout: 10000});
    await searchButton.waitFor({state: 'visible', timeout: 10000});
    await searchInput.fill(SEARCH_QUERY);
    await searchButton.click();
    const result = page.locator('a[href*="notes/restart-persistence-is-a-product-contract"]:not([href*="landing/"])').first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultText = (await result.innerText()).trim();
    const resultHref = await result.getAttribute('href');
    const resultTarget = await result.getAttribute('target');
    const resultRel = new Set(String(await result.getAttribute('rel') || '').toLowerCase().split(/\s+/).filter(Boolean));
    assert(resultText.includes('Restart'), `unexpected search result text: ${resultText}`);
    assert(new URL(resultHref, page.url()).pathname === new URL(NOTE_URL).pathname, `search returned wrong route: ${resultHref}`);
    assert(resultTarget === '_blank', `search result does not open in a new tab: ${resultTarget}`);
    assert(resultRel.has('noopener') && resultRel.has('noreferrer'), `search result lacks noopener/noreferrer: ${[...resultRel].join(' ')}`);
    await page.screenshot({path: path.join(ARTIFACTS_DIR, 'persistence-search.png'), fullPage: true});
    summary.search = {
      url: page.url(),
      status: searchResponse.status(),
      query: SEARCH_QUERY,
      resultText,
      resultHref: new URL(resultHref, page.url()).href,
      target: resultTarget,
      rel: [...resultRel],
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
