import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parse} from 'parse5';

import {injectPageMeta, loadPageMeta} from './page-meta.js';
import {toPublicRoute} from './clean-urls.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://trueruslan.ru/';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function attribute(node, name) {
  return node?.attrs?.find((item) => item.name === name)?.value ?? null;
}

function findElement(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes ?? []) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}

function findMeta(document, key, value) {
  const node = findElement(
    document,
    (candidate) => candidate.nodeName === 'meta' && attribute(candidate, key) === value,
  );
  return attribute(node, 'content');
}

function findCanonical(document) {
  const node = findElement(
    document,
    (candidate) => candidate.nodeName === 'link' && attribute(candidate, 'rel') === 'canonical',
  );
  return attribute(node, 'href');
}

function expectedPublicUrl(pagePath) {
  return new URL(toPublicRoute(pagePath, SITE_URL), SITE_URL).href;
}

function expectedLocale(pagePath) {
  return pagePath === 'en/index.html' || pagePath.startsWith('en/') ? 'en_US' : 'ru_RU';
}

test('every launch distribution target has a complete clean social preview contract', () => {
  const targets = readJson('data/distribution-targets.json');
  const metadata = loadPageMeta();
  const metadataByPath = new Map(metadata.map((entry) => [entry.path, entry]));
  const errors = [];

  assert.ok(targets.length > 0, 'launch distribution registry must not be empty');

  for (const target of targets) {
    const entry = metadataByPath.get(target.pagePath);
    if (!entry) {
      errors.push(`${target.id}: missing page metadata for ${target.pagePath}`);
      continue;
    }

    const document = parse(injectPageMeta(
      '<!doctype html><html><head><title>Fixture</title></head><body></body></html>',
      entry,
      SITE_URL,
    ));
    const canonical = findCanonical(document);
    const ogUrl = findMeta(document, 'property', 'og:url');
    const expectedUrl = expectedPublicUrl(target.pagePath);
    const imageAlt = `${entry.displayTitle} — ${entry.kicker}`;

    const checks = [
      ['canonical', canonical, expectedUrl],
      ['og:url', ogUrl, expectedUrl],
      ['og:title', findMeta(document, 'property', 'og:title'), entry.title],
      ['og:description', findMeta(document, 'property', 'og:description'), entry.description],
      ['og:type', findMeta(document, 'property', 'og:type'), 'website'],
      ['og:site_name', findMeta(document, 'property', 'og:site_name'), 'TrueRuslan'],
      ['og:locale', findMeta(document, 'property', 'og:locale'), expectedLocale(target.pagePath)],
      ['og:image:type', findMeta(document, 'property', 'og:image:type'), 'image/png'],
      ['og:image:width', findMeta(document, 'property', 'og:image:width'), '1200'],
      ['og:image:height', findMeta(document, 'property', 'og:image:height'), '630'],
      ['og:image:alt', findMeta(document, 'property', 'og:image:alt'), imageAlt],
      ['twitter:card', findMeta(document, 'name', 'twitter:card'), 'summary_large_image'],
      ['twitter:title', findMeta(document, 'name', 'twitter:title'), entry.title],
      ['twitter:description', findMeta(document, 'name', 'twitter:description'), entry.description],
      ['twitter:image:alt', findMeta(document, 'name', 'twitter:image:alt'), imageAlt],
    ];

    for (const [field, actual, expected] of checks) {
      if (actual !== expected) errors.push(`${target.id}: ${field} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }

    const ogImage = findMeta(document, 'property', 'og:image');
    const twitterImage = findMeta(document, 'name', 'twitter:image');
    const expectedImage = `${SITE_URL}assets/og/${entry.card}.png`;
    if (ogImage !== expectedImage) errors.push(`${target.id}: og:image expected ${expectedImage}, got ${ogImage}`);
    if (twitterImage !== ogImage) errors.push(`${target.id}: twitter:image must match og:image`);

    for (const [field, url] of [['canonical', canonical], ['og:url', ogUrl]]) {
      if (!url) continue;
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') errors.push(`${target.id}: ${field} must use HTTPS`);
      if (parsed.origin !== new URL(SITE_URL).origin) errors.push(`${target.id}: ${field} escaped canonical origin`);
      if (parsed.search || parsed.hash) errors.push(`${target.id}: ${field} must not carry search/hash state`);
      if (parsed.pathname.includes('.html') || parsed.pathname.startsWith('/landing/')) {
        errors.push(`${target.id}: ${field} leaked legacy source route ${parsed.pathname}`);
      }
      if (parsed.pathname !== '/' && !parsed.pathname.endsWith('/')) {
        errors.push(`${target.id}: ${field} must be directory-style`);
      }
    }
  }

  assert.deepEqual(errors, []);
});

test('launch preview metadata rejects non-HTTPS site origins', () => {
  const [entry] = loadPageMeta();
  assert.throws(
    () => injectPageMeta(
      '<!doctype html><html><head><title>Fixture</title></head><body></body></html>',
      entry,
      'http://trueruslan.ru/',
    ),
    /Invalid page metadata site URL/,
  );
});
