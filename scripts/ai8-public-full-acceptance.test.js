import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {
  AI8_MAX_KEY_LIMIT_USD,
  AI8_MAX_RUN_SPEND_USD,
  AI8_SUFFICIENT_CHUNK_ID,
  buildAi8Evidence,
  parseDeployedAiConfig,
  probeAi8PublicFull,
  runAi8PublicFullAcceptance,
  validateAi8KeyMetadata,
} from './ai8-public-full-acceptance.js';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCTION_WORKER = 'https://trueruslan-ai-navigator-ai8-full-production.example.workers.dev';
const DEPLOYED_PRODUCTION_WORKER = 'https://trueruslan-ai-navigator-ai8-full-production.trueruslan.workers.dev';
const ACCEPTED_SEARCH_WORKER = 'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev';
const PUBLIC_SEARCH_URL = 'https://trueruslan.ru/_search/ru/';
const MODEL = 'test/embedding-model';

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {status, headers: {'Content-Type': 'application/json', ...headers}});
}

function fullConfigHtml() {
  return `<!doctype html><html><body><script id="tr-ai-search-config" type="application/json">${JSON.stringify({
    mode: 'full', workerBaseUrl: PRODUCTION_WORKER, embeddingDimensions: 2, maxResults: 5,
    hybridWeights: {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05},
  })}</script></body></html>`;
}

function fixtures() {
  return {
    rankingConfig: {maxResults: 5, hybridWeights: {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05}},
    chunks: [
      {id: AI8_SUFFICIENT_CHUNK_ID, lang: 'ru', title: 'Deployment success is not production verification', section: 'Что изменилось', text: 'После deployment нужно отдельно проверять production verification и реальный пользовательский маршрут.'},
      {id: 'ru:page:about:about', lang: 'ru', title: 'Обо мне', section: 'Обо мне', text: 'Backend-разработка и инженерные проекты.'},
    ],
    embeddings: [[1, 0], [0, 1]],
  };
}

function successfulFetch() {
  return async (url, init = {}) => {
    const target = String(url);
    if (target === PUBLIC_SEARCH_URL) return new Response(fullConfigHtml(), {status: 200, headers: {'Content-Type': 'text/html'}});
    if (target === `${PRODUCTION_WORKER}/v1/answer` && init.method === 'OPTIONS') {
      return new Response(null, {status: 204, headers: {
        'Access-Control-Allow-Origin': 'https://trueruslan.ru', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type',
      }});
    }
    if (target === `${PRODUCTION_WORKER}/v1/answer` && init.headers?.Origin === 'https://example.invalid') {
      return jsonResponse({error: 'Origin is not allowed.', code: 'origin_forbidden'}, 403);
    }
    if (target === `${PRODUCTION_WORKER}/v1/embed`) return jsonResponse({model: MODEL, dimensions: 2, embedding: [1, 0]});
    if (target === `${PRODUCTION_WORKER}/v1/answer`) {
      const body = JSON.parse(init.body);
      if (body.question.includes('любимый фильм')) return jsonResponse({sufficientEvidence: false, answer: '', citations: []});
      return jsonResponse({
        sufficientEvidence: true,
        answer: 'Deployment подтверждает выкладку, а production verification отдельно проверяет реальный результат.',
        citations: [AI8_SUFFICIENT_CHUNK_ID],
      });
    }
    throw new Error(`unexpected test request ${target}`);
  };
}

test('AI-8 production key policy stays ordinary, lifetime-capped and bounded', () => {
  const accepted = validateAi8KeyMetadata({limit: AI8_MAX_KEY_LIMIT_USD, limit_remaining: 1, limit_reset: null, usage: 0.25, is_management_key: false, is_provisioning_key: false});
  assert.equal(accepted.limitUsd, AI8_MAX_KEY_LIMIT_USD);
  assert.throws(() => validateAi8KeyMetadata({limit: AI8_MAX_KEY_LIMIT_USD + 0.01, limit_remaining: 1, limit_reset: null, usage: 0}));
  assert.throws(() => validateAi8KeyMetadata({limit: 1, limit_remaining: 1, limit_reset: 'monthly', usage: 0}));
  assert.throws(() => validateAi8KeyMetadata({limit: 1, limit_remaining: 1, limit_reset: null, usage: 0, is_management_key: true}));
  assert.throws(() => validateAi8KeyMetadata({limit: 1, limit_remaining: 0, limit_reset: null, usage: 1}));
});

test('deployed config parser reads the bounded FULL runtime surface', () => {
  const config = parseDeployedAiConfig(fullConfigHtml());
  assert.equal(config.mode, 'full');
  assert.equal(config.workerBaseUrl, PRODUCTION_WORKER);
  assert.equal(config.embeddingDimensions, 2);
  assert.throws(() => parseDeployedAiConfig('<html><body>missing</body></html>'));
});

test('AI-8 production probe proves CORS, semantic SEARCH, grounded answer and insufficiency', async () => {
  const report = await probeAi8PublicFull({workerBaseUrl: PRODUCTION_WORKER, embeddingModel: MODEL, embeddingDimensions: 2, ...fixtures(), fetchImpl: successfulFetch()});
  assert.match(report.publicWorkerOriginDigest, /^sha256:[a-f0-9]{64}$/);
  assert.match(report.deployedConfigDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(report.embedding.dimensions, 2);
  assert.equal(report.searchRegression.topResultCount, 2);
  assert.equal(report.sufficientAnswer.sufficientEvidence, true);
  assert.deepEqual(report.sufficientAnswer.citations, [AI8_SUFFICIENT_CHUNK_ID]);
  assert.equal(report.insufficientAnswer.sufficientEvidence, false);
});

test('AI-8 Worker failures expose only bounded status and code', async () => {
  const fetchImpl = async (url, init = {}) => {
    if (String(url) === PUBLIC_SEARCH_URL) return new Response(fullConfigHtml(), {status: 200});
    if (init.method === 'OPTIONS') return new Response(null, {status: 204, headers: {'Access-Control-Allow-Origin': 'https://trueruslan.ru', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type'}});
    if (init.headers?.Origin === 'https://example.invalid') return jsonResponse({code: 'origin_forbidden'}, 403);
    if (String(url).endsWith('/v1/embed')) return jsonResponse({code: 'provider_failure', error: 'secret provider body'}, 502);
    throw new Error('unexpected request');
  };
  await assert.rejects(
    probeAi8PublicFull({workerBaseUrl: PRODUCTION_WORKER, embeddingModel: MODEL, embeddingDimensions: 2, ...fixtures(), fetchImpl}),
    (error) => {
      assert.match(error.message, /HTTP 502 code=provider_failure/);
      assert.doesNotMatch(error.message, /secret provider body/);
      return true;
    },
  );
});

test('AI-8 evidence is sanitized and fails closed on excess spend or unexpected requests', () => {
  const probeReport = {searchRegression: {topResultCount: 1}, sufficientAnswer: {sufficientEvidence: true}, insufficientAnswer: {sufficientEvidence: false}};
  const before = {limitUsd: 2, limitRemainingUsd: 1.5, usageUsd: 0.5, limitReset: null};
  const after = {limitUsd: 2, limitRemainingUsd: 1.49, usageUsd: 0.51, limitReset: null};
  const evidence = buildAi8Evidence({sourceCommit: 'a'.repeat(40), before, after, probeReport});
  assert.equal(evidence.publicAiMode, 'full');
  assert.equal(evidence.publicFullActivated, true);
  assert.equal(evidence.sanitized, true);
  assert.equal(evidence.runtime.clientUnexpectedExternalRequests, 0);
  assert.throws(() => buildAi8Evidence({sourceCommit: 'a'.repeat(40), before, after: {...after, usageUsd: before.usageUsd + AI8_MAX_RUN_SPEND_USD + 0.001}, probeReport}));
  assert.throws(() => buildAi8Evidence({sourceCommit: 'a'.repeat(40), before, after, probeReport, clientUnexpectedExternalRequests: 1}));
});

test('activated repository config targets only the dedicated AI-8 production Worker', () => {
  const config = JSON.parse(fs.readFileSync(path.join(REPOSITORY_ROOT, 'data', 'ai-navigator.json'), 'utf8'));
  assert.equal(config.mode, 'full');
  assert.equal(config.workerBaseUrl, DEPLOYED_PRODUCTION_WORKER);
  assert.notEqual(config.workerBaseUrl, ACCEPTED_SEARCH_WORKER);
});

test('PREPARATION cannot run live acceptance from an explicit SEARCH repository fixture', async () => {
  const currentConfig = JSON.parse(fs.readFileSync(path.join(REPOSITORY_ROOT, 'data', 'ai-navigator.json'), 'utf8'));
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai8-search-fixture-'));
  fs.mkdirSync(path.join(rootDir, 'data'), {recursive: true});
  fs.writeFileSync(path.join(rootDir, 'data', 'ai-navigator.json'), `${JSON.stringify({
    ...currentConfig,
    mode: 'search',
    workerBaseUrl: ACCEPTED_SEARCH_WORKER,
  }, null, 2)}\n`, 'utf8');

  let calls = 0;
  try {
    await assert.rejects(
      runAi8PublicFullAcceptance({rootDir, workerBaseUrl: DEPLOYED_PRODUCTION_WORKER, apiKey: 'not-used', sourceCommit: 'a'.repeat(40), fetchImpl: async () => { calls += 1; throw new Error('network must not be reached'); }}),
      /already-activated FULL repository config/,
    );
    assert.equal(calls, 0);
  } finally {
    fs.rmSync(rootDir, {recursive: true, force: true});
  }
});
