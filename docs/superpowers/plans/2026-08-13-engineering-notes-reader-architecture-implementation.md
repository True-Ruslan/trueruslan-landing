# Engineering Notes Reader Architecture Implementation Plan

> **Design:** `docs/superpowers/specs/2026-08-13-engineering-notes-reader-architecture-design.md` (PR #228)
>
> **Evidence basis:** `docs/research/2026-08-12-engineering-notes-content-seo-audit.md` (PR #227)
>
> **Base:** `master@14e966a0da47a659cbedab2fa3b6834353097ecc`

## Goal

Turn the existing Engineering Notes hub into a scan-first reader surface that answers **“where should I start?”** while preserving all 16 current Notes, every existing Note URL, the complete chronological catalogue, static-first architecture, generated search/feed ownership and current external-evidence boundaries.

The implementation is intentionally non-destructive:

- `/landing/notes/` remains the single reader hub;
- `data/notes.json` remains the canonical per-Note registry;
- `scripts/notes-content.js` remains the build-time Notes owner;
- no runtime content API, client-side filtering, second search index or second series manifest is introduced;
- no Note is deleted, merged, redirected or canonicalised to another Note;
- no ranking, CTR, cannibalisation, engagement or conversion claim is made from the sparse pre-launch evidence.

## Architecture

Each Note gains three validated reader fields in `data/notes.json`:

- `series` — one of `evidence-verification`, `ai-authority-protocols`, `static-first-web`;
- `seriesOrder` — positive integer, unique within a series;
- `readerRole` — `start` or `path`.

Each series has exactly one `start` Note. Series title/reader promise are immutable build-time presentation configuration in the existing Notes renderer, keyed by the validated enum rather than stored in a second manifest.

The generated `/landing/notes/` index becomes four layers:

1. existing page identity/intro;
2. compact **С чего начать** with three start choices;
3. three guided reader series with ordered crawlable links;
4. complete **Все заметки** chronological catalogue preserving current card metadata and ordering semantics.

The existing `related` registry graph is refined so every Note keeps meaningful outbound navigation and every Note has at least one inbound registry-generated edge. In particular, deliberate inbound paths are added to:

- `clean-urls-without-cloudflare-routing`;
- `hybrid-cv-ai-recognition-boundaries`;
- `gametests-vs-installed-gameplay-acceptance`;
- `evidence-driven-project-state`.

## Technology / verification stack

- Node.js CommonJS build/test scripts;
- `data/notes.json` canonical content registry;
- Diplodoc static generation + existing post-processing;
- existing CSS under `docs/_assets/style/`;
- existing browser smoke/Axe/Lighthouse/Firefox/WebKit/no-JS/visual-regression infrastructure;
- existing generated search, Atom feed, metadata, canonical and clean-route contracts;
- GitHub Actions Build, Dependency Review and CodeQL;
- exact merged-SHA Pages deployment + deployment-triggered Production Live + master CodeQL.

## Task 1 — RED: manifest reader-schema contract

**Files:**

- modify `scripts/notes-content.test.js` only.

**Test first:**

Add deterministic assertions that every registered Note has:

- a known `series` enum;
- a positive integer `seriesOrder`;
- a valid `readerRole`;
- a series-local unique order;
- exactly one `start` per series;
- complete coverage of all three required series.

Also lock the exact selected 16-Note series assignment from the approved design.

**RED command:**

```bash
node scripts/notes-content.test.js
```

**Expected RED:** current `data/notes.json` lacks the three reader fields; failures must be limited to the new reader-schema contract rather than unrelated existing Notes behavior.

Do not change production data or renderer until this failure is observed in CI or an equivalent exact-branch test run.

## Task 2 — RED: related-reading graph contract

**Files:**

- modify `scripts/notes-content.test.js` only.

Add graph assertions that:

- every Note has at least one outbound `related` edge;
- every Note has at least one inbound registry-generated edge;
- all related IDs still resolve and self-links remain forbidden;
- the four N5 zero-inbound deep dives receive inbound paths;
- the selected revised graph remains deterministic.

This stage should remain RED against the current registry because the four audited deep dives currently have zero inbound registry edges.

## Task 3 — RED: hub reader-render contract

**Files:**

- modify `scripts/notes-content.test.js` only.

Add generated-markup assertions for:

- one `С чего начать` region;
- exactly three series choices;
- one start Note per series with canonical Note href + reading time;
- three ordered guided-series sections;
- all 16 Notes represented exactly once in guided series;
- a distinct `Все заметки` full-catalogue layer;
- all 16 Notes still present in the complete catalogue in existing chronological ordering;
- no client-side/runtime dependency marker is introduced;
- deterministic generated output.

Expected RED: current renderer emits only the chronological card grid.

## Task 4 — GREEN: canonical manifest, validation and renderer

**Files:**

- modify `data/notes.json`;
- modify `scripts/notes-content.js`;
- modify `scripts/notes-content.test.js` only if a test itself is proven incorrect, never to weaken the approved contract.

Implement the minimum production change needed to satisfy Tasks 1–3:

1. add reader fields to all 16 Notes according to the approved series order;
2. extend `validateNotes()` to fail closed on missing/unknown series, invalid/duplicate order and invalid start-role cardinality;
3. add a small immutable series presentation configuration in `scripts/notes-content.js`;
4. render Start here, guided series and the preserved full catalogue from the same validated manifest;
5. keep normal crawlable `<a href>` links and existing Note routes.

Run:

```bash
node scripts/notes-content.test.js
npm test
```

GREEN means all old Notes contracts and new reader contracts pass together.

## Task 5 — GREEN: intentional graph and scan-copy refinement

**Files:**

- modify `data/notes.json`;
- where necessary, minimally modify the opening paragraphs of the six approved Note Markdown sources under `docs/landing/notes/`.

Refine `related` edges editorially rather than mechanically. Every new edge must be a useful next read; do not add links only to satisfy a graph count.

Clarify scan-level differentiation for exactly these Notes without inventing new facts or rewriting articles wholesale:

- `green-ci-is-not-product-verification`;
- `llm-output-is-a-protocol-boundary`;
- `source-tests-to-installed-acceptance`;
- `probabilistic-proposals-deterministic-authority`;
- `hybrid-cv-ai-recognition-boundaries`;
- `gametests-vs-installed-gameplay-acceptance`.

Keep title, route identity and factual/evidence boundaries intact unless the approved design explicitly requires otherwise.

## Task 6 — GREEN: visual hierarchy and browser acceptance

**Files:**

- minimally modify the existing Notes-related stylesheet under `docs/_assets/style/`;
- extend the nearest existing browser acceptance surface rather than introducing a parallel harness unless no suitable owner exists.

Requirements:

- compact Start here block;
- readable guided series without turning 16 Notes into another wall of cards;
- full catalogue clearly separated below;
- no horizontal overflow on mobile;
- keyboard/focus semantics preserved;
- no-JS content fully useful;
- no hidden/filter-only content dependency;
- Axe and Lighthouse budgets preserved;
- Chromium, Firefox and WebKit remain green.

Run the smallest targeted browser command first, then the repository-owned full browser matrix. If intentional geometry changes affect bounded visual baselines, review screenshots manually and update only the exact affected Notes baseline entries; never weaken thresholds globally.

## Task 7 — Regression gates: representation and URL contracts

Verify that the reader architecture does not alter identity/ownership contracts:

- all existing Note routes still build;
- generated local search still contains the Notes;
- `feed.xml` remains valid and deterministic;
- canonical and clean-route contracts stay unchanged;
- sitemap/metadata ownership remains unchanged;
- no legacy `.html`, redirect or canonical migration is introduced;
- no second Notes/series data source appears.

Run ordinary `npm test`, production-like docs build and the existing search/feed/canonical/custom-domain gates.

## Task 8 — Exact-head pull-request acceptance

Open/update a Draft feature PR from `feat/engineering-notes-reader-architecture` to `master` and preserve RED evidence in the PR description.

Before marking ready or merging, require fresh exact-head evidence:

- Build — SUCCESS;
- all unit/contract tests — SUCCESS;
- Notes browser + no-JS/mobile overflow — SUCCESS;
- Axe/Lighthouse — SUCCESS;
- Chromium/Firefox/WebKit — SUCCESS;
- generated search/feed/canonical/clean-route — SUCCESS;
- visual regression — SUCCESS with reviewed intentional differences only;
- Dependency Review — SUCCESS;
- CodeQL — SUCCESS / no new alerts;
- no unresolved review threads.

Then squash merge with expected head SHA.

## Task 9 — Exact production acceptance

On the exact merged `master` SHA require:

- GitHub Pages deployment — SUCCESS;
- deployment-triggered Production Live — SUCCESS;
- master CodeQL — SUCCESS.

Only after those three evidence layers are fresh may this N5 reader implementation be described as production accepted.

## Task 10 — Durable reconciliation and launch handoff

In a separate bounded reconciliation change:

- add immutable acceptance evidence under `docs/acceptance/`;
- update `docs/PROJECT_STATE.md`;
- update `docs/ROADMAP.md`;
- update `docs/CHANGELOG.md`;
- reconcile issue #219 against actual N2–N5 state;
- reconcile Content Freshness findings only from current external/repository evidence.

Preserve external state unless new operator evidence genuinely changes it:

- controlled launch: `not-published`;
- P4.1B: `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE`;
- P4.1C: `WAITING`;
- P3.6: `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- clean-URL observation clock: `2026-08-05T00:00:00Z`.

The next operator step after product/reconciliation acceptance remains the deliberate controlled manual launch, followed by accumulation and review of real Search Console / Yandex Webmaster observations before any evidence-backed P4.1C SEO/copy decision.
