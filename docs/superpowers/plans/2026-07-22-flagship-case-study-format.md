# P1.3 Stronger Flagship Case-Study Format Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure LivingWorld and NODE ZERO into a shared seven-part engineering narrative while preserving Project Registry, timeline and Project Evidence as canonical structured sources of truth.

**Architecture:** Keep ordinary Diplodoc Markdown as the narrative authoring layer. Add one focused source contract test that validates stable section markers and generated-content placeholders; do not add a new case-study registry, renderer, CMS-like schema, frontend framework or runtime code.

**Tech Stack:** Markdown, Node.js 24+, native `node:test`, existing Diplodoc build/post-processing, existing browser/Axe/Lighthouse/cross-browser/visual quality matrix.

## Global Constraints

- Controlled flagship slugs are exactly `livingworld` and `node-zero`.
- Narrative section order is exactly: `problem`, `constraints`, `decisions`, `failures`, `current-state`, `evidence`, `retrospective`.
- `data/projects.json` remains canonical for project identity/status/summary/links/tags.
- `data/project-history/*.json` remains canonical for structured project evolution.
- `data/project-evidence.json` remains canonical for trust/current verification facts.
- Markdown remains canonical for authored reasoning, trade-offs, failures/false starts and retrospective lessons.
- Timeline and Project Evidence placeholders must remain exactly once on each controlled flagship page.
- No invented incidents, metrics, maturity claims or verification claims.
- No new case-study engine/CMS/schema/frontend framework.
- No CSS/build renderer changes by default.
- No visual baseline or quality-threshold weakening.

---

### Task 1: Add failing flagship narrative contract

**Files:**
- Create: `scripts/flagship-case-study.test.js`
- Read: `docs/landing/projects/livingworld.md`
- Read: `docs/landing/projects/node-zero.md`

**Interfaces:**
- Consumes: the two canonical Markdown pages.
- Produces: source-level invariants automatically executed by existing `npm test` (`node --test scripts/*.test.js`).

- [ ] **Step 1: Create the failing contract test**

Create `scripts/flagship-case-study.test.js`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_DIR = path.join(ROOT, 'docs', 'landing', 'projects');

const FLAGSHIPS = Object.freeze([
  {
    slug: 'livingworld',
    file: 'livingworld.md',
    timeline: 'livingworld',
    evidence: 'livingworld',
    diagram: '../../assets/diagrams/livingworld-architecture.svg',
  },
  {
    slug: 'node-zero',
    file: 'node-zero.md',
    timeline: 'node-zero',
    evidence: 'node-zero',
    diagram: '../../assets/diagrams/node-zero-architecture.svg',
  },
]);

const SECTION_MARKERS = Object.freeze([
  'problem',
  'constraints',
  'decisions',
  'failures',
  'current-state',
  'evidence',
  'retrospective',
]);

function count(text, token) {
  return text.split(token).length - 1;
}

for (const flagship of FLAGSHIPS) {
  test(`${flagship.slug} follows the flagship case-study narrative contract`, () => {
    const source = fs.readFileSync(path.join(PROJECT_DIR, flagship.file), 'utf8');

    let previousIndex = -1;
    for (const marker of SECTION_MARKERS) {
      const token = `<!-- case-study:${marker} -->`;
      assert.equal(count(source, token), 1, `${flagship.slug}: ${token} must appear exactly once`);
      const index = source.indexOf(token);
      assert.ok(index > previousIndex, `${flagship.slug}: ${token} is out of canonical order`);
      previousIndex = index;
    }

    const timeline = `<div data-tr-project-timeline="${flagship.timeline}"></div>`;
    const evidence = `<div data-tr-project-evidence="${flagship.evidence}"></div>`;
    assert.equal(count(source, timeline), 1, `${flagship.slug}: timeline placeholder must appear exactly once`);
    assert.equal(count(source, evidence), 1, `${flagship.slug}: evidence placeholder must appear exactly once`);
    assert.equal(count(source, flagship.diagram), 1, `${flagship.slug}: architecture diagram must remain exactly once`);
  });
}

test('controlled flagship set stays intentionally small', () => {
  assert.deepEqual(FLAGSHIPS.map(({slug}) => slug), ['livingworld', 'node-zero']);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test
```

Expected: FAIL in `flagship-case-study.test.js` because the current Markdown pages do not contain the seven `case-study:*` markers.

All unrelated existing unit tests should still pass before the new failing assertions terminate the suite result.

- [ ] **Step 3: Commit RED test**

Commit message:

```text
test: define flagship case-study narrative contract
```

---

### Task 2: Restructure LivingWorld as an engineering narrative

**Files:**
- Modify: `docs/landing/projects/livingworld.md`
- Test: `scripts/flagship-case-study.test.js`

**Interfaces:**
- Consumes: existing LivingWorld architecture diagram, timeline placeholder, evidence placeholder and repository-grounded material already present in the page/Engineering Note.
- Produces: one Markdown narrative satisfying the seven-marker contract without duplicating machine-like current/evidence facts.

- [ ] **Step 1: Keep intro, repository link, architecture diagram and timeline summary**

Preserve the page title, concise intro, public GitHub link, `livingworld-architecture.svg` and:

```html
<div data-tr-project-timeline="livingworld"></div>
```

The timeline remains before the seven-part deep narrative as a compact evolution overview.

- [ ] **Step 2: Write `problem` and `constraints` sections**

Insert:

```md
<!-- case-study:problem -->
## Проблема: AI-персонаж должен жить по правилам сервера
```

Explain that the original idea was direct text/voice conversation with MCA NPCs, but the real problem became ownership, context, memory, provider failure and action authority in a multiplayer world.

Insert:

```md
<!-- case-study:constraints -->
## Ограничения, которые определили архитектуру
```

Cover only grounded constraints:

- one player ↔ one NPC exclusive session ownership;
- voice packets are transport, not authorization;
- STT/LLM/TTS are external and partially degradable;
- async work can outlive a session unless explicitly cancelled;
- persistent memory must survive provider/prompt changes;
- LLM output must not directly mutate authoritative game state.

- [ ] **Step 3: Write `decisions` section around reasoning, not component inventory**

Insert:

```md
<!-- case-study:decisions -->
## Ключевые решения
```

Use subsections for:

- server-authoritative session ownership;
- text and voice converging into one normalized conversation core;
- provider pipeline with independent fallback boundaries;
- memory separated from prompt representation;
- LLM as proposal/intention source, never authority.

Keep the existing provider pipeline code block and request-lifecycle diagram where they best support these decisions.

- [ ] **Step 4: Write grounded `failures` section**

Insert:

```md
<!-- case-study:failures -->
## Что я сначала недооценил
```

Frame these as corrected assumptions/architectural lessons already documented publicly:

- connecting an LLM was not the hard center; session ownership/concurrency were;
- transcript-as-memory couples persistence to one prompt/provider shape;
- partial provider failure must degrade one capability rather than collapse the entire conversation;
- cancellation is ordinary control flow, not exceptional cleanup.

Do not claim a specific outage/incident unless already explicitly documented on the public page.

- [ ] **Step 5: Write `current-state` and `evidence` sections without duplicating canonical facts**

Insert:

```md
<!-- case-study:current-state -->
## Где проект находится сейчас
```

Describe the broad local release-candidate phase and remaining human/staging acceptance boundary without hard-coding version matrices, CI run IDs or trust labels.

Then insert:

```md
<!-- case-study:evidence -->
## Что подтверждено, а что ещё требует живой проверки

<div data-tr-project-evidence="livingworld"></div>
```

Keep the explanation that automated evidence is bounded and does not prove two-client/microphone/spatial-audio/staging acceptance.

- [ ] **Step 6: Write `retrospective` section**

Insert:

```md
<!-- case-study:retrospective -->
## Что бы я сделал иначе, начиная проект сегодня
```

Ground the retrospective in existing lessons:

- formalize session/cancellation state machine before provider integration;
- define degradation contracts before voice polish;
- establish persistent memory schema independently from prompt shape from day one;
- make manual acceptance gates explicit earlier.

Keep first-person, calm engineering diary tone.

- [ ] **Step 7: Run focused contract and confirm LivingWorld passes while NODE ZERO still fails**

Run:

```bash
node --test scripts/flagship-case-study.test.js
```

Expected: LivingWorld subtest PASS; NODE ZERO subtest FAIL because markers are still absent.

- [ ] **Step 8: Commit LivingWorld migration**

Commit message:

```text
content: strengthen LivingWorld case-study narrative
```

---

### Task 3: Restructure NODE ZERO as an engineering/product narrative

**Files:**
- Modify: `docs/landing/projects/node-zero.md`
- Test: `scripts/flagship-case-study.test.js`

**Interfaces:**
- Consumes: existing NODE ZERO architecture/system-flow diagrams, timeline placeholder, evidence placeholder and public page-grounded design/production constraints.
- Produces: one Markdown narrative satisfying the same seven-marker contract while respecting private/proprietary boundaries.

- [ ] **Step 1: Preserve intro, proprietary boundary, architecture diagram and timeline**

Keep the first-person techno-horror premise, private/proprietary disclosure, `node-zero-architecture.svg` and:

```html
<div data-tr-project-timeline="node-zero"></div>
```

- [ ] **Step 2: Write `problem` and `constraints` sections**

Insert:

```md
<!-- case-study:problem -->
## Проблема: сделать систему предсказания частью игрового страха
```

Explain that the core problem is not building a speaking evil AI but making MIRROR alter context/constraints so the player gradually suspects that decisions were predicted.

Insert:

```md
<!-- case-study:constraints -->
## Ограничения, которые удерживают проект в фокусе
```

Cover grounded constraints:

- solo/small-scope production reality;
- 15–20 minute vertical slice before full 90–120 minute game expansion;
- no combat;
- authored pacing must remain controllable;
- reusable movement/interaction/tasks/access systems cannot depend on one-off story scripts;
- public case study cannot expose private proprietary internals;
- asset provenance/licensing is a production constraint, not pre-release cleanup.

- [ ] **Step 3: Write `decisions` section**

Insert:

```md
<!-- case-study:decisions -->
## Ключевые решения
```

Cover:

- MIRROR changes constraints and information instead of behaving as a theatrical speaking villain;
- vertical slice is the proof unit before world expansion;
- stable facility baseline exists before horror distortion;
- reusable systems are separated from authored sequences;
- authored sequences are preferred where procedural complexity does not improve player experience;
- documentation is part of architecture/production continuity for long agent-assisted development.

Keep `node-zero-system-flow.svg` where it supports the MIRROR/system-state decision.

- [ ] **Step 4: Write grounded `failures` section as corrected directions/risks**

Insert:

```md
<!-- case-study:failures -->
## Где проект легче всего было увести не туда
```

Describe only public, grounded corrections:

- expanding into a data-center simulator before validating the game;
- leaking scare/narrative scene logic into movement/interaction fundamentals;
- proceduralizing scenes whose value comes from authored pacing;
- losing architectural/product context across long documentation-heavy/agent-assisted iterations.

Do not fabricate a shipped failure or claim a production incident not present in public evidence.

- [ ] **Step 5: Write `current-state` and `evidence` sections**

Insert:

```md
<!-- case-study:current-state -->
## Где проект находится сейчас
```

Describe pre-production/vertical-slice direction at a broad level and explicitly note that old foundation proof must not be read as proof of newer work.

Then insert:

```md
<!-- case-study:evidence -->
## Что здесь действительно подтверждено

<div data-tr-project-evidence="node-zero"></div>
```

Do not manually duplicate version lists, trust labels, current PR numbers or run IDs from the Evidence registry.

- [ ] **Step 6: Write `retrospective` section**

Insert:

```md
<!-- case-study:retrospective -->
## Что бы я зафиксировал раньше, начиная проект заново
```

Ground it in current lessons:

- define the smallest playable proof earlier;
- define reusable-vs-authored boundaries before scene growth;
- create asset provenance/content-budget rules early;
- require executable gates for each milestone instead of allowing documentation/agent output to imply correctness.

- [ ] **Step 7: Run focused contract and verify GREEN**

Run:

```bash
node --test scripts/flagship-case-study.test.js
```

Expected: all three subtests PASS.

- [ ] **Step 8: Run full unit suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 9: Commit NODE ZERO migration**

Commit message:

```text
content: strengthen NODE ZERO case-study narrative
```

---

### Task 4: Verify generated artifact and merge exact feature head

**Files:**
- Review feature branch diff only; no intended additional modifications.

**Interfaces:**
- Consumes: both migrated Markdown pages and structural contract test.
- Produces: exact-head CI evidence and merged P1.3 feature milestone.

- [ ] **Step 1: Open draft PR**

Title:

```text
content: strengthen flagship case-study narratives
```

PR body must state:

- Markdown-first shared narrative contract;
- no new renderer/registry/CMS;
- canonical Registry/Timeline/Evidence ownership preserved;
- no invented incidents/metrics/verification claims;
- TDD RED/GREEN trail;
- expected changed files.

- [ ] **Step 2: Verify scope**

Expected feature files only:

```text
docs/landing/projects/livingworld.md
docs/landing/projects/node-zero.md
scripts/flagship-case-study.test.js
docs/superpowers/specs/2026-07-22-flagship-case-study-format-design.md
docs/superpowers/plans/2026-07-22-flagship-case-study-format.md
```

No changes to:

- `data/projects.json`;
- `data/project-history/*.json`;
- `data/project-evidence.json`;
- CSS;
- build/postprocess renderers;
- visual baselines;
- CI workflow thresholds/order.

- [ ] **Step 3: Verify full exact-head GitHub Actions matrix**

Required green:

- Test;
- Build docs;
- generated-site integrity;
- browser quality/Axe/Lighthouse;
- Sources;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- Firefox/WebKit;
- generated search;
- Metadata/OpenGraph;
- Engineering Map;
- visual regression;
- evidence upload.

Any failure must be fixed without weakening existing gates.

- [ ] **Step 4: Mark ready and squash-merge only the verified exact head**

Record actual PR number, implementation head, Build/run number and squash SHA for continuity docs.

---

### Task 5: Synchronize durable continuity

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: actual merged P1.3 PR/CI evidence.
- Produces: canonical durable state with P1.3 DONE and P1.4 NEXT.

- [ ] **Step 1: Create docs-only continuity branch from post-feature `master`**

- [ ] **Step 2: Record actual P1.3 evidence**

Record:

- feature PR number/title;
- exact implementation head;
- squash merge SHA;
- exact successful Build/run number;
- shared seven-part narrative contract;
- preservation of Registry/Timeline/Evidence ownership;
- structural contract test;
- no new renderer/schema/CSS/visual baseline changes unless actual implementation evidence says otherwise.

Advance canonical next priority to:

```text
P1.4 — Additional grounded Engineering Notes
```

Keep first real Photo Story content-dependent/non-blocking and preserve operational caveats.

- [ ] **Step 3: Open docs-only PR, verify exactly three continuity files and run full CI**

- [ ] **Step 4: Squash-merge exact green docs head and perform final read-only repository check**

Confirm:

- no open PRs;
- latest `master` commits reflect continuity then feature merge;
- `PROJECT_STATE.md` says P1.3 DONE and P1.4 NEXT;
- no claim that public deployment is verified solely from CI/merge.
