import test from 'node:test';
import assert from 'node:assert/strict';

import {
  injectConsentGatedMetricaIntoHtml,
} from './yandex-metrica-browser.js';

const policy = Object.freeze({
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

const html = '<!doctype html><html><head><title>x</title></head><body><main>content</main></body></html>';
const counterId = '987654321';

test('consent controller is compact, purpose-specific and offers equivalent one-click choices', () => {
  const rendered = injectConsentGatedMetricaIntoHtml(html, policy, counterId);

  assert.match(rendered, /Cookies для статистики\?/);
  assert.match(rendered, /Analytics cookies\?/);
  assert.match(rendered, /deny\.setAttribute\('data-tr-consent','denied'\)/);
  assert.match(rendered, /allow\.setAttribute\('data-tr-consent','granted'\)/);
  assert.match(rendered, /deny\.textContent=copy\.deny/);
  assert.match(rendered, /allow\.textContent=copy\.allow/);

  assert.doesNotMatch(rendered, /Разрешить статистику посещений через Яндекс\.Метрику/);
  assert.doesNotMatch(rendered, /traffic statistics via Yandex Metrica/i);
  assert.doesNotMatch(rendered, /tr-metrica-consent__title/);
  assert.doesNotMatch(rendered, /tr-metrica-consent__close/);
  assert.doesNotMatch(rendered, /button\[data-tr-consent="granted"\]\{/);

  const compactCss = rendered.replaceAll(/\s+/g, ' ');
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*left:16px[^}]*bottom:16px/);
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*max-width:min\(520px,calc\(100vw - 32px\)\)/);
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*padding:8px 10px/);
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*font:12px\/1\.2/);
  assert.match(compactCss, /\.tr-metrica-consent button\[data-tr-consent\]\{[^}]*min-height:32px[^}]*padding:5px 9px/);
});

test('explicit refusal and grant are separate choices and only grant can load the provider', () => {
  const rendered = injectConsentGatedMetricaIntoHtml(html, policy, counterId);

  assert.match(rendered, /deny\.addEventListener\('click',function\(\)\{choose\('denied'\)\}\)/);
  assert.match(rendered, /allow\.addEventListener\('click',function\(\)\{choose\('granted'\)\}\)/);
  assert.match(rendered, /if\(choice==='granted'\)\{hidePrompt\(\);loadMetrica\(\);return\}/);
  assert.match(rendered, /if\(choice==='denied'\)\{hidePrompt\(\);return\}/);
  assert.doesNotMatch(rendered, /setTimeout\([^)]*loadMetrica/);
});

test('consent is one-shot with no reopen control and no automatic dismiss timer', () => {
  const rendered = injectConsentGatedMetricaIntoHtml(html, policy, counterId);

  assert.doesNotMatch(rendered, /tr-metrica-settings/);
  assert.doesNotMatch(rendered, /data-tr-metrica-settings/);
  assert.doesNotMatch(rendered, /settings\.addEventListener/);
  assert.doesNotMatch(rendered, /settings:'Cookies'/);
  assert.doesNotMatch(rendered, /setTimeout\s*\(/);
});
