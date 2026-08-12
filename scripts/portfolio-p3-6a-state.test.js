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

const ACCEPTED_SHA = '7cc56d024fbde53156a9136b14b00c81c6718811';
const PR_BUILD_RUN = '31185270870';
const PR_QUALITY_ARTIFACT = '8996659434';
const PR_QUALITY_DIGEST = 'sha256:07b6c53547894d1456525ed5574ecb9554c15a2178c16193435cf91937b06a32';
const PR_MEASUREMENT_RUN = '31185271128';
const PR_MEASUREMENT_ARTIFACT = '8996446081';
const PR_MEASUREMENT_DIGEST = 'sha256:7a1f05c829867c7bc0fff757a512a95f11e2c1fcb27a3684d2acc90ecfbef87a';
const POST_MERGE_MEASUREMENT_RUN = '31185967995';
const POST_MERGE_MEASUREMENT_ARTIFACT = '8996722305';
const POST_MERGE_MEASUREMENT_DIGEST = 'sha256:d6ab858824c2284a964a4b37f0e7377bb322af8baed922b8af83b27bbb36bce9';
const PAGES_RUN = '31185967012';
const PAGES_DEPLOYMENT = '5795968137';
const PRODUCTION_RUN = '31186078593';
const PRODUCTION_ARTIFACT = '8996831585';
const PRODUCTION_DIGEST = 'sha256:d8e4fae2cf63bfc1d2c8742eea68d4fbdb3d9ef588df834d2e65473fa22a475d';

function assertEvidence(text, label) {
  for (const marker of [
    ACCEPTED_SHA,
    PR_BUILD_RUN,
    PR_QUALITY_ARTIFACT,
    PR_QUALITY_DIGEST,
    PR_MEASUREMENT_RUN,
    PR_MEASUREMENT_ARTIFACT,
    PR_MEASUREMENT_DIGEST,
    POST_MERGE_MEASUREMENT_RUN,
    POST_MERGE_MEASUREMENT_ARTIFACT,
    POST_MERGE_MEASUREMENT_DIGEST,
    PAGES_RUN,
    PAGES_DEPLOYMENT,
    PRODUCTION_RUN,
    PRODUCTION_ARTIFACT,
    PRODUCTION_DIGEST,
  ]) {
    assert.ok(text.includes(marker), `${label} misses ${marker}`);
  }
}

test('PROJECT_STATE records P3.6A readiness acceptance without claiming P3.6 measurement acceptance', () => {
  const state = read('docs/PROJECT_STATE.md');
  assert.match(state, /P3\.6A — Measurement readiness/);
  assert.match(state, /synthetic-pipeline-proof/);
  assert.match(state, /not production measurement evidence/i);
  assert.match(state, /P3\.6[^\n]*Measurement checkpoint[^\n]*(NEXT|WAITING)/i);
  assert.doesNotMatch(state, /P3\.6 — Measurement checkpoint — DONE/);
  assert.match(
    state,
    /## 6\. Approved next product slice[\s\S]*Portfolio 1\.0 presentation implementation is \*\*COMPLETE THROUGH C7\*\*[\s\S]*Current bounded implementation: P4\.1A — Search Discovery repository readiness[\s\S]*P3\.6 remains \*\*NEXT \/ WAITING FOR EXTERNAL EVIDENCE\*\*/,
  );
  assert.doesNotMatch(state, /\*\*P3\.5C — English Publications — NEXT\*\*/);
  assertEvidence(state, 'PROJECT_STATE');
});

test('ROADMAP closes P3.6A tooling while keeping real P3.6 measurement open', () => {
  const roadmap = read('docs/ROADMAP.md');
  assert.match(roadmap, /P3\.6A — Measurement readiness — DONE/);
  assert.match(roadmap, /P3\.6 — Measurement checkpoint — (NEXT|WAITING)/);
  assert.match(roadmap, /operator-observed/);
  assert.match(roadmap, /synthetic-pipeline-proof/);
  assert.doesNotMatch(roadmap, /P3\.6 — Measurement checkpoint — DONE/);
  assertEvidence(roadmap, 'ROADMAP');
});

test('Portfolio 1.0 specification preserves P3.6 evidence-class boundary', () => {
  const spec = read('docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md');
  assert.match(spec, /P3\.6A — Measurement readiness — DONE/);
  assert.match(spec, /P3\.6 — Measurement checkpoint — (NEXT|WAITING)/);
  assert.match(spec, /synthetic-pipeline-proof/);
  assert.match(spec, /operator-observed/);
  assert.match(spec, /readyForHumanReview=false/);
  assertEvidence(spec, 'Portfolio 1.0 spec');
});

test('CHANGELOG records P3.6A pipeline proof separately from real measurement', () => {
  const changelog = read('docs/CHANGELOG.md');
  assert.match(changelog, /P3\.6A/);
  assert.match(changelog, /Measurement readiness/);
  assert.match(changelog, /synthetic-pipeline-proof/);
  assert.match(changelog, /P3\.6[^\n]*(?:remains|оста[её]тся|NEXT|WAITING)/i);
  assertEvidence(changelog, 'CHANGELOG');
});