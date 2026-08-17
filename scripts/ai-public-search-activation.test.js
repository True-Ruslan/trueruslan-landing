import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER_ORIGIN = 'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function config() {
  return JSON.parse(read('data/ai-navigator.json'));
}

test('public AI config activates only the accepted SEARCH candidate', () => {
  const value = config();
  assert.equal(value.mode, 'search');
  assert.equal(value.workerBaseUrl, WORKER_ORIGIN);
  assert.equal(new URL(value.workerBaseUrl).origin, WORKER_ORIGIN);
  assert.equal(value.embeddingModel, 'openai/text-embedding-3-small');
  assert.equal(value.embeddingDimensions, 512);
  assert.deepEqual(value.hybridWeights, {
    semantic: 0.65,
    lexical: 0.20,
    title: 0.10,
    language: 0.05,
  });
  assert.notEqual(value.mode, 'full');
});

test('public SEARCH production acceptance is manual-only and bounded', () => {
  const workflow = read('.github/workflows/ai-navigator-public-search-acceptance.yml');
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /confirm_public_search_acceptance:/);
  assert.match(workflow, /refs\/heads\/master/);
  assert.match(workflow, /PUBLIC_SEARCH_CONFIRMED/);
  assert.match(workflow, /node scripts\/install-browser-tools\.cjs/);
  assert.match(workflow, /node scripts\/ai-public-search-production-smoke\.cjs/);
  assert.match(workflow, /ai-navigator-public-search-acceptance-/);
  assert.doesNotMatch(workflow, /^\s+schedule:/m);
  assert.doesNotMatch(workflow, /^\s+push:/m);
  assert.doesNotMatch(workflow, /^\s+workflow_run:/m);
  assert.doesNotMatch(workflow, /OPENROUTER|API_KEY|Bearer/i);
});

test('production smoke proves semantic UI wiring without enabling FULL', () => {
  const smoke = read('scripts/ai-public-search-production-smoke.cjs');
  assert.match(smoke, /https:\/\/trueruslan\.ru/);
  assert.match(smoke, /Как Руслан доказывает, что сервис уже работает в проде\?/);
  assert.match(smoke, /\[role="switch"\]/);
  assert.match(smoke, /\.tr-ai-result/);
  assert.match(smoke, /\/v1\/answer/);
  assert.match(smoke, /feature_disabled/);
  assert.match(smoke, /writeJsonArtifact/);
  assert.match(smoke, /workerOriginDigest/);
  assert.doesNotMatch(smoke, /openrouter\.ai|OPENROUTER|API_KEY|Bearer/i);
});
