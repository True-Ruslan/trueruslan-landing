# Portfolio Clarity C3 Projects + Flagship Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Projects surface into a scan-first curated portfolio and add a shared `At a glance` summary layer to the four public flagship case studies without weakening canonical project/evidence ownership.

**Architecture:** Keep the existing static Markdown + Diplodoc pipeline. The Projects hub remains editorial source content but all volatile lifecycle labels continue to resolve through `data/projects.json` and `data-tr-project-status` placeholders. Flagship summaries are semantic source HTML/Markdown placed before timelines and deep engineering sections; exact evidence, timelines and limitations remain below the summary layer rather than being duplicated into a new registry.

**Tech Stack:** Node.js 24 ESM, `node:test`, Diplodoc Markdown/HTML, existing Project Registry postprocessor, Playwright/Axe browser quality harness, GitHub Pages production verification.

## Global Constraints

- Preserve `static-first + build-time intelligence + progressive enhancement`.
- Core project and flagship content must remain useful without JavaScript.
- `data/projects.json` remains the owner of volatile public project lifecycle/status; C3 must not hard-code lifecycle labels as a second mutable truth.
- Project Evidence and project timelines remain the owners of exact evidence/history; C3 summary copy must not duplicate SHA/run identities.
- Projects primary hierarchy is exactly `Selected work → Commercial work → Labs & experiments` in RU and EN.
- Selected work contains exactly VillAIgence, NotchHub and TrueRuslan Landing; Vlezet remains public but does not return to the spotlight.
- NODE ZERO may appear only as a public case study with its private/proprietary boundary preserved; no repository link or invented public implementation claim.
- Flagship `At a glance` applies to VillAIgence, NotchHub, TrueRuslan Landing and Vlezet in both available locales.
- `At a glance` exposes contribution, compact stack, challenge, bounded result/current accepted state and registry-derived project status before the deep-dive sections.
- No exact SHA/run IDs in `At a glance`.
- TrueRuslan Landing source copy must use current root-level canonical RU routes and must not describe `/landing/...` as the canonical public namespace.
- Existing canonical/hreflang/OpenGraph/Sitemap/feed/search/privacy contracts remain unchanged.
- P3.6 remains open; C3 does not claim engagement or product impact.
- No quality-gate weakening. Exact-head CI is not production acceptance.

---

### Task 1: Define the C3 scan-path contract RED-first

**Files:**
- Create: `scripts/portfolio-clarity-c3.test.js`
- Modify later in GREEN: `docs/landing/projects.md`
- Modify later in GREEN: `docs/en/projects.md`
- Modify later in GREEN: flagship Markdown files listed in Tasks 3–4
- Modify later in GREEN: `docs/_assets/style/custom.css`
- Modify later in GREEN: `scripts/v03-browser-smoke.cjs`

**Interfaces:**
- Consumes: canonical source Markdown, `data-tr-project-status="<slug>"`, existing Project Registry postprocessing.
- Produces: source-level acceptance for Projects hierarchy and `data-tr-project-glance="<slug>"` summary markers.

- [ ] **Step 1: Write the failing source contract**

Create `scripts/portfolio-clarity-c3.test.js` with assertions that:

```js
const selected = ['livingworld', 'notchhub', 'portfolio-platform'];
const flagships = ['livingworld', 'notchhub', 'portfolio-platform', 'vlezet'];
```

For `docs/landing/projects.md` require ordered headings `Избранные проекты`, `Коммерческая разработка`, `Лаборатория и эксперименты`; for `docs/en/projects.md` require `Selected work`, `Commercial work`, `Labs & experiments`. Require exactly the three selected `data-c3-project` markers in the selected section, require one `data-c3-commercial="marketdb"`, require Vlezet/NODE ZERO/TaskHub/MiniChess/Godot in the labs section, and reject `data-c3-project="vlezet"` from the selected section.

For each RU/EN flagship require exactly one `data-tr-project-glance="<slug>"` before the first `case-study:problem` marker and require the source status placeholder to live inside that summary layer rather than as a duplicated top-level status line.

For TrueRuslan Landing reject canonical-route examples containing `/landing/projects/`, `/landing/resume/` or `/landing/notes/`.

- [ ] **Step 2: Push the test-only commit and verify RED**

Expected Build result: all pre-existing tests PASS; only the new C3 contract FAILS because the new hub hierarchy and flagship glance markers do not yet exist.

- [ ] **Step 3: Record RED evidence in the draft PR**

Record exact head SHA, Build run ID and exact failure count. Do not implement GREEN before the RED signal is observed.

---

### Task 2: Rebuild RU/EN Projects hub as a curated three-level portfolio

**Files:**
- Modify: `docs/landing/projects.md`
- Modify: `docs/en/projects.md`
- Modify: `docs/_assets/style/custom.css`
- Test: `scripts/portfolio-clarity-c3.test.js`

**Interfaces:**
- Consumes: `data-tr-project-status` placeholders and existing canonical project routes.
- Produces: semantic `.tr-project-index-grid` and `.tr-project-index-card` source blocks with `data-c3-project-group` markers.

- [ ] **Step 1: Replace the RU linear list with three explicit groups**

Use this exact hierarchy:

```text
# Проекты
intro
## Избранные проекты
VillAIgence
NotchHub
TrueRuslan Landing
## Коммерческая разработка
MarketDB
## Лаборатория и эксперименты
Vlezet
NODE ZERO
TaskHub
MiniChess
Godot Atmospheric Horror Template
```

Each selected card must contain only: project name, one human-readable value sentence, registry status placeholder, 2–4 compact technology/domain labels and one canonical case-study link. MarketDB keeps only existing public-safe claims already present in source content; no invented metrics. Labs cards use one sentence and one direct case-study link; NODE ZERO explicitly says the repository is private.

- [ ] **Step 2: Mirror the same hierarchy editorially in EN**

Use natural English copy rather than literal RU translation. English-only pages use canonical `/en/projects/.../` routes. Projects without an EN case study retain a clearly labelled RU fallback link; do not create fake EN pages.

- [ ] **Step 3: Add bounded C3 index styling**

Append `.tr-project-index-grid`, `.tr-project-index-card`, `.tr-project-index-card__meta`, `.tr-project-index-card__tags`, and compact commercial/labs variants to `docs/_assets/style/custom.css`. Requirements:

```css
.tr-project-index-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 1rem;
}

.tr-project-index-card {
  min-width: 0;
}
```

Keep body copy visually subordinate to titles/status, preserve focus-visible styling from global CSS, and collapse naturally to one column without horizontal overflow.

- [ ] **Step 4: Run C3 source contract**

Run: `node --test scripts/portfolio-clarity-c3.test.js`
Expected: Projects-hub assertions PASS; flagship-glance assertions still FAIL until Tasks 3–4.

- [ ] **Step 5: Commit the Projects hub slice**

Commit message: `feat: curate C3 projects portfolio hierarchy`.

---

### Task 3: Add the shared RU flagship `Коротко` layer

**Files:**
- Modify: `docs/landing/projects/livingworld.md`
- Modify: `docs/landing/projects/notchhub.md`
- Modify: `docs/landing/projects/portfolio-platform.md`
- Modify: `docs/landing/projects/vlezet.md`
- Modify: `docs/_assets/style/custom.css`
- Test: `scripts/portfolio-clarity-c3.test.js`

**Interfaces:**
- Produces: one `<dl class="tr-project-glance" data-tr-project-glance="slug">` per flagship.
- Status value remains an empty `<span data-tr-project-status="slug"></span>` until build-time Project Registry postprocessing.

- [ ] **Step 1: Insert `## Коротко` immediately after the introductory repository/hero content**

Each summary uses exactly five terms:

```text
Моя роль
Стек
Задача
Результат
Статус
```

Use 4–6 stack items, one sentence for challenge, one bounded result/current accepted-state sentence, and registry-derived status. Remove the duplicated old top-level `**Текущий статус:**` line.

- [ ] **Step 2: Keep project-specific summary claims bounded**

VillAIgence: server-authoritative AI/NPC architecture + release engineering; result may state official `0.2.0+1.21.1` and bounded installed Memory 2.0 acceptance, but no PR/run/SHA IDs.

NotchHub: solo/native macOS architecture + performance/security; result may state accepted `0.1.0 — Personal build` foundation and that M1 remains in development.

TrueRuslan Landing: product/architecture/quality ownership; result states production static-first portfolio with deployment-bound verification. Replace stale canonical route examples with `/projects/`, `/resume/`, `/notes/`, keeping `/en/...` and `/_search/ru/` as applicable.

Vlezet: product/domain/geometry/recognition architecture; result states M7.8B accepted and Assisted Tracing as the current bounded direction without promoting its design-only state.

- [ ] **Step 3: Add shared glance styling**

Append CSS for `.tr-project-glance` and its `dl/dt/dd` descendants. Use a two-column definition-list layout above 720px and one column below; no fixed heights and no horizontal scrolling.

- [ ] **Step 4: Run source contract**

Expected: all RU glance assertions PASS; EN glance assertions remain RED.

- [ ] **Step 5: Commit RU summaries**

Commit message: `feat: add C3 RU flagship summary layer`.

---

### Task 4: Add the equivalent EN flagship `At a glance` layer

**Files:**
- Modify: `docs/en/projects/livingworld.md`
- Modify: `docs/en/projects/notchhub.md`
- Modify: `docs/en/projects/portfolio-platform.md`
- Modify: `docs/en/projects/vlezet.md`
- Test: `scripts/portfolio-clarity-c3.test.js`

**Interfaces:**
- Produces the same `data-tr-project-glance` and registry status contracts as RU.

- [ ] **Step 1: Insert `## At a glance` with five exact fields**

```text
My contribution
Stack
Challenge
Result
Status
```

Use editorial English and the same evidence boundary as RU. Do not duplicate exact PR/SHA/run identities in the summary.

- [ ] **Step 2: Preserve explicit RU fallback semantics outside the four English flagships**

Do not add English NODE ZERO/TaskHub/MiniChess/Godot pages. The EN Projects index continues to label those links as RU when applicable.

- [ ] **Step 3: Run C3 source contract**

Run: `node --test scripts/portfolio-clarity-c3.test.js`
Expected: PASS.

- [ ] **Step 4: Commit EN summaries**

Commit message: `feat: add C3 EN flagship summary layer`.

---

### Task 5: Extend browser acceptance and run the full quality matrix

**Files:**
- Modify: `scripts/v03-browser-smoke.cjs`
- Modify only if reviewed visual output intentionally changes: `tests/visual-baseline-overrides.json`
- Test: `scripts/portfolio-clarity-c3.test.js`

**Interfaces:**
- Browser smoke consumes generated canonical routes after clean-URL postprocessing and Project Registry status injection.

- [ ] **Step 1: Extend Projects-hub browser assertions**

On `/projects/` require the three group markers in DOM order, exactly three selected cards, `marketdb` commercial marker, Vlezet only in labs, canonical root-level project links, and registry-derived statuses for selected public projects.

- [ ] **Step 2: Extend flagship browser assertions**

Update `assertNormalizedCaseStudy` to optionally require a glance marker. For VillAIgence, Vlezet, NotchHub and TrueRuslan Landing RU/EN routes require one visible `[data-tr-project-glance="slug"]` before the first deep-dive H2, verify its status text equals Project Registry, and run Axe/no-overflow through the existing `checkPage` harness.

- [ ] **Step 3: Verify TrueRuslan Landing canonical namespace**

On RU TrueRuslan page assert visible source content contains `/projects/`, `/resume/`, `/notes/` and does not present `/landing/projects/`, `/landing/resume/`, `/landing/notes/` as current canonical examples.

- [ ] **Step 4: Run exact-head quality matrix**

Required green checks:

```text
node --test scripts/portfolio-clarity-c3.test.js
npm test
Build full 31-stage quality matrix
CodeQL
Dependency Review
Dependency Audit Evidence
```

Browser stages must include Chromium/Axe/Lighthouse, Firefox/WebKit, generated search, RU/EN, privacy/Metrica, visual regression and custom-domain artifact verification. Do not accept new baselines without manual inspection of the changed Projects/flagship screenshots.

- [ ] **Step 5: Perform read-only final diff review**

Review source hierarchy, duplicated volatile facts, RU/EN parity, canonical URLs, accessibility semantics, mobile overflow, private NODE ZERO boundary and stale next-step claims. Fix P0–P3 findings before marking the PR ready.

- [ ] **Step 6: Production acceptance after merge**

C3 is not production-accepted from PR CI. After an explicitly authorized squash merge, require successful Pages deployment for the resulting exact `master` SHA and deployment-triggered Production Live Smoke. Only then update `PROJECT_STATE.md`, `ROADMAP.md`, `CHANGELOG.md` and a C3 acceptance ledger. P3.6 remains open until C7 establishes the final redesign baseline.
