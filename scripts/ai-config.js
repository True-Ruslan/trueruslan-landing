import fs from 'node:fs';

export const AI_MODES = Object.freeze(new Set(['off', 'search', 'full']));

const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const ANSWER_MODEL = 'google/gemini-2.5-flash-lite';
const WEIGHT_KEYS = Object.freeze(['semantic', 'lexical', 'title', 'language']);
const ALLOWED_KEYS = new Set([
  'schemaVersion',
  'mode',
  'workerBaseUrl',
  'embeddingModel',
  'embeddingDimensions',
  'answerModel',
  'maxQueryChars',
  'maxResults',
  'answerMaxChunks',
  'answerMaxContextChars',
  'answerMaxTokens',
  'includePagePaths',
  'hybridWeights',
]);

function requirePositiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
}

function validateWorkerBaseUrl(value, mode) {
  if (typeof value !== 'string') throw new Error('workerBaseUrl must be a string');
  if (!value) {
    if (mode !== 'off') throw new Error('workerBaseUrl is required when AI mode is enabled');
    return;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('workerBaseUrl must be a valid HTTPS URL');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) {
    throw new Error('workerBaseUrl must be a credential-free HTTPS URL without a fragment');
  }
}

function validateIncludePagePaths(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('includePagePaths must be a non-empty array');
  }

  const seen = new Set();
  for (const route of value) {
    if (typeof route !== 'string'
      || route.startsWith('/')
      || route.includes('..')
      || !/^[a-z0-9][a-z0-9/_-]*\.html$/.test(route)) {
      throw new Error(`includePagePaths contains an unsafe route: ${String(route)}`);
    }
    if (seen.has(route)) throw new Error(`includePagePaths contains duplicate route: ${route}`);
    seen.add(route);
  }
}

function validateHybridWeights(value, mode) {
  if (value === null) {
    if (mode !== 'off') throw new Error('hybridWeights must be benchmark-selected when AI mode is enabled');
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('hybridWeights must be null or an object');
  }

  const keys = Object.keys(value).sort();
  const expected = [...WEIGHT_KEYS].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw new Error(`hybridWeights must contain exactly: ${WEIGHT_KEYS.join(', ')}`);
  }

  let total = 0;
  for (const key of WEIGHT_KEYS) {
    const weight = value[key];
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
      throw new Error(`hybridWeights.${key} must be a finite number from 0 to 1`);
    }
    total += weight;
  }
  if (Math.abs(total - 1) > 1e-9) {
    throw new Error(`hybridWeights must sum to 1; got ${total}`);
  }
}

export function validateAiConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('AI Navigator config must be an object');
  }

  for (const key of Object.keys(value)) {
    if (!ALLOWED_KEYS.has(key)) throw new Error(`Unknown AI Navigator config field: ${key}`);
  }
  for (const key of ALLOWED_KEYS) {
    if (!Object.hasOwn(value, key)) throw new Error(`Missing AI Navigator config field: ${key}`);
  }

  if (value.schemaVersion !== 1) throw new Error('schemaVersion must equal 1');
  if (!AI_MODES.has(value.mode)) throw new Error(`Unsupported AI Navigator mode: ${String(value.mode)}`);
  validateWorkerBaseUrl(value.workerBaseUrl, value.mode);

  if (value.embeddingModel !== EMBEDDING_MODEL) {
    throw new Error(`embeddingModel must remain pinned to ${EMBEDDING_MODEL}`);
  }
  if (value.answerModel !== ANSWER_MODEL) {
    throw new Error(`answerModel must remain pinned to ${ANSWER_MODEL}`);
  }

  for (const field of [
    'embeddingDimensions',
    'maxQueryChars',
    'maxResults',
    'answerMaxChunks',
    'answerMaxContextChars',
    'answerMaxTokens',
  ]) {
    requirePositiveInteger(value[field], field);
  }
  if (value.embeddingDimensions !== 512) throw new Error('embeddingDimensions must equal 512');

  validateIncludePagePaths(value.includePagePaths);
  validateHybridWeights(value.hybridWeights, value.mode);
  return value;
}

export function loadAiConfig(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  validateAiConfig(parsed);
  return Object.freeze(structuredClone(parsed));
}
