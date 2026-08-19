import assert from 'node:assert/strict';
import test from 'node:test';

import {handleRequest} from '../infra/cloudflare/ai-navigator-ai8-runtime.mjs';

const ENV = Object.freeze({
  AI_ENABLED: 'true',
  AI_MODE: 'full',
  AI_ANSWER_ENABLED: 'true',
  AI_ALLOWED_ORIGIN: 'https://trueruslan.ru',
  AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
  AI_EMBEDDING_DIMENSIONS: '512',
  AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
  OPENROUTER_API_KEY: 'not-used',
});

test('AI-8 runtime wrapper loads the bundled accepted corpus and rejects forbidden origins before provider access', async () => {
  let providerCalls = 0;
  const request = new Request('https://ai8.example.test/v1/answer', {
    method: 'POST',
    headers: {
      Origin: 'https://example.invalid',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: 'Почему успешный deployment ещё не означает production verification?',
      chunkIds: ['ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment'],
    }),
  });

  const response = await handleRequest(request, ENV, async () => {
    providerCalls += 1;
    throw new Error('provider must not be reached');
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: 'Origin is not allowed.',
    code: 'origin_forbidden',
  });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(providerCalls, 0);
});
