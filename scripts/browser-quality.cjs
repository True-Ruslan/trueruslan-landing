const fs = require('node:fs');
const path = require('node:path');
const {execFileSync, spawn} = require('node:child_process');

const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.QUALITY_PORT || 4173);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function requireTool(name) {
  const toolPath = path.join(TOOLS_DIR, ...name.split('/'));
  try {
    return require(toolPath);
  } catch (error) {
    throw new Error(`Quality tool ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

const {chromium} = requireTool('playwright');
const AxeBuilder = requireTool('@axe-core/playwright').default;

function findChrome() {
  const explicit = process.env.CHROME_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;

  const commands = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];
  for (const command of commands) {
    try {
      const resolved = execFileSync('which', [command], {encoding: 'utf8'}).trim();
      if (resolved) return resolved;
    } catch {
      // Try the next known browser executable.
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

function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: {...process.env, ...env},
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function sameOrigin(url) {
  try {
    return new URL(url).origin === new URL(BASE_URL).origin;
  } catch {
    return false;
  }
}

async function assertResumePdf(page, context) {
  const iframe = page.locator('[data-tr-resume-pdf]');
  await iframe.waitFor({state: 'attached'});
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-tr-resume-pdf]');
    return node && node.getAttribute('src') && node.getAttribute('src') !== 'about:blank';
  });

  const src = await iframe.getAttribute('src');
  if (!src) throw new Error('Resume iframe did not receive a PDF src.');

  const pdfUrl = new URL(src, page.url()).href;
  const response = await context.request.get(pdfUrl);
  if (!response.ok()) {
    throw new Error(`Resume PDF returned HTTP ${response.status()}: ${pdfUrl}`);
  }

  const contentType = response.headers()['content-type'] || '';
  if (!contentType.includes('application/pdf')) {
    throw new Error(`Resume URL is not served as PDF (${contentType || 'missing content-type'}): ${pdfUrl}`);
  }
}

async function checkScenario(browser, scenario, summary) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  const failedResponses = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    if (!sameOrigin(request.url())) return;
    const reason = request.failure()?.errorText || 'unknown failure';
    if (reason.includes('ERR_ABORTED')) return;
    failedResponses.push(`${request.method()} ${request.url()} -> ${reason}`);
  });
  page.on('response', (response) => {
    if (sameOrigin(response.url()) && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    const response = await page.goto(`${BASE_URL}${scenario.path}`, {waitUntil: 'networkidle'});
    if (!response || !response.ok()) {
      throw new Error(`Navigation failed for ${scenario.path}: HTTP ${response?.status() ?? 'no response'}`);
    }

    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!heading.includes(scenario.heading)) {
      throw new Error(`Unexpected h1 on ${scenario.path}: expected "${scenario.heading}", got "${heading}"`);
    }

    const visualReady = await page.evaluate(() => document.documentElement.classList.contains('tr-visual-ready'));
    if (!visualReady) {
      throw new Error(`Custom visual layer did not initialize on ${scenario.path}`);
    }

    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      bodyWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    }));
    if (layout.bodyWidth > layout.viewportWidth + 2) {
      throw new Error(`Horizontal overflow on ${scenario.slug}: ${layout.bodyWidth}px > ${layout.viewportWidth}px`);
    }

    if (scenario.path.includes('/resume')) {
      await assertResumePdf(page, context);
    }

    if (scenario.accessibility) {
      let builder = new AxeBuilder({page});
      if (scenario.path.includes('/resume')) {
        builder = builder.exclude('[data-tr-resume-pdf]');
      }
      const axe = await builder.analyze();
      const blocking = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
      fs.writeFileSync(
        path.join(ARTIFACTS_DIR, `axe-${scenario.slug}.json`),
        JSON.stringify({violations: axe.violations}, null, 2),
      );
      if (blocking.length) {
        const details = blocking.map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`).join('; ');
        throw new Error(`Accessibility violations on ${scenario.slug}: ${details}`);
      }
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `${scenario.slug}.png`),
      fullPage: true,
      animations: 'disabled',
    });

    if (errors.length) {
      throw new Error(`Browser page errors on ${scenario.slug}: ${errors.join('; ')}`);
    }
    if (failedResponses.length) {
      throw new Error(`Failed same-origin requests on ${scenario.slug}: ${[...new Set(failedResponses)].join('; ')}`);
    }

    summary.push({
      slug: scenario.slug,
      path: scenario.path,
      heading,
      viewport: scenario.viewport,
      accessibilityChecked: Boolean(scenario.accessibility),
    });
  } finally {
    await context.close();
  }
}

async function runLighthouse(chromePath) {
  const lighthouseBin = path.join(TOOLS_DIR, '.bin', process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse');
  const reportPath = path.join(ARTIFACTS_DIR, 'lighthouse-home.json');

  if (!fs.existsSync(lighthouseBin)) {
    throw new Error('Lighthouse binary is not installed in .quality-tools.');
  }

  await runCommand(lighthouseBin, [
    `${BASE_URL}/index.html`,
    '--quiet',
    '--output=json',
    `--output-path=${reportPath}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
  ], {CHROME_PATH: chromePath});

  await runCommand(process.execPath, ['scripts/lighthouse-budget.js', reportPath]);
}

async function main() {
  fs.rmSync(ARTIFACTS_DIR, {recursive: true, force: true});
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});

  const scenarios = [
    {slug: 'home-desktop', path: '/index.html', heading: 'Руслан Немыкин', viewport: {width: 1440, height: 1000}, accessibility: true},
    {slug: 'projects-desktop', path: '/landing/projects.html', heading: 'Проекты', viewport: {width: 1440, height: 1000}, accessibility: true},
    {slug: 'resume-desktop', path: '/landing/resume.html', heading: 'Резюме', viewport: {width: 1440, height: 1000}, accessibility: true},
    {slug: 'home-mobile', path: '/index.html', heading: 'Руслан Немыкин', viewport: {width: 390, height: 844}, accessibility: false},
    {slug: 'projects-mobile', path: '/landing/projects.html', heading: 'Проекты', viewport: {width: 390, height: 844}, accessibility: false},
    {slug: 'resume-mobile', path: '/landing/resume.html', heading: 'Резюме', viewport: {width: 390, height: 844}, accessibility: false},
  ];

  const server = await startServer();
  const chromePath = findChrome();
  let browser;

  try {
    try {
      browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    } catch {
      browser = await chromium.launch({executablePath: chromePath, headless: true, args: ['--no-sandbox']});
    }

    const summary = [];
    for (const scenario of scenarios) {
      console.log(`Browser quality: ${scenario.slug}`);
      await checkScenario(browser, scenario, summary);
    }

    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'browser-summary.json'), JSON.stringify(summary, null, 2));
    await browser.close();
    browser = null;

    console.log('Running Lighthouse quality budget...');
    await runLighthouse(chromePath);
    console.log('Browser, accessibility, screenshot and Lighthouse quality checks passed.');
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
