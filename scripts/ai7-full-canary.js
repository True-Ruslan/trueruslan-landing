import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';

const OPENROUTER_CURRENT_KEY_URL = 'https://openrouter.ai/api/v1/key';
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ANSWER_WORDS = 450;
export const AI7_MAX_KEY_LIMIT_USD = 2;
export const AI7_MAX_RUN_SPEND_USD = 0.02;
export const AI7_MAX_REQUEST_LATENCY_MS = 12_000;
export const AI7_SUFFICIENT_CHUNK_ID = 'ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment';
const SUFFICIENT_QUESTION = 'Почему успешный deployment ещё не означает production verification?';
const INSUFFICIENT_QUESTION = 'Какой любимый фильм Руслана?';

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(String(value), 'utf8').digest('hex')}`;
}

function finiteNumber(value, label, {positive = false} = {}) {
  if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
    throw new Error(`AI-7 ${label} must be a ${positive ? 'positive' : 'non-negative'} finite number`);
  }
  return value;
}

function cleanHttpsOrigin(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`AI-7 ${label} is required`);
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`AI-7 ${label} must be a clean HTTPS origin`);
  }
  if (url.protocol !== 'https:'
    || url.username
    || url.password
    || url.search
    || url.hash
    || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error(`AI-7 ${label} must be a clean HTTPS origin`);
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
    throw new Error(`AI-7 ${label} returned invalid JSON`);
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
    throw new Error(`AI-7 ${label} request failed`);
  }
  const latencyMs = Math.max(0, Math.round(performance.now() - started));
  if (latencyMs > AI7_MAX_REQUEST_LATENCY_MS) {
    throw new Error(`AI-7 ${label} latency exceeded ${AI7_MAX_REQUEST_LATENCY_MS}ms`);
  }
  return {response, latencyMs};
}

export function validateAi7KeyMetadata(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('AI-7 current-key metadata must be an object');
  }
  if (data.is_management_key === true || data.is_provisioning_key === true) {
    throw new Error('AI-7 requires an ordinary non-management, non-provisioning API key');
  }
  const limitUsd = finiteNumber(data.limit, 'key spending limit', {positive: true});
  if (limitUsd > AI7_MAX_KEY_LIMIT_USD) {
    throw new Error(`AI-7 key spending limit must not exceed $${AI7_MAX_KEY_LIMIT_USD}`);
  }
  if (data.limit_reset !== null) {
    throw new Error('AI-7 key spending limit must be lifetime-bounded with no automatic reset');
  }
  const limitRemainingUsd = finiteNumber(data.limit_remaining, 'remaining key spend', {positive: true});
  if (limitRemainingUsd > limitUsd) {
    throw new Error('AI-7 remaining key spend cannot exceed the configured hard limit');
  }
  const usageUsd = finiteNumber(data.usage, 'key usage');
  return Object.freeze({limitUsd, limitRemainingUsd, usageUsd, limitReset: null});
}

export async function fetchAi7KeyMetadata({apiKey, fetchImpl = globalThis.fetch}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('OPENROUTER_AI7_API_KEY is required');
  let response;
  try {
    response = await fetchImpl(OPENROUTER_CURRENT_KEY_URL, {
      method: 'GET',
      headers: {Authorization: `Bearer ${apiKey.trim()}`},
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error('AI-7 OpenRouter current-key metadata request failed');
  }
  if (!response?.ok) throw new Error(`AI-7 OpenRouter current-key metadata HTTP ${response?.status ?? 'unknown'}`);
  const payload = await responseJson(response, 'OpenRouter current-key metadata');
  return validateAi7KeyMetadata(payload?.data);
}

function validateEmbedding(payload, embeddingModel, embeddingDimensions) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('AI-7 embedding payload is invalid');
  }
  if (payload.model !== embeddingModel || payload.dimensions !== embeddingDimensions) {
    throw new Error('AI-7 embedding model or dimension mismatch');
  }
  if (!Array.isArray(payload.embedding)
    || payload.embedding.length !== embeddingDimensions
    || !payload.embedding.every(Number.isFinite)) {
    throw new Error('AI-7 embedding vector is invalid');
  }
}

function validateSufficientAnswer(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.sufficientEvidence !== true
    || typeof payload.answer !== 'string'
    || !payload.answer.trim()
    || wordCount(payload.answer) > MAX_ANSWER_WORDS
    || !Array.isArray(payload.citations)
    || payload.citations.length !== 1
    || payload.citations[0] !== AI7_SUFFICIENT_CHUNK_ID) {
    throw new Error('AI-7 sufficient-answer contract failed');
  }
  return {
    sufficientEvidence: true,
    answerWordCount: wordCount(payload.answer),
    citations: [AI7_SUFFICIENT_CHUNK_ID],
  };
}

function validateInsufficientAnswer(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.sufficientEvidence !== false
    || payload.answer !== ''
    || !Array.isArray(payload.citations)
    || payload.citations.length !== 0) {
    throw new Error('AI-7 insufficient-evidence contract failed');
  }
  return {sufficientEvidence: false, answerWordCount: 0, citations: []};
}

export async function probeAi7FullWorker({
  workerBaseUrl,
  publicWorkerBaseUrl,
  origin,
  embeddingModel,
  embeddingDimensions,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof fetchImpl !== 'function') throw new Error('AI-7 canary requires fetchImpl');
  if (typeof origin !== 'string' || !origin.trim()) throw new Error('AI-7 allowed origin is required');
  if (typeof embeddingModel !== 'string' || !embeddingModel.trim() || !Number.isInteger(embeddingDimensions)) {
    throw new Error('AI-7 embedding contract is invalid');
  }

  const baseUrl = cleanHttpsOrigin(workerBaseUrl, 'isolated Worker base URL');
  const publicBaseUrl = cleanHttpsOrigin(publicWorkerBaseUrl, 'public SEARCH Worker base URL');
  if (baseUrl === publicBaseUrl) throw new Error('AI-7 isolated FULL Worker must differ from the public SEARCH Worker');
  const answerUrl = `${baseUrl}/v1/answer`;
  const embedUrl = `${baseUrl}/v1/embed`;
  const publicAnswerUrl = `${publicBaseUrl}/v1/answer`;

  const {response: preflight, latencyMs: preflightLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  }, 'FULL preflight');
  if (preflight.status !== 204
    || preflight.headers.get('Access-Control-Allow-Origin') !== origin
    || !String(preflight.headers.get('Access-Control-Allow-Methods') || '').split(',').map((value) => value.trim()).includes('POST')
    || !String(preflight.headers.get('Access-Control-Allow-Headers') || '').toLowerCase().split(',').map((value) => value.trim()).includes('content-type')) {
    throw new Error('AI-7 FULL preflight contract failed');
  }

  const {response: forbiddenOrigin, latencyMs: forbiddenOriginLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST',
    headers: {Origin: 'https://example.invalid', 'Content-Type': 'application/json'},
    body: JSON.stringify({question: SUFFICIENT_QUESTION, chunkIds: [AI7_SUFFICIENT_CHUNK_ID]}),
  }, 'forbidden-origin');
  const forbiddenPayload = await responseJson(forbiddenOrigin, 'forbidden-origin');
  if (forbiddenOrigin.status !== 403 || forbiddenPayload.code !== 'origin_forbidden') {
    throw new Error('AI-7 forbidden-origin contract failed');
  }

  const {response: embeddingResponse, latencyMs: embeddingLatencyMs} = await timedFetch(fetchImpl, embedUrl, {
    method: 'POST',
    headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({query: 'Как проверяется сайт после успешного деплоя?'}),
  }, 'embedding');
  if (embeddingResponse.status !== 200) throw new Error(`AI-7 embedding returned HTTP ${embeddingResponse.status}`);
  const embeddingPayload = await responseJson(embeddingResponse, 'embedding');
  validateEmbedding(embeddingPayload, embeddingModel, embeddingDimensions);

  const {response: sufficientResponse, latencyMs: sufficientLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST',
    headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({question: SUFFICIENT_QUESTION, chunkIds: [AI7_SUFFICIENT_CHUNK_ID]}),
  }, 'sufficient-answer');
  if (sufficientResponse.status !== 200) throw new Error(`AI-7 sufficient answer returned HTTP ${sufficientResponse.status}`);
  const sufficientAnswer = validateSufficientAnswer(await responseJson(sufficientResponse, 'sufficient-answer'));

  const {response: insufficientResponse, latencyMs: insufficientLatencyMs} = await timedFetch(fetchImpl, answerUrl, {
    method: 'POST',
    headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({question: INSUFFICIENT_QUESTION, chunkIds: [AI7_SUFFICIENT_CHUNK_ID]}),
  }, 'insufficient-answer');
  if (insufficientResponse.status !== 200) throw new Error(`AI-7 insufficient answer returned HTTP ${insufficientResponse.status}`);
  const insufficientAnswer = validateInsufficientAnswer(await responseJson(insufficientResponse, 'insufficient-answer'));

  const {response: publicAnswerResponse, latencyMs: publicAnswerLatencyMs} = await timedFetch(fetchImpl, publicAnswerUrl, {
    method: 'POST',
    headers: {Origin: origin, 'Content-Type': 'application/json'},
    body: JSON.stringify({question: SUFFICIENT_QUESTION, chunkIds: [AI7_SUFFICIENT_CHUNK_ID]}),
  }, 'public-answer-negative');
  const publicAnswerPayload = await responseJson(publicAnswerResponse, 'public-answer-negative');
  if (publicAnswerResponse.status !== 503 || publicAnswerPayload.code !== 'feature_disabled') {
    throw new Error('AI-7 requires the public SEARCH Worker to keep /v1/answer disabled');
  }

  return Object.freeze({
    workerOriginDigest: sha256(baseUrl),
    publicWorkerOriginDigest: sha256(publicBaseUrl),
    preflightLatencyMs,
    forbiddenOriginLatencyMs,
    embedding: {
      latencyMs: embeddingLatencyMs,
      model: embeddingPayload.model,
      dimensions: embeddingPayload.dimensions,
    },
    sufficientAnswer: {latencyMs: sufficientLatencyMs, ...sufficientAnswer},
    insufficientAnswer: {latencyMs: insufficientLatencyMs, ...insufficientAnswer},
    publicAnswerEndpoint: 'disabled',
    publicAnswerLatencyMs,
    clientUnexpectedExternalRequests: 0,
  });
}

function nonNegativeDelta(after, before) {
  const delta = after - before;
  if (delta < -1e-9) throw new Error('AI-7 key usage moved backwards during canary');
  return Number(Math.max(0, delta).toFixed(12));
}

export function buildAi7Evidence({sourceCommit, before, after, probeReport}) {
  if (!/^[a-f0-9]{40}$/i.test(String(sourceCommit || ''))) {
    throw new Error('AI-7 sourceCommit must be an exact 40-hex SHA');
  }
  if (!before || !after || before.limitUsd !== after.limitUsd || before.limitReset !== null || after.limitReset !== null) {
    throw new Error('AI-7 key hard-limit policy changed during canary');
  }
  if (!probeReport || probeReport.publicAnswerEndpoint !== 'disabled') {
    throw new Error('AI-7 public SEARCH answer-disable evidence is required');
  }
  const runUsageDeltaUsd = nonNegativeDelta(after.usageUsd, before.usageUsd);
  if (runUsageDeltaUsd > AI7_MAX_RUN_SPEND_USD) {
    throw new Error(`AI-7 canary spend exceeded $${AI7_MAX_RUN_SPEND_USD}`);
  }

  return Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'ai7-full-canary',
    sourceCommit: String(sourceCommit).toLowerCase(),
    publicAiMode: 'search',
    isolatedRuntimeMode: 'full',
    publicFullActivated: false,
    publicAnswerEndpoint: 'disabled',
    keyPolicy: {
      maxAllowedLimitUsd: AI7_MAX_KEY_LIMIT_USD,
      maxRunSpendUsd: AI7_MAX_RUN_SPEND_USD,
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
    runtime: probeReport,
    sanitized: true,
  });
}

export async function runAi7FullCanary({rootDir, workerBaseUrl, apiKey, sourceCommit, fetchImpl = globalThis.fetch}) {
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  if (config.mode !== 'search' || !config.workerBaseUrl) {
    throw new Error('AI-7 canary requires the accepted public SEARCH baseline');
  }
  if (config.embeddingModel !== 'openai/text-embedding-3-small' || config.embeddingDimensions !== 512) {
    throw new Error('AI-7 canary requires the accepted SEARCH embedding contract');
  }

  const before = await fetchAi7KeyMetadata({apiKey, fetchImpl});
  const probeReport = await probeAi7FullWorker({
    workerBaseUrl,
    publicWorkerBaseUrl: config.workerBaseUrl,
    origin: 'https://trueruslan.ru',
    embeddingModel: config.embeddingModel,
    embeddingDimensions: config.embeddingDimensions,
    fetchImpl,
  });
  const after = await fetchAi7KeyMetadata({apiKey, fetchImpl});
  return buildAi7Evidence({sourceCommit, before, after, probeReport});
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const report = await runAi7FullCanary({
      rootDir,
      workerBaseUrl: process.env.AI7_FULL_WORKER_BASE_URL,
      apiKey: process.env.OPENROUTER_AI7_API_KEY,
      sourceCommit: process.env.GITHUB_SHA,
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
