const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.PROJECT_EVIDENCE_SMOKE_PORT || 4183);
const {chromium} = requireQualityTool('playwright', 'Project Evidence smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Project Evidence smoke tool');

const PROJECTS = [
  {project: 'livingworld', route: '/landing/projects/livingworld.html', status: 'verified', label: 'ПРОВЕРЕНО', borderStyle: 'solid'},
  {project: 'node-zero', route: '/landing/projects/node-zero.html', status: 'stale', label: 'ТРЕБУЕТ ПЕРЕПРОВЕРКИ', borderStyle: 'dashed'},
];

async function assertEvidence(page, expected, prefix) {
  const root = page.locator(`[data-project-evidence="${expected.project}"]`);
  if (await root.count() !== 1) throw new Error(`${prefix}: expected exactly one ${expected.project} evidence root`);
  if (!(await root.isVisible())) throw new Error(`${prefix}: ${expected.project} evidence root is not visible`);

  if (await root.getAttribute('data-evidence-status') !== expected.status) {
    throw new Error(`${prefix}: ${expected.project} trust status does not match ${expected.status}`);
  }
  const text = await root.textContent();
  if (!text?.includes(expected.label)) throw new Error(`${prefix}: ${expected.project} trust label is missing`);
  if (!text?.includes('Что подтверждает:')) throw new Error(`${prefix}: ${expected.project} bounded evidence scope is missing`);

  if (expected.status !== 'verified') {
    if (await root.getAttribute('class').then((value) => value?.includes('tr-project-evidence--verified'))) {
      throw new Error(`${prefix}: ${expected.project} carries verified styling class`);
    }
  }

  const trustTreatment = await root.evaluate((element) => {
    const style = getComputedStyle(element);
    return {borderLeftStyle: style.borderLeftStyle, borderLeftWidth: style.borderLeftWidth};
  });
  if (trustTreatment.borderLeftStyle !== expected.borderStyle || Number.parseFloat(trustTreatment.borderLeftWidth) < 4) {
    throw new Error(`${prefix}: expected ${expected.borderStyle} >=4px trust border, got ${trustTreatment.borderLeftStyle} ${trustTreatment.borderLeftWidth}`);
  }

  const links = root.locator('a[href]');
  for (let index = 0; index < await links.count(); index += 1) {
    const href = await links.nth(index).getAttribute('href');
    if (!href?.startsWith('https://')) throw new Error(`${prefix}: unsafe evidence link ${href}`);
  }

  return {
    signals: await root.locator('[data-evidence-kind]').count(),
    status: expected.status,
    trustBorder: trustTreatment,
  };
}

async function runEnhanced(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.mobile, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const results = {};

  try {
    for (const expected of PROJECTS) {
      const pageErrors = [];
      page.removeAllListeners('pageerror');
      page.on('pageerror', (error) => pageErrors.push(error.message));
      const response = await page.goto(`${baseUrl}${expected.route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`enhanced:${expected.project}: navigation HTTP ${response?.status() ?? 'none'}`);
      await page.waitForSelector(`[data-project-evidence="${expected.project}"]`, {timeout: 5000});

      const evidence = await assertEvidence(page, expected, `enhanced:${expected.project}`);
      const overflow = (await assertNoHorizontalOverflow(page, `enhanced:${expected.project}:mobile`)).overflow;
      const axe = await new AxeBuilder({page}).include(`[data-project-evidence="${expected.project}"]`).analyze();
      const serious = blockingAxeViolations(axe);
      if (serious.length) throw new Error(`enhanced:${expected.project}: Axe serious/critical violations: ${serious.map((violation) => violation.id).join(', ')}`);
      if (pageErrors.length) throw new Error(`enhanced:${expected.project}: page errors: ${pageErrors.join('; ')}`);

      await captureScreenshot(page, `project-evidence-${expected.project}-mobile.png`);
      results[expected.project] = {...evidence, overflow, seriousAxeViolations: serious.length};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function runNoJavaScript(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: {width: 1280, height: 800}, colorScheme: 'dark', javaScriptEnabled: false});
  const {page} = runtime;
  const results = {};

  try {
    for (const expected of PROJECTS) {
      const response = await page.goto(`${baseUrl}${expected.route}`, {waitUntil: 'load'});
      if (!response?.ok()) throw new Error(`no-js:${expected.project}: navigation HTTP ${response?.status() ?? 'none'}`);
      const evidence = await assertEvidence(page, expected, `no-js:${expected.project}`);
      const overflow = (await assertNoHorizontalOverflow(page, `no-js:${expected.project}:desktop`)).overflow;
      results[expected.project] = {...evidence, overflow};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const summary = {
      enhanced: await runEnhanced(browser, serverRuntime.baseUrl),
      noJavaScript: await runNoJavaScript(browser, serverRuntime.baseUrl),
    };
    writeJsonArtifact('project-evidence-summary.json', summary);
    console.log(`Project Evidence browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
