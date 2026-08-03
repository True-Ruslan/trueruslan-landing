const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {captureScreenshot} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.V03_QUALITY_PORT || 4178);
const {chromium} = requireQualityTool('playwright');
const AxeBuilder = requireQualityTool('@axe-core/playwright').default;
const PROJECTS = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'projects.json'), 'utf8'));

function expectedProjectStatus(slug) {
  const project = PROJECTS.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Project Registry is missing ${slug}.`);
  return project.statusLabel;
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

async function checkPage(browser, baseUrl, {
  slug,
  pathname,
  heading,
  verify,
  axe = true,
  viewport = VIEWPORTS.compactDesktop,
}) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    captureRequestFailures: false,
    captureHttpErrors: false,
  });

  try {
    const response = await page.goto(`${baseUrl}${pathname}`, {waitUntil: 'networkidle'});
    if (!response || !response.ok()) throw new Error(`${slug} failed to load: HTTP ${response?.status() ?? 'none'}`);
    const actualHeading = (await page.locator('h1').first().innerText()).trim();
    if (!actualHeading.includes(heading)) throw new Error(`${slug} unexpected h1: ${actualHeading}`);
    await assertNoHorizontalOverflow(page, slug);
    if (verify) await verify(page, baseUrl);
    if (axe) {
      await assertNoBlockingAxe({
        page,
        label: slug,
        AxeBuilder,
        artifactName: `axe-v03-${slug}.json`,
      });
    }
    diagnostics.assertClean(slug);
    await captureScreenshot(page, `v03-${slug}.png`);
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'home-command-palette',
      pathname: '/index.html',
      heading: 'Руслан Немыкин',
      verify: assertCommandPalette,
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'projects-registry-status',
      pathname: '/landing/projects.html',
      heading: 'Проекты',
      verify: async (page) => {
        const villaigenceStatus = page.locator('[data-project-status="livingworld"]');
        const nodeZeroStatus = page.locator('[data-project-status="node-zero"]');
        await villaigenceStatus.waitFor({state: 'visible'});
        await nodeZeroStatus.waitFor({state: 'visible'});
        if ((await villaigenceStatus.innerText()).trim() !== expectedProjectStatus('livingworld')) {
          throw new Error('VillAIgence status on Projects hub drifted from Project Registry.');
        }
        if ((await nodeZeroStatus.innerText()).trim() !== expectedProjectStatus('node-zero')) {
          throw new Error('NODE ZERO status on Projects hub drifted from Project Registry.');
        }
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'now',
      pathname: '/landing/now.html',
      heading: 'Сейчас',
      verify: async (page) => {
        await page.locator('[data-tr-now]').waitFor({state: 'visible'});
        const activeCards = await page.locator('[data-tr-now] .tr-active-card').count();
        if (activeCards < 1) throw new Error('Now page contains no registry-derived active project cards.');
        const nowText = await page.locator('[data-tr-now]').innerText();
        for (const slug of ['livingworld', 'node-zero']) {
          if (!nowText.includes(expectedProjectStatus(slug))) {
            throw new Error(`Now page ${slug} status drifted from Project Registry.`);
          }
        }
        await assertCommandPalette(page);
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'notes',
      pathname: '/landing/notes.html',
      heading: 'Engineering Notes',
      verify: async (page, baseUrl) => {
        const feedLink = page.locator('a', {hasText: 'Подписаться на Atom feed'}).first();
        await feedLink.waitFor({state: 'visible'});
        const rawHref = await feedLink.getAttribute('href');
        if (rawHref !== 'feed.xml') {
          throw new Error(`Engineering Notes feed link must stay inside deployment base: ${rawHref || 'missing href'}`);
        }
        const feedResponse = await page.request.get(`${baseUrl}/feed.xml`);
        if (!feedResponse.ok()) throw new Error(`Atom feed failed to load: HTTP ${feedResponse.status()}`);
        const feedBody = await feedResponse.text();
        if (!feedBody.includes('<title>TrueRuslan Engineering Notes</title>')) {
          throw new Error('Atom feed identity marker is missing.');
        }
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
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
      {slug: 'livingworld', heading: 'VillAIgence'},
      {slug: 'node-zero', heading: 'NODE ZERO'},
    ]) {
      await checkPage(browser, serverRuntime.baseUrl, {
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
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
