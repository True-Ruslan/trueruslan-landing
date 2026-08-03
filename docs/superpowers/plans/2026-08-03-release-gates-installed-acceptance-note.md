# Release Gates and Installed Acceptance Engineering Note Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a grounded Engineering Note that explains what source, package, GameTest, production-JAR startup/restart and cumulative acceptance gates each prove, using VillAIgence `0.1.20`–`0.1.23` evidence.

**Architecture:** Extend the existing static Notes platform through its canonical JSON manifest and Markdown sources. Existing build-time generators will own metadata injection, previous/next/related navigation, Atom feed and Diplodoc search; no renderer or runtime changes are required.

**Tech Stack:** Node.js 24 test runner, JSON manifests, Markdown/Diplodoc, existing Notes build-time generator, GitHub Actions quality matrix.

## Global Constraints

- Canonical slug: `source-tests-to-installed-acceptance`.
- Canonical title: `От source tests к installed acceptance: что доказывает каждый release gate`.
- Published and updated date: `2026-08-03`.
- The article is Russian-only for this milestone.
- VillAIgence remains `release-candidate`; cumulative installed acceptance remains pending.
- PR #103 GameTests and PR #104 production-JAR acceptance must remain separate evidence layers.
- No new schema, renderer, CSS, browser runtime, backend, API, analytics event or search engine.
- No invented reliability, latency, adoption or failure-rate metrics.
- Existing `green-ci-is-not-product-verification` content is not rewritten.

---

### Task 1: Add the RED content contract

**Files:**
- Create: `scripts/release-gates-note.test.js`

**Interfaces:**
- Consumes: `data/notes.json`, `data/page-meta.json`, `docs/landing/notes.md`, `docs/toc.yaml` and the future Markdown source.
- Produces: a permanent repository contract for the Note’s identity, required evidence layers and bounded claim semantics.

- [ ] **Step 1: Create a failing Node test**

Create `scripts/release-gates-note.test.js` with tests that:

```js
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'source-tests-to-installed-acceptance';
const TITLE = 'От source tests к installed acceptance: что доказывает каждый release gate';
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('release-gates note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);
  assert.ok(note, 'missing release-gates Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-03');
  assert.equal(note.updated, '2026-08-03');
  assert.ok(note.tags.includes('Release Engineering'));
  assert.ok(note.related.includes('green-ci-is-not-product-verification'));
});

test('release-gates note distinguishes every acceptance layer', () => {
  const source = read('docs', 'landing', 'notes', `${SLUG}.md`);
  for (const marker of [
    '0.1.20+1.21.1',
    '0.1.21+1.21.1',
    'PR #103',
    'PR #104',
    'source tests',
    'GameTests',
    'production JAR',
    'два отдельных JVM',
    'memory.json',
    'operator-lore.json',
    'cumulative acceptance',
    'rollback',
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(source, /не доказывает/i);
  assert.match(source, /оста[её]тся pending/i);
  assert.doesNotMatch(source, /полностью проверен(?:а|о|ы)?/i);
});

test('release-gates note is exposed through index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));
  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  assert.ok(pageMeta.some((entry) => entry.path === `landing/notes/${SLUG}.html`));
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test scripts/release-gates-note.test.js
```

Expected: FAIL because the new manifest entry and Markdown source do not exist.

- [ ] **Step 3: Commit the RED contract**

```bash
git add scripts/release-gates-note.test.js
git commit -m "test: define installed acceptance note contract"
```

---

### Task 2: Write the grounded article

**Files:**
- Create: `docs/landing/notes/source-tests-to-installed-acceptance.md`

**Interfaces:**
- Consumes: accepted VillAIgence PR #98–#104 evidence and the design’s public claim boundary.
- Produces: canonical article content consumed by Diplodoc, search and Note enhancement.

- [ ] **Step 1: Write the article with the approved structure**

The Markdown must contain:

```markdown
# От source tests к installed acceptance: что доказывает каждый release gate
```

Required sections:

```markdown
## Один зелёный статус скрывает разные вопросы
## Source tests: доказательство логики в контролируемой среде
## Build и package: собрался ли распространяемый artifact
## Exact identity: совпадает ли JAR с именем release
## Installed startup: загрузится ли production JAR вообще
## Rollback как успешный результат acceptance
## GameTests: integration evidence, но не production lifecycle
## Production-JAR restart: что добавил отдельный JVM boundary
## Что всё ещё остаётся за пределами автоматизации
## Как я теперь строю release gates
## Evidence
```

The article must state the following exact evidence:

- `0.1.20+1.21.1` was a partial PASS with water, filled-grave, snapshot identity and approximately 272-second Chat defects;
- PR #99 fixed the broad water path-position hook while installed water acceptance remained pending;
- PR #100 preserved a portable filled grave while installed grave acceptance remained pending;
- PR #101 enforced filename/Fabric manifest/Implementation-Version identity while installed startup remained pending;
- `0.1.21+1.21.1` failed at startup because `MixinTombstoneBlock` could not resolve the remapped `getDrops` target;
- rollback restored `0.1.20`, server service and six matching persistent hashes;
- PR #102 removed the unsafe Mixin and wired the owned source directly;
- PR #103 added a 28-scenario catalogue and seven GameTests but explicitly did not prove production-JAR startup/restart;
- PR #104 ran the exact remapped candidate outside Loom/dev classpath in two separate JVMs, required ready/stop/save/exit-0, and preserved paths and hashes for `memory.json`, `memory2.json`, `semantic-memory.json`, `relationships.json`, `voices.json`, `operator-lore.json`;
- real Text/STT/Chat/TTS, Voice Chat, logical two-client conflict, focused live water/grave and product-owner cumulative acceptance remain pending.

- [ ] **Step 2: Add stable evidence links**

The `Evidence` section must link to:

```text
https://github.com/True-Ruslan/villAIgence/pull/98
https://github.com/True-Ruslan/villAIgence/pull/99
https://github.com/True-Ruslan/villAIgence/pull/100
https://github.com/True-Ruslan/villAIgence/pull/101
https://github.com/True-Ruslan/villAIgence/pull/102
https://github.com/True-Ruslan/villAIgence/pull/103
https://github.com/True-Ruslan/villAIgence/pull/104
https://github.com/True-Ruslan/villAIgence/blob/1.21.1/docs/livingworld/VALIDATION_0.1.22_TOMBSTONE_STARTUP_FIX.md
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
node --test scripts/release-gates-note.test.js
```

Expected: still FAIL only on registry/index/TOC/page metadata integration, not article evidence markers.

- [ ] **Step 4: Commit the article**

```bash
git add docs/landing/notes/source-tests-to-installed-acceptance.md
git commit -m "content: write installed acceptance engineering note"
```

---

### Task 3: Register the Note across static surfaces

**Files:**
- Modify: `data/notes.json`
- Modify: `docs/landing/notes.md`
- Modify: `docs/toc.yaml`
- Modify: `data/page-meta.json`
- Modify: `scripts/notes-content.test.js`

**Interfaces:**
- Consumes: canonical article slug/title and existing Note generator conventions.
- Produces: Note metadata, index/TOC discovery, Atom feed entry, previous/next/related navigation, search document and OpenGraph metadata.

- [ ] **Step 1: Append the canonical manifest entry**

Append to `data/notes.json`:

```json
{
  "slug": "source-tests-to-installed-acceptance",
  "title": "От source tests к installed acceptance: что доказывает каждый release gate",
  "description": "Практическая ретроспектива VillAIgence: чем отличаются source tests, package identity, GameTests, exact production-JAR startup/restart, rollback и cumulative installed acceptance.",
  "published": "2026-08-03",
  "updated": "2026-08-03",
  "readingMinutes": 11,
  "tags": ["Release Engineering", "CI", "Acceptance", "Reliability"],
  "related": [
    "green-ci-is-not-product-verification",
    "static-site-quality-gates",
    "server-authoritative-ai-npcs"
  ]
}
```

- [ ] **Step 2: Add the Note to the Reliability index section**

In `docs/landing/notes.md`, immediately after the green-CI Note, add a heading, a bounded description and:

```markdown
[Читать заметку →](notes/source-tests-to-installed-acceptance.md)
```

- [ ] **Step 3: Add the TOC entry**

Under Engineering Notes in `docs/toc.yaml`, add:

```yaml
- name: Source tests → installed acceptance
  href: ./landing/notes/source-tests-to-installed-acceptance.md
```

- [ ] **Step 4: Add page metadata**

Append before the English entries in `data/page-meta.json`:

```json
{
  "path": "landing/notes/source-tests-to-installed-acceptance.html",
  "card": "note-installed-acceptance",
  "title": "От source tests к installed acceptance: что доказывает каждый release gate",
  "description": "VillAIgence release-engineering case study: source tests, package identity, GameTests, exact production-JAR startup/restart, rollback and bounded cumulative acceptance.",
  "displayTitle": "INSTALLED ACCEPTANCE",
  "kicker": "ENGINEERING NOTE",
  "tags": ["RELEASE ENGINEERING", "CI", "RELIABILITY"],
  "accent": "green"
}
```

- [ ] **Step 5: Extend the canonical grounded-Notes test**

Add `source-tests-to-installed-acceptance` to `requiredGroundedNotes` in `scripts/notes-content.test.js`.

- [ ] **Step 6: Run the focused and complete unit suites**

Run:

```bash
node --test scripts/release-gates-note.test.js
npm test
```

Expected: PASS with zero failures.

- [ ] **Step 7: Commit static integration**

```bash
git add data/notes.json data/page-meta.json docs/landing/notes.md docs/toc.yaml scripts/notes-content.test.js
git commit -m "feat: publish installed acceptance note"
```

---

### Task 4: Verify generated artifacts and browser contracts

**Files:**
- Modify only if a real stale contract is discovered: focused existing test or browser scenario file.

**Interfaces:**
- Consumes: the complete static Note implementation.
- Produces: generated HTML, feed, search and browser evidence without new production code.

- [ ] **Step 1: Build the production documentation artifact**

Run:

```bash
npm run build:docs
```

Expected: exit 0 and generated `docs-html/landing/notes/source-tests-to-installed-acceptance.html` plus `docs-html/feed.xml`.

- [ ] **Step 2: Run generated-site integrity**

Run:

```bash
npm run check:site
```

Expected: exit 0.

- [ ] **Step 3: Verify generated Note, feed and search content**

Check that:

```text
docs-html/landing/notes/source-tests-to-installed-acceptance.html
```

contains `.tr-note-meta`, `.tr-note-nav`, the canonical title and `PR #104`;

```text
docs-html/feed.xml
```

contains the Note URL and escaped title;

and generated search artifacts contain both `installed acceptance` and `production JAR` terms.

- [ ] **Step 4: Fix only exact stale contracts**

If an existing test assumes seven Notes, an older last-note navigation target or a fixed feed order, update that test to derive the expectation from `data/notes.json`. Do not change renderer/CSS/visual baselines unless the generated artifact exposes a real regression.

- [ ] **Step 5: Commit any contract-only corrections**

```bash
git add scripts data docs

git commit -m "test: align note quality contracts"
```

Skip the commit if no correction is needed.

---

### Task 5: Synchronize durable milestone state

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: exact feature head and final CI evidence.
- Produces: durable handoff for the next session.

- [ ] **Step 1: Record the new content milestone as in progress**

Before PR merge, update durable documents to state:

- the installed-acceptance Note is the active milestone;
- the Note’s bounded subject and non-goals;
- exact RED evidence;
- exact GREEN evidence once available;
- next content milestone: deterministic authority around LLM/CV proposals;
- issue #78 freshness and issue #82 upstream dependency boundaries remain separate maintenance facts.

- [ ] **Step 2: Run the full unit/build/integrity suite again**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: all commands exit 0.

- [ ] **Step 3: Commit durable state**

```bash
git add docs/PROJECT_STATE.md docs/ROADMAP.md docs/CHANGELOG.md
git commit -m "docs: record installed acceptance note milestone"
```

---

### Task 6: Open and complete the pull request

**Files:**
- No new source files unless exact-head CI identifies a real defect.

**Interfaces:**
- Consumes: verified branch head.
- Produces: merged milestone and CI evidence.

- [ ] **Step 1: Open a draft PR against `master`**

Title:

```text
content: publish installed acceptance release-gates note
```

The PR body must include scope, evidence sources, TDD RED, non-goals and the explicit cumulative-acceptance boundary.

- [ ] **Step 2: Wait for exact-head Build, CodeQL and Dependency Review**

Required outcomes:

```text
Build: SUCCESS
CodeQL: SUCCESS
Dependency Review: SUCCESS
unit tests: 0 failures
full browser/accessibility/search/visual/custom-domain matrix: SUCCESS
```

- [ ] **Step 3: Correct real defects or stale contracts through focused commits**

Do not weaken quality gates, remove assertions or broaden public claims to make CI pass.

- [ ] **Step 4: Update the PR body with final evidence**

Record exact head SHA, workflow IDs, test count, Lighthouse scores and quality artifact digest.

- [ ] **Step 5: Mark ready and squash merge with expected-head protection**

Use the final verified SHA as `expected_head_sha`.

- [ ] **Step 6: Create a documentation-only continuity sync only if the final squash SHA cannot be recorded without self-reference**

The continuity PR must change durable docs only and pass its own exact-head matrix.
