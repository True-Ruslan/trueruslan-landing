const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {measureHorizontalScroll} = require('./quality-harness/assertions.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.LAYOUT_OVERFLOW_PORT || 4177);
const {chromium} = requireQualityTool('playwright');

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  let runtime;

  try {
    browser = await launchChromium(chromium);
    runtime = await createScenarioPage(browser, {
      viewport: VIEWPORTS.mobile,
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });

    const response = await runtime.page.goto(`${serverRuntime.baseUrl}/landing/projects.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Projects page returned HTTP ${response?.status() ?? 'no response'}`);

    const result = await measureHorizontalScroll(runtime.page);
    if (result.maxScrollX > 2) {
      throw new Error(
        `Projects mobile can scroll horizontally by ${result.maxScrollX}px `
        + `(scrollWidth ${result.scrollWidth}px, viewport ${result.viewportWidth}px).`,
      );
    }

    console.log(
      `Projects mobile overflow smoke passed: maxScrollX=${result.maxScrollX}px, `
      + `scrollWidth=${result.scrollWidth}px, viewport=${result.viewportWidth}px.`,
    );
  } finally {
    if (runtime) await runtime.close();
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
