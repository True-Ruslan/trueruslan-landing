# AI Navigator Static-First RAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional AI mode to the existing TrueRuslan search field that performs semantic retrieval and, only after a second explicit action, returns grounded answers sourced strictly from canonical public site content.

**Architecture:** Canonical Markdown/JSON is converted into a deterministic static corpus and committed embedding index. GitHub Pages serves those derived artifacts, the browser performs hybrid ranking, and one stateless Cloudflare Worker only protects the OpenRouter key, requests query embeddings, re-fetches trusted canonical chunks, and proxies grounded answer generation. Diplodoc remains the ordinary site-wide full-text search owner and the entire AI layer is removable without data, URL, SEO, or database migration.

**Tech Stack:** Node.js 24 ESM, `node:test`, Diplodoc 5.x + `@diplodoc/search-extension`, parse5, classic browser JavaScript, GitHub Pages, GitHub Actions, Cloudflare Worker runtime, OpenRouter Embeddings API, OpenRouter Chat Completions structured outputs.

## Global Constraints

- The existing search field gains a compact `AI` switch at its right edge.
- `AI` is OFF on every fresh page load and is not persisted in cookies, localStorage, or sessionStorage.
- `AI=OFF` preserves current Diplodoc behavior and produces zero OpenRouter usage.
- `AI=ON` invokes semantic retrieval only after explicit search submission; it never starts answer generation automatically.
- Generative answering exists only behind `Спросить AI по найденному` / `Ask AI about these results` after successful retrieval.
- Answers may use only canonical public TrueRuslan content fetched by the Worker; model world knowledge, browsing, tools, agents, private evidence, and inferred absent personal facts are forbidden.
- Insufficient site evidence must return an explicit insufficient-evidence state instead of a guess.
- OpenRouter is the only permitted variable paid dependency.
- No database, vector database, D1, KV, R2, Vectorize, Pinecone, Supabase, Elasticsearch, Redis, paid queue, paid observability product, or separately hosted application server may be introduced.
- Normal `npm test`, `npm run build:docs`, and production deployment must work without `OPENROUTER_API_KEY` and without network access to OpenRouter.
- The browser never receives the OpenRouter key and never supplies trusted answer context text.
- AI requests use `provider: {zdr: true, data_collection: "deny"}` and fail closed if the configured route cannot satisfy those constraints.
- Initial embedding profile: `openai/text-embedding-3-small`, `dimensions: 512`, `input_type: "search_document"` for corpus indexing and `input_type: "search_query"` for visitor queries.
- Initial answer-model candidate: `google/gemini-2.5-flash-lite`; public `full` mode is blocked until strict structured-output and grounded-answer canaries pass.
- Answer requests use `response_format.type = "json_schema"`, `strict: true`, and `provider.require_parameters = true`.
- Current analytics policy keeps `customEvents: false`; MVP adds no custom AI analytics and sends no raw query, answer, or context to analytics.
- A dedicated OpenRouter key with a hard spending limit is mandatory before public `search` or `full` mode.
- Canonical config starts and remains `mode: "off"` through engineering acceptance.
- Complete removal must require no canonical-content migration, URL migration, SEO repair, database cleanup, or reindexing of the ordinary Diplodoc search.

---

## File Structure

### Configuration and derived artifacts

- `data/ai-navigator.json` — schema, feature mode, Worker URL, pinned model IDs, dimensions, request/result bounds, curated canonical route scope, and benchmark-selected ranking weights.
- `data/ai-navigator-benchmark.json` — reviewed 50-query retrieval ground truth.
- `data/ai-index/chunks.json` — deterministic public source-owned chunks keyed by stable chunk ID.
- `data/ai-index/index-meta.json` — model/dimension/chunk-order/content-hash/digest metadata.
- `data/ai-index/embeddings.bin` — little-endian Float32 vectors in `index-meta.json.chunkIds` order.

### Build-time modules

- `scripts/ai-config.js` — strict config loading/validation only.
- `scripts/ai-corpus.js` — canonical-source extraction/chunking; no network.
- `scripts/ai-index.js` — explicit OpenRouter document embedding refresh with hash reuse.
- `scripts/ai-index-verify.js` — offline index consistency/freshness verification.
- `scripts/ai-retrieval-core.js` — deterministic scoring primitives for Node benchmark tests.
- `scripts/ai-benchmark.js` — lexical baseline, hybrid candidate evaluation, and acceptance report.
- `scripts/search-page.js` — project-owned generated-search normalization and AI resource injection only in enabled modes.
- `scripts/copy-assets.js` — copy AI resources/index only in enabled modes; ordinary OFF build stays provider/index-independent.

### Browser modules

- `docs/_assets/script/ai-retrieval.js` — classic dependency-free browser ranking implementation mirroring Node semantics.
- `docs/_assets/script/ai-search.js` — switch, lazy index loading, embed call, semantic result panel, answer action, fallback.
- `docs/_assets/style/ai-search.css` — switch/result/answer styles scoped to generated search pages.
- Existing `docs/_assets/script/search-ui.js` remains the ordinary search enhancer and owns `.tr-search-input`, `.tr-search-input-shell`, `.tr-search-button`, and `.tr-search-results`.

### Edge module

- `infra/cloudflare/ai-navigator-worker.mjs` — stateless `/v1/embed` and `/v1/answer`; no storage binding.

### Tests/evidence

- `scripts/ai-config.test.js`
- `scripts/ai-corpus.test.js`
- `scripts/ai-index.test.js`
- `scripts/ai-index-verify.test.js`
- `scripts/ai-retrieval.test.js`
- `scripts/ai-benchmark.test.js`
- `scripts/ai-search-page.test.js`
- `scripts/ai-search-runtime.test.js`
- `scripts/ai-navigator-worker.test.js`
- `scripts/ai-navigator-browser-smoke.cjs`
- `docs/acceptance/2026-08-15-ai-navigator-engineering-readiness.md`
- `docs/acceptance/ai-navigator-search-canary.md`
- `docs/acceptance/ai-navigator-full-canary.md`
- `docs/acceptance/ai-navigator-product-verdict.md`

---

### Task 1: Lock feature configuration and deterministic canonical corpus

**Files:**
- Create: `data/ai-navigator.json`
- Create: `scripts/ai-config.js`
- Create: `scripts/ai-config.test.js`
- Create: `scripts/ai-corpus.js`
- Create: `scripts/ai-corpus.test.js`
- Consume: `data/page-meta.json`, `data/notes.json`, `data/projects.json`, `data/publications.json`, `data/project-evidence.json`

**Interfaces:**
- `loadAiConfig(filePath) -> AiNavigatorConfig`
- `buildAiCorpus({rootDir, config}) -> AiChunk[]`
- `serializeCorpus(chunks) -> string`
- `AiChunk = {id, url, sourcePath, title, section, type, lang, text, contentHash}`
- Stable chunk ID grammar: `/^(ru|en):(note|project|page|publication):[a-z0-9-]+:[a-z0-9-]+$/`.

- [ ] **Step 1: Write RED config tests**

Use this accepted initial object as the valid fixture:

```js
const valid = {
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
  includePagePaths: [
    'landing/projects.html',
    'landing/projects/vlezet.html',
    'landing/projects/livingworld.html',
    'landing/projects/notchhub.html',
    'landing/projects/portfolio-platform.html',
    'landing/about.html',
    'landing/resume.html',
    'landing/now.html',
    'landing/work-with-me.html',
    'landing/publications.html',
    'en/projects.html',
    'en/projects/vlezet.html',
    'en/projects/livingworld.html',
    'en/projects/notchhub.html',
    'en/projects/portfolio-platform.html',
    'en/about.html',
    'en/resume.html',
    'en/now.html',
    'en/work-with-me.html',
    'en/publications.html'
  ],
  hybridWeights: null
};
```

Tests must reject unknown keys, unknown modes, non-HTTPS non-empty Worker URLs, model IDs outside these exact configured strings, zero/negative limits, weights not summing to `1`, and `hybridWeights:null` when mode is `search` or `full`.

- [ ] **Step 2: Run config test and prove RED**

```bash
node --test scripts/ai-config.test.js
```

Expected: FAIL because `scripts/ai-config.js` does not exist.

- [ ] **Step 3: Implement strict config loader**

```js
export const AI_MODES = Object.freeze(new Set(['off', 'search', 'full']));

export function loadAiConfig(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  validateAiConfig(parsed);
  return Object.freeze(structuredClone(parsed));
}
```

`validateAiConfig()` uses an explicit allowed-key set and performs no coercion. It never reads environment secrets.

- [ ] **Step 4: Run config test and prove GREEN**

```bash
node --test scripts/ai-config.test.js
```

Expected: PASS.

- [ ] **Step 5: Write RED corpus ownership tests**

Require byte determinism, stable unique IDs, canonical clean URLs, valid language, non-empty source paths, content hashes, and explicit exclusions:

```js
assert.equal(serializeCorpus(first), serializeCorpus(second));
assert.equal(new Set(first.map(({id}) => id)).size, first.length);
assert.ok(first.every(({id}) => /^(ru|en):(note|project|page|publication):[a-z0-9-]+:[a-z0-9-]+$/.test(id)));
assert.ok(first.every(({url}) => url.startsWith('/') && url.endsWith('/')));
assert.ok(first.every(({sourcePath}) => sourcePath.startsWith('docs/')));
assert.ok(first.every(({sourcePath}) => !sourcePath.startsWith('docs/acceptance/')));
assert.ok(first.every(({sourcePath}) => !/(PROJECT_STATE|ROADMAP|CHANGELOG)/.test(sourcePath)));
assert.ok(first.every(({contentHash}) => /^sha256:[a-f0-9]{64}$/.test(contentHash)));
```

Also assert every `data/notes.json` Note contributes at least one chunk, every `includePagePaths` item resolves through existing metadata/source ownership, normalized chunk text is unique, and private/non-reader registry fields never enter `text`.

- [ ] **Step 6: Run corpus test and prove RED**

```bash
node --test scripts/ai-corpus.test.js
```

Expected: FAIL because corpus functions do not exist.

- [ ] **Step 7: Implement source-aware Markdown chunking**

Rules are exact:

1. resolve configured page paths through `data/page-meta.json` to canonical `docs/*.md` owners;
2. add every Note through `data/notes.json` canonical Markdown ownership;
3. remove front matter, script/style blocks, non-reader HTML chrome, and include directives that only duplicate registry-rendered cards;
4. create an intro chunk and H2 chunks;
5. split an H2 at H3 boundaries only when normalized prose exceeds 2400 characters;
6. coalesce adjacent chunks under 220 characters only when they share the same parent section and combined text remains at most 2400 characters;
7. reject ID collisions rather than append counters;
8. hash normalized source-owned text with SHA-256.

Export these pure helpers:

```js
export function normalizeChunkText(value) {}
export function chunkMarkdown({sourcePath, url, title, type, lang, markdown}) {}
export function buildAiCorpus({rootDir, config}) {}
export function serializeCorpus(chunks) {}
```

- [ ] **Step 8: Run focused and existing tests**

```bash
node --test scripts/ai-config.test.js scripts/ai-corpus.test.js
npm test
```

Expected: all PASS.

- [ ] **Step 9: Commit Task 1**

```bash
git add data/ai-navigator.json scripts/ai-config.js scripts/ai-config.test.js scripts/ai-corpus.js scripts/ai-corpus.test.js
git commit -m "feat: add deterministic AI corpus"
```

---

### Task 2: Create the 50-query retrieval benchmark before semantic tuning

**Files:**
- Create: `data/ai-navigator-benchmark.json`
- Create: `scripts/ai-benchmark.js`
- Create: `scripts/ai-benchmark.test.js`
- Consume: `scripts/ai-corpus.js`

**Interfaces:**
- `loadBenchmark(filePath, validChunkIds) -> BenchmarkCase[]`
- `evaluateRetrieval({cases, retrieve}) -> BenchmarkReport`
- `BenchmarkCase = {id, lang, query, kind, expectedAnyOf, answerEligible}`

- [ ] **Step 1: Generate Task 1 corpus locally and inspect its stable IDs**

```bash
node scripts/ai-corpus.js --print-ids
```

Expected: deterministic list of current canonical chunk IDs. This output is the only allowed source for `expectedAnyOf` IDs.

- [ ] **Step 2: Add exactly 50 reviewed cases**

Use five groups of ten: RU exact terms, RU paraphrases, EN exact/paraphrases, cross-language/discovery, and negative/insufficient/adversarial.

Required concrete cases include:

```json
{
  "id": "ru-ai-projects",
  "lang": "ru",
  "query": "Какие проекты связаны с AI?",
  "kind": "paraphrase",
  "expectedAnyOf": ["ru:project:livingworld:intro", "ru:project:vlezet:intro"],
  "answerEligible": true
}
```

```json
{
  "id": "ru-private-salary",
  "lang": "ru",
  "query": "Какая у Руслана текущая зарплата?",
  "kind": "insufficient",
  "expectedAnyOf": [],
  "answerEligible": false
}
```

If the generated ID for either positive example differs, use the exact ID printed by `--print-ids`; never invent or alter chunk IDs inside the benchmark loader.

- [ ] **Step 3: Write RED benchmark schema/baseline tests**

```js
assert.equal(cases.length, 50);
assert.equal(new Set(cases.map(({id}) => id)).size, 50);
assert.equal(cases.filter(({kind}) => kind === 'insufficient').length, 10);
assert.ok(cases.every(({query}) => query.trim().length >= 3));
```

Every positive expected ID must exist in the current corpus; every insufficient case must have `expectedAnyOf:[]` and `answerEligible:false`.

- [ ] **Step 4: Run and prove RED**

```bash
node --test scripts/ai-benchmark.test.js
```

Expected: FAIL until loader/evaluator exist.

- [ ] **Step 5: Implement lexical baseline and report**

Report shape:

```js
{
  total: 50,
  positiveCases: 40,
  insufficientCases: 10,
  recallAt5: 0,
  exactTermRecallAt5: 0,
  paraphraseRecallAt5: 0,
  perCase: []
}
```

Positive hit means at least one expected chunk in top 5. Negative cases are never counted as positive recall.

- [ ] **Step 6: Run lexical baseline**

```bash
node --test scripts/ai-benchmark.test.js
node scripts/ai-benchmark.js --mode lexical
```

Expected: schema PASS and deterministic baseline printed. Do not change future semantic gates to make a weak implementation pass.

- [ ] **Step 7: Commit Task 2**

```bash
git add data/ai-navigator-benchmark.json scripts/ai-benchmark.js scripts/ai-benchmark.test.js
git commit -m "test: add AI retrieval benchmark"
```

---

### Task 3: Add explicit OpenRouter document-index generation with offline verification

**Files:**
- Create: `scripts/ai-index.js`
- Create: `scripts/ai-index.test.js`
- Create: `scripts/ai-index-verify.js`
- Create: `scripts/ai-index-verify.test.js`
- Modify: `package.json` scripts section
- Generated later by explicit operator action: `data/ai-index/chunks.json`, `data/ai-index/index-meta.json`, `data/ai-index/embeddings.bin`

**Interfaces:**
- `createEmbeddingRequest({texts, config}) -> object`
- `refreshAiIndex({rootDir, config, fetchImpl, apiKey, sourceCommit}) -> RefreshReport`
- `verifyAiIndex({rootDir, config}) -> VerificationReport`
- `index-meta.json.chunkIds` is authoritative vector order.

- [ ] **Step 1: Write RED OpenRouter request tests**

Exact body for changed document chunks:

```js
assert.deepEqual(body, {
  model: 'openai/text-embedding-3-small',
  dimensions: 512,
  input_type: 'search_document',
  input: changedTexts,
  provider: {zdr: true, data_collection: 'deny'}
});
```

URL must be exactly `https://openrouter.ai/api/v1/embeddings`; authorization comes only from injected `apiKey`; key/provider response headers are never logged.

- [ ] **Step 2: Write RED reuse/atomicity tests**

Cover unchanged hash reuse with zero fetch, deterministic changed-chunk batching, deleted chunk removal, dimension mismatch rejection, partial response rejection, missing key error, 402/429/5xx propagation with no automatic retry, and no modification of existing artifacts after a failed refresh.

- [ ] **Step 3: Run and prove RED**

```bash
node --test scripts/ai-index.test.js scripts/ai-index-verify.test.js
```

Expected: FAIL because modules do not exist.

- [ ] **Step 4: Implement atomic refresh**

Write to a temporary directory, validate all vectors/digests, then rename into `data/ai-index/`.

Metadata object is produced from real values, including source commit passed by caller:

```js
const meta = {
  schemaVersion: 1,
  embeddingModel: config.embeddingModel,
  dimensions: config.embeddingDimensions,
  chunkIds,
  contentHashes,
  corpusDigest,
  embeddingsDigest,
  sourceCommit
};
```

CLI resolves `sourceCommit` with:

```js
const sourceCommit = process.env.GITHUB_SHA
  || execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
```

`embeddings.bin` length must equal `chunkIds.length * 512 * 4` bytes.

- [ ] **Step 5: Implement offline verifier**

Rebuild corpus locally and verify model, dimensions, chunk IDs/order, content hashes, corpus digest, binary length, finite Float32 values, and binary digest. This module performs no fetch and never reads an API key.

- [ ] **Step 6: Add explicit npm commands only**

```json
"ai:corpus": "node scripts/ai-corpus.js --write data/ai-index/chunks.json",
"ai:index": "node scripts/ai-index.js",
"ai:verify": "node scripts/ai-index-verify.js"
```

Do not add `ai:index` to normal build/test/deploy chains.

- [ ] **Step 7: Prove normal build has no OpenRouter dependency**

```bash
unset OPENROUTER_API_KEY
npm test
npm run build:docs
```

Expected: PASS while canonical mode is `off`.

- [ ] **Step 8: Run mock-provider tests and commit**

```bash
node --test scripts/ai-index.test.js scripts/ai-index-verify.test.js
npm test
git add package.json scripts/ai-index.js scripts/ai-index.test.js scripts/ai-index-verify.js scripts/ai-index-verify.test.js
git commit -m "feat: add explicit AI embedding indexer"
```

No real OpenRouter call occurs in this task or CI.

---

### Task 4: Implement deterministic hybrid retrieval and benchmark-selected weights

**Files:**
- Create: `scripts/ai-retrieval-core.js`
- Create: `scripts/ai-retrieval.test.js`
- Modify: `scripts/ai-benchmark.js`
- Create: `docs/_assets/script/ai-retrieval.js`
- Modify after real benchmark only: `data/ai-navigator.json`

**Interfaces:**
- Node: `rankChunks({query, queryVector, chunks, embeddings, config}) -> RankedResult[]`
- Browser: `window.TrueRuslanAiRetrieval.rankChunks(options)` with identical scoring semantics.
- `RankedResult = {chunkId, score, semanticScore, lexicalScore, titleScore, languageScore}`.

- [ ] **Step 1: Write RED math/ranking tests**

```js
assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
assert.throws(() => cosineSimilarity([1], [1, 0]), /dimension/i);
assert.throws(() => cosineSimilarity([0, 0], [1, 0]), /zero vector/i);
```

Also test deterministic tie break by chunk ID, Unicode normalization, RU/EN case folding, title exact match, and language preference.

- [ ] **Step 2: Run and prove RED**

```bash
node --test scripts/ai-retrieval.test.js
```

Expected: FAIL until implementation exists.

- [ ] **Step 3: Implement one explicit scoring formula**

```js
const score = semanticScore * weights.semantic
  + lexicalScore * weights.lexical
  + titleScore * weights.title
  + languageScore * weights.language;
```

All component scores are clamped to `[0,1]`; no hidden boost may exist outside this expression.

- [ ] **Step 4: Add finite benchmark weight grid**

```js
const candidates = [
  {semantic: 0.55, lexical: 0.30, title: 0.10, language: 0.05},
  {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05},
  {semantic: 0.70, lexical: 0.15, title: 0.10, language: 0.05},
  {semantic: 0.75, lexical: 0.10, title: 0.10, language: 0.05}
];
```

A candidate qualifies only if positive Recall@5 >= `0.90` and every exact-term case found by lexical baseline remains found in top 5. Among qualifiers choose maximum paraphrase Recall@5; tie-break by lower semantic weight, then candidate order. If none qualifies, feature remains OFF and no threshold is weakened in that PR.

- [ ] **Step 5: Implement classic browser mirror**

```js
root.TrueRuslanAiRetrieval = Object.freeze({
  cosineSimilarity,
  normalizeSearchText,
  lexicalScore,
  rankChunks,
});
```

Add source-contract tests ensuring identical weight keys/formula semantics between Node and classic browser modules.

- [ ] **Step 6: Run tests and commit**

```bash
node --test scripts/ai-retrieval.test.js scripts/ai-benchmark.test.js
git add scripts/ai-retrieval-core.js scripts/ai-retrieval.test.js scripts/ai-benchmark.js docs/_assets/script/ai-retrieval.js
git commit -m "feat: add hybrid AI retrieval engine"
```

Do not set real `hybridWeights` until Task 11 real embeddings pass the benchmark.

---

### Task 5: Gate AI artifacts/resources at the existing project-owned search normalization boundary

**Files:**
- Modify: `scripts/search-page.js` (`injectProjectSearchResources`, `normalizeSearchPageHtml`)
- Modify: `scripts/copy-assets.js` (`SEARCH_RESOURCES`, `normalizeSearchPages`, `postprocessOutput`)
- Create: `scripts/ai-search-page.test.js`
- Create: `docs/_assets/style/ai-search.css`
- Consume: `scripts/ai-config.js`, `scripts/ai-index-verify.js`

**Interfaces:**
- `normalizeSearchPageHtml(html, pageRelativePath, {aiConfig}) -> string`
- Enabled pages get `data-tr-ai-mode="search"` or `data-tr-ai-mode="full"`.
- OFF pages contain no AI marker or resource reference.

- [ ] **Step 1: Write RED mode-gating tests**

OFF assertions:

```js
assert.doesNotMatch(html, /data-tr-ai-mode/);
assert.doesNotMatch(html, /ai-search\.css/);
assert.doesNotMatch(html, /ai-retrieval\.js/);
assert.doesNotMatch(html, /ai-search\.js/);
```

SEARCH/FULL require exactly one AI stylesheet, one retrieval script, one AI UI script, and exact mode marker while preserving existing `search.css`/`search-ui.js` exactly once.

- [ ] **Step 2: Run and prove RED**

```bash
node --test scripts/ai-search-page.test.js
```

Expected: FAIL.

- [ ] **Step 3: Extend `search-page.js`; never fork Diplodoc**

`copy-assets.js` loads AI config for production docs and passes it into `normalizeSearchPages()`. `search-page.js` injects AI resources only for `search|full`. Do not add AI resources globally to `docs/.yfm`.

- [ ] **Step 4: Publish committed AI artifacts only in enabled modes**

Add focused helper `publishAiArtifacts({rootDir, outputDir, config})` in `scripts/copy-assets.js`; if it makes that file's AI-specific block exceed 80 lines, move the helper unchanged to `scripts/ai-static-assets.js` in the same task.

Enabled copies:

```text
data/ai-index/chunks.json     -> docs-html/ai/chunks.json
data/ai-index/index-meta.json -> docs-html/ai/index-meta.json
data/ai-index/embeddings.bin  -> docs-html/ai/embeddings.bin
```

Call `verifyAiIndex()` before copying. Missing/stale enabled index fails with exactly `AI index unavailable or stale; run npm run ai:index explicitly`. OFF mode neither requires nor publishes the index.

- [ ] **Step 5: Run OFF regression and commit**

```bash
node --test scripts/ai-search-page.test.js
rm -rf docs-html
npm run build:docs
npm run check:site
git add scripts/search-page.js scripts/copy-assets.js scripts/ai-search-page.test.js docs/_assets/style/ai-search.css
git commit -m "feat: gate AI search resources by mode"
```

Expected: PASS; canonical generated search contains no AI resources in OFF mode.

---

### Task 6: Add stateless Worker `/v1/embed` with strict privacy/cost envelope

**Files:**
- Create: `infra/cloudflare/ai-navigator-worker.mjs`
- Create: `scripts/ai-navigator-worker.test.js`

**Interfaces:**
- `POST /v1/embed` accepts exactly `{query:string}`.
- Success: `{embedding:number[], model:string, dimensions:number}`.
- Env: `AI_ENABLED`, `OPENROUTER_API_KEY`, `AI_ALLOWED_ORIGIN`, `AI_CORPUS_ORIGIN`, `AI_EMBEDDING_MODEL`, `AI_EMBEDDING_DIMENSIONS`, `AI_ANSWER_MODEL`.

- [ ] **Step 1: Write RED request/security tests**

Require POST only, unknown route 404, disabled Worker 503 before provider call, missing key 503, exact Origin allowlist, JSON only, query length 1..500 after trim, no extra body keys, and exact-Origin CORS rather than `*`.

- [ ] **Step 2: Write RED provider-forwarding tests**

Exact outbound body:

```js
{
  model: env.AI_EMBEDDING_MODEL,
  dimensions: 512,
  input_type: 'search_query',
  input: 'validated query',
  provider: {zdr: true, data_collection: 'deny'}
}
```

Assert one outbound request maximum and sanitized 400/401/402/429/5xx handling.

- [ ] **Step 3: Run and prove RED**

```bash
node --test scripts/ai-navigator-worker.test.js
```

Expected: FAIL because Worker does not exist.

- [ ] **Step 4: Implement minimal dependency-free Worker**

Follow existing `infra/cloudflare/trueruslan-com-worker.mjs` style: pure exported handlers/helpers, injectable `fetchImpl`, no SDK, no storage.

```js
const signal = AbortSignal.timeout(8000);
const response = await fetchImpl('https://openrouter.ai/api/v1/embeddings', {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
  signal,
});
```

Validate exact vector length 512 and `Number.isFinite` for every value.

- [ ] **Step 5: Run focused/full unit tests and commit**

```bash
node --test scripts/ai-navigator-worker.test.js
npm test
git add infra/cloudflare/ai-navigator-worker.mjs scripts/ai-navigator-worker.test.js
git commit -m "feat: add AI query embedding gateway"
```

No Wrangler account/route deployment configuration is added yet.

---

### Task 7: Add in-field AI switch and semantic result panel while ordinary search stays untouched OFF

**Files:**
- Create: `docs/_assets/script/ai-search.js`
- Create: `scripts/ai-search-runtime.test.js`
- Modify: `docs/_assets/style/ai-search.css`
- Modify: `scripts/search-smoke.cjs`

**Interfaces:**
- `window.TrueRuslanAiSearch.init()`
- `createAiSwitch(document, inputShell, mode) -> HTMLElement`
- `loadAiIndex({baseUrl, fetchImpl}) -> {chunks, embeddings, meta}`
- `requestQueryEmbedding({workerBaseUrl, query, fetchImpl}) -> number[]`

- [ ] **Step 1: Write RED classic-script/switch tests**

Require frozen API, no imports/exports, idempotent single switch, `role="switch"`, correct `aria-checked`, localized label, initial OFF regardless of fake storage state, no writes to any browser storage/cookie, ON placeholder change, and OFF restoration of ordinary search behavior.

- [ ] **Step 2: Run and prove RED**

```bash
node --test scripts/ai-search-runtime.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement exact switch structure**

```html
<label class="tr-ai-switch">
  <span class="tr-ai-switch__label">AI</span>
  <button type="button" role="switch" aria-checked="false" aria-label="Поиск по смыслу с помощью AI"></button>
</label>
```

EN accessible label: `Semantic search with AI`. Minimum pointer target 40px, visible focus, visible `AI` text on mobile, no color-only state, no gradient/glow/robot iconography, and reduced-motion transitions disabled.

- [ ] **Step 4: Implement lazy semantic submit**

OFF: never prevent ordinary form submission.

ON submission sequence:

1. prevent only the enabled-mode submission;
2. validate query 1..500 chars;
3. lazily fetch `/ai/index-meta.json`, `/ai/chunks.json`, `/ai/embeddings.bin` once per page;
4. call Worker `/v1/embed` once;
5. verify binary byte length and 512 dimensions;
6. rank with `TrueRuslanAiRetrieval.rankChunks()`;
7. render at most five canonical results.

Use source-owned deterministic result rendering, for example:

```html
<article class="tr-ai-result">
  <a class="tr-ai-result__title" href="/notes/green-ci-is-not-product-verification/">Почему green CI не означает verified product</a>
  <p class="tr-ai-result__meta">Engineering Note · Evidence</p>
  <p class="tr-ai-result__snippet">Зелёный pipeline подтверждает ограниченный набор автоматических проверок, но не весь продуктовый контракт.</p>
</article>
```

Do not generate relevance explanations with an LLM.

- [ ] **Step 5: Implement one-shot fallback**

On timeout, 402, 429, 5xx, disabled Worker, invalid vector, or stale client artifact: keep the search usable, render compact AI-unavailable copy, provide `Обычный поиск` that turns AI OFF and submits the current query through existing Diplodoc flow, and perform no automatic retry.

- [ ] **Step 6: Extend ordinary search smoke for OFF mode**

Assert canonical OFF build has no `.tr-ai-switch`, no `/ai/` request, and all existing search visual/route/publication contracts remain green.

- [ ] **Step 7: Run tests and commit**

```bash
node --test scripts/search-ui.test.js scripts/ai-search-runtime.test.js scripts/ai-search-page.test.js
npm run build:docs
node scripts/search-smoke.cjs
git add docs/_assets/script/ai-search.js docs/_assets/style/ai-search.css scripts/ai-search-runtime.test.js scripts/search-smoke.cjs
git commit -m "feat: add reversible AI search mode UI"
```

---

### Task 8: Add strict grounded `/v1/answer` to the same stateless Worker

**Files:**
- Modify: `infra/cloudflare/ai-navigator-worker.mjs`
- Modify: `scripts/ai-navigator-worker.test.js`

**Interfaces:**
- `POST /v1/answer` accepts exactly `{question:string, chunkIds:string[]}`.
- Worker fetches trusted corpus only from exact `${AI_CORPUS_ORIGIN}/ai/chunks.json`.
- Success outward shape: `{sufficientEvidence:boolean, answer:string, citations:string[]}`.

- [ ] **Step 1: Write RED trust-boundary tests**

Reject arbitrary request fields (`context`, `messages`, `model`, `provider`), >5 IDs, duplicates, IDs that do not match stable grammar, question outside 1..500 chars, unknown IDs, corpus redirect off configured origin, and invalid corpus schema/digest. Assert OpenRouter context comes only from canonical corpus fetch, never browser-provided prose.

- [ ] **Step 2: Write RED structured-output request test**

```js
const expectedProvider = {
  zdr: true,
  data_collection: 'deny',
  require_parameters: true
};

const expectedResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'trueruslan_grounded_answer',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        sufficientEvidence: {type: 'boolean'},
        answer: {type: 'string'},
        citations: {type: 'array', items: {type: 'string'}, maxItems: 5}
      },
      required: ['sufficientEvidence', 'answer', 'citations'],
      additionalProperties: false
    }
  }
};
```

System instruction must explicitly prohibit world knowledge, browsing, absent-personal-fact inference, private claims, and citations outside supplied context.

- [ ] **Step 3: Write RED response validation tests**

Reject citation outside selected IDs, unknown citation, true+empty answer/citations, false+nonempty factual answer, >450-word answer, and malformed JSON-schema payload. Normalize insufficient outward result to:

```json
{"sufficientEvidence":false,"answer":"","citations":[]}
```

- [ ] **Step 4: Run and prove RED**

```bash
node --test scripts/ai-navigator-worker.test.js
```

Expected: new answer cases FAIL.

- [ ] **Step 5: Implement bounded answer path**

Maximum two outbound fetches: canonical corpus then `https://openrouter.ai/api/v1/chat/completions`. Each has 8s timeout, no retries, no streaming, no tools, no multi-turn history, `max_tokens:700`.

Canonical context serialization uses real selected records; one record format is:

```text
<source id="ru:note:green-ci-is-not-product-verification:intro">
TITLE: Почему green CI не означает verified product
SECTION: Введение
URL: /notes/green-ci-is-not-product-verification/
CONTENT:
Зелёный pipeline подтверждает только ограниченный набор автоматизированных контрактов.
</source>
```

Reject the request before model call if selected canonical context exceeds 18000 characters; never silently drop an arbitrary selected source.

- [ ] **Step 6: Run tests and commit**

```bash
node --test scripts/ai-navigator-worker.test.js
npm test
git add infra/cloudflare/ai-navigator-worker.mjs scripts/ai-navigator-worker.test.js
git commit -m "feat: add grounded AI answer gateway"
```

---

### Task 9: Add explicit Ask-AI answer UI without chat state

**Files:**
- Modify: `docs/_assets/script/ai-search.js`
- Modify: `docs/_assets/style/ai-search.css`
- Modify: `scripts/ai-search-runtime.test.js`

**Interfaces:**
- Answer button exists only when `data-tr-ai-mode="full"` and semantic results exist.
- Browser sends only `{question, chunkIds}`.
- No chat history or persistence.

- [ ] **Step 1: Write RED mode/request tests**

OFF: no AI UI. SEARCH: semantic results allowed, answer button absent. FULL: answer button appears only after retrieval. Maximum five unique top-ranked IDs. Browser payload contains no context/model/provider. Duplicate in-flight clicks produce one network request.

- [ ] **Step 2: Write RED answer rendering/failure tests**

Citations resolve only through locally loaded canonical chunk metadata; links stay same-site/current-tab; insufficient evidence renders localized copy with no answer; 402/429/timeout leaves semantic results visible; new search discards old answer instead of appending chat history.

- [ ] **Step 3: Run and prove RED**

```bash
node --test scripts/ai-search-runtime.test.js
```

Expected: answer cases FAIL.

- [ ] **Step 4: Implement bounded safe answer panel**

```html
<section class="tr-ai-answer" aria-live="polite">
  <div class="tr-ai-answer__body"></div>
  <ol class="tr-ai-answer__sources"></ol>
</section>
```

Provider answer is rendered with `textContent`, never provider-controlled `innerHTML`. Citation anchors are constructed only from validated local metadata.

- [ ] **Step 5: Run tests and commit**

```bash
node --test scripts/ai-search-runtime.test.js scripts/ai-navigator-worker.test.js
git add docs/_assets/script/ai-search.js docs/_assets/style/ai-search.css scripts/ai-search-runtime.test.js
git commit -m "feat: add explicit grounded AI answers"
```

---

### Task 10: Add offline CI, browser/accessibility, degradation, and removal gates

**Files:**
- Create: `scripts/ai-navigator-browser-smoke.cjs`
- Modify: `package.json`
- Modify: `.github/workflows/build.yml`
- Modify only if required by failing contract: `scripts/site-integrity.js`

**Interfaces:**
- `npm run check:ai` is provider-free.
- Browser smoke uses a local fake Worker and never calls OpenRouter.

- [ ] **Step 1: Add offline verification command**

```json
"check:ai": "node scripts/ai-index-verify.js --allow-off"
```

OFF validates config and succeeds without index. SEARCH/FULL requires fresh index and non-null accepted weights.

- [ ] **Step 2: Write browser smoke with three fixture modes**

Without changing canonical config, generate/serve fixture outputs for:

- OFF: no AI resources/switch and ordinary Diplodoc query works;
- SEARCH: switch starts OFF, ON makes one fake embed call, top results render, no answer action;
- FULL: same retrieval plus one fake answer call and citation rendering.

Also test fake 402, 429, 503, timeout, insufficient evidence, keyboard toggle, visible focus, 390px mobile no overflow, zero serious/critical Axe violations, reduced-motion path, no browser request to `openrouter.ai`, and no browser-storage persistence.

Evidence filenames are exact:

```text
artifacts/ai-navigator-summary.json
artifacts/ai-navigator-search-mobile.png
artifacts/ai-navigator-full-desktop.png
```

- [ ] **Step 3: Run smoke locally without secret**

```bash
unset OPENROUTER_API_KEY
npm run build:docs
node scripts/ai-navigator-browser-smoke.cjs
```

Expected: PASS.

- [ ] **Step 4: Add CI steps immediately after current Generated search browser smoke**

```yaml
- name: AI Navigator offline verification
  shell: bash
  run: |
    set -o pipefail
    npm run check:ai 2>&1 | tee ai-navigator-verify.log

- name: AI Navigator browser smoke
  shell: bash
  run: |
    set -o pipefail
    node scripts/ai-navigator-browser-smoke.cjs 2>&1 | tee ai-navigator-browser-smoke.log
```

Add both logs and three evidence files to existing `quality-artifacts/` preservation. Add no OpenRouter secret to CI.

- [ ] **Step 5: Run entire available local acceptance set**

```bash
unset OPENROUTER_API_KEY
npm test
npm run build:docs
npm run check:site
npm run check:ai
node scripts/search-smoke.cjs
node scripts/ai-navigator-browser-smoke.cjs
```

Expected: all PASS with canonical `mode=off`.

- [ ] **Step 6: Commit Task 10**

```bash
git add package.json .github/workflows/build.yml scripts/ai-navigator-browser-smoke.cjs
git diff -- scripts/site-integrity.js --quiet || git add scripts/site-integrity.js
git commit -m "test: gate AI Navigator readiness"
```

---

### Task 11: Generate real document embeddings and prove retrieval quality while public AI remains OFF

**Files:**
- Create/update: `data/ai-index/chunks.json`
- Create/update: `data/ai-index/index-meta.json`
- Create/update: `data/ai-index/embeddings.bin`
- Modify after measured selection: `data/ai-navigator.json`
- Create: `docs/acceptance/2026-08-15-ai-navigator-engineering-readiness.md`

**Interfaces:**
- Requires a dedicated capped `OPENROUTER_API_KEY` in operator environment only.
- Public mode remains `off`.

- [ ] **Step 1: Verify operator key prerequisites outside Git**

Required state:

```text
purpose = TrueRuslan AI Navigator
hard spending limit = configured
repository/browser storage = forbidden
environment variable only = yes
```

Record only prerequisite status/date, never the key.

- [ ] **Step 2: Generate real index explicitly**

```bash
test -n "$OPENROUTER_API_KEY"
npm run ai:index
```

Expected: model `openai/text-embedding-3-small`, dimensions 512, one finite vector per current chunk, no partial response, printed corpus/binary digests.

- [ ] **Step 3: Remove key from shell and prove offline index validity**

```bash
unset OPENROUTER_API_KEY
npm run ai:verify
```

Expected: PASS.

- [ ] **Step 4: Run real semantic benchmark**

```bash
node scripts/ai-benchmark.js --mode semantic --index data/ai-index
```

Required gate:

```text
positive Recall@5 >= 0.90
exact-term lexical no-regression = 100%
winning weights = deterministic Task 4 candidate
10 insufficient cases remain answerEligible=false
```

No qualifying candidate => stop with mode OFF and open a retrieval-quality issue; do not weaken thresholds in the same PR.

- [ ] **Step 5: Commit exactly the measured winning weights**

Update only `hybridWeights`; keep `mode:"off"` and `workerBaseUrl:""`.

- [ ] **Step 6: Write immutable engineering-readiness ledger**

Record exact source commit, chunk count, corpus digest, embedding model/dimensions, binary digest, benchmark totals/Recall@5, winning weights, offline build proof, Worker tests, browser fake-provider tests, and status:

```text
AI NAVIGATOR ENGINEERING: READY FOR NORMAL PR ACCEPTANCE
PUBLIC AI FEATURE: OFF
```

- [ ] **Step 7: Re-run full provider-free verification**

```bash
unset OPENROUTER_API_KEY
npm test
npm run build:docs
npm run check:site
npm run check:ai
node scripts/search-smoke.cjs
node scripts/ai-navigator-browser-smoke.cjs
```

Expected: all PASS.

- [ ] **Step 8: Commit Task 11**

```bash
git add data/ai-index data/ai-navigator.json docs/acceptance/2026-08-15-ai-navigator-engineering-readiness.md
git commit -m "data: add benchmarked AI search index"
```

---

### Task 12: Accept engineering OFF first, then activate SEARCH and FULL in independent canaries

**Files:**
- Engineering acceptance: no extra production source file.
- Search activation modifies: `data/ai-navigator.json`; creates `docs/acceptance/ai-navigator-search-canary.md`.
- Full activation modifies: `data/ai-navigator.json`; creates `docs/acceptance/ai-navigator-full-canary.md`.
- Later product verdict creates: `docs/acceptance/ai-navigator-product-verdict.md`.

**Interfaces:**
- Engineering merge: public `off`.
- Search canary: public `search` only after Worker live smoke.
- Full canary: public `full` only after grounded live smoke.
- Emergency rollback: Worker `AI_ENABLED=false`; durable rollback: repository `mode:"off"`, `workerBaseUrl:""`.

- [ ] **Step 1: Open engineering implementation PR with AI OFF**

PR body must include exactly these boundaries:

```text
PUBLIC AI MODE: OFF
OPENROUTER REQUIRED FOR NORMAL BUILD: NO
DATABASE/VECTOR STORE: NONE
DIPLODOC ORDINARY SEARCH OWNER: UNCHANGED
```

Require exact-head Build (including new offline/browser steps), Dependency Review, CodeQL, and every existing search/accessibility/browser/visual/custom-domain/discovery gate before squash merge.

- [ ] **Step 2: Verify exact merged SHA production acceptance while AI is absent**

Require Pages SUCCESS, Production Live SUCCESS, master CodeQL SUCCESS, ordinary production search smoke SUCCESS, and no AI switch/resources on deployed generated search. Record:

```text
AI NAVIGATOR ENGINEERING: PRODUCTION ACCEPTED
PUBLIC AI FEATURE: OFF
VISITOR TOKEN SPEND: $0
```

- [ ] **Step 3: Deploy Worker on Cloudflare free tier with no storage binding**

Set only these Worker variables/secrets:

```text
AI_ENABLED=true
OPENROUTER_API_KEY=(Cloudflare secret value from the dedicated capped key)
AI_ALLOWED_ORIGIN=https://trueruslan.ru
AI_CORPUS_ORIGIN=https://trueruslan.ru
AI_EMBEDDING_MODEL=openai/text-embedding-3-small
AI_EMBEDDING_DIMENSIONS=512
AI_ANSWER_MODEL=google/gemini-2.5-flash-lite
```

Use the generated `workers.dev` HTTPS URL; do not add DNS, D1, KV, R2, or Vectorize.

- [ ] **Step 4: Capture actual Worker URL and smoke `/v1/embed` before exposing UI**

Set the real URL copied from Cloudflare deployment output:

```bash
export WORKER_URL='https://the-url-copied-from-cloudflare-deployment-output'
test "${WORKER_URL#https://}" != "$WORKER_URL"
```

The quoted value above is an instruction token only: before running any request, replace it in the shell with the exact URL emitted by Cloudflare; never commit that literal sentence. Then verify valid Origin returns 200 with 512 finite values, foreign Origin returns 403, and GET returns 405.

- [ ] **Step 5: Create SEARCH activation PR using environment-driven exact config mutation**

After `WORKER_URL` contains the actual deployed URL, update config with a script rather than hand-typing a guessed hostname:

```bash
node --input-type=module - <<'NODE'
import fs from 'node:fs';
const file = 'data/ai-navigator.json';
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const workerBaseUrl = process.env.WORKER_URL;
if (!workerBaseUrl || new URL(workerBaseUrl).protocol !== 'https:') throw new Error('WORKER_URL must be the deployed HTTPS Worker URL');
config.mode = 'search';
config.workerBaseUrl = workerBaseUrl.replace(/\/$/, '');
fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
NODE
```

Create `docs/acceptance/ai-navigator-search-canary.md` with Worker URL, exact activation SHA, embed smoke outcome, emergency-switch test, and no-storage statement. Never record secrets.

- [ ] **Step 6: Run SEARCH-mode acceptance and merge independently**

```bash
npm run ai:verify
npm test
npm run build:docs
npm run check:site
npm run check:ai
node scripts/ai-navigator-browser-smoke.cjs
```

After exact-head CI and exact merged-SHA Pages/Production Live/CodeQL succeed, production verify RU/EN search: switch starts OFF, ordinary search unchanged, ON semantic search returns expected canonical materials, no Ask-AI action, one embedding call per explicit semantic search, no console/overflow/accessibility regression.

- [ ] **Step 7: Prove emergency and durable SEARCH rollback**

Temporarily set Worker `AI_ENABLED=false` and verify graceful UI fallback, then restore. In a test branch/config fixture set `mode:"off"`, `workerBaseUrl:""` and verify next build contains no AI switch/resources/index references. No canonical content changes occur.

- [ ] **Step 8: Live-test grounded answers while public mode remains SEARCH**

Call `/v1/answer` directly with these five reviewed questions and benchmark-selected chunk IDs:

```text
Какие проекты связаны с AI?
Как Руслан проверяет production acceptance?
Какой опыт есть со Spring Boot?
What is Vlezet trying to solve?
Какая у Руслана текущая зарплата?
```

The fifth must produce `sufficientEvidence:false`, empty answer, and empty citations. Verify the route satisfies ZDR, data-collection deny, `require_parameters:true`, and strict JSON Schema; inability blocks FULL rather than relaxing privacy/schema requirements.

- [ ] **Step 9: Create FULL activation PR changing only mode**

```js
config.mode = 'full';
```

Do not change models, weights, corpus, Worker URL, or UI architecture in this PR. Create `docs/acceptance/ai-navigator-full-canary.md` recording the five live canaries and privacy/structured-output evidence.

Require exact-head normal CI then exact merged-SHA Pages/Production Live/CodeQL. Production verify answer button only after semantic results, canonical citations, insufficient evidence, no chat history, and semantic results surviving 402/429/503 answer failures.

- [ ] **Step 10: Record explicit product verdict without adding telemetry infrastructure**

Use only dedicated-key aggregate OpenRouter spend/usage, free Cloudflare operational data already available under the selected privacy settings, current consent-respecting site analytics at `customEvents:false`, manual smoke results, and direct qualitative feedback. Do not add raw-query logging.

Write one verdict to `docs/acceptance/ai-navigator-product-verdict.md`:

- `KEEP_FULL` => leave `mode:"full"`;
- `KEEP_SEARCH_ONLY` => set `mode:"search"`;
- `REMOVE` => set `mode:"off"`, `workerBaseUrl:""`, deploy, then disable Worker and revoke dedicated OpenRouter key.

For REMOVE run:

```bash
npm test
npm run build:docs
npm run check:site
node scripts/search-smoke.cjs
```

Required deployed state: ordinary Diplodoc search unchanged, no AI switch, no AI asset/index reference, zero visitor OpenRouter spend, no content/URL/canonical/SEO migration.

---

## Final Acceptance Matrix

| Layer | Required evidence |
|---|---|
| Corpus | deterministic source-owned chunks; no private/CI/acceptance content; stable IDs/hashes |
| Index | explicit real OpenRouter generation; offline digest verification; normal build provider-independent |
| Retrieval | reviewed 50-query dataset; positive Recall@5 >= 0.90; exact-term lexical no-regression |
| Ordinary search | existing `search-smoke.cjs` green; OFF path unchanged |
| UI | switch OFF on fresh load; accessible; mobile-safe; no persistence |
| Worker | stateless; fixed models; strict origins/routes/limits; sanitized errors; no storage |
| Grounding | Worker-fetch canonical corpus; strict JSON Schema; citation subset validation; insufficient-evidence path |
| Privacy | ZDR + data-collection deny + required structured-output parameters; no raw-query analytics DB |
| Cost | dedicated hard-capped OpenRouter key; no paid infrastructure except tokens |
| CI | no live OpenRouter request/secret; existing full quality matrix remains green |
| Deployment | exact-SHA Pages + Production Live + master CodeQL for each public mode transition |
| Reversibility | `mode:off` removes AI UI/resources; Worker/key can be disabled independently; no migrations |

## Recommended PR Sequence

1. **PR A — corpus + benchmark:** Tasks 1–2.
2. **PR B — index + retrieval engine:** Tasks 3–4; public OFF.
3. **PR C — mode-gated search integration + embed Worker:** Tasks 5–7; public OFF.
4. **PR D — grounded answers + offline full verification:** Tasks 8–10; public OFF.
5. **PR E — real index + engineering acceptance:** Task 11 plus Task 12 steps 1–2; public OFF.
6. **PR F — semantic-search canary:** Task 12 steps 3–7; public SEARCH.
7. **PR G — grounded-answer canary:** Task 12 steps 8–9; public FULL only after live acceptance.
8. **Verdict PR:** Task 12 step 10; keep FULL, downgrade SEARCH, or REMOVE.

A failed AI milestone must stop at its current boundary. It must never weaken ordinary Diplodoc search, existing CI gates, privacy routing, grounding, or the no-paid-infrastructure contract.