# Engineering Notes & Social Preview System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Engineering Notes, deterministic per-page OpenGraph PNGs, page-specific metadata and deeper flagship case-study visuals without adding runtime services or weakening existing quality gates.

**Architecture:** A declarative `data/page-meta.json` manifest drives build-time PNG generation and metadata injection into final `docs-html`. Notes remain normal Diplodoc Markdown. Two additional SVG diagrams deepen the existing LivingWorld and NODE ZERO case studies.

**Tech Stack:** Node.js 24 built-ins (`fs`, `path`, `zlib`), parse5/parse5-utils, Diplodoc, existing GitHub Actions browser-quality pipeline.

## Global Constraints

- No custom domain or paid hosting.
- No CMS, analytics provider or runtime external API.
- No new production/runtime dependency.
- Do not weaken existing Lighthouse/Axe/integrity/cross-browser/visual-regression gates.
- OpenGraph cards must be deterministic 1200×630 PNG files generated during normal build post-processing.
- Private/proprietary repository boundaries remain explicit.

---

### Task 1: Page metadata manifest and validator

**Files:**
- Create: `data/page-meta.json`
- Create: `scripts/page-meta.js`
- Create: `scripts/page-meta.test.js`

**Interfaces:**
- Produces: `loadPageMeta(path)`, `validatePageMeta(entries)`, `injectPageMeta(html, entry, siteUrl)`, `applyPageMeta(outputDir, entries, siteUrl)`.

- [ ] Add failing tests for duplicate paths/cards, unsafe paths, missing fields and idempotent metadata replacement.
- [ ] Implement strict manifest validation and HTML metadata injection.
- [ ] Run `npm test`; expect PASS for page-meta tests.

### Task 2: Native deterministic OG PNG renderer

**Files:**
- Create: `scripts/og-image.js`
- Create: `scripts/og-image.test.js`

**Interfaces:**
- Produces: `renderOgPng(card) -> Buffer`, `writeOgCards(outputDir, entries)`.

- [ ] Add tests for PNG signature, IHDR width=1200/height=630 and deterministic byte output.
- [ ] Implement CRC32 PNG chunks, zlib-compressed scanlines, background/accent drawing and limited bitmap-font text rendering.
- [ ] Run renderer tests; expect PASS.

### Task 3: Integrate metadata/cards into post-processing

**Files:**
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/copy-assets.test.js`
- Modify: `templates/index.html`

**Interfaces:**
- Consumes: Task 1 manifest/injection and Task 2 card writer.
- Produces: `docs-html/assets/og/*.png` and page-specific final HTML metadata.

- [ ] Add post-processing regression assertions for generated OG card and metadata.
- [ ] Generate cards before metadata injection and inject absolute `SITE_URL` image URLs.
- [ ] Replace static homepage generic OG image with generated page metadata.
- [ ] Run `npm test`; expect PASS.

### Task 4: Engineering Notes content surface

**Files:**
- Create: `docs/landing/notes.md`
- Create: `docs/landing/notes/portfolio-runtime-boundary.md`
- Create: `docs/landing/notes/static-site-quality-gates.md`
- Create: `docs/landing/notes/server-authoritative-ai-npcs.md`
- Modify: `docs/toc.yaml`
- Modify: `templates/index.html`

**Interfaces:**
- Produces sitemap/navigation-discoverable notes pages and homepage entry point.

- [ ] Add Notes hub and three grounded technical notes.
- [ ] Add nested toc entries so sitemap discovery includes every note.
- [ ] Add a homepage Explore card linking to Notes.
- [ ] Build and verify generated note pages exist.

### Task 5: Deeper flagship visuals

**Files:**
- Create: `docs/assets/diagrams/livingworld-request-lifecycle.svg`
- Create: `docs/assets/diagrams/node-zero-system-flow.svg`
- Modify: `docs/landing/projects/livingworld.md`
- Modify: `docs/landing/projects/node-zero.md`

**Interfaces:**
- Produces accessible responsive SVG visuals embedded into existing case studies.

- [ ] Add LivingWorld request/session/trust-boundary diagram.
- [ ] Add NODE ZERO authored-sequence/facility/MIRROR state-flow diagram.
- [ ] Add explanatory captions and explicit evidence boundaries.

### Task 6: Integrity/browser quality integration

**Files:**
- Modify: `scripts/site-integrity.js`
- Modify: `scripts/site-integrity.test.js`
- Modify: `scripts/browser-quality.cjs`

**Interfaces:**
- Generated-site gate validates local OG image references and browser smoke validates high-value metadata.

- [ ] Extend integrity extraction to validate local `og:image`/`twitter:image` targets.
- [ ] Add tests for missing/present OG targets.
- [ ] Assert homepage/projects/LivingWorld/NODE ZERO/Notes metadata in Chromium quality run.
- [ ] Run full PR CI; expect all functional gates green before any visual-baseline update.

### Task 7: Visual baseline, review and merge

**Files:**
- Modify only if required: `tests/visual-baselines.json`

- [ ] Update baselines only from a functional-green browser run if homepage/Projects geometry intentionally changed.
- [ ] Re-run full final-head CI.
- [ ] Review `master...agent/engineering-notes-og` for unrelated changes/secrets.
- [ ] Mark PR ready and squash-merge only after final-head CI is green.
- [ ] Re-read merged PR/master state before declaring completion.
