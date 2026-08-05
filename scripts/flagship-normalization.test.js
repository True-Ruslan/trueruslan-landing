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

test('Vlezet keeps M7.8B accepted while M7.8C and stacked work remain Draft pending owner gates', () => {
  const evidence = evidenceMap().get('vlezet');
  assert.equal(evidence.lastVerified, '2026-08-05');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Next acceptance boundary' && value === 'M7.8C product-owner retest'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Stacked Draft exploration' && value === 'M7.9 + M7.8C.1'));

  const pending = findSignal(evidence, 'M7.8C Draft');
  assert.equal(pending.state, 'pending');
  assertIncludesAll(pending.scope, [
    'c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a',
    'CI #3138',
    'Recognition Benchmark #316',
    'M7 Browser Audit #769',
    'product-owner retest',
    'not an acceptance',
  ], 'Vlezet M7.8C pending scope');

  const benchmark = findSignal(evidence, 'M7.9');
  assert.equal(benchmark.state, 'pending');
  assertIncludesAll(benchmark.scope, [
    'cd29740cf240d591785fc6607147d2bf07ece0b6',
    'PR #42',
    '0.85',
    'merge-blocking',
    'not an accepted milestone',
  ], 'Vlezet M7.9 pending scope');

  const hybrid = findSignal(evidence, 'M7.8C.1');
  assert.equal(hybrid.state, 'pending');
  assertIncludesAll(hybrid.scope, [
    '2c4d0f44e56753b9c44dd6c30a720d1a97f50c2e',
    'PR #44',
    'proposals',
    'no authoritative geometry authority',
    'not an acceptance',
  ], 'Vlezet hybrid pending scope');

  const history = readJson('data/project-history/vlezet.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.ok(history.find(({state}) => state === 'current').title.includes('M7.8C'));
});

test('VillAIgence keeps exact release and provider-client proof separate from Draft Phase C and cumulative acceptance', () => {
  const evidence = evidenceMap().get('livingworld');
  assert.equal(evidence.lastVerified, '2026-08-05');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current published candidate' && value === '0.1.25+1.21.1'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Automated installed boundary' && value.includes('startup + restart PASS')));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Deterministic provider boundary' && value.includes('Chat + STT + TTS PASS')));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Cumulative manual acceptance' && value === 'pending'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active development slice' && value.includes('Draft/RED')));

  const release = findSignal(evidence, 'PR #107');
  assert.equal(release.state, 'published');
  assertIncludesAll(release.scope, [
    '0.1.25+1.21.1',
    'exact',
    'does not complete',
    'cumulative',
  ], 'VillAIgence PR #107 release scope');

  const provider = findSignal(evidence, 'PR #108');
  assert.equal(provider.state, 'merged');
  assertIncludesAll(provider.scope, [
    'literal-loopback',
    'Chat',
    'STT',
    'TTS',
    'does not claim',
  ], 'VillAIgence PR #108 provider scope');

  const pending = findSignal(evidence, 'PR #110');
  assert.equal(pending.state, 'pending');
  assertIncludesAll(pending.scope, [
    'b3172080d89052a5b361d203dbdac152752d7d0d',
    'Draft',
    'RED',
    'no production implementation',
    'cumulative acceptance',
  ], 'VillAIgence PR #110 pending scope');

  const history = readJson('data/project-history/livingworld.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.ok(history.find(({state}) => state === 'current').title.includes('M11 Phase C'));
});

test('normalized case studies expose bounded related material and do not promote pending work', () => {
  const livingworldRu = read('docs/landing/projects/livingworld.md');
  const livingworldEn = read('docs/en/projects/livingworld.md');
  const vlezetRu = read('docs/landing/projects/vlezet.md');

  assertIncludesAll(livingworldRu, [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    'source-tests-to-installed-acceptance',
    'probabilistic-proposals-deterministic-authority',
    'restart-persistence-is-a-product-contract',
    'PR #110',
    'Draft',
    'cumulative acceptance',
  ], 'RU VillAIgence case study');

  assertIncludesAll(livingworldEn, [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    '../../landing/projects/livingworld.md',
    'PR #110',
    'Draft',
    'cumulative acceptance',
  ], 'EN VillAIgence case study');

  assertIncludesAll(vlezetRu, [
    'probabilistic-proposals-deterministic-authority',
    'green-ci-is-not-product-verification',
    'M7.8B',
    'M7.8C',
    'product-owner retest',
  ], 'RU Vlezet case study');

  const positivePromotion = /(?:is|является|стал(?:а)?)\s+(?:fully\s+accepted|production-ready)|полностью\s+принят(?:а|о)?/i;
  for (const source of [livingworldRu, livingworldEn, vlezetRu]) {
    assert.doesNotMatch(source, positivePromotion, 'pending flagship must not be positively promoted');
  }
});
