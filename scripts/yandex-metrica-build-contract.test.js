import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {runMetricaBrowserPostprocess} from './yandex-metrica-browser-cli.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

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

test('copy-assets runs consent-gated Metrica only after clean URLs have produced final HTML', () => {
  assert.equal(packageJson.scripts['postprocess:yandex-metrica'], 'node scripts/yandex-metrica-browser-cli.js');
  assert.match(
    packageJson.scripts['copy-assets'],
    /postprocess:clean-urls\s*&&\s*npm run postprocess:yandex-metrica$/,
  );
});

test('final Metrica postprocessor injects all final HTML and returns bounded summary', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-final-'));
  const outputDir = path.join(root, 'docs-html');
  const policyPath = path.join(root, 'policy.json');
  fs.mkdirSync(path.join(outputDir, 'landing', 'about'), {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'index.html'), '<html><head></head><body>home</body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'about', 'index.html'), '<html><head></head><body>about</body></html>');
  fs.writeFileSync(policyPath, JSON.stringify(validPolicy));

  const result = runMetricaBrowserPostprocess({
    outputDir,
    policyPath,
    counterId: '987654321',
  });

  assert.deepEqual(result, {
    enabled: true,
    provider: 'yandex-metrica',
    updated: ['index.html', 'landing/about/index.html'],
  });
  for (const target of result.updated) {
    const html = fs.readFileSync(path.join(outputDir, ...target.split('/')), 'utf8');
    assert.match(html, /data-tr-analytics="yandex-metrica-consent"/);
  }
});

test('final Metrica postprocessor remains a no-op when deployment did not configure a counter', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-final-disabled-'));
  const outputDir = path.join(root, 'docs-html');
  const policyPath = path.join(root, 'policy.json');
  const source = '<html><head></head><body>home</body></html>';
  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'index.html'), source);
  fs.writeFileSync(policyPath, JSON.stringify(validPolicy));

  assert.deepEqual(runMetricaBrowserPostprocess({outputDir, policyPath, counterId: null}), {
    enabled: false,
    provider: 'yandex-metrica',
    updated: [],
  });
  assert.equal(fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8'), source);
});
