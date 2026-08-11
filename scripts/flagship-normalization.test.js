import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function projectMap() {
  return new Map(readJson('data/projects.json').map((project) => [project.slug, project]));
}

function evidenceMap() {
  return new Map(readJson('data/project-evidence.json').map((entry) => [entry.project, entry]));
}

function findSignal(entry, labelFragment) {
  const signal = entry.signals.find(({label}) => label.includes(labelFragment));
  assert.ok(signal, `${entry.project}: missing evidence signal ${labelFragment}`);
  return signal;
}

function assertIncludesAll(value, markers, label) {
  for (const marker of markers) {
    assert.ok(value.includes(marker), `${label}: missing ${marker}`);
  }
}

test('P3.3 preserves canonical lifecycle labels and routes', () => {
  const projects = projectMap();
  const vlezet = projects.get('vlezet');
  const livingworld = projects.get('livingworld');

  assert.equal(vlezet.status, 'pre-production');
  assert.equal(vlezet.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(vlezet.href, 'landing/projects/vlezet.html');

  assert.equal(livingworld.status, 'release-candidate');
  assert.equal(livingworld.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworld.href, 'landing/projects/livingworld.html');
});

test('Vlezet preserves M7.8B history while M8.1 is accepted and M8.2 is the pending product boundary', () => {
  const evidence = evidenceMap().get('vlezet');
  assert.equal(evidence.lastVerified, '2026-08-11');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Automatic M7.8C result' && /FAIL.*closed unmerged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.1.*accepted.*merged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2.*Draft.*retest pending/i.test(value)));

  const failed = findSignal(evidence, 'Automatic M7.8C');
  assert.equal(failed.state, 'failed');
  assertIncludesAll(failed.scope, ['closed unmerged', 'product-owner', 'M7.8B'], 'Vlezet automatic M7.8C failure scope');

  const benchmark = findSignal(evidence, 'Real-fixture recognition R&D');
  assert.equal(benchmark.state, 'unavailable');
  assertIncludesAll(benchmark.scope, ['closed unmerged', 'R&D evidence', 'not product-owner accepted'], 'Vlezet real-fixture R&D scope');

  const hybrid = findSignal(evidence, 'Hybrid proposal recovery R&D');
  assert.equal(hybrid.state, 'unavailable');
  assertIncludesAll(hybrid.scope, ['closed unmerged', 'R&D evidence', 'not an acceptance'], 'Vlezet hybrid R&D scope');

  const assisted = findSignal(evidence, 'Assisted Tracing design gate');
  assert.equal(assisted.state, 'unavailable');
  assertIncludesAll(assisted.scope, ['closed unmerged', 'superseded', 'historical design/R&D evidence'], 'Vlezet Assisted Tracing historical scope');

  const acceptedEditor = findSignal(evidence, 'M8.1 precision drawing PR #85');
  assert.equal(acceptedEditor.state, 'merged');
  assert.match(acceptedEditor.scope, /product-owner accepted.*9\/9|9\/9.*product-owner accepted/i);

  const active = findSignal(evidence, 'M8.2 top toolbar Draft PR #87');
  assert.equal(active.state, 'pending');
  assert.match(active.scope, /01–07.*passed/i);
  assert.match(active.scope, /clipboard retest.*pending/i);

  const history = readJson('data/project-history/vlezet.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /M8\.2.*Draft/i);
  assert.match(history.find(({state}) => state === 'next').description, /clipboard retest/i);
});

test('VillAIgence preserves official 0.2 installed acceptance while later source capability advances independently', () => {
  const evidence = evidenceMap().get('livingworld');
  assert.equal(evidence.lastVerified, '2026-08-11');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.2.0+1.21.1'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && value === '7 PASS / 0 FAIL'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && value.includes('VAI-M2-INST-005') && value.includes('VAI-CONCUR-004')));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Controlled semantic boundary' && /BELIEF.*FACT.*SYSTEM_OBSERVED/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Latest merged source capability' && /causal NPC↔NPC social mutation.*#153/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active development slice' && /Personality.*social snapshot.*Draft.*#155/i.test(value)));

  const release = findSignal(evidence, 'Official 0.2.0+1.21.1');
  assert.equal(release.state, 'published');
  assertIncludesAll(release.scope, ['e426f588efefa6aa48a6e536c4a998421bbda241', '7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004'], 'VillAIgence 0.2 release scope');

  const installed = findSignal(evidence, 'Installed 0.2.0 clean-world');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);
  assertIncludesAll(installed.scope, ['VAI-M2-INST-005', 'VAI-CONCUR-004'], 'VillAIgence installed 0.2 scope');

  const admission = findSignal(evidence, 'BELIEF admission PR #123');
  assert.equal(admission.state, 'merged');
  assertIncludesAll(admission.scope, ['BELIEF', 'SYSTEM_OBSERVED', 'FACT'], 'VillAIgence belief-admission scope');

  const extraction = findSignal(evidence, 'PLAYER_TOLD BELIEF candidate extraction PR #125');
  assert.equal(extraction.state, 'merged');
  assert.match(extraction.scope, /no AI-to-FACT path/i);

  const social = findSignal(evidence, 'Causal NPC↔NPC social mutation PR #153');
  assert.equal(social.state, 'merged');
  assert.match(social.scope, /620\/620 tests.*146 gates/i);
  assert.match(social.scope, /post-release source capability/i);

  const pending = findSignal(evidence, 'Personality / social snapshot Draft PR #155');
  assert.equal(pending.state, 'pending');
  assert.match(pending.scope, /Draft TDD/i);
  assert.match(pending.scope, /not an installed release/i);

  const history = readJson('data/project-history/livingworld.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /Personality.*social snapshot.*Draft/i);
});

test('normalized case studies expose current bounded related material and do not promote pending work', () => {
  const livingworldRu = read('docs/landing/projects/livingworld.md');
  const livingworldEn = read('docs/en/projects/livingworld.md');
  const vlezetRu = read('docs/landing/projects/vlezet.md');
  const vlezetEn = read('docs/en/projects/vlezet.md');

  assertIncludesAll(livingworldRu, [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    'source-tests-to-installed-acceptance',
    'probabilistic-proposals-deterministic-authority',
    'restart-persistence-is-a-product-contract',
    '0.2.0+1.21.1',
    '7 PASS / 0 FAIL',
    'PR #153',
    'PR #155',
    'Draft',
  ], 'RU VillAIgence case study');

  assertIncludesAll(livingworldEn, [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    '../../landing/notes/source-tests-to-installed-acceptance.md',
    '../../landing/notes/probabilistic-proposals-deterministic-authority.md',
    '../../landing/notes/restart-persistence-is-a-product-contract.md',
    '../../landing/projects/livingworld.md',
    '0.2.0+1.21.1',
    '7 PASS / 0 FAIL',
    'PR #153',
    'PR #155',
  ], 'EN VillAIgence case study');
  assert.doesNotMatch(
    livingworldEn,
    /\]\(\.\.\/notes\/(?:source-tests-to-installed-acceptance|probabilistic-proposals-deterministic-authority|restart-persistence-is-a-product-contract)\.md\)/,
    'RU-only VillAIgence notes must not be linked as nonexistent English pages',
  );

  assertIncludesAll(vlezetRu, [
    'probabilistic-proposals-deterministic-authority',
    'green-ci-is-not-product-verification',
    'M7.8B',
    'M8.1',
    'M8.2',
    'PR #85',
    'PR #87',
  ], 'RU Vlezet case study');

  assertIncludesAll(vlezetEn, [
    'probabilistic-proposals-deterministic-authority',
    'green-ci-is-not-product-verification',
    'M7.8B',
    'M8.1',
    'M8.2',
    'PR #85',
    'PR #87',
    'focused clipboard retest',
  ], 'EN Vlezet case study');

  const positivePromotion = /(?:is|является|стал(?:а)?)\s+(?:fully\s+accepted|production-ready)|полностью\s+принят(?:а|о)?/i;
  for (const source of [livingworldRu, livingworldEn, vlezetRu, vlezetEn]) {
    assert.doesNotMatch(source, positivePromotion, 'pending flagship must not be positively promoted');
  }
});
