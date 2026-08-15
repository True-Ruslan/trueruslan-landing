const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {ROOT, OUTPUT_DIR} = require('./quality-harness/paths.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

const WORKER_BASE_URL = 'https://ai.example.workers.dev';
const REAL_PROVIDER_HOST = 'openrouter.ai';
const SEARCH_CHUNK_ID = 'ru:note:green-ci-is-not-product-verification:intro';
const EN_CHUNK_ID = 'en:page:about:intro';

const CHUNKS = Object.freeze([
  Object.freeze({
    id: SEARCH_CHUNK_ID,
    url: '/notes/green-ci-is-not-product-verification/',
    sourcePath: 'docs/landing/notes/green-ci-is-not-product-verification.md',
    title: 'Green CI is not production verification',
    section: 'Intro',
    type: 'note',
    lang: 'ru',
    text: 'Зелёный CI подтверждает автоматизированные проверки, но не доказывает фактический production deployment и пользовательскую acceptance.',
    contentHash: `sha256:${'1'.repeat(64)}`,
  }),
  Object.freeze({
    id: EN_CHUNK_ID,
    url: '/en/about/',
    sourcePath: 'docs/en/about.md',
    title: 'Backend engineer',
    section: 'About',
    type: 'page',
    lang: 'en',
    text: 'Backend engineering, distributed systems and evidence-driven delivery.',
    contentHash: `sha256:${'2'.repeat(64)}`,
  }),
]);

function ensureDir(target) {
  fs.mkdirSync(target, {recursive: true});
  return target;
}

function writeFixtureIndex(rootDir) {
  const aiDir = ensureDir(path.join(rootDir, 'ai'));
  fs.writeFileSync(path.join(aiDir, 'chunks.json'), JSON.stringify(CHUNKS));
  fs.writeFileSync(path.join(aiDir, 'index-meta.json'), JSON.stringify({
    dimensions: 2,
    chunkIds: CHUNKS.map(({id}) => id),
  }));
  const binary = Buffer.alloc(CHUNKS.length * 2 * 4);
  [1, 0, 0, 1].forEach((value, index) => binary.writeFloatLE(value, index * 4));
  fs.writeFileSync(path.join(aiDir, 'embeddings.bin'), binary);
}

function fixtureConfig(mode) {
  return {
    mode,
    workerBaseUrl: WORKER_BASE_URL,
    embeddingDimensions: 2,
    maxQueryChars: 500,
    maxResults: 5,
    answerMaxChunks: 5,
    hybridWeights: {
      semantic: 0.9,
      lexical: 0.05,
      title: 0.03,
      language: 0.02,
    },
  };
}

function fixtureHtml({mode = 'off', lang = 'ru'}) {
  const enabled = mode !== 'off';
  const htmlAttrs = enabled ? ` lang="${lang}" data-tr-ai-mode="${mode}"` : ` lang="${lang}"`;
  const title = lang === 'en' ? 'AI Navigator fixture' : 'Проверка AI Navigator';
  const heading = lang === 'en' ? 'Site search' : 'Поиск по сайту';
  const inputLabel = lang === 'en' ? 'Search site' : 'Поиск по сайту';
  const buttonLabel = lang === 'en' ? 'Search' : 'Найти';
  const resources = enabled ? `
    <link rel="stylesheet" href="/assets/ai-search.css">
    <script type="application/json" id="tr-ai-search-config">${JSON.stringify(fixtureConfig(mode))}</script>
    <script src="/assets/ai-retrieval.js"></script>
    <script src="/assets/ai-search.js"></script>` : '';

  return `<!doctype html>
<html${htmlAttrs}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #111317; color: #f4f5f7; font: 16px/1.5 system-ui, sans-serif; }
    main { width: min(100% - 32px, 920px); margin: 48px auto; }
    h1 { font-size: clamp(24px, 5vw, 36px); }
    .tr-search-app { width: 100%; }
    form { display: flex; gap: 10px; align-items: stretch; }
    .tr-search-input-shell { flex: 1; min-width: 0; }
    .tr-search-input { width: 100%; min-height: 48px; padding: 10px 12px; border: 1px solid #7e8795; border-radius: 9px; background: #171a20; color: #fff; font: inherit; }
    .tr-search-button { min-height: 48px; padding: 8px 16px; border: 1px solid #aeb7c5; border-radius: 9px; background: #252a34; color: #fff; font: inherit; cursor: pointer; }
    .tr-search-input:focus-visible, .tr-search-button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    #ordinary-results { margin-top: 16px; min-height: 24px; }
    @media (max-width: 520px) { main { width: min(100% - 20px, 920px); margin-top: 24px; } form { flex-direction: column; } }
  </style>
</head>
<body>
  <main>
    <h1>${heading}</h1>
    <div class="tr-search-app">
      <form id="search-form">
        <div class="tr-search-input-shell">
          <input class="tr-search-input" type="search" aria-label="${inputLabel}" placeholder="${inputLabel}">
        </div>
        <button class="tr-search-button" type="submit">${buttonLabel}</button>
      </form>
      <div id="ordinary-results" aria-live="polite"></div>
    </div>
  </main>
  <script>
    (() => {
      const form = document.getElementById('search-form');
      const input = form.querySelector('input');
      const output = document.getElementById('ordinary-results');
      form.addEventListener('submit', (event) => {
        const aiSwitch = document.querySelector('[role="switch"]');
        if (aiSwitch && aiSwitch.getAttribute('aria-checked') === 'true') return;
        event.preventDefault();
        output.textContent = 'ordinary:' + input.value;
      });
    })();
  </script>${resources}
</body>
</html>`;
}

function prepareFixtureSite() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trueruslan-ai-navigator-'));
  const assetsDir = ensureDir(path.join(rootDir, 'assets'));
  fs.copyFileSync(path.join(ROOT, 'docs', '_assets', 'script', 'ai-retrieval.js'), path.join(assetsDir, 'ai-retrieval.js'));
  fs.copyFileSync(path.join(ROOT, 'docs', '_assets', 'script', 'ai-search.js'), path.join(assetsDir, 'ai-search.js'));
  fs.copyFileSync(path.join(ROOT, 'docs', '_assets', 'style', 'ai-search.css'), path.join(assetsDir, 'ai-search.css'));
  writeFixtureIndex(rootDir);

  for (const fixture of [
    {mode: 'off', lang: 'ru'},
    {mode: 'search', lang: 'ru'},
    {mode: 'full', lang: 'en'},
  ]) {
    const dir = ensureDir(path.join(rootDir, fixture.mode));
    fs.writeFileSync(path.join(dir, 'index.html'), fixtureHtml(fixture));
  }
  return rootDir;
}

function assertCanonicalOffArtifact() {
  const searchPath = path.join(OUTPUT_DIR, '_search', 'ru', 'index.html');
  const html = fs.readFileSync(searchPath, 'utf8');
  assert.equal(html.includes('data-tr-ai-mode='), false, 'canonical OFF search HTML must not expose AI mode');
  assert.equal(html.includes('tr-ai-search-config'), false, 'canonical OFF search HTML must not expose AI runtime config');
  assert.equal(html.includes('ai-search.js'), false, 'canonical OFF search HTML must not load AI runtime');
}

function fakeWorkerRouter({baseUrl, state, records}) {
  return async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const corsHeaders = {
      'Access-Control-Allow-Origin': baseUrl,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (method === 'OPTIONS') {
      records.preflight += 1;
      await route.fulfill({status: 204, headers: corsHeaders, body: ''});
      return;
    }

    assert.equal(method, 'POST', `fake Worker accepts POST only: ${method}`);
    const body = JSON.parse(request.postData() || '{}');
    records.worker.push({path: url.pathname, body});

    if (url.pathname === '/v1/embed') {
      records.embed += 1;
      assert.deepEqual(Object.keys(body), ['query']);
      const query = String(body.query || '').toLowerCase();
      const embedding = query.includes('backend') ? [0, 1] : [1, 0];
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({embedding, dimensions: 2, model: 'fixture'}),
      });
      return;
    }

    assert.equal(url.pathname, '/v1/answer');
    records.answer += 1;
    assert.deepEqual(Object.keys(body).sort(), ['chunkIds', 'question']);
    assert.ok(body.chunkIds.length >= 1 && body.chunkIds.length <= 5);
    records.answerBodies.push(body);

    if (state.answerMode === 'timeout') {
      await route.abort('timedout');
      return;
    }
    if ([402, 429, 503].includes(state.answerMode)) {
      await route.fulfill({
        status: state.answerMode,
        headers: corsHeaders,
        body: JSON.stringify({error: 'fixture failure'}),
      });
      return;
    }
    if (state.answerMode === 'invalid-citation') {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          sufficientEvidence: true,
          answer: 'Invalid fixture answer',
          citations: ['ru:page:unknown:intro'],
        }),
      });
      return;
    }
    if (state.answerMode === 'insufficient') {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({sufficientEvidence: false, answer: '', citations: []}),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        sufficientEvidence: true,
        answer: 'The retrieved site evidence separates automated CI from production verification.',
        citations: [body.chunkIds[0]],
      }),
    });
  };
}

async function assertA11yAndLayout(page, label) {
  const overflow = await assertNoHorizontalOverflow(page, label);
  const axe = await new AxeBuilder({page}).analyze();
  const blocking = blockingAxeViolations(axe);
  assert.deepEqual(blocking.map(({id, impact}) => ({id, impact})), [], `${label}: serious/critical accessibility violations`);
  return {overflow, axeViolationCount: axe.violations.length};
}

async function inspectStorage(page) {
  return page.evaluate(() => ({
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage),
    historyState: history.state,
  }));
}

function assertNoAiStorage(storage, label) {
  const keys = [...storage.localStorage, ...storage.sessionStorage];
  assert.equal(keys.some((key) => /ai|query|prompt|provider|model|debug/i.test(key)), false, `${label}: AI state leaked into browser storage`);
  assert.equal(storage.historyState, null, `${label}: AI state must not use history.state`);
}

async function assertNoProviderMaterial(page, label) {
  const html = await page.content();
  assert.equal(/openai\/text-embedding|gemini-2\.5|Bearer\s+[A-Za-z0-9._~-]{12,}|sk-[a-z0-9]{8,}/i.test(html), false, `${label}: provider authority leaked into browser HTML`);
}

async function run() {
  assertCanonicalOffArtifact();
  const fixtureDir = prepareFixtureSite();
  const server = await startStaticServer({outputDir: fixtureDir});
  const browser = await launchChromium(chromium);
  const records = {
    externalProvider: [],
    worker: [],
    embed: 0,
    answer: 0,
    preflight: 0,
    answerBodies: [],
  };
  const state = {answerMode: 'success'};
  const summary = {modes: {}, degradation: {}, externalProviderRequests: 0};

  try {
    const context = await browser.newContext({colorScheme: 'dark'});
    await context.route(`${WORKER_BASE_URL}/**`, fakeWorkerRouter({baseUrl: server.baseUrl, state, records}));
    await context.route(`https://${REAL_PROVIDER_HOST}/**`, async (route) => {
      records.externalProvider.push(route.request().url());
      await route.abort('blockedbyclient');
    });

    const off = await context.newPage();
    await off.setViewportSize(VIEWPORTS.desktop);
    const offRequests = [];
    off.on('request', (request) => offRequests.push(request.url()));
    await off.goto(`${server.baseUrl}/off/`, {waitUntil: 'networkidle'});
    assert.equal(await off.locator('[role="switch"]').count(), 0);
    assert.equal(await off.locator('html[data-tr-ai-mode]').count(), 0);
    await off.locator('.tr-search-input').fill('обычный поиск');
    await off.locator('.tr-search-button').click();
    await off.locator('#ordinary-results').waitFor({state: 'visible'});
    assert.equal(await off.locator('#ordinary-results').textContent(), 'ordinary:обычный поиск');
    assert.equal(offRequests.some((url) => url.includes('/assets/ai-') || url.includes('/ai/')), false);
    assertNoAiStorage(await inspectStorage(off), 'OFF');
    summary.modes.off = await assertA11yAndLayout(off, 'AI Navigator OFF');
    await off.close();

    const search = await context.newPage();
    await search.setViewportSize(VIEWPORTS.mobile);
    const beforeSearchWorker = records.worker.length;
    await search.goto(`${server.baseUrl}/search/`, {waitUntil: 'networkidle'});
    const searchSwitch = search.locator('[role="switch"]');
    await searchSwitch.waitFor({state: 'visible'});
    assert.equal(await searchSwitch.getAttribute('aria-checked'), 'false');
    assert.match(await searchSwitch.getAttribute('aria-label'), /AI|смысл/i);
    const switchBox = await searchSwitch.boundingBox();
    assert.ok(switchBox && switchBox.width >= 40 && switchBox.height >= 40, 'AI switch target must be at least 40x40');

    await search.locator('.tr-search-input').fill('обычный до AI');
    await search.locator('.tr-search-button').click();
    assert.equal(await search.locator('#ordinary-results').textContent(), 'ordinary:обычный до AI');
    assert.equal(records.worker.length, beforeSearchWorker, 'ordinary search before opt-in must not call Worker');

    await search.locator('.tr-search-input').focus();
    await search.keyboard.press('Tab');
    assert.equal(await search.evaluate(() => document.activeElement?.getAttribute('role')), 'switch');
    const outline = await searchSwitch.evaluate((node) => getComputedStyle(node).outlineStyle);
    assert.notEqual(outline, 'none', 'keyboard-focused AI switch must expose visible focus');

    await searchSwitch.click();
    assert.equal(await searchSwitch.getAttribute('aria-checked'), 'true');
    await search.locator('.tr-search-input').fill('release confidence');
    await search.locator('.tr-search-button').click();
    await search.locator('.tr-ai-result').first().waitFor({state: 'visible'});
    assert.equal(records.embed, 1);
    assert.equal(await search.locator('.tr-ai-result__title').first().getAttribute('href'), CHUNKS[0].url);
    assert.equal(await search.locator('.tr-ai-answer-action').count(), 0, 'SEARCH mode must not expose answer action');
    await assertNoProviderMaterial(search, 'SEARCH');
    assertNoAiStorage(await inspectStorage(search), 'SEARCH');
    await search.emulateMedia({reducedMotion: 'reduce'});
    assert.equal(await search.locator('.tr-ai-switch__knob').evaluate((node) => getComputedStyle(node).transitionDuration), '0s');
    summary.modes.search = await assertA11yAndLayout(search, 'AI Navigator SEARCH');
    await captureScreenshot(search, 'ai-navigator-search-mobile.png');
    await search.close();

    const full = await context.newPage();
    await full.setViewportSize(VIEWPORTS.desktop);
    await full.goto(`${server.baseUrl}/full/`, {waitUntil: 'networkidle'});
    const fullSwitch = full.locator('[role="switch"]');
    assert.equal(await fullSwitch.getAttribute('aria-checked'), 'false');
    await fullSwitch.click();
    await full.locator('.tr-search-input').fill('backend engineer');
    await full.locator('.tr-search-button').click();
    await full.locator('.tr-ai-answer-action').waitFor({state: 'visible'});
    assert.equal(records.embed, 2);
    assert.equal(await full.locator('.tr-ai-result__title').first().getAttribute('href'), CHUNKS[1].url);

    const answerBefore = records.answer;
    state.answerMode = 'success';
    await full.locator('.tr-ai-answer-action').click();
    await full.locator('.tr-ai-answer__body').waitFor({state: 'visible'});
    assert.equal(records.answer, answerBefore + 1, 'one explicit answer click must produce one answer request');
    const successBody = records.answerBodies.at(-1);
    assert.deepEqual(Object.keys(successBody).sort(), ['chunkIds', 'question']);
    assert.equal(successBody.question, 'backend engineer');
    assert.ok(successBody.chunkIds.length <= 5);
    assert.match(await full.locator('.tr-ai-answer__body').textContent(), /retrieved site evidence/i);
    const citation = full.locator('.tr-ai-answer__sources a').first();
    assert.equal(await citation.getAttribute('href'), CHUNKS[1].url);
    assert.equal(await citation.getAttribute('target'), null);
    await captureScreenshot(full, 'ai-navigator-full-desktop.png');

    state.answerMode = 'insufficient';
    await full.locator('.tr-ai-answer-action').click();
    await full.waitForFunction(() => /does not contain enough evidence/i.test(document.querySelector('.tr-ai-answer__body')?.textContent || ''));
    assert.equal(await full.locator('.tr-ai-result').count(), 2);
    summary.degradation.insufficient = true;

    for (const failure of [402, 429, 503]) {
      state.answerMode = failure;
      const countBefore = records.answer;
      await full.locator('.tr-ai-answer-action').click();
      await full.waitForFunction(() => document.querySelector('.tr-ai-answer--error'));
      assert.equal(records.answer, countBefore + 1, `HTTP ${failure} must not retry automatically`);
      assert.equal(await full.locator('.tr-ai-result').count(), 2, `HTTP ${failure} must preserve semantic results`);
      summary.degradation[String(failure)] = true;
    }

    state.answerMode = 'timeout';
    const timeoutBefore = records.answer;
    await full.locator('.tr-ai-answer-action').click();
    await full.waitForFunction(() => document.querySelector('.tr-ai-answer--error'));
    assert.equal(records.answer, timeoutBefore + 1, 'timeout must not retry automatically');
    summary.degradation.timeout = true;

    state.answerMode = 'invalid-citation';
    const invalidBefore = records.answer;
    await full.locator('.tr-ai-answer-action').click();
    await full.waitForFunction(() => document.querySelector('.tr-ai-answer--error'));
    assert.equal(records.answer, invalidBefore + 1);
    assert.equal(await full.locator('.tr-ai-result').count(), 2);
    summary.degradation.invalidCitation = true;

    await fullSwitch.click();
    assert.equal(await fullSwitch.getAttribute('aria-checked'), 'false');
    const workerBeforeFallback = records.worker.length;
    await full.locator('.tr-search-input').fill('ordinary fallback');
    await full.locator('.tr-search-button').click();
    assert.equal(await full.locator('#ordinary-results').textContent(), 'ordinary:ordinary fallback');
    assert.equal(records.worker.length, workerBeforeFallback, 'ordinary fallback must remain provider-free');
    await assertNoProviderMaterial(full, 'FULL');
    assertNoAiStorage(await inspectStorage(full), 'FULL');
    summary.modes.full = await assertA11yAndLayout(full, 'AI Navigator FULL');
    await full.close();

    const corrupt = await context.newPage();
    await corrupt.setViewportSize(VIEWPORTS.mobile);
    await corrupt.route(`${server.baseUrl}/ai/embeddings.bin`, async (route) => {
      await route.fulfill({status: 200, contentType: 'application/octet-stream', body: Buffer.from([1, 2, 3])});
    });
    await corrupt.goto(`${server.baseUrl}/search/`, {waitUntil: 'networkidle'});
    await corrupt.locator('[role="switch"]').click();
    await corrupt.locator('.tr-search-input').fill('broken index');
    await corrupt.locator('.tr-search-button').click();
    await corrupt.locator('.tr-ai-results__fallback').waitFor({state: 'visible'});
    assert.match(await corrupt.locator('.tr-ai-results__status').textContent(), /временно недоступен/i);
    await corrupt.locator('.tr-ai-results__fallback').click();
    assert.equal(await corrupt.locator('[role="switch"]').getAttribute('aria-checked'), 'false');
    summary.degradation.corruptIndex = true;
    await corrupt.close();

    assert.equal(records.externalProvider.length, 0, 'browser must never contact real openrouter.ai in CI');
    summary.externalProviderRequests = records.externalProvider.length;
    summary.worker = {
      postRequests: records.worker.length,
      preflightRequests: records.preflight,
      embeddingRequests: records.embed,
      answerRequests: records.answer,
    };
    summary.providerFree = true;
    summary.canonicalMode = 'off';
    writeJsonArtifact('ai-navigator-summary.json', summary);
    process.stdout.write(`AI Navigator browser smoke: PASS (${JSON.stringify(summary.worker)})\n`);
    await context.close();
  } finally {
    await browser.close();
    await server.stop();
    fs.rmSync(fixtureDir, {recursive: true, force: true});
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
