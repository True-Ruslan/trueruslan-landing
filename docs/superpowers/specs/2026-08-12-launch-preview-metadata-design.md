# Launch Preview Metadata Contract — Design

## Goal

Make every deliberate launch/share target render a complete, canonical and crawler-readable first-contact preview without adding another page registry, runtime dependency or automatic publishing mechanism.

This slice is independent from search-performance measurement. It proves preview readiness; it does not claim traffic, indexing, engagement or announcement reach.

## Evidence basis

The design follows the Open Graph protocol boundary: each shareable object needs a title, type, image and URL; description, site name, locale and structured image properties improve interoperability. Existing 1200×630 deterministic PNG cards are retained because the current renderer already provides a wide 1.91:1 social card without external services or build dependencies.

Search metadata remains page-specific. Titles/descriptions must describe the actual page rather than repeat site-wide boilerplate, and social metadata must resolve to the same public clean URL as canonical navigation.

## Source ownership

- `data/distribution-targets.json` owns the bounded launch/share surface.
- `data/page-meta.json` owns page-specific title, description and card presentation.
- `scripts/clean-urls.js::toPublicRoute` owns public route projection.
- `scripts/page-meta.js` injects static metadata into generated HTML.
- `scripts/og-image.js` owns deterministic preview image generation.

No new list of launch pages may be introduced.

## Contract

For every distribution target:

1. a matching page metadata entry exists for the same source `pagePath`;
2. canonical and `og:url` are absolute HTTPS URLs on the configured site origin;
3. canonical and `og:url` are identical clean directory URLs with no `.html` or `/landing/` leakage;
4. required Open Graph fields are present: `og:title`, `og:type`, `og:image`, `og:url`;
5. useful interoperable fields are present: `og:description`, `og:site_name`, `og:locale`, `og:image:type`, width, height and alt text;
6. X/Twitter large-image metadata mirrors the page title/description/image and exposes image alt text;
7. each referenced local OG PNG exists and remains 1200×630;
8. browser metadata smoke exercises the complete launch surface derived from the registries.

Locale is derived from the source page boundary: `en/**` → `en_US`; all current RU/default launch pages → `ru_RU`.

## Architecture correction

Before this slice `page-meta.js` emitted legacy source URLs such as `/landing/resume.html`; a later clean-URL postprocessor rewrote those values. Final production output could therefore be correct while unit-level page metadata remained legacy-shaped.

This slice makes metadata correct at its owner by projecting URLs through `toPublicRoute` during injection. The later clean-URL pass remains idempotent compatibility hardening, not a prerequisite for metadata correctness.

## Non-goals

- no auto-posting to GitHub, Habr, Telegram, X or other services;
- no search-ranking, CTR or engagement claim;
- no P3.6/P4.1B acceptance;
- no CMS/runtime metadata generation;
- no redesign of the deterministic OG visual language in this slice;
- no keyword stuffing or duplicated site-wide descriptions.

## Acceptance

- contract test covers all current distribution targets and fails closed on missing metadata or legacy URLs;
- metadata unit tests prove clean URL projection directly before `clean-urls.js` runs;
- browser metadata smoke derives and verifies all launch targets;
- full Build, CodeQL and Dependency Review are green on the exact final head;
- because this is a stacked PR, source acceptance remains distinct from production verification until its base and this PR are merged/deployed.
