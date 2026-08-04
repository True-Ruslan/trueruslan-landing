# Yandex Webmaster Diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a robot-stable root favicon, normalize every generated page to the same absolute favicon URL, preserve the current Sitemap/HTTPS/privacy decisions, and record Yandex Webmaster diagnostics as bounded operational evidence.

**Architecture:** Keep the canonical SVG source in `docs/assets/images/favicon.svg`. During deterministic post-processing, copy the same bytes to `docs-html/favicon.svg` and rewrite every generated HTML favicon link to `/favicon.svg`, independent of page depth or `<base>`. Validate the transformation at unit/integration level and in production live smoke without adding runtime services, analytics, or regional/commercial metadata.

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
- Create: GitHub issue `Yandex Webmaster diagnostic reconciliation`

**Interfaces:**
- Consumes: current Yandex Webmaster screenshots and verified production state.
- Produces: one operational checklist separating code defects, external pending states, duplicates, accepted decisions, and non-applicable recommendations.

- [x] **Step 1: Create the issue**

Record seven diagnostics as `YW-01` through `YW-07` with classification, evidence, action, and exit criterion.

- [x] **Step 2: Record immutable product decisions**

State that Yandex Metrica, Yandex Business, and a regional commercial claim are out of scope unless a concrete product requirement changes.

- [x] **Step 3: Record external operator actions**

Keep Sitemap submission, HTTP→HTTPS migration state, “No region”, homepage recrawl, and the 10–14 day recheck as explicit manual Webmaster actions.

---

### Task 2: Add a failing favicon regression contract

**Files:**
- Modify: `scripts/copy-assets.test.js`
- Create: `scripts/favicon.test.js`

**Interfaces:**
- Consumes: generated HTML files containing relative favicon links and the canonical SVG source.
- Produces: failing assertions requiring `docs-html/favicon.svg` and `href="/favicon.svg"` on root and nested pages.

- [ ] **Step 1: Write the pure transformation test**

Create temporary root and nested HTML documents with relative favicon links, invoke the favicon normalizer, and assert that only favicon links become `/favicon.svg`.

- [ ] **Step 2: Run the test to verify RED**

Run: `node --test scripts/favicon.test.js`

Expected: FAIL because `scripts/favicon.js` does not exist yet.

- [ ] **Step 3: Extend post-processing integration coverage**

Add a fixture favicon source and assert that `postprocessOutput` writes a byte-equal root favicon and reports normalized HTML pages.

---

### Task 3: Implement deterministic root favicon publication

**Files:**
- Create: `scripts/favicon.js`
- Modify: `scripts/copy-assets.js`
- Modify: `docs/.yfm`
- Modify: `templates/index.html`
- Modify: `templates/index.en.html`

**Interfaces:**
- Produces: `copyRootFavicon({docsDir, outputDir}) -> string` and `normalizeFaviconLinks(outputDir, href = '/favicon.svg') -> string[]`.
- Consumes: `docs/assets/images/favicon.svg` and generated `**/*.html`.

- [ ] **Step 1: Implement the pure helper**

Use only Node core modules. Recursively enumerate generated HTML, replace the `href` of `<link rel="icon">` tags, preserve unrelated links, and write only changed files.

- [ ] **Step 2: Implement root publication**

Copy the canonical SVG bytes from `docs/assets/images/favicon.svg` to `docs-html/favicon.svg`; fail clearly if the source is missing.

- [ ] **Step 3: Wire post-processing**

Call root publication and link normalization after all generated pages, including Photo Stories, exist. Return and log `rootFaviconPath` and `faviconLinksUpdated`.

- [ ] **Step 4: Make source configuration canonical**

Set `favicon-src: /favicon.svg` in Diplodoc config and use `/favicon.svg` in both standalone homepage templates.

- [ ] **Step 5: Run focused tests to verify GREEN**

Run: `node --test scripts/favicon.test.js`

Expected: PASS.

---

### Task 4: Extend exact production verification

**Files:**
- Modify: the existing Production Live Smoke assertion owner.

**Interfaces:**
- Consumes: deployed `https://trueruslan.ru/favicon.svg`, homepage HTML, and a nested page HTML.
- Produces: exact-head evidence that the root favicon returns successfully and deployed pages reference `/favicon.svg`.

- [ ] **Step 1: Locate the existing live assertion owner**

Follow the current Production Live Smoke pattern rather than adding a second verifier.

- [ ] **Step 2: Add root favicon assertions**

Require an HTTP-successful SVG response with non-empty SVG content.

- [ ] **Step 3: Add rendered link assertions**

Check the homepage and `landing/resume.html` for a favicon link resolving exactly to `https://trueruslan.ru/favicon.svg`.

- [ ] **Step 4: Run the existing production verifier against current production**

Expected before deployment: FAIL only on missing root favicon or relative link contract.

---

### Task 5: Synchronize durable state and verify the branch

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: PR #110 accepted state and the new favicon/Yandex diagnostic evidence.
- Produces: durable state that no longer claims PR #108 as the latest product baseline and accurately describes PDF and favicon contracts.

- [ ] **Step 1: Record PR #110 drift closure**

Update the latest accepted product baseline from PR #108 to PR #110 before documenting the new PR.

- [ ] **Step 2: Record the diagnostic classifications**

Document favicon as repository work, Sitemap/HTTPS/region as external Webmaster state, and Metrica/Business as accepted non-goals.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: all tests pass, build succeeds, and site integrity reports no broken local references.

- [ ] **Step 4: Open a draft PR and inspect exact-head CI**

Require Build, CodeQL, Dependency Review, browser/accessibility/compatibility, visual regression, and applicable operational workflows to pass before marking ready.

- [ ] **Step 5: Merge only after evidence is green**

After merge, require Pages deployment and the deployment-driven Production Live Smoke to pass for the exact squash SHA.
