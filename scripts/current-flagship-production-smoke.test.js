import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE = path.join(ROOT, 'scripts', 'production-flagship-normalization-smoke.cjs');
const source = fs.readFileSync(SMOKE, 'utf8');

test('deployment flagship smoke derives current release evidence from the canonical registry', () => {
  assert.match(source, /data\/project-evidence\.json/);
  assert.match(source, /Current published candidate/);
  assert.match(source, /evidenceVersion\(['"]livingworld['"], ['"]Current published candidate['"]\)/);
  assert.doesNotMatch(source, /0\.1\.23\+1\.21\.1/);
});

test('deployment flagship smoke requires the current bounded external evidence markers', () => {
  for (const marker of ['PR #108', 'PR #110', 'PR #44', 'PR #45']) {
    assert.ok(source.includes(marker), `missing current production evidence marker: ${marker}`);
  }
});
