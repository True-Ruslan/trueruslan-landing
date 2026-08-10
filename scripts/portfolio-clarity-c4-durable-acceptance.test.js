import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const ACCEPTANCE = 'docs/acceptance/2026-08-10-portfolio-clarity-c4.md';
const PR_HEAD_SHA = '90551bf476a167a589ee1b4a5fab2cb11c8cd923';
const ACCEPTED_SHA = '12ea58e815ebf09bcc5915e92a715cd3bfed5241';
const BUILD_RUN = '31400871629';
const PAGES_RUN = '31401684624';
const DEPLOYMENT_ID = '5834505086';
const LIVE_RUN = '31402338027';
const PRODUCTION_DIGEST = 'sha256:8548b1740dd7d8e746feaedcc08ce6b227df786fa4646b4b7018e9bb1928f264';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireEvidence(source, label) {
  for (const marker of [PR_HEAD_SHA, ACCEPTED_SHA, BUILD_RUN, PAGES_RUN, DEPLOYMENT_ID, LIVE_RUN, PRODUCTION_DIGEST]) {
    assert.match(source, new RegExp(escapeRegExp(marker)), `${label}: missing ${marker}`);
  }
}

test('C4 durable acceptance ledger preserves exact source and production evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C4\s+—\s+Professional surfaces/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  for (const marker of ['Experience', 'Work with me', 'About', 'Now', 'Contacts']) {
    assert.match(ledger, new RegExp(marker, 'i'), `${ACCEPTANCE}: missing ${marker}`);
  }
});

test('PROJECT_STATE, ROADMAP and CHANGELOG record C4 and advance redesign to C5', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C4(?:\s+—)?\s+Professional surfaces/i, `${relativePath}: C4 milestone missing`);
    assert.match(source, /C5(?:\s+—)?\s+Knowledge surfaces/i, `${relativePath}: C5 next slice missing`);
  }
});

test('C4 durable state preserves P3.6 as waiting and does not claim product impact', () => {
  const ledger = read(ACCEPTANCE);
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');

  assert.match(ledger, /does not start, reset or close P3\.6 Measurement/i);
  assert.match(state, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+NEXT\s*\/\s*WAITING/i);
  assert.match(roadmap, /P3\.6[^\n]*NEXT\s*\/\s*WAITING/i);
  assert.doesNotMatch(ledger, /C4 (?:improved|increased|raised) (?:engagement|conversion|SEO)/i);
});
