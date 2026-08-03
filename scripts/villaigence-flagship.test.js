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

test('VillAIgence page records current automated and cumulative acceptance boundaries', () => {
  const page = fs.readFileSync(PAGE_PATH, 'utf8');

  assert.match(page, /^# VillAIgence/m);
  assert.match(page, /https:\/\/github\.com\/True-Ruslan\/villAIgence/);
  assert.match(page, /61b66e38e99c1dc9bdc26089bfb345a250a881e2/);
  assert.match(page, /0\.1\.20\+1\.21\.1[\s\S]{0,240}PARTIAL PASS/i);
  assert.match(page, /0\.1\.21\+1\.21\.1[\s\S]{0,260}startup/i);
  assert.match(page, /0\.1\.23\+1\.21\.1/);
  assert.match(page, /PR #103[\s\S]{0,500}28/);
  assert.match(page, /PR #104[\s\S]{0,700}production-JAR/i);
  assert.match(page, /production-JAR[\s\S]{0,360}restart/i);
  assert.match(page, /Cumulative acceptance remains pending/i);
  assert.match(page, /LivingWorld\s*\/\s*livingworld[\s\S]{0,220}compatib/i);
  assert.doesNotMatch(page, /0\.1\.23\+1\.21\.1[^\n]{0,160}(production-ready|full pass|fully accepted)/i);
});

test('VillAIgence timeline has one current risk-based production-JAR milestone', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');

  assert.equal(history.length, 5);
  assert.equal(current.length, 1);
  assert.match(current[0].title, /M11|production-JAR|risk-based/i);
  assert.equal(current[0].version, '0.1.23+1.21.1');
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/104');
  assert.match(history.at(-1).description, /Text|STT|Chat|TTS|two-client|water|grave|acceptance/i);
});

test('VillAIgence evidence separates historical failures, GameTests and production-JAR restart proof', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-03');
  assert.equal(evidence.signals.length, 5);
  assert.deepEqual(evidence.signals.map(({state}) => state), [
    'accepted',
    'failed',
    'merged',
    'merged',
    'merged',
  ]);
  assert.match(evidence.signals[0].scope, /0\.1\.20[\s\S]{0,260}partial/i);
  assert.match(evidence.signals[0].scope, /water|drown/i);
  assert.match(evidence.signals[0].scope, /grave|Silk Touch/i);
  assert.match(evidence.signals[0].scope, /272/);
  assert.match(evidence.signals[1].scope, /0\.1\.21[\s\S]{0,260}startup/i);
  assert.match(evidence.signals[1].scope, /six|6[\s-]persistent/i);
  assert.match(evidence.signals[2].scope, /#99|PRs #99–#102|PRs #99-#102/);
  assert.match(evidence.signals[3].label, /PR #103/);
  assert.match(evidence.signals[3].scope, /28-scenario/);
  assert.match(evidence.signals[3].scope, /GameTest/i);
  assert.match(evidence.signals[4].label, /PR #104/);
  assert.match(evidence.signals[4].scope, /two separate JVM runs/i);
  assert.match(evidence.signals[4].scope, /SHA-256 values across restart/i);
  assert.match(evidence.signals[4].scope, /does not complete/i);
});

test('VillAIgence metadata uses the stable public route', () => {
  const meta = readJson(META_PATH).find(({path: route}) => route === 'landing/projects/livingworld.html');

  assert.ok(meta, 'VillAIgence metadata must remain bound to the livingworld route');
  assert.match(meta.title, /VillAIgence/);
  assert.match(meta.description, /Minecraft|NPC|Memory/i);
  assert.equal(meta.displayTitle, 'VILLAIGENCE');
});
