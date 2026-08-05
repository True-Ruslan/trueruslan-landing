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

test('durable state preserves P3.4C production acceptance after later slices', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'P3.4C — Hybrid CV + AI recognition boundaries',
    'PR #130',
    '842959fb765702a634ec0592f218f1275d3ca93e',
    '731dbf0a6d217a40c17a8c8f1494f342fcb35e7e',
    '8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7',
    '#961 / 31029662846',
    '8940244292',
    'sha256:1f3a013c543171230e0a69975e69beaf18b252ca2337a63938f692f6a7c162d9',
    'Pages deployment ID:            5766332284',
    '#132 / 31030324160',
    '8940409941',
    'sha256:9cb66c8e3b2b432c9bbdd160542f3b5566e1e3e21f3be07711f16d5f95fae700',
    '/landing/notes/hybrid-cv-ai-recognition-boundaries/',
    'VlezetDocument',
    'localDraftFingerprint',
    'current-state revalidation',
    'explicit Apply',
    'M7.8B',
    'PR #42',
    'PR #44',
    'PR #45',
    'product-owner retest',
  ]) {
    assert.ok(combined.includes(marker), `missing historical P3.4C marker: ${marker}`);
  }

  assert.ok(state.includes('issue #111'), 'P3.4C ledger must preserve search-engine observation');
  assert.ok(state.includes('issue #82'), 'P3.4C ledger must preserve dependency blocker');
  assert.ok(state.includes('issue #78'), 'P3.4C ledger must preserve Content Freshness owner state');
});