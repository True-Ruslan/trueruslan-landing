import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AI5_MAX_KEY_LIMIT_USD,
  buildAi5ProviderEvidence,
  fetchCurrentKeyMetadata,
  validateAi5KeyMetadata,
} from './ai5-provider-acceptance.js';

function keyMetadata(overrides = {}) {
  return {
    limit: 2,
    limit_remaining: 2,
    limit_reset: null,
    usage: 0,
    usage_daily: 0,
    usage_weekly: 0,
    usage_monthly: 0,
    is_management_key: false,
    is_provisioning_key: false,
    expires_at: null,
    label: 'sk-or-v1-redacted...redacted',
    ...overrides,
  };
}

test('AI-5 accepts only a bounded lifetime-spend ordinary key and returns sanitized metadata', () => {
  assert.equal(AI5_MAX_KEY_LIMIT_USD, 5);
  const sanitized = validateAi5KeyMetadata(keyMetadata());

  assert.deepEqual(sanitized, {
    limitUsd: 2,
    limitRemainingUsd: 2,
    usageUsd: 0,
    limitReset: null,
    expiresAt: null,
  });
  assert.equal(JSON.stringify(sanitized).includes('sk-or-v1'), false);
});

test('AI-5 rejects uncapped, renewable, exhausted, management and provisioning keys', () => {
  const invalid = [
    keyMetadata({limit: null}),
    keyMetadata({limit: 5.01}),
    keyMetadata({limit_reset: 'monthly'}),
    keyMetadata({limit_remaining: 0}),
    keyMetadata({is_management_key: true}),
    keyMetadata({is_provisioning_key: true}),
  ];

  for (const metadata of invalid) {
    assert.throws(() => validateAi5KeyMetadata(metadata), /AI-5|limit|key|spend/i);
  }
});

test('current-key preflight is one bounded authenticated request and never returns credential material', async () => {
  const calls = [];
  const apiKey = 'sk-or-v1-unit-secret';
  const result = await fetchCurrentKeyMetadata({
    apiKey,
    fetchImpl: async (url, init) => {
      calls.push({url, init});
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

  assert.equal(calls.length, 1);
  assert.equal(JSON.stringify(result).includes(apiKey), false);
  assert.equal(result.limitUsd, 2);
});

test('current-key preflight never retries provider failures or exposes provider bodies', async () => {
  let calls = 0;
  await assert.rejects(
    fetchCurrentKeyMetadata({
      apiKey: 'sk-or-v1-unit-secret',
      fetchImpl: async () => {
        calls += 1;
        return new Response('sensitive upstream body', {status: 500});
      },
    }),
    (error) => {
      assert.match(error.message, /HTTP 500/);
      assert.doesNotMatch(error.message, /sensitive upstream body/);
      return true;
    },
  );
  assert.equal(calls, 1);
});

test('AI-5 evidence separates USD key spend delta from OpenRouter response cost credits', () => {
  const evidence = buildAi5ProviderEvidence({
    sourceCommit: 'a'.repeat(40),
    before: validateAi5KeyMetadata(keyMetadata({limit_remaining: 2, usage: 0.25})),
    after: validateAi5KeyMetadata(keyMetadata({limit_remaining: 1.998, usage: 0.252})),
    indexReport: {
      chunkCount: 42,
      refreshed: 42,
      reused: 0,
      corpusDigest: `sha256:${'b'.repeat(64)}`,
      embeddingsDigest: `sha256:${'c'.repeat(64)}`,
      sourceCommit: 'a'.repeat(40),
      provider: {requestCount: 1, latencyMs: 123, promptTokens: 5000, totalTokens: 5000, costCredits: 0.0001},
    },
    benchmarkReport: {
      caseCount: 50,
      refreshed: 50,
      reused: 0,
      benchmarkDigest: `sha256:${'d'.repeat(64)}`,
      embeddingsDigest: `sha256:${'e'.repeat(64)}`,
      sourceCommit: 'a'.repeat(40),
      provider: {requestCount: 1, latencyMs: 87, promptTokens: 400, totalTokens: 400, costCredits: 0.000008},
    },
  });

  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.publicAiMode, 'off');
  assert.equal(evidence.keyPolicy.maxAllowedLimitUsd, 5);
  assert.ok(Math.abs(evidence.keyAccounting.runUsageDeltaUsd - 0.002) < 1e-12);
  assert.equal(evidence.provider.documentEmbeddings.costCredits, 0.0001);
  assert.equal(evidence.provider.benchmarkQueries.costCredits, 0.000008);
  assert.equal(JSON.stringify(evidence).includes('Authorization'), false);
  assert.equal(JSON.stringify(evidence).includes('sk-or-v1'), false);
});
