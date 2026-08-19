import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  ACCEPTED_SEARCH_WORKER,
  AI8_PRODUCTION_WORKER,
  buildAi8ProvisioningEvidence,
  createAi8ProvisioningFetchGuard,
  validateAi8ProductionWorkerBaseUrl,
} from './ai8-production-provisioning-verify.js';

const source = fs.readFileSync(new URL('./ai8-production-provisioning-verify.js', import.meta.url), 'utf8');

test('AI-8 provisioning accepts only the dedicated clean workers.dev production identity', () => {
  assert.equal(validateAi8ProductionWorkerBaseUrl(AI8_PRODUCTION_WORKER), AI8_PRODUCTION_WORKER);
  for (const invalid of [
    ACCEPTED_SEARCH_WORKER,
    'https://trueruslan-ai-navigator-ai7-full-canary.trueruslan.workers.dev',
    'http://trueruslan-ai-navigator-ai8-full-production.trueruslan.workers.dev',
    `${AI8_PRODUCTION_WORKER}/v1/embed`,
    'https://example.com',
  ]) {
    assert.throws(() => validateAi8ProductionWorkerBaseUrl(invalid), /AI-8/);
  }
});

test('AI-8 provisioning network guard is exact allowlist-only and disables redirects', async () => {
  const seen = [];
  const guard = createAi8ProvisioningFetchGuard({
    workerBaseUrl: AI8_PRODUCTION_WORKER,
    config: {mode: 'search', embeddingDimensions: 512},
    fetchImpl: async (url, init) => {
      seen.push({url: String(url), redirect: init.redirect});
      return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
    },
  });

  await guard.fetchImpl(`${AI8_PRODUCTION_WORKER}/v1/embed`, {method: 'POST'});
  await guard.fetchImpl(`${AI8_PRODUCTION_WORKER}/v1/answer`, {method: 'POST'});
  await guard.fetchImpl(`${ACCEPTED_SEARCH_WORKER}/v1/answer`, {method: 'POST'});
  await guard.fetchImpl('https://openrouter.ai/api/v1/key', {method: 'GET'});

  assert.equal(guard.externalRequestCount(), 4);
  assert.equal(guard.unexpectedCount(), 0);
  assert.deepEqual(seen.map(({redirect}) => redirect), ['error', 'error', 'error', 'error']);

  await assert.rejects(
    guard.fetchImpl('https://example.invalid/', {method: 'GET'}),
    /unexpected external request/,
  );
  assert.equal(guard.unexpectedCount(), 1);
  assert.equal(guard.externalRequestCount(), 4);
});

test('AI-8 provisioning evidence is SEARCH-preserving, bounded and sanitized', () => {
  const evidence = buildAi8ProvisioningEvidence({
    sourceCommit: 'a'.repeat(40),
    before: {limitUsd: 2, limitRemainingUsd: 1.9, usageUsd: 0.1, limitReset: null},
    after: {limitUsd: 2, limitRemainingUsd: 1.89, usageUsd: 0.11, limitReset: null},
    workerBaseUrl: AI8_PRODUCTION_WORKER,
    probeReport: {
      embedding: {model: 'openai/text-embedding-3-small', dimensions: 512, latencyMs: 10},
      sufficientAnswer: {sufficientEvidence: true, citations: ['bounded'], latencyMs: 20},
      insufficientAnswer: {sufficientEvidence: false, citations: [], latencyMs: 20},
    },
    publicAnswerEndpoint: 'disabled',
    unexpectedRequests: 0,
    externalRequests: 8,
  });

  assert.equal(evidence.evidenceClass, 'ai8-production-provisioning');
  assert.equal(evidence.publicAiMode, 'search');
  assert.equal(evidence.productionRuntimeMode, 'full');
  assert.equal(evidence.productionWorkerProvisioned, true);
  assert.equal(evidence.publicFullActivated, false);
  assert.equal(evidence.publicAnswerEndpoint, 'disabled');
  assert.equal(evidence.keyAccounting.runUsageDeltaUsd, 0.01);
  assert.equal(evidence.unexpectedExternalRequests, 0);
  assert.equal(evidence.sanitized, true);
  assert.match(evidence.workerOriginDigest, /^sha256:[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(evidence), /trueruslan-ai-navigator-ai8-full-production/);

  assert.throws(() => buildAi8ProvisioningEvidence({
    sourceCommit: 'b'.repeat(40),
    before: {limitUsd: 2, limitRemainingUsd: 2, usageUsd: 0, limitReset: null},
    after: {limitUsd: 2, limitRemainingUsd: 1.95, usageUsd: 0.05, limitReset: null},
    workerBaseUrl: AI8_PRODUCTION_WORKER,
    probeReport: {},
    publicAnswerEndpoint: 'disabled',
    unexpectedRequests: 0,
    externalRequests: 8,
  }), /spend exceeded/);
});

test('pre-activation verifier reuses accepted AI-8 probe and independently proves SEARCH answer disablement', () => {
  assert.match(source, /probeAi8PublicFull\(\{/);
  assert.match(source, /publicSearchUrl: PREACTIVATION_CONFIG_URL/);
  assert.match(source, /verifyAcceptedSearchStillDisablesAnswers/);
  assert.match(source, /verifyAiIndex\(\{rootDir, config\}\)/);
  assert.match(source, /redirect: 'error'/);
  assert.match(source, /config\.mode !== 'search'/);
  assert.match(source, /config\.workerBaseUrl !== ACCEPTED_SEARCH_WORKER/);
  assert.doesNotMatch(source, /git\s+(?:push|commit)/i);
});
