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

async function inspectOverflow(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const bodyWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    const offenders = [...document.querySelectorAll('*')]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        const rightOverflow = Math.max(0, rect.right - viewportWidth);
        const leftOverflow = Math.max(0, -rect.left);
        const internalOverflow = Math.max(0, node.scrollWidth - node.clientWidth);
        return {
          tag: node.tagName.toLowerCase(),
          id: node.id || '',
          className: typeof node.className === 'string' ? node.className : '',
          text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
          rightOverflow: Math.round(rightOverflow * 10) / 10,
          leftOverflow: Math.round(leftOverflow * 10) / 10,
          internalOverflow,
          display: style.display,
          position: style.position,
          minWidth: style.minWidth,
          widthStyle: style.width,
          whiteSpace: style.whiteSpace,
          overflowX: style.overflowX,
          wordBreak: style.wordBreak,
          overflowWrap: style.overflowWrap,
        };
      })
      .filter((item) => item.rightOverflow > 2 || item.leftOverflow > 2 || item.internalOverflow > 2)
      .sort((a, b) => Math.max(b.rightOverflow, b.leftOverflow, b.internalOverflow) - Math.max(a.rightOverflow, a.leftOverflow, a.internalOverflow))
      .slice(0, 20);

    return {viewportWidth, bodyWidth, offenders};
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

    const result = await inspectOverflow(page);
    console.log(JSON.stringify(result, null, 2));
    if (result.bodyWidth > result.viewportWidth + 2) {
      throw new Error(`Horizontal overflow: ${result.bodyWidth}px > ${result.viewportWidth}px; offenders are listed above.`);
    }
    console.log('Projects mobile layout has no horizontal overflow.');
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
