const path = require('node:path');
const {pathToFileURL} = require('node:url');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.SEARCH_SMOKE_PORT || 4174);
const SITE_PATH = '/trueruslan-landing';
const {chromium} = requireQualityTool('playwright', 'Search smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Search smoke tool');

async function waitForSearchBootstrap(page) {
  await page.waitForSelector('.tr-search-form', {timeout: 7000});
  await page.waitForFunction(() => document.documentElement.classList.contains('tr-search-ready'), null, {timeout: 7000});
}

async function assertSearchAssets(page) {
  const assets = await page.evaluate(() => ({
    css: [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.href),
    script: [...document.querySelectorAll('script[src]')].map((node) => node.src),
  }));
  if (!assets.css.some((href) => href.includes('/_assets/style/search.css'))) {
    throw new Error('search stylesheet not loaded');
  }
  if (!assets.script.some((src) => src.includes('/_assets/script/search-ui.js'))) {
    throw new Error('search UI script not loaded');
  }
}

async function assertSearchProvider(page) {
  const provider = await page.evaluate(() => document.documentElement.dataset.trSearchProvider || '');
  if (provider !== 'local') throw new Error(`expected local search provider, got ${provider || 'none'}`);
}

async function assertSearchKeyboard(page) {
  const input = page.locator('.tr-search-input').first();
  await input.focus();
  await input.fill('java');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('.tr-search-result').length > 0, null, {timeout: 7000});
  const first = page.locator('.tr-search-result a').first();
  if (!(await first.isVisible())) throw new Error('first search result not visible after Enter');
}

async function assertSearchEscape(page) {
  const input = page.locator('.tr-search-input').first();
  await input.focus();
  await input.fill('spring');
  await page.keyboard.press('Escape');
  if ((await input.inputValue()) !== '') throw new Error('Escape did not clear search input');
}

async function assertSearchNotFound(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  await input.fill('zzzzzzzz-no-result');
  await button.click();
  await page.waitForFunction(() => document.body.innerText.includes('Ничего не найдено'), null, {timeout: 7000});
}

async function assertSearchCanonicalRoutes(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const cases = [
    {query: 'Руслан Немыкин', route: '/about/'},
    {query: 'VillAIgence', route: '/projects/livingworld/'},
    {query: 'Vlezet', route: '/projects/vlezet/'},
    {query: 'NotchHub', route: '/projects/notchhub/'},
  ];

  for (const item of cases) {
    await input.fill(item.query);
    await button.click();
    await page.waitForFunction(({route}) => [...document.querySelectorAll('.tr-search-result a')]
      .some((link) => {
        try {
          return new URL(link.href).pathname.endsWith(route);
        } catch {
          return false;
        }
      }), item, {timeout: 7000});
  }
}

async function assertSearchNoLegacyLandingRoutes(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  await input.fill('Руслан');
  await button.click();
  await page.waitForFunction(() => document.querySelectorAll('.tr-search-result a').length > 0, null, {timeout: 7000});
  const hrefs = await page.locator('.tr-search-result a').evaluateAll((links) => links.map((link) => link.getAttribute('href') || ''));
  const legacy = hrefs.filter((href) => href.includes('/landing/') || /\.html(?:$|[?#])/.test(href));
  if (legacy.length) throw new Error(`search results contain legacy routes: ${legacy.join(', ')}`);
}

async function assertSearchDeepNoteCoverage(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const query = 'server-authoritative AI NPCs';

  await input.fill(query);
  await button.click();
  await page.waitForFunction(() => {
    const body = document.body.innerText.toLocaleLowerCase('ru');
    const hasPhrase = body.includes('server-authoritative ai npcs');
    const hasNoteRoute = [...document.querySelectorAll('a')]
      .some((link) => (link.getAttribute('href') || '').includes('notes/server-authoritative-ai-npcs/'));
    return hasPhrase && hasNoteRoute;
  }, null, {timeout: 7000});

  const matchingRoutes = page.locator('a[href*="notes/server-authoritative-ai-npcs/"]');
  if (await matchingRoutes.count() < 1) {
    throw new Error(`deep Engineering Note search query did not route to canonical note: ${query}`);
  }
}

async function assertSearchPublicationCoverage(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const cases = [
    {query: 'последние версии Kotlin', phrase: 'последние версии Kotlin'},
    {query: 'синтаксических излишеств', phrase: 'синтаксических излишеств'},
  ];

  for (const item of cases) {
    await input.fill(item.query);
    await button.click();
    await page.waitForFunction(({phrase}) => {
      const body = document.body.innerText.toLocaleLowerCase('ru');
      const hasPhrase = body.includes(phrase.toLocaleLowerCase('ru'));
      const hasPublicationsRoute = [...document.querySelectorAll('a')]
        .some((link) => {
          const href = link.getAttribute('href') || '';
          return href.includes('publications/') && !href.includes('landing/publications/');
        });
      return hasPhrase && hasPublicationsRoute;
    }, item, {timeout: 7000});

    const matchingRoutes = page.locator('a[href*="publications/"]:not([href*="landing/publications/"])');
    if (await matchingRoutes.count() < 1) {
      throw new Error(`publication search query did not route to canonical Publications: ${item.query}`);
    }
  }
}

async function assertEnglishVlezetSearchCoverage(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const query = 'precise apartment geometry without CAD';

  await input.fill(query);
  await button.click();
  await page.waitForFunction(() => {
    const body = document.body.innerText.toLocaleLowerCase('en');
    const hasPhrase = body.includes('precise apartment geometry without cad');
    const hasEnglishVlezetRoute = [...document.querySelectorAll('a')]
      .some((link) => (link.getAttribute('href') || '').includes('en/projects/vlezet/'));
    return hasPhrase && hasEnglishVlezetRoute;
  }, null, {timeout: 7000});

  if (await page.locator('a[href*="en/projects/vlezet/"]').count() < 1) {
    throw new Error(`English Vlezet search query did not route to the English case study: ${query}`);
  }
}

async function assertEnglishNowSearchCoverage(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const query = 'short snapshot';

  await input.fill(query);
  await button.click();
  await page.waitForFunction(() => {
    const body = document.body.innerText.toLocaleLowerCase('en');
    const hasPhrase = body.includes('short snapshot');
    const hasEnglishNowRoute = [...document.querySelectorAll('a')]
      .some((link) => (link.getAttribute('href') || '').includes('en/now/'));
    return hasPhrase && hasEnglishNowRoute;
  }, null, {timeout: 7000});

  if (await page.locator('a[href*="en/now/"]').count() < 1) {
    throw new Error(`English Now search query did not route to /en/now/: ${query}`);
  }
}

async function assertEnglishPublicationsSearchCoverage(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const query = 'syntax overhead';

  await input.fill(query);
  await button.click();
  await page.waitForFunction(() => [...document.querySelectorAll('a')]
    .some((link) => (link.getAttribute('href') || '').includes('en/publications/')), null, {timeout: 7000});

  if (await page.locator('a[href*="en/publications/"]').count() < 1) {
    throw new Error(`English Publications registry-derived search query did not route to /en/publications/: ${query}`);
  }
}

async function assertSearchLanguageSwitch(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  await input.fill('backend');
  await button.click();
  await page.waitForFunction(() => document.querySelectorAll('.tr-search-result a').length > 0, null, {timeout: 7000});
  const languageSwitch = page.locator('a[hreflang="en"]');
  if (await languageSwitch.count() < 1) throw new Error('search page missing EN language switch');
}

async function assertSearchApiModule(baseUrl) {
  const apiUrl = new URL(`${SITE_PATH}/_search/api.js`, baseUrl).href;
  const module = await import(`${pathToFileURL(path.join(process.cwd(), 'docs-html', '_search', 'api.js')).href}?smoke=${Date.now()}`);
  if (typeof module.search !== 'function') throw new Error(`search API module missing search(): ${apiUrl}`);
  const result = await module.search('java');
  if (!Array.isArray(result) || result.length === 0) throw new Error('search API did not return results for java');
}

async function runScenario(browser, baseUrl, name, viewport) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page);

  try {
    const response = await page.goto(`${baseUrl}${SITE_PATH}/_search/ru/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: navigation HTTP ${response?.status() ?? 'none'}`);

    await waitForSearchBootstrap(page);
    await assertSearchAssets(page);
    await assertSearchProvider(page);
    await assertSearchKeyboard(page);
    await assertSearchEscape(page);
    await assertSearchNotFound(page);
    await assertSearchCanonicalRoutes(page);
    await assertSearchNoLegacyLandingRoutes(page);
    await assertSearchDeepNoteCoverage(page);
    await assertSearchPublicationCoverage(page);
    await assertEnglishVlezetSearchCoverage(page);
    await assertEnglishNowSearchCoverage(page);
    await assertEnglishPublicationsSearchCoverage(page);
    await assertSearchLanguageSwitch(page);
    await assertSearchApiModule(baseUrl);

    const overflow = (await assertNoHorizontalOverflow(page, name)).overflow;
    const axe = await new AxeBuilder({page}).analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) throw new Error(`${name}: Axe serious/critical violations: ${serious.map((v) => v.id).join(', ')}`);
    if (diagnostics.pageErrors.length) throw new Error(`${name}: page errors: ${diagnostics.pageErrors.join('; ')}`);

    await captureScreenshot(page, `search-${name}.png`);
    return {name, overflow, seriousAxeViolations: serious.length};
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const results = [];
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'desktop', VIEWPORTS.desktop));
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'desktop-root', VIEWPORTS.desktop, '/_search/ru/'));
    writeJsonArtifact('search-smoke-summary.json', results);
    console.log(`Generated search browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
