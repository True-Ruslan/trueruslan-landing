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

const ACCEPTED_SHA = '96ea3ec5de18d99a811405b36a5b60066d9c374c';
const PAGES_RUN = '31161876484';
const DEPLOYMENT_ID = '5791352097';
const PAGES_ARTIFACT = '8987394027';
const PAGES_DIGEST = 'sha256:7c456d8e8f534bed6c2f2c410f615004c7d2dff37b71fe0ea7709cfb7129f999';
const PRODUCTION_RUN = '31161925498';
const PRODUCTION_ARTIFACT = '8987452957';
const PRODUCTION_DIGEST = 'sha256:2fe174a95fca6daa28d261f281576597d6d383d432a7a0cc32f9cdbb231d08b5';

function assertAcceptanceEvidence(text, label) {
  assert.match(text, new RegExp(ACCEPTED_SHA), `${label} must record the accepted deployed SHA`);
  assert.match(text, new RegExp(PAGES_RUN), `${label} must record the exact Pages run`);
  assert.match(text, new RegExp(DEPLOYMENT_ID), `${label} must record the exact Pages deployment`);
  assert.match(text, new RegExp(PAGES_ARTIFACT), `${label} must record the deployed Pages artifact`);
  assert.ok(text.includes(PAGES_DIGEST), `${label} must record the Pages artifact digest`);
  assert.match(text, new RegExp(PRODUCTION_RUN), `${label} must record the exact Production Live run`);
  assert.match(text, new RegExp(PRODUCTION_ARTIFACT), `${label} must record the Production Live artifact`);
  assert.ok(text.includes(PRODUCTION_DIGEST), `${label} must record the Production Live artifact digest`);
}

test('ROADMAP preserves P3.5B acceptance after P3.5C and advances only to P3.6', () => {
  const roadmap = read('docs/ROADMAP.md');
  assert.match(roadmap, /### P3\.5B — English \/now — DONE/);
  assert.match(roadmap, /### P3\.5C — English Publications — DONE/);
  assert.match(roadmap, /P3\.6 — Measurement checkpoint — NEXT/);
  assertAcceptanceEvidence(roadmap, 'ROADMAP');
});

test('PROJECT_STATE preserves P3.5B exact acceptance after later product truth advances', () => {
  const state = read('docs/PROJECT_STATE.md');
  assert.match(state, /Latest accepted product truth[\s\S]*P3\.5C — English Publications/);
  assert.match(state, /P3\.5B exact production acceptance/);
  assert.match(state, /P3\.5C exact production acceptance/);
  assertAcceptanceEvidence(state, 'PROJECT_STATE');
});

test('CHANGELOG records the P3.5B feature, production verifier correction and exact acceptance', () => {
  const changelog = read('docs/CHANGELOG.md');
  assert.match(changelog, /## 2026-08-07 — P3\.5B English \/now/);
  assert.match(changelog, /PR #150/);
  assert.match(changelog, /PR #151/);
  assertAcceptanceEvidence(changelog, 'CHANGELOG');
});

test('Portfolio 1.0 spec preserves accepted P3.5B while later milestones advance', () => {
  const spec = read('docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md');
  assert.match(spec, /### P3\.5B — English \/now — DONE/);
  assert.match(spec, /### P3\.5C — English Publications — DONE/);
  assert.match(spec, /P3\.6 — Measurement checkpoint — NEXT/);
  assertAcceptanceEvidence(spec, 'Portfolio 1.0 spec');
});
