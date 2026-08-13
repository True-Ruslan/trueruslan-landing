# Engineering Notes Reader Architecture — Design

Date: 2026-08-13
Status: proposed for written-spec review before implementation

## Goal

Make the Engineering Notes hub answer the reader’s first question — **“where should I start?”** — without deleting, merging, redirecting or canonicalising any current Note URL.

The selected reader architecture is:

1. a compact **Start here** block with three entry paths;
2. three explicit reader-oriented series;
3. the complete chronological catalogue of all current Notes;
4. deliberate related-reading edges that make newer deep dives easier to reach;
5. clearer scan copy for the small set of Notes whose intent is easy to confuse with a neighbouring article.

The implementation must preserve the project architecture:

**static-first + build-time intelligence + progressive enhancement**.

It must not introduce a runtime content API, a second search owner, destructive SEO migration, or claims of search-performance improvement that the current evidence cannot support.

## Evidence basis

This design follows the completed N5 audit in:

`docs/research/2026-08-12-engineering-notes-content-seo-audit.md`

The audit established the current repository baseline:

- 16 registered Notes;
- approximately 17,351 prose words;
- 174 section headings;
- 355–2,083 prose words per Note;
- three high-overlap review pairs;
- no overlap pair justified a merge after manual review;
- several newer deep dives currently have no inbound registry-generated related edge.

The audit conclusion is therefore preserved as a hard boundary:

> the primary problem is reader orientation, not insufficient substance.

The current sparse pre-announcement Google Search Console baseline remains insufficient for ranking, CTR, cannibalisation or merge conclusions. This design does not treat low traffic as evidence that a Note should be consolidated.

## Product principles

The Engineering Notes surface should optimise for scan-first reading while retaining depth.

A reader arriving at `/landing/notes/` should be able to understand, without opening multiple articles:

- which broad problem area they care about;
- which Note is the best first read;
- what a reasonable next sequence is;
- how to access the full archive if they do not want a guided path.

The hub is a reader-orientation surface, not a topic taxonomy for its own sake.

The implementation therefore follows four rules:

1. **one primary series per Note** — no ambiguous multi-series ownership;
2. **all Notes remain visible in the full catalogue** — guided paths never hide the archive;
3. **series are navigation, not canonical identity** — Note URLs and metadata identities remain unchanged;
4. **related reading remains contextual** — a Note may link across series when that is the most useful next step.

## Approaches considered

### Approach A — one Notes hub with Start here, series and full catalogue

Keep `/landing/notes/` as the single reader hub and enrich its build-time representation.

**Advantages**

- no new public route surface;
- no new canonical or redirect policy;
- preserves one hub and one archive;
- easiest model for readers to understand;
- keeps series as navigation rather than content duplication;
- aligns with the existing static build and Notes manifest;
- lowest SEO and maintenance risk.

**Trade-offs**

- the hub becomes structurally richer and requires careful visual hierarchy;
- series presentation must remain compact so it does not overwhelm the chronological catalogue.

**Decision: selected.**

### Approach B — separate public page for each series

Add three series landing pages and make `/landing/notes/` a directory of those hubs.

**Advantages**

- each series could have more explanatory copy and its own visual identity;
- individual series could be linked externally as standalone destinations.

**Disadvantages**

- adds three routes, metadata surfaces and long-term maintenance obligations;
- introduces more internal-link and canonical decisions before there is audience evidence that separate series hubs are needed;
- risks duplicating the same Note lists across multiple pages;
- expands scope beyond the reader-orientation problem identified by N5.

**Decision: rejected for now.**

### Approach C — only edit summaries and `related` links

Keep the current chronological hub unchanged and improve only descriptions and related-reading edges.

**Advantages**

- smallest implementation;
- almost no layout change.

**Disadvantages**

- does not answer “where should I start?” at the hub level;
- keeps all 16 cards visually equivalent;
- makes the reader infer topic paths from tags and titles.

**Decision: insufficient as the primary solution.**

## Selected information architecture

The Notes hub is rendered in four layers.

### Layer 1 — existing page identity

Keep the existing H1 and concise hub introduction.

No route change:

`/landing/notes/`

No new top-level site-navigation item is added. Engineering Notes remains under the existing **Материалы** information architecture.

### Layer 2 — Start here

Immediately after the introductory copy, render a compact three-choice block.

The block title is **С чего начать**.

Each choice contains:

- series title;
- one-sentence reader promise;
- one primary entry Note;
- reading time from the canonical Note manifest;
- a normal crawlable `<a href>` to the Note.

The three entry choices are:

1. **Evidence & Verification**
   - entry Note: `green-ci-is-not-product-verification`;
   - reader promise: understand why a green technical gate proves only a bounded fact and how evidence layers should be separated.

2. **AI Authority & Protocol Boundaries**
   - entry Note: `server-authoritative-ai-npcs`;
   - reader promise: understand where probabilistic AI output ends and deterministic system authority begins.

3. **Static-first Web Engineering**
   - entry Note: `portfolio-runtime-boundary`;
   - reader promise: understand why static representation, runtime boundaries and observable browser outcomes are treated as separate engineering concerns.

The Start here block is intentionally small. It does not display every Note in each series.

### Layer 3 — guided series

Below Start here, render three series sections. Each section shows the ordered reading path for its Notes.

The sections must remain compact: title, one short description and an ordered list or lightweight cards/rows. The series must not duplicate full article descriptions when a concise title + reading-time path is enough.

#### Series A — Evidence & Verification

Purpose: distinguish repository, test, artifact, deployment, persistence and product evidence without promoting one layer into a broader claim.

Ordered path:

1. `green-ci-is-not-product-verification`
2. `static-site-quality-gates`
3. `source-tests-to-installed-acceptance`
4. `gametests-vs-installed-gameplay-acceptance`
5. `restart-persistence-is-a-product-contract`
6. `deployment-success-is-not-production-verification`
7. `passive-pdf-validation-vs-semantic-completeness`
8. `evidence-driven-project-state`

#### Series B — AI Authority & Protocol Boundaries

Purpose: show how model output is constrained by protocol validation, deterministic authority and explicit apply boundaries.

Ordered path:

1. `server-authoritative-ai-npcs`
2. `llm-output-is-a-protocol-boundary`
3. `probabilistic-proposals-deterministic-authority`
4. `hybrid-cv-ai-recognition-boundaries`

#### Series C — Static-first Web Engineering

Purpose: show how build-time data, generated representation, browser behaviour and public URL identity stay reproducible without unnecessary runtime infrastructure.

Ordered path:

1. `portfolio-runtime-boundary`
2. `static-first-sources-no-js`
3. `intersection-observer-giant-table`
4. `clean-urls-without-cloudflare-routing`

These assignments cover all 16 Notes exactly once.

### Layer 4 — complete catalogue

The current chronological catalogue remains below the guided series.

Requirements:

- all 16 Notes remain present;
- current chronological ordering semantics are preserved;
- existing title, description, updated date, reading time and tags remain available;
- readers can ignore guided paths and browse the complete archive exactly as before;
- no pagination, client-side filtering or runtime fetch is introduced in this slice.

A short heading such as **Все заметки** separates the guided paths from the full archive.

## Canonical data model

`data/notes.json` remains the canonical per-Note registry.

The manifest is extended only with build-time reader-architecture fields.

Each Note receives:

```json
{
  "series": "evidence-verification",
  "seriesOrder": 1,
  "readerRole": "start"
}
```

### `series`

Required enum after this change:

- `evidence-verification`
- `ai-authority-protocols`
- `static-first-web`

Every Note must belong to exactly one series.

### `seriesOrder`

Required positive integer, unique within a series.

This makes reading sequence explicit instead of deriving it from publication date or array position.

### `readerRole`

Required enum:

- `start` — the single Start here entry for a series;
- `path` — any later Note in the guided sequence.

Each series must contain exactly one `start` Note and one or more `path` Notes.

This field is intentionally narrow. It is not a general editorial taxonomy and must not expand into labels such as beginner/intermediate/advanced without separate evidence and design.

## Series presentation metadata

Series titles and one-sentence descriptions are presentation configuration, not a second content registry.

They may live as a small immutable build-time constant in the Notes renderer keyed by the validated `series` enum.

The implementation must not add `data/note-series.json` or another independently editable manifest in this slice.

The renderer must fail closed when an unknown series key is encountered.

## Related-reading graph

The N5 audit found that the current graph is historically biased toward older gateway Notes. This slice should make the graph intentional without trying to create a mathematically symmetric network.

Rules:

1. every Note must keep at least one meaningful outbound `related` edge;
2. every Note should have at least one inbound registry-generated related edge after the change;
3. direct neighbours in a guided series should normally be connected when editorially useful;
4. cross-series links are allowed when they explain a genuine conceptual boundary;
5. reciprocal links are preferred when two Notes are natural counterparts, but reciprocity is not mandatory everywhere;
6. no related edge is added merely to satisfy a graph count if the destination is not useful to the reader.

The implementation plan should define the exact revised `related` arrays and lock the resulting graph with deterministic tests.

The four current zero-inbound deep dives identified by N5 must receive meaningful inbound paths:

- `clean-urls-without-cloudflare-routing`;
- `hybrid-cv-ai-recognition-boundaries`;
- `gametests-vs-installed-gameplay-acceptance`;
- `evidence-driven-project-state`.

## Scan-copy clarification

Six Notes need clearer scan-level differentiation because neighbouring Notes share vocabulary or evidence layers.

The implementation may change their manifest `description` and the first introductory paragraph where necessary, but must not rewrite the articles wholesale.

Target Notes:

1. `green-ci-is-not-product-verification`
   - clarify that this is the general evidence-scope gateway;
   - distinguish it from deployment, installed-acceptance and GameTests deep dives.

2. `llm-output-is-a-protocol-boundary`
   - clarify that it owns parsing/schema/protocol validation before authorization;
   - distinguish it from the broader deterministic-authority architecture pattern.

3. `source-tests-to-installed-acceptance`
   - state immediately that it is the end-to-end release-gate progression and corrective-release retrospective;
   - distinguish it from the focused GameTests/system-boundary Note.

4. `probabilistic-proposals-deterministic-authority`
   - position it as the reusable cross-project authority pattern;
   - distinguish it from the concrete Vlezet CV case study.

5. `hybrid-cv-ai-recognition-boundaries`
   - position it as a concrete local-CV + AI implementation case study with explicit Apply/revalidation evidence;
   - distinguish it from the general authority pattern.

6. `gametests-vs-installed-gameplay-acceptance`
   - state that it owns the specific GameTests-versus-installed-gameplay/system-layer question;
   - distinguish it from the broader release lifecycle Note.

Copy changes must preserve factual boundaries already established by project evidence. No new project claim may be invented solely to make an introduction stronger.

## Rendering architecture

The existing Notes build-time owner remains `scripts/notes-content.js`.

The renderer should gain isolated helpers with clear responsibilities rather than one larger monolithic template function.

Recommended boundaries:

- `validateNotesManifest(...)` — schema, series and graph invariants;
- `renderNotesStartHere(...)` — three entry choices;
- `renderNotesSeries(...)` — ordered guided paths;
- existing catalogue renderer — full archive;
- existing per-Note navigation renderer — previous/next + related reading.

The final index representation is assembled at build time from the same manifest.

No client-side state is required for Start here or series navigation.

## No-JavaScript behaviour

The Notes hub currently has a semantic no-JavaScript fallback when Diplodoc stores the article body only in hydration state.

The new architecture must be present in that same build-time semantic representation.

With JavaScript disabled, a reader must still be able to:

- see Start here;
- see all three series;
- open every series link;
- see the full catalogue;
- open every Note;
- use ordinary browser navigation.

The implementation must not create a separate hand-maintained no-JS content source.

## Accessibility

The new structure is navigation-heavy but does not require an interactive widget.

Requirements:

- use semantic headings in logical order;
- Start here choices use ordinary links, not clickable `div`s;
- series paths use semantic ordered/unordered lists or equivalent article links;
- reading-time text remains available without relying on colour;
- focus order follows visual order;
- no custom keyboard handling is introduced;
- contrast and focus indicators use existing project tokens and quality gates.

No accordion is required in this slice. All three series are visible by default to avoid hiding the orientation model behind interaction.

## Visual hierarchy

The page should have three distinct visual weights:

1. Start here — strongest orientation surface, but limited to three compact choices;
2. Series — medium-weight guided paths;
3. All Notes — existing archive cards, visually quieter than the orientation block but still fully readable.

The implementation should reuse existing card, border, spacing and typography primitives where practical.

Do not introduce a separate design system or decorative illustration for this page.

Responsive behaviour:

- Start here: three columns when space allows, one column on narrow viewports;
- series: stacked sections with no horizontal scrolling;
- catalogue: preserve current responsive behaviour;
- all chip/tag wrapping must remain inside card bounds.

## Search, feed and SEO boundaries

This is an internal-navigation/editorial change, not a URL migration.

Hard rules:

- no Note URL is deleted or renamed;
- no Note canonical is changed;
- no `.html` compatibility behaviour is changed;
- no redirect is added for Notes;
- Atom feed route and ownership stay unchanged;
- feed entries remain individual Notes rather than series entries;
- sitemap ownership stays unchanged;
- generated search remains the existing search owner;
- series labels may become searchable only through the normal generated HTML/index path;
- no second search index is introduced;
- clean-URL observation clock remains `2026-08-05T00:00:00Z`;
- controlled launch state remains unchanged;
- P4.1B / P4.1C / P3.6 external evidence states remain unchanged.

No implementation PR may claim improved rankings, CTR, indexing or cannibalisation reduction from this reader architecture.

## TDD strategy

Implementation starts with focused RED contracts before production manifest/render changes.

### Manifest RED contracts

Tests must initially fail until the new fields are added.

Require:

1. every Note has a valid `series`;
2. every Note has a positive integer `seriesOrder`;
3. `seriesOrder` is unique within each series;
4. every Note has valid `readerRole`;
5. exactly three series exist;
6. each series has exactly one `start` Note;
7. all 16 Notes are assigned exactly once;
8. the expected entry Notes are fixed:
   - Evidence → `green-ci-is-not-product-verification`;
   - AI → `server-authoritative-ai-npcs`;
   - Static-first → `portfolio-runtime-boundary`;
9. unknown series/roles fail closed.

### Reader-path RED contracts

Require exact guided-series ordering defined in this spec.

The tests must make accidental reordering visible instead of silently deriving paths from current array order.

### Related-graph RED contracts

Require:

- no unknown related slug;
- no self-link;
- no duplicate related slug;
- at least one outbound related edge per Note;
- at least one inbound related edge per Note after the intended graph update;
- the four currently zero-inbound deep dives have explicit inbound coverage.

### Rendering RED contracts

The generated Notes hub must contain:

- one Start here region;
- exactly three entry links;
- exactly three series regions;
- all 16 Notes across the guided series exactly once;
- all 16 Notes in the complete catalogue;
- the expected reading-time metadata for Start here entries;
- crawlable normal links to Note routes;
- no runtime-only placeholder required to make the orientation content readable.

### Copy differentiation contracts

Keep these focused and structural rather than brittle full-string snapshots.

Tests should verify that the six target manifest descriptions include the distinguishing concepts selected in this spec, without freezing every word of editorial copy.

## Browser and deployment acceptance

On the exact implementation PR head verify at minimum:

- desktop Start here layout;
- mobile single-column Start here layout;
- all three series visible without interaction;
- all series links resolve;
- full catalogue still contains all 16 Notes;
- no duplicate visible card/row caused by build-time injection;
- no-JS desktop and mobile expose Start here, series and catalogue;
- keyboard focus reaches links in visual order;
- Axe passes;
- Lighthouse project thresholds pass;
- Chromium browser smoke passes;
- Firefox compatibility passes;
- WebKit compatibility passes;
- no horizontal overflow;
- generated search still finds representative Notes;
- Atom feed remains valid and contains individual Note URLs;
- canonical/clean-route checks remain unchanged;
- visual regression is reviewed rather than blindly rebased;
- Dependency Review and CodeQL remain green.

After merge:

- GitHub Pages must succeed on the exact merged SHA;
- Production Live Smoke must succeed on the same exact merged SHA;
- master CodeQL must remain green.

## Intended implementation surface

Expected production files, subject to the implementation plan and RED evidence:

- `data/notes.json`;
- `scripts/notes-content.js`;
- focused Notes manifest/render/graph tests;
- `scripts/notes-browser-smoke.js` or the current Notes browser acceptance owner if runtime geometry/semantic checks belong there;
- `docs/_assets/style/journal.css` and/or the existing relevant style owner;
- the six target Note Markdown files only where an intro paragraph actually needs clarification.

Durable docs may be updated after acceptance to record the completed reader-architecture slice.

No new dependency is expected.

## Scope exclusions

Explicitly not part of this implementation:

- merging two or more Notes;
- deleting Note pages;
- redirect/canonical migration;
- separate public series pages;
- tag filtering UI;
- client-side series filtering;
- popularity/recommended-by-analytics ranking;
- automatic “related” generation from embeddings or LLMs;
- new search engine;
- new English translations of all Notes;
- changing the controlled-launch state;
- solving dependency issue #82;
- resetting the clean-URL observation clock;
- interpreting sparse pre-launch traffic as SEO success/failure.

## Rollback

The change is repository-local and non-destructive.

Rollback consists of reverting:

- manifest reader fields/related edges;
- build-time hub rendering;
- style changes;
- bounded scan-copy edits;
- focused tests.

Because no existing public route or canonical identity changes, rollback does not require redirect repair or external search migration.

## Definition of Done

The reader-architecture slice is complete only when:

- all 16 current Notes remain on their existing public URLs;
- the Notes hub exposes one compact Start here region with the three agreed entry Notes;
- all 16 Notes belong to exactly one of the three explicit series;
- guided-series order is deterministic and validated;
- the full chronological catalogue remains present;
- all Notes have meaningful inbound and outbound registry-related navigation;
- the four previously zero-inbound deep dives gain useful inbound paths;
- the six confusing Notes have clearer scan-level differentiation without invented claims;
- no runtime API, client-side filtering or second search owner is introduced;
- no-JS representation contains the same reader architecture;
- focused RED→GREEN tests prove the new manifest, ordering, graph and rendering contracts;
- full unit/build/site-integrity/browser/a11y/cross-browser/search/feed/canonical/visual/security CI is green on the exact PR head;
- review has no blockers;
- after merge, Pages, Production Live Smoke and master CodeQL are green on the exact merge SHA;
- durable state/roadmap/changelog are reconciled without claiming external SEO impact or controlled-launch publication.
