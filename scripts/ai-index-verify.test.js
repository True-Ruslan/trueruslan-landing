import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {refreshAiIndex} from './ai-index.js';
import {verifyAiIndex} from './ai-index-verify.js';

const VECTOR = Object.freeze(Array.from({length: 512}, (_, index) => Math.sin(index + 1)));

function config(overrides = {}) {
  return {
    schemaVersion: 1,
    mode: 'off',
    workerBaseUrl: '',
    embeddingModel: 'openai/text-embedding-3-small',
    embeddingDimensions: 512,
    answerModel: 'google/gemini-2.5-flash-lite',
    maxQueryChars: 500,
    maxResults: 5,
    answerMaxChunks: 5,
    answerMaxContextChars: 18000,
    answerMaxTokens: 700,
    includePagePaths: ['landing/about.html'],
    hybridWeights: null,
    ...overrides,
  };
}

function fixtureRoot(text = 'stable') {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-verify-'));
  fs.mkdirSync(path.join(rootDir, 'data'), {recursive: true});
  fs.mkdirSync(path.join(rootDir, 'docs', 'landing'), {recursive: true});
  fs.writeFileSync(path.join(rootDir, 'data', 'page-meta.json'), JSON.stringify([
    {path: 'landing/about.html', title: 'About'},
  ]));
  fs.writeFileSync(path.join(rootDir, 'data', 'notes.json'), '[]');
  fs.writeFileSync(path.join(rootDir, 'data', 'publications.json'), '[]');
  fs.writeFileSync(
    path.join(rootDir, 'docs', 'landing', 'about.md'),
    `# About\n\n${text} public engineering profile text is intentionally long enough for deterministic semantic indexing and offline artifact verification without any provider access.\n`,
  );
  return rootDir;
}

async function createIndex(rootDir) {
  return refreshAiIndex({
    rootDir,
    config: config(),
    apiKey: 'test-key',
    sourceCommit: '0123456789abcdef0123456789abcdef01234567',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() { return {data: [{index: 0, embedding: VECTOR}]}; },
    }),
  });
}

test('offline verifier accepts a fresh deterministic index and reports immutable evidence', async () => {
  const rootDir = fixtureRoot();
  await createIndex(rootDir);
  let networkUsed = false;
  const report = verifyAiIndex({rootDir, config: config(), fetchImpl: () => { networkUsed = true; }});
  assert.equal(networkUsed, false);
  assert.equal(report.chunkCount, 1);
  assert.equal(report.embeddingModel, 'openai/text-embedding-3-small');
  assert.equal(report.dimensions, 512);
  assert.match(report.corpusDigest, /^sha256:[a-f0-9]{64}$/);
  assert.match(report.embeddingsDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(report.sourceCommit, '0123456789abcdef0123456789abcdef01234567');
});

test('offline verifier rejects stale corpus, corrupt binary and configured model mismatch', async () => {
  const staleRoot = fixtureRoot();
  await createIndex(staleRoot);
  fs.writeFileSync(
    path.join(staleRoot, 'docs', 'landing', 'about.md'),
    '# About\n\nChanged canonical reader text makes the committed AI index stale and must be detected locally without calling OpenRouter or accepting old vectors.\n',
  );
  assert.throws(() => verifyAiIndex({rootDir: staleRoot, config: config()}), /stale|corpus|hash/i);

  const corruptRoot = fixtureRoot();
  await createIndex(corruptRoot);
  const binaryPath = path.join(corruptRoot, 'data', 'ai-index', 'embeddings.bin');
  const binary = fs.readFileSync(binaryPath);
  binary[0] ^= 0xff;
  fs.writeFileSync(binaryPath, binary);
  assert.throws(() => verifyAiIndex({rootDir: corruptRoot, config: config()}), /digest|corrupt|embedding/i);

  const modelRoot = fixtureRoot();
  await createIndex(modelRoot);
  assert.throws(
    () => verifyAiIndex({rootDir: modelRoot, config: config({embeddingDimensions: 256})}),
    /dimension|256|512/i,
  );
});

test('offline verifier rejects missing and structurally inconsistent index artifacts', () => {
  const rootDir = fixtureRoot();
  assert.throws(() => verifyAiIndex({rootDir, config: config()}), /missing|unavailable/i);
});
