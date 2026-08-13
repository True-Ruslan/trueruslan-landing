# Full-site Editorial UX QA — N6A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic, non-rewriting editorial/UX audit that inventories every canonical public route from the generated sitemap and emits structured scanability evidence for the later human N6B review.

**Architecture:** The audit runs against the production-like `docs-html` artifact after `build:docs`, uses the generated `sitemap.xml` as the route owner, resolves clean routes to generated `index.html` files, parses only the page’s main content with `parse5`, classifies routes by reader purpose, and emits JSON + Markdown reports. Editorial warnings never fail the command; missing sitemap/routes, malformed generated HTML or report-write failures do.

**Tech Stack:** Node.js 24+, ESM, `parse5`, `node:test`, existing `quality-artifacts` convention.

## Global Constraints

- Keep the accepted self-hosted Onest typography unchanged.
- Do not create a second route/content/search source of truth.
- Do not auto-rewrite public copy.
- Diagnostic thresholds produce warnings, not CI failures.
- Tier 3 long-form depth is not treated as a defect by word count alone.
- Preserve static-first/no-JS, RU/EN, clean URL, metadata, privacy and search contracts.
- Do not promote P4.1B/P4.1C/P3.6 or reset the clean-URL observation clock.

---

### Task 1: Define RED audit contracts

**Files:**
- Create: `scripts/editorial-ux-audit.test.js`
- Test: `scripts/editorial-ux-audit.test.js`

**Interfaces:**
- Consumes: future exports from `scripts/editorial-ux-audit.js`.
- Produces test contracts for `parseSitemapRoutes(xml, siteUrl)`, `classifyRoute(pathname)`, `extractPageMetrics(html, route)`, `buildWarnings(metrics)` and `auditSite({siteDir, siteUrl})`.

- [ ] **Step 1: Write route classification tests**

Cover at minimum:

```js
assert.equal(classifyRoute('/'), 'tier1');
assert.equal(classifyRoute('/landing/resume/'), 'tier1');
assert.equal(classifyRoute('/landing/publications/'), 'tier2');
assert.equal(classifyRoute('/landing/projects/notchhub/'), 'tier2');
assert.equal(classifyRoute('/landing/notes/green-ci-is-not-product-verification/'), 'tier3');
assert.equal(classifyRoute('/en/notes/server-authoritative-ai-npcs/'), 'tier3');
```

- [ ] **Step 2: Write sitemap ownership tests**

Use a small XML fixture containing root, RU, EN and duplicate URLs. Require canonical same-origin paths, stable order and deduplication. Reject a sitemap with no usable routes.

- [ ] **Step 3: Write HTML metric extraction tests**

Fixture HTML must contain `<header>`, `<main>`, headings, paragraphs, list items, internal/external links and CTA classes. Assert that navigation/footer text is excluded and main-content metrics are exact.

- [ ] **Step 4: Write warning-semantic tests**

Require Tier 1 warnings for first paragraph >55 words, paragraph >85 words and repository-only vocabulary; require softer Tier 2 thresholds and no length severity for Tier 3.

- [ ] **Step 5: Write audit-site fail-closed tests**

Use a temporary generated site with `sitemap.xml` and clean-route `index.html` files. Assert complete route coverage. Then remove one route file and assert `auditSite` rejects with the missing canonical pathname.

- [ ] **Step 6: Run RED**

Run:

```bash
node --test scripts/editorial-ux-audit.test.js
```

Expected: FAIL because `scripts/editorial-ux-audit.js` does not exist.

- [ ] **Step 7: Commit RED**

```bash
git add scripts/editorial-ux-audit.test.js
git commit -m "test: define full-site editorial UX audit contract"
```

---

### Task 2: Implement the deterministic audit engine

**Files:**
- Create: `scripts/editorial-ux-audit.js`
- Test: `scripts/editorial-ux-audit.test.js`

**Interfaces:**
- Produces:
  - `parseSitemapRoutes(xml, siteUrl): string[]`
  - `classifyRoute(pathname): 'tier1' | 'tier2' | 'tier3'`
  - `extractPageMetrics(html, route): PageMetrics`
  - `buildWarnings(metrics): EditorialWarning[]`
  - `auditSite({siteDir, siteUrl}): Promise<AuditReport>`
  - `renderMarkdownReport(report): string`

`PageMetrics` fields:

```js
{
  route,
  locale,
  tier,
  title,
  h1,
  wordCount,
  paragraphCount,
  firstParagraphWords,
  longestParagraphWords,
  headingCount,
  listItemCount,
  internalLinkCount,
  actionLinkCount,
  counterpartRoute,
  counterpartPresent,
  warnings
}
```

- [ ] **Step 1: Implement sitemap parsing**

Extract `<loc>` values from the repository-generated sitemap, parse them with `new URL`, keep only `siteUrl` origin, normalize pathname trailing slash, deduplicate while preserving order, and reject an empty result.

- [ ] **Step 2: Implement clean-route resolution**

Rules:

```text
/ -> <siteDir>/index.html
/foo/ -> <siteDir>/foo/index.html
/foo -> <siteDir>/foo/index.html
```

Do not fall back to legacy `.html` entrypoints; the sitemap owns clean canonical routes.

- [ ] **Step 3: Implement route tiers**

Tier 1 exact decision routes include root and current RU/EN professional decision surfaces. Tier 3 matches individual `/landing/notes/*` and `/en/notes/*`. Tier 2 contains discovery hubs and project detail routes; unknown canonical routes default to Tier 3 so the audit never silently skips them.

- [ ] **Step 4: Implement main-content parsing**

Use `parse5.parse(html)`. Locate `<main>`; if no `<main>` exists, fail closed for that route. Traverse only that subtree. Ignore script/style/template/svg text. Collect H1/H2/H3, paragraphs, list items and anchors.

- [ ] **Step 5: Implement text normalization and word counts**

Collapse whitespace, strip empty strings and count words by Unicode whitespace boundaries. Do not attempt linguistic stemming or readability scoring.

- [ ] **Step 6: Implement action/link metrics**

Count same-origin/relative anchors as internal links. Count an anchor as an action when its own or ancestor class tokens contain bounded `action`, `actions`, `cta`, `button` or `btn` tokens; do not classify every link as a CTA.

- [ ] **Step 7: Implement warning rules**

Tier 1:

```text
FIRST_PARAGRAPH_LONG > 55 words
PARAGRAPH_LONG > 85 words
PROCESS_JARGON when surface prose contains repository-only vocabulary
MISSING_H1 when H1 is absent
```

Tier 2:

```text
FIRST_PARAGRAPH_LONG > 70 words
PARAGRAPH_LONG > 110 words
MISSING_H1 when H1 is absent
```

Tier 3:

```text
MISSING_H1 only; no word-count severity
```

Repository-only vocabulary includes exact/bounded forms for `acceptance identity`, `oracle`, `fail-closed`, `durable reconciliation`, `exact-head`, `evidence boundary`, plus Russian equivalents where they appear as process language.

- [ ] **Step 8: Implement counterpart observation**

For `/landing/...` derive `/en/...`; for `/en/...` derive `/landing/...`; root has no automatic counterpart. Presence is informational only and never emits a missing-translation warning by itself.

- [ ] **Step 9: Run focused GREEN tests**

```bash
node --test scripts/editorial-ux-audit.test.js
```

Expected: PASS.

- [ ] **Step 10: Run full unit suite**

```bash
npm test
```

Expected: all tests PASS and Search Discovery remains READY.

- [ ] **Step 11: Commit engine**

```bash
git add scripts/editorial-ux-audit.js scripts/editorial-ux-audit.test.js
git commit -m "feat: add deterministic editorial UX audit"
```

---

### Task 3: Add CLI reports without turning warnings into a quality gate

**Files:**
- Modify: `scripts/editorial-ux-audit.js`
- Modify: `scripts/editorial-ux-audit.test.js`
- Modify: `package.json`

**Interfaces:**
- CLI: `node scripts/editorial-ux-audit.js --site-dir docs-html --output-dir quality-artifacts --site-url https://trueruslan.ru`
- Package script: `npm run check:editorial`
- Outputs:
  - `quality-artifacts/editorial-ux-audit.json`
  - `quality-artifacts/editorial-ux-audit.md`

- [ ] **Step 1: Add failing CLI/report tests**

Verify deterministic JSON field order, Markdown summary totals by tier/warning code, one table row per route and exit code semantics: warnings => exit 0; invalid/missing input => non-zero.

- [ ] **Step 2: Run RED for CLI tests**

```bash
node --test scripts/editorial-ux-audit.test.js
```

Expected: only the new report/CLI expectations fail.

- [ ] **Step 3: Implement argument parsing and writers**

Use only Node built-ins. Create the output directory recursively. JSON ends with newline. Markdown starts with generated timestamp, route count, tier totals, warning totals, then the full route table.

- [ ] **Step 4: Add package script**

Add exactly:

```json
"check:editorial": "node scripts/editorial-ux-audit.js --site-dir docs-html --output-dir quality-artifacts --site-url https://trueruslan.ru"
```

Do not append it to `npm test` and do not make warning count a build failure.

- [ ] **Step 5: Run focused + full tests**

```bash
node --test scripts/editorial-ux-audit.test.js
npm test
```

Expected: PASS.

- [ ] **Step 6: Build production-like site and generate the real audit**

```bash
npm run build:docs
npm run check:editorial
```

Expected: command exits 0, every sitemap route resolves, both report files are generated.

- [ ] **Step 7: Commit CLI wiring**

```bash
git add package.json scripts/editorial-ux-audit.js scripts/editorial-ux-audit.test.js
git commit -m "feat: report full-site editorial UX diagnostics"
```

---

### Task 4: Review N6A evidence and prepare N6B handoff

**Files:**
- Create: `docs/audits/2026-08-13-full-site-editorial-ux-qa.md`
- Do not modify public copy in this task.

**Interfaces:**
- Consumes: `quality-artifacts/editorial-ux-audit.json` from the exact implementation head.
- Produces: one row per canonical route with initial N6B disposition and a bounded candidate-fix list.

- [ ] **Step 1: Record audit identity**

Include implementation head SHA, total canonical route count, tier counts and warning totals. Do not commit generated raw quality artifacts unless repository policy already tracks that artifact type.

- [ ] **Step 2: Review every Tier 1 route manually**

Assign `KEEP`, `TIGHTEN_COPY`, `RESTRUCTURE`, `REDUCE_VISUAL_WEIGHT` or `ALIGN_RU_EN` with a concrete reason.

- [ ] **Step 3: Review every Tier 2 route manually**

Use the same dispositions; confirm collection orientation and obvious next steps.

- [ ] **Step 4: Account for every Tier 3 route**

Use `DEEP_KEEP` where long-form depth is intentional; raise only concrete opening/navigation/editorial defects.

- [ ] **Step 5: Write the N6C candidate list**

Group only evidence-backed changes by page owner. Do not implement them in this N6A PR.

- [ ] **Step 6: Run full verification**

```bash
npm test
npm run build:docs
npm run check:editorial
```

Expected: PASS / audit exit 0.

- [ ] **Step 7: Commit the audit ledger**

```bash
git add docs/audits/2026-08-13-full-site-editorial-ux-qa.md
git commit -m "docs: audit full-site editorial UX quality"
```

---

### Task 5: Exact-head acceptance

**Files:** no product files beyond Tasks 1–4.

- [ ] **Step 1: Open Draft PR and capture TDD RED evidence**

Record the RED head/run before production implementation.

- [ ] **Step 2: Require final exact-head checks**

Build, Dependency Review and CodeQL must be SUCCESS. The existing browser/Axe/Lighthouse/Firefox/WebKit/RU-EN/no-JS/search/metadata/visual/custom-domain/discovery matrix must remain green.

- [ ] **Step 3: Review the PR diff**

Final N6A scope must contain only the design/plan, audit engine/tests, package script and audit ledger. No public-page copy/CSS change belongs in N6A.

- [ ] **Step 4: Squash merge only from an unchanged green head**

Use expected-head protection.

- [ ] **Step 5: Verify exact merged SHA**

Require Pages SUCCESS, deployment-triggered Production Live SUCCESS and master CodeQL SUCCESS before marking N6A accepted or starting N6C changes.
