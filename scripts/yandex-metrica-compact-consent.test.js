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

test('consent controller renders a compact neutral cookie prompt with one primary action and a close control', () => {
  const rendered = injectConsentGatedMetricaIntoHtml(html, policy, counterId);

  assert.match(rendered, /Разрешить cookies\?/);
  assert.match(rendered, /Allow cookies\?/);
  assert.match(rendered, /data-tr-consent="granted"/);
  assert.match(rendered, /data-tr-consent="denied"/);
  assert.match(rendered, /tr-metrica-consent__close/);
  assert.match(rendered, /aria-label/);

  assert.doesNotMatch(rendered, /Разрешить статистику посещений через Яндекс\.Метрику/);
  assert.doesNotMatch(rendered, /Allow traffic statistics via Yandex Metrica/);
  assert.doesNotMatch(rendered, />Отказаться</);
  assert.doesNotMatch(rendered, />Decline</);
  assert.doesNotMatch(rendered, /tr-metrica-consent__title/);

  const compactCss = rendered.replaceAll(/\s+/g, ' ');
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*left:16px[^}]*bottom:16px/);
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*max-width:min\(360px,calc\(100vw - 32px\)\)/);
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*padding:10px 12px/);
  assert.match(compactCss, /\.tr-metrica-consent\{[^}]*font:13px\/1\.25/);
});

test('close control is an explicit non-consent path and never loads the provider before a grant', () => {
  const rendered = injectConsentGatedMetricaIntoHtml(html, policy, counterId);

  assert.match(rendered, /close\.setAttribute\('data-tr-consent','denied'\)/);
  assert.match(rendered, /close\.addEventListener\('click',function\(\)\{choose\('denied'\)\}\)/);
  assert.match(rendered, /if\(choice==='granted'\)\{hidePrompt\(\);loadMetrica\(\);return\}/);
  assert.match(rendered, /if\(choice==='denied'\)\{hidePrompt\(\);return\}/);
  assert.doesNotMatch(rendered, /setTimeout\([^)]*loadMetrica/);
});
