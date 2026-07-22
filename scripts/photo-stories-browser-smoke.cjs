const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, artifactPath, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.PHOTO_STORIES_SMOKE_PORT || 4184);
const {chromium} = requireQualityTool('playwright', 'Photo Stories smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Photo Stories smoke tool');

async function assertHeroTitleFitsViewport(page, name) {
  const geometry = await page.locator('.tr-photo-index-hero h1').evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      viewportWidth: window.innerWidth,
    };
  });
  if (geometry.left < -1 || geometry.right > geometry.viewportWidth + 1) {
    throw new Error(`${name}: photo hero title is clipped by the viewport: ${JSON.stringify(geometry)}`);
  }
  return geometry;
}

async function assertArchiveAndLightbox(page, name, baseUrl) {
  const albumCards = page.locator('[data-tr-photo-album-card]');
  const archiveItems = page.locator('[data-tr-photo-archive-item]');
  if (await albumCards.count() !== 0) throw new Error(`${name}: fake album cards must not ship while registry is empty`);
  if (await archiveItems.count() !== 3) throw new Error(`${name}: expected exactly three archive items`);
  if (!(await page.getByText('Полноценные фотоистории появятся здесь', {exact: false}).isVisible())) {
    throw new Error(`${name}: honest empty-story state is not visible`);
  }

  const firstLink = archiveItems.first().locator('[data-tr-photo-lightbox]');
  await firstLink.focus();
  await firstLink.click();
  const root = page.locator('[data-tr-photo-lightbox-root]');
  await root.waitFor({state: 'visible'});
  if (page.url().split('#')[1] !== 'archive-semihatov') throw new Error(`${name}: lightbox did not synchronize archive hash`);
  const dialog = root.locator('[role="dialog"]');
  if (!(await dialog.isVisible())) throw new Error(`${name}: lightbox dialog is not visible`);
  if (!(await page.locator('[data-tr-photo-lightbox-image]').getAttribute('src'))) throw new Error(`${name}: lightbox image has no source`);

  await page.keyboard.press('Escape');
  await root.waitFor({state: 'hidden'});
  const focusId = await page.evaluate(() => document.activeElement?.dataset?.photoId || null);
  if (focusId !== 'archive-semihatov') throw new Error(`${name}: focus was not restored to the originating photo link`);

  await page.goto(`${baseUrl}/photos/#archive-magister`, {waitUntil: 'networkidle'});
  await root.waitFor({state: 'visible'});
  const directTitle = await page.locator('[data-tr-photo-lightbox-title]').textContent();
  if (!String(directTitle).includes('Защита магистерской')) throw new Error(`${name}: direct hash did not open the requested archive photo`);
  await page.keyboard.press('Escape');
  await root.waitFor({state: 'hidden'});
}

async function prepareVisualEvidence(page, name) {
  const archive = page.locator('.tr-photo-archive');
  await archive.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const images = [...document.querySelectorAll('[data-tr-photo-archive-item] img')];
    return images.length === 3 && images.every((image) => image.complete && image.naturalWidth > 0);
  }, null, {timeout: 5000});
  const unloaded = await page.locator('[data-tr-photo-archive-item] img').evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth <= 0).length,
  );
  if (unloaded) throw new Error(`${name}: ${unloaded} archive image(s) were not loaded before screenshot evidence`);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function runScenario(browser, baseUrl, name, viewport, reducedMotion = 'no-preference') {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark', reducedMotion});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: [],
    captureHttpErrors: false,
  });

  try {
    const response = await page.goto(`${baseUrl}/photos/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: navigation HTTP ${response?.status() ?? 'none'}`);
    await page.locator('[data-tr-photo-page="index"]').waitFor({state: 'visible'});

    const overflow = (await assertNoHorizontalOverflow(page, name)).overflow;
    const titleGeometry = await assertHeroTitleFitsViewport(page, name);
    await assertArchiveAndLightbox(page, name, baseUrl);

    const axe = await new AxeBuilder({page}).analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) {
      ensureArtifactsDir();
      require('node:fs').writeFileSync(
        artifactPath(`photo-stories-axe-${name}.json`),
        JSON.stringify(axe.violations, null, 2),
      );
      throw new Error(`${name}: Axe serious/critical violations: ${serious.map((violation) => violation.id).join(', ')}`);
    }
    diagnostics.assertClean(name);

    await page.goto(`${baseUrl}/photos/`, {waitUntil: 'networkidle'});
    await prepareVisualEvidence(page, name);
    await captureScreenshot(page, `photo-stories-${name}.png`);

    return {
      name,
      reducedMotion,
      archiveItems: await page.locator('[data-tr-photo-archive-item]').count(),
      albumCards: await page.locator('[data-tr-photo-album-card]').count(),
      overflow,
      titleGeometry,
      seriousAxeViolations: serious.length,
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
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'desktop', VIEWPORTS.desktop));
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'mobile', VIEWPORTS.mobile));
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'reduced-motion', {width: 1280, height: 800}, 'reduce'));
    writeJsonArtifact('photo-stories-summary.json', results);
    console.log(`Photo Stories browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
