import test from 'node:test';
import assert from 'node:assert/strict';

import {handleRequest} from '../infra/cloudflare/ai-navigator-worker.mjs';

const ALLOWED_ORIGIN = 'https://trueruslan.ru';
const VECTOR = Object.freeze(Array.from({length: 512}, (_, index) => (index + 1) / 1000));

function env(overrides = {}) {
  return {
    AI_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ALLOWED_ORIGIN,
    AI_CORPUS_ORIGIN: ALLOWED_ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
    ...overrides,
  };
}

function request(path = '/v1/embed', {
  method = 'POST',
  origin = ALLOWED_ORIGIN,
  body = {query: 'Spring Boot Kafka'},
  contentType = 'application/json',
} = {}) {
  const headers = new Headers();
  if (origin !== null) headers.set('Origin', origin);
  if (contentType !== null) headers.set('Content-Type', contentType);
  return new Request(`https://ai.example.workers.dev${path}`, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
  });
}

async function json(response) {
  return JSON.parse(await response.text());
}

function providerSuccess(vector = VECTOR) {
  return new Response(JSON.stringify({
    data: [{index: 0, embedding: vector}],
    model: 'openai/text-embedding-3-small',
  }), {
    status: 200,
    headers: {'Content-Type': 'application/json'},
  });
}

test('embed route permits POST only and unknown routes stay 404 without provider calls', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return providerSuccess(); };

  const method = await handleRequest(request('/v1/embed', {method: 'GET'}), env(), fetchImpl);
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'POST');
  assert.equal((await json(method)).code, 'method_not_allowed');

  const missing = await handleRequest(request('/v1/unknown'), env(), fetchImpl);
  assert.equal(missing.status, 404);
  assert.equal((await json(missing)).code, 'not_found');
  assert.equal(calls, 0);
});

test('feature disabled and missing provider key fail before any outbound request', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return providerSuccess(); };

  const disabled = await handleRequest(request(), env({AI_ENABLED: 'false'}), fetchImpl);
  assert.equal(disabled.status, 503);
  assert.equal((await json(disabled)).code, 'feature_disabled');

  const unconfigured = await handleRequest(request(), env({OPENROUTER_API_KEY: ''}), fetchImpl);
  assert.equal(unconfigured.status, 503);
  assert.equal((await json(unconfigured)).code, 'provider_unconfigured');
  assert.equal(calls, 0);
});

test('origin policy is exact and CORS never emits wildcard', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return providerSuccess(); };

  const foreign = await handleRequest(request('/v1/embed', {origin: 'https://evil.example'}), env(), fetchImpl);
  assert.equal(foreign.status, 403);
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);
  assert.equal((await json(foreign)).code, 'origin_forbidden');
  assert.equal(calls, 0);

  const allowed = await handleRequest(request(), env(), fetchImpl);
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), ALLOWED_ORIGIN);
  assert.notEqual(allowed.headers.get('access-control-allow-origin'), '*');
});

test('embed request accepts JSON with exactly one bounded query field', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return providerSuccess(); };

  for (const invalid of [
    {request: request('/v1/embed', {contentType: 'text/plain'}), code: 'unsupported_media_type'},
    {request: request('/v1/embed', {body: '{broken'}), code: 'invalid_json'},
    {request: request('/v1/embed', {body: {query: ''}}), code: 'invalid_query'},
    {request: request('/v1/embed', {body: {query: ' '.repeat(3)}}), code: 'invalid_query'},
    {request: request('/v1/embed', {body: {query: 'x'.repeat(501)}}), code: 'invalid_query'},
    {request: request('/v1/embed', {body: {query: 'valid', model: 'evil/model'}}), code: 'invalid_request'},
    {request: request('/v1/embed', {body: {query: 'valid', dimensions: 1}}), code: 'invalid_request'},
    {request: request('/v1/embed', {body: {query: 'valid', provider: {}}}), code: 'invalid_request'},
  ]) {
    const response = await handleRequest(invalid.request, env(), fetchImpl);
    assert.equal(response.status, invalid.code === 'unsupported_media_type' ? 415 : 400);
    assert.equal((await json(response)).code, invalid.code);
  }
  assert.equal(calls, 0);
});

test('embed forwards one exact pinned privacy-preserving OpenRouter request', async () => {
  let calls = 0;
  let captured = null;
  const fetchImpl = async (url, init) => {
    calls += 1;
    captured = {url: String(url), init};
    return providerSuccess();
  };

  const response = await handleRequest(request('/v1/embed', {body: {query: '  Spring Boot Kafka  '}}), env(), fetchImpl);
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.equal(captured.url, 'https://openrouter.ai/api/v1/embeddings');
  assert.equal(captured.init.method, 'POST');
  assert.equal(captured.init.headers.Authorization, 'Bearer test-secret-key');
  assert.equal(captured.init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(captured.init.body), {
    model: 'openai/text-embedding-3-small',
    dimensions: 512,
    input_type: 'search_query',
    input: 'Spring Boot Kafka',
    provider: {
      zdr: true,
      data_collection: 'deny',
    },
  });
  assert.ok(captured.init.signal instanceof AbortSignal);

  const payload = await json(response);
  assert.equal(payload.model, 'openai/text-embedding-3-small');
  assert.equal(payload.dimensions, 512);
  assert.deepEqual(payload.embedding, VECTOR);
});

test('invalid provider vectors and provider failures are sanitized and never retried', async () => {
  let badVectorCalls = 0;
  const badVector = await handleRequest(request(), env(), async () => {
    badVectorCalls += 1;
    return providerSuccess([1, 2, 3]);
  });
  assert.equal(badVector.status, 502);
  assert.equal((await json(badVector)).code, 'provider_invalid_response');
  assert.equal(badVectorCalls, 1);

  for (const status of [400, 401, 402, 429, 500, 503]) {
    let calls = 0;
    const response = await handleRequest(request(), env(), async () => {
      calls += 1;
      return new Response(`sensitive-provider-body-${status}`, {status});
    });
    assert.equal(response.status, status === 429 ? 429 : (status >= 500 ? 502 : status));
    const body = await response.text();
    assert.doesNotMatch(body, /sensitive-provider-body/);
    assert.doesNotMatch(body, /test-secret-key/);
    assert.match(body, /provider_/);
    assert.equal(calls, 1);
  }
});
