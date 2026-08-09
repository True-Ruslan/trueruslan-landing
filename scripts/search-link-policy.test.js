import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.join(ROOT, 'docs', '_assets', 'script', 'search-ui.js');

function loadApi() {
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const context = {URL};
  vm.createContext(context);
  vm.runInContext(source, context, {filename: SOURCE_PATH});
  return context.TrueRuslanSearchUI;
}

function fakeAnchor(href, rel = '') {
  const attrs = new Map([['href', href]]);
  if (rel) attrs.set('rel', rel);
  return {
    href,
    getAttribute(name) { return attrs.get(name) ?? null; },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    attrs,
  };
}

test('dynamic search navigation applies the same new-tab policy as final HTML', () => {
  const api = loadApi();
  assert.equal(typeof api.applyNewTabPolicy, 'function');

  const internal = fakeAnchor('/projects/notchhub/');
  assert.equal(api.applyNewTabPolicy(internal), true);
  assert.equal(internal.attrs.get('target'), '_blank');
  assert.equal(internal.attrs.get('rel'), 'noopener noreferrer');

  const external = fakeAnchor('https://github.com/True-Ruslan', 'nofollow noopener');
  assert.equal(api.applyNewTabPolicy(external), true);
  assert.equal(external.attrs.get('target'), '_blank');
  assert.equal(external.attrs.get('rel'), 'nofollow noopener noreferrer');

  for (const href of ['#architecture', 'mailto:ruslan@example.com', 'tel:+10000000000']) {
    const anchor = fakeAnchor(href);
    assert.equal(api.applyNewTabPolicy(anchor), false, `${href} must remain current-context`);
    assert.equal(anchor.attrs.has('target'), false);
  }
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
