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

test('roadmap promotes the approved Portfolio 1.0 evidence-first milestone', () => {
  const roadmap = read(ROADMAP);
  const spec = read(PORTFOLIO_SPEC);

  for (const marker of [
    'Portfolio 1.0',
    'P3.1 — Homepage evidence paths',
    'VillAIgence',
    'Vlezet',
    'TrueRuslan Landing',
    'static-first',
    'APPROVED',
  ]) {
    assert.ok(`${roadmap}\n${spec}`.includes(marker), `missing Portfolio 1.0 marker: ${marker}`);
  }

  assert.ok(spec.includes('no public canonical/Sitemap/feed URL contains `.html`'));
  assert.ok(spec.includes('Start with **P3.1 — Homepage evidence paths**'));
});
