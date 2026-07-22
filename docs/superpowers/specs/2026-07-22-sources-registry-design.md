# Sources Registry / Knowledge Base — Design

Date: 2026-07-22
Status: design ready for review; implementation pending
Target milestone: Portfolio v0.4 — Knowledge & Evidence

## 1. Goal

Replace the manually maintained bibliography Markdown table with a structured, validated, build-time knowledge base that shows what I actually study and lets readers browse it by topic, source type, date, and relationships.

The feature must preserve the project's architectural rule:

**static-first + build-time intelligence + progressive enhancement**.

Core source data and summaries must remain readable without JavaScript. JavaScript may improve filtering, page-local search, expansion, and navigation, but must not be required to access the content.

## 2. Scope

This phase includes:

- canonical `data/sources.json` registry;
- strict build-time validation;
- migration of every existing bibliography entry without losing URLs or summaries;
- generated knowledge-base markup for `landing/bibliography.html`;
- topic filters and source-type filters;
- page-local progressive search across title, summary, publisher, and topics;
- deterministic sorting with dated entries newest-first and undated entries in stable registry order after dated entries;
- topic counters;
- stable per-source anchors/deep links;
- compact cards/list rows with expandable summaries;
- related-material links when explicitly declared;
- semantic no-JS fallback;
- integration with existing local search, sitemap, metadata, and quality gates;
- focused unit/contract/browser coverage.

This phase does **not** include backend, CMS, database, runtime APIs, automatic scraping/import, runtime AI summaries, a second site-wide search index, social features, or automatic publication of unreviewed external content.

## 3. Approaches considered

### A. Keep Markdown as source of truth and enhance the existing table

Lowest migration cost, but filtering and validation would depend on parsing presentation markup and the current scaling problem would remain.

**Rejected.**

### B. Canonical JSON registry + generated semantic knowledge base

Matches the proven `projects.json`, `notes.json`, and Photo Stories architecture; gives one source of truth, deterministic validation, and no runtime infrastructure.

**Selected.**

### C. One Markdown file per source with front matter

Useful for long-form reading notes, but excessive for the current mostly compact source records.

**Deferred** for a future subset of deeply annotated materials, not as the primary registry.

## 4. Canonical data model

`data/sources.json` is the only hand-maintained source of truth for bibliography/knowledge-base identity and metadata.

Example:

```json
{
  "sources": [
    {
      "id": "postgres-clickhouse-kts-988510",
      "title": "Как мы сократили объем данных в 10 раз...",
      "url": "https://habr.com/...",
      "sourceType": "article",
      "publisher": "Habr",
      "added": "2026-07-22",
      "topics": ["Databases", "PostgreSQL", "ClickHouse"],
      "summary": ["...", "..."],
      "related": []
    }
  ]
}
```

Required fields:

- `id`: unique stable kebab-case identifier;
- `title`: non-empty display title;
- `url`: absolute `http`/`https` URL;
- `sourceType`: controlled enum;
- `publisher`: normalized human-readable source/publisher;
- `topics`: non-empty normalized array;
- `summary`: non-empty string or array of concise points.

Optional fields:

- `added`: ISO `YYYY-MM-DD`;
- `published`: ISO date when known;
- `author`;
- `language`;
- `related`: array of registry IDs;
- `notes`: short personal annotation when genuinely useful.

Initial `sourceType` enum:

- `article`;
- `documentation`;
- `book`;
- `course`;
- `talk`;
- `blog`;
- `paper`;
- `other`.

Presentation details such as CSS classes, card variants, or visual order do not belong in the registry.

## 5. Migration rules

The current `docs/landing/bibliography.md` table is migration input, not a second long-term source of truth.

Migration must:

1. preserve every existing real entry;
2. preserve URLs and summaries;
3. normalize legacy tags such as `#БД`, `#AI`, `#Инфра` into controlled topics;
4. not invent unknown dates/authors;
5. not rewrite summaries merely for style during structural migration;
6. generate deterministic stable IDs;
7. reject accidental duplicate IDs and duplicate URLs.

After migration, `bibliography.md` becomes a semantic intro/injection shell and contains no duplicate hand-maintained source table.

## 6. Build-time architecture

Add a focused module such as `scripts/sources-registry.js` with explicit responsibilities:

- `loadSourcesRegistry(path)`;
- `validateSourcesRegistry(raw)`;
- `renderSourcesKnowledgeBase(sources)`;
- `applySourcesKnowledgeBase(outputDir, sources)`.

`scripts/copy-assets.js` remains an orchestrator, following existing project patterns.

All titles, metadata, topics, links, and summaries must exist in generated semantic HTML before JavaScript runs. Core rendering must not fetch `sources.json` at runtime.

A small embedded state payload is allowed only for progressive UI behavior; semantic HTML remains authoritative.

## 7. UI and interaction

Replace the large horizontal table with:

1. page intro;
2. summary/topic counters;
3. native filter/search controls;
4. semantic source list;
5. compact source articles/cards.

Each source shows at minimum title, publisher/source type, topics, external link, summary, and stable anchor.

Progressive enhancement adds:

- instant page-local filtering across title, summary, publisher, and topics;
- topic filters;
- source-type filters;
- visible result count;
- expandable/collapsible long summaries;
- clear-all control;
- hash/deep-link handling.

Native controls and keyboard/screen-reader semantics are preferred over custom widgets. Mobile must not depend on horizontal tables and must not horizontally overflow.

## 8. Search boundary

Diplodoc local search remains the **only site-wide full-text engine**.

The Sources Knowledge Base control is only a page-local filter over already-rendered records. It does not create or maintain a second site-wide index.

## 9. Validation and errors

Build fails with actionable errors for:

- malformed registry shape;
- duplicate/invalid IDs;
- accidental duplicate URLs;
- unsupported `sourceType`;
- missing required fields;
- invalid URLs;
- empty topics;
- invalid dates;
- unknown related IDs;
- self-relations.

External URL availability must not block every production build. Third-party link health belongs in scheduled/external monitoring, not deterministic core generation.

## 10. Deterministic ordering

Default generated order:

1. records with valid `added` dates, newest first;
2. ties preserve registry order;
3. records without `added` follow all dated records and preserve registry order.

Interactive filters do not mutate canonical ordering unless a future explicitly designed sort control is added.

## 11. Testing strategy

Use TDD for validator and renderer.

Unit/contract coverage includes:

- valid registry;
- duplicate ID/URL rejection;
- malformed URL rejection;
- invalid source type;
- related-reference validation;
- HTML escaping;
- deterministic ordering;
- stable anchors;
- semantic no-JS content.

Migration coverage proves the registry preserves the expected number of existing entries plus representative URLs and summaries.

Browser smoke verifies:

- records render;
- page-local search and filters work;
- clear-all restores all records;
- deep links resolve;
- no mobile horizontal overflow;
- no serious/critical Axe violations;
- JavaScript-disabled core content remains visible.

Do not make the future full `quality-harness` consolidation a prerequisite for this feature.

## 12. Integration and cleanup

Preserve:

- `landing/bibliography.html` route;
- `Источники` navigation;
- Diplodoc local-search discoverability;
- metadata/OG and sitemap behavior.

The existing bibliography reveal regression test must either remain relevant or be replaced by a stronger generated-knowledge-base visibility assertion before table-specific code is removed.

Remove obsolete table-only CSS/JS/tests only after replacement coverage exists.

## 13. Delivery sequence

1. Write failing validator/renderer tests.
2. Add `data/sources.json` and migrate existing records.
3. Implement validation and deterministic rendering.
4. Convert bibliography Markdown into the injection shell.
5. Integrate into `copy-assets.js`.
6. Add progressive filter/search UI.
7. Add browser/accessibility/mobile/no-JS coverage.
8. Remove obsolete table-only behavior after replacement tests pass.
9. Run the full repository quality suite.
10. Update `PROJECT_STATE.md`, `ROADMAP.md`, and `CHANGELOG.md` with verified merged state.

## 14. Definition of done

Complete only when:

- the giant Markdown table is no longer the source of truth;
- every existing source is preserved in `data/sources.json`;
- invalid registry data fails deterministically;
- the generated page is useful without JavaScript;
- page-local search and filters work with JavaScript;
- mobile overflow and accessibility gates pass;
- Diplodoc remains the sole site-wide full-text engine;
- the full CI/quality suite is green;
- continuity docs describe actual merged state rather than planned state.
