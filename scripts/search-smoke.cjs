const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact, writeTextArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.SEARCH_SMOKE_PORT || 4174);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

async function runScenario(browser, baseUrl, name, viewport) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: ['ERR_ABORTED'],
  });

  try {
    const response = await page.goto(`${baseUrl}/_search/ru/index.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: search navigation HTTP ${response?.status() ?? 'none'}`);

    await page.waitForTimeout(700);
    await captureScreenshot(page, `search-${name}.png`);

    const rootHtml = await page.locator('#root').innerHTML().catch(() => '');
    writeTextArtifact(`search-${name}-root.html`, rootHtml);

    const bodyText = (await page.locator('body').innerText()).trim();
    if (!bodyText) throw new Error(`${name}: generated search page rendered an empty body`);

    const searchInput = page.locator('.dc-search-page__search-field input, input[placeholder="Поиск"], input.tr-search-input').first();
    await searchInput.waitFor({state: 'visible', timeout: 5000});

    const marker = await page.locator('html').getAttribute('data-tr-search-enhanced');
    if (marker !== 'true') {
      throw new Error(`${name}: progressive search enhancement marker missing; pageErrors=${diagnostics.pageErrors.join(' | ') || 'none'}`);
    }

    const stylesheetCount = await page.locator('link[href$="_assets/style/search.css"]').count();
    const scriptCount = await page.locator('script[src$="_assets/script/search-ui.js"]').count();
    if (stylesheetCount !== 1 || scriptCount !== 1) {
      throw new Error(`${name}: branded search resources missing or duplicated (${stylesheetCount} css, ${scriptCount} js)`);
    }

    await page.locator('body').click({position: {x: 4, y: 4}}).catch(() => {});
    await page.keyboard.press('/');
    const focused = await searchInput.evaluate((input) => document.activeElement === input);
    if (!focused) throw new Error(`${name}: / keyboard shortcut did not focus search input`);

    const overflow = (await assertNoHorizontalOverflow(page, name)).overflow;

    const axe = await new AxeBuilder({page}).analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) throw new Error(`${name}: Axe serious/critical violations: ${serious.map((item) => item.id).join(', ')}`);

    diagnostics.assertClean(name);

    return {
      name,
      bodyLength: bodyText.length,
      rootHtmlLength: rootHtml.length,
      overflow,
      seriousAxeViolations: serious.length,
      enhanced: marker === 'true',
    };
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
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'desktop', {width: 1280, height: 900}));
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'mobile', VIEWPORTS.mobile));
    writeJsonArtifact('search-summary.json', results);
    console.log(`Generated local-search browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
