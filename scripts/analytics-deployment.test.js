import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

import {
  resolveAnalyticsDeployment,
  writeAnalyticsDeploymentContract,
} from './analytics-deployment.js';

const fakeToken = 'testAnalyticsToken0123456789ABCDEF';

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
