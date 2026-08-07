const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  PUBLICATIONS_URL,
  PUBLICATIONS_EN_URL,
  SEARCH_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'P3.5C English Publications production smoke');
const PUBLICATIONS = JSON.parse(fs.readFileSync(path.resolve('data/publications.json'), 'utf8'));
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
  const ru = await page.locator('link[rel="alternate"][hreflang="ru"]').getAttribute('href');
  const en = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
  const fallback = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href');

  assert(canonical && normalizeUrl(canonical) === normalizeUrl(PUBLICATIONS_EN_URL), `English Publications canonical drifted: ${canonical || 'missing'}`);
  assert(ru && normalizeUrl(ru) === normalizeUrl(PUBLICATIONS_URL), `English Publications RU alternate drifted: ${ru || 'missing'}`);
  assert(en && normalizeUrl(en) === normalizeUrl(PUBLICATIONS_EN_URL), `English Publications EN alternate drifted: ${en || 'missing'}`);
  assert(fallback && normalizeUrl(fallback) === normalizeUrl(PUBLICATIONS_URL), `English Publications x-default drifted: ${fallback || 'missing'}`);
  return {canonical, ru, en, fallback};
}

async function assertCanonicalPublicationCards(root, label) {
  const observed = {};
  for (const publication of PUBLICATIONS) {
    assert(publication.en?.summary, `canonical registry misses English presentation for ${publication.id}`);
    const cards = root.locator(`[data-tr-publication-id="${publication.id}"]`);
    const count = await cards.count();
    assert(count === 1, `${label}: ${publication.id} expected one card, got ${count}`);

    const card = cards.first();
    const title = card.locator('h3 a').first();
    const href = await title.getAttribute('href');
    const titleLanguage = await title.getAttribute('lang');
    const text = await card.innerText();

    assert(href && normalizeUrl(href) === normalizeUrl(publication.canonicalUrl), `${label}: ${publication.id} canonical external URL drifted: ${href || 'missing'}`);
    assert(titleLanguage === publication.language, `${label}: ${publication.id} original title must declare lang=${publication.language}`);
    assert(text.includes(publication.title), `${label}: ${publication.id} original publication title is missing`);
    assert(text.includes(publication.en.summary), `${label}: ${publication.id} English summary is missing`);
    for (const topic of publication.en.topics) {
      assert(text.includes(topic), `${label}: ${publication.id} English topic is missing: ${topic}`);
    }
    observed[publication.id] = {href, titleLanguage, summary: publication.en.summary};
  }
  return observed;
}

async function assertEnglishCardSet(root, label) {
  const expected = PUBLICATIONS.length;
  const cards = root.locator('[data-tr-publication-id]');
  assert(await cards.count() === expected, `${label}: expected ${expected} cards`);

  const metaKinds = cards.locator('.tr-publication-card__meta span:first-child');
  const metaRoles = cards.locator('.tr-publication-card__meta span:last-child');
  const topicLists = cards.locator('.tr-publication-card__topics');
  const actions = cards.locator('.tr-publication-card__primary');
  const originalTitles = cards.locator('h3 a[lang="ru"]');

  for (const [name, locator] of [
    ['publication kind metadata', metaKinds],
    ['publication role metadata', metaRoles],
    ['topic lists', topicLists],
    ['primary publication actions', actions],
    ['original Russian publication titles', originalTitles],
  ]) {
    const count = await locator.count();
    assert(count === expected, `${label}: expected ${expected} ${name}, got ${count}`);
  }

  for (const text of await metaKinds.allTextContents()) {
    assert(text.includes('Technical article') && !text.includes('Техническая статья'), `${label}: publication kind is not localized: ${text}`);
  }
  for (const text of await metaRoles.allTextContents()) {
    assert(text.trim() === 'Author', `${label}: publication role is not Author: ${text}`);
  }
  for (const labelValue of await topicLists.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))) {
    assert(labelValue === 'Topics', `${label}: publication topics aria-label is not localized: ${labelValue}`);
  }
  for (const text of await actions.allTextContents()) {
    assert(text.includes('Read on Habr') && !text.includes('Читать на'), `${label}: publication action is not localized: ${text}`);
  }

  const augustDate = root.locator('time[datetime="2025-08-23"]');
  assert(await augustDate.count() === 1, `${label}: expected one August 23 publication date`);
  assert((await augustDate.textContent()).trim() === 'August 23, 2025', `${label}: August publication date is not localized`);
}

async function assertEnglishCatalogue(catalogue, label) {
  const rootText = (await catalogue.textContent()) || '';
  assert(rootText.includes('Technical articles'), `${label}: misses Technical articles section`);
  for (const text of await catalogue.locator('.tr-publications__group-head h2').allTextContents()) {
    assert(text.trim() !== 'Технические статьи', `${label}: catalogue section heading leaked Russian UI copy`);
  }
  await assertEnglishCardSet(catalogue, label);
  return assertCanonicalPublicationCards(catalogue, label);
}

async function verifyRendered(page) {
  const response = await page.goto(PUBLICATIONS_EN_URL, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `English Publications returned HTTP ${response?.status() ?? 'none'}`);
  assert(await page.locator('html').getAttribute('lang') === 'en', 'English Publications html lang must be en');
  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(heading === 'Publications and talks', `unexpected English Publications H1: ${heading}`);
  const seo = await assertSeoPair(page);

  const catalogue = page.locator('[data-tr-publications-root]').first();
  await catalogue.waitFor({state: 'visible', timeout: 10000});
  const publications = await assertEnglishCatalogue(catalogue, 'English Publications rendered catalogue');

  const featured = page.locator('.tr-publications-featured--page').first();
  await featured.waitFor({state: 'visible', timeout: 10000});
  const featuredHeading = (await featured.locator('h2').first().textContent())?.trim();
  assert(featuredHeading === 'Featured', `English Publications featured heading drifted: ${featuredHeading}`);
  await assertEnglishCardSet(featured, 'English Publications rendered featured');
  await assertCanonicalPublicationCards(featured, 'English Publications rendered featured');

  const html = await page.content();
  assert(!html.includes(LEGACY_ORIGIN), 'English Publications leaks legacy Pages origin');
  await page.screenshot({path: path.join(ARTIFACTS_DIR, 'p3-5c-english-publications.png'), fullPage: true});
  return {status: response.status(), heading, seo, publications, featured: true};
}

async function verifyNoJavaScript(browser) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: {width: 1280, height: 900},
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(PUBLICATIONS_EN_URL, {waitUntil: 'load', timeout: 45000});
    assert(response?.ok(), `English Publications no-JS returned HTTP ${response?.status() ?? 'none'}`);
    await assertSeoPair(page);
    const fallback = page.locator('[data-tr-publications-noscript="en"]');
    await fallback.waitFor({state: 'visible', timeout: 10000});
    const fallbackHeading = (await fallback.locator('h1').first().textContent()).trim();
    assert(fallbackHeading === 'Publications and talks', `English Publications no-JS heading drifted: ${fallbackHeading}`);
    const catalogue = fallback.locator('[data-tr-publications-root]');
    const publications = await assertEnglishCatalogue(catalogue, 'English Publications no-JS catalogue');
    return {status: response.status(), fallbackVisible: true, publications};
  } finally {
    await context.close();
  }
}

async function verifySearch(page) {
  const response = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `generated search returned HTTP ${response?.status() ?? 'none'}`);
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  await input.fill('multi-page site with Diplodoc');
  await button.click();
  await page.waitForFunction(() => [...document.querySelectorAll('a')]
    .some((link) => (link.getAttribute('href') || '').includes('en/publications/')), null, {timeout: 10000});
  assert(await page.locator('a[href*="en/publications/"]').count() >= 1, 'generated search does not expose English Publications route');
  return {route: SEARCH_URL, englishPublicationsFound: true};
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

    summary.rendered = await verifyRendered(page);
    summary.noJavaScript = await verifyNoJavaScript(browser);
    summary.search = await verifySearch(page);
    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(summary.diagnostics.firstPartyRequestFailures.length === 0, `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`);
    await context.close();

    writeJson('p3-5c-english-publications-production-summary.json', summary);
    console.log(`P3.5C English Publications production smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('p3-5c-english-publications-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
