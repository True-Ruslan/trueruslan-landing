# TrueRuslan Visual Redesign — Design Specification

## Goal

Turn the current Diplodoc-based personal site from a documentation-looking landing page into a distinctive engineering portfolio while preserving the Markdown/Diplodoc architecture, static deployment model, SEO pipeline, and low maintenance cost.

## Visual direction

The site uses a restrained **Developer Terminal / Modern Engineering Portfolio** identity:

- 70% clean modern engineering portfolio;
- 20% terminal/developer aesthetic;
- 10% subtle futuristic AI aesthetic.

Avoid loud cyberpunk, permanent neon animations, excessive glassmorphism, and animation for animation's sake.

## Color system

Dark-first palette:

- page background `#090B10`;
- elevated surface `#11151C`;
- secondary surface `#171C24`;
- primary text `#F4F7FB`;
- secondary text `#9CA9B8`;
- cyan accent `#4CC9F0`;
- violet accent `#8B5CF6`;
- success accent `#4ADE80`.

Diplodoc theme tokens define the base palette. Custom CSS provides gradients, surfaces, interaction states, and layout polish.

## Architecture

### Native Diplodoc theme

`docs/theme.yaml` is the source of truth for base brand/background/text/link/code/table/note colors.

### Custom resource layer

- `docs/_assets/style/custom.css` — design tokens, ambient background, navigation, cards, buttons, typography, terminal panel, reveal states, responsive and reduced-motion rules.
- `docs/_assets/script/custom.js` — progressive enhancement only: page marker classes, terminal typing, reveal observer, external-link hardening and pointer glow.

The site must remain usable with JavaScript disabled. `.yfm` references both resources; build commands explicitly allow custom resources.

### Homepage

Keep `docs/index.yaml` as Page Constructor composition with:

- `Руслан Немыкин` hero;
- `Backend Engineer · Java · Distributed Systems · AI` positioning;
- concise engineering value proposition;
- project/resume CTAs;
- exactly one terminal-style signature accent;
- clearer product-style navigation cards.

### Projects

`docs/landing/projects.md` becomes a portfolio surface grouped by engineering area, with purpose, stack, outcome/status and direct links. Do not invent unsupported metrics.

## Interaction design

- sticky translucent navigation with blur where supported;
- animated link underline;
- 3–4px card lift and restrained cyan/violet glow;
- small CTA arrow motion;
- low-opacity grid and ambient gradients;
- opacity + small translate reveal;
- all decorative motion reduced/disabled for `prefers-reduced-motion: reduce`.

## Accessibility and resilience

- readable dark-theme contrast;
- visible keyboard focus;
- no interaction depends only on hover;
- JavaScript never removes/replaces semantic content;
- decorative layers use `pointer-events: none`;
- external `_blank` links receive `noopener noreferrer`;
- DOM enhancement is scoped to page content and must not restyle navigation/aside controls as cards.

## Performance constraints

- no runtime framework;
- no animation library;
- no required webfont download;
- small static CSS/JS;
- transform/opacity-based motion;
- IntersectionObserver only as progressive enhancement.

## Testing strategy

Node tests cover deterministic visual helpers and configuration contracts. `npm test` and `npm run build:docs` remain release gates. YAML color values beginning with `#` must be quoted so they parse as strings rather than YAML comments.

## Deployment strategy

Hardening PR #1 is already merged into `master`. The redesign is developed on `agent/visual-redesign-clean` created from current `master`, and the redesign PR must contain only visual/content/test/documentation changes.
