import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPersonJsonLd,
  collectPagesFromToc,
  getSiteUrl,
  injectPersonSchemaIntoHtml,
} from './seo.js';

test('collectPagesFromToc reads and deduplicates markdown pages from toc.yaml', () => {
  const toc = `
href: index.yaml
items:
  - href: ./landing/about.md
  - href: ./landing/system-design_2026.md
  - href: ./notes/backend/java-21.md
  - href: ./landing/about.md
`;

  assert.deepEqual(collectPagesFromToc(toc), [
    '',
    'landing/about.html',
    'landing/system-design_2026.html',
    'notes/backend/java-21.html',
  ]);
});

test('getSiteUrl prefers SITE_URL env variable', () => {
  const original = process.env.SITE_URL;
  process.env.SITE_URL = 'https://example.test/';

  try {
    assert.equal(getSiteUrl(), 'https://example.test');
  } finally {
    if (original === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = original;
    }
  }
});

test('buildPersonJsonLd reflects current engineering positioning', () => {
  const schema = buildPersonJsonLd('https://example.test');

  assert.equal(schema.jobTitle, 'Backend Engineer / Java Developer');
  assert.ok(schema.knowsAbout.includes('Java'));
  assert.ok(schema.knowsAbout.includes('Distributed Systems'));
  assert.equal(schema.url, 'https://example.test/');
});

test('injectPersonSchemaIntoHtml adds JSON-LD once', () => {
  const html = '<!DOCTYPE html><html><head><title>Home</title></head><body></body></html>';
  const once = injectPersonSchemaIntoHtml(html, 'https://example.test');
  const twice = injectPersonSchemaIntoHtml(once, 'https://example.test');

  assert.match(once, /application\/ld\+json/);
  assert.match(once, /"@type":"Person"/);
  assert.match(once, /Backend Engineer \/ Java Developer/);
  assert.match(once, /https:\/\/example\.test\//);
  assert.equal(once, twice);
});
