# TrueRuslan Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a distinctive dark engineering portfolio on the existing Diplodoc site without replacing its content architecture or adding a frontend framework.

**Architecture:** Native Diplodoc theme tokens provide the palette; supported custom CSS/JS provide presentation and progressive enhancement; Page Constructor remains responsible for homepage composition. Production hardening already lives in `master` and is not duplicated here.

**Tech Stack:** Diplodoc CLI 5.x, Gravity UI Page Constructor, YAML/YFM, CSS, vanilla JavaScript, Node.js 24 test runner.

## Global Constraints

- Palette: `#090B10`, `#11151C`, `#171C24`, `#F4F7FB`, `#9CA9B8`, `#4CC9F0`, `#8B5CF6`, `#4ADE80`.
- No runtime frontend framework or animation library.
- JavaScript is progressive enhancement only.
- Respect `prefers-reduced-motion: reduce`.
- Preserve existing SEO/post-processing/static deployment.
- Build and tests are mandatory release gates.

## Tasks

### 1. Theme and custom-resource contract

Files: `docs/theme.yaml`, `docs/.yfm`, `package.json`, `scripts/visual-config.test.js`.

- Add tests for resource wiring, quoted theme colors and build flag.
- Enable custom CSS/JS resources.
- Add native Diplodoc palette.
- Enable `--allow-custom-resources` in full and fast builds.

### 2. Visual system

File: `docs/_assets/style/custom.css`.

- Add design tokens and ambient grid/glows.
- Style sticky navigation, cards and CTAs.
- Add terminal panel, reveal states, responsive rules and reduced-motion fallback.
- Preserve keyboard focus visibility.

### 3. Progressive behavior

Files: `docs/_assets/script/custom.js`, `scripts/visual-enhancements.test.js`.

- Test page classification and terminal identity copy.
- Add guarded classic-script API compatible with static Diplodoc resources.
- Scope card/CTA/reveal enhancements to `main`, excluding `nav` and `aside`.
- Add one homepage terminal, external-link hardening, reveal observer and pointer glow.

### 4. Homepage and content

Files: `docs/index.yaml`, `docs/landing/projects.md`, `docs/landing/about.md`, `docs/landing/contacts.md`, `docs/toc.yaml`.

- Reposition homepage around Backend Engineer / Java / Distributed Systems / AI.
- Add project/resume CTAs and engineering-focus cards.
- Turn projects into verified portfolio case entries.
- Tighten About/Contacts copy and brand navigation.

### 5. Documentation and release validation

Files: `README.md`, this plan, design spec.

- Document theme/custom-resource architecture.
- Run `npm test` and `npm run build:docs` in CI.
- Confirm final PR diff contains only redesign-related files.
- Open draft PR directly to `master`; move to ready only after checks are green.
