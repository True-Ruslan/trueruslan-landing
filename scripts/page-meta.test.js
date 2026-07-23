import test from 'node:test';
import assert from 'node:assert/strict';

import {injectPageMeta, validatePageMeta} from './page-meta.js';

const validEntry = {
  path: 'landing/notes.html',
  card: 'notes',
  title: 'Engineering Notes — Руслан Немыкин',
  description: 'Technical notes about architecture and reliability.',
  displayTitle: 'ENGINEERING NOTES',
  kicker: 'TECHNICAL WRITING',
  tags: ['ARCHITECTURE', 'RELIABILITY'],
  accent: 'cyan',
};

test('validatePageMeta accepts a valid manifest', () => {
  const [entry] = validatePageMeta([validEntry]);
  assert.deepEqual(entry, validEntry);
});

test('validatePageMeta rejects duplicate paths and card slugs', () => {
  assert.throws(
    () => validatePageMeta([validEntry, {...validEntry, card: 'notes-2'}]),
    /Duplicate page metadata path/,
  );
  assert.throws(
    () => validatePageMeta([validEntry, {...validEntry, path: 'landing/other.html'}]),
    /Duplicate OpenGraph card slug/,
  );
});

test('validatePageMeta rejects unsafe paths and unsupported accents', () => {
  assert.throws(
    () => validatePageMeta([{...validEntry, path: '../escape.html'}]),
    /Unsafe page metadata path/,
  );
  assert.throws(
    () => validatePageMeta([{...validEntry, accent: 'red'}]),
    /Unsupported OpenGraph accent/,
  );
});

test('validatePageMeta rejects missing fields and invalid display alphabet', () => {
  const {description, ...missingDescription} = validEntry;
  assert.throws(() => validatePageMeta([missingDescription]), /description/);
  assert.throws(
    () => validatePageMeta([{...validEntry, displayTitle: 'Engineering Notes'}]),
    /uppercase ASCII display alphabet/,
  );
});

test('injectPageMeta replaces stale metadata idempotently', () => {
  const source = `<!doctype html><html><head>
    <title>Old</title>
    <meta name="description" content="old">
    <meta property="og:title" content="old">
    <link rel="canonical" href="https://old.example/page">
  </head><body><h1>Notes</h1></body></html>`;

  const once = injectPageMeta(source, validEntry, 'https://example.test');
  const twice = injectPageMeta(once, validEntry, 'https://example.test');

  assert.equal(once, twice);
  assert.match(once, /Engineering Notes — Руслан Немыкин/);
  assert.match(once, /https:\/\/example\.test\/landing\/notes\.html/);
  assert.match(once, /https:\/\/example\.test\/assets\/og\/notes\.png/);
  assert.match(once, /summary_large_image/);
  assert.equal((once.match(/property="og:title"/g) ?? []).length, 1);
  assert.equal((once.match(/rel="canonical"/g) ?? []).length, 1);
});

test('injectPageMeta canonicalizes nested index pages to their public directory URL', () => {
  const source = '<!doctype html><html><head><title>Old</title></head><body><h1>English home</h1></body></html>';
  const html = injectPageMeta(source, {...validEntry, path: 'en/index.html', card: 'home-en'}, 'https://example.test/site/');

  assert.match(html, /rel="canonical" href="https:\/\/example\.test\/site\/en\/"/);
  assert.match(html, /property="og:url" content="https:\/\/example\.test\/site\/en\/"/);
  assert.doesNotMatch(html, /https:\/\/example\.test\/site\/en\/index\.html/);
});
