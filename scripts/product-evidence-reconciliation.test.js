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

test('repository public truth records current external activity without broadening accepted boundaries', () => {
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
  assert.match(currentTimelineEntry(vlezetHistory, 'vlezet').title, /M7\.8C|M7\.9|Draft/i);

  for (const pr of [42, 44, 45]) {
    const signal = vlezetEvidence.signals.find(({url}) => url === `https://github.com/True-Ruslan/vlezet/pull/${pr}`);
    assert.ok(signal, `Vlezet PR #${pr} pending evidence must exist`);
    assert.equal(signal.state, 'pending');
    assert.match(signal.scope, /Draft|not an acceptance|does not promote|merge-blocking/i);
  }

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.ok(
    livingworldEvidence.versions.some((version) => version.value.includes('0.1.25+1.21.1')),
    'VillAIgence current published candidate must be recorded',
  );
  for (const pr of [103, 104, 105, 107, 108, 109, 110]) {
    assert.ok(
      livingworldEvidence.signals.some(({url}) => url === `https://github.com/True-Ruslan/villAIgence/pull/${pr}`),
      `VillAIgence PR #${pr} evidence must exist`,
    );
  }
  const phaseC = livingworldEvidence.signals.find((signal) => signal.label.includes('PR #110'));
  assert.equal(phaseC.state, 'pending');
  assert.match(phaseC.scope, /b3172080d89052a5b361d203dbdac152752d7d0d/);
  assert.match(phaseC.scope, /no production implementation|not an accepted capability/i);
  assert.match(currentTimelineEntry(livingworldHistory, 'livingworld').title, /M11 Phase C/i);

  const vlezetPage = readText('docs/landing/projects/vlezet.md');
  assert.match(vlezetPage, /M0–M7\.8B/);
  assert.match(vlezetPage, /PR #42/);
  assert.match(vlezetPage, /PR #44/);
  assert.match(vlezetPage, /PR #45/);
  assert.match(vlezetPage, /product-owner retest/i);
  assert.match(vlezetPage, /не счита(ется|ются).*принят|not an acceptance/i);

  const livingworldPage = readText('docs/landing/projects/livingworld.md');
  assert.match(livingworldPage, /0\.1\.25\+1\.21\.1/);
  assert.match(livingworldPage, /PR #108[\s\S]{0,900}(Chat|STT|TTS)/i);
  assert.match(livingworldPage, /b3172080d89052a5b361d203dbdac152752d7d0d/);
  assert.match(livingworldPage, /production-JAR.*startup.*restart/is);
  assert.match(livingworldPage, /cumulative.*(pending|не заверш)/is);

  assert.equal(now.updated, '2026-08-05');
  assert.match(now.focus, /0\.1\.25|M7\.9|M7\.8C\.1/);
  assert.match(now.focus, /не.*acceptance|не.*принят|pending|Draft/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /M7\.8B.*(accepted|принят)/is);
  assert.match(projectState, /P3\.4/);
  assert.match(roadmap, /P3\.4A/);
  assert.match(roadmap, /exact.*artifact.*installed acceptance/is);
  assert.match(changelog, /P3\.3/);
});
