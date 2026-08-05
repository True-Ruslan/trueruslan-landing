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

test('durable state preserves P3.1 production acceptance', () => {
  const combined = [PROJECT_STATE, ROADMAP, CHANGELOG, PORTFOLIO_SPEC]
    .map(read)
    .join('\n');

  for (const marker of [
    'P3.1 — Homepage evidence paths',
    'PR #117',
    'fe1a796df37313401c07e25c0672dc32db30a1c4',
    '#836 / 30989449993',
    '#147 / 30989921979',
    '#58 / 30989981685',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.1 durable marker: ${marker}`);
  }
});

test('durable state records P3.2 production acceptance and promotes P3.3', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'Portfolio 1.0',
    'P3.2 — TrueRuslan Landing flagship',
    'PR #119',
    '6736c9fd917f213621e5e88273304dda8ddda760',
    'd11aeddeed492dce512e123d216e0191a5906ca9',
    'PR #120',
    'c2fa3327061148b5e4adf703bd707d6925639df3',
    'dcb278cb4f52d5e8afc314a9f30689edb5153af0',
    '#868 / 30998184982',
    '#869 / 30998966087',
    'Pages deployment ID:            5760275658',
    '#80 / 30999331791',
    '8927580319',
    'sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08',
    '/landing/projects/portfolio-platform/',
    '/en/projects/portfolio-platform/',
    'main.dc-doc-page__content',
    'P3.3 — Flagship normalization',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.2/P3.3 durable marker: ${marker}`);
  }

  assert.match(spec, /Status: \*\*IN PROGRESS — P3\.2 ACCEPTED IN PRODUCTION\*\*/);
  assert.ok(spec.includes('no public canonical/Sitemap/feed URL contains `.html`'));
  assert.ok(spec.includes('Start with **P3.3 — Flagship normalization**'));
  assert.ok(roadmap.includes('exact artifact и installed acceptance остаются отдельными release gates'));
});
