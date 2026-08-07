import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  inspectMetricaBrowserHtml,
  verifyMetricaBrowserArtifact,
  writeMetricaBrowserDeploymentReport,
} from './yandex-metrica-browser-deployment.js';
import {injectConsentGatedMetricaIntoHtml} from './yandex-metrica-browser.js';

const fakeCounterId = '987654321';
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

function plainHtml(label = 'Page') {
  return `<!doctype html><html><head><title>${label}</title></head><body><main>${label}</main></body></html>`;
}

function enabledHtml(label = 'Page') {
  return injectConsentGatedMetricaIntoHtml(plainHtml(label), policy, fakeCounterId);
}

test('HTML verifier accepts disabled artifact only when no counter is expected', () => {
  assert.deepEqual(inspectMetricaBrowserHtml(plainHtml(), {counterId: null}), {
    ok: true,
    controllerCount: 0,
    errors: [],
  });
  const enabledExpected = inspectMetricaBrowserHtml(plainHtml(), {counterId: fakeCounterId});
  assert.equal(enabledExpected.ok, false);
  assert.match(enabledExpected.errors.join(' '), /exactly one.*consent controller/i);
});

test('HTML verifier accepts one bounded consent controller without exposing counter material', () => {
  const result = inspectMetricaBrowserHtml(enabledHtml(), {counterId: fakeCounterId});
  assert.deepEqual(result, {ok: true, controllerCount: 1, errors: []});
  assert.doesNotMatch(JSON.stringify(result), new RegExp(fakeCounterId));
});

test('HTML verifier rejects duplicate, wrong counter, static Yandex script and expanded tracking', () => {
  const html = enabledHtml();
  const controller = html.match(/<script[^>]*data-tr-analytics="yandex-metrica-consent"[\s\S]*?<\/script>/i)?.[0];
  assert.ok(controller);

  const cases = [
    html.replace('</body>', `${controller}</body>`),
    html.replaceAll(fakeCounterId, '987654322'),
    html.replace('</head>', '<script src="https://mc.yandex.ru/metrika/tag.js"></script></head>'),
    html.replace('webvisor:false', 'webvisor:true'),
    html.replace('clickmap:false', 'clickmap:true'),
    html.replace('trackLinks:false', 'trackLinks:true'),
    html.replace('accurateTrackBounce:false', 'accurateTrackBounce:true'),
    html.replace('sendTitle:false', 'sendTitle:true'),
    html.replace('</body>', '<noscript><img src="https://mc.yandex.ru/watch/987654321"></noscript></body>'),
  ];

  for (const candidate of cases) {
    const result = inspectMetricaBrowserHtml(candidate, {counterId: fakeCounterId});
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
  }
});

test('artifact verifier checks representative RU and EN final routes', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-artifact-'));
  fs.mkdirSync(path.join(outputDir, 'en'), {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'index.html'), enabledHtml('RU'));
  fs.writeFileSync(path.join(outputDir, 'en', 'index.html'), enabledHtml('EN'));

  const result = verifyMetricaBrowserArtifact(outputDir, {counterId: fakeCounterId});
  assert.equal(result.ok, true);
  assert.equal(result.enabled, true);
  assert.deepEqual(result.routes.map(({route}) => route), ['index.html', 'en/index.html']);
  assert.ok(result.routes.every(({ok, controllerCount}) => ok && controllerCount === 1));
  assert.doesNotMatch(JSON.stringify(result), new RegExp(fakeCounterId));
});

test('deployment report is bounded and omits counter ID', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-report-'));
  const reportPath = path.join(tempDir, 'report.json');
  const result = {
    ok: true,
    enabled: true,
    provider: 'yandex-metrica',
    routes: [
      {route: 'index.html', ok: true, controllerCount: 1, errors: []},
      {route: 'en/index.html', ok: true, controllerCount: 1, errors: []},
    ],
  };

  writeMetricaBrowserDeploymentReport(result, reportPath);
  const text = fs.readFileSync(reportPath, 'utf8');
  assert.deepEqual(JSON.parse(text), result);
  assert.doesNotMatch(text, /987654321/);
  assert.doesNotMatch(text, /counterId/i);
});
