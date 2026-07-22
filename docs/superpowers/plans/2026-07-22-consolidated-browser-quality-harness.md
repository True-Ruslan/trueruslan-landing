# Consolidated Browser Quality Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build P1.1 as a small shared browser-quality infrastructure layer while preserving every existing focused runner, domain assertion, route, viewport, screenshot name, visual baseline and CI gate.

**Architecture:** New `scripts/quality-harness/*.cjs` modules own only stable infrastructure primitives: paths, tool loading/browser discovery, static server lifecycle, context/page creation, diagnostics, generic overflow/Axe assertions, evidence files and shared core scenario constants. Existing smoke scripts keep orchestration and domain-specific assertions, then migrate incrementally to consume those primitives.

**Tech Stack:** Node.js 24 CommonJS for browser runners, Express 5, Playwright 1.61.1, `@axe-core/playwright` 4.12.1, Lighthouse 13.4.0, `node:test`, GitHub Actions.

## Global Constraints

- No Playwright Test or TypeScript migration.
- No CI parallelization redesign.
- No change to visual baselines or thresholds.
- No change to Lighthouse budget.
- No giant manifest/DSL runner.
- Preserve route lists, viewport dimensions, wait strategies, domain assertions, Axe blocking impacts, overflow tolerances, screenshot names and summary artifact names.
- Keep each existing smoke runner as the owner of its domain semantics.
- Shared failures must preserve caller-provided scenario/route labels.

---

### Task 1: RED shared-harness contracts

**Files:**
- Create: `scripts/quality-harness.test.js`

**Interfaces:**
- Tests expect modules under `scripts/quality-harness/` that do not exist yet.
- The test contract will require exact exports used by later runner migrations.

- [ ] **Step 1: Add failing contracts**

Create `scripts/quality-harness.test.js` that requires:

```js
const {ROOT, OUTPUT_DIR, TOOLS_DIR, ARTIFACTS_DIR} = require('./quality-harness/paths.cjs');
const {sameOrigin, shouldIgnoreRequestFailure, dedupeDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {
  measureHorizontalOverflow,
  assertNoHorizontalOverflow,
  measureHorizontalScroll,
  blockingAxeViolations,
} = require('./quality-harness/assertions.cjs');
const {screenshotOptions, artifactPath} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS, CORE_SCENARIOS} = require('./quality-harness/scenarios.cjs');
```

Cover these exact behaviors:

```js
assert.equal(path.basename(ROOT), 'trueruslan-landing');
assert.equal(OUTPUT_DIR, path.join(ROOT, 'docs-html'));
assert.equal(TOOLS_DIR, path.join(ROOT, '.quality-tools', 'node_modules'));
assert.equal(ARTIFACTS_DIR, path.join(ROOT, 'quality-artifacts'));

assert.equal(sameOrigin('http://127.0.0.1:4173/a', 'http://127.0.0.1:4173'), true);
assert.equal(sameOrigin('https://example.com/a', 'http://127.0.0.1:4173'), false);
assert.equal(shouldIgnoreRequestFailure('net::ERR_ABORTED'), true);
assert.equal(shouldIgnoreRequestFailure('NS_BINDING_ABORTED'), true);
assert.deepEqual(dedupeDiagnostics(['a', 'a', 'b']), ['a', 'b']);

const overflowPage = {evaluate: async () => ({viewportWidth: 390, documentWidth: 392, overflow: 2})};
assert.deepEqual(await measureHorizontalOverflow(overflowPage), {viewportWidth: 390, documentWidth: 392, overflow: 2});
await assert.doesNotReject(() => assertNoHorizontalOverflow(overflowPage, 'mobile'));

const scrollPage = {evaluate: async () => ({viewportWidth: 390, scrollWidth: 400, maxScrollX: 10})};
assert.deepEqual(await measureHorizontalScroll(scrollPage), {viewportWidth: 390, scrollWidth: 400, maxScrollX: 10});

assert.deepEqual(
  blockingAxeViolations({violations: [{id: 'a', impact: 'minor'}, {id: 'b', impact: 'serious'}]}).map((v) => v.id),
  ['b'],
);
assert.deepEqual(screenshotOptions(), {fullPage: true, animations: 'disabled'});
assert.equal(artifactPath('x.png'), path.join(ARTIFACTS_DIR, 'x.png'));
assert.deepEqual(VIEWPORTS.mobile, {width: 390, height: 844});
assert.equal(CORE_SCENARIOS.home.heading, 'Руслан Немыкин');
```

- [ ] **Step 2: Run RED**

Open a draft PR after committing the test and let the repository `Build` workflow run `npm test`.

Expected: `Test` fails because `scripts/quality-harness/*.cjs` modules do not exist.

- [ ] **Step 3: Record RED evidence**

Record the exact Build number/run id in the PR body before adding production modules.

---

### Task 2: Implement shared quality-harness primitives

**Files:**
- Create: `scripts/quality-harness/paths.cjs`
- Create: `scripts/quality-harness/tools.cjs`
- Create: `scripts/quality-harness/static-server.cjs`
- Create: `scripts/quality-harness/browser.cjs`
- Create: `scripts/quality-harness/diagnostics.cjs`
- Create: `scripts/quality-harness/assertions.cjs`
- Create: `scripts/quality-harness/evidence.cjs`
- Create: `scripts/quality-harness/scenarios.cjs`

**Interfaces:**

`paths.cjs`:

```js
module.exports = {ROOT, OUTPUT_DIR, TOOLS_DIR, ARTIFACTS_DIR};
```

`tools.cjs`:

```js
requireQualityTool(name, label = 'Quality tool') -> any
findChrome() -> string
launchChromium(chromium, options = {}) -> Promise<Browser>
```

`static-server.cjs`:

```js
startStaticServer({port, gzip = false}) -> Promise<{server, baseUrl, stop}>
```

`browser.cjs`:

```js
createScenarioPage(browser, options = {}) -> Promise<{context, page, close}>
```

`diagnostics.cjs`:

```js
sameOrigin(url, baseUrl) -> boolean
shouldIgnoreRequestFailure(reason, ignoredReasons?) -> boolean
dedupeDiagnostics(items) -> string[]
installPageDiagnostics(page, {baseUrl, ignoredRequestFailureReasons}) -> {pageErrors, requestFailures, assertClean(label)}
```

`assertions.cjs`:

```js
measureHorizontalOverflow(page) -> Promise<{viewportWidth, documentWidth, overflow}>
assertNoHorizontalOverflow(page, label, tolerance = 2) -> Promise<object>
measureHorizontalScroll(page) -> Promise<{viewportWidth, scrollWidth, maxScrollX}>
blockingAxeViolations(axeResult, impacts?) -> violation[]
assertNoBlockingAxe({page, label, AxeBuilder, include, exclude, artifactName}) -> Promise<{violations, blocking}>
```

`evidence.cjs`:

```js
ensureArtifactsDir() -> string
artifactPath(name) -> string
screenshotOptions(overrides = {}) -> object
captureScreenshot(page, name, overrides = {}) -> Promise<void>
writeJsonArtifact(name, value) -> string
writeTextArtifact(name, value) -> string
```

`scenarios.cjs`:

```js
VIEWPORTS = Object.freeze({desktop, compactDesktop, mobile})
CORE_SCENARIOS = Object.freeze({home, projects, resume})
```

- [ ] **Step 1: Implement minimal modules**

Use existing runner behavior as the source of truth. `startStaticServer({gzip: true})` must preserve the current `browser-quality.cjs` gzip behavior for compressible extensions; `gzip: false` must preserve plain Express static serving used by focused smokes.

- [ ] **Step 2: Run GREEN unit contract**

Run through PR CI `npm test`.

Expected: `quality-harness.test.js` passes with all existing unit tests.

- [ ] **Step 3: Do not migrate runners yet if contract fails**

Only continue after the shared modules themselves are green.

---

### Task 3: Migrate core infrastructure runners

**Files:**
- Modify: `scripts/browser-quality.cjs`
- Modify: `scripts/v03-browser-smoke.cjs`
- Modify: `scripts/cross-browser-smoke.cjs`
- Modify: `scripts/layout-overflow-smoke.cjs`

**Interfaces consumed:**
- all Task 2 modules.

- [ ] **Step 1: Refactor `browser-quality.cjs`**

Replace local copies of paths/tool loader/Chrome discovery/static server/context creation/overflow/Axe/screenshot plumbing with harness calls while preserving:

```text
PORT=QUALITY_PORT||4173
routes/headings/viewports unchanged
resume PDF assertion unchanged
same-origin ERR_ABORTED semantics unchanged
browser summary filename unchanged
Lighthouse report/budget unchanged
gzip transport enabled
```

- [ ] **Step 2: Refactor `v03-browser-smoke.cjs`**

Preserve all command-palette/project registry/Now/Notes/timeline assertions and screenshot names. Use harness for server, Chromium, scenario page, overflow, Axe and screenshots.

- [ ] **Step 3: Refactor `cross-browser-smoke.cjs`**

Preserve separate Firefox/WebKit launches and current ignored failure semantics (`ABORTED`, `NS_BINDING_ABORTED`). Use harness for server, scenario contexts, diagnostics, overflow and failure screenshot path.

- [ ] **Step 4: Refactor `layout-overflow-smoke.cjs`**

Use shared server, Chromium/context and `measureHorizontalScroll`. Preserve the stricter real-scroll `maxScrollX > 2` assertion and exact console diagnostics.

- [ ] **Step 5: Verify slice**

PR CI must pass unit tests and the existing Build workflow through the migrated gates. Do not change workflow ordering or visual baselines.

---

### Task 4: Migrate feature-specific browser smokes

**Files:**
- Modify: `scripts/sources-knowledge-base-smoke.cjs`
- Modify: `scripts/project-evidence-smoke.cjs`
- Modify: `scripts/photo-stories-browser-smoke.cjs`
- Modify: `scripts/search-smoke.cjs`
- Modify: `scripts/metadata-smoke.cjs`
- Modify: `scripts/engineering-graph-smoke.cjs`

**Interfaces consumed:**
- Task 2 harness primitives.

- [ ] **Step 1: Sources Knowledge Base**

Move only infrastructure concerns. Preserve exactly:

```text
31 expected sources
ClickHouse/JPA/blog filtering semantics
hash deep-link behavior
no-JS scenario
mobile overflow tolerance
Axe include scope
sources-knowledge-base-mobile.png
sources-knowledge-base-summary.json
```

- [ ] **Step 2: Project Evidence**

Preserve verified/stale status labels, solid/dashed trust border checks, HTTPS link checks, enhanced/no-JS scenarios and current artifact names.

- [ ] **Step 3: Photo Stories**

Preserve Chrome fallback, diagnostics semantics, hero geometry, archive/lightbox/hash/focus assertions, loaded-image precondition, three viewports/reduced-motion scenario and screenshot names.

- [ ] **Step 4: Search**

Preserve generated search route, 700 ms settle delay, root HTML artifact, `/` focus shortcut, resource uniqueness checks, Axe/overflow diagnostics and screenshot names.

- [ ] **Step 5: Metadata**

Preserve page list/titles, canonical/meta contracts, OG PNG signature validation and summary artifact. Use harness only for server/tool/browser/context/evidence plumbing.

- [ ] **Step 6: Engineering Map**

Preserve node/filter counts, AI filter semantics, selected-detail behavior, Axe include scope, overflow tolerance and screenshots.

- [ ] **Step 7: Verify slice**

All migrated feature smoke steps in the existing workflow must remain green. Any assertion mismatch is treated as a migration regression, not fixed by weakening the assertion.

---

### Task 5: Final harness consistency review

**Files:**
- Review: `scripts/quality-harness/*.cjs`
- Review: all migrated runners
- Optional modify only if duplication is meaningful: `scripts/visual-regression.cjs`

- [ ] **Step 1: Duplication review**

Confirm runners no longer define duplicate `startServer`/`stopServer`, `.quality-tools` loader, repeated Chromium fallback or generic Axe/overflow screenshot helpers where harness equivalents exist.

- [ ] **Step 2: Avoid artificial abstraction**

Leave `visual-regression.cjs` comparison logic untouched. Only switch its path/tool/evidence boilerplate if doing so does not change baseline/sample/diff semantics.

- [ ] **Step 3: Verify no baseline changes**

PR diff must not include `tests/visual-baselines.json` unless a real visual change was independently approved; P1.1 expects no baseline change.

---

### Task 6: Exact-head verification and merge

**Files:**
- No additional product files required.

- [ ] **Step 1: Review changed-file scope**

Expected scope:

```text
scripts/quality-harness/*.cjs
scripts/quality-harness.test.js
migrated browser smoke runners
docs/superpowers/plans/2026-07-22-consolidated-browser-quality-harness.md
```

No CSS/content/visual baseline changes.

- [ ] **Step 2: Verify full configured Build matrix**

Require exact feature head success for:

```text
npm test
production Diplodoc build
generated-site integrity
mobile layout overflow
Chromium browser/Axe/Lighthouse
Sources Knowledge Base smoke
Project Evidence smoke
Photo Stories smoke
Portfolio v0.3 smoke
Firefox/WebKit compatibility
generated search
metadata/OpenGraph
Engineering Map
visual regression
quality evidence upload
```

- [ ] **Step 3: Merge with expected head SHA**

Squash-merge only after full exact-head green.

---

### Task 7: Durable continuity sync

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: Record actual merge evidence**

Document the real P1.1 PR number, squash SHA, exact implementation head and full Build run.

- [ ] **Step 2: Mark P1.1 DONE**

Record what moved into `scripts/quality-harness/`, what deliberately stayed focused, and that visual baselines/assertions were preserved.

- [ ] **Step 3: Set next priority**

Move roadmap NEXT to **P1.2 Project metadata cleanup**, with P1.3 Stronger flagship case-study format after it.

- [ ] **Step 4: Verify docs-only continuity PR**

Require exact docs head full Build matrix green, then squash-merge.
