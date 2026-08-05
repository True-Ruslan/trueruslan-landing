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

test('VillAIgence page records 0.1.25 release evidence, deterministic provider acceptance and cumulative boundaries', () => {
  const page = fs.readFileSync(PAGE_PATH, 'utf8');

  assert.match(page, /^# VillAIgence/m);
  assert.match(page, /https:\/\/github\.com\/True-Ruslan\/villAIgence/);
  assert.match(page, /0\.1\.20\+1\.21\.1/i);
  assert.match(page, /partial PASS/i);
  assert.match(page, /0\.1\.21\+1\.21\.1[\s\S]{0,300}startup/i);
  assert.match(page, /0\.1\.25\+1\.21\.1/);
  assert.match(page, /PR #103[\s\S]{0,500}28/);
  assert.match(page, /PR #104[\s\S]{0,700}production-JAR/i);
  assert.match(page, /PR #105[\s\S]{0,600}inventory|inventory[\s\S]{0,600}PR #105/i);
  assert.match(page, /PR #107[\s\S]{0,700}0\.1\.25/i);
  assert.match(page, /PR #108[\s\S]{0,900}(Chat|STT|TTS)/i);
  assert.match(page, /production-JAR[\s\S]{0,420}restart/i);
  assert.match(page, /PR #110[\s\S]{0,520}(Draft|RED)/i);
  assert.match(page, /b3172080d89052a5b361d203dbdac152752d7d0d/);
  assert.match(page, /cumulative[\s\S]{0,220}(pending|оста[её]тся|не заверш)/i);
  assert.match(page, /LivingWorld\s*\/\s*livingworld[\s\S]{0,220}compatib/i);
  assert.doesNotMatch(page, /0\.1\.25\+1\.21\.1[^\n]{0,180}(production-ready|full pass|fully accepted)/i);
});

test('VillAIgence timeline keeps accepted automation past and Draft orchestration current', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');
  const phaseB = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/104');
  const providerAcceptance = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/108');

  assert.equal(history.length, 7);
  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /M11 Phase C/i);
  assert.match(current[0].description, /Draft|RED/i);
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/110');
  assert.equal(phaseB.state, 'past');
  assert.equal(phaseB.version, '0.1.23+1.21.1');
  assert.equal(providerAcceptance.state, 'past');
  assert.equal(providerAcceptance.version, '0.1.25+1.21.1');
  assert.match(providerAcceptance.description, /loopback|Chat|STT|TTS/i);
  assert.match(next[0].description, /Text|STT|Chat|TTS|two-client|water|grave|acceptance/i);
});

test('VillAIgence evidence separates historical failures, published 0.1.25, accepted automation and Draft Phase C', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-05');

  const versions = new Map(evidence.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Current published candidate'), '0.1.25+1.21.1');
  assert.match(versions.get('Deterministic provider boundary'), /Chat.*STT.*TTS|loopback/i);
  assert.equal(versions.get('Cumulative manual acceptance'), 'pending');

  const inventoryFix = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/105');
  assert.ok(inventoryFix, 'missing PR #105 inventory ownership evidence');
  assert.equal(inventoryFix.state, 'merged');
  assert.match(inventoryFix.scope, /inventory/i);
  assert.match(inventoryFix.scope, /installed|manual|canary/i);

  const release = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/107');
  assert.ok(release, 'missing PR #107 release evidence');
  assert.equal(release.kind, 'release');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /0\.1\.25\+1\.21\.1/);
  assert.match(release.scope, /exact production|production-JAR|byte-identical/i);
  assert.match(release.scope, /does not|pending/i);

  const provider = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/108');
  assert.ok(provider, 'missing PR #108 deterministic provider evidence');
  assert.equal(provider.state, 'merged');
  assert.match(provider.scope, /loopback/i);
  assert.match(provider.scope, /Chat/i);
  assert.match(provider.scope, /STT/i);
  assert.match(provider.scope, /TTS/i);
  assert.match(provider.scope, /does not|not claim|boundary/i);

  const gateFix = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/109');
  assert.ok(gateFix, 'missing PR #109 release-gate evidence');
  assert.equal(gateFix.state, 'merged');
  assert.match(gateFix.scope, /configuration cache|release request/i);
  assert.match(gateFix.scope, /no runtime|does not change.*runtime/i);

  const phaseC = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/110');
  assert.ok(phaseC, 'missing PR #110 pending evidence');
  assert.equal(phaseC.state, 'pending');
  assert.match(phaseC.scope, /b3172080d89052a5b361d203dbdac152752d7d0d/);
  assert.match(phaseC.scope, /Draft/);
  assert.match(phaseC.scope, /RED/);
  assert.match(phaseC.scope, /no production implementation|not an accepted capability/i);
});

test('VillAIgence metadata uses the stable public route', () => {
  const meta = readJson(META_PATH).find(({path: route}) => route === 'landing/projects/livingworld.html');

  assert.ok(meta, 'VillAIgence metadata must remain bound to the livingworld route');
  assert.match(meta.title, /VillAIgence/);
  assert.match(meta.description, /Minecraft|NPC|Memory/i);
  assert.equal(meta.displayTitle, 'VILLAIGENCE');
});
