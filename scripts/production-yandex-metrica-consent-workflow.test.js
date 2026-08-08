import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'production-live.yml'), 'utf8');
const smokePath = path.join(ROOT, 'scripts', 'production-yandex-metrica-consent-smoke.cjs');

function readSmoke() {
  return fs.readFileSync(smokePath, 'utf8');
}

test('Production Live runs the Yandex pre-consent smoke only against deployed production', () => {
  const smoke = readSmoke();
  assert.match(workflow, /production-yandex-metrica-consent-smoke\.cjs/);
  assert.match(workflow, /Run deployed Yandex Metrica pre-consent smoke/);
  assert.match(workflow, /if:\s*github\.event_name != 'pull_request'/);
  assert.match(smoke, /production-yandex-metrica-consent-summary\.json/);
  assert.match(smoke, /trueruslan\.ru|APEX/);
});

test('production Metrica smoke never grants consent or sends test telemetry', () => {
  const smoke = readSmoke();
  assert.doesNotMatch(smoke, /data-tr-consent=["']granted["']/i);
  assert.doesNotMatch(smoke, /\.click\(.*granted|click\([^\n]*allow/i);
  assert.doesNotMatch(smoke, /window\.ym\s*\(|\bym\s*\(/);
  assert.match(smoke, /YANDEX_HOST_PATTERN/);
  assert.match(smoke, /yandexRequests\.length === 0/);
});

test('production Metrica smoke proves controller, disable flag, no provider script and no provider cookies', () => {
  const smoke = readSmoke();
  assert.match(smoke, /yandex-metrica-consent/);
  assert.match(smoke, /disableYaCounter/);
  assert.match(smoke, /data-tr-metrica-provider/);
  assert.match(smoke, /_ym_|yandexuid|ymex|is_gdpr/i);
  assert.match(smoke, /tr_privacy_consent_v1/);
});

test('production Metrica smoke proves no automatic dismiss and no reopen control', () => {
  const smoke = readSmoke();
  assert.match(smoke, /setTimeout\\s\*\\\(/);
  assert.match(smoke, /automatic timeout/);
  assert.match(smoke, /reopen control/);
  assert.match(smoke, /reopenControlPresent/);
});
