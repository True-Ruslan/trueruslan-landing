import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'scripts', 'production-flagship-normalization-smoke.cjs'), 'utf8');

test('production flagship smoke follows current VillAIgence 0.3.2 corrective acceptance boundary', () => {
  assert.match(source, /Current official release/);
  assert.match(source, /Installed 0\.2\.0 result/);
  assert.match(source, /currentVillAIgenceRelease/);
  assert.match(source, /installedVillAIgenceResult/);
  assert.match(source, /0\.3\.1\+1\.21\.1/);
  assert.match(source, /PR #169/);
  assert.match(source, /PR #171/);
  assert.match(source, /VAI-PCM-MULTI-001/);
  assert.match(source, /FAIL/);
  assert.match(source, /PENDING/);
  assert.match(source, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  assert.match(source, /0\.4 remains blocked/);
  assert.match(source, /VAI-M2-INST-005/);
  assert.match(source, /VAI-CONCUR-004/);
  assert.doesNotMatch(source, /PR #165/);
  assert.doesNotMatch(source, /PR #167/);
  assert.doesNotMatch(source, /Current published candidate/);
  assert.doesNotMatch(source, /cumulative acceptance/);
});

test('production flagship smoke follows Vlezet failed automatic path and Assisted Tracing pivot', () => {
  assert.match(source, /Automatic M7\.8C result/);
  assert.match(source, /Next acceptance boundary/);
  assert.match(source, /automaticVlezetResult/);
  assert.match(source, /nextVlezetBoundary/);
  assert.match(source, /Assisted Tracing/);
  assert.match(source, /PR #42/);
  assert.match(source, /PR #44/);
  assert.match(source, /PR #45/);
  assert.match(source, /PR #52/);
  assert.doesNotMatch(source, /product-owner retest/);
});
