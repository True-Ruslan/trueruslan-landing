import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const state = read('docs/PROJECT_STATE.md');
const roadmap = read('docs/ROADMAP.md');
const changelog = read('docs/CHANGELOG.md');

const INTAKE_MERGE_SHA = '6083e4d950d74b272cce199fedccc730dfcc4fed';
const ADAPTER_MERGE_SHA = '831535461f3c72d53e3510574ae7ae9c52ab54f6';

function assertCurrentBoundary(source, label) {
  assert.match(source, /P4\.1B[^\n]{0,220}(?:real external evidence review|review)[^\n]{0,220}(IN PROGRESS|SPARSE PRE-LAUNCH BASELINE)/i, `${label}: sparse real-evidence review boundary missing`);
  assert.match(source, /P4\.1C[^\n]{0,180}WAITING/i, `${label}: P4.1C evidence gate missing`);
  assert.match(source, /P3\.6[^\n]{0,220}(NEXT \/ WAITING|WAITING FOR EXTERNAL EVIDENCE|WAITING)/i, `${label}: P3.6 boundary missing`);
}

test('PROJECT_STATE preserves #210 intake acceptance and records #213 sparse real evidence separately', () => {
  assert.match(state, /PR #209/);
  assert.match(state, /723 PASS \/ 0 FAIL/);
  assert.match(state, /P4\.1B intake tooling — PRODUCTION ACCEPTED/i);
  assert.match(state, /PR #210/);
  assert.match(state, new RegExp(INTAKE_MERGE_SHA));
  assert.match(state, /731 PASS \/ 0 FAIL/);
  assert.match(state, /Pages:\s+#234 \/ 31600575541 — SUCCESS/);
  assert.match(state, /Production Live Smoke:\s+#520 \/ 31600575540 — SUCCESS/);
  assert.match(state, /CodeQL:\s+#1475 \/ 31600575547 — SUCCESS/);
  assert.match(state, /externalEvidence:\s+not-collected/);
  assert.match(state, /PR #213/);
  assert.match(state, new RegExp(ADAPTER_MERGE_SHA));
  assert.match(state, /sparse pre-public-launch|SPARSE PRE-LAUNCH BASELINE/i);
  assertCurrentBoundary(state, 'PROJECT_STATE');
});

test('ROADMAP distinguishes accepted intake tooling, accepted raw adapter and still-open review', () => {
  assert.match(roadmap, /PR #210/);
  assert.match(roadmap, new RegExp(INTAKE_MERGE_SHA));
  assert.match(roadmap, /P4\.1B[^\n]{0,220}intake tooling[^\n]{0,220}(DONE|accepted|принят)/i);
  assert.match(roadmap, /PR #213/);
  assert.match(roadmap, new RegExp(ADAPTER_MERGE_SHA));
  assert.match(roadmap, /P4\.1B real Google Search Console adapter[^\n]*(?:DONE|PRODUCTION ACCEPTED)/i);
  assertCurrentBoundary(roadmap, 'ROADMAP');
});

test('CHANGELOG preserves #210 tooling history while recording #213 sparse observations', () => {
  assert.match(changelog, /PR #209/);
  assert.match(changelog, /PR #210/);
  assert.match(changelog, new RegExp(INTAKE_MERGE_SHA));
  assert.match(changelog, /Build #1922 \/ 31599699918 — SUCCESS/);
  assert.match(changelog, /731 PASS \/ 0 FAIL/);
  assert.match(changelog, /externalEvidence=not-collected/);
  assert.match(changelog, /PR #213/);
  assert.match(changelog, new RegExp(ADAPTER_MERGE_SHA));
  assert.match(changelog, /sparse pre-public-launch|SPARSE PRE-LAUNCH BASELINE/i);
  assertCurrentBoundary(changelog, 'CHANGELOG');
});

test('durable docs never promote sparse P4.1B review to completion', () => {
  for (const [label, source] of [['PROJECT_STATE', state], ['ROADMAP', roadmap], ['CHANGELOG', changelog]]) {
    assert.doesNotMatch(source, /P4\.1B\s+real external evidence review\s*[—:-]+\s*(?:COMPLETED|DONE|PRODUCTION ACCEPTED)/i, `${label}: sparse review must not be promoted to completion`);
  }
});
