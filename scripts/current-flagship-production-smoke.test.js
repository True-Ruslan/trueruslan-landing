import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE = path.join(ROOT, 'scripts', 'production-flagship-normalization-smoke.cjs');
const source = fs.readFileSync(SMOKE, 'utf8');

test('deployment flagship smoke derives current release and strategy evidence from the canonical registry', () => {
  assert.match(source, /data\/project-evidence\.json/);
  assert.match(
    source,
    /evidenceVersion\(\s*['"]livingworld['"]\s*,\s*['"]Current official release['"]\s*,?\s*\)/,
  );
  assert.match(
    source,
    /evidenceVersion\(\s*['"]livingworld['"]\s*,\s*['"]Installed 0\.2\.0 result['"]\s*,?\s*\)/,
  );
  assert.match(
    source,
    /evidenceVersion\(\s*['"]vlezet['"]\s*,\s*['"]Automatic M7\.8C result['"]\s*,?\s*\)/,
  );
  assert.match(
    source,
    /evidenceVersion\(\s*['"]vlezet['"]\s*,\s*['"]Next acceptance boundary['"]\s*,?\s*\)/,
  );
  assert.doesNotMatch(source, /Current published candidate/);
  assert.doesNotMatch(source, /0\.1\.23\+1\.21\.1/);
});

test('deployment flagship smoke requires the current bounded external evidence markers', () => {
  for (const marker of [
    '0.3.1+1.21.1',
    'PR #169',
    'PR #171',
    'VAI-PCM-MULTI-001',
    'FAIL',
    'PENDING',
    'b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015',
    '0.4 remains blocked',
    'PR #42',
    'PR #44',
    'PR #45',
    'PR #52',
    'Assisted Tracing',
  ]) {
    assert.ok(source.includes(marker), `missing current production evidence marker: ${marker}`);
  }

  assert.doesNotMatch(source, /PR #165/);
  assert.doesNotMatch(source, /PR #167/);
  assert.doesNotMatch(source, /product-owner retest/);
  assert.doesNotMatch(source, /0\.1\.23\+1\.21\.1/);
});
