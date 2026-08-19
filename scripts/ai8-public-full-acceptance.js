import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parse} from 'parse5';

import {loadAiConfig} from './ai-config.js';
import {verifyAiIndex} from './ai-index-verify.js';
import {rankChunks} from './ai-retrieval-core.js';

const OPENROUTER_CURRENT_KEY_URL = 'https://openrouter.ai/api/v1/key';
const PUBLIC_ORIGIN = 'https://trueruslan.ru';
const PUBLIC_SEARCH_URL = `${PUBLIC_ORIGIN}/_search/ru/`;
const ACCEPTED_SEARCH_WORKER = 'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev';
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ANSWER_WORDS = 450;
const WORKER_ERROR_CODE = /^[a-z][a-z0-9_]{0,63}$/;

export const AI8_MAX_KEY_LIMIT_USD = 2;
export const AI8_MAX_RUN_SPEND_USD = 0.03;
export const AI8_MAX_REQUEST_LATENCY_MS = 12_000;
export const AI8_SUFFICIENT_CHUNK_ID = 'ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment';
export const AI8_SEARCH_QUERY = 'Как проверяется сайт после успешного деплоя?';
const SUFFICIENT_QUESTION = 'Почему успешный deployment ещё не означает production verification?';
const INSUFFICIENT_QUESTION = 'Какой любимый фильм Руслана?';

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(String(value), 'utf8').digest('hex')}`;
}

function finiteNumber(value, label, {positive = false} = {}) {
  if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
    throw new Error(`AI-8 ${label} must be a ${positive ? 'positive' : 'non-negative'} finite number`);
  }
  return value;
}

function cleanHttpsOrigin(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`AI-8 ${label} is required`);
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`AI-8 ${label} must be a clean HTTPS origin`);
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
    || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error(`AI-8 ${label} must be a clean HTTPS origin`);
  }
  return url.origin;
}

function wordCount(value) {
  const text = String(value || '').trim();
  return text ? text.split(/\s+/u).length : 0;
}

async function responseJson(response, label) {
  try {
    return await response.json();
  } catch {
    throw new Error(`AI-8 ${label} returned invalid JSON`);
  }
}

async function throwWorkerHttpFailure(response, label) {
  const status = Number.isInteger(response?.status) ? response.status : 'unknown';
  let code = 'unknown';
  try {
    const payload = await response.json();
    if (typeof payload?.code === 'string' && WORKER_ERROR_CODE.test(payload.code)) code = payload.code;
  } catch {
    // Raw response bodies are intentionally excluded from diagnostics.
  }
  throw new Error(`AI-8 ${label} returned HTTP ${status} code=${code}`);
}

async function timedFetch(fetchImpl, url, init, label) {
  const started = performance.now();
  let response;
  try {
    response = await fetchImpl(url, {...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)});
  } catch {
    throw new Error(`AI-8 ${label} request failed`);
  }
  const latencyMs = Math.max(0, Math.round(performance.now() - started));
  if (latencyMs > AI8_MAX_REQUEST_LATENCY_MS) {
    throw new Error(`AI-8 ${label} latency exceeded ${AI8_MAX_REQUEST_LATENCY_MS}ms`);
  }
  return {response, latencyMs};
}

export function validateAi8KeyMetadata(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('AI-8 current-key metadata must be an object');
  }
  if (data.is_management_key === true || data.is_provisioning_key === true) {
    throw new Error('AI-8 requires an ordinary non-management, non-provisioning API key');
  }
  const limitUsd = finiteNumber(data.limit, 'key spending limit', {positive: true});
  if (limitUsd > AI8_MAX_KEY_LIMIT_USD) {
    throw new Error(`AI-8 key spending limit must not exceed $${AI8_MAX_KEY_LIMIT_USD}`);
  }
  if (data.limit_reset !== null) {
    throw new Error('AI-8 key spending limit must be lifetime-bounded with no automatic reset');
  }
  const limitRemainingUsd = finiteNumber(data.limit_remaining, 'remaining key spend', {positive: true});
  if (limitRemainingUsd > limitUsd) {
    throw new Error('AI-8 remaining key spend cannot exceed the configured hard limit');
  }
  const usageUsd = finiteNumber(data.usage, 'key usage');
  return Object.freeze({limitUsd, limitRemainingUsd, usageUsd, limitReset: null});
}

export async function fetchAi8KeyMetadata({apiKey, fetchImpl = globalThis.fetch}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('OPENROUTER_AI8_API_KEY is required');
  let response;
  try {
    response = await fetchImpl(OPENROUTER_CURRENT_KEY_URL, {
      method: 'GET',
      headers: {Authorization: `Bearer ${apiKey.trim()}`},
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error('AI-8 OpenRouter current-key metadata request failed');
  }
  if (!response?.ok) throw new Error(`AI-8 OpenRouter current-key metadata HTTP ${response?.status ?? 'unknown'}`);
  const payload = await responseJson(response, 'OpenRouter current-key metadata');
  return validateAi8KeyMetadata(payload?.data);
}

function findElementById(node, id) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node.attrs) && node.attrs.some((attr) => attr.name === 'id' && attr.value === id)) return node;
  for (const child of node.childNodes || []) {
    const match = findElementById(child, id);
    if (match) return match;
  }
  return null;
}

export function parseDeployedAiConfig(html) {
  if (typeof html !== 'string' || !html.trim()) throw new Error('AI-8 deployed search page HTML is empty');
  const document = parse(html);
  const script = findElementById(document, 'tr-ai-search-config');
  if (!script || script.nodeName !== 'script') throw new Error('AI-8 deployed AI config is missing');
  const raw = (script.childNodes || []).map((node) => node.value || '').join('').trim();
  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    throw new Error('AI-8 deployed AI config is invalid JSON');
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('AI-8 deployed AI config is invalid');
  }
  return config;
}

function validateEmbedding(payload, embeddingModel, embeddingDimensions) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.model !== embeddingModel
    || payload.dimensions !== embeddingDimensions
    || !Array.isArray(payload.embedding)
    || payload.embedding.length !== embeddingDimensions
    || !payload.embedding.every(Number.isFinite)) {
    throw new Error('AI-8 embedding contract failed');
  }
  return payload.embedding;
}

function validateSufficientAnswer(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.sufficientEvidence !== true
    || typeof payload.answer !== 'string'
    || !payload.answer.trim()
    || wordCount(payload.answer) > MAX_ANSWER_WORDS
    || !Array.isArray(payload.citations)
    || payload.citations.length !== 1
    || payload.citations[0] !== AI8_SUFFICIENT_CHUNK_ID) {
    throw new Error('AI-8 sufficient-answer contract failed');
  }
  return {sufficientEvidence: true, answerWordCount: wordCount(payload.answer), citations: [AI8_SUFFICIENT_CHUNK_ID]};
}

function validateInsufficientAnswer(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.sufficientEvidence !== false
    || payload.answer !== ''
    || !Array.isArray(payload.citations)
    || payload.citations.length !== 0) {
    throw new Error('AI-8 insufficient-evidence contract failed');
  }
  return {sufficientEvidence: false, answerWordCount: 0, citations: []};
}

function canonicalDocumentId(chunkId) {
  const parts = String(chunkId).split(':');
  if (parts.length !== 4 || parts.some((part) => !part)) throw new Error('AI-8 encountered invalid stable chunk ID');
  return parts.slice(0, 3).join(':');
}

function verifySemanticSearch({queryVector, chunks, embeddings, config}) {
  const target = chunks.find((chunk) => chunk.id === AI8_SUFFICIENT_CHUNK_ID);
  if (!target) throw new Error('AI-8 accepted grounding chunk is missing from the restored index');
  const ranked = rankChunks({query: AI8_SEARCH_QUERY, queryVector, chunks, embeddings, config, preferredLanguage: 'ru'});
  const top = ranked.slice(0, Math.min(5, config.maxResults || 5));
  const expectedDocument = canonicalDocumentId(AI8_SUFFICIENT_CHUNK_ID);
  if (!top.some((item) => canonicalDocumentId(item.chunkId) === expectedDocument)) {
    throw new Error('AI-8 semantic SEARCH regression failed');
  }
  return {
    expectedDocumentDigest: sha256(expectedDocument),
    topDocumentDigests: top.map((item) => sha256(canonicalDocumentId(item.chunkId))),
    topResultCount: top.length,
  };
}

function assertFullConfig(config, workerBaseUrl, embeddingDimensions) {
  if (config.mode !== 'full') throw new Error('AI-8 deployed public config is not FULL');
  if (cleanHttpsOrigin(config.workerBaseUrl, 'deployed Worker base URL') !== workerBaseUrl) {
    throw new Error('AI-8 deployed Worker does not match the dedicated production Worker');
  }
  if (config.embeddingDimensions !== embeddingDimensions) throw new Error('AI-8 deployed embedding dimensions drifted');
}

export async function probeAi8PublicFull({
  workerBaseUrl,
  origin = PUBLIC_ORIGIN,
  publicSearchUrl = PUBLIC_SEARCH_URL,
  embeddingModel,
  embeddingDimensions,
  rankingConfig,
  chunks,
  embeddings,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof fetchImpl !== 'function') throw new Error('AI-8 acceptance requires fetchImpl');
  const baseUrl = cleanHttpsOrigin(workerBaseUrl, 'production FULL Worker base URL');
  if (baseUrl === ACCEPTED_SEARCH_WORKER) throw new Error('AI-8 production FULL Worker must differ from the accepted SEARCH Worker');
  const answerUrl = `${baseUrl}/v1/answer`;
  const embedUrl = `${baseUrl}/v1/embed`;

  const {response: pageResponse, latencyMs: publicConfigLatencyMs} = await timedFetch(fetchImpl, publicSearchUrl, {
    method: 'GET', headers: {Accept: 'text/html'},
  }, 'public config');
  if (pageResponse.status !== 200) throw new Error(`AI-8 public config returned HTTP ${pageResponse.status}`);
  const deployedConfig = parseDeployedAiConfig(await pageResponse.text());
  assertFullConfig(deployedConfig, baseUrl, embeddingDimensions);

  const {response: preflight, latencyMs: preflightLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'OPTIONS',
    headers: {Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'},
  }, 'FULL preflight');
  if (preflight.status !== 204
    || preflight.headers.get('Access-Control-Allow-Origin') !== origin
    || !String(preflight.headers.get('Access-Control-Allow-Methods') || '').split(',').map((value) => value.trim()).includes('POST')
    || !String(preflight.headers.get('Access-Control-Allow-Headers') || '').toLowerCase().split(',').map((value) => value.trim()).includes('content-type')) {
    throw new Error('AI-8 FULL preflight contract failed');
  }

  const {response: forbiddenOrigin, latencyMs: forbiddenOriginLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST',
    headers: {Origin: 'https://example.invalid', 'Content-Type': 'application/json'},
    body: JSON.stringify({question: SUFFICIENT_QUESTION, chunkIds: [AI8_SUFFICIENT_CHUNK_ID]}),
  }, 'forbidden-origin');
  const forbiddenPayload = await responseJson(forbiddenOrigin, 'forbidden-origin');
  if (forbiddenOrigin.status !== 403 || forbiddenPayload.code !== 'origin_forbidden'
    || forbiddenOrigin.headers.get('Access-Control-Allow-Origin')) {
    throw new Error('AI-8 forbidden-origin contract failed');
  }

  const {response: embeddingResponse, latencyMs: embeddingLatencyMs} = await timedFetch(fetchImpl, embedUrl, {
    method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body: JSON.stringify({query: AI8_SEARCH_QUERY}),
  }, 'embedding');
  if (embeddingResponse.status !== 200) await throwWorkerHttpFailure(embeddingResponse, 'embedding');
  const embeddingPayload = await responseJson(embeddingResponse, 'embedding');
  const queryVector = validateEmbedding(embeddingPayload, embeddingModel, embeddingDimensions);
  const searchRegression = verifySemanticSearch({queryVector, chunks, embeddings, config: rankingConfig});

  const {response: sufficientResponse, latencyMs: sufficientLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({question: SUFFICIENT_QUESTION, chunkIds: [AI8_SUFFICIENT_CHUNK_ID]}),
  }, 'sufficient-answer');
  if (sufficientResponse.status !== 200) await throwWorkerHttpFailure(sufficientResponse, 'sufficient answer');
  const sufficientAnswer = validateSufficientAnswer(await responseJson(sufficientResponse, 'sufficient-answer'));

  const {response: insufficientResponse, latencyMs: insufficientLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({question: INSUFFICIENT_QUESTION, chunkIds: [AI8_SUFFICIENT_CHUNK_ID]}),
  }, 'insufficient-answer');
  if (insufficientResponse.status !== 200) await throwWorkerHttpFailure(insufficientResponse, 'insufficient answer');
  const insufficientAnswer = validateInsufficientAnswer(await responseJson(insufficientResponse, 'insufficient-answer'));

  return Object.freeze({
    publicWorkerOriginDigest: sha256(baseUrl),
    deployedConfigDigest: sha256(JSON.stringify(deployedConfig)),
    publicConfigLatencyMs,
    preflightLatencyMs,
    forbiddenOriginLatencyMs,
    embedding: {latencyMs: embeddingLatencyMs, model: embeddingPayload.model, dimensions: embeddingPayload.dimensions},
    searchRegression,
    sufficientAnswer: {latencyMs: sufficientLatencyMs, ...sufficientAnswer},
    insufficientAnswer: {latencyMs: insufficientLatencyMs, ...insufficientAnswer},
  });
}

function nonNegativeDelta(after, before) {
  const delta = after - before;
  if (delta < -1e-9) throw new Error('AI-8 key usage moved backwards during acceptance');
  return Number(Math.max(0, delta).toFixed(12));
}

export function buildAi8Evidence({sourceCommit, before, after, probeReport, clientUnexpectedExternalRequests = 0}) {
  if (!/^[a-f0-9]{40}$/i.test(String(sourceCommit || ''))) throw new Error('AI-8 sourceCommit must be an exact 40-hex SHA');
  if (!before || !after || before.limitUsd !== after.limitUsd || before.limitReset !== null || after.limitReset !== null) {
    throw new Error('AI-8 key hard-limit policy changed during acceptance');
  }
  if (!probeReport?.searchRegression || probeReport?.sufficientAnswer?.sufficientEvidence !== true
    || probeReport?.insufficientAnswer?.sufficientEvidence !== false) {
    throw new Error('AI-8 complete production runtime evidence is required');
  }
  if (clientUnexpectedExternalRequests !== 0) throw new Error('AI-8 acceptance observed an unexpected external request');
  const runUsageDeltaUsd = nonNegativeDelta(after.usageUsd, before.usageUsd);
  if (runUsageDeltaUsd > AI8_MAX_RUN_SPEND_USD) throw new Error(`AI-8 acceptance spend exceeded $${AI8_MAX_RUN_SPEND_USD}`);

  return Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'ai8-public-full-acceptance',
    sourceCommit: String(sourceCommit).toLowerCase(),
    publicAiMode: 'full',
    productionRuntimeMode: 'full',
    publicFullActivated: true,
    keyPolicy: {maxAllowedLimitUsd: AI8_MAX_KEY_LIMIT_USD, maxRunSpendUsd: AI8_MAX_RUN_SPEND_USD, configuredLimitUsd: after.limitUsd, lifetimeNoReset: true},
    keyAccounting: {
      beforeUsageUsd: before.usageUsd,
      afterUsageUsd: after.usageUsd,
      runUsageDeltaUsd,
      beforeLimitRemainingUsd: before.limitRemainingUsd,
      afterLimitRemainingUsd: after.limitRemainingUsd,
    },
    runtime: {...probeReport, clientUnexpectedExternalRequests},
    sanitized: true,
  });
}

function loadRestoredIndex(rootDir, config) {
  verifyAiIndex({rootDir, config});
  const indexDir = path.join(rootDir, 'data', 'ai-index');
  const chunks = JSON.parse(fs.readFileSync(path.join(indexDir, 'chunks.json'), 'utf8'));
  const bytes = fs.readFileSync(path.join(indexDir, 'embeddings.bin'));
  const dimensions = config.embeddingDimensions;
  const embeddings = chunks.map((_, chunkIndex) => {
    const vector = new Array(dimensions);
    const base = chunkIndex * dimensions * 4;
    for (let dimension = 0; dimension < dimensions; dimension += 1) vector[dimension] = bytes.readFloatLE(base + dimension * 4);
    return vector;
  });
  return {chunks, embeddings};
}

function createNetworkGuard({workerBaseUrl, fetchImpl}) {
  const baseUrl = cleanHttpsOrigin(workerBaseUrl, 'production FULL Worker base URL');
  const allowed = new Set([OPENROUTER_CURRENT_KEY_URL, PUBLIC_SEARCH_URL, `${baseUrl}/v1/embed`, `${baseUrl}/v1/answer`]);
  let unexpected = 0;
  return {
    fetchImpl: async (url, init) => {
      const target = String(url);
      if (!allowed.has(target)) {
        unexpected += 1;
        throw new Error('AI-8 blocked an unexpected external request');
      }
      return fetchImpl(url, init);
    },
    unexpectedCount: () => unexpected,
  };
}

export async function runAi8PublicFullAcceptance({rootDir, workerBaseUrl, apiKey, sourceCommit, fetchImpl = globalThis.fetch}) {
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  const productionWorker = cleanHttpsOrigin(workerBaseUrl, 'production FULL Worker base URL');
  if (config.mode !== 'full' || !config.workerBaseUrl) {
    throw new Error('AI-8 public FULL acceptance requires an already-activated FULL repository config');
  }
  if (cleanHttpsOrigin(config.workerBaseUrl, 'repository Worker base URL') !== productionWorker) {
    throw new Error('AI-8 repository FULL config does not target the dedicated production Worker');
  }
  if (productionWorker === ACCEPTED_SEARCH_WORKER) throw new Error('AI-8 must not reuse the accepted SEARCH Worker');
  if (config.embeddingModel !== 'openai/text-embedding-3-small' || config.embeddingDimensions !== 512) {
    throw new Error('AI-8 acceptance requires the accepted embedding contract');
  }

  const {chunks, embeddings} = loadRestoredIndex(rootDir, config);
  const guard = createNetworkGuard({workerBaseUrl: productionWorker, fetchImpl});
  const before = await fetchAi8KeyMetadata({apiKey, fetchImpl: guard.fetchImpl});
  const probeReport = await probeAi8PublicFull({
    workerBaseUrl: productionWorker,
    embeddingModel: config.embeddingModel,
    embeddingDimensions: config.embeddingDimensions,
    rankingConfig: config,
    chunks,
    embeddings,
    fetchImpl: guard.fetchImpl,
  });
  const after = await fetchAi8KeyMetadata({apiKey, fetchImpl: guard.fetchImpl});
  return buildAi8Evidence({sourceCommit, before, after, probeReport, clientUnexpectedExternalRequests: guard.unexpectedCount()});
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outputPath = path.join(rootDir, 'quality-artifacts', 'ai8-public-full-acceptance.json');
  try {
    const evidence = await runAi8PublicFullAcceptance({
      rootDir,
      workerBaseUrl: process.env.AI8_FULL_WORKER_BASE_URL,
      apiKey: process.env.OPENROUTER_AI8_API_KEY,
      sourceCommit: process.env.GITHUB_SHA,
    });
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
    process.stdout.write(`${JSON.stringify({
      evidenceClass: evidence.evidenceClass,
      sourceCommit: evidence.sourceCommit,
      publicAiMode: evidence.publicAiMode,
      runUsageDeltaUsd: evidence.keyAccounting.runUsageDeltaUsd,
      sanitized: evidence.sanitized,
    })}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
