# Sources Registry / Knowledge Base — Design

Date: 2026-07-22
Status: approved direction, implementation pending
Target milestone: Portfolio v0.4 — Knowledge & Evidence

## 1. Goal

Replace the manually maintained bibliography Markdown table with a structured, validated, build-time knowledge base that shows what I actually study and lets readers browse it by topic, source type, date, and relationships.

The feature must preserve the project's architectural rule:

**static-first + build-time intelligence + progressive enhancement**.

Core source data and summaries must remain readable without JavaScript. JavaScript may improve filtering, searching, expansion, and navigation, but must not be required to access the content.

## 2. Scope

This phase includes:

- canonical `data/sources.json` registry;
- strict build-time validation;
- migration of the existing bibliography entries into the registry without losing content;
- generated bibliography/knowledge-base markup for `landing/bibliography.html`;
- topic/tag filters;
- source-type filters;
- client-side search over title and summary only as progressive enhancement;
- sort by date added / newest first when dates are available;
- topic counters;
- stable per-source anchors/deep links;
- compact cards/list rows with expandable summaries;
- related-material links when explicitly declared;
- semantic no-JS fallback;
- integration with existing local search, sitemap, metadata, and quality gates;
- focused unit/contract/browser coverage.

This phase does **not** include:

- backend, CMS, database, or runtime API;
- automatic web scraping/import of sources;
- runtime GitHub calls;
- a second full-text search index;
- AI-generated summaries at runtime;
- social features, ratings, bookmarks, or accounts;
- automatic publication of unreviewed external content.

## 3. Approaches considered

### A. Keep Markdown as source of truth and progressively enhance the table

Pros:
- minimal migration work;
- lowest initial code change.

Cons:
- structured filtering/search requires parsing presentation markup;
- validation is weak;
- relationships and dates become awkward;
- the table remains the canonical data model.

Rejected because it preserves the exact scaling problem v0.4 is meant to solve.

### B. Canonical JSON registry + generated semantic knowledge base — selected

Pros:
- follows the proven `projects.json`, `notes.json`, and Photo Stories architecture;
- deterministic validation and generation;
- one source of truth;
- easy to extend later with evidence, topics, and relationships;
- no runtime infrastructure.

Cons:
- one-time migration cost;
- requires a dedicated validator/renderer.

Selected because it fits the existing architecture and gives the best long-term maintainability without adding runtime complexity.

### C. One Markdown file per source with front matter

Pros:
- long-form notes could live beside metadata;
- natural for deeply annotated reading notes.

Cons:
- excessive file count for short source records;
- migration and maintenance overhead;
- unnecessary complexity for the current data shape.

Deferred. It may become appropriate later for a small subset of deeply developed reading notes, but not as the primary registry.

## 4. Data model

`data/sources.json` is the only hand-maintained registry for bibliography/knowledge-base identity and metadata.

Proposed top-level shape:

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
      "summary": [
        "...",
        "..."
      ],
      "related": []
    }
  ]
}
```

Required fields:

- `id`: stable kebab-case identifier, unique;
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

Initial controlled `sourceType` values should stay intentionally small, for example:

- `article`;
- `documentation`;
- `book`;
- `course`;
- `talk`;
- `blog`;
- `paper`;
- `other`.

Do not encode presentation details such as CSS classes, card variants, or display order inside the registry.

## 5. Migration rules

The current `docs/landing/bibliography.md` table is treated as migration input, not a second source of truth.

Migration must:

1. preserve every existing real entry;
2. preserve source URLs and summaries;
3. normalize legacy tags such as `#БД`, `#AI`, `#Инфра` into controlled topic names;
4. avoid inventing dates that are not known;
5. avoid rewriting summaries merely for style during the structural migration;
6. produce deterministic IDs;
7. fail validation on duplicate IDs/URLs where duplication is accidental.

After migration, the Markdown page becomes a semantic shell/intro plus build-time injection target. It must not contain a duplicate hand-maintained table.

## 6. Build-time architecture

Add a focused module, e.g. `scripts/sources-registry.js`, with small explicit responsibilities:

- `loadSourcesRegistry(path)`;
- `validateSourcesRegistry(raw)`;
- `renderSourcesKnowledgeBase(sources)`;
- `applySourcesKnowledgeBase(outputDir, sources)`.

`copy-assets.js` should only orchestrate the module, following the same pattern as project registry, notes, now, engineering graph, and Photo Stories.

The generated HTML must contain all source titles, metadata, topics, links, and summaries in the document before client-side enhancement runs.

No runtime fetch of `sources.json` is required for core content.

A small serialized state payload may be embedded only when useful for progressive UI behavior, provided the semantic HTML remains authoritative for rendering.

## 7. UI / interaction model

The bibliography page becomes a compact knowledge-base view rather than a large horizontal table.

Recommended structure:

1. page intro;
2. summary counters;
3. filter/search controls;
4. semantic source list;
5. each source represented by a compact article/card row.

Each source item should show at minimum:

- title;
- publisher/source type;
- topics;
- external link;
- summary;
- stable anchor.

Progressive enhancement adds:

- instant title/summary filtering;
- topic filters;
- source-type filters;
- result count;
- expandable/collapsible long summaries;
- clear-all control;
- URL hash/deep-link handling.

Keyboard and screen-reader behavior must be first-class. Native controls should be preferred over custom widget semantics.

On narrow screens there must be no horizontal table dependency and no horizontal overflow.

## 8. Search boundary

The existing Diplodoc local search remains the only site-wide full-text search engine.

The knowledge-base search control is a **page-local filter** over already-rendered source records, not a second index.

It searches only fields already present in the page/state, initially:

- title;
- summary;
- publisher;
- topics.

This distinction must be documented and tested.

## 9. Error handling and validation

Build must fail with actionable errors for:

- malformed registry shape;
- duplicate IDs;
- invalid IDs;
- unsupported source types;
- missing required fields;
- invalid URLs;
- empty topics;
- unknown `related` IDs;
- self-relations;
- invalid date formats.

External URL availability must **not** block every production build because third-party availability is outside repository control. Link health belongs in the existing scheduled/external monitoring layer when added intentionally.

## 10. Testing strategy

Use TDD for the registry and renderer.

### Unit / contract tests

Cover at minimum:

- valid registry;
- duplicate ID rejection;
- malformed URL rejection;
- invalid source type rejection;
- related-reference validation;
- escaping of untrusted text in generated HTML;
- deterministic ordering;
- generated stable anchors;
- no-JS semantic content presence.

### Migration contract

Add a test/fixture proving the migrated registry preserves the expected number of existing bibliography entries and important representative URLs/content.

### Browser smoke

Verify:

- page renders source records;
- filters work;
- local page search works;
- clear filters restores all records;
- deep-link anchor resolves;
- no horizontal overflow on mobile;
- no serious/critical Axe violations;
- JavaScript-disabled core content remains visible.

Prefer extending/shared use of current browser helpers where practical, but do not make the full quality-harness consolidation a prerequisite for this feature.

## 11. Integration

The feature must preserve:

- current route `landing/bibliography.html`;
- navigation label `Источники`;
- Diplodoc local-search discoverability;
- metadata/OG behavior;
- sitemap behavior;
- existing bibliography reveal regression protection where still relevant, or replace it with an equivalent stronger assertion if the old table no longer exists.

Any obsolete table-specific CSS/JS/test code should be removed only after replacement coverage exists.

## 12. Delivery sequence

1. Write failing validator/renderer tests.
2. Add `data/sources.json` schema/data migration.
3. Implement validation and deterministic rendering.
4. Convert bibliography Markdown into an injection shell.
5. Integrate into `copy-assets.js`.
6. Add progressive filter/search UI.
7. Add browser/accessibility/mobile coverage.
8. Remove obsolete table-only behavior after replacement tests pass.
9. Run full repository quality suite.
10. Update `PROJECT_STATE.md`, `ROADMAP.md`, and `CHANGELOG.md` with actual verified state.

## 13. Definition of done

The phase is complete when:

- the old manually maintained giant table is no longer the source of truth;
- all existing bibliography records are preserved in `data/sources.json`;
- invalid registry data fails the build deterministically;
- the generated page is useful with JavaScript disabled;
- page-local search and filters work with JavaScript enabled;
- mobile has no horizontal overflow;
- accessibility gates pass;
- site-wide local search remains unchanged as the sole full-text engine;
- the full CI/quality suite is green;
- continuity docs reflect the merged implementation rather than planned state.
