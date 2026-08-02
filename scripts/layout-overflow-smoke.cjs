const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {measureHorizontalScroll} = require('./quality-harness/assertions.cjs');
const {VIEWPORTS, CORE_SCENARIOS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.LAYOUT_OVERFLOW_PORT || 4177);
const {chromium} = requireQualityTool('playwright');

async function checkScenario(browser, baseUrl, scenario) {
  const runtime = await createScenarioPage(browser, {
    viewport: VIEWPORTS.mobile,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });

  try {
    const response = await runtime.page.goto(`${baseUrl}${scenario.path}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) {
      throw new Error(`${scenario.label} page returned HTTP ${response?.status() ?? 'no response'}`);
    }

    const result = await measureHorizontalScroll(runtime.page);
    if (result.maxScrollX > 2) {
      throw new Error(
        `${scenario.label} mobile can scroll horizontally by ${result.maxScrollX}px `
        + `(scrollWidth ${result.scrollWidth}px, viewport ${result.viewportWidth}px).`,
      );
    }

    console.log(
      `${scenario.label} mobile overflow smoke passed: maxScrollX=${result.maxScrollX}px, `
      + `scrollWidth=${result.scrollWidth}px, viewport=${result.viewportWidth}px.`,
    );
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;

  try {
    browser = await launchChromium(chromium);
    const scenarios = [
      {label: 'Projects', path: CORE_SCENARIOS.projects.path},
      {label: 'VillAIgence', path: CORE_SCENARIOS.villaigence.path},
      {label: 'Publications', path: CORE_SCENARIOS.publications.path},
    ];

    for (const scenario of scenarios) {
      await checkScenario(browser, serverRuntime.baseUrl, scenario);
    }
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
