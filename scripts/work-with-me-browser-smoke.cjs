const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.WORK_WITH_ME_SMOKE_PORT || 4192);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

const LOCALES = Object.freeze({
  ru: Object.freeze({
    route: '/work-with-me/',
    heading: 'Работа со мной',
    home: '/',
    workHref: 'work-with-me/',
    status: 'ограниченная доступность',
    collaborationText: 'Помогаю с backend-сервисами',
    requiredTokens: Object.freeze([
      'Backend и интеграции',
      'Обучение и наставничество',
      'Задача и рамки',
      'Оценка и работа',
      'Передача результата',
    ]),
  }),
  en: Object.freeze({
    route: '/en/work-with-me/',
    heading: 'Work with me',
    home: '/en/',
    workHref: 'en/work-with-me/',
    status: 'limited availability',
    collaborationText: 'I help with backend services',
    requiredTokens: Object.freeze([
      'Engineering',
      'Teaching & Mentoring',
      'Context',
      'Scope',
      'Estimate',
      'Implementation',
      'Handover',
    ]),
  }),
});

const ALLOWED_CONTEXTUAL = Object.freeze([
  '/projects/portfolio-platform/',
  '/projects/notchhub/',
  '/notes/deployment-success-is-not-production-verification/',
  '/notes/server-authoritative-ai-npcs/',
  '/en/projects/portfolio-platform/',
  '/en/projects/notchhub/',
  '/en/notes/server-authoritative-ai-npcs/',
]);
const FORBIDDEN_CONTEXTUAL = Object.freeze([
  '/about/',
  '/resume/',
  '/photos/',
  '/bibliography/',
  '/engineering-map/',
]);
const FORBIDDEN_LEAD_RUNTIME = /(?:hubspot|salesforce|calendly|typeform|tally\.so|forms\.gle|stripe\.com|paypal\.com)/i;

function assertNoSalesRuntime(html, label) {
  if (/<form\b/i.test(html)) throw new Error(`${label}: form is forbidden`);
  if (FORBIDDEN_LEAD_RUNTIME.test(html)) {
    throw new Error(`${label}: third-party lead/booking/payment runtime leaked into generated HTML`);
  }
  if (/(?:₽\s*\d|\$\s*\d|€\s*\d|\b(?:USD|EUR)\s*\d)/i.test(html)) {
    throw new Error(`${label}: public numeric pricing leaked into generated HTML`);
  }
}

async function assertCurrentTab(anchor, label) {
  if (await anchor.first().getAttribute('target')) throw new Error(`${label}: internal link must stay in the current tab`);
}

async function assertSingleProcessNumbering(page, locale) {
  const processItems = page.locator('.tr-work-process > li');
  if (await processItems.count() !== 3) throw new Error(`${locale}: work process must render exactly three steps`);
  const rendered = await processItems.evaluateAll((items) => items.map((item) => ({
    order: item.getAttribute('data-tr-work-order'),
    display: getComputedStyle(item).display,
    markerContent: getComputedStyle(item, '::marker').content,
  })));
  const expectedOrders = ['01', '02', '03'];
  for (const [index, item] of rendered.entries()) {
    if (item.order !== expectedOrders[index]) throw new Error(`${locale}: work process order drifted at ${index + 1}: ${item.order}`);
    if (item.display === 'list-item') {
      throw new Error(`${locale}: native ordered-list marker remains active beside ${item.order}`);
    }
    if (item.markerContent && !['none', 'normal', '""'].includes(item.markerContent)) {
      throw new Error(`${locale}: unexpected visible marker beside ${item.order}: ${item.markerContent}`);
    }
  }
}

async function assertWorkPage(browser, baseUrl, locale, {javaScriptEnabled, viewport, screenshot}) {
  const copy = LOCALES[locale];
  const runtime = await createScenarioPage(browser, {viewport, javaScriptEnabled, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl, ignoredRequestFailureReasons: ['ERR_ABORTED']});
  try {
    const response = await page.goto(`${baseUrl}${copy.route}`, {waitUntil: javaScriptEnabled ? 'networkidle' : 'load'});
    if (!response?.ok()) throw new Error(`${locale} Work with me returned HTTP ${response?.status() ?? 'none'}`);
    if (await page.locator('html').getAttribute('lang') !== locale) throw new Error(`${locale}: html lang mismatch`);
    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!heading.includes(copy.heading)) throw new Error(`${locale}: unexpected H1 ${heading}`);

    const bodyText = await page.locator('body').innerText();
    for (const token of [...copy.requiredTokens, '2026-08-08']) {
      if (!bodyText.includes(token)) throw new Error(`${locale}: missing collaboration truth ${token}`);
    }
    if (!bodyText.toLocaleLowerCase(locale).includes(copy.status.toLocaleLowerCase(locale))) {
      throw new Error(`${locale}: canonical limited availability is missing`);
    }
    await assertSingleProcessNumbering(page, locale);

    const telegram = page.locator('a[href="https://t.me/TrueRuslan"]');
    const email = page.locator('a[href="mailto:nemykin@true-ruslan.ru"]');
    if (await telegram.count() < 1 || await email.count() < 1) throw new Error(`${locale}: canonical direct handoff is missing`);
    const html = await page.content();
    assertNoSalesRuntime(html, `${locale} Work with me`);

    if (!javaScriptEnabled) {
      const fallback = page.locator(`[data-tr-work-with-me-fallback="${locale}"] [data-tr-work-with-me-semantic="true"]`);
      if (await fallback.count() !== 1) throw new Error(`${locale}: full semantic no-JS Work with me fallback is missing or duplicated`);
    }

    await assertNoHorizontalOverflow(page, `${locale} Work with me`);
    if (javaScriptEnabled) {
      await assertNoBlockingAxe({page, label: `${locale} Work with me`, AxeBuilder, artifactName: `axe-work-with-me-${locale}.json`});
    }
    await captureScreenshot(page, screenshot);
    diagnostics.assertClean(`${locale} Work with me`);
    return {locale, javaScriptEnabled, status: response.status(), heading};
  } finally {
    await runtime.close();
  }
}

async function assertHomepage(browser, baseUrl, locale) {
  const copy = LOCALES[locale];
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  try {
    const response = await page.goto(`${baseUrl}${copy.home}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${locale}: homepage unavailable`);

    if (await page.locator('[data-home-proof]').count() !== 4) throw new Error(`${locale}: C2 homepage must expose exactly four proof facts`);
    if (await page.locator('[data-home-flagship]').count() !== 3) throw new Error(`${locale}: C2 homepage must preserve exactly three selected projects`);
    for (const kind of ['experience', 'writing', 'personal']) {
      if (await page.locator(`[data-home-bridge="${kind}"]`).count() !== 1) {
        throw new Error(`${locale}: C2 homepage ${kind} bridge must render exactly once`);
      }
    }
    if (await page.locator('[data-home-collaboration="true"]').count() !== 1) throw new Error(`${locale}: homepage collaboration bridge must render exactly once`);

    const bodyText = await page.locator('body').innerText();
    if (!bodyText.includes(copy.collaborationText)) throw new Error(`${locale}: positive-first homepage collaboration copy is missing`);

    const cta = page.locator('.tr-home-collaboration__action--primary').first();
    if (await cta.count() !== 1) throw new Error(`${locale}: homepage collaboration primary action is missing`);
    const href = await cta.getAttribute('href');
    if (!href || !new URL(href, page.url()).pathname.endsWith(copy.workHref)) throw new Error(`${locale}: homepage collaboration CTA route drifted: ${href}`);
    await assertCurrentTab(cta, `${locale} homepage collaboration CTA`);

    const order = await page.evaluate(() => {
      const flagship = document.querySelector('[data-home-flagship]')?.closest('section');
      const experience = document.querySelector('[data-home-bridge="experience"]');
      const writing = document.querySelector('[data-home-bridge="writing"]');
      const collaboration = document.querySelector('[data-home-collaboration="true"]');
      const personal = document.querySelector('[data-home-bridge="personal"]');
      const nodes = [flagship, experience, writing, collaboration, personal];
      if (nodes.some((node) => !node)) return false;
      return nodes.slice(0, -1).every((node, index) =>
        Boolean(node.compareDocumentPosition(nodes[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    if (!order) throw new Error(`${locale}: C2 homepage order drifted after selected work`);

    assertNoSalesRuntime(await page.content(), `${locale} homepage`);
  } finally {
    await runtime.close();
  }
}

async function assertContacts(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark'});
  const {page} = runtime;
  try {
    const response = await page.goto(`${baseUrl}/contacts/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error('Contacts unavailable');
    const bodyText = await page.locator('body').innerText();
    if (!bodyText.includes('Основные контакты')) throw new Error('Contacts primary contact heading missing');
    if (await page.locator('[data-tr-collaboration-rendered="handoff"]').count() !== 0) throw new Error('Contacts must not render the collaboration handoff');

    const telegram = page.locator('a[href="https://t.me/TrueRuslan_Blog"]');
    const email = page.locator('a[href="mailto:nemykin@true-ruslan.ru"]');
    if (await telegram.count() < 1) throw new Error('Contacts Telegram link missing');
    if (await email.count() < 1) throw new Error('Contacts email link missing');
    if (await telegram.first().getAttribute('target') !== '_blank') throw new Error('Contacts Telegram must follow the external new-tab policy');
    const telegramRel = new Set(String(await telegram.first().getAttribute('rel') || '').split(/\s+/));
    if (!telegramRel.has('noopener') || !telegramRel.has('noreferrer')) throw new Error('Contacts Telegram lacks noopener/noreferrer');
    if (await email.first().getAttribute('target')) throw new Error('Contacts mailto must stay in the current context');

    for (const token of ['GitHub', 'Habr', 'LinkedIn']) {
      if (!bodyText.includes(token)) throw new Error(`Contacts external profile missing: ${token}`);
    }
    assertNoSalesRuntime(await page.content(), 'Contacts');
  } finally {
    await runtime.close();
  }
}

async function assertContextualBoundaries(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.compactDesktop, colorScheme: 'dark'});
  const {page} = runtime;
  try {
    for (const route of ALLOWED_CONTEXTUAL) {
      const response = await page.goto(`${baseUrl}${route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`contextual target unavailable: ${route}`);
      const cta = page.locator('[data-tr-contextual-collaboration="true"]');
      if (await cta.count() !== 1) throw new Error(`approved contextual CTA missing or duplicated: ${route}`);
      await assertCurrentTab(cta.locator('a[href]').first(), `contextual CTA ${route}`);
    }
    for (const route of FORBIDDEN_CONTEXTUAL) {
      const response = await page.goto(`${baseUrl}${route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`forbidden-surface probe unavailable: ${route}`);
      if (await page.locator('[data-tr-contextual-collaboration="true"]').count() !== 0) {
        throw new Error(`contextual CTA leaked onto forbidden surface: ${route}`);
      }
    }
    return {allowed: ALLOWED_CONTEXTUAL.length, forbidden: FORBIDDEN_CONTEXTUAL.length};
  } finally {
    await runtime.close();
  }
}

async function assertSearch(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark'});
  const {page} = runtime;
  try {
    const response = await page.goto(`${baseUrl}/_search/ru/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error('generated search unavailable');
    const input = page.locator('.tr-search-input').first();
    const button = page.locator('.tr-search-button').first();
    await input.fill('inflated public service list');
    await button.click();
    await page.waitForFunction(() => [...document.querySelectorAll('a')]
      .some((link) => (link.getAttribute('href') || '').includes('en/work-with-me/')), null, {timeout: 7000});
    const result = page.locator('a[href*="en/work-with-me/"]').first();
    if (await result.count() < 1) throw new Error('generated search does not expose English Work with me');

    const popupPromise = page.waitForEvent('popup', {timeout: 1500}).catch(() => null);
    const navigationPromise = page.waitForURL((url) => url.pathname.endsWith('/en/work-with-me/'), {timeout: 7000})
      .then(() => true)
      .catch(() => false);
    await result.click();
    const [popup, navigated] = await Promise.all([popupPromise, navigationPromise]);
    if (popup) {
      await popup.close();
      throw new Error('generated internal search result opened a new tab');
    }
    if (!navigated) throw new Error(`generated internal search result did not navigate current tab: ${page.url()}`);

    return {query: 'inflated public service list', found: true, navigatedInCurrentTab: true};
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
    const scenarios = [];
    for (const locale of ['ru', 'en']) {
      scenarios.push(await assertWorkPage(browser, serverRuntime.baseUrl, locale, {
        javaScriptEnabled: true,
        viewport: VIEWPORTS.desktop,
        screenshot: `work-with-me-${locale}-desktop.png`,
      }));
      scenarios.push(await assertWorkPage(browser, serverRuntime.baseUrl, locale, {
        javaScriptEnabled: false,
        viewport: VIEWPORTS.mobile,
        screenshot: `work-with-me-${locale}-no-js-mobile.png`,
      }));
      await assertHomepage(browser, serverRuntime.baseUrl, locale);
    }
    await assertContacts(browser, serverRuntime.baseUrl);
    const contextual = await assertContextualBoundaries(browser, serverRuntime.baseUrl);
    const search = await assertSearch(browser, serverRuntime.baseUrl);
    writeJsonArtifact('work-with-me-summary.json', {checkedAt: new Date().toISOString(), scenarios, contextual, search});
    console.log('Work with me browser/no-JS/search/a11y smoke passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
