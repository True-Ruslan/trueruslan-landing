import test from 'node:test';
import assert from 'node:assert/strict';

import {handleRequest} from '../infra/cloudflare/ai-navigator-worker.mjs';

const ORIGIN = 'https://trueruslan.ru';
const CORPUS_URL = `${ORIGIN}/ai/chunks.json`;
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

function env(overrides = {}) {
  return {
    AI_ENABLED: 'true',
    AI_ANSWER_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ORIGIN,
    AI_CORPUS_ORIGIN: ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
    ...overrides,
  };
}

function answerRequest(body, {origin = ORIGIN, method = 'POST'} = {}) {
  const headers = new Headers({'Content-Type': 'application/json'});
  if (origin !== null) headers.set('Origin', origin);
  return new Request('https://ai.example.workers.dev/v1/answer', {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(body),
  });
}

function chunk(id, overrides = {}) {
  return {
    id,
    url: `/${id.includes(':note:') ? 'notes/example' : 'projects/example'}/`,
    sourcePath: 'docs/landing/example.md',
    title: 'Canonical public title',
    section: 'Intro',
    type: id.includes(':note:') ? 'note' : 'project',
    lang: id.startsWith('en:') ? 'en' : 'ru',
    text: 'Canonical source-owned public text about deterministic production verification, quality gates, and engineering evidence.',
    contentHash: `sha256:${'a'.repeat(64)}`,
    ...overrides,
  };
}

const CHUNKS = Object.freeze([
  chunk('ru:note:green-ci-is-not-product-verification:intro', {
    url: '/notes/green-ci-is-not-product-verification/',
    title: 'Почему green CI не означает verified product',
    text: 'Зелёный CI доказывает только ограниченный набор автоматизированных проверок. Production acceptance требует отдельного evidence и проверки развернутого артефакта.',
  }),
  chunk('ru:project:portfolio-platform:intro', {
    url: '/projects/portfolio-platform/',
    title: 'TrueRuslan Landing — Static-First Portfolio Platform',
    text: 'TrueRuslan Landing использует Diplodoc, GitHub Pages, generated-site integrity и deployment-driven production verification.',
  }),
]);

function responseWithUrl(body, {status = 200, url = CORPUS_URL, headers = {'Content-Type': 'application/json'}} = {}) {
  const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {status, headers});
  Object.defineProperty(response, 'url', {value: url});
  return response;
}

function providerResponse(value) {
  return new Response(JSON.stringify({
    choices: [{message: {content: JSON.stringify(value)}}],
  }), {status: 200, headers: {'Content-Type': 'application/json'}});
}

async function json(response) {
  return JSON.parse(await response.text());
}

function validBody(overrides = {}) {
  return {
    question: 'Почему green CI не означает production verification?',
    chunkIds: ['ru:note:green-ci-is-not-product-verification:intro'],
    ...overrides,
  };
}

test('answer route is POST-only and preserves exact-origin CORS policy', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; throw new Error('provider must not run'); };

  const method = await handleRequest(answerRequest(validBody(), {method: 'GET'}), env(), fetchImpl);
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'POST');
  assert.equal((await json(method)).code, 'method_not_allowed');

  const foreign = await handleRequest(answerRequest(validBody(), {origin: 'https://evil.example'}), env(), fetchImpl);
  assert.equal(foreign.status, 403);
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);
  assert.equal((await json(foreign)).code, 'origin_forbidden');
  assert.equal(calls, 0);
});

test('answer body accepts exactly question plus one to five unique stable chunk IDs', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; throw new Error('provider must not run'); };
  const invalidBodies = [
    {...validBody(), context: 'browser supplied untrusted context'},
    {...validBody(), messages: []},
    {...validBody(), model: 'evil/model'},
    {...validBody(), provider: {}},
    {question: '', chunkIds: validBody().chunkIds},
    {question: 'x'.repeat(501), chunkIds: validBody().chunkIds},
    {question: 'valid', chunkIds: []},
    {question: 'valid', chunkIds: Array.from({length: 6}, (_, index) => `ru:note:item-${index}:intro`)},
    {question: 'valid', chunkIds: ['ru:note:one:intro', 'ru:note:one:intro']},
    {question: 'valid', chunkIds: ['../../escape']},
  ];

  for (const body of invalidBodies) {
    const response = await handleRequest(answerRequest(body), env(), fetchImpl);
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.match((await json(response)).code, /invalid_(request|question|chunk_ids)/);
  }
  assert.equal(calls, 0);
});

test('Worker fetches canonical corpus itself and rejects unknown browser-selected chunk IDs before generation', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({url: String(url), init});
    if (String(url) === CORPUS_URL) return responseWithUrl(CHUNKS);
    throw new Error('chat provider must not be called for unknown chunk');
  };

  const response = await handleRequest(answerRequest(validBody({chunkIds: ['ru:note:unknown-note:intro']})), env(), fetchImpl);
  assert.equal(response.status, 400);
  assert.equal((await json(response)).code, 'unknown_chunk_id');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, CORPUS_URL);
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(calls[0].init.redirect, 'error');
});

test('canonical corpus trust boundary rejects redirect, malformed shape, duplicate IDs and unsafe canonical URLs', async () => {
  const fixtures = [
    responseWithUrl(CHUNKS, {url: 'https://evil.example/ai/chunks.json'}),
    responseWithUrl({chunks: CHUNKS}),
    responseWithUrl([CHUNKS[0], CHUNKS[0]]),
    responseWithUrl([chunk('ru:note:unsafe:intro', {url: 'https://evil.example/page/'})]),
    responseWithUrl([chunk('ru:note:bad-hash:intro', {contentHash: 'not-a-hash'})]),
  ];

  for (const fixture of fixtures) {
    let calls = 0;
    const response = await handleRequest(answerRequest(validBody()), env(), async (url) => {
      calls += 1;
      if (String(url) === CORPUS_URL) return fixture;
      throw new Error('provider must not be called for invalid corpus');
    });
    assert.equal(response.status, 502);
    assert.equal((await json(response)).code, 'corpus_invalid');
    assert.equal(calls, 1);
  }
});

test('grounded answer forwards only Worker-fetched canonical chunks with fixed privacy and strict JSON schema', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({url: String(url), init});
    if (String(url) === CORPUS_URL) return responseWithUrl(CHUNKS);
    if (String(url) === OPENROUTER_CHAT_URL) {
      return providerResponse({
        sufficientEvidence: true,
        answer: 'Green CI и production verification доказывают разные слои качества.',
        citations: ['ru:note:green-ci-is-not-product-verification:intro'],
      });
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const response = await handleRequest(answerRequest(validBody()), env(), fetchImpl);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), ORIGIN);
  assert.deepEqual(await json(response), {
    sufficientEvidence: true,
    answer: 'Green CI и production verification доказывают разные слои качества.',
    citations: ['ru:note:green-ci-is-not-product-verification:intro'],
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, CORPUS_URL);
  assert.equal(calls[1].url, OPENROUTER_CHAT_URL);

  const outbound = JSON.parse(calls[1].init.body);
  assert.equal(outbound.model, 'google/gemini-2.5-flash-lite');
  assert.equal(outbound.max_tokens, 700);
  assert.equal(outbound.stream, false);
  assert.deepEqual(outbound.provider, {
    zdr: true,
    data_collection: 'deny',
    require_parameters: true,
  });
  assert.deepEqual(outbound.response_format, {
    type: 'json_schema',
    json_schema: {
      name: 'trueruslan_grounded_answer',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          sufficientEvidence: {type: 'boolean'},
          answer: {type: 'string'},
          citations: {type: 'array', items: {type: 'string'}, maxItems: 5},
        },
        required: ['sufficientEvidence', 'answer', 'citations'],
        additionalProperties: false,
      },
    },
  });
  assert.equal('tools' in outbound, false);
  assert.equal(outbound.messages.length, 2);
  assert.equal(outbound.messages[0].role, 'system');
  assert.match(outbound.messages[0].content, /only.*provided|только.*источник/i);
  assert.match(outbound.messages[0].content, /world knowledge|внешн/i);
  assert.match(outbound.messages[0].content, /do not.*browse|не.*брауз/i);
  assert.equal(outbound.messages[1].role, 'user');
  assert.match(outbound.messages[1].content, /<source id="ru:note:green-ci-is-not-product-verification:intro">/);
  assert.match(outbound.messages[1].content, /Зелёный CI доказывает только ограниченный набор/);
  assert.doesNotMatch(outbound.messages[1].content, /browser supplied untrusted context/);
  assert.ok(calls[1].init.signal instanceof AbortSignal);
});

test('answer request includes only selected canonical chunks and enforces bounded context before provider call', async () => {
  const oversized = chunk('ru:note:oversized:intro', {text: 'x'.repeat(18001)});
  let calls = 0;
  const response = await handleRequest(
    answerRequest(validBody({chunkIds: [oversized.id]})),
    env(),
    async (url) => {
      calls += 1;
      if (String(url) === CORPUS_URL) return responseWithUrl([oversized]);
      throw new Error('provider must not be called for oversized context');
    },
  );
  assert.equal(response.status, 400);
  assert.equal((await json(response)).code, 'context_too_large');
  assert.equal(calls, 1);
});

test('provider citations must be a subset of selected canonical chunks and sufficient answers must be bounded', async () => {
  const invalidOutputs = [
    {
      value: {sufficientEvidence: true, answer: 'Invented', citations: ['ru:project:portfolio-platform:intro']},
      code: 'provider_invalid_response',
    },
    {
      value: {sufficientEvidence: true, answer: '', citations: ['ru:note:green-ci-is-not-product-verification:intro']},
      code: 'provider_invalid_response',
    },
    {
      value: {sufficientEvidence: true, answer: 'word '.repeat(451), citations: ['ru:note:green-ci-is-not-product-verification:intro']},
      code: 'provider_invalid_response',
    },
    {
      value: {sufficientEvidence: false, answer: 'But here is a guessed salary.', citations: []},
      code: 'provider_invalid_response',
    },
  ];

  for (const item of invalidOutputs) {
    let calls = 0;
    const response = await handleRequest(answerRequest(validBody()), env(), async (url) => {
      calls += 1;
      if (String(url) === CORPUS_URL) return responseWithUrl(CHUNKS);
      return providerResponse(item.value);
    });
    assert.equal(response.status, 502);
    assert.equal((await json(response)).code, item.code);
    assert.equal(calls, 2);
  }
});

test('valid insufficient-evidence response is normalized to empty answer and citations', async () => {
  const response = await handleRequest(answerRequest(validBody()), env(), async (url) => {
    if (String(url) === CORPUS_URL) return responseWithUrl(CHUNKS);
    return providerResponse({sufficientEvidence: false, answer: '', citations: []});
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await json(response), {sufficientEvidence: false, answer: '', citations: []});
});

test('answer provider failures are sanitized and never retried', async () => {
  for (const status of [400, 401, 402, 429, 500, 503]) {
    let providerCalls = 0;
    const response = await handleRequest(answerRequest(validBody()), env(), async (url) => {
      if (String(url) === CORPUS_URL) return responseWithUrl(CHUNKS);
      providerCalls += 1;
      return new Response(`sensitive-answer-provider-body-${status}`, {status});
    });
    assert.equal(response.status, status === 429 ? 429 : (status >= 500 ? 502 : status));
    const body = await response.text();
    assert.doesNotMatch(body, /sensitive-answer-provider-body|test-secret-key/);
    assert.match(body, /provider_/);
    assert.equal(providerCalls, 1);
  }
});
