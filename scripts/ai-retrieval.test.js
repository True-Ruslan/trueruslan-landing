import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

import {
  cosineSimilarity,
  lexicalScore,
  normalizeSearchText,
  rankChunks,
} from './ai-retrieval-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BROWSER_SOURCE = path.join(__dirname, '..', 'docs', '_assets', 'script', 'ai-retrieval.js');

function chunk(id, {title = id, section = 'Intro', text = '', lang = 'en'} = {}) {
  return {id, title, section, text, lang};
}

function config(weights = {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05}) {
  return {hybridWeights: weights};
}

test('cosine similarity is exact for aligned and orthogonal vectors and rejects unsafe inputs', () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([1, 0], [-1, 0]), -1);
  assert.throws(() => cosineSimilarity([1], [1, 0]), /dimension/i);
  assert.throws(() => cosineSimilarity([0, 0], [1, 0]), /zero/i);
  assert.throws(() => cosineSimilarity([1, Number.NaN], [1, 0]), /finite/i);
});

test('search normalization is Unicode-aware and lexical score rewards exact reader terms', () => {
  assert.equal(normalizeSearchText('  Quality—GATES, CI/CD! '), 'quality gates ci cd');
  assert.equal(normalizeSearchText('Ёлка и ПРОВЕРКА'), 'ёлка и проверка');
  assert.equal(lexicalScore('Spring Boot Kafka', 'Опыт: Spring Boot, Kafka, PostgreSQL'), 1);
  assert.ok(lexicalScore('production verification', 'deployment verification in production') > 0);
  assert.equal(lexicalScore('missing terms', 'completely unrelated text'), 0);
});

test('hybrid ranking uses only the four explicit normalized components', () => {
  const chunks = [
    chunk('en:page:semantic:intro', {title: 'Semantic result', text: 'unrelated prose', lang: 'en'}),
    chunk('en:page:lexical:intro', {title: 'Spring Boot Kafka', text: 'Spring Boot Kafka experience', lang: 'en'}),
  ];
  const embeddings = new Map([
    [chunks[0].id, [1, 0]],
    [chunks[1].id, [0, 1]],
  ]);
  const results = rankChunks({
    query: 'Spring Boot Kafka',
    queryVector: [1, 0],
    chunks,
    embeddings,
    config: config({semantic: 0.5, lexical: 0.2, title: 0.2, language: 0.1}),
  });

  for (const result of results) {
    for (const key of ['semanticScore', 'lexicalScore', 'titleScore', 'languageScore', 'score']) {
      assert.ok(result[key] >= 0 && result[key] <= 1, `${result.chunkId} ${key} must be normalized`);
    }
    const expected = result.semanticScore * 0.5
      + result.lexicalScore * 0.2
      + result.titleScore * 0.2
      + result.languageScore * 0.1;
    assert.ok(Math.abs(result.score - expected) < 1e-12);
  }
  assert.equal(results[0].chunkId, 'en:page:semantic:intro');
});

test('ranking prefers query language only through the declared language component and tie-breaks by chunk ID', () => {
  const chunks = [
    chunk('ru:page:zeta:intro', {title: 'CI', text: 'CI', lang: 'ru'}),
    chunk('en:page:alpha:intro', {title: 'CI', text: 'CI', lang: 'en'}),
    chunk('en:page:beta:intro', {title: 'CI', text: 'CI', lang: 'en'}),
  ];
  const embeddings = new Map(chunks.map(({id}) => [id, [1, 0]]));
  const results = rankChunks({query: 'CI', queryVector: [1, 0], chunks, embeddings, config: config()});
  assert.deepEqual(results.map(({chunkId}) => chunkId), [
    'en:page:alpha:intro',
    'en:page:beta:intro',
    'ru:page:zeta:intro',
  ]);
});

test('explicit language context overrides script inference for Latin-only localized technical queries', () => {
  const chunks = [
    chunk('en:note:ai-npc:intro', {title: 'server-authoritative AI NPC', text: 'same terms', lang: 'en'}),
    chunk('ru:note:ai-npc:intro', {title: 'server-authoritative AI NPC', text: 'same terms', lang: 'ru'}),
  ];
  const embeddings = new Map(chunks.map(({id}) => [id, [1, 0]]));
  const base = {
    query: 'server-authoritative AI NPC',
    queryVector: [1, 0],
    chunks,
    embeddings,
    config: config(),
  };

  assert.equal(rankChunks(base)[0].chunkId, 'en:note:ai-npc:intro');
  assert.equal(rankChunks({...base, preferredLanguage: 'ru'})[0].chunkId, 'ru:note:ai-npc:intro');
  assert.throws(() => rankChunks({...base, preferredLanguage: 'de'}), /preferredLanguage.*ru.*en/i);
});

test('ranking rejects missing vectors, dimension drift and invalid weight contracts', () => {
  const chunks = [chunk('en:page:one:intro', {text: 'one'})];
  assert.throws(
    () => rankChunks({query: 'one', queryVector: [1, 0], chunks, embeddings: new Map(), config: config()}),
    /missing vector/i,
  );
  assert.throws(
    () => rankChunks({query: 'one', queryVector: [1, 0], chunks, embeddings: new Map([[chunks[0].id, [1]]]), config: config()}),
    /dimension/i,
  );
  assert.throws(
    () => rankChunks({query: 'one', queryVector: [1, 0], chunks, embeddings: new Map([[chunks[0].id, [1, 0]]]), config: config({semantic: 1})}),
    /weights/i,
  );
});

test('browser classic script exposes dependency-free retrieval with Node-equivalent ranking', () => {
  const source = fs.readFileSync(BROWSER_SOURCE, 'utf8');
  assert.doesNotMatch(source, /^\s*(?:import|export)\s/m);
  const sandbox = {globalThis: null};
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, {filename: 'ai-retrieval.js'});
  const api = sandbox.TrueRuslanAiRetrieval;
  assert.equal(typeof api.cosineSimilarity, 'function');
  assert.equal(typeof api.normalizeSearchText, 'function');
  assert.equal(typeof api.lexicalScore, 'function');
  assert.equal(typeof api.rankChunks, 'function');
  assert.equal(Object.isFrozen(api), true);

  const chunks = [
    chunk('en:page:a:intro', {title: 'AI systems', text: 'grounded AI systems', lang: 'en'}),
    chunk('ru:page:b:intro', {title: 'AI системы', text: 'AI системы', lang: 'ru'}),
  ];
  const embeddings = new Map([
    [chunks[0].id, [0.9, 0.1]],
    [chunks[1].id, [0.7, 0.3]],
  ]);
  const options = {
    query: 'AI systems',
    queryVector: [1, 0],
    chunks,
    embeddings,
    config: config(),
    preferredLanguage: 'ru',
  };
  const nodeResults = rankChunks(options);
  const browserResults = api.rankChunks(options);
  assert.equal(JSON.stringify(browserResults), JSON.stringify(nodeResults));
});
