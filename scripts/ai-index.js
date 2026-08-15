import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildAiCorpus, serializeCorpus} from './ai-corpus.js';
import {loadAiConfig} from './ai-config.js';

const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';

function sha256(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
}

function assertVector(vector, dimensions, label) {
  if (!Array.isArray(vector) || vector.length !== dimensions) {
    throw new Error(`${label} embedding dimension mismatch: expected ${dimensions}, got ${vector?.length ?? 'missing'}`);
  }
  if (!vector.every(Number.isFinite)) throw new Error(`${label} embedding contains non-finite values`);
}

function encodeVectors(vectors, dimensions) {
  const buffer = Buffer.alloc(vectors.length * dimensions * 4);
  let offset = 0;
  for (let vectorIndex = 0; vectorIndex < vectors.length; vectorIndex += 1) {
    const vector = vectors[vectorIndex];
    assertVector(vector, dimensions, `vector ${vectorIndex}`);
    for (const value of vector) {
      buffer.writeFloatLE(value, offset);
      offset += 4;
    }
  }
  return buffer;
}

function decodeVectors(buffer, chunkIds, dimensions) {
  const expectedLength = chunkIds.length * dimensions * 4;
  if (buffer.length !== expectedLength) {
    throw new Error(`Existing AI index binary length mismatch: expected ${expectedLength}, got ${buffer.length}`);
  }
  const vectors = new Map();
  let offset = 0;
  for (const chunkId of chunkIds) {
    const vector = new Array(dimensions);
    for (let index = 0; index < dimensions; index += 1) {
      const value = buffer.readFloatLE(offset);
      if (!Number.isFinite(value)) throw new Error(`Existing AI index contains non-finite value for ${chunkId}`);
      vector[index] = value;
      offset += 4;
    }
    vectors.set(chunkId, vector);
  }
  return vectors;
}

function readExistingIndex(indexDir, config) {
  const metaPath = path.join(indexDir, 'index-meta.json');
  const binaryPath = path.join(indexDir, 'embeddings.bin');
  if (!fs.existsSync(metaPath) || !fs.existsSync(binaryPath)) return null;

  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    if (meta.schemaVersion !== 1
      || meta.embeddingModel !== config.embeddingModel
      || meta.dimensions !== config.embeddingDimensions
      || !Array.isArray(meta.chunkIds)
      || !meta.contentHashes
      || typeof meta.contentHashes !== 'object') return null;
    const vectors = decodeVectors(fs.readFileSync(binaryPath), meta.chunkIds, meta.dimensions);
    return {meta, vectors};
  } catch {
    return null;
  }
}

function normalizeSourceCommit(value) {
  if (value === undefined || value === null || value === '') return null;
  if (!/^[a-f0-9]{40}$/i.test(value)) throw new Error('sourceCommit must be a 40-hex Git commit SHA when supplied');
  return value.toLowerCase();
}

function buildMeta({config, chunks, corpusDigest, embeddingsDigest, sourceCommit}) {
  return {
    schemaVersion: 1,
    embeddingModel: config.embeddingModel,
    dimensions: config.embeddingDimensions,
    chunkIds: chunks.map(({id}) => id),
    contentHashes: Object.fromEntries(chunks.map(({id, contentHash}) => [id, contentHash])),
    corpusDigest,
    embeddingsDigest,
    sourceCommit: normalizeSourceCommit(sourceCommit),
  };
}

function writeArtifactsAtomically({rootDir, chunksJson, metaJson, embeddings}) {
  const dataDir = path.join(rootDir, 'data');
  const targetDir = path.join(dataDir, 'ai-index');
  fs.mkdirSync(dataDir, {recursive: true});
  const tempDir = fs.mkdtempSync(path.join(dataDir, '.ai-index-next-'));
  const backupDir = `${targetDir}.previous-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  let movedPrevious = false;

  try {
    fs.writeFileSync(path.join(tempDir, 'chunks.json'), chunksJson, 'utf8');
    fs.writeFileSync(path.join(tempDir, 'index-meta.json'), metaJson, 'utf8');
    fs.writeFileSync(path.join(tempDir, 'embeddings.bin'), embeddings);

    if (fs.existsSync(targetDir)) {
      fs.renameSync(targetDir, backupDir);
      movedPrevious = true;
    }
    fs.renameSync(tempDir, targetDir);
    if (movedPrevious) fs.rmSync(backupDir, {recursive: true, force: true});
  } catch (error) {
    fs.rmSync(tempDir, {recursive: true, force: true});
    if (movedPrevious && !fs.existsSync(targetDir) && fs.existsSync(backupDir)) {
      fs.renameSync(backupDir, targetDir);
    }
    throw error;
  } finally {
    if (fs.existsSync(backupDir) && fs.existsSync(targetDir)) {
      fs.rmSync(backupDir, {recursive: true, force: true});
    }
  }
}

export function createEmbeddingRequest({texts, config}) {
  if (!Array.isArray(texts) || texts.length === 0 || texts.some((text) => typeof text !== 'string' || !text.trim())) {
    throw new Error('Embedding request requires one or more non-empty texts');
  }
  return {
    url: OPENROUTER_EMBEDDINGS_URL,
    body: {
      model: config.embeddingModel,
      dimensions: config.embeddingDimensions,
      input_type: 'search_document',
      input: texts,
      provider: {
        zdr: true,
        data_collection: 'deny',
      },
    },
  };
}

async function requestEmbeddings({chunks, config, apiKey, fetchImpl}) {
  const {url, body} = createEmbeddingRequest({texts: chunks.map(({text}) => text), config});
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response?.ok) throw new Error(`OpenRouter embeddings HTTP ${response?.status ?? 'unknown'}`);

  const payload = await response.json();
  if (!Array.isArray(payload?.data) || payload.data.length !== chunks.length) {
    throw new Error(`OpenRouter embeddings partial response: expected ${chunks.length} vectors, got ${payload?.data?.length ?? 'missing'}`);
  }

  const ordered = new Array(chunks.length);
  for (const item of payload.data) {
    if (!Number.isInteger(item?.index) || item.index < 0 || item.index >= chunks.length || ordered[item.index]) {
      throw new Error('OpenRouter embeddings response contains missing or duplicate indexes');
    }
    assertVector(item.embedding, config.embeddingDimensions, `response index ${item.index}`);
    ordered[item.index] = item.embedding;
  }
  if (ordered.some((vector) => !vector)) throw new Error('OpenRouter embeddings partial response contains missing vectors');
  return ordered;
}

export async function refreshAiIndex({
  rootDir,
  config,
  apiKey,
  fetchImpl = globalThis.fetch,
  sourceCommit = null,
}) {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('OPENROUTER_API_KEY is required for explicit AI index refresh');
  }
  if (typeof fetchImpl !== 'function') throw new Error('fetchImpl is required for AI index refresh');

  const chunks = buildAiCorpus({rootDir, config});
  const chunksJson = serializeCorpus(chunks);
  const corpusDigest = sha256(chunksJson);
  const indexDir = path.join(rootDir, 'data', 'ai-index');
  const existing = readExistingIndex(indexDir, config);
  const vectorById = new Map();
  const changed = [];

  for (const chunk of chunks) {
    const reusable = existing
      && existing.meta.contentHashes?.[chunk.id] === chunk.contentHash
      && existing.vectors.has(chunk.id);
    if (reusable) vectorById.set(chunk.id, existing.vectors.get(chunk.id));
    else changed.push(chunk);
  }

  if (changed.length > 0) {
    const fetched = await requestEmbeddings({chunks: changed, config, apiKey: apiKey.trim(), fetchImpl});
    changed.forEach((chunk, index) => vectorById.set(chunk.id, fetched[index]));
  }

  const vectors = chunks.map(({id}) => {
    const vector = vectorById.get(id);
    if (!vector) throw new Error(`AI index missing vector for ${id}`);
    return vector;
  });
  const embeddings = encodeVectors(vectors, config.embeddingDimensions);
  const embeddingsDigest = sha256(embeddings);
  const meta = buildMeta({config, chunks, corpusDigest, embeddingsDigest, sourceCommit});
  const metaJson = `${JSON.stringify(meta, null, 2)}\n`;

  writeArtifactsAtomically({rootDir, chunksJson, metaJson, embeddings});
  return {
    chunkCount: chunks.length,
    refreshed: changed.length,
    reused: chunks.length - changed.length,
    corpusDigest,
    embeddingsDigest,
    sourceCommit: meta.sourceCommit,
  };
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  const sourceCommit = /^[a-f0-9]{40}$/i.test(process.env.GITHUB_SHA || '') ? process.env.GITHUB_SHA : null;
  try {
    const report = await refreshAiIndex({
      rootDir,
      config,
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
