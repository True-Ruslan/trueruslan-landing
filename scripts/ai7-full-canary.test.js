import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AI7_MAX_KEY_LIMIT_USD,
  AI7_MAX_RUN_SPEND_USD,
  buildAi7Evidence,
  probeAi7FullWorker,
  validateAi7KeyMetadata,
} from './ai7-full-canary.js';

const ORIGIN = 'https://trueruslan.ru';
const CANARY = 'https://ai7-canary.example.workers.dev';
const PUBLIC = 'https://public-search.example.workers.dev';
const SUFFICIENT_CHUNK = 'ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment';

function keyMeta(overrides = {}) {
  return {
    limit: 2,
    limit_remaining: 1.9,
    limit_reset: null,
    usage: 0.1,
    is_management_key: false,
    is_provisioning_key: false,
    ...overrides,
  };
}

function json(status, value, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {'Content-Type': 'application/json', ...headers},
  });
}

test('AI-7 accepts only an ordinary lifetime-capped key and keeps a bounded per-run spend', () => {
  assert.equal(AI7_MAX_KEY_LIMIT_USD, 2);
  assert.equal(AI7_MAX_RUN_SPEND_USD, 0.02);
  assert.deepEqual(validateAi7KeyMetadata(keyMeta()), {
    limitUsd: 2,
    limitRemainingUsd: 1.9,
    usageUsd: 0.1,
    limitReset: null,
  });

  for (const candidate of [
    keyMeta({limit: 2.01}),
    keyMeta({limit_reset: 'monthly'}),
    keyMeta({limit_remaining: 0}),
    keyMeta({is_management_key: true}),
    keyMeta({is_provisioning_key: true}),
  ]) {
    assert.throws(() => validateAi7KeyMetadata(candidate));
  }
});

test('AI-7 FULL probe proves grounded and insufficient answers while public SEARCH answer stays disabled', async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const target = String(url);
    const method = init.method || 'GET';
    const origin = init.headers?.Origin;
    calls.push({target, method, origin});

    if (target === `${CANARY}/v1/answer` && method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': ORIGIN,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (target === `${CANARY}/v1/answer` && origin === 'https://example.invalid') {
      return json(403, {code: 'origin_forbidden', error: 'Origin is not allowed.'});
    }
    if (target === `${CANARY}/v1/embed`) {
      return json(200, {
        model: 'openai/text-embedding-3-small',
        dimensions: 512,
        embedding: Array(512).fill(0.01),
      });
    }
    if (target === `${CANARY}/v1/answer`) {
      const payload = JSON.parse(init.body);
      if (payload.question.includes('любимый фильм')) {
        return json(200, {sufficientEvidence: false, answer: '', citations: []});
      }
      return json(200, {
        sufficientEvidence: true,
        answer: 'Успешная доставка и проверка уже опубликованной системы — разные слои доказательств.',
        citations: [SUFFICIENT_CHUNK],
      });
    }
    if (target === `${PUBLIC}/v1/answer`) {
      return json(503, {code: 'feature_disabled', error: 'AI answer feature is disabled.'});
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };

  const report = await probeAi7FullWorker({
    workerBaseUrl: CANARY,
    publicWorkerBaseUrl: PUBLIC,
    origin: ORIGIN,
    embeddingModel: 'openai/text-embedding-3-small',
    embeddingDimensions: 512,
    fetchImpl,
  });

  assert.equal(report.sufficientAnswer.sufficientEvidence, true);
  assert.deepEqual(report.sufficientAnswer.citations, [SUFFICIENT_CHUNK]);
  assert.ok(report.sufficientAnswer.answerWordCount > 0);
  assert.equal(report.insufficientAnswer.sufficientEvidence, false);
  assert.equal(report.insufficientAnswer.answerWordCount, 0);
  assert.deepEqual(report.insufficientAnswer.citations, []);
  assert.equal(report.publicAnswerEndpoint, 'disabled');
  assert.equal(report.embedding.model, 'openai/text-embedding-3-small');
  assert.equal(report.embedding.dimensions, 512);
  assert.match(report.workerOriginDigest, /^sha256:[a-f0-9]{64}$/);
  assert.match(report.publicWorkerOriginDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(calls.length, 6);
  assert.equal(JSON.stringify(report).includes('workers.dev'), false);
});

test('AI-7 FULL probe reports only a bounded Worker error code and never leaks raw provider error text', async () => {
  const rawProviderError = 'provider leaked credential sk-or-v1-DO-NOT-LOG at https://provider.invalid/private';
  const fetchImpl = async (url, init = {}) => {
    const target = String(url);
    const method = init.method || 'GET';
    const origin = init.headers?.Origin;

    if (target === `${CANARY}/v1/answer` && method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': ORIGIN,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (target === `${CANARY}/v1/answer` && origin === 'https://example.invalid') {
      return json(403, {code: 'origin_forbidden', error: 'Origin is not allowed.'});
    }
    if (target === `${CANARY}/v1/embed`) {
      return json(200, {
        model: 'openai/text-embedding-3-small',
        dimensions: 512,
        embedding: Array(512).fill(0.01),
      });
    }
    if (target === `${CANARY}/v1/answer`) {
      return json(502, {code: 'provider_http_error', error: rawProviderError});
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };

  let failure;
  try {
    await probeAi7FullWorker({
      workerBaseUrl: CANARY,
      publicWorkerBaseUrl: PUBLIC,
      origin: ORIGIN,
      embeddingModel: 'openai/text-embedding-3-small',
      embeddingDimensions: 512,
      fetchImpl,
    });
  } catch (error) {
    failure = error;
  }

  assert.ok(failure instanceof Error);
  assert.equal(failure.message, 'AI-7 sufficient answer returned HTTP 502 code=provider_http_error');
  assert.equal(failure.message.includes(rawProviderError), false);
  assert.equal(failure.message.includes('sk-or-v1'), false);
  assert.equal(failure.message.includes('provider.invalid'), false);
  assert.equal(failure.message.includes('workers.dev'), false);
});

test('AI-7 evidence is sanitized, SEARCH-preserving and rejects excess spend', () => {
  const probeReport = {
    workerOriginDigest: `sha256:${'1'.repeat(64)}`,
    publicWorkerOriginDigest: `sha256:${'2'.repeat(64)}`,
    preflightLatencyMs: 4,
    forbiddenOriginLatencyMs: 5,
    embedding: {latencyMs: 10, model: 'openai/text-embedding-3-small', dimensions: 512},
    sufficientAnswer: {latencyMs: 20, sufficientEvidence: true, answerWordCount: 12, citations: [SUFFICIENT_CHUNK]},
    insufficientAnswer: {latencyMs: 21, sufficientEvidence: false, answerWordCount: 0, citations: []},
    publicAnswerEndpoint: 'disabled',
    publicAnswerLatencyMs: 7,
    clientUnexpectedExternalRequests: 0,
  };
  const before = {limitUsd: 2, limitRemainingUsd: 1.9, usageUsd: 0.1, limitReset: null};
  const after = {limitUsd: 2, limitRemainingUsd: 1.895, usageUsd: 0.105, limitReset: null};
  const evidence = buildAi7Evidence({
    sourceCommit: 'a'.repeat(40),
    before,
    after,
    probeReport,
  });

  assert.equal(evidence.publicAiMode, 'search');
  assert.equal(evidence.isolatedRuntimeMode, 'full');
  assert.equal(evidence.publicFullActivated, false);
  assert.equal(evidence.publicAnswerEndpoint, 'disabled');
  assert.equal(evidence.keyAccounting.runUsageDeltaUsd, 0.005);
  assert.equal(JSON.stringify(evidence).includes('OPENROUTER'), false);
  assert.equal(JSON.stringify(evidence).includes('workers.dev'), false);

  assert.throws(() => buildAi7Evidence({
    sourceCommit: 'b'.repeat(40),
    before,
    after: {...after, usageUsd: before.usageUsd + AI7_MAX_RUN_SPEND_USD + 0.001},
    probeReport,
  }), /spend exceeded/i);
});
