const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS, CORE_SCENARIOS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.PUBLICATIONS_SMOKE_PORT || 4184);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');
const EXPECTED_PUBLICATION_IDS = Object.freeze([
  'diplodoc-github-pages',
  'java-algorithmic-problems',
  'automated-conveyor-drive',
]);

async function assertPublicationContent(page, label) {
  const heading = (await page.locator('h1').first().innerText()).trim();
  if (!heading.includes(CORE_SCENARIOS.publications.heading)) {
    throw new Error(`${label}: unexpected h1: ${heading}`);
  }

  const cards = page.locator('[data-tr-publication-id]');
  if (await cards.count() !== 6) {
    throw new Error(`${label}: expected 3 featured and 3 catalogue cards.`);
  }

  for (const id of EXPECTED_PUBLICATION_IDS) {
    if (await page.locator(`[data-tr-publication-id="${id}"]`).count() !== 2) {
      throw new Error(`${label}: publication ${id} must appear once in Featured and once in Catalogue.`);
    }
  }

  const emptyGroupHeadings = ['Научные публикации', 'Доклады и конференции', 'Интервью и приглашённые материалы', 'Публикации в сборниках'];
  const pageText = await page.locator('body').innerText();
  for (const headingText of emptyGroupHeadings) {
    if (pageText.includes(headingText)) {
      throw new Error(`${label}: empty group must not render: ${headingText}`);
    }
  }

  const unsafeExternal = page.locator('[data-tr-publication-id] a[target="_blank"]:not([rel="noopener noreferrer"])');
  if (await unsafeExternal.count()) {
    throw new Error(`${label}: external publication links must use noopener noreferrer.`);
  }
}

async function runScenario(browser, baseUrl, {
  label,
  viewport,
  javaScriptEnabled,
  screenshot,
}) {
  const runtime = await createScenarioPage(browser, {
    viewport,
    javaScriptEnabled,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: ['ERR_ABORTED'],
  });

  try {
    const response = await page.goto(`${baseUrl}${CORE_SCENARIOS.publications.path}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) {
      throw new Error(`${label}: publications page returned HTTP ${response?.status() ?? 'no response'}`);
    }

    await assertPublicationContent(page, label);
    await assertNoHorizontalOverflow(page, label);
    await assertNoBlockingAxe({
      page,
      label,
      AxeBuilder,
      artifactName: `axe-${screenshot.replace('.png', '')}.json`,
    });

    const fallback = page.locator('[data-tr-publications-noscript]');
    const fallbackCount = await fallback.count();
    const fallbackVisible = fallbackCount === 1 ? await fallback.isVisible() : false;
    if (fallbackCount !== 1) {
      throw new Error(`${label}: expected exactly one semantic no-JS fallback node.`);
    }
    if (javaScriptEnabled && fallbackVisible) {
      throw new Error(`${label}: no-JS fallback must remain hidden when JavaScript is enabled.`);
    }
    if (!javaScriptEnabled && !fallbackVisible) {
      throw new Error(`${label}: semantic no-JS fallback must be visible without JavaScript.`);
    }

    await captureScreenshot(page, screenshot);
    diagnostics.assertClean(label);

    return {
      label,
      javaScriptEnabled,
      viewport,
      publicationCards: 6,
      fallbackCount,
      fallbackVisible,
    };
  } finally {
    await runtime.close();
  }
}

async function main() {
  ensureArtifactsDir();
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;

  try {
    browser = await launchChromium(chromium);
    const results = [];
    results.push(await runScenario(browser, serverRuntime.baseUrl, {
      label: 'Publications enhanced desktop',
      viewport: VIEWPORTS.desktop,
      javaScriptEnabled: true,
      screenshot: 'publications-enhanced-desktop.png',
    }));
    results.push(await runScenario(browser, serverRuntime.baseUrl, {
      label: 'Publications no-JS mobile',
      viewport: VIEWPORTS.mobile,
      javaScriptEnabled: false,
      screenshot: 'publications-no-js-mobile.png',
    }));

    writeJsonArtifact('publications-summary.json', {
      checkedAt: new Date().toISOString(),
      expectedPublicationIds: EXPECTED_PUBLICATION_IDS,
      results,
    });
    console.log('Publications enhanced and no-JS browser smoke passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
