const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.PHOTO_STORIES_SMOKE_PORT || 4184);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function requireTool(name) {
  try {
    return require(path.join(TOOLS_DIR, ...name.split('/')));
  } catch (error) {
    throw new Error(`Photo Stories smoke tool ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

const {chromium} = requireTool('playwright');
const {default: AxeBuilder} = requireTool('@axe-core/playwright');

function findChrome() {
  const explicit = process.env.CHROME_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;
  for (const command of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try {
      const resolved = execFileSync('which', [command], {encoding: 'utf8'}).trim();
      if (resolved) return resolved;
    } catch {
      // Try the next executable.
    }
  }
  throw new Error('Chrome/Chromium executable was not found on the CI runner.');
}

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

async function launchBrowser() {
  const chromePath = findChrome();
  try {
    return await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
  } catch {
    return chromium.launch({executablePath: chromePath, headless: true, args: ['--no-sandbox']});
  }
}

function installDiagnostics(page) {
  const pageErrors = [];
  const failedRequests = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    try {
      const url = new URL(request.url());
      if (url.origin === BASE_URL) failedRequests.push(`${request.method()} ${url.pathname}: ${request.failure()?.errorText || 'failed'}`);
    } catch {
      // Ignore malformed third-party URLs.
    }
  });
  return {pageErrors, failedRequests};
}

async function assertNoOverflow(page, name) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`${name}: horizontal overflow ${overflow}px`);
  return overflow;
}

async function assertArchiveAndLightbox(page, name) {
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

  await page.goto(`${BASE_URL}/photos/#archive-magister`, {waitUntil: 'networkidle'});
  await root.waitFor({state: 'visible'});
  const directTitle = await page.locator('[data-tr-photo-lightbox-title]').textContent();
  if (!String(directTitle).includes('Защита магистерской')) throw new Error(`${name}: direct hash did not open the requested archive photo`);
  await page.keyboard.press('Escape');
  await root.waitFor({state: 'hidden'});
}

async function runScenario(browser, name, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({viewport, colorScheme: 'dark', reducedMotion});
  const page = await context.newPage();
  const diagnostics = installDiagnostics(page);
  try {
    const response = await page.goto(`${BASE_URL}/photos/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: navigation HTTP ${response?.status() ?? 'none'}`);
    await page.locator('[data-tr-photo-page="index"]').waitFor({state: 'visible'});

    const overflow = await assertNoOverflow(page, name);
    await assertArchiveAndLightbox(page, name);

    const axe = await new AxeBuilder({page}).analyze();
    const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    if (serious.length) {
      fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
      fs.writeFileSync(path.join(ARTIFACTS_DIR, `photo-stories-axe-${name}.json`), JSON.stringify(axe.violations, null, 2));
      throw new Error(`${name}: Axe serious/critical violations: ${serious.map((violation) => violation.id).join(', ')}`);
    }
    if (diagnostics.pageErrors.length) throw new Error(`${name}: page errors: ${diagnostics.pageErrors.join('; ')}`);
    if (diagnostics.failedRequests.length) throw new Error(`${name}: failed same-origin requests: ${diagnostics.failedRequests.join('; ')}`);

    await page.goto(`${BASE_URL}/photos/`, {waitUntil: 'networkidle'});
    fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `photo-stories-${name}.png`),
      fullPage: true,
      animations: 'disabled',
    });

    return {
      name,
      reducedMotion,
      archiveItems: await page.locator('[data-tr-photo-archive-item]').count(),
      albumCards: await page.locator('[data-tr-photo-album-card]').count(),
      overflow,
      seriousAxeViolations: serious.length,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  const server = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const results = [];
    results.push(await runScenario(browser, 'desktop', {width: 1440, height: 1000}));
    results.push(await runScenario(browser, 'mobile', {width: 390, height: 844}));
    results.push(await runScenario(browser, 'reduced-motion', {width: 1280, height: 800}, 'reduce'));
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'photo-stories-summary.json'), JSON.stringify(results, null, 2));
    console.log(`Photo Stories browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
