const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {SEARCH_URL, DEPLOYMENT_VERIFICATION_NOTE_URL} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'AI public SEARCH production acceptance');

const PRODUCTION_ORIGIN = 'https://trueruslan.ru';
const QUERY_ID = 'ru-paraphrase-production-proof';
const QUERY = 'Как проверяется сайт после успешного деплоя?';
const EXPECTED_PATH = new URL(DEPLOYMENT_VERIFICATION_NOTE_URL).pathname;
const EXPECTED_WEIGHTS = Object.freeze({
  semantic: 0.65,
  lexical: 0.20,
  title: 0.10,
  language: 0.05,
});

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(String(value), 'utf8').digest('hex')}`;
}

function cleanWorkerOrigin(value) {
  const url = new URL(String(value || '').trim());
  assert.equal(url.protocol, 'https:', 'Worker origin must use HTTPS');
  assert.equal(url.username, '', 'Worker origin must not contain username');
  assert.equal(url.password, '', 'Worker origin must not contain password');
  assert.equal(url.search, '', 'Worker origin must not contain query');
  assert.equal(url.hash, '', 'Worker origin must not contain fragment');
  assert.ok(url.pathname === '/' || url.pathname === '', 'Worker origin must not contain a path');
  return url.origin;
}

async function run() {
  const browser = await launchChromium(chromium);
  const evidence = {
    schemaVersion: 1,
    evidenceClass: 'ai-public-search-production-acceptance',
    productionOrigin: PRODUCTION_ORIGIN,
    sourceSha: process.env.GITHUB_SHA || 'unknown',
    queryId: QUERY_ID,
    query: QUERY,
    mode: null,
    embeddingDimensions: null,
    hybridWeights: null,
    workerOriginDigest: null,
    embedRequests: 0,
    firstResultPath: null,
    answerEndpointDisabled: false,
    answerActionAbsent: false,
    providerBrowserRequests: 0,
    sanitized: true,
  };

  try {
    const context = await browser.newContext({
      viewport: {width: 1280, height: 900},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const response = await page.goto(SEARCH_URL, {waitUntil: 'domcontentloaded', timeout: 45000});
    assert.ok(response?.ok(), `production search returned HTTP ${response?.status() ?? 'none'}`);

    const runtime = await page.evaluate(() => {
      const node = document.getElementById('tr-ai-search-config');
      if (!node) return null;
      return JSON.parse(node.textContent || '{}');
    });
    assert.ok(runtime, 'production search is missing AI runtime config');
    assert.equal(runtime.mode, 'search', `production AI mode must be search, got ${String(runtime.mode)}`);
    assert.equal(runtime.embeddingDimensions, 512, 'production embedding dimensions drifted');
    assert.deepEqual(runtime.hybridWeights, EXPECTED_WEIGHTS, 'production hybrid weights drifted');
    const workerOrigin = cleanWorkerOrigin(runtime.workerBaseUrl);

    evidence.mode = runtime.mode;
    evidence.embeddingDimensions = runtime.embeddingDimensions;
    evidence.hybridWeights = runtime.hybridWeights;
    evidence.workerOriginDigest = sha256(workerOrigin);

    const workerRequests = [];
    page.on('request', (request) => {
      try {
        const url = new URL(request.url());
        if (url.origin === workerOrigin) {
          workerRequests.push({method: request.method(), pathname: url.pathname});
        }
      } catch {}
    });

    const searchSwitch = page.locator('[role="switch"]').first();
    await searchSwitch.waitFor({state: 'visible', timeout: 15000});
    assert.equal(await searchSwitch.getAttribute('aria-checked'), 'false', 'AI must remain opt-in on initial load');
    await searchSwitch.click();
    assert.equal(await searchSwitch.getAttribute('aria-checked'), 'true', 'AI opt-in switch did not enable');

    const input = page.locator('.tr-search-input').first();
    const button = page.locator('.tr-search-button').first();
    await input.waitFor({state: 'visible', timeout: 10000});
    await button.waitFor({state: 'visible', timeout: 10000});
    await input.fill(QUERY);
    await button.click();

    const firstResult = page.locator('.tr-ai-result').first();
    await firstResult.waitFor({state: 'visible', timeout: 20000});
    const firstResultLink = firstResult.locator('.tr-ai-result__title').first();
    const href = await firstResultLink.getAttribute('href');
    assert.ok(href, 'semantic result is missing canonical href');
    const firstResultPath = new URL(href, page.url()).pathname;
    assert.equal(firstResultPath, EXPECTED_PATH, `semantic SEARCH returned unexpected first route: ${firstResultPath}`);
    evidence.firstResultPath = firstResultPath;

    const embedRequests = workerRequests.filter(({method, pathname}) => method === 'POST' && pathname === '/v1/embed');
    assert.equal(embedRequests.length, 1, `expected exactly one UI embedding request, got ${embedRequests.length}`);
    evidence.embedRequests = embedRequests.length;

    const answerActions = await page.locator('.tr-ai-answer-action').count();
    assert.equal(answerActions, 0, 'SEARCH mode must not expose an answer action');
    evidence.answerActionAbsent = true;

    const negativeAnswer = await page.evaluate(async ({workerOrigin, productionOrigin}) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(`${workerOrigin}/v1/answer`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: '{}',
          signal: controller.signal,
        });
        let body = null;
        try {
          body = await response.json();
        } catch {}
        return {
          status: response.status,
          code: body?.code ?? null,
          allowOrigin: response.headers.get('access-control-allow-origin'),
          productionOrigin,
        };
      } finally {
        clearTimeout(timer);
      }
    }, {workerOrigin, productionOrigin: PRODUCTION_ORIGIN});
    assert.equal(negativeAnswer.status, 503, `SEARCH /v1/answer must be 503, got ${negativeAnswer.status}`);
    assert.equal(negativeAnswer.code, 'feature_disabled', 'SEARCH /v1/answer must fail closed');
    assert.equal(negativeAnswer.allowOrigin, PRODUCTION_ORIGIN, 'SEARCH answer rejection must preserve exact-origin CORS');
    evidence.answerEndpointDisabled = true;

    const providerAuthorityLeak = await page.evaluate(() => {
      const configText = document.getElementById('tr-ai-search-config')?.textContent || '';
      return /api[_-]?key|bearer\s+|embeddingModel|answerModel/i.test(configText);
    });
    assert.equal(providerAuthorityLeak, false, 'browser runtime config leaks provider authority or credential-shaped material');
    evidence.providerBrowserRequests = 0;

    await captureScreenshot(page, 'ai-public-search-production.png');
    writeJsonArtifact('ai-public-search-production-evidence.json', evidence);
    process.stdout.write(`AI public SEARCH production acceptance: PASS (${QUERY_ID}; ${firstResultPath})\n`);
    await context.close();
  } catch (error) {
    writeJsonArtifact('ai-public-search-production-evidence.json', {
      ...evidence,
      failure: String(error?.message || error),
    });
    throw error;
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
