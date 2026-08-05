const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.I18N_SMOKE_PORT || 4191);
const SITE_PATH = '/trueruslan-landing';
const {chromium} = requireQualityTool('playwright', 'Minimal RU EN smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Minimal RU EN smoke tool');

const PAIRS = [
  {id: 'home', ru: '/', en: '/en/'},
  {id: 'about', ru: '/landing/about/', en: '/en/about/'},
  {id: 'resume', ru: '/landing/resume/', en: '/en/resume/'},
  {id: 'projects', ru: '/landing/projects/', en: '/en/projects/'},
  {id: 'livingworld', ru: '/landing/projects/livingworld/', en: '/en/projects/livingworld/'},
  {id: 'note-ai-npcs', ru: '/landing/notes/server-authoritative-ai-npcs/', en: '/en/notes/server-authoritative-ai-npcs/'},
  {id: 'note-llm-protocol-boundary', ru: '/landing/notes/llm-output-is-a-protocol-boundary/', en: '/en/notes/llm-output-is-a-protocol-boundary/'},
];

const EXTERNALS = Object.freeze({
  github: 'https://github.com/True-Ruslan',
  habr: 'https://habr.com/ru/users/TrueRuslan/',
  telegram: 'https://t.me/TrueRuslan_Blog',
});

function publicPath(pathname) {
  if (pathname === '/') return `${SITE_PATH}/`;
  return `${SITE_PATH}${pathname}`;
}

function formatAxeViolations(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  }));
}

async function assertSeoPair(page, pair, locale, label) {
  const ownPath = locale === 'en' ? pair.en : pair.ru;
  const canonical = page.locator('link[rel="canonical"]');
  if (await canonical.count() !== 1) throw new Error(`${label}: expected exactly one canonical`);
  const canonicalHref = await canonical.getAttribute('href');
  if (new URL(canonicalHref).pathname !== publicPath(ownPath)) {
    throw new Error(`${label}: self canonical mismatch: ${canonicalHref}`);
  }

  for (const hreflang of ['ru', 'en', 'x-default']) {
    const alternate = page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (await alternate.count() !== 1) throw new Error(`${label}: expected one hreflang=${hreflang}`);
    const href = await alternate.getAttribute('href');
    const expectedPath = hreflang === 'en' ? pair.en : pair.ru;
    if (new URL(href).pathname !== publicPath(expectedPath)) {
      throw new Error(`${label}: hreflang=${hreflang} mismatch: ${href}`);
    }
  }

  const metadata = await page.locator('html').evaluate((html) => ({
    locale: html.dataset.trI18nLocale,
    ru: html.dataset.trI18nRu,
    en: html.dataset.trI18nEn,
  }));
  if (metadata.locale !== locale) throw new Error(`${label}: metadata locale mismatch`);
  if (new URL(metadata.ru).pathname !== publicPath(pair.ru)) throw new Error(`${label}: metadata RU mismatch`);
  if (new URL(metadata.en).pathname !== publicPath(pair.en)) throw new Error(`${label}: metadata EN mismatch`);
}

async function assertHeaderUtilities(page, pair, locale, label) {
  const group = page.locator('[data-tr-header-utilities]').first();
  await group.waitFor({state: 'visible'});
  const order = await group.evaluate((element) => [...element.children].map((child) => (
    child.getAttribute('data-tr-utility') || (child.hasAttribute('data-tr-language') ? 'language' : 'unknown')
  )));
  if (order.join(',') !== 'github,habr,telegram,search,language') {
    throw new Error(`${label}: utility order mismatch: ${order.join(',')}`);
  }

  for (const [kind, expected] of Object.entries(EXTERNALS)) {
    const anchor = group.locator(`[data-tr-utility="${kind}"]`);
    if (await anchor.count() !== 1) throw new Error(`${label}: expected one ${kind} link`);
    const href = await anchor.getAttribute('href');
    const actual = new URL(href);
    const target = new URL(expected);
    if (actual.hostname !== target.hostname || actual.pathname.replace(/\/$/, '') !== target.pathname.replace(/\/$/, '')) {
      throw new Error(`${label}: ${kind} URL mismatch: ${href}`);
    }
    if (await anchor.getAttribute('target') !== '_blank') throw new Error(`${label}: ${kind} target mismatch`);
    const rel = (await anchor.getAttribute('rel') || '').split(/\s+/);
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) throw new Error(`${label}: ${kind} rel mismatch`);
  }

  const search = group.locator('[data-tr-utility="search"]');
  if (await search.count() !== 1) throw new Error(`${label}: expected one search utility`);
  if (!(await search.getAttribute('href'))?.includes('_search/ru/')) throw new Error(`${label}: search route mismatch`);
  const expectedSearchLabel = locale === 'en' ? 'Search the site' : 'Поиск по сайту';
  if (await search.getAttribute('aria-label') !== expectedSearchLabel) throw new Error(`${label}: search label mismatch`);

  const language = group.locator('[data-tr-language="true"]');
  if (await language.count() !== 1) throw new Error(`${label}: expected one language control`);
  const current = await language.locator('.tr-language-current').textContent();
  if (current?.trim() !== locale.toUpperCase()) throw new Error(`${label}: current language mismatch: ${current}`);
  for (const code of ['ru', 'en']) {
    const href = await language.locator(`a[hreflang="${code}"]`).getAttribute('href');
    const expectedPath = publicPath(pair[code]);
    if (new URL(href).pathname !== expectedPath) throw new Error(`${label}: ${code} language target mismatch: ${href}`);
  }

  if (await page.locator('[data-tr-language-switcher]').count()) throw new Error(`${label}: legacy floating language switch remains`);
  const fixedLanguage = await language.evaluate((node) => getComputedStyle(node).position === 'fixed');
  if (fixedLanguage) throw new Error(`${label}: language control remains fixed/floating`);
  return {order, locale};
}

async function assertEnglishRoutes(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl});
  const results = {};

  try {
    for (const pair of PAIRS) {
      const response = await page.goto(`${baseUrl}${pair.en}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`${pair.id}: English route HTTP ${response?.status() ?? 'none'}`);
      const lang = await page.locator('html').getAttribute('lang');
      if (lang !== 'en') throw new Error(`${pair.id}: expected html lang=en, got ${lang}`);
      if (await page.locator('h1').count() !== 1) throw new Error(`${pair.id}: expected exactly one H1`);
      await assertSeoPair(page, pair, 'en', `en:${pair.id}`);
      const header = await assertHeaderUtilities(page, pair, 'en', `en:${pair.id}`);
      diagnostics.assertClean(`en:${pair.id}`);
      results[pair.id] = {status: response.status(), lang, seoPair: true, header};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function assertNoJsMetadata(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce', javaScriptEnabled: false});
  const {page} = runtime;
  const results = {};

  try {
    for (const pair of PAIRS) {
      for (const locale of ['en', 'ru']) {
        const route = locale === 'en' ? pair.en : pair.ru;
        const response = await page.goto(`${baseUrl}${route}`, {waitUntil: 'load'});
        if (!response?.ok()) throw new Error(`${pair.id}: no-js ${locale} route failed`);
        if (await page.locator('html').getAttribute('lang') !== locale) throw new Error(`${pair.id}: no-js lang mismatch`);
        await assertSeoPair(page, pair, locale, `${locale}-nojs:${pair.id}`);
      }
      if (pair.id === 'home') {
        const language = page.locator('[data-tr-language="true"]');
        if (await language.count() !== 1) throw new Error('home: no-js language links missing');
        if (await language.locator('a[hreflang="ru"]').count() !== 1 || await language.locator('a[hreflang="en"]').count() !== 1) {
          throw new Error('home: no-js language pair incomplete');
        }
      }
      results[pair.id] = {noJavaScript: true, seoPair: true};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function assertLanguageKeyboard(page) {
  const trigger = page.locator('[data-tr-language-trigger]');
  await trigger.focus();
  await trigger.press('ArrowDown');
  const details = page.locator('[data-tr-language="true"]');
  if (!await details.evaluate((node) => node.open)) throw new Error('language keyboard: menu did not open');
  if (await trigger.getAttribute('aria-expanded') !== 'true') throw new Error('language keyboard: aria-expanded not true');
  const focusedLang = await page.evaluate(() => document.activeElement?.getAttribute('hreflang'));
  if (focusedLang !== 'ru') throw new Error(`language keyboard: expected RU focus, got ${focusedLang}`);
  await page.keyboard.press('End');
  if (await page.evaluate(() => document.activeElement?.getAttribute('hreflang')) !== 'en') {
    throw new Error('language keyboard: End did not focus English');
  }
  await page.keyboard.press('Escape');
  if (await details.evaluate((node) => node.open)) throw new Error('language keyboard: Escape did not close menu');
  if (!await trigger.evaluate((node) => node === document.activeElement)) throw new Error('language keyboard: focus not restored');
}

async function assertQuality(browser, baseUrl) {
  const scenarios = [
    {name: 'home-desktop', route: '/en/', viewport: VIEWPORTS.desktop},
    {name: 'livingworld-mobile', route: '/en/projects/livingworld/', viewport: VIEWPORTS.mobile},
  ];
  const results = {};

  for (const scenario of scenarios) {
    const runtime = await createScenarioPage(browser, {viewport: scenario.viewport, colorScheme: 'dark', reducedMotion: 'reduce'});
    const {page} = runtime;
    const diagnostics = installPageDiagnostics(page, {baseUrl});
    try {
      const response = await page.goto(`${baseUrl}${scenario.route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`${scenario.name}: HTTP ${response?.status() ?? 'none'}`);
      if (scenario.name === 'home-desktop') await assertLanguageKeyboard(page);
      const overflow = (await assertNoHorizontalOverflow(page, `i18n:${scenario.name}`)).overflow;
      const axe = await new AxeBuilder({page}).analyze();
      const serious = blockingAxeViolations(axe);
      if (serious.length) {
        throw new Error(`${scenario.name}: Axe serious/critical violations: ${JSON.stringify(formatAxeViolations(serious))}`);
      }
      diagnostics.assertClean(`i18n:${scenario.name}`);
      await captureScreenshot(page, `i18n-${scenario.name}.png`);
      results[scenario.name] = {overflow, seriousAxeViolations: serious.length};
    } finally {
      await runtime.close();
    }
  }
  return results;
}

async function assertSingleSearch(page, baseUrl) {
  let response = await page.goto(`${baseUrl}/_search/ru/`, {waitUntil: 'networkidle'});
  if (!response?.ok()) throw new Error(`single search route HTTP ${response?.status() ?? 'none'}`);

  response = await page.goto(`${baseUrl}/_search/en/`, {waitUntil: 'load'});
  if (response?.ok()) throw new Error('unexpected second site-wide search index exists at _search/en/');

  const homeResponse = await page.goto(`${baseUrl}/en/`, {waitUntil: 'networkidle'});
  if (!homeResponse?.ok()) throw new Error('English home unavailable for search-link assertion');
  const searchHref = await page.locator('[data-tr-utility="search"]').getAttribute('href');
  if (!searchHref?.includes('_search/ru/')) throw new Error(`English UI does not point to the single RU search index: ${searchHref}`);
  return {route: '/_search/ru/', englishSearchAbsent: true, englishUiHref: searchHref};
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const searchRuntime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce'});
    let search;
    try {
      search = await assertSingleSearch(searchRuntime.page, serverRuntime.baseUrl);
    } finally {
      await searchRuntime.close();
    }

    const summary = {
      routes: await assertEnglishRoutes(browser, serverRuntime.baseUrl),
      pairs: await assertNoJsMetadata(browser, serverRuntime.baseUrl),
      quality: await assertQuality(browser, serverRuntime.baseUrl),
      search,
    };
    writeJsonArtifact('i18n-browser-summary.json', summary);
    console.log(`Minimal RU EN browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
