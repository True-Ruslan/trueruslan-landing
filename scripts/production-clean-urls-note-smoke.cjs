const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  SEARCH_URL,
  CLEAN_URLS_NOTE_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'P3.4B clean URLs Note smoke');

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const FEED_URL = new URL('feed.xml', APEX).href;
const LEGACY_NOTE_URL = `${CLEAN_URLS_NOTE_URL.slice(0, -1)}.html?source=production-smoke#legacy-compatibility`;
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';
const DOCUMENT_CONTENT_SELECTOR = 'main.dc-doc-page__content';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const NOTE_TITLE = 'Как clean URLs заработали на GitHub Pages без Cloudflare routing';
const SEARCH_QUERY = 'clean URLs Cloudflare routing';

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

function writeText(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), value, 'utf8');
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    note: {},
    legacy: {},
    feed: {},
    search: {},
    diagnostics: {
      pageErrors: [],
      firstPartyRequestFailures: [],
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

    page.on('pageerror', (error) => summary.diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown';
      if (failure.includes('ERR_ABORTED')) return;
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'trueruslan.ru' || hostname === 'www.trueruslan.ru') {
        summary.diagnostics.firstPartyRequestFailures.push({url: request.url(), failure});
      }
    });

    const noteResponse = await page.goto(CLEAN_URLS_NOTE_URL, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    assert(noteResponse?.ok(), `P3.4B Note returned HTTP ${noteResponse?.status() ?? 'none'}`);

    const heading = (await page.locator('h1').first().innerText()).trim();
    assert(heading.includes(NOTE_TITLE), `unexpected P3.4B Note heading: ${heading}`);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    assert(canonical && normalizeUrl(canonical) === normalizeUrl(CLEAN_URLS_NOTE_URL), `wrong P3.4B canonical: ${canonical || 'missing'}`);
    assert(ogUrl && normalizeUrl(ogUrl) === normalizeUrl(CLEAN_URLS_NOTE_URL), `wrong P3.4B OpenGraph URL: ${ogUrl || 'missing'}`);

    const documentContent = page.locator(DOCUMENT_CONTENT_SELECTOR).first();
    await documentContent.waitFor({state: 'visible', timeout: 10000});
    const noteText = await documentContent.innerText();
    for (const marker of [
      'repository-native directory URLs',
      'publishDirectoryRoutes',
      'Diplodoc',
      'router.pathname',
      'router.depth',
      'canonical',
      'hreflang',
      'OpenGraph',
      'Sitemap',
      'Atom feed',
      'generated search',
      'DNS/CDN/analytics',
      'application router',
      'GitHub Pages',
      'HTTP 301',
      'noindex,follow',
      'query',
      'fragment',
      'PR #114',
      'PR #115',
      'search-engine observation',
    ]) {
      assert(noteText.includes(marker), `deployed P3.4B Note misses ${marker}`);
    }

    const noteHtml = await page.content();
    assert(!noteHtml.includes(LEGACY_ORIGIN), 'P3.4B Note leaks the legacy Pages origin');
    await page.screenshot({path: path.join(ARTIFACTS_DIR, 'clean-urls-note.png'), fullPage: true});
    writeText('clean-urls-note.html', noteHtml);
    summary.note = {
      requested: CLEAN_URLS_NOTE_URL,
      finalUrl: page.url(),
      status: noteResponse.status(),
      heading,
      canonical,
      ogUrl,
      documentSelector: DOCUMENT_CONTENT_SELECTOR,
      legacyOriginAbsent: true,
    };

    const legacyResponse = await page.goto(LEGACY_NOTE_URL, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    assert(legacyResponse?.ok(), `P3.4B legacy entrypoint returned HTTP ${legacyResponse?.status() ?? 'none'}`);
    const finalLegacyUrl = new URL(page.url());
    const cleanUrl = new URL(CLEAN_URLS_NOTE_URL);
    assert(finalLegacyUrl.pathname === cleanUrl.pathname, `legacy P3.4B route ended at ${finalLegacyUrl.pathname}`);
    assert(finalLegacyUrl.searchParams.get('source') === 'production-smoke', 'legacy P3.4B route lost query');
    assert(finalLegacyUrl.hash === '#legacy-compatibility', 'legacy P3.4B route lost fragment');
    summary.legacy = {
      requested: LEGACY_NOTE_URL,
      finalUrl: page.url(),
      status: legacyResponse.status(),
      queryPreserved: true,
      fragmentPreserved: true,
    };

    const feedResponse = await context.request.get(FEED_URL, {timeout: 30000});
    assert(feedResponse.ok(), `Atom feed returned HTTP ${feedResponse.status()}`);
    const feedText = await feedResponse.text();
    assert(feedText.includes(NOTE_TITLE), 'Atom feed misses the P3.4B Note title');
    assert(feedText.includes(CLEAN_URLS_NOTE_URL), 'Atom feed misses the P3.4B canonical URL');
    writeText('clean-urls-feed.xml', feedText);
    summary.feed = {
      url: FEED_URL,
      status: feedResponse.status(),
      containsNoteTitle: true,
      containsCanonicalUrl: true,
    };

    const searchResponse = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(searchResponse?.ok(), `production search returned HTTP ${searchResponse?.status() ?? 'none'}`);
    const input = page.locator('.tr-search-input').first();
    const button = page.locator('.tr-search-button').first();
    await input.waitFor({state: 'visible', timeout: 10000});
    await button.waitFor({state: 'visible', timeout: 10000});
    await input.fill(SEARCH_QUERY);
    await button.click();
    const result = page.locator('a[href*="notes/clean-urls-without-cloudflare-routing/"]:not([href*="landing/notes/clean-urls-without-cloudflare-routing/"])').first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultText = (await result.innerText()).trim();
    const resultHref = await result.getAttribute('href');
    assert(resultText.toLowerCase().includes('clean'), `unexpected P3.4B search result: ${resultText}`);
    assert(resultHref && new URL(resultHref, page.url()).pathname === cleanUrl.pathname, `search returned wrong P3.4B route: ${resultHref || 'missing'}`);
    await page.screenshot({path: path.join(ARTIFACTS_DIR, 'clean-urls-search.png'), fullPage: true});
    summary.search = {
      url: page.url(),
      status: searchResponse.status(),
      query: SEARCH_QUERY,
      resultText,
      resultHref: new URL(resultHref, page.url()).href,
    };

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(summary.diagnostics.firstPartyRequestFailures.length === 0, `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`);

    writeJson('clean-urls-note-production-summary.json', summary);
    console.log(`P3.4B clean URLs Note smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('clean-urls-note-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
