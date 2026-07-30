import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

import {
  inspectAnalyticsHtml,
  resolveAnalyticsDeployment,
  verifyAnalyticsArtifact,
  writeAnalyticsDeploymentContract,
} from './analytics-deployment.js';
import {injectAnalyticsIntoHtml} from './analytics.js';

const fakeToken = 'testAnalyticsToken0123456789ABCDEF';
const otherToken = 'otherAnalyticsToken0123456789ABCDE';
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

function tokenlessHtml(label = 'Page') {
  return `<!doctype html><html><head><title>${label}</title></head><body><main><h1>${label}</h1></main></body></html>`;
}

function enabledHtml(label = 'Page', token = fakeToken) {
  return injectAnalyticsIntoHtml(tokenlessHtml(label), validPolicy, token);
}

test('auto mode remains disabled when no token is configured', () => {
  assert.deepEqual(resolveAnalyticsDeployment({mode: 'auto', token: ''}), {
    mode: 'auto',
    enabled: false,
    expectation: 'disabled',
    reason: 'token-not-configured',
  });
});

test('auto mode enables analytics when a valid token is configured', () => {
  assert.deepEqual(resolveAnalyticsDeployment({mode: 'auto', token: fakeToken}), {
    mode: 'auto',
    enabled: true,
    expectation: 'enabled',
    reason: 'configured-token',
  });
});

test('required mode fails without a configured token', () => {
  assert.throws(
    () => resolveAnalyticsDeployment({mode: 'required', token: ''}),
    /analytics token is required/i,
  );
});

test('required mode enables analytics with a valid token', () => {
  assert.deepEqual(resolveAnalyticsDeployment({mode: 'required', token: fakeToken}), {
    mode: 'required',
    enabled: true,
    expectation: 'enabled',
    reason: 'configured-token',
  });
});

test('disabled mode is a kill switch even when a token exists', () => {
  assert.deepEqual(resolveAnalyticsDeployment({mode: 'disabled', token: fakeToken}), {
    mode: 'disabled',
    enabled: false,
    expectation: 'disabled',
    reason: 'forced-disabled',
  });
});

test('invalid modes and malformed configured tokens fail closed', () => {
  assert.throws(
    () => resolveAnalyticsDeployment({mode: 'invalid', token: ''}),
    /invalid analytics deployment mode/i,
  );
  assert.throws(
    () => resolveAnalyticsDeployment({mode: 'auto', token: '<bad>'}),
    /invalid configured analytics token/i,
  );
  assert.throws(
    () => resolveAnalyticsDeployment({mode: 'required', token: '<bad>'}),
    /invalid configured analytics token/i,
  );
});

test('deployment report contains bounded state and never token material', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-deployment-report-'));
  const reportPath = path.join(tempDir, 'contract.json');
  const result = resolveAnalyticsDeployment({mode: 'auto', token: fakeToken});

  writeAnalyticsDeploymentContract(result, reportPath);

  const reportText = fs.readFileSync(reportPath, 'utf8');
  const report = JSON.parse(reportText);
  assert.deepEqual(report, result);
  assert.doesNotMatch(reportText, new RegExp(fakeToken));
  assert.equal('token' in report, false);
  assert.equal('tokenHash' in report, false);
});

test('CLI writes enabled workflow state without leaking token into report', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-deployment-cli-'));
  const githubEnv = path.join(tempDir, 'github-env.txt');
  const githubOutput = path.join(tempDir, 'github-output.txt');
  const reportPath = path.join(tempDir, 'contract.json');
  const scriptPath = path.join(process.cwd(), 'scripts', 'analytics-deployment.js');

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: tempDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      ANALYTICS_DEPLOYMENT_MODE: 'required',
      ANALYTICS_SITE_TOKEN: fakeToken,
      ANALYTICS_DEPLOYMENT_REPORT_PATH: reportPath,
      GITHUB_ENV: githubEnv,
      GITHUB_OUTPUT: githubOutput,
    },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /::add-mask::/);
  assert.match(result.stdout, /analytics deployment: mode=required expectation=enabled reason=configured-token/i);

  const envText = fs.readFileSync(githubEnv, 'utf8');
  const outputText = fs.readFileSync(githubOutput, 'utf8');
  const reportText = fs.readFileSync(reportPath, 'utf8');
  assert.match(envText, /ANALYTICS_EXPECTATION=enabled/);
  assert.match(envText, new RegExp(`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN=${fakeToken}`));
  assert.match(outputText, /analytics_expectation=enabled/);
  assert.doesNotMatch(reportText, new RegExp(fakeToken));
});

test('CLI forced-disabled mode clears build token', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-deployment-disabled-'));
  const githubEnv = path.join(tempDir, 'github-env.txt');
  const reportPath = path.join(tempDir, 'contract.json');
  const scriptPath = path.join(process.cwd(), 'scripts', 'analytics-deployment.js');

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: tempDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      ANALYTICS_DEPLOYMENT_MODE: 'disabled',
      ANALYTICS_SITE_TOKEN: fakeToken,
      ANALYTICS_DEPLOYMENT_REPORT_PATH: reportPath,
      GITHUB_ENV: githubEnv,
    },
  });

  assert.equal(result.status, 0, result.stderr);
  const envText = fs.readFileSync(githubEnv, 'utf8');
  assert.match(envText, /ANALYTICS_EXPECTATION=disabled/);
  assert.match(envText, /TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN=\n/);
});

test('HTML inspection accepts an analytics-free page only when disabled is expected', () => {
  assert.deepEqual(inspectAnalyticsHtml(tokenlessHtml(), {expectation: 'disabled'}), {
    ok: true,
    beaconCount: 0,
    errors: [],
  });
  const enabledExpectation = inspectAnalyticsHtml(tokenlessHtml(), {
    expectation: 'enabled',
    token: fakeToken,
  });
  assert.equal(enabledExpectation.ok, false);
  assert.match(enabledExpectation.errors.join(' '), /expected exactly one analytics beacon/i);
});

test('HTML inspection validates one bounded enabled beacon without returning token material', () => {
  const result = inspectAnalyticsHtml(enabledHtml(), {expectation: 'enabled', token: fakeToken});
  assert.deepEqual(result, {ok: true, beaconCount: 1, errors: []});
  assert.doesNotMatch(JSON.stringify(result), new RegExp(fakeToken));
});

test('HTML inspection fails duplicates, unexpected enabled state and wrong token', () => {
  const html = enabledHtml();
  const script = html.match(/<script[^>]*data-tr-analytics="cloudflare-web-analytics"[^>]*><\/script>/i)?.[0];
  assert.ok(script);

  const duplicate = html.replace('</head>', `${script}</head>`);
  const duplicateResult = inspectAnalyticsHtml(duplicate, {expectation: 'enabled', token: fakeToken});
  assert.equal(duplicateResult.ok, false);
  assert.equal(duplicateResult.beaconCount, 2);

  const disabledResult = inspectAnalyticsHtml(html, {expectation: 'disabled'});
  assert.equal(disabledResult.ok, false);
  assert.match(disabledResult.errors.join(' '), /expected no analytics beacon/i);

  const wrongTokenResult = inspectAnalyticsHtml(html, {expectation: 'enabled', token: otherToken});
  assert.equal(wrongTokenResult.ok, false);
  assert.match(wrongTokenResult.errors.join(' '), /token does not match/i);
});

test('HTML inspection fails malformed or expanded beacon attributes', () => {
  const html = enabledHtml();
  const malformedConfig = html.replace(/data-cf-beacon="[^"]+"/, 'data-cf-beacon="not-json"');
  const wrongSpa = html.replace(/&quot;spa&quot;:false/, '&quot;spa&quot;:true');
  const wrongSource = html.replace(
    'https://static.cloudflareinsights.com/beacon.min.js',
    'https://example.test/beacon.js',
  );
  const wrongType = html.replace('type="module"', 'type="text/javascript"');
  const missingDefer = html.replace(' defer ', ' ');

  for (const candidate of [malformedConfig, wrongSpa, wrongSource, wrongType, missingDefer]) {
    const result = inspectAnalyticsHtml(candidate, {expectation: 'enabled', token: fakeToken});
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
  }
});

test('artifact verification checks representative RU and EN pages', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-artifact-'));
  fs.mkdirSync(path.join(outputDir, 'en'), {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'index.html'), enabledHtml('RU'));
  fs.writeFileSync(path.join(outputDir, 'en', 'index.html'), enabledHtml('EN'));

  const result = verifyAnalyticsArtifact(outputDir, {
    expectation: 'enabled',
    token: fakeToken,
  });

  assert.equal(result.ok, true);
  assert.equal(result.expectation, 'enabled');
  assert.deepEqual(result.routes.map((entry) => entry.route), ['index.html', 'en/index.html']);
  assert.ok(result.routes.every((entry) => entry.ok && entry.beaconCount === 1));
  assert.doesNotMatch(JSON.stringify(result), new RegExp(fakeToken));
});

test('artifact verification reports missing localized files without throwing', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-analytics-artifact-missing-'));
  fs.writeFileSync(path.join(outputDir, 'index.html'), tokenlessHtml('RU'));

  const result = verifyAnalyticsArtifact(outputDir, {expectation: 'disabled'});
  assert.equal(result.ok, false);
  assert.equal(result.routes.find((entry) => entry.route === 'en/index.html').ok, false);
  assert.match(
    result.routes.find((entry) => entry.route === 'en/index.html').errors.join(' '),
    /file not found/i,
  );
});
