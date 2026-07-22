# Photo Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic, chronological Photo Stories section with static album pages, an accessible fullscreen lightbox, and a preserved archive of the three existing standalone photos.

**Architecture:** Generate `/photos/` and `/photos/<slug>/` as standalone static HTML during the existing Node.js post-processing stage from validated local JSON registries. Keep the existing `landing/photos.html` route working as a deployment-safe compatibility bridge, and use vanilla JavaScript only for progressive filtering, lightbox behavior, touch/keyboard navigation, and hash deep links; all core photo content remains available without JavaScript.

**Tech Stack:** Node.js 24+, npm 11.5.1+, ES modules, Node test runner, Diplodoc build/post-processing, static HTML/CSS/vanilla JavaScript, Playwright, Axe, GitHub Actions.

## Global Constraints

- Preserve `static-first + build-time intelligence + progressive enhancement`.
- No backend, CMS, database, authentication, runtime GitHub API, frontend framework, runtime content fetch, image CDN, social mechanics, EXIF browser, or AI-generated captions.
- Do not add fake/demo albums to `master`; an empty album registry is valid until a real multi-photo story exists.
- Existing standalone photos remain in `Из архива` and use the same lightbox.
- Published albums sort newest-first and group by year; categories are filters only.
- Categories are exactly `travel`, `study-events`, `people`, `everyday` with Russian UI labels.
- Album layouts are exactly `wide`, `portrait`, `pair`, `triptych`, `standard`.
- Core content and photo anchors remain usable without JavaScript.
- Album/page metadata and generated routes must be deterministic and deployment-subpath safe.
- Existing build, integrity, accessibility, Lighthouse, cross-browser, search, metadata, Engineering Map, bibliography-regression, and visual-regression gates must remain green.
- Browser quality must cover desktop/mobile overflow, reduced motion, keyboard behavior, focus restoration, hash deep links, and archive lightbox behavior.

---

### Task 1: Canonical Photo Registries and Validation

**Files:**
- Create: `data/photo-albums.json`
- Create: `data/photo-archive.json`
- Create: `scripts/photo-stories.js`
- Create: `scripts/photo-stories.test.js`

**Interfaces:**
- Produces `PHOTO_CATEGORIES`, `PHOTO_LAYOUTS`, `validatePhotoAlbums(albums, options)`, `validatePhotoArchive(items, options)`, `loadPhotoContent(options)`, and `groupPublishedAlbumsByYear(albums)`.
- Asset paths are repository-relative under `docs/` and must resolve inside `docs/assets/` without traversal.

- [ ] **Step 1: Write failing registry tests**

Create tests that import `./photo-stories.js` and verify: empty album registry is accepted; duplicate album slugs fail; duplicate photo IDs within one album fail; unknown category/layout fails; a published album with no photos fails; missing/unsafe cover or image paths fail when file checks are enabled; blank `alt` fails; archive order is deterministic; published albums sort newest-first and group by year.

- [ ] **Step 2: Run the failing test**

Run: `node --test scripts/photo-stories.test.js`

Expected: FAIL because `scripts/photo-stories.js` does not exist yet.

- [ ] **Step 3: Add canonical initial data**

`data/photo-albums.json` starts as `[]` because there is no real multi-photo story yet.

`data/photo-archive.json` contains exactly the current three images using their existing safe paths:

```json
[
  {
    "id": "semihatov",
    "src": "assets/images/Semihatov.jpg",
    "alt": "А. М. Семихатов",
    "title": "Конференции и встречи",
    "caption": "Один из кадров, который я сохранил ещё в ранней версии сайта.",
    "order": 1
  },
  {
    "id": "magister",
    "src": "assets/images/magister.jpg",
    "alt": "Фотография после защиты магистерской диссертации",
    "title": "Защита магистерской",
    "caption": "Важный для меня кадр, связанный с окончанием магистратуры.",
    "order": 2
  },
  {
    "id": "avatar",
    "src": "assets/images/avatar.png",
    "alt": "Портрет Руслана Немыкина",
    "title": "Из личного архива",
    "caption": "Фотография, которая долго использовалась как основная на сайте.",
    "order": 3
  }
]
```

- [ ] **Step 4: Implement validators and loaders**

Implement strict validation with explicit category/layout sets, safe asset-path normalization, unique IDs/slugs, ISO `YYYY-MM` album date validation, `year` consistency with date, optional photo `YYYY-MM-DD` validation, and deterministic immutable sorting helpers.

- [ ] **Step 5: Run tests**

Run: `node --test scripts/photo-stories.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: add canonical photo story registries`

### Task 2: Standalone Static Photo Routes and Legacy Compatibility

**Files:**
- Create: `templates/photos-index.html`
- Create: `templates/photo-album.html`
- Modify: `scripts/photo-stories.js`
- Modify: `scripts/photo-stories.test.js`
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/copy-assets.test.js`
- Modify: `docs/landing/photos.md`

**Interfaces:**
- Produces `renderPhotoIndexPage(model)`, `renderPhotoAlbumPage(album, context)`, `renderLegacyPhotosBridge(siteBasePath)`, and `writePhotoStories(options)`.
- `writePhotoStories()` returns `{routes, albumRoutes, indexPath, legacyPath}` for downstream sitemap/verification use.
- Generated routes: `photos/index.html`, `photos/<slug>/index.html`, plus compatibility output at `landing/photos.html`.

- [ ] **Step 1: Add failing renderer/build integration tests**

Tests must prove that an empty album registry still renders a complete `/photos/` page with no fake album cards, a visible `Из архива` section with three photos, semantic anchors, and an explicit empty-state message; fixture albums must render year groups and standalone album pages; the old `landing/photos.html` route must contain a visible deployment-safe link plus immediate compatibility redirect to `../photos/`.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test scripts/photo-stories.test.js scripts/copy-assets.test.js`

Expected: FAIL because render/build functions are not implemented.

- [ ] **Step 3: Implement semantic standalone renderers**

Index requirements: intro/hero, category controls only when published albums exist, newest-first year groups, album cards containing cover/title/place/date/count/category, explicit no-album state, and archive grid.

Album requirements: cinematic hero, title/place/date/category/count, short story text, editorial photo sequence using only allowed layout types, neighbor-story navigation, back-to-archive link, and stable `id="photo-N"` anchors.

- [ ] **Step 4: Integrate with `postprocessOutput()`**

Load/validate photo registries before output mutation, call `writePhotoStories()` after assets are copied, and return generated route information from `postprocessOutput()`.

- [ ] **Step 5: Replace legacy generated route safely**

The generated `landing/photos.html` must remain HTTP-200 and include both `<meta http-equiv="refresh" content="0;url=../photos/">` and a visible ordinary `<a href="../photos/">Открыть фотоархив</a>` fallback. Do not rely on JavaScript for the compatibility route.

- [ ] **Step 6: Run tests/build integration tests**

Run: `node --test scripts/photo-stories.test.js scripts/copy-assets.test.js`

Expected: PASS.

- [ ] **Step 7: Commit**

Commit: `feat: generate static photo story routes`

### Task 3: Cinematic Visual System

**Files:**
- Create: `docs/_assets/style/photo-stories.css`
- Modify: `docs/.yfm`
- Modify: `templates/photos-index.html`
- Modify: `templates/photo-album.html`
- Modify: `scripts/photo-stories.test.js`

**Interfaces:**
- Standalone pages use stable `tr-photo-*` class names and `data-tr-photo-page` markers.
- CSS is shared by index and album pages and must not affect other site surfaces.

- [ ] **Step 1: Add structural CSS-contract tests**

Tests assert standalone templates include the shared core styles plus `photo-stories.css`, proper viewport/meta tags, a `data-tr-photo-page` marker, and no Diplodoc runtime bundle references.

- [ ] **Step 2: Implement index visual system**

Add atmospheric dark hero, chronological year rhythm, responsive album cards, restrained category chips, intentional empty-state treatment, and archive tiles. Preserve the existing graphite/cyan/violet design language without making the page look like a social feed.

- [ ] **Step 3: Implement album visual system**

Add near-viewport cinematic hero, readable overlay gradient, editorial spacing, `wide`/`portrait`/`pair`/`triptych`/`standard` layouts, captions, previous/next story navigation, and one-column mobile degradation preserving DOM order.

- [ ] **Step 4: Add performance-oriented image markup**

Index archive/card images below the fold use `loading="lazy"`; album hero uses eager/high-priority loading; rendered images include `width`/`height` when available in registry or a stable `aspect-ratio` wrapper fallback; full album originals are never embedded on the index.

- [ ] **Step 5: Run tests**

Run: `node --test scripts/photo-stories.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: add cinematic photo stories visual system`

### Task 4: Accessible Progressive Lightbox and Category Filters

**Files:**
- Create: `docs/_assets/script/photo-stories.js`
- Create: `scripts/photo-stories-ui.test.js`
- Modify: `docs/.yfm`
- Modify: `templates/photos-index.html`
- Modify: `templates/photo-album.html`

**Interfaces:**
- Expose `globalThis.TrueRuslanPhotoStories` with pure helpers `parsePhotoHash(hash)`, `buildPhotoHash(id)`, `nextPhotoIndex(current, delta, length)`, `isEditableTarget(target)`, and `init()`.
- Lightbox discovers links through `[data-tr-photo-lightbox]` and groups through `data-tr-photo-group`.

- [ ] **Step 1: Write failing pure-helper/classic-script tests**

Verify hash parsing/building, circular next/previous index math, classic dependency-free syntax, and editable-target detection.

- [ ] **Step 2: Run failing UI tests**

Run: `node --test scripts/photo-stories-ui.test.js`

Expected: FAIL because the browser script does not exist.

- [ ] **Step 3: Implement progressive category filtering**

Buttons use `aria-pressed`; filtering hides/shows cards without changing DOM order; `Все` restores all; with no albums, filter controls are absent.

- [ ] **Step 4: Implement accessible lightbox**

Create one runtime dialog overlay with `role="dialog"`, `aria-modal="true"`, close/previous/next controls, counter, caption metadata, preserved aspect ratio, scroll lock, focus trap, Escape close, arrow navigation, click-backdrop close, and focus restoration to the originating photo link.

- [ ] **Step 5: Implement touch/hash/preloading behavior**

Horizontal swipe threshold navigates without stealing normal vertical gestures; opening sets `#photo-id`; valid initial hash opens the matching photo after init; closing restores the pre-open URL without reload; only adjacent images are preloaded.

- [ ] **Step 6: Respect reduced motion**

All nonessential transitions are disabled by CSS/JS behavior under `prefers-reduced-motion: reduce`.

- [ ] **Step 7: Run UI tests**

Run: `node --test scripts/photo-stories-ui.test.js`

Expected: PASS.

- [ ] **Step 8: Commit**

Commit: `feat: add accessible photo lightbox`

### Task 5: Navigation, Sitemap, Metadata, Command Palette, and Documentation

**Files:**
- Modify: `templates/index.html`
- Modify: `docs/toc.yaml`
- Modify: `docs/_assets/script/command-palette.js`
- Modify: `scripts/command-palette.test.js`
- Modify: `scripts/seo.js` and/or its tests where the current sitemap implementation lives
- Modify: `scripts/photo-stories.js`
- Modify: `scripts/photo-stories.test.js`
- Modify: `README.md`

**Interfaces:**
- Main Photos destination is `photos/` from the standalone homepage and deployment-root-aware equivalents elsewhere.
- Sitemap includes `/photos/` and every published `/photos/<slug>/` route.
- Each standalone photo page emits deterministic title, description, canonical, OpenGraph/Twitter metadata; album OG image uses its cover asset.

- [ ] **Step 1: Add failing navigation/sitemap/metadata tests**

Verify homepage Photos points to `photos/`, command palette contains one `photos` command, sitemap contains generated photo routes exactly once, and generated standalone pages have canonical/OG/Twitter metadata.

- [ ] **Step 2: Update navigation surfaces**

Keep the existing visible `Фото`/`Фотографии` destination but point modern navigation to the standalone route. Preserve `landing/photos.html` only as backward compatibility, not as the primary destination.

- [ ] **Step 3: Extend command palette**

Add deterministic `photos` command with target `photos/`; keep full-text search handoff unchanged.

- [ ] **Step 4: Extend sitemap/metadata generation**

Feed generated photo routes into sitemap generation without duplicating toc-derived URLs. Render album metadata from canonical album data and the site base URL.

- [ ] **Step 5: Update README**

Document Photo Stories registries, build-time routes, no-JS boundary, lightbox progressive enhancement, and how to add a future real album.

- [ ] **Step 6: Run relevant tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 7: Commit**

Commit: `feat: integrate photo stories with portfolio navigation`

### Task 6: Browser/A11y/Production Quality Gates

**Files:**
- Create: `scripts/photo-stories-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`
- Modify: `scripts/production-smoke.js`
- Modify: `scripts/production-smoke.test.js`
- Modify: `scripts/site-integrity.js` or tests only if generated standalone routes are not already discovered through normal links
- Modify: `tests/visual-baselines.json` only after intentional screenshots are verified and only if Photo Stories is added to the existing visual-regression runner.

**Interfaces:**
- Browser smoke saves `photo-stories-desktop.png`, `photo-stories-mobile.png`, and Axe diagnostics to `quality-artifacts/`.
- Production smoke monitors `/photos/`, `/_assets/style/photo-stories.css`, and `/_assets/script/photo-stories.js`.

- [ ] **Step 1: Add browser smoke with current real archive state**

At desktop and 390px mobile verify: HTTP 200, no horizontal overflow, no browser errors/failed same-origin resources, no fake album cards when registry is empty, exactly three archive items, archive image opens lightbox, hash changes, Escape closes, focus restores, direct archive hash opens correct image, reduced motion works, and Axe has no serious/critical violations attributable to the page.

- [ ] **Step 2: Add fixture-based album browser coverage where practical**

Unit/build fixtures already prove album generation. Browser smoke may inject a small DOM fixture or use generated fixture output to verify next/previous controls and category filtering without shipping fake public albums.

- [ ] **Step 3: Wire CI**

Add `Photo Stories browser smoke` after build/browser prerequisites and copy its logs/screenshots into quality artifacts.

- [ ] **Step 4: Extend production smoke**

Monitor real `/photos/` plus CSS/JS resources. Do not add fake album URLs.

- [ ] **Step 5: Run full local/CI-equivalent commands**

Run: `npm test`

Run: `npm run build:docs`

Run: `npm run check:site`

Expected: all PASS.

- [ ] **Step 6: Commit**

Commit: `test: add photo stories quality gates`

### Task 7: PR Verification, CI Repair, and Merge

**Files:**
- No planned production files; change only root causes exposed by verification.

**Interfaces:**
- Final branch must be reviewable as one coherent Photo Stories feature and preserve all existing quality thresholds.

- [ ] **Step 1: Review complete branch diff**

Compare `master...feat/photo-stories`; reject unrelated refactors, fake content, duplicated metadata sources, unsafe paths, or runtime dependencies.

- [ ] **Step 2: Verify generated artifacts conceptually and through CI evidence**

Confirm `/photos/`, legacy bridge, three archive items, photo assets, stylesheet/script, sitemap entries, metadata, command palette destination, and no-JS semantic markup exist.

- [ ] **Step 3: Run/inspect the full PR workflow**

Inspect every required job/step, not only aggregate status. On failure, inspect logs and fix root cause without weakening a gate.

- [ ] **Step 4: Review screenshots/Axe evidence**

Confirm desktop/mobile output matches the approved cinematic direction, archive remains restrained, lightbox controls are usable, and no accidental overflow/hydration regressions exist.

- [ ] **Step 5: Final verification**

Re-run status checks for the final head after all fixes. Merge only the exact fully-green final head.

- [ ] **Step 6: Merge**

Squash-merge the PR to `master` only after the full required workflow is green and the final diff is clean.
