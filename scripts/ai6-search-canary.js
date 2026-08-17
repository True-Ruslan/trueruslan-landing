import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadBenchmark} from './ai-benchmark.js';
import {verifyBenchmarkQueryEmbeddings} from './ai-benchmark-embeddings.js';
import {loadAiConfig} from './ai-config.js';
import {buildAiCorpus} from './ai-corpus.js';

const OPENROUTER_CURRENT_KEY_URL = 'https://openrouter.ai/api/v1/key';
const REQUEST_TIMEOUT_MS = 10_000;
const AI6_MAX_KEY_LIMIT_USD = 2;
const AI6_MAX_RUN_SPEND_USD = 0.01;
export const AI6_MIN_REFERENCE_COSINE = 0.999;
export const AI6_PROBE_CASE_IDS = Object.freeze([
  'ru-exact-ai-npc',
  'ru-paraphrase-production-proof',
  'en-platform',
]);

export const AI5_ACCEPTED = Object.freeze({
  sourceCommit: 'f02cfff534ca5a1e251981827a0b886a6c5ec112',
  corpusDigest: 'sha256:1249ed898193d1a05bda632b1328a860909887a1700092ba38e612ac7e6ac17a',
  embeddingsDigest: 'sha256:aaf2c7ba86a53f0ff040e63c2c75decbf538a84d6c54c1da0e44f124b199510a',
  benchmarkDigest: 'sha256:879ceffdfc7845dd7c558f9e308d53f981001ef29d804fd86b4112c22358a4ed',
  queryEmbeddingsDigest: 'sha256:4490e074dbaefcfb2e58bacfc9af7655a1a2b342832e805f83126922a7f075ea',
});

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}

function finiteNumber(value, label, {positive = false} = {}) {
  if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
    throw new Error(`AI-6 ${label} must be a ${positive ? 'positive' : 'non-negative'} finite number`);
  }
  return value;
}

export function validateAi6KeyMetadata(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('AI-6 current-key metadata must be an object');
  }
  if (data.is_management_key === true || data.is_provisioning_key === true) {
    throw new Error('AI-6 requires an ordinary non-management, non-provisioning API key');
  }
  const limitUsd = finiteNumber(data.limit, 'key spending limit', {positive: true});
  if (limitUsd > AI6_MAX_KEY_LIMIT_USD) {
    throw new Error(`AI-6 key spending limit must not exceed $${AI6_MAX_KEY_LIMIT_USD}`);
  }
  if (data.limit_reset !== null) {
    throw new Error('AI-6 key spending limit must be lifetime-bounded with no automatic reset');
  }
  const limitRemainingUsd = finiteNumber(data.limit_remaining, 'remaining key spend', {positive: true});
  if (limitRemainingUsd > limitUsd) throw new Error('AI-6 remaining key spend cannot exceed the configured hard limit');
  const usageUsd = finiteNumber(data.usage, 'key usage');
  return Object.freeze({limitUsd, limitRemainingUsd, usageUsd, limitReset: null});
}

export async function fetchAi6KeyMetadata({apiKey, fetchImpl = globalThis.fetch}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('OPENROUTER_AI6_API_KEY is required');
  let response;
  try {
    response = await fetchImpl(OPENROUTER_CURRENT_KEY_URL, {
      method: 'GET',
      headers: {Authorization: `Bearer ${apiKey.trim()}`},
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error('AI-6 OpenRouter current-key metadata request failed');
  }
  if (!response?.ok) throw new Error(`AI-6 OpenRouter current-key metadata HTTP ${response?.status ?? 'unknown'}`);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('AI-6 OpenRouter current-key metadata returned invalid JSON');
  }
  return validateAi6KeyMetadata(payload?.data);
}

export function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length === 0 || left.length !== right.length) {
    throw new Error('AI-6 cosine vectors must have the same non-zero dimension');
  }
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('AI-6 cosine vectors must contain finite values');
    dot += a * b;
    leftNorm += a * a;
    rightNorm += b * b;
  }
  if (leftNorm === 0 || rightNorm === 0) throw new Error('AI-6 cosine vectors must have non-zero magnitude');
  return dot / Math.sqrt(leftNorm * rightNorm);
}

function workerOrigin(workerBaseUrl) {
  if (typeof workerBaseUrl !== 'string' || !workerBaseUrl.trim()) throw new Error('AI6_SEARCH_WORKER_BASE_URL is required');
  const url = new URL(workerBaseUrl.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('AI-6 Worker base URL must be a clean HTTPS origin');
  }
  return url.origin;
}

async function responseJson(response, label) {
  try {
    return await response.json();
  } catch {
    throw new Error(`AI-6 ${label} returned invalid JSON`);
  }
}

async function timedFetch(fetchImpl, url, init, label) {
  const started = performance.now();
  let response;
  try {
    response = await fetchImpl(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error(`AI-6 ${label} request failed`);
  }
  return {response, latencyMs: Math.max(0, Math.round(performance.now() - started))};
}

function validateEmbeddingPayload(payload, config, label) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error(`AI-6 ${label} payload is invalid`);
  if (payload.model !== config.embeddingModel || payload.dimensions !== config.embeddingDimensions) {
    throw new Error(`AI-6 ${label} model or dimension mismatch`);
  }
  if (!Array.isArray(payload.embedding)
    || payload.embedding.length !== config.embeddingDimensions
    || !payload.embedding.every(Number.isFinite)) {
    throw new Error(`AI-6 ${label} embedding is invalid`);
  }
  return payload.embedding;
}

export async function probeSearchWorker({
  workerBaseUrl,
  origin,
  config,
  probes,
  referenceVectors,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof fetchImpl !== 'function') throw new Error('AI-6 canary requires fetchImpl');
  if (typeof origin !== 'string' || !origin) throw new Error('AI-6 allowed origin is required');
  if (!config || typeof config.embeddingModel !== 'string' || !Number.isInteger(config.embeddingDimensions)) {
    throw new Error('AI-6 embedding config is invalid');
  }
  if (!Array.isArray(probes) || probes.length !== AI6_PROBE_CASE_IDS.length) {
    throw new Error(`AI-6 requires exactly ${AI6_PROBE_CASE_IDS.length} bounded probe cases`);
  }
  if (!referenceVectors || typeof referenceVectors.get !== 'function') throw new Error('AI-6 reference vectors are required');

  const baseUrl = workerOrigin(workerBaseUrl);
  const embedUrl = `${baseUrl}/v1/embed`;
  const answerUrl = `${baseUrl}/v1/answer`;

  const {response: preflight, latencyMs: preflightLatencyMs} = await timedFetch(fetchImpl, embedUrl, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  }, 'preflight');
  if (preflight.status !== 204
    || preflight.headers.get('Access-Control-Allow-Origin') !== origin
    || !String(preflight.headers.get('Access-Control-Allow-Methods') || '').split(',').map((value) => value.trim()).includes('POST')
    || !String(preflight.headers.get('Access-Control-Allow-Headers') || '').toLowerCase().split(',').map((value) => value.trim()).includes('content-type')) {
    throw new Error('AI-6 SEARCH preflight contract failed');
  }

  const {response: forbiddenOrigin} = await timedFetch(fetchImpl, embedUrl, {
    method: 'POST',
    headers: {Origin: 'https://example.invalid', 'Content-Type': 'application/json'},
    body: JSON.stringify({query: probes[0].query}),
  }, 'forbidden-origin');
  const forbiddenPayload = await responseJson(forbiddenOrigin, 'forbidden-origin');
  if (forbiddenOrigin.status !== 403 || forbiddenPayload.code !== 'origin_forbidden') {
    throw new Error('AI-6 SEARCH forbidden-origin contract failed');
  }

  const {response: answerResponse, latencyMs: answerLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST',
    headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      question: probes[0].query,
      chunkIds: [probes[0].expectedAnyOf[0]],
    }),
  }, 'answer-negative');
  const answerPayload = await responseJson(answerResponse, 'answer-negative');
  if (answerResponse.status !== 503 || answerPayload.code !== 'feature_disabled') {
    throw new Error('AI-6 SEARCH must keep /v1/answer disabled');
  }

  const embeddingProbes = [];
  for (const probe of probes) {
    const reference = referenceVectors.get(probe.id);
    if (!reference) throw new Error(`AI-6 reference embedding missing ${probe.id}`);
    const {response, latencyMs} = await timedFetch(fetchImpl, embedUrl, {
      method: 'POST',
      headers: {Origin: origin, 'Content-Type': 'application/json'},
      body: JSON.stringify({query: probe.query}),
    }, `embedding ${probe.id}`);
    if (response.status !== 200) throw new Error(`AI-6 embedding ${probe.id} returned HTTP ${response.status}`);
    const payload = await responseJson(response, `embedding ${probe.id}`);
    const embedding = validateEmbeddingPayload(payload, config, `embedding ${probe.id}`);
    const similarity = cosineSimilarity(embedding, reference);
    if (similarity < AI6_MIN_REFERENCE_COSINE) {
      throw new Error(`AI-6 embedding ${probe.id} is incompatible with accepted AI-5 query space`);
    }
    embeddingProbes.push({
      id: probe.id,
      lang: probe.lang,
      kind: probe.kind,
      latencyMs,
      referenceCosine: Number(similarity.toFixed(6)),
    });
  }

  return Object.freeze({
    workerOriginDigest: sha256(baseUrl),
    preflightLatencyMs,
    answerNegativeLatencyMs: answerLatencyMs,
    embeddingRequestCount: embeddingProbes.length,
    embeddingProbes,
  });
}

function readAcceptedIndex(rootDir) {
  const indexDir = path.join(rootDir, 'data', 'ai-index');
  const meta = JSON.parse(fs.readFileSync(path.join(indexDir, 'index-meta.json'), 'utf8'));
  const queryMeta = JSON.parse(fs.readFileSync(path.join(indexDir, 'benchmark-query-cache', 'benchmark-query-meta.json'), 'utf8'));
  if (meta.sourceCommit !== AI5_ACCEPTED.sourceCommit
    || meta.corpusDigest !== AI5_ACCEPTED.corpusDigest
    || meta.embeddingsDigest !== AI5_ACCEPTED.embeddingsDigest
    || queryMeta.sourceCommit !== AI5_ACCEPTED.sourceCommit
    || queryMeta.benchmarkDigest !== AI5_ACCEPTED.benchmarkDigest
    || queryMeta.embeddingsDigest !== AI5_ACCEPTED.queryEmbeddingsDigest) {
    throw new Error('AI-6 requires the exact accepted AI-5 index/query artifact');
  }
  return {indexDir, meta, queryMeta};
}

function nonNegativeDelta(after, before) {
  const delta = after - before;
  if (delta < -1e-9) throw new Error('AI-6 key usage moved backwards during canary');
  return Number(Math.max(0, delta).toFixed(12));
}

export function buildAi6Evidence({sourceCommit, before, after, acceptedIndex, probeReport}) {
  if (!/^[a-f0-9]{40}$/i.test(String(sourceCommit || ''))) throw new Error('AI-6 sourceCommit must be an exact 40-hex SHA');
  if (before.limitUsd !== after.limitUsd || before.limitReset !== null || after.limitReset !== null) {
    throw new Error('AI-6 key hard-limit policy changed during canary');
  }
  const runUsageDeltaUsd = nonNegativeDelta(after.usageUsd, before.usageUsd);
  if (runUsageDeltaUsd > AI6_MAX_RUN_SPEND_USD) {
    throw new Error(`AI-6 canary spend exceeded $${AI6_MAX_RUN_SPEND_USD}`);
  }
  return Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'search-canary',
    sourceCommit: String(sourceCommit).toLowerCase(),
    publicAiMode: 'off',
    runtimeMode: 'search',
    answerEndpoint: 'disabled',
    keyPolicy: {
      maxAllowedLimitUsd: AI6_MAX_KEY_LIMIT_USD,
      maxRunSpendUsd: AI6_MAX_RUN_SPEND_USD,
      configuredLimitUsd: after.limitUsd,
      lifetimeNoReset: true,
    },
    keyAccounting: {
      beforeUsageUsd: before.usageUsd,
      afterUsageUsd: after.usageUsd,
      runUsageDeltaUsd,
      beforeLimitRemainingUsd: before.limitRemainingUsd,
      afterLimitRemainingUsd: after.limitRemainingUsd,
    },
    acceptedAi5Index: {
      sourceCommit: acceptedIndex.meta.sourceCommit,
      corpusDigest: acceptedIndex.meta.corpusDigest,
      embeddingsDigest: acceptedIndex.meta.embeddingsDigest,
      benchmarkDigest: acceptedIndex.queryMeta.benchmarkDigest,
      queryEmbeddingsDigest: acceptedIndex.queryMeta.embeddingsDigest,
    },
    runtime: probeReport,
  });
}

export async function runAi6SearchCanary({rootDir, workerBaseUrl, apiKey, sourceCommit, fetchImpl = globalThis.fetch}) {
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  if (config.mode !== 'off' || config.workerBaseUrl !== '') {
    throw new Error('AI-6 canary requires public AI mode OFF and no public Worker URL');
  }

  const acceptedIndex = readAcceptedIndex(rootDir);
  const corpus = buildAiCorpus({rootDir, config});
  const cases = loadBenchmark(
    path.join(rootDir, 'data', 'ai-navigator-benchmark.json'),
    new Set(corpus.map(({id}) => id)),
  );
  const queryCache = verifyBenchmarkQueryEmbeddings({
    cases,
    config,
    cacheDir: path.join(acceptedIndex.indexDir, 'benchmark-query-cache'),
  });
  const byId = new Map(cases.map((item) => [item.id, item]));
  const probes = AI6_PROBE_CASE_IDS.map((id) => {
    const probe = byId.get(id);
    if (!probe) throw new Error(`AI-6 benchmark probe missing ${id}`);
    return probe;
  });

  const before = await fetchAi6KeyMetadata({apiKey, fetchImpl});
  const probeReport = await probeSearchWorker({
    workerBaseUrl,
    origin: 'https://trueruslan.ru',
    config,
    probes,
    referenceVectors: queryCache.vectors,
    fetchImpl,
  });
  const after = await fetchAi6KeyMetadata({apiKey, fetchImpl});
  return buildAi6Evidence({sourceCommit, before, after, acceptedIndex, probeReport});
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const report = await runAi6SearchCanary({
      rootDir,
      workerBaseUrl: process.env.AI6_SEARCH_WORKER_BASE_URL,
      apiKey: process.env.OPENROUTER_AI6_API_KEY,
      sourceCommit: process.env.GITHUB_SHA,
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
