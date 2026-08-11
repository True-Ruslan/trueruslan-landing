import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const ACCEPTANCE = 'docs/acceptance/2026-08-11-portfolio-clarity-c6.md';
const FEATURE_HEAD_SHA = '3104089b500e1f680117eb86e14347f3a7309b35';
const FEATURE_SQUASH_SHA = '3bed9077ea02f50d1e2d0bb13cc3430174486a7e';
const HOTFIX_HEAD_SHA = 'ffadb765ac29ffad4988727c980be7bffc0dd58a';
const ACCEPTED_SHA = '4751e14f4464b1c55153bf8803d7367d67b5fa7b';
const BUILD_RUN = '31471924720';
const HOTFIX_BUILD_RUN = '31473097553';
const PAGES_RUN = '31473635637';
const DEPLOYMENT_ID = '5847044248';
const LIVE_RUN = '31473689705';
const PRODUCTION_DIGEST = 'sha256:1d3c3b4cb6f068b2bb9e755ea17cc466f7afe4306e899d690b1d63c3ce5ec27f';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireEvidence(source, label) {
  for (const marker of [
    FEATURE_HEAD_SHA,
    FEATURE_SQUASH_SHA,
    HOTFIX_HEAD_SHA,
    ACCEPTED_SHA,
    BUILD_RUN,
    HOTFIX_BUILD_RUN,
    PAGES_RUN,
    DEPLOYMENT_ID,
    LIVE_RUN,
    PRODUCTION_DIGEST,
  ]) {
    assert.match(source, new RegExp(escapeRegExp(marker)), `${label}: missing ${marker}`);
  }
}

test('C6 durable acceptance ledger preserves exact feature, correction and production evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C6\s+—\s+final EN\/SEO reconciliation/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  for (const marker of ['13 controlled RU/EN pairs', 'Person JSON-LD', 'English Now', 'canonical metadata']) {
    assert.match(ledger, new RegExp(marker, 'i'), `${ACCEPTANCE}: missing ${marker}`);
  }
});

test('PROJECT_STATE, ROADMAP and CHANGELOG record C6 and advance redesign to C7', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C6(?:\s+—)?\s+final EN\/SEO reconciliation/i, `${relativePath}: C6 milestone missing`);
    assert.match(source, /C7(?:\s+—)?\s+production baseline \+ P3\.6 handoff/i, `${relativePath}: C7 next slice missing`);
  }
});

test('C6 durable state preserves the measurement boundary', () => {
  const ledger = read(ACCEPTANCE);
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');

  assert.match(ledger, /does not start, reset or close P3\.6 Measurement/i);
  assert.match(state, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+NEXT\s*\/\s*WAITING/i);
  assert.match(roadmap, /P3\.6[^\n]*NEXT\s*\/\s*WAITING/i);
  assert.doesNotMatch(ledger, /C6 (?:improved|increased|raised) (?:engagement|conversion|SEO)/i);
});
