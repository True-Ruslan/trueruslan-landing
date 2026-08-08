import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'scripts', 'production-yandex-metrica-consent-smoke.cjs'), 'utf8');

test('production pre-consent smoke verifies the current compact RU/EN copy', () => {
  assert.match(source, /Cookies для статистики/);
  assert.match(source, /Не разрешать/);
  assert.match(source, /Analytics cookies/);
  assert.match(source, /Refuse/);

  assert.doesNotMatch(source, /Аналитика\[\\s\\S\].*Отказаться/);
  assert.doesNotMatch(source, /Analytics\[\\s\\S\].*Decline/);
});

test('production pre-consent smoke still proves zero provider activity before consent', () => {
  assert.match(source, /expected zero Yandex provider requests before consent/);
  assert.match(source, /provider script exists before consent/);
  assert.match(source, /provider cookies exist before consent/);
  assert.match(source, /disableYaCounter flag must be true before consent/);
  assert.match(source, /consentWasNotGrantedByAutomation: true/);
});
