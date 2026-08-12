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

const MERGE_SHA = '6083e4d950d74b272cce199fedccc730dfcc4fed';

function assertCurrentBoundary(source, label) {
  assert.match(source, /P4\.1B[^\n]{0,220}intake tooling[^\n]{0,220}(PRODUCTION ACCEPTED|accepted|принят)/i, `${label}: intake tooling acceptance missing`);
  assert.match(source, /real external evidence[^\n]{0,220}(NEXT|not collected|не собра)/i, `${label}: real external collection boundary missing`);
  assert.match(source, /P4\.1C[^\n]{0,180}WAITING/i, `${label}: P4.1C evidence gate missing`);
  assert.match(source, /P3\.6[^\n]{0,220}(NEXT \/ WAITING|WAITING FOR EXTERNAL EVIDENCE)/i, `${label}: P3.6 boundary missing`);
}

test('PROJECT_STATE records #209 reconciliation and #210 intake tooling without promoting external evidence', () => {
  assert.match(state, /PR #209/);
  assert.match(state, /723 PASS \/ 0 FAIL/);
  assert.match(state, /PR #210/);
  assert.match(state, new RegExp(MERGE_SHA));
  assert.match(state, /731 PASS \/ 0 FAIL/);
  assert.match(state, /Pages:\s+#234 \/ 31600575541 — SUCCESS/);
  assert.match(state, /Production Live Smoke:\s+#520 \/ 31600575540 — SUCCESS/);
  assert.match(state, /CodeQL:\s+#1475 \/ 31600575547 — SUCCESS/);
  assert.match(state, /externalEvidence:\s+not-collected/);
  assert.match(state, /raw (?:CSV\/API )?adapters[^\n]{0,220}(actual|real|фактичес)/i);
  assertCurrentBoundary(state, 'PROJECT_STATE');
});

test('ROADMAP distinguishes completed intake tooling from still-next collection', () => {
  assert.match(roadmap, /PR #210/);
  assert.match(roadmap, new RegExp(MERGE_SHA));
  assert.match(roadmap, /P4\.1B[^\n]{0,220}intake tooling[^\n]{0,220}(DONE|accepted|принят)/i);
  assert.match(roadmap, /P4\.1B[^\n]{0,220}(collection|external evidence|observations)[^\n]{0,220}NEXT/i);
  assertCurrentBoundary(roadmap, 'ROADMAP');
});

test('CHANGELOG records the accepted tooling as history but no collection claim', () => {
  assert.match(changelog, /PR #209/);
  assert.match(changelog, /PR #210/);
  assert.match(changelog, new RegExp(MERGE_SHA));
  assert.match(changelog, /Build #1922 \/ 31599699918 — SUCCESS/);
  assert.match(changelog, /731 PASS \/ 0 FAIL/);
  assert.match(changelog, /externalEvidence=not-collected/);
  assertCurrentBoundary(changelog, 'CHANGELOG');
});

test('durable docs never describe P4.1B collection as completed solely from intake tooling', () => {
  for (const [label, source] of [['PROJECT_STATE', state], ['ROADMAP', roadmap], ['CHANGELOG', changelog]]) {
    assert.doesNotMatch(source, /P4\.1B[^\n]{0,160}(external evidence|collection|observations)[^\n]{0,160}(COMPLETED|DONE|PRODUCTION ACCEPTED)/i, `${label}: external evidence must not be promoted by tooling`);
  }
});
