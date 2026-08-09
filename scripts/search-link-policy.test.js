import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.join(ROOT, 'docs', '_assets', 'script', 'search-ui.js');

function loadApi(extraContext = {}) {
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const context = {URL, ...extraContext};
  vm.createContext(context);
  vm.runInContext(source, context, {filename: SOURCE_PATH});
  return context.TrueRuslanSearchUI;
}

function fakeAnchor(href, rel = '', target = null) {
  const attrs = new Map([['href', href]]);
  if (rel) attrs.set('rel', rel);
  if (target) attrs.set('target', target);
  return {
    href,
    getAttribute(name) { return attrs.get(name) ?? null; },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    removeAttribute(name) { attrs.delete(name); },
    attrs,
  };
}

test('dynamic search navigation keeps same-site links current-context and external links safe-new-tab', () => {
  const api = loadApi();
  assert.equal(typeof api.applyLinkPolicy, 'function');
  assert.equal(typeof api.applyNewTabPolicy, 'function', 'compatibility alias must remain available');

  const internal = fakeAnchor('/projects/notchhub/', 'noopener noreferrer', '_blank');
  assert.equal(api.applyLinkPolicy(internal), true);
  assert.equal(internal.attrs.has('target'), false);

  const absoluteInternal = fakeAnchor('https://trueruslan.ru/work-with-me/');
  assert.equal(api.applyLinkPolicy(absoluteInternal), false);
  assert.equal(absoluteInternal.attrs.has('target'), false);

  const external = fakeAnchor('https://github.com/True-Ruslan', 'nofollow noopener');
  assert.equal(api.applyLinkPolicy(external), true);
  assert.equal(external.attrs.get('target'), '_blank');
  assert.equal(external.attrs.get('rel'), 'nofollow noopener noreferrer');

  for (const href of ['#architecture', 'mailto:nemykin@true-ruslan.ru', 'tel:+10000000000']) {
    const anchor = fakeAnchor(href);
    assert.equal(api.applyLinkPolicy(anchor), false, `${href} must remain current-context`);
    assert.equal(anchor.attrs.has('target'), false);
  }
});

test('search fallback treats the active deployment origin as internal', () => {
  const location = new URL('http://127.0.0.1:4192/_search/ru/');
  const api = loadApi({location});
  const result = fakeAnchor('http://127.0.0.1:4192/en/work-with-me/', 'noopener noreferrer', '_blank');

  assert.equal(api.shouldOpenInNewContext(result.href), false);
  assert.equal(api.applyLinkPolicy(result), true);
  assert.equal(result.attrs.has('target'), false);
  assert.equal(result.attrs.has('rel'), false);
});

test('search UI delegates link ownership to the shared runtime policy when available', () => {
  const calls = [];
  const shared = {
    shouldOpenInNewContext(href) {
      calls.push(['classify', href]);
      return href.startsWith('https://external.example/');
    },
    normalizeAnchor(anchor) {
      calls.push(['normalize', anchor.getAttribute('href')]);
      anchor.removeAttribute('target');
      return true;
    },
  };
  const api = loadApi({TrueRuslanLinkPolicy: shared});
  const anchor = fakeAnchor('/notes/', '', '_blank');

  assert.equal(api.shouldOpenInNewContext('https://external.example/page'), true);
  assert.equal(api.applyLinkPolicy(anchor), true);
  assert.equal(anchor.attrs.has('target'), false);
  assert.deepEqual(calls, [
    ['classify', 'https://external.example/page'],
    ['normalize', '/notes/'],
  ]);
});

test('search back control resolves a real same-origin referrer without history replacement', () => {
  const api = loadApi();
  const location = {href: 'https://trueruslan.ru/_search/ru/', origin: 'https://trueruslan.ru'};
  const document = {referrer: 'https://trueruslan.ru/projects/notchhub/'};

  assert.equal(api.canReturnToReferrer(document, location), true);
  assert.equal(api.resolveBackHref(document, location), 'https://trueruslan.ru/projects/notchhub/');
  assert.equal(
    api.resolveBackHref({referrer: 'https://example.com/'}, location),
    'https://trueruslan.ru/',
  );

  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  assert.doesNotMatch(source, /history\.back\s*\(/, 'search must not replace the current tab through history.back');
});
