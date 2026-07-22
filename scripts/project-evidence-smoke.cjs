const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.PROJECT_EVIDENCE_SMOKE_PORT || 4183);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const PROJECTS = [
  {project: 'livingworld', route: '/landing/projects/livingworld.html', status: 'verified', label: 'ПРОВЕРЕНО', borderStyle: 'solid'},
  {project: 'node-zero', route: '/landing/projects/node-zero.html', status: 'stale', label: 'ТРЕБУЕТ ПЕРЕПРОВЕРКИ', borderStyle: 'dashed'},
];

function requireTool(name) {
  try {
    return require(path.join(TOOLS_DIR, ...name.split('/')));
  } catch (error) {
    throw new Error(`Project Evidence smoke tool ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

const {chromium} = requireTool('playwright');
const {default: AxeBuilder} = requireTool('@axe-core/playwright');

function startServer() {
  if (!fs.existsSync(OUTPUT_DIR)) throw new Error('docs-html does not exist. Run npm run build:docs first.');
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(OUTPUT_DIR, {extensions: ['html'], fallthrough: false}));
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function stopServer(server) {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`${label}: horizontal overflow ${overflow}px`);
  return overflow;
}

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

async function runEnhanced(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, colorScheme: 'dark', reducedMotion: 'reduce'});
  const page = await context.newPage();
  const results = {};

  try {
    for (const expected of PROJECTS) {
      const pageErrors = [];
      page.removeAllListeners('pageerror');
      page.on('pageerror', (error) => pageErrors.push(error.message));
      const response = await page.goto(`${BASE_URL}${expected.route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`enhanced:${expected.project}: navigation HTTP ${response?.status() ?? 'none'}`);
      await page.waitForSelector(`[data-project-evidence="${expected.project}"]`, {timeout: 5000});

      const evidence = await assertEvidence(page, expected, `enhanced:${expected.project}`);
      const overflow = await assertNoOverflow(page, `enhanced:${expected.project}:mobile`);
      const axe = await new AxeBuilder({page}).include(`[data-project-evidence="${expected.project}"]`).analyze();
      const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
      if (serious.length) throw new Error(`enhanced:${expected.project}: Axe serious/critical violations: ${serious.map((violation) => violation.id).join(', ')}`);
      if (pageErrors.length) throw new Error(`enhanced:${expected.project}: page errors: ${pageErrors.join('; ')}`);

      fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
      await page.screenshot({path: path.join(ARTIFACTS_DIR, `project-evidence-${expected.project}-mobile.png`), fullPage: true, animations: 'disabled'});
      results[expected.project] = {...evidence, overflow, seriousAxeViolations: serious.length};
    }
    return results;
  } finally {
    await context.close();
  }
}

async function runNoJavaScript(browser) {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, colorScheme: 'dark', javaScriptEnabled: false});
  const page = await context.newPage();
  const results = {};

  try {
    for (const expected of PROJECTS) {
      const response = await page.goto(`${BASE_URL}${expected.route}`, {waitUntil: 'load'});
      if (!response?.ok()) throw new Error(`no-js:${expected.project}: navigation HTTP ${response?.status() ?? 'none'}`);
      const evidence = await assertEvidence(page, expected, `no-js:${expected.project}`);
      const overflow = await assertNoOverflow(page, `no-js:${expected.project}:desktop`);
      results[expected.project] = {...evidence, overflow};
    }
    return results;
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  const server = await startServer();
  let browser;
  try {
    try {
      browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    } catch {
      browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    }
    const summary = {enhanced: await runEnhanced(browser), noJavaScript: await runNoJavaScript(browser)};
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'project-evidence-summary.json'), JSON.stringify(summary, null, 2));
    console.log(`Project Evidence browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
