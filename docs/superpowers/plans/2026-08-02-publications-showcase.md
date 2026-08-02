# Publications and appearances showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a first-class static catalogue of completed, externally verifiable articles, talks, interviews, scientific publications and proceedings, with a featured homepage surface and no duplication of Engineering Notes.

**Architecture:** `data/publications.json` is the only publication content registry. A pure validation module normalizes and orders records; a pure renderer produces semantic catalogue and featured HTML; the existing build postprocessor injects those fragments into the Diplodoc publications page and standalone homepage. The complete catalogue is present in generated HTML without JavaScript. Diplodoc remains the sole site-wide search owner.

**Tech Stack:** Node.js 24, ECMAScript modules, `node:test`, Diplodoc CLI, static HTML/CSS, existing build-time postprocessor, Playwright/Axe/Lighthouse quality harness.

## Global Constraints

- Include only already published or completed materials with stable external evidence.
- Do not infer missing titles, dates, roles, venues or authorship.
- Do not add drafts, submitted papers, planned talks, attendance-only events or private documents.
- Do not republish external article bodies or create local detail pages.
- Do not introduce a CMS, database, scraper, runtime API or client-side catalogue dependency.
- Do not add volatile views, votes, likes or subscriber counts to the registry.
- Keep Publications, Engineering Notes, Projects and Sources semantically separate.
- Derive display groups from `kind`; do not store a second classification field.
- Preserve semantic/no-JS access, safe external links and current Diplodoc search ownership.
- Do not weaken existing tests or quality gates.

---

## Task 1 — Establish the RED registry contract

**Create:**

- `scripts/publication-registry.test.js`
- `scripts/publications-showcase.test.js`

- [ ] Add tests importing the not-yet-existing publication registry module and requiring these exports:

```js
export const PUBLICATION_KINDS;
export const PUBLICATION_ROLES;
export const PUBLICATION_LINK_TYPES;
export const PUBLICATION_GROUPS;
export function validatePublicationRegistry(raw, options = {});
export function loadPublicationRegistry(filePath, options = {});
export function getFeaturedPublications(publications, limit = 3);
export function groupPublications(publications);
```

- [ ] Require controlled kinds:

```text
technical-article
scientific-publication
talk
interview
proceedings-publication
```

- [ ] Require controlled roles:

```text
author
co-author
speaker
panellist
interview-subject
```

- [ ] Require groups to be derived from kind in this fixed order:

```text
Технические статьи
Научные публикации
Доклады и конференции
Интервью и приглашённые материалы
Публикации в сборниках
```

- [ ] Add negative tests for duplicate IDs, duplicate canonical URLs, unsupported kinds/roles/link types, missing required fields, non-HTTPS URLs, invalid ISO dates, future publication dates, future `verifiedAt`, invalid featured ordering, duplicate featured order, invalid related project/note slugs and duplicate secondary URLs.
- [ ] Add deterministic sorting tests: featured by `featuredOrder`; catalogue by date descending then Russian title; groups by fixed order; empty groups omitted.
- [ ] Add structural source tests requiring the not-yet-existing `data/publications.json`, canonical publications Markdown page, homepage placeholder and navigation entry.
- [ ] Commit the test-only RED state.
- [ ] Verify exact-head CI fails only for the intentionally missing registry/module/page/placeholder surfaces.

Expected RED: module-not-found or explicit missing publication registry/page assertions while all pre-existing tests remain green.

---

## Task 2 — Implement the publication registry and initial verified data

**Create:**

- `scripts/publication-registry.js`
- `data/publications.json`

**Read for cross-reference validation:**

- `data/projects.json`
- `data/notes.json`

- [ ] Implement pure structural validation with explicit errors containing record index or ID.
- [ ] Normalize optional arrays to frozen empty arrays and return immutable normalized records.
- [ ] Validate URLs with the platform `URL` parser and require `https:`.
- [ ] Validate `date` and `verifiedAt` as exact `YYYY-MM-DD` values no later than the injected `asOf` date.
- [ ] Validate `featuredOrder` as a positive integer only for featured records and reject the property for non-featured records.
- [ ] Validate `relatedProjects` against canonical project slugs and `relatedNotes` against canonical Note slugs.
- [ ] Implement `getFeaturedPublications(publications, 3)` and `groupPublications(publications)` without mutating input.
- [ ] Seed the first registry with exactly three externally verified Habr articles:

```text
2025-08-23 — Простенький лендинг/wiki для вас и вашего проекта или как покорить Diplodoc'а и опубликовать на GitHub Pages
2025-08-01 — Как Java-разработчику эффективно решать алгоритмические задачи
2025-03-04 — Автоматизированный электропривод ленточного конвейера: Разработка системы управления с возможностью удаленного контроля
```

- [ ] Record `kind: technical-article`, `platform: Habr`, `role: author`, `language: ru`, original concise summaries, stable Habr canonical URLs and `verifiedAt: 2026-08-02`.
- [ ] Mark all three featured with explicit editorial order; do not store view counts.
- [ ] Add only evidence-backed topic labels and relationships. Leave relation arrays empty where the connection is not explicit enough.
- [ ] Run registry unit tests and verify GREEN for Task 1’s validation cases.
- [ ] Commit registry and data separately from rendering.

---

## Task 3 — Implement isolated semantic renderers

**Create:**

- `scripts/publication-renderer.js`
- `scripts/publication-renderer.test.js`
- `docs/_assets/style/publications.css`

- [ ] Export focused pure functions:

```js
export function renderFeaturedPublications(publications, options = {});
export function renderPublicationCatalogue(publications, options = {});
```

- [ ] Escape all registry-derived text and attributes.
- [ ] Render featured cards as a semantic list with platform/type marker, title, date, summary, role, topics and one clear external action.
- [ ] Render the full catalogue as fixed-order `<section>` blocks only for populated groups.
- [ ] Render in-page group navigation only when at least two groups are populated; do not produce empty anchors.
- [ ] Render canonical and secondary external links with `target="_blank" rel="noopener noreferrer"` and visible external semantics.
- [ ] Render optional related project/Note links only from validated registry relationships.
- [ ] Format dates in Russian without relying on browser JavaScript.
- [ ] Use stable `data-tr-publication-id` attributes on catalogue and homepage cards for testing, not tracking.
- [ ] Add renderer tests for escaping, action labels by kind/link, empty groups, long titles, absent optional fields, relationship links and duplicate-free output.
- [ ] Add a dedicated stylesheet with text-first cards, responsive wrapping, visible focus, sufficient contrast and no hover-only information.
- [ ] Run focused tests and commit the renderer layer.

---

## Task 4 — Integrate Publications into the build pipeline

**Modify:**

- `scripts/copy-assets.js`
- `scripts/standalone-home.js`
- `scripts/standalone-home.test.js`
- `scripts/project-evidence-orchestration.test.js` or the closest postprocessor orchestration test
- `docs/_assets/style/custom.css` only if Diplodoc needs a stylesheet import owner

- [ ] Add `PUBLICATIONS_MANIFEST` and an optional `publicationsPath` parameter to `postprocessOutput`.
- [ ] Load publications after projects and Notes so cross-reference validation uses canonical registries.
- [ ] Add an `applyPublicationsShowcase(outputDir, publications)` build function or equivalent focused module that replaces exactly one catalogue placeholder in `landing/publications.html`.
- [ ] Extend `writeStandaloneHome` and `renderStandaloneHome` with a publications input and replace exactly one `{{FEATURED_PUBLICATIONS}}` placeholder.
- [ ] Preserve the English homepage without a fake translated publication surface: replace the placeholder with an empty string or omit it from the English template explicitly and test the behaviour.
- [ ] Inject `publications.css` into the publications page and standalone homepage without duplicate stylesheet links.
- [ ] Return publication targets/counts from `postprocessOutput` and log them in `main()`.
- [ ] Add orchestration fixtures proving the same registry powers catalogue and homepage, all three IDs appear exactly once per surface, and no JavaScript is required for access.
- [ ] Run focused unit tests and commit build integration.

---

## Task 5 — Create the public page and navigation surfaces

**Create:**

- `docs/landing/publications.md`

**Modify:**

- `templates/index.html`
- `docs/toc.yaml`
- `data/page-meta.json`
- `docs/landing/about.md`
- `docs/landing/resume.md`

- [ ] Add the canonical page title `Публикации и выступления` and the approved first-person introduction.
- [ ] Add one featured placeholder, one catalogue placeholder and a short evidence-boundary note. Ensure generated content is ordinary semantic HTML.
- [ ] Add `Публикации` beside `Notes` in both the standalone and Diplodoc header navigation.
- [ ] Add a top-level Publications item to the side navigation.
- [ ] Add `{{FEATURED_PUBLICATIONS}}` after active projects and before “Чем я в основном занимаюсь”.
- [ ] Add or replace one homepage exploration card so Publications is discoverable without duplicating the featured cards.
- [ ] Add contextual links from About and Resume with calm factual copy.
- [ ] Add RU metadata/OpenGraph data for `landing/publications.html`.
- [ ] Preserve the Habr utility icon as the direct platform shortcut.
- [ ] Run structural tests and production build locally where available; rely on exact-head CI when the connector environment cannot execute the repository.
- [ ] Commit the public content/navigation integration.

---

## Task 6 — Extend quality and discoverability gates

**Modify:**

- `scripts/quality-harness/scenarios.cjs`
- `scripts/quality-harness.test.js`
- `scripts/browser-quality.cjs`
- `scripts/cross-browser-smoke.cjs`
- relevant generated-search, metadata and mobile-overflow tests
- `.github/workflows/build.yml`

- [ ] Add a canonical `publications` scenario for `/landing/publications.html` with heading `Публикации и выступления`.
- [ ] Capture desktop and mobile Chromium screenshots and accessibility results.
- [ ] Add Publications to Firefox/WebKit route smoke.
- [ ] Assert zero horizontal overflow for long titles, topic chips and external actions.
- [ ] Assert zero serious/critical Axe violations.
- [ ] Verify generated search contains all three titles and routes them through the Publications page, not local article-detail pages.
- [ ] Verify metadata/OpenGraph and canonical URL for the Publications page.
- [ ] Verify the Engineering Notes Atom feed remains unchanged and contains no external publication records.
- [ ] Preserve generated Publications HTML and desktop/mobile screenshots in the quality artifact.
- [ ] Run the full exact-head CI matrix and inspect failures without weakening gates.

---

## Task 7 — Manual evidence and visual acceptance

- [ ] Open every canonical and secondary external URL from `data/publications.json` and confirm title, author/role, date and platform.
- [ ] Confirm the initial public scope is exactly three verified Habr technical articles; record that no verifiable scientific publications, talks, interviews or proceedings were added in this milestone.
- [ ] Review exact-head desktop and mobile screenshots for hierarchy, legibility, external-link clarity, wrapping and distinction from Engineering Notes.
- [ ] Confirm the featured block is prominent but remains below active projects.
- [ ] Confirm empty categories are absent.
- [ ] Confirm no view-count or unsupported quality claim appears.
- [ ] Accept visual baseline changes only after screenshot review.
- [ ] Re-run the exact-head matrix after any baseline update.

---

## Task 8 — Finalize PR and durable state

**Modify:**

- PR #61 title/body

**After feature acceptance, update in a dedicated continuity commit or PR:**

- `docs/PROJECT_STATE.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG.md`

- [ ] Update PR #61 from design-only to the full feature scope, preserving design and implementation-plan links.
- [ ] Record RED and GREEN exact heads, CI run/build identifiers, test count, artifact ID/digest and manual review boundary.
- [ ] Mark the PR ready only after exact-head CI and manual artifact review pass.
- [ ] Merge with expected-head protection when repository tooling permits.
- [ ] Synchronize durable state with the accepted catalogue scope and explicitly excluded unverified material types.
- [ ] Treat GitHub Pages deployment and live production acceptance as separate post-merge facts.
