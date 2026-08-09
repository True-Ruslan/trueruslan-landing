import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const ACCEPTANCE = 'docs/acceptance/2026-08-09-portfolio-clarity-c1.md';
const FEATURE_SHA = '9cc9d69e6b49e3e9f3432788f0deb943d7acebf5';
const BUILD_RUN = '31304311486';
const PAGES_RUN = '31304612906';
const DEPLOYMENT_ID = '5817134996';
const LIVE_RUN = '31304642055';
const PRODUCTION_DIGEST = 'sha256:41af56c91d59b5c80134d49b1928b0fde348384334c8863ddd9c74c9f4e5c85c';

function requireEvidence(source, label) {
  for (const marker of [FEATURE_SHA, BUILD_RUN, PAGES_RUN, DEPLOYMENT_ID, LIVE_RUN, PRODUCTION_DIGEST]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${label}: missing ${marker}`);
  }
}

test('C1 durable acceptance ledger preserves exact repository and production evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C1\s+—\s+Presentation foundation/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  assert.match(ledger, /Onest/i);
  assert.match(ledger, /five(?:-| )destination/i);
});

test('PROJECT_STATE, ROADMAP and CHANGELOG record C1 while P3.6 remains waiting', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C1(?:\s+—)?\s+Presentation foundation/i, `${relativePath}: C1 milestone missing`);
  }

  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');
  assert.match(state, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+NEXT\s*\/\s*WAITING/i);
  assert.match(roadmap, /P3\.6[^\n]*NEXT\s*\/\s*WAITING/i);
});

test('C1 acceptance does not claim that the full redesign measurement baseline is complete', () => {
  const ledger = read(ACCEPTANCE);
  assert.match(ledger, /final accepted .*redesign/i);
  assert.match(ledger, /does not (?:start|reset|close).*P3\.6/i);
});
