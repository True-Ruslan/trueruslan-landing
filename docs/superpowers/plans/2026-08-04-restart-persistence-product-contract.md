# Restart and Persistence Product Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a grounded Engineering Note that distinguishes byte durability, structural readability, semantic continuity and user-visible behavioral continuity across restart.

**Architecture:** Extend the existing static Notes platform only. A canonical registry record owns metadata, one Markdown source owns the narrative, existing generators own navigation/feed/search, and permanent Node/browser contracts enforce evidence and discovery boundaries.

**Tech Stack:** JSON registries, Markdown/Diplodoc, Node.js `node:test`, Playwright Chromium search smoke, existing GitHub Actions quality matrix.

## Global Constraints

- Static-first, build-time intelligence and progressive enhancement remain unchanged.
- Diplodoc remains the only site-wide full-text search owner.
- No new schema, renderer, CSS, runtime, backend, API, analytics event or search engine.
- Equal SHA-256 values prove byte continuity only; they do not prove complete semantic correctness.
- PR #104 remains automated no-mutation production-JAR restart evidence, not cumulative installed acceptance.
- Intentional writes may legitimately change hashes; unchanged-hash assertions apply only to no-mutation or rollback scenarios.
- Existing issue #78 and #82 ownership is unchanged.

---

### Task 1: Add the RED content and discovery contract

**Files:**
- Create: `scripts/restart-persistence-note.test.js`

**Interfaces:**
- Consumes: existing `data/notes.json`, Markdown, Notes index, TOC and page metadata conventions.
- Produces: permanent `node:test` contract for registry identity, evidence boundaries and static discovery.

- [ ] **Step 1: Create the failing test**

The test must define:

```js
const SLUG = 'restart-persistence-is-a-product-contract';
const TITLE = 'Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence';
```

Registry assertions:

- note exists;
- title/date/tags match the spec;
- related Notes include `source-tests-to-installed-acceptance` and `green-ci-is-not-product-verification`.

Article assertions require:

```text
PR #66
PR #67
PR #103
PR #104
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
SHA-256
controlled shutdown
rollback
schema
migration
semantic continuity
behavioral continuity
```

The test must reject broad claims matching:

```regex
/хеши доказывают полную корректность|полностью исключает потерю данных|cumulative acceptance завершена/i
```

Discovery assertions require the slug in `docs/landing/notes.md`, `docs/toc.yaml` and `data/page-meta.json`.

- [ ] **Step 2: Commit RED only**

```text
message: test: define restart persistence note contract
```

- [ ] **Step 3: Open a Draft PR and verify RED**

Expected unit result:

```text
all pre-existing tests PASS
new registry/article/discovery tests FAIL
```

Record exact RED head and Build/CodeQL/Dependency Review evidence in the Draft PR body.

---

### Task 2: Add the canonical Note registry record

**Files:**
- Modify: `data/notes.json`

**Interfaces:**
- Consumes: existing Note schema.
- Produces: canonical metadata used by Notes index enhancements, navigation and Atom feed generation.

- [ ] **Step 1: Append the record**

```json
{
  "slug": "restart-persistence-is-a-product-contract",
  "title": "Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence",
  "description": "Практический разбор VillAIgence: почему сохранённые bytes и совпадающие hashes ещё нужно дополнить controlled shutdown, exact-artifact restart, read-back, identity/isolation и user-visible continuity.",
  "published": "2026-08-04",
  "updated": "2026-08-04",
  "readingMinutes": 12,
  "tags": ["Persistence", "Reliability", "Recovery", "Acceptance"],
  "related": [
    "source-tests-to-installed-acceptance",
    "green-ci-is-not-product-verification",
    "probabilistic-proposals-deterministic-authority"
  ]
}
```

- [ ] **Step 2: Run unit tests**

Expected: registry assertion passes; article/discovery assertions remain RED.

- [ ] **Step 3: Commit**

```text
message: content: register restart persistence note
```

---

### Task 3: Write the grounded article

**Files:**
- Create: `docs/landing/notes/restart-persistence-is-a-product-contract.md`

**Interfaces:**
- Consumes: evidence from VillAIgence PRs #66, #67, #92, #95, #102, #103 and #104.
- Produces: semantic no-JS article source for Diplodoc.

- [ ] **Step 1: Write the narrative**

Required structure:

1. File existence is the beginning, not the contract.
2. Four levels: storage, structural, semantic, behavioral continuity.
3. PR #66: UUID/sourceEventIds, decay ordering and Basiliso/Casimiro isolation.
4. PR #67: six hashes plus Pio/Justino recall and controlled failure isolation.
5. Startup failures/rollback: persistence includes recovery and refusal to run downstream acceptance.
6. PR #103: UUID/name/inventory round trip as semantic persistence.
7. PR #104: two independent JVMs, clean stop/save, exactly one valid JSON per canonical store, stable path/hash.
8. Why equal hashes are insufficient.
9. Schema/migration/read-back contract.
10. A practical acceptance matrix and bounded conclusion.

Include this product pipeline:

```text
write
→ completed save
→ controlled shutdown
→ exact artifact restart
→ unique canonical discovery
→ parse and schema check
→ semantic identity/isolation check
→ user-visible continuity
```

Use stable evidence links to the cited PRs. Explicitly preserve automated/manual and GameTest/production-JAR boundaries.

- [ ] **Step 2: Run the focused test**

Expected: article assertions pass; discovery assertions remain RED.

- [ ] **Step 3: Commit**

```text
message: content: add restart persistence Engineering Note
```

---

### Task 4: Integrate Notes index, TOC and page metadata

**Files:**
- Modify: `docs/landing/notes.md`
- Modify: `docs/toc.yaml`
- Modify: `data/page-meta.json`

**Interfaces:**
- Consumes: canonical slug/title.
- Produces: visible Notes catalogue entry, navigation route and canonical metadata/OpenGraph identity.

- [ ] **Step 1: Add the Notes index card/link**

Follow the existing chronological format and place the new Note after the deterministic-authority Note.

- [ ] **Step 2: Add TOC entry**

Use:

```yaml
- name: Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence
  href: landing/notes/restart-persistence-is-a-product-contract.md
```

- [ ] **Step 3: Add page metadata**

Add the canonical HTML path and bounded title/description using the existing page-meta schema.

- [ ] **Step 4: Run all unit tests**

Expected: focused contract and all pre-existing tests PASS.

- [ ] **Step 5: Commit**

```text
message: content: expose restart persistence note
```

---

### Task 5: Strengthen generated search proof

**Files:**
- Modify: `scripts/villaigence-search-smoke.cjs`

**Interfaces:**
- Consumes: generated Diplodoc search UI and canonical Note route.
- Produces: exact browser proof that query `persistence contract` returns `landing/notes/restart-persistence-is-a-product-contract`.

- [ ] **Step 1: Add a second Note query case**

Preserve existing VillAIgence and deterministic-authority checks. Add:

```js
{
  query: 'persistence contract',
  route: 'landing/notes/restart-persistence-is-a-product-contract',
  marker: 'Restart',
}
```

Wait for the exact route and reject invented/duplicate routes.

- [ ] **Step 2: Commit**

```text
message: test: verify restart persistence note search route
```

- [ ] **Step 3: Run the complete PR matrix**

Require:

- unit tests;
- production build and generated integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications/Sources/Evidence/diagram/Photo/portfolio smoke;
- Firefox/WebKit;
- generic and exact Note search;
- RU/EN;
- analytics;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- custom-domain artifact;
- CodeQL and Dependency Review.

Record exact head, run IDs, artifact ID/digest and retention.

---

### Task 6: Synchronize durable project state

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: final exact-head GREEN evidence.
- Produces: durable project handoff that marks P2.4k complete only after verified merge evidence exists.

- [ ] **Step 1: Record P2.4k evidence and boundaries**

Include:

- title and canonical route;
- RED head and expected failure scope;
- final exact feature head and complete matrix;
- byte/structural/semantic/behavioral model;
- PR #104 cumulative-acceptance boundary;
- issue #78/#82 status unchanged;
- production Pages deployment as separate operational fact.

- [ ] **Step 2: Select the next evidence-backed milestone**

Prefer operational closure before another content Note:

1. fresh Content Freshness Guard and issue #78 reconciliation;
2. exact `npm audit --json` triage for issue #82;
3. production Pages/live Note route verification where tooling permits;
4. genuine Photo Story only when authentic material exists.

- [ ] **Step 3: Run the complete matrix on the durable-doc head**

Require all checks from Task 5 again.

- [ ] **Step 4: Commit**

```text
message: docs: record restart persistence milestone
```

---

### Task 7: Review, merge and continuity sync

**Files:**
- Review all changed files.
- Create a documentation-only continuity branch after feature squash if the final master SHA is not yet recorded.

**Interfaces:**
- Consumes: exact-head GREEN feature PR.
- Produces: clean `master`, no open feature PR, final durable squash evidence.

- [ ] **Step 1: Review scope**

Confirm only expected registry/article/index/TOC/meta/test/spec/plan/durable files changed. Confirm no review threads or requested changes remain.

- [ ] **Step 2: Mark Draft PR ready and squash merge with expected-head protection**

Record the resulting master SHA.

- [ ] **Step 3: Create docs-only continuity PR if needed**

Change exactly `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`; record feature squash and final state without product changes.

- [ ] **Step 4: Run the complete continuity matrix and squash merge**

- [ ] **Step 5: Final hygiene**

Confirm:

- only `master` remains;
- no open PRs;
- issue #78 remains open unless a fresh guard run is clean;
- issue #82 remains open until exact advisory/path triage and compatible remediation evidence exist;
- production deployment is not inferred from PR CI.

## Plan self-review

- Spec coverage: every design requirement maps to Tasks 1–7.
- Placeholder scan: no TODO/TBD or deferred implementation instruction.
- Interface consistency: slug/title/query/canonical route are identical across tasks.
- TDD: production content starts only after a clean, observed RED contract.
