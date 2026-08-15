import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  createEmbeddingRequest,
  refreshAiIndex,
} from './ai-index.js';

const VECTOR = Object.freeze(Array.from({length: 512}, (_, index) => (index + 1) / 1000));

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

function markdown(label = 'alpha', includeSecond = false) {
  return `# About\n\n${label} introduction describes a deterministic public engineering profile with enough reader-owned prose to form a semantic chunk for indexing and retrieval.\n${includeSecond ? `\n## Reliability\n\n${label} reliability section explains release evidence, production verification, and deterministic quality gates in enough detail to remain a separate useful semantic chunk.\n` : ''}`;
}

function fixtureRoot({text = 'alpha', includeSecond = false} = {}) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-index-'));
  fs.mkdirSync(path.join(rootDir, 'data'), {recursive: true});
  fs.mkdirSync(path.join(rootDir, 'docs', 'landing'), {recursive: true});
  fs.writeFileSync(path.join(rootDir, 'data', 'page-meta.json'), JSON.stringify([
    {path: 'landing/about.html', title: 'About'},
  ]));
  fs.writeFileSync(path.join(rootDir, 'data', 'notes.json'), '[]');
  fs.writeFileSync(path.join(rootDir, 'data', 'publications.json'), '[]');
  fs.writeFileSync(path.join(rootDir, 'docs', 'landing', 'about.md'), markdown(text, includeSecond));
  return rootDir;
}

function embeddingResponse(vectors) {
  return {
    ok: true,
    status: 200,
    async json() {
      return {data: vectors.map((embedding, index) => ({index, embedding}))};
    },
  };
}

function artifactBytes(rootDir) {
  const dir = path.join(rootDir, 'data', 'ai-index');
  return {
    chunks: fs.readFileSync(path.join(dir, 'chunks.json')),
    meta: fs.readFileSync(path.join(dir, 'index-meta.json')),
    embeddings: fs.readFileSync(path.join(dir, 'embeddings.bin')),
  };
}

test('document embedding request is pinned to model, dimensions, input type and privacy routing', () => {
  const request = createEmbeddingRequest({texts: ['first', 'second'], config: config()});
  assert.equal(request.url, 'https://openrouter.ai/api/v1/embeddings');
  assert.deepEqual(request.body, {
    model: 'openai/text-embedding-3-small',
    dimensions: 512,
    input_type: 'search_document',
    input: ['first', 'second'],
    provider: {
      zdr: true,
      data_collection: 'deny',
    },
  });
});

test('refresh writes deterministic Float32 artifacts and reuses unchanged content hashes without fetch', async () => {
  const rootDir = fixtureRoot();
  let calls = 0;
  const first = await refreshAiIndex({
    rootDir,
    config: config(),
    apiKey: 'test-key',
    fetchImpl: async () => {
      calls += 1;
      return embeddingResponse([VECTOR]);
    },
  });
  assert.equal(first.refreshed, 1);
  assert.equal(first.reused, 0);
  assert.equal(calls, 1);

  const second = await refreshAiIndex({
    rootDir,
    config: config(),
    apiKey: 'test-key',
    fetchImpl: async () => {
      throw new Error('unchanged index must not fetch');
    },
  });
  assert.equal(second.refreshed, 0);
  assert.equal(second.reused, 1);

  const bytes = artifactBytes(rootDir);
  const meta = JSON.parse(bytes.meta.toString('utf8'));
  assert.equal(meta.dimensions, 512);
  assert.equal(meta.embeddingModel, 'openai/text-embedding-3-small');
  assert.equal(meta.chunkIds.length, 1);
  assert.equal(bytes.embeddings.length, 512 * 4);
});

test('changed chunks are embedded in deterministic chunk-id order and deleted chunks disappear', async () => {
  const rootDir = fixtureRoot({includeSecond: true});
  await refreshAiIndex({
    rootDir,
    config: config(),
    apiKey: 'test-key',
    fetchImpl: async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.input.length, 2);
      return embeddingResponse([VECTOR, VECTOR.map((value) => value * 2)]);
    },
  });

  fs.writeFileSync(path.join(rootDir, 'docs', 'landing', 'about.md'), markdown('beta', false));
  let requested = null;
  const report = await refreshAiIndex({
    rootDir,
    config: config(),
    apiKey: 'test-key',
    fetchImpl: async (_url, init) => {
      requested = JSON.parse(init.body).input;
      return embeddingResponse([VECTOR.map((value) => value * 3)]);
    },
  });
  assert.equal(report.refreshed, 1);
  assert.equal(report.reused, 0);
  assert.equal(requested.length, 1);

  const meta = JSON.parse(artifactBytes(rootDir).meta.toString('utf8'));
  assert.deepEqual(meta.chunkIds, ['ru:page:about:intro']);
  assert.deepEqual(Object.keys(meta.contentHashes), meta.chunkIds);
});

test('dimension mismatch and partial responses fail closed without replacing the previous index', async () => {
  const mismatchRoot = fixtureRoot();
  await assert.rejects(
    refreshAiIndex({
      rootDir: mismatchRoot,
      config: config(),
      apiKey: 'test-key',
      fetchImpl: async () => embeddingResponse([[1, 2, 3]]),
    }),
    /dimension|512/i,
  );
  assert.equal(fs.existsSync(path.join(mismatchRoot, 'data', 'ai-index')), false);

  const rootDir = fixtureRoot();
  await refreshAiIndex({
    rootDir,
    config: config(),
    apiKey: 'test-key',
    fetchImpl: async () => embeddingResponse([VECTOR]),
  });
  const before = artifactBytes(rootDir);
  fs.writeFileSync(path.join(rootDir, 'docs', 'landing', 'about.md'), markdown('changed'));

  await assert.rejects(
    refreshAiIndex({
      rootDir,
      config: config(),
      apiKey: 'test-key',
      fetchImpl: async () => embeddingResponse([]),
    }),
    /partial|count|missing/i,
  );
  const after = artifactBytes(rootDir);
  assert.deepEqual(after.chunks, before.chunks);
  assert.deepEqual(after.meta, before.meta);
  assert.deepEqual(after.embeddings, before.embeddings);
});

test('missing API key and provider failures never retry automatically', async () => {
  const rootDir = fixtureRoot();
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return {
      ok: false,
      status: 429,
      async text() { return 'rate limited provider detail'; },
    };
  };

  await assert.rejects(
    refreshAiIndex({rootDir, config: config(), apiKey: '', fetchImpl}),
    /OPENROUTER_API_KEY|api key/i,
  );
  assert.equal(calls, 0);

  await assert.rejects(
    refreshAiIndex({rootDir, config: config(), apiKey: 'test-key', fetchImpl}),
    /429/i,
  );
  assert.equal(calls, 1);
});
