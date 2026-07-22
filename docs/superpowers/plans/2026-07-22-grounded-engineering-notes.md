# Grounded Engineering Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish three repository-grounded Engineering Notes that complete P0.5 and integrate through the existing metadata, navigation, feed, search, SEO, and quality pipelines.

**Architecture:** Keep the existing static-first Notes architecture unchanged. Markdown remains narrative source, `data/notes.json` remains canonical note metadata/relations, TOC exposes pages to Diplodoc/search/sitemap, and `data/page-meta.json` supplies SEO/OpenGraph. Add one canonical-content contract test so the milestone cannot silently lose one of its required notes.

**Tech Stack:** Markdown, JSON, YAML, Node.js `node:test`, Diplodoc, existing build-time Notes pipeline.

## Global Constraints

- Add exactly 3 new grounded notes for this milestone.
- Use only incidents already supported by repository history.
- No runtime API, CMS, backend, new search index, or Notes renderer changes.
- Preserve static-first/no-JS behavior and all existing quality gates.
- Do not claim the milestone complete in durable state docs until merge + exact-head verification.

---

### Task 1: Add a canonical content contract for P0.5

**Files:**
- Modify: `scripts/notes-content.test.js`

**Interfaces:**
- Consumes: `loadNotesManifest()` from `scripts/notes-content.js` and the production `data/notes.json`/Markdown sources.
- Produces: a regression contract requiring the three P0.5 slugs to exist and pass normal manifest/file/relation validation.

- [ ] **Step 1: Write the failing test**

Import `loadNotesManifest` and add a test that loads the canonical manifest and asserts these slugs are present:

```js
const requiredGroundedNotes = [
  'intersection-observer-giant-table',
  'static-first-sources-no-js',
  'green-ci-is-not-product-verification',
];

const canonicalNotes = loadNotesManifest();
for (const slug of requiredGroundedNotes) {
  assert.ok(canonicalNotes.some((note) => note.slug === slug), `missing grounded Engineering Note: ${slug}`);
}
```

- [ ] **Step 2: Run test to verify RED**

Run: `npm test`

Expected: FAIL because the three canonical note entries/files do not exist yet.

- [ ] **Step 3: Commit RED contract**

Commit message:

```text
test: require grounded Engineering Notes milestone
```

---

### Task 2: Add three grounded note source files

**Files:**
- Create: `docs/landing/notes/intersection-observer-giant-table.md`
- Create: `docs/landing/notes/static-first-sources-no-js.md`
- Create: `docs/landing/notes/green-ci-is-not-product-verification.md`

**Interfaces:**
- Consumes: repository incident history in `docs/CHANGELOG.md` and the approved design spec.
- Produces: three standalone Markdown pages consumed by Diplodoc and the Notes postprocessor.

- [ ] **Step 1: Write the IntersectionObserver incident note**

Cover exactly:

```text
symptom: giant bibliography table remains opacity: 0 after hydration
root cause: IntersectionObserver threshold 0.08 requires ~8% of a very tall element to intersect
misleading symptom: fullscreen can temporarily change geometry enough to reveal it
fix: threshold 0 with existing root margin + normal viewport regression
later architectural outcome: Sources Registry removed the giant table data/presentation model
lesson: visibility animation assumptions must be tested against element geometry, not only ordinary cards
```

- [ ] **Step 2: Write the Sources/no-JS note**

Cover exactly:

```text
migration: giant hand-maintained bibliography -> canonical data/sources.json
browser finding: build-time content existed in Diplodoc hydration state, but disabled JS exposed an empty React root
constraint: one canonical source, no runtime fetch, no duplicate hand-maintained fallback content
solution: semantic noscript fallback only for hydration-state representation
boundary: page-local filter remains progressive enhancement; Diplodoc remains sole site-wide full-text search owner
lesson: build-time presence is not equivalent to user-readable static content
```

- [ ] **Step 3: Write the CI/evidence note**

Cover exactly:

```text
problem: green CI/release/PR can visually imply a broader product claim than it proves
evidence model: verified/stale/unverified + automated/manual modes + bounded scope
LivingWorld example: green CI + merged milestone do not prove human two-client microphone/spatial-audio acceptance
NODE ZERO example: accepted foundation evidence does not verify a newer player/vertical-slice milestone, so state can be stale
artifact example: component stylesheet existed but generated <base href> semantics broke its effective URL; integrity caught the artifact regression
lesson: verification is a claim with scope and freshness, not a badge color
```

- [ ] **Step 4: Commit narrative sources**

Commit message:

```text
content: add grounded engineering incident notes
```

---

### Task 3: Wire canonical metadata, relations, navigation, and SEO

**Files:**
- Modify: `data/notes.json`
- Modify: `docs/landing/notes.md`
- Modify: `docs/toc.yaml`
- Modify: `data/page-meta.json`

**Interfaces:**
- Consumes: the three Markdown slugs from Task 2.
- Produces: canonical metadata/related graph, Notes hub entries, Diplodoc discovery/search/sitemap routes, and page-specific SEO/OpenGraph metadata.

- [ ] **Step 1: Extend `data/notes.json`**

Append entries in narrative sequence:

```json
{
  "slug": "intersection-observer-giant-table",
  "title": "Как IntersectionObserver спрятал огромную таблицу",
  "description": "Разбор реальной UI-регрессии: почему reveal-анимация с threshold 0.08 не срабатывала на очень высокой bibliography table и как этот баг привёл к более сильной архитектуре.",
  "published": "2026-07-22",
  "updated": "2026-07-22",
  "readingMinutes": 6,
  "tags": ["Browser", "IntersectionObserver", "Regression", "UI"],
  "related": ["static-site-quality-gates", "static-first-sources-no-js"]
}
```

```json
{
  "slug": "static-first-sources-no-js",
  "title": "Почему build-time data недостаточно без no-JS representation",
  "description": "Как migration Sources Registry обнаружила пустой React root без JavaScript и почему semantic fallback стал частью static-first architecture.",
  "published": "2026-07-22",
  "updated": "2026-07-22",
  "readingMinutes": 7,
  "tags": ["Static-first", "No-JS", "Diplodoc", "Architecture"],
  "related": ["portfolio-runtime-boundary", "static-site-quality-gates", "intersection-observer-giant-table"]
}
```

```json
{
  "slug": "green-ci-is-not-product-verification",
  "title": "Почему green CI не означает verified product",
  "description": "Как Project Evidence Layer разделил automated и manual proof, bounded scope и freshness, чтобы зелёный pipeline не превращался в слишком широкий product claim.",
  "published": "2026-07-22",
  "updated": "2026-07-22",
  "readingMinutes": 8,
  "tags": ["CI", "Evidence", "Reliability", "Verification"],
  "related": ["static-site-quality-gates"]
}
```

Update existing related arrays only where the reverse link is useful:

```text
portfolio-runtime-boundary -> add static-first-sources-no-js
static-site-quality-gates -> add all three new notes
```

- [ ] **Step 2: Update Notes hub**

Add concise first-person summaries and links for all three notes. Keep the hub editorial rather than registry-like.

- [ ] **Step 3: Update TOC**

Add three child items under Engineering Notes, using exact Markdown paths.

- [ ] **Step 4: Add `data/page-meta.json` entries**

Add unique card IDs and concise metadata for all three generated HTML paths:

```text
landing/notes/intersection-observer-giant-table.html
landing/notes/static-first-sources-no-js.html
landing/notes/green-ci-is-not-product-verification.html
```

- [ ] **Step 5: Run unit/build verification**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: all PASS; the Task 1 contract is GREEN and generated site integrity finds no missing note route/local reference.

- [ ] **Step 6: Commit integration**

Commit message:

```text
feat: publish grounded Engineering Notes milestone
```

---

### Task 4: Verify the complete PR candidate

**Files:**
- No source changes expected unless verification reveals a real defect.

**Interfaces:**
- Consumes: complete feature branch.
- Produces: exact-head CI evidence suitable for merge decision.

- [ ] **Step 1: Open a pull request against `master`**

Title:

```text
feat: publish grounded Engineering Notes milestone
```

PR body must enumerate the three incidents, metadata/search/feed/SEO integration, and explicitly state that no runtime architecture was added.

- [ ] **Step 2: Verify complete GitHub Actions matrix**

Require green results for configured tests/build/integrity/browser/accessibility/search/metadata/visual gates.

- [ ] **Step 3: Inspect PR diff for scope**

Confirm no `PROJECT_STATE.md`/`ROADMAP.md` completion claim was added before merge and no unrelated refactor is present.

- [ ] **Step 4: Merge only after exact-head verification**

Use the repository’s normal squash merge pattern.

- [ ] **Step 5: Follow with continuity sync**

After merge, update `PROJECT_STATE.md`, `ROADMAP.md`, and `CHANGELOG.md` in a separate docs follow-up using actual merge SHA and CI evidence. Move next priority to P0.6 Content Freshness Guard.
