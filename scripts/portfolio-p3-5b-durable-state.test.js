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
const PRODUCTION_RUN = '31161925498';

function assertAcceptanceEvidence(text, label) {
  assert.match(text, new RegExp(ACCEPTED_SHA), `${label} must record the accepted deployed SHA`);
  assert.match(text, new RegExp(PAGES_RUN), `${label} must record the exact Pages run`);
  assert.match(text, new RegExp(DEPLOYMENT_ID), `${label} must record the exact Pages deployment`);
  assert.match(text, new RegExp(PRODUCTION_RUN), `${label} must record the exact Production Live run`);
}

test('ROADMAP closes P3.5B and makes P3.5C the next bounded slice', () => {
  const roadmap = read('docs/ROADMAP.md');
  assert.match(roadmap, /### P3\.5B — English \/now — DONE/);
  assert.match(roadmap, /### P3\.5C — English Publications — NEXT/);
  assertAcceptanceEvidence(roadmap, 'ROADMAP');
});

test('PROJECT_STATE records P3.5B as latest accepted product truth', () => {
  const state = read('docs/PROJECT_STATE.md');
  assert.match(state, /Latest accepted product truth[\s\S]*P3\.5B — English \/now/);
  assert.match(state, /P3\.5B exact production acceptance/);
  assert.match(state, /P3\.5C — English Publications — NEXT/);
  assertAcceptanceEvidence(state, 'PROJECT_STATE');
});

test('CHANGELOG records the P3.5B feature, production verifier correction and exact acceptance', () => {
  const changelog = read('docs/CHANGELOG.md');
  assert.match(changelog, /## 2026-08-07 — P3\.5B English \/now/);
  assert.match(changelog, /PR #150/);
  assert.match(changelog, /PR #151/);
  assertAcceptanceEvidence(changelog, 'CHANGELOG');
});

test('Portfolio 1.0 spec advances from accepted P3.5B to P3.5C next', () => {
  const spec = read('docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md');
  assert.match(spec, /Status: \*\*IN PROGRESS — P3\.5B ACCEPTED IN PRODUCTION\*\*/);
  assert.match(spec, /### P3\.5B — English \/now — DONE/);
  assert.match(spec, /### P3\.5C — English Publications — NEXT/);
  assertAcceptanceEvidence(spec, 'Portfolio 1.0 spec');
});
