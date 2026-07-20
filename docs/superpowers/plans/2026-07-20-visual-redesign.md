# TrueRuslan Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a distinctive dark engineering portfolio visual identity on top of the existing Diplodoc site without replacing its content architecture or adding a frontend framework.

**Architecture:** Use native Diplodoc theming for base tokens, supported custom CSS/JS resources for presentation and progressive enhancement, and Page Constructor for homepage structure. Keep the build static, preserve the hardening branch's post-processing pipeline, and isolate the redesign in a stacked PR.

**Tech Stack:** Diplodoc CLI 5.x, Gravity UI Page Constructor, YAML/YFM, CSS, vanilla ES modules/JavaScript, Node.js 24 test runner.

## Global Constraints

- Dark-first palette: `#090B10`, `#11151C`, `#171C24`, `#F4F7FB`, `#9CA9B8`, `#4CC9F0`, `#8B5CF6`, `#4ADE80`.
- No new runtime framework or animation library.
- JavaScript is progressive enhancement only; semantic content remains usable without it.
- Respect `prefers-reduced-motion: reduce`.
- Preserve current Diplodoc/Markdown architecture, SEO post-processing, static deployment, and Node 24 baseline.
- Build and tests remain mandatory release gates.

---

### Task 1: Enable supported theming and custom resources

**Files:**
- Create: `docs/theme.yaml`
- Modify: `docs/.yfm`
- Modify: `package.json`
- Test: `scripts/visual-config.test.js`

**Interfaces:**
- Produces: native Diplodoc theme tokens and resource references used by all pages.
- Produces: build command that explicitly permits custom resources.

- [ ] **Step 1:** Add a failing Node test that reads `.yfm`, `theme.yaml`, and `package.json` and asserts custom resources, dark brand tokens, and `--allow-custom-resources` are configured.
- [ ] **Step 2:** Run `npm test`; expect the new configuration test to fail.
- [ ] **Step 3:** Create `docs/theme.yaml` with the approved palette and update `.yfm` with `allowCustomResources: true` plus CSS/JS resource paths.
- [ ] **Step 4:** Update `build:docs` and `build:docs:fast` to pass `--allow-custom-resources`.
- [ ] **Step 5:** Run `npm test`; expect PASS.

### Task 2: Add the visual system stylesheet

**Files:**
- Create: `docs/_assets/style/custom.css`

**Interfaces:**
- Consumes: Diplodoc/Gravity UI generated markup and theme tokens.
- Produces: `--tr-*` custom properties and reusable presentation behavior.

- [ ] **Step 1:** Define root design tokens, page background grid, cyan/violet ambient glows, typography hierarchy, selection color, and focus-visible states.
- [ ] **Step 2:** Style sticky translucent header/navigation with progressive backdrop blur and animated link underline.
- [ ] **Step 3:** Style Page Constructor cards and generic content cards with subtle border, 3–4px hover lift, gradient glow, and accessible keyboard focus.
- [ ] **Step 4:** Style buttons/CTA links with arrow motion and controlled hover/focus transforms.
- [ ] **Step 5:** Add terminal panel styles, reveal classes, responsive breakpoints, and a complete `prefers-reduced-motion` override.

### Task 3: Add progressive visual behavior

**Files:**
- Create: `docs/_assets/script/custom.js`
- Test: `scripts/visual-enhancements.test.js`

**Interfaces:**
- Produces: pure helpers `getPageKind(pathname)` and `getTerminalLines()` for deterministic tests.
- Runtime behavior: adds page marker classes, terminal accent, reveal observers, and external-link hardening.

- [ ] **Step 1:** Write failing tests for page classification and terminal line content.
- [ ] **Step 2:** Implement pure helpers with no DOM dependency.
- [ ] **Step 3:** Implement guarded browser initialization using `DOMContentLoaded`, `IntersectionObserver` feature detection, and `matchMedia('(prefers-reduced-motion: reduce)')`.
- [ ] **Step 4:** Add a single homepage terminal panel only when the hero containing `Руслан Немыкин` exists; never duplicate it.
- [ ] **Step 5:** Add reveal classes only to existing elements and harden `_blank` external links with `noopener noreferrer`.
- [ ] **Step 6:** Run `npm test`; expect PASS.

### Task 4: Recompose the homepage as an engineering portfolio

**Files:**
- Modify: `docs/index.yaml`

**Interfaces:**
- Consumes: Page Constructor blocks and CSS/JS visual layer.
- Produces: hero, CTAs, positioning, and navigation cards.

- [ ] **Step 1:** Replace the generic welcome copy with a concise value proposition: `Backend Engineer · Java · Distributed Systems · AI` and engineering-focused description.
- [ ] **Step 2:** Add hero CTA buttons for projects and resume/GitHub using supported Page Constructor button fields.
- [ ] **Step 3:** Rework section cards with concise product-style descriptions and visual ordering: Projects, About, Resume, Sources, Photos, Contacts.
- [ ] **Step 4:** Preserve SEO metadata and update OpenGraph description to match the new positioning.

### Task 5: Upgrade the projects page

**Files:**
- Modify: `docs/landing/projects.md`

**Interfaces:**
- Produces: structured portfolio content compatible with Markdown and the shared visual layer.

- [ ] **Step 1:** Expand MarketDB into a compact case-study format: purpose, stack, result, responsibilities without inventing unsupported metrics.
- [ ] **Step 2:** Add TaskHub backend/frontend as a coherent full-stack project entry.
- [ ] **Step 3:** Add selected public repositories relevant to backend, AI/game-development/tooling only when repository existence is verified.
- [ ] **Step 4:** Add consistent CTA links and section structure for scanability.

### Task 6: Polish supporting pages and navigation

**Files:**
- Modify: `docs/toc.yaml`
- Modify: `docs/landing/about.md`
- Modify: `docs/landing/contacts.md`
- Modify: `README.md`

**Interfaces:**
- Produces: consistent brand voice and navigation labels.

- [ ] **Step 1:** Tighten header naming/labels without removing existing destinations.
- [ ] **Step 2:** Replace generic biography copy with concise engineering positioning based only on existing facts.
- [ ] **Step 3:** Make contacts copy concise and action-oriented.
- [ ] **Step 4:** Document the theme/custom-resource architecture and local workflow in README.

### Task 7: Validate the production artifact

**Files:**
- Test: all `scripts/*.test.js`
- Build: generated `docs-html/`

**Interfaces:**
- Release gate: tests and static build both pass.

- [ ] **Step 1:** Run `npm test`; expect all tests PASS.
- [ ] **Step 2:** Run `npm run build:docs`; expect exit code 0 and generated CSS/JS resources in the output.
- [ ] **Step 3:** Verify generated `index.html` references the custom stylesheet/script and retains JSON-LD/theme post-processing.
- [ ] **Step 4:** Review final diff for unrelated changes and secrets.
- [ ] **Step 5:** Open a stacked draft PR from `agent/visual-redesign` to `agent/harden-landing-production`, documenting visual architecture, accessibility, validation, and merge order.
