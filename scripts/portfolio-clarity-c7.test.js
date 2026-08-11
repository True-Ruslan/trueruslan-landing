import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

const BASELINE_PATH = 'data/presentation-baseline.json';
const HANDOFF_PATH = 'docs/keystone/specs/2026-08-11-portfolio-clarity-c7-baseline-handoff.md';

test('C7 owns one pending canonical presentation baseline before exact production acceptance', () => {
  assert.ok(fs.existsSync(path.join(ROOT, BASELINE_PATH)), `${BASELINE_PATH} must exist`);
  const baseline = readJson(BASELINE_PATH);

  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.status, 'pending-production-acceptance');
  assert.equal(baseline.slice, 'C7');
  assert.equal(baseline.measurementMode, 'context-only');
  assert.equal(baseline.resetsCleanUrlMeasurement, false);
  assert.equal(baseline.acceptedAt, null);
  assert.equal(baseline.deployedSha, null);
  assert.equal(baseline.pagesDeploymentId, null);
  assert.equal(baseline.productionLiveRunId, null);
});

test('C7 measurement reporting loads presentation baseline separately from operator observations', () => {
  const reportCli = read('scripts/measurement-checkpoint-report.js');
  const workflow = read('.github/workflows/measurement-checkpoint.yml');

  assert.match(reportCli, /--presentation-baseline/);
  assert.match(reportCli, /presentationBaselinePath/);
  assert.match(reportCli, /loadPresentationBaseline|presentation-baseline/);
  assert.match(workflow, /data\/presentation-baseline\.json/);
  assert.match(workflow, /--presentation-baseline/);
  assert.match(workflow, /P3_6_MEASUREMENT_OBSERVATIONS_JSON/);
  assert.doesNotMatch(workflow, /P3_6_PRESENTATION_BASELINE_JSON/);
});

test('C7 keeps clean URL measurement readiness independent from presentation baseline provenance', () => {
  const measurement = read('scripts/measurement-checkpoint.js');
  const reportCli = read('scripts/measurement-checkpoint-report.js');

  assert.match(measurement, /cleanUrlMigrationAt/);
  assert.match(reportCli, /presentationBaseline/);
  assert.match(reportCli, /cleanUrlMigrationAt|analyzeMeasurementCheckpoint/);
  assert.doesNotMatch(measurement, /cleanUrlMigrationAt\s*=\s*presentation/i);
});

test('C7 baseline handoff explicitly forbids resetting P3.6 or making causal claims', () => {
  assert.ok(fs.existsSync(path.join(ROOT, HANDOFF_PATH)), `${HANDOFF_PATH} must exist`);
  const handoff = read(HANDOFF_PATH);

  assert.match(handoff, /cleanUrlMigrationAt.*2026-08-05T00:00:00Z/s);
  assert.match(handoff, /does not reset|must not reset/i);
  assert.match(handoff, /presentation baseline/i);
  assert.match(handoff, /pending-production-acceptance/);
  assert.match(handoff, /operator-observed/);
  assert.match(handoff, /equal-duration/i);
  assert.match(handoff, /human review/i);
  assert.match(handoff, /no causal|causal conclusion.*not/i);
});

test('C7 finalization remains production-gated rather than self-accepting on a PR artifact', () => {
  const handoff = read(HANDOFF_PATH);
  const baseline = readJson(BASELINE_PATH);

  assert.match(handoff, /exact Pages deployment/i);
  assert.match(handoff, /deployment-triggered Production Live/i);
  assert.match(handoff, /durable acceptance/i);
  assert.equal(baseline.status, 'pending-production-acceptance');
});
