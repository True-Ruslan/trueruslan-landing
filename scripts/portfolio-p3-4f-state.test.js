import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const projectStatePath = path.join(root, 'docs', 'PROJECT_STATE.md');
const roadmapPath = path.join(root, 'docs', 'ROADMAP.md');
const changelogPath = path.join(root, 'docs', 'CHANGELOG.md');
const specificationPath = path.join(
  root,
  'docs',
  'keystone',
  'specs',
  '2026-08-05-portfolio-1-0-evidence-first.md',
);
const projectState = fs.readFileSync(projectStatePath, 'utf8');
const roadmap = fs.readFileSync(roadmapPath, 'utf8');
const changelog = fs.readFileSync(changelogPath, 'utf8');
const specification = fs.readFileSync(specificationPath, 'utf8');

const snapshotDir = path.join(root, 'quality-artifacts', 'durable-source');
fs.mkdirSync(snapshotDir, {recursive: true});
for (const sourcePath of [projectStatePath, roadmapPath, changelogPath, specificationPath]) {
  fs.copyFileSync(sourcePath, path.join(snapshotDir, path.basename(sourcePath)));
}

const acceptedSha = '8d2c3aa45d2b02ad3c22de75aca3602b009c13e6';
const pagesRun = '31110585951';
const deploymentId = '5781321808';
const productionRun = '31110583631';

function assertAcceptedEvidence(document, label) {
  assert.match(document, new RegExp(acceptedSha), `${label}: missing accepted SHA`);
  assert.match(document, new RegExp(pagesRun), `${label}: missing Pages run`);
  assert.match(document, new RegExp(deploymentId), `${label}: missing deployment ID`);
  assert.match(document, new RegExp(productionRun), `${label}: missing Production Live run`);
}

test('durable state closes P3.4F after exact production acceptance and promotes P3.5', () => {
  assert.match(projectState, /#### P3\.4F — Evidence-driven project state — DONE/);
  assert.match(projectState, /\*\*P3\.5 — Selective English expansion\*\*/);
  assert.doesNotMatch(projectState, /Continue with:\s+\*\*P3\.4F/);
  assertAcceptedEvidence(projectState, 'PROJECT_STATE');

  assert.match(roadmap, /### P3\.4F — Evidence-driven project state — DONE/);
  assert.match(roadmap, /## P3\.5 — Selective English expansion — NEXT/);
  assert.doesNotMatch(roadmap, /### P3\.4F — Evidence-driven project state — NEXT/);
  assertAcceptedEvidence(roadmap, 'ROADMAP');

  assert.match(changelog, /## 2026-08-06 — P3\.4F Evidence-driven project state/);
  assert.match(changelog, /Next bounded slice:\s+\*\*P3\.5 — Selective English expansion\*\*/);
  assertAcceptedEvidence(changelog, 'CHANGELOG');

  assert.match(specification, /> Status: \*\*IN PROGRESS — P3\.4F ACCEPTED IN PRODUCTION\*\*/);
  assert.match(specification, /### P3\.4F — Evidence-driven project state — DONE/);
  assert.match(specification, /Continue with \*\*P3\.5 — Selective English expansion\*\*/);
  assertAcceptedEvidence(specification, 'Portfolio specification');
});
