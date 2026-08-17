import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {verifyBenchmarkQueryEmbeddings} from './ai-benchmark-embeddings.js';
import {loadAiConfig} from './ai-config.js';
import {buildAiCorpus, normalizeChunkText, serializeCorpus} from './ai-corpus.js';
import {rankChunks} from './ai-retrieval-core.js';

const BENCHMARK_KINDS = new Set(['exact', 'paraphrase', 'cross-language', 'insufficient']);
const CASE_KEYS = Object.freeze(['id', 'lang', 'query', 'kind', 'expectedAnyOf', 'answerEligible']);

export const HYBRID_WEIGHT_CANDIDATES = Object.freeze([
  Object.freeze({semantic: 0.55, lexical: 0.30, title: 0.10, language: 0.05}),
  Object.freeze({semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05}),
  Object.freeze({semantic: 0.70, lexical: 0.15, title: 0.10, language: 0.05}),
  Object.freeze({semantic: 0.75, lexical: 0.10, title: 0.10, language: 0.05}),
]);

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}

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

function sameWeights(left, right) {
  return left && right && ['semantic', 'lexical', 'title', 'language']
    .every((key) => left[key] === right[key]);
}

function canonicalDocumentId(chunkId) {
  const parts = String(chunkId || '').split(':');
  if (parts.length !== 4 || parts.some((part) => !part)) {
    throw new Error(`Benchmark encountered an invalid stable chunk ID: ${String(chunkId)}`);
  }
  return parts.slice(0, 3).join(':');
}

function matchesExpectedDocument(expectedChunkIds, resultChunkIds) {
  const resultDocuments = new Set(resultChunkIds.map(canonicalDocumentId));
  return expectedChunkIds.some((chunkId) => resultDocuments.has(canonicalDocumentId(chunkId)));
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
        canonicalDocumentId(chunkId);
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
    const results = [...(retrieve({id: item.id, query: item.query, lang: item.lang, kind: item.kind, limit}) || [])].slice(0, limit);
    const resultIds = results.map(({chunkId}) => chunkId);
    const hit = item.kind === 'insufficient'
      ? false
      : matchesExpectedDocument(item.expectedAnyOf, resultIds);
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

export function selectHybridWeights({lexicalPerCase, candidateReports}) {
  if (!Array.isArray(lexicalPerCase) || !Array.isArray(candidateReports)) {
    throw new Error('Hybrid weight selection requires lexical and candidate reports');
  }
  const exactLexicalHits = lexicalPerCase
    .filter(({kind, hit}) => kind === 'exact' && hit === true)
    .map(({id}) => id);

  const qualifying = candidateReports
    .map((candidate, index) => ({...candidate, index}))
    .filter(({weights, report}) => {
      if (!HYBRID_WEIGHT_CANDIDATES.some((allowed) => sameWeights(allowed, weights))) return false;
      if (!report || !Number.isFinite(report.recallAt5) || report.recallAt5 < 0.90) return false;
      if (!Number.isFinite(report.paraphraseRecallAt5)) return false;
      const byId = new Map((report.perCase || []).map((item) => [item.id, item]));
      return exactLexicalHits.every((id) => byId.get(id)?.hit === true);
    })
    .sort((left, right) => (
      right.report.paraphraseRecallAt5 - left.report.paraphraseRecallAt5
      || left.weights.semantic - right.weights.semantic
      || left.index - right.index
    ));

  if (qualifying.length === 0) {
    throw new Error('No hybrid candidate satisfies Recall@5 >= 0.90 and exact-term lexical no-regression');
  }
  const winner = HYBRID_WEIGHT_CANDIDATES.find((candidate) => sameWeights(candidate, qualifying[0].weights));
  return winner;
}

function createSemanticRetriever({corpus, documentEmbeddings, queryEmbeddings, weights, ranker}) {
  return ({id, query, lang, limit = 5}) => {
    const queryVector = queryEmbeddings.get(id);
    if (!queryVector) throw new Error(`semantic benchmark query cache missing ${id}`);
    return ranker({
      query,
      queryVector,
      chunks: corpus,
      embeddings: documentEmbeddings,
      config: {hybridWeights: weights},
      preferredLanguage: lang,
    }).slice(0, limit);
  };
}

export function runSemanticBenchmark({
  cases,
  corpus,
  documentEmbeddings,
  queryEmbeddings,
  ranker = rankChunks,
  lexicalReport = null,
}) {
  if (!Array.isArray(cases) || !Array.isArray(corpus)) throw new Error('semantic benchmark requires cases and corpus arrays');
  if (!documentEmbeddings || typeof documentEmbeddings.get !== 'function') throw new Error('semantic benchmark requires document embeddings');
  if (!queryEmbeddings || typeof queryEmbeddings.get !== 'function') throw new Error('semantic benchmark requires query embeddings');
  if (typeof ranker !== 'function') throw new Error('semantic benchmark requires a ranker');

  const lexical = lexicalReport || evaluateRetrieval({cases, retrieve: createLexicalRetriever(corpus), limit: 5});
  const candidateReports = HYBRID_WEIGHT_CANDIDATES.map((weights) => ({
    weights,
    report: evaluateRetrieval({
      cases,
      retrieve: createSemanticRetriever({corpus, documentEmbeddings, queryEmbeddings, weights, ranker}),
      limit: 5,
    }),
  }));
  const selectedWeights = selectHybridWeights({lexicalPerCase: lexical.perCase, candidateReports});
  const winner = candidateReports.find(({weights}) => sameWeights(weights, selectedWeights));
  if (!winner) throw new Error('selected semantic benchmark candidate disappeared');
  return {
    ...winner.report,
    selectedWeights,
    lexicalBaseline: {
      recallAt5: lexical.recallAt5,
      exactTermRecallAt5: lexical.exactTermRecallAt5,
      paraphraseRecallAt5: lexical.paraphraseRecallAt5,
    },
    candidates: candidateReports.map(({weights, report}) => ({
      weights,
      recallAt5: report.recallAt5,
      exactTermRecallAt5: report.exactTermRecallAt5,
      paraphraseRecallAt5: report.paraphraseRecallAt5,
    })),
  };
}

function decodeDocumentEmbeddings(buffer, chunkIds, dimensions) {
  const expectedLength = chunkIds.length * dimensions * 4;
  if (buffer.length !== expectedLength) {
    throw new Error(`semantic document embedding length mismatch: expected ${expectedLength}, got ${buffer.length}`);
  }
  const vectors = new Map();
  let offset = 0;
  for (const id of chunkIds) {
    const vector = new Array(dimensions);
    for (let index = 0; index < dimensions; index += 1) {
      const value = buffer.readFloatLE(offset);
      if (!Number.isFinite(value)) throw new Error(`semantic document embedding contains non-finite value for ${id}`);
      vector[index] = value;
      offset += 4;
    }
    vectors.set(id, vector);
  }
  return vectors;
}

function loadDocumentIndex({indexDir, config, corpus}) {
  const chunksPath = path.join(indexDir, 'chunks.json');
  const metaPath = path.join(indexDir, 'index-meta.json');
  const embeddingsPath = path.join(indexDir, 'embeddings.bin');
  const chunksBytes = fs.readFileSync(chunksPath);
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const embeddings = fs.readFileSync(embeddingsPath);
  const expectedChunks = serializeCorpus(corpus);
  if (chunksBytes.toString('utf8') !== expectedChunks) throw new Error('semantic document index is stale: chunks.json differs from canonical corpus');
  if (meta.embeddingModel !== config.embeddingModel) throw new Error('semantic document index model mismatch');
  if (meta.dimensions !== config.embeddingDimensions) throw new Error('semantic document index dimension mismatch');
  const expectedIds = corpus.map(({id}) => id);
  if (JSON.stringify(meta.chunkIds) !== JSON.stringify(expectedIds)) throw new Error('semantic document index chunk order mismatch');
  if (meta.embeddingsDigest !== sha256(embeddings)) throw new Error('semantic document index embedding digest mismatch');
  return decodeDocumentEmbeddings(embeddings, expectedIds, config.embeddingDimensions);
}

function parseCliArgs(args) {
  let mode = null;
  let index = null;
  for (let cursor = 0; cursor < args.length; cursor += 1) {
    const arg = args[cursor];
    if (arg === '--mode') {
      mode = args[++cursor];
      continue;
    }
    if (arg === '--index') {
      index = args[++cursor];
      continue;
    }
    throw new Error(`Unknown benchmark argument: ${arg}`);
  }
  if (!['lexical', 'semantic'].includes(mode)) {
    throw new Error('Usage: node scripts/ai-benchmark.js --mode lexical|semantic [--index data/ai-index]');
  }
  if (mode === 'semantic' && (!index || typeof index !== 'string')) {
    throw new Error('Semantic benchmark requires --index PATH');
  }
  if (mode === 'lexical' && index) throw new Error('--index is only valid with --mode semantic');
  return {mode, index};
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const args = parseCliArgs(process.argv.slice(2));
    const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
    const corpus = buildAiCorpus({rootDir, config});
    const cases = loadBenchmark(
      path.join(rootDir, 'data', 'ai-navigator-benchmark.json'),
      new Set(corpus.map(({id}) => id)),
    );
    const lexical = evaluateRetrieval({cases, retrieve: createLexicalRetriever(corpus), limit: 5});
    if (args.mode === 'lexical') {
      process.stdout.write(`${JSON.stringify({mode: 'lexical', ...lexical}, null, 2)}\n`);
      return;
    }

    const indexDir = path.resolve(rootDir, args.index);
    const documentEmbeddings = loadDocumentIndex({indexDir, config, corpus});
    const queryCache = verifyBenchmarkQueryEmbeddings({
      cases,
      config,
      cacheDir: path.join(indexDir, 'benchmark-query-cache'),
    });
    const report = runSemanticBenchmark({
      cases,
      corpus,
      documentEmbeddings,
      queryEmbeddings: queryCache.vectors,
      lexicalReport: lexical,
    });
    process.stdout.write(`${JSON.stringify({
      mode: 'semantic',
      index: path.relative(rootDir, indexDir) || '.',
      benchmarkDigest: queryCache.benchmarkDigest,
      embeddingModel: queryCache.embeddingModel,
      dimensions: queryCache.dimensions,
      ...report,
    }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}

if (isMainModule()) runCli();
