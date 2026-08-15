# AI Navigator — static-first semantic search + grounded answers

Date: 2026-08-15
Status: DESIGN APPROVED IN CHAT / IMPLEMENTATION NOT STARTED
Project: TrueRuslan engineering portfolio and knowledge platform

## 1. Decision summary

Add an optional AI mode to the existing site search without replacing Diplodoc search or making AI a dependency of the site.

The existing search field gains a compact `AI` switch on its right side.

- `AI` is OFF by default.
- OFF means the existing local Diplodoc search behaves exactly as before and creates no OpenRouter cost.
- ON means a natural-language semantic retrieval flow is available.
- Generative answering is a second, explicit action: `Спросить AI по найденному` / equivalent EN copy.
- The model may answer only from canonical public TrueRuslan site content supplied as context.
- If evidence is insufficient, it must say so instead of using general model knowledge.
- The feature must be removable or disableable without changing canonical content, URLs, SEO ownership, existing search ownership or deployment architecture.

The architecture has zero databases, zero vector databases and zero paid infrastructure dependencies other than OpenRouter token usage.

## 2. Existing architecture that must remain authoritative

Current repository state already establishes:

- GitHub Pages as the static delivery platform;
- Diplodoc with `@diplodoc/search-extension` and `search.provider: local` as the site-wide full-text search owner;
- build-time transformation and generated artifacts as the preferred intelligence layer;
- progressive enhancement rather than mandatory runtime services;
- canonical content owned by repository Markdown/JSON sources;
- exact production acceptance separated from source/build readiness.

The AI Navigator must fit inside those boundaries. It is an optional retrieval and answer layer, not a replacement search engine, CMS, API backend or new source of truth.

## 3. Product goals

The feature should help visitors ask questions in ordinary language, for example:

- `Какие проекты связаны с AI?`
- `Где Руслан писал про CI/CD?`
- `Как проверяется production acceptance?`
- `Что почитать про тестирование AI-функций?`
- `Какой опыт есть со Spring Boot?`

It should return relevant canonical site materials even when the wording does not exactly match page text.

After retrieval, the visitor may explicitly request a concise grounded answer based only on those materials.

The feature also serves as a portfolio case study: static-first RAG without a hosted RAG backend.

## 4. Non-goals

This design explicitly does not introduce:

- a general-purpose chatbot;
- answers from the model's world knowledge;
- web search or browsing;
- tool calling or autonomous agents;
- persistent chat history;
- user accounts;
- a database;
- a vector database;
- Cloudflare D1, KV, R2 or Vectorize;
- Pinecone, Supabase, Elasticsearch, Redis or hosted search/RAG services;
- a second site-wide search owner;
- mandatory OpenRouter calls during normal site build/deploy;
- client-side exposure of an OpenRouter API key;
- automatic mutation of canonical content from AI output.

## 5. UX contract

### 5.1 Search field

The existing search control is visually preserved. A compact `AI` switch appears at the right edge of the search input.

Default:

```text
┌───────────────────────────────────────────────┐
│ Что хотите найти?                 AI  ○────   │
└───────────────────────────────────────────────┘
```

Enabled:

```text
┌───────────────────────────────────────────────┐
│ Спросите своими словами…          AI  ────●  │
└───────────────────────────────────────────────┘
```

Rules:

1. AI is OFF on every fresh page load.
2. The mode is not persisted in cookies or localStorage in the MVP.
3. OFF delegates to the existing Diplodoc search path unchanged.
4. ON invokes semantic retrieval only after an explicit search action.
5. Turning AI ON does not automatically invoke a generative model.
6. The expensive generation step exists only behind `Спросить AI по найденному`.
7. The visual treatment remains restrained and consistent with the existing TrueRuslan UI; no separate floating chatbot is introduced.
8. On narrow mobile layouts the control may compact visually, but the `AI` label remains visible.

### 5.2 Accessibility

The control is an actual interactive switch, not decorative UI.

Required semantics:

- keyboard reachable;
- `role="switch"` or equivalent native accessible semantics;
- `aria-checked` reflects current state;
- localized accessible name such as `Поиск по смыслу с помощью AI`;
- visible focus state;
- no information conveyed by color alone;
- reduced-motion preferences respected.

### 5.3 Results

AI retrieval shows a small ranked set of canonical materials before any answer generation.

Each result contains:

- canonical title;
- content type;
- canonical link;
- relevant section when useful;
- short deterministic or source-derived snippet;
- no fabricated relevance explanation generated by an LLM in the retrieval-only step.

Only after results exist is the answer action shown.

### 5.4 Grounded answer

The answer view is intentionally bounded:

- concise answer;
- source citations linked to canonical site URLs;
- visible statement when evidence is insufficient;
- no conversational persona claiming to be Ruslan;
- no multi-turn memory in the MVP.

## 6. Cost and infrastructure contract

The only permitted variable paid dependency is OpenRouter.

Permitted infrastructure:

- existing GitHub repository;
- existing GitHub Pages deployment;
- GitHub Actions already used by the public repository;
- a minimal Cloudflare Worker operating within the free tier;
- OpenRouter API usage.

Forbidden by this design unless the user explicitly approves a future architecture change:

- paid database/storage/search products;
- Cloudflare D1/KV/R2/Vectorize as application dependencies;
- paid queue or observability systems;
- a separately hosted application server.

If Cloudflare free-tier conditions cease to satisfy the feature, the feature is disabled rather than silently introducing a paid infrastructure dependency.

## 7. High-level architecture

```text
Canonical Markdown / JSON
          │
          ▼
Build-time AI corpus builder
          │
          ├── chunks/*.json
          ├── manifest.json
          └── embeddings.bin + metadata
                    │
                    ▼
               GitHub Pages
                    │
      ┌─────────────┴─────────────┐
      │                           │
Diplodoc search              AI mode ON
unchanged                         │
                                  ▼
                         query embedding API
                                  │
                         Cloudflare Worker
                                  │
                              OpenRouter
                                  │
                                  ▼
                         query vector returned
                                  │
                                  ▼
                      browser hybrid retrieval
                                  │
                           top canonical chunks
                                  │
                         explicit Ask AI action
                                  │
                                  ▼
                         Cloudflare Worker
                                  │
                     validates requested chunk IDs
                                  │
                     fetches canonical chunks from
                           trueruslan.ru static data
                                  │
                                  ▼
                         OpenRouter answer model
                                  │
                                  ▼
                   structured grounded answer + citations
```

The browser owns ranking. The Worker owns secrets and trust-boundary validation. GitHub Pages owns the static derived corpus/index. Canonical Markdown/JSON remains the content source of truth.

## 8. Static corpus design

### 8.1 Included content

Initial curated corpus:

- Engineering Notes;
- project/case-study pages;
- Publications;
- About;
- Experience / Resume sections that are already public site content;
- Now;
- Work with me;
- selected public Project Evidence material when it is reader-relevant and stable enough.

### 8.2 Excluded content

The corpus builder must exclude:

- navigation chrome;
- footer content;
- generated cards duplicated from canonical source material;
- SEO metadata;
- duplicate route variants;
- generated search UI;
- build reports and CI logs;
- private/non-public evidence;
- arbitrary generated HTML where a canonical Markdown/JSON owner exists.

### 8.3 Chunking

Chunks are semantic and source-aware rather than fixed-size character windows.

Preferred boundaries:

- document intro;
- H2 sections;
- H3 sections where an H2 would otherwise be too large;
- short adjacent sections may be coalesced when they represent one idea.

Every chunk carries stable metadata:

```json
{
  "id": "note-evidence-driven-state--acceptance",
  "url": "/notes/evidence-driven-project-state/",
  "title": "Evidence-driven Project State",
  "section": "Acceptance",
  "type": "note",
  "lang": "en",
  "text": "...",
  "contentHash": "sha256:..."
}
```

Stable chunk IDs and hashes are mandatory so unchanged chunks can reuse existing embeddings.

## 9. Embedding index

### 9.1 Generation

Embedding refresh is an explicit maintenance operation, not a mandatory part of every deploy.

A future command such as `npm run ai:index` should:

1. build the deterministic corpus;
2. compare chunk hashes with the existing index metadata;
3. reuse embeddings for unchanged chunks;
4. request new embeddings only for added/changed chunks;
5. write a deterministic static index artifact;
6. validate model ID, vector dimensions, chunk count and corpus digest.

Normal `npm run build` and production deployment must remain possible without OpenRouter credentials and without network access to OpenRouter.

### 9.2 Storage

Embeddings are stored as static repository/Page artifacts, preferably compact binary data (`Float32Array` or another benchmarked compact representation) plus metadata.

No server-side vector store is introduced.

The manifest records at minimum:

- schema version;
- exact embedding model ID;
- vector dimensions;
- corpus digest;
- chunk count;
- generated timestamp or immutable source commit reference;
- embedding artifact digest.

## 10. Retrieval

### 10.1 Query embedding

When AI mode is ON and a search is submitted:

1. browser sends only the bounded query to the Worker;
2. Worker validates length/content envelope;
3. Worker requests an embedding from the pinned OpenRouter embedding model;
4. Worker returns the query vector;
5. browser performs retrieval against the static site index.

The OpenRouter key never reaches the browser.

### 10.2 Hybrid ranking

Semantic similarity alone is not authoritative.

The retrieval layer combines:

- semantic cosine similarity;
- lexical matching;
- exact title/topic matches;
- bounded metadata boosts such as content type/language where justified.

No permanent scoring weights are declared by design. Initial weights are implementation parameters that must be selected by the benchmark suite and committed as explicit constants after measured evaluation.

The benchmark, not intuition, determines whether hybrid ranking is accepted.

### 10.3 Language behavior

RU and EN content retain language metadata.

Initial retrieval should prefer same-language material when quality is comparable, but may return a canonical page in the other language when it is materially more relevant and no equivalent translation exists.

Language preference rules must be deterministic and tested.

## 11. Grounded answer trust boundary

The browser is untrusted.

It must never send arbitrary context text to the answer model through the Worker.

Instead it sends:

```json
{
  "question": "...",
  "chunkIds": ["...", "..."]
}
```

The Worker:

1. validates question size and chunk-count limits;
2. validates chunk ID syntax;
3. fetches the canonical static chunk documents from the approved TrueRuslan origin;
4. rejects unknown/missing chunks;
5. builds model context only from those canonical fetched chunks;
6. calls the pinned/allowlisted OpenRouter answer model;
7. validates the returned structured answer and citations before returning it to the browser.

This prevents a visitor from substituting arbitrary prompt-injection text as trusted site context.

## 12. Grounding contract

System behavior is strict:

- use only supplied canonical context;
- do not use model world knowledge;
- do not browse;
- do not infer absent personal facts;
- do not manufacture project status;
- do not claim private information;
- if evidence is insufficient, return an insufficient-evidence state;
- every answer citation must reference a supplied canonical chunk.

Target response contract:

```json
{
  "sufficientEvidence": true,
  "answer": "...",
  "citations": [
    "note-evidence-driven-state--acceptance"
  ]
}
```

Worker validation rejects:

- citations to unknown chunks;
- citations outside the supplied context set;
- malformed response shape;
- excessive answer length;
- empty answer with `sufficientEvidence=true`.

When `sufficientEvidence=false`, the UI states that the site does not contain enough information to answer reliably.

## 13. Model/provider configuration

The product contract does not depend on one permanent model vendor/model ID.

Implementation requirements:

- exact embedding model ID is pinned in configuration and manifest;
- exact answer model ID is pinned or restricted to an explicit allowlist;
- model changes require benchmark/contract verification;
- query and answer endpoints do not permit callers to choose arbitrary model IDs;
- OpenRouter is the only AI routing dependency in the MVP.

Default provider-routing policy must favor privacy:

- no intentional prompt logging by this project;
- Zero Data Retention routing where supported by the selected model/provider path;
- deny data-collection providers when the OpenRouter routing contract supports it for the selected model.

If those privacy constraints make the configured model unavailable, the request fails closed rather than falling back to a less private provider automatically.

## 14. Cost protection

Cost controls are mandatory before public activation.

Required controls:

- dedicated OpenRouter API key for TrueRuslan AI Navigator;
- hard spending limit configured on that key/account path;
- bounded query length;
- bounded chunk count;
- bounded total context size;
- bounded output tokens;
- request timeout;
- fixed/allowlisted models only;
- no multi-turn conversation state;
- no tool calls;
- no arbitrary URL fetching;
- no automatic retries that can multiply spend without a strict small cap.

The spending limit is the final financial backstop. Application-level throttling may be added only if it does not require a paid stateful product.

## 15. Feature flags and kill switches

The AI layer must be disableable independently of the site.

### Mode 0 — `off`

- AI switch is not rendered;
- no AI JS/index is required for ordinary search;
- no OpenRouter calls are possible from the UI;
- Diplodoc search remains unchanged.

### Mode 1 — `search`

- AI switch is available;
- semantic retrieval is enabled;
- generative answer action is absent/disabled by design;
- useful downgrade mode if answer generation is not worth its cost.

### Mode 2 — `full`

- semantic retrieval is enabled;
- explicit grounded answer action is enabled.

### Emergency Worker switch

A Worker environment/config switch such as `AI_ENABLED=false` immediately rejects AI endpoints without changing GitHub Pages.

Frontend treats this as optional-service unavailability and falls back to ordinary search behavior rather than failing the page.

### Provider-level kill switch

The dedicated OpenRouter key can be disabled/revoked independently.

### Removal contract

Full removal requires only deletion/disabling of:

- AI search UI enhancement;
- AI static derived artifacts;
- Worker routes/config;
- OpenRouter secret/key.

No canonical content migration, URL migration, SEO repair or database cleanup is allowed to be necessary.

## 16. Failure and degradation contract

Expected behavior:

```text
AI full path healthy
    → semantic retrieval + optional grounded answer

answer model unavailable / budget exhausted
    → semantic results remain useful; answer action reports unavailable

query embedding unavailable
    → AI mode fails gracefully and ordinary Diplodoc search remains available

Worker disabled/down
    → ordinary site/search remains usable

JavaScript unavailable
    → existing static/no-JS site behavior remains authoritative
```

The optional AI service must never block page rendering, navigation, canonical content or ordinary search.

## 17. Privacy and analytics

The project does not store raw user queries in a new database/logging product.

MVP analytics, if enabled, reuse existing consent-respecting analytics only for coarse events such as:

- AI toggle enabled;
- semantic search submitted;
- semantic result opened;
- Ask AI clicked;
- answer success/failure/insufficient-evidence category.

Raw query text, generated answer text and source context are not sent to analytics.

No new analytics vendor is introduced.

## 18. Benchmark and quality gate

Before public UI activation, create a repository-native benchmark dataset of approximately 50 representative queries with expected relevant document/chunk IDs.

Coverage must include:

- exact technical terms (`Spring Boot`, `GitHub Pages`, `OpenRouter` where present);
- paraphrased intent;
- project-oriented questions;
- Engineering Notes questions;
- RU queries;
- EN queries;
- queries with insufficient site evidence;
- ambiguous queries;
- adversarial or prompt-injection-shaped queries.

Minimum acceptance behavior:

- lexical exact matches do not regress materially versus ordinary expectations;
- semantic paraphrases retrieve relevant material in top results;
- no private/non-corpus material can appear;
- insufficient-evidence cases do not generate confident unsupported answers;
- result links always resolve to canonical public site routes;
- retrieval remains deterministic for a fixed index/query vector/config.

Exact numeric thresholds are established from the first benchmark baseline before implementation is promoted beyond prototype; they must be committed as test constants rather than left subjective.

## 19. Implementation milestones

### AI-0 — Design and benchmark contract

Deliverables:

- this approved design;
- benchmark fixture schema;
- ~50 representative queries and expected targets;
- feature-mode contract (`off/search/full`);
- no production behavior change.

### AI-1 — Deterministic static corpus

Deliverables:

- corpus extractor from canonical repository sources;
- semantic chunking;
- stable IDs/hashes;
- inclusion/exclusion validation;
- no OpenRouter dependency yet.

Acceptance:

- deterministic output;
- no duplicate/private/chrome content;
- every chunk resolves to a canonical route/source owner.

### AI-2 — Static embedding index

Deliverables:

- explicit index-refresh command/workflow;
- OpenRouter embedding integration for changed chunks only;
- cached/reused unchanged embeddings;
- static binary index + manifest;
- model/dimension/digest validation.

Acceptance:

- normal build works with zero OpenRouter access;
- unchanged corpus causes zero new document-embedding spend;
- index artifact is deterministic modulo explicitly recorded model output metadata.

### AI-3 — Retrieval prototype and benchmark

Deliverables:

- query embedding Worker endpoint;
- browser-side cosine/hybrid ranker;
- benchmark runner;
- selected ranking constants based on measured results.

No public UI activation until the benchmark passes.

### AI-4 — Search-field AI switch

Deliverables:

- compact AI switch inside the existing search field;
- OFF-by-default behavior;
- localized placeholder/state;
- accessible keyboard/screen-reader behavior;
- mobile layout;
- semantic result cards;
- fallback to ordinary search.

Acceptance includes existing browser, accessibility, no-JS, mobile overflow, Firefox/WebKit and visual regression contracts.

### AI-5 — Grounded answers

Deliverables:

- explicit `Ask AI` action after retrieval;
- chunk-ID-only browser request;
- Worker canonical chunk fetch/validation;
- strict grounded prompt;
- structured answer validation;
- citations;
- insufficient-evidence response;
- spending cap and privacy routing configuration documented.

### AI-6 — Production experiment

Deliverables:

- production activation behind `AI_MODE=full`;
- exact deployment smoke for OFF/search/full contracts where practical;
- cost/latency/fallback observation using existing privacy boundaries;
- visible experimental positioning without making AI central to the site.

### AI-7 — Product verdict

After enough real usage to judge value, choose one explicitly:

- KEEP full semantic search + grounded answers;
- DOWNGRADE to semantic search only;
- REMOVE AI Navigator.

Removal must satisfy the removal contract in section 15 without canonical-content or SEO migration work.

## 20. Test strategy

Required layers:

1. unit tests for corpus extraction, chunking, stable IDs and hashes;
2. corpus inclusion/exclusion security tests;
3. embedding manifest and binary integrity tests;
4. hybrid ranking unit/benchmark tests;
5. Worker request-boundary tests;
6. prompt-injection/context-substitution tests;
7. structured-answer/citation validation tests;
8. feature-mode tests for `off/search/full`;
9. ordinary Diplodoc search regression tests;
10. no-JS tests proving AI is non-essential;
11. browser tests for switch interaction and fallback;
12. Axe/accessibility, keyboard and focus tests;
13. mobile overflow and responsive tests;
14. Firefox/WebKit compatibility;
15. security/Dependency Review/CodeQL;
16. exact deployed production smoke before declaring the feature accepted.

No existing quality gate is weakened to accommodate AI.

## 21. Security invariants

The implementation must preserve these invariants:

- OpenRouter secret never ships to Pages/browser artifacts;
- browser cannot supply trusted context text;
- Worker accepts only bounded question + chunk IDs;
- canonical chunk origin is fixed/allowlisted;
- Worker does not become an arbitrary fetch proxy;
- model selection is not caller-controlled;
- unsupported methods fail closed;
- CORS is restricted to intended TrueRuslan origins when cross-origin Worker routing requires CORS;
- sensitive request headers are never forwarded to static canonical origin unnecessarily;
- prompt injection inside user text cannot grant tools, web access or external knowledge because none are available to the answer path;
- output is treated as untrusted text and rendered safely, never as arbitrary HTML.

## 22. Rollout decision

Recommended delivery order is intentionally conservative:

1. design;
2. offline benchmark;
3. deterministic corpus;
4. static embeddings;
5. retrieval benchmark;
6. public semantic-search switch;
7. grounded answers only after retrieval quality is proven;
8. bounded production experiment;
9. explicit keep/downgrade/remove decision.

This prevents the project from paying for or maintaining generative behavior before the cheaper semantic retrieval layer proves useful.

## 23. Final architectural rule

AI Navigator is a disposable progressive-enhancement layer.

The site must remain a complete static engineering portfolio and knowledge platform when every AI-related file, route, secret and service is disabled or removed.
