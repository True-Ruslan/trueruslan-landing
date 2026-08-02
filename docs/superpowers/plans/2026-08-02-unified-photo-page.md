# Unified Photo Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `landing/photos.html` the only canonical photo index, preserving the complete Diplodoc header/sidebar shell while embedding the existing Photo Stories archive and lightbox.

**Architecture:** Diplodoc continues to generate the photo Markdown page. Build-time post-processing replaces one explicit placeholder inside the generated article state, injects photo resources and lightbox markup, and writes `/photos/index.html` only as a compatibility redirect. Future individual album pages remain standalone under `/photos/<slug>/`.

**Tech Stack:** Node.js 24+, ESM, Diplodoc CLI, parse5-based Diplodoc state transformation, static HTML/CSS/JavaScript, Playwright, Axe.

## Global Constraints

- Canonical index route is exactly `landing/photos.html`.
- `/photos/` is redirect-only and must expose a visible fallback link.
- The generated index must retain the Diplodoc header, left sidebar, right article navigation and shared utility runtime.
- Exactly one `h1` may exist on the photo index.
- No `tr-site-header`, `tr-site-nav`, duplicated site footer or `tr-photo-index-hero` may ship on the index.
- Production `data/photo-albums.json` remains empty; no demonstration album may be added.
- Existing three archive photographs, captions, lightbox, keyboard controls, hash handling and focus restoration remain unchanged.
- No new runtime dependency may be added.
- Mobile acceptance width is 390 px with no horizontal overflow.

---

### Task 1: Lock the embedded-index and route contracts

**Files:**
- Modify: `scripts/photo-stories.test.js`
- Modify: `docs/landing/photos.md`

**Interfaces:**
- Consumes: existing `validatePhotoAlbums`, `validatePhotoArchive`, `writePhotoStories` exports.
- Produces: required placeholder `<div data-tr-photo-placeholder></div>` and failing contracts for `renderPhotoIndexContent`, `applyPhotoIndexPage`, and the reversed legacy bridge.

- [ ] **Step 1: Replace standalone-index unit expectations with embedded-page expectations**

Add a minimal generated Diplodoc fixture containing stable shell markers and one placeholder:

```js
const generatedPhotoPage = `<!doctype html>
<html lang="ru">
<head><title>Фотографии</title></head>
<body>
  <header data-test-shared-header></header>
  <aside data-test-sidebar></aside>
  <main><article><h1>Фотографии</h1><p>Intro</p><div data-tr-photo-placeholder></div></article></main>
  <script id="diplodoc-state" type="application/json">{"data":{"html":"<h1>Фотографии</h1><p>Intro</p><div data-tr-photo-placeholder></div>"}}</script>
</body>
</html>`;
```

Import and test these interfaces:

```js
import {
  applyPhotoIndexPage,
  renderPhotoIndexContent,
  renderLegacyPhotosBridge,
} from './photo-stories.js';
```

Assertions must prove:

```js
const content = renderPhotoIndexContent({albums: [], archive: threeArchiveItems});
assert.match(content, /data-tr-photo-page="index"/);
assert.match(content, /data-tr-photo-archive-item/);
assert.doesNotMatch(content, /<h1\b/);
assert.doesNotMatch(content, /tr-photo-index-hero/);

const html = applyPhotoIndexPage(generatedPhotoPage, {
  albums: [],
  archive: threeArchiveItems,
  siteUrl: 'https://example.test',
});
assert.match(html, /data-test-shared-header/);
assert.match(html, /data-test-sidebar/);
assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
assert.match(html, /data-tr-photo-lightbox-root/);
assert.match(html, /photo-stories\.css/);
assert.match(html, /photo-stories\.js/);
assert.doesNotMatch(html, /tr-site-header|tr-site-nav|tr-photo-index-hero/);
```

Update the bridge contract:

```js
const bridge = renderLegacyPhotosBridge('../landing/photos.html');
assert.match(bridge, /url=\.\.\/landing\/photos\.html/);
assert.match(bridge, /rel="canonical" href="\.\.\/landing\/photos\.html"/);
```

- [ ] **Step 2: Add the explicit Markdown injection target**

Replace the current hand-authored image gallery in `docs/landing/photos.md` with concise first-person introduction and:

```html
<div data-tr-photo-placeholder></div>
```

Do not duplicate archive cards in Markdown.

- [ ] **Step 3: Run the focused unit test and confirm RED**

Run:

```bash
node --test scripts/photo-stories.test.js
```

Expected: FAIL because `renderPhotoIndexContent` and `applyPhotoIndexPage` do not exist and the old writer still replaces `landing/photos.html` with a redirect.

- [ ] **Step 4: Commit the RED contract**

```bash
git add scripts/photo-stories.test.js docs/landing/photos.md
git commit -m "test: define embedded photo page contract"
```

---

### Task 2: Embed Photo Stories in the generated Diplodoc page

**Files:**
- Modify: `scripts/photo-stories.js`
- Modify: `scripts/copy-assets.js`
- Delete: `templates/photos-index.html`
- Test: `scripts/photo-stories.test.js`

**Interfaces:**
- Produces: `renderPhotoIndexContent({albums, archive}): string`.
- Produces: `applyPhotoIndexPage(documentHtml, {albums, archive, siteUrl}): string`.
- Changes: `writePhotoStories()` writes `landing/photos.html`, album pages and a redirect-only `photos/index.html`.

- [ ] **Step 1: Import the shared Diplodoc state transformer**

At the top of `scripts/photo-stories.js` add:

```js
import {transformGeneratedContent} from './diplodoc-state.js';
```

Remove `DEFAULT_INDEX_TEMPLATE`; keep only the album template constant.

- [ ] **Step 2: Separate index content rendering from document rendering**

Replace `renderPhotoIndexPage()` with:

```js
export function renderPhotoIndexContent({albums = [], archive = []}) {
  const validatedAlbums = validatePhotoAlbums(albums, {requireFiles: false});
  const validatedArchive = validatePhotoArchive(archive, {requireFiles: false});
  return `<div class="tr-photo-embedded" data-tr-photo-page="index">
    <p class="tr-photo-intro">Здесь я сохраняю не всё подряд, а небольшие визуальные истории — поездки, события, людей и обычные моменты, к которым самому хочется потом вернуться.</p>
    ${renderFilters(validatedAlbums)}
    <div class="tr-photo-chronology" data-tr-photo-chronology>${renderYears(validatedAlbums)}</div>
    <section class="tr-photo-archive" aria-labelledby="photo-archive-title">
      <div class="tr-photo-section-head"><div><span class="tr-photo-section-kicker">FROM THE ARCHIVE</span><h2 id="photo-archive-title">Из архива</h2></div><p>Несколько отдельных кадров, которые остались здесь ещё с ранней версии сайта. Я не стал искусственно превращать их в альбомы.</p></div>
      <div class="tr-photo-archive-grid">${validatedArchive.map(renderArchiveItem).join('\n')}</div>
    </section>
  </div>`;
}
```

Update index-relative archive links and images from `../assets/...` to `../assets/...` because the canonical page lives in `landing/`. Album card links must point to `../photos/<slug>/` and cover images to `../assets/...`.

- [ ] **Step 3: Inject resources, content and lightbox without replacing the shell**

Implement idempotent helpers:

```js
function injectPhotoResources(html) {
  let result = html;
  if (!/data-tr-photo-stylesheet/i.test(result)) {
    result = result.replace(/<\/head>/i, '<link rel="stylesheet" href="../_assets/style/photo-stories.css" data-tr-photo-stylesheet></head>');
  }
  if (!/data-tr-photo-script/i.test(result)) {
    result = result.replace(/<\/body>/i, '<script src="../_assets/script/photo-stories.js" defer data-tr-photo-script></script></body>');
  }
  return result;
}

export function applyPhotoIndexPage(documentHtml, {albums = [], archive = [], siteUrl} = {}) {
  const content = renderPhotoIndexContent({albums, archive});
  const marker = /<div[^>]*data-tr-photo-placeholder(?:=["'][^"']*["'])?[^>]*>\s*<\/div>/i;
  const transformed = transformGeneratedContent(
    documentHtml,
    (html) => marker.test(html) ? html.replace(marker, `${content}${renderLightboxShell()}`) : html,
    'Photo Stories index',
  );
  if (!transformed.source) throw new Error('Photo Stories placeholder not found in rendered DOM or Diplodoc state payload.');
  return injectPhotoResources(transformed.html);
}
```

Do not add or replace a site header/footer.

- [ ] **Step 4: Reverse the writer ownership**

In `writePhotoStories()`:

1. Read `outputDir/landing/photos.html`; fail clearly if it does not exist.
2. Replace its contents with `applyPhotoIndexPage(...)`.
3. Write `outputDir/photos/index.html` using `renderLegacyPhotosBridge('../landing/photos.html')`.
4. Continue generating published album routes.
5. Return:

```js
{
  routes: ['landing/photos.html', ...albumRoutes],
  albumRoutes,
  indexPath: path.join(outputDir, 'landing', 'photos.html'),
  legacyPath: path.join(outputDir, 'photos', 'index.html'),
}
```

- [ ] **Step 5: Remove the unused standalone index template**

Delete `templates/photos-index.html` and remove all related parameters and constants.

- [ ] **Step 6: Keep `copy-assets.js` reporting consistent**

No new orchestration stage is needed; retain the existing `writePhotoStories()` call and ensure the reported `photoStoryIndexPath` is now `landing/photos.html`.

- [ ] **Step 7: Run focused tests to GREEN**

Run:

```bash
node --test scripts/photo-stories.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit the generator migration**

```bash
git add scripts/photo-stories.js scripts/copy-assets.js scripts/photo-stories.test.js templates/photos-index.html
git commit -m "feat: embed photo stories in Diplodoc page"
```

---

### Task 3: Normalize routes, metadata and future album utilities

**Files:**
- Modify: `docs/_assets/script/command-palette.js`
- Modify: `data/page-meta.json`
- Modify: `templates/photo-album.html`
- Modify: `scripts/photo-stories.js`
- Modify: `scripts/header-navigation.test.js`
- Test: `scripts/photo-stories.test.js`

**Interfaces:**
- Command `photos` resolves to `landing/photos.html`.
- Metadata manifest owns title/description/canonical/OG for the canonical index.
- Standalone albums expose the four anchors required by `header-utilities.js` and load that runtime.

- [ ] **Step 1: Change all index navigation targets**

In `command-palette.js` change:

```js
target: 'photos/'
```

to:

```js
target: 'landing/photos.html'
```

Keep `/photos/` in `inferSiteBase()` because future album pages remain there.

Update any tests that assert the old command target.

- [ ] **Step 2: Add photo metadata to the shared manifest**

Insert in `data/page-meta.json`:

```json
{
  "path": "landing/photos.html",
  "card": "photos",
  "title": "Фотографии — Руслан Немыкин",
  "description": "Личный визуальный архив Руслана Немыкина: фотоистории о поездках, учёбе, событиях, людях и обычных моментах вне кода.",
  "displayTitle": "PHOTO STORIES",
  "kicker": "VISUAL ARCHIVE",
  "tags": ["STORIES", "MOMENTS", "ARCHIVE"],
  "accent": "violet"
}
```

- [ ] **Step 3: Upgrade future standalone album headers through the shared runtime**

Keep a minimal semantic header renderer for album pages, but include anchors for GitHub, Habr, Telegram and search in the order expected by `header-utilities.js`. Add to `templates/photo-album.html`:

```html
<link rel="stylesheet" href="../../_assets/style/header-utilities.css">
<script src="../../_assets/script/header-list-semantics.js" defer></script>
<script src="../../_assets/script/header-utilities.js" defer></script>
```

The handwritten header must not include a floating language switch. The runtime creates the final icon group and language menu.

Change every “all stories/archive” link in album content to `../../landing/photos.html` instead of `../`.

- [ ] **Step 4: Add unit contracts for canonical links**

Assert that:

```js
assert.match(renderPhotoAlbumPage(validAlbum, {siteUrl: 'https://example.test'}), /href="\.\.\/\.\.\/landing\/photos\.html"/);
assert.match(renderPhotoAlbumPage(validAlbum, {siteUrl: 'https://example.test'}), /header-utilities\.js/);
```

- [ ] **Step 5: Run relevant unit tests**

Run:

```bash
node --test scripts/photo-stories.test.js scripts/header-navigation.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit route and metadata normalization**

```bash
git add docs/_assets/script/command-palette.js data/page-meta.json templates/photo-album.html scripts/photo-stories.js scripts/photo-stories.test.js scripts/header-navigation.test.js
git commit -m "fix: normalize photo navigation routes"
```

---

### Task 4: Restyle the index as embedded Diplodoc content

**Files:**
- Modify: `docs/_assets/style/photo-stories.css`
- Modify: `docs/_assets/script/photo-stories.js`
- Test: `scripts/photo-stories.test.js`

**Interfaces:**
- Index root: `[data-tr-photo-page="index"].tr-photo-embedded`.
- Album body remains `.tr-photo-root[data-tr-photo-page="album"]`.
- Runtime initializes from any `[data-tr-photo-page]` descendant and discovers the lightbox shell in `document`.

- [ ] **Step 1: Remove index-only fullscreen shell rules**

Delete or stop applying:

```css
.tr-photo-shell
.tr-photo-index-hero
.tr-photo-index-hero::before
.tr-photo-index-hero h1
.tr-photo-index-hero__lead
```

Do not change cinematic `.tr-photo-album-hero` rules.

- [ ] **Step 2: Add embedded content geometry**

Add scoped rules:

```css
.tr-photo-embedded {
  width: 100%;
  min-width: 0;
  margin-top: 1.75rem;
  overflow: clip;
}

.tr-photo-intro {
  max-width: 72ch;
  margin: 0;
  color: var(--tr-muted);
  line-height: 1.75;
}

.tr-photo-embedded .tr-photo-chronology {
  padding-top: clamp(2.5rem, 5vw, 4.5rem);
}

.tr-photo-embedded .tr-photo-archive {
  padding-top: clamp(2.75rem, 5vw, 4.5rem);
}
```

Reduce embedded section heading sizes to fit the Diplodoc article width:

```css
.tr-photo-embedded .tr-photo-empty h2,
.tr-photo-embedded .tr-photo-section-head h2 {
  font-size: clamp(2rem, 5vw, 3.8rem);
}
```

At 720 px and below, force archive and album cards to one column and remove negative margins.

- [ ] **Step 3: Make runtime independent of body ownership**

In `photo-stories.js` change lightbox lookup from page-local only:

```js
const root = page.querySelector('[data-tr-photo-lightbox-root]');
```

to:

```js
const root = page.querySelector('[data-tr-photo-lightbox-root]')
  || document.querySelector('[data-tr-photo-lightbox-root]');
```

Keep filters scoped to the page root. Do not add global listeners twice; retain the existing ready marker.

- [ ] **Step 4: Run unit suite**

Run:

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit embedded styling/runtime**

```bash
git add docs/_assets/style/photo-stories.css docs/_assets/script/photo-stories.js scripts/photo-stories.test.js
git commit -m "style: integrate photo archive with Diplodoc shell"
```

---

### Task 5: Replace browser acceptance and verify the complete build

**Files:**
- Modify: `scripts/photo-stories-browser-smoke.cjs`
- Modify: `scripts/site-integrity.js` if it asserts the old route ownership
- Modify: `.github/workflows/build.yml` only if artifact paths require adjustment
- Modify: `tests/visual-baselines.json` after manual review

**Interfaces:**
- Browser canonical URL: `/landing/photos.html`.
- Compatibility URL: `/photos/` redirects to `/landing/photos.html`.

- [ ] **Step 1: Rewrite the Photo Stories browser scenario**

Navigate first to:

```js
await page.goto(`${baseUrl}/landing/photos.html`, {waitUntil: 'networkidle'});
```

Assert:

```js
await page.locator('[data-tr-photo-page="index"]').waitFor({state: 'visible'});
if (!(await page.locator('header, [data-tr-header-utilities]').first().isVisible())) throw new Error(...);
if (!(await page.getByRole('link', {name: 'Фото', exact: true}).first().isVisible())) throw new Error(...);
if (await page.locator('.tr-site-header, .tr-site-nav, .tr-photo-index-hero').count()) throw new Error(...);
```

On desktop require the left navigation container to be visible and the `Фото` link to represent the current route. Measure heading-to-content spacing:

```js
const geometry = await page.evaluate(() => {
  const heading = document.querySelector('h1');
  const root = document.querySelector('[data-tr-photo-page="index"]');
  const headingRect = heading.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  return {gap: rootRect.top - headingRect.bottom, headingTop: headingRect.top};
});
if (geometry.gap > 160) throw new Error(...);
```

Keep archive, lightbox, hash, focus, Axe and overflow assertions. Change direct hash navigation to:

```js
`${baseUrl}/landing/photos.html#archive-magister`
```

- [ ] **Step 2: Verify the legacy redirect**

Add:

```js
await page.goto(`${baseUrl}/photos/`, {waitUntil: 'networkidle'});
await page.waitForURL(/\/landing\/photos\.html$/);
```

- [ ] **Step 3: Update screenshot evidence names only if necessary**

Retain `photo-stories-desktop.png` and `photo-stories-mobile.png` so CI artifact consumers remain stable.

- [ ] **Step 4: Run local build and focused browser smoke**

Run:

```bash
npm ci
npm run build:docs
npm run check:site
node scripts/photo-stories-browser-smoke.cjs
```

Expected: PASS, no HTTP failures, no overflow, zero blocking Axe violations.

- [ ] **Step 5: Push the exact head and inspect CI**

Push branch and wait for the complete Build workflow. Do not merge on partial success.

- [ ] **Step 6: Manually inspect exact-head screenshots**

Confirm on desktop and mobile:

- shared current header is present;
- left sidebar is present on desktop;
- no duplicate header/footer exists;
- the page heading begins at normal article height;
- archive cards and captions are readable;
- no clipping or unexpected horizontal scroll exists.

- [ ] **Step 7: Update visual baselines only after approval of screenshots**

Run the repository baseline update mechanism against the exact implementation and commit only the intended photo-index changes.

- [ ] **Step 8: Commit final QA evidence changes**

```bash
git add scripts/photo-stories-browser-smoke.cjs scripts/site-integrity.js .github/workflows/build.yml tests/visual-baselines.json
git commit -m "test: verify unified photo page shell"
```

---

### Task 6: Record continuity and merge

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Records the exact merged PR, commit and CI run after verification.

- [ ] **Step 1: Open a PR with root cause and migration summary**

Document:

- old standalone index ownership;
- new embedded Diplodoc ownership;
- route compatibility;
- RED and GREEN evidence;
- exact-head CI run;
- manual desktop/mobile screenshot review.

- [ ] **Step 2: Merge only after exact-head GREEN**

Use squash merge and expected head SHA.

- [ ] **Step 3: Synchronize durable project documents**

Record the completed navigation unification as a small P2.4 quality milestone. Include the merged commit and exact-head CI run; do not claim production deployment until separately verified.

- [ ] **Step 4: Run exact-head docs CI and merge continuity PR**

The final `master` state must have no open implementation PR and no unsynchronized state-file gap.
