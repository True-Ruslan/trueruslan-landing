const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const SOURCE = fs.readFileSync(
  path.join(__dirname, 'production-flagship-normalization-smoke.cjs'),
  'utf8',
);

test('production flagship verifier keeps timelines fail-closed by default', () => {
  assert.match(SOURCE, /expectNextMilestone\s*=\s*true/);
  assert.match(SOURCE, /current\.count\(\)\s*===\s*1/);
  assert.match(SOURCE, /nextCount\s*>=\s*1/);
  assert.match(SOURCE, /nextCount\s*===\s*0/);
  assert.match(SOURCE, /must not invent a next milestone while the current acceptance boundary is active/);
});

test('production flagship verifier models active Vlezet M8.3 without inventing a next milestone', () => {
  const vlezetRuBlock = SOURCE.match(/summary\.vlezetRu\s*=\s*await verifyCaseStudy\(page, \{([\s\S]*?)\n    \}\);/);
  assert.ok(vlezetRuBlock, 'Vlezet RU production verifier block must exist');

  const block = vlezetRuBlock[1];
  assert.match(block, /expectNextMilestone:\s*false/);
  assert.match(block, /M8\.3 Precision Reference Calibration/);
  assert.match(block, /['"]Draft['"]/);
  assert.match(block, /['"]RED['"]/);
  assert.match(block, /not product-owner accepted, merged or released/);
});

test('production flagship verifier keeps English Vlezet timeline outside the deployed timeline gate', () => {
  const vlezetEnBlock = SOURCE.match(/summary\.vlezetEn\s*=\s*await verifyCaseStudy\(page, \{([\s\S]*?)\n    \}\);/);
  assert.ok(vlezetEnBlock, 'Vlezet EN production verifier block must exist');
  assert.match(vlezetEnBlock[1], /requireTimeline:\s*false/);
});
