import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.join(ROOT, 'docs', '_assets', 'script', 'link-policy-runtime.js');

function loadApi() {
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const context = {URL};
  vm.createContext(context);
  vm.runInContext(source, context, {filename: SOURCE_PATH});
  return context.TrueRuslanLinkPolicy;
}

function fakeAnchor(href, {target = null, rel = ''} = {}) {
  const attrs = new Map([['href', href]]);
  if (target) attrs.set('target', target);
  if (rel) attrs.set('rel', rel);
  return {
    tagName: 'A',
    href,
    getAttribute(name) { return attrs.get(name) ?? null; },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    removeAttribute(name) { attrs.delete(name); },
    closest(selector) { return selector === 'a[href]' ? this : null; },
    attrs,
  };
}

test('runtime policy keeps relative same-site navigation in the current tab', () => {
  const api = loadApi();
  const search = fakeAnchor('_search/ru/');
  assert.equal(api.normalizeAnchor(search), false);
  assert.equal(search.attrs.has('target'), false);
  assert.equal(search.attrs.has('rel'), false);
});

test('runtime policy strips stale new-tab policy from same-site language links', () => {
  const api = loadApi();
  const language = fakeAnchor('https://trueruslan.ru/en/', {target: '_blank', rel: 'alternate noopener noreferrer'});
  assert.equal(api.normalizeAnchor(language), true);
  assert.equal(language.attrs.has('target'), false);
  assert.equal(language.attrs.get('rel'), 'alternate');
  assert.equal(api.normalizeAnchor(language), false, 'second normalization must be idempotent');
});

test('runtime policy adds safe new-tab attributes only to external web links', () => {
  const api = loadApi();
  const github = fakeAnchor('https://github.com/True-Ruslan', {rel: 'nofollow'});
  assert.equal(api.normalizeAnchor(github), true);
  assert.equal(github.attrs.get('target'), '_blank');
  assert.equal(github.attrs.get('rel'), 'nofollow noopener noreferrer');
});

test('runtime policy keeps same-page fragments and protocol actions current-context', () => {
  const api = loadApi();
  const fragment = fakeAnchor('#architecture', {target: '_blank'});
  assert.equal(api.normalizeAnchor(fragment), true);
  assert.equal(fragment.attrs.has('target'), false);

  for (const href of ['mailto:nemykin@true-ruslan.ru', 'tel:+10000000000']) {
    const anchor = fakeAnchor(href);
    assert.equal(api.normalizeAnchor(anchor), false);
    assert.equal(anchor.attrs.has('target'), false);
  }
});

test('interaction guard repairs a stale internal target before pointer/click default navigation', () => {
  const api = loadApi();
  const listeners = new Map();
  const document = {
    documentElement: {dataset: {}},
    addEventListener(type, listener, capture) {
      listeners.set(type, {listener, capture});
    },
  };
  assert.equal(api.installInteractionGuard(document), true);
  assert.equal(listeners.get('pointerdown')?.capture, true);
  assert.equal(listeners.get('click')?.capture, true);

  const internal = fakeAnchor('/en/work-with-me/', {target: '_blank', rel: 'noopener noreferrer'});
  listeners.get('click').listener({target: internal});
  assert.equal(internal.attrs.has('target'), false);
  assert.equal(internal.attrs.has('rel'), false);
  assert.equal(api.installInteractionGuard(document), true, 'guard installation must be idempotent');
});
