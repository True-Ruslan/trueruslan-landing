import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {buildAiCorpus} from './ai-corpus.js';
import {
  createLexicalRetriever,
  evaluateRetrieval,
  loadBenchmark,
} from './ai-benchmark.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'data', 'ai-navigator.json');
const BENCHMARK_PATH = path.join(ROOT, 'data', 'ai-navigator-benchmark.json');

function currentCorpus() {
  return buildAiCorpus({rootDir: ROOT, config: loadAiConfig(CONFIG_PATH)});
}

function currentCases() {
  const ids = new Set(currentCorpus().map(({id}) => id));
  return loadBenchmark(BENCHMARK_PATH, ids);
}

test('AI retrieval benchmark is exactly 50 reviewed cases with bounded groups', () => {
  const cases = currentCases();
  assert.equal(cases.length, 50);
  assert.equal(new Set(cases.map(({id}) => id)).size, 50);
  assert.equal(cases.filter(({kind}) => kind === 'insufficient').length, 10);
  assert.equal(cases.filter(({kind}) => kind === 'exact').length, 16);
  assert.equal(cases.filter(({kind}) => kind === 'paraphrase').length, 14);
  assert.equal(cases.filter(({kind}) => kind === 'cross-language').length, 10);
  assert.ok(cases.every(({query}) => query.trim().length >= 3));
  assert.ok(cases.every(({lang}) => ['ru', 'en'].includes(lang)));
});

test('benchmark positive targets exist in the current corpus and insufficient cases stay empty', () => {
  const corpusIds = new Set(currentCorpus().map(({id}) => id));
  const cases = loadBenchmark(BENCHMARK_PATH, corpusIds);

  for (const item of cases) {
    if (item.kind === 'insufficient') {
      assert.deepEqual(item.expectedAnyOf, []);
      assert.equal(item.answerEligible, false);
      continue;
    }
    assert.equal(item.answerEligible, true, `${item.id} must be answer-eligible`);
    assert.ok(item.expectedAnyOf.length >= 1, `${item.id} must declare a positive target`);
    for (const id of item.expectedAnyOf) {
      assert.ok(corpusIds.has(id), `${item.id} points at stale corpus ID ${id}`);
    }
  }
});

test('loadBenchmark rejects stale IDs, malformed cases and unsupported kinds', () => {
  const corpusIds = new Set(currentCorpus().map(({id}) => id));
  const fixture = [{
    id: 'fixture',
    lang: 'en',
    query: 'fixture query',
    kind: 'exact',
    expectedAnyOf: ['en:page:missing:intro'],
    answerEligible: true,
  }];
  assert.throws(() => loadBenchmark(fixture, corpusIds), /stale|unknown|missing/i);

  const badKind = structuredClone(fixture);
  badKind[0].kind = 'magic';
  badKind[0].expectedAnyOf = [];
  badKind[0].answerEligible = false;
  assert.throws(() => loadBenchmark(badKind, corpusIds), /kind/i);
});

test('lexical reference retriever deterministically finds exact publication terms', () => {
  const corpus = currentCorpus();
  const retrieve = createLexicalRetriever(corpus);
  const results = retrieve({query: 'Diplodoc GitHub Pages', lang: 'ru', limit: 5});
  assert.ok(results.length > 0);
  assert.equal(results[0].chunkId, 'ru:publication:diplodoc-github-pages:intro');
  assert.ok(results.every(({score}) => Number.isFinite(score) && score >= 0));
});

test('evaluateRetrieval reports positive recall separately from insufficient cases', () => {
  const cases = [
    {
      id: 'positive-hit',
      lang: 'en',
      query: 'alpha',
      kind: 'exact',
      expectedAnyOf: ['en:page:alpha:intro'],
      answerEligible: true,
    },
    {
      id: 'positive-miss',
      lang: 'en',
      query: 'beta',
      kind: 'paraphrase',
      expectedAnyOf: ['en:page:beta:intro'],
      answerEligible: true,
    },
    {
      id: 'negative',
      lang: 'en',
      query: 'private fact',
      kind: 'insufficient',
      expectedAnyOf: [],
      answerEligible: false,
    },
  ];

  const retrieve = ({query}) => {
    if (query === 'alpha') return [{chunkId: 'en:page:alpha:intro', score: 0.9}];
    if (query === 'private fact') return [{chunkId: 'en:page:other:intro', score: 0.2}];
    return [{chunkId: 'en:page:other:intro', score: 0.5}];
  };

  const report = evaluateRetrieval({cases, retrieve, limit: 5});
  assert.equal(report.total, 3);
  assert.equal(report.positiveCases, 2);
  assert.equal(report.insufficientCases, 1);
  assert.equal(report.recallAt5, 0.5);
  assert.equal(report.exactTermRecallAt5, 1);
  assert.equal(report.paraphraseRecallAt5, 0);
  assert.deepEqual(report.insufficientTopScore, [{id: 'negative', score: 0.2}]);
  assert.equal(report.perCase.length, 3);
});

test('lexical benchmark CLI prints deterministic machine-readable baseline', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'ai-benchmark.js'), '--mode', 'lexical'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'lexical');
  assert.equal(report.total, 50);
  assert.equal(report.positiveCases, 40);
  assert.equal(report.insufficientCases, 10);
  assert.ok(report.recallAt5 >= 0 && report.recallAt5 <= 1);
  assert.ok(report.exactTermRecallAt5 >= 0 && report.exactTermRecallAt5 <= 1);
  assert.ok(report.paraphraseRecallAt5 >= 0 && report.paraphraseRecallAt5 <= 1);
  assert.equal(report.perCase.length, 50);
});
