import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_STATE = path.join(ROOT, 'docs', 'PROJECT_STATE.md');
const ROADMAP = path.join(ROOT, 'docs', 'ROADMAP.md');
const CHANGELOG = path.join(ROOT, 'docs', 'CHANGELOG.md');
const PORTFOLIO_SPEC = path.join(
  ROOT,
  'docs',
  'keystone',
  'specs',
  '2026-08-05-portfolio-1-0-evidence-first.md',
);

function read(file) {
  assert.ok(fs.existsSync(file), `missing durable file: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, 'utf8');
}

test('durable state records repository-native clean URL acceptance', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const combined = `${state}\n${roadmap}\n${changelog}`;

  for (const marker of [
    'PR #114',
    'cf07c39378e7c531583e80eaef5edc7e7d1f2bad',
    'PR #115',
    '4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c',
    '/landing/resume/',
    'legacy `.html`',
    'Production Live Smoke #52',
  ]) {
    assert.ok(combined.includes(marker), `missing clean URL durable marker: ${marker}`);
  }

  assert.ok(state.includes('issue #111'), 'state must preserve the Yandex operator boundary');
  assert.ok(state.includes('issue #82'), 'state must preserve the Diplodoc dependency blocker');
  assert.ok(state.includes('PR #103') && state.includes('PR #104'), 'state must preserve VillAIgence acceptance evidence');
});

test('durable state records P3.1 production acceptance and promotes P3.2', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'Portfolio 1.0',
    'P3.1 — Homepage evidence paths',
    'PR #117',
    'fe1a796df37313401c07e25c0672dc32db30a1c4',
    'Build:                          #836',
    'Pages:                          #147',
    'Production Live Smoke:          #58',
    'VillAIgence',
    'Vlezet',
    'TrueRuslan Landing',
    'static-first',
    'P3.2 — TrueRuslan Landing flagship',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.1/P3.2 durable marker: ${marker}`);
  }

  assert.match(spec, /Status: \*\*IN PROGRESS — P3\.1 ACCEPTED IN PRODUCTION\*\*/);
  assert.ok(spec.includes('no public canonical/Sitemap/feed URL contains `.html`'));
  assert.ok(spec.includes('Start with **P3.2 — TrueRuslan Landing flagship**'));
});
