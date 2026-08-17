import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('public SEARCH acceptance always uploads evidence from the canonical quality artifact directory', () => {
  const workflow = read('.github/workflows/ai-navigator-public-search-acceptance.yml');
  assert.match(workflow, /quality-artifacts\/ai-public-search-production-evidence\.json/);
  assert.match(workflow, /quality-artifacts\/ai-public-search-production\.png/);
  assert.doesNotMatch(workflow, /^\s+artifacts\/ai-public-search-production-/m);
});

test('production SEARCH smoke records only bounded status diagnostics for static index and Worker embed responses', () => {
  const smoke = read('scripts/ai-public-search-production-smoke.cjs');
  assert.match(smoke, /page\.on\('response'/);
  assert.match(smoke, /networkObservations/);
  assert.match(smoke, /ai\/chunks\.json/);
  assert.match(smoke, /ai\/index-meta\.json/);
  assert.match(smoke, /ai\/embeddings\.bin/);
  assert.match(smoke, /\/v1\/embed/);
  assert.match(smoke, /status:\s*response\.status\(\)/);
  assert.match(smoke, /ok:\s*response\.ok\(\)/);
  assert.doesNotMatch(smoke, /response\.text\s*\(/);
  assert.doesNotMatch(smoke, /response\.json\s*\(/);
});

test('production SEARCH smoke distinguishes semantic result from explicit client fallback instead of timing out opaquely', () => {
  const smoke = read('scripts/ai-public-search-production-smoke.cjs');
  assert.match(smoke, /waitForSemanticOutcome/);
  assert.match(smoke, /\.tr-ai-results__status/);
  assert.match(smoke, /failureStage/);
  assert.match(smoke, /semantic-fallback/);
  assert.match(smoke, /semantic-result/);
});

test('failed production SEARCH acceptance preserves sanitized JSON and screenshot evidence', () => {
  const smoke = read('scripts/ai-public-search-production-smoke.cjs');
  assert.match(smoke, /captureFailureScreenshot/);
  assert.match(smoke, /ai-public-search-production-evidence\.json/);
  assert.match(smoke, /sanitized:\s*true/);
});
