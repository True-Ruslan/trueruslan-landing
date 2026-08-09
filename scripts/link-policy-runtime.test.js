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

function fakeClick(target, overrides = {}) {
  return {
    target,
    button: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    prevented: false,
    stopped: false,
    preventDefault() {
      this.defaultPrevented = true;
      this.prevented = true;
    },
    stopImmediatePropagation() {
      this.stopped = true;
    },
    ...overrides,
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

test('interaction guard owns ordinary internal clicks before third-party handlers can reopen a popup', () => {
  const api = loadApi();
  const listeners = new Map();
  const assigned = [];
  const document = {
    documentElement: {dataset: {}},
    addEventListener(type, listener, capture) {
      listeners.set(type, {listener, capture});
    },
  };
  const rootObject = {
    location: {
      href: 'https://trueruslan.ru/_search/ru/',
      assign(value) { assigned.push(value); },
    },
  };

  assert.equal(api.installInteractionGuard(document, rootObject), true);
  assert.equal(listeners.get('pointerdown')?.capture, true);
  assert.equal(listeners.get('click')?.capture, true);

  const internal = fakeAnchor('/en/work-with-me/', {target: '_blank', rel: 'noopener noreferrer'});
  const click = fakeClick(internal);
  listeners.get('click').listener(click);

  assert.equal(click.prevented, true, 'ordinary internal click must suppress third-party/default popup navigation');
  assert.equal(click.stopped, true, 'ordinary internal click must stop later third-party click handlers');
  assert.deepEqual(assigned, ['https://trueruslan.ru/en/work-with-me/']);
  assert.equal(internal.attrs.has('target'), false);
  assert.equal(internal.attrs.has('rel'), false);
  assert.equal(api.installInteractionGuard(document, rootObject), true, 'guard installation must be idempotent');
});

test('interaction guard preserves explicit modified/middle-click and external navigation semantics', () => {
  const api = loadApi();
  const listeners = new Map();
  const assigned = [];
  const document = {
    documentElement: {dataset: {}},
    addEventListener(type, listener, capture) {
      listeners.set(type, {listener, capture});
    },
  };
  const rootObject = {
    location: {
      href: 'https://trueruslan.ru/_search/ru/',
      assign(value) { assigned.push(value); },
    },
  };
  api.installInteractionGuard(document, rootObject);

  for (const overrides of [{metaKey: true}, {ctrlKey: true}, {shiftKey: true}, {button: 1}]) {
    const click = fakeClick(fakeAnchor('/projects/notchhub/'), overrides);
    listeners.get('click').listener(click);
    assert.equal(click.prevented, false);
    assert.equal(click.stopped, false);
  }

  const external = fakeClick(fakeAnchor('https://github.com/True-Ruslan'));
  listeners.get('click').listener(external);
  assert.equal(external.prevented, false);
  assert.equal(external.stopped, false);

  const mailto = fakeClick(fakeAnchor('mailto:nemykin@true-ruslan.ru'));
  listeners.get('click').listener(mailto);
  assert.equal(mailto.prevented, false);
  assert.equal(mailto.stopped, false);
  assert.deepEqual(assigned, []);
});
