import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const ACCEPTANCE = 'docs/acceptance/2026-08-10-portfolio-clarity-c2.md';
const FEATURE_SHA = '5fe5c6e15a61e54edd39e94140c7554ba19c5203';
const ACCEPTED_SHA = '361543c383b394d1f4cb061a97473038972340cf';
const BUILD_RUN = '31341749976';
const PAGES_RUN = '31342012579';
const DEPLOYMENT_ID = '5823994260';
const LIVE_RUN = '31342042518';
const PRODUCTION_DIGEST = 'sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireEvidence(source, label) {
  for (const marker of [FEATURE_SHA, ACCEPTED_SHA, BUILD_RUN, PAGES_RUN, DEPLOYMENT_ID, LIVE_RUN, PRODUCTION_DIGEST]) {
    assert.match(source, new RegExp(escapeRegExp(marker)), `${label}: missing ${marker}`);
  }
}

test('C2 durable acceptance ledger preserves exact repository and production evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C2\s+—\s+Homepage clarity/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  assert.match(ledger, /Hero\s+→\s+Proof\s+→\s+Selected work\s+→\s+Experience\s+→\s+Writing\s+→\s+Work with me\s+→\s+Personal/i);
  assert.match(ledger, /proofFacts:\s+4/i);
  assert.match(ledger, /selectedProjects:\s+3/i);
  assert.match(ledger, /primaryNavigationItems:\s+5/i);
});

test('PROJECT_STATE, ROADMAP and CHANGELOG record C2 and advance the redesign to C3', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C2(?:\s+—)?\s+Homepage clarity/i, `${relativePath}: C2 milestone missing`);
    assert.match(source, /C3(?:\s+—)?\s+Projects(?: and| \+) flagship summary layer/i, `${relativePath}: C3 next slice missing`);
  }
});

test('C2 durable state preserves P3.6 as waiting and does not promote presentation into product impact', () => {
  const ledger = read(ACCEPTANCE);
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');

  assert.match(ledger, /does not start, reset or close P3\.6 Measurement/i);
  assert.match(state, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+NEXT\s*\/\s*WAITING/i);
  assert.match(roadmap, /P3\.6[^\n]*NEXT\s*\/\s*WAITING/i);
  assert.doesNotMatch(ledger, /C2 (?:improved|increased|raised) (?:engagement|conversion)/i);
});
