import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const ACCEPTANCE = 'docs/acceptance/2026-08-10-portfolio-clarity-c3.md';
const PR_HEAD_SHA = 'd58e4fe53e53ab52c59d63222642c87f36aa4662';
const ACCEPTED_SHA = 'c54fd7c0e3554ffb6063fecfaa8135d02e9a6679';
const BUILD_RUN = '31385511275';
const PAGES_RUN = '31388753309';
const DEPLOYMENT_ID = '5832077852';
const LIVE_RUN = '31388848079';
const PRODUCTION_DIGEST = 'sha256:413205da34291556eabae8bf4d7f46f2af04be4fc63ce9cd42d8da801730c544';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireEvidence(source, label) {
  for (const marker of [PR_HEAD_SHA, ACCEPTED_SHA, BUILD_RUN, PAGES_RUN, DEPLOYMENT_ID, LIVE_RUN, PRODUCTION_DIGEST]) {
    assert.match(source, new RegExp(escapeRegExp(marker)), `${label}: missing ${marker}`);
  }
}

test('C3 durable acceptance ledger preserves exact source and production evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C3\s+—\s+Projects and flagship summary layer/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  assert.match(ledger, /Selected work\s+→\s+Commercial work\s+→\s+Labs & experiments/i);
  assert.match(ledger, /VillAIgence/i);
  assert.match(ledger, /NotchHub/i);
  assert.match(ledger, /TrueRuslan Landing/i);
  assert.match(ledger, /Vlezet/i);
});

test('PROJECT_STATE, ROADMAP and CHANGELOG record C3 and advance redesign to C4', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C3(?:\s+—)?\s+Projects and flagship summary layer/i, `${relativePath}: C3 milestone missing`);
    assert.match(source, /C4(?:\s+—)?\s+Professional surfaces/i, `${relativePath}: C4 next slice missing`);
  }
});

test('C3 durable state preserves P3.6 as waiting and does not claim product impact', () => {
  const ledger = read(ACCEPTANCE);
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');

  assert.match(ledger, /does not start, reset or close P3\.6 Measurement/i);
  assert.match(state, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+NEXT\s*\/\s*WAITING/i);
  assert.match(roadmap, /P3\.6[^\n]*NEXT\s*\/\s*WAITING/i);
  assert.doesNotMatch(ledger, /C3 (?:improved|increased|raised) (?:engagement|conversion|SEO)/i);
});
