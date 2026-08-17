import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadBenchmark} from './ai-benchmark.js';
import {refreshBenchmarkQueryEmbeddings} from './ai-benchmark-embeddings.js';
import {loadAiConfig} from './ai-config.js';
import {buildAiCorpus} from './ai-corpus.js';
import {refreshAiIndex} from './ai-index.js';

const OPENROUTER_CURRENT_KEY_URL = 'https://openrouter.ai/api/v1/key';
const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';
const AI5_REQUEST_TIMEOUT_MS = 8000;
export const AI5_MAX_KEY_LIMIT_USD = 5;

function finiteNumber(value, label, {positive = false} = {}) {
  if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
    throw new Error(`AI-5 ${label} must be a ${positive ? 'positive' : 'non-negative'} finite number`);
  }
  return value;
}

function validateExpiry(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || !value || !Number.isFinite(Date.parse(value))) {
    throw new Error('AI-5 key expires_at must be null or a valid ISO timestamp');
  }
  return value;
}

export function validateAi5KeyMetadata(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('AI-5 current-key metadata must be an object');
  }
  if (data.is_management_key === true || data.is_provisioning_key === true) {
    throw new Error('AI-5 requires an ordinary non-management, non-provisioning API key');
  }

  const limitUsd = finiteNumber(data.limit, 'key spending limit', {positive: true});
  if (limitUsd > AI5_MAX_KEY_LIMIT_USD) {
    throw new Error(`AI-5 key spending limit must not exceed $${AI5_MAX_KEY_LIMIT_USD}`);
  }
  if (data.limit_reset !== null) {
    throw new Error('AI-5 key spending limit must be lifetime-bounded with no automatic reset');
  }

  const limitRemainingUsd = finiteNumber(data.limit_remaining, 'remaining key spend', {positive: true});
  if (limitRemainingUsd > limitUsd) {
    throw new Error('AI-5 remaining key spend cannot exceed the configured hard limit');
  }
  const usageUsd = finiteNumber(data.usage, 'key usage');

  return Object.freeze({
    limitUsd,
    limitRemainingUsd,
    usageUsd,
    limitReset: null,
    expiresAt: validateExpiry(data.expires_at),
  });
}

export async function fetchCurrentKeyMetadata({apiKey, fetchImpl = globalThis.fetch}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('OPENROUTER_API_KEY is required for AI-5 current-key preflight');
  }
  if (typeof fetchImpl !== 'function') throw new Error('AI-5 current-key preflight requires fetchImpl');

  let response;
  try {
    response = await fetchImpl(OPENROUTER_CURRENT_KEY_URL, {
      method: 'GET',
      headers: {Authorization: `Bearer ${apiKey.trim()}`},
      signal: AbortSignal.timeout(AI5_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error('OpenRouter current-key metadata request failed');
  }
  if (!response?.ok) {
    throw new Error(`OpenRouter current-key metadata HTTP ${response?.status ?? 'unknown'}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('OpenRouter current-key metadata returned invalid JSON');
  }
  return validateAi5KeyMetadata(payload?.data);
}

function normalizedProviderUsage(usage) {
  if (!usage || typeof usage !== 'object' || Array.isArray(usage)) {
    throw new Error('AI-5 OpenRouter embeddings response is missing usage accounting');
  }
  const promptTokens = finiteNumber(usage.prompt_tokens, 'provider prompt tokens');
  const totalTokens = finiteNumber(usage.total_tokens, 'provider total tokens');
  const costCredits = finiteNumber(usage.cost, 'provider cost credits');
  if (!Number.isInteger(promptTokens) || !Number.isInteger(totalTokens)) {
    throw new Error('AI-5 provider token counts must be integers');
  }
  if (totalTokens < promptTokens) throw new Error('AI-5 provider total tokens cannot be lower than prompt tokens');
  return {promptTokens, totalTokens, costCredits};
}

function createEmbeddingAccountingFetch(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new Error('AI-5 provider accounting requires fetchImpl');
  const state = {requestCount: 0, latencyMs: 0, promptTokens: 0, totalTokens: 0, costCredits: 0};

  const wrapped = async (url, init = {}) => {
    if (url !== OPENROUTER_EMBEDDINGS_URL) throw new Error(`AI-5 unexpected provider endpoint: ${String(url)}`);
    state.requestCount += 1;
    if (state.requestCount > 1) throw new Error('AI-5 embedding stage exceeded its one-request budget');

    const started = performance.now();
    let response;
    try {
      response = await fetchImpl(url, {
        ...init,
        signal: init.signal || AbortSignal.timeout(AI5_REQUEST_TIMEOUT_MS),
      });
    } catch {
      state.latencyMs = Math.max(0, Math.round(performance.now() - started));
      throw new Error('AI-5 OpenRouter embedding request failed');
    }
    state.latencyMs = Math.max(0, Math.round(performance.now() - started));

    if (response?.ok) {
      let payload;
      try {
        payload = await response.clone().json();
      } catch {
        throw new Error('AI-5 OpenRouter embeddings response returned invalid JSON');
      }
      const usage = normalizedProviderUsage(payload?.usage);
      state.promptTokens += usage.promptTokens;
      state.totalTokens += usage.totalTokens;
      state.costCredits += usage.costCredits;
    }
    return response;
  };

  return {
    fetch: wrapped,
    report() {
      return Object.freeze({...state, costCredits: Number(state.costCredits.toFixed(12))});
    },
  };
}

function normalizeSourceCommit(value) {
  if (!/^[a-f0-9]{40}$/i.test(String(value || ''))) {
    throw new Error('AI-5 sourceCommit must be an exact 40-hex commit SHA');
  }
  return String(value).toLowerCase();
}

function validateProviderReport(report, label) {
  if (!report || typeof report !== 'object') throw new Error(`AI-5 ${label} provider report is required`);
  const requestCount = finiteNumber(report.requestCount, `${label} request count`);
  const latencyMs = finiteNumber(report.latencyMs, `${label} latency`);
  const promptTokens = finiteNumber(report.promptTokens, `${label} prompt tokens`);
  const totalTokens = finiteNumber(report.totalTokens, `${label} total tokens`);
  const costCredits = finiteNumber(report.costCredits, `${label} cost credits`);
  if (![requestCount, latencyMs, promptTokens, totalTokens].every(Number.isInteger)) {
    throw new Error(`AI-5 ${label} provider counts and latency must be integers`);
  }
  if (requestCount > 1) throw new Error(`AI-5 ${label} exceeded its one-request budget`);
  return Object.freeze({requestCount, latencyMs, promptTokens, totalTokens, costCredits});
}

function nonNegativeDelta(after, before, label) {
  const delta = after - before;
  if (delta < -1e-9) throw new Error(`AI-5 ${label} moved backwards during acceptance`);
  return Number(Math.max(0, delta).toFixed(12));
}

export function buildAi5ProviderEvidence({sourceCommit, before, after, indexReport, benchmarkReport}) {
  const commit = normalizeSourceCommit(sourceCommit);
  const safeBefore = Object.freeze({...before});
  const safeAfter = Object.freeze({...after});
  if (safeBefore.limitUsd !== safeAfter.limitUsd || safeBefore.limitReset !== null || safeAfter.limitReset !== null) {
    throw new Error('AI-5 key hard-limit policy changed during acceptance');
  }

  const documentEmbeddings = validateProviderReport(indexReport?.provider, 'document embeddings');
  const benchmarkQueries = validateProviderReport(benchmarkReport?.provider, 'benchmark query embeddings');

  return Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'real-provider-acceptance',
    sourceCommit: commit,
    publicAiMode: 'off',
    keyPolicy: {
      maxAllowedLimitUsd: AI5_MAX_KEY_LIMIT_USD,
      configuredLimitUsd: safeAfter.limitUsd,
      lifetimeNoReset: true,
      expiresAt: safeAfter.expiresAt,
    },
    keyAccounting: {
      beforeUsageUsd: safeBefore.usageUsd,
      afterUsageUsd: safeAfter.usageUsd,
      runUsageDeltaUsd: nonNegativeDelta(safeAfter.usageUsd, safeBefore.usageUsd, 'key usage'),
      beforeLimitRemainingUsd: safeBefore.limitRemainingUsd,
      afterLimitRemainingUsd: safeAfter.limitRemainingUsd,
    },
    candidateIndex: {
      chunkCount: indexReport.chunkCount,
      refreshed: indexReport.refreshed,
      reused: indexReport.reused,
      corpusDigest: indexReport.corpusDigest,
      embeddingsDigest: indexReport.embeddingsDigest,
      sourceCommit: indexReport.sourceCommit,
    },
    benchmarkQueryCache: {
      caseCount: benchmarkReport.caseCount,
      refreshed: benchmarkReport.refreshed,
      reused: benchmarkReport.reused,
      benchmarkDigest: benchmarkReport.benchmarkDigest,
      embeddingsDigest: benchmarkReport.embeddingsDigest,
      sourceCommit: benchmarkReport.sourceCommit,
    },
    provider: {
      documentEmbeddings,
      benchmarkQueries,
    },
  });
}

export async function runAi5ProviderAcceptance({
  rootDir,
  apiKey,
  sourceCommit,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof rootDir !== 'string' || !rootDir) throw new Error('AI-5 rootDir is required');
  const commit = normalizeSourceCommit(sourceCommit);
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  if (config.mode !== 'off' || config.workerBaseUrl !== '') {
    throw new Error('AI-5 real-provider acceptance requires public AI mode OFF and no Worker URL');
  }

  const before = await fetchCurrentKeyMetadata({apiKey, fetchImpl});

  const documentAccounting = createEmbeddingAccountingFetch(fetchImpl);
  const indexBase = await refreshAiIndex({
    rootDir,
    config,
    apiKey,
    fetchImpl: documentAccounting.fetch,
    sourceCommit: commit,
  });
  const indexReport = {...indexBase, provider: documentAccounting.report()};

  const corpus = buildAiCorpus({rootDir, config});
  const cases = loadBenchmark(
    path.join(rootDir, 'data', 'ai-navigator-benchmark.json'),
    new Set(corpus.map(({id}) => id)),
  );
  const benchmarkAccounting = createEmbeddingAccountingFetch(fetchImpl);
  const benchmarkBase = await refreshBenchmarkQueryEmbeddings({
    cases,
    config,
    cacheDir: path.join(rootDir, 'data', 'ai-index', 'benchmark-query-cache'),
    apiKey,
    fetchImpl: benchmarkAccounting.fetch,
    sourceCommit: commit,
  });
  const benchmarkReport = {...benchmarkBase, provider: benchmarkAccounting.report()};

  const after = await fetchCurrentKeyMetadata({apiKey, fetchImpl});
  return buildAi5ProviderEvidence({sourceCommit: commit, before, after, indexReport, benchmarkReport});
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const report = await runAi5ProviderAcceptance({
      rootDir,
      apiKey: process.env.OPENROUTER_API_KEY,
      sourceCommit: process.env.GITHUB_SHA,
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
