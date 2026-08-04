# Yandex Webmaster Diagnostics Implementation Plan

> **Status:** repository implementation, deployment proof and durable documentation closure are complete. Authenticated Yandex Webmaster operator actions remain tracked in issue #111.

**Goal:** Publish a robot-stable root favicon, normalize every generated page to the same absolute favicon URL, preserve the current Sitemap/HTTPS/privacy decisions, and record Yandex Webmaster diagnostics as bounded operational evidence.

**Architecture:** Keep the canonical SVG source in `docs/assets/images/favicon.svg`. The normal build finishes its existing post-processing and then runs a dedicated deterministic favicon postprocessor. It copies the same bytes to `docs-html/favicon.svg` and rewrites every generated icon link to `/favicon.svg`, independent of page depth, standalone templates or `<base>`. A deployment-only Playwright smoke verifies the exact root asset and rendered links after Pages publication.

**Tech Stack:** Node.js 24, node:test, Diplodoc static build, GitHub Actions, Playwright production smoke.

## Global constraints preserved

- static-first and build-time-only architecture;
- no Yandex Metrica, behavioural analytics, session replay, cookies or runtime APIs;
- no Yandex Business or regional-commercial claim without a real product requirement;
- `https://trueruslan.ru/` remains the only canonical public origin;
- `robots.txt` and `sitemap.xml` remain deterministic and canonical;
- no weakening of unit, browser, accessibility, visual, security or production gates.

---

## Task 1 — External diagnostic boundary

- [x] Created issue #111 `Yandex Webmaster diagnostic reconciliation`.
- [x] Classified `YW-01` through `YW-07` as repository defect, external pending state, duplicate, accepted non-goal or not applicable.
- [x] Preserved Yandex Metrica, Yandex Business and artificial regional claims as explicit non-goals.
- [x] Recorded Sitemap submission, HTTP→HTTPS state, “No region”, recrawl and 10–14 day recheck as authenticated operator actions.

## Task 2 — TDD favicon contract

- [x] Added byte-equal root SVG publication tests.
- [x] Added root, nested and search-page fixtures with different link syntax and `<base>` behavior.
- [x] Verified RED on head `6c2a267d1c5f0f16c6d25747ebb78f2fcf00a2d1` through Build #766 / `30952175051`.
- [x] Preserved unrelated resource links and rejected duplicate favicon `href` insertion.

## Task 3 — Deterministic publication

- [x] Added `scripts/favicon.js` using Node core modules only.
- [x] Added `copyRootFavicon({docsDir, outputDir})`.
- [x] Added `normalizeFaviconLinks(outputDir, '/favicon.svg')`.
- [x] Copied the canonical SVG byte-for-byte to generated `/favicon.svg`.
- [x] Normalized generated icon links after existing asset/page post-processing.
- [x] Set Diplodoc `favicon-src` to `/favicon.svg`.
- [x] Covered self-closing and reordered icon-link syntax.

## Task 4 — Production verification

- [x] Added `scripts/production-favicon-smoke.cjs`.
- [x] Added permanent workflow-structure tests.
- [x] Reused the existing deployment-aware Production Live Smoke workflow.
- [x] Required HTTP 200, `image/svg+xml`, SVG markup and meaningful response size.
- [x] Required homepage and Resume favicon links to resolve exactly to `https://trueruslan.ru/favicon.svg`.
- [x] Kept the new assertion deployment-only so pull requests do not test undeployed code against current production.
- [x] Preserved `production-favicon-summary.json` in the existing live evidence artifact.

## Task 5 — Exact verification and merge

```text
feature PR:                     #112 — MERGED
exact head:                     00e7823d558c7a3473ee9fcf96692d583552f578
squash:                         18358a4939dc4062669dbcb45850e9beb26e1cac
Build:                          #778 / 30953202266 — SUCCESS
unit tests:                     345 PASS / 0 FAIL
CodeQL:                         #243 / 30953202233 — SUCCESS
Dependency Review:              #206 / 30953202243 — SUCCESS
Dependency Audit Evidence:      #17 / 30953202563 — SUCCESS
quality artifact:               8910068861
quality digest:                 sha256:d309cff946ce4473f8aec309531df7124787c864bd139693cf5ddc31ddac1f80
```

- [x] Passed site integrity, browser, accessibility, Lighthouse, Firefox/WebKit, search, RU/EN, analytics, visual regression and custom-domain checks.
- [x] Confirmed zero open review threads.
- [x] Marked PR #112 ready and squash-merged with exact-head protection.

## Task 6 — Exact production closure

```text
source Pages:                   #142 / 30953599246 — SUCCESS
Production Live Smoke:          #45 / 30953667481 — SUCCESS
event:                          workflow_run
deployed/caller SHA:            18358a4939dc4062669dbcb45850e9beb26e1cac
github-pages deployment id:     5752049616
live artifact:                  8910151878
live digest:                    sha256:fe0ce39de71919915edc3760ac0768bf62e21b922312688a1d6cf8d7fd4c01e1
```

- [x] Verified root favicon HTTP 200.
- [x] Verified `Content-Type: image/svg+xml` and 591-byte SVG response.
- [x] Verified homepage and Resume `href="/favicon.svg"`.
- [x] Verified exact resolution to `https://trueruslan.ru/favicon.svg`.
- [x] Added exact evidence to issue #111.
- [x] Synchronized `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`, including the prior PR #110 drift and accurate PDF validation boundary.

## Remaining external operator actions

These are intentionally not marked complete by repository evidence:

- [ ] confirm `https://trueruslan.ru/sitemap.xml` in the HTTPS Webmaster property;
- [ ] confirm HTTP→HTTPS move/main mirror state;
- [ ] select “No region”;
- [ ] submit the homepage for recrawl;
- [ ] recheck diagnostics after 10–14 days.

A green repository/deployment contract does not imply that Yandex has already refreshed cached diagnostics.
