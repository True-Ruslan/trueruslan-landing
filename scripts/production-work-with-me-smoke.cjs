const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  WORK_WITH_ME_URL,
  WORK_WITH_ME_EN_URL,
  CONTACTS_URL,
  SEARCH_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Work with me production smoke');
const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const CANONICAL = JSON.parse(fs.readFileSync(path.resolve('data/collaboration.json'), 'utf8'));
const FORBIDDEN_LEAD_RUNTIME = /(?:hubspot|salesforce|calendly|typeform|tally\.so|forms\.gle|stripe\.com|paypal\.com)/i;
const NO_JS_REQUIRED_TOKENS = Object.freeze({
  ru: Object.freeze([
    'Backend и интеграции',
    'Обучение и наставничество',
    'Задача и рамки',
    'Оценка и работа',
    'Передача результата',
  ]),
  en: Object.freeze([
    'Engineering',
    'Teaching & Mentoring',
    'Context',
    'Scope',
    'Estimate',
    'Implementation',
    'Handover',
  ]),
});

const CONTEXTUAL_ALLOWED = [
  'projects/portfolio-platform/',
  'projects/notchhub/',
  'notes/deployment-success-is-not-production-verification/',
  'notes/server-authoritative-ai-npcs/',
  'en/projects/portfolio-platform/',
  'en/projects/notchhub/',
  'en/notes/server-authoritative-ai-npcs/',
];
const CONTEXTUAL_FORBIDDEN = [
  'about/',
  'resume/',
  'photos/',
  'bibliography/',
  'engineering-map/',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeJson(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assertNoSalesRuntime(html, label) {
  assert(!/<form\b/i.test(html), `${label}: form leaked into production`);
  assert(!FORBIDDEN_LEAD_RUNTIME.test(html), `${label}: third-party lead/booking/payment runtime leaked into production`);
  assert(!/(?:₽\s*\d|\$\s*\d|€\s*\d|\b(?:USD|EUR)\s*\d)/i.test(html), `${label}: public numeric pricing leaked into production`);
}

async function assertSeoPair(page, url, otherLocaleUrl, locale) {
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  const ru = await page.locator('link[rel="alternate"][hreflang="ru"]').getAttribute('href');
  const en = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
  assert(canonical && new URL(canonical).href === new URL(url).href, `${locale}: canonical drifted: ${canonical}`);
  if (locale === 'ru') {
    assert(ru && new URL(ru).href === new URL(url).href, `RU alternate drifted: ${ru}`);
    assert(en && new URL(en).href === new URL(otherLocaleUrl).href, `EN alternate drifted: ${en}`);
  } else {
    assert(en && new URL(en).href === new URL(url).href, `EN alternate drifted: ${en}`);
    assert(ru && new URL(ru).href === new URL(otherLocaleUrl).href, `RU alternate drifted: ${ru}`);
  }
  return {canonical, ru, en};
}

async function verifyWorkPage(page, url, locale) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${locale} Work with me HTTP ${response?.status() ?? 'none'}`);
  assert(await page.locator('html').getAttribute('lang') === locale, `${locale}: html lang mismatch`);
  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(locale === 'ru' ? heading.includes('Работа со мной') : heading.includes('Work with me'), `${locale}: unexpected H1 ${heading}`);

  const availability = page.locator('[data-tr-collaboration-rendered="availability"]');
  assert(await availability.count() >= 1, `${locale}: canonical availability missing`);
  const availabilityText = await availability.first().innerText();
  assert(availabilityText.includes('2026-08-08'), `${locale}: canonical updated date missing`);
  assert(await page.locator('[data-status="limited"]').count() >= 2, `${locale}: limited states missing`);
  assert(await page.locator('a[href="https://t.me/TrueRuslan"]').count() >= 1, `${locale}: canonical Telegram missing`);
  assert(await page.locator('a[href="mailto:nemykin@true-ruslan.ru"]').count() >= 1, `${locale}: canonical email missing`);
  assertNoSalesRuntime(await page.content(), `${locale} Work with me`);

  const seo = await assertSeoPair(page, url, locale === 'ru' ? WORK_WITH_ME_EN_URL : WORK_WITH_ME_URL, locale);
  await page.screenshot({path: path.join(ARTIFACTS_DIR, `work-with-me-production-${locale}.png`), fullPage: true});
  return {status: response.status(), heading, seo};
}

async function verifyNoJavaScript(browser, url, locale) {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}, colorScheme: 'dark'});
  const page = await context.newPage();
  try {
    const response = await page.goto(url, {waitUntil: 'load', timeout: 45000});
    assert(response?.ok(), `${locale} Work with me no-JS HTTP ${response?.status() ?? 'none'}`);
    const body = await page.locator('body').innerText();
    for (const token of [...NO_JS_REQUIRED_TOKENS[locale], '2026-08-08']) {
      assert(body.includes(token), `${locale} no-JS missing ${token}`);
    }
    assert(await page.locator('a[href="https://t.me/TrueRuslan"]').count() >= 1, `${locale} no-JS Telegram missing`);
    assert(await page.locator('a[href="mailto:nemykin@true-ruslan.ru"]').count() >= 1, `${locale} no-JS email missing`);
    assertNoSalesRuntime(await page.content(), `${locale} Work with me no-JS`);
    return {status: response.status(), semanticFallback: true};
  } finally {
    await context.close();
  }
}

async function verifyHomepage(page, url, locale) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${locale} homepage HTTP ${response?.status() ?? 'none'}`);

  assert(await page.locator('[data-home-proof]').count() === 4, `${locale}: C2 homepage must expose exactly four proof facts`);
  assert(await page.locator('[data-home-flagship]').count() === 3, `${locale}: C2 homepage must preserve exactly three selected projects`);
  for (const kind of ['experience', 'writing', 'personal']) {
    assert(
      await page.locator(`[data-home-bridge="${kind}"]`).count() === 1,
      `${locale}: C2 homepage ${kind} bridge missing/duplicated`,
    );
  }
  assert(await page.locator('[data-home-collaboration="true"]').count() === 1, `${locale}: collaboration bridge missing/duplicated`);

  const bodyText = await page.locator('body').innerText();
  const positiveFirstCopy = locale === 'ru' ? 'Помогаю с backend-сервисами' : 'I help with backend services';
  assert(bodyText.includes(positiveFirstCopy), `${locale}: positive-first homepage collaboration copy is missing`);

  const primaryNavItems = await page.locator('.tr-site-nav > a').allInnerTexts();
  assert(primaryNavItems.length === 5, `${locale}: C2 primary navigation must contain exactly five semantic destinations`);
  if (locale === 'ru') {
    assert(!primaryNavItems.includes('Контакты'), 'ru: Contacts must remain outside primary navigation');
    assert(await page.locator('footer a[href*="contacts"]').count() >= 1, 'ru: secondary Contacts destination missing from footer');
  }

  const internalCta = page.locator('.tr-home-collaboration__action--primary').first();
  assert(await internalCta.count() === 1, `${locale}: homepage collaboration primary CTA missing`);
  assert(!(await internalCta.getAttribute('target')), `${locale}: internal homepage CTA must stay in current tab`);

  const ordering = await page.evaluate(() => {
    const selectedWork = document.querySelector('[data-home-flagship]')?.closest('section');
    const experience = document.querySelector('[data-home-bridge="experience"]');
    const writing = document.querySelector('[data-home-bridge="writing"]');
    const collaboration = document.querySelector('[data-home-collaboration="true"]');
    const personal = document.querySelector('[data-home-bridge="personal"]');
    const nodes = [selectedWork, experience, writing, collaboration, personal];
    if (nodes.some((node) => !node)) return false;
    return nodes.slice(0, -1).every((node, index) =>
      Boolean(node.compareDocumentPosition(nodes[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  assert(ordering, `${locale}: C2 homepage order drifted after selected work`);

  assertNoSalesRuntime(await page.content(), `${locale} homepage`);
  return {
    status: response.status(),
    proofFacts: 4,
    selectedProjects: 3,
    primaryNavigationItems: primaryNavItems.length,
    collaborationBridge: true,
  };
}

async function verifyContacts(page) {
  const response = await page.goto(CONTACTS_URL, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `Contacts HTTP ${response?.status() ?? 'none'}`);
  const bodyText = await page.locator('body').innerText();
  assert(bodyText.includes('Основные контакты'), 'Contacts primary contact heading missing');
  assert(await page.locator('[data-tr-collaboration-rendered="handoff"]').count() === 0, 'Contacts must not render the collaboration handoff');

  const telegram = page.locator('a[href="https://t.me/TrueRuslan_Blog"]');
  const email = page.locator('a[href="mailto:nemykin@true-ruslan.ru"]');
  assert(await telegram.count() >= 1, 'Contacts Telegram missing');
  assert(await email.count() >= 1, 'Contacts email missing');
  assert(await telegram.first().getAttribute('target') === '_blank', 'Contacts Telegram must follow the external new-tab policy');
  const telegramRel = new Set(String(await telegram.first().getAttribute('rel') || '').split(/\s+/).filter(Boolean));
  assert(telegramRel.has('noopener') && telegramRel.has('noreferrer'), 'Contacts Telegram lacks noopener/noreferrer');
  assert(!(await email.first().getAttribute('target')), 'Contacts mailto must stay in the current context');
  for (const token of ['GitHub', 'Habr', 'LinkedIn']) {
    assert(bodyText.includes(token), `Contacts external profile missing: ${token}`);
  }
  assertNoSalesRuntime(await page.content(), 'Contacts');
  return {status: response.status(), handoff: false, telegram: true, email: true};
}

async function verifyContextual(page) {
  for (const route of CONTEXTUAL_ALLOWED) {
    const response = await page.goto(new URL(route, APEX).href, {waitUntil: 'networkidle', timeout: 45000});
    assert(response?.ok(), `approved contextual route HTTP failure: ${route}`);
    const cta = page.locator('[data-tr-contextual-collaboration="true"]');
    assert(await cta.count() === 1, `approved contextual CTA missing/duplicated: ${route}`);
    const anchor = cta.locator('a[href]').first();
    assert(!(await anchor.getAttribute('target')), `approved contextual CTA must stay in current tab: ${route}`);
  }
  for (const route of CONTEXTUAL_FORBIDDEN) {
    const response = await page.goto(new URL(route, APEX).href, {waitUntil: 'networkidle', timeout: 45000});
    assert(response?.ok(), `forbidden contextual route probe HTTP failure: ${route}`);
    assert(await page.locator('[data-tr-contextual-collaboration="true"]').count() === 0, `contextual CTA leaked: ${route}`);
  }
  return {allowed: CONTEXTUAL_ALLOWED.length, forbidden: CONTEXTUAL_FORBIDDEN.length};
}

async function verifySearch(page) {
  const response = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `search HTTP ${response?.status() ?? 'none'}`);
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  await input.fill('inflated public service list');
  await button.click();
  await page.waitForFunction(() => [...document.querySelectorAll('a')]
    .some((link) => (link.getAttribute('href') || '').includes('en/work-with-me/')), null, {timeout: 10000});
  const result = page.locator('a[href*="en/work-with-me/"]').first();
  assert(await result.count() >= 1, 'generated search does not expose English Work with me');

  const popupPromise = page.waitForEvent('popup', {timeout: 1500}).catch(() => null);
  const navigationPromise = page.waitForURL((url) => url.pathname.endsWith('/en/work-with-me/'), {timeout: 10000})
    .then(() => true)
    .catch(() => false);
  await result.click();
  const [popup, navigated] = await Promise.all([popupPromise, navigationPromise]);
  if (popup) {
    await popup.close();
    throw new Error('generated internal search result opened a new tab');
  }
  assert(navigated, `generated internal search result did not navigate current tab: ${page.url()}`);
  return {query: 'inflated public service list', found: true, navigatedInCurrentTab: true};
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  assert(EXPECTED_DEPLOYED_SHA !== 'unknown', 'EXPECTED_DEPLOYED_SHA is required for production acceptance');
  assert(CANONICAL.availability.engineering === 'limited' && CANONICAL.availability.education === 'limited', 'canonical availability fixture drifted');

  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    rendered: {},
    noJavaScript: {},
    homepage: {},
    contacts: null,
    contextual: null,
    search: null,
    diagnostics: {pageErrors: [], firstPartyRequestFailures: []},
  };

  try {
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}, colorScheme: 'dark', reducedMotion: 'reduce'});
    const page = await context.newPage();
    page.on('pageerror', (error) => summary.diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown';
      if (failure.includes('ERR_ABORTED')) return;
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'trueruslan.ru' || hostname === 'www.trueruslan.ru') summary.diagnostics.firstPartyRequestFailures.push({url: request.url(), failure});
    });

    summary.rendered.ru = await verifyWorkPage(page, WORK_WITH_ME_URL, 'ru');
    summary.rendered.en = await verifyWorkPage(page, WORK_WITH_ME_EN_URL, 'en');
    summary.noJavaScript.ru = await verifyNoJavaScript(browser, WORK_WITH_ME_URL, 'ru');
    summary.noJavaScript.en = await verifyNoJavaScript(browser, WORK_WITH_ME_EN_URL, 'en');
    summary.homepage.ru = await verifyHomepage(page, APEX, 'ru');
    summary.homepage.en = await verifyHomepage(page, new URL('en/', APEX).href, 'en');
    summary.contacts = await verifyContacts(page);
    summary.contextual = await verifyContextual(page);
    summary.search = await verifySearch(page);
    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(summary.diagnostics.firstPartyRequestFailures.length === 0, `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`);
    await context.close();

    writeJson('work-with-me-production-summary.json', summary);
    console.log(`Work with me production smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('work-with-me-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});