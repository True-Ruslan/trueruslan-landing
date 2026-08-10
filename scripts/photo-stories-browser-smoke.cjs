const fs = require('node:fs');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, artifactPath, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.PHOTO_STORIES_SMOKE_PORT || 4184);
const CANONICAL_ROUTE = '/photos/';
const LEGACY_ROUTE = '/landing/photos/';
const {chromium} = requireQualityTool('playwright', 'Photo Stories smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Photo Stories smoke tool');

async function collectHeaderDiagnostics(page) {
  return page.evaluate(() => [...document.querySelectorAll('a, button, summary, [role="button"]')]
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        tag: node.tagName.toLowerCase(),
        text: String(node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
        href: node.getAttribute('href'),
        ariaLabel: node.getAttribute('aria-label'),
        title: node.getAttribute('title'),
        role: node.getAttribute('role'),
        className: typeof node.className === 'string' ? node.className : '',
        dataUtility: node.getAttribute('data-tr-utility'),
        dataLanguage: node.getAttribute('data-tr-language-trigger') != null,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
        outerHtml: node.outerHTML.slice(0, 360),
      };
    })
    .filter((item) => (
      item.width > 0
      && item.height > 0
      && item.y < 120
      && item.display !== 'none'
      && item.visibility !== 'hidden'
      && Number(item.opacity) > 0
    )));
}

function classifyHeaderControl(item) {
  const haystack = `${item.href || ''} ${item.ariaLabel || ''} ${item.title || ''} ${item.text || ''} ${item.dataUtility || ''}`.toLowerCase();
  if (haystack.includes('github.com/true-ruslan') || haystack.includes('github')) return 'github';
  if (haystack.includes('habr.com/ru/users/trueruslan') || /(^|\s)habr(\s|$)/.test(haystack)) return 'habr';
  if (haystack.includes('t.me/trueruslan_blog') || haystack.includes('telegram')) return 'telegram';
  if (haystack.includes('_search/ru/') || haystack.includes('поиск') || haystack.includes('search')) return 'search';
  if (item.tag === 'summary' && (/^ru\b/i.test(item.text) || item.dataLanguage)) return 'language';
  return null;
}

function assertDesktopHeaderControls(diagnostics, name) {
  const expected = ['github', 'habr', 'telegram', 'search', 'language'];
  const matches = Object.fromEntries(expected.map((kind) => [kind, []]));
  for (const item of diagnostics) {
    const kind = classifyHeaderControl(item);
    if (kind) matches[kind].push(item);
  }

  const positions = [];
  for (const kind of expected) {
    if (matches[kind].length !== 1) {
      throw new Error(`${name}: expected one visible ${kind} control, got ${matches[kind].length}; diagnostics=${JSON.stringify(diagnostics)}`);
    }
    const item = matches[kind][0];
    positions.push({kind, x: item.x, right: item.x + item.width});
  }

  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index].x < positions[index - 1].x) {
      throw new Error(`${name}: shared header controls are out of order: ${JSON.stringify(positions)}`);
    }
  }
  return {utilityOrder: positions.map(({kind}) => kind), positions};
}

function assertMobileHeaderControl(diagnostics, name) {
  const menuButtons = diagnostics.filter((item) => item.tag === 'button' && item.className.includes('pc-mobile-menu-button'));
  if (menuButtons.length !== 1) {
    throw new Error(`${name}: expected one visible Diplodoc mobile menu control, got ${menuButtons.length}; diagnostics=${JSON.stringify(diagnostics)}`);
  }
  return {
    utilityOrder: ['mobile-menu'],
    positions: [{kind: 'mobile-menu', x: menuButtons[0].x, right: menuButtons[0].x + menuButtons[0].width}],
  };
}

async function assertSharedShell(page, name, viewport) {
  await page.waitForTimeout(250);
  const diagnostics = await collectHeaderDiagnostics(page);
  writeJsonArtifact(`photo-stories-header-${name}.json`, diagnostics);

  const headerContract = viewport.width >= 1000
    ? assertDesktopHeaderControls(diagnostics, name)
    : assertMobileHeaderControl(diagnostics, name);

  if (await page.locator('.tr-site-header, .tr-site-nav, .tr-photo-index-hero').count()) {
    throw new Error(`${name}: legacy standalone photo shell is still present`);
  }

  const headingCount = await page.locator('h1').count();
  if (headingCount !== 1) throw new Error(`${name}: expected one page h1, got ${headingCount}`);

  const geometry = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const root = document.querySelector('[data-tr-photo-page="index"]');
    if (!heading || !root) return null;
    const headingRect = heading.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    return {
      headingTop: headingRect.top,
      headingBottom: headingRect.bottom,
      contentTop: rootRect.top,
      gap: rootRect.top - headingRect.bottom,
      viewportHeight: window.innerHeight,
    };
  });
  if (!geometry) throw new Error(`${name}: photo page heading or embedded content is missing`);
  if (geometry.gap < -2 || geometry.gap > 180) {
    throw new Error(`${name}: photo content is not aligned with normal article spacing: ${JSON.stringify(geometry)}`);
  }
  if (geometry.headingTop > geometry.viewportHeight * 0.45) {
    throw new Error(`${name}: page heading starts too far below the shared header: ${JSON.stringify(geometry)}`);
  }

  let sidebarVisible = null;
  if (viewport.width >= 1000) {
    sidebarVisible = await page.getByRole('link', {name: 'Фото', exact: true}).evaluateAll((links) =>
      links.some((link) => {
        const rect = link.getBoundingClientRect();
        return !link.closest('header') && rect.width > 0 && rect.height > 0;
      }),
    );
    if (!sidebarVisible) throw new Error(`${name}: Diplodoc left navigation does not expose the active Фото route`);
  }

  return {...headerContract, geometry, sidebarVisible};
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
  if (!(await root.locator('[role="dialog"]').isVisible())) throw new Error(`${name}: lightbox dialog is not visible`);
  if (!(await page.locator('[data-tr-photo-lightbox-image]').getAttribute('src'))) throw new Error(`${name}: lightbox image has no source`);

  await page.keyboard.press('Escape');
  await root.waitFor({state: 'hidden'});
  const focusId = await page.evaluate(() => document.activeElement?.dataset?.photoId || null);
  if (focusId !== 'archive-semihatov') throw new Error(`${name}: focus was not restored to the originating photo link`);

  await page.goto(`${baseUrl}${CANONICAL_ROUTE}#archive-magister`, {waitUntil: 'networkidle'});
  await page.locator('[data-tr-photo-page="index"]').waitFor({state: 'visible'});
  await root.waitFor({state: 'visible'});
  const directTitle = await page.locator('[data-tr-photo-lightbox-title]').textContent();
  if (!String(directTitle).includes('Защита магистерской')) throw new Error(`${name}: direct hash did not open the requested archive photo`);
  await page.keyboard.press('Escape');
  await root.waitFor({state: 'hidden'});
}

async function waitForVisibleRevealTransitions(page) {
  await page.evaluate(async () => {
    const revealAnimations = [...document.querySelectorAll('.tr-reveal.is-visible')]
      .flatMap((node) => node.getAnimations())
      .filter((animation) => animation.playState !== 'finished');
    await Promise.all(revealAnimations.map((animation) => animation.finished.catch(() => undefined)));
  });
  await page.waitForFunction(() => [...document.querySelectorAll('.tr-reveal.is-visible')]
    .every((node) => Number.parseFloat(getComputedStyle(node).opacity) >= 0.999));
}

async function assertLegacyRedirect(page, name, baseUrl) {
  await page.goto(`${baseUrl}${LEGACY_ROUTE}`, {waitUntil: 'domcontentloaded'});
  await page.waitForURL(new RegExp(`${CANONICAL_ROUTE.replaceAll('/', '\\/')}$`), {timeout: 5000});
  if (!page.url().endsWith(CANONICAL_ROUTE)) {
    throw new Error(`${name}: legacy photo route did not redirect to the canonical index`);
  }
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

function cleanStalePhotoEvidence() {
  for (const filename of [
    'photo-stories-desktop.png',
    'photo-stories-mobile.png',
    'photo-stories-reduced-motion.png',
    'photo-stories-summary.json',
    'photo-stories-header-desktop.json',
    'photo-stories-header-mobile.json',
    'photo-stories-header-reduced-motion.json',
  ]) {
    fs.rmSync(artifactPath(filename), {force: true});
  }
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
    const response = await page.goto(`${baseUrl}${CANONICAL_ROUTE}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: navigation HTTP ${response?.status() ?? 'none'}`);
    await page.locator('[data-tr-photo-page="index"]').waitFor({state: 'visible'});

    const overflow = (await assertNoHorizontalOverflow(page, name)).overflow;
    const shell = await assertSharedShell(page, name, viewport);
    await assertArchiveAndLightbox(page, name, baseUrl);
    await waitForVisibleRevealTransitions(page);

    const axe = await new AxeBuilder({page}).analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) {
      ensureArtifactsDir();
      fs.writeFileSync(
        artifactPath(`photo-stories-axe-${name}.json`),
        JSON.stringify(axe.violations, null, 2),
      );
      throw new Error(`${name}: Axe serious/critical violations: ${serious.map((violation) => violation.id).join(', ')}`);
    }
    diagnostics.assertClean(name);

    await assertLegacyRedirect(page, name, baseUrl);
    await page.goto(`${baseUrl}${CANONICAL_ROUTE}`, {waitUntil: 'networkidle'});
    await page.locator('[data-tr-photo-page="index"]').waitFor({state: 'visible'});
    await prepareVisualEvidence(page, name);
    await captureScreenshot(page, `photo-stories-${name}.png`);

    return {
      name,
      reducedMotion,
      archiveItems: await page.locator('[data-tr-photo-archive-item]').count(),
      albumCards: await page.locator('[data-tr-photo-album-card]').count(),
      overflow,
      shell,
      seriousAxeViolations: serious.length,
    };
  } finally {
    await runtime.close();
  }
}

async function main() {
  ensureArtifactsDir();
  cleanStalePhotoEvidence();
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