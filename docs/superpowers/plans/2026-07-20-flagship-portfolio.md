# Flagship Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add build-time active-project content and evidence-driven LivingWorld/NODE ZERO flagship case studies with accessible architecture diagrams.

**Architecture:** Keep the standalone homepage static and render active projects from validated JSON. Keep project detail pages in Diplodoc Markdown and diagrams as dependency-free SVG assets. Reuse all existing build, integrity, browser, accessibility, Lighthouse, cross-browser and visual-regression gates.

**Tech Stack:** Node.js 24, static HTML, JSON, SVG, Diplodoc Markdown, GitHub Actions.

## Global Constraints

- No custom domain or hosting changes.
- No new production or CI dependency.
- Use only verified public facts from source repositories.
- Preserve current quality thresholds and browser matrix.
- Build-time data rendering must escape user-controlled text and reject unsafe local paths.

---

### Task 1: Build-time Currently Building data

**Files:**
- Create: `data/currently-building.json`
- Modify: `scripts/standalone-home.js`
- Modify: `scripts/standalone-home.test.js`
- Modify: `templates/index.html`
- Modify: `docs/_assets/style/home.css`

**Interfaces:**
- Produces: `validateCurrentlyBuilding(entries)`, `renderCurrentlyBuilding(entries)` and the `{{CURRENTLY_BUILDING}}` template slot.

- [ ] Add failing tests for valid rendering, HTML escaping, duplicate slugs, missing fields, unsafe hrefs and tag limits.
- [ ] Implement validation and deterministic card rendering.
- [ ] Load the JSON manifest in `writeStandaloneHome()` and replace the homepage slot.
- [ ] Add accessible responsive status-card styling.
- [ ] Run `npm test` and expect PASS.

### Task 2: LivingWorld flagship case study

**Files:**
- Create: `docs/landing/projects/livingworld.md`
- Create: `docs/assets/diagrams/livingworld-architecture.svg`

- [ ] Document verified player flow, server authority, AI/voice pipeline, memory/action boundaries, release baseline, CI evidence and remaining acceptance boundary.
- [ ] Add an accessible SVG showing client input, server-owned session, context/memory, STT/LLM/TTS, action authorization and MCA villager output.
- [ ] Link only to the public repository and its public documentation paths.

### Task 3: NODE ZERO flagship case study

**Files:**
- Create: `docs/landing/projects/node-zero.md`
- Create: `docs/assets/diagrams/node-zero-architecture.svg`

- [ ] Document verified premise, vertical-slice scope, Unity/URP/C# platform, authored gameplay-system boundaries, MIRROR constraint model and documentation-first production.
- [ ] Add an accessible SVG showing player, facility systems, authored sequence layer, MIRROR prediction/constraint loop and evidence/narrative outputs.
- [ ] State clearly that the source repository is private/proprietary.

### Task 4: Portfolio integration

**Files:**
- Modify: `docs/landing/projects.md`
- Modify: `docs/toc.yaml`
- Modify: `README.md`

- [ ] Add flagship project cards/links before existing case studies.
- [ ] Include both nested pages in navigation/sitemap discovery.
- [ ] Document the active-project manifest and diagram asset convention.

### Task 5: Verification and visual baseline

- [ ] Open a draft PR and run the full existing CI.
- [ ] Fix functional, integrity, browser, Axe, Lighthouse and cross-browser failures without weakening gates.
- [ ] Use the successful browser screenshots to update only intentional visual baselines.
- [ ] Re-run final-head CI.
- [ ] Review `master...agent/flagship-portfolio` for unrelated files/secrets and squash-merge only after green final-head CI.
