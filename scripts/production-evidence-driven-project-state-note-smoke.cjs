const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  SEARCH_URL,
  EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'P3.4F evidence-driven project state Note smoke');

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const FEED_URL = new URL('feed.xml', APEX).href;
const DOCUMENT_CONTENT_SELECTOR = 'main.dc-doc-page__content';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const NOTE_TITLE = 'Как описывать состояние проекта без ложной уверенности';
const SEARCH_QUERY = 'evidence-driven project state';
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
    feed: {},
    generatedSearch: {},
    diagnostics: {pageErrors: [], firstPartyRequestFailures: []},
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

    const noteResponse = await page.goto(EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    assert(noteResponse?.ok(), `P3.4F Note returned HTTP ${noteResponse?.status() ?? 'none'}`);

    const heading = (await page.locator('h1').first().innerText()).trim();
    assert(heading.includes(NOTE_TITLE), `unexpected P3.4F Note heading: ${heading}`);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    assert(
      canonical && normalizeUrl(canonical) === normalizeUrl(EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL),
      `wrong P3.4F canonical: ${canonical || 'missing'}`,
    );
    assert(
      ogUrl && normalizeUrl(ogUrl) === normalizeUrl(EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL),
      `wrong P3.4F OpenGraph URL: ${ogUrl || 'missing'}`,
    );

    const documentContent = page.locator(DOCUMENT_CONTENT_SELECTOR).first();
    await documentContent.waitFor({state: 'visible', timeout: 10000});
    const noteText = await documentContent.innerText();
    for (const marker of [
      'canonical registry',
      'Проверенный факт',
      'Инженерный вывод',
      'Ограничение',
      'verified',
      'stale',
      'unverified',
      'observedAt',
      'commit SHA',
      'artifact digest',
      'deployment identity',
      'repository activity',
      'generated artifact',
      'deployed production',
      'external-product acceptance',
      'operator/search-engine state',
      'Draft не является accepted evidence',
      'product-owner',
      'reviewable',
      'non-mutating',
      'no-JavaScript',
      'exact-head',
      'exact-deployment',
    ]) {
      assert(noteText.includes(marker), `deployed P3.4F Note misses ${marker}`);
    }

    assert(!/последний commit[^\n]*(?:гарантирует|полностью доказывает)[^\n]*production/i.test(noteText), 'P3.4F Note overclaims repository activity');
    assert(/последний commit[^\n]*не доказывает[^\n]*production/i.test(noteText), 'P3.4F Note misses repository/production denial');
    const noteHtml = await page.content();
    assert(!noteHtml.includes(LEGACY_ORIGIN), 'P3.4F Note leaks the legacy Pages origin');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'evidence-driven-project-state-note.png'),
      fullPage: true,
    });
    writeText('evidence-driven-project-state-note.html', noteHtml);
    summary.note = {
      requested: EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL,
      finalUrl: page.url(),
      status: noteResponse.status(),
      heading,
      canonical,
      ogUrl,
      documentSelector: DOCUMENT_CONTENT_SELECTOR,
      uncertaintyBoundaryPresent: true,
      legacyOriginAbsent: true,
    };

    const feedResponse = await context.request.get(FEED_URL, {timeout: 30000});
    assert(feedResponse.ok(), `Atom feed returned HTTP ${feedResponse.status()}`);
    const feedText = await feedResponse.text();
    assert(feedText.includes(NOTE_TITLE), 'Atom feed misses the P3.4F Note title');
    assert(feedText.includes(EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL), 'Atom feed misses the P3.4F canonical URL');
    writeText('evidence-driven-project-state-feed.xml', feedText);
    summary.feed = {
      url: FEED_URL,
      status: feedResponse.status(),
      containsNoteTitle: true,
      containsCanonicalUrl: true,
    };

    const searchResponse = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(searchResponse?.ok(), `generated search returned HTTP ${searchResponse?.status() ?? 'none'}`);
    const input = page.locator('.tr-search-input').first();
    const button = page.locator('.tr-search-button').first();
    await input.waitFor({state: 'visible', timeout: 10000});
    await button.waitFor({state: 'visible', timeout: 10000});
    await input.fill(SEARCH_QUERY);
    await button.click();
    const result = page.locator('a[href*="landing/notes/evidence-driven-project-state"]').first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultText = (await result.innerText()).trim();
    const resultHref = await result.getAttribute('href');
    const cleanUrl = new URL(EVIDENCE_DRIVEN_PROJECT_STATE_NOTE_URL);
    assert(resultText.toLowerCase().includes('состояние проекта'), `unexpected P3.4F search result: ${resultText}`);
    assert(
      resultHref && new URL(resultHref, page.url()).pathname === cleanUrl.pathname,
      `generated search returned wrong P3.4F route: ${resultHref || 'missing'}`,
    );
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'evidence-driven-project-state-search.png'),
      fullPage: true,
    });
    summary.generatedSearch = {
      url: page.url(),
      status: searchResponse.status(),
      query: SEARCH_QUERY,
      resultText,
      resultHref: new URL(resultHref, page.url()).href,
    };

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(
      summary.diagnostics.firstPartyRequestFailures.length === 0,
      `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`,
    );

    writeJson('evidence-driven-project-state-note-production-summary.json', summary);
    console.log(`P3.4F evidence-driven project state Note smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('evidence-driven-project-state-note-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
