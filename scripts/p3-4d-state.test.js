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

test('durable state closes P3.4D after exact deployment and promotes P3.4E', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'P3.4D — GameTests versus installed gameplay acceptance',
    'PR #132',
    '237a3225954e1b4b633422b690b1e3fb02983f89',
    'b4f49b29dc9c16ff4d3c2412d5b4d2ea18282239',
    '02894431e042b89943e4bdb3cb43f336fa9ad75d',
    '#978 / 31042919449',
    '398 PASS / 0 FAIL',
    '8945409733',
    'sha256:cbf160fc9877e31acc89729ae077ee3f2cad815425be4200253a06659f9339c2',
    '#162 / 31043536231',
    'Pages deployment ID:            5768748824',
    '#139 / 31043534975',
    '8945575207',
    'sha256:0f1d56a3735f366512e627f7669ae017ed932bf7a2a4ee19ad0fc4ed0c5b347f',
    '/landing/notes/gametests-vs-installed-gameplay-acceptance/',
    'source/unit contracts',
    'remapped package',
    'GameTests',
    'exact production-JAR',
    'literal-loopback',
    'VAI-CONCUR-003',
    'VAI-CONCUR-004',
    'PR #110',
    'PR #112',
    'PR #114',
    'Draft',
    'inventory/grave/resurrection canary',
    'product-owner acceptance',
    'rollback',
    'recovery',
    'P3.4E — Passive PDF validation versus semantic completeness',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.4D closure marker: ${marker}`);
  }

  assert.match(spec, /Status: \*\*IN PROGRESS — P3\.4D ACCEPTED IN PRODUCTION\*\*/);
  assert.ok(spec.includes('Continue with **P3.4E — Passive PDF validation versus semantic completeness**'));
  assert.ok(state.includes('issue #111'), 'P3.4D closure must preserve search-engine observation');
  assert.ok(state.includes('issue #82'), 'P3.4D closure must preserve dependency blocker');
  assert.ok(state.includes('issue #78'), 'P3.4D closure must preserve Content Freshness owner state');
  assert.doesNotMatch(combined, /PR #114[^\n]*(?:accepted|принят|merged|слит)/i);
  assert.doesNotMatch(combined, /0\.1\.25[^\n]*(?:fully accepted|полностью принят)/i);
});