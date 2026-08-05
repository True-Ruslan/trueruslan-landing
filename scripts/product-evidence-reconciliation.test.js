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

test('repository public truth preserves accepted boundaries through the 2026-08-05 P3.3 refresh', () => {
  const projects = readJson('data/projects.json');
  const evidence = readJson('data/project-evidence.json');
  const vlezetHistory = readJson('data/project-history/vlezet.json');
  const livingworldHistory = readJson('data/project-history/livingworld.json');
  const now = readJson('data/now.json');

  const vlezetProject = findProject(projects, 'vlezet');
  const livingworldProject = findProject(projects, 'livingworld');
  const vlezetEvidence = findEvidence(evidence, 'vlezet');
  const livingworldEvidence = findEvidence(evidence, 'livingworld');

  const vlezetM78b = vlezetEvidence.signals.find((signal) => signal.label.includes('M7.8B'));
  assert.ok(vlezetM78b, 'Vlezet M7.8B evidence must exist');
  assert.equal(vlezetM78b.state, 'merged');
  assert.match(vlezetM78b.scope, /0\.837989/);
  assert.match(vlezetM78b.scope, /openings?.*(deferred|отлож)/i);
  assert.equal(vlezetProject.status, 'pre-production');
  assert.match(currentTimelineEntry(vlezetHistory, 'vlezet').title, /M7\.8C|Opening Classification/i);

  const vlezetM78c = vlezetEvidence.signals.find((signal) => signal.label.includes('M7.8C'));
  assert.ok(vlezetM78c, 'Vlezet M7.8C pending evidence must exist');
  assert.equal(vlezetM78c.state, 'pending');
  assert.match(vlezetM78c.scope, /c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a/);
  assert.match(vlezetM78c.scope, /product-owner retest/i);
  assert.match(vlezetM78c.scope, /not an acceptance/i);

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.ok(
    livingworldEvidence.signals.some((signal) => signal.label.includes('PR #103')),
    'VillAIgence PR #103 evidence must exist',
  );
  assert.ok(
    livingworldEvidence.signals.some((signal) => signal.label.includes('PR #104')),
    'VillAIgence PR #104 evidence must exist',
  );
  assert.ok(
    livingworldEvidence.versions.some((version) => version.value.includes('0.1.23+1.21.1')),
    'VillAIgence current candidate version must be recorded',
  );
  const phaseC = livingworldEvidence.signals.find((signal) => signal.label.includes('PR #110'));
  assert.ok(phaseC, 'VillAIgence PR #110 pending evidence must exist');
  assert.equal(phaseC.state, 'pending');
  assert.match(phaseC.scope, /no production implementation/i);
  assert.match(currentTimelineEntry(livingworldHistory, 'livingworld').title, /M11 Phase C/i);

  const vlezetPage = readText('docs/landing/projects/vlezet.md');
  assert.match(vlezetPage, /M0–M7\.8B/);
  assert.match(vlezetPage, /M7\.8C/);
  assert.match(vlezetPage, /product-owner retest/i);
  assert.match(vlezetPage, /M7\.8C не считается принятым или смерженным/i);

  const livingworldPage = readText('docs/landing/projects/livingworld.md');
  assert.match(livingworldPage, /e0b763aa4a5caea8897aadc6ee2cab6c1b407c89/);
  assert.match(livingworldPage, /production-JAR.*startup.*restart/is);
  assert.match(livingworldPage, /cumulative.*(pending|не заверш)/is);
  assert.match(livingworldPage, /PR #110[\s\S]{0,500}(Draft|RED)/i);

  assert.equal(now.updated, '2026-08-03');
  assert.match(now.focus, /M7\.8B|production-JAR/);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /M7\.8B.*(accepted|принят)/is);
  assert.match(projectState, /PR #104/);
  assert.match(roadmap, /M7\.8C/);
  assert.match(roadmap, /exact.*artifact.*installed acceptance/is);
  assert.match(changelog, /PR #103/);
  assert.match(changelog, /PR #104/);
});
