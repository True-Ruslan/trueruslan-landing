import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function findProject(projects, slug) {
  const project = projects.find((candidate) => candidate.slug === slug);
  assert.ok(project, `missing project ${slug}`);
  return project;
}

function findEvidence(snapshots, project) {
  const snapshot = snapshots.find((candidate) => candidate.project === project);
  assert.ok(snapshot, `missing evidence snapshot ${project}`);
  return snapshot;
}

function currentTimelineEntry(entries, slug) {
  const current = entries.filter((entry) => entry.state === 'current');
  assert.equal(current.length, 1, `${slug} must have exactly one current timeline entry`);
  return current[0];
}

test('freshness reconciliation records current external truth without promoting acceptance boundaries', () => {
  const projects = readJson('data/projects.json');
  const evidence = readJson('data/project-evidence.json');
  const vlezetHistory = readJson('data/project-history/vlezet.json');
  const livingworldHistory = readJson('data/project-history/livingworld.json');

  const vlezetProject = findProject(projects, 'vlezet');
  const livingworldProject = findProject(projects, 'livingworld');
  const portfolioProject = findProject(projects, 'portfolio-platform');
  const vlezetEvidence = findEvidence(evidence, 'vlezet');
  const livingworldEvidence = findEvidence(evidence, 'livingworld');
  const portfolioEvidence = findEvidence(evidence, 'portfolio-platform');

  assert.equal(vlezetProject.status, 'pre-production');
  assert.equal(vlezetProject.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(vlezetEvidence.lastVerified, '2026-08-08');
  assert.ok(
    vlezetEvidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'),
    'Vlezet must preserve M7.8B as the accepted recognition slice',
  );
  assert.ok(
    vlezetEvidence.versions.some(({label, value}) => label === 'Next acceptance boundary' && /Assisted Tracing/i.test(value)),
    'Vlezet must record Assisted Tracing as the next bounded acceptance direction',
  );

  const vlezet42 = vlezetEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  const vlezet44 = vlezetEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/44');
  const vlezet45 = vlezetEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/45');
  const vlezet52 = vlezetEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/52');
  assert.equal(vlezet42?.state, 'failed');
  assert.match(vlezet42?.scope ?? '', /closed unmerged|product-owner.*FAIL|usefulness acceptance/i);
  for (const signal of [vlezet44, vlezet45]) {
    assert.equal(signal?.state, 'unavailable');
    assert.match(signal?.scope ?? '', /closed unmerged|R&D evidence|not accepted/i);
  }
  assert.equal(vlezet52?.state, 'pending');
  assert.match(vlezet52?.scope ?? '', /Assisted Tracing|design gate|no product code|M7\.8B/i);
  assert.match(currentTimelineEntry(vlezetHistory, 'vlezet').title, /Assisted Tracing/i);

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworldEvidence.lastVerified, '2026-08-08');
  assert.ok(
    livingworldEvidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.2.0+1.21.1'),
    'VillAIgence 0.2.0 release must be recorded',
  );
  assert.ok(
    livingworldEvidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && /7 PASS \/ 0 FAIL/.test(value)),
    'VillAIgence clean-world installed result must be recorded',
  );
  assert.ok(
    livingworldEvidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && /VAI-M2-INST-005.*VAI-CONCUR-004/.test(value)),
    'untested VillAIgence boundaries must remain explicit',
  );

  const release020 = livingworldEvidence.signals.find(({label}) => label.includes('0.2.0+1.21.1'));
  assert.equal(release020?.state, 'published');
  assert.match(release020?.scope ?? '', /7 PASS \/ 0 FAIL|byte-identical|NOT TESTED/i);
  const beliefAdmission = livingworldEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/123');
  assert.equal(beliefAdmission?.state, 'merged');
  assert.match(beliefAdmission?.scope ?? '', /BELIEF|FACT|SYSTEM_OBSERVED|admission/i);
  const beliefExtraction = livingworldEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/125');
  assert.equal(beliefExtraction?.state, 'pending');
  assert.match(beliefExtraction?.scope ?? '', /Draft|RED|candidate extraction|not accepted/i);
  assert.match(currentTimelineEntry(livingworldHistory, 'livingworld').title, /BELIEF candidate extraction/i);

  assert.equal(portfolioProject.status, 'production');
  assert.equal(portfolioEvidence.lastVerified, '2026-08-08');
  assert.ok(
    portfolioEvidence.versions.some(({label, value}) => label === 'Analytics' && /Cloudflare.*Yandex Metrica/i.test(value)),
    'portfolio analytics boundary must include consent-gated Yandex Metrica',
  );
  const p36c = portfolioEvidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/158');
  assert.equal(p36c?.state, 'merged');
  assert.match(p36c?.scope ?? '', /consent|zero Yandex requests|P3\.6.*open/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /P3\.6C.*PRODUCTION ACCEPTED/is);
  assert.match(projectState, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(roadmap, /P3\.6.*Measurement checkpoint.*NEXT \/ WAITING/is);
  assert.match(changelog, /P3\.6C.*PRODUCTION ACCEPTED/is);
});
