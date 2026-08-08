const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow} = require('./quality-harness/assertions.cjs');
const {writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {OUTPUT_DIR} = require('./quality-harness/paths.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const {chromium} = requireQualityTool('playwright', 'Yandex Metrica consent smoke tool');

const FAKE_COUNTER_ID = '987654321';
const CONSENT_KEY = 'tr_privacy_consent_v1';
const PROVIDER_SRC = 'https://mc.yandex.ru/metrika/tag.js';

function listHtmlFiles(root) {
  const files = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
    }
  };
  visit(root);
  return files.sort();
}

function assertDefaultBuildIsMetricaFree() {
  const files = listHtmlFiles(OUTPUT_DIR);
  if (!files.length) throw new Error('Metrica smoke found no generated HTML files.');
  const contaminated = files.filter((file) => fs.readFileSync(file, 'utf8').includes('data-tr-analytics="yandex-metrica-consent"'));
  if (contaminated.length) {
    throw new Error(`PR build unexpectedly contains Metrica controllers: ${contaminated.map((file) => path.relative(OUTPUT_DIR, file)).join(', ')}`);
  }
  return files.length;
}

async function installYandexInterception(context, intercepted) {
  await context.route('https://mc.yandex.ru/**', async (route) => {
    intercepted.push(route.request().url());
    await route.fulfill({status: 200, contentType: 'application/javascript', body: ''});
  });
  await context.route('https://mc.yandex.com/**', async (route) => {
    intercepted.push(route.request().url());
    await route.fulfill({status: 200, contentType: 'application/javascript', body: ''});
  });
}

async function state(page) {
  return page.evaluate(({counterId, consentKey}) => {
    const prompt = document.querySelector('[data-tr-metrica-consent-dialog]');
    const grant = document.querySelector('button[data-tr-consent="granted"]');
    const deny = document.querySelector('button[data-tr-consent="denied"]');
    const rect = prompt?.getBoundingClientRect();
    const visual = (node) => {
      if (!node) return null;
      const style = getComputedStyle(node);
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        opacity: style.opacity,
      };
    };
    return {
      choice: localStorage.getItem(consentKey),
      disabled: window[`disableYaCounter${counterId}`],
      providerScripts: Array.from(document.querySelectorAll('script[data-tr-metrica-provider="yandex-metrica"]')).map((node) => node.src),
      promptVisible: Boolean(prompt && !prompt.hidden),
      settingsVisible: Boolean(document.querySelector('[data-tr-metrica-settings]:not([hidden])')),
      promptText: prompt?.innerText ?? '',
      grantText: grant?.textContent ?? '',
      denyText: deny?.textContent ?? '',
      grantVisual: visual(grant),
      denyVisual: visual(deny),
      promptWidth: rect ? Math.round(rect.width) : 0,
      promptHeight: rect ? Math.round(rect.height) : 0,
      ymCalls: typeof window.ym === 'function' && Array.isArray(window.ym.a)
        ? window.ym.a.map((args) => Array.from(args))
        : [],
    };
  }, {counterId: FAKE_COUNTER_ID, consentKey: CONSENT_KEY});
}

async function assertNoMetricaCookies(context, label) {
  const cookies = await context.cookies();
  const metricaCookies = cookies.filter((cookie) => /^_ym_|^yandexuid$|^ymex$|^is_gdpr/i.test(cookie.name));
  if (metricaCookies.length) throw new Error(`${label}: Yandex Metrica cookies exist before provider consent: ${metricaCookies.map(({name}) => name).join(', ')}`);
  return metricaCookies.length;
}

async function assertLifecycle(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {
    viewport: VIEWPORTS.mobile,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {context, page} = runtime;
  const diagnostics = installPageDiagnostics(page, {baseUrl});
  const intercepted = [];

  try {
    await installYandexInterception(context, intercepted);
    const response = await page.goto(`${baseUrl}/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Metrica consent route HTTP ${response?.status() ?? 'none'}`);

    let current = await state(page);
    if (intercepted.length !== 0) throw new Error(`before consent: expected zero Yandex requests, got ${intercepted.length}`);
    if (current.choice !== null || current.disabled !== true || !current.promptVisible || current.providerScripts.length !== 0) {
      throw new Error(`before consent: unexpected state ${JSON.stringify(current)}`);
    }
    if (!current.promptText.includes('Cookies для статистики?') || current.grantText !== 'Разрешить' || current.denyText !== 'Не разрешать') {
      throw new Error(`before consent: compact RU copy is wrong ${JSON.stringify(current)}`);
    }
    if (JSON.stringify(current.grantVisual) !== JSON.stringify(current.denyVisual)) {
      throw new Error(`before consent: grant and refusal must have equivalent visual weight ${JSON.stringify(current)}`);
    }
    if (current.promptWidth > 520 || current.promptHeight > 64) {
      throw new Error(`before consent: prompt is not compact enough ${JSON.stringify({width: current.promptWidth, height: current.promptHeight})}`);
    }
    await assertNoMetricaCookies(context, 'before consent');
    await assertNoHorizontalOverflow(page, 'metrica-consent:initial-mobile');

    await page.locator('button[data-tr-consent="denied"]').click();
    current = await state(page);
    if (intercepted.length !== 0) throw new Error(`after denial: expected zero Yandex requests, got ${intercepted.length}`);
    if (current.choice !== 'denied' || current.disabled !== true || current.promptVisible || !current.settingsVisible) {
      throw new Error(`after denial: unexpected state ${JSON.stringify(current)}`);
    }
    await assertNoMetricaCookies(context, 'after denial');

    await page.reload({waitUntil: 'networkidle'});
    current = await state(page);
    if (intercepted.length !== 0 || current.choice !== 'denied' || current.disabled !== true || current.providerScripts.length !== 0) {
      throw new Error(`after denial reload: provider must remain disabled ${JSON.stringify(current)}`);
    }

    await page.locator('[data-tr-metrica-settings]').click();
    await page.locator('button[data-tr-consent="granted"]').click();
    await page.waitForFunction(() => document.querySelectorAll('script[data-tr-metrica-provider="yandex-metrica"]').length === 1);
    current = await state(page);
    if (intercepted.length !== 1 || intercepted[0] !== PROVIDER_SRC) {
      throw new Error(`after grant: expected exactly one ${PROVIDER_SRC} request, got ${JSON.stringify(intercepted)}`);
    }
    if (current.choice !== 'granted' || current.disabled !== false || current.providerScripts[0] !== PROVIDER_SRC) {
      throw new Error(`after grant: unexpected state ${JSON.stringify(current)}`);
    }
    const initCall = current.ymCalls.find((call) => call[0] === Number(FAKE_COUNTER_ID) && call[1] === 'init');
    if (!initCall) throw new Error(`after grant: missing bounded ym init call ${JSON.stringify(current.ymCalls)}`);
    const options = initCall[2] || {};
    const expectedOptions = {
      clickmap: false,
      trackLinks: false,
      accurateTrackBounce: false,
      webvisor: false,
      trackHash: false,
      sendTitle: false,
    };
    if (JSON.stringify(options) !== JSON.stringify(expectedOptions)) {
      throw new Error(`after grant: init options escaped privacy contract ${JSON.stringify(options)}`);
    }

    const requestsAtWithdrawal = intercepted.length;
    await page.locator('[data-tr-metrica-settings]').click();
    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle', timeout: 5000}),
      page.locator('button[data-tr-consent="denied"]').click(),
    ]);
    current = await state(page);
    if (intercepted.length !== requestsAtWithdrawal) {
      throw new Error(`withdraw reload: expected zero new Yandex requests, got ${intercepted.length - requestsAtWithdrawal}`);
    }
    if (current.disabled !== true || current.choice !== 'denied' || current.providerScripts.length !== 0) {
      throw new Error(`withdraw reload: provider must restart disabled before initialization ${JSON.stringify(current)}`);
    }
    diagnostics.assertClean('metrica-consent:lifecycle');

    return {
      beforeConsentRequests: 0,
      afterDenialRequests: 0,
      grantRequests: 1,
      equivalentChoices: true,
      withdrawalForcesReload: true,
      withdrawalAddsRequests: 0,
      boundedInit: true,
      persistedPreference: 'denied',
      compactPrompt: true,
    };
  } finally {
    await runtime.close();
  }
}

async function assertEnglishCopy(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.desktop, colorScheme: 'dark'});
  const {page} = runtime;
  try {
    const response = await page.goto(`${baseUrl}/en/`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`Metrica EN route HTTP ${response?.status() ?? 'none'}`);
    const current = await state(page);
    if (!current.promptText.includes('Analytics cookies?') || current.grantText !== 'Allow' || current.denyText !== 'Refuse') {
      throw new Error(`English compact consent copy is wrong: ${JSON.stringify(current)}`);
    }
    if (/Yandex/.test(current.promptText)) {
      throw new Error(`English visible consent copy exposes provider detail: ${current.promptText}`);
    }
    if (JSON.stringify(current.grantVisual) !== JSON.stringify(current.denyVisual)) {
      throw new Error(`English grant and refusal must have equivalent visual weight ${JSON.stringify(current)}`);
    }
    return {localized: true, purposeSpecific: true, equivalentChoices: true};
  } finally {
    await runtime.close();
  }
}

async function main() {
  const tokenlessHtmlCount = assertDefaultBuildIsMetricaFree();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-browser-'));
  const fixtureDir = path.join(tempRoot, 'docs-html');
  let serverRuntime;
  let browser;

  try {
    fs.cpSync(OUTPUT_DIR, fixtureDir, {recursive: true});
    const {applyConsentGatedMetrica, loadMetricaBrowserPolicy} = await import('./yandex-metrica-browser.js');
    const policy = loadMetricaBrowserPolicy();
    const injection = applyConsentGatedMetrica(fixtureDir, policy, FAKE_COUNTER_ID);
    if (!injection.enabled || injection.updated.length === 0) throw new Error('Fake Metrica fixture was not injected.');

    serverRuntime = await startStaticServer({port: 0, outputDir: fixtureDir});
    browser = await launchChromium(chromium);

    const lifecycle = await assertLifecycle(browser, serverRuntime.baseUrl);
    const english = await assertEnglishCopy(browser, serverRuntime.baseUrl);
    const summary = {
      provider: policy.provider,
      fakeCounterOnly: true,
      tokenlessHtmlCount,
      injectedHtmlCount: injection.updated.length,
      lifecycle,
      english,
    };
    writeJsonArtifact('yandex-metrica-browser-summary.json', summary);
    console.log(`Yandex Metrica consent browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    if (serverRuntime) await serverRuntime.stop();
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
