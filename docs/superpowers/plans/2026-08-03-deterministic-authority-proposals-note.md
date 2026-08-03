# Deterministic Authority Around Probabilistic Proposals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a grounded Engineering Note that maps Vlezet and VillAIgence evidence to one deterministic authority pipeline without promoting Draft evidence or adding runtime complexity.

**Architecture:** The existing static Notes platform remains the only delivery mechanism. One permanent Node test defines the content and integration contract before the registry/article/index surfaces exist. The final Markdown Note uses accepted Vlezet M7.8B and merged VillAIgence server-authority evidence, while labeling Vlezet M7.8C PR #42 as Draft awaiting product-owner retest.

**Tech Stack:** Node.js test runner, JSON registries, Markdown, YAML TOC, Diplodoc build/post-processing, Atom feed, generated local search, GitHub Actions browser-quality matrix.

## Global Constraints

- Canonical slug: `probabilistic-proposals-deterministic-authority`.
- Working title: `AI может предложить, но не применить: как строить deterministic authority`.
- Vlezet PR #41 is accepted evidence; PR #42 remains Draft / not product-accepted.
- AI cannot create, move, resize, thicken or re-host Vlezet geometry.
- VillAIgence identities and current state are resolved server-side.
- Stale revision must produce conflict without mutation.
- No generic or universal AI-safety claim.
- No new schema, renderer, CSS, browser runtime, backend, API, analytics event or search engine.
- Diplodoc remains the sole site-wide full-text search owner.
- Full existing quality gates remain unchanged.

---

### Task 1: Add the RED content contract

**Files:**
- Create: `scripts/deterministic-authority-note.test.js`

**Interfaces:**
- Consumes: repository files through `node:fs` and `node:path`.
- Produces: permanent assertions for registry, article, index, TOC and page metadata surfaces.

- [ ] **Step 1: Create a failing Node test**

The test must load:

```js
const notes = JSON.parse(readFileSync('data/notes.json', 'utf8'));
const article = readFileSync('docs/landing/notes/probabilistic-proposals-deterministic-authority.md', 'utf8');
const index = readFileSync('docs/landing/notes.md', 'utf8');
const toc = readFileSync('docs/toc.yaml', 'utf8');
const pageMeta = JSON.parse(readFileSync('data/page-meta.json', 'utf8'));
```

Required assertions:

```js
assert.equal(note.title, 'AI может предложить, но не применить: как строить deterministic authority');
assert.equal(note.published, '2026-08-03');
assert.match(article, /Vlezet[\s\S]*PR #41[\s\S]*(accepted|принят)/i);
assert.match(article, /PR #42[\s\S]*(Draft|не принят|ожидает)/i);
assert.match(article, /(immutable|неизменяем).*(ID|геометр)/i);
assert.match(article, /explicit Apply|явн.*Apply/i);
assert.match(article, /server[- ]side|сервер.*разреш/i);
assert.match(article, /(SHA-256|revision).*(CONFLICT|конфликт)/i);
assert.match(article, /current.*state|актуальн.*состояни/i);
assert.match(article, /APPLY[\s\S]*CONFLICT[\s\S]*(REJECT|INVALID)[\s\S]*UNCHANGED/i);
assert.match(article, /не.*универсальн.*AI[- ]safety|не.*гарант/i);
```

The test must also require the slug in Notes index, TOC and page metadata.

- [ ] **Step 2: Commit the RED test before content**

Commit message:

```text
test: define deterministic authority note contract
```

- [ ] **Step 3: Open a Draft PR and capture expected RED**

Expected result:

```text
all pre-existing tests PASS
new deterministic-authority assertions FAIL
reason: missing registry, article, index/TOC/page-meta surfaces
```

Record Build, CodeQL and Dependency Review identifiers in the PR body and durable docs later.

---

### Task 2: Publish the canonical Note content

**Files:**
- Create: `docs/landing/notes/probabilistic-proposals-deterministic-authority.md`

**Interfaces:**
- Consumes: exact public evidence URLs for Vlezet PR #41/#42 and VillAIgence PR #85/#103/#104 where relevant.
- Produces: canonical Russian article indexed by Diplodoc.

- [ ] **Step 1: Write the opening thesis**

Use this exact core statement:

```text
Вероятностная система может предложить интерпретацию, решение или набор кандидатов. Авторитетное состояние продукта меняется только после детерминированной проверки идентичности, границ, политики и актуального состояния.
```

- [ ] **Step 2: Explain the seven-stage pipeline**

Include:

```text
proposal
→ known identity binding
→ shape/bounds validation
→ product-policy authorization
→ current-state revalidation
→ APPLY / CONFLICT / REJECT / UNCHANGED
→ atomic authoritative mutation
```

Explain that parseability, plausibility and confidence are evidence, not authority.

- [ ] **Step 3: Add the accepted Vlezet M7.8B case**

Required facts:

- PR #41 accepted with known precision limitations;
- `27 local / 19 AI-confirmed / 8 review`;
- exact IDs and coordinates sent to AI;
- unknown IDs, moved geometry and cloud-only walls rejected;
- no document mutation before explicit Apply;
- zero stale decisions in accepted benchmark;
- missing geometry cannot be invented by the provider.

- [ ] **Step 4: Add the bounded Vlezet M7.8C Draft sidebar**

State explicitly:

```text
PR #42 is a Draft awaiting product-owner retest and is not an accepted public milestone.
```

Allowed observations:

- strict-ID, geometry-immutable verification;
- active vs diagnostic geometry;
- blocked candidates excluded from topology and Apply;
- automated gates pass, same real-plan retest pending.

- [ ] **Step 5: Add the VillAIgence server-authority case**

Required facts from PR #85:

- permission level checked server-side;
- WORLD/PLAYER/VILLAGER/VILLAGE identities derived from authenticated/live server state;
- arbitrary UUID/dimension/village identities absent from request;
- payload bounds and canonicalization fail closed;
- requested revision compared with current SHA-256 revision;
- stale writes return `CONFLICT` with current canonical state;
- replay returns `UNCHANGED`;
- persistent mutation occurs only on `APPLY`.

- [ ] **Step 6: Add failure and ambiguity semantics**

Explain why these are valid product outcomes:

```text
PENDING
DIAGNOSTIC
REJECT / INVALID
CONFLICT
UNCHANGED
```

A product does not have to guess merely because an AI/provider returned a syntactically valid response.

- [ ] **Step 7: Add claim boundaries and sources**

The ending must state:

- M7.8C is not accepted;
- arbitrary-plan accuracy is not claimed;
- VillAIgence real-provider/multiplayer cumulative acceptance remains separate;
- this is not a universal AI-safety guarantee.

Use stable GitHub PR links rather than transient workflow URLs as article sources.

---

### Task 3: Integrate the Note with canonical static surfaces

**Files:**
- Modify: `data/notes.json`
- Modify: `docs/landing/notes.md`
- Modify: `docs/toc.yaml`
- Modify: `data/page-meta.json`
- Modify: `scripts/notes-content.test.js`

**Interfaces:**
- Consumes: canonical slug and Markdown file from Task 2.
- Produces: manifest-owned metadata/navigation/feed and Diplodoc discovery/search.

- [ ] **Step 1: Add the registry record**

Append:

```json
{
  "slug": "probabilistic-proposals-deterministic-authority",
  "title": "AI может предложить, но не применить: как строить deterministic authority",
  "description": "Два практических кейса — Vlezet и VillAIgence — о том, как immutable identities, deterministic validation, current-state revalidation и explicit Apply отделяют probabilistic proposal от authoritative mutation.",
  "published": "2026-08-03",
  "updated": "2026-08-03",
  "readingMinutes": 12,
  "tags": ["AI", "Authority", "Validation", "Reliability"],
  "related": [
    "server-authoritative-ai-npcs",
    "green-ci-is-not-product-verification",
    "source-tests-to-installed-acceptance"
  ]
}
```

- [ ] **Step 2: Add the Notes index entry**

Place it in the AI/architecture or reliability section following the existing index style. Link to:

```text
notes/probabilistic-proposals-deterministic-authority.md
```

- [ ] **Step 3: Add TOC discovery**

Add the Note beside the other Engineering Notes using the existing nested TOC structure.

- [ ] **Step 4: Add page metadata/OpenGraph**

Use:

```json
{
  "path": "landing/notes/probabilistic-proposals-deterministic-authority.html",
  "card": "note-deterministic-authority",
  "title": "AI может предложить, но не применить: как строить deterministic authority",
  "description": "Vlezet and VillAIgence case study: immutable proposal identities, deterministic validation, current-state revalidation and atomic authoritative mutation.",
  "displayTitle": "DETERMINISTIC AUTHORITY",
  "kicker": "ENGINEERING NOTE",
  "tags": ["AI", "AUTHORITY", "VALIDATION"],
  "accent": "violet"
}
```

- [ ] **Step 5: Extend the canonical grounded-note invariant**

Update `scripts/notes-content.test.js` so the new slug is required alongside existing grounded milestones without removing prior entries.

- [ ] **Step 6: Run unit tests**

Expected:

```text
all tests PASS
new contract PASS
```

---

### Task 4: Verify generated feed, navigation and search

**Files:**
- Generated: `docs-html/landing/notes/probabilistic-proposals-deterministic-authority.html`
- Generated: `docs-html/feed.xml`
- Generated: `docs-html/_search/ru/index.html`

**Interfaces:**
- Consumes: canonical registry, TOC and Markdown source.
- Produces: generated article, feed entry and searchable index.

- [ ] **Step 1: Run the production build**

Run the repository production build exactly as configured in package scripts.

- [ ] **Step 2: Verify Note metadata/navigation**

Generated page must contain:

- reading time and dates;
- previous/next or related links from the registry;
- canonical metadata/OpenGraph identity;
- no duplicate page shell.

- [ ] **Step 3: Verify Atom feed**

`feed.xml` must contain the new title and canonical Note URL exactly once.

- [ ] **Step 4: Verify generated search**

The Note must be discoverable by:

```text
deterministic authority
explicit Apply
CONFLICT
Vlezet
VillAIgence
```

Do not add a second search engine or runtime index.

---

### Task 5: Synchronize durable state and run final gates

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: RED evidence, final implementation head and exact CI identifiers.
- Produces: durable P2.4j snapshot and P2.4k next milestone.

- [ ] **Step 1: Record P2.4j as in progress**

Include:

- selected design;
- accepted Vlezet #41 vs Draft #42 boundary;
- VillAIgence PR #85 server-authority evidence;
- RED head and exact expected failures;
- no runtime/schema/UI change;
- next milestone P2.4k.

- [ ] **Step 2: Run final exact-head matrix**

Require:

```text
Build — SUCCESS
CodeQL — SUCCESS
Dependency Review — SUCCESS
all unit tests PASS
Lighthouse budgets preserved
browser/accessibility/search/visual/custom-domain matrix PASS
```

- [ ] **Step 3: Update PR body**

Record exact head, run IDs, test count, Lighthouse scores, artifact ID/digest/retention and claim boundaries.

- [ ] **Step 4: Review scope**

Expected changed files:

```text
data/notes.json
data/page-meta.json
docs/CHANGELOG.md
docs/PROJECT_STATE.md
docs/ROADMAP.md
docs/landing/notes.md
docs/landing/notes/probabilistic-proposals-deterministic-authority.md
docs/superpowers/plans/2026-08-03-deterministic-authority-proposals-note.md
docs/superpowers/specs/2026-08-03-deterministic-authority-proposals-note-design.md
docs/toc.yaml
scripts/deterministic-authority-note.test.js
scripts/notes-content.test.js
```

- [ ] **Step 5: Squash merge with expected-head protection**

Use one content merge commit. Do not close issue #78 or #82 in this PR.

- [ ] **Step 6: Perform docs-only continuity sync**

After feature merge, record:

- feature PR and squash SHA;
- final exact-head evidence;
- P2.4j DONE;
- P2.4k restart/persistence Note as NEXT.

Run the continuity PR's own full exact-head matrix before merge.
