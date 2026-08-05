# P3.3 Flagship Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize VillAIgence and Vlezet to the accepted evidence-first flagship narrative while preserving all current lifecycle and acceptance boundaries.

**Architecture:** Keep Markdown pages and canonical registries as the only content sources. Add fail-closed narrative/evidence contracts, restructure the existing RU pages and controlled EN VillAIgence page in place, then extend existing browser and deployment verification without creating a new generator, route or search index.

**Tech Stack:** Node.js 24, Node test runner, Diplodoc/YFM, Markdown, JSON registries, Playwright 1.61.1, Axe, Lighthouse, GitHub Actions, GitHub Pages.

## Global Constraints

- Preserve static-first + build-time intelligence + progressive enhancement.
- Preserve routes `/landing/projects/livingworld/`, `/landing/projects/vlezet/` and `/en/projects/livingworld/`.
- Preserve slugs `livingworld` and `vlezet`, diagrams, RU timeline/evidence placeholders and repository links.
- Do not create an English Vlezet page in P3.3.
- Do not change `data/projects.json` lifecycle, label, visibility or route fields.
- Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted; M7.8C Draft and pending product-owner retest.
- VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`; production-JAR startup/restart accepted; cumulative manual acceptance pending.
- PR #110 is Draft/RED development evidence only.
- No runtime API, backend, CMS, second search index, behavioural telemetry or automatic public-state mutation.
- No visual-baseline tolerance increase and no quality-gate weakening.

---

### Task 1: Add RED narrative and acceptance-boundary contracts

**Files:**
- Modify: `scripts/flagship-case-study.test.js`
- Create: `scripts/flagship-normalization.test.js`

**Interfaces:**
- Consumes: Markdown markers, `data/projects.json`, `data/project-evidence.json`, project histories and existing note routes.
- Produces: fail-closed unit contracts for normalized narrative order, registry-backed statuses and Draft/accepted separation.

- [ ] **Step 1: Change RU VillAIgence and Vlezet to the evidence-first marker contract in the test**

Use the existing `EVIDENCE_FIRST_MARKERS` array for `livingworld` and `vlezet`, and add a required status identity:

```js
{
  slug: 'livingworld',
  file: 'livingworld.md',
  timeline: 'livingworld',
  evidence: 'livingworld',
  status: 'livingworld',
  diagram: '../../assets/diagrams/villaigence-authority-and-acceptance.svg',
  markers: EVIDENCE_FIRST_MARKERS,
},
{
  slug: 'vlezet',
  file: 'vlezet.md',
  timeline: 'vlezet',
  evidence: 'vlezet',
  status: 'vlezet',
  diagram: '../../assets/diagrams/vlezet-recognition-authority.svg',
  markers: EVIDENCE_FIRST_MARKERS,
},
```

Inside the test require exactly one status placeholder and reject the obsolete marker:

```js
if (flagship.status) {
  const status = `<span data-tr-project-status="${flagship.status}"></span>`;
  assert.equal(count(source, status), 1, `${flagship.slug}: status placeholder must appear exactly once`);
}
assert.equal(count(source, '<!-- case-study:failures -->'), 0,
  `${flagship.slug}: obsolete failures marker must be removed`);
```

- [ ] **Step 2: Add controlled EN VillAIgence marker coverage**

Add `EN_PROJECT_DIR` and a test that requires the same ordered markers in `docs/en/projects/livingworld.md`, requires `data-tr-project-status="livingworld"`, and rejects `case-study:failures`.

- [ ] **Step 3: Add acceptance-boundary test data**

Create `scripts/flagship-normalization.test.js` with parsers for projects/evidence/history and Markdown sources. Require these exact boundaries:

```js
assert.equal(projects.get('vlezet').status, 'pre-production');
assert.equal(projects.get('vlezet').statusLabel, 'ACTIVE DEVELOPMENT');
assert.equal(projects.get('livingworld').status, 'release-candidate');
assert.equal(projects.get('livingworld').statusLabel, 'ACCEPTANCE IN PROGRESS');
```

Require the Vlezet pending signal to include all of:

```text
PR #42
c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a
CI #3138
Recognition Benchmark #316
M7 Browser Audit #769
product-owner retest
not an acceptance
```

Require the VillAIgence pending signal to include all of:

```text
PR #110
e0b763aa4a5caea8897aadc6ee2cab6c1b407c89
Draft
RED
no production implementation
cumulative acceptance
```

Require related links for:

```text
probabilistic-proposals-deterministic-authority
server-authoritative-ai-npcs
source-tests-to-installed-acceptance
restart-persistence-is-a-product-contract
```

- [ ] **Step 4: Run the RED test suite**

Run:

```bash
npm test
```

Expected: FAIL because the pages still use the classic order, RU status placeholders are absent, and PR #110 is not yet represented in canonical evidence.

- [ ] **Step 5: Commit RED contracts**

```bash
git add scripts/flagship-case-study.test.js scripts/flagship-normalization.test.js
git commit -m "test: define P3.3 flagship normalization contract"
```

---

### Task 2: Refresh canonical external evidence without promotion

**Files:**
- Modify: `data/project-evidence.json`
- Modify: `data/project-history/livingworld.json`
- Verify: `data/project-history/vlezet.json`

**Interfaces:**
- Consumes: actual GitHub state observed on 2026-08-05.
- Produces: canonical pending evidence rendered by Project Evidence and timeline generators.

- [ ] **Step 1: Refresh Vlezet pending evidence**

Set `lastVerified` to `2026-08-05`. Keep all accepted signals unchanged. Update the PR #42 pending scope so it states that observed head `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a` passed CI #3138, Recognition Benchmark #316 and M7 Browser Audit #769, while the same real-plan product-owner retest remains mandatory and M7.8B remains the accepted boundary.

- [ ] **Step 2: Add VillAIgence PR #110 as pending Draft/RED evidence**

Set `lastVerified` to `2026-08-05` and append:

```json
{
  "kind": "pr",
  "mode": "automated",
  "label": "M11 Phase C shared orchestration deadline PR #110",
  "state": "pending",
  "url": "https://github.com/True-Ruslan/villAIgence/pull/110",
  "observedAt": "2026-08-05",
  "scope": "PR #110 is an open Draft at observed head e0b763aa4a5caea8897aadc6ee2cab6c1b407c89. It currently defines the RED contract for one shared STT → Chat retries → TTS deadline and exactly-once dialogue/relationship commits. Repository security and Java PR checks pass, while the main VillAIgence CI fails at the intentionally missing production APIs. This is pending development evidence: it proves no production implementation, no installed acceptance and no lifecycle promotion; cumulative acceptance remains pending."
}
```

Add a version row:

```json
{"label": "Active development slice", "value": "M11 Phase C shared orchestration deadline — Draft/RED"}
```

- [ ] **Step 3: Move VillAIgence active timeline state to Draft Phase C**

Change the PR #103/#104 timeline item from `current` to `past`. Add one `current` item for PR #110 that clearly says Draft/RED and no accepted implementation. Keep the `next` item as implementation/exact-head verification followed by cumulative provider, multiplayer and gameplay acceptance.

- [ ] **Step 4: Run focused registry tests**

Run:

```bash
node --test scripts/project-evidence.test.js scripts/project-history.test.js scripts/flagship-normalization.test.js
```

Expected: registry/history assertions pass; Markdown narrative assertions still fail until Tasks 3 and 4.

- [ ] **Step 5: Commit canonical evidence refresh**

```bash
git add data/project-evidence.json data/project-history/livingworld.json
git commit -m "docs: record bounded P3.3 external project evidence"
```

---

### Task 3: Normalize the Russian VillAIgence case study

**Files:**
- Modify: `docs/landing/projects/livingworld.md`

**Interfaces:**
- Consumes: registry status `livingworld`, timeline/evidence placeholders, existing bounded narrative and notes.
- Produces: canonical RU VillAIgence evidence-first page.

- [ ] **Step 1: Add registry-backed status near the introduction**

Insert exactly:

```html
**Текущий статус:** <span data-tr-project-status="livingworld"></span>
```

Keep repository link, compatibility-sensitive internal names, diagram and timeline.

- [ ] **Step 2: Reorder the existing narrative**

Use exactly this marker order:

```text
problem → constraints → current-state → decisions → alternatives → evidence → limitations → next → related → retrospective
```

Move accepted `0.1.23+1.21.1` and the cumulative-acceptance boundary into `current-state` before architecture decisions. Represent PR #110 separately as Draft/RED active work.

- [ ] **Step 3: Preserve real failure lessons without the obsolete marker**

Keep water navigation, filled-grave, latency, snapshot identity, Mixin startup and rollback lessons under an unmarked `## Реальные отказы, которые изменили архитектуру` section inside the decisions narrative. Remove `<!-- case-study:failures -->`.

- [ ] **Step 4: Add explicit rejected alternatives**

Add `<!-- case-study:alternatives -->` and reject:

- client-owned session/context/action authority;
- transcript-only memory;
- LLM-created FACT or direct world mutation;
- broad MCA merge or production-sensitive broad Mixins;
- source CI as release acceptance;
- a fresh independent timeout budget for every provider stage.

- [ ] **Step 5: Add bounded limitations, next step and related links**

Limitations must state cumulative acceptance, shared deadline, two-client lore conflict and focused live canaries are pending. Next must place M11 Phase C implementation/exact-head verification before cumulative acceptance. Related links must use existing clean Markdown targets:

```markdown
- [Server-authoritative AI NPC pipeline →](../notes/server-authoritative-ai-npcs.md)
- [LLM output as a protocol boundary →](../notes/llm-output-is-a-protocol-boundary.md)
- [Source tests to installed acceptance →](../notes/source-tests-to-installed-acceptance.md)
- [Probabilistic proposals and deterministic authority →](../notes/probabilistic-proposals-deterministic-authority.md)
- [Restart and persistence contract →](../notes/restart-persistence-is-a-product-contract.md)
- [Исходный код ↗](https://github.com/True-Ruslan/villAIgence)
```

- [ ] **Step 6: Run VillAIgence contracts**

Run:

```bash
node --test scripts/flagship-case-study.test.js scripts/flagship-normalization.test.js scripts/project-evidence.test.js
npm run build:docs
npm run check:site
```

Expected: RU VillAIgence assertions pass; EN and Vlezet assertions still fail until subsequent tasks.

- [ ] **Step 7: Commit RU VillAIgence normalization**

```bash
git add docs/landing/projects/livingworld.md
git commit -m "docs: normalize VillAIgence flagship narrative"
```

---

### Task 4: Normalize the Russian Vlezet case study

**Files:**
- Modify: `docs/landing/projects/vlezet.md`

**Interfaces:**
- Consumes: registry status `vlezet`, canonical evidence/history and existing recognition metrics.
- Produces: canonical RU Vlezet evidence-first page.

- [ ] **Step 1: Add registry-backed status near the introduction**

Insert exactly:

```html
**Текущий статус:** <span data-tr-project-status="vlezet"></span>
```

Keep repository link, authority diagram and timeline.

- [ ] **Step 2: Reorder the narrative to the accepted marker contract**

Move current accepted boundary before architecture decisions. State M0–M7.8B as accepted and PR #42 M7.8C as Draft with green automation but pending real-plan owner retest.

- [ ] **Step 3: Preserve failure lessons under decisions**

Keep calibration, Hough reading, symbol-network, spatially wrong AI and host-wall lessons as an unmarked section inside the decisions narrative. Remove `<!-- case-study:failures -->`.

- [ ] **Step 4: Add explicit rejected alternatives**

Reject:

- Canvas pixels as persistent truth;
- recognition directly overwriting `VlezetDocument`;
- cloud-created/moved/re-hosted geometry;
- line-first Hough as primary recognition owner;
- a separate authoritative 3D model;
- snapshot-only history that hides semantic Apply boundaries.

- [ ] **Step 5: Split evidence, limitations, next and related content**

Limitations must keep all known real-plan defects and the `0.90` target boundary. Next must require the same real-plan owner retest before M7.8C acceptance. Related links:

```markdown
- [AI proposal versus deterministic authority →](../notes/probabilistic-proposals-deterministic-authority.md)
- [Почему green CI не означает verified product →](../notes/green-ci-is-not-product-verification.md)
- [Все проекты →](../projects.md)
- [Исходный код ↗](https://github.com/True-Ruslan/vlezet)
```

- [ ] **Step 6: Run Vlezet and complete RU contracts**

Run:

```bash
node --test scripts/flagship-case-study.test.js scripts/flagship-normalization.test.js scripts/project-evidence.test.js scripts/project-history.test.js
npm run build:docs
npm run check:site
```

Expected: all RU narrative/data contracts pass; EN marker test remains RED.

- [ ] **Step 7: Commit RU Vlezet normalization**

```bash
git add docs/landing/projects/vlezet.md
git commit -m "docs: normalize Vlezet flagship narrative"
```

---

### Task 5: Normalize the existing English VillAIgence layer

**Files:**
- Modify: `docs/en/projects/livingworld.md`

**Interfaces:**
- Consumes: shared project status and Russian canonical evidence page.
- Produces: controlled EN narrative with no duplicate evidence registry.

- [ ] **Step 1: Apply the same ordered markers**

Use:

```text
problem → constraints → current-state → decisions → alternatives → evidence → limitations → next → related → retrospective
```

Keep the existing `data-tr-project-status="livingworld"` placeholder and authority diagram.

- [ ] **Step 2: Preserve the bounded EN evidence model**

The evidence section must link to `../../landing/projects/livingworld.md` and explicitly state that shared registries remain canonical. It must mention PR #110 only as Draft/RED development work.

- [ ] **Step 3: Add limitations, next and related English notes**

Use existing English note routes only:

```markdown
- [Designing a server-authoritative AI NPC pipeline →](../notes/server-authoritative-ai-npcs.md)
- [Why successful LLM output still may violate the contract →](../notes/llm-output-is-a-protocol-boundary.md)
- [Russian canonical evidence and timeline →](../../landing/projects/livingworld.md)
- [GitHub repository ↗](https://github.com/True-Ruslan/villAIgence)
```

- [ ] **Step 4: Run full unit/build integrity checks**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: PASS.

- [ ] **Step 5: Commit EN normalization**

```bash
git add docs/en/projects/livingworld.md
git commit -m "docs: normalize English VillAIgence narrative"
```

---

### Task 6: Extend local browser verification

**Files:**
- Modify: `scripts/v03-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: generated clean routes and registry-rendered status/evidence/timeline components.
- Produces: browser proof for all normalized routes and retained evidence boundaries.

- [ ] **Step 1: Add a normalized-case-study browser helper**

Add:

```js
async function assertNormalizedCaseStudy(page, {
  statusSlug,
  orderedHeadings,
  requiredText,
  relatedHrefFragments,
  requireTimeline = true,
  requireEvidence = true,
}) {
  const status = page.locator(`[data-project-status="${statusSlug}"]`).first();
  await status.waitFor({state: 'visible'});
  if ((await status.innerText()).trim() !== expectedProjectStatus(statusSlug)) {
    throw new Error(`${statusSlug} case-study status drifted from Project Registry.`);
  }

  const headings = await page.locator('main.dc-doc-page__content h2').allInnerTexts();
  let previous = -1;
  for (const expected of orderedHeadings) {
    const index = headings.findIndex((heading, candidate) => candidate > previous && heading.includes(expected));
    if (index === -1) throw new Error(`${statusSlug} is missing ordered section ${expected}.`);
    previous = index;
  }

  const text = await page.locator('main.dc-doc-page__content').innerText();
  for (const marker of requiredText) {
    if (!text.includes(marker)) throw new Error(`${statusSlug} is missing boundary marker ${marker}.`);
  }

  for (const fragment of relatedHrefFragments) {
    const link = page.locator(`a[href*="${fragment}"]`).first();
    await link.waitFor({state: 'visible'});
  }

  if (requireTimeline) await assertProjectTimeline(page, statusSlug);
  if (requireEvidence) await page.locator(`[data-project-evidence="${statusSlug}"]`).waitFor({state: 'visible'});
}
```

- [ ] **Step 2: Verify RU VillAIgence, RU Vlezet and EN VillAIgence**

Add Vlezet to the existing timeline loop. Require ordered section headings and bounded markers:

```text
VillAIgence: ACCEPTANCE IN PROGRESS, 0.1.23+1.21.1, PR #110, Draft, cumulative acceptance
Vlezet: ACTIVE DEVELOPMENT, M7.8B, M7.8C, product-owner retest
EN VillAIgence: ACCEPTANCE IN PROGRESS, PR #110, Draft, cumulative acceptance
```

- [ ] **Step 3: Preserve new diagnostics in the Build artifact**

The existing `v03-browser-smoke.log`, generated RU/EN HTML and screenshots are already copied. Add any new screenshot names only if the helper captures separate evidence not covered by existing artifacts.

- [ ] **Step 4: Run the browser smoke locally when tools are available**

Run:

```bash
npm run build:docs
npm install --prefix .quality-tools --package-lock=false --no-save playwright@1.61.1 @axe-core/playwright@4.12.1
node .quality-tools/node_modules/playwright/cli.js install --with-deps chromium
node scripts/v03-browser-smoke.cjs
```

Expected: PASS with no overflow, blocking Axe findings, browser errors or missing ordered sections.

- [ ] **Step 5: Commit browser verification**

```bash
git add scripts/v03-browser-smoke.cjs .github/workflows/build.yml
git commit -m "test: verify normalized flagship pages in browser"
```

---

### Task 7: Add deployment-only production verification

**Files:**
- Modify: `scripts/production-live-routes.cjs`
- Modify: `scripts/production-live-routes.test.js`
- Create: `scripts/production-flagship-normalization-smoke.cjs`
- Modify: `scripts/production-live-workflow.test.js`
- Modify: `.github/workflows/production-live.yml`

**Interfaces:**
- Consumes: exact successful GitHub Pages deployment and public clean routes.
- Produces: production evidence tied to the deployed SHA without making PR execution depend on undeployed content.

- [ ] **Step 1: Add route constants**

Add paths and URLs:

```js
const VILLAIGENCE_PATH = 'landing/projects/livingworld/';
const VLEZET_PATH = 'landing/projects/vlezet/';
const VILLAIGENCE_EN_PATH = 'en/projects/livingworld/';
```

Export their `new URL(..., APEX).href` values and add exact unit assertions.

- [ ] **Step 2: Write deployment-only Playwright smoke**

Create `production-flagship-normalization-smoke.cjs`. Use `main.dc-doc-page__content`, not broad `locator('main')`. For each route verify:

- HTTP success;
- expected H1;
- canonical URL;
- registry-rendered status;
- ordered H2 sections;
- required bounded text;
- no legacy GitHub Pages origin;
- no first-party request failure or page error;
- screenshot and JSON summary.

For RU routes require timeline and evidence components. For EN VillAIgence require the RU alternate and canonical-evidence link.

- [ ] **Step 3: Wire the smoke only after deployment**

Add after the platform smoke:

```yaml
- name: Run deployed flagship normalization smoke
  if: github.event_name != 'pull_request'
  env:
    EXPECTED_DEPLOYED_SHA: ${{ steps.pages.outputs.deployed_sha }}
  run: node scripts/production-flagship-normalization-smoke.cjs
```

Add script/test paths to `pull_request.paths`, include generated files in the existing production artifact, and preserve PR-safe baseline behavior.

- [ ] **Step 4: Extend workflow contract tests**

Require the deployment-only step, the three routes, scoped document selector, artifact summary and screenshots. Explicitly forbid `page.locator('main').innerText()`.

- [ ] **Step 5: Run production workflow unit contracts**

Run:

```bash
node --test scripts/production-live-routes.test.js scripts/production-live-workflow.test.js
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit production verification**

```bash
git add scripts/production-live-routes.cjs scripts/production-live-routes.test.js \
  scripts/production-flagship-normalization-smoke.cjs scripts/production-live-workflow.test.js \
  .github/workflows/production-live.yml
git commit -m "test: add deployed flagship normalization smoke"
```

---

### Task 8: Exact-head PR acceptance and visual review

**Files:**
- Potentially modify: `tests/visual-baselines.json` only for reviewed VillAIgence/Vlezet screenshots.
- Update: PR body only after evidence exists.

**Interfaces:**
- Consumes: feature branch exact head and GitHub Actions artifacts.
- Produces: mergeable PR with complete repository/generated-artifact proof.

- [ ] **Step 1: Open a draft PR**

Title:

```text
feat: normalize VillAIgence and Vlezet flagships
```

The body must list preserved lifecycle boundaries and state that production acceptance remains pending until exact Pages deployment.

- [ ] **Step 2: Inspect the first exact-head matrix**

Require:

```text
Build
CodeQL
Dependency Review
Production Live Smoke PR-safe baseline
```

Inspect every failed step rather than rerunning blindly.

- [ ] **Step 3: Review visual changes**

If only `villaigence-desktop.png`, `villaigence-mobile.png`, `vlezet-desktop.png` and `vlezet-mobile.png` change because of the approved narrative, compare actual dimensions and diff previews. Update only those entries in `tests/visual-baselines.json`; do not increase global tolerances.

- [ ] **Step 4: Re-run exact-head gates after any baseline/security/review change**

Require unit, build, integrity, mobile, browser/Axe/Lighthouse, Firefox/WebKit, Project Evidence, search, RU/EN, metadata, visual and custom-domain steps to pass on one exact head.

- [ ] **Step 5: Resolve all review threads and merge by squash**

Require zero unresolved review threads and use the exact expected head SHA.

---

### Task 9: Post-merge production acceptance and durable closure

**Files:**
- Modify after production proof: `docs/PROJECT_STATE.md`
- Modify after production proof: `docs/ROADMAP.md`
- Modify after production proof: `docs/CHANGELOG.md`
- Modify after production proof: `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`
- Modify after production proof: `scripts/clean-url-state.test.js`

**Interfaces:**
- Consumes: accepted squash SHA, exact Pages deployment ID, Production Live Smoke run and evidence digest.
- Produces: durable P3.3 closure and promotion of P3.4 as the next slice.

- [ ] **Step 1: Wait for the exact Pages deployment**

Verify the successful `github-pages` deployment SHA equals the feature squash SHA.

- [ ] **Step 2: Require all live smokes**

Require:

```text
baseline production smoke: PASS
portfolio platform smoke: PASS
flagship normalization smoke: PASS
favicon smoke: PASS
```

Inspect the production evidence JSON/screenshots and artifact digest.

- [ ] **Step 3: Create a durable closure branch**

Record feature PR, exact head, squash, Build/CodeQL/Dependency Review, quality artifact, Pages deployment, Production Live Smoke and production artifact digest.

- [ ] **Step 4: Update Portfolio 1.0 state**

Mark P3.3 DONE and promote **P3.4 — Grounded Engineering Notes**. Preserve issue #82, issue #111, clean URL, Vlezet Draft and VillAIgence manual-acceptance boundaries.

- [ ] **Step 5: Extend durable regression coverage**

Add exact P3.3 markers and P3.4 next-step assertions to `scripts/clean-url-state.test.js`.

- [ ] **Step 6: Run and merge the closure PR**

Require full exact-head Build, CodeQL and Dependency Review. After squash merge, require exact Pages deployment and baseline/platform/flagship/favicon production smokes again.
