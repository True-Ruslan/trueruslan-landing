const WEIGHT_KEYS = Object.freeze(['semantic', 'lexical', 'title', 'language']);

function isVector(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

function assertFiniteVector(vector, label) {
  if (!isVector(vector) || vector.length === 0) throw new Error(`${label} must be a non-empty vector`);
  for (const value of vector) {
    if (!Number.isFinite(value)) throw new Error(`${label} must contain only finite values`);
  }
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function tokenize(value) {
  return [...new Set(normalizeSearchText(value).split(' ').filter(Boolean))];
}

function validateWeights(weights) {
  if (!weights || typeof weights !== 'object' || Array.isArray(weights)) {
    throw new Error('hybrid weights must be an object');
  }
  const keys = Object.keys(weights).sort();
  const expected = [...WEIGHT_KEYS].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw new Error(`hybrid weights must contain exactly ${WEIGHT_KEYS.join(', ')}`);
  }
  let sum = 0;
  for (const key of WEIGHT_KEYS) {
    const value = weights[key];
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`hybrid weights.${key} must be a finite value from 0 to 1`);
    }
    sum += value;
  }
  if (Math.abs(sum - 1) > 1e-9) throw new Error(`hybrid weights must sum to 1; got ${sum}`);
  return weights;
}

function inferQueryLanguage(query) {
  return /[\u0400-\u04ff]/u.test(String(query)) ? 'ru' : 'en';
}

function resolveVector(embeddings, chunkId, index) {
  if (embeddings && typeof embeddings.get === 'function') return embeddings.get(chunkId);
  if (Array.isArray(embeddings)) return embeddings[index];
  if (embeddings && typeof embeddings === 'object') return embeddings[chunkId];
  return undefined;
}

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ru')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function lexicalScore(query, text) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;
  const textTokens = new Set(tokenize(text));
  const matched = queryTokens.filter((token) => textTokens.has(token)).length;
  return matched / queryTokens.length;
}

export function cosineSimilarity(left, right) {
  assertFiniteVector(left, 'left vector');
  assertFiniteVector(right, 'right vector');
  if (left.length !== right.length) {
    throw new Error(`vector dimension mismatch: ${left.length} != ${right.length}`);
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (leftNorm === 0 || rightNorm === 0) throw new Error('cosine similarity is undefined for a zero vector');
  const value = dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
  return Math.max(-1, Math.min(1, value));
}

export function rankChunks({query, queryVector, chunks, embeddings, config}) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('query must be a non-empty string');
  assertFiniteVector(queryVector, 'query vector');
  if (!Array.isArray(chunks)) throw new Error('chunks must be an array');
  const weights = validateWeights(config?.hybridWeights);
  const preferredLanguage = inferQueryLanguage(query);

  return chunks
    .map((chunk, index) => {
      const vector = resolveVector(embeddings, chunk.id, index);
      if (!vector) throw new Error(`missing vector for ${chunk.id}`);
      const semanticScore = clamp01(cosineSimilarity(queryVector, vector));
      const lexicalComponent = clamp01(lexicalScore(query, `${chunk.title ?? ''} ${chunk.section ?? ''} ${chunk.text ?? ''}`));
      const titleScore = clamp01(lexicalScore(query, chunk.title ?? ''));
      const languageScore = chunk.lang === preferredLanguage ? 1 : 0;
      const score = semanticScore * weights.semantic
        + lexicalComponent * weights.lexical
        + titleScore * weights.title
        + languageScore * weights.language;
      return {
        chunkId: chunk.id,
        score,
        semanticScore,
        lexicalScore: lexicalComponent,
        titleScore,
        languageScore,
      };
    })
    .sort((left, right) => right.score - left.score || left.chunkId.localeCompare(right.chunkId, 'en'));
}
