import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const ACCEPTANCE = 'docs/acceptance/2026-08-11-portfolio-clarity-c5.md';
const PR_HEAD_SHA = 'f99c4534932a86e6cac0876b4a082639786d4ad9';
const ACCEPTED_SHA = '00900e832d69356bbccaa874f1b625876dad1e21';
const BUILD_RUN = '31437853159';
const PAGES_RUN = '31466807721';
const DEPLOYMENT_ID = '5845809144';
const LIVE_RUN = '31466868392';
const PRODUCTION_DIGEST = 'sha256:4e3349bdbb8b44326049750074810b3f6ed150e7b6b8922bf75aee43354d93b0';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireEvidence(source, label) {
  for (const marker of [PR_HEAD_SHA, ACCEPTED_SHA, BUILD_RUN, PAGES_RUN, DEPLOYMENT_ID, LIVE_RUN, PRODUCTION_DIGEST]) {
    assert.match(source, new RegExp(escapeRegExp(marker)), `${label}: missing ${marker}`);
  }
}

test('C5 durable acceptance ledger preserves exact source and production evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C5\s+—\s+Knowledge surfaces/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  for (const marker of ['Engineering Notes', 'Publications', 'Engineering Map', 'Sources']) {
    assert.match(ledger, new RegExp(marker, 'i'), `${ACCEPTANCE}: missing ${marker}`);
  }
});

test('PROJECT_STATE, ROADMAP and CHANGELOG record C5 and advance redesign to C6', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C5(?:\s+—)?\s+Knowledge surfaces/i, `${relativePath}: C5 milestone missing`);
    assert.match(source, /C6(?:\s+—)?\s+final EN\/SEO reconciliation/i, `${relativePath}: C6 next slice missing`);
  }
});

test('C5 durable state preserves P3.6 as waiting and does not claim product impact', () => {
  const ledger = read(ACCEPTANCE);
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');

  assert.match(ledger, /does not start, reset or close P3\.6 Measurement/i);
  assert.match(state, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+NEXT\s*\/\s*WAITING/i);
  assert.match(roadmap, /P3\.6[^\n]*NEXT\s*\/\s*WAITING/i);
  assert.doesNotMatch(ledger, /C5 (?:improved|increased|raised) (?:engagement|conversion|SEO)/i);
});
