# `/now` Synchronization After Flagships Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an accurate 2026-08-02 `/now` snapshot after the Vlezet, Publications and VillAIgence milestones without adding a new schema, renderer or source of project status truth.

**Architecture:** Keep `data/projects.json` as the owner of active project cards and `data/now.json` as the owner of short-lived editorial focus. Strengthen the existing `scripts/now-page.test.js` contract first, then update only the editorial registry and prove the unchanged static-first build through the full repository quality matrix.

**Tech Stack:** Node.js 24, `node:test`, JSON registries, existing `scripts/now-page.js` build-time renderer, Diplodoc, GitHub Actions browser/visual/custom-domain quality gates.

## Global Constraints

- Keep route `landing/now.html` unchanged.
- Keep the existing `updated`, `focus`, `learning`, `writing` schema unchanged.
- Keep active project cards derived from `data/projects.json`.
- Public identity is `VillAIgence`; stable slug/route remains `livingworld` / `landing/projects/livingworld.html`.
- Do not claim installed acceptance for VillAIgence `0.1.22+1.21.1`.
- Do not claim accurate arbitrary-plan recognition for Vlezet.
- Do not claim meaningful audience telemetry before the observation window exists.
- Add no backend, CMS, runtime API, automatic public truth mutation, CSS redesign or visual-threshold weakening.

---

### Task 1: Add the fail-closed `/now` freshness contract

**Files:**
- Modify: `scripts/now-page.test.js`

**Interfaces:**
- Consumes: `loadNowData(nowPath?: string)`, `renderNowContent(nowData, projects)`, `validateNowData(data)` from `scripts/now-page.js`.
- Produces: a repository-data contract requiring the exact current date and current public project identities while preserving the stable LivingWorld route.

- [ ] **Step 1: Update the project fixture to the public VillAIgence identity**

Replace the current fixture with:

```js
const projects = [{
  slug: 'livingworld',
  name: 'VillAIgence',
  status: 'corrective-candidate',
  statusLabel: 'CORRECTIVE CANDIDATE',
  summary: 'Server-authoritative Minecraft AI society with bounded installed acceptance.',
  featured: true,
  active: true,
  visibility: 'public',
  href: 'landing/projects/livingworld.html',
  tags: ['Java 21', 'Memory 2.0'],
}];
```

- [ ] **Step 2: Strengthen the renderer assertion**

Import `loadNowData` and replace the old renderer test body with:

```js
const html = renderNowContent(nowData, projects);
assert.match(html, /VillAIgence/);
assert.doesNotMatch(html, /LivingWorld/);
assert.match(html, /href="landing\/projects\/livingworld\.html"/);
assert.match(html, /AI systems/);
assert.match(html, /Engineering Notes/);
assert.match(html, /datetime="2026-07-22"/);
```

- [ ] **Step 3: Add a repository snapshot contract before changing data**

Add:

```js
test('repository now snapshot reflects the post-flagship phase', () => {
  const current = loadNowData();
  const editorialText = [current.focus, ...current.learning, ...current.writing].join('\n');

  assert.equal(current.updated, '2026-08-02');
  assert.match(editorialText, /Vlezet/);
  assert.match(editorialText, /VillAIgence/);
  assert.match(editorialText, /installed|установленн/i);
  assert.match(editorialText, /Engineering Notes/);
  assert.doesNotMatch(editorialText, /LivingWorld/);
});
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
node --test scripts/now-page.test.js
```

Expected result: the renderer/validation tests pass, while `repository now snapshot reflects the post-flagship phase` fails because master data is dated `2026-07-22`, contains `LivingWorld`, and does not yet contain the approved Vlezet/VillAIgence acceptance wording.

- [ ] **Step 5: Commit the RED contract**

```bash
git add scripts/now-page.test.js
git commit -m "test: require current now snapshot"
```

---

### Task 2: Publish the minimal editorial snapshot

**Files:**
- Modify: `data/now.json`

**Interfaces:**
- Consumes: existing `validateNowData` schema with `updated`, `focus`, `learning`, `writing`.
- Produces: the short-lived authored copy rendered by `renderNowContent`; no project status data is duplicated.

- [ ] **Step 1: Replace `data/now.json` with the approved snapshot**

Use exactly:

```json
{
  "updated": "2026-08-02",
  "focus": "Сейчас я перехожу от наращивания инфраструктуры портфолио к следующему циклу: проверяю собственные продукты на реальных сценариях, фиксирую границы принятых и непринятых решений, превращаю накопленный опыт в содержательные материалы и постепенно вывожу сайт во внешнее распространение без преждевременных выводов по аналитике.",
  "learning": [
    "Надёжные AI-системы: где заканчивается предложение модели и начинается авторитетное состояние, как разделять source/package gates, установленную приёмку, rollback и persistent evidence на примере VillAIgence",
    "Assisted recognition в Vlezet: как объединять CV и LLM-предложения с confidence, ручной проверкой, deterministic validation и явным Apply, не выдавая черновое распознавание за точную геометрию",
    "Static-first distribution: как развивать контент, сохранять один источник истины и интерпретировать aggregate telemetry только после достаточного окна наблюдения"
  ],
  "writing": [
    "Готовлю Engineering Note о том, почему зелёный exact-head CI ещё не означает успешную приёмку установленного продукта",
    "Собираю Engineering Note о deterministic authority вокруг LLM/CV proposals: review, revalidation и explicit Apply",
    "Фиксирую материал о restart и persistence как продуктовом контракте, а не только детали хранения"
  ]
}
```

- [ ] **Step 2: Run the focused test and verify GREEN**

Run:

```bash
node --test scripts/now-page.test.js
```

Expected result: all focused tests pass, including exact date, Vlezet/VillAIgence/current-acceptance wording, stable `livingworld` href and absence of stale `LivingWorld` identity.

- [ ] **Step 3: Run the complete unit suite**

Run:

```bash
npm test
```

Expected result: zero failed tests.

- [ ] **Step 4: Build and validate the generated site locally**

Run:

```bash
npm run build:docs
npm run check:site
```

Expected result: both commands exit `0`; generated `docs-html/landing/now.html` contains `UPDATED`, date `2026-08-02`, registry-derived project cards and all three editorial sections.

- [ ] **Step 5: Commit the editorial update**

```bash
git add data/now.json
git commit -m "content: refresh current engineering focus"
```

---

### Task 3: Exact-head acceptance, merge and continuity

**Files:**
- Verify: `.github/workflows/build.yml`
- Verify generated/CI artifacts for `landing/now.html`
- Modify after feature merge: `docs/PROJECT_STATE.md`
- Modify after feature merge: `docs/ROADMAP.md`
- Modify after feature merge: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: exact feature head and existing GitHub Actions Build workflow.
- Produces: merged feature evidence plus a durable continuity snapshot using actual SHAs/run IDs/artifact digests.

- [ ] **Step 1: Open a draft feature PR from `content/sync-now-after-flagships` to `master`**

The PR body must state:

- data-only editorial refresh;
- unchanged schema/renderer/route/CSS;
- public VillAIgence name with stable `livingworld` route;
- explicit non-claims for VillAIgence installed acceptance, Vlezet arbitrary recognition and audience telemetry;
- RED and GREEN exact heads/runs as they become available.

- [ ] **Step 2: Run the full GitHub Actions matrix on the exact implementation head**

Required successful stages:

```text
Test
Build docs
Check generated site integrity
Mobile layout overflow smoke
Browser smoke, accessibility and Lighthouse
Publications browser smoke
Sources Knowledge Base browser smoke
Project Evidence browser smoke
VillAIgence diagram browser smoke
NODE ZERO diagram browser smoke
Photo Stories browser smoke
Portfolio v0.3 browser smoke
Firefox and WebKit compatibility smoke
Generated search browser smoke
VillAIgence generated search smoke
Minimal RU EN browser smoke
Privacy-friendly analytics browser smoke
Metadata and OpenGraph browser smoke
Engineering Map browser and accessibility smoke
Visual regression
Verify custom domain artifact
Upload quality evidence
```

- [ ] **Step 3: Inspect `/now` exact-head evidence**

Verify in the generated HTML and browser artifact:

- update date is `2026-08-02`;
- project cards are still registry-derived;
- `VillAIgence` is visible and `LivingWorld` is absent as public copy;
- the three lists wrap correctly on mobile;
- no horizontal overflow or serious/critical Axe violations;
- no misleading `0.1.22 accepted`, accurate arbitrary-plan recognition or audience-validation claim.

Do not update visual baselines unless the existing visual gate identifies a real expected `/now` screenshot change and the exact-head image has been manually reviewed.

- [ ] **Step 4: Merge the feature PR with expected-head protection**

Use squash merge only after the exact feature head is green and mergeable. Record the resulting master SHA.

- [ ] **Step 5: Create a docs-only continuity branch from the feature merge SHA**

Update:

- `PROJECT_STATE`: mark `/now` synchronization DONE and record feature PR/head/run/tests/artifact/digest;
- `ROADMAP`: advance immediate content priority to the first grounded Engineering Note while keeping genuine Photo Story and distribution/telemetry after it;
- `CHANGELOG`: record copy boundaries, TDD trail, quality matrix and no-architecture-change scope.

- [ ] **Step 6: Run the full matrix on the exact continuity head**

Expected result: all configured stages remain green with no product-code difference from the merged feature tree.

- [ ] **Step 7: Merge the continuity PR with expected-head protection**

Record the final master SHA and confirm there are no open landing PRs. Keep production Pages deployment and owner production acceptance as separate operational facts unless independently verified.