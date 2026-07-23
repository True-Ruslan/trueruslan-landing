const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.I18N_SMOKE_PORT || 4191);
const SITE_PATH = '/trueruslan-landing';
const {chromium} = requireQualityTool('playwright', 'Minimal RU EN smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Minimal RU EN smoke tool');

const PAIRS = [
  {id: 'home', ru: '/index.html', en: '/en/index.html'},
  {id: 'about', ru: '/landing/about.html', en: '/en/about.html'},
  {id: 'resume', ru: '/landing/resume.html', en: '/en/resume.html'},
  {id: 'projects', ru: '/landing/projects.html', en: '/en/projects.html'},
  {id: 'livingworld', ru: '/landing/projects/livingworld.html', en: '/en/projects/livingworld.html'},
  {id: 'note-ai-npcs', ru: '/landing/notes/server-authoritative-ai-npcs.html', en: '/en/notes/server-authoritative-ai-npcs.html'},
  {id: 'note-llm-protocol-boundary', ru: '/landing/notes/llm-output-is-a-protocol-boundary.html', en: '/en/notes/llm-output-is-a-protocol-boundary.html'},
];

function publicPath(pathname) {
  if (pathname === '/index.html') return `${SITE_PATH}/`;
  if (pathname === '/en/index.html') return `${SITE_PATH}/en/`;
  return `${SITE_PATH}${pathname}`;
}

function localRouteFromPublicHref(href) {
  const url = new URL(href);
  if (!url.pathname.startsWith(`${SITE_PATH}/`) && url.pathname !== `${SITE_PATH}`) {
    throw new Error(`language switcher escaped site path: ${href}`);
  }
  const route = url.pathname.slice(SITE_PATH.length) || '/';
  return route === '/' ? '/index.html' : route.endsWith('/') ? `${route}index.html` : route;
}

function formatAxeViolations(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  }));
}

async function assertSeoPair(page, pair, locale, label) {
  const ownPath = locale === 'en' ? pair.en : pair.ru;
  const counterpartLocale = locale === 'en' ? 'ru' : 'en';
  const counterpartPath = pair[counterpartLocale];

  const canonical = page.locator('link[rel="canonical"]');
  if (await canonical.count() !== 1) throw new Error(`${label}: expected exactly one canonical`);
  const canonicalHref = await canonical.getAttribute('href');
  if (new URL(canonicalHref).pathname !== publicPath(ownPath)) {
    throw new Error(`${label}: self canonical mismatch: ${canonicalHref}`);
  }

  for (const hreflang of ['ru', 'en', 'x-default']) {
    const alternate = page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (await alternate.count() !== 1) throw new Error(`${label}: expected one hreflang=${hreflang}`);
    const href = await alternate.getAttribute('href');
    const expectedPath = hreflang === 'en' ? pair.en : pair.ru;
    if (new URL(href).pathname !== publicPath(expectedPath)) {
      throw new Error(`${label}: hreflang=${hreflang} mismatch: ${href}`);
    }
  }

  const switcher = page.locator('[data-tr-language-switcher="true"] a');
  if (await switcher.count() !== 1) throw new Error(`${label}: expected one language switch anchor`);
  if (await switcher.getAttribute('hreflang') !== counterpartLocale) {
    throw new Error(`${label}: language switch hreflang mismatch`);
  }
  const switchHref = await switcher.getAttribute('href');
  if (new URL(switchHref).pathname !== publicPath(counterpartPath)) {
    throw new Error(`${label}: language switch target mismatch: ${switchHref}`);
  }

  return switchHref;
}

async function assertEnglishRoutes(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl});
  const results = {};

  try {
    for (const pair of PAIRS) {
      const response = await page.goto(`${baseUrl}${pair.en}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`${pair.id}: English route HTTP ${response?.status() ?? 'none'}`);
      const lang = await page.locator('html').getAttribute('lang');
      if (lang !== 'en') throw new Error(`${pair.id}: expected html lang=en, got ${lang}`);
      if (await page.locator('h1').count() !== 1) throw new Error(`${pair.id}: expected exactly one H1`);
      diagnostics.assertClean(`en:${pair.id}`);
      results[pair.id] = {status: response.status(), lang};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function assertRepresentativePairs(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce', javaScriptEnabled: false});
  const {page} = runtime;
  const results = {};
  const representative = PAIRS.filter((pair) => ['home', 'resume', 'livingworld'].includes(pair.id));

  try {
    for (const pair of representative) {
      let response = await page.goto(`${baseUrl}${pair.en}`, {waitUntil: 'load'});
      if (!response?.ok()) throw new Error(`${pair.id}: no-js English route failed`);
      const switchHref = await assertSeoPair(page, pair, 'en', `en:${pair.id}`);
      const localRu = localRouteFromPublicHref(switchHref);

      response = await page.goto(`${baseUrl}${localRu}`, {waitUntil: 'load'});
      if (!response?.ok()) throw new Error(`${pair.id}: RU counterpart route failed`);
      if (await page.locator('html').getAttribute('lang') !== 'ru') throw new Error(`${pair.id}: RU counterpart missing lang=ru`);
      await assertSeoPair(page, pair, 'ru', `ru:${pair.id}`);
      results[pair.id] = {switchTarget: localRu, noJavaScript: true};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function assertQuality(browser, baseUrl) {
  const scenarios = [
    {name: 'home-desktop', route: '/en/index.html', viewport: VIEWPORTS.desktop},
    {name: 'livingworld-mobile', route: '/en/projects/livingworld.html', viewport: VIEWPORTS.mobile},
  ];
  const results = {};

  for (const scenario of scenarios) {
    const runtime = await createScenarioPage(browser, {viewport: scenario.viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
    const {page} = runtime;
    const diagnostics = installPageDiagnostics(page, {baseUrl});
    try {
      const response = await page.goto(`${baseUrl}${scenario.route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`${scenario.name}: HTTP ${response?.status() ?? 'none'}`);
      const overflow = (await assertNoHorizontalOverflow(page, `i18n:${scenario.name}`)).overflow;
      const axe = await new AxeBuilder({page}).analyze();
      const serious = blockingAxeViolations(axe);
      if (serious.length) {
        throw new Error(`${scenario.name}: Axe serious/critical violations: ${JSON.stringify(formatAxeViolations(serious))}`);
      }
      diagnostics.assertClean(`i18n:${scenario.name}`);
      await captureScreenshot(page, `i18n-${scenario.name}.png`);
      results[scenario.name] = {overflow, seriousAxeViolations: serious.length};
    } finally {
      await runtime.close();
    }
  }
  return results;
}

async function assertSingleSearch(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/_search/ru/index.html`, {waitUntil: 'networkidle'});
  if (!response?.ok()) throw new Error(`single search route HTTP ${response?.status() ?? 'none'}`);

  const homeResponse = await page.goto(`${baseUrl}/en/index.html`, {waitUntil: 'networkidle'});
  if (!homeResponse?.ok()) throw new Error('English home unavailable for search-link assertion');
  const searchHref = await page.locator('a[href*="_search/ru/index.html"]').first().getAttribute('href');
  if (!searchHref?.includes('_search/ru/index.html')) throw new Error(`English UI does not point to the single RU search index: ${searchHref}`);
  return {route: '/_search/ru/index.html', englishUiHref: searchHref};
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const searchRuntime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce'});
    let search;
    try {
      search = await assertSingleSearch(searchRuntime.page, serverRuntime.baseUrl);
    } finally {
      await searchRuntime.close();
    }

    const summary = {
      routes: await assertEnglishRoutes(browser, serverRuntime.baseUrl),
      pairs: await assertRepresentativePairs(browser, serverRuntime.baseUrl),
      quality: await assertQuality(browser, serverRuntime.baseUrl),
      search,
    };
    writeJsonArtifact('i18n-browser-summary.json', summary);
    console.log(`Minimal RU EN browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
