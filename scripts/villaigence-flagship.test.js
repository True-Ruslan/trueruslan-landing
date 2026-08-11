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

test('VillAIgence timeline keeps installed release and merged source work historical while PR #155 is current', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');
  const release = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/120');
  const admission = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/123');
  const social = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/153');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /Personality.*social snapshot.*Draft/i);
  assert.match(current[0].description, /Draft TDD|Draft/i);
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/155');
  assert.equal(release.state, 'past');
  assert.equal(release.version, '0.2.0+1.21.1');
  assert.match(release.description, /7 PASS \/ 0 FAIL/);
  assert.equal(admission.state, 'past');
  assert.match(admission.description, /BELIEF/i);
  assert.equal(social.state, 'past');
  assert.match(social.description, /620\/620 tests.*146 source gates/i);
  assert.match(next[0].description, /PR #155|installed|VAI-M2-INST-005|VAI-CONCUR-004/i);
});

test('VillAIgence evidence separates official release, installed acceptance, merged source capability and pending PR #155', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-11');

  const versions = new Map(evidence.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Current official release'), '0.2.0+1.21.1');
  assert.equal(versions.get('Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(versions.get('Deferred installed boundaries'), /VAI-M2-INST-005.*VAI-CONCUR-004/);
  assert.match(versions.get('Controlled semantic boundary'), /BELIEF.*FACT.*SYSTEM_OBSERVED/i);
  assert.match(versions.get('Latest merged source capability'), /causal NPC↔NPC social mutation.*#153/i);
  assert.match(versions.get('Active development slice'), /Personality.*social snapshot.*Draft.*#155/i);

  const phaseC = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/110');
  assert.ok(phaseC, 'missing PR #110 accepted automation evidence');
  assert.equal(phaseC.state, 'merged');
  assert.match(phaseC.scope, /monotonic STT.*Chat.*TTS/i);
  assert.match(phaseC.scope, /exactly-once/i);

  const release = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/120');
  assert.ok(release, 'missing 0.2 release evidence');
  assert.equal(release.kind, 'release');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /0\.2\.0\+1\.21\.1/);
  assert.match(release.scope, /7 PASS \/ 0 FAIL/);
  assert.match(release.scope, /byte-identical/i);

  const installed = evidence.signals.find(({label}) => label.includes('Installed 0.2.0 clean-world'));
  assert.ok(installed, 'missing installed 0.2 acceptance evidence');
  assert.equal(installed.kind, 'manual');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);
  assert.match(installed.scope, /NOT TESTED/);

  const extraction = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/125');
  assert.ok(extraction, 'missing PR #125 extraction evidence');
  assert.equal(extraction.state, 'merged');
  assert.match(extraction.scope, /PLAYER_TOLD BELIEF|candidate extraction/i);
  assert.match(extraction.scope, /Server-owned provenance.*FACT authority remain unchanged/i);

  const social = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/153');
  assert.ok(social, 'missing PR #153 source capability evidence');
  assert.equal(social.state, 'merged');
  assert.match(social.scope, /620\/620 tests.*146 gates/i);
  assert.match(social.scope, /post-release source capability/i);

  const pending = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/155');
  assert.ok(pending, 'missing PR #155 pending evidence');
  assert.equal(pending.state, 'pending');
  assert.match(pending.scope, /Draft TDD/i);
  assert.match(pending.scope, /not an installed release/i);
});

test('VillAIgence metadata uses the stable public route', () => {
  const meta = readJson(META_PATH).find(({path: route}) => route === 'landing/projects/livingworld.html');

  assert.ok(meta, 'VillAIgence metadata must remain bound to the livingworld route');
  assert.match(meta.title, /VillAIgence/);
  assert.match(meta.description, /Minecraft|NPC|Memory/i);
  assert.equal(meta.displayTitle, 'VILLAIGENCE');
});
