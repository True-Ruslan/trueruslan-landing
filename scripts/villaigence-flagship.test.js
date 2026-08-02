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
  assert.equal(project.statusLabel, 'CORRECTIVE CANDIDATE');
});

test('VillAIgence page records current source and installed-acceptance boundaries', () => {
  const page = fs.readFileSync(PAGE_PATH, 'utf8');

  assert.match(page, /^# VillAIgence/m);
  assert.match(page, /https:\/\/github\.com\/True-Ruslan\/villAIgence/);
  assert.match(page, /e13660f5998fa1ed343548252d573140adc5b0c9/);
  assert.match(page, /0\.1\.20\+1\.21\.1[\s\S]{0,220}PARTIAL PASS/i);
  assert.match(page, /0\.1\.21\+1\.21\.1[\s\S]{0,260}startup/i);
  assert.match(page, /0\.1\.22\+1\.21\.1[\s\S]{0,260}pending/i);
  assert.match(page, /LivingWorld\s*\/\s*livingworld[\s\S]{0,220}compatib/i);
  assert.doesNotMatch(page, /0\.1\.22\+1\.21\.1[^\n]{0,120}(accepted|full pass|production-ready)/i);
});

test('VillAIgence timeline has one current corrective-candidate milestone', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');

  assert.equal(history.length, 5);
  assert.equal(current.length, 1);
  assert.match(current[0].title, /0\.1\.22|corrective/i);
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/102');
  assert.match(history.at(-1).description, /installed|startup|water|grave|restart|acceptance/i);
});

test('VillAIgence evidence separates partial acceptance, corrective code and failed startup', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-02');
  assert.equal(evidence.signals.length, 3);
  assert.deepEqual(evidence.signals.map(({state}) => state), ['accepted', 'merged', 'failed']);
  assert.match(evidence.signals[0].scope, /0\.1\.20[\s\S]{0,260}partial/i);
  assert.match(evidence.signals[0].scope, /water|drown/i);
  assert.match(evidence.signals[0].scope, /grave|Silk Touch/i);
  assert.match(evidence.signals[0].scope, /272/);
  assert.match(evidence.signals[1].scope, /#99|PRs #99–#102|PRs #99-#102/);
  assert.match(evidence.signals[1].scope, /installed acceptance remains pending/i);
  assert.match(evidence.signals[2].scope, /0\.1\.21[\s\S]{0,260}startup/i);
  assert.match(evidence.signals[2].scope, /six|6[\s-]persistent/i);
});

test('VillAIgence metadata uses the stable public route', () => {
  const meta = readJson(META_PATH).find(({path: route}) => route === 'landing/projects/livingworld.html');

  assert.ok(meta, 'VillAIgence metadata must remain bound to the livingworld route');
  assert.match(meta.title, /VillAIgence/);
  assert.match(meta.description, /Minecraft|NPC|Memory/i);
  assert.equal(meta.displayTitle, 'VILLAIGENCE');
});
