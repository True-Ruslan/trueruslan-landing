const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {OUTPUT_DIR} = require('./quality-harness/paths.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const {chromium} = requireQualityTool('playwright', 'Privacy analytics smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Privacy analytics smoke tool');

const FAKE_TOKEN = 'testAnalyticsToken0123456789ABCDEF';
const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const ROUTES = Object.freeze([
  '/',
  '/en/',
  '/landing/projects/livingworld/',
  '/en/projects/livingworld/',
  '/_search/ru/',
]);

function listHtmlFiles(root) {
  const files = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
    }
  };
  visit(root);
  return files.sort();
}

function assertTokenlessProductionBuild() {
  const htmlFiles = listHtmlFiles(OUTPUT_DIR);
  if (!htmlFiles.length) throw new Error('Tokenless analytics check found no generated HTML files.');

  const contaminated = htmlFiles
    .filter((file) => fs.readFileSync(file, 'utf8').includes('data-tr-analytics="cloudflare-web-analytics"'))
    .map((file) => path.relative(OUTPUT_DIR, file).replaceAll(path.sep, '/'));

  if (contaminated.length) {
    throw new Error(`Default CI build unexpectedly contains analytics beacons: ${contaminated.join(', ')}`);
  }
  return htmlFiles.length;
}

async function installAnalyticsBlock(context, intercepted) {
  await context.route('https://static.cloudflareinsights.com/**', async (route) => {
    intercepted.push(route.request().url());
    await route.abort('blockedbyclient');
  });
  await context.route('https://cloudflareinsights.com/**', async (route) => {
    intercepted.push(route.request().url());
    await route.abort('blockedbyclient');
  });
}

async function assertRoute({browser, baseUrl, route, viewport = VIEWPORTS.desktop}) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {context, page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl});
  const intercepted = [];

  try {
    await installAnalyticsBlock(context, intercepted);
    const response = await page.goto(`${baseUrl}${route}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${route}: HTTP ${response?.status() ?? 'none'}`);

    const beacon = page.locator('script[data-tr-analytics="cloudflare-web-analytics"]');
    if (await beacon.count() !== 1) throw new Error(`${route}: expected exactly one analytics beacon`);
    if (await beacon.getAttribute('src') !== BEACON_SRC) throw new Error(`${route}: unexpected analytics script source`);
    if (await beacon.getAttribute('type') !== 'module') throw new Error(`${route}: analytics beacon must use type=module`);
    if (!(await beacon.evaluate((node) => node.hasAttribute('defer')))) throw new Error(`${route}: analytics beacon must be deferred`);

    const rawConfig = await beacon.getAttribute('data-cf-beacon');
    let config;
    try {
      config = JSON.parse(rawConfig);
    } catch {
      throw new Error(`${route}: invalid data-cf-beacon JSON`);
    }
    if (config.token !== FAKE_TOKEN || config.spa !== false || Object.keys(config).length !== 2) {
      throw new Error(`${route}: analytics configuration escaped bounded token/spa contract`);
    }

    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      bodyText: document.body?.innerText?.trim() || '',
      mainCount: document.querySelectorAll('main').length,
      h1Count: document.querySelectorAll('h1').length,
    }));
    const analyticsStorage = [...storage.local, ...storage.session]
      .filter((key) => /analytics|cloudflare|cf-beacon|web-analytics/i.test(key));
    if (analyticsStorage.length) throw new Error(`${route}: analytics-related persistent storage keys found: ${analyticsStorage.join(', ')}`);
    if (!storage.bodyText) throw new Error(`${route}: page body disappeared with analytics blocked`);

    if (route.startsWith('/_search/')) {
      const searchInput = page.locator('.dc-search-page__search-field input, input[placeholder="Поиск"], input.tr-search-input').first();
      await searchInput.waitFor({state: 'visible', timeout: 5000});
    } else {
      if (storage.mainCount < 1) throw new Error(`${route}: main content disappeared with analytics blocked`);
      if (storage.h1Count < 1) throw new Error(`${route}: H1 disappeared with analytics blocked`);
    }

    const cookies = await context.cookies();
    const analyticsCookies = cookies.filter((cookie) => /analytics|cloudflare|cf_/i.test(cookie.name));
    if (analyticsCookies.length) throw new Error(`${route}: analytics-related cookies found: ${analyticsCookies.map((cookie) => cookie.name).join(', ')}`);

    const overflow = await assertNoHorizontalOverflow(page, `analytics:${route}`);
    diagnostics.assertClean(`analytics:${route}`);

    return {
      route,
      config,
      analyticsCookies: analyticsCookies.length,
      analyticsStorageKeys: analyticsStorage.length,
      overflow: overflow.overflow,
      blockedAnalyticsRequests: intercepted.length,
    };
  } finally {
    await runtime.close();
  }
}

async function assertRepresentativeA11y(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {
    viewport: VIEWPORTS.mobile,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {context, page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl});
  const intercepted = [];

  try {
    await installAnalyticsBlock(context, intercepted);
    const response = await page.goto(`${baseUrl}/en/projects/livingworld/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`analytics a11y route HTTP ${response?.status() ?? 'none'}`);
    const result = await assertNoBlockingAxe({
      page,
      label: 'analytics:en-livingworld-mobile',
      AxeBuilder,
      artifactName: 'analytics-browser-axe.json',
    });
    diagnostics.assertClean('analytics:en-livingworld-mobile');
    return {
      seriousOrCritical: result.blocking.length,
      blockedAnalyticsRequests: intercepted.length,
    };
  } finally {
    await runtime.close();
  }
}

async function main() {
  const tokenlessHtmlCount = assertTokenlessProductionBuild();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-browser-'));
  const fixtureDir = path.join(tempRoot, 'docs-html');
  let serverRuntime;
  let browser;

  try {
    fs.cpSync(OUTPUT_DIR, fixtureDir, {recursive: true});
    const {applyAnalytics, loadAnalyticsPolicy} = await import('./analytics.js');
    const policy = loadAnalyticsPolicy();
    const injection = applyAnalytics(fixtureDir, policy, FAKE_TOKEN);
    if (!injection.enabled || injection.updated.length === 0) {
      throw new Error('Analytics fixture injection did not enable the fake-token site.');
    }

    serverRuntime = await startStaticServer({port: 0, outputDir: fixtureDir});
    browser = await launchChromium(chromium);

    const routes = [];
    for (const route of ROUTES) routes.push(await assertRoute({browser, baseUrl: serverRuntime.baseUrl, route}));
    const accessibility = await assertRepresentativeA11y(browser, serverRuntime.baseUrl);

    const summary = {
      provider: policy.provider,
      tokenlessHtmlCount,
      injectedHtmlCount: injection.updated.length,
      fakeTokenOnly: true,
      routes,
      accessibility,
    };
    writeJsonArtifact('analytics-browser-summary.json', summary);
    console.log(`Privacy-friendly analytics browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    if (serverRuntime) await serverRuntime.stop();
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
