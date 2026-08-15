import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {buildAiCorpus, normalizeChunkText} from './ai-corpus.js';

const BENCHMARK_KINDS = new Set(['exact', 'paraphrase', 'cross-language', 'insufficient']);
const CASE_KEYS = Object.freeze(['id', 'lang', 'query', 'kind', 'expectedAnyOf', 'answerEligible']);

function readBenchmarkInput(input) {
  if (Array.isArray(input)) return structuredClone(input);
  if (typeof input !== 'string') throw new Error('Benchmark input must be a file path or an array');
  return JSON.parse(fs.readFileSync(input, 'utf8'));
}

function normalizeSearchText(value) {
  return normalizeChunkText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('ru')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTokens(value) {
  return [...new Set(normalizeSearchText(value).split(' ').filter((token) => token.length >= 2))];
}

function overlapRatio(queryTokens, haystackTokens) {
  if (queryTokens.length === 0) return 0;
  const haystack = new Set(haystackTokens);
  return queryTokens.filter((token) => haystack.has(token)).length / queryTokens.length;
}

function scoreLexical(query, chunk, preferredLang) {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = searchTokens(query);
  const title = normalizeSearchText(chunk.title);
  const section = normalizeSearchText(chunk.section);
  const text = normalizeSearchText(chunk.text);
  const all = `${title} ${section} ${text}`.trim();

  const tokenScore = overlapRatio(queryTokens, searchTokens(all));
  const titleScore = overlapRatio(queryTokens, searchTokens(title));
  const phraseScore = normalizedQuery && all.includes(normalizedQuery) ? 1 : 0;
  const titlePhrase = normalizedQuery && title.includes(normalizedQuery) ? 1 : 0;
  const languageScore = chunk.lang === preferredLang ? 0.05 : 0;
  return tokenScore + titleScore * 0.75 + phraseScore + titlePhrase * 0.75 + languageScore;
}

function roundMetric(value) {
  return Number(Number(value || 0).toFixed(6));
}

export function loadBenchmark(input, validChunkIds) {
  const raw = readBenchmarkInput(input);
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Benchmark must contain at least one case');
  const validIds = new Set(validChunkIds || []);
  const seenCases = new Set();

  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Benchmark case must be an object');
    const keys = Object.keys(item).sort();
    const expectedKeys = [...CASE_KEYS].sort();
    if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
      throw new Error(`Benchmark case ${String(item.id)} has an invalid field set`);
    }
    if (typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id) || seenCases.has(item.id)) {
      throw new Error(`Benchmark case id is invalid or duplicated: ${String(item.id)}`);
    }
    seenCases.add(item.id);
    if (!['ru', 'en'].includes(item.lang)) throw new Error(`Benchmark case ${item.id} has invalid lang`);
    if (typeof item.query !== 'string' || item.query.trim().length < 3) throw new Error(`Benchmark case ${item.id} has invalid query`);
    if (!BENCHMARK_KINDS.has(item.kind)) throw new Error(`Benchmark case ${item.id} has unsupported kind`);
    if (!Array.isArray(item.expectedAnyOf) || new Set(item.expectedAnyOf).size !== item.expectedAnyOf.length) {
      throw new Error(`Benchmark case ${item.id} has invalid expectedAnyOf`);
    }
    if (typeof item.answerEligible !== 'boolean') throw new Error(`Benchmark case ${item.id} has invalid answerEligible`);

    if (item.kind === 'insufficient') {
      if (item.expectedAnyOf.length !== 0 || item.answerEligible !== false) {
        throw new Error(`Benchmark insufficient case ${item.id} must have no targets and answerEligible=false`);
      }
    } else {
      if (item.expectedAnyOf.length === 0 || item.answerEligible !== true) {
        throw new Error(`Benchmark positive case ${item.id} must have targets and answerEligible=true`);
      }
      for (const chunkId of item.expectedAnyOf) {
        if (!validIds.has(chunkId)) throw new Error(`Benchmark case ${item.id} points at stale or unknown chunk ID: ${chunkId}`);
      }
    }
  }
  return Object.freeze(raw.map((item) => Object.freeze({...item, expectedAnyOf: Object.freeze([...item.expectedAnyOf])})));
}

export function createLexicalRetriever(corpus) {
  const snapshot = [...corpus];
  return ({query, lang, limit = 5}) => snapshot
    .map((chunk) => ({chunkId: chunk.id, score: roundMetric(scoreLexical(query, chunk, lang))}))
    .sort((left, right) => right.score - left.score || left.chunkId.localeCompare(right.chunkId, 'en'))
    .slice(0, Math.max(0, limit));
}

function recallFor(cases, perCase, predicate) {
  const selected = cases.filter(predicate);
  if (selected.length === 0) return 0;
  const hits = selected.filter((item) => perCase.find(({id}) => id === item.id)?.hit).length;
  return roundMetric(hits / selected.length);
}

export function evaluateRetrieval({cases, retrieve, limit = 5}) {
  const perCase = cases.map((item) => {
    const results = [...(retrieve({query: item.query, lang: item.lang, limit}) || [])].slice(0, limit);
    const resultIds = results.map(({chunkId}) => chunkId);
    const hit = item.kind === 'insufficient'
      ? false
      : item.expectedAnyOf.some((chunkId) => resultIds.includes(chunkId));
    return {
      id: item.id,
      kind: item.kind,
      hit,
      topChunkIds: resultIds,
      topScore: roundMetric(results[0]?.score ?? 0),
    };
  });

  const positiveCases = cases.filter(({kind}) => kind !== 'insufficient');
  const insufficientCases = cases.filter(({kind}) => kind === 'insufficient');
  return {
    total: cases.length,
    positiveCases: positiveCases.length,
    insufficientCases: insufficientCases.length,
    recallAt5: recallFor(cases, perCase, ({kind}) => kind !== 'insufficient'),
    exactTermRecallAt5: recallFor(cases, perCase, ({kind}) => kind === 'exact'),
    paraphraseRecallAt5: recallFor(cases, perCase, ({kind}) => kind === 'paraphrase'),
    insufficientTopScore: insufficientCases.map(({id}) => ({
      id,
      score: perCase.find((result) => result.id === id)?.topScore ?? 0,
    })),
    perCase,
  };
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function runCli() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--mode' || args[1] !== 'lexical') {
    process.stderr.write('Usage: node scripts/ai-benchmark.js --mode lexical\n');
    process.exitCode = 2;
    return;
  }

  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  const corpus = buildAiCorpus({rootDir, config});
  const cases = loadBenchmark(
    path.join(rootDir, 'data', 'ai-navigator-benchmark.json'),
    new Set(corpus.map(({id}) => id)),
  );
  const report = evaluateRetrieval({cases, retrieve: createLexicalRetriever(corpus), limit: 5});
  process.stdout.write(`${JSON.stringify({mode: 'lexical', ...report}, null, 2)}\n`);
}

if (isMainModule()) runCli();
