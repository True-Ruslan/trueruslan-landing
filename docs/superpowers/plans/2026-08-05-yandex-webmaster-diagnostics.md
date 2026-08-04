# Yandex Webmaster Diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a robot-stable root favicon, normalize every generated page to the same absolute favicon URL, preserve the current Sitemap/HTTPS/privacy decisions, and record Yandex Webmaster diagnostics as bounded operational evidence.

**Architecture:** Keep the canonical SVG source in `docs/assets/images/favicon.svg`. The normal build finishes its existing post-processing and then runs a dedicated deterministic favicon postprocessor. It copies the same bytes to `docs-html/favicon.svg` and rewrites every generated icon link to `/favicon.svg`, independent of page depth, standalone templates or `<base>`. A deployment-only Playwright smoke verifies the exact root asset and rendered links after Pages publication.

**Tech Stack:** Node.js 24, node:test, Diplodoc static build, GitHub Actions, Playwright production smoke.

## Global Constraints

- Preserve static-first and build-time-only architecture.
- Do not add Yandex Metrica, behavioural analytics, session replay, cookies, or runtime APIs.
- Do not create a Yandex Business or regional-commercial claim for a personal engineering portfolio.
- Keep `https://trueruslan.ru/` as the only canonical public origin.
- Keep `robots.txt` and `sitemap.xml` deterministic and canonical.
- Do not weaken existing unit, browser, accessibility, visual, security, or production gates.

---

### Task 1: Record the external diagnostic boundary

**Files:**
- Create: GitHub issue #111 `Yandex Webmaster diagnostic reconciliation`

- [x] Classify `YW-01` through `YW-07` as repository defect, external pending state, duplicate, accepted non-goal or not applicable.
- [x] Preserve Yandex Metrica, Yandex Business and artificial regional claims as explicit non-goals.
- [x] Record Sitemap submission, HTTP→HTTPS state, “No region”, recrawl and 10–14 day recheck as operator actions requiring the authenticated Webmaster UI.

---

### Task 2: Establish the favicon contract through TDD

**Files:**
- Create: `scripts/favicon.test.js`

- [x] Add tests for a byte-equal root SVG publication.
- [x] Add root, nested and search-page fixtures with different link syntax and `<base>` behavior.
- [x] Verify RED on exact head `6c2a267d1c5f0f16c6d25747ebb78f2fcf00a2d1` through Build #766 / `30952175051`.
- [x] Preserve unrelated resource links and reject duplicate favicon `href` insertion.

---

### Task 3: Implement deterministic root favicon publication

**Files:**
- Create: `scripts/favicon.js`
- Modify: `package.json`
- Modify: `docs/.yfm`
- Modify: `scripts/visual-config.test.js`

**Interfaces:**
- `copyRootFavicon({docsDir, outputDir}) -> 'favicon.svg'`
- `normalizeFaviconLinks(outputDir, href = '/favicon.svg') -> string[]`

- [x] Implement recursive generated-HTML discovery using Node core modules only.
- [x] Copy `docs/assets/images/favicon.svg` byte-for-byte to `docs-html/favicon.svg` and fail clearly when inputs are missing.
- [x] Normalize every generated `<link rel="...icon...">` to `/favicon.svg`, including self-closing and reordered attributes.
- [x] Run the postprocessor after the existing `copy-assets.js` stage through `npm run postprocess:favicon`.
- [x] Set Diplodoc `favicon-src` to `/favicon.svg`.
- [x] Confirm the generated build reports root publication and normalized standalone pages.

---

### Task 4: Extend exact production verification

**Files:**
- Create: `scripts/production-favicon-smoke.cjs`
- Create: `scripts/production-favicon-workflow.test.js`
- Modify: `.github/workflows/production-live.yml`

- [x] Reuse the existing read-only, deployment-aware Production Live Smoke workflow.
- [x] Require an HTTP-successful `https://trueruslan.ru/favicon.svg` response with SVG MIME type, SVG markup and a meaningful body size.
- [x] Require the homepage and `landing/resume.html` favicon links to resolve exactly to the root canonical asset.
- [x] Keep the new assertion deployment-only so PR checks do not test an undeployed branch against current production.
- [x] Preserve `production-favicon-summary.json` inside the existing production evidence artifact.

---

### Task 5: Verify, merge and close durable state

**Feature PR:** #112 `fix: reconcile Yandex Webmaster favicon diagnostics`

- [x] Open a draft PR and preserve the intentional RED evidence.
- [x] Pass 345/345 unit tests, build generation and site integrity on implementation head `dce732767057f472b2d0ef05e400a0e184230649`.
- [x] Pass browser, accessibility, Lighthouse, Firefox/WebKit, search, RU/EN, analytics, visual regression and custom-domain artifact checks on Build #777 / `30952796831`.
- [x] Pass CodeQL #242, Dependency Review #205, Dependency Audit Evidence #16 and the existing PR Production Live Smoke #42.
- [ ] Re-run the complete exact-head matrix after this plan synchronization.
- [ ] Mark PR #112 ready and merge only with all required checks green.
- [ ] Verify exact squash SHA through Pages deployment and deployment-driven Production Live Smoke, including `production-favicon-summary.json`.
- [ ] Update issue #111 with repository evidence while retaining only authenticated Webmaster operator actions.
- [ ] Synchronize `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` and `docs/CHANGELOG.md` in a post-merge documentation closure, including the prior PR #110 drift and the accurate structural PDF contract.
