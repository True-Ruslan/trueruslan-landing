const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const PORT = Number(process.env.LAYOUT_OVERFLOW_PORT || 4177);
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

async function measureHorizontalScroll(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const scrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    window.scrollTo(10000, window.scrollY);
    const maxScrollX = window.scrollX;
    window.scrollTo(0, window.scrollY);
    return {viewportWidth, scrollWidth, maxScrollX};
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) throw new Error('docs-html does not exist. Run npm run build:docs first.');
  const server = await startServer();
  let browser;

  try {
    browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({
      viewport: {width: 390, height: 844},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const response = await page.goto(`${BASE_URL}/landing/projects.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Projects page returned HTTP ${response?.status() ?? 'no response'}`);

    const result = await measureHorizontalScroll(page);
    if (result.maxScrollX > 2) {
      throw new Error(
        `Projects mobile can scroll horizontally by ${result.maxScrollX}px `
        + `(scrollWidth ${result.scrollWidth}px, viewport ${result.viewportWidth}px).`,
      );
    }

    console.log(
      `Projects mobile overflow smoke passed: maxScrollX=${result.maxScrollX}px, `
      + `scrollWidth=${result.scrollWidth}px, viewport=${result.viewportWidth}px.`,
    );
    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
