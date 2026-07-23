import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  applyAnalytics,
  injectAnalyticsIntoHtml,
  normalizeAnalyticsToken,
  validateAnalyticsPolicy,
} from './analytics.js';

const validPolicy = Object.freeze({
  provider: 'cloudflare-web-analytics',
  measurement: 'pageviews-and-rum',
  activation: 'token-required',
  customEvents: false,
  cookies: false,
  persistentStorage: false,
  crossSiteTracking: false,
  sessionReplay: false,
});

const fakeToken = 'testAnalyticsToken0123456789ABCDEF';

test('validateAnalyticsPolicy accepts the bounded Cloudflare Web Analytics policy', () => {
  assert.deepEqual(validateAnalyticsPolicy({...validPolicy}), validPolicy);
});

test('validateAnalyticsPolicy rejects privacy-expanding policy changes', () => {
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, customEvents: true}),
    /custom events.*forbidden/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, cookies: true}),
    /cookies.*forbidden/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, persistentStorage: true}),
    /persistent storage.*forbidden/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, crossSiteTracking: true}),
    /cross-site tracking.*forbidden/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, sessionReplay: true}),
    /session replay.*forbidden/i,
  );
});

test('validateAnalyticsPolicy rejects unsupported values and unknown fields', () => {
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, provider: 'other'}),
    /unsupported analytics provider/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, measurement: 'everything'}),
    /unsupported analytics measurement/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, activation: 'always-on'}),
    /unsupported analytics activation/i,
  );
  assert.throws(
    () => validateAnalyticsPolicy({...validPolicy, visitorId: false}),
    /unknown analytics policy field/i,
  );
});

test('normalizeAnalyticsToken treats missing or blank configuration as disabled', () => {
  assert.equal(normalizeAnalyticsToken(undefined), null);
  assert.equal(normalizeAnalyticsToken(null), null);
  assert.equal(normalizeAnalyticsToken(''), null);
  assert.equal(normalizeAnalyticsToken('   '), null);
});

test('normalizeAnalyticsToken accepts a bounded public site identifier', () => {
  const token = 'abcDEF0123456789abcDEF0123456789';
  assert.equal(normalizeAnalyticsToken(token), token);
});

test('normalizeAnalyticsToken rejects malformed configured tokens', () => {
  for (const token of ['short', '<script>', 'contains space token', 'a'.repeat(129)]) {
    assert.throws(() => normalizeAnalyticsToken(token), /invalid.*analytics token/i);
  }
});

test('injectAnalyticsIntoHtml is a byte-preserving no-op without a token', () => {
  const source = '<!doctype html><html><head><title>x</title></head><body><main>content</main></body></html>';
  assert.equal(injectAnalyticsIntoHtml(source, validPolicy, null), source);
});

test('injectAnalyticsIntoHtml adds one bounded Cloudflare module beacon and is idempotent', () => {
  const source = '<!doctype html><html><head><title>x</title></head><body><main>content</main></body></html>';
  const enabled = injectAnalyticsIntoHtml(source, validPolicy, fakeToken);

  assert.match(enabled, /data-tr-analytics="cloudflare-web-analytics"/);
  assert.match(enabled, /type="module"/);
  assert.match(enabled, /defer/);
  assert.match(enabled, /https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/);
  assert.match(enabled, /&quot;token&quot;:&quot;testAnalyticsToken0123456789ABCDEF&quot;/);
  assert.match(enabled, /&quot;spa&quot;:false/);
  assert.equal((enabled.match(/data-tr-analytics=/g) ?? []).length, 1);
  assert.equal(injectAnalyticsIntoHtml(enabled, validPolicy, fakeToken), enabled);
  assert.doesNotMatch(enabled, /localStorage|sessionStorage|document\.cookie|customEvent|trackEvent/i);
});

test('applyAnalytics updates every generated HTML file deterministically and no non-HTML files', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-'));
  const files = [
    'index.html',
    'en/index.html',
    'landing/projects.html',
    '_search/ru/index.html',
  ];
  for (const relativePath of files) {
    const target = path.join(outputDir, ...relativePath.split('/'));
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, '<!doctype html><html><head><title>x</title></head><body></body></html>');
  }
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), 'User-agent: *');

  const result = applyAnalytics(outputDir, validPolicy, fakeToken);

  assert.equal(result.enabled, true);
  assert.equal(result.provider, 'cloudflare-web-analytics');
  assert.deepEqual(result.updated, files.slice().sort());
  for (const relativePath of files) {
    const html = fs.readFileSync(path.join(outputDir, ...relativePath.split('/')), 'utf8');
    assert.equal((html.match(/data-tr-analytics=/g) ?? []).length, 1);
    assert.match(html, /testAnalyticsToken0123456789ABCDEF/);
  }
  assert.equal(fs.readFileSync(path.join(outputDir, 'robots.txt'), 'utf8'), 'User-agent: *');
});

test('applyAnalytics leaves generated HTML untouched when analytics is disabled', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-disabled-'));
  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, '<!doctype html><html><head></head><body>unchanged</body></html>');

  const result = applyAnalytics(outputDir, validPolicy, null);

  assert.deepEqual(result, {
    enabled: false,
    updated: [],
    provider: 'cloudflare-web-analytics',
  });
  assert.equal(
    fs.readFileSync(htmlPath, 'utf8'),
    '<!doctype html><html><head></head><body>unchanged</body></html>',
  );
});
