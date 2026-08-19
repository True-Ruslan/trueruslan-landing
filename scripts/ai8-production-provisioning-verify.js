import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {verifyAiIndex} from './ai-index-verify.js';
import {
  AI8_MAX_KEY_LIMIT_USD,
  AI8_MAX_RUN_SPEND_USD,
  fetchAi8KeyMetadata,
  probeAi8PublicFull,
} from './ai8-public-full-acceptance.js';

const PUBLIC_ORIGIN = 'https://trueruslan.ru';
const OPENROUTER_CURRENT_KEY_URL = 'https://openrouter.ai/api/v1/key';
export const ACCEPTED_SEARCH_WORKER = 'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev';
export const AI8_PRODUCTION_WORKER = 'https://trueruslan-ai-navigator-ai8-full-production.trueruslan.workers.dev';
const PREACTIVATION_CONFIG_URL = 'https://ai8-preactivation.invalid/_search/ru/';
const ACCEPTED_EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const ACCEPTED_EMBEDDING_DIMENSIONS = 512;
const ACCEPTED_ANSWER_MODEL = 'google/gemini-2.5-flash-lite';
const BASELINE_NEGATIVE_QUESTION = 'Почему успешный deployment ещё не означает production verification?';
const BASELINE_NEGATIVE_CHUNK_ID = 'ru:note:deployment-success-is-not-production-verification:chto-izmenilos-v-moem-ponimanii-deployment';

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
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

export function validateAi8ProductionWorkerBaseUrl(value) {
  const origin = cleanHttpsOrigin(value, 'production Worker base URL');
  if (origin !== AI8_PRODUCTION_WORKER) {
    throw new Error('AI-8 production Worker must use the dedicated ai8-full-production workers.dev identity');
  }
  if (origin === ACCEPTED_SEARCH_WORKER || origin.includes('ai7-full-canary')) {
    throw new Error('AI-8 production Worker must not reuse an accepted SEARCH or AI-7 canary Worker');
  }
  return origin;
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
    for (let dimension = 0; dimension < dimensions; dimension += 1) {
      vector[dimension] = bytes.readFloatLE(base + dimension * 4);
    }
    return vector;
  });
  return {chunks, embeddings};
}

function renderSyntheticFullConfig(config, workerBaseUrl) {
  const fullConfig = {...config, mode: 'full', workerBaseUrl};
  return `<!doctype html><html><body><script id="tr-ai-search-config" type="application/json">${JSON.stringify(fullConfig)}</script></body></html>`;
}

export function createAi8ProvisioningFetchGuard({workerBaseUrl, config, fetchImpl = globalThis.fetch}) {
  if (typeof fetchImpl !== 'function') throw new Error('AI-8 provisioning verification requires fetchImpl');
  const productionWorker = validateAi8ProductionWorkerBaseUrl(workerBaseUrl);
  const allowed = new Set([
    OPENROUTER_CURRENT_KEY_URL,
    `${productionWorker}/v1/embed`,
    `${productionWorker}/v1/answer`,
    `${ACCEPTED_SEARCH_WORKER}/v1/answer`,
  ]);
  let unexpected = 0;
  let externalRequests = 0;

  return {
    fetchImpl: async (url, init = {}) => {
      const target = String(url);
      if (target === PREACTIVATION_CONFIG_URL) {
        return new Response(renderSyntheticFullConfig(config, productionWorker), {
          status: 200,
          headers: {'Content-Type': 'text/html; charset=utf-8'},
        });
      }
      if (!allowed.has(target)) {
        unexpected += 1;
        throw new Error('AI-8 provisioning blocked an unexpected external request');
      }
      externalRequests += 1;
      return fetchImpl(url, {...init, redirect: 'error'});
    },
    unexpectedCount: () => unexpected,
    externalRequestCount: () => externalRequests,
  };
}

async function responseJson(response, label) {
  try {
    return await response.json();
  } catch {
    throw new Error(`AI-8 provisioning ${label} returned invalid JSON`);
  }
}

async function verifyAcceptedSearchStillDisablesAnswers(fetchImpl) {
  const response = await fetchImpl(`${ACCEPTED_SEARCH_WORKER}/v1/answer`, {
    method: 'POST',
    headers: {Origin: PUBLIC_ORIGIN, 'Content-Type': 'application/json'},
    body: JSON.stringify({question: BASELINE_NEGATIVE_QUESTION, chunkIds: [BASELINE_NEGATIVE_CHUNK_ID]}),
  });
  const payload = await responseJson(response, 'public SEARCH negative probe');
  if (response.status !== 503 || payload.code !== 'feature_disabled') {
    throw new Error('AI-8 provisioning requires the accepted public SEARCH Worker answer route to remain disabled');
  }
  return 'disabled';
}

function nonNegativeDelta(after, before) {
  const delta = after - before;
  if (delta < -1e-9) throw new Error('AI-8 provisioning key usage moved backwards');
  return Number(Math.max(0, delta).toFixed(12));
}

export function buildAi8ProvisioningEvidence({sourceCommit, before, after, workerBaseUrl, probeReport, publicAnswerEndpoint, unexpectedRequests, externalRequests}) {
  if (!/^[a-f0-9]{40}$/i.test(String(sourceCommit || ''))) {
    throw new Error('AI-8 provisioning sourceCommit must be an exact 40-hex SHA');
  }
  if (!before || !after || before.limitUsd !== after.limitUsd || before.limitReset !== null || after.limitReset !== null) {
    throw new Error('AI-8 provisioning key hard-limit policy changed during verification');
  }
  if (publicAnswerEndpoint !== 'disabled') {
    throw new Error('AI-8 provisioning requires public SEARCH answer-disable evidence');
  }
  if (unexpectedRequests !== 0) {
    throw new Error('AI-8 provisioning observed an unexpected external request');
  }
  if (!Number.isInteger(externalRequests) || externalRequests < 1 || externalRequests > 16) {
    throw new Error('AI-8 provisioning external request count is outside the bounded contract');
  }
  const runUsageDeltaUsd = nonNegativeDelta(after.usageUsd, before.usageUsd);
  if (runUsageDeltaUsd > AI8_MAX_RUN_SPEND_USD) {
    throw new Error(`AI-8 provisioning spend exceeded $${AI8_MAX_RUN_SPEND_USD}`);
  }

  return Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'ai8-production-provisioning',
    sourceCommit: String(sourceCommit).toLowerCase(),
    publicAiMode: 'search',
    productionRuntimeMode: 'full',
    productionWorkerProvisioned: true,
    publicFullActivated: false,
    publicAnswerEndpoint: 'disabled',
    workerOriginDigest: sha256(validateAi8ProductionWorkerBaseUrl(workerBaseUrl)),
    keyPolicy: {
      maxAllowedLimitUsd: AI8_MAX_KEY_LIMIT_USD,
      maxRunSpendUsd: AI8_MAX_RUN_SPEND_USD,
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
    externalRequestCount: externalRequests,
    unexpectedExternalRequests: 0,
    sanitized: true,
  });
}

export async function runAi8ProductionProvisioningVerification({rootDir, workerBaseUrl, apiKey, sourceCommit, fetchImpl = globalThis.fetch}) {
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  if (config.mode !== 'search' || config.workerBaseUrl !== ACCEPTED_SEARCH_WORKER) {
    throw new Error('AI-8 provisioning verification requires the exact accepted public SEARCH baseline');
  }
  if (config.embeddingModel !== ACCEPTED_EMBEDDING_MODEL
    || config.embeddingDimensions !== ACCEPTED_EMBEDDING_DIMENSIONS
    || config.answerModel !== ACCEPTED_ANSWER_MODEL) {
    throw new Error('AI-8 provisioning verification requires the accepted model contract');
  }

  const productionWorker = validateAi8ProductionWorkerBaseUrl(workerBaseUrl);
  const {chunks, embeddings} = loadRestoredIndex(rootDir, config);
  const guard = createAi8ProvisioningFetchGuard({workerBaseUrl: productionWorker, config, fetchImpl});
  const before = await fetchAi8KeyMetadata({apiKey, fetchImpl: guard.fetchImpl});
  const probeReport = await probeAi8PublicFull({
    workerBaseUrl: productionWorker,
    origin: PUBLIC_ORIGIN,
    publicSearchUrl: PREACTIVATION_CONFIG_URL,
    embeddingModel: config.embeddingModel,
    embeddingDimensions: config.embeddingDimensions,
    rankingConfig: config,
    chunks,
    embeddings,
    fetchImpl: guard.fetchImpl,
  });
  const publicAnswerEndpoint = await verifyAcceptedSearchStillDisablesAnswers(guard.fetchImpl);
  const after = await fetchAi8KeyMetadata({apiKey, fetchImpl: guard.fetchImpl});
  return buildAi8ProvisioningEvidence({
    sourceCommit,
    before,
    after,
    workerBaseUrl: productionWorker,
    probeReport,
    publicAnswerEndpoint,
    unexpectedRequests: guard.unexpectedCount(),
    externalRequests: guard.externalRequestCount(),
  });
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outputDir = path.join(rootDir, 'quality-artifacts');
  const outputPath = path.join(outputDir, 'ai8-production-provisioning.json');
  const digestPath = `${outputPath}.sha256`;
  try {
    if (process.env.GITHUB_REF !== 'refs/heads/master') throw new Error('AI-8 provisioning verification is master-only');
    if (process.env.AI8_CONFIRM_PROVISION !== 'true') throw new Error('AI-8 provisioning verification requires explicit confirmation');
    const evidence = await runAi8ProductionProvisioningVerification({
      rootDir,
      workerBaseUrl: process.env.AI8_FULL_WORKER_BASE_URL,
      apiKey: process.env.OPENROUTER_AI8_API_KEY,
      sourceCommit: process.env.GITHUB_SHA,
    });
    fs.mkdirSync(outputDir, {recursive: true});
    const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
    fs.writeFileSync(outputPath, serialized);
    fs.writeFileSync(digestPath, `${sha256(serialized)}\n`);
    process.stdout.write(`AI-8 production provisioning verification: PASS; evidenceDigest=${sha256(serialized)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
