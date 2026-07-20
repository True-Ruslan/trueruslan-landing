# Production Reliability Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real-production verification, cross-browser sanity, external endpoint health checks and internally consistent licensing without introducing a custom domain or paid service.

**Architecture:** Reuse the existing post-build/browser-quality conventions. Keep the full PR quality suite Chromium-based, add a focused Firefox/WebKit smoke layer, run a separate production smoke after Pages deployment, and run a scheduled external-health workflow from a deterministic URL manifest. Licensing is standardized on MIT for code/tooling while personal portfolio content is explicitly excluded from that software license.

**Tech Stack:** GitHub Actions, Node.js 24, Playwright 1.61.1 installed ephemerally in `.quality-tools`, native `fetch`, existing static build pipeline.

## Global Constraints

- No custom domain or paid service.
- Do not weaken existing Lighthouse/Axe/integrity/visual-regression gates.
- Production dependency graph must not gain browser-test dependencies.
- Network checks must use explicit timeouts and bounded redirects.
- Anti-bot 401/403/429 responses may be classified as reachable; 404/410/5xx/connectivity failures are actionable failures.
- Source/build/test code uses MIT; CV/photos/personal text are excluded from that software license unless explicitly stated.

---

### Task 1: Shared endpoint-health policy

**Files:**
- Create: `scripts/http-health.js`
- Create: `scripts/http-health.test.js`
- Create: `data/external-links.json`

**Interfaces:**
- Produces: `classifyHttpStatus(status)`, `checkUrl(url, options)`, `checkUrls(entries, options)`.
- Consumes: native `fetch` available in Node.js 24.

- [x] Add failing tests for 2xx/3xx success, 401/403/429 reachable, 404/410/5xx failure, timeout/connectivity failure and bounded redirect behavior.
- [x] Implement deterministic classification and timeout handling with `AbortSignal.timeout`.
- [x] Add a curated manifest of production/internal critical endpoints and external public destinations.
- [ ] Run `npm test`; expect PASS.

### Task 2: Production Pages smoke

**Files:**
- Create: `scripts/production-smoke.js`
- Create: `scripts/production-smoke.test.js`
- Modify: `.github/workflows/static.yml`

**Interfaces:**
- Consumes: `checkUrls()` from Task 1 and `steps.deployment.outputs.page_url`.
- Produces: failing workflow exit code plus `production-smoke-report.json`.

- [x] Add tests for deriving root/projects/resume/PDF/critical-asset URLs from a Pages base URL with and without trailing slash.
- [x] Implement HTTP assertions including PDF `content-type` verification.
- [x] After `actions/deploy-pages@v4`, run production smoke against the actual `page_url` output with bounded retry/backoff.
- [x] Upload smoke diagnostics with `if: always()`.

### Task 3: Firefox/WebKit compatibility smoke

**Files:**
- Create: `scripts/cross-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: built `docs-html` and Playwright browsers.
- Produces: compact Firefox/WebKit compatibility report and screenshots on failure.

- [x] Reuse the existing local static-server assumptions and test homepage/projects/resume only.
- [x] Assert successful navigation, expected H1, no page errors, no same-origin failures, no horizontal overflow and Resume fallback/download link presence.
- [x] Install only Firefox and WebKit browser binaries in PR CI after the pinned Playwright package install.
- [x] Run the compact smoke after the existing Chromium full suite and before visual regression.
- [x] Preserve report/screenshots in `quality-artifacts`.

### Task 4: Weekly external health workflow

**Files:**
- Create: `scripts/external-health.js`
- Create: `.github/workflows/external-health.yml`

**Interfaces:**
- Consumes: `data/external-links.json` and Task 1 health functions.
- Produces: Markdown/JSON health report artifact and workflow failure on actionable broken endpoints.

- [x] Implement manifest-driven checks with bounded concurrency and stable ordering.
- [x] Add weekly `schedule` plus `workflow_dispatch`.
- [x] Upload JSON and Markdown reports even on failure.
- [x] Keep issue creation out of scope to avoid duplicate/noisy automation.

### Task 5: License and metadata cleanup

**Files:**
- Modify: `package.json`
- Modify: `LICENSE`
- Create: `CONTENT-LICENSE.md`
- Modify: `README.md`

**Interfaces:**
- Produces: unambiguous licensing policy for code vs personal content.

- [x] Standardize software licensing on MIT across `package.json`, `package-lock.json` metadata and `LICENSE`.
- [x] Document that MIT covers source/build/test code, not CV/photos/personal biographical content.
- [x] Preserve third-party asset licenses/credits.
- [x] Add regression assertions for MIT license consistency and current GitHub Pages homepage metadata.

### Task 6: Verification and merge

**Files:**
- Modify: `docs/superpowers/plans/2026-07-20-production-reliability.md`

**Interfaces:**
- Release gate: full PR CI plus post-merge Pages deployment smoke.

- [ ] Run/observe PR CI until tests, build, integrity, Chromium quality, Firefox/WebKit smoke, search smoke and visual regression are green.
- [ ] Review `master...agent/production-reliability-brand` for unrelated changes/secrets.
- [ ] Merge with squash only after final-head CI is green.
- [ ] Verify the post-merge Pages workflow reaches the production-smoke step successfully.
- [ ] Re-read merged PR/master state before declaring completion.
