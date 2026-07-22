const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.BIBLIOGRAPHY_SMOKE_PORT || 4182);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function requireTool(name) {
  try {
    return require(path.join(TOOLS_DIR, ...name.split('/')));
  } catch (error) {
    throw new Error(`Bibliography smoke tool ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

const {chromium} = requireTool('playwright');

function findChrome() {
  const explicit = process.env.CHROME_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;

  for (const command of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try {
      const resolved = execFileSync('which', [command], {encoding: 'utf8'}).trim();
      if (resolved) return resolved;
    } catch {
      // Try the next browser executable.
    }
  }

  throw new Error('Chrome/Chromium executable was not found on the CI runner.');
}

function startServer() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    throw new Error('docs-html does not exist. Run npm run build:docs first.');
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(OUTPUT_DIR, {extensions: ['html'], fallthrough: false}));

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function stopServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  const server = await startServer();
  let browser;

  try {
    const chromePath = findChrome();
    try {
      browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    } catch {
      browser = await chromium.launch({executablePath: chromePath, headless: true, args: ['--no-sandbox']});
    }

    const context = await browser.newContext({
      viewport: {width: 1280, height: 800},
      colorScheme: 'dark',
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();

    const response = await page.goto(`${BASE_URL}/landing/bibliography.html`, {waitUntil: 'networkidle'});
    if (!response || !response.ok()) {
      throw new Error(`Bibliography navigation failed: HTTP ${response?.status() ?? 'no response'}`);
    }

    await page.waitForFunction(() => document.documentElement.classList.contains('tr-visual-ready'));
    await page.locator('main table').waitFor({state: 'attached'});
    await page.waitForFunction(() => document.querySelector('main table')?.classList.contains('tr-reveal'));

    // Do not resize the viewport. The original bug only recovered after fullscreen/resize.
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
      const table = document.querySelector('main table');
      if (!table) return null;
      const style = getComputedStyle(table);
      const rect = table.getBoundingClientRect();
      return {
        reveal: table.classList.contains('tr-reveal'),
        visibleClass: table.classList.contains('is-visible'),
        opacity: Number(style.opacity),
        visibility: style.visibility,
        display: style.display,
        height: rect.height,
        viewportHeight: window.innerHeight,
      };
    });

    if (!state || !state.reveal || !state.visibleClass || state.opacity < 0.95 || state.visibility === 'hidden' || state.display === 'none' || state.height <= 0) {
      throw new Error(`Bibliography table is hidden after hydration without resize: ${JSON.stringify(state)}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'bibliography-reveal.png'),
      fullPage: false,
      animations: 'disabled',
    });

    await context.close();
    console.log(`Bibliography reveal smoke passed: ${JSON.stringify(state)}`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
