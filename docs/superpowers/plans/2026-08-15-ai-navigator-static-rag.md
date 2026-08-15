# AI Navigator Static-First RAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional AI mode to the existing TrueRuslan search field that performs semantic retrieval and, only on explicit request, returns grounded answers sourced strictly from canonical public site content, while preserving the site's static-first architecture and making OpenRouter the only variable paid dependency.

**Architecture:** Canonical Markdown/JSON is converted into a deterministic static AI corpus and a committed embedding index. GitHub Pages serves the corpus/index, the browser performs hybrid ranking, and a minimal stateless Cloudflare Worker only protects the OpenRouter key, requests query embeddings, validates canonical chunk IDs, and proxies grounded answer generation. Diplodoc remains the authoritative ordinary search path; AI is progressive enhancement controlled by `off`, `search`, and `full` modes.

**Tech Stack:** Node.js 24 ESM, `node:test`, existing Diplodoc 5.x + `@diplodoc/search-extension`, parse5, classic browser JavaScript, GitHub Pages, GitHub Actions, Cloudflare Worker runtime, OpenRouter Embeddings API and Chat Completions API.

## Global Constraints

- `AI` switch is rendered at the right edge of the existing search input and is OFF on every fresh page load.
- `AI=OFF` preserves the current local Diplodoc search behavior and causes zero OpenRouter usage.
- `AI=ON` performs semantic retrieval only after an explicit search action; it does not automatically generate an answer.
- Generative answering exists only behind an explicit `Спросить AI по найденному` / `Ask AI about these results` action.
- Answers may use only canonical public TrueRuslan content supplied by the Worker; no model world knowledge, web search, tools, private evidence, or autonomous actions are permitted.
- Insufficient evidence must return an explicit insufficient-evidence state rather than a guessed answer.
- GitHub Pages remains the static delivery platform and Diplodoc remains the sole ordinary site-wide full-text search owner.
- OpenRouter is the only permitted variable paid dependency.
- No database, vector database, D1, KV, R2, Vectorize, Pinecone, Supabase, Elasticsearch, Redis, paid queue, paid observability product, or separately hosted application server may be introduced.
- Normal `npm test`, `npm run build:docs`, and production deployment must work without `OPENROUTER_API_KEY` and without network access to OpenRouter.
- The browser must never receive the OpenRouter API key and must never be trusted to supply answer context text.
- Default provider routing for AI requests must use `provider: {zdr: true, data_collection: "deny"}` and fail closed when the configured route cannot satisfy those constraints.
- The initial embedding profile is `openai/text-embedding-3-small`, `dimensions: 512`, with `input_type: "search_document"` for corpus generation and `input_type: "search_query"` for user queries.
- The initial answer-model candidate is `google/gemini-2.5-flash-lite`; `full` mode may not be activated until its structured-output and grounded-answer acceptance gates pass.
- Structured answers use OpenRouter `response_format.type = "json_schema"`, `strict: true`, and provider routing with `require_parameters: true`.
- No custom AI analytics events are added in the MVP because the current analytics policy has `customEvents: false`; raw queries, answers, and context are never sent to analytics.
- A dedicated OpenRouter key with a hard spending limit is required before any public `search` or `full` activation.
- Complete feature removal must require no canonical-content migration, URL migration, SEO repair, or database cleanup.

---

## File Structure

### Canonical configuration and derived data

- `data/ai-navigator.json` — public/product configuration: schema, mode, Worker URL, model IDs, dimensions, bounded request/result limits, curated route scope, and accepted hybrid weights after benchmark selection.
- `data/ai-navigator-benchmark.json` — reviewed retrieval ground truth with RU/EN positive, paraphrase, exact-term, cross-language, and insufficient-evidence queries.
- `data/ai-index/chunks.json` — deterministic public derived corpus keyed by stable chunk ID; canonical source text only.
- `data/ai-index/index-meta.json` — schema/model/dimension/chunk-order/digest metadata.
- `data/ai-index/embeddings.bin` — Float32 vectors in exactly the chunk order declared by `index-meta.json`.

### Build-time modules

- `scripts/ai-config.js` — load and strictly validate `data/ai-navigator.json`.
- `scripts/ai-corpus.js` — derive semantic chunks from canonical repository sources; no network.
- `scripts/ai-index.js` — explicit OpenRouter document-embedding refresh with hash reuse; network only when explicitly invoked.
- `scripts/ai-index-verify.js` — verify committed index consistency/freshness without OpenRouter.
- `scripts/ai-benchmark.js` — evaluate lexical/semantic/hybrid retrieval over reviewed benchmark cases.
- `scripts/ai-retrieval-core.js` — pure ranking primitives shared by benchmark tests and mirrored by browser runtime semantics.
- `scripts/search-page.js` — extend the existing project-owned generated-search normalization with AI resource injection only when mode is `search` or `full`.
- `scripts/copy-assets.js` — copy/publish committed AI artifacts only in enabled modes and fail closed if they are stale/missing.

### Browser modules

- `docs/_assets/script/ai-retrieval.js` — classic dependency-free browser cosine/lexical/hybrid ranking implementation.
- `docs/_assets/script/ai-search.js` — AI switch lifecycle, lazy index fetch, query embedding call, semantic-result rendering, answer action, and fallback.
- `docs/_assets/style/ai-search.css` — restrained switch/result/answer UI scoped to generated search pages.
- Existing `docs/_assets/script/search-ui.js` remains the ordinary search owner and supplies the stable project-owned classes (`.tr-search-input`, `.tr-search-input-shell`, `.tr-search-button`, `.tr-search-results`).

### Edge module

- `infra/cloudflare/ai-navigator-worker.mjs` — stateless `/v1/embed` and `/v1/answer` gateway; fixed OpenRouter/model/privacy policy and canonical-corpus trust boundary.

### Tests and evidence

- `scripts/ai-config.test.js`
- `scripts/ai-corpus.test.js`
- `scripts/ai-index.test.js`
- `scripts/ai-index-verify.test.js`
- `scripts/ai-benchmark.test.js`
- `scripts/ai-retrieval.test.js`
- `scripts/ai-search-page.test.js`
- `scripts/ai-search-runtime.test.js`
- `scripts/ai-navigator-worker.test.js`
- `scripts/ai-navigator-browser-smoke.cjs`
- `docs/acceptance/2026-08-15-ai-navigator-engineering-readiness.md`

---

### Task 1: Lock configuration and deterministic corpus ownership

**Files:**
- Create: `data/ai-navigator.json`
- Create: `scripts/ai-config.js`
- Create: `scripts/ai-config.test.js`
- Create: `scripts/ai-corpus.js`
- Create: `scripts/ai-corpus.test.js`
- Read/consume: `data/page-meta.json`, `data/notes.json`, `data/projects.json`, `data/publications.json`, `data/project-evidence.json`

**Interfaces:**
- Produces: `loadAiConfig(filePath) -> AiNavigatorConfig`
- Produces: `buildAiCorpus({rootDir, config}) -> AiChunk[]`
- Produces: `writeAiCorpus({rootDir, config, outputPath}) -> {chunks, corpusDigest}`
- `AiChunk = {id, url, sourcePath, title, section, type, lang, text, contentHash}`
- Later tasks consume stable chunk IDs, `contentHash`, the exact `embeddingModel`/`embeddingDimensions`, and mode limits from `AiNavigatorConfig`.

- [ ] **Step 1: Write RED configuration tests**

Add strict tests that accept only `off|search|full`, reject unknown fields, reject non-HTTPS non-empty Worker URLs, reject arbitrary model selection, and enforce positive integer limits.

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

`hybridWeights: null` is valid only while `mode === 'off'`; `search` and `full` must require a benchmark-selected `{semantic, lexical, title, language}` object whose values sum to `1`.

- [ ] **Step 2: Run the configuration tests and confirm RED**

Run:

```bash
node --test scripts/ai-config.test.js
```

Expected: FAIL because `scripts/ai-config.js` does not exist.

- [ ] **Step 3: Implement strict config loading**

Implement `loadAiConfig()` with a fixed key allowlist, no schema coercion, and exact model IDs from the file. Do not read `OPENROUTER_API_KEY` in this module.

```js
export const AI_MODES = Object.freeze(new Set(['off', 'search', 'full']));

export function loadAiConfig(filePath) {
  const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  validateAiConfig(value);
  return Object.freeze(structuredClone(value));
}
```

- [ ] **Step 4: Run configuration tests and confirm GREEN**

Run:

```bash
node --test scripts/ai-config.test.js
```

Expected: PASS.

- [ ] **Step 5: Write RED corpus tests before corpus code**

Cover all of these exact invariants:

```js
assert.equal(firstJson, secondJson, 'corpus must be byte-deterministic');
assert.equal(new Set(chunks.map(({id}) => id)).size, chunks.length);
assert.ok(chunks.every(({url}) => /^\/(?:en\/)?[^?#]+\/$/.test(url)));
assert.ok(chunks.every(({lang}) => ['ru', 'en'].includes(lang)));
assert.ok(chunks.every(({text}) => text.trim().length >= 80));
assert.ok(chunks.every(({contentHash}) => /^sha256:[a-f0-9]{64}$/.test(contentHash)));
assert.ok(chunks.every(({sourcePath}) => sourcePath.startsWith('docs/')));
assert.ok(chunks.every(({sourcePath}) => !sourcePath.startsWith('docs/acceptance/')));
assert.ok(chunks.every(({sourcePath}) => !sourcePath.includes('PROJECT_STATE')));
assert.ok(chunks.every(({sourcePath}) => !sourcePath.includes('CHANGELOG')));
```

Also assert that every registered Engineering Note is represented at least once, every configured `includePagePaths` path resolves through existing canonical metadata/source ownership, normalized chunk text is not duplicated, and no private/non-public registry field enters `text`.

- [ ] **Step 6: Run corpus tests and confirm RED**

Run:

```bash
node --test scripts/ai-corpus.test.js
```

Expected: FAIL because `buildAiCorpus()` is not implemented.

- [ ] **Step 7: Implement source-aware Markdown chunking**

Implement deterministic parsing that:

1. resolves configured page paths via `data/page-meta.json` and their canonical `docs/*.md` owners;
2. adds all Notes from `data/notes.json` through their canonical Markdown files;
3. removes front matter, raw HTML chrome, include directives that merely duplicate registry-rendered cards, and non-reader metadata;
4. creates intro/H2 chunks, splitting an H2 at H3 boundaries only when its normalized prose exceeds 2400 characters;
5. coalesces adjacent chunks below 220 characters when they share a parent section and combined text stays under 2400 characters;
6. derives IDs as `<lang>:<type>:<canonical-slug>:<normalized-heading-or-intro>` and rejects collisions rather than appending unstable counters;
7. hashes normalized source-owned text with SHA-256.

Use pure helpers with exported signatures:

```js
export function normalizeChunkText(value) {}
export function chunkMarkdown({sourcePath, url, title, type, lang, markdown}) {}
export function buildAiCorpus({rootDir, config}) {}
export function serializeCorpus(chunks) {}
```

- [ ] **Step 8: Run corpus and existing unit tests**

Run:

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

### Task 2: Create the reviewed retrieval benchmark before embeddings

**Files:**
- Create: `data/ai-navigator-benchmark.json`
- Create: `scripts/ai-benchmark.js`
- Create: `scripts/ai-benchmark.test.js`
- Consume: `scripts/ai-corpus.js`

**Interfaces:**
- Produces: `loadBenchmark(filePath, validChunkIds) -> BenchmarkCase[]`
- Produces: `evaluateRetrieval({cases, retrieve}) -> BenchmarkReport`
- `BenchmarkCase = {id, lang, query, kind, expectedAnyOf, answerEligible}`
- Later retrieval tasks must satisfy this dataset without changing expected IDs merely to fit implementation output.

- [ ] **Step 1: Add 50 manually reviewed benchmark cases**

Use exactly five groups of ten:

1. RU exact technical terms;
2. RU natural-language paraphrases;
3. EN exact/paraphrase queries;
4. cross-language/discovery queries;
5. negative/insufficient-evidence and adversarial questions.

Include concrete cases such as:

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

Before committing the file, resolve every expected ID from the Task 1 corpus; the loader rejects stale/unknown IDs.

- [ ] **Step 2: Write RED benchmark-schema and lexical-baseline tests**

Require:

```js
assert.equal(cases.length, 50);
assert.equal(new Set(cases.map(({id}) => id)).size, 50);
assert.equal(cases.filter(({kind}) => kind === 'insufficient').length, 10);
assert.ok(cases.every(({query}) => query.trim().length >= 3));
```

Implement a lexical-only reference retriever in the benchmark module so the project records a pre-semantic baseline rather than assuming embeddings are better.

- [ ] **Step 3: Run tests and confirm RED**

```bash
node --test scripts/ai-benchmark.test.js
```

Expected: FAIL until benchmark loader/evaluator exist.

- [ ] **Step 4: Implement benchmark loading and metrics**

The report must emit:

```js
{
  total: 50,
  positiveCases: 40,
  insufficientCases: 10,
  recallAt5: 0,
  exactTermRecallAt5: 0,
  paraphraseRecallAt5: 0,
  insufficientTopScore: [],
  perCase: []
}
```

For positive cases, a hit means at least one `expectedAnyOf` chunk appears in top 5. Negative cases are measured separately and never counted as positive recall.

- [ ] **Step 5: Run the lexical baseline and store it only as test output**

```bash
node --test scripts/ai-benchmark.test.js
node scripts/ai-benchmark.js --mode lexical
```

Expected: PASS schema tests and print the deterministic lexical baseline. Do not weaken future semantic gates to match this number.

- [ ] **Step 6: Commit Task 2**

```bash
git add data/ai-navigator-benchmark.json scripts/ai-benchmark.js scripts/ai-benchmark.test.js
git commit -m "test: add AI retrieval benchmark"
```

---

### Task 3: Add explicit, cacheable OpenRouter embedding-index generation

**Files:**
- Create: `scripts/ai-index.js`
- Create: `scripts/ai-index.test.js`
- Create: `scripts/ai-index-verify.js`
- Create: `scripts/ai-index-verify.test.js`
- Modify: `package.json` scripts section
- Create on the first explicit refresh: `data/ai-index/chunks.json`, `data/ai-index/index-meta.json`, `data/ai-index/embeddings.bin`

**Interfaces:**
- Produces: `createEmbeddingRequest({texts, config}) -> RequestInit payload data`
- Produces: `refreshAiIndex({rootDir, config, fetchImpl, apiKey}) -> RefreshReport`
- Produces: `verifyAiIndex({rootDir, config}) -> VerificationReport`
- Index metadata declares `chunkIds` in vector order and is authoritative for decoding `embeddings.bin`.

- [ ] **Step 1: Write RED OpenRouter request-contract tests with mock fetch**

Assert the document request is exactly bounded to the pinned model and privacy profile:

```js
assert.deepEqual(body, {
  model: 'openai/text-embedding-3-small',
  dimensions: 512,
  input_type: 'search_document',
  input: changedTexts,
  provider: {
    zdr: true,
    data_collection: 'deny'
  }
});
```

Assert the request URL is exactly `https://openrouter.ai/api/v1/embeddings`, authorization is read only from the injected key, and neither key nor full response headers are logged.

- [ ] **Step 2: Write RED reuse/failure tests**

Cover:

- unchanged `contentHash` reuses prior vector without calling fetch;
- changed/new chunks are batched in deterministic chunk-ID order;
- deleted chunks disappear from metadata/binary;
- vector dimension mismatch rejects the response;
- partial/missing response entries reject the refresh and leave existing files unchanged;
- no API key gives a clear explicit-maintenance error;
- HTTP 402/429/5xx is surfaced without automatic multi-request retry.

- [ ] **Step 3: Run index tests and confirm RED**

```bash
node --test scripts/ai-index.test.js scripts/ai-index-verify.test.js
```

Expected: FAIL because index modules do not exist.

- [ ] **Step 4: Implement atomic index refresh**

Write new artifacts into a temporary directory and rename them into `data/ai-index/` only after all vectors and digests validate.

`index-meta.json` schema:

```json
{
  "schemaVersion": 1,
  "embeddingModel": "openai/text-embedding-3-small",
  "dimensions": 512,
  "chunkIds": ["..."],
  "contentHashes": {"chunk-id": "sha256:..."},
  "corpusDigest": "sha256:...",
  "embeddingsDigest": "sha256:...",
  "sourceCommit": "<40-hex commit when supplied by caller>"
}
```

`embeddings.bin` is little-endian Float32 data with exact length `chunkIds.length * dimensions * 4` bytes.

- [ ] **Step 5: Implement offline verification**

`verifyAiIndex()` rebuilds the corpus locally and verifies hashes, chunk order, binary length/digest, configured model and dimensions. It performs no fetch and never reads an API key.

- [ ] **Step 6: Add explicit npm commands, not implicit build coupling**

Modify `package.json`:

```json
"ai:corpus": "node scripts/ai-corpus.js --write data/ai-index/chunks.json",
"ai:index": "node scripts/ai-index.js",
"ai:verify": "node scripts/ai-index-verify.js"
```

Do **not** add `ai:index` to `build`, `build:docs`, `copy-assets`, `test`, or deployment workflows.

- [ ] **Step 7: Prove ordinary build is OpenRouter-independent**

Run with no secret:

```bash
unset OPENROUTER_API_KEY
npm test
npm run build:docs
```

Expected: PASS while canonical mode remains `off`.

- [ ] **Step 8: Run explicit index tests and commit implementation without making a live API call in CI**

```bash
node --test scripts/ai-index.test.js scripts/ai-index-verify.test.js
npm test
```

Expected: PASS using mock fetch.

```bash
git add package.json scripts/ai-index.js scripts/ai-index.test.js scripts/ai-index-verify.js scripts/ai-index-verify.test.js
git commit -m "feat: add explicit AI embedding indexer"
```

The first real `npm run ai:index` is an operator action in Task 11 after the dedicated OpenRouter key/spending cap exist; generated vectors are not fabricated in tests.

---

### Task 4: Implement deterministic hybrid retrieval and select weights by benchmark

**Files:**
- Create: `scripts/ai-retrieval-core.js`
- Create: `scripts/ai-retrieval.test.js`
- Modify: `scripts/ai-benchmark.js`
- Modify after benchmark selection: `data/ai-navigator.json`
- Create: `docs/_assets/script/ai-retrieval.js`

**Interfaces:**
- Produces Node API: `rankChunks({query, queryVector, chunks, embeddings, config}) -> RankedResult[]`
- Produces browser API: `window.TrueRuslanAiRetrieval.rankChunks(options)` with the same scoring semantics.
- `RankedResult = {chunkId, score, semanticScore, lexicalScore, titleScore, languageScore}`

- [ ] **Step 1: Write RED pure-math/ranking tests**

Cover exact cosine behavior, dimension mismatch, zero vector rejection, deterministic tie ordering by chunk ID, Unicode token normalization, RU/EN case folding, exact-title boosts, and language preference.

```js
assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
assert.throws(() => cosineSimilarity([1], [1, 0]), /dimension/i);
```

- [ ] **Step 2: Run retrieval tests and confirm RED**

```bash
node --test scripts/ai-retrieval.test.js
```

Expected: FAIL until the pure ranking module exists.

- [ ] **Step 3: Implement scoring primitives**

Use normalized component scores in `[0,1]` and one explicit weighted sum:

```js
score = semantic * weights.semantic
  + lexical * weights.lexical
  + title * weights.title
  + language * weights.language;
```

No hidden boost may exist outside this formula.

- [ ] **Step 4: Add deterministic weight-grid evaluation to the benchmark**

Evaluate this finite grid only:

```js
const candidates = [
  {semantic: 0.55, lexical: 0.30, title: 0.10, language: 0.05},
  {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05},
  {semantic: 0.70, lexical: 0.15, title: 0.10, language: 0.05},
  {semantic: 0.75, lexical: 0.10, title: 0.10, language: 0.05}
];
```

Selection order:

1. must achieve positive-case `Recall@5 >= 0.90`;
2. must not lose any exact-term benchmark case that lexical retrieval had in top 5;
3. among qualifying candidates, maximize paraphrase Recall@5;
4. tie-break by lower semantic weight, then the array order above.

If no candidate qualifies, stop the feature at `mode=off`; do not weaken the gate in the same PR.

- [ ] **Step 5: Create the browser classic-script mirror**

`ai-retrieval.js` must contain no imports/exports and expose:

```js
root.TrueRuslanAiRetrieval = Object.freeze({
  cosineSimilarity,
  normalizeSearchText,
  lexicalScore,
  rankChunks,
});
```

Add a source-contract test ensuring the Node/browser scoring formulas and configured weight keys stay aligned.

- [ ] **Step 6: Run pure tests**

```bash
node --test scripts/ai-retrieval.test.js scripts/ai-benchmark.test.js
```

Expected: PASS for deterministic math and benchmark mechanics. Semantic acceptance itself waits for the real index in Task 11.

- [ ] **Step 7: Commit Task 4**

```bash
git add scripts/ai-retrieval-core.js scripts/ai-retrieval.test.js scripts/ai-benchmark.js docs/_assets/script/ai-retrieval.js
git commit -m "feat: add hybrid AI retrieval engine"
```

Do not populate `hybridWeights` yet unless a real embedding index has actually passed the benchmark.

---

### Task 5: Make AI search-page resources mode-gated and fully reversible

**Files:**
- Modify: `scripts/search-page.js` (`injectProjectSearchResources`, `normalizeSearchPageHtml`)
- Modify: `scripts/copy-assets.js` (`SEARCH_RESOURCES`, `normalizeSearchPages`, `postprocessOutput`)
- Create: `scripts/ai-search-page.test.js`
- Create: `docs/_assets/style/ai-search.css`
- Consume: `scripts/ai-config.js`

**Interfaces:**
- Change: `normalizeSearchPageHtml(html, pageRelativePath, {aiConfig}) -> string`
- Produces enabled-page markers: `data-tr-ai-mode="search|full"`
- Produces no AI marker/resource references at all when mode is `off`.

- [ ] **Step 1: Write RED mode-gating tests around generated search normalization**

For `off`:

```js
assert.doesNotMatch(html, /data-tr-ai-mode/);
assert.doesNotMatch(html, /ai-search\.css/);
assert.doesNotMatch(html, /ai-retrieval\.js/);
assert.doesNotMatch(html, /ai-search\.js/);
```

For `search` and `full`, require exactly one each of:

- `_assets/style/ai-search.css`;
- `_assets/script/ai-retrieval.js`;
- `_assets/script/ai-search.js`;
- root marker `data-tr-ai-mode`.

Also require existing `search.css`/`search-ui.js` exactly once in every mode.

- [ ] **Step 2: Run the focused tests and confirm RED**

```bash
node --test scripts/ai-search-page.test.js
```

Expected: FAIL because mode-gated resources are not supported.

- [ ] **Step 3: Extend project-owned normalization rather than patch Diplodoc**

Load AI config in `copy-assets.js` only for production docs. Pass it to `normalizeSearchPages()`. In `off`, preserve current search resource output. In enabled modes, inject only the three AI resources and mode marker through parse5.

Add AI resources to explicit copy logic, but copy them into `docs-html` only when mode is enabled. Do not add them globally to `docs/.yfm`.

- [ ] **Step 4: Publish committed static AI artifacts only in enabled modes**

Add `publishAiArtifacts({rootDir, outputDir, config})` to `copy-assets.js` or a focused helper `scripts/ai-static-assets.js` if the function exceeds 80 lines.

Enabled-mode requirements:

```text
data/ai-index/chunks.json       -> docs-html/ai/chunks.json
data/ai-index/index-meta.json   -> docs-html/ai/index-meta.json
data/ai-index/embeddings.bin    -> docs-html/ai/embeddings.bin
```

Before copy, call `verifyAiIndex()`. A stale or missing index fails the build with `AI index unavailable or stale; run npm run ai:index explicitly`. The verifier does not call OpenRouter.

- [ ] **Step 5: Run off-mode regression and full normal build**

Canonical config remains `mode: off`.

```bash
node --test scripts/ai-search-page.test.js
rm -rf docs-html
npm run build:docs
npm run check:site
```

Expected: PASS; generated search has no AI resource references and requires no index.

- [ ] **Step 6: Commit Task 5**

```bash
git add scripts/search-page.js scripts/copy-assets.js scripts/ai-search-page.test.js docs/_assets/style/ai-search.css
git commit -m "feat: gate AI search resources by mode"
```

---

### Task 6: Add the stateless Worker query-embedding endpoint

**Files:**
- Create: `infra/cloudflare/ai-navigator-worker.mjs`
- Create: `scripts/ai-navigator-worker.test.js`

**Interfaces:**
- HTTP: `POST /v1/embed` body `{query: string}`
- Success: `200 {embedding: number[], model: string, dimensions: number}`
- Failure: bounded JSON `{error: string, code: string}` with no provider body/key leakage.
- Worker environment: `AI_ENABLED`, `OPENROUTER_API_KEY`, `AI_ALLOWED_ORIGIN`, `AI_CORPUS_ORIGIN`, `AI_EMBEDDING_MODEL`, `AI_EMBEDDING_DIMENSIONS`, `AI_ANSWER_MODEL`.

- [ ] **Step 1: Write RED Worker envelope/security tests**

Require:

- only `POST` for `/v1/embed` (`405` otherwise);
- unknown route `404`;
- `AI_ENABLED !== "true"` => `503 feature_disabled` before provider call;
- missing key => `503 provider_unconfigured`;
- Origin must equal exactly `https://trueruslan.ru` when present; foreign origin => `403`;
- JSON only; malformed body => `400`;
- query trim length `1..500`; otherwise `400`;
- request body cannot contain `model`, `dimensions`, `provider`, or extra fields;
- CORS response allows only the configured exact origin, never `*`.

- [ ] **Step 2: Write RED OpenRouter forwarding tests**

Mock fetch and assert exact outbound body:

```js
{
  model: env.AI_EMBEDDING_MODEL,
  dimensions: 512,
  input_type: 'search_query',
  input: 'validated query',
  provider: {
    zdr: true,
    data_collection: 'deny'
  }
}
```

Assert one outbound request maximum and sanitized handling of 400/401/402/429/5xx.

- [ ] **Step 3: Run Worker tests and confirm RED**

```bash
node --test scripts/ai-navigator-worker.test.js
```

Expected: FAIL because Worker does not exist.

- [ ] **Step 4: Implement the minimal Worker with injectable fetch**

Follow the existing `trueruslan-com-worker.mjs` style: pure exported handler/helpers, fixed URL constants, no SDK dependency, no storage binding.

Use an abort timeout of 8 seconds:

```js
const signal = AbortSignal.timeout(8000);
await fetchImpl('https://openrouter.ai/api/v1/embeddings', {method: 'POST', headers, body, signal});
```

Validate the returned vector length and all values with `Number.isFinite` before responding.

- [ ] **Step 5: Run focused tests and CodeQL-sensitive unit suite**

```bash
node --test scripts/ai-navigator-worker.test.js
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

```bash
git add infra/cloudflare/ai-navigator-worker.mjs scripts/ai-navigator-worker.test.js
git commit -m "feat: add AI query embedding gateway"
```

Do not add Wrangler deployment/account/route config in this engineering slice.

---

### Task 7: Add the in-field AI switch and semantic results without changing ordinary search

**Files:**
- Create: `docs/_assets/script/ai-search.js`
- Create: `scripts/ai-search-runtime.test.js`
- Modify: `docs/_assets/style/ai-search.css`
- Modify: `scripts/search-smoke.cjs` only to assert OFF-mode non-regression while canonical mode is still `off`

**Interfaces:**
- Browser API: `window.TrueRuslanAiSearch.init()`
- Browser helper: `createAiSwitch(document, inputShell, mode) -> HTMLElement`
- Browser helper: `loadAiIndex({baseUrl, fetchImpl}) -> {chunks, embeddings, meta}`
- Browser helper: `requestQueryEmbedding({workerBaseUrl, query, fetchImpl}) -> number[]`
- Existing `.tr-search-input`, `.tr-search-input-shell`, `.tr-search-button`, `.tr-search-results` remain ordinary-search hooks.

- [ ] **Step 1: Write RED classic-script and switch-state tests**

Using the existing VM/fake-DOM style from `search-ui.test.js`, require:

- no imports/exports;
- a frozen `TrueRuslanAiSearch` API;
- switch is created once and is idempotent;
- role/`aria-checked`/localized accessible name are correct;
- initial state is always OFF even if a fake `localStorage` contains stale data;
- code never writes cookie/localStorage/sessionStorage;
- turning ON changes only AI UI state and placeholder;
- turning OFF removes/hides AI result/answer panel and restores ordinary form behavior.

- [ ] **Step 2: Run runtime tests and confirm RED**

```bash
node --test scripts/ai-search-runtime.test.js
```

Expected: FAIL because `ai-search.js` does not exist.

- [ ] **Step 3: Implement restrained switch UI**

Runtime enhancement finds the existing project-owned `.tr-search-input-shell` created by `search-ui.js`, then appends:

```html
<label class="tr-ai-switch">
  <span class="tr-ai-switch__label">AI</span>
  <button type="button" role="switch" aria-checked="false" aria-label="Поиск по смыслу с помощью AI"></button>
</label>
```

Use the equivalent English accessible label on `/_search/en/`.

CSS requirements:

- no gradients/glow/robot iconography;
- minimum 40px pointer target;
- visible keyboard focus;
- no color-only state;
- compact mobile layout without hiding the `AI` text;
- `prefers-reduced-motion: reduce` disables switch/answer transitions.

- [ ] **Step 4: Implement lazy semantic submit path**

When OFF, do not attach `preventDefault` to the ordinary submit path.

When ON and the search button/form is submitted:

1. prevent only that enabled-mode submission;
2. validate trimmed query length `1..500`;
3. lazily fetch `/ai/index-meta.json`, `/ai/chunks.json`, `/ai/embeddings.bin` once;
4. call Worker `/v1/embed` once;
5. decode Float32 vectors after exact dimension/byte-length validation;
6. rank through `TrueRuslanAiRetrieval.rankChunks()`;
7. render maximum five canonical results.

The initial rendered result is source-derived only:

```html
<article class="tr-ai-result">
  <a class="tr-ai-result__title" href="/notes/.../">Canonical title</a>
  <p class="tr-ai-result__meta">Engineering Note · Section</p>
  <p class="tr-ai-result__snippet">Source-owned text excerpt…</p>
</article>
```

No LLM-generated relevance explanation is allowed.

- [ ] **Step 5: Implement failure fallback**

For network timeout, Worker 402/429/5xx, invalid vector, stale client artifact, or disabled Worker:

- keep the page/search input usable;
- show one compact AI-unavailable message;
- offer `Обычный поиск` that switches AI OFF and submits the existing Diplodoc form with the current query;
- do not retry automatically.

- [ ] **Step 6: Extend ordinary search smoke while mode is off**

Add assertions to `scripts/search-smoke.cjs` that canonical `mode=off` has no `.tr-ai-switch`, no `/ai/` network request, and all existing publication/EN/search visual contracts still pass.

- [ ] **Step 7: Run focused and existing search tests**

```bash
node --test scripts/search-ui.test.js scripts/ai-search-runtime.test.js scripts/ai-search-page.test.js
npm run build:docs
node scripts/search-smoke.cjs
```

Expected: PASS with AI absent in canonical OFF mode.

- [ ] **Step 8: Commit Task 7**

```bash
git add docs/_assets/script/ai-search.js docs/_assets/style/ai-search.css scripts/ai-search-runtime.test.js scripts/search-smoke.cjs
git commit -m "feat: add reversible AI search mode UI"
```

---

### Task 8: Add strict grounded-answer generation to the same stateless Worker

**Files:**
- Modify: `infra/cloudflare/ai-navigator-worker.mjs`
- Modify: `scripts/ai-navigator-worker.test.js`

**Interfaces:**
- HTTP: `POST /v1/answer` body `{question: string, chunkIds: string[]}`
- Worker fetches canonical corpus only from `${AI_CORPUS_ORIGIN}/ai/chunks.json`.
- Success shape: `{sufficientEvidence: boolean, answer: string, citations: string[]}`.

- [ ] **Step 1: Write RED trust-boundary tests**

Reject:

- arbitrary `context`, `messages`, `model`, or provider fields from browser;
- more than 5 chunk IDs;
- duplicate chunk IDs;
- malformed/overlong IDs;
- question outside `1..500` characters;
- unknown chunk IDs after canonical corpus fetch;
- corpus fetch redirecting away from exact configured TrueRuslan origin;
- corpus object with invalid schema/digest.

Assert the only trusted content sent to OpenRouter came from the fetched static corpus, not request JSON.

- [ ] **Step 2: Write RED grounded prompt and structured-output contract**

Provider request must use the fixed answer model and include:

```js
provider: {
  zdr: true,
  data_collection: 'deny',
  require_parameters: true
},
response_format: {
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
}
```

System instruction must explicitly prohibit world knowledge, browsing, inference of absent personal facts, and citations outside provided context.

- [ ] **Step 3: Add RED response-validation tests**

Reject provider output when:

- cited ID was not among supplied context chunks;
- cited ID does not exist in canonical corpus;
- `sufficientEvidence=true` with empty answer/citations;
- `sufficientEvidence=false` with invented factual answer text;
- answer exceeds 450 words;
- malformed structured payload.

For insufficient evidence normalize outward response to:

```json
{"sufficientEvidence":false,"answer":"","citations":[]}
```

- [ ] **Step 4: Run Worker tests and confirm RED**

```bash
node --test scripts/ai-navigator-worker.test.js
```

Expected: FAIL on the new answer tests.

- [ ] **Step 5: Implement `/v1/answer`**

Request sequence is exactly two outbound fetches maximum:

1. fixed canonical corpus URL;
2. `https://openrouter.ai/api/v1/chat/completions`.

Use 8-second timeout per outbound fetch, `max_tokens: 700`, no tools, no conversation history, no streaming, and no automatic retry.

Build context as clearly delimited records:

```text
<source id="ru:note:...">
TITLE: ...
SECTION: ...
URL: /notes/.../
CONTENT:
...
</source>
```

Truncate/reject before provider call when selected canonical context exceeds `18000` characters; never silently drop an arbitrary cited chunk.

- [ ] **Step 6: Run Worker and full unit tests**

```bash
node --test scripts/ai-navigator-worker.test.js
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit Task 8**

```bash
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
- Answer action exists only when page marker is `data-tr-ai-mode="full"` and semantic retrieval has at least one result.
- Browser sends `{question, chunkIds}` only.
- No chat history or answer persistence.

- [ ] **Step 1: Write RED full/search/off mode tests**

Assert:

- `off`: no AI UI;
- `search`: semantic results may render, answer button never renders;
- `full`: answer button renders only after successful retrieval;
- button uses top-ranked unique chunk IDs, maximum 5;
- browser request contains no context text/model/provider settings;
- repeated click while in-flight cannot duplicate a provider request.

- [ ] **Step 2: Write RED answer rendering tests**

Require:

- citations resolve only through locally loaded canonical chunk metadata;
- citations render same-tab same-site links;
- `sufficientEvidence=false` renders localized insufficient-evidence copy and no fabricated answer;
- 402/429/timeout leaves semantic results visible;
- a new semantic search discards the previous answer rather than creating conversation history.

- [ ] **Step 3: Run and confirm RED**

```bash
node --test scripts/ai-search-runtime.test.js
```

Expected: FAIL on answer UI cases.

- [ ] **Step 4: Implement the bounded answer panel**

Use a single panel below semantic results:

```html
<section class="tr-ai-answer" aria-live="polite">
  <div class="tr-ai-answer__body"></div>
  <ol class="tr-ai-answer__sources"></ol>
</section>
```

Do not use `innerHTML` with provider text. Render answer with `textContent`; citations are links created from validated local metadata.

- [ ] **Step 5: Run focused tests**

```bash
node --test scripts/ai-search-runtime.test.js scripts/ai-navigator-worker.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 9**

```bash
git add docs/_assets/script/ai-search.js docs/_assets/style/ai-search.css scripts/ai-search-runtime.test.js
git commit -m "feat: add explicit grounded AI answers"
```

---

### Task 10: Add enabled-mode browser, accessibility, degradation, and CI verification

**Files:**
- Create: `scripts/ai-navigator-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`
- Modify: `scripts/site-integrity.js` only if the current integrity scanner does not already verify the new `/ai/` artifact references
- Modify: `package.json` scripts section

**Interfaces:**
- New command: `npm run check:ai` performs only offline artifact/config checks.
- Browser smoke starts a local static site plus a local fake Worker endpoint; it never calls OpenRouter.

- [ ] **Step 1: Add `check:ai` without live AI**

```json
"check:ai": "node scripts/ai-index-verify.js --allow-off"
```

Behavior:

- mode `off`: validates config and exits success without requiring an index;
- mode `search|full`: requires fresh index and accepted non-null hybrid weights.

- [ ] **Step 2: Write the browser smoke with local fake Worker**

Run production-like generated search in three fixture modes without editing canonical config:

- OFF: switch/resources absent, ordinary Diplodoc query still works;
- SEARCH: switch appears OFF initially, turns ON, semantic request is one fake `/v1/embed`, top five source-derived results render, answer action absent;
- FULL: same retrieval plus one fake `/v1/answer`, grounded answer/citations render.

The smoke must also test:

- 402 budget exhausted;
- 429 rate limited;
- 503 Worker disabled;
- timeout;
- insufficient evidence;
- keyboard switch activation;
- focus visibility;
- mobile width 390px with no horizontal overflow;
- zero serious/critical Axe violations;
- reduced-motion path;
- no request to OpenRouter host from browser;
- no localStorage/cookie persistence.

Write evidence to:

```text
artifacts/ai-navigator-summary.json
artifacts/ai-navigator-search-mobile.png
artifacts/ai-navigator-full-desktop.png
```

- [ ] **Step 3: Run smoke locally against fake endpoints**

```bash
npm run build:docs
node scripts/ai-navigator-browser-smoke.cjs
```

Expected: PASS without OpenRouter credentials.

- [ ] **Step 4: Add CI steps after existing Generated search browser smoke**

In `.github/workflows/build.yml` add:

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

Copy those logs and three evidence artifacts into `quality-artifacts/` in the existing preservation step.

Do not add `OPENROUTER_API_KEY` secrets or live provider calls to CI.

- [ ] **Step 5: Run the entire local acceptance matrix available in the repository**

```bash
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
git add package.json .github/workflows/build.yml scripts/ai-navigator-browser-smoke.cjs scripts/site-integrity.js
git commit -m "test: gate AI Navigator readiness"
```

If `scripts/site-integrity.js` required no change, omit it from `git add`.

---

### Task 11: Generate the real index and prove retrieval quality before public activation

**Files:**
- Modify generated artifacts: `data/ai-index/chunks.json`, `data/ai-index/index-meta.json`, `data/ai-index/embeddings.bin`
- Modify after measured selection: `data/ai-navigator.json`
- Create: `docs/acceptance/2026-08-15-ai-navigator-engineering-readiness.md`

**Interfaces:**
- Requires operator-provided `OPENROUTER_API_KEY` dedicated to TrueRuslan AI Navigator with hard spending cap already configured.
- Does not change mode from `off`.

- [ ] **Step 1: Create the dedicated OpenRouter key outside the repository**

Required operator properties before proceeding:

```text
purpose: TrueRuslan AI Navigator
hard spending limit: configured and verified
repository storage: forbidden
GitHub/browser storage: forbidden
local invocation: environment variable only
```

Do not commit screenshots/key values. Record only that the prerequisite was verified and the date in the acceptance ledger.

- [ ] **Step 2: Generate real document embeddings explicitly**

```bash
OPENROUTER_API_KEY='***' npm run ai:index
```

Expected report:

- model exactly `openai/text-embedding-3-small`;
- dimensions exactly `512`;
- one vector per current chunk;
- no unresolved partial responses;
- committed corpus/index digests printed.

- [ ] **Step 3: Verify index offline immediately after generation**

```bash
unset OPENROUTER_API_KEY
npm run ai:verify
```

Expected: PASS, proving committed artifacts need no provider access for verification/build.

- [ ] **Step 4: Run semantic weight-grid benchmark and enforce acceptance gates**

```bash
node scripts/ai-benchmark.js --mode semantic --index data/ai-index
```

Required before continuing:

```text
positive Recall@5 >= 0.90
exact-term lexical no-regression = 100%
selected weights = deterministic winner from Task 4 grid
all 10 insufficient cases remain answerEligible=false
```

If no candidate qualifies, stop with `mode=off` and open a focused retrieval-quality issue; do not enable the feature.

- [ ] **Step 5: Commit only the measured winning weights**

Set `hybridWeights` in `data/ai-navigator.json` to the exact selected grid entry. Do not change `mode` or `workerBaseUrl`.

- [ ] **Step 6: Write the immutable engineering-readiness ledger**

Record:

- exact source commit used for corpus;
- corpus chunk count/digest;
- embedding model/dimensions;
- embedding artifact digest;
- benchmark totals and Recall@5;
- winning weights;
- offline build proof without key;
- Worker unit-test result;
- browser fake-provider result;
- explicit status `ENGINEERING READY / PUBLIC AI OFF`.

- [ ] **Step 7: Run full tests again without the key**

```bash
unset OPENROUTER_API_KEY
npm test
npm run build:docs
npm run check:site
npm run check:ai
node scripts/search-smoke.cjs
node scripts/ai-navigator-browser-smoke.cjs
```

Expected: all PASS while public UI remains OFF.

- [ ] **Step 8: Commit Task 11**

```bash
git add data/ai-index data/ai-navigator.json docs/acceptance/2026-08-15-ai-navigator-engineering-readiness.md
git commit -m "data: add benchmarked AI search index"
```

---

### Task 12: Merge engineering implementation with AI still OFF and verify exact production SHA

**Files:**
- No new source files required; this is an acceptance/release gate.

**Interfaces:**
- Public site state remains `mode=off`.
- Cloudflare Worker is still not required for site availability.

- [ ] **Step 1: Open the engineering PR from its isolated implementation branch**

PR body must explicitly say:

```text
PUBLIC AI MODE: OFF
OPENROUTER REQUIRED FOR NORMAL BUILD: NO
DATABASE/VECTOR STORE: NONE
DIPLODOC ORDINARY SEARCH OWNER: UNCHANGED
```

Include Task 11 benchmark and digest evidence.

- [ ] **Step 2: Require exact-head normal gates**

Do not merge until the exact PR head has successful:

- Build, including the new AI offline/browser steps;
- Dependency Review;
- CodeQL;
- all existing search/accessibility/browser/visual/custom-domain/discovery checks.

- [ ] **Step 3: Squash merge only after exact-head success**

Use the repository's existing squash-only merge policy and expected-head guard.

- [ ] **Step 4: Require post-merge exact-SHA production acceptance**

Verify on the exact squash SHA:

- GitHub Pages deployment SUCCESS;
- Production Live SUCCESS;
- master CodeQL SUCCESS;
- ordinary search production smoke SUCCESS;
- AI is still visibly absent because mode is `off`.

- [ ] **Step 5: Record final engineering acceptance in the PR/ledger**

Status becomes:

```text
AI NAVIGATOR ENGINEERING: PRODUCTION ACCEPTED
PUBLIC AI FEATURE: OFF
TOKEN SPEND FROM VISITORS: $0
```

---

### Task 13: Deploy the free stateless Worker and canary `search` mode in a separate activation PR

**Files:**
- Modify in activation PR only: `data/ai-navigator.json`
- Optional deployment documentation only: `docs/acceptance/<activation-date>-ai-navigator-search-canary.md`
- Worker source already exists at `infra/cloudflare/ai-navigator-worker.mjs`.

**Interfaces:**
- Uses a Cloudflare Worker free-tier deployment; no storage bindings.
- Uses a `workers.dev` HTTPS URL initially so activation does not require DNS or changing the GitHub Pages custom-domain architecture.

- [ ] **Step 1: Deploy Worker manually with no storage products**

Required bindings only:

```text
AI_ENABLED=true
OPENROUTER_API_KEY=<secret>
AI_ALLOWED_ORIGIN=https://trueruslan.ru
AI_CORPUS_ORIGIN=https://trueruslan.ru
AI_EMBEDDING_MODEL=openai/text-embedding-3-small
AI_EMBEDDING_DIMENSIONS=512
AI_ANSWER_MODEL=google/gemini-2.5-flash-lite
```

Do not create D1/KV/R2/Vectorize bindings.

- [ ] **Step 2: Smoke the deployed Worker before exposing UI**

From an operator machine, send one valid embed request with Origin `https://trueruslan.ru` and verify:

- 200;
- 512 finite values;
- model matches configured embedding model.

Then verify foreign Origin => 403 and GET => 405.

- [ ] **Step 3: Create a small activation PR**

Change only:

```json
"mode": "search",
"workerBaseUrl": "https://<actual-worker-name>.<actual-account-subdomain>.workers.dev"
```

The actual deployed URL must be copied exactly from Cloudflare deployment output; no guessed URL is accepted.

- [ ] **Step 4: Run enabled-mode build and browser checks**

```bash
npm run ai:verify
npm test
npm run build:docs
npm run check:site
npm run check:ai
node scripts/ai-navigator-browser-smoke.cjs
```

Expected: PASS; generated search references the static AI artifacts and switch, but answer action remains absent in `search` mode.

- [ ] **Step 5: Merge only after normal exact-head gates, then production smoke manually**

Verify on `https://trueruslan.ru/_search/ru/` and EN search:

- switch initially OFF;
- ordinary search unchanged OFF;
- ON semantic query works;
- 3–5 expected canonical results;
- no Ask AI action;
- one embedding request per explicit AI search;
- no console error/overflow/accessibility regression.

- [ ] **Step 6: Verify emergency rollback**

Set Worker `AI_ENABLED=false` and confirm the UI degrades gracefully; then restore true. Also verify that changing repository mode back to `off` removes the switch/assets on the next deployment without touching canonical content.

---

### Task 14: Promote to `full` mode only after grounded-answer live canary passes

**Files:**
- Modify in a separate PR: `data/ai-navigator.json`
- Create: `docs/acceptance/<activation-date>-ai-navigator-full-canary.md`

**Interfaces:**
- No architecture change from search mode.
- The same Worker/key/corpus is used; only the explicit answer action becomes visible.

- [ ] **Step 1: Run live grounded-answer canary while public mode is still `search`**

Call Worker `/v1/answer` directly with five reviewed questions whose expected citations are known from `data/ai-navigator-benchmark.json`.

Include at least:

```text
Какие проекты связаны с AI?
Как Руслан проверяет production acceptance?
Какой опыт есть со Spring Boot?
What is Vlezet trying to solve?
Какая у Руслана текущая зарплата?  -> insufficientEvidence=false/empty answer contract
```

For the last case, required result is `sufficientEvidence=false`, `answer=""`, `citations=[]`.

- [ ] **Step 2: Verify live privacy/structured-output contract**

The configured route must accept `zdr=true`, `data_collection=deny`, and strict JSON schema. Any inability to satisfy these parameters blocks `full` activation rather than relaxing them.

- [ ] **Step 3: Create the full-mode activation PR**

Change only:

```json
"mode": "full"
```

Do not change models, retrieval weights, corpus, or UI architecture in the same activation PR.

- [ ] **Step 4: Run full offline/CI acceptance and merge**

Require normal exact-head Build/Dependency Review/CodeQL, then Pages/Production Live/master CodeQL on the exact merged SHA.

- [ ] **Step 5: Production UX smoke**

Verify:

- OFF initial state still costs nothing;
- semantic results still appear before generation;
- Ask AI appears only after semantic success;
- answer contains clickable canonical citations;
- insufficient evidence is explicit;
- 402/429/503 leaves semantic results intact;
- a second question starts from a fresh retrieval state with no chat history.

---

### Task 15: Run the explicit keep / downgrade / remove experiment verdict

**Files:**
- Modify only after evidence review: `data/ai-navigator.json`
- Create: `docs/acceptance/<review-date>-ai-navigator-product-verdict.md`

**Interfaces:**
- Permitted verdicts: `KEEP_FULL`, `KEEP_SEARCH_ONLY`, `REMOVE`.
- No new paid analytics or storage may be introduced to reach the verdict.

- [ ] **Step 1: Review only evidence available without storing raw queries**

Use:

- OpenRouter aggregate spend/usage for the dedicated key;
- Worker/Cloudflare coarse operational request/error data already available in the free platform UI, if retained under the selected privacy settings;
- manual production smoke observations;
- existing consent-respecting site analytics only at its already configured capability level (`customEvents=false`);
- direct qualitative feedback if received.

Do not add query/answer logging merely to improve measurement.

- [ ] **Step 2: Apply one explicit verdict**

`KEEP_FULL`:

```json
"mode": "full"
```

`KEEP_SEARCH_ONLY`:

```json
"mode": "search"
```

`REMOVE` immediate safe state:

```json
"mode": "off",
"workerBaseUrl": ""
```

Then disable `AI_ENABLED`, revoke the dedicated OpenRouter key, and optionally delete Worker deployment after the off deployment is accepted.

- [ ] **Step 3: Verify removal contract when verdict is REMOVE**

After `mode=off` deployment:

```bash
npm test
npm run build:docs
npm run check:site
node scripts/search-smoke.cjs
```

Required production state:

- ordinary Diplodoc search unchanged;
- no AI switch;
- no AI JS/CSS/index references from generated search HTML;
- no visitor OpenRouter spend;
- no content/URL/canonical/SEO migration performed.

- [ ] **Step 4: Record the product verdict**

The verdict document must state exactly which mode remains, why, approximate token cost observed, operational problems, and whether the Worker/key remain active. Do not claim engagement impact not supported by available evidence.

---

## Final Acceptance Matrix

The feature is not considered fully accepted merely because source code exists.

| Layer | Required evidence |
|---|---|
| Corpus | deterministic source-owned chunks, no private/CI content, stable IDs/hashes |
| Index | explicit real OpenRouter generation, offline digest verification, no build dependency on provider |
| Retrieval | 50-query reviewed benchmark, positive Recall@5 >= 0.90, exact-term lexical no-regression |
| Ordinary search | existing `search-smoke.cjs` remains green; OFF path unchanged |
| UI | switch OFF on fresh load, accessible, mobile-safe, no persistence |
| Worker | stateless, fixed models, strict origins/routes/limits, sanitized errors, no storage |
| Grounding | canonical corpus fetched by Worker, strict JSON Schema, citations subset, insufficient-evidence path |
| Privacy | ZDR + data-collection deny; no raw-query analytics/log DB added |
| Cost | dedicated capped OpenRouter key; no paid infrastructure besides tokens |
| CI | no live OpenRouter request or secret required; existing full matrix remains green |
| Deployment | exact-SHA Pages + Production Live + master CodeQL |
| Reversibility | `mode=off` removes AI UI/resources; Worker/key can be disabled independently; no migrations |

## Recommended PR Sequence

Keep review/rollback boundaries small even if implementation is executed continuously:

1. **PR A — corpus + benchmark**: Tasks 1–2.
2. **PR B — index + retrieval engine**: Tasks 3–4, still public OFF.
3. **PR C — mode-gated search integration + embed Worker**: Tasks 5–7, still public OFF.
4. **PR D — grounded answers + full verification**: Tasks 8–10, still public OFF.
5. **PR E — real index + engineering acceptance**: Tasks 11–12, public OFF.
6. **PR F — semantic-search canary**: Task 13, public `search`.
7. **PR G — grounded-answer canary**: Task 14, public `full` only after live acceptance.
8. **Later verdict PR**: Task 15, `full`, `search`, or `off` based on evidence.

At no point should a failed AI milestone weaken ordinary search, existing CI gates, privacy routing, grounding, or the no-paid-infrastructure boundary.