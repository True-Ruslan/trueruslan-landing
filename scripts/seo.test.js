import test from 'node:test';
import assert from 'node:assert/strict';

import {collectPagesFromToc, getSiteUrl, injectPersonSchemaIntoHtml} from './seo.js';

test('collectPagesFromToc reads landing pages from toc.yaml', () => {
  const toc = `
href: index.yaml
items:
  - href: ./landing/about.md
  - href: ./landing/resume.md
`;

  assert.deepEqual(collectPagesFromToc(toc), ['', 'landing/about.html', 'landing/resume.html']);
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

test('injectPersonSchemaIntoHtml adds JSON-LD once', () => {
  const html = '<!DOCTYPE html><html><head><title>Home</title></head><body></body></html>';
  const once = injectPersonSchemaIntoHtml(html, 'https://example.test');
  const twice = injectPersonSchemaIntoHtml(once, 'https://example.test');

  assert.match(once, /application\/ld\+json/);
  assert.match(once, /"@type":"Person"/);
  assert.match(once, /https:\/\/example\.test\//);
  assert.equal(once, twice);
});
