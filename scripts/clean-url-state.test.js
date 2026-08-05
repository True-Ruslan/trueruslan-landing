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

test('durable state preserves P3.2 production acceptance', () => {
  const combined = [PROJECT_STATE, ROADMAP, CHANGELOG, PORTFOLIO_SPEC]
    .map(read)
    .join('\n');

  for (const marker of [
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
  ]) {
    assert.ok(combined.includes(marker), `missing P3.2 durable marker: ${marker}`);
  }
});

test('durable state preserves P3.3 production acceptance after later slices', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'P3.3 — Flagship normalization',
    'PR #122',
    'f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7',
    'ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46',
    'c90a221a21f51e897661667f981483bad922ad0d',
    '#893 / 31005675334',
    '#152 / 31006504250',
    'Pages deployment ID:            5761717586',
    '#95 / 31006557622',
    '8930321636',
    'sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a',
    '8930571510',
    'sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13',
    '/landing/projects/livingworld/',
    '/landing/projects/vlezet/',
    '/en/projects/livingworld/',
    'PR #110',
    'M7.8B',
    'M7.8C',
    'P3.4 — Grounded Engineering Notes',
    'P3.4A — Deployment success is not production verification',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.3/P3.4 durable marker: ${marker}`);
  }

  assert.ok(spec.includes('### P3.3 — Flagship normalization — DONE'));
  assert.ok(spec.includes('no public canonical/Sitemap/feed URL contains `.html`'));
  assert.ok(roadmap.includes('exact artifact и installed acceptance остаются отдельными release gates'));

  assert.ok(state.includes('issue #111'), 'P3.3 state must preserve the search-console boundary');
  assert.ok(state.includes('issue #82'), 'P3.3 state must preserve the dependency blocker');
  assert.ok(state.includes('PR #103') && state.includes('PR #104') && state.includes('PR #110'));
});

test('durable state preserves P3.4A production acceptance after later slices', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'P3.4A — Deployment success is not production verification',
    'PR #125',
    '688b98a58937dbf9b5c9f45667d4cfdef1327294',
    '9c0a24c6adfd1794adc70facdc1ace4dc01a3d86',
    'c4f3cb5a3aa71b958d906d15eb975833b46d3571',
    '#922 / 31014792446',
    '8934487200',
    'sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad',
    'Production Live Smoke #108',
    'verifier defect',
    'PR #126',
    '43ccee7b09220000660e425ea32cc87938a7b653',
    '50a7185d799eea96adb7dcea8cd20e9e9a400784',
    '0a1cd6ad40870366fecfdce3bbdae7e8722b2119',
    '#927 / 31016127657',
    '8934699715',
    'sha256:607a2d901e77ebe5862fd760393f6a4435699dd69d1dc8abb910007fc0611b52',
    '#156 / 31016942589',
    'Pages deployment ID:            5763802525',
    '#114 / 31017023851',
    '8935003712',
    'sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480',
    '/landing/notes/deployment-success-is-not-production-verification/',
    'P3.4B — Clean URLs without Cloudflare routing',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.4A closure marker: ${marker}`);
  }

  assert.ok(spec.includes('### P3.4A — Deployment success is not production verification — DONE'));
  assert.ok(spec.includes('### P3.4B — Clean URLs without Cloudflare routing — DONE'));
  assert.ok(state.includes('issue #111'), 'P3.4A closure must preserve search-engine observation');
  assert.ok(state.includes('issue #82'), 'P3.4A closure must preserve dependency blocker');
});
