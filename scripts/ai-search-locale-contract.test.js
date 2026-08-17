import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_PATH = path.join(ROOT, 'docs', '_assets', 'script', 'ai-search.js');

function loadApi() {
  const source = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const sandbox = {
    globalThis: null,
    URL,
    ArrayBuffer,
    DataView,
    Map,
    Set,
    TextDecoder,
    console: {error() {}, warn() {}, log() {}},
    setTimeout() {},
    clearTimeout() {},
    addEventListener() {},
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, {filename: 'ai-search.js'});
  return {api: sandbox.TrueRuslanAiSearch, source};
}

function config() {
  return {
    mode: 'search',
    workerBaseUrl: 'https://ai.example.workers.dev',
    embeddingDimensions: 2,
    maxQueryChars: 500,
    maxResults: 2,
    answerMaxChunks: 5,
    hybridWeights: {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05},
  };
}

test('browser semantic search forwards explicit locale context to the shared ranker', async () => {
  const {api} = loadApi();
  const chunks = [
    {id: 'ru:page:a:intro', url: '/a/', title: 'A', section: 'Intro', type: 'page', lang: 'ru', text: 'Alpha'},
  ];
  let observedPreferredLanguage = null;

  const results = await api.runSemanticSearch({
    query: 'server-authoritative AI NPC',
    preferredLanguage: 'ru',
    config: config(),
    index: {
      chunks,
      embeddings: new Map([[chunks[0].id, [1, 0]]]),
      meta: {dimensions: 2, chunkIds: [chunks[0].id]},
    },
    fetchImpl: async () => new Response(JSON.stringify({embedding: [1, 0], dimensions: 2}), {status: 200}),
    retrievalApi: {
      rankChunks(options) {
        observedPreferredLanguage = options.preferredLanguage;
        return [{chunkId: chunks[0].id, score: 1}];
      },
    },
  });

  assert.equal(observedPreferredLanguage, 'ru');
  assert.equal(results[0].id, chunks[0].id);
});

test('browser init binds semantic ranking to the current page locale', () => {
  const {source} = loadApi();
  assert.match(source, /preferredLanguage:\s*locale\(document\)/);
});
