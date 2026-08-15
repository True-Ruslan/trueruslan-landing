import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildAiCorpus, serializeCorpus} from './ai-corpus.js';
import {loadAiConfig} from './ai-config.js';

function sha256(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
}

function readRequired(filePath, label) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`AI index unavailable: missing ${label}`);
    throw error;
  }
}

function parseJson(buffer, label) {
  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch {
    throw new Error(`AI index ${label} is not valid JSON`);
  }
}

function sameObject(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function verifyAiIndex({rootDir, config}) {
  const indexDir = path.join(rootDir, 'data', 'ai-index');
  const chunksBytes = readRequired(path.join(indexDir, 'chunks.json'), 'chunks.json');
  const metaBytes = readRequired(path.join(indexDir, 'index-meta.json'), 'index-meta.json');
  const embeddings = readRequired(path.join(indexDir, 'embeddings.bin'), 'embeddings.bin');
  const storedChunks = parseJson(chunksBytes, 'chunks.json');
  const meta = parseJson(metaBytes, 'index-meta.json');

  if (meta.schemaVersion !== 1) throw new Error(`AI index schema mismatch: ${String(meta.schemaVersion)}`);
  if (meta.embeddingModel !== config.embeddingModel) {
    throw new Error(`AI index embedding model mismatch: ${String(meta.embeddingModel)} != ${config.embeddingModel}`);
  }
  if (meta.dimensions !== config.embeddingDimensions) {
    throw new Error(`AI index dimension mismatch: ${String(meta.dimensions)} != ${config.embeddingDimensions}`);
  }
  if (!Array.isArray(meta.chunkIds) || !meta.contentHashes || typeof meta.contentHashes !== 'object') {
    throw new Error('AI index metadata has inconsistent chunk structure');
  }
  if (meta.sourceCommit !== null && !/^[a-f0-9]{40}$/i.test(String(meta.sourceCommit))) {
    throw new Error('AI index sourceCommit must be null or a 40-hex SHA');
  }

  const currentChunks = buildAiCorpus({rootDir, config});
  const currentJson = serializeCorpus(currentChunks);
  const currentDigest = sha256(currentJson);
  if (meta.corpusDigest !== currentDigest) {
    throw new Error(`AI index corpus is stale: expected ${currentDigest}, got ${String(meta.corpusDigest)}`);
  }

  const expectedIds = currentChunks.map(({id}) => id);
  if (!sameObject(meta.chunkIds, expectedIds)) throw new Error('AI index chunk order is stale or inconsistent');
  const expectedHashes = Object.fromEntries(currentChunks.map(({id, contentHash}) => [id, contentHash]));
  if (!sameObject(meta.contentHashes, expectedHashes)) throw new Error('AI index content hashes are stale or inconsistent');
  if (chunksBytes.toString('utf8') !== currentJson) throw new Error('AI index chunks.json is stale or not deterministic');
  if (!Array.isArray(storedChunks) || storedChunks.length !== currentChunks.length) {
    throw new Error('AI index chunks.json has inconsistent structure');
  }

  const expectedBytes = expectedIds.length * config.embeddingDimensions * 4;
  if (embeddings.length !== expectedBytes) {
    throw new Error(`AI index embedding binary length mismatch: expected ${expectedBytes}, got ${embeddings.length}`);
  }
  const embeddingsDigest = sha256(embeddings);
  if (meta.embeddingsDigest !== embeddingsDigest) {
    throw new Error(`AI index embedding digest mismatch: expected ${embeddingsDigest}, got ${String(meta.embeddingsDigest)}`);
  }
  for (let offset = 0; offset < embeddings.length; offset += 4) {
    if (!Number.isFinite(embeddings.readFloatLE(offset))) throw new Error('AI index embedding binary contains non-finite values');
  }

  return {
    chunkCount: currentChunks.length,
    embeddingModel: meta.embeddingModel,
    dimensions: meta.dimensions,
    corpusDigest: meta.corpusDigest,
    embeddingsDigest: meta.embeddingsDigest,
    sourceCommit: meta.sourceCommit,
  };
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  try {
    const report = verifyAiIndex({rootDir, config});
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) runCli();
