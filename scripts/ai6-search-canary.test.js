import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AI6_MIN_REFERENCE_COSINE,
  AI6_PROBE_CASE_IDS,
  buildAi6Evidence,
  cosineSimilarity,
  fetchAi6KeyMetadata,
  probeSearchWorker,
  validateAi6KeyMetadata,
} from './ai6-search-canary.js';

const ORIGIN = 'https://trueruslan.ru';
const WORKER = 'https://ai6-search.example.workers.dev';

function keyMetadata(overrides = {}) {
  return {
    limit: 2,
    limit_remaining: 1.99,
    limit_reset: null,
    usage: 0.01,
    is_management_key: false,
    is_provisioning_key: false,
    label: 'redacted',
    ...overrides,
  };
}

function probes() {
  return [
    {id: AI6_PROBE_CASE_IDS[0], lang: 'ru', kind: 'exact', query: 'server-authoritative AI NPC', expectedAnyOf: ['ru:note:server-authoritative-ai-npcs:intro']},
    {id: AI6_PROBE_CASE_IDS[1], lang: 'ru', kind: 'paraphrase', query: 'Как проверяется сайт после успешного деплоя?', expectedAnyOf: ['ru:note:deployment-success-is-not-production-verification:intro']},
    {id: AI6_PROBE_CASE_IDS[2], lang: 'en', kind: 'paraphrase', query: 'static-first portfolio GitHub Pages quality gates', expectedAnyOf: ['en:project:portfolio-platform:intro']},
  ];
}

function referenceVectors() {
  return new Map([
    [AI6_PROBE_CASE_IDS[0], [1, 0, 0]],
    [AI6_PROBE_CASE_IDS[1], [0, 1, 0]],
    [AI6_PROBE_CASE_IDS[2], [0, 0, 1]],
  ]);
}

function successfulWorkerFetch() {
  const vectorsByQuery = new Map(probes().map((probe, index) => [probe.query, referenceVectors().get(AI6_PROBE_CASE_IDS[index])]));
  const calls = [];
  return {
    calls,
    fetch: async (url, init = {}) => {
      const parsedUrl = new URL(url);
      const method = init.method || 'GET';
      const headers = new Headers(init.headers || {});
      calls.push({pathname: parsedUrl.pathname, method, origin: headers.get('Origin')});

      if (method === 'OPTIONS' && parsedUrl.pathname === '/v1/embed') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': ORIGIN,
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      if (parsedUrl.pathname === '/v1/answer') {
        return new Response(JSON.stringify({error: 'AI answer feature is disabled.', code: 'feature_disabled'}), {
          status: 503,
          headers: {'Content-Type': 'application/json'},
        });
      }

      if (parsedUrl.pathname === '/v1/embed' && headers.get('Origin') !== ORIGIN) {
        return new Response(JSON.stringify({error: 'Origin is not allowed.', code: 'origin_forbidden'}), {
          status: 403,
          headers: {'Content-Type': 'application/json'},
        });
      }

      const body = JSON.parse(init.body);
      const embedding = vectorsByQuery.get(body.query);
      assert.ok(embedding, `unexpected embedding query: ${body.query}`);
      return new Response(JSON.stringify({
        embedding,
        model: 'openai/text-embedding-3-small',
        dimensions: 3,
      }), {status: 200, headers: {'Content-Type': 'application/json'}});
    },
  };
}

test('AI-6 key policy accepts only ordinary lifetime-capped keys at or below $2', () => {
  assert.deepEqual(validateAi6KeyMetadata(keyMetadata()), {
    limitUsd: 2,
    limitRemainingUsd: 1.99,
    usageUsd: 0.01,
    limitReset: null,
  });

  for (const invalid of [
    keyMetadata({limit: null}),
    keyMetadata({limit: 2.01}),
    keyMetadata({limit_reset: 'monthly'}),
    keyMetadata({limit_remaining: 0}),
    keyMetadata({is_management_key: true}),
    keyMetadata({is_provisioning_key: true}),
  ]) {
    assert.throws(() => validateAi6KeyMetadata(invalid), /AI-6|limit|key|spend/i);
  }
});

test('AI-6 key preflight is bounded, authenticated and sanitized', async () => {
  const apiKey = 'sk-or-v1-ai6-unit-secret';
  let calls = 0;
  const metadata = await fetchAi6KeyMetadata({
    apiKey,
    fetchImpl: async (url, init) => {
      calls += 1;
      assert.equal(url, 'https://openrouter.ai/api/v1/key');
      assert.equal(init.method, 'GET');
      assert.equal(init.headers.Authorization, `Bearer ${apiKey}`);
      assert.ok(init.signal instanceof AbortSignal);
      return new Response(JSON.stringify({data: keyMetadata()}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    },
  });
  assert.equal(calls, 1);
  assert.equal(metadata.limitUsd, 2);
  assert.equal(JSON.stringify(metadata).includes(apiKey), false);
});

test('cosine compatibility is exact for identical vectors and rejects malformed vectors', () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
  assert.ok(AI6_MIN_REFERENCE_COSINE >= 0.999);
  assert.throws(() => cosineSimilarity([1, 2], [1]), /same non-zero dimension/);
  assert.throws(() => cosineSimilarity([0, 0], [0, 0]), /non-zero magnitude/);
});

test('SEARCH canary verifies preflight, origin rejection, answer disablement and three compatible embeddings', async () => {
  const worker = successfulWorkerFetch();
  const report = await probeSearchWorker({
    workerBaseUrl: WORKER,
    origin: ORIGIN,
    config: {embeddingModel: 'openai/text-embedding-3-small', embeddingDimensions: 3},
    probes: probes(),
    referenceVectors: referenceVectors(),
    fetchImpl: worker.fetch,
  });

  assert.equal(report.embeddingRequestCount, 3);
  assert.equal(report.embeddingProbes.length, 3);
  assert.ok(report.embeddingProbes.every(({referenceCosine}) => referenceCosine === 1));
  assert.match(report.workerOriginDigest, /^sha256:[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(report).sort(), [
    'answerNegativeLatencyMs',
    'embeddingProbes',
    'embeddingRequestCount',
    'preflightLatencyMs',
    'workerOriginDigest',
  ].sort(), 'canary evidence schema must expose only the Worker-origin digest, never a raw Worker URL field');
  assert.equal(worker.calls.filter(({pathname, method}) => pathname === '/v1/embed' && method === 'POST').length, 4);
  assert.equal(worker.calls.filter(({pathname}) => pathname === '/v1/answer').length, 1);
});

test('SEARCH canary rejects a runtime embedding incompatible with accepted AI-5 query space', async () => {
  const worker = successfulWorkerFetch();
  const originalFetch = worker.fetch;
  let validEmbedSeen = 0;
  await assert.rejects(
    probeSearchWorker({
      workerBaseUrl: WORKER,
      origin: ORIGIN,
      config: {embeddingModel: 'openai/text-embedding-3-small', embeddingDimensions: 3},
      probes: probes(),
      referenceVectors: referenceVectors(),
      fetchImpl: async (url, init) => {
        const parsed = new URL(url);
        const headers = new Headers(init?.headers || {});
        if (parsed.pathname === '/v1/embed' && init?.method === 'POST' && headers.get('Origin') === ORIGIN) {
          validEmbedSeen += 1;
          if (validEmbedSeen === 1) {
            return new Response(JSON.stringify({
              embedding: [0, 1, 0],
              model: 'openai/text-embedding-3-small',
              dimensions: 3,
            }), {status: 200, headers: {'Content-Type': 'application/json'}});
          }
        }
        return originalFetch(url, init);
      },
    }),
    /incompatible with accepted AI-5 query space/,
  );
});

test('AI-6 evidence keeps public AI off and rejects excessive canary spend', () => {
  const before = validateAi6KeyMetadata(keyMetadata({usage: 0.1, limit_remaining: 1.9}));
  const after = validateAi6KeyMetadata(keyMetadata({usage: 0.105, limit_remaining: 1.895}));
  const acceptedIndex = {
    meta: {sourceCommit: 'a'.repeat(40), corpusDigest: `sha256:${'b'.repeat(64)}`, embeddingsDigest: `sha256:${'c'.repeat(64)}`},
    queryMeta: {benchmarkDigest: `sha256:${'d'.repeat(64)}`, embeddingsDigest: `sha256:${'e'.repeat(64)}`},
  };
  const evidence = buildAi6Evidence({
    sourceCommit: 'f'.repeat(40),
    before,
    after,
    acceptedIndex,
    probeReport: {embeddingRequestCount: 3, embeddingProbes: []},
  });
  assert.equal(evidence.publicAiMode, 'off');
  assert.equal(evidence.runtimeMode, 'search');
  assert.equal(evidence.answerEndpoint, 'disabled');
  assert.ok(Math.abs(evidence.keyAccounting.runUsageDeltaUsd - 0.005) < 1e-12);

  assert.throws(() => buildAi6Evidence({
    sourceCommit: 'f'.repeat(40),
    before,
    after: validateAi6KeyMetadata(keyMetadata({usage: 0.111, limit_remaining: 1.889})),
    acceptedIndex,
    probeReport: {},
  }), /spend exceeded/);
});
