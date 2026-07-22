# Sources Registry / Knowledge Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-maintained bibliography table with a validated canonical `data/sources.json` registry and a build-time generated, accessible Sources Knowledge Base with page-local filtering/search.

**Architecture:** Keep the existing static-first pipeline. `scripts/sources-registry.js` owns parsing/validation/rendering; `scripts/copy-assets.js` only orchestrates build-time injection into `landing/bibliography.html`. All source content is present in semantic HTML before JavaScript runs; `docs/_assets/script/custom.js` adds only progressive page-local filtering/expansion and `docs/_assets/style/custom.css` provides presentation.

**Tech Stack:** Node.js 24 ESM, `node:test`, existing Diplodoc build pipeline, vanilla JavaScript/CSS, Playwright/Axe through the existing quality-tools workflow.

## Global Constraints

- Preserve **static-first + build-time intelligence + progressive enhancement**.
- `data/sources.json` is the only hand-maintained source of truth for bibliography/knowledge-base identity and metadata after migration.
- Preserve every existing real bibliography entry, URL, and summary; do not invent unknown dates/authors and do not rewrite summaries merely for style during structural migration.
- Diplodoc local search remains the only site-wide full-text engine; Sources search is page-local filtering only.
- Core source content must remain readable with JavaScript disabled.
- No backend, CMS, database, runtime API, runtime GitHub calls, runtime AI summaries, automatic scraping/import, or second site-wide search index.
- Default generated order: records with valid `added` newest-first; ties preserve registry order; undated records follow dated records in stable registry order.
- Build must fail deterministically for malformed registry shape, duplicate/invalid IDs, accidental duplicate URLs, unsupported `sourceType`, missing required fields, invalid URLs/dates, empty topics, unknown related IDs, and self-relations.
- Existing route `landing/bibliography.html`, navigation label `Источники`, metadata/OG behavior, sitemap behavior, and site-wide search discoverability must remain intact.
- Existing table-specific reveal coverage may be removed only after stronger generated-knowledge-base coverage exists.

---

### Task 1: Registry validation and deterministic renderer

**Files:**
- Create: `scripts/sources-registry.js`
- Create: `scripts/sources-registry.test.js`

**Interfaces:**
- Produces: `SOURCE_TYPE_VALUES`, `validateSourcesRegistry(raw)`, `loadSourcesRegistry(path)`, `sortSources(sources)`, `renderSourcesKnowledgeBase(sources)`, `applySourcesKnowledgeBase(outputDir, sources)`.
- `validateSourcesRegistry(raw)` returns a normalized array of source records while preserving registry order metadata internally or by stable array order.
- `applySourcesKnowledgeBase(outputDir, sources)` targets `landing/bibliography.html` and replaces a dedicated injection marker in generated content.

- [ ] **Step 1: Write failing validator tests**

Add `scripts/sources-registry.test.js` using `node:test`/`assert/strict` for:
- accepted canonical registry shape `{sources:[...]}`;
- duplicate ID and duplicate URL rejection;
- invalid kebab-case ID rejection;
- non-http(s) URL rejection;
- unsupported source type rejection;
- empty topics rejection;
- invalid ISO date rejection;
- unknown/self `related` references rejection.

Use a canonical fixture like:

```js
const validSource = {
  id: 'postgres-clickhouse-kts-988510',
  title: 'Postgres to ClickHouse',
  url: 'https://habr.com/ru/companies/kts/articles/988510/',
  sourceType: 'article',
  publisher: 'Habr',
  topics: ['Databases', 'PostgreSQL', 'ClickHouse'],
  summary: ['Migration architecture', 'Compression and query trade-offs'],
  related: [],
};
```

- [ ] **Step 2: Run focused tests and confirm red state**

Run: `node --test scripts/sources-registry.test.js`

Expected: FAIL because `./sources-registry.js` does not exist or exported functions are missing.

- [ ] **Step 3: Implement minimal validator/loader**

Implement strict validation with actionable error messages. Required fields: `id`, `title`, `url`, `sourceType`, `publisher`, `topics`, `summary`. Optional: `added`, `published`, `author`, `language`, `related`, `notes`.

Use controlled source types:

```js
export const SOURCE_TYPE_VALUES = Object.freeze([
  'article', 'documentation', 'book', 'course', 'talk', 'blog', 'paper', 'other',
]);
```

Allow `summary` as either non-empty string or non-empty array of non-empty strings; normalize to an array for rendering.

- [ ] **Step 4: Add deterministic ordering/rendering tests**

Cover:
- newest `added` first;
- equal dates preserve registry order;
- undated records follow dated records and preserve registry order;
- HTML escaping for title/publisher/summary/topic text;
- stable `id="source-<id>"` anchors;
- all semantic content present without requiring JS.

- [ ] **Step 5: Implement renderer and injection**

`renderSourcesKnowledgeBase(sources)` must output a semantic root such as:

```html
<section class="tr-sources" data-tr-sources-root>
  <div class="tr-sources__summary" aria-label="Статистика базы источников">...</div>
  <div class="tr-sources__controls" data-tr-sources-controls>...</div>
  <p class="tr-sources__result-count" aria-live="polite" data-tr-sources-count>...</p>
  <div class="tr-sources__list" data-tr-sources-list>
    <article id="source-..." class="tr-source-card" data-tr-source ...>...</article>
  </div>
</section>
```

Every card must contain title, publisher/type, topics, external link, summary, and stable anchor in static HTML. Controls are allowed to be inert without JS.

`applySourcesKnowledgeBase` must use the same generated-content transformation boundary used elsewhere in the project and replace a dedicated marker such as `<div data-tr-sources-placeholder></div>` only inside generated article content.

- [ ] **Step 6: Run focused tests**

Run: `node --test scripts/sources-registry.test.js`

Expected: all tests PASS.

- [ ] **Step 7: Commit**

Commit: `feat: add validated Sources Registry renderer`

---

### Task 2: Lossless bibliography migration into canonical JSON

**Files:**
- Create temporarily during migration: `scripts/migrate-bibliography.js`
- Create: `data/sources.json`
- Modify: `scripts/sources-registry.test.js`
- Modify: `docs/landing/bibliography.md`
- Delete after successful migration: `scripts/migrate-bibliography.js`

**Interfaces:**
- Migration script consumes the current Markdown table and emits exactly the canonical `{sources:[...]}` shape accepted by Task 1.
- Migration contract tests consume committed `data/sources.json` and assert preservation of existing source count plus representative URLs/titles/summaries.

- [ ] **Step 1: Write a one-time deterministic migration parser**

Parse only the known current bibliography table shape: `ID | Название | Источник | Ссылка | Теги | Резюме`.

Rules:
- preserve every row;
- extract the actual URL from `[Статья](...)` / `[Блог](...)` markdown;
- normalize publisher labels by removing leading `#`;
- normalize legacy tags to controlled readable topics without inventing extra facts;
- preserve each `<br>`-separated summary bullet as a separate summary string;
- generate deterministic stable IDs from a normalized title plus a URL-derived suffix when useful;
- do not set `added`/`published` unless actually known from source data already present in the table.

- [ ] **Step 2: Generate `data/sources.json` and validate it**

Run locally/CI-assisted as needed:

```bash
node scripts/migrate-bibliography.js > data/sources.json
node --test scripts/sources-registry.test.js
```

Expected: valid registry; number of generated source records equals number of legacy table data rows.

- [ ] **Step 3: Add migration contract tests**

Read committed `data/sources.json` in `scripts/sources-registry.test.js` and assert:
- exact expected migrated record count captured from the migration;
- representative URLs survive, including the first Postgres→ClickHouse Habr article;
- representative summaries remain present;
- no duplicate IDs/URLs.

- [ ] **Step 4: Replace the Markdown table with semantic intro + injection marker**

`docs/landing/bibliography.md` becomes short personal framing plus:

```html
<div data-tr-sources-placeholder></div>
```

Do not keep a duplicate hand-maintained table.

- [ ] **Step 5: Remove one-time migration script**

After `data/sources.json` is committed and migration contract tests pass, delete `scripts/migrate-bibliography.js` so there is no second long-term transformation/source-of-truth path.

- [ ] **Step 6: Commit**

Commit: `data: migrate bibliography into canonical Sources Registry`

---

### Task 3: Integrate Sources Registry into production post-processing

**Files:**
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/copy-assets.test.js`

**Interfaces:**
- Consumes Task 1: `loadSourcesRegistry()` and `applySourcesKnowledgeBase()`.
- `postprocessOutput()` accepts optional `sourcesPath`, defaults to `data/sources.json` for production docs, and returns `sourcesKnowledgeBaseTarget`.

- [ ] **Step 1: Extend the integrated postprocess test in red state**

In the existing `postprocessOutput writes v0.3 content...` fixture:
- create `sources.json` with one valid source;
- create generated `landing/bibliography.html` containing `<div data-tr-sources-placeholder></div>`;
- pass `sourcesPath`;
- assert `result.sourcesKnowledgeBaseTarget === 'landing/bibliography.html'`;
- assert generated bibliography HTML contains source title, publisher, topics, link and no placeholder.

Run: `node --test scripts/copy-assets.test.js`

Expected: FAIL before integration exists.

- [ ] **Step 2: Wire registry loading/injection into `copy-assets.js`**

Add `SOURCES_MANIFEST`, load once during post-processing, apply after generated page availability and before metadata/site integrity finalization.

Core content must be injected build-time; do not runtime-fetch `data/sources.json`.

- [ ] **Step 3: Run focused integration tests**

Run:

```bash
node --test scripts/sources-registry.test.js scripts/copy-assets.test.js
```

Expected: PASS.

- [ ] **Step 4: Commit**

Commit: `feat: generate Sources Knowledge Base at build time`

---

### Task 4: Progressive page-local filtering and responsive visual layer

**Files:**
- Modify: `docs/_assets/script/custom.js`
- Modify: `docs/_assets/style/custom.css`
- Create or modify matching unit/config tests if existing test coverage for custom assets requires it.

**Interfaces:**
- JS consumes only semantic DOM attributes rendered by Task 1: `[data-tr-sources-root]`, `[data-tr-source]`, source `data-*` search metadata, controls, and result count.
- No network requests and no second search index.

- [ ] **Step 1: Add a focused pure filtering helper contract**

Expose testable helpers on `TrueRuslanVisual` (or keep a small pure helper in a dedicated module if the current custom.js test pattern supports it):
- normalize query text;
- match a source against query + selected topic + selected type;
- update visible result count.

Search fields: title, summary, publisher, topics only.

- [ ] **Step 2: Implement `setupSourcesKnowledgeBase(document, page)`**

Run only for `page === 'bibliography'` and only when `[data-tr-sources-root]` exists.

Behavior:
- text input filters instantly;
- topic filter and source-type filter compose with query;
- clear-all resets controls and restores every card;
- hidden cards use the `hidden` attribute;
- result count uses `aria-live="polite"`;
- deep-link target remains reachable and visible; when page loads with `#source-...`, ensure that card is not hidden by default state;
- long-summary expand/collapse uses native `<details>` when possible rather than custom ARIA widgets.

- [ ] **Step 3: Add CSS for knowledge-base layout**

In `custom.css` add scoped `html[data-tr-page='bibliography'] .tr-sources...` styles:
- compact responsive controls;
- wrapping topic/type chips/selects without horizontal overflow;
- card/list layout using existing graphite/cyan/violet tokens;
- readable summaries and metadata;
- strong focus states inherited from global rules;
- mobile single-column behavior.

Do not style via horizontal table assumptions.

- [ ] **Step 4: Run unit tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat: add progressive Sources Knowledge Base controls`

---

### Task 5: Replace table reveal smoke with knowledge-base browser/accessibility coverage

**Files:**
- Delete: `scripts/bibliography-reveal-smoke.cjs`
- Create: `scripts/sources-knowledge-base-smoke.cjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Smoke serves `docs-html` using existing Express/Playwright pattern.
- Reuse `.quality-tools` Playwright + Axe; do not introduce dependencies.

- [ ] **Step 1: Create stronger browser smoke**

Verify on `/landing/bibliography.html`:
- HTTP success;
- `[data-tr-sources-root]` and expected source cards exist;
- no legacy `main table` remains;
- query filters to a known representative source;
- topic and source-type filters work;
- clear-all restores original count;
- `#source-...` deep link resolves to an existing visible card;
- no horizontal overflow at 390px mobile viewport;
- no serious/critical Axe violations;
- a JavaScript-disabled context still shows source titles, links, topics, and summaries.

Write concise diagnostics and a screenshot to `quality-artifacts`.

- [ ] **Step 2: Update workflow step/artifact preservation**

Replace the old `Bibliography reveal browser smoke` command/log with `Sources Knowledge Base browser smoke` and preserve its log plus generated bibliography HTML screenshot/evidence where useful.

- [ ] **Step 3: Run full repository quality commands**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Then the PR Build workflow must run all browser/cross-browser/search/metadata/map/photo/visual gates successfully.

- [ ] **Step 4: Commit**

Commit: `test: cover Sources Knowledge Base browser behavior`

---

### Task 6: Continuity docs, final verification, and PR readiness

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Docs describe only verified state from the implementation branch/CI; do not claim production deployment until separately observed.

- [ ] **Step 1: Update continuity docs after implementation is actually green**

Record:
- PR number/head SHA/run number;
- Sources Registry architecture and exact source-of-truth boundary;
- migrated source count;
- page-local search boundary vs Diplodoc site-wide search;
- no-JS/accessibility/mobile evidence;
- next roadmap item: Project Evidence Layer, while first real Photo Story remains content-dependent/non-blocking.

- [ ] **Step 2: Final spec coverage review**

Check every requirement in `docs/superpowers/specs/2026-07-22-sources-registry-design.md` against implementation and tests. Fix gaps before claiming completion.

- [ ] **Step 3: Verify current PR head CI**

Require a completed successful Build workflow on the exact PR head SHA. Inspect relevant quality logs/artifacts when any visual/browser behavior changed.

- [ ] **Step 4: Final commit**

Commit: `docs: update v0.4 Sources Registry project state`

- [ ] **Step 5: Merge only after green CI and review**

Squash merge the implementation PR when exact-head CI is green and no blocking review findings remain.
