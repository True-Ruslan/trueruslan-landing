import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_METRICA_BROWSER_POLICY_PATH,
  loadMetricaBrowserPolicy,
} from './yandex-metrica-browser.js';

test('canonical Metrica browser policy is explicit-consent and privacy bounded', () => {
  const policy = loadMetricaBrowserPolicy();

  assert.match(DEFAULT_METRICA_BROWSER_POLICY_PATH, /data[\\/]yandex-metrica-browser\.json$/);
  assert.deepEqual(policy, {
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
});
