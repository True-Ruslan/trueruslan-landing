# Engineering Notes & Social Preview System — Design

## Goal

Extend the portfolio with a durable technical-writing surface, page-specific social preview metadata, deterministic OpenGraph PNG cards and deeper case-study visuals without introducing a custom domain, hosted CMS, analytics provider or runtime API dependency.

## Scope

### Engineering Notes

Add `/landing/notes/` as a first-class knowledge section with an index and three initial articles grounded in systems already built in this portfolio:

1. **Why I split the landing page from the Diplodoc runtime** — performance architecture, hydration boundary and trade-offs.
2. **Quality gates for a static engineering portfolio** — generated-site integrity, browser smoke, accessibility, Lighthouse and visual regression.
3. **Designing a server-authoritative AI NPC pipeline** — LivingWorld session ownership, text/voice ingress, provider orchestration, memory and action authorization.

Notes are authored Markdown, included in navigation and sitemap discovery, and must distinguish verified project facts from general engineering interpretation.

### Page metadata manifest

Create `data/page-meta.json` as the single source of truth for title, description, OG card type and optional tags for high-value pages:

- homepage;
- Projects hub;
- Resume;
- LivingWorld case study;
- NODE ZERO case study;
- Engineering Notes hub;
- each initial note.

Post-processing injects/replaces canonical, description, OpenGraph and Twitter metadata into final generated HTML. No page should require runtime JavaScript for metadata.

### Deterministic OpenGraph PNG generation

Generate 1200×630 PNG cards during normal Node.js post-processing with no external binaries or new npm dependencies.

Implementation uses:

- built-in `node:zlib` for PNG compression;
- a small internal raster renderer for background, accents, badges and a limited uppercase ASCII bitmap font;
- deterministic per-card accent configuration from the metadata manifest.

Cards are written to `docs-html/assets/og/*.png`. The generated HTML references absolute `SITE_URL` URLs.

The renderer does not attempt general typography. Titles and labels intended for cards use a constrained ASCII display form while page metadata remains full Russian/English Unicode text.

### Case-study visual depth

Add one additional SVG visual per flagship case study:

- LivingWorld: request/session/trust-boundary sequence;
- NODE ZERO: gameplay/system-state flow around authored sequences, facility state and MIRROR prediction.

SVGs remain dependency-free, accessible (`title`/`desc`) and use the existing graphite/cyan/violet visual language.

## Architecture

```text
data/page-meta.json
       │
       ├── validate manifest
       ├── generate deterministic OG PNGs
       └── inject metadata into final docs-html pages

Markdown notes ──▶ Diplodoc ──▶ docs-html
                              │
                              └── post-processing
                                   ├── assets
                                   ├── search normalization
                                   ├── standalone homepage
                                   ├── OG cards
                                   ├── page metadata
                                   ├── sitemap / robots
                                   └── Person JSON-LD
```

## Error handling

- manifest validation fails on duplicate paths/slugs, missing titles/descriptions, unsafe output names or unsupported accent values;
- post-processing fails when a manifest page is missing from `docs-html`;
- generated PNGs are validated for PNG signature and exact 1200×630 IHDR dimensions;
- metadata injection is idempotent and replaces stale generated tags rather than duplicating them;
- OpenGraph image paths are included in generated-site integrity checks.

## Testing

- unit tests for metadata validation and idempotent HTML injection;
- unit tests for deterministic PNG output, signature and dimensions;
- post-processing test verifies OG files and injected metadata;
- site-integrity checker validates local OG image targets;
- browser quality assertions verify high-value page title/description/OG metadata;
- existing Chromium/Axe/Lighthouse, Firefox/WebKit, search smoke and visual regression remain mandatory.

## Constraints

- No custom domain or paid hosting.
- No CMS, analytics provider or runtime external API.
- No new production/runtime dependency.
- Do not weaken existing quality gates.
- Keep personal/private repository boundaries explicit.
