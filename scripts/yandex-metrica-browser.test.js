import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  applyConsentGatedMetrica,
  injectConsentGatedMetricaIntoHtml,
  normalizeMetricaCounterId,
  validateMetricaBrowserPolicy,
} from './yandex-metrica-browser.js';

const validPolicy = Object.freeze({
  provider: 'yandex-metrica',
  measurement: 'aggregate-traffic',
  activation: 'explicit-consent-required',
  providerCookies: 'after-consent-only',
  consentStorage: 'first-party-preference-only',
  sessionReplay: false,
  clickMap: false,
  linkTracking: false,
  accurateBounce: false,
  trackHash: false,
  sendTitle: false,
  customEvents: false,
  userParameters: false,
  ecommerce: false,
  noscriptTracking: false,
});

const fakeCounterId = '987654321';
const sourceHtml = '<!doctype html><html><head><title>x</title></head><body><main>content</main></body></html>';

test('validateMetricaBrowserPolicy accepts the explicit-consent aggregate-only policy', () => {
  assert.deepEqual(validateMetricaBrowserPolicy({...validPolicy}), validPolicy);
});

test('validateMetricaBrowserPolicy rejects privacy-expanding browser tracking options', () => {
  for (const field of [
    'sessionReplay',
    'clickMap',
    'linkTracking',
    'accurateBounce',
    'trackHash',
    'sendTitle',
    'customEvents',
    'userParameters',
    'ecommerce',
    'noscriptTracking',
  ]) {
    assert.throws(
      () => validateMetricaBrowserPolicy({...validPolicy, [field]: true}),
      new RegExp(`${field}.*forbidden`, 'i'),
    );
  }
});

test('validateMetricaBrowserPolicy rejects weakened consent and unknown fields', () => {
  assert.throws(
    () => validateMetricaBrowserPolicy({...validPolicy, activation: 'always-on'}),
    /explicit consent.*required/i,
  );
  assert.throws(
    () => validateMetricaBrowserPolicy({...validPolicy, providerCookies: 'always'}),
    /provider cookies.*after consent/i,
  );
  assert.throws(
    () => validateMetricaBrowserPolicy({...validPolicy, visitorId: false}),
    /unknown.*policy field/i,
  );
});

test('normalizeMetricaCounterId treats missing configuration as disabled', () => {
  assert.equal(normalizeMetricaCounterId(undefined), null);
  assert.equal(normalizeMetricaCounterId(null), null);
  assert.equal(normalizeMetricaCounterId(''), null);
  assert.equal(normalizeMetricaCounterId('   '), null);
});

test('normalizeMetricaCounterId accepts only positive decimal identifiers', () => {
  assert.equal(normalizeMetricaCounterId('111392287'), '111392287');
  assert.equal(normalizeMetricaCounterId(111392287), '111392287');

  for (const value of ['0', '-1', '1.5', 'abc', '111 392 287', '001']) {
    assert.throws(
      () => normalizeMetricaCounterId(value),
      /positive decimal identifier/i,
    );
  }
});

test('injectConsentGatedMetricaIntoHtml is byte-preserving when no counter is configured', () => {
  assert.equal(injectConsentGatedMetricaIntoHtml(sourceHtml, validPolicy, null), sourceHtml);
});

test('injectConsentGatedMetricaIntoHtml adds one consent controller without a static Yandex request', () => {
  const enabled = injectConsentGatedMetricaIntoHtml(sourceHtml, validPolicy, fakeCounterId);

  assert.match(enabled, /data-tr-analytics="yandex-metrica-consent"/);
  assert.match(enabled, /data-tr-metrica-counter="987654321"/);
  assert.equal((enabled.match(/data-tr-analytics="yandex-metrica-consent"/g) ?? []).length, 1);
  assert.doesNotMatch(enabled, /<script[^>]+src=["']https:\/\/mc\.yandex\.ru\//i);
  assert.match(enabled, /https:\/\/mc\.yandex\.ru\/metrika\/tag\.js/);
  assert.match(enabled, /tr_privacy_consent_v1/);
  assert.match(enabled, /disableYaCounter/);

  for (const option of [
    'clickmap:false',
    'trackLinks:false',
    'accurateTrackBounce:false',
    'webvisor:false',
    'trackHash:false',
    'sendTitle:false',
  ]) {
    assert.match(enabled.replaceAll(' ', ''), new RegExp(option, 'i'));
  }

  assert.doesNotMatch(enabled, /<noscript[^>]*>[\s\S]*mc\.yandex\.ru/i);
  assert.doesNotMatch(enabled, /userParams|ecommerce|reachGoal|params\s*:/i);
  assert.equal(injectConsentGatedMetricaIntoHtml(enabled, validPolicy, fakeCounterId), enabled);
});

test('injectConsentGatedMetricaIntoHtml fails closed on malformed enabled HTML', () => {
  assert.throws(
    () => injectConsentGatedMetricaIntoHtml('<html><body>broken', validPolicy, fakeCounterId),
    /body.*not found/i,
  );
});

test('applyConsentGatedMetrica updates HTML files only and reports deterministic targets', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-yandex-metrica-'));
  const files = ['index.html', 'en/index.html', '_search/ru/index.html'];

  for (const relativePath of files) {
    const target = path.join(outputDir, ...relativePath.split('/'));
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, sourceHtml, 'utf8');
  }
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), 'User-agent: *', 'utf8');

  const result = applyConsentGatedMetrica(outputDir, validPolicy, fakeCounterId);

  assert.deepEqual(result, {
    enabled: true,
    provider: 'yandex-metrica',
    updated: files.slice().sort(),
  });
  for (const relativePath of files) {
    const html = fs.readFileSync(path.join(outputDir, ...relativePath.split('/')), 'utf8');
    assert.equal((html.match(/data-tr-analytics="yandex-metrica-consent"/g) ?? []).length, 1);
  }
  assert.equal(fs.readFileSync(path.join(outputDir, 'robots.txt'), 'utf8'), 'User-agent: *');
});

test('applyConsentGatedMetrica is a no-op without a configured counter', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-yandex-metrica-disabled-'));
  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, sourceHtml, 'utf8');

  assert.deepEqual(applyConsentGatedMetrica(outputDir, validPolicy, null), {
    enabled: false,
    provider: 'yandex-metrica',
    updated: [],
  });
  assert.equal(fs.readFileSync(htmlPath, 'utf8'), sourceHtml);
});
