import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('P3.6B runbook documents the bounded Yandex Metrica Reports API contract', () => {
  const spec = read('docs/keystone/specs/2026-08-07-p3-6b-yandex-metrica-reporting.md');

  assert.match(spec, /Reports API/i);
  assert.ok(spec.includes('https://api-metrika.yandex.net/stat/v1/data'));
  assert.match(spec, /ym:s:visits/);
  assert.match(spec, /ym:s:pageviews/);
  assert.match(spec, /ym:s:users/);
  assert.match(spec, /accuracy=full/);
  assert.match(spec, /no dimensions|dimensionless/i);
  assert.match(spec, /sampled.*fail/i);
  assert.match(spec, /metrika:read/);
  assert.match(spec, /YANDEX_METRIKA_COUNTER_ID/);
  assert.match(spec, /YANDEX_METRIKA_OAUTH_TOKEN/);
  assert.match(spec, /Authorization.*OAuth/i);
  assert.match(spec, /Logs API.*out of scope|no Logs API/i);
  assert.match(spec, /browser tracking tag.*out of scope|frontend.*out of scope/i);
  assert.match(spec, /cookies.*persistent/i);
  assert.match(spec, /RUNNER_TEMP/);
  assert.match(spec, /never uploaded/i);
  assert.match(spec, /automaticConclusionsAllowed = false/);
});

test('P3.6 readiness runbook names Metrica as optional aggregate enrichment without accepting real measurement', () => {
  const spec = read('docs/keystone/specs/2026-08-07-p3-6-measurement-readiness.md');

  assert.match(spec, /Yandex Metrica Reports API/);
  assert.match(spec, /optional/i);
  assert.match(spec, /P3\.6B/);
  assert.match(spec, /P3\.6 MEASUREMENT NOT YET ACCEPTED/);
  assert.match(spec, /synthetic-pipeline-proof/);
});
