const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {APEX} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Production Yandex Metrica pre-consent smoke');

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const CONSENT_KEY = 'tr_privacy_consent_v1';
const YANDEX_HOST_PATTERN = /(^|\.)mc\.yandex\.(ru|com)$/i;
const METRICA_COOKIE_PATTERN = /^_ym_|^yandexuid$|^ymex$|^is_gdpr/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeSummary(summary) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'production-yandex-metrica-consent-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
}

async function verifyFreshRoute(browser, route, expectedCopy) {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 900},
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const yandexRequests = [];
  const pageErrors = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (YANDEX_HOST_PATTERN.test(url.hostname)) yandexRequests.push(url.href);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(new URL(route, APEX).href, {waitUntil: 'networkidle', timeout: 45000});
    assert(response?.ok(), `${route}: HTTP ${response?.status() ?? 'none'}`);

    const controller = page.locator('script[data-tr-analytics="yandex-metrica-consent"]');
    assert(await controller.count() === 1, `${route}: expected exactly one Yandex Metrica consent controller`);
    const counterId = await controller.getAttribute('data-tr-metrica-counter');
    assert(/^[1-9][0-9]*$/.test(counterId || ''), `${route}: missing positive counter binding`);

    const state = await page.evaluate(({id, consentKey}) => ({
      consent: localStorage.getItem(consentKey),
      disabled: window[`disableYaCounter${id}`],
      providerScriptCount: document.querySelectorAll('script[data-tr-metrica-provider="yandex-metrica"]').length,
      promptVisible: Boolean(document.querySelector('[data-tr-metrica-consent-dialog]:not([hidden])')),
      settingsVisible: Boolean(document.querySelector('[data-tr-metrica-settings]:not([hidden])')),
      promptText: document.querySelector('[data-tr-metrica-consent-dialog]')?.textContent || '',
    }), {id: counterId, consentKey: CONSENT_KEY});

    assert(yandexRequests.length === 0, `${route}: expected zero Yandex provider requests before consent, got ${yandexRequests.length}`);
    assert(state.consent === null, `${route}: fresh context unexpectedly contains stored consent`);
    assert(state.disabled === true, `${route}: disableYaCounter flag must be true before consent`);
    assert(state.providerScriptCount === 0, `${route}: provider script exists before consent`);
    assert(state.promptVisible === true, `${route}: consent prompt must be visible in a fresh context`);
    assert(state.settingsVisible === false, `${route}: settings control must stay hidden while initial prompt is visible`);
    assert(expectedCopy.test(state.promptText), `${route}: unexpected localized consent copy`);

    const cookies = await context.cookies();
    const providerCookies = cookies.filter(({name}) => METRICA_COOKIE_PATTERN.test(name));
    assert(providerCookies.length === 0, `${route}: provider cookies exist before consent: ${providerCookies.map(({name}) => name).join(', ')}`);
    assert(pageErrors.length === 0, `${route}: page errors: ${pageErrors.join(' | ')}`);

    return {
      route,
      status: response.status(),
      controllerCount: 1,
      providerRequestsBeforeConsent: 0,
      providerScriptsBeforeConsent: 0,
      providerCookiesBeforeConsent: 0,
      disableFlagActive: true,
      freshConsentPreference: true,
      localizedCopy: true,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    provider: 'yandex-metrica',
    consentWasNotGrantedByAutomation: true,
    routes: [],
  };
  let browser;

  try {
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    summary.routes.push(await verifyFreshRoute(browser, '/', /Cookies для статистики\?[\s\S]*Не разрешать[\s\S]*Разрешить/i));
    summary.routes.push(await verifyFreshRoute(browser, '/en/', /Analytics cookies\?[\s\S]*Refuse[\s\S]*Allow/i));
    writeSummary(summary);
    console.log(`Production Yandex Metrica pre-consent smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}: zero Yandex requests before consent.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeSummary(summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
