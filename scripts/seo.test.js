import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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

test('getSiteUrl reads the fallback origin from the canonical site manifest', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-origin-'));
  const manifestPath = path.join(tempRoot, 'site.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    legacyOrigin: 'https://legacy.example.test/project',
    customOrigin: 'https://custom.example.test',
    customHostname: 'custom.example.test',
    alternateHostname: 'www.custom.example.test',
  }));

  const originalSiteUrl = process.env.SITE_URL;
  const originalManifestPath = process.env.SITE_MANIFEST_PATH;
  delete process.env.SITE_URL;
  process.env.SITE_MANIFEST_PATH = manifestPath;

  try {
    assert.equal(getSiteUrl(), 'https://legacy.example.test/project');
  } finally {
    if (originalSiteUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = originalSiteUrl;
    if (originalManifestPath === undefined) delete process.env.SITE_MANIFEST_PATH;
    else process.env.SITE_MANIFEST_PATH = originalManifestPath;
  }
});

test('buildPersonJsonLd reflects current engineering positioning', () => {
  const schema = buildPersonJsonLd('https://example.test');

  assert.equal(schema.jobTitle, 'Backend Engineer / Java Developer');
  assert.equal(schema.alternateName, 'Ruslan Nemykin');
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
