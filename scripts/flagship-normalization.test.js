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

test('Vlezet preserves recognition history while M8.2 is accepted and quality audit is next', () => {
  const evidence = evidenceMap().get('vlezet');
  assert.equal(evidence.lastVerified, '2026-08-14');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Automatic M7.8C result' && /FAIL.*closed unmerged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.2.*accepted.*merged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2 complete/i.test(value) && /testing-policy.*coverage.*M8\.3/i.test(value)));

  const failed = findSignal(evidence, 'Automatic M7.8C');
  assert.equal(failed.state, 'failed');
  assertIncludesAll(failed.scope, ['closed unmerged', 'product-owner', 'M7.8B'], 'Vlezet automatic M7.8C failure scope');

  const benchmark = findSignal(evidence, 'Real-fixture recognition R&D');
  assert.equal(benchmark.state, 'unavailable');
  assertIncludesAll(benchmark.scope, ['closed unmerged', 'R&D evidence', 'not product-owner accepted'], 'Vlezet real-fixture R&D scope');

  const assisted = findSignal(evidence, 'Assisted Tracing design gate');
  assert.equal(assisted.state, 'unavailable');
  assertIncludesAll(assisted.scope, ['closed unmerged', 'superseded', 'historical design/R&D evidence'], 'Vlezet Assisted Tracing historical scope');

  const m82 = findSignal(evidence, 'M8.2 precision drawing and structural editing PR #87');
  assert.equal(m82.state, 'merged');
  assert.match(m82.scope, /product-owner acceptance/i);
  assert.match(m82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(m82.scope, /pre-production/i);

  const reconciliation = findSignal(evidence, 'M8.2 post-merge truth reconciliation PR #88');
  assert.equal(reconciliation.state, 'merged');
  assert.match(reconciliation.scope, /testing-policy.*coverage audit/i);

  const history = readJson('data/project-history/vlezet.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /M8\.2.*accepted.*merged/i);
  assert.match(history.find(({state}) => state === 'next').title, /testing-policy.*coverage.*M8\.3/i);
});

test('VillAIgence records official 0.3.1 while installed acceptance remains an explicit separate boundary', () => {
  const evidence = evidenceMap().get('livingworld');
  assert.equal(evidence.lastVerified, '2026-08-14');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.3.1+1.21.1'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current 0.3.1 acceptance' && /VAI-PCM-MULTI-001.*PENDING/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && value === '7 PASS / 0 FAIL'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && value.includes('VAI-M2-INST-005') && value.includes('VAI-CONCUR-004')));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Controlled semantic boundary' && /BELIEF.*FACT.*SYSTEM_OBSERVED/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Latest merged source capability' && /0\.3\.1.*Memory 2\.0.*recall/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active development slice' && /VAI-PCM-MULTI-001.*pending/i.test(value) && /do not start 0\.4/i.test(value)));

  const oldRelease = findSignal(evidence, 'Official 0.2.0+1.21.1');
  assert.equal(oldRelease.state, 'published');
  assertIncludesAll(oldRelease.scope, ['7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004'], 'VillAIgence 0.2 release scope');

  const installed = findSignal(evidence, 'Installed 0.2.0 clean-world');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);

  const corrective = findSignal(evidence, '0.3.1 targeted Memory 2.0 recall correction PR #165');
  const handoff = findSignal(evidence, '0.3.1 installed corrective acceptance handoff PR #167');
  const currentRelease = findSignal(evidence, 'Official 0.3.1+1.21.1 corrective release');
  assert.equal(corrective.state, 'merged');
  assert.equal(handoff.state, 'merged');
  assert.equal(currentRelease.state, 'published');
  assert.match(currentRelease.scope, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(currentRelease.scope, /installed corrective.*pending/i);

  const history = readJson('data/project-history/livingworld.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /0\.3\.1.*installed canary pending/i);
  assert.match(history.find(({state}) => state === 'next').title, /VAI-PCM-MULTI-001.*canary/i);
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
    '0.3.1+1.21.1',
    '7 PASS / 0 FAIL',
    'PR #165',
    'PR #167',
    'VAI-PCM-MULTI-001',
    'PENDING',
    '0.4 remains blocked',
    'installed baseline с завершённой acceptance',
  ], 'RU VillAIgence case study');

  assertIncludesAll(livingworldEn, [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    '../../landing/notes/source-tests-to-installed-acceptance.md',
    '../../landing/notes/probabilistic-proposals-deterministic-authority.md',
    '../../landing/notes/restart-persistence-is-a-product-contract.md',
    '../../landing/projects/livingworld.md',
    '0.3.1+1.21.1',
    '7 PASS / 0 FAIL',
    'PR #165',
    'PR #167',
    'VAI-PCM-MULTI-001',
    'PENDING',
    '0.4 remains blocked',
    'installed baseline with completed acceptance',
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