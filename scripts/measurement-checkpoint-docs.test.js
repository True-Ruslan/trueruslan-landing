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

test('P3.6 measurement runbook preserves aggregate-only and no-conclusion boundaries', () => {
  const spec = read('docs/keystone/specs/2026-08-07-p3-6-measurement-readiness.md');

  assert.match(spec, /P3\.6A IMPLEMENTED \/ P3\.6 MEASUREMENT NOT YET ACCEPTED/);
  assert.match(spec, /P3_6_MEASUREMENT_OBSERVATIONS_JSON/);
  assert.match(spec, /evidenceClass: \"operator-observed\"/);
  assert.match(spec, /evidenceClass: \"synthetic\"/);
  assert.match(spec, /synthetic-pipeline-proof/);
  assert.match(spec, /\$RUNNER_TEMP\/measurement-observations\.json/);
  assert.match(spec, /insufficient-observation-window/);
  assert.match(spec, /insufficient-aggregate-traffic/);
  assert.match(spec, /ready-for-human-review/);
  assert.match(spec, /equal duration/i);
  assert.match(spec, /assessment timestamp.*after the end of the current observation window/i);
  assert.match(spec, /automaticConclusionsAllowed = false/);
  assert.match(spec, /engagementConclusion = null/);
  assert.match(spec, /productImpactConclusion = null/);
  assert.match(spec, /illustrative only/i);
  assert.match(spec, /never uploaded as an artifact/i);
});

test('P3.6 durable roadmap remains open until real aggregate evidence is reviewed', () => {
  const roadmap = read('docs/ROADMAP.md');
  assert.match(roadmap, /P3\.6 — Measurement checkpoint — NEXT/);
  assert.doesNotMatch(roadmap, /P3\.6 — Measurement checkpoint — DONE/);
  assert.match(roadmap, /sufficient aggregate traffic/i);
});
