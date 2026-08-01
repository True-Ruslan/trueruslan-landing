import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  loadSiteManifest,
  resolveSiteDeployment,
  validateSiteManifest,
  writeSiteDeploymentEnvironment,
  writeSiteDeploymentReport,
} from './site-deployment.js';

const validManifest = Object.freeze({
  legacyOrigin: 'https://true-ruslan.github.io/trueruslan-landing',
  customOrigin: 'https://trueruslan.ru',
  customHostname: 'trueruslan.ru',
  alternateHostname: 'www.trueruslan.ru',
});

test('repository site manifest defines the exact legacy and custom identities', () => {
  const manifest = loadSiteManifest();
  assert.deepEqual(manifest, validManifest);
});

test('site manifest rejects unsafe or ambiguous origins', () => {
  for (const candidate of [
    {...validManifest, legacyOrigin: 'http://true-ruslan.github.io/trueruslan-landing'},
    {...validManifest, customOrigin: 'https://trueruslan.ru/'},
    {...validManifest, customOrigin: 'https://trueruslan.ru/path'},
    {...validManifest, customOrigin: 'https://trueruslan.ru?x=1'},
    {...validManifest, customOrigin: 'https://trueruslan.ru#fragment'},
    {...validManifest, customHostname: 'www.trueruslan.ru'},
    {...validManifest, alternateHostname: 'trueruslan.ru'},
  ]) {
    assert.throws(() => validateSiteManifest(candidate));
  }
});

test('auto mode defaults to legacy when repository variable is absent', () => {
  assert.deepEqual(resolveSiteDeployment({mode: 'auto', configuredOrigin: '', manifest: validManifest}), {
    mode: 'auto',
    origin: validManifest.legacyOrigin,
    productionUrl: `${validManifest.legacyOrigin}/`,
    target: 'legacy',
    reason: 'legacy-default',
  });
});

test('auto mode accepts only exact canonical origins', () => {
  assert.equal(resolveSiteDeployment({
    mode: 'auto',
    configuredOrigin: validManifest.legacyOrigin,
    manifest: validManifest,
  }).reason, 'configured-legacy');
  assert.equal(resolveSiteDeployment({
    mode: 'auto',
    configuredOrigin: validManifest.customOrigin,
    manifest: validManifest,
  }).reason, 'configured-custom');

  for (const configuredOrigin of [
    `${validManifest.customOrigin}/`,
    'http://trueruslan.ru',
    'https://example.test',
  ]) {
    assert.throws(
      () => resolveSiteDeployment({mode: 'auto', configuredOrigin, manifest: validManifest}),
      /configured production site origin/i,
    );
  }
});

test('explicit legacy and custom modes force the selected canonical origin', () => {
  assert.deepEqual(resolveSiteDeployment({
    mode: 'legacy',
    configuredOrigin: validManifest.customOrigin,
    manifest: validManifest,
  }), {
    mode: 'legacy',
    origin: validManifest.legacyOrigin,
    productionUrl: `${validManifest.legacyOrigin}/`,
    target: 'legacy',
    reason: 'forced-legacy',
  });

  assert.deepEqual(resolveSiteDeployment({
    mode: 'custom',
    configuredOrigin: '',
    manifest: validManifest,
  }), {
    mode: 'custom',
    origin: validManifest.customOrigin,
    productionUrl: `${validManifest.customOrigin}/`,
    target: 'custom',
    reason: 'forced-custom',
  });
});

test('site deployment rejects unknown modes', () => {
  assert.throws(
    () => resolveSiteDeployment({mode: 'required', configuredOrigin: '', manifest: validManifest}),
    /invalid site deployment mode/i,
  );
});

test('environment and report output are bounded and deterministic', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-deployment-'));
  const envPath = path.join(tempRoot, 'github-env');
  const reportPath = path.join(tempRoot, 'site-deployment-contract.json');
  const state = resolveSiteDeployment({
    mode: 'custom',
    configuredOrigin: 'ignored-value',
    manifest: validManifest,
  });

  writeSiteDeploymentEnvironment(state, {envPath});
  writeSiteDeploymentReport(state, reportPath);

  assert.equal(fs.readFileSync(envPath, 'utf8'), [
    'SITE_URL=https://trueruslan.ru',
    'PRODUCTION_URL=https://trueruslan.ru/',
    'SITE_DEPLOYMENT_TARGET=custom',
    'SITE_DEPLOYMENT_REASON=forced-custom',
    '',
  ].join('\n'));

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert.deepEqual(report, state);
  assert.deepEqual(Object.keys(report).sort(), ['mode', 'origin', 'productionUrl', 'reason', 'target']);
  assert.doesNotMatch(JSON.stringify(report), /ignored-value/);
});
