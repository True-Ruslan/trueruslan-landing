import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {rankChunks} from './ai-retrieval-core.js';
import {
  createLexicalRetriever,
  evaluateRetrieval,
  runSemanticBenchmark,
} from './ai-benchmark.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_URL = new URL('./ai-benchmark-embeddings.js', import.meta.url);

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-benchmark-cache-'));
}

function config(dimensions = 3) {
  return {
    embeddingModel: 'openai/text-embedding-3-small',
    embeddingDimensions: dimensions,
  };
}

const CASES = Object.freeze([
  Object.freeze({id: 'case-a', lang: 'ru', query: 'semantic alpha', kind: 'exact', expectedAnyOf: ['ru:page:alpha:intro'], answerEligible: true}),
  Object.freeze({id: 'case-b', lang: 'en', query: 'semantic beta', kind: 'paraphrase', expectedAnyOf: ['en:page:beta:intro'], answerEligible: true}),
  Object.freeze({id: 'case-c', lang: 'ru', query: 'private missing fact', kind: 'insufficient', expectedAnyOf: [], answerEligible: false}),
]);

async function loadCacheModule() {
  return import(MODULE_URL.href);
}

function vectorResponse(vectors) {
  return new Response(JSON.stringify({
    data: vectors.map((embedding, index) => ({index, embedding})),
  }), {status: 200, headers: {'Content-Type': 'application/json'}});
}

function readCacheBytes(cacheDir) {
  return {
    meta: fs.readFileSync(path.join(cacheDir, 'benchmark-query-meta.json')),
    binary: fs.readFileSync(path.join(cacheDir, 'benchmark-query-embeddings.bin')),
  };
}

test('package exposes explicit semantic benchmark maintenance commands without ordinary build coupling', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['ai:benchmark'], 'node scripts/ai-benchmark.js');
  assert.equal(pkg.scripts['ai:benchmark:refresh'], 'node scripts/ai-benchmark-embeddings.js');
  for (const name of ['build', 'build:docs', 'copy-assets', 'test', 'check:ai']) {
    const script = pkg.scripts[name] || '';
    assert.equal(/ai:benchmark(?::refresh)?/.test(script), false, `${name} must not invoke semantic benchmark refresh`);
  }
});

test('benchmark query embedding request is pinned to search_query and privacy routing', async () => {
  const {createBenchmarkEmbeddingRequest} = await loadCacheModule();
  const request = createBenchmarkEmbeddingRequest({queries: ['alpha', 'beta'], config: config(3)});
  assert.equal(request.url, 'https://openrouter.ai/api/v1/embeddings');
  assert.deepEqual(request.body, {
    model: 'openai/text-embedding-3-small',
    dimensions: 3,
    input_type: 'search_query',
    input: ['alpha', 'beta'],
    provider: {zdr: true, data_collection: 'deny'},
  });
});

test('benchmark query cache refresh is deterministic, reuses query hashes and fetches only changed queries', async () => {
  const {refreshBenchmarkQueryEmbeddings, verifyBenchmarkQueryEmbeddings} = await loadCacheModule();
  const cacheDir = tmpDir();
  const calls = [];
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    return vectorResponse(body.input.map((query) => query.includes('alpha') ? [1, 0, 0] : query.includes('beta') ? [0, 1, 0] : [0, 0, 1]));
  };

  try {
    const first = await refreshBenchmarkQueryEmbeddings({
      cases: CASES,
      config: config(3),
      cacheDir,
      apiKey: 'ephemeral-test-key',
      fetchImpl,
      sourceCommit: 'a'.repeat(40),
    });
    assert.deepEqual({refreshed: first.refreshed, reused: first.reused}, {refreshed: 3, reused: 0});
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].input, CASES.map(({query}) => query));

    const firstBytes = readCacheBytes(cacheDir);
    const second = await refreshBenchmarkQueryEmbeddings({
      cases: CASES,
      config: config(3),
      cacheDir,
      apiKey: 'ephemeral-test-key',
      fetchImpl,
      sourceCommit: 'a'.repeat(40),
    });
    assert.deepEqual({refreshed: second.refreshed, reused: second.reused}, {refreshed: 0, reused: 3});
    assert.equal(calls.length, 1, 'unchanged query cache must require zero provider calls');
    assert.deepEqual(readCacheBytes(cacheDir), firstBytes, 'identical refresh must be byte deterministic');

    const changed = CASES.map((item) => item.id === 'case-b' ? {...item, query: 'semantic beta changed'} : item);
    const third = await refreshBenchmarkQueryEmbeddings({
      cases: changed,
      config: config(3),
      cacheDir,
      apiKey: 'ephemeral-test-key',
      fetchImpl,
      sourceCommit: 'b'.repeat(40),
    });
    assert.deepEqual({refreshed: third.refreshed, reused: third.reused}, {refreshed: 1, reused: 2});
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1].input, ['semantic beta changed']);

    const verified = verifyBenchmarkQueryEmbeddings({cases: changed, config: config(3), cacheDir});
    assert.equal(verified.caseCount, 3);
    assert.deepEqual([...verified.vectors.keys()], changed.map(({id}) => id));
    assert.deepEqual(verified.vectors.get('case-b'), [0, 1, 0]);
  } finally {
    fs.rmSync(cacheDir, {recursive: true, force: true});
  }
});

test('provider, partial and dimension failures never retry and never replace previous benchmark cache', async () => {
  const {refreshBenchmarkQueryEmbeddings} = await loadCacheModule();
  const cacheDir = tmpDir();
  try {
    await refreshBenchmarkQueryEmbeddings({
      cases: CASES,
      config: config(3),
      cacheDir,
      apiKey: 'ephemeral-test-key',
      fetchImpl: async () => vectorResponse([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
    });
    const stable = readCacheBytes(cacheDir);

    for (const badFetch of [
      async () => new Response('quota', {status: 429}),
      async () => vectorResponse([[1, 0, 0]]),
      async () => vectorResponse([[1, 0], [0, 1, 0], [0, 0, 1]]),
      async () => { throw new Error('network down'); },
    ]) {
      let calls = 0;
      const changed = CASES.map((item) => item.id === 'case-a' ? {...item, query: `${item.query} changed ${Math.random()}`} : item);
      await assert.rejects(refreshBenchmarkQueryEmbeddings({
        cases: changed,
        config: config(3),
        cacheDir,
        apiKey: 'ephemeral-test-key',
        fetchImpl: async (...args) => { calls += 1; return badFetch(...args); },
      }));
      assert.equal(calls, 1, 'benchmark query embedding refresh must never retry automatically');
      assert.deepEqual(readCacheBytes(cacheDir), stable, 'failed refresh must preserve previous cache bytes');
    }
  } finally {
    fs.rmSync(cacheDir, {recursive: true, force: true});
  }
});

test('offline verifier rejects stale benchmark, model/dimension drift and corrupt binary', async () => {
  const {refreshBenchmarkQueryEmbeddings, verifyBenchmarkQueryEmbeddings} = await loadCacheModule();
  const cacheDir = tmpDir();
  try {
    await refreshBenchmarkQueryEmbeddings({
      cases: CASES,
      config: config(3),
      cacheDir,
      apiKey: 'ephemeral-test-key',
      fetchImpl: async () => vectorResponse([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
    });
    assert.throws(() => verifyBenchmarkQueryEmbeddings({
      cases: CASES.map((item) => item.id === 'case-a' ? {...item, query: 'changed query'} : item),
      config: config(3),
      cacheDir,
    }), /stale|digest|hash/i);
    assert.throws(() => verifyBenchmarkQueryEmbeddings({cases: CASES, config: {...config(3), embeddingModel: 'other/model'}, cacheDir}), /model/i);
    assert.throws(() => verifyBenchmarkQueryEmbeddings({cases: CASES, config: config(4), cacheDir}), /dimension/i);

    fs.appendFileSync(path.join(cacheDir, 'benchmark-query-embeddings.bin'), Buffer.from([0, 0, 0, 0]));
    assert.throws(() => verifyBenchmarkQueryEmbeddings({cases: CASES, config: config(3), cacheDir}), /length|digest|binary/i);
  } finally {
    fs.rmSync(cacheDir, {recursive: true, force: true});
  }
});

test('semantic benchmark uses cached query vectors with shared rankChunks and enforces retrieval gates offline', () => {
  const corpus = [
    {id: 'ru:page:alpha:intro', title: 'Alpha', section: 'Intro', text: 'semantic alpha', lang: 'ru'},
    {id: 'en:page:beta:intro', title: 'Beta', section: 'Intro', text: 'semantic beta', lang: 'en'},
    {id: 'ru:page:noise:intro', title: 'Noise', section: 'Intro', text: 'unrelated material', lang: 'ru'},
  ];
  const cases = [
    {id: 'case-a', lang: 'ru', query: 'semantic alpha', kind: 'exact', expectedAnyOf: ['ru:page:alpha:intro'], answerEligible: true},
    {id: 'case-b', lang: 'en', query: 'meaning of beta', kind: 'paraphrase', expectedAnyOf: ['en:page:beta:intro'], answerEligible: true},
    {id: 'case-c', lang: 'ru', query: 'private missing fact', kind: 'insufficient', expectedAnyOf: [], answerEligible: false},
  ];
  const documentEmbeddings = new Map([
    ['ru:page:alpha:intro', [1, 0]],
    ['en:page:beta:intro', [0, 1]],
    ['ru:page:noise:intro', [-1, 0]],
  ]);
  const queryEmbeddings = new Map([
    ['case-a', [1, 0]],
    ['case-b', [0, 1]],
    ['case-c', [-1, 0]],
  ]);
  const lexical = evaluateRetrieval({cases, retrieve: createLexicalRetriever(corpus), limit: 5});
  const report = runSemanticBenchmark({
    cases,
    corpus,
    documentEmbeddings,
    queryEmbeddings,
    ranker: rankChunks,
    lexicalReport: lexical,
  });
  assert.equal(report.recallAt5, 1);
  assert.equal(report.exactTermRecallAt5, 1);
  assert.ok(report.selectedWeights);
  assert.equal(report.perCase.length, 3);
  assert.equal(report.perCase.find(({id}) => id === 'case-c').kind, 'insufficient');
});

test('semantic benchmark CLI is offline-only and accepts explicit index path while public publisher ignores benchmark cache', () => {
  const benchmarkSource = fs.readFileSync(path.join(ROOT, 'scripts', 'ai-benchmark.js'), 'utf8');
  assert.match(benchmarkSource, /--mode/);
  assert.match(benchmarkSource, /semantic/);
  assert.match(benchmarkSource, /--index/);
  assert.match(benchmarkSource, /benchmark-query-cache/);
  assert.equal(/openrouter\.ai|OPENROUTER_API_KEY|fetch\s*\(/.test(benchmarkSource), false, 'semantic benchmark CLI must not have provider access');

  const publisher = fs.readFileSync(path.join(ROOT, 'scripts', 'ai-static-assets.js'), 'utf8');
  assert.equal(publisher.includes('benchmark-query-cache'), false, 'engineering query cache must never be a public artifact');
  assert.match(publisher, /\['chunks\.json', 'ai\/chunks\.json'\]/);
  assert.match(publisher, /\['index-meta\.json', 'ai\/index-meta\.json'\]/);
  assert.match(publisher, /\['embeddings\.bin', 'ai\/embeddings\.bin'\]/);
});
