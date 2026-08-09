const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.ENGINEERING_GRAPH_PORT || 4176);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

async function runScenario(browser, baseUrl, name, viewport) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark'});
  const {page} = runtime;
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`${baseUrl}/engineering-map/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: navigation HTTP ${response?.status() ?? 'none'}`);
    await page.waitForSelector('[data-tr-engineering-graph-enhanced="true"]', {timeout: 5000});

    const nodes = page.locator('.tr-engineering-graph__node');
    if (await nodes.count() < 16) throw new Error(`${name}: expected at least 16 graph nodes`);
    const filters = page.locator('.tr-engineering-graph__filter');
    if (await filters.count() !== 5) throw new Error(`${name}: expected five filters including All`);

    await page.getByRole('button', {name: 'AI', exact: true}).click();
    const villaigence = page.locator('[data-node-id="livingworld"]');
    const java = page.locator('[data-node-id="java"]');
    if (await villaigence.evaluate((node) => node.classList.contains('is-filtered-out'))) {
      throw new Error(`${name}: VillAIgence incorrectly filtered out by AI filter`);
    }
    if (!(await java.evaluate((node) => node.classList.contains('is-filtered-out')))) {
      throw new Error(`${name}: Java should be dimmed by AI filter`);
    }

    await page.getByRole('button', {name: 'Все', exact: true}).click();
    await villaigence.focus();
    await page.waitForTimeout(50);
    const detailText = await page.locator('.tr-engineering-graph__detail').innerText();
    if (!detailText.includes('VillAIgence') || !detailText.includes('Server-authoritative')) {
      throw new Error(`${name}: selected VillAIgence node detail did not update`);
    }

    const overflow = (await assertNoHorizontalOverflow(page, name)).overflow;

    const axe = await new AxeBuilder({page}).include('.tr-engineering-graph').analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) throw new Error(`${name}: Axe serious/critical violations: ${serious.map((v) => v.id).join(', ')}`);
    if (pageErrors.length) throw new Error(`${name}: page errors: ${pageErrors.join('; ')}`);

    await captureScreenshot(page, `engineering-map-${name}.png`);

    return {name, nodes: await nodes.count(), filters: await filters.count(), seriousAxeViolations: serious.length, overflow};
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
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'mobile', VIEWPORTS.mobile));
    writeJsonArtifact('engineering-graph-summary.json', results);
    console.log(`Engineering Map browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});