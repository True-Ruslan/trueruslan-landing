import test from 'node:test';
import assert from 'node:assert/strict';

import {handleRequest} from '../infra/cloudflare/ai-navigator-worker.mjs';

const ALLOWED_ORIGIN = 'https://trueruslan.ru';

function env() {
  return {
    AI_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ALLOWED_ORIGIN,
    AI_CORPUS_ORIGIN: ALLOWED_ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
  };
}

function preflight(path, origin = ALLOWED_ORIGIN) {
  return new Request(`https://ai.example.workers.dev${path}`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
}

test('allowed browser preflight succeeds for both AI POST routes without provider access', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; throw new Error('preflight must not call outbound fetch'); };

  for (const path of ['/v1/embed', '/v1/answer']) {
    const response = await handleRequest(preflight(path), env(), fetchImpl);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), ALLOWED_ORIGIN);
    assert.equal(response.headers.get('access-control-allow-methods'), 'POST');
    assert.equal(response.headers.get('access-control-allow-headers'), 'Content-Type');
    assert.equal(response.headers.get('vary'), 'Origin');
    assert.notEqual(response.headers.get('access-control-allow-origin'), '*');
  }
  assert.equal(calls, 0);
});

test('preflight remains exact-origin and fail-closed for unsupported routes or methods', async () => {
  const fetchImpl = async () => { throw new Error('preflight must not call outbound fetch'); };

  const foreign = await handleRequest(preflight('/v1/embed', 'https://evil.example'), env(), fetchImpl);
  assert.equal(foreign.status, 403);
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);

  const missing = await handleRequest(preflight('/v1/unknown'), env(), fetchImpl);
  assert.equal(missing.status, 404);

  const wrongMethod = new Request('https://ai.example.workers.dev/v1/embed', {
    method: 'OPTIONS',
    headers: {
      Origin: ALLOWED_ORIGIN,
      'Access-Control-Request-Method': 'DELETE',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  const rejected = await handleRequest(wrongMethod, env(), fetchImpl);
  assert.equal(rejected.status, 405);
  assert.equal(rejected.headers.get('access-control-allow-origin'), null);
});
