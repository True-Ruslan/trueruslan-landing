import test from 'node:test';
import assert from 'node:assert/strict';

import {handleRequest} from '../infra/cloudflare/ai-navigator-runtime.mjs';

const ORIGIN = 'https://trueruslan.ru';

function env(mode) {
  return {
    AI_ENABLED: 'true',
    AI_MODE: mode,
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ORIGIN,
    AI_CORPUS_ORIGIN: ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
  };
}

function request(path, body) {
  return new Request(`https://ai.example.workers.dev${path}`, {
    method: 'POST',
    headers: {
      Origin: ORIGIN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function embeddingResponse() {
  return new Response(JSON.stringify({
    data: [{index: 0, embedding: Array.from({length: 512}, (_, index) => index / 512)}],
  }), {status: 200, headers: {'Content-Type': 'application/json'}});
}

async function payload(response) {
  return JSON.parse(await response.text());
}

test('search mode allows embed and blocks answer before any upstream request', async () => {
  let embedCalls = 0;
  const embedFetch = async () => {
    embedCalls += 1;
    return embeddingResponse();
  };

  const embedded = await handleRequest(
    request('/v1/embed', {query: 'production verification'}),
    env('search'),
    embedFetch,
  );
  assert.equal(embedded.status, 200);
  assert.equal(embedCalls, 1);

  let answerCalls = 0;
  const answerFetch = async () => {
    answerCalls += 1;
    throw new Error('SEARCH mode must not reach corpus or answer provider');
  };
  const answered = await handleRequest(
    request('/v1/answer', {
      question: 'What is production verification?',
      chunkIds: ['en:note:green-ci-is-not-product-verification:intro'],
    }),
    env('search'),
    answerFetch,
  );
  assert.equal(answered.status, 503);
  assert.deepEqual(await payload(answered), {
    error: 'AI answer feature is disabled.',
    code: 'feature_disabled',
  });
  assert.equal(answerCalls, 0);
});

test('off, absent and invalid runtime modes fail closed even when legacy AI_ENABLED is true', async () => {
  for (const mode of ['off', undefined, 'enabled']) {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      throw new Error('disabled runtime must not reach provider');
    };
    const response = await handleRequest(
      request('/v1/embed', {query: 'production verification'}),
      env(mode),
      fetchImpl,
    );
    assert.equal(response.status, 503, `mode ${String(mode)} must be disabled`);
    assert.equal((await payload(response)).code, 'feature_disabled');
    assert.equal(calls, 0);
  }
});

test('legacy AI_ENABLED remains a global kill switch for search and full modes', async () => {
  for (const mode of ['search', 'full']) {
    let calls = 0;
    const disabledEnv = {...env(mode), AI_ENABLED: 'false'};
    const response = await handleRequest(
      request('/v1/embed', {query: 'production verification'}),
      disabledEnv,
      async () => {
        calls += 1;
        throw new Error('global kill switch must prevent provider calls');
      },
    );
    assert.equal(response.status, 503);
    assert.equal((await payload(response)).code, 'feature_disabled');
    assert.equal(calls, 0);
  }
});
