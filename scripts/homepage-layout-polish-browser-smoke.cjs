const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.HOMEPAGE_LAYOUT_POLISH_PORT || 4195);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

const DESKTOP = {width: 1440, height: 1100};
const TABLET = {width: 820, height: 1000};
const BRIDGE_COUNT = 3;
const TRANSITION_SURFACE_COUNT = 4;

function union(rects) {
  return rects.reduce((result, rect) => ({
    x: Math.min(result.x, rect.x),
    y: Math.min(result.y, rect.y),
    right: Math.max(result.right, rect.x + rect.width),
    bottom: Math.max(result.bottom, rect.y + rect.height),
  }), {x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity});
}

async function measureBridge(bridge) {
  return bridge.evaluate((node) => {
    const copy = node.querySelector('.tr-home-bridge__copy');
    const actions = [...node.querySelectorAll('.tr-home-bridge__action')].filter((item) => {
      const style = getComputedStyle(item);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (!copy || actions.length === 0) return null;
    const copyRect = copy.getBoundingClientRect();
    const bridgeRect = node.getBoundingClientRect();
    const actionRects = actions.map((item) => item.getBoundingClientRect()).map((rect) => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }));
    return {
      bridge: {x: bridgeRect.x, y: bridgeRect.y, width: bridgeRect.width, height: bridgeRect.height},
      copy: {x: copyRect.x, y: copyRect.y, width: copyRect.width, height: copyRect.height},
      actions: actionRects,
    };
  });
}

async function measureTransitionSurfaces(page) {
  const surfaces = page.locator('[data-home-bridge], [data-home-collaboration="true"]');
  const count = await surfaces.count();
  if (count !== TRANSITION_SURFACE_COUNT) {
    throw new Error(`Expected ${TRANSITION_SURFACE_COUNT} homepage transition surfaces, found ${count}.`);
  }

  const measurements = [];
  for (let index = 0; index < count; index += 1) {
    measurements.push(await surfaces.nth(index).evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        kind: node.dataset.homeBridge || 'collaboration',
        y: rect.y,
        height: rect.height,
      };
    }));
  }
  return measurements;
}

function validateSurfaceRhythm(surfaces, label) {
  const gaps = surfaces.slice(1).map((surface, index) => {
    const previous = surfaces[index];
    return surface.y - (previous.y + previous.height);
  });
  const spread = Math.max(...gaps) - Math.min(...gaps);
  if (spread > 18) {
    throw new Error(`Homepage ${label} transition rhythm is uneven: gaps ${gaps.map((gap) => gap.toFixed(1)).join(', ')}px; spread ${spread.toFixed(1)}px.`);
  }
  return {gaps, spread};
}

function validateDesktopBridge(measurement, index) {
  if (!measurement) throw new Error(`Homepage bridge ${index + 1} is missing copy or actions.`);
  const actionBounds = union(measurement.actions);
  const copyCenter = measurement.copy.y + measurement.copy.height / 2;
  const actionsCenter = actionBounds.y + (actionBounds.bottom - actionBounds.y) / 2;
  const centerDelta = Math.abs(copyCenter - actionsCenter);
  if (centerDelta > 26) {
    throw new Error(`Homepage bridge ${index + 1} actions are vertically detached from copy: center delta ${centerDelta.toFixed(1)}px.`);
  }

  const copyRight = measurement.copy.x + measurement.copy.width;
  const horizontalGap = actionBounds.x - copyRight;
  if (horizontalGap > 88) {
    throw new Error(`Homepage bridge ${index + 1} actions are too remote from copy: ${horizontalGap.toFixed(1)}px.`);
  }

  const bridgeRight = measurement.bridge.x + measurement.bridge.width;
  if (actionBounds.right > bridgeRight + 2) {
    throw new Error(`Homepage bridge ${index + 1} actions escape the bridge bounds.`);
  }

  return {centerDelta, horizontalGap};
}

function validateStackedBridge(measurement, index) {
  if (!measurement) throw new Error(`Homepage bridge ${index + 1} is missing copy or actions.`);
  const actionBounds = union(measurement.actions);
  const leftDelta = Math.abs(actionBounds.x - measurement.copy.x);
  if (leftDelta > 6) {
    throw new Error(`Homepage bridge ${index + 1} stacked actions are not aligned with copy: ${leftDelta.toFixed(1)}px.`);
  }
  if (actionBounds.y < measurement.copy.y + measurement.copy.height - 2) {
    throw new Error(`Homepage bridge ${index + 1} stacked actions overlap the copy.`);
  }
  return {leftDelta};
}

async function runViewport(browser, baseUrl, viewport, label, {desktop = false, axe = false} = {}) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl, ignoredRequestFailureReasons: ['ERR_ABORTED']});
  try {
    const response = await page.goto(`${baseUrl}/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Homepage ${label} returned HTTP ${response?.status() ?? 'none'}`);

    const bridges = page.locator('[data-home-bridge]');
    const count = await bridges.count();
    if (count !== BRIDGE_COUNT) throw new Error(`Expected ${BRIDGE_COUNT} standard homepage bridges, found ${count}.`);

    const transitionSurfaces = await measureTransitionSurfaces(page);
    const rhythm = validateSurfaceRhythm(transitionSurfaces, label);
    const measurements = [];
    for (let index = 0; index < count; index += 1) {
      const measurement = await measureBridge(bridges.nth(index));
      const result = desktop
        ? validateDesktopBridge(measurement, index)
        : validateStackedBridge(measurement, index);
      measurements.push(result);
    }

    await assertNoHorizontalOverflow(page, `Homepage ${label}`);
    if (axe) {
      await assertNoBlockingAxe({page, label: `Homepage ${label}`, AxeBuilder, artifactName: `axe-homepage-layout-polish-${label}.json`});
    }
    diagnostics.assertClean(`Homepage ${label}`);
    if (label === 'desktop' || label === 'mobile') {
      await captureScreenshot(page, `homepage-layout-polish-${label}.png`);
    }
    return {label, viewport, rhythm, measurements};
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
    const scenarios = [
      await runViewport(browser, serverRuntime.baseUrl, DESKTOP, 'desktop', {desktop: true, axe: true}),
      await runViewport(browser, serverRuntime.baseUrl, TABLET, 'tablet'),
      await runViewport(browser, serverRuntime.baseUrl, VIEWPORTS.mobile, 'mobile'),
    ];
    writeJsonArtifact('homepage-layout-polish-summary.json', {
      checkedAt: new Date().toISOString(),
      scenarios,
    });
    console.log('Homepage layout polish browser/a11y smoke passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
