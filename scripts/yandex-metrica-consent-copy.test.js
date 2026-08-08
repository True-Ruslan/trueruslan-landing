import test from 'node:test';
import assert from 'node:assert/strict';

import {injectConsentGatedMetricaIntoHtml, loadMetricaBrowserPolicy} from './yandex-metrica-browser.js';

const html = '<!doctype html><html><head></head><body><main>content</main></body></html>';

test('consent copy names the analytics purpose without exposing provider detail or weakening consent', () => {
  const policy = loadMetricaBrowserPolicy();
  const enabled = injectConsentGatedMetricaIntoHtml(html, policy, '987654321');

  assert.equal(policy.activation, 'explicit-consent-required');
  assert.equal(policy.providerCookies, 'after-consent-only');
  assert.match(enabled, /Cookies для статистики\?/);
  assert.match(enabled, /Analytics cookies\?/);
  assert.match(enabled, /Не разрешать/);
  assert.match(enabled, /Refuse/);
  assert.doesNotMatch(enabled, /anonymous|анонимн/i);
  assert.doesNotMatch(enabled, /Yandex Metrica|Яндекс\.Метрик/i);
  assert.match(enabled, /if\(choice==='granted'\)\{hidePrompt\(\);loadMetrica\(\);return\}/);
  assert.match(enabled, /if\(choice==='denied'\)\{hidePrompt\(\);return\}/);
});
