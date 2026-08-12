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

test('durable state records accepted CodeQL Action maintenance', () => {
  assert.match(durable, /94a3748e5fd82ac707f2bcc69e4cab255ba217e5/);
  assert.match(durable, /CodeQL Action[^\n]*4\.37\.6/i);
  assert.match(durable, /Build[^\n]*#1887[^\n]*31579461177[^\n]*SUCCESS/i);
  assert.match(durable, /CodeQL[^\n]*#1435[^\n]*31579461126[^\n]*SUCCESS/i);
  assert.match(durable, /Pages[^\n]*#230[^\n]*31580165353[^\n]*SUCCESS/i);
  assert.match(durable, /Production Live(?: Smoke)?[^\n]*#511[^\n]*31580165196[^\n]*SUCCESS/i);
});

test('durable state records the rejected Diplodoc candidate without weakening issue 82', () => {
  assert.match(durable, /#185[^\n]*(?:CLOSED UNMERGED|closed unmerged)/i);
  assert.match(durable, /c4e6b8dd87f224ed92dca8598d8d49737bea1d0f/);
  assert.match(durable, /7 moderate[^\n]*0 high[^\n]*0 critical/i);
  assert.match(durable, /#82[^\n]*(?:OPEN|open|blocker)/i);
  assert.match(durable, /2026-08-17/);
  assert.match(durable, /#207[^\n]*(?:CLOSED UNMERGED|closed unmerged)/i);
  assert.match(durable, /dac054d274e48ce93828e97b83d09cc121024575/);
});

test('durable state records accepted Dependabot configuration maintenance', () => {
  assert.match(durable, /ef40c960e1849ee0551cb478d0cd71a3f69ef601/);
  assert.match(durable, /Build[^\n]*#1890[^\n]*31581385552[^\n]*(?:expected )?FAILURE/i);
  assert.match(durable, /Build[^\n]*#1891[^\n]*31581517909[^\n]*SUCCESS/i);
  assert.match(durable, /715 PASS[^\n]*0 FAIL/i);
  assert.match(durable, /Pages[^\n]*#231[^\n]*31582194873[^\n]*SUCCESS/i);
  assert.match(durable, /Production Live(?: Smoke)?[^\n]*#515[^\n]*31582244697[^\n]*SUCCESS/i);
  assert.match(durable, /Dependabot[^\n]*(?:unmanaged|invalid)[^\n]*labels/i);
});

test('maintenance reconciliation preserves P3.6 and P4.1C while P4.1B review is sparse', () => {
  assert.match(state, /P3\.6[^\n]*(?:NEXT|WAITING FOR EXTERNAL EVIDENCE|WAITING)/i);
  assert.match(roadmap, /P3\.6[^\n]*(?:NEXT|WAITING FOR EXTERNAL EVIDENCE|WAITING)/i);
  assert.match(durable, /2026-08-05T00:00:00Z/);
  assert.match(durable, /P4\.1B intake tooling[^\n]*(?:DONE|PRODUCTION ACCEPTED|accepted)/i);
  assert.match(state, /P4\.1B[^\n]*(?:real external evidence review|review)[^\n]*(?:IN PROGRESS|SPARSE PRE-LAUNCH BASELINE)/i);
  assert.match(roadmap, /P4\.1B[^\n]*(?:real external evidence review|review)[^\n]*(?:IN PROGRESS|SPARSE PRE-LAUNCH BASELINE)/i);
  assert.match(durable, /P4\.1C[^\n]*WAITING/i);
  assert.match(durable, /externalEvidence[^\n]*not-collected/i);
  assert.doesNotMatch(durable, /P4\.1B[^\n]*(?:real external evidence review|evidence review)[^\n]*(?:DONE|COMPLETED|PRODUCTION ACCEPTED)/i);
});
