import test from 'node:test';
import assert from 'node:assert/strict';

import {
  injectI18nLinks,
  loadI18nManifest,
  validateI18nManifest,
} from './i18n.js';

const REQUIRED_PAIRS = [
  'home',
  'about',
  'resume',
  'projects',
  'livingworld',
  'portfolio-platform',
  'note-ai-npcs',
  'note-llm-protocol-boundary',
];

const validPairs = [
  {id: 'home', ru: 'index.html', en: 'en/index.html'},
  {id: 'about', ru: 'landing/about.html', en: 'en/about.html'},
];

test('canonical i18n manifest contains the controlled eight-page milestone', () => {
  const pairs = loadI18nManifest();
  assert.deepEqual(pairs.map((pair) => pair.id).sort(), [...REQUIRED_PAIRS].sort());
});

test('validateI18nManifest rejects duplicate ids, duplicate paths and unsafe paths', () => {
  assert.throws(
    () => validateI18nManifest([...validPairs, {...validPairs[1], en: 'en/about-2.html'}]),
    /duplicate i18n id/i,
  );
  assert.throws(
    () => validateI18nManifest([...validPairs, {id: 'resume', ru: 'landing/resume.html', en: 'en/about.html'}]),
    /duplicate i18n path/i,
  );
  assert.throws(
    () => validateI18nManifest([{id: 'bad', ru: '../escape.html', en: 'en/bad.html'}]),
    /unsafe i18n path/i,
  );
});

test('injectI18nLinks exposes paired-route metadata without rendering a floating language control', () => {
  const source = '<!doctype html><html lang="ru"><head><title>Test</title></head><body><main><h1>Test</h1></main></body></html>';
  const pair = {id: 'about', ru: 'landing/about.html', en: 'en/about.html'};
  const once = injectI18nLinks(source, {pair, locale: 'en', siteUrl: 'https://example.test/site/'});
  const twice = injectI18nLinks(once, {pair, locale: 'en', siteUrl: 'https://example.test/site/'});

  assert.equal(once, twice);
  assert.match(once, /<html[^>]*lang="en"/);
  assert.match(once, /data-tr-i18n-locale="en"/);
  assert.match(once, /data-tr-i18n-ru="https:\/\/example\.test\/site\/landing\/about\.html"/);
  assert.match(once, /data-tr-i18n-en="https:\/\/example\.test\/site\/en\/about\.html"/);
  assert.match(once, /hreflang="ru"[^>]*https:\/\/example\.test\/site\/landing\/about\.html/);
  assert.match(once, /hreflang="en"[^>]*https:\/\/example\.test\/site\/en\/about\.html/);
  assert.match(once, /hreflang="x-default"[^>]*https:\/\/example\.test\/site\/landing\/about\.html/);
  assert.doesNotMatch(once, /data-tr-language-switcher/);
  assert.doesNotMatch(once, /position:fixed;right:14px;bottom:14px/);
});

test('home pair receives the dedicated header utility assets exactly once', () => {
  const source = '<!doctype html><html lang="ru"><head><title>Home</title></head><body><main><h1>Home</h1></main></body></html>';
  const pair = {id: 'home', ru: 'index.html', en: 'en/index.html'};
  const once = injectI18nLinks(source, {pair, locale: 'ru', siteUrl: 'https://example.test/site/'});
  const twice = injectI18nLinks(once, {pair, locale: 'ru', siteUrl: 'https://example.test/site/'});

  assert.equal(once, twice);
  assert.equal((once.match(/header-utilities\.css/g) || []).length, 1);
  assert.equal((once.match(/header-utilities\.js/g) || []).length, 1);
  assert.match(once, /<link[^>]*href="_assets\/style\/header-utilities\.css"/);
  assert.match(once, /<script[^>]*src="_assets\/script\/header-utilities\.js"[^>]*defer/);
});
