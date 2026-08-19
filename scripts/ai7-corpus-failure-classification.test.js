import test from 'node:test';
import assert from 'node:assert/strict';

import {handleRequest} from '../infra/cloudflare/ai-navigator-worker.mjs';

const ORIGIN = 'https://trueruslan.ru';
const CORPUS_URL = `${ORIGIN}/ai/chunks.json`;
const BODY = {
  question: 'Почему успешный deployment ещё не означает production verification?',
  chunkIds: ['ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment'],
};

function env() {
  return {
    AI_ENABLED: 'true',
    AI_ANSWER_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ORIGIN,
    AI_CORPUS_ORIGIN: ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
  };
}

function request() {
  return new Request('https://ai7.example.workers.dev/v1/answer', {
    method: 'POST',
    headers: {Origin: ORIGIN, 'Content-Type': 'application/json'},
    body: JSON.stringify(BODY),
  });
}

async function payload(response) {
  return JSON.parse(await response.text());
}

test('AI-7 corpus transport exceptions use a bounded sanitized failure code', async () => {
  const response = await handleRequest(request(), env(), async (url) => {
    assert.equal(String(url), CORPUS_URL);
    throw new Error('sensitive-origin-detail.example internal transport text');
  });

  assert.equal(response.status, 502);
  assert.deepEqual(await payload(response), {
    error: 'Canonical AI corpus is temporarily unavailable.',
    code: 'corpus_fetch_failed',
  });
});

test('AI-7 corpus non-2xx responses expose only the bounded HTTP status code', async () => {
  for (const status of [403, 404, 429, 500, 503]) {
    const response = await handleRequest(request(), env(), async (url) => {
      assert.equal(String(url), CORPUS_URL);
      return new Response('provider body must never be forwarded: sk-or-secret-like-value', {
        status,
        headers: {'Content-Type': 'text/plain'},
      });
    });

    assert.equal(response.status, 502);
    const value = await payload(response);
    assert.deepEqual(value, {
      error: 'Canonical AI corpus is temporarily unavailable.',
      code: `corpus_http_${status}`,
    });
    assert.doesNotMatch(JSON.stringify(value), /sk-or-|provider body|trueruslan\.ru/iu);
  }
});
