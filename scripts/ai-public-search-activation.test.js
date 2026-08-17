import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER_ORIGIN = 'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev';
const ACCEPTED_AI5_ARTIFACT_ID = '9283608793';
const ACCEPTED_AI5_ARTIFACT_SHA256 = '71260072c273588c4b8a4ab53180b6dfc5c39be8612aee21f91721c7d2919e1f';

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

test('SEARCH builds restore only the exact accepted AI-5 index artifact', () => {
  const restore = read('scripts/ai-index-restore.js');
  assert.match(restore, new RegExp(`ACCEPTED_AI5_ARTIFACT_ID = ${ACCEPTED_AI5_ARTIFACT_ID}`));
  assert.match(restore, new RegExp(ACCEPTED_AI5_ARTIFACT_SHA256));
  assert.match(restore, /verifyAiIndex/);
  assert.match(restore, /providerAccess: false/);
  assert.match(restore, /\['chunks\.json',|chunks\.json/);
  assert.match(restore, /index-meta\.json/);
  assert.match(restore, /embeddings\.bin/);
  assert.doesNotMatch(restore, /openrouter\.ai|OPENROUTER_API_KEY/i);

  for (const workflowPath of ['.github/workflows/build.yml', '.github/workflows/static.yml']) {
    const workflow = read(workflowPath);
    assert.match(workflow, /actions: read/);
    assert.match(workflow, /Restore exact accepted AI index/);
    assert.match(workflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
    assert.match(workflow, /node scripts\/ai-index-restore\.js/);
    assert.doesNotMatch(workflow, /OPENROUTER_AI6_API_KEY|OPENROUTER_API_KEY/);
    const restoreIndex = workflow.indexOf('Restore exact accepted AI index');
    const buildIndex = workflow.indexOf('Build docs');
    assert.ok(restoreIndex >= 0 && buildIndex > restoreIndex, `${workflowPath}: accepted index must restore before build`);
  }
});

test('public SEARCH production acceptance is manual-only and bounded', () => {
  const workflow = read('.github/workflows/ai-navigator-public-search-acceptance.yml');
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /confirm_public_search_acceptance:/);
  assert.match(workflow, /refs\/heads\/master/);
  assert.match(workflow, /PUBLIC_SEARCH_CONFIRMED/);
  assert.match(workflow, /playwright@1\.61\.1/);
  assert.match(workflow, /playwright\/cli\.js install --with-deps chromium/);
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
  assert.match(smoke, /ru-paraphrase-production-proof/);
  assert.match(smoke, /Как проверяется сайт после успешного деплоя\?/);
  assert.match(smoke, /deployment-success-is-not-production-verification|DEPLOYMENT_VERIFICATION_NOTE_URL/);
  assert.match(smoke, /\[role="switch"\]/);
  assert.match(smoke, /\.tr-ai-result/);
  assert.match(smoke, /\/v1\/embed/);
  assert.match(smoke, /\/v1\/answer/);
  assert.match(smoke, /feature_disabled/);
  assert.match(smoke, /writeJsonArtifact/);
  assert.match(smoke, /workerOriginDigest/);
  assert.doesNotMatch(smoke, /openrouter\.ai|OPENROUTER|API_KEY|Bearer/i);
});
