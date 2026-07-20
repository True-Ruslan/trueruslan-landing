const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.SEARCH_SMOKE_PORT || 4174);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function requireTool(name) {
  return require(path.join(TOOLS_DIR, ...name.split('/')));
}

const {chromium} = requireTool('playwright');
const {default: AxeBuilder} = requireTool('@axe-core/playwright');

function startServer() {
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

function sameOrigin(url) {
  try {
    return new URL(url).origin === new URL(BASE_URL).origin;
  } catch {
    return false;
  }
}

async function runScenario(browser, name, viewport) {
  const context = await browser.newContext({viewport, colorScheme: 'dark'});
  const page = await context.newPage();
  const failures = [];
  const pageErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    if (!sameOrigin(request.url())) return;
    const reason = request.failure()?.errorText || 'unknown failure';
    if (!reason.includes('ERR_ABORTED')) failures.push(`${request.url()} -> ${reason}`);
  });
  page.on('response', (response) => {
    if (sameOrigin(response.url()) && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });

  try {
    const response = await page.goto(`${BASE_URL}/_search/ru/index.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: search navigation HTTP ${response?.status() ?? 'none'}`);

    await page.waitForTimeout(350);
    const bodyText = (await page.locator('body').innerText()).trim();
    if (!bodyText) throw new Error(`${name}: generated search page rendered an empty body`);

    const searchInput = page.locator('input[type="search"], input[role="searchbox"], input.tr-search-input').first();
    await searchInput.waitFor({state: 'visible', timeout: 5000});

    const marker = await page.locator('html').getAttribute('data-tr-search-enhanced');
    if (marker !== 'true') throw new Error(`${name}: progressive search enhancement marker missing`);

    const stylesheetCount = await page.locator('link[href$="_assets/style/search.css"]').count();
    const scriptCount = await page.locator('script[src$="_assets/script/search-ui.js"]').count();
    if (stylesheetCount !== 1 || scriptCount !== 1) {
      throw new Error(`${name}: branded search resources missing or duplicated (${stylesheetCount} css, ${scriptCount} js)`);
    }

    await page.locator('body').click({position: {x: 4, y: 4}}).catch(() => {});
    await page.keyboard.press('/');
    const focused = await searchInput.evaluate((input) => document.activeElement === input);
    if (!focused) throw new Error(`${name}: / keyboard shortcut did not focus search input`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error(`${name}: horizontal overflow ${overflow}px`);

    const axe = await new AxeBuilder({page}).analyze();
    const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    if (serious.length) throw new Error(`${name}: Axe serious/critical violations: ${serious.map((item) => item.id).join(', ')}`);

    if (pageErrors.length) throw new Error(`${name}: search page errors: ${pageErrors.join('; ')}`);
    if (failures.length) throw new Error(`${name}: search resource failures: ${[...new Set(failures)].join('; ')}`);

    fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `search-${name}.png`),
      fullPage: true,
      animations: 'disabled',
    });

    return {
      name,
      bodyLength: bodyText.length,
      overflow,
      seriousAxeViolations: serious.length,
      enhanced: marker === 'true',
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
    browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    const results = [];
    results.push(await runScenario(browser, 'desktop', {width: 1280, height: 900}));
    results.push(await runScenario(browser, 'mobile', {width: 390, height: 844}));
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'search-summary.json'), JSON.stringify(results, null, 2));
    console.log(`Generated local-search browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
