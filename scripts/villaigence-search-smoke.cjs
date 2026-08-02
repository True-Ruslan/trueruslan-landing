const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {captureScreenshot, ensureArtifactsDir, writeJsonArtifact} = require('./quality-harness/evidence.cjs');

const PORT = Number(process.env.VILLAIGENCE_SEARCH_SMOKE_PORT || 4187);
const {chromium} = requireQualityTool('playwright', 'VillAIgence search smoke');

async function main() {
  ensureArtifactsDir();
  const server = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const runtime = await createScenarioPage(browser, {
      viewport: {width: 1280, height: 900},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const {page} = runtime;
    try {
      const response = await page.goto(`${server.baseUrl}/_search/ru/index.html`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`search page returned HTTP ${response?.status() ?? 'none'}`);

      const input = page.locator('.tr-search-input').first();
      const button = page.locator('.tr-search-button').first();
      await input.waitFor({state: 'visible', timeout: 5000});
      await input.fill('VillAIgence');
      await button.click();

      await page.waitForFunction(() => {
        const text = document.body.innerText;
        const link = [...document.querySelectorAll('a')].find((item) => {
          const href = item.getAttribute('href') || '';
          return href.includes('landing/projects/livingworld') && item.textContent?.includes('VillAIgence');
        });
        return text.includes('VillAIgence') && Boolean(link);
      }, null, {timeout: 7000});

      const routes = await page.locator('a[href*="landing/projects/livingworld"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      if (routes.length < 1) throw new Error('VillAIgence search result does not route to livingworld.html');
      const inventedRoutes = await page.locator('a[href*="projects/villaigence"]').count();
      if (inventedRoutes !== 0) throw new Error('VillAIgence search created a duplicate project route');

      await captureScreenshot(page, 'search-villaigence.png');
      writeJsonArtifact('villaigence-search-summary.json', {query: 'VillAIgence', routes});
      console.log(`VillAIgence search smoke passed: ${routes.join(', ')}`);
    } finally {
      await runtime.close();
    }
  } finally {
    if (browser) await browser.close();
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
