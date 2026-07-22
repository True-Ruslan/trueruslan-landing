import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  DEFAULT_PROJECT_EVIDENCE_PATH,
  loadProjectEvidence,
  validateProjectEvidence,
} from './project-evidence.js';

const projects = [
  {slug: 'livingworld'},
  {slug: 'node-zero'},
];

const validVerified = {
  project: 'livingworld',
  status: 'verified',
  lastVerified: '2026-07-22',
  versions: [{label: 'Minecraft', value: '1.21.1'}],
  signals: [{
    kind: 'ci',
    mode: 'automated',
    label: 'CI',
    state: 'green',
    url: 'https://github.com/True-Ruslan/minecraft-botics-ai/actions/runs/1',
    observedAt: '2026-07-22',
    scope: 'Automated contracts covered by this run.',
  }],
};

function clone(value) {
  return structuredClone(value);
}

function expectInvalid(snapshot, pattern) {
  assert.throws(() => validateProjectEvidence([snapshot], {projects}), pattern);
}

test('accepts a canonical verified evidence snapshot', () => {
  assert.deepEqual(validateProjectEvidence([validVerified], {projects}), [validVerified]);
});

test('accepts stale evidence with a verification date and bounded signal', () => {
  const snapshot = clone(validVerified);
  snapshot.status = 'stale';
  assert.deepEqual(validateProjectEvidence([snapshot], {projects}), [snapshot]);
});

test('accepts unverified evidence without historical date or signals', () => {
  const snapshot = {
    project: 'node-zero',
    status: 'unverified',
    versions: [],
    signals: [],
  };
  assert.deepEqual(validateProjectEvidence([snapshot], {projects}), [snapshot]);
});

test('accepts private manual evidence without a public URL', () => {
  const snapshot = {
    project: 'node-zero',
    status: 'verified',
    lastVerified: '2026-07-22',
    versions: [{label: 'Unity', value: '6.3 LTS'}],
    signals: [{
      kind: 'manual',
      mode: 'manual',
      label: 'Windows build acceptance',
      state: 'accepted',
      observedAt: '2026-07-22',
      scope: 'A local Windows IL2CPP build launched successfully.',
    }],
  };
  assert.deepEqual(validateProjectEvidence([snapshot], {projects}), [snapshot]);
});

test('rejects an empty registry', () => {
  assert.throws(() => validateProjectEvidence([], {projects}), /non-empty/i);
});

test('rejects duplicate project snapshots', () => {
  assert.throws(
    () => validateProjectEvidence([validVerified, clone(validVerified)], {projects}),
    /duplicate project/i,
  );
});

test('rejects unknown project references', () => {
  const snapshot = clone(validVerified);
  snapshot.project = 'unknown-project';
  expectInvalid(snapshot, /unknown project/i);
});

test('rejects malformed project slugs', () => {
  const snapshot = clone(validVerified);
  snapshot.project = 'Living World';
  expectInvalid(snapshot, /project slug/i);
});

test('rejects unknown trust states', () => {
  const snapshot = clone(validVerified);
  snapshot.status = 'current';
  expectInvalid(snapshot, /status/i);
});

test('requires lastVerified for verified and stale snapshots', () => {
  const verified = clone(validVerified);
  delete verified.lastVerified;
  expectInvalid(verified, /lastVerified/i);

  const stale = clone(validVerified);
  stale.status = 'stale';
  delete stale.lastVerified;
  expectInvalid(stale, /lastVerified/i);
});

test('rejects malformed and impossible calendar dates', () => {
  for (const date of ['22-07-2026', '2026-7-22', '2026-02-30']) {
    const snapshot = clone(validVerified);
    snapshot.lastVerified = date;
    expectInvalid(snapshot, /date|lastVerified/i);
  }

  const snapshot = clone(validVerified);
  snapshot.signals[0].observedAt = '2026-13-01';
  expectInvalid(snapshot, /date|observedAt/i);
});

test('rejects non-HTTPS evidence URLs', () => {
  for (const url of ['http://example.com/run', 'javascript:alert(1)', '/local/path']) {
    const snapshot = clone(validVerified);
    snapshot.signals[0].url = url;
    expectInvalid(snapshot, /url/i);
  }
});

test('rejects blank version labels and values', () => {
  const blankLabel = clone(validVerified);
  blankLabel.versions[0].label = '   ';
  expectInvalid(blankLabel, /version.*label|label/i);

  const blankValue = clone(validVerified);
  blankValue.versions[0].value = '';
  expectInvalid(blankValue, /version.*value|value/i);
});

test('rejects duplicate normalized version labels', () => {
  const snapshot = clone(validVerified);
  snapshot.versions.push({label: ' minecraft ', value: 'other'});
  expectInvalid(snapshot, /duplicate version/i);
});

test('rejects invalid signal kind mode and state values', () => {
  const invalidKind = clone(validVerified);
  invalidKind.signals[0].kind = 'workflow';
  expectInvalid(invalidKind, /kind/i);

  const invalidMode = clone(validVerified);
  invalidMode.signals[0].mode = 'human';
  expectInvalid(invalidMode, /mode/i);

  const invalidState = clone(validVerified);
  invalidState.signals[0].state = 'perfect';
  expectInvalid(invalidState, /state/i);
});

test('enforces signal kind and evidence mode coherence', () => {
  const manualAsAutomated = clone(validVerified);
  manualAsAutomated.signals[0].kind = 'manual';
  expectInvalid(manualAsAutomated, /mode|manual/i);

  const ciAsManual = clone(validVerified);
  ciAsManual.signals[0].mode = 'manual';
  expectInvalid(ciAsManual, /mode|automated/i);
});

test('requires a non-empty bounded scope for every signal', () => {
  const snapshot = clone(validVerified);
  snapshot.signals[0].scope = '   ';
  expectInvalid(snapshot, /scope/i);
});

test('rejects duplicate normalized signal identities', () => {
  const snapshot = clone(validVerified);
  snapshot.signals.push({
    ...clone(snapshot.signals[0]),
    label: ' ci ',
  });
  expectInvalid(snapshot, /duplicate signal/i);
});

test('requires at least one signal for verified and stale snapshots', () => {
  for (const status of ['verified', 'stale']) {
    const snapshot = clone(validVerified);
    snapshot.status = status;
    snapshot.signals = [];
    expectInvalid(snapshot, /signal/i);
  }
});

test('loads and validates evidence from JSON', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-evidence-'));
  const manifestPath = path.join(tempDir, 'project-evidence.json');
  fs.writeFileSync(manifestPath, JSON.stringify([validVerified]), 'utf8');
  assert.deepEqual(loadProjectEvidence(manifestPath, {projects}), [validVerified]);
});

test('fails clearly when the evidence manifest is missing', () => {
  const missing = path.join(os.tmpdir(), `missing-project-evidence-${Date.now()}.json`);
  assert.throws(() => loadProjectEvidence(missing, {projects}), /not found/i);
});

test('exports the canonical default evidence path', () => {
  assert.match(DEFAULT_PROJECT_EVIDENCE_PATH, /data[\\/]project-evidence\.json$/);
});
