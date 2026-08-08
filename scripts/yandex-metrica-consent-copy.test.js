import test from 'node:test';
import assert from 'node:assert/strict';

import {injectConsentGatedMetricaIntoHtml, loadMetricaBrowserPolicy} from './yandex-metrica-browser.js';

const html = '<!doctype html><html><head></head><body><main>content</main></body></html>';

test('consent copy stays neutral while provider cookies remain gated behind explicit consent', () => {
  const policy = loadMetricaBrowserPolicy();
  const enabled = injectConsentGatedMetricaIntoHtml(html, policy, '987654321');

  assert.equal(policy.activation, 'explicit-consent-required');
  assert.equal(policy.providerCookies, 'after-consent-only');
  assert.match(enabled, /Разрешить cookies\?/);
  assert.match(enabled, /Allow cookies\?/);
  assert.doesNotMatch(enabled, /anonymous|анонимн/i);
  assert.doesNotMatch(enabled, /traffic statistics|статистик[ау] посещений/i);
  assert.doesNotMatch(enabled, /Yandex Metrica|Яндекс\.Метрик/i);
  assert.match(enabled, /if\(choice==='granted'\)\{hidePrompt\(\);loadMetrica\(\);return\}/);
  assert.match(enabled, /if\(choice==='denied'\)\{hidePrompt\(\);return\}/);
});
