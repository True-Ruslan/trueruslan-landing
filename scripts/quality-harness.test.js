import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

const {ROOT, OUTPUT_DIR, TOOLS_DIR, ARTIFACTS_DIR} = require('./quality-harness/paths.cjs');
const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {sameOrigin, shouldIgnoreRequestFailure, dedupeDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {
  measureHorizontalOverflow,
  assertNoHorizontalOverflow,
  measureHorizontalScroll,
  blockingAxeViolations,
} = require('./quality-harness/assertions.cjs');
const {screenshotOptions, artifactPath} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS, CORE_SCENARIOS} = require('./quality-harness/scenarios.cjs');

test('quality paths resolve from repository root', () => {
  assert.equal(path.basename(ROOT), 'trueruslan-landing');
  assert.equal(OUTPUT_DIR, path.join(ROOT, 'docs-html'));
  assert.equal(TOOLS_DIR, path.join(ROOT, '.quality-tools', 'node_modules'));
  assert.equal(ARTIFACTS_DIR, path.join(ROOT, 'quality-artifacts'));
});

test('quality tool loader produces actionable missing-tool diagnostics', () => {
  assert.throws(
    () => requireQualityTool('__definitely_missing_quality_tool__', 'Harness test tool'),
    /Harness test tool.*is not installed in \.quality-tools/i,
  );
});

test('launchChromium uses channel first and explicit executable fallback', async () => {
  const calls = [];
  const chromium = {
    launch: async (options) => {
      calls.push(options);
      if (options.channel) throw new Error('channel unavailable');
      return {kind: 'browser', options};
    },
  };

  const browser = await launchChromium(chromium, {executablePath: '/tmp/fake-chrome'});
  assert.equal(browser.kind, 'browser');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].channel, 'chrome');
  assert.equal(calls[1].executablePath, '/tmp/fake-chrome');
  assert.deepEqual(calls[1].args, ['--no-sandbox']);
});

test('static server serves extensionless HTML and exposes stoppable lifecycle', async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-harness-'));
  fs.writeFileSync(path.join(outputDir, 'index.html'), '<h1>home</h1>');
  fs.writeFileSync(path.join(outputDir, 'page.html'), '<h1>page</h1>');

  const runtime = await startStaticServer({port: 0, outputDir});
  try {
    const response = await fetch(`${runtime.baseUrl}/page`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<h1>page<\/h1>/);
  } finally {
    await runtime.stop();
    fs.rmSync(outputDir, {recursive: true, force: true});
  }
});

test('scenario page factory applies dark default without hiding caller options', async () => {
  let receivedOptions;
  let closed = false;
  const page = {id: 'page'};
  const browser = {
    newContext: async (options) => {
      receivedOptions = options;
      return {
        newPage: async () => page,
        close: async () => { closed = true; },
      };
    },
  };

  const runtime = await createScenarioPage(browser, {
    viewport: {width: 390, height: 844},
    javaScriptEnabled: false,
  });
  assert.equal(runtime.page, page);
  assert.deepEqual(receivedOptions, {
    viewport: {width: 390, height: 844},
    javaScriptEnabled: false,
    colorScheme: 'dark',
  });
  await runtime.close();
  assert.equal(closed, true);
});

test('sameOrigin is bounded to the configured quality server origin', () => {
  assert.equal(sameOrigin('http://127.0.0.1:4173/a', 'http://127.0.0.1:4173'), true);
  assert.equal(sameOrigin('http://127.0.0.1:4173/a?x=1', 'http://127.0.0.1:4173'), true);
  assert.equal(sameOrigin('https://example.com/a', 'http://127.0.0.1:4173'), false);
  assert.equal(sameOrigin('not a url', 'http://127.0.0.1:4173'), false);
});

test('request failure helpers ignore expected aborts and deduplicate diagnostics', () => {
  assert.equal(shouldIgnoreRequestFailure('net::ERR_ABORTED'), true);
  assert.equal(shouldIgnoreRequestFailure('NS_BINDING_ABORTED'), true);
  assert.equal(shouldIgnoreRequestFailure('net::ERR_CONNECTION_REFUSED'), false);
  assert.deepEqual(dedupeDiagnostics(['a', 'a', 'b']), ['a', 'b']);
});

test('overflow helpers preserve two-pixel tolerance semantics', async () => {
  const safePage = {
    evaluate: async () => ({viewportWidth: 390, documentWidth: 392, overflow: 2}),
  };
  assert.deepEqual(
    await measureHorizontalOverflow(safePage),
    {viewportWidth: 390, documentWidth: 392, overflow: 2},
  );
  await assert.doesNotReject(() => assertNoHorizontalOverflow(safePage, 'mobile'));

  const failingPage = {
    evaluate: async () => ({viewportWidth: 390, documentWidth: 393, overflow: 3}),
  };
  await assert.rejects(
    () => assertNoHorizontalOverflow(failingPage, 'mobile'),
    /mobile.*horizontal overflow/i,
  );
});

test('measureHorizontalScroll keeps real max-scroll semantics for layout smoke', async () => {
  const page = {
    evaluate: async () => ({viewportWidth: 390, scrollWidth: 400, maxScrollX: 10}),
  };
  assert.deepEqual(
    await measureHorizontalScroll(page),
    {viewportWidth: 390, scrollWidth: 400, maxScrollX: 10},
  );
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

test('common scenario declarations preserve current core routes and viewports', () => {
  assert.deepEqual(VIEWPORTS.mobile, {width: 390, height: 844});
  assert.deepEqual(VIEWPORTS.desktop, {width: 1440, height: 1000});
  assert.equal(CORE_SCENARIOS.home.path, '/index.html');
  assert.equal(CORE_SCENARIOS.home.heading, 'Руслан Немыкин');
  assert.equal(CORE_SCENARIOS.projects.path, '/landing/projects.html');
  assert.equal(CORE_SCENARIOS.vlezet.path, '/landing/projects/vlezet.html');
  assert.equal(CORE_SCENARIOS.vlezet.heading, 'Vlezet');
  assert.equal(CORE_SCENARIOS.resume.path, '/landing/resume.html');
  assert.equal(Object.isFrozen(VIEWPORTS), true);
  assert.equal(Object.isFrozen(CORE_SCENARIOS), true);
});
