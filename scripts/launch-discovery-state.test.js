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
const durable = `${state}\n${roadmap}\n${changelog}`;

test('durable state records production-accepted launch distribution evidence', () => {
  assert.match(durable, /91c4d3d5cb464a107e3d14d8d091cf4eb0c1638f/);
  assert.match(durable, /Pages[^\n]*#226[^\n]*31572318752[^\n]*SUCCESS/i);
  assert.match(durable, /Production Live(?: Smoke)?[^\n]*#504[^\n]*31572389064[^\n]*SUCCESS/i);
  assert.match(durable, /10 targets[^\n]*4 profiles[^\n]*0 stale[^\n]*0 unverified/i);
});

test('durable state records production-accepted launch preview metadata evidence', () => {
  assert.match(durable, /ffd420c4b2b9e42385529b7654eaaab5f0dbd9cf/);
  assert.match(durable, /Pages[^\n]*#227[^\n]*31573207215[^\n]*SUCCESS/i);
  assert.match(durable, /Production Live(?: Smoke)?[^\n]*#505[^\n]*31573207182[^\n]*SUCCESS/i);
  assert.match(durable, /701 PASS[^\n]*0 FAIL/i);
  assert.match(durable, /10 launch[^\n]*5 supplemental/i);
});

test('durable state records P4.1A repository and production acceptance without inventing external evidence', () => {
  assert.match(durable, /e75a4d24a5d9f2b8ace95c9a0629e7567992741b/);
  assert.match(durable, /Build[^\n]*#1879[^\n]*31573775442[^\n]*SUCCESS/i);
  assert.match(durable, /Pages[^\n]*#228[^\n]*31574516725[^\n]*SUCCESS/i);
  assert.match(durable, /Production Live(?: Smoke)?[^\n]*#507[^\n]*31574516705[^\n]*SUCCESS/i);
  assert.match(durable, /709 PASS[^\n]*0 FAIL/i);
  assert.match(durable, /11 strategic surfaces[^\n]*21 clean routes[^\n]*0 findings/i);
  assert.match(durable, /externalEvidence[^\n]*not-collected/i);
});

test('P3.6 remains open while P4.1B advances only to sparse pre-launch review', () => {
  assert.match(state, /P3\.6[^\n]*(?:NEXT|WAITING FOR EXTERNAL EVIDENCE|WAITING)/i);
  assert.match(roadmap, /P3\.6[^\n]*(?:NEXT|WAITING FOR EXTERNAL EVIDENCE|WAITING)/i);
  assert.match(durable, /2026-08-05T00:00:00Z/);
  assert.match(durable, /P4\.1B intake tooling[^\n]*(?:DONE|PRODUCTION ACCEPTED|accepted)/i);
  assert.match(state, /P4\.1B[^\n]*(?:real external evidence review|review)[^\n]*(?:IN PROGRESS|SPARSE PRE-LAUNCH BASELINE)/i);
  assert.match(roadmap, /P4\.1B[^\n]*(?:real external evidence review|review)[^\n]*(?:IN PROGRESS|SPARSE PRE-LAUNCH BASELINE)/i);
  assert.match(durable, /controlled launch[^\n]*(?:not-published|NOT PUBLISHED)/i);
  assert.match(durable, /P4\.1C[^\n]*WAITING/i);
  assert.match(durable, /externalEvidence[^\n]*not-collected/i);
  assert.doesNotMatch(durable, /P4\.1B\s+real external evidence review\s*[—:-]+\s*(?:DONE|COMPLETED|PRODUCTION ACCEPTED)/i);
});
