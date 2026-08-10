import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve(import.meta.dirname, 'v03-browser-smoke.cjs');
let source = fs.readFileSync(filePath, 'utf8');

const helperAnchor = 'async function assertProjectTimeline(page, slug) {';
if (!source.includes(helperAnchor)) throw new Error('v03 helper anchor not found');
if (source.includes('async function assertC3ProjectsHub(')) throw new Error('C3 browser helpers already exist');

const helpers = String.raw`async function assertC3ProjectsHub(page) {
  const selectedSlugs = await page.locator('[data-c3-project]').evaluateAll(
    (nodes) => nodes.map((node) => node.getAttribute('data-c3-project')),
  );
  if (JSON.stringify(selectedSlugs) !== JSON.stringify(['livingworld', 'notchhub', 'portfolio-platform'])) {
    throw new Error(\`C3 selected work drifted: \${selectedSlugs.join(', ')}\`);
  }

  const commercialSlugs = await page.locator('[data-c3-commercial]').evaluateAll(
    (nodes) => nodes.map((node) => node.getAttribute('data-c3-commercial')),
  );
  if (JSON.stringify(commercialSlugs) !== JSON.stringify(['marketdb'])) {
    throw new Error(\`C3 commercial work drifted: \${commercialSlugs.join(', ')}\`);
  }

  const labSlugs = await page.locator('[data-c3-lab]').evaluateAll(
    (nodes) => nodes.map((node) => node.getAttribute('data-c3-lab')),
  );
  const expectedLabs = ['vlezet', 'node-zero', 'taskhub', 'minichess', 'godot-horror-template'];
  if (JSON.stringify(labSlugs) !== JSON.stringify(expectedLabs)) {
    throw new Error(\`C3 labs drifted: \${labSlugs.join(', ')}\`);
  }
  if (selectedSlugs.includes('vlezet')) throw new Error('C3 must keep Vlezet outside the selected-work spotlight.');

  for (const slug of selectedSlugs) {
    const status = page.locator(\`[data-c3-project="\${slug}"] [data-project-status="\${slug}"]\`);
    await status.waitFor({state: 'visible'});
    if ((await status.innerText()).trim() !== expectedProjectStatus(slug)) {
      throw new Error(\`\${slug} C3 selected-work status drifted from Project Registry.\`);
    }
  }

  const nodeZeroText = await page.locator('[data-c3-lab="node-zero"]').innerText();
  if (!/private|proprietary/i.test(nodeZeroText)) {
    throw new Error('NODE ZERO C3 lab card lost its private/proprietary boundary.');
  }

  const href = await page.locator('a[href*="projects/portfolio-platform"]').first().getAttribute('href');
  const pathname = href ? new URL(href, page.url()).pathname : '';
  if (!pathname.endsWith('/projects/portfolio-platform/') || pathname.includes('/landing/')) {
    throw new Error(\`Projects hub does not expose canonical portfolio platform route: \${href || 'missing'}\`);
  }
}

async function assertC3FlagshipGlance(page, slug, {expectTimeline = false} = {}) {
  const glance = page.locator(\`[data-tr-project-glance="\${slug}"]\`);
  if (await glance.count() !== 1) throw new Error(\`\${slug} must expose exactly one C3 glance block.\`);
  await glance.waitFor({state: 'visible'});

  const termCount = await glance.locator('dt').count();
  const definitionCount = await glance.locator('dd').count();
  if (termCount !== 5 || definitionCount !== 5) {
    throw new Error(\`\${slug} C3 glance must expose exactly five term/value pairs; got \${termCount}/\${definitionCount}.\`);
  }

  const status = glance.locator(\`[data-project-status="\${slug}"]\`);
  await status.waitFor({state: 'visible'});
  if ((await status.innerText()).trim() !== expectedProjectStatus(slug)) {
    throw new Error(\`\${slug} C3 glance status drifted from Project Registry.\`);
  }

  if (expectTimeline) {
    const timeline = page.locator('.tr-project-timeline').first();
    await timeline.waitFor({state: 'visible'});
    const glancePrecedesTimeline = await page.evaluate((projectSlug) => {
      const summary = document.querySelector(\`[data-tr-project-glance="\${projectSlug}"]\`);
      const projectTimeline = document.querySelector('.tr-project-timeline');
      if (!summary || !projectTimeline) return false;
      return Boolean(summary.compareDocumentPosition(projectTimeline) & Node.DOCUMENT_POSITION_FOLLOWING);
    }, slug);
    if (!glancePrecedesTimeline) throw new Error(\`\${slug} C3 glance must precede the project timeline in generated DOM.\`);
  }
}

`;
source = source.replace(helperAnchor, `${helpers}${helperAnchor}`);

const oldProjectsCheck = String.raw`    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'projects-registry-status',
      pathname: '/projects/',
      heading: 'Проекты',
      verify: async (page) => {
        for (const slug of ['livingworld', 'notchhub', 'node-zero', 'portfolio-platform']) {
          const status = page.locator(\`[data-project-status="\${slug}"]\`);
          await status.waitFor({state: 'visible'});
          if ((await status.innerText()).trim() !== expectedProjectStatus(slug)) {
            throw new Error(\`\${slug} status on Projects hub drifted from Project Registry.\`);
          }
        }
        const href = await page.locator('a[href*="projects/portfolio-platform"]').first().getAttribute('href');
        const pathname = href ? new URL(href, page.url()).pathname : '';
        if (!pathname.endsWith('/projects/portfolio-platform/') || pathname.includes('/landing/')) {
          throw new Error(\`Projects hub does not expose canonical portfolio platform route: \${href || 'missing'}\`);
        }
      },
    });
`;
if (!source.includes(oldProjectsCheck)) throw new Error('Existing Projects browser check anchor not found');

const newProjectsAndGlanceChecks = String.raw`    await checkPage(browser, serverRuntime.baseUrl, {
      slug: 'projects-registry-status',
      pathname: '/projects/',
      heading: 'Проекты',
      verify: async (page) => {
        await assertC3ProjectsHub(page);
      },
    });

    const c3FlagshipChecks = [
      {
        slug: 'c3-livingworld-ru', pathname: '/projects/livingworld/', heading: 'VillAIgence',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'livingworld', {expectTimeline: true}); },
      },
      {
        slug: 'c3-livingworld-en', pathname: '/en/projects/livingworld/', heading: 'VillAIgence',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'livingworld'); },
      },
      {
        slug: 'c3-notchhub-ru', pathname: '/projects/notchhub/', heading: 'NotchHub',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'notchhub', {expectTimeline: true}); },
      },
      {
        slug: 'c3-notchhub-en', pathname: '/en/projects/notchhub/', heading: 'NotchHub',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'notchhub'); },
      },
      {
        slug: 'c3-portfolio-platform-ru', pathname: '/projects/portfolio-platform/', heading: 'TrueRuslan Landing',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'portfolio-platform', {expectTimeline: true}); },
      },
      {
        slug: 'c3-portfolio-platform-en', pathname: '/en/projects/portfolio-platform/', heading: 'TrueRuslan Landing',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'portfolio-platform'); },
      },
      {
        slug: 'c3-vlezet-ru', pathname: '/projects/vlezet/', heading: 'Vlezet',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'vlezet', {expectTimeline: true}); },
      },
      {
        slug: 'c3-vlezet-en', pathname: '/en/projects/vlezet/', heading: 'Vlezet',
        verify: async (page) => { await assertC3FlagshipGlance(page, 'vlezet'); },
      },
    ];
    for (const check of c3FlagshipChecks) {
      await checkPage(browser, serverRuntime.baseUrl, {...check, axe: false});
    }
`;
source = source.replace(oldProjectsCheck, newProjectsAndGlanceChecks);

fs.writeFileSync(filePath, source, 'utf8');
console.log('Added C3 Projects hub and flagship glance generated-DOM acceptance to v03 browser smoke.');
