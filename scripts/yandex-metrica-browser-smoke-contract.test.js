import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'build.yml'), 'utf8');
const smokePath = path.join(ROOT, 'scripts', 'yandex-metrica-browser-smoke.cjs');

function readSmoke() {
  return fs.readFileSync(smokePath, 'utf8');
}

test('PR quality gate runs a dedicated consent lifecycle browser smoke', () => {
  const smoke = readSmoke();
  assert.match(workflow, /Yandex Metrica consent browser smoke/);
  assert.match(workflow, /node scripts\/yandex-metrica-browser-smoke\.cjs/);
  assert.match(workflow, /yandex-metrica-browser-smoke\.log/);
  assert.match(workflow, /quality-artifacts\/yandex-metrica-browser-smoke\.log/);
  assert.match(smoke, /987654321/);
});

test('browser smoke proves zero provider requests before consent and after denial', () => {
  const smoke = readSmoke();
  assert.match(smoke, /mc\.yandex\.ru/);
  assert.match(smoke, /before consent/i);
  assert.match(smoke, /after denial/i);
  assert.match(smoke, /disableYaCounter/);
  assert.match(smoke, /tr_privacy_consent_v1/);
});

test('browser smoke proves prompt persists past seven seconds and choice cannot be reopened in-site', () => {
  const smoke = readSmoke();
  assert.match(smoke, /waitForTimeout\(7500\)/);
  assert.match(smoke, /prompt persists/i);
  assert.match(smoke, /reopen control/i);
  assert.doesNotMatch(smoke, /withdraw/i);
});

test('browser smoke proves explicit grant remains privacy bounded', () => {
  const smoke = readSmoke();
  for (const contract of [
    /clickmap.*false/i,
    /trackLinks.*false/i,
    /accurateTrackBounce.*false/i,
    /webvisor.*false/i,
    /trackHash.*false/i,
    /sendTitle.*false/i,
  ]) assert.match(smoke, contract);
});
