# Launch Preview Metadata Contract — Implementation Plan

> Base this work on `feat/launch-distribution-readiness` exact head so the launch target registry is available without merging PR #202.

## Objective

Turn the existing Open Graph/page metadata implementation into a registry-backed launch preview contract. Keep the current deterministic PNG renderer and remove the hidden dependency on the later clean-URL text rewrite.

## Task 1 — RED: launch preview contract

Create `scripts/launch-preview-contract.test.js`.

The test must:

- load `data/distribution-targets.json` and canonical page metadata;
- require one metadata entry per distribution `pagePath`;
- inject metadata into a minimal HTML document for every target;
- require direct clean canonical/`og:url` projection;
- require OG site/locale/image type/image alt fields;
- require Twitter/X large-image metadata including image alt;
- fail on `.html` or `/landing/` in public URLs.

Run the normal unit suite and preserve the expected RED evidence before changing production code.

## Task 2 — GREEN: make page metadata correct at the owner

Update `scripts/page-meta.js`:

- reuse `toPublicRoute` from `scripts/clean-urls.js`;
- resolve canonical URL directly from the projected public route;
- fail closed if the projection escapes the configured origin, carries search/hash state, leaks legacy source paths or loses directory-style routing;
- add `og:site_name`, derived `og:locale`, `og:image:type=image/png`, and `twitter:image:alt`;
- keep metadata injection idempotent.

Update `scripts/page-meta.test.js` so direct injection expects clean public URLs, including nested site-base behavior and locale metadata.

## Task 3 — GREEN: browser coverage follows launch registry

Update `scripts/metadata-smoke.cjs` so the RU launch surface is derived from:

- `data/distribution-targets.json` for scope;
- `data/page-meta.json` for title/card expectations.

Retain explicit EN/special supplemental coverage that is outside the launch registry.

Browser assertions must verify canonical = `og:url`, clean public routing, OG required fields, site name, locale, image type/size/alt and Twitter/X parity.

## Task 4 — Documentation and review

Keep this design/plan with the code. Do not claim production acceptance for an unmerged stacked PR.

Run exact-head:

- unit suite;
- full Build matrix including metadata/browser/site integrity;
- CodeQL;
- Dependency Review.

Review the final diff for duplicate registries, runtime/network dependencies, auto-post behavior and evidence-boundary drift. Move the PR from Draft to Ready only after all exact-head gates are green.
