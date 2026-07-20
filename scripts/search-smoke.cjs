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

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  const server = await startServer();
  let browser;

  try {
    browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage({viewport: {width: 1280, height: 900}, colorScheme: 'dark'});
    const failures = [];
    const pageErrors = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      if (!sameOrigin(request.url())) return;
      const reason = request.failure()?.errorText || 'unknown failure';
      if (!reason.includes('ERR_ABORTED')) failures.push(`${request.url()} -> ${reason}`);
    });
    page.on('response', (response) => {
      if (sameOrigin(response.url()) && response.status() >= 400) {
        failures.push(`${response.status()} ${response.url()}`);
      }
    });

    const response = await page.goto(`${BASE_URL}/_search/ru/index.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) {
      throw new Error(`Search page navigation failed with HTTP ${response?.status() ?? 'no response'}`);
    }

    await page.waitForTimeout(300);
    const bodyText = (await page.locator('body').innerText()).trim();
    if (!bodyText) {
      throw new Error('Generated search page rendered an empty body.');
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'search-desktop.png'),
      fullPage: true,
      animations: 'disabled',
    });

    if (pageErrors.length) {
      throw new Error(`Search page errors: ${pageErrors.join('; ')}`);
    }
    if (failures.length) {
      throw new Error(`Search resource failures: ${[...new Set(failures)].join('; ')}`);
    }

    console.log('Generated local-search page browser smoke passed.');
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
