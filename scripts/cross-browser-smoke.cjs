const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, captureScreenshot, writeJsonArtifact, writeTextArtifact} = require('./quality-harness/evidence.cjs');
const {CORE_SCENARIOS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.CROSS_BROWSER_PORT || 4176);
const {firefox, webkit} = requireQualityTool('playwright');

async function runScenario(browserType, browserName, scenario, baseUrl) {
  const browser = await browserType.launch({headless: true});
  const runtime = await createScenarioPage(browser, {
    viewport: {width: 1280, height: 900},
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: ['ABORTED', 'NS_BINDING_ABORTED'],
  });

  try {
    const response = await page.goto(`${baseUrl}${scenario.path}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) {
      throw new Error(`${browserName} navigation failed on ${scenario.path}: HTTP ${response?.status() ?? 'no response'}`);
    }

    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!heading.includes(scenario.heading)) {
      throw new Error(`${browserName} unexpected h1 on ${scenario.path}: ${heading}`);
    }

    await assertNoHorizontalOverflow(page, `${browserName} ${scenario.path}`);

    if (scenario.resume) {
      const pdfFallback = page.locator('a[data-tr-resume-link]').first();
      await pdfFallback.waitFor({state: 'attached'});
      const href = await pdfFallback.getAttribute('href');
      if (!href || !href.includes('cv.pdf')) {
        throw new Error(`${browserName} Resume PDF fallback link is missing or invalid.`);
      }
    }

    diagnostics.assertClean(`${browserName} ${scenario.path}`);
    return {browser: browserName, ...scenario, heading};
  } catch (error) {
    await captureScreenshot(page, `cross-browser-failure-${browserName}-${scenario.slug}.png`).catch(() => {});
    throw error;
  } finally {
    await runtime.close();
    await browser.close();
  }
}

async function main() {
  ensureArtifactsDir();
  const serverRuntime = await startStaticServer({port: PORT});
  const scenarios = [
    {...CORE_SCENARIOS.home, path: '/'},
    {...CORE_SCENARIOS.projects},
    {...CORE_SCENARIOS.resume, resume: true},
  ];
  const browsers = [
    ['firefox', firefox],
    ['webkit', webkit],
  ];
  const results = [];

  try {
    for (const [browserName, browserType] of browsers) {
      for (const scenario of scenarios) {
        results.push(await runScenario(browserType, browserName, scenario, serverRuntime.baseUrl));
        console.log(`[OK] ${browserName}: ${scenario.path}`);
      }
    }

    writeJsonArtifact('cross-browser-summary.json', {checkedAt: new Date().toISOString(), results});
  } finally {
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  ensureArtifactsDir();
  writeTextArtifact('cross-browser-failure.txt', `${error.stack || error.message}\n`);
  console.error(error.stack || error.message);
  process.exit(1);
});
