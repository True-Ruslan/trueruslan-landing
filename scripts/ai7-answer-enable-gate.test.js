import test from 'node:test';
import assert from 'node:assert/strict';

import {handleRequest} from '../infra/cloudflare/ai-navigator-worker.mjs';

const ORIGIN = 'https://trueruslan.ru';

function env(overrides = {}) {
  return {
    AI_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ORIGIN,
    AI_CORPUS_ORIGIN: ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
    ...overrides,
  };
}

function answerRequest() {
  return new Request('https://ai.example.workers.dev/v1/answer', {
    method: 'POST',
    headers: {
      Origin: ORIGIN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: 'Почему green CI недостаточно?',
      chunkIds: ['ru:note:green-ci-is-not-product-verification:intro'],
    }),
  });
}

async function body(response) {
  return JSON.parse(await response.text());
}

test('answer route stays disabled unless AI_ANSWER_ENABLED is exactly true', async () => {
  for (const AI_ANSWER_ENABLED of [undefined, '', 'false', 'TRUE', '1']) {
    let externalCalls = 0;
    const response = await handleRequest(
      answerRequest(),
      env(AI_ANSWER_ENABLED === undefined ? {} : {AI_ANSWER_ENABLED}),
      async () => {
        externalCalls += 1;
        throw new Error('disabled answer route must not fetch corpus or provider');
      },
    );

    assert.equal(response.status, 503, `AI_ANSWER_ENABLED=${String(AI_ANSWER_ENABLED)}`);
    assert.equal((await body(response)).code, 'feature_disabled');
    assert.equal(externalCalls, 0);
  }
});
