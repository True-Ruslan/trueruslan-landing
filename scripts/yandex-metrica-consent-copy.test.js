import test from 'node:test';
import assert from 'node:assert/strict';

import {injectConsentGatedMetricaIntoHtml, loadMetricaBrowserPolicy} from './yandex-metrica-browser.js';

const html = '<!doctype html><html><head></head><body><main>content</main></body></html>';

test('consent copy describes provider cookies without promising anonymity', () => {
  const enabled = injectConsentGatedMetricaIntoHtml(html, loadMetricaBrowserPolicy(), '987654321');
  assert.doesNotMatch(enabled, /anonymous|анонимн/i);
  assert.match(enabled, /traffic statistics/i);
  assert.match(enabled, /статистик[ау] посещений/i);
  assert.match(enabled, /cookies/i);
});
