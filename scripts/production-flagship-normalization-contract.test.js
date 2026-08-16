import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = fs.readFileSync(
  path.join(__dirname, 'production-flagship-normalization-smoke.cjs'),
  'utf8',
);

function verifierBlock(name) {
  const match = SOURCE.match(new RegExp(`summary\\.${name}\\s*=\\s*await verifyCaseStudy\\(page, \\{([\\s\\S]*?)\\n    \\}\\);`));
  assert.ok(match, `${name} production verifier block must exist`);
  return match[1];
}

test('production flagship verifier keeps timelines fail-closed by default', () => {
  assert.match(SOURCE, /expectNextMilestone\s*=\s*true/);
  assert.match(SOURCE, /current\.count\(\)\s*===\s*1/);
  assert.match(SOURCE, /nextCount\s*>=\s*1/);
  assert.match(SOURCE, /nextCount\s*===\s*0/);
  assert.match(SOURCE, /must not invent a next milestone while the current acceptance boundary is active/);
});

test('production flagship verifier models active Vlezet M8.3 without inventing a next milestone', () => {
  const block = verifierBlock('vlezetRu');
  assert.match(block, /expectNextMilestone:\s*false/);
  assert.match(block, /M8\.3 Precision Reference Calibration/);
  assert.match(block, /['"]Draft['"]/);
  assert.match(block, /['"]RED['"]/);
  assert.match(block, /not product-owner accepted, merged or released/);
});

test('production flagship verifier keeps English Vlezet timeline outside the deployed timeline gate', () => {
  assert.match(verifierBlock('vlezetEn'), /requireTimeline:\s*false/);
});

test('production flagship verifier enforces the current VillAIgence 0.3.2 boundary in RU and EN', () => {
  assert.match(
    SOURCE,
    /const VILLAIGENCE_032_SHA = 'b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015';/,
  );

  for (const name of ['livingworldRu', 'livingworldEn']) {
    const block = verifierBlock(name);
    assert.match(block, /currentVillAIgenceRelease/);
    assert.match(block, /installedVillAIgenceResult/);
    assert.match(block, /0\.3\.1\+1\.21\.1/);
    assert.match(block, /PR #169/);
    assert.match(block, /PR #171/);
    assert.match(block, /VAI-PCM-MULTI-001/);
    assert.match(block, /['"]FAIL['"]/);
    assert.match(block, /['"]PENDING['"]/);
    assert.match(block, /VILLAIGENCE_032_SHA/);
    assert.match(block, /0\.4 remains blocked/);
    assert.doesNotMatch(block, /PR #165/);
    assert.doesNotMatch(block, /PR #167/);
  }
});
