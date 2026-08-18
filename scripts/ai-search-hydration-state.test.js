import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = fs.readFileSync(path.join(ROOT, 'docs/_assets/script/ai-search-bootstrap.js'), 'utf8');

function runHarness({enabled}) {
  let form = {id: 'form-v1'};
  let input = {closest: (selector) => selector === 'form' ? form : null};
  let mounted = true;
  let switchEnabled = enabled;
  let observerCallback = null;
  let removedMounts = 0;
  let restoredClicks = 0;
  let initCalls = 0;

  function makeControl() {
    return {
      getAttribute(name) {
        return name === 'aria-checked' ? (switchEnabled ? 'true' : 'false') : null;
      },
      closest(selector) {
        if (selector !== '.tr-ai-switch') return null;
        return {
          remove() {
            mounted = false;
            removedMounts += 1;
          },
        };
      },
      click() {
        switchEnabled = !switchEnabled;
        restoredClicks += 1;
      },
    };
  }

  let control = makeControl();
  const document = {
    readyState: 'complete',
    documentElement: {dataset: {trAiMode: 'search'}},
    querySelector(selector) {
      if (selector.includes('.tr-ai-switch')) return mounted ? control : null;
      if (selector.includes('.tr-search-input') || selector.includes('input[type="search"]')) return input;
      if (selector.includes('.tr-search-button')) return null;
      return null;
    },
  };

  class MutationObserver {
    constructor(callback) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {}
  }

  const window = {
    document,
    MutationObserver,
    TrueRuslanAiSearch: {
      init() {
        initCalls += 1;
        mounted = true;
        switchEnabled = false;
        control = makeControl();
        return true;
      },
    },
    setTimeout() { return 1; },
    clearTimeout() {},
    console: {warn() {}},
  };
  window.window = window;
  window.globalThis = window;

  vm.runInNewContext(SOURCE, window, {filename: 'ai-search-bootstrap.js'});

  form = {id: 'form-v2'};
  input = {closest: (selector) => selector === 'form' ? form : null};
  assert.equal(typeof observerCallback, 'function');
  observerCallback([]);

  return {removedMounts, restoredClicks, initCalls, switchEnabled};
}

test('hydration rebind replaces the stale mounted switch and restores explicit AI opt-in', () => {
  const result = runHarness({enabled: true});
  assert.equal(result.initCalls, 1, 'changed live binding must initialize exactly once');
  assert.equal(result.removedMounts, 1, 'stale switch must be removed so old listener closures cannot survive');
  assert.equal(result.restoredClicks, 1, 'explicit enabled state must be restored only on the fresh switch');
  assert.equal(result.switchEnabled, true, 'AI must remain explicitly enabled after the live form is rebound');
});

test('hydration rebind keeps an explicitly disabled switch disabled', () => {
  const result = runHarness({enabled: false});
  assert.equal(result.initCalls, 1);
  assert.equal(result.removedMounts, 1);
  assert.equal(result.restoredClicks, 0, 'disabled state must not trigger a synthetic opt-in');
  assert.equal(result.switchEnabled, false);
});
