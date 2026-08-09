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
    href,
    getAttribute(name) { return attrs.get(name) ?? null; },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    removeAttribute(name) { attrs.delete(name); },
    attrs,
  };
}

test('runtime policy restores new-tab attributes removed after hydration', () => {
  const api = loadApi();
  const search = fakeAnchor('_search/ru/');
  assert.equal(api.normalizeAnchor(search), true);
  assert.equal(search.attrs.get('target'), '_blank');
  assert.equal(search.attrs.get('rel'), 'noopener noreferrer');
  assert.equal(api.normalizeAnchor(search), false, 'second normalization must be idempotent');
});

test('runtime policy preserves existing rel tokens and covers language links', () => {
  const api = loadApi();
  const language = fakeAnchor('https://trueruslan.ru/en/', {rel: 'alternate noopener'});
  assert.equal(api.normalizeAnchor(language), true);
  assert.equal(language.attrs.get('target'), '_blank');
  assert.equal(language.attrs.get('rel'), 'alternate noopener noreferrer');
});

test('runtime policy keeps same-page fragments and protocol actions current-context', () => {
  const api = loadApi();
  const fragment = fakeAnchor('#architecture', {target: '_blank'});
  assert.equal(api.normalizeAnchor(fragment), true);
  assert.equal(fragment.attrs.has('target'), false);

  for (const href of ['mailto:ruslan@example.com', 'tel:+10000000000']) {
    const anchor = fakeAnchor(href);
    assert.equal(api.normalizeAnchor(anchor), false);
    assert.equal(anchor.attrs.has('target'), false);
  }
});
