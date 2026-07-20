# TrueRuslan Visual Redesign — Design Specification

## Goal

Turn the current Diplodoc-based personal site from a documentation-looking landing page into a distinctive engineering portfolio while preserving the existing Markdown/Diplodoc architecture, static deployment model, SEO pipeline, and low maintenance cost.

## Approved visual direction

The site uses a restrained **Developer Terminal / Modern Engineering Portfolio** identity:

- 70% clean modern engineering portfolio;
- 20% terminal/developer aesthetic;
- 10% subtle futuristic AI aesthetic.

The design must avoid loud cyberpunk, permanent neon animations, excessive glassmorphism, and animation for animation's sake.

## Color system

Dark-first palette:

- page background: `#090B10`;
- elevated surface: `#11151C`;
- secondary surface: `#171C24`;
- primary text: `#F4F7FB`;
- secondary text: `#9CA9B8`;
- cyan accent: `#4CC9F0`;
- violet accent: `#8B5CF6`;
- success/engineering accent: `#4ADE80`;
- subtle borders: translucent cyan/white variants.

Diplodoc theme tokens define the base palette. Custom CSS provides gradients, surfaces, interaction states, and layout polish.

## Architecture

### 1. Native Diplodoc theme

Create `docs/theme.yaml` for supported theme tokens. The theme remains the source of truth for base background, brand/link colors, text, code, tables, notes, and navigation states.

### 2. Custom resource layer

Use supported static custom resources:

- `docs/_assets/style/custom.css` — design tokens, background treatment, navigation, cards, buttons, typography, terminal panel, page reveal states, responsive rules, and reduced-motion fallback;
- `docs/_assets/script/custom.js` — progressive enhancement only: page marker classes, terminal typing, scroll reveal, external-link hardening, and pointer glow. The site must remain fully usable with JavaScript disabled.

`.yfm` enables custom resources and references both files. Build scripts explicitly allow custom resources.

### 3. Homepage composition

Keep `docs/index.yaml` as a Page Constructor page. Rebuild it around:

- a strong hero with the name `Руслан Немыкин`;
- positioning: `Backend Engineer · Java · Distributed Systems · AI`;
- short value proposition instead of a generic welcome;
- two primary calls to action: projects and resume/GitHub;
- one terminal-style signature element injected progressively by the custom script;
- section cards with clearer product-style descriptions.

The terminal is a single accent, not the entire visual language.

### 4. Project presentation

`docs/landing/projects.md` becomes a real portfolio surface rather than a short list. Projects are grouped by engineering area and include purpose, stack, outcome/status, and direct links. Existing factual claims are preserved unless already supported by repository content.

### 5. Navigation and interactions

- sticky translucent navigation with blur where supported;
- animated underline/active link behavior;
- card lift of 3–4 px, subtle border/glow transition, no dramatic scaling;
- button arrow movement and small translate effect;
- background grid plus two low-opacity gradient glows;
- staged reveal using opacity + small Y translation;
- all motion disabled/reduced under `prefers-reduced-motion: reduce`.

## Accessibility and resilience

- maintain readable contrast on the dark palette;
- preserve visible keyboard focus states;
- no interaction depends only on hover;
- custom JavaScript must not remove or replace semantic content;
- respect `prefers-reduced-motion`;
- decorative effects use `pointer-events: none` and do not block content;
- external links opened in a new tab receive `rel="noopener noreferrer"` where applicable.

## Performance constraints

- no new runtime framework;
- no animation library;
- no webfont dependency required for the redesign;
- CSS/JS stay small and static;
- effects rely on CSS transforms/opacity where possible;
- IntersectionObserver is used only as progressive enhancement.

## Testing strategy

Add Node tests for deterministic helper behavior in the custom JavaScript where practical. Extend repository-level tests to assert that custom resources are configured and that the build command enables them. Existing `npm test` and `npm run build:docs` remain the release gate.

## Deployment strategy

The redesign is developed on `agent/visual-redesign`. Hardening PR #1 was merged into `master` on 2026-07-20, so the visual redesign is opened directly against `master`; the resulting PR contains only redesign/content/test changes on top of the already-merged production hardening.
