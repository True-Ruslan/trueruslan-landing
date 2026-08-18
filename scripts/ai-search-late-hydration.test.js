import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, ...relativePath.split('/')), 'utf8');
}

test('AI bootstrap retries after late Diplodoc hydration and keeps observation bounded', () => {
  const source = read('docs/_assets/script/ai-search-bootstrap.js');
  let domReady = null;
  let mutationCallback = null;
  let timeoutCallback = null;
  let observed = false;
  let disconnected = false;
  let switchMounted = false;
  let initCalls = 0;
  let clearCalls = 0;

  const document = {
    readyState: 'loading',
    documentElement: {dataset: {trAiMode: 'search'}},
    querySelector(selector) {
      if (selector.includes('.tr-ai-switch')) return switchMounted ? {id: 'switch'} : null;
      return null;
    },
    addEventListener(type, callback) {
      if (type === 'DOMContentLoaded') domReady = callback;
    },
  };

  class FakeMutationObserver {
    constructor(callback) {
      mutationCallback = callback;
    }

    observe(target, options) {
      assert.equal(target, document.documentElement);
      assert.equal(options.childList, true);
      assert.equal(options.subtree, true);
      assert.deepEqual(Object.keys(options).sort(), ['childList', 'subtree']);
      observed = true;
    }

    disconnect() {
      disconnected = true;
    }
  }

  const sandbox = {
    window: null,
    document,
    MutationObserver: FakeMutationObserver,
    setTimeout(callback) {
      timeoutCallback = callback;
      return 17;
    },
    clearTimeout(id) {
      assert.equal(id, 17);
      clearCalls += 1;
    },
    console,
  };
  sandbox.window = sandbox;
  sandbox.TrueRuslanAiSearch = {
    init() {
      initCalls += 1;
      const mounted = initCalls >= 2;
      if (mounted) switchMounted = true;
      return mounted;
    },
  };

  vm.runInNewContext(source, sandbox, {filename: 'ai-search-bootstrap.js'});
  assert.equal(typeof domReady, 'function', 'bootstrap must defer until DOMContentLoaded while the document is loading');

  domReady();
  assert.equal(initCalls, 1, 'bootstrap must try the existing runtime once at DOMContentLoaded');
  assert.equal(observed, true, 'failed initial mount must observe late hydration');
  assert.equal(disconnected, false);
  assert.equal(typeof mutationCallback, 'function');
  assert.equal(typeof timeoutCallback, 'function', 'hydration protection must have a bounded timeout');

  mutationCallback();
  assert.equal(initCalls, 2, 'late hydration must retry runtime initialization');
  assert.equal(disconnected, false, 'successful initialization must keep observing bounded hydration replacements');
  assert.equal(clearCalls, 0, 'successful initialization must not clear the bounded hydration timeout');

  mutationCallback();
  assert.equal(initCalls, 2, 'unchanged mounted DOM must not duplicate runtime initialization');

  timeoutCallback();
  assert.equal(disconnected, true, 'hydration observer must disconnect at the bounded timeout');
});

test('SEARCH postprocess publishes and injects the late-hydration bootstrap asset', () => {
  const assets = read('scripts/ai-static-assets.js');
  const page = read('scripts/search-page.js');

  assert.match(assets, /_assets\/script\/ai-search-bootstrap\.js/);
  assert.match(page, /const aiBootstrapScript = '_assets\/script\/ai-search-bootstrap\.js'/);
  assert.match(page, /data-tr-ai-resource="bootstrap"/);
  assert.ok(
    page.indexOf('data-tr-ai-resource="runtime"') < page.indexOf('data-tr-ai-resource="bootstrap"'),
    'late-hydration bootstrap must execute after the AI runtime script',
  );
});
