# Project Evidence Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a validated, static-first Project Evidence Layer for LivingWorld and NODE ZERO that renders bounded proof of project state without runtime GitHub dependencies or overstated trust claims.

**Architecture:** `data/project-evidence.json` is the manual controlled source of truth, linked to `data/projects.json` by project slug. A focused `scripts/project-evidence.js` module validates, renders, and injects semantic evidence blocks at build time through case-study placeholders; `scripts/copy-assets.js` remains the orchestrator. The first release covers LivingWorld and NODE ZERO while keeping the schema generic for later projects.

**Tech Stack:** Node.js 24+, ECMAScript modules, `node:test`, Diplodoc generated HTML/state transformation, existing `transformGeneratedContent` helper, Playwright browser smoke, Axe accessibility checks, GitHub Actions quality matrix.

## Global Constraints

- Source of truth is a manual controlled snapshot in `data/project-evidence.json`.
- Trust states are exactly `verified`, `stale`, and `unverified`.
- `verified` is never inferred automatically from CI, releases, or links.
- No runtime or build-time GitHub API dependency is allowed in the site build.
- Every evidence signal requires a bounded `scope` stating exactly what it proves.
- `stale` and `unverified` are valid states and do not fail the build solely because of trust status.
- Malformed schema, bad references, unsafe URLs, missing required evidence, or placeholder mismatch fail the build.
- Core evidence must exist in generated HTML and remain readable with JavaScript disabled.
- First implementation scope is `livingworld` and `node-zero` only; module/schema must remain reusable.
- Never fabricate release, CI, version compatibility, manual acceptance, workflow, or private evidence claims.
- Existing project timeline, search, metadata/OG, Engineering Map, Sources Knowledge Base, Photo Stories, Lighthouse/accessibility, and cross-browser gates must remain green.

---

## File Structure

### New files

- `data/project-evidence.json` — canonical controlled evidence snapshots for LivingWorld and NODE ZERO.
- `scripts/project-evidence.js` — validation, loading, rendering, and generated-page injection.
- `scripts/project-evidence.test.js` — schema, trust, rendering, escaping, and reference contracts.
- `scripts/project-evidence-postprocess.test.js` — build orchestration and generated-content integration contracts.
- `scripts/project-evidence-smoke.cjs` — browser/mobile/no-JS/Axe smoke for both case studies.

### Modified files

- `scripts/copy-assets.js` — load/apply evidence registry after project registry loading and expose/log evidence targets.
- `docs/landing/projects/livingworld.md` — add declarative evidence placeholder near current-state section and remove only duplicated machine-like claims superseded by structured evidence.
- `docs/landing/projects/node-zero.md` — add declarative evidence placeholder near project direction/current-state section.
- `docs/_assets/style/custom.css` — scoped `tr-project-evidence*` styles with distinct trust states and mobile-safe layout.
- `.github/workflows/build.yml` — run Project Evidence browser smoke and preserve smoke artifacts.

### Durable docs after merge

- `docs/PROJECT_STATE.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG.md`

---

### Task 1: Evidence model and strict validator

**Files:**
- Create: `scripts/project-evidence.test.js`
- Create: `scripts/project-evidence.js`
- Read/consume: `scripts/project-registry.js`

**Interfaces:**
- Consumes: project registry array from `loadProjectRegistry()`.
- Produces:
  - `PROJECT_EVIDENCE_STATUS_VALUES`
  - `PROJECT_EVIDENCE_KIND_VALUES`
  - `PROJECT_EVIDENCE_MODE_VALUES`
  - `PROJECT_EVIDENCE_SIGNAL_STATE_VALUES`
  - `validateProjectEvidence(snapshots, {projects})`
  - `loadProjectEvidence(manifestPath, {projects})`
  - `renderProjectEvidence(snapshot)`
  - `applyProjectEvidence(outputDir, snapshots, {requiredProjects})`

- [ ] **Step 1: Write failing validator contracts**

Create `scripts/project-evidence.test.js` with table-driven `node:test` coverage for:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyProjectEvidence,
  loadProjectEvidence,
  renderProjectEvidence,
  validateProjectEvidence,
} from './project-evidence.js';

const projects = [
  {slug: 'livingworld'},
  {slug: 'node-zero'},
];

const validVerified = {
  project: 'livingworld',
  status: 'verified',
  lastVerified: '2026-07-22',
  versions: [{label: 'Minecraft', value: '1.21.1'}],
  signals: [{
    kind: 'ci',
    mode: 'automated',
    label: 'CI',
    state: 'green',
    url: 'https://github.com/True-Ruslan/minecraft-botics-ai/actions/runs/1',
    observedAt: '2026-07-22',
    scope: 'Automated contracts covered by this run.',
  }],
};

test('accepts a canonical verified evidence snapshot', () => {
  assert.deepEqual(validateProjectEvidence([validVerified], {projects}), [validVerified]);
});
```

Add explicit failing cases for empty registry, duplicate project, unknown project, invalid project slug, unknown trust state, missing `lastVerified`, impossible dates (`2026-02-30`), non-HTTPS URL, blank version label/value, duplicate normalized version label, invalid kind/mode/state, kind/mode mismatch, blank scope, duplicate normalized signal identity, and verified/stale with zero signals.

Add valid cases proving:

```js
{
  project: 'node-zero',
  status: 'unverified',
  versions: [],
  signals: [],
}
```

is accepted, and that a `manual` signal without `url` is accepted.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test scripts/project-evidence.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/project-evidence.js`.

- [ ] **Step 3: Implement the minimal strict validator and loader**

Create `scripts/project-evidence.js` with:

```js
export const PROJECT_EVIDENCE_STATUS_VALUES = Object.freeze(['verified', 'stale', 'unverified']);
export const PROJECT_EVIDENCE_KIND_VALUES = Object.freeze(['ci', 'release', 'pr', 'build', 'manual']);
export const PROJECT_EVIDENCE_MODE_VALUES = Object.freeze(['automated', 'manual']);
export const PROJECT_EVIDENCE_SIGNAL_STATE_VALUES = Object.freeze([
  'green', 'published', 'merged', 'passed', 'accepted', 'pending', 'failed', 'unavailable',
]);
```

Implement exact `YYYY-MM-DD` validation by parsing year/month/day and round-tripping UTC components so impossible calendar dates fail.

Validation rules must enforce:

```js
if (snapshot.status !== 'unverified' && !snapshot.lastVerified) throw new Error(...);
if (snapshot.status !== 'unverified' && snapshot.signals.length === 0) throw new Error(...);
if (signal.kind === 'manual' && signal.mode !== 'manual') throw new Error(...);
if (signal.kind !== 'manual' && signal.mode !== 'automated') throw new Error(...);
```

Use normalized duplicate keys:

```js
const versionKey = label.trim().toLocaleLowerCase('en-US');
const signalKey = [signal.kind, signal.label.trim().toLocaleLowerCase('en-US'), signal.observedAt].join('|');
```

Reject URLs unless they match a safe `https://` external URL pattern consistent with `project-registry.js`.

Implement `loadProjectEvidence(manifestPath, {projects})` using `fs.existsSync`, `JSON.parse`, then `validateProjectEvidence`.

Export placeholder stubs for `renderProjectEvidence` and `applyProjectEvidence` only if needed to satisfy module imports; renderer behavior remains RED in Task 2.

- [ ] **Step 4: Run validator contracts and verify GREEN**

Run:

```bash
node --test scripts/project-evidence.test.js
```

Expected: all validator/loader tests PASS; renderer-specific tests not yet added.

- [ ] **Step 5: Commit the validator slice**

```bash
git add scripts/project-evidence.js scripts/project-evidence.test.js
git commit -m "feat: add project evidence validation model"
```

---

### Task 2: Semantic renderer and trust-safe output

**Files:**
- Modify: `scripts/project-evidence.test.js`
- Modify: `scripts/project-evidence.js`

**Interfaces:**
- Consumes: validated project evidence snapshot.
- Produces: `renderProjectEvidence(snapshot): string` semantic HTML.

- [ ] **Step 1: Add failing renderer contracts**

Add tests asserting exact semantics rather than brittle whole-string snapshots:

```js
test('renders verified evidence without broadening the claim', () => {
  const html = renderProjectEvidence(validVerified);
  assert.match(html, /data-project-evidence="livingworld"/);
  assert.match(html, /data-evidence-status="verified"/);
  assert.match(html, /ПРОВЕРЕНО/);
  assert.match(html, /22\.07\.2026|2026-07-22/);
  assert.match(html, /Minecraft/);
  assert.match(html, /1\.21\.1/);
  assert.match(html, /Automated contracts covered by this run\./);
  assert.doesNotMatch(html, /production-ready|fully tested|fully verified/i);
});
```

Add stale/unverified cases requiring distinct status attributes and labels. Add escaping cases for `<script>`, quotes, and ampersands in label/value/scope. Add automated/manual distinction assertions such as `data-evidence-mode="automated"` and `data-evidence-mode="manual"`.

- [ ] **Step 2: Run renderer tests and verify RED**

Run:

```bash
node --test scripts/project-evidence.test.js
```

Expected: renderer assertions FAIL because semantic evidence HTML is not implemented.

- [ ] **Step 3: Implement trust-safe semantic renderer**

Implement `renderProjectEvidence(snapshot)` using escaped values and a status map:

```js
const STATUS_COPY = {
  verified: 'ПРОВЕРЕНО',
  stale: 'ТРЕБУЕТ ПЕРЕПРОВЕРКИ',
  unverified: 'НЕ ПРОВЕРЕНО',
};
```

Required structure:

```html
<section class="tr-project-evidence tr-project-evidence--verified"
         data-project-evidence="livingworld"
         data-evidence-status="verified"
         aria-labelledby="project-evidence-livingworld-title">
  <header class="tr-project-evidence__header">...</header>
  <dl class="tr-project-evidence__versions">...</dl>
  <div class="tr-project-evidence__signals">...</div>
</section>
```

Each signal must expose `data-evidence-kind`, `data-evidence-mode`, and its bounded `scope`. Links use `target="_blank" rel="noopener noreferrer"` only when a validated URL exists.

Do not synthesize broad readiness claims from `state`.

- [ ] **Step 4: Run renderer tests and verify GREEN**

Run:

```bash
node --test scripts/project-evidence.test.js
```

Expected: all model and renderer tests PASS.

- [ ] **Step 5: Commit the renderer slice**

```bash
git add scripts/project-evidence.js scripts/project-evidence.test.js
git commit -m "feat: render trust-safe project evidence"
```

---

### Task 3: Canonical real evidence snapshots

**Files:**
- Create: `data/project-evidence.json`
- Modify: `scripts/project-evidence.test.js`

**Interfaces:**
- Consumes: current verified facts from LivingWorld/NODE ZERO repositories and known manual acceptance evidence.
- Produces: canonical snapshots for exactly `livingworld` and `node-zero` in first release.

- [ ] **Step 1: Add a failing canonical-registry contract**

Add a test that loads the real registry and asserts:

```js
const evidence = loadProjectEvidence(DEFAULT_PROJECT_EVIDENCE_PATH, {projects: fullProjects});
assert.deepEqual(evidence.map(({project}) => project).sort(), ['livingworld', 'node-zero']);
```

Also assert every signal has non-empty `scope`, and that no snapshot contains invented placeholder URLs such as `example.com`.

- [ ] **Step 2: Run the canonical contract and verify RED**

Run:

```bash
node --test scripts/project-evidence.test.js
```

Expected: FAIL because `data/project-evidence.json` does not exist.

- [ ] **Step 3: Verify current evidence before writing canonical data**

Use repository evidence, not memory, for every public/current claim:

- LivingWorld: inspect current release/tag state, latest relevant green workflow/build, tested Minecraft/Fabric/MCA/Voice Chat versions, and manually accepted voice pipeline evidence.
- NODE ZERO: inspect private repository current branch/release/build/CI facts available through the connector; only include facts that are actually observable. For manual/local build claims, omit public URL and bound `scope` narrowly.

Decision rule:

```text
complete current proof -> verified
known previously meaningful but not rechecked -> stale
insufficient current proof -> unverified
```

Never promote status based on a single green CI signal.

- [ ] **Step 4: Create `data/project-evidence.json`**

Populate exactly two snapshots using the fixed schema. Use real URLs only where stable evidence links exist. For NODE ZERO private evidence, omit `url` where disclosure or stable public linking is inappropriate.

- [ ] **Step 5: Run canonical/model tests and verify GREEN**

Run:

```bash
node --test scripts/project-evidence.test.js
npm test
```

Expected: Project Evidence tests PASS and full unit suite remains green.

- [ ] **Step 6: Commit canonical evidence**

```bash
git add data/project-evidence.json scripts/project-evidence.test.js
git commit -m "data: add controlled project evidence snapshots"
```

---

### Task 4: Build-time placeholder injection and orchestration

**Files:**
- Create: `scripts/project-evidence-postprocess.test.js`
- Modify: `scripts/project-evidence.js`
- Modify: `scripts/copy-assets.js`
- Modify: `docs/landing/projects/livingworld.md`
- Modify: `docs/landing/projects/node-zero.md`

**Interfaces:**
- Consumes: `loadProjectRegistry`, `loadProjectEvidence`, generated Diplodoc HTML/state.
- Produces: `applyProjectEvidence(outputDir, snapshots, {requiredProjects})` returning injected target paths; `postprocessOutput()` returns `projectEvidenceTargets`.

- [ ] **Step 1: Add failing postprocess integration contracts**

Create fixture-based tests that generate minimal `landing/projects/livingworld.html` and `node-zero.html` containing:

```html
<div data-tr-project-evidence="livingworld"></div>
```

Test both direct generated HTML and Diplodoc hydration-state representation, following `sources-registry-diplodoc-state.test.js` patterns.

Require:

```js
const targets = applyProjectEvidence(outputDir, snapshots, {
  requiredProjects: ['livingworld', 'node-zero'],
});
assert.equal(targets.length, 2);
```

Add failures for missing required snapshot, missing required placeholder, duplicate/mismatched placeholder, and unresolved generated page.

Add a `postprocessOutput()` fixture test requiring `projectEvidenceTargets` in its result.

- [ ] **Step 2: Run integration tests and verify RED**

Run:

```bash
node --test scripts/project-evidence-postprocess.test.js
```

Expected: FAIL because `applyProjectEvidence`/`projectEvidenceTargets` integration is incomplete.

- [ ] **Step 3: Implement generated-page injection**

Use `transformGeneratedContent` exactly as mature repository modules do:

```js
const transformed = transformGeneratedContent(
  html,
  (contentHtml) => marker.test(contentHtml)
    ? contentHtml.replace(marker, renderProjectEvidence(snapshot))
    : contentHtml,
  `project evidence for ${snapshot.project}`,
);
```

Do not throw from the callback merely because one representation lacks the marker; evaluate `transformed.source`/actual replacement after transformation.

When Diplodoc content exists only in hydration state, preserve semantic no-JS evidence using the same safe fallback principle established by Sources Knowledge Base.

- [ ] **Step 4: Integrate the orchestrator**

In `scripts/copy-assets.js`:

```js
import {
  applyProjectEvidence,
  loadProjectEvidence,
} from './project-evidence.js';

const PROJECT_EVIDENCE_MANIFEST = path.join(ROOT, 'data', 'project-evidence.json');
```

Add optional `projectEvidencePath` to `postprocessOutput()` for tests. Resolve production default only when using production docs, load with `{projects}`, then apply after project status/timeline injection:

```js
const projectEvidenceTargets = projectEvidence
  ? applyProjectEvidence(outputDir, projectEvidence, {
      requiredProjects: ['livingworld', 'node-zero'],
    })
  : [];
```

Return and log `projectEvidenceTargets`.

- [ ] **Step 5: Add declarative placeholders to case studies**

LivingWorld: place

```html
<div data-tr-project-evidence="livingworld"></div>
```

immediately before or inside the current-version/current-state section so evidence precedes detailed prose limitations.

NODE ZERO: place

```html
<div data-tr-project-evidence="node-zero"></div>
```

near `## Куда я сейчас веду проект` before narrative direction details.

Remove only duplicated machine-like facts that the structured block now owns; preserve architecture rationale and explicit limitations.

- [ ] **Step 6: Run integration and build tests**

Run:

```bash
node --test scripts/project-evidence-postprocess.test.js scripts/project-evidence.test.js
npm test
npm run build:docs
npm run check:site
```

Expected: all tests PASS; generated LivingWorld/NODE ZERO pages contain evidence blocks; site integrity PASS.

- [ ] **Step 7: Commit build integration**

```bash
git add scripts/project-evidence.js scripts/project-evidence-postprocess.test.js scripts/copy-assets.js docs/landing/projects/livingworld.md docs/landing/projects/node-zero.md
git commit -m "feat: inject project evidence into case studies"
```

---

### Task 5: Scoped responsive styling

**Files:**
- Modify: `docs/_assets/style/custom.css`
- Modify: `scripts/project-evidence.test.js` only if class contracts need explicit assertions.

**Interfaces:**
- Consumes: `tr-project-evidence*` semantic markup.
- Produces: compact responsive trust block with visually distinct trust states.

- [ ] **Step 1: Add/confirm CSS contract selectors in renderer tests**

Assert rendered HTML carries:

```text
tr-project-evidence--verified
tr-project-evidence--stale
tr-project-evidence--unverified
tr-project-evidence__header
tr-project-evidence__versions
tr-project-evidence__signals
```

- [ ] **Step 2: Run tests before CSS change**

Run:

```bash
node --test scripts/project-evidence.test.js
```

Expected: PASS for markup contracts; visual behavior remains uncovered until browser smoke.

- [ ] **Step 3: Add scoped CSS**

Add only `.tr-project-evidence*` rules using existing CSS custom properties/tokens. Requirements:

```css
.tr-project-evidence {
  min-width: 0;
  overflow-wrap: anywhere;
}

.tr-project-evidence__versions,
.tr-project-evidence__signals {
  min-width: 0;
}
```

Use distinct border/background/accent treatment for `--verified`, `--stale`, and `--unverified` without relying on color alone; status text remains visible.

At mobile breakpoints, collapse multi-column metadata/signals to one column and keep long URLs/scopes wrap-safe.

Do not introduce global element selectors or unrelated refactors.

- [ ] **Step 4: Rebuild and run site integrity**

Run:

```bash
npm run build:docs
npm run check:site
```

Expected: PASS.

- [ ] **Step 5: Commit styling**

```bash
git add docs/_assets/style/custom.css
git commit -m "style: present project evidence trust states"
```

---

### Task 6: Browser, mobile, no-JS, and Axe coverage

**Files:**
- Create: `scripts/project-evidence-smoke.cjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: built `docs-html` served by existing test server/browser harness.
- Produces: deterministic smoke log/summary/screenshots and CI gate.

- [ ] **Step 1: Create a browser smoke that fails before workflow integration**

Use existing Playwright/Axe smoke conventions. Test both:

```text
/landing/projects/livingworld.html
/landing/projects/node-zero.html
```

For enhanced JS mode assert:

```js
await expect(page.locator('[data-project-evidence="livingworld"]')).toHaveCount(1);
await expect(page.locator('[data-evidence-status]')).toBeVisible();
```

For each page verify:

- expected project evidence count exactly 1;
- project-level trust label visible;
- at least one scope visible for verified/stale snapshots;
- evidence links, when present, have safe absolute HTTPS targets;
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at mobile viewport;
- Axe serious/critical violations count is zero.

Create a second browser context with `javaScriptEnabled: false` and assert the same core evidence text is present without interaction.

Write deterministic summary JSON with per-project counts/status/overflow/Axe/no-JS evidence presence.

- [ ] **Step 2: Run smoke locally/CI runner and verify behavior**

Run the repository's existing serve/build sequence plus:

```bash
node scripts/project-evidence-smoke.cjs
```

Expected before any discovered fix: either PASS or a concrete product/harness failure. Treat any failure as RED and fix product/harness based on evidence rather than weakening assertions.

- [ ] **Step 3: Integrate the smoke into GitHub Actions**

Add a dedicated step near other feature browser smokes in `.github/workflows/build.yml`:

```yaml
- name: Project Evidence smoke
  run: node scripts/project-evidence-smoke.cjs
```

Preserve the smoke log/summary and representative mobile screenshots in the existing artifact upload paths/patterns.

- [ ] **Step 4: Run the full quality matrix**

Run locally where available:

```bash
npm test
npm run build:docs
npm run check:site
```

Then push exact head and require GitHub Actions to pass all existing and new gates.

Expected: unit, build, site integrity, browser/Axe/Lighthouse, Sources KB, Photo Stories, v0.3 regression, cross-browser, search, metadata/OG, Engineering Map, visual regression, and Project Evidence smoke all green.

- [ ] **Step 5: Commit browser coverage**

```bash
git add scripts/project-evidence-smoke.cjs .github/workflows/build.yml
git commit -m "test: cover project evidence in browser quality gates"
```

---

### Task 7: Exact-head review, merge, and continuity docs

**Files:**
- Review: complete PR diff
- Modify after feature merge: `docs/PROJECT_STATE.md`
- Modify after feature merge: `docs/ROADMAP.md`
- Modify after feature merge: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: exact green PR head SHA, merged feature PR SHA, workflow run evidence.
- Produces: merged milestone and durable continuity state for the next chat/session.

- [ ] **Step 1: Review the exact feature diff**

Check:

```text
- only intended evidence/model/build/UI/test files changed
- no runtime GitHub fetch introduced
- no fabricated evidence
- no broad trust claims
- no duplicated canonical source of truth
- no unrelated refactor
- generated/no-JS behavior covered
```

Address actionable review findings before merge.

- [ ] **Step 2: Verify exact PR head**

Require a fresh GitHub Actions run associated with the exact current PR head SHA. Do not rely on an older green commit.

Record:

```text
PR head SHA
workflow run ID/URL
all required job/step conclusions
browser smoke evidence summary
```

- [ ] **Step 3: Merge the feature PR only after exact-head green**

Use squash merge consistent with recent project history unless repository state requires otherwise.

Record the real merge SHA.

- [ ] **Step 4: Synchronize durable state in a docs-only follow-up**

Update `docs/PROJECT_STATE.md` with:

```text
- Project Evidence Layer as latest major milestone
- actual feature PR number and merge SHA
- exact-head green CI run
- evidence architecture/invariants
- LivingWorld/NODE ZERO coverage and trust states
- remaining known debt
- next roadmap priority
```

Update `docs/ROADMAP.md`:

```text
- mark Project Evidence Layer complete
- promote P0.5 Engineering Notes as next product milestone
- retain Content Freshness Guard after Notes unless evidence work reveals a stronger dependency
```

Update `docs/CHANGELOG.md` with implementation, TDD incidents/fixes, browser/no-JS evidence, CI run, and merge SHA.

- [ ] **Step 5: Verify and merge continuity docs**

Require the docs-only exact head to pass the full configured quality matrix before merge. Record its merge SHA and confirm no open implementation PR remains.
