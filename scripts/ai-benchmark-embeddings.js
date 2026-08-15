import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildAiCorpus} from './ai-corpus.js';
import {loadAiConfig} from './ai-config.js';

const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_SCHEMA_VERSION = 1;
const META_FILE = 'benchmark-query-meta.json';
const EMBEDDINGS_FILE = 'benchmark-query-embeddings.bin';

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}

function normalizedCases(cases) {
  if (!Array.isArray(cases) || cases.length === 0) throw new Error('benchmark cases must be a non-empty array');
  const seen = new Set();
  return cases.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('benchmark case must be an object');
    if (typeof item.id !== 'string' || !item.id || seen.has(item.id)) throw new Error(`benchmark case ID is invalid or duplicated: ${String(item.id)}`);
    if (typeof item.query !== 'string' || !item.query.trim()) throw new Error(`benchmark query is invalid for ${item.id}`);
    seen.add(item.id);
    return {
      id: item.id,
      lang: item.lang,
      query: item.query.trim(),
      kind: item.kind,
      expectedAnyOf: Array.isArray(item.expectedAnyOf) ? [...item.expectedAnyOf] : [],
      answerEligible: item.answerEligible === true,
    };
  });
}

function benchmarkDigest(cases) {
  return sha256(`${JSON.stringify(normalizedCases(cases))}\n`);
}

function queryHashes(cases) {
  return Object.fromEntries(normalizedCases(cases).map(({id, query}) => [id, sha256(query)]));
}

function validateConfig(config) {
  if (!config || typeof config.embeddingModel !== 'string' || !config.embeddingModel) throw new Error('benchmark embedding model is required');
  if (!Number.isInteger(config.embeddingDimensions) || config.embeddingDimensions <= 0) throw new Error('benchmark embedding dimensions must be a positive integer');
}

export function createBenchmarkEmbeddingRequest({queries, config}) {
  validateConfig(config);
  if (!Array.isArray(queries) || queries.length === 0 || queries.some((query) => typeof query !== 'string' || !query.trim())) {
    throw new Error('benchmark embedding queries must be non-empty strings');
  }
  return {
    url: OPENROUTER_EMBEDDINGS_URL,
    body: {
      model: config.embeddingModel,
      dimensions: config.embeddingDimensions,
      input_type: 'search_query',
      input: queries.map((query) => query.trim()),
      provider: {
        zdr: true,
        data_collection: 'deny',
      },
    },
  };
}

function encodeVectors(vectors, dimensions) {
  const buffer = Buffer.alloc(vectors.length * dimensions * 4);
  let offset = 0;
  for (const vector of vectors) {
    if (!Array.isArray(vector) || vector.length !== dimensions || !vector.every(Number.isFinite)) {
      throw new Error(`benchmark embedding vector must contain exactly ${dimensions} finite values`);
    }
    for (const value of vector) {
      buffer.writeFloatLE(value, offset);
      offset += 4;
    }
  }
  return buffer;
}

function decodeVectors(buffer, caseIds, dimensions) {
  const expectedLength = caseIds.length * dimensions * 4;
  if (buffer.length !== expectedLength) {
    throw new Error(`benchmark embedding binary length mismatch: expected ${expectedLength}, got ${buffer.length}`);
  }
  const vectors = new Map();
  let offset = 0;
  for (const id of caseIds) {
    const vector = new Array(dimensions);
    for (let index = 0; index < dimensions; index += 1) {
      const value = buffer.readFloatLE(offset);
      if (!Number.isFinite(value)) throw new Error(`benchmark embedding binary contains non-finite value for ${id}`);
      vector[index] = value;
      offset += 4;
    }
    vectors.set(id, vector);
  }
  return vectors;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`benchmark query cache missing ${label}`);
    if (error instanceof SyntaxError) throw new Error(`benchmark query cache ${label} is not valid JSON`);
    throw error;
  }
}

function validateSourceCommit(value) {
  if (value === null || value === undefined) return null;
  if (!/^[a-f0-9]{40}$/i.test(String(value))) throw new Error('benchmark query cache sourceCommit must be null or a 40-hex SHA');
  return String(value).toLowerCase();
}

function validateMeta(meta, {cases, config, embeddings}) {
  const currentCases = normalizedCases(cases);
  const caseIds = currentCases.map(({id}) => id);
  const hashes = queryHashes(currentCases);
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error('benchmark query cache metadata is invalid');
  if (meta.schemaVersion !== CACHE_SCHEMA_VERSION) throw new Error(`benchmark query cache schema mismatch: ${String(meta.schemaVersion)}`);
  if (meta.embeddingModel !== config.embeddingModel) throw new Error('benchmark query cache model mismatch');
  if (meta.dimensions !== config.embeddingDimensions) throw new Error('benchmark query cache dimension mismatch');
  if (meta.benchmarkDigest !== benchmarkDigest(currentCases)) throw new Error('benchmark query cache is stale: benchmark digest mismatch');
  if (JSON.stringify(meta.caseIds) !== JSON.stringify(caseIds)) throw new Error('benchmark query cache is stale: case ID order mismatch');
  if (JSON.stringify(meta.queryHashes) !== JSON.stringify(hashes)) throw new Error('benchmark query cache is stale: query hash mismatch');
  validateSourceCommit(meta.sourceCommit ?? null);
  const digest = sha256(embeddings);
  if (meta.embeddingsDigest !== digest) throw new Error('benchmark query cache embedding digest mismatch');
  return {caseIds, hashes, digest};
}

export function verifyBenchmarkQueryEmbeddings({cases, config, cacheDir}) {
  validateConfig(config);
  if (typeof cacheDir !== 'string' || !cacheDir) throw new Error('benchmark query cacheDir is required');
  const meta = readJson(path.join(cacheDir, META_FILE), META_FILE);
  let embeddings;
  try {
    embeddings = fs.readFileSync(path.join(cacheDir, EMBEDDINGS_FILE));
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`benchmark query cache missing ${EMBEDDINGS_FILE}`);
    throw error;
  }
  const validated = validateMeta(meta, {cases, config, embeddings});
  const vectors = decodeVectors(embeddings, validated.caseIds, config.embeddingDimensions);
  return {
    caseCount: validated.caseIds.length,
    embeddingModel: meta.embeddingModel,
    dimensions: meta.dimensions,
    benchmarkDigest: meta.benchmarkDigest,
    embeddingsDigest: meta.embeddingsDigest,
    sourceCommit: meta.sourceCommit ?? null,
    vectors,
  };
}

function existingReusableCache({cases, config, cacheDir}) {
  try {
    const meta = readJson(path.join(cacheDir, META_FILE), META_FILE);
    const embeddings = fs.readFileSync(path.join(cacheDir, EMBEDDINGS_FILE));
    if (meta?.schemaVersion !== CACHE_SCHEMA_VERSION
      || meta.embeddingModel !== config.embeddingModel
      || meta.dimensions !== config.embeddingDimensions
      || !Array.isArray(meta.caseIds)
      || !meta.queryHashes
      || typeof meta.queryHashes !== 'object') return null;
    if (meta.embeddingsDigest !== sha256(embeddings)) return null;
    const vectors = decodeVectors(embeddings, meta.caseIds, config.embeddingDimensions);
    const currentIds = new Set(normalizedCases(cases).map(({id}) => id));
    if (meta.caseIds.some((id) => !currentIds.has(id))) {
      // Removed cases are harmless for reuse; they are simply not written into the next cache.
    }
    return {meta, vectors};
  } catch {
    return null;
  }
}

async function requestEmbeddings({queries, config, apiKey, fetchImpl}) {
  const request = createBenchmarkEmbeddingRequest({queries, config});
  let response;
  try {
    response = await fetchImpl(request.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error('benchmark query embedding provider request failed');
  }
  if (!response?.ok) throw new Error(`benchmark query embedding provider returned HTTP ${response?.status ?? 'unknown'}`);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('benchmark query embedding provider returned invalid JSON');
  }
  if (!payload || !Array.isArray(payload.data) || payload.data.length !== queries.length) {
    throw new Error('benchmark query embedding provider returned partial response');
  }
  const byIndex = new Map();
  for (const item of payload.data) {
    if (!item || !Number.isInteger(item.index) || item.index < 0 || item.index >= queries.length || byIndex.has(item.index)) {
      throw new Error('benchmark query embedding provider returned invalid indices');
    }
    if (!Array.isArray(item.embedding)
      || item.embedding.length !== config.embeddingDimensions
      || !item.embedding.every(Number.isFinite)) {
      throw new Error('benchmark query embedding provider returned dimension mismatch or non-finite vector');
    }
    byIndex.set(item.index, item.embedding);
  }
  return queries.map((_query, index) => {
    const vector = byIndex.get(index);
    if (!vector) throw new Error('benchmark query embedding provider returned partial response');
    return vector;
  });
}

function writeCacheAtomically({cacheDir, metaJson, embeddings}) {
  const parent = path.dirname(cacheDir);
  fs.mkdirSync(parent, {recursive: true});
  const nonce = `${process.pid}-${crypto.randomUUID()}`;
  const tempDir = `${cacheDir}.tmp-${nonce}`;
  const backupDir = `${cacheDir}.bak-${nonce}`;
  fs.mkdirSync(tempDir, {recursive: true});
  fs.writeFileSync(path.join(tempDir, META_FILE), metaJson, 'utf8');
  fs.writeFileSync(path.join(tempDir, EMBEDDINGS_FILE), embeddings);
  let movedPrevious = false;
  try {
    if (fs.existsSync(cacheDir)) {
      fs.renameSync(cacheDir, backupDir);
      movedPrevious = true;
    }
    fs.renameSync(tempDir, cacheDir);
    if (movedPrevious) fs.rmSync(backupDir, {recursive: true, force: true});
  } catch (error) {
    fs.rmSync(tempDir, {recursive: true, force: true});
    if (movedPrevious && !fs.existsSync(cacheDir) && fs.existsSync(backupDir)) fs.renameSync(backupDir, cacheDir);
    throw error;
  }
}

export async function refreshBenchmarkQueryEmbeddings({
  cases,
  config,
  cacheDir,
  apiKey,
  fetchImpl = globalThis.fetch,
  sourceCommit = null,
}) {
  validateConfig(config);
  const currentCases = normalizedCases(cases);
  if (typeof cacheDir !== 'string' || !cacheDir) throw new Error('benchmark query cacheDir is required');
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('OPENROUTER_API_KEY is required for explicit benchmark query embedding refresh');
  if (typeof fetchImpl !== 'function') throw new Error('fetchImpl is required for benchmark query embedding refresh');
  const normalizedSourceCommit = validateSourceCommit(sourceCommit);
  const hashes = queryHashes(currentCases);
  const existing = existingReusableCache({cases: currentCases, config, cacheDir});
  const vectorsById = new Map();
  const changed = [];

  for (const item of currentCases) {
    const reusable = existing
      && existing.meta.queryHashes?.[item.id] === hashes[item.id]
      && existing.vectors.has(item.id);
    if (reusable) vectorsById.set(item.id, existing.vectors.get(item.id));
    else changed.push(item);
  }

  if (changed.length > 0) {
    const fetched = await requestEmbeddings({
      queries: changed.map(({query}) => query),
      config,
      apiKey: apiKey.trim(),
      fetchImpl,
    });
    changed.forEach((item, index) => vectorsById.set(item.id, fetched[index]));
  }

  const orderedVectors = currentCases.map(({id}) => {
    const vector = vectorsById.get(id);
    if (!vector) throw new Error(`benchmark query cache missing vector for ${id}`);
    return vector;
  });
  const embeddings = encodeVectors(orderedVectors, config.embeddingDimensions);
  const meta = {
    schemaVersion: CACHE_SCHEMA_VERSION,
    embeddingModel: config.embeddingModel,
    dimensions: config.embeddingDimensions,
    benchmarkDigest: benchmarkDigest(currentCases),
    caseIds: currentCases.map(({id}) => id),
    queryHashes: hashes,
    embeddingsDigest: sha256(embeddings),
    sourceCommit: normalizedSourceCommit,
  };
  const metaJson = `${JSON.stringify(meta, null, 2)}\n`;
  writeCacheAtomically({cacheDir, metaJson, embeddings});
  return {
    caseCount: currentCases.length,
    refreshed: changed.length,
    reused: currentCases.length - changed.length,
    benchmarkDigest: meta.benchmarkDigest,
    embeddingsDigest: meta.embeddingsDigest,
    sourceCommit: meta.sourceCommit,
  };
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const [{loadBenchmark}, config] = await Promise.all([
      import('./ai-benchmark.js'),
      Promise.resolve(loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'))),
    ]);
    const corpus = buildAiCorpus({rootDir, config});
    const cases = loadBenchmark({rootDir, validChunkIds: new Set(corpus.map(({id}) => id))});
    const sourceCommit = /^[a-f0-9]{40}$/i.test(process.env.GITHUB_SHA || '') ? process.env.GITHUB_SHA : null;
    const report = await refreshBenchmarkQueryEmbeddings({
      cases,
      config,
      cacheDir: path.join(rootDir, 'data', 'ai-index', 'benchmark-query-cache'),
      apiKey: process.env.OPENROUTER_API_KEY,
      sourceCommit,
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
