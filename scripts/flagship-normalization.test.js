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

test('Vlezet preserves recognition history while M8.3 is accepted and M8.4 Product Owner retest remains pending', () => {
  const evidence = evidenceMap().get('vlezet');
  assert.equal(evidence.lastVerified, '2026-08-19');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Automatic M7.8C result' && /FAIL.*closed unmerged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.3.*accepted.*merged.*post-merge verified/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Next acceptance boundary' && value === 'M8.4 Assisted Tracing'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active product slice'
    && /M8\.4 Assisted Tracing Draft PR #94/i.test(value)
    && /automated GREEN/i.test(value)
    && /two real-plan Product Owner FAILs/i.test(value)
    && /same-plan Product Owner retest pending/i.test(value)
    && /not accepted, merged or released/i.test(value)));

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

  const persistence = findSignal(evidence, 'P0 IndexedDB persistence remediation PR #90');
  const handoff = findSignal(evidence, 'P0 post-merge truth / M8.3 handoff PR #91');
  const draft = findSignal(evidence, 'M8.3 Precision Reference Calibration Draft PR #92');
  const accepted = findSignal(evidence, 'M8.3 Precision Reference Calibration accepted PR #92');
  const reconciliation = findSignal(evidence, 'M8.3 protected integration reconciliation PR #93');
  const m84 = findSignal(evidence, 'M8.4 Assisted Tracing Draft PR #94');
  assert.equal(persistence.state, 'merged');
  assert.match(persistence.scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  assert.equal(handoff.state, 'merged');
  assert.equal(draft.state, 'pending');
  assert.equal(draft.observedAt, '2026-08-16');
  assert.match(draft.scope, /TDD RED/i);
  assert.match(draft.scope, /historical pre-acceptance evidence only/i);
  assert.equal(accepted.state, 'merged');
  assert.equal(accepted.observedAt, '2026-08-17');
  assert.match(accepted.scope, /01f520988a84291fb6e4f918e21f3403f17c4529/);
  assert.match(accepted.scope, /post-merge main passed CI #5248 and CodeQL #608/i);
  assert.equal(reconciliation.state, 'merged');
  assert.equal(m84.state, 'pending');
  assert.equal(m84.observedAt, '2026-08-19');
  assert.match(m84.scope, /c019af73a9224c1a63d4f377c21d03949ee9c28c/);
  assert.match(m84.scope, /CI #5337.*Browser Acceptance #1780/i);
  assert.match(m84.scope, /same real plan.*Product Owner retest/i);
  assert.match(m84.scope, /not accepted, merged or released/i);

  const history = readJson('data/project-history/vlezet.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /M8\.4 Assisted Tracing.*product retest pending/i);
  assert.match(history.find(({state}) => state === 'current').description, /not accepted, merged or released/i);
  assert.match(history.find(({state}) => state === 'next').title, /Retest M8\.4.*same real plan/i);
  assert.match(history.find(({state}) => state === 'next').description, /only an observed PASS.*merge/i);
  assert.ok(history.some(({state, title}) => state === 'past' && /M8\.2.*accepted.*merged/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'past' && /M8\.3.*accepted.*merged/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'past' && /Testing Policy Phase A accepted/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'past' && /P0 IndexedDB persistence remediation accepted/i.test(title)));
});

test('VillAIgence records official 0.3.2 while installed acceptance remains an explicit separate boundary', () => {
  const evidence = evidenceMap().get('livingworld');
  assert.equal(evidence.lastVerified, '2026-08-16');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.3.2+1.21.1'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current 0.3.2 acceptance' && /VAI-PCM-MULTI-001.*PENDING/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && value === '7 PASS / 0 FAIL'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && value.includes('VAI-M2-INST-005') && value.includes('VAI-CONCUR-004')));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Controlled semantic boundary' && /BELIEF.*FACT.*SYSTEM_OBSERVED/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Latest merged source capability' && /0\.3\.2.*targeted-recall ranking correction.*installed retest contract/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active development slice' && /0\.3\.1 installed FAIL/i.test(value) && /VAI-PCM-MULTI-001.*pending/i.test(value) && /do not start 0\.4/i.test(value)));

  const oldRelease = findSignal(evidence, 'Official 0.2.0+1.21.1');
  assert.equal(oldRelease.state, 'published');
  assertIncludesAll(oldRelease.scope, ['7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004'], 'VillAIgence 0.2 release scope');

  const installed = findSignal(evidence, 'Installed 0.2.0 clean-world');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);

  const failed031 = findSignal(evidence, 'Installed 0.3.1 VAI-PCM-MULTI-001 corrective canary');
  const correction = findSignal(evidence, '0.3.2 targeted recall ranking correction PR #169');
  const currentRelease = findSignal(evidence, 'Official 0.3.2+1.21.1 corrective release');
  const plan = findSignal(evidence, '0.3.2 installed corrective test plan PR #171');
  assert.equal(failed031.state, 'failed');
  assert.equal(correction.state, 'merged');
  assert.equal(currentRelease.state, 'published');
  assert.match(currentRelease.scope, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  assert.match(currentRelease.scope, /not installed acceptance/i);
  assert.equal(plan.state, 'merged');
  assert.match(plan.scope, /VAI-PCM-MULTI-001 remains PENDING/i);
  assert.match(plan.scope, /0\.4 stays blocked/i);

  const history = readJson('data/project-history/livingworld.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /0\.3\.2.*installed canary pending/i);
  assert.match(history.find(({state}) => state === 'next').title, /0\.3\.2.*VAI-PCM-MULTI-001.*canary/i);
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
    '0.3.2+1.21.1',
    '7 PASS / 0 FAIL',
    'PR #169',
    'PR #171',
    'VAI-PCM-MULTI-001',
    'FAIL',
    'PENDING',
    'b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015',
    '0.4 remains blocked',
    'installed baseline с завершённой acceptance',
    'как последний installed baseline с завершённой acceptance',
  ], 'RU VillAIgence case study');

  assertIncludesAll(livingworldEn, [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    '../../landing/notes/source-tests-to-installed-acceptance.md',
    '../../landing/notes/probabilistic-proposals-deterministic-authority.md',
    '../../landing/notes/restart-persistence-is-a-product-contract.md',
    '../../landing/projects/livingworld.md',
    '0.3.1+1.21.1',
    '0.3.2+1.21.1',
    '7 PASS / 0 FAIL',
    'PR #169',
    'PR #171',
    'VAI-PCM-MULTI-001',
    'FAIL',
    'PENDING',
    'b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015',
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
