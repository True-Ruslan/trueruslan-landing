# Portfolio Signature Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add data-driven active-project context, a memorable Engineering Graph, two flagship case studies, technical notes and route-specific branded social previews without adding runtime external dependencies.

**Architecture:** `data/portfolio.json` becomes the curated source for active work and graph topics. `standalone-home.js` renders semantic homepage HTML from this data; `custom.js` progressively enhances graph interaction. Diplodoc remains the content system for case studies/notes. Route metadata is injected deterministically during post-processing and static OG PNG assets are committed to the repository.

**Tech Stack:** Node.js 24, Diplodoc, parse5, vanilla HTML/CSS/JS, existing standalone homepage/post-processing/quality pipeline.

## Global Constraints

- No custom domain, paid service, hosted analytics or runtime GitHub API.
- No frontend framework/canvas/WebGL dependency.
- Existing Lighthouse/Axe/integrity/Firefox-WebKit/visual gates remain mandatory.
- LivingWorld/NODE ZERO claims must be grounded in verified repository documentation.
- NODE ZERO proprietary source/details are not exposed.
- Essential content must remain usable without JavaScript.

---

### Task 1: Curated portfolio data and build-time rendering

**Files:**
- Create: `data/portfolio.json`
- Create: `scripts/portfolio-data.js`
- Create: `scripts/portfolio-data.test.js`
- Modify: `scripts/standalone-home.js`
- Modify: `templates/index.html`

- [ ] Define schema/validation for active projects and graph topics.
- [ ] Add failing tests for valid data, duplicate ids, invalid status/link fields and deterministic escaping/rendering.
- [ ] Render `{{CURRENTLY_BUILDING}}`, `{{ENGINEERING_GRAPH}}` and fallback related links at build time.
- [ ] Keep generated HTML semantic and JS-independent.

### Task 2: Signature homepage visual/interactions

**Files:**
- Modify: `docs/_assets/style/home.css`
- Modify: `docs/_assets/script/custom.js`
- Modify: `scripts/browser-quality.cjs`

- [ ] Add responsive Currently Building/status-card presentation.
- [ ] Add accessible graph layout/detail panel and mobile fallback.
- [ ] Add keyboard/click graph interaction with `aria-pressed` and no-JS fallback preserved.
- [ ] Extend browser quality checks for section presence and one graph interaction.

### Task 3: Flagship case studies

**Files:**
- Create: `docs/landing/projects/livingworld.md`
- Create: `docs/landing/projects/node-zero.md`
- Modify: `docs/landing/projects.md`
- Modify: `docs/toc.yaml`

- [ ] Write LivingWorld case study from verified README/architecture evidence only.
- [ ] Write NODE ZERO case study from verified public README/design facts only.
- [ ] Promote both as flagship entries before existing case studies.
- [ ] Integrate nested navigation/sitemap discovery.

### Task 4: Engineering Notes

**Files:**
- Create: `docs/landing/notes.md`
- Create: `docs/landing/notes/portfolio-architecture.md`
- Create: `docs/landing/notes/bounded-ai-npc-conversations.md`
- Modify: `docs/toc.yaml`
- Modify: `templates/index.html`

- [ ] Add notes hub and two initial engineering essays.
- [ ] Cross-link notes and relevant case studies.
- [ ] Add Notes to standalone and Diplodoc navigation without crowding primary mobile navigation.

### Task 5: Route metadata and branded OG assets

**Files:**
- Create: `data/page-metadata.json`
- Create: `scripts/page-metadata.js`
- Create: `scripts/page-metadata.test.js`
- Modify: `scripts/copy-assets.js`
- Modify: `templates/index.html`
- Add: `docs/assets/images/og/*.png`

- [ ] Add deterministic route metadata map and tests for canonical/OpenGraph injection.
- [ ] Inject metadata after standalone/search rendering without duplicate tags.
- [ ] Create branded 1200×630 PNG cards for homepage, LivingWorld, NODE ZERO and Notes.
- [ ] Point homepage and mapped routes to their dedicated cards.

### Task 6: Verification, intentional baseline update and merge

**Files:**
- Modify: `tests/visual-baselines.json`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-07-20-portfolio-signature.md`

- [ ] Update README architecture/content documentation.
- [ ] Open draft PR and run full CI.
- [ ] Use CI screenshots to update homepage visual baseline intentionally; do not weaken thresholds.
- [ ] Re-run full CI on final head.
- [ ] Review `master...agent/portfolio-signature` scope and secrets.
- [ ] Squash-merge only after final-head CI is green.
- [ ] Verify post-merge Pages production smoke.
