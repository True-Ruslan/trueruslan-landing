# Quality & Portfolio Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent functional/visual regressions before merge and upgrade the site from a styled documentation site into a production-grade engineering portfolio.

**Architecture:** Keep Diplodoc as the static content engine. Add deterministic post-build integrity checks, browser smoke/accessibility/performance checks in CI using pinned ephemeral tooling so the main dependency graph stays small, then improve Projects and Resume as first-class portfolio surfaces.

**Tech Stack:** Node.js 24, Diplodoc, parse5, GitHub Actions, Playwright 1.61.1 (ephemeral CI tool), axe-core Playwright 4.12.1 (ephemeral CI tool), Lighthouse 13.4.0 (ephemeral CI tool).

## Global Constraints

- No new runtime framework.
- No production dependency added solely for CI quality checks.
- Existing `npm ci`, `npm test`, and `npm run build:docs` remain mandatory.
- Browser quality tools are pinned and installed into `.quality-tools` with `--package-lock=false`.
- All internal `href`, `src`, iframe, stylesheet and script references in generated HTML must resolve to generated output files.
- Browser smoke must cover desktop and mobile homepage, projects and resume.
- Accessibility checks block on serious/critical axe violations.
- Lighthouse thresholds: Performance >= 85, Accessibility >= 95, Best Practices >= 95, SEO >= 95.
- Visual screenshots are uploaded as CI artifacts on every PR for deterministic human/regression review; browser structure assertions block obvious layout regressions.
- Content claims must be grounded in existing repository/profile facts; no invented metrics.

---

### Task 1: Static site integrity gate

**Files:**
- Create: `scripts/site-integrity.js`
- Create: `scripts/site-integrity.test.js`
- Modify: `package.json`
- Modify: `.github/workflows/build.yml`
- Modify: `.github/workflows/static.yml`

**Interfaces:**
- Produces: `checkSiteIntegrity(outputDir)` returning `{htmlFiles, referencesChecked}` or throwing with all broken references.
- Produces: `npm run check:site`.

- [ ] Add tests for valid nested links, missing assets, fragment/query stripping, external URL skipping and PDF/iframe paths.
- [ ] Implement generated-HTML reference scanning with parse5 and safe path normalization.
- [ ] Add `check:site` after production build in PR and Pages workflows.
- [ ] Verify CI fails on a synthetic missing asset and passes on the built site.

### Task 2: Browser smoke, accessibility and quality evidence

**Files:**
- Create: `scripts/browser-quality.cjs`
- Create: `scripts/lighthouse-budget.js`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Browser runner consumes `BASE_URL` and writes screenshots/reports to `quality-artifacts/`.
- Browser runner uses pinned ephemeral modules from `.quality-tools/node_modules`.

- [ ] Install Playwright/Axe ephemerally in CI without touching package-lock.
- [ ] Serve `docs-html` on localhost in CI.
- [ ] Assert homepage/projects/resume load, key headings exist, no horizontal overflow, resume iframe URL responds successfully, and no page errors/failed same-origin requests occur.
- [ ] Run axe on key pages and fail on serious/critical violations.
- [ ] Capture desktop/mobile screenshots as CI artifacts.
- [ ] Run pinned Lighthouse and enforce configured score budgets.

### Task 3: Projects 2.0 case studies

**Files:**
- Modify: `docs/landing/projects.md`
- Create: `docs/landing/projects/taskhub.md`
- Create: `docs/landing/projects/minichess.md`
- Create: `docs/landing/projects/godot-horror-template.md`
- Modify: `docs/toc.yaml`

**Interfaces:**
- Projects index links to detailed case studies.
- Case studies use a consistent Context → Architecture → Engineering decisions → Verification → Links structure.

- [ ] Turn the projects index into a concise portfolio hub with featured projects.
- [ ] Add TaskHub, MiniChess and Godot case studies using verified repository facts only.
- [ ] Keep MarketDB high-level and avoid proprietary implementation claims.
- [ ] Ensure all new pages enter navigation/sitemap discovery without cluttering top navigation.

### Task 4: Resume 2.0 web CV

**Files:**
- Modify: `docs/landing/resume.md`
- Modify: `docs/_assets/style/custom.css`

**Interfaces:**
- Resume remains PDF-backed but presents useful content before the iframe.

- [ ] Add concise profile, core stack, experience areas, education/teaching/research, and action links above the PDF viewer.
- [ ] Add reusable resume metric/chip/timeline styling using semantic HTML/CSS and responsive layouts.
- [ ] Keep PDF embed as secondary verification/download surface with deployment-safe hydration.

### Task 5: Final release verification

**Files:** all changed files.

- [ ] Confirm `master...branch` contains only quality/portfolio changes.
- [ ] Open PR with exact quality gates documented.
- [ ] Require green CI before merge.
- [ ] Re-read merged PR state and verify post-merge master contains the new quality scripts/content.
