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

function signal(snapshot, url) {
  const value = snapshot.signals.find((candidate) => candidate.url === url);
  assert.ok(value, `${snapshot.project}: missing signal ${url}`);
  return value;
}

function timelineEntry(entries, slug, state) {
  const matches = entries.filter((entry) => entry.state === state);
  assert.equal(matches.length, 1, `${slug} must have exactly one ${state} timeline entry`);
  return matches[0];
}

test('freshness reconciliation records current truth without promoting lifecycle, installed acceptance or measurement boundaries', () => {
  const projects = readJson('data/projects.json');
  const evidence = readJson('data/project-evidence.json');
  const vlezetHistory = readJson('data/project-history/vlezet.json');
  const livingworldHistory = readJson('data/project-history/livingworld.json');
  const portfolioHistory = readJson('data/project-history/portfolio-platform.json');

  const vlezetProject = findProject(projects, 'vlezet');
  const livingworldProject = findProject(projects, 'livingworld');
  const portfolioProject = findProject(projects, 'portfolio-platform');
  const vlezetEvidence = findEvidence(evidence, 'vlezet');
  const livingworldEvidence = findEvidence(evidence, 'livingworld');
  const portfolioEvidence = findEvidence(evidence, 'portfolio-platform');

  assert.equal(vlezetProject.status, 'pre-production');
  assert.equal(vlezetProject.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(vlezetEvidence.lastVerified, '2026-08-14');
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.2.*accepted.*merged/i.test(value)));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2 complete.*testing-policy.*coverage.*M8\.3/i.test(value)));
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/42').state, 'failed');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  const vlezetAccepted = signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.equal(vlezetAccepted.state, 'merged');
  assert.equal(vlezetAccepted.observedAt, '2026-08-13');
  assert.match(vlezetAccepted.scope, /product-owner acceptance/i);
  assert.match(vlezetAccepted.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/88').state, 'merged');
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'current').title, /M8\.2.*accepted.*merged/i);
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'next').title, /testing-policy.*coverage.*M8\.3/i);

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworldEvidence.lastVerified, '2026-08-14');
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.3.1+1.21.1'));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current 0.3.1 acceptance' && /VAI-PCM-MULTI-001.*PENDING/i.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && /7 PASS \/ 0 FAIL/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && /VAI-M2-INST-005.*VAI-CONCUR-004/.test(value)));
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1').state, 'published');
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/165').state, 'merged');
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/167').state, 'merged');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/167').scope, /No installed PASS is claimed/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'current').title, /0\.3\.1.*installed canary pending/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'next').title, /VAI-PCM-MULTI-001.*canary/i);

  assert.equal(portfolioProject.status, 'production');
  assert.equal(portfolioProject.statusLabel, 'PRODUCTION');
  assert.equal(portfolioEvidence.lastVerified, '2026-08-14');
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Current production baseline' && /f0e489d75f5bcb1f64057e1046faad877bf3f952/.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Search Discovery' && /P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published/i.test(value)));
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/234').state, 'merged');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/237').state, 'merged');
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'current').title, /N6.*editorial UX.*production accepted/i);
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'next').title, /Controlled manual launch.*real search.*measurement evidence/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(roadmap, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(changelog, /P3\.6.*NEXT \/ WAITING/is);
  for (const source of [projectState, roadmap, changelog]) {
    assert.doesNotMatch(source, /P3\.6\s*(?:—|-|:)\s*(?:ACCEPTED|COMPLETED)/i);
  }
});
