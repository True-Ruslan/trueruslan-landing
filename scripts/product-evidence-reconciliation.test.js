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
  assert.equal(vlezetEvidence.lastVerified, '2026-08-12');
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.1.*accepted.*merged/i.test(value)));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2.*precision.*structural.*Draft/i.test(value) && /retest.*pending/i.test(value)));

  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/42').state, 'failed');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/44').state, 'unavailable');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/45').state, 'unavailable');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.match(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').scope, /closed unmerged.*superseded/i);
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/85').state, 'merged');
  assert.match(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/85').scope, /product-owner accepted.*9\/9|9\/9.*product-owner accepted/i);
  const vlezetCurrent = signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.equal(vlezetCurrent.state, 'pending');
  assert.equal(vlezetCurrent.observedAt, '2026-08-12');
  assert.match(vlezetCurrent.scope, /789f1de8eae92eebc8988a41f07439927431fb8b/);
  assert.match(vlezetCurrent.scope, /manual product-owner.*pending/i);
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'current').title, /M8\.2.*precision.*structural.*Draft/i);
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'next').description, /product-owner/i);

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworldEvidence.lastVerified, '2026-08-12');
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.2.0+1.21.1'));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && /7 PASS \/ 0 FAIL/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && /VAI-M2-INST-005.*VAI-CONCUR-004/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Latest merged source capability' && /0\.3.*release convergence.*#160/i.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Active development slice' && /release convergence.*release-request|release convergence.*candidate/i.test(value)));

  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/123').state, 'merged');
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/125').state, 'merged');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/125').scope, /Server-owned provenance.*FACT authority remain unchanged/i);
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/153').state, 'merged');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/153').scope, /620\/620 tests.*146 gates/i);
  for (const number of [155, 158, 159, 160]) {
    const merged = signal(livingworldEvidence, `https://github.com/True-Ruslan/villAIgence/pull/${number}`);
    assert.equal(merged.state, 'merged');
    assert.match(merged.scope, /0\.2\.0\+1\.21\.1/);
  }
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'current').title, /0\.3.*release convergence/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'next').title, /release-request|candidate/i);

  assert.equal(portfolioProject.status, 'production');
  assert.equal(portfolioProject.statusLabel, 'PRODUCTION');
  assert.equal(portfolioEvidence.lastVerified, '2026-08-12');
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Current production baseline' && /80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613/.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Search Discovery' && /externalEvidence=not-collected/i.test(value)));
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/198').state, 'merged');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516118934').state, 'published');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516213818').state, 'passed');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969846').state, 'published');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969870').state, 'passed');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969801').state, 'green');
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'current').title, /launch.*discovery.*maintenance|current production baseline/i);
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'next').description, /P3\.6|P4\.1B/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(roadmap, /P3\.6.*Measurement checkpoint.*NEXT \/ WAITING/is);
  assert.match(changelog, /P3\.6.*NEXT \/ WAITING/is);
  for (const source of [projectState, roadmap, changelog]) {
    assert.doesNotMatch(source, /P3\.6[^\n]{0,160}(ACCEPTED|COMPLETED|product impact|causal)/i);
  }
});