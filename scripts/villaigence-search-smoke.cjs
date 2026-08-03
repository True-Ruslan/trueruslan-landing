const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {captureScreenshot, ensureArtifactsDir, writeJsonArtifact} = require('./quality-harness/evidence.cjs');

const PORT = Number(process.env.VILLAIGENCE_SEARCH_SMOKE_PORT || 4187);
const {chromium} = requireQualityTool('playwright', 'VillAIgence and deterministic-authority search smoke');

async function searchForRoute(page, input, button, {query, routeFragment, textFragment}) {
  await input.fill(query);
  await button.click();

  await page.waitForFunction(({routeFragment, textFragment}) => {
    const text = document.body.innerText;
    const link = [...document.querySelectorAll('a')].find((item) => {
      const href = item.getAttribute('href') || '';
      return href.includes(routeFragment) && item.textContent?.includes(textFragment);
    });
    return text.includes(textFragment) && Boolean(link);
  }, {routeFragment, textFragment}, {timeout: 7000});

  const routes = await page.locator(`a[href*="${routeFragment}"]`).evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  if (routes.length < 1) throw new Error(`${query}: search result does not route to ${routeFragment}`);
  return routes;
}

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

      const villaigenceRoutes = await searchForRoute(page, input, button, {
        query: 'VillAIgence',
        routeFragment: 'landing/projects/livingworld',
        textFragment: 'VillAIgence',
      });
      const inventedRoutes = await page.locator('a[href*="projects/villaigence"]').count();
      if (inventedRoutes !== 0) throw new Error('VillAIgence search created a duplicate project route');
      await captureScreenshot(page, 'search-villaigence.png');

      const authorityRoutes = await searchForRoute(page, input, button, {
        query: 'deterministic authority',
        routeFragment: 'landing/notes/probabilistic-proposals-deterministic-authority',
        textFragment: 'AI может предложить, но не применить',
      });

      writeJsonArtifact('villaigence-search-summary.json', {
        queries: [
          {query: 'VillAIgence', routes: villaigenceRoutes},
          {query: 'deterministic authority', routes: authorityRoutes},
        ],
      });
      console.log(`VillAIgence search smoke passed: ${villaigenceRoutes.join(', ')}`);
      console.log(`Deterministic-authority search smoke passed: ${authorityRoutes.join(', ')}`);
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
