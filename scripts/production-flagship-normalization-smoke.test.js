import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'scripts', 'production-flagship-normalization-smoke.cjs'), 'utf8');

test('production flagship smoke follows current VillAIgence 0.2 and BELIEF boundaries', () => {
  assert.match(source, /Current official release/);
  assert.match(source, /Installed 0\.2\.0 result/);
  assert.match(source, /7 PASS \/ 0 FAIL/);
  assert.match(source, /PR #123/);
  assert.match(source, /PR #125/);
  assert.doesNotMatch(source, /Current published candidate/);
  assert.doesNotMatch(source, /cumulative acceptance/);
});

test('production flagship smoke follows Vlezet failed automatic path and Assisted Tracing pivot', () => {
  assert.match(source, /Automatic M7\.8C result/);
  assert.match(source, /Assisted Tracing/);
  assert.match(source, /PR #52/);
  assert.match(source, /closed unmerged/);
  assert.doesNotMatch(source, /product-owner retest/);
});
