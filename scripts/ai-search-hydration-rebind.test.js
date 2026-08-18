import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOTSTRAP_SOURCE = fs.readFileSync(
  path.join(ROOT, 'docs/_assets/script/ai-search-bootstrap.js'),
  'utf8',
);

function createInput(form) {
  return {
    closest(selector) {
      return selector === 'form' ? form : null;
    },
  };
}

function runBootstrap({mounted = true} = {}) {
  let currentForm = {id: 'form-v1'};
  let currentInput = createInput(currentForm);
  let switchMounted = mounted;
  let observerCallback = null;
  let observerDisconnects = 0;
  let initCalls = 0;

  const document = {
    readyState: 'complete',
    documentElement: {dataset: {trAiMode: 'search'}},
    querySelector(selector) {
      if (selector.includes('.tr-ai-switch')) return switchMounted ? {id: 'switch'} : null;
      if (selector.includes('.tr-search-input') || selector.includes('input[type="search"]')) return currentInput;
      if (selector.includes('.tr-search-button')) return null;
      return null;
    },
  };

  class MutationObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe() {}

    disconnect() {
      observerDisconnects += 1;
    }
  }

  const window = {
    document,
    MutationObserver,
    TrueRuslanAiSearch: {
      init() {
        initCalls += 1;
        switchMounted = true;
        return true;
      },
    },
    setTimeout(callback) {
      window.timeoutCallback = callback;
      return 1;
    },
    clearTimeout() {},
    console: {warn() {}},
  };
  window.window = window;
  window.globalThis = window;

  vm.runInNewContext(BOOTSTRAP_SOURCE, window, {filename: 'ai-search-bootstrap.js'});

  return {
    get initCalls() { return initCalls; },
    get observerCallback() { return observerCallback; },
    get observerDisconnects() { return observerDisconnects; },
    replaceHydratedForm() {
      currentForm = {id: 'form-v2'};
      currentInput = createInput(currentForm);
    },
    fireMutation() {
      assert.equal(typeof observerCallback, 'function', 'bootstrap must keep a bounded hydration observer');
      observerCallback([]);
    },
    fireTimeout() {
      assert.equal(typeof window.timeoutCallback, 'function');
      window.timeoutCallback();
    },
  };
}

test('mounted SEARCH bootstrap rebinds exactly once when Diplodoc replaces the live search form', () => {
  const harness = runBootstrap({mounted: true});

  assert.equal(harness.initCalls, 0, 'healthy initial binding must not be duplicated');
  assert.equal(typeof harness.observerCallback, 'function', 'mounted SEARCH must still watch bounded hydration changes');

  harness.replaceHydratedForm();
  harness.fireMutation();
  assert.equal(harness.initCalls, 1, 'new live form must receive a fresh AI binding');

  harness.fireMutation();
  assert.equal(harness.initCalls, 1, 'unrelated later mutations must not duplicate listeners');

  harness.fireTimeout();
  assert.equal(harness.observerDisconnects, 1, 'hydration observer must remain bounded');
});

test('late SEARCH mount stays observed after first successful init without duplicate rebinding', () => {
  const harness = runBootstrap({mounted: false});

  assert.equal(harness.initCalls, 1, 'bootstrap must mount once when the switch is initially absent');
  assert.equal(typeof harness.observerCallback, 'function', 'successful first mount must not disable hydration protection');

  harness.fireMutation();
  assert.equal(harness.initCalls, 1, 'same live form must not be rebound after unrelated mutations');
});
