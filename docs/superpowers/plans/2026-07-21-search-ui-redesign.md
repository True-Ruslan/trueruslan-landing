# Engineering Search UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the generated Diplodoc local-search page into a first-class Engineering Search surface while preserving the existing search engine and index.

**Architecture:** Keep Diplodoc search runtime intact. Extend `normalizeSearchPageHtml()` as the build-time integration point to add page markers plus dedicated `search.css` and `search-ui.js`; the progressive script only adds hooks, accessibility fallbacks and keyboard focus behavior around the generated app.

**Tech Stack:** Node.js 24, parse5, Diplodoc local search, vanilla CSS/JS, Playwright, Axe, existing visual-regression pipeline.

## Global Constraints

- Do not replace Diplodoc search or introduce a second index/search implementation.
- No new production dependency or frontend framework.
- No runtime external API.
- No domain/hosting changes.
- Existing search functionality and generated-search browser smoke must remain operational.
- Existing quality thresholds must not be weakened.

---

### Task 1: Search-page transformation contract

**Files:**
- Modify: `scripts/search-page.js`
- Modify: `scripts/search-page.test.js`

**Interfaces:**
- Consumes: generated `_search/<locale>/index.html`.
- Produces: idempotently normalized HTML with `data-tr-search-page`, `../../_assets/style/search.css` and `../../_assets/script/search-ui.js`.

- [ ] Add failing assertions for the page marker, one stylesheet, one script and idempotency.
- [ ] Preserve existing bundle/resource normalization assertions.
- [ ] Implement relative custom-resource path derivation from `pageRelativePath`.
- [ ] Run `npm test`; expect search-page tests PASS.

### Task 2: Search visual layer

**Files:**
- Create: `docs/_assets/style/search.css`

**Interfaces:**
- Consumes: `data-tr-search-page` and progressive `.tr-search-*` hooks.
- Produces: isolated graphite/cyan/violet search UI without affecting normal pages.

- [ ] Add scoped page shell/background/typography styles.
- [ ] Style search controls as command-palette/terminal input.
- [ ] Style result groups/items/links/highlights and empty/loading states.
- [ ] Add mobile and reduced-motion rules.
- [ ] Ensure focus treatment remains visible and no horizontal overflow is introduced.

### Task 3: Progressive search enhancement

**Files:**
- Create: `docs/_assets/script/search-ui.js`
- Create: `scripts/search-ui.test.js`

**Interfaces:**
- Produces document marker `data-tr-search-enhanced="true"` when a search input is discovered; adds tolerant `.tr-search-*` hooks and `/` / `Ctrl|Cmd+K` focus shortcut.

- [ ] Add tests for classic-script syntax and editable-target shortcut exclusion contract.
- [ ] Locate search input with semantic/tolerant selectors and fail soft if absent.
- [ ] Add missing placeholder/aria-label only when absent.
- [ ] Add bounded MutationObserver to decorate result containers/items.
- [ ] Add keyboard shortcut without intercepting normal typing/query execution.

### Task 4: Browser, accessibility and visual QA

**Files:**
- Modify: `scripts/search-smoke.cjs`
- Modify: `tests/visual-baselines.json`

**Interfaces:**
- Produces `search-desktop.png`, `search-mobile.png` and search smoke diagnostics.

- [ ] Run desktop/mobile Chromium scenarios.
- [ ] Verify custom CSS/JS loaded, enhancement marker, focusable input and `/` shortcut.
- [ ] Verify no HTTP/page errors or horizontal overflow.
- [ ] Run Axe and reject serious/critical violations attributable to the search page.
- [ ] Save screenshots.
- [ ] Add search screenshots to visual baselines only after functional-green run.

### Task 5: Documentation and merge

**Files:**
- Modify: `README.md`

- [ ] Document branded Engineering Search architecture and keyboard shortcut.
- [ ] Open draft PR and run full quality pipeline.
- [ ] Review `master...agent/search-ui-redesign` for unrelated changes/secrets/dependency drift.
- [ ] Mark ready and squash-merge only after final-head CI is fully green.
- [ ] Verify merged `master` contains search resources and transformation contract.
