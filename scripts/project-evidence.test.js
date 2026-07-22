import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  DEFAULT_PROJECT_EVIDENCE_PATH,
  loadProjectEvidence,
  renderProjectEvidence,
  validateProjectEvidence,
} from './project-evidence.js';

const projects = [{slug: 'livingworld'}, {slug: 'node-zero'}];

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

const clone = (value) => structuredClone(value);
const expectInvalid = (snapshot, pattern) => {
  assert.throws(() => validateProjectEvidence([snapshot], {projects}), pattern);
};

test('accepts canonical verified, stale and unverified snapshots', () => {
  assert.deepEqual(validateProjectEvidence([validVerified], {projects}), [validVerified]);

  const stale = clone(validVerified);
  stale.status = 'stale';
  assert.deepEqual(validateProjectEvidence([stale], {projects}), [stale]);

  const unverified = {project: 'node-zero', status: 'unverified', versions: [], signals: []};
  assert.deepEqual(validateProjectEvidence([unverified], {projects}), [unverified]);
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

test('rejects empty registry, duplicate snapshots and invalid project references', () => {
  assert.throws(() => validateProjectEvidence([], {projects}), /non-empty/i);
  assert.throws(
    () => validateProjectEvidence([validVerified, clone(validVerified)], {projects}),
    /duplicate project/i,
  );

  const unknown = clone(validVerified);
  unknown.project = 'unknown-project';
  expectInvalid(unknown, /unknown project/i);

  const malformed = clone(validVerified);
  malformed.project = 'Living World';
  expectInvalid(malformed, /project slug/i);
});

test('rejects invalid trust states and missing verification dates', () => {
  const invalid = clone(validVerified);
  invalid.status = 'current';
  expectInvalid(invalid, /status/i);

  for (const status of ['verified', 'stale']) {
    const snapshot = clone(validVerified);
    snapshot.status = status;
    delete snapshot.lastVerified;
    expectInvalid(snapshot, /lastVerified/i);
  }
});

test('rejects malformed and impossible calendar dates', () => {
  for (const date of ['22-07-2026', '2026-7-22', '2026-02-30']) {
    const snapshot = clone(validVerified);
    snapshot.lastVerified = date;
    expectInvalid(snapshot, /date|lastVerified/i);
  }

  const signalDate = clone(validVerified);
  signalDate.signals[0].observedAt = '2026-13-01';
  expectInvalid(signalDate, /date|observedAt/i);
});

test('rejects unsafe evidence URLs', () => {
  for (const url of ['http://example.com/run', 'javascript:alert(1)', '/local/path']) {
    const snapshot = clone(validVerified);
    snapshot.signals[0].url = url;
    expectInvalid(snapshot, /url/i);
  }
});

test('validates version facts and duplicate normalized labels', () => {
  const blankLabel = clone(validVerified);
  blankLabel.versions[0].label = '   ';
  expectInvalid(blankLabel, /label/i);

  const blankValue = clone(validVerified);
  blankValue.versions[0].value = '';
  expectInvalid(blankValue, /value/i);

  const duplicate = clone(validVerified);
  duplicate.versions.push({label: ' minecraft ', value: 'other'});
  expectInvalid(duplicate, /duplicate version/i);
});

test('validates signal enums and mode coherence', () => {
  const invalidKind = clone(validVerified);
  invalidKind.signals[0].kind = 'workflow';
  expectInvalid(invalidKind, /kind/i);

  const invalidMode = clone(validVerified);
  invalidMode.signals[0].mode = 'human';
  expectInvalid(invalidMode, /mode/i);

  const invalidState = clone(validVerified);
  invalidState.signals[0].state = 'perfect';
  expectInvalid(invalidState, /state/i);

  const manualAsAutomated = clone(validVerified);
  manualAsAutomated.signals[0].kind = 'manual';
  expectInvalid(manualAsAutomated, /mode|manual/i);

  const ciAsManual = clone(validVerified);
  ciAsManual.signals[0].mode = 'manual';
  expectInvalid(ciAsManual, /mode|automated/i);
});

test('requires bounded scopes, unique signals and signals for trusted historical states', () => {
  const blankScope = clone(validVerified);
  blankScope.signals[0].scope = '   ';
  expectInvalid(blankScope, /scope/i);

  const duplicate = clone(validVerified);
  duplicate.signals.push({...clone(duplicate.signals[0]), label: ' ci '});
  expectInvalid(duplicate, /duplicate signal/i);

  for (const status of ['verified', 'stale']) {
    const snapshot = clone(validVerified);
    snapshot.status = status;
    snapshot.signals = [];
    expectInvalid(snapshot, /signal/i);
  }
});

test('loads JSON, reports missing manifests and exposes canonical default path', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-evidence-'));
  const manifestPath = path.join(tempDir, 'project-evidence.json');
  fs.writeFileSync(manifestPath, JSON.stringify([validVerified]), 'utf8');
  assert.deepEqual(loadProjectEvidence(manifestPath, {projects}), [validVerified]);

  const missing = path.join(os.tmpdir(), `missing-project-evidence-${Date.now()}.json`);
  assert.throws(() => loadProjectEvidence(missing, {projects}), /not found/i);
  assert.match(DEFAULT_PROJECT_EVIDENCE_PATH, /data[\\/]project-evidence\.json$/);
});

test('renders verified evidence with bounded trust language', () => {
  const html = renderProjectEvidence(validVerified);
  assert.match(html, /data-project-evidence="livingworld"/);
  assert.match(html, /data-evidence-status="verified"/);
  assert.match(html, /tr-project-evidence--verified/);
  assert.match(html, />ПРОВЕРЕНО</);
  assert.match(html, /2026-07-22/);
  assert.match(html, /Minecraft/);
  assert.match(html, /1\.21\.1/);
  assert.match(html, /data-evidence-kind="ci"/);
  assert.match(html, /data-evidence-mode="automated"/);
  assert.match(html, /Automated contracts covered by this run\./);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /production-ready|fully tested|fully verified/i);
});

test('renders stale evidence as visibly distinct from verified', () => {
  const snapshot = clone(validVerified);
  snapshot.status = 'stale';
  const html = renderProjectEvidence(snapshot);
  assert.match(html, /data-evidence-status="stale"/);
  assert.match(html, /tr-project-evidence--stale/);
  assert.match(html, /ТРЕБУЕТ ПЕРЕПРОВЕРКИ/);
  assert.doesNotMatch(html, /data-evidence-status="verified"/);
});

test('renders unverified evidence without a positive verified state', () => {
  const snapshot = {project: 'node-zero', status: 'unverified', versions: [], signals: []};
  const html = renderProjectEvidence(snapshot);
  assert.match(html, /data-evidence-status="unverified"/);
  assert.match(html, /tr-project-evidence--unverified/);
  assert.match(html, />НЕ ПРОВЕРЕНО</);
  assert.doesNotMatch(html, /data-evidence-status="verified"|tr-project-evidence--verified|>ПРОВЕРЕНО</);
});

test('distinguishes automated and manual evidence semantically', () => {
  const snapshot = clone(validVerified);
  snapshot.signals.push({
    kind: 'manual',
    mode: 'manual',
    label: 'Voice acceptance',
    state: 'accepted',
    observedAt: '2026-07-21',
    scope: 'A real microphone-to-visible-response path was exercised.',
  });
  const html = renderProjectEvidence(snapshot);
  assert.match(html, /data-evidence-mode="automated"/);
  assert.match(html, /data-evidence-mode="manual"/);
  assert.match(html, /Автоматическое доказательство/);
  assert.match(html, /Ручная проверка/);
});

test('escapes all user-controlled evidence text', () => {
  const snapshot = clone(validVerified);
  snapshot.versions[0] = {label: '<script>alert(1)</script>', value: '1 & "2"'};
  snapshot.signals[0].label = '<b>CI</b>';
  snapshot.signals[0].scope = 'A <script>bad()</script> & "quoted" scope.';
  const html = renderProjectEvidence(snapshot);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<b>CI<\/b>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /1 &amp; &quot;2&quot;/);
  assert.match(html, /A &lt;script&gt;bad\(\)&lt;\/script&gt; &amp; &quot;quoted&quot; scope\./);
});
