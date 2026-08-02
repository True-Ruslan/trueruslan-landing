# VillAIgence Flagship Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the existing `livingworld` flagship route into a current, evidence-bounded VillAIgence case study while preserving stable route/key compatibility.

**Architecture:** Keep `livingworld` as the internal landing slug, timeline key, evidence key and URL. Update the public identity, canonical source links, data snapshots, seven-section narrative and one production-safe SVG from current `True-Ruslan/villAIgence` evidence. Extend existing unit/browser/visual gates instead of adding a separate runtime or duplicated route.

**Tech Stack:** Node.js 24 test runner, Diplodoc/YFM, JSON registries, Markdown, SVG presentation attributes, Playwright-based quality scripts, GitHub Actions.

## Global Constraints

- Public display name is `VillAIgence`; stable landing slug/route remains `livingworld` / `landing/projects/livingworld.html`.
- Public repository is `https://github.com/True-Ruslan/villAIgence`.
- Source truth is bounded through `True-Ruslan/villAIgence` head `e13660f5998fa1ed343548252d573140adc5b0c9` and merged PR #102.
- `0.1.20+1.21.1` remains `PARTIAL PASS — release defects found`.
- Installed `0.1.21+1.21.1` remains startup FAIL with safe rollback.
- PR #102 proves automated/package correction only; exact `0.1.22+1.21.1` installed acceptance remains pending.
- Do not rename compatibility-sensitive `mca`, Java package, config or `<world>/livingworld/` identities.
- Keep the controlled flagship set exactly `livingworld`, `node-zero`, `vlezet`.
- No backend, CMS, database, runtime GitHub API, live provider metrics or volatile counters.
- Critical SVG paint must use presentation attributes; no embedded `<style>` dependency.
- Visual baselines may change only after exact-head manual review.

---

### Task 1: Add the VillAIgence truth-boundary RED contract

**Files:**
- Create: `scripts/villaigence-flagship.test.js`
- Modify: `scripts/flagship-case-study.test.js`
- Test: `scripts/villaigence-flagship.test.js`

**Interfaces:**
- Consumes: repository files `data/projects.json`, `data/project-evidence.json`, `data/project-history/livingworld.json`, `docs/landing/projects/livingworld.md`, `data/page-meta.json`.
- Produces: a fail-closed content contract for public identity, canonical source, exact acceptance wording, stable route and diagram path.

- [ ] **Step 1: Write the failing identity/evidence test**

Create `scripts/villaigence-flagship.test.js` that asserts:

```js
assert.equal(project.slug, 'livingworld');
assert.equal(project.name, 'VillAIgence');
assert.equal(project.href, 'landing/projects/livingworld.html');
assert.equal(project.links.github, 'https://github.com/True-Ruslan/villAIgence');
assert.match(page, /^# VillAIgence/m);
assert.match(page, /e13660f5998fa1ed343548252d573140adc5b0c9/);
assert.match(page, /0\.1\.20\+1\.21\.1[\s\S]{0,160}PARTIAL PASS/i);
assert.match(page, /0\.1\.21\+1\.21\.1[\s\S]{0,180}startup/i);
assert.match(page, /0\.1\.22\+1\.21\.1[\s\S]{0,180}pending/i);
assert.doesNotMatch(page, /0\.1\.22\+1\.21\.1[^\n]{0,100}(accepted|full pass|production-ready)/i);
```

Also require exactly one current timeline entry and exactly three livingworld evidence signals.

- [ ] **Step 2: Change the flagship diagram expectation before implementation**

In `scripts/flagship-case-study.test.js`, change only the `livingworld` diagram path to:

```js
diagram: '../../assets/diagrams/villaigence-authority-and-acceptance.svg'
```

Keep the controlled set assertion unchanged.

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
npm test
```

Expected: existing tests pass; new VillAIgence assertions fail on the old `LivingWorld` identity, old repository URL, old evidence/timeline and missing new diagram.

- [ ] **Step 4: Commit canonical RED**

```bash
git add scripts/villaigence-flagship.test.js scripts/flagship-case-study.test.js
git commit -m "test: require current VillAIgence flagship truth"
```

---

### Task 2: Refresh canonical project, timeline and evidence data

**Files:**
- Modify: `data/projects.json`
- Modify: `data/project-history/livingworld.json`
- Modify: `data/project-evidence.json`
- Test: `scripts/villaigence-flagship.test.js`
- Test: existing project registry/timeline/evidence tests

**Interfaces:**
- Consumes: stable project slug `livingworld` and source evidence through PR #102.
- Produces: public project card data, one-current-entry timeline and bounded evidence snapshot used by the generated page.

- [ ] **Step 1: Update the project record minimally**

Keep `slug`, `href`, `timeline` and `noteSlugs`. Set:

```json
{
  "name": "VillAIgence",
  "status": "release-candidate",
  "statusLabel": "CORRECTIVE CANDIDATE",
  "summary": "Server-authoritative Minecraft society layer with text and voice dialogue, Memory 2.0, operator lore, bounded AI actions and exact-artifact acceptance gates.",
  "tags": ["Minecraft", "Fabric", "Java 21", "Memory 2.0", "AI security"],
  "links": {"github": "https://github.com/True-Ruslan/villAIgence"}
}
```

- [ ] **Step 2: Replace the timeline with five bounded milestones**

Use states:

```text
past    security baseline + Memory 2.0
past    Operator Lore S9–S10c
past    installed 0.1.20 PARTIAL PASS
current corrective 0.1.22 code candidate after PR #102
next    exact installed startup/water/grave/restart/cumulative acceptance
```

The current entry must link to `https://github.com/True-Ruslan/villAIgence/pull/102`.

- [ ] **Step 3: Refresh the evidence snapshot**

Set `lastVerified` to `2026-08-02`. Replace old LivingWorld version facts with stable VillAIgence facts and exactly three signals:

1. manual accepted-with-defects scope for PR #98 / installed `0.1.20` partial acceptance;
2. automated merged correction train PRs #99–#102, explicitly excluding installed acceptance;
3. manual failed installed `0.1.21` startup plus six-hash safe rollback, linked to PR #102 validation evidence.

Use supported signal states already accepted by the evidence schema (`accepted`, `merged`, `failed`).

- [ ] **Step 4: Run registry/evidence tests**

Run:

```bash
npm test
```

Expected: data validation tests and the data-only VillAIgence assertions pass; page and diagram assertions remain RED.

- [ ] **Step 5: Commit data refresh**

```bash
git add data/projects.json data/project-history/livingworld.json data/project-evidence.json
git commit -m "feat: refresh VillAIgence project evidence"
```

---

### Task 3: Publish the current seven-section VillAIgence narrative

**Files:**
- Modify: `docs/landing/projects/livingworld.md`
- Modify: `data/page-meta.json`
- Modify: `docs/landing/projects.md`
- Modify: `docs/toc.yaml`
- Test: `scripts/flagship-case-study.test.js`
- Test: `scripts/villaigence-flagship.test.js`

**Interfaces:**
- Consumes: updated project/timeline/evidence data and stable `livingworld` route.
- Produces: searchable Diplodoc case study with one timeline placeholder, one evidence placeholder and one diagram reference.

- [ ] **Step 1: Replace the page header and repository identity**

Use:

```markdown
# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** — Minecraft 1.21.1 MCA-derived mod that evolves AI-assisted villager dialogue into a persistent living-society simulation layer.

[Repository on GitHub ↗](https://github.com/True-Ruslan/villAIgence)
```

Explain that `LivingWorld / livingworld` remains internal compatibility-sensitive engine/data naming.

- [ ] **Step 2: Rewrite all seven canonical sections**

Preserve the exact marker order:

```text
problem → constraints → decisions → failures → current-state → evidence → retrospective
```

Required content:

- immutable bounded context and server authority;
- text/voice convergence;
- episodic and semantic Memory 2.0;
- FACT/BELIEF provenance;
- operator lore S9–S10c;
- provider body/time/redirect/loopback boundaries;
- selective MCA synchronization;
- `0.1.20` partial PASS defects;
- `0.1.21` startup FAIL and safe rollback;
- PR #102 automated correction and `0.1.22` installed acceptance pending.

Include exact source head `e13660f5998fa1ed343548252d573140adc5b0c9` once in the current-state section.

- [ ] **Step 3: Preserve generated surfaces**

Keep exactly:

```html
<div data-tr-project-timeline="livingworld"></div>
<div data-tr-project-evidence="livingworld"></div>
```

Reference exactly one:

```markdown
![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)
```

- [ ] **Step 4: Update metadata and visible navigation labels**

Update the existing metadata record for `landing/projects/livingworld.html` to VillAIgence wording and an ASCII-compatible `displayTitle`. Replace user-facing `LivingWorld` labels in `docs/landing/projects.md` and `docs/toc.yaml` while keeping hrefs unchanged.

- [ ] **Step 5: Run page contract tests**

Run:

```bash
npm test
```

Expected: identity, narrative markers, route stability, no-overclaim and metadata assertions pass except for missing diagram safety assertions.

- [ ] **Step 6: Commit narrative**

```bash
git add docs/landing/projects/livingworld.md data/page-meta.json docs/landing/projects.md docs/toc.yaml
git commit -m "feat: publish current VillAIgence flagship narrative"
```

---

### Task 4: Add the production-safe authority and acceptance diagram

**Files:**
- Create: `docs/assets/diagrams/villaigence-authority-and-acceptance.svg`
- Create: `scripts/villaigence-diagram.test.js`
- Test: `scripts/flagship-case-study.test.js`
- Test: `scripts/villaigence-diagram.test.js`

**Interfaces:**
- Consumes: authority flow and release-gate flow from the design spec.
- Produces: one responsive semantic SVG whose critical paint survives published Diplodoc rendering.

- [ ] **Step 1: Write the diagram safety test first**

Require:

```js
assert.match(svg, /<title>VillAIgence authority and acceptance boundaries<\/title>/);
assert.match(svg, /<desc>/);
assert.doesNotMatch(svg, /<style\b/i);
assert.doesNotMatch(svg, /class=/i);
assert.match(svg, /fill="#[0-9A-Fa-f]{6}"/);
assert.match(svg, /stroke="#[0-9A-Fa-f]{6}"/);
assert.match(svg, /viewBox="0 0 1200 760"/);
```

Also require visible labels for `SERVER AUTHORITY`, `MEMORY 2.0`, `LLM PROPOSAL`, `EXACT JAR`, `INSTALLED ACCEPTANCE` and `PENDING`.

- [ ] **Step 2: Run and verify RED**

Run:

```bash
node --test scripts/villaigence-diagram.test.js
```

Expected: FAIL because the SVG is missing.

- [ ] **Step 3: Create the SVG**

Use only SVG elements and presentation attributes. Build two lanes:

- authority lane: player input → session validation → immutable context → providers/LLM proposal → server policy → authoritative mutation/persistence;
- evidence lane: source/tests → remapped package → exact identity → installed startup → focused regressions → restart hashes → cumulative acceptance.

Mark `0.1.20 PARTIAL PASS`, `0.1.21 STARTUP FAIL` and `0.1.22 LIVE RETEST PENDING` as bounded labels without suggesting progression to accepted release.

- [ ] **Step 4: Run unit tests**

Run:

```bash
npm test
```

Expected: all unit tests pass.

- [ ] **Step 5: Commit diagram**

```bash
git add docs/assets/diagrams/villaigence-authority-and-acceptance.svg scripts/villaigence-diagram.test.js
git commit -m "feat: add VillAIgence authority diagram"
```

---

### Task 5: Extend browser, search and artifact evidence

**Files:**
- Modify: `scripts/browser-quality.cjs`
- Modify: `scripts/layout-overflow-smoke.cjs`
- Modify: `scripts/cross-browser-smoke.cjs`
- Modify: `scripts/search-smoke.cjs`
- Modify: `scripts/project-evidence-smoke.cjs`
- Modify: `.github/workflows/build.yml`
- Test: existing quality helper tests where scenario declarations are asserted

**Interfaces:**
- Consumes: generated `landing/projects/livingworld.html` and the new SVG.
- Produces: exact-head desktop/mobile screenshots, cross-browser route coverage, generated-search assertion and retained artifact evidence.

- [ ] **Step 1: Add VillAIgence page assertions to Chromium quality**

Require the generated page to contain:

```text
VillAIgence
Memory 2.0
PARTIAL PASS
0.1.22+1.21.1
```

Capture `artifacts/villaigence-desktop.png` and `artifacts/villaigence-mobile.png`.

- [ ] **Step 2: Add mobile overflow and cross-browser coverage**

Add `landing/projects/livingworld.html` as an explicit mobile overflow target and a Firefox/WebKit route check using the visible `VillAIgence` heading.

- [ ] **Step 3: Extend Project Evidence browser acceptance**

Require the LivingWorld-key evidence block to render three signals and preserve distinct accepted/merged/failed semantics in enhanced mode. Keep no-JS semantic fallback coverage.

- [ ] **Step 4: Extend generated search smoke**

Search for the exact term `VillAIgence` and require the result href to resolve to `landing/projects/livingworld.html`. Do not create a second route or search owner.

- [ ] **Step 5: Preserve exact HTML and screenshots in CI artifact**

Add copies for:

```text
docs-html/landing/projects/livingworld.html
artifacts/villaigence-desktop.png
artifacts/villaigence-mobile.png
```

Keep existing LivingWorld artifact names only if downstream scripts require them; otherwise use VillAIgence-facing artifact names without changing the route.

- [ ] **Step 6: Run unit tests and production build**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit quality coverage**

```bash
git add scripts/browser-quality.cjs scripts/layout-overflow-smoke.cjs scripts/cross-browser-smoke.cjs scripts/search-smoke.cjs scripts/project-evidence-smoke.cjs .github/workflows/build.yml
git commit -m "test: cover VillAIgence flagship in browser gates"
```

---

### Task 6: Run exact-head CI and accept only reviewed visual changes

**Files:**
- Modify only if review approves: `tests/visual-baselines.json`
- No product changes after the final exact-head verification commit.

**Interfaces:**
- Consumes: full feature branch.
- Produces: exact-head evidence for merge and reviewed visual baselines.

- [ ] **Step 1: Push/open a draft PR and run full Build workflow**

Expected stages include unit, production build, integrity, overflow, Chromium/Axe/Lighthouse, evidence, diagram, cross-browser, search, metadata, visual regression and custom-domain artifact verification.

- [ ] **Step 2: Inspect failures factually**

For any failure, retrieve the exact job log and artifact. Fix product/test defects rather than weakening thresholds.

- [ ] **Step 3: Manually review exact-head screenshots**

Review:

- homepage desktop/mobile;
- Projects desktop/mobile;
- VillAIgence desktop/mobile;
- VillAIgence evidence block;
- diagram raster;
- no-JS evidence fallback.

Confirm name consistency, legibility, no overflow and no wording that upgrades pending live acceptance.

- [ ] **Step 4: Update only approved visual baselines**

Regenerate baseline samples from exact-head screenshots only for intentionally changed surfaces. Run the full Build workflow again on the new exact head.

- [ ] **Step 5: Record final evidence in the PR body**

Record:

```text
RED head and run
final GREEN head and run
unit test count
artifact ID and SHA-256 digest
manual visual-review scope
source-repository head e13660f5998fa1ed343548252d573140adc5b0c9
live acceptance boundary: 0.1.22 pending
```

- [ ] **Step 6: Merge with expected-head protection**

Use squash merge only after the complete exact-head matrix succeeds.

---

### Task 7: Synchronize durable landing state after merge

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: merged feature PR identity and final exact-head evidence.
- Produces: durable new-session handoff that distinguishes landing feature acceptance from VillAIgence installed-release acceptance.

- [ ] **Step 1: Create a separate docs branch from the feature merge commit**

- [ ] **Step 2: Record the milestone**

Include feature PR, exact feature head, Build/run, test count, artifact digest, squash commit, source-repository head and the `0.1.22` live-pending boundary.

- [ ] **Step 3: Advance the roadmap**

Set the next content step to:

```text
/now synchronization
→ one or two grounded Engineering Notes
→ first genuine Photo Story when authentic material exists
→ distribution and 3–4 weeks aggregate telemetry
```

Do not invent a new product milestone without evidence.

- [ ] **Step 4: Run the full docs-only CI and merge**

Use exact-head protection and record the continuity squash commit.
