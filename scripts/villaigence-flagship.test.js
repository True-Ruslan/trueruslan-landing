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

test('VillAIgence page separates published 0.3.1 from pending installed corrective acceptance', () => {
  const page = fs.readFileSync(PAGE_PATH, 'utf8');

  assert.match(page, /^# VillAIgence/m);
  assert.match(page, /https:\/\/github\.com\/True-Ruslan\/villAIgence/);
  assert.match(page, /0\.1\.20\+1\.21\.1/i);
  assert.match(page, /partial PASS/i);
  assert.match(page, /0\.1\.21\+1\.21\.1[\s\S]{0,300}startup/i);
  assert.match(page, /0\.2\.0\+1\.21\.1/);
  assert.match(page, /7 PASS \/ 0 FAIL/);
  assert.match(page, /0\.3\.1\+1\.21\.1/);
  assert.match(page, /PR #165/);
  assert.match(page, /PR #167/);
  assert.match(page, /VAI-PCM-MULTI-001/);
  assert.match(page, /PENDING/);
  assert.match(page, /0\.4 remains blocked/i);
  assert.match(page, /VAI-M2-INST-005/);
  assert.match(page, /VAI-CONCUR-004/);
  assert.match(page, /PR #125[\s\S]{0,700}(merged|BELIEF)/i);
  assert.match(page, /SYSTEM_OBSERVED/);
  assert.match(page, /LivingWorld\s*\/\s*livingworld[\s\S]{0,220}compatib/i);
  assert.match(page, /release-candidate[^\n]{0,120}ACCEPTANCE IN PROGRESS/i);
  assert.doesNotMatch(page, /0\.3\.1[^\n]{0,220}(production-ready|fully accepted|полностью принят)/i);
});

test('VillAIgence timeline keeps installed 0.2 historical while 0.3.2 corrective acceptance is current', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');
  const installedBaseline = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/120');
  const release031 = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3\.2.*corrective release.*installed canary pending/i);
  assert.match(current[0].description, /release-candidate \/ ACCEPTANCE IN PROGRESS/i);
  assert.match(current[0].description, /VAI-PCM-MULTI-001 remains PENDING/i);
  assert.match(current[0].description, /0\.4 stays blocked/i);
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/171');

  assert.equal(installedBaseline.state, 'past');
  assert.equal(installedBaseline.version, '0.2.0+1.21.1');
  assert.match(installedBaseline.description, /7 PASS \/ 0 FAIL/);
  assert.equal(release031.state, 'past');
  assert.match(release031.description, /installed corrective acceptance still required/i);
  assert.ok(history.some(({state, title, description}) => state === 'past' && /0\.3\.1 installed corrective canary failed/i.test(title) && /amber-pine-314/i.test(description)));

  assert.match(next[0].title, /0\.3\.2.*VAI-PCM-MULTI-001.*canary/i);
  assert.match(next[0].description, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  assert.match(next[0].description, /Only real installed PASS plus repository reconciliation/i);
  assert.match(next[0].description, /unblock 0\.4/i);
});

test('VillAIgence evidence separates official 0.3.2 release from pending installed corrective acceptance', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-16');

  const versions = new Map(evidence.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Current official release'), '0.3.2+1.21.1');
  assert.equal(versions.get('Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(versions.get('Current 0.3.2 acceptance'), /automated release gates PASS.*VAI-PCM-MULTI-001.*PENDING/i);
  assert.match(versions.get('Deferred installed boundaries'), /VAI-M2-INST-005.*VAI-CONCUR-004/);
  assert.match(versions.get('Controlled semantic boundary'), /BELIEF.*FACT.*SYSTEM_OBSERVED/i);
  assert.match(versions.get('Latest merged source capability'), /0\.3\.2.*targeted-recall ranking correction.*installed retest contract/i);
  assert.match(versions.get('Active development slice'), /0\.3\.1 installed FAIL/i);
  assert.match(versions.get('Active development slice'), /VAI-PCM-MULTI-001.*pending/i);
  assert.match(versions.get('Active development slice'), /do not start 0\.4/i);

  const installed020 = evidence.signals.find(({label}) => label.includes('Installed 0.2.0 clean-world'));
  assert.ok(installed020, 'missing historical installed 0.2 acceptance evidence');
  assert.equal(installed020.state, 'accepted');
  assert.match(installed020.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);
  assert.match(installed020.scope, /NOT TESTED/);

  const installed031 = evidence.signals.find(({label}) => label === 'Installed 0.3.1 VAI-PCM-MULTI-001 corrective canary');
  assert.ok(installed031, 'missing 0.3.1 installed negative evidence');
  assert.equal(installed031.state, 'failed');
  assert.equal(installed031.observedAt, '2026-08-15');
  assert.match(installed031.scope, /Muammer.*amber-pine-314.*did not recall/i);
  assert.match(installed031.scope, /negative installed evidence/i);

  const correction = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/169');
  const release032 = evidence.signals.find(({label}) => label === 'Official 0.3.2+1.21.1 corrective release');
  const retestPlan = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/171');
  assert.ok(correction && release032 && retestPlan, 'missing 0.3.2 correction, release or installed-retest evidence');
  assert.equal(correction.state, 'merged');
  assert.match(correction.scope, /101c74d178ec29ca15f67ebd6041ef256a339f31/);
  assert.match(correction.scope, /does not claim installed acceptance/i);
  assert.equal(release032.kind, 'release');
  assert.equal(release032.state, 'published');
  assert.match(release032.scope, /3bb39e7ed126163efcdf971e85c89a4a5efd3111/);
  assert.match(release032.scope, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  assert.match(release032.scope, /not installed acceptance/i);
  assert.equal(retestPlan.state, 'merged');
  assert.match(retestPlan.scope, /VAI-PCM-MULTI-001 remains PENDING/i);
  assert.match(retestPlan.scope, /0\.4 stays blocked/i);
});

test('VillAIgence metadata uses the stable public route', () => {
  const meta = readJson(META_PATH).find(({path: route}) => route === 'landing/projects/livingworld.html');

  assert.ok(meta, 'VillAIgence metadata must remain bound to the livingworld route');
  assert.match(meta.title, /VillAIgence/);
  assert.match(meta.description, /Minecraft|NPC|Memory/i);
  assert.equal(meta.displayTitle, 'VILLAIGENCE');
});
