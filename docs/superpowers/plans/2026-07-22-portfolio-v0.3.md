# TrueRuslan Portfolio v0.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship portfolio v0.3 with one canonical project registry, a first-class `/now` page, flagship project timelines, structured Engineering Notes metadata plus RSS/Atom, and an accessible global Cmd/Ctrl+K palette while preserving the static-first architecture.

**Architecture:** Keep all canonical state in validated JSON manifests and apply deterministic build-time rendering during the existing post-processing stage. Progressive JavaScript only enhances navigation; core project, timeline, now, and note content remains semantic and usable without JavaScript. Existing Diplodoc local search remains the only full-text search implementation.

**Tech Stack:** Node.js 24+, npm 11.5.1+, ES modules, Node test runner, Diplodoc, static HTML/CSS/vanilla JS, GitHub Actions.

## Global Constraints

- Preserve `static-first + build-time intelligence + progressive enhancement`.
- No backend, CMS, database, authentication, runtime GitHub API, React/Next.js, or second full-text search index.
- Core content must not require runtime fetch.
- Generated output must be deterministic and fail fast on invalid manifests.
- Project identity/status must have one hand-maintained canonical source.
- Existing build, integrity, accessibility, cross-browser, Lighthouse, visual-regression, and production-smoke guarantees must remain green.

---

### Task 1: Canonical Project Registry

**Files:**
- Create: `data/projects.json`
- Create: `scripts/project-registry.js`
- Create: `scripts/project-registry.test.js`
- Modify: `scripts/standalone-home.js`
- Modify: `scripts/standalone-home.test.js`
- Remove after migration: `data/currently-building.json`

**Interfaces:**
- Produces `loadProjectRegistry(path)`, `validateProjectRegistry(projects, options)`, `getActiveProjects(projects)`, and `renderProjectCards(projects)`.
- `writeStandaloneHome()` consumes the canonical registry and derives active project cards.

- [ ] Write tests that reject duplicate slugs, unknown status values, unsafe local hrefs, invalid tag counts, missing referenced timelines, and active projects without destinations.
- [ ] Verify the tests fail before the registry module exists.
- [ ] Implement registry validation with explicit allowed statuses and deterministic active-project derivation.
- [ ] Migrate homepage rendering from `currently-building.json` to `projects.json`.
- [ ] Verify registry and standalone-home tests pass.
- [ ] Remove the old hand-maintained `currently-building.json` only after no code references it.
- [ ] Commit `feat: add canonical project registry`.

### Task 2: First-class `/now` Page

**Files:**
- Create: `data/now.json`
- Create: `docs/landing/now.md`
- Create: `scripts/now-page.js`
- Create: `scripts/now-page.test.js`
- Modify: `scripts/copy-assets.js`
- Modify: `docs/toc.yaml`
- Modify: `templates/index.html`
- Modify: `data/page-meta.json`

**Interfaces:**
- `renderNowContent(nowData, activeProjects)` returns semantic HTML.
- `applyNowPage(outputDir, nowData, activeProjects)` replaces a stable raw-HTML placeholder in generated `/landing/now.html`.

- [ ] Write failing tests for now-data validation and deterministic rendering from `now.json` plus active projects from `projects.json`.
- [ ] Implement validator/renderer and build-time injection.
- [ ] Add `/now` to Diplodoc navigation, sitemap discovery, standalone navigation, and homepage discovery cards.
- [ ] Ensure `now.json` contains only focus/learning/writing/update copy and duplicates no project status fields.
- [ ] Run unit tests and build checks.
- [ ] Commit `feat: add now page from canonical project state`.

### Task 3: LivingWorld and NODE ZERO Timelines

**Files:**
- Create: `data/project-history/livingworld.json`
- Create: `data/project-history/node-zero.json`
- Create: `scripts/project-timeline.js`
- Create: `scripts/project-timeline.test.js`
- Modify: `docs/landing/projects/livingworld.md`
- Modify: `docs/landing/projects/node-zero.md`
- Modify: `scripts/copy-assets.js`
- Create: `docs/_assets/style/project-timeline.css`
- Modify: `docs/.yfm`
- Modify: `templates/index.html` only if timeline styles are needed on standalone surfaces (normally not required)

**Interfaces:**
- `validateTimeline(slug, entries)` validates one current state maximum, valid ordering fields, safe evidence links, and required labels/descriptions.
- `renderTimeline(slug, entries)` returns semantic `<section>`/`<ol>` markup.
- `applyProjectTimelines(outputDir, registry)` injects referenced timeline manifests into case-study placeholders.

- [ ] Write failing validation/rendering tests.
- [ ] Add structured history for LivingWorld and NODE ZERO with `past`, `current`, and `next` milestones.
- [ ] Add stable timeline placeholders to both case-study Markdown pages.
- [ ] Implement deterministic injection and semantic timeline CSS with reduced-motion-safe progressive styling only.
- [ ] Run unit/build/integrity checks.
- [ ] Commit `feat: add flagship project timelines`.

### Task 4: Engineering Notes Metadata and Feed

**Files:**
- Create: `data/notes.json`
- Create: `scripts/notes-content.js`
- Create: `scripts/notes-content.test.js`
- Modify: `docs/landing/notes.md`
- Modify: the three current note Markdown files to add stable metadata/navigation placeholders
- Modify: `scripts/copy-assets.js`
- Modify: `data/page-meta.json` where needed

**Interfaces:**
- `validateNotesManifest(notes, docsDir)` verifies unique slugs, ISO dates, positive reading times, existing note files, and valid related slugs.
- `renderNoteMeta(note)` and `renderRelatedNotes(note, notes)` return semantic HTML.
- `writeAtomFeed(outputDir, notes, siteUrl)` writes deterministic `feed.xml`.
- `applyNoteEnhancements(outputDir, notes)` injects metadata plus previous/next/related navigation.

- [ ] Write failing tests for invalid dates, missing files, unknown related notes, deterministic ordering, XML escaping, and stable feed bytes.
- [ ] Implement notes manifest validation and HTML enhancement.
- [ ] Generate `feed.xml` with title, canonical URL, summary, published/updated dates, and tags.
- [ ] Link the feed from Notes and generated page metadata where practical.
- [ ] Run unit/build/integrity checks.
- [ ] Commit `feat: add structured engineering notes feed`.

### Task 5: Global Cmd/Ctrl+K Command Palette

**Files:**
- Create: `docs/_assets/script/command-palette.js`
- Create: `docs/_assets/style/command-palette.css`
- Create: `scripts/command-palette.test.js`
- Modify: `docs/.yfm`
- Modify: `templates/index.html`
- Modify: `scripts/copy-assets.js` only if standalone resource copying requires it
- Modify: browser smoke coverage for keyboard behavior.

**Interfaces:**
- Expose `globalThis.TrueRuslanCommandPalette` with pure helpers for command definitions/path resolution and `init()` for browser mounting.
- Quick destinations: Projects, Now, Notes, Engineering Map, Resume, GitHub, plus a handoff item to the existing `_search/ru/index.html` page.

- [ ] Write failing tests for deterministic commands, deployment-safe root/subpath URL resolution, shortcut filtering in editable fields, and no duplicate full-text implementation.
- [ ] Implement accessible dialog UI created progressively from static navigation commands.
- [ ] Implement Cmd/Ctrl+K, `/` outside editable controls, Escape close, focus trap while open, and focus restoration.
- [ ] Add reduced-motion-safe styles and a visible keyboard affordance in the site header.
- [ ] Extend browser smoke for open/close/focus behavior and mobile overflow/Axe.
- [ ] Commit `feat: add global command palette`.

### Task 6: Post-processing Integration and Documentation

**Files:**
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/site-integrity.js` and/or tests only where required for `feed.xml` and `/now` coverage
- Modify: `scripts/production-smoke.js` and tests for `/now` and feed availability
- Modify: `README.md`
- Modify: `package.json` version to `0.3.0`

**Interfaces:**
- Post-processing order: load/validate registry → standalone homepage → `/now` → timelines → notes/feed → Engineering Map → OG/meta/SEO.
- Every manifest error terminates the build with an actionable error.

- [ ] Add integration tests proving the post-processing stage consumes all new manifests and writes all expected outputs.
- [ ] Update production smoke contracts for `/landing/now.html` and `/feed.xml`.
- [ ] Update README architecture/data-flow/feature documentation and remove references to hand-maintained `currently-building.json`.
- [ ] Bump package version to `0.3.0`.
- [ ] Run `npm test`, `npm run build:docs`, and `npm run check:site`.
- [ ] Commit `chore: integrate portfolio v0.3 build pipeline`.

### Task 7: Final Quality Gate and PR

**Files:**
- No new production files unless verification exposes a defect.

- [ ] Review `master...feat/portfolio-v0.3` for accidental scope expansion and duplicate project metadata.
- [ ] Confirm all existing and new tests pass.
- [ ] Confirm generated `/now`, timelines, `feed.xml`, command palette resources, metadata, and local-search handoff exist.
- [ ] Open a PR against `master` with a concise architecture/validation summary.
- [ ] Wait for GitHub Actions and inspect failing job logs if any.
- [ ] Fix only root causes; never weaken existing quality gates to force green.
- [ ] Merge only when the full required workflow is green.