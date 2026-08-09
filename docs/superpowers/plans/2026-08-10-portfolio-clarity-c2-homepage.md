# Portfolio Clarity C2 Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the RU/EN homepage understandable in a 5–15 second scan by implementing the approved `Hero → Proof → Selected work → Experience → Writing → Work with me → Personal` hierarchy without weakening the static-first/evidence/privacy/SEO contracts.

**Architecture:** Keep the existing standalone static homepage templates and build-time renderer. Reuse Project Registry for selected work, Collaboration Registry for the Work with me bridge, and existing canonical routes for Experience/Writing/About. Add only presentation-layer homepage copy/rendering; do not create a new runtime state, content registry, search owner, or analytics behavior.

**Tech Stack:** Node.js 24 ESM, `node:test`, static HTML templates, CSS, Diplodoc build pipeline, Playwright-based browser/visual CI, GitHub Pages + deployment-bound Production Live Smoke.

## Global Constraints

- Preserve `static-first + build-time intelligence + progressive enhancement`.
- Core homepage content must remain useful without JavaScript.
- Diplodoc remains the single site-wide full-text search owner.
- Canonical registries remain the owners of volatile project/evidence/current-state truth.
- Primary navigation remains at most five semantic destinations per the approved redesign specification.
- Homepage selected work remains exactly the three public featured projects: VillAIgence, NotchHub, TrueRuslan Landing.
- Hero exposes one primary CTA and at most two secondary actions.
- Homepage removes Layer-3 acceptance terminology from the first scan path; exact evidence remains on project/deep-dive surfaces.
- RU and EN homepages use the same structural hierarchy while retaining editorially natural locale copy.
- Existing canonical/hreflang/OpenGraph/Sitemap/feed/search/privacy contracts must not regress.
- P3.6 Measurement remains open; C2 must not start, reset, close, or infer product impact from P3.6.
- No quality-gate weakening. Exact-head CI is not production acceptance; C2 is accepted only after exact Pages deployment and deployment-bound Production Live Smoke.

---

### Task 1: Define the C2 homepage contract RED-first

**Files:**
- Create: `scripts/portfolio-clarity-c2.test.js`
- Modify later in GREEN: `scripts/standalone-home.test.js`
- Modify later in GREEN: `scripts/homepage-evidence-paths.test.js`
- Modify later in GREEN: `scripts/home-experience-refinement.test.js`
- Modify later in GREEN: `scripts/work-with-me.test.js`

**Interfaces:**
- Consumes: current `renderStandaloneHome(template, siteUrl, projects, options)`.
- Produces: executable acceptance contract for the approved C2 hierarchy.

- [ ] **Step 1: Write the failing C2 source/render contract**

The new test must assert, for both `templates/index.html` and `templates/index.en.html`:

```js
assert.equal(count(template, '{{HOME_PROOF_STRIP}}'), 1);
assert.equal(count(template, '{{HOME_FLAGSHIPS}}'), 1);
assert.equal(count(template, '{{HOME_EXPERIENCE_BRIDGE}}'), 1);
assert.equal(count(template, '{{HOME_WRITING_BRIDGE}}'), 1);
assert.equal(count(template, '{{HOME_COLLABORATION_BRIDGE}}'), 1);
assert.equal(count(template, '{{HOME_PERSONAL_BRIDGE}}'), 1);
assert.doesNotMatch(template, /\{\{HOME_PRIMARY_PATHS\}\}|\{\{HOME_EVIDENCE_SIGNALS\}\}/);
assert.doesNotMatch(template, /now-title|explore-title|english-layer-title/);
```

It must assert ordered markers:

```text
hero < proof < flagships < experience < writing < collaboration < personal
```

It must also render the real template with canonical project/collaboration data and assert:

```js
assert.equal(count(html, 'data-home-proof='), 4);
assert.equal(count(html, 'data-home-flagship='), 3);
assert.equal(count(html, 'data-home-bridge="experience"'), 1);
assert.equal(count(html, 'data-home-bridge="writing"'), 1);
assert.equal(count(html, 'data-home-collaboration='), 1);
assert.equal(count(html, 'data-home-bridge="personal"'), 1);
assert.doesNotMatch(html, /EVIDENCE \/ CURRENT BOUNDARY|Принятый installed результат|Accepted installed result/);
```

- [ ] **Step 2: Run CI and verify RED**

Push only the plan + new C2 test, open a Draft PR and require Build to fail specifically because the old homepage still contains the previous placeholders/sections.

Expected: C2 test FAIL, existing unrelated contracts may still pass. Do not implement before this RED is observed.

---

### Task 2: Implement the build-time C2 presentation model

**Files:**
- Modify: `scripts/standalone-home.js`
- Modify: `scripts/standalone-home.test.js`

**Interfaces:**
- Produces: `renderHomepageProofStrip(locale)`, `renderHomepageBridge(kind, locale)` and updated `renderStandaloneHome(...)` placeholder replacement.
- Keeps: `selectHomepageFlagships(projects)` as the selected-work authority.

- [ ] **Step 1: Add four concise proof facts per locale**

Use presentation-only stable profile facts:

```text
RU:
5+ лет — коммерческой разработки
Java 11–25 — основной backend-стек
Spring Boot · Kafka — сервисы и интеграции
PostgreSQL · ClickHouse — data-heavy системы

EN:
5+ years — commercial engineering
Java 11–25 — primary backend stack
Spring Boot · Kafka — services and integrations
PostgreSQL · ClickHouse — data-intensive systems
```

Render semantic `<dl class="tr-home-proof-strip">` with four `data-home-proof` items. No SHA, PR, acceptance taxonomy or NOT TESTED text belongs here.

- [ ] **Step 2: Add three compact semantic bridges**

`experience`:
- RU heading `Коммерческая разработка`;
- EN heading `Commercial experience`;
- concise Java/backend/product/integration context;
- CTA to stable Experience route.

`writing`:
- RU heading `Инженерные материалы`;
- EN heading `Engineering writing`;
- links to Notes and Publications using already-existing routes; no new content/search owner.

`personal`:
- RU heading `Преподавание, исследование и личный контекст`;
- EN heading `Teaching, research and personal context`;
- concise teaching/postgraduate signal;
- primary About CTA plus secondary `/now` link.

- [ ] **Step 3: Keep selected work compact**

Retain `selectHomepageFlagships()` and status label as the one current-status signal. Render only the first three project tags on homepage cards:

```js
project.tags.slice(0, 3)
```

Do not change canonical Project Registry facts.

- [ ] **Step 4: Replace old placeholder ownership in `renderStandaloneHome`**

Remove homepage use of:

```text
{{HOME_PRIMARY_PATHS}}
{{HOME_EVIDENCE_SIGNALS}}
{{FEATURED_PUBLICATIONS}}
```

Add replacement of:

```text
{{HOME_PROOF_STRIP}}
{{HOME_EXPERIENCE_BRIDGE}}
{{HOME_WRITING_BRIDGE}}
{{HOME_PERSONAL_BRIDGE}}
```

Keep `{{HOME_FLAGSHIPS}}` and `{{HOME_COLLABORATION_BRIDGE}}`.

- [ ] **Step 5: Run unit tests**

Expected: new renderer tests GREEN; stale old-home tests may still fail until Task 3 is completed.

---

### Task 3: Rewrite RU/EN templates to the approved scan hierarchy

**Files:**
- Modify: `templates/index.html`
- Modify: `templates/index.en.html`
- Modify: `scripts/home-experience-refinement.test.js`
- Modify: `scripts/homepage-evidence-paths.test.js`
- Modify: `scripts/work-with-me.test.js`

**Interfaces:**
- Consumes new standalone-home placeholders from Task 2.
- Produces identical structural hierarchy in RU and EN.

- [ ] **Step 1: Rewrite hero copy and actions**

RU hero:

```text
Eyebrow: Java Backend Engineer · 5+ лет
Lead: Я backend-инженер с 5+ годами коммерческой разработки на Java. Создаю сервисы, интеграции и data-heavy системы; отдельно развиваю AI-инструменты и собственные продукты.
Primary CTA: Проекты
Secondary: Опыт
Secondary: Работа со мной
```

EN hero:

```text
Eyebrow: Java Backend Engineer · 5+ years
Lead: I am a backend engineer with 5+ years of commercial Java experience. I build services, integrations and data-intensive systems, and I also develop AI tooling and independent products.
Primary CTA: Projects
Secondary: Experience
Secondary: Work with me
```

Keep the existing terminal slot as a secondary visual detail after the hero actions, not as a required comprehension surface.

- [ ] **Step 2: Replace the body order**

Both templates must use:

```text
Hero
{{HOME_PROOF_STRIP}}
Selected work / {{HOME_FLAGSHIPS}}
{{HOME_EXPERIENCE_BRIDGE}}
{{HOME_WRITING_BRIDGE}}
{{HOME_COLLABORATION_BRIDGE}}
{{HOME_PERSONAL_BRIDGE}}
```

Delete standalone `Current focus`, `Остальная платформа`, `Selected English layer` and the old evidence/path placeholders from homepage templates.

- [ ] **Step 3: Update old homepage contracts**

Change tests that previously required three primary path cards, three evidence cards, or `Current focus` placement. They must now assert the C2 proof/bridge hierarchy and stable URLs.

Keep independent Work with me, Contacts, navigation, no-JS and collaboration-registry tests intact.

- [ ] **Step 4: Run complete unit suite**

Run through CI `npm test` on exact branch head. Expected: all unit tests PASS.

---

### Task 4: Apply the lighter C2 visual hierarchy

**Files:**
- Modify: `docs/_assets/style/home-refinement.css`
- Modify only if required by contract: `docs/_assets/style/home.css`
- Modify if intentional visual review requires it: `tests/visual-baseline-overrides.json` and/or `tests/visual-baselines.json`

**Interfaces:**
- Styles existing `.tr-home-actions`, `.tr-home-flagships`, `.tr-home-section` plus new proof/bridge classes.

- [ ] **Step 1: Add proof strip styling**

Desktop: four compact facts in one responsive row/grid, low card chrome, high value-label contrast.
Mobile: single/two-column flow with no horizontal overflow.

- [ ] **Step 2: Add bridge styling**

Use shared `.tr-home-bridge` with concise two-column/stacked layout; avoid nested-card grids. Experience/Writing/Personal must be visually lighter than Selected work.

- [ ] **Step 3: Shorten selected-work chrome**

Reduce card minimum height and excessive vertical spacing only where needed for the shorter summary layer. Do not alter project semantics.

- [ ] **Step 4: Verify browser/visual behavior**

Require Chromium/Axe/Lighthouse, mobile overflow, Firefox/WebKit and visual regression. If visual baselines change, inspect the generated screenshots/artifacts before updating any baseline; never blanket-increase thresholds.

---

### Task 5: Align collaboration bridge copy with positive-first C2 language

**Files:**
- Modify: `scripts/collaboration.js`
- Modify: `scripts/work-with-me.test.js`

**Interfaces:**
- Keeps the same `renderHomepageCollaborationBridge(collaboration, {locale})` and canonical availability data.

- [ ] **Step 1: Replace homepage-only bridge copy**

RU:

```text
Помогаю с backend-сервисами, интеграциями, архитектурными разборами, AI-инструментами и техническим наставничеством. Если задача похожа — можно сразу посмотреть форматы работы и написать напрямую.
```

EN:

```text
I help with backend services, integrations, architecture reviews, AI tooling and technical mentoring. If that matches the problem, you can review the available formats and contact me directly.
```

Do not change pricing/legal/privacy/contact model or Work with me page contracts in this task.

- [ ] **Step 2: Add a regression assertion**

Homepage bridge must not contain `evidence boundaries`, `без формы`, `CRM`, `не каталог`, or equivalent negative-first framing.

---

### Task 6: Exact-head review and production rollout

**Files:**
- No product files unless review finds a real defect.

- [ ] **Step 1: Run the full PR matrix**

Require exact-head:
- Build all quality stages;
- CodeQL;
- Dependency Review;
- Dependency Audit where triggered;
- PR-safe Production Live Smoke;
- generated search, RU/EN, privacy/Metrica, metadata/OpenGraph, Engineering Map and custom-domain artifact.

- [ ] **Step 2: Read-only change review**

Review the full PR diff for C2 spec compliance, route stability, copy accuracy, dead/duplicated ownership and evidence/privacy regressions.

- [ ] **Step 3: Squash merge only on exact GREEN head**

Use an expected-head guard. Do not merge from stale CI.

- [ ] **Step 4: Require exact Pages deployment**

The resulting master SHA must receive a successful GitHub Pages deployment and deployed-site smoke.

- [ ] **Step 5: Require deployment-bound Production Live Smoke**

Production Live must resolve the exact successful Pages deployment and pass baseline, Work with me, RU/EN, generated search, P3.4/P3.5 contracts, privacy/Metrica and favicon checks.

---

### Task 7: Record C2 durable acceptance without changing P3.6 truth

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`
- Create: `docs/acceptance/2026-08-10-portfolio-clarity-c2-homepage.md`
- Add/modify a bounded acceptance regression test under `scripts/`.

- [ ] **Step 1: Add exact production evidence**

Record feature PR, squash/deployed SHA, exact-head Build, artifacts/digests, CodeQL/Dependency Review, Pages run/deployment/artifact, Production Live run/artifact and observation timestamp.

- [ ] **Step 2: Advance redesign sequence only**

Mark C2 `PRODUCTION ACCEPTED` and set next redesign slice to `C3 — Projects + flagship summary layer`.

Explicitly preserve:

```text
P3.6 — NEXT / WAITING
```

No engagement, causality or product-impact claim is allowed.

- [ ] **Step 3: Verify and merge the durable-state PR**

Run its exact-head CI, review, squash merge, then confirm the docs-only deployment does not invalidate the already recorded C2 product acceptance boundary.
