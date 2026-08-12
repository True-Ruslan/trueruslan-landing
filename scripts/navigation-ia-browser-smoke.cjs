const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.NAVIGATION_IA_SMOKE_PORT || 4194);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

const ROOT_LINKS = Object.freeze([
  ['Проекты', '/projects/'],
  ['Опыт', '/resume/'],
  ['Материалы', '/materials/'],
  ['Работа со мной', '/work-with-me/'],
  ['Обо мне', '/about/'],
]);
const MATERIAL_LINKS = Object.freeze([
  ['Публикации', '/publications/'],
  ['Engineering Map', '/engineering-map/'],
  ['Engineering Notes', '/notes/'],
  ['Источники', '/bibliography/'],
]);
const ABOUT_LINKS = Object.freeze([
  ['Сейчас', '/now/'],
  ['Фото', '/photos/'],
  ['Контакты', '/contacts/'],
]);

async function resolvedPathname(link) {
  return link.evaluate((node) => new URL(node.href).pathname);
}

async function findSidebar(page) {
  const candidates = page.locator('aside, nav');
  const count = await candidates.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = candidates.nth(index);
    const hrefs = await candidate.locator('a').evaluateAll(
      (nodes) => nodes.map((node) => node.href),
    ).catch(() => []);
    const paths = new Set(hrefs.map((href) => new URL(href).pathname));
    const ownsPrimary = ROOT_LINKS.every(([, route]) => paths.has(route));
    const ownsExpandedProjectBranch = paths.has('/projects/livingworld/');
    if (ownsPrimary && ownsExpandedProjectBranch) return candidate;
  }
  throw new Error('Could not locate the generated Diplodoc sidebar by primary and active-branch route ownership.');
}

async function linkByCanonicalPath(container, pathname, {name} = {}) {
  const links = container.locator('a');
  const count = await links.count();
  for (let index = 0; index < count; index += 1) {
    const link = links.nth(index);
    if (name) {
      const text = (await link.innerText().catch(() => '')).trim();
      if (text !== name) continue;
    }
    if (await resolvedPathname(link) === pathname) return link;
  }
  throw new Error(`Sidebar is missing ${name || pathname} → ${pathname}.`);
}

async function assertRootOrder(sidebar) {
  const positions = [];
  for (const [label, pathname] of ROOT_LINKS) {
    const link = await linkByCanonicalPath(sidebar, pathname);
    const text = (await link.innerText()).trim();
    if (!text.includes(label)) {
      throw new Error(`Sidebar route ${pathname} has unexpected label: ${text}`);
    }
    positions.push(await link.evaluate((node) => {
      let position = 0;
      const walker = document.createTreeWalker(node.ownerDocument, NodeFilter.SHOW_ELEMENT);
      let current;
      while ((current = walker.nextNode())) {
        position += 1;
        if (current === node) return position;
      }
      return Number.MAX_SAFE_INTEGER;
    }));
  }
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index] <= positions[index - 1]) {
      throw new Error(`Sidebar root order drifted: ${ROOT_LINKS.map(([label]) => label).join(' → ')}`);
    }
  }

  const links = sidebar.locator('a');
  for (let index = 0; index < await links.count(); index += 1) {
    const link = links.nth(index);
    const text = (await link.innerText().catch(() => '')).trim();
    if (text === 'English' && await link.isVisible()) {
      throw new Error('English must not be a visible sidebar root.');
    }
  }
}

async function keyboardExpandGroup(sidebar, page, label, pathname) {
  const link = await linkByCanonicalPath(sidebar, pathname);
  const text = (await link.innerText()).trim();
  if (!text.includes(label)) {
    throw new Error(`Sidebar group ${pathname} has unexpected label: ${text}`);
  }

  const markerPart = pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  const marker = `nav-ia-${markerPart}`;
  const state = await link.evaluate((node, dataMarker) => {
    const item = node.closest('li') || node.parentElement;
    if (!item) return {control: false, expanded: null};
    const controls = [...item.querySelectorAll('button, [role="button"], summary')];
    const control = controls.find((candidate) => {
      if (candidate === node) return false;
      const style = getComputedStyle(candidate);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (!control) return {control: false, expanded: null};
    control.setAttribute('data-navigation-ia-disclosure', dataMarker);
    const details = control.tagName === 'SUMMARY' ? control.closest('details') : null;
    return {
      control: true,
      expanded: control.getAttribute('aria-expanded') ?? (details ? String(details.open) : null),
    };
  }, marker);

  if (!state.control || state.expanded === 'true') return {label, pathname, usedKeyboard: false};

  const control = page.locator(`[data-navigation-ia-disclosure="${marker}"]`).first();
  if (await control.count() !== 1) throw new Error(`Disclosure marker vanished for ${label}.`);
  await control.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(75);

  const expanded = await control.evaluate((node) => {
    if (node.tagName === 'SUMMARY') return Boolean(node.closest('details')?.open);
    return node.getAttribute('aria-expanded') !== 'false';
  });
  if (!expanded) throw new Error(`${label} disclosure did not expand from keyboard activation.`);
  return {label, pathname, usedKeyboard: true};
}

async function assertDiscoverableLinks(sidebar, page, pairs, groupLabel, groupPathname) {
  const disclosure = await keyboardExpandGroup(sidebar, page, groupLabel, groupPathname);
  for (const [label, pathname] of pairs) {
    const link = await linkByCanonicalPath(sidebar, pathname, {name: label});
    if (!(await link.isVisible())) {
      throw new Error(`${label} is not discoverable after expanding ${groupLabel}.`);
    }
  }
  return disclosure;
}

async function assertMaterialsPage(browser, baseUrl, viewport, suffix) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl, ignoredRequestFailureReasons: ['ERR_ABORTED']});
  try {
    const response = await page.goto(`${baseUrl}/materials/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Materials returned HTTP ${response?.status() ?? 'none'}`);
    if (await page.locator('h1').count() !== 1) throw new Error('Materials must expose exactly one H1.');
    if ((await page.locator('h1').first().innerText()).trim() !== 'Материалы') throw new Error('Materials H1 drifted.');

    const main = page.locator('main').first();
    for (const [label, pathname] of MATERIAL_LINKS) {
      const link = main.getByRole('link', {name: label, exact: true}).first();
      if (await link.count() !== 1) throw new Error(`Materials hub is missing ${label}.`);
      const href = await link.getAttribute('href');
      const resolved = await resolvedPathname(link);
      if (resolved !== pathname) {
        throw new Error(`Materials ${label} route is not canonical: ${href || 'missing href'} resolved to ${resolved}`);
      }
    }

    await assertNoHorizontalOverflow(page, `Materials ${suffix}`);
    if (suffix === 'desktop') {
      await assertNoBlockingAxe({page, label: 'Materials', AxeBuilder, artifactName: 'axe-navigation-ia-materials.json'});
    }
    diagnostics.assertClean(`Materials ${suffix}`);
    await captureScreenshot(page, `navigation-ia-materials-${suffix}.png`);
    return {viewport: suffix, status: response.status()};
  } finally {
    await runtime.close();
  }
}

async function assertSidebarAndLanguage(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl, ignoredRequestFailureReasons: ['ERR_ABORTED']});
  try {
    const response = await page.goto(`${baseUrl}/projects/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Projects returned HTTP ${response?.status() ?? 'none'}`);
    const sidebar = await findSidebar(page);
    await assertRootOrder(sidebar);

    const materialsDisclosure = await assertDiscoverableLinks(sidebar, page, MATERIAL_LINKS, 'Материалы', '/materials/');
    const notesDisclosure = await keyboardExpandGroup(sidebar, page, 'Engineering Notes', '/notes/');
    const allNotes = await linkByCanonicalPath(sidebar, '/notes/', {name: 'Все заметки'});
    if (!(await allNotes.isVisible())) {
      throw new Error('Все заметки is not discoverable under Engineering Notes.');
    }
    const aboutDisclosure = await assertDiscoverableLinks(sidebar, page, ABOUT_LINKS, 'Обо мне', '/about/');

    const language = page.locator('[data-tr-language="true"]').first();
    if (await language.count() !== 1) throw new Error('Generated header lost the canonical language utility.');
    const trigger = language.locator('[data-tr-language-trigger]').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const english = language.locator('a[hreflang="en"]').first();
    await english.waitFor({state: 'visible'});
    const englishHref = await english.getAttribute('href');
    const englishPath = await resolvedPathname(english);
    const expectedEnglishPath = await page.locator('html').evaluate((html) => {
      if (!html.dataset.trI18nEn) return null;
      return new URL(html.dataset.trI18nEn).pathname;
    });
    if (!expectedEnglishPath || englishPath !== expectedEnglishPath || !englishPath.endsWith('/en/projects/')) {
      throw new Error(
        `Projects language counterpart drifted: ${englishHref || 'missing href'} resolved to ${englishPath}; expected ${expectedEnglishPath || 'missing i18n metadata'}`,
      );
    }

    await assertNoHorizontalOverflow(page, 'Projects navigation IA');
    await assertNoBlockingAxe({page, label: 'Projects navigation IA', AxeBuilder, artifactName: 'axe-navigation-ia-projects.json'});
    diagnostics.assertClean('Projects navigation IA');
    await captureScreenshot(page, 'navigation-ia-sidebar-desktop.png');
    return {materialsDisclosure, notesDisclosure, aboutDisclosure, englishPath};
  } finally {
    await runtime.close();
  }
}

async function assertEnglishDirectRoute(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.mobile, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl, ignoredRequestFailureReasons: ['ERR_ABORTED']});
  try {
    const response = await page.goto(`${baseUrl}/en/projects/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`English Projects returned HTTP ${response?.status() ?? 'none'}`);
    if (await page.locator('html').getAttribute('lang') !== 'en') throw new Error('English Projects lost lang=en.');
    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!/projects/i.test(heading)) throw new Error(`Unexpected English Projects H1: ${heading}`);
    await assertNoHorizontalOverflow(page, 'English Projects mobile');
    diagnostics.assertClean('English Projects mobile');
    return {status: response.status(), heading};
  } finally {
    await runtime.close();
  }
}

async function main() {
  ensureArtifactsDir();
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const materials = [
      await assertMaterialsPage(browser, serverRuntime.baseUrl, VIEWPORTS.desktop, 'desktop'),
      await assertMaterialsPage(browser, serverRuntime.baseUrl, VIEWPORTS.mobile, 'mobile'),
    ];
    const navigation = await assertSidebarAndLanguage(browser, serverRuntime.baseUrl);
    const english = await assertEnglishDirectRoute(browser, serverRuntime.baseUrl);
    writeJsonArtifact('navigation-ia-summary.json', {
      checkedAt: new Date().toISOString(),
      materials,
      navigation,
      english,
    });
    console.log('Navigation IA browser/a11y/i18n smoke passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
