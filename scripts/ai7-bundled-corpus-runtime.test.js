import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

import {handleRequest} from '../infra/cloudflare/ai-navigator-worker.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ACCEPTED_CORPUS_PATH = path.join(ROOT, 'data', 'ai-index-accepted', 'ai5', 'chunks.json');
const AI7_RUNTIME_PATH = path.join(ROOT, 'infra', 'cloudflare', 'ai-navigator-ai7-runtime.mjs');
const AI7_CONFIG_PATH = path.join(ROOT, 'infra', 'cloudflare', 'wrangler.ai7-full-canary.jsonc');
const CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ORIGIN = 'https://trueruslan.ru';
const CANARY_CHUNK_ID = 'ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment';

function env(overrides = {}) {
  return {
    AI_ENABLED: 'true',
    AI_ANSWER_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-secret-key',
    AI_ALLOWED_ORIGIN: ORIGIN,
    AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
    AI_EMBEDDING_DIMENSIONS: '512',
    AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
    ...overrides,
  };
}

function answerRequest(chunkId = CANARY_CHUNK_ID) {
  return new Request('https://ai7.example.workers.dev/v1/answer', {
    method: 'POST',
    headers: {Origin: ORIGIN, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      question: 'Почему успешный deployment ещё не означает production verification?',
      chunkIds: [chunkId],
    }),
  });
}

function providerResponse(chunkId = CANARY_CHUNK_ID) {
  return new Response(JSON.stringify({
    choices: [{message: {content: JSON.stringify({
      sufficientEvidence: true,
      answer: 'Deployment и production verification подтверждают разные уровни фактического состояния.',
      citations: [chunkId],
    })}}],
  }), {status: 200, headers: {'Content-Type': 'application/json'}});
}

test('accepted AI-5 corpus is a bounded repository-owned FULL grounding source', () => {
  const stat = fs.statSync(ACCEPTED_CORPUS_PATH);
  assert.ok(stat.size > 0);
  assert.ok(stat.size < 1_000_000, `accepted corpus unexpectedly grew to ${stat.size} bytes`);
  const corpus = JSON.parse(fs.readFileSync(ACCEPTED_CORPUS_PATH, 'utf8'));
  assert.equal(corpus.length, 327);
  assert.ok(corpus.some((chunk) => chunk.id === CANARY_CHUNK_ID));
});

test('explicit canonical corpus bypasses network corpus fetch and preserves strict grounded generation', async () => {
  const acceptedCorpus = JSON.parse(fs.readFileSync(ACCEPTED_CORPUS_PATH, 'utf8'));
  const calls = [];
  const response = await handleRequest(answerRequest(), env(), async (url) => {
    calls.push(String(url));
    if (String(url) === CHAT_URL) return providerResponse();
    throw new Error(`network corpus fetch forbidden: ${url}`);
  }, {canonicalCorpus: acceptedCorpus});

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    sufficientEvidence: true,
    answer: 'Deployment и production verification подтверждают разные уровни фактического состояния.',
    citations: [CANARY_CHUNK_ID],
  });
  assert.deepEqual(calls, [CHAT_URL]);
});

test('invalid explicit canonical corpus fails closed before any outbound request', async () => {
  let calls = 0;
  const response = await handleRequest(answerRequest(), env(), async () => {
    calls += 1;
    throw new Error('outbound request must not run');
  }, {canonicalCorpus: [{id: CANARY_CHUNK_ID}]});

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: 'Canonical AI corpus failed validation.',
    code: 'corpus_invalid',
  });
  assert.equal(calls, 0);
});

test('AI-7 provisioning uses a dedicated accepted-corpus runtime with no same-zone fetch override', () => {
  const config = JSON.parse(fs.readFileSync(AI7_CONFIG_PATH, 'utf8'));
  assert.equal(config.main, './ai-navigator-ai7-runtime.mjs');
  assert.ok(!Array.isArray(config.compatibility_flags)
    || !config.compatibility_flags.includes('global_fetch_strictly_public'));
  assert.equal('AI_CORPUS_ORIGIN' in config.env['ai7-full-canary'].vars, false);

  assert.equal(fs.existsSync(AI7_RUNTIME_PATH), true, 'dedicated AI-7 runtime must exist');
  const runtime = fs.readFileSync(AI7_RUNTIME_PATH, 'utf8');
  assert.match(runtime, /data\/ai-index-accepted\/ai5\/chunks\.json/);
  assert.match(runtime, /canonicalCorpus/);
});

test('dedicated AI-7 runtime injects accepted corpus and performs no corpus network request', async () => {
  const {handleRequest: handleAi7Request} = await import('../infra/cloudflare/ai-navigator-ai7-runtime.mjs');
  const calls = [];
  const response = await handleAi7Request(answerRequest(), env({AI_MODE: 'full'}), async (url) => {
    calls.push(String(url));
    if (String(url) === CHAT_URL) return providerResponse();
    throw new Error(`unexpected outbound request: ${url}`);
  });

  assert.equal(response.status, 200);
  assert.equal((await response.json()).sufficientEvidence, true);
  assert.deepEqual(calls, [CHAT_URL]);
});
