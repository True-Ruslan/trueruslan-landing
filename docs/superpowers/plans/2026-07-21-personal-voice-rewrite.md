# Personal Voice Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the public site copy into a calm first-person engineering-diary voice while preserving factual accuracy, structure, links, project status and technical quality gates.

**Architecture:** This is a content-only rewrite across existing HTML/Markdown sources. Structural hooks, generated placeholders, diagrams, links and runtime behavior remain unchanged. The work is grouped by page role so each section keeps a distinct purpose and avoids repeating the same personal manifesto.

**Tech Stack:** HTML, Markdown/YFM, Diplodoc, existing Node.js build/tests/browser/visual-regression pipeline.

## Global Constraints

- First-person, calm, technically grounded, lightly reader-directed voice.
- No marketing language or artificial enthusiasm.
- Preserve verified facts, timelines, technologies, project readiness/status, links and private/proprietary boundaries.
- Do not change runtime behavior, navigation architecture, search implementation, CV PDF contents or project code.
- Preserve `{{CURRENTLY_BUILDING}}`, Engineering Map build slot, Resume PDF hooks, YFM syntax, diagrams and custom HTML classes/attributes.
- Resume remains scan-friendly and factual; bibliography table summaries remain unchanged.
- Visual baselines may only be updated after all functional gates are green and only for intentional text-flow changes.

---

### Task 1: Rewrite homepage and About

**Files:**
- Modify: `templates/index.html`
- Modify: `docs/landing/about.md`

- [ ] Rewrite hero/section/card copy as a concise personal introduction and explanation of what the site contains.
- [ ] Rewrite About as a coherent first-person story about backend work, engineering values, AI, teaching/research and interests.
- [ ] Preserve all links, classes, placeholders and factual stack references.

### Task 2: Rewrite projects hub and project pages

**Files:**
- Modify: `docs/landing/projects.md`
- Modify: `docs/landing/projects/livingworld.md`
- Modify: `docs/landing/projects/node-zero.md`
- Modify: `docs/landing/projects/taskhub.md`
- Modify: `docs/landing/projects/minichess.md`
- Modify: `docs/landing/projects/godot-horror-template.md`

- [ ] Replace portfolio/marketing framing with personal project narratives: why I started, what interested me, what became difficult, current state and what the reader can inspect.
- [ ] Preserve diagrams, technical facts, versions, links and disclosure boundaries.
- [ ] Avoid inventing retrospective lessons not supported by current project history.

### Task 3: Rewrite Engineering Map and Notes

**Files:**
- Modify: `docs/landing/engineering-map.md`
- Modify: `docs/landing/notes.md`
- Modify: `docs/landing/notes/portfolio-runtime-boundary.md`
- Modify: `docs/landing/notes/static-site-quality-gates.md`
- Modify: `docs/landing/notes/server-authoritative-ai-npcs.md`

- [ ] Explain Engineering Map as my current personal mental model of connections between technologies, problems and projects.
- [ ] Rewrite Notes hub as a reading log of concrete technical conclusions.
- [ ] Rewrite articles in retrospective first-person form while retaining reusable technical conclusions and code/diagram blocks.

### Task 4: Rewrite supporting pages

**Files:**
- Modify: `docs/landing/resume.md`
- Modify: `docs/landing/bibliography.md` framing only
- Modify: `docs/landing/photos.md`
- Modify: `docs/landing/contacts.md`

- [ ] Keep Resume highly scannable; rewrite only intros/transitions/explanatory prose.
- [ ] Add personal framing around the bibliography without altering the source table summaries.
- [ ] Simplify Photos into a small personal archive without filler/repeated notes.
- [ ] Rewrite Contacts as a direct first-person closing page while preserving all contact details.

### Task 5: Editorial review and validation

**Files:** all files above

- [ ] Review complete diff for repeated phrases, marketing/corporate language, unnecessary English and factual drift.
- [ ] Check structural markers/placeholders/links are preserved.
- [ ] Run full PR CI: tests, build, integrity, browser/Axe/Lighthouse, cross-browser, search, metadata/OG, Engineering Map and visual regression.
- [ ] Update visual baselines only if functional gates are green and text-flow changes are intentional.
- [ ] Open PR, review full branch diff, merge only the final fully-green head.
