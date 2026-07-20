# Signature Engineering Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an accessible data-driven Engineering Map connecting technologies, domains, projects and Engineering Notes with deterministic build/runtime behavior.

**Architecture:** `data/engineering-graph.json` is validated at build time and injected into a normal Diplodoc page as semantic fallback HTML plus escaped JSON. Existing `custom.js` progressively enhances the page into a filterable node/edge map without runtime fetches or third-party graph libraries.

**Tech Stack:** Node.js 24, parse5, Diplodoc, vanilla JS/CSS/SVG, existing Playwright/Axe/Lighthouse quality suite.

## Global Constraints

- No runtime network dependency or external graph library.
- No new production dependency.
- Deterministic explicit grid coordinates; no random/force layout.
- Full semantic fallback remains usable without JavaScript.
- Keyboard interactions use native focus order; no focus trap.
- Existing quality gates remain unchanged or become stricter.

---

### Task 1: Graph manifest and validator

**Files:**
- Create: `data/engineering-graph.json`
- Create: `scripts/engineering-graph.js`
- Create: `scripts/engineering-graph.test.js`

**Interfaces:**
- Produces: `loadEngineeringGraph(path)`, `validateEngineeringGraph(graph)`, `renderEngineeringGraphFallback(graph)`, `injectEngineeringGraph(html, graph)`.

- [ ] Add tests for duplicate IDs, invalid kinds, unsafe hrefs, missing edge endpoints, self/duplicate edges and orphan nodes.
- [ ] Add tests for deterministic fallback grouping and escaped embedded JSON.
- [ ] Implement validation/render/injection.

### Task 2: Engineering Map page and navigation

**Files:**
- Create: `docs/landing/engineering-map.md`
- Modify: `docs/toc.yaml`
- Modify: `templates/index.html`
- Modify: `data/page-meta.json`

- [ ] Add page source with graph host/fallback marker and explanatory copy.
- [ ] Add navigation/sitemap entry and homepage Explore card.
- [ ] Add page-specific metadata/OG card manifest entry.

### Task 3: Post-processing integration

**Files:**
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/copy-assets.test.js`

- [ ] Inject graph after Diplodoc build and before page metadata finalization.
- [ ] Fail build if map target is missing.
- [ ] Assert fallback nodes, embedded JSON and generated OG metadata in postprocess tests.

### Task 4: Progressive graph UI

**Files:**
- Create: `docs/_assets/style/engineering-graph.css`
- Modify: `docs/.yfm`
- Modify: `docs/_assets/script/custom.js`

- [ ] Render filters, semantic node controls, SVG edge overlay and live detail panel.
- [ ] Highlight first-degree neighborhood on focus/click.
- [ ] Recompute edges after resize with requestAnimationFrame scheduling.
- [ ] Collapse to card-list mode on narrow screens and respect reduced motion.

### Task 5: Browser and visual quality

**Files:**
- Create: `scripts/engineering-graph-smoke.cjs`
- Modify: `.github/workflows/build.yml`
- Modify: `scripts/visual-regression.cjs` only if baseline list contract needs extension.
- Modify: `tests/visual-baselines.json`

- [ ] Verify graph enhancement, filters, node selection/detail, focusable controls and no overflow in Chromium desktop/mobile.
- [ ] Add Engineering Map desktop/mobile screenshots to visual baseline.
- [ ] Preserve graph diagnostics in quality artifacts.

### Task 6: Documentation, review and merge

**Files:**
- Modify: `README.md`

- [ ] Document data model and progressive-enhancement behavior.
- [ ] Run full final-head CI.
- [ ] Review `master...agent/engineering-graph` for unrelated changes/secrets.
- [ ] Mark PR ready and squash-merge only after green final-head CI.
