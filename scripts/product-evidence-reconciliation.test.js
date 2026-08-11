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

function currentTimelineEntry(entries, slug) {
  const current = entries.filter((entry) => entry.state === 'current');
  assert.equal(current.length, 1, `${slug} must have exactly one current timeline entry`);
  return current[0];
}

test('freshness reconciliation records 2026-08-11 current truth without promoting lifecycle or measurement boundaries', () => {
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
  assert.equal(vlezetEvidence.lastVerified, '2026-08-11');
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.1.*accepted.*merged/i.test(value)));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2.*Draft.*clipboard.*pending/i.test(value)));

  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/42').state, 'failed');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/44').state, 'unavailable');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/45').state, 'unavailable');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.match(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').scope, /closed unmerged.*superseded/i);
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/85').state, 'merged');
  assert.match(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/85').scope, /product-owner accepted.*9\/9|9\/9.*product-owner accepted/i);
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/87').state, 'pending');
  assert.match(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/87').scope, /clipboard retest.*pending/i);
  assert.match(currentTimelineEntry(vlezetHistory, 'vlezet').title, /M8\.2.*Draft/i);

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworldEvidence.lastVerified, '2026-08-11');
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.2.0+1.21.1'));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && /7 PASS \/ 0 FAIL/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && /VAI-M2-INST-005.*VAI-CONCUR-004/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Latest merged source capability' && /causal NPC↔NPC social mutation.*#153/i.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Active development slice' && /Personality.*Draft.*#155/i.test(value)));

  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/123').state, 'merged');
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/125').state, 'merged');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/125').scope, /Server-owned provenance.*FACT authority remain unchanged/i);
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/153').state, 'merged');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/153').scope, /620\/620 tests.*146 gates/i);
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/155').state, 'pending');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/155').scope, /Draft TDD/i);
  assert.match(currentTimelineEntry(livingworldHistory, 'livingworld').title, /Personality.*social snapshot.*Draft/i);

  assert.equal(portfolioProject.status, 'production');
  assert.equal(portfolioEvidence.lastVerified, '2026-08-11');
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/198').state, 'merged');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516118934').state, 'published');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516213818').state, 'passed');
  assert.match(currentTimelineEntry(portfolioHistory, 'portfolio-platform').title, /C7.*production baseline/i);
  assert.match(currentTimelineEntry(portfolioHistory, 'portfolio-platform').description, /P3\.6.*NEXT|WAITING/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /M8\.1.*#85.*accepted|#85.*accepted/is);
  assert.match(projectState, /M8\.2.*#87.*Draft/is);
  assert.match(projectState, /#153.*merged.*#155.*Draft/is);
  assert.match(projectState, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(roadmap, /M8\.1.*#85/is);
  assert.match(roadmap, /#153.*#155/is);
  assert.match(roadmap, /P3\.6.*Measurement checkpoint.*NEXT \/ WAITING/is);
  assert.match(changelog, /Content Freshness reconciliation.*CURRENT EXTERNAL EVIDENCE/is);
  assert.match(changelog, /P3\.6.*NEXT \/ WAITING/is);
});
