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
  if (!(await input.evaluate((node) => document.activeElement === node))) {
    throw new Error('Command palette did not move focus to its search input.');
  }

  await input.fill('Поиск');
  const searchLink = palette.locator('a', {hasText: 'Поиск по сайту'});
  await searchLink.waitFor({state: 'visible'});
  const href = await searchLink.getAttribute('href');
  if (!href || !new URL(href, page.url()).pathname.endsWith('/_search/ru/')) {
    throw new Error(`Command palette search does not hand off to Diplodoc local search: ${href || 'missing href'}`);
  }

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.tr-command-palette')?.hidden === true);
  if (!(await trigger.evaluate((node) => document.activeElement === node))) {
    throw new Error('Command palette did not restore focus to the trigger after Escape.');
  }
}

async function checkPage(browser, baseUrl, {
  slug,
  pathname,
  heading,
  verify,
  axe = true,
  viewport = VIEWPORTS.compactDesktop,
}) {
  if (pathname.includes('/landing/')) throw new Error(`${slug}: browser smoke must use canonical public routes: ${pathname}`);

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

async function assertC3ProjectsHub(page, {locale = 'ru'} = {}) {
  if (!['ru', 'en'].includes(locale)) throw new Error(`Unsupported C3 Projects locale: ${locale}`);

  const selectedSlugs = await page.locator('[data-c3-project]').evaluateAll(
    (nodes) => nodes.map((node) => node.getAttribute('data-c3-project')),
  );
  if (JSON.stringify(selectedSlugs) !== JSON.stringify(['livingworld', 'notchhub', 'portfolio-platform'])) {
    throw new Error(`C3 selected work drifted: ${selectedSlugs.join(', ')}`);
  }

  const commercialSlugs = await page.locator('[data-c3-commercial]').evaluateAll(
    (nodes) => nodes.map((node) => node.getAttribute('data-c3-commercial')),
  );
  if (JSON.stringify(commercialSlugs) !== JSON.stringify(['marketdb'])) {
    throw new Error(`C3 commercial work drifted: ${commercialSlugs.join(', ')}`);
  }

  const labSlugs = await page.locator('[data-c3-lab]').evaluateAll(
    (nodes) => nodes.map((node) => node.getAttribute('data-c3-lab')),
  );
  const expectedLabs = ['vlezet', 'node-zero', 'taskhub', 'minichess', 'godot-horror-template'];
  if (JSON.stringify(labSlugs) !== JSON.stringify(expectedLabs)) {
    throw new Error(`C3 labs drifted: ${labSlugs.join(', ')}`);
  }
  if (selectedSlugs.includes('vlezet')) throw new Error('C3 must keep Vlezet outside the selected-work spotlight.');

  const groupsAreOrdered = await page.evaluate(() => {
    const selected = document.querySelector('[data-c3-project-group="selected"]');
    const commercial = document.querySelector('[data-c3-commercial="marketdb"]');
    const labs = document.querySelector('[data-c3-project-group="labs"]');
    if (!selected || !commercial || !labs) return false;
    return Boolean(selected.compareDocumentPosition(commercial) & Node.DOCUMENT_POSITION_FOLLOWING)
      && Boolean(commercial.compareDocumentPosition(labs) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  if (!groupsAreOrdered) throw new Error(`C3 ${locale} Projects hierarchy is not Selected → Commercial → Labs in generated DOM.`);

  for (const slug of selectedSlugs) {
    const card = page.locator(`[data-c3-project="${slug}"]`);
    const status = card.locator(`[data-project-status="${slug}"]`);
    await status.waitFor({state: 'visible'});
    if ((await status.innerText()).trim() !== expectedProjectStatus(slug)) {
      throw new Error(`${slug} C3 selected-work status drifted from Project Registry.`);
    }

    const resolvedHref = await card.locator('a').first().evaluate((node) => node.href);
    const pathname = resolvedHref ? new URL(resolvedHref).pathname : '';
    const expectedPath = locale === 'en' ? `/en/projects/${slug}/` : `/projects/${slug}/`;
    if (pathname !== expectedPath || pathname.includes('/landing/')) {
      throw new Error(`${slug} C3 ${locale} case-study route is not canonical: ${resolvedHref || 'missing href'}`);
    }
  }

  for (const slug of expectedLabs) {
    const resolvedHref = await page.locator(`[data-c3-lab="${slug}"] a`).first().evaluate((node) => node.href);
    const pathname = resolvedHref ? new URL(resolvedHref).pathname : '';
    const expectedPath = locale === 'en' && slug === 'vlezet'
      ? '/en/projects/vlezet/'
      : `/projects/${slug}/`;
    if (pathname !== expectedPath || pathname.includes('/landing/')) {
      throw new Error(`${slug} C3 ${locale} lab route is not canonical: ${resolvedHref || 'missing href'}`);
    }
  }

  const nodeZeroText = await page.locator('[data-c3-lab="node-zero"]').innerText();
  if (!/private|proprietary/i.test(nodeZeroText)) {
    throw new Error('NODE ZERO C3 lab card lost its private/proprietary boundary.');
  }
}

async function assertC3FlagshipGlance(page, slug, {expectTimeline = false} = {}) {
  const glance = page.locator(`[data-tr-project-glance="${slug}"]`);
  if (await glance.count() !== 1) throw new Error(`${slug} must expose exactly one C3 glance block.`);
  await glance.waitFor({state: 'visible'});

  const termCount = await glance.locator('dt').count();
  const definitionCount = await glance.locator('dd').count();
  if (termCount !== 5 || definitionCount !== 5) {
    throw new Error(`${slug} C3 glance must expose exactly five term/value pairs; got ${termCount}/${definitionCount}.`);
  }

  const status = glance.locator(`[data-project-status="${slug}"]`);
  await status.waitFor({state: 'visible'});
  if ((await status.innerText()).trim() !== expectedProjectStatus(slug)) {
    throw new Error(`${slug} C3 glance status drifted from Project Registry.`);
  }

  const glancePrecedesDeepDive = await page.evaluate((projectSlug) => {
    const summary = document.querySelector(`[data-tr-project-glance="${projectSlug}"]`);
    const headings = [...document.querySelectorAll('main.dc-doc-page__content h2')];
    const deepDive = headings.find((heading) => !['Коротко', 'At a glance'].includes((heading.textContent || '').trim()));
    if (!summary || !deepDive) return false;
    return Boolean(summary.compareDocumentPosition(deepDive) & Node.DOCUMENT_POSITION_FOLLOWING);
  }, slug);
  if (!glancePrecedesDeepDive) throw new Error(`${slug} C3 glance must precede the first deep-dive section.`);

  if (expectTimeline) {
    const timeline = page.locator('.tr-project-timeline').first();
    await timeline.waitFor({state: 'visible'});
    const glancePrecedesTimeline = await page.evaluate((projectSlug) => {
      const summary = document.querySelector(`[data-tr-project-glance="${projectSlug}"]`);
      const projectTimeline = document.querySelector('.tr-project-timeline');
      if (!summary || !projectTimeline) return false;
      return Boolean(summary.compareDocumentPosition(projectTimeline) & Node.DOCUMENT_POSITION_FOLLOWING);
    }, slug);
    if (!glancePrecedesTimeline) throw new Error(`${slug} C3 glance must precede the project timeline in generated DOM.`);
  }
}

async function assertPlatformCanonicalNamespace(page) {
  const codeBlocks = await page.locator('pre code').allInnerTexts();
  const canonicalBlock = codeBlocks.find((text) => text.includes('/projects/') && text.includes('/resume/') && text.includes('/notes/'));
  if (!canonicalBlock) throw new Error('TrueRuslan Landing is missing the root-level canonical route example block.');
  for (const stale of ['/landing/projects/', '/landing/resume/', '/landing/notes/']) {
    if (canonicalBlock.includes(stale)) throw new Error(`TrueRuslan Landing still presents ${stale} as a current canonical route.`);
  }
}

async function assertProjectTimeline(page, slug) {
  const timeline = page.locator('.tr-project-timeline');
  await timeline.waitFor({state: 'visible'});
  if (await timeline.locator('.tr-project-timeline__item').count() < 3) {
    throw new Error(`${slug} timeline has fewer than three milestones.`);
  }
  if (await timeline.locator('.tr-project-timeline__item--current').count() !== 1) {
    throw new Error(`${slug} timeline must expose exactly one current milestone.`);
  }
  if (await timeline.locator('.tr-project-timeline__item--next').count() < 1) {
    throw new Error(`${slug} timeline must expose a next milestone.`);
  }
}

async function assertOrderedHeadings(page, slug, orderedHeadings) {
  const headings = (await page.locator('main.dc-doc-page__content h2').allInnerTexts()).map((value) => value.trim());
  let previous = -1;
  for (const expected of orderedHeadings) {
    const index = headings.findIndex((heading, candidate) => candidate > previous && heading.includes(expected));
    if (index === -1) throw new Error(`${slug} is missing ordered section ${expected}; found ${headings.join(' | ')}`);
    previous = index;
  }
}

async function assertNormalizedCaseStudy(page, {
  slug,
  orderedHeadings,
  requiredText,
  relatedHrefFragments,
  requireTimeline = true,
  requireEvidence = true,
  requireGlance = false,
}) {
  const document = page.locator('main.dc-doc-page__content');
  await document.waitFor({state: 'visible'});

  const status = page.locator(`[data-project-status="${slug}"]`).first();
  await status.waitFor({state: 'visible'});
  const actualStatus = (await status.innerText()).trim();
  if (actualStatus !== expectedProjectStatus(slug)) {
    throw new Error(`${slug} case-study status drifted from Project Registry: ${actualStatus}`);
  }

  if (requireGlance) await assertC3FlagshipGlance(page, slug, {expectTimeline: requireTimeline});
  await assertOrderedHeadings(page, slug, orderedHeadings);
  const text = await document.innerText();
  for (const marker of requiredText) {
    if (!text.includes(marker)) throw new Error(`${slug} is missing boundary marker ${marker}.`);
  }
  for (const fragment of relatedHrefFragments) {
    await document.locator(`a[href*="${fragment}"]:visible`).first().waitFor({state: 'visible'});
  }

  if (requireTimeline) await assertProjectTimeline(page, slug);
  if (requireEvidence) await page.locator(`[data-project-evidence="${slug}"]`).waitFor({state: 'visible'});
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'home-command-palette',
      pathname: '/',
      heading: 'Руслан Немыкин',
      verify: assertCommandPalette,
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'projects-registry-status',
      pathname: '/projects/',
      heading: 'Проекты',
      verify: async (page) => {
        await assertC3ProjectsHub(page, {locale: 'ru'});
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'projects-registry-status-en',
      pathname: '/en/projects/',
      heading: 'Projects',
      verify: async (page) => {
        await assertC3ProjectsHub(page, {locale: 'en'});
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'now',
      pathname: '/now/',
      heading: 'Сейчас',
      verify: async (page) => {
        await page.locator('[data-tr-now]').waitFor({state: 'visible'});
        if (await page.locator('[data-tr-now] .tr-active-card').count() < 1) {
          throw new Error('Now page contains no registry-derived active project cards.');
        }
        const nowText = await page.locator('[data-tr-now]').innerText();
        for (const slug of ['livingworld', 'node-zero', 'portfolio-platform']) {
          if (!nowText.includes(expectedProjectStatus(slug))) {
            throw new Error(`Now page ${slug} status drifted from Project Registry.`);
          }
        }
        await assertCommandPalette(page);
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'notes',
      pathname: '/notes/',
      heading: 'Engineering Notes',
      verify: async (page, baseUrl) => {
        const feedLink = page.locator('a', {hasText: 'Подписаться на Atom feed'}).first();
        await feedLink.waitFor({state: 'visible'});
        if (await feedLink.getAttribute('href') !== 'feed.xml') {
          throw new Error('Engineering Notes feed link escaped the deployment base.');
        }
        const feedResponse = await page.request.get(`${baseUrl}/feed.xml`);
        if (!feedResponse.ok()) throw new Error(`Atom feed failed to load: HTTP ${feedResponse.status()}`);
        if (!(await feedResponse.text()).includes('<title>TrueRuslan Engineering Notes</title>')) {
          throw new Error('Atom feed identity marker is missing.');
        }
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'note-metadata',
      pathname: '/notes/server-authoritative-ai-npcs/',
      heading: 'Проектирование server-authoritative AI NPC pipeline',
      verify: async (page) => {
        await page.locator('.tr-note-meta').waitFor({state: 'visible'});
        await page.locator('.tr-note-nav').waitFor({state: 'visible'});
        const rawHref = await page.locator('.tr-note-nav a').first().getAttribute('href');
        const pathname = rawHref ? new URL(rawHref, page.url()).pathname : '';
        if (!pathname.includes('/notes/') || pathname.includes('/landing/')) {
          throw new Error(`Note navigation is not canonical/deployment-base-safe: ${rawHref || 'missing href'}`);
        }
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'normalized-livingworld',
      pathname: '/projects/livingworld/',
      heading: 'VillAIgence',
      verify: async (page) => assertNormalizedCaseStudy(page, {
        slug: 'livingworld',
        orderedHeadings: ['Проблема', 'Ограничения', 'Текущая lifecycle', 'Архитектура', 'альтернативы', 'Что подтверждено', 'Известные ограничения', 'Следующий принятый шаг', 'Связанные материалы', 'Что бы я сделал иначе'],
        requiredText: ['0.2.0+1.21.1', '7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004', 'PR #110', 'PR #123', 'PR #125', 'Draft/RED', 'SYSTEM_OBSERVED'],
        relatedHrefFragments: ['server-authoritative-ai-npcs', 'source-tests-to-installed-acceptance', 'restart-persistence-is-a-product-contract'],
        requireGlance: true,
      }),
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'normalized-vlezet',
      pathname: '/projects/vlezet/',
      heading: 'Vlezet',
      verify: async (page) => assertNormalizedCaseStudy(page, {
        slug: 'vlezet',
        orderedHeadings: ['Проблема', 'Ограничения', 'Текущая lifecycle', 'Архитектура', 'альтернативы', 'Что подтверждено', 'Известные ограничения', 'Следующий принятый шаг', 'Связанные материалы', 'Что бы я сделал иначе'],
        requiredText: ['M7.8B', 'M7.8C', 'PR #42', 'PR #44', 'PR #45', 'PR #52', 'usefulness acceptance', 'Assisted Tracing', 'ACTIVE DEVELOPMENT'],
        relatedHrefFragments: ['probabilistic-proposals-deterministic-authority', 'green-ci-is-not-product-verification'],
        requireGlance: true,
      }),
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'normalized-livingworld-en',
      pathname: '/en/projects/livingworld/',
      heading: 'VillAIgence',
      verify: async (page) => assertNormalizedCaseStudy(page, {
        slug: 'livingworld',
        orderedHeadings: ['Problem', 'Constraints', 'Current lifecycle', 'Architecture', 'Alternatives', 'Evidence boundary', 'Known limitations', 'Next accepted milestone', 'Related material', 'What I would change'],
        requiredText: ['0.2.0+1.21.1', '7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004', 'PR #110', 'PR #123', 'PR #125', 'Draft/RED', 'SYSTEM_OBSERVED'],
        relatedHrefFragments: ['server-authoritative-ai-npcs', 'llm-output-is-a-protocol-boundary', '/projects/livingworld'],
        requireTimeline: false,
        requireEvidence: false,
        requireGlance: true,
      }),
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'c3-vlezet-en',
      pathname: '/en/projects/vlezet/',
      heading: 'Vlezet',
      verify: async (page) => {
        await assertC3FlagshipGlance(page, 'vlezet');
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'c3-notchhub-ru',
      pathname: '/projects/notchhub/',
      heading: 'NotchHub',
      verify: async (page) => {
        await assertC3FlagshipGlance(page, 'notchhub', {expectTimeline: true});
      },
    });

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'c3-notchhub-en',
      pathname: '/en/projects/notchhub/',
      heading: 'NotchHub',
      verify: async (page) => {
        await assertC3FlagshipGlance(page, 'notchhub');
      },
    });

    for (const project of [
      {slug: 'node-zero', heading: 'NODE ZERO'},
      {slug: 'portfolio-platform', heading: 'TrueRuslan Landing'},
    ]) {
      await checkPage(browser, serverRuntime.baseUrl, {
        slug: `timeline-${project.slug}`,
        pathname: `/projects/${project.slug}/`,
        heading: project.heading,
        verify: async (page) => {
          await assertProjectTimeline(page, project.slug);
          if (project.slug === 'portfolio-platform') {
            await assertC3FlagshipGlance(page, 'portfolio-platform', {expectTimeline: true});
            await assertPlatformCanonicalNamespace(page);
            const evidence = page.locator('[data-project-evidence="portfolio-platform"]');
            await evidence.waitFor({state: 'visible'});
            const evidenceText = await evidence.innerText();
            for (const marker of ['Build #836', 'Pages deployment #147', 'Production Live Smoke #58']) {
              if (!evidenceText.includes(marker)) throw new Error(`Portfolio platform evidence is missing ${marker}.`);
            }
            const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
            const pathname = canonical ? new URL(canonical).pathname : '';
            if (!pathname.endsWith('/projects/portfolio-platform/') || pathname.includes('/landing/')) {
              throw new Error(`Portfolio platform canonical route is wrong: ${canonical || 'missing'}`);
            }
          }
        },
      });
    }

    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'portfolio-platform-en',
      pathname: '/en/projects/portfolio-platform/',
      heading: 'TrueRuslan Landing',
      verify: async (page) => {
        await assertC3FlagshipGlance(page, 'portfolio-platform');
        const status = page.locator('[data-project-status="portfolio-platform"]');
        await status.waitFor({state: 'visible'});
        if ((await status.innerText()).trim() !== expectedProjectStatus('portfolio-platform')) {
          throw new Error('English portfolio platform status drifted from Project Registry.');
        }
        const alternateRu = await page.locator('link[rel="alternate"][hreflang="ru"]').getAttribute('href');
        const pathname = alternateRu ? new URL(alternateRu).pathname : '';
        if (!pathname.endsWith('/projects/portfolio-platform/') || pathname.includes('/landing/')) {
          throw new Error(`English portfolio platform lacks the correct RU alternate: ${alternateRu || 'missing'}`);
        }
      },
    });

    console.log('Portfolio browser, accessibility, registry, navigation, Notes, C3 Projects/flagship summaries, timelines and platform case-study smoke passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
