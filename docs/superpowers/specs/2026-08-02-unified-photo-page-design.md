# Unified Photo Page Design

## Status

Approved for implementation on 2026-08-02.

## Problem

The public photo section is currently generated as a standalone mini-site at `/photos/`. It owns a separate HTML template, header, navigation, footer, content width and hero system. This creates three visible inconsistencies:

1. the current shared header utility controls are absent and an older text-based header is shown;
2. the Diplodoc left navigation disappears;
3. the photo title starts after a deliberately oversized `72vh` hero, so the page has an excessive gap below the header.

The implementation also duplicates site navigation markup inside `scripts/photo-stories.js`, which can drift whenever the main header changes.

## Goal

Make `/landing/photos.html` the single canonical photo index and render Photo Stories inside the normal Diplodoc page shell, preserving the standard header, left navigation, active `Фото` item, content geometry, accessibility and shared utility controls.

## Canonical routes

- Canonical photo index: `/landing/photos.html`.
- Legacy compatibility route: `/photos/` redirects to `/landing/photos.html` and includes a visible fallback link.
- Existing future album routes may remain under `/photos/<slug>/` because a cinematic standalone story layout is appropriate for an individual album.
- Every link that means “open the photo index” must point to `/landing/photos.html`.
- Sitemap, metadata, command palette and canonical URL must use `/landing/photos.html` for the index.

## Architecture

### Index page

Diplodoc continues to build `docs/landing/photos.md` into `docs-html/landing/photos.html`. Post-processing replaces only the Markdown article body with generated Photo Stories content and injects the photo stylesheet, script and lightbox shell. It must not replace the document shell, header, sidebar, right table of contents, language controls or shared runtime scripts.

The generated content has one page-level heading (`Фотографии`) supplied by the Diplodoc page. Photo-specific content begins directly below the introductory copy and uses ordinary content spacing rather than a fullscreen hero.

### Album pages

Standalone album pages remain supported at `/photos/<slug>/`. They keep the cinematic cover hero, editorial photo layouts, lightbox and previous/next story navigation. Their header must use the current shared header utility contract rather than the obsolete handwritten navigation. Because the production album registry is currently empty, no public album page changes are visible immediately, but generator tests must preserve the future contract.

### Legacy route

`/photos/index.html` becomes a compatibility bridge only. It redirects to `../landing/photos.html`, uses a canonical link for that destination and contains a readable fallback link. It must not include a second full page layout.

## Content layout

The index page keeps the existing content and functionality:

- short first-person introduction;
- optional category filters when published albums exist;
- chronological album groups when published albums exist;
- honest empty state when no real albums exist;
- the three current archive photographs;
- accessible fullscreen lightbox and hash deep links.

The standalone index hero is removed. Specifically, the index must not use `min-height: 72vh`, a `9rem` title or bottom-aligned fullscreen composition. Photo cards and archive imagery may retain their visual identity inside the standard content column.

## Navigation and duplication rules

- No `renderHeader()` or equivalent full site navigation is allowed in the photo index generator.
- No duplicate site footer is allowed in the photo index generator.
- The active `Фото` item is owned by Diplodoc navigation.
- Shared header icons, search and language controls are owned by the existing header runtime.
- The legacy Markdown page is not a second source of photo cards; its body is a stable injection target and concise no-JS fallback.

## Styling

`photo-stories.css` is split conceptually into:

1. embedded index styles scoped to the generated content inside the Diplodoc article;
2. shared card, archive and lightbox styles;
3. standalone album styles.

The embedded index must:

- fit the normal article width;
- avoid horizontal overflow at 390 px;
- use standard top spacing after the page heading;
- avoid styling the site header or sidebar;
- preserve readable card sizes on desktop and a single-column layout on mobile.

## Runtime behavior

`photo-stories.js` initializes from a photo content root inserted into the Diplodoc article. The lightbox shell may be inserted next to that root or at the end of `body`, but initialization must not depend on a photo-specific `<body>` class. Existing filtering, keyboard navigation, focus restoration, escape handling, hash handling and swipe behavior remain unchanged.

## Accessibility

- One `h1` on the index page.
- Existing sidebar and breadcrumb semantics remain intact.
- Filter buttons retain `aria-pressed`.
- Lightbox remains modal, keyboard-operable and focus-trapped.
- Archive images retain meaningful alt text.
- The `/photos/` bridge exposes a visible fallback link.
- Axe serious/critical violations remain zero.

## Testing

### Unit contracts

Tests must prove that:

- the generator enhances an existing Diplodoc HTML document rather than emitting a standalone index;
- the output retains supplied header/sidebar markers;
- exactly one `h1` remains;
- the generated index contains archive items, empty state and lightbox shell;
- the generated index contains no `tr-site-header`, `tr-site-nav` or standalone index hero;
- `/photos/` redirects and canonicalizes to `/landing/photos.html`;
- future album generation remains supported.

### Browser contracts

The Photo Stories browser smoke must open `/landing/photos.html` and verify:

- shared current header controls exist in the approved order;
- Diplodoc left navigation is visible on desktop and `Фото` is active;
- there is no legacy standalone header;
- the title begins within normal content spacing rather than after a viewport-height hero;
- archive and lightbox behavior still work;
- desktop and mobile have no overflow;
- accessibility checks pass.

The smoke must also open `/photos/` and verify the redirect destination.

### Visual regression

Desktop and mobile baselines are updated only after manual review. Expected changes are limited to the photo index route: standard site shell, normal heading spacing and embedded archive content.

## Migration and compatibility

- Existing bookmarks to `/photos/` continue to work through the redirect.
- Search and command-palette targets are updated to `/landing/photos.html`.
- Existing image hashes on `/photos/` cannot be preserved across the redirect automatically; generated index archive links use hashes on `/landing/photos.html` going forward.
- There are no published albums in production, so index migration does not move user-visible album URLs.

## Non-goals

- Redesigning the general Diplodoc sidebar.
- Replacing Diplodoc with a custom application shell.
- Publishing a demonstration album.
- Changing archive photographs or captions.
- Removing cinematic standalone layouts for future individual photo stories.
- Refactoring unrelated site navigation code.
