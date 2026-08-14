import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_PATH = path.join(ROOT, 'data', 'projects.json');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');
const HISTORY_PATH = path.join(ROOT, 'data', 'project-history', 'livingworld.json');
const PAGE_PATH = path.join(ROOT, 'docs', 'landing', 'projects', 'livingworld.md');
const META_PATH = path.join(ROOT, 'data', 'page-meta.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('VillAIgence public identity preserves the stable livingworld route', () => {
  const projects = readJson(PROJECTS_PATH);
  const project = projects.find(({slug}) => slug === 'livingworld');

  assert.ok(project, 'livingworld project record must remain present');
  assert.equal(project.slug, 'livingworld');
  assert.equal(project.name, 'VillAIgence');
  assert.equal(project.href, 'landing/projects/livingworld.html');
  assert.equal(project.timeline, 'livingworld');
  assert.equal(project.links.github, 'https://github.com/True-Ruslan/villAIgence');
  assert.equal(project.status, 'release-candidate');
  assert.equal(project.statusLabel, 'ACCEPTANCE IN PROGRESS');
});

test('VillAIgence page keeps installed 0.2 acceptance separate from current post-release source work', () => {
  const page = fs.readFileSync(PAGE_PATH, 'utf8');

  assert.match(page, /^# VillAIgence/m);
  assert.match(page, /https:\/\/github\.com\/True-Ruslan\/villAIgence/);
  assert.match(page, /0\.1\.20\+1\.21\.1/i);
  assert.match(page, /partial PASS/i);
  assert.match(page, /0\.1\.21\+1\.21\.1[\s\S]{0,300}startup/i);
  assert.match(page, /0\.2\.0\+1\.21\.1/);
  assert.match(page, /7 PASS \/ 0 FAIL/);
  assert.match(page, /VAI-M2-INST-005/);
  assert.match(page, /VAI-CONCUR-004/);
  assert.match(page, /PR #125[\s\S]{0,700}(merged|BELIEF)/i);
  assert.match(page, /PR #153[\s\S]{0,700}(causal|social)/i);
  assert.match(page, /PR #155[\s\S]{0,700}(Draft|Personality|social snapshot)/i);
  assert.match(page, /SYSTEM_OBSERVED/);
  assert.match(page, /LivingWorld\s*\/\s*livingworld[\s\S]{0,220}compatib/i);
  assert.doesNotMatch(page, /PR #155[^\n]{0,180}(production-ready|fully accepted)/i);
});

test('VillAIgence timeline keeps installed 0.2 historical while 0.3.1 corrective acceptance is current', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');
  const release = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/120');
  const convergence = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/160');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3\.1.*corrective release.*installed canary pending/i);
  assert.match(current[0].description, /release-candidate \/ ACCEPTANCE IN PROGRESS/i);
  assert.match(current[0].description, /no installed-acceptance or 0\.4 claim/i);
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/167');
  assert.equal(release.state, 'past');
  assert.equal(release.version, '0.2.0+1.21.1');
  assert.match(release.description, /7 PASS \/ 0 FAIL/);
  assert.equal(convergence.state, 'past');
  assert.match(convergence.description, /publication was skipped/i);
  assert.match(next[0].title, /VAI-PCM-MULTI-001.*canary/i);
  assert.match(next[0].description, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(next[0].description, /Only real installed PASS evidence/i);
  assert.match(next[0].description, /unblock 0\.4/i);
});
test('VillAIgence evidence separates official 0.3.1 release from pending installed corrective acceptance', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-14');

  const versions = new Map(evidence.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Current official release'), '0.3.1+1.21.1');
  assert.equal(versions.get('Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(versions.get('Current 0.3.1 acceptance'), /automated release gates PASS.*VAI-PCM-MULTI-001.*PENDING/i);
  assert.match(versions.get('Deferred installed boundaries'), /VAI-M2-INST-005.*VAI-CONCUR-004/);
  assert.match(versions.get('Controlled semantic boundary'), /BELIEF.*FACT.*SYSTEM_OBSERVED/i);
  assert.match(versions.get('Latest merged source capability'), /0\.3\.1.*Memory 2\.0.*recall/i);
  assert.match(versions.get('Active development slice'), /VAI-PCM-MULTI-001.*pending/i);
  assert.match(versions.get('Active development slice'), /do not start 0\.4/i);

  const installed = evidence.signals.find(({label}) => label.includes('Installed 0.2.0 clean-world'));
  assert.ok(installed, 'missing historical installed 0.2 acceptance evidence');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);
  assert.match(installed.scope, /NOT TESTED/);

  const release = evidence.signals.find(({label}) => label === 'Official 0.3.1+1.21.1 corrective release');
  assert.ok(release, 'missing 0.3.1 release evidence');
  assert.equal(release.kind, 'release');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /bc7c68ac2f3a4f761aa3b03a2f5c1fe1201745ab/);
  assert.match(release.scope, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(release.scope, /installed corrective.*pending/i);

  const corrective = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/165');
  const handoff = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/167');
  assert.ok(corrective && handoff, 'missing 0.3.1 corrective PR evidence');
  assert.equal(corrective.state, 'merged');
  assert.equal(handoff.state, 'merged');
  assert.equal(handoff.observedAt, '2026-08-14');
  assert.match(handoff.scope, /No installed PASS is claimed/i);
  assert.match(handoff.scope, /VAI-M2-INST-005.*VAI-CONCUR-004/i);
});
test('VillAIgence metadata uses the stable public route', () => {
  const meta = readJson(META_PATH).find(({path: route}) => route === 'landing/projects/livingworld.html');

  assert.ok(meta, 'VillAIgence metadata must remain bound to the livingworld route');
  assert.match(meta.title, /VillAIgence/);
  assert.match(meta.description, /Minecraft|NPC|Memory/i);
  assert.equal(meta.displayTitle, 'VILLAIGENCE');
});