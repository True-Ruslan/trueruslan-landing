import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {ROOT: HARNESS_ROOT, TOOLS_DIR, ARTIFACTS_DIR} = await import('./quality-harness/paths.cjs');
const {requireQualityTool, launchChromium} = await import('./quality-harness/tools.cjs');
const {startStaticServer} = await import('./quality-harness/static-server.cjs');
const {createScenarioPage} = await import('./quality-harness/browser.cjs');
const {sameOrigin, shouldIgnoreRequestFailure, formatRequestFailure, installPageDiagnostics} = await import('./quality-harness/diagnostics.cjs');
const {measureHorizontalScroll, assertNoHorizontalOverflow, blockingAxeViolations} = await import('./quality-harness/assertions.cjs');
const {screenshotOptions, artifactPath} = await import('./quality-harness/evidence.cjs');
const {VIEWPORTS, CORE_SCENARIOS} = await import('./quality-harness/scenarios.cjs');

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({status: response.statusCode, body: Buffer.concat(chunks).toString('utf8')}));
    }).on('error', reject);
  });
}

test('quality paths resolve from repository root', () => {
  assert.equal(HARNESS_ROOT, ROOT);
  assert.equal(TOOLS_DIR, path.join(ROOT, '.quality-tools', 'node_modules'));
  assert.equal(ARTIFACTS_DIR, path.join(ROOT, 'artifacts'));
});

test('quality tool loader produces actionable missing-tool diagnostics', () => {
  assert.throws(
    () => requireQualityTool('definitely-not-installed-quality-tool'),
    /not installed in \.quality-tools/,
  );
});

test('launchChromium uses channel first and explicit executable fallback', async () => {
  const calls = [];
  const fakeChromium = {
    async launch(options) {
      calls.push(options);
      if (calls.length === 1) throw new Error('channel unavailable');
      return {ok: true, options};
    },
  };

  const browser = await launchChromium(fakeChromium, {executablePath: '/tmp/chrome'});
  assert.equal(browser.ok, true);
  assert.deepEqual(calls, [
    {headless: true, channel: 'chrome'},
    {headless: true, executablePath: '/tmp/chrome'},
  ]);
});

test('static server serves extensionless HTML and exposes stoppable lifecycle', async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-server-'));
  fs.mkdirSync(path.join(rootDir, 'nested'), {recursive: true});
  fs.writeFileSync(path.join(rootDir, 'index.html'), 'home');
  fs.writeFileSync(path.join(rootDir, 'nested', 'index.html'), 'nested');

  const runtime = await startStaticServer({rootDir, port: 0, gzip: false});
  try {
    const home = await request(`${runtime.baseUrl}/`);
    const nested = await request(`${runtime.baseUrl}/nested/`);
    assert.equal(home.status, 200);
    assert.equal(home.body, 'home');
    assert.equal(nested.status, 200);
    assert.equal(nested.body, 'nested');
  } finally {
    await runtime.stop();
  }
});

test('scenario page factory applies dark default without hiding caller options', async () => {
  const calls = [];
  const fakeBrowser = {
    async newContext(options) {
      calls.push(options);
      return {
        async newPage() { return {ok: true}; },
        async close() {},
      };
    },
  };

  const runtime = await createScenarioPage(fakeBrowser, {
    viewport: VIEWPORTS.mobile,
    reducedMotion: 'reduce',
  });
  try {
    assert.deepEqual(calls, [{
      viewport: VIEWPORTS.mobile,
      reducedMotion: 'reduce',
      colorScheme: 'dark',
    }]);
    assert.equal(runtime.page.ok, true);
  } finally {
    await runtime.close();
  }
});

test('sameOrigin is bounded to the configured quality server origin', () => {
  assert.equal(sameOrigin('http://127.0.0.1:4173/a', 'http://127.0.0.1:4173'), true);
  assert.equal(sameOrigin('http://127.0.0.1:4174/a', 'http://127.0.0.1:4173'), false);
  assert.equal(sameOrigin('https://example.com/a', 'http://127.0.0.1:4173'), false);
  assert.equal(sameOrigin('not a url', 'http://127.0.0.1:4173'), false);
});

test('request failure helpers ignore expected aborts and deduplicate diagnostics', () => {
  assert.equal(shouldIgnoreRequestFailure({failureText: 'net::ERR_ABORTED'}, ['ERR_ABORTED']), true);
  assert.equal(shouldIgnoreRequestFailure({failureText: 'net::ERR_CONNECTION_REFUSED'}, ['ERR_ABORTED']), false);
  assert.equal(
    formatRequestFailure({url: 'https://example.com/x', method: 'GET', failureText: 'net::ERR_FAILED'}),
    'GET https://example.com/x — net::ERR_FAILED',
  );
});

test('overflow helpers preserve two-pixel tolerance semantics', async () => {
  const page = {
    async evaluate() {
      return {
        innerWidth: 390,
        scrollWidth: 392,
        maxScrollX: 0,
        offenders: [],
      };
    },
  };

  await assertNoHorizontalOverflow(page, 'fixture');
});

test('measureHorizontalScroll keeps real max-scroll semantics for layout smoke', async () => {
  const page = {
    async evaluate() {
      return {
        innerWidth: 390,
        scrollWidth: 500,
        maxScrollX: 110,
        offenders: [{tag: 'DIV', className: 'wide', left: 0, right: 500, width: 500}],
      };
    },
  };
  const metrics = await measureHorizontalScroll(page);
  assert.equal(metrics.maxScrollX, 110);
  assert.equal(metrics.offenders.length, 1);
});

test('blockingAxeViolations defaults to serious and critical impacts', () => {
  const result = blockingAxeViolations({
    violations: [
      {id: 'minor-rule', impact: 'minor'},
      {id: 'serious-rule', impact: 'serious'},
      {id: 'critical-rule', impact: 'critical'},
    ],
  });
  assert.deepEqual(result.map((violation) => violation.id), ['serious-rule', 'critical-rule']);
});

test('evidence helpers preserve stable screenshot defaults and artifact location', () => {
  assert.deepEqual(screenshotOptions(), {fullPage: true, animations: 'disabled'});
  assert.deepEqual(
    screenshotOptions({animations: 'allow', timeout: 1000}),
    {fullPage: true, animations: 'allow', timeout: 1000},
  );
  assert.equal(artifactPath('x.png'), path.join(ARTIFACTS_DIR, 'x.png'));
});

test('common scenario declarations preserve canonical clean routes and viewports', () => {
  assert.deepEqual(VIEWPORTS.mobile, {width: 390, height: 844});
  assert.deepEqual(VIEWPORTS.desktop, {width: 1440, height: 1000});
  assert.equal(CORE_SCENARIOS.home.path, '/');
  assert.equal(CORE_SCENARIOS.home.heading, 'Руслан Немыкин');
  assert.equal(CORE_SCENARIOS.projects.path, '/projects/');
  assert.equal(CORE_SCENARIOS.vlezet.path, '/projects/vlezet/');
  assert.equal(CORE_SCENARIOS.vlezet.heading, 'Vlezet');
  assert.equal(CORE_SCENARIOS.villaigence.path, '/projects/livingworld/');
  assert.equal(CORE_SCENARIOS.publications.path, '/publications/');
  assert.equal(CORE_SCENARIOS.publications.heading, 'Публикации и выступления');
  assert.equal(CORE_SCENARIOS.resume.path, '/resume/');
  assert.equal(Object.isFrozen(VIEWPORTS), true);
  assert.equal(Object.isFrozen(CORE_SCENARIOS), true);
});