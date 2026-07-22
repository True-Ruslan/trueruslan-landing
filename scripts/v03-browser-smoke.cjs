const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.V03_QUALITY_PORT || 4178);
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
  for (const command of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
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
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function assertNoHorizontalOverflow(page, label) {
  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
  }));
  if (layout.documentWidth > layout.viewportWidth + 2) {
    throw new Error(`${label} has horizontal overflow: ${layout.documentWidth}px > ${layout.viewportWidth}px`);
  }
}

async function assertNoBlockingAxe(page, label) {
  const axe = await new AxeBuilder({page}).analyze();
  const blocking = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, `axe-v03-${label}.json`),
    JSON.stringify({violations: axe.violations}, null, 2),
  );
  if (blocking.length) {
    const details = blocking.map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`).join('; ');
    throw new Error(`${label} has blocking accessibility violations: ${details}`);
  }
}

async function assertCommandPalette(page) {
  const trigger = page.locator('.tr-command-trigger').first();
  await trigger.waitFor({state: 'visible'});
  await trigger.focus();
  await page.keyboard.press('Control+K');

  const palette = page.locator('.tr-command-palette');
  await palette.waitFor({state: 'visible'});
  const input = palette.locator('[data-tr-command-input]');
  const inputFocused = await input.evaluate((node) => document.activeElement === node);
  if (!inputFocused) throw new Error('Command palette did not move focus to its search input.');

  await input.fill('Поиск');
  const searchLink = palette.locator('a', {hasText: 'Поиск по сайту'});
  await searchLink.waitFor({state: 'visible'});
  const href = await searchLink.getAttribute('href');
  if (!href || !new URL(href, page.url()).pathname.endsWith('/_search/ru/index.html')) {
    throw new Error(`Command palette search does not hand off to Diplodoc local search: ${href || 'missing href'}`);
  }

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.tr-command-palette')?.hidden === true);
  const focusRestored = await trigger.evaluate((node) => document.activeElement === node);
  if (!focusRestored) throw new Error('Command palette did not restore focus to the trigger after Escape.');
}

async function checkPage(browser, {
  slug,
  pathname,
  heading,
  verify,
  axe = true,
  viewport = {width: 1280, height: 900},
}) {
  const context = await browser.newContext({viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`${BASE_URL}${pathname}`, {waitUntil: 'networkidle'});
    if (!response || !response.ok()) throw new Error(`${slug} failed to load: HTTP ${response?.status() ?? 'none'}`);
    const actualHeading = (await page.locator('h1').first().innerText()).trim();
    if (!actualHeading.includes(heading)) throw new Error(`${slug} unexpected h1: ${actualHeading}`);
    await assertNoHorizontalOverflow(page, slug);
    if (verify) await verify(page);
    if (axe) await assertNoBlockingAxe(page, slug);
    if (pageErrors.length) throw new Error(`${slug} browser errors: ${pageErrors.join('; ')}`);
    fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
    await page.screenshot({path: path.join(ARTIFACTS_DIR, `v03-${slug}.png`), fullPage: true, animations: 'disabled'});
  } finally {
    await context.close();
  }
}

async function main() {
  const server = await startServer();
  let browser;
  try {
    const chromePath = findChrome();
    try {
      browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    } catch {
      browser = await chromium.launch({executablePath: chromePath, headless: true, args: ['--no-sandbox']});
    }

    await checkPage(browser, {
      slug: 'home-command-palette',
      pathname: '/index.html',
      heading: 'Руслан Немыкин',
      verify: assertCommandPalette,
    });

    await checkPage(browser, {
      slug: 'projects-registry-status',
      pathname: '/landing/projects.html',
      heading: 'Проекты',
      verify: async (page) => {
        const livingWorldStatus = page.locator('[data-project-status="livingworld"]');
        const nodeZeroStatus = page.locator('[data-project-status="node-zero"]');
        await livingWorldStatus.waitFor({state: 'visible'});
        await nodeZeroStatus.waitFor({state: 'visible'});
        if ((await livingWorldStatus.innerText()).trim() !== 'RELEASE CANDIDATE') {
          throw new Error('LivingWorld status on Projects hub drifted from Project Registry.');
        }
        if ((await nodeZeroStatus.innerText()).trim() !== 'PRE-PRODUCTION') {
          throw new Error('NODE ZERO status on Projects hub drifted from Project Registry.');
        }
      },
    });

    await checkPage(browser, {
      slug: 'now',
      pathname: '/landing/now.html',
      heading: 'Сейчас',
      verify: async (page) => {
        await page.locator('[data-tr-now]').waitFor({state: 'visible'});
        const activeCards = await page.locator('[data-tr-now] .tr-active-card').count();
        if (activeCards < 1) throw new Error('Now page contains no registry-derived active project cards.');
        const nowText = await page.locator('[data-tr-now]').innerText();
        if (!nowText.includes('RELEASE CANDIDATE') || !nowText.includes('PRE-PRODUCTION')) {
          throw new Error('Now page project statuses drifted from Project Registry.');
        }
        await assertCommandPalette(page);
      },
    });

    await checkPage(browser, {
      slug: 'notes',
      pathname: '/landing/notes.html',
      heading: 'Engineering Notes',
      verify: async (page) => {
        const feedLink = page.locator('a', {hasText: 'Подписаться на Atom feed'}).first();
        await feedLink.waitFor({state: 'visible'});
        const rawHref = await feedLink.getAttribute('href');
        if (rawHref !== 'feed.xml') {
          throw new Error(`Engineering Notes feed link must stay inside deployment base: ${rawHref || 'missing href'}`);
        }
        const feedResponse = await page.request.get(`${BASE_URL}/feed.xml`);
        if (!feedResponse.ok()) throw new Error(`Atom feed failed to load: HTTP ${feedResponse.status()}`);
        const feedBody = await feedResponse.text();
        if (!feedBody.includes('<title>TrueRuslan Engineering Notes</title>')) {
          throw new Error('Atom feed identity marker is missing.');
        }
      },
    });

    await checkPage(browser, {
      slug: 'note-metadata',
      pathname: '/landing/notes/server-authoritative-ai-npcs.html',
      heading: 'Проектирование server-authoritative AI NPC pipeline',
      verify: async (page) => {
        await page.locator('.tr-note-meta').waitFor({state: 'visible'});
        await page.locator('.tr-note-nav').waitFor({state: 'visible'});
        const relatedLink = page.locator('.tr-note-nav a').first();
        const rawHref = await relatedLink.getAttribute('href');
        if (!rawHref || !rawHref.startsWith('landing/notes/')) {
          throw new Error(`Note navigation is not deployment-base-safe: ${rawHref || 'missing href'}`);
        }
      },
    });

    for (const project of [
      {slug: 'livingworld', heading: 'LivingWorld'},
      {slug: 'node-zero', heading: 'NODE ZERO'},
    ]) {
      await checkPage(browser, {
        slug: `timeline-${project.slug}`,
        pathname: `/landing/projects/${project.slug}.html`,
        heading: project.heading,
        verify: async (page) => {
          const timeline = page.locator('.tr-project-timeline');
          await timeline.waitFor({state: 'visible'});
          const milestones = await timeline.locator('.tr-project-timeline__item').count();
          if (milestones < 3) throw new Error(`${project.slug} timeline has fewer than three milestones.`);
          if (await timeline.locator('.tr-project-timeline__item--current').count() !== 1) {
            throw new Error(`${project.slug} timeline must expose exactly one current milestone.`);
          }
          if (await timeline.locator('.tr-project-timeline__item--next').count() < 1) {
            throw new Error(`${project.slug} timeline must expose a next milestone.`);
          }
        },
      });
    }

    console.log('Portfolio v0.3 browser, accessibility, registry, navigation, notes and timeline smoke passed.');
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
