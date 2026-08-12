# Navigation & Information Architecture Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the visible Diplodoc sidebar with the five-item header IA, add a scan-first Materials hub, hide the English build branch without removing English routes, and preserve route/search/i18n contracts.

**Architecture:** Keep `docs/toc.yaml` as the single navigation/build source. Use native Diplodoc nesting and `hidden: true`; do not add runtime sidebar JavaScript. Add `landing/materials.md` with existing visual primitives and metadata through `data/page-meta.json`.

**Tech Stack:** Node.js 24, Diplodoc CLI, Markdown/YAML, Playwright quality harness, GitHub Actions.

## Global Constraints

- Preserve static-first + build-time intelligence + progressive enhancement.
- Visible root order: `Проекты → Опыт → Материалы → Работа со мной → Обо мне`.
- Do not delete or rename existing public routes or canonical URLs.
- No new dependency, navigation runtime, locale build, search index, or browser-language redirect.
- Keep English Markdown entries as a `hidden: true` build-only TOC branch.
- Keep the existing top-right language control as the sole visible locale selector.
- Do not reset the clean-URL observation clock.

---

### Task 1: Navigation IA contract

**Files:**
- Create: `scripts/navigation-ia.test.js`
- Read: `docs/toc.yaml`, `templates/index.html`, `data/i18n.json`

- [ ] Write a failing test that requires exactly five visible root items in the approved order.
- [ ] Require Materials children in order: Publications, Engineering Map, Engineering Notes, Sources.
- [ ] Require Engineering Notes to contain `Все заметки` first, then every current individual note route in its current order.
- [ ] Require About children in order: Сейчас, Фото, Контакты.
- [ ] Require `English` to remain present with `hidden: true`, but not count as a visible root item.
- [ ] Require the RU standalone header to keep the same five labels/order and point `Материалы` to `landing/materials.html`.
- [ ] Require all current i18n-owned source/build routes to remain represented.
- [ ] Push the RED test-only commit and verify CI fails for the expected old-IA reason.

Commit: `test: define navigation IA contract`.

### Task 2: Canonical TOC and Materials hub

**Files:**
- Modify: `docs/toc.yaml`
- Create: `docs/landing/materials.md`
- Modify: `templates/index.html`
- Modify: `data/page-meta.json`

- [ ] Restructure the visible TOC to the five approved roots.
- [ ] Preserve existing project children unchanged.
- [ ] Under Materials add Publications, Engineering Map, Engineering Notes, Sources.
- [ ] Under Engineering Notes add `Все заметки` followed by every current note unchanged.
- [ ] Under About add Сейчас, Фото, Контакты.
- [ ] Mark the existing English group `hidden: true` without changing its children.
- [ ] Create the scan-first Materials hub using existing `tr-resume-grid` / `tr-resume-panel` primitives; no new stylesheet.
- [ ] Update the RU header Materials href to `landing/materials.html` only.
- [ ] Add one RU Materials metadata entry; do not create an English Materials route.
- [ ] Verify focused test and full `npm test` are GREEN.

Commit: `feat: align navigation information architecture`.

### Task 3: Generated browser acceptance

**Files:**
- Create: `scripts/navigation-ia-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`
- Extend: `scripts/navigation-ia.test.js`

- [ ] First extend the source contract to require the browser smoke and workflow step, producing a second RED state.
- [ ] Browser smoke must verify the Materials page, five-root sidebar order, nested Materials/Notes/About discoverability, no visible English sidebar root, direct EN route loading, paired language switching, keyboard disclosure access where rendered, and no desktop/mobile overflow or console/page errors.
- [ ] Add a dedicated `Navigation IA browser smoke` Build step and preserve its log in quality artifacts.
- [ ] Run exact-head full Build, Dependency Review and CodeQL; do not weaken existing browser/a11y/i18n/search/visual/custom-domain gates.

Commit: `test: verify navigation IA in browser`.

### Task 4: Durable state and shipping

**Files:**
- Modify: `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`

- [ ] Reconcile durable docs only after exact-head evidence exists; distinguish implemented/tested/merged/production-accepted states.
- [ ] Review exact diff, CI, comments and review threads.
- [ ] Squash merge using the exact reviewed head SHA.
- [ ] Verify Pages and Production Live Smoke on the exact merge SHA before claiming production acceptance.

## Self-review

The plan covers all approved IA, language, route, browser, accessibility, CI and shipping requirements. No existing route is intentionally removed, and no new runtime navigation mechanism is introduced.
