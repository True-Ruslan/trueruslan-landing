import test from 'node:test';
import assert from 'node:assert/strict';

import {
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
