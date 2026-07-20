const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.CROSS_BROWSER_PORT || 4176);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function requireTool(name) {
  return require(path.join(TOOLS_DIR, ...name.split('/')));
}

const {firefox, webkit} = requireTool('playwright');

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

async function runScenario(browserType, browserName, scenario) {
  const browser = await browserType.launch({headless: true});
  const context = await browser.newContext({
    viewport: {width: 1280, height: 900},
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const pageErrors = [];
  const failedRequests = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    if (!sameOrigin(request.url())) return;
    const reason = request.failure()?.errorText || 'unknown failure';
    if (!reason.includes('ABORTED') && !reason.includes('NS_BINDING_ABORTED')) {
      failedRequests.push(`${request.method()} ${request.url()} -> ${reason}`);
    }
  });
  page.on('response', (response) => {
    if (sameOrigin(response.url()) && response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    const response = await page.goto(`${BASE_URL}${scenario.path}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) {
      throw new Error(`${browserName} navigation failed on ${scenario.path}: HTTP ${response?.status() ?? 'no response'}`);
    }

    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!heading.includes(scenario.heading)) {
      throw new Error(`${browserName} unexpected h1 on ${scenario.path}: ${heading}`);
    }

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      content: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    }));
    if (dimensions.content > dimensions.viewport + 2) {
      throw new Error(`${browserName} horizontal overflow on ${scenario.path}: ${dimensions.content} > ${dimensions.viewport}`);
    }

    if (scenario.resume) {
      const pdfFallback = page.locator('a[data-tr-resume-link]').first();
      await pdfFallback.waitFor({state: 'attached'});
      const href = await pdfFallback.getAttribute('href');
      if (!href || !href.includes('cv.pdf')) {
        throw new Error(`${browserName} Resume PDF fallback link is missing or invalid.`);
      }
    }

    if (pageErrors.length) {
      throw new Error(`${browserName} page errors on ${scenario.path}: ${pageErrors.join('; ')}`);
    }
    if (failedRequests.length) {
      throw new Error(`${browserName} request failures on ${scenario.path}: ${[...new Set(failedRequests)].join('; ')}`);
    }

    return {browser: browserName, ...scenario, heading};
  } catch (error) {
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `cross-browser-failure-${browserName}-${scenario.slug}.png`),
      fullPage: true,
      animations: 'disabled',
    }).catch(() => {});
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  const server = await startServer();
  const scenarios = [
    {slug: 'home', path: '/', heading: 'Руслан Немыкин'},
    {slug: 'projects', path: '/landing/projects.html', heading: 'Проекты'},
    {slug: 'resume', path: '/landing/resume.html', heading: 'Резюме', resume: true},
  ];
  const browsers = [
    ['firefox', firefox],
    ['webkit', webkit],
  ];
  const results = [];

  try {
    for (const [browserName, browserType] of browsers) {
      for (const scenario of scenarios) {
        results.push(await runScenario(browserType, browserName, scenario));
        console.log(`[OK] ${browserName}: ${scenario.path}`);
      }
    }

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'cross-browser-summary.json'),
      JSON.stringify({checkedAt: new Date().toISOString(), results}, null, 2),
    );
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'cross-browser-failure.txt'), `${error.stack || error.message}\n`);
  console.error(error.stack || error.message);
  process.exit(1);
});
