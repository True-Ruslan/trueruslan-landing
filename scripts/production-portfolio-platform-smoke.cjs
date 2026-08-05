const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  SEARCH_URL,
  PORTFOLIO_PLATFORM_URL,
  PORTFOLIO_PLATFORM_EN_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Portfolio platform production smoke');

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';
const ARTIFACTS_DIR = path.resolve('production-artifacts');

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

async function verifyCaseStudy(page, url, {locale, alternateUrl}) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${locale} portfolio platform returned HTTP ${response?.status() ?? 'none'}`);

  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(heading.includes('TrueRuslan Landing'), `unexpected ${locale} portfolio heading: ${heading}`);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert(canonical && normalizeUrl(canonical) === normalizeUrl(url), `wrong ${locale} portfolio canonical: ${canonical || 'missing'}`);

  const alternateLocale = locale === 'ru' ? 'en' : 'ru';
  const alternate = await page.locator(`link[rel="alternate"][hreflang="${alternateLocale}"]`).getAttribute('href');
  assert(alternate && normalizeUrl(alternate) === normalizeUrl(alternateUrl), `wrong ${locale} portfolio alternate: ${alternate || 'missing'}`);

  const mainText = await page.locator('main').innerText();
  for (const marker of ['GitHub Pages', 'Production Live Smoke', 'Cloudflare', 'legacy .html']) {
    assert(mainText.includes(marker), `${locale} portfolio case study misses ${marker}`);
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
    assert(await timeline.locator('.tr-project-timeline__item--current').count() === 1, 'portfolio timeline must expose exactly one current milestone');
    assert(await timeline.locator('.tr-project-timeline__item--next').count() >= 1, 'portfolio timeline must expose a next milestone');
  }

  const html = await page.content();
  assert(!html.includes(LEGACY_ORIGIN), `${locale} portfolio page leaks legacy Pages origin`);
  await page.screenshot({path: path.join(ARTIFACTS_DIR, `portfolio-platform-${locale}.png`), fullPage: true});

  return {
    requested: url,
    finalUrl: page.url(),
    status: response.status(),
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
    homepage: {},
    ru: {},
    en: {},
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

    const homeResponse = await page.goto(APEX, {waitUntil: 'networkidle', timeout: 45000});
    assert(homeResponse?.ok(), `homepage returned HTTP ${homeResponse?.status() ?? 'none'}`);
    const platformHref = await page.locator('[data-home-flagship="portfolio-platform"]').getAttribute('href');
    assert(platformHref, 'homepage portfolio platform flagship link is missing');
    assert(new URL(platformHref, page.url()).pathname === new URL(PORTFOLIO_PLATFORM_URL).pathname, `homepage portfolio platform points to wrong route: ${platformHref}`);
    summary.homepage = {
      status: homeResponse.status(),
      platformHref: new URL(platformHref, page.url()).href,
    };

    summary.ru = await verifyCaseStudy(page, PORTFOLIO_PLATFORM_URL, {
      locale: 'ru',
      alternateUrl: PORTFOLIO_PLATFORM_EN_URL,
    });
    summary.en = await verifyCaseStudy(page, PORTFOLIO_PLATFORM_EN_URL, {
      locale: 'en',
      alternateUrl: PORTFOLIO_PLATFORM_URL,
    });

    const searchResponse = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(searchResponse?.ok(), `production search returned HTTP ${searchResponse?.status() ?? 'none'}`);
    const input = page.locator('.tr-search-input').first();
    const button = page.locator('.tr-search-button').first();
    await input.waitFor({state: 'visible', timeout: 10000});
    await input.fill('TrueRuslan Landing static-first');
    await button.click();
    const result = page.locator('a[href*="landing/projects/portfolio-platform"]').first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultHref = await result.getAttribute('href');
    assert(resultHref && new URL(resultHref, page.url()).pathname === new URL(PORTFOLIO_PLATFORM_URL).pathname, `search returned wrong portfolio platform route: ${resultHref || 'missing'}`);
    summary.search = {
      status: searchResponse.status(),
      resultHref: new URL(resultHref, page.url()).href,
    };

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(summary.diagnostics.firstPartyRequestFailures.length === 0, `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`);

    writeJson('portfolio-platform-production-summary.json', summary);
    console.log(`Portfolio platform production smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('portfolio-platform-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
