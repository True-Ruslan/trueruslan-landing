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

const ACCEPTED_SHA = 'f189d100785f0aea363df306fb7a923c06ee61a2';
const PAGES_RUN = '31180427543';
const PAGES_DEPLOYMENT = '5794904843';
const PAGES_ARTIFACT = '8994536006';
const PAGES_DIGEST = 'sha256:847a0705f2ce1896a2046abdfec428b4c4ef43cf39270f62fb675b3e785468b1';
const PRODUCTION_RUN = '31180478038';
const PRODUCTION_ARTIFACT = '8994603193';
const PRODUCTION_DIGEST = 'sha256:f7eedbffc29f7f8ed322cf14d654ad19f0cc35fca3e53aa1bcd64000ca652d80';

function assertAcceptanceEvidence(source, label) {
  for (const marker of [
    ACCEPTED_SHA,
    PAGES_RUN,
    PAGES_DEPLOYMENT,
    PAGES_ARTIFACT,
    PAGES_DIGEST,
    PRODUCTION_RUN,
    PRODUCTION_ARTIFACT,
    PRODUCTION_DIGEST,
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${label} misses ${marker}`);
  }
}

test('PROJECT_STATE records P3.5C as the latest exact production-accepted truth', () => {
  const state = read('docs/PROJECT_STATE.md');
  assert.match(state, /P3\.5C — English Publications/);
  assert.match(state, /Latest accepted product truth[\s\S]*P3\.5C — English Publications/);
  assert.match(state, /P3\.5C exact production acceptance/);
  assertAcceptanceEvidence(state, 'PROJECT_STATE');
});

test('ROADMAP closes P3.5C and makes P3.6 a bounded measurement checkpoint', () => {
  const roadmap = read('docs/ROADMAP.md');
  assert.match(roadmap, /P3\.5C English Publications/);
  assert.match(roadmap, /### P3\.5C — English Publications — DONE/);
  assert.match(roadmap, /P3\.6 — Measurement checkpoint — NEXT/);
  assert.match(roadmap, /sufficient aggregate traffic/i);
  assertAcceptanceEvidence(roadmap, 'ROADMAP');
});

test('Portfolio 1.0 specification records P3.5C production acceptance without weakening evidence boundaries', () => {
  const spec = read('docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md');
  assert.match(spec, /Status: \*\*IN PROGRESS — P3\.5C ACCEPTED IN PRODUCTION\*\*/);
  assert.match(spec, /### P3\.5C — English Publications — DONE/);
  assert.match(spec, /one generated site-wide search|single generated Diplodoc search/i);
  assert.match(spec, /original publication (?:identities|titles)/i);
  assertAcceptanceEvidence(spec, 'Portfolio 1.0 spec');
});

test('CHANGELOG preserves the exact P3.5C acceptance ledger', () => {
  const changelog = read('docs/CHANGELOG.md');
  assert.match(changelog, /P3\.5C/);
  assert.match(changelog, /English Publications/);
  assertAcceptanceEvidence(changelog, 'CHANGELOG');
});
