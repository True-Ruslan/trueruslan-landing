# Header Social Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace text search/social links and the floating language switch with a unified accessible header utility group, while simplifying the RU/EN homepage hero actions and removing duplicate arrows.

**Architecture:** Keep build-time i18n responsible for `lang` and `hreflang`, but remove its floating UI. Standalone RU/EN templates own their static header utility markup for no-JS use. The existing progressive-enhancement script normalizes the same utility group inside Diplodoc’s hydrated header, adds the accessible language menu behavior, and uses the existing i18n manifest exposed as bounded page metadata to resolve paired routes or language-home fallbacks.

**Tech Stack:** Node.js ES modules, parse5/parse5-utils, vanilla JavaScript, HTML/CSS, Node test runner, Playwright browser quality harness, Diplodoc static build.

## Global Constraints

- Utility order is exactly `GitHub → Habr → Telegram → Search → Language`.
- Language is the final rightmost control.
- GitHub URL is `https://github.com/True-Ruslan`.
- Habr URL is `https://habr.com/ru/users/TrueRuslan/`.
- Telegram URL is `https://t.me/TrueRuslan_Blog`.
- No icon library or runtime dependency.
- No new language, search engine, analytics event, social embed or behavioural tracking.
- Resume remains in primary navigation but is removed from homepage hero actions.
- Each visible text CTA has exactly one transition indicator.
- Search remains the existing `_search/ru/index.html` route and Cmd/Ctrl+K remains unchanged.
- Controls have localized accessible names, visible focus and at least 40×40 CSS-pixel hit areas.
- Motion respects `prefers-reduced-motion`.

---

### Task 1: Make i18n metadata UI-neutral

**Files:**
- Modify: `scripts/i18n.js`
- Modify: `scripts/i18n.test.js`

**Interfaces:**
- Consumes: `injectI18nLinks(html, {pair, locale, siteUrl})`.
- Produces: `data-tr-i18n-locale`, `data-tr-i18n-ru`, and `data-tr-i18n-en` attributes on `<html>` plus existing alternate links; no floating switcher markup or inline switcher CSS.

- [ ] **Step 1: Write failing tests for metadata-only i18n output**

Update the injection test to require:

```js
assert.match(once, /data-tr-i18n-locale="en"/);
assert.match(once, /data-tr-i18n-ru="https:\/\/example\.test\/site\/landing\/about\.html"/);
assert.match(once, /data-tr-i18n-en="https:\/\/example\.test\/site\/en\/about\.html"/);
assert.doesNotMatch(once, /data-tr-language-switcher/);
assert.doesNotMatch(once, /position:fixed;right:14px;bottom:14px/);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test scripts/i18n.test.js`

Expected: FAIL because the old floating switcher still exists and metadata attributes are absent.

- [ ] **Step 3: Replace floating UI generation with bounded metadata**

In `injectI18nLinks`, keep `lang` and alternate links, then set:

```js
utils.setAttribute(htmlNode, 'data-tr-i18n-locale', locale);
utils.setAttribute(htmlNode, 'data-tr-i18n-ru', publicUrl(siteUrl, pair.ru));
utils.setAttribute(htmlNode, 'data-tr-i18n-en', publicUrl(siteUrl, pair.en));
```

Delete `createSwitcher`, `createSwitcherStyle`, and their append calls.

- [ ] **Step 4: Run focused tests**

Run: `node --test scripts/i18n.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/i18n.js scripts/i18n.test.js
git commit -m "refactor: make i18n metadata ui neutral"
```

---

### Task 2: Add canonical header utility markup and hero actions

**Files:**
- Modify: `templates/index.html`
- Modify: `templates/index.en.html`
- Modify: `scripts/standalone-home.test.js`

**Interfaces:**
- Consumes: existing standalone templates and search route.
- Produces: `.tr-header-utilities`, icon-only social/search anchors, `.tr-language-menu`, localized menu labels, and revised hero actions.

- [ ] **Step 1: Add failing standalone markup assertions**

Require both generated homepages to contain the ordered controls:

```js
assert.match(html, /data-tr-utility="github"[\s\S]*data-tr-utility="habr"[\s\S]*data-tr-utility="telegram"[\s\S]*data-tr-utility="search"[\s\S]*data-tr-language-trigger/);
assert.doesNotMatch(html, />Поиск<\/a>|>Search<\/a>/);
assert.doesNotMatch(html, /landing\/resume\.html">Резюме|en\/resume\.html">Resume/);
assert.match(html, /Посмотреть проекты<\/span>[\s\S]*GitHub[\s\S]*Habr[\s\S]*Telegram/);
```

Also assert exact external URLs and `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test scripts/standalone-home.test.js`

Expected: FAIL because the templates still contain text search, text GitHub and Resume hero actions.

- [ ] **Step 3: Replace standalone header utility markup**

Use inline SVGs with `aria-hidden="true"`, while each anchor owns a localized `aria-label` and `title`. The language trigger must be a `<button type="button">` followed by a two-link menu; the two links provide a no-JS fallback and are progressively enhanced by JavaScript.

- [ ] **Step 4: Simplify RU/EN hero actions**

Render:

```html
<a href="landing/projects.html"><span>Посмотреть проекты</span></a>
<a href="https://github.com/True-Ruslan" ...><span>GitHub</span></a>
<a href="https://habr.com/ru/users/TrueRuslan/" ...><span>Habr</span></a>
<a href="https://t.me/TrueRuslan_Blog" ...><span>Telegram</span></a>
```

Use equivalent English copy and omit arrow characters from source text so CSS is the only indicator owner.

- [ ] **Step 5: Run focused tests**

Run: `node --test scripts/standalone-home.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add templates/index.html templates/index.en.html scripts/standalone-home.test.js
git commit -m "feat: add header social utilities"
```

---

### Task 3: Style and progressively enhance header utilities

**Files:**
- Modify: `docs/_assets/style/standalone.css`
- Modify: `docs/_assets/style/custom.css`
- Modify: `docs/_assets/style/home.css`
- Modify: `docs/_assets/script/custom.js`
- Modify: `scripts/copy-assets.test.js`

**Interfaces:**
- Consumes: standalone `.tr-header-utilities` markup, Diplodoc hydrated `<header>`, i18n metadata attributes, existing search state and `getPageKind`.
- Produces: `setupHeaderUtilities(document)`, `setupLanguageMenu(document)`, normalized utility group on standalone and Diplodoc pages, paired/fallback language links, and one-indicator CTA styling.

- [ ] **Step 1: Add failing static/runtime contract tests**

Require copied assets to contain:

```js
assert.match(customScript, /function setupHeaderUtilities\(/);
assert.match(customScript, /function setupLanguageMenu\(/);
assert.match(customScript, /https:\/\/habr\.com\/ru\/users\/TrueRuslan\//);
assert.match(customScript, /https:\/\/t\.me\/TrueRuslan_Blog/);
assert.match(customCss, /\.tr-header-utilities/);
assert.match(customCss, /\.tr-language-menu/);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test scripts/copy-assets.test.js`

Expected: FAIL because the utility runtime and styles do not exist.

- [ ] **Step 3: Implement canonical icon and markup helpers in `custom.js`**

Add a frozen external-link map and local inline-SVG factories. `setupHeaderUtilities(document)` must:

1. leave a valid standalone `.tr-header-utilities` in place;
2. find the hydrated Diplodoc header after application hydration;
3. remove existing text controls whose normalized labels are `Поиск`, `Search`, `GitHub`, `Habr`, or `Telegram`;
4. append one canonical utility group;
5. keep language as the final child;
6. remain idempotent under MutationObserver repairs.

- [ ] **Step 4: Implement route-aware language behavior**

Read `data-tr-i18n-*` from `<html>`. For translated pages use paired URLs. Otherwise use `/` and `/en/` relative to `location.origin`. Implement click, outside-click, Escape, Arrow Up/Down, Home/End, Enter and Space behavior while synchronizing `aria-expanded` and focus.

- [ ] **Step 5: Add shared utility and menu styling**

Implement 40×40 targets, monochrome SVGs, restrained hover/focus, right-aligned menu, no viewport overflow and responsive spacing. Remove styling assumptions tied to `.tr-site-github` as a text-only third column.

- [ ] **Step 6: Make CSS the single CTA indicator owner**

Keep `.tr-cta::after` and remove arrow characters from template text. Extend `classifyCtas` so GitHub, Habr and Telegram receive `tr-cta--secondary`. Add an external modifier only when a distinct glyph is desired; never render both source and pseudo-element indicators.

- [ ] **Step 7: Run focused tests**

Run:

```bash
node --test scripts/copy-assets.test.js
node --test scripts/standalone-home.test.js
node --test scripts/i18n.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add docs/_assets/style/standalone.css docs/_assets/style/custom.css docs/_assets/style/home.css docs/_assets/script/custom.js scripts/copy-assets.test.js
git commit -m "feat: enhance header utility navigation"
```

---

### Task 4: Extend browser acceptance and run the full quality matrix

**Files:**
- Modify: `scripts/i18n-browser-smoke.cjs`
- Modify: `scripts/browser-quality.cjs` or the existing header-owning browser smoke file selected after repository inspection
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: generated RU/EN site and existing quality harness.
- Produces: exact-order, accessibility, keyboard, overflow and no-floating-switch evidence.

- [ ] **Step 1: Add browser assertions**

On RU and EN homepages and one Diplodoc page assert:

```js
const order = await page.locator('[data-tr-header-utilities] > [data-tr-utility], [data-tr-header-utilities] > [data-tr-language]').evaluateAll(
  (nodes) => nodes.map((node) => node.getAttribute('data-tr-utility') || 'language'),
);
if (order.join(',') !== 'github,habr,telegram,search,language') throw new Error(`utility order mismatch: ${order}`);
```

Also assert no `.tr-language-switcher`, no fixed lower-right language hit area, one trigger, localized accessible names, keyboard menu behavior, paired/fallback targets, exact URLs and no horizontal overflow.

- [ ] **Step 2: Build and run focused browser smoke**

Run:

```bash
npm run build:docs
node scripts/i18n-browser-smoke.cjs
```

Expected: PASS with updated RU/EN screenshots and no floating switch.

- [ ] **Step 3: Run the complete configured quality matrix**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Then run the repository’s configured browser, accessibility, cross-browser, search, analytics, metadata, Engineering Map and visual-regression commands exactly as defined in `.github/workflows/build.yml`.

Expected: all commands PASS.

- [ ] **Step 4: Review intentional visual changes**

Inspect desktop and mobile screenshots for:

- utility order and visual balance;
- language menu alignment;
- no lower-right ghost control;
- no CTA double arrows;
- four hero actions wrapping cleanly;
- no mobile clipping or overlap.

- [ ] **Step 5: Update durable project state**

Record the accepted header/social/language milestone, exact links, exact-head CI and the unchanged search/analytics architecture.

- [ ] **Step 6: Commit**

```bash
git add scripts/i18n-browser-smoke.cjs scripts/*.cjs docs/PROJECT_STATE.md docs/ROADMAP.md docs/CHANGELOG.md
git commit -m "docs: record header navigation milestone"
```

- [ ] **Step 7: Open the implementation PR and require exact-head CI**

Create a PR from `docs/header-social-navigation-design` to `master`, wait for all checks, inspect artifacts and only then merge.
