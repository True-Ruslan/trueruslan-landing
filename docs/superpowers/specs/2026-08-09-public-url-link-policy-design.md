# Public URL Namespace & Link Policy — Design

Status: APPROVED FOR IMPLEMENTATION
Date: 2026-08-09

## Goal

Make public navigation cleaner and more predictable without changing the static-first source architecture:

- remove `/landing` from canonical/public RU URLs;
- preserve all existing `/landing/...` and `.html` entrypoints as compatibility redirects;
- open inter-page and external links in a new tab/window;
- keep same-page `#fragment` navigation in the current tab;
- preserve SEO, no-JS, search, privacy, accessibility, and exact-production acceptance contracts.

## Public URL contract

Source paths remain under `docs/landing/**`. Public routing is projected at build time.

Examples:

- `docs/landing/resume.md` -> `/resume/`
- `docs/landing/projects.md` -> `/projects/`
- `docs/landing/projects/notchhub.md` -> `/projects/notchhub/`
- `docs/landing/notes.md` -> `/notes/`
- `docs/landing/notes/green-ci-is-not-product-verification.md` -> `/notes/green-ci-is-not-product-verification/`
- `docs/landing/publications.md` -> `/publications/`
- `docs/landing/about.md` -> `/about/`
- `docs/landing/work-with-me.md` -> `/work-with-me/`
- `docs/landing/now.md` -> `/now/`

English keeps its locale namespace: `/en/...`.

The root homepage stays `/`.

## Compatibility redirects

Existing public addresses remain valid and must redirect to the new canonical route:

- `/landing/resume/` -> `/resume/`
- `/landing/resume.html` -> `/resume/`
- `/landing/projects/notchhub/` -> `/projects/notchhub/`
- `/landing/projects/notchhub.html` -> `/projects/notchhub/`

Compatibility pages must remain `noindex,follow` and point their canonical to the new URL. Query strings and fragments must be preserved by the JavaScript redirect.

No legacy URL may become a second canonical content surface.

## Link-opening policy

All links that navigate away from the current document must open in a new browsing context:

- internal page links;
- external links;
- generated search results;
- header/sidebar/footer links;
- CTA cards and project links;
- links produced by postprocessors.

Required attributes:

```html
target="_blank" rel="noopener noreferrer"
```

Exceptions:

- `href="#..."` same-document fragments stay in the current tab;
- non-navigation schemes handled by the browser/user agent such as `mailto:` and `tel:` are not force-rewritten;
- form controls and scripted controls are outside this policy.

The policy is applied build-time to final HTML so it covers Diplodoc-generated links and custom templates from one authority.

## Architecture

### Route projection

Extend `scripts/clean-urls.js` with a reviewed public-route mapper that removes only the leading `landing/` namespace from generated RU content. It must not strip arbitrary path segments and must not change `/en/...`, assets, search identities, or GitHub Pages repository base paths.

The clean-route publisher creates canonical directory indexes at the projected path, rewrites canonical/hreflang/sitemap/internal references, and writes compatibility redirects at both generated `.html` and old `/landing/.../` directory entrypoints.

### Link policy postprocessing

Add a focused build-time HTML link-policy pass after clean-route generation. It scans final HTML anchors and applies `_blank` + `noopener noreferrer` when the href is a navigational URL and is not a same-document fragment/mailto/tel link.

The implementation must be idempotent and must merge `rel` tokens without deleting existing values.

## SEO contract

After migration:

- canonical and hreflang use the projected public routes;
- sitemap contains only canonical projected routes, not `/landing/...` URLs;
- internal rendered links point to projected routes;
- legacy `/landing/...` pages are `noindex,follow` compatibility redirects;
- generated search result links use projected public routes;
- canonical route count must not accidentally duplicate content.

## Static-first / search boundary

- no runtime router, backend, Cloudflare Worker, or JS-only navigation is introduced;
- Diplodoc remains the sole site-wide search owner;
- search registry identities may remain internal/source-oriented if required, while user-visible result links are projected to canonical public routes;
- core content remains readable without JavaScript.

## Testing

TDD must establish failures for:

1. route projection `landing/resume.html -> resume/` and nested project/note routes;
2. preservation of `/en/...` and GitHub Pages subpath bases;
3. old `/landing/...` directory and `.html` compatibility redirects;
4. canonical/hreflang/sitemap without `/landing`;
5. internal generated links without `/landing`;
6. `_blank` + `noopener noreferrer` on inter-page/external anchors;
7. same-page fragments remaining same-tab;
8. idempotent `rel` merging;
9. generated search links using projected public routes;
10. full existing browser/a11y/Lighthouse/privacy/visual/custom-domain matrix.

## Rollout

This is a standalone infrastructure/presentation slice before C2 Homepage clarity.

Order:

1. RED contract;
2. route mapper + compatibility redirects;
3. global link policy;
4. update source navigation only where needed for canonical semantics;
5. full CI and security review;
6. merge;
7. exact Pages deployment + Production Live acceptance;
8. durable acceptance ledger;
9. resume C2 from the accepted master baseline.

## Non-goals

- moving `docs/landing/**` physically;
- changing English locale structure;
- changing project lifecycle/evidence;
- redesigning homepage content;
- introducing client-side routing;
- deleting historical compatibility entrypoints.