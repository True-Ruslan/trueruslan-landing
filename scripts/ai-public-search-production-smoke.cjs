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
const STATIC_AI_PATHS = new Set([
  '/ai/chunks.json',
  '/ai/index-meta.json',
  '/ai/embeddings.bin',
]);
const ALLOWED_BACKGROUND_ORIGINS = new Set(['https://static.cloudflareinsights.com']);

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

function sanitizeFailureMessage(error) {
  return String(error?.message || error || 'unknown failure')
    .replace(/https?:\/\/[^\s)]+/giu, '[url]')
    .slice(0, 600);
}

async function waitForSemanticOutcome(page, timeoutMs = 20000) {
  const result = page.locator('.tr-ai-result').first();
  const fallback = page.locator('.tr-ai-results__status').first();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await result.isVisible().catch(() => false)) {
      return {kind: 'semantic-result', result};
    }
    if (await fallback.isVisible().catch(() => false)) {
      return {kind: 'semantic-fallback'};
    }
    await page.waitForTimeout(100);
  }
  return {kind: 'semantic-timeout'};
}

async function captureFailureScreenshot(page) {
  if (!page) return false;
  try {
    await captureScreenshot(page, 'ai-public-search-production.png');
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const browser = await launchChromium(chromium);
  let context = null;
  let page = null;
  let workerOrigin = null;
  const workerRequests = [];
  const unexpectedExternalRequests = [];
  const networkObservations = [];
  const evidence = {
    schemaVersion: 2,
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
    semanticOutcome: null,
    failureStage: null,
    networkObservations,
    firstResultPath: null,
    answerEndpointDisabled: false,
    answerActionAbsent: false,
    unexpectedExternalRequests: 0,
    sanitized: true,
  };

  try {
    context = await browser.newContext({
      viewport: {width: 1280, height: 900},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    page = await context.newPage();
    const navigationResponse = await page.goto(SEARCH_URL, {waitUntil: 'domcontentloaded', timeout: 45000});
    assert.ok(navigationResponse?.ok(), `production search returned HTTP ${navigationResponse?.status() ?? 'none'}`);

    const runtime = await page.evaluate(() => {
      const node = document.getElementById('tr-ai-search-config');
      if (!node) return null;
      return JSON.parse(node.textContent || '{}');
    });
    assert.ok(runtime, 'production search is missing AI runtime config');
    assert.equal(runtime.mode, 'search', `production AI mode must be search, got ${String(runtime.mode)}`);
    assert.equal(runtime.embeddingDimensions, 512, 'production embedding dimensions drifted');
    assert.deepEqual(runtime.hybridWeights, EXPECTED_WEIGHTS, 'production hybrid weights drifted');
    workerOrigin = cleanWorkerOrigin(runtime.workerBaseUrl);

    evidence.mode = runtime.mode;
    evidence.embeddingDimensions = runtime.embeddingDimensions;
    evidence.hybridWeights = runtime.hybridWeights;
    evidence.workerOriginDigest = sha256(workerOrigin);

    page.on('request', (request) => {
      try {
        const url = new URL(request.url());
        if (url.origin === workerOrigin) {
          workerRequests.push({method: request.method(), pathname: url.pathname});
          return;
        }
        if (url.origin !== PRODUCTION_ORIGIN && !ALLOWED_BACKGROUND_ORIGINS.has(url.origin)) {
          unexpectedExternalRequests.push({method: request.method(), originDigest: sha256(url.origin)});
        }
      } catch {}
    });

    page.on('response', (response) => {
      try {
        const url = new URL(response.url());
        const isStaticIndex = url.origin === PRODUCTION_ORIGIN && STATIC_AI_PATHS.has(url.pathname);
        const isWorkerEmbed = url.origin === workerOrigin && url.pathname === '/v1/embed';
        if (!isStaticIndex && !isWorkerEmbed) return;
        networkObservations.push({
          kind: isWorkerEmbed ? 'worker-embed' : 'static-index',
          method: response.request().method(),
          pathname: url.pathname,
          status: response.status(),
          ok: response.ok(),
        });
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

    const semanticOutcome = await waitForSemanticOutcome(page);
    evidence.semanticOutcome = semanticOutcome.kind;
    evidence.embedRequests = workerRequests.filter(({method, pathname}) => method === 'POST' && pathname === '/v1/embed').length;
    evidence.unexpectedExternalRequests = unexpectedExternalRequests.length;

    if (semanticOutcome.kind === 'semantic-fallback') {
      evidence.failureStage = 'semantic-fallback';
      throw new Error('semantic SEARCH entered explicit client fallback');
    }
    if (semanticOutcome.kind !== 'semantic-result') {
      evidence.failureStage = 'semantic-outcome-timeout';
      throw new Error('semantic SEARCH produced neither a result nor an explicit fallback');
    }

    const firstResult = semanticOutcome.result;
    const firstResultLink = firstResult.locator('.tr-ai-result__title').first();
    const href = await firstResultLink.getAttribute('href');
    assert.ok(href, 'semantic result is missing canonical href');
    const firstResultPath = new URL(href, page.url()).pathname;
    assert.equal(firstResultPath, EXPECTED_PATH, `semantic SEARCH returned unexpected first route: ${firstResultPath}`);
    evidence.firstResultPath = firstResultPath;

    assert.equal(evidence.embedRequests, 1, `expected exactly one UI embedding request, got ${evidence.embedRequests}`);

    const answerActions = await page.locator('.tr-ai-answer-action').count();
    assert.equal(answerActions, 0, 'SEARCH mode must not expose an answer action');
    evidence.answerActionAbsent = true;

    const negativeAnswer = await context.request.post(`${workerOrigin}/v1/answer`, {
      headers: {
        Origin: PRODUCTION_ORIGIN,
        'Content-Type': 'application/json',
      },
      data: {},
      timeout: 5000,
    });
    let negativeAnswerBody = null;
    try {
      negativeAnswerBody = await negativeAnswer.json();
    } catch {}
    assert.equal(negativeAnswer.status(), 503, `SEARCH /v1/answer must be 503, got ${negativeAnswer.status()}`);
    assert.equal(negativeAnswerBody?.code, 'feature_disabled', 'SEARCH /v1/answer must fail closed');
    assert.equal(negativeAnswer.headers()['access-control-allow-origin'], PRODUCTION_ORIGIN, 'SEARCH answer rejection must preserve exact-origin CORS');
    evidence.answerEndpointDisabled = true;

    const providerAuthorityLeak = await page.evaluate(() => {
      const configText = document.getElementById('tr-ai-search-config')?.textContent || '';
      return /api[_-]?key|bearer\s+|embeddingModel|answerModel/i.test(configText);
    });
    assert.equal(providerAuthorityLeak, false, 'browser runtime config leaks provider authority or credential-shaped material');
    assert.equal(unexpectedExternalRequests.length, 0, 'AI interaction made an unexpected external request');

    await captureScreenshot(page, 'ai-public-search-production.png');
    writeJsonArtifact('ai-public-search-production-evidence.json', evidence);
    process.stdout.write(`AI public SEARCH production acceptance: PASS (${QUERY_ID}; ${firstResultPath})\n`);
  } catch (error) {
    evidence.embedRequests = workerRequests.filter(({method, pathname}) => method === 'POST' && pathname === '/v1/embed').length;
    evidence.unexpectedExternalRequests = unexpectedExternalRequests.length;
    if (!evidence.failureStage) evidence.failureStage = 'unclassified';
    const failureScreenshotCaptured = await captureFailureScreenshot(page);
    writeJsonArtifact('ai-public-search-production-evidence.json', {
      ...evidence,
      failure: sanitizeFailureMessage(error),
      failureScreenshotCaptured,
    });
    throw error;
  } finally {
    await context?.close().catch(() => {});
    await browser.close();
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
