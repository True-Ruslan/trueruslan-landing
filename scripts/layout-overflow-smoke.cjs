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

async function snapshot(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const bodyWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    const initialScrollX = window.scrollX;
    window.scrollTo(10000, window.scrollY);
    const maxScrollX = window.scrollX;
    window.scrollTo(0, window.scrollY);

    const drawer = document.querySelector('.dc-doc-layout__left');
    const drawerInfo = drawer ? {
      className: drawer.className,
      attributes: Object.fromEntries([...drawer.attributes].map((attribute) => [attribute.name, attribute.value])),
      parentClassName: drawer.parentElement?.className || '',
      parentAttributes: drawer.parentElement
        ? Object.fromEntries([...drawer.parentElement.attributes].map((attribute) => [attribute.name, attribute.value]))
        : {},
      style: {
        left: getComputedStyle(drawer).left,
        right: getComputedStyle(drawer).right,
        width: getComputedStyle(drawer).width,
        transform: getComputedStyle(drawer).transform,
        visibility: getComputedStyle(drawer).visibility,
      },
    } : null;

    const mobileButton = document.querySelector('.pc-mobile-menu-button');
    const mobileButtonInfo = mobileButton ? {
      className: mobileButton.className,
      attributes: Object.fromEntries([...mobileButton.attributes].map((attribute) => [attribute.name, attribute.value])),
    } : null;

    return {viewportWidth, bodyWidth, initialScrollX, maxScrollX, drawerInfo, mobileButtonInfo};
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) throw new Error('docs-html does not exist. Run npm run build:docs first.');
  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({viewport: {width: 390, height: 844}, colorScheme: 'dark', reducedMotion: 'reduce'});
    const page = await context.newPage();
    const response = await page.goto(`${BASE_URL}/landing/projects.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Projects page returned HTTP ${response?.status() ?? 'no response'}`);

    const closed = await snapshot(page);
    const menuButton = page.locator('.pc-mobile-menu-button');
    if (await menuButton.count()) {
      await menuButton.click();
      await page.waitForTimeout(100);
    }
    const opened = await snapshot(page);

    const result = {closed, opened};
    console.log(JSON.stringify(result, null, 2));
    if (closed.maxScrollX > 2) {
      throw new Error(`Closed page can scroll horizontally by ${closed.maxScrollX}px; drawer state is listed above.`);
    }
    console.log('Projects mobile layout cannot scroll horizontally while the drawer is closed.');
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
