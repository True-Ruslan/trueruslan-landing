# Resume Refresh Implementation Plan

## Phase 1 — RED

1. Add `scripts/resume-refresh.test.js`.
2. Require the supplied experience, employers, Java range, MCP work, metadata and canonical PDF URL.
3. Open a Draft PR and confirm only the new contract fails.

## Phase 2 — PDF preparation

1. Render the supplied three-page PDF at 200 DPI.
2. Replace the visible `.com` contact URL with `.ru` while preserving the already-canonical link annotation.
3. Set bounded PDF metadata.
4. Re-render and compare all pages.
5. Confirm three pages, twelve link annotations, canonical URI present and `.com` absent.

## Phase 3 — content synchronization

1. Replace `docs/assets/documents/cv.pdf`.
2. Rewrite `docs/landing/resume.md` from the supplied CV.
3. Rewrite `docs/en/resume.md` as a faithful English projection.
4. Update current-stack paragraphs in both About pages.
5. Change the homepage signal from Java 8–21 to Java 11–25.
6. Update both resume records in `data/page-meta.json`.

## Phase 4 — verification

1. Require all unit contracts to pass.
2. Require production build and generated-site integrity.
3. Require mobile, Chromium/Axe/Lighthouse, Publications, Sources, Project Evidence, diagrams, Photo Stories, portfolio, Firefox/WebKit, search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression and custom-domain artifact gates.
4. Review changed-file scope and security findings.
5. Squash merge with expected-head protection.

## Phase 5 — production and continuity

1. Require successful Pages deployment for the squash SHA.
2. Require deployment-driven Production Live Smoke for the exact SHA.
3. Synchronize `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md` in a docs-only PR.
4. Re-run full CI and exact production verification for the continuity squash.
