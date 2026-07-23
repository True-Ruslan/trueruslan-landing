import test from 'node:test';
import assert from 'node:assert/strict';

import {
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
