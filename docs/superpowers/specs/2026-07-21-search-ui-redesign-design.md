# Engineering Search UI Redesign — Design

## Goal

Bring the generated Diplodoc local-search page into the same graphite/cyan/violet visual system as the rest of the portfolio without replacing the existing search engine, index format, or generated runtime.

## Product direction

The search page should feel like a first-class product surface, not a default documentation utility.

Visual direction:

- dark graphite background using existing `--tr-*` tokens;
- subtle grid and cyan/violet ambient glow;
- compact branded header/hero with `SEARCH_` identity and explanatory copy;
- search input styled like an engineering command palette / terminal control;
- results presented as readable elevated cards with restrained hover/focus states;
- matched terms and metadata visually differentiated without reducing readability;
- coherent empty/loading/error states;
- responsive mobile layout;
- no loud cyberpunk, neon overload, or animation dependency.

## Architecture

Keep the existing Diplodoc local-search runtime unchanged.

`normalizeSearchPageHtml()` remains the build-time integration point. It will:

1. preserve existing bundle/resource normalization;
2. mark the generated document with a stable `data-tr-search-page` hook;
3. inject a dedicated project-owned `search.css` stylesheet and `search-ui.js` progressive script using paths safe for `_search/<locale>/index.html`;
4. add a small project-owned shell/brand block only when it can do so without replacing Diplodoc's search root.

The search engine, generated search index, query execution and result rendering remain owned by Diplodoc.

## Styling strategy

Create `docs/_assets/style/search.css` with selectors scoped under `html[data-tr-search-page]` / `body[data-tr-search-page]`.

The stylesheet may target stable semantic HTML and tolerant class-pattern selectors inside the generated search app, but must not globally alter normal knowledge pages.

The layer should cover:

- page/background shell;
- headings and supporting text;
- input/search controls;
- result list/cards/links;
- matched/highlight text;
- buttons/icons;
- empty/loading states;
- scrollbars/focus/reduced motion;
- responsive behavior.

## Progressive enhancement

Create `docs/_assets/script/search-ui.js` as a small isolated classic script.

Responsibilities:

- mark the document as enhanced after the generated app mounts;
- locate the primary search input using semantic selectors;
- add accessible `aria-label`/placeholder fallback only when missing;
- add a keyboard shortcut (`/` and `Ctrl/Cmd+K`) to focus search when the user is not typing in an editable control;
- add CSS hooks to detected result containers/items without rewriting their content;
- observe generated search results through a bounded `MutationObserver`;
- never intercept query execution or navigation.

If the generated DOM shape changes, the script must fail soft and leave the original Diplodoc search functional.

## Build paths

Because search lives under `_search/<locale>/index.html`, injected custom resources must use root-relative deployment-safe paths compatible with GitHub Pages subpaths.

`normalizeSearchPageHtml()` should derive the relative path from the generated page to `_assets/...` rather than hard-coding the repository subpath.

Example from `_search/ru/index.html`:

```text
../../_assets/style/search.css
../../_assets/script/search-ui.js
```

## Accessibility

- keyboard shortcut must not fire while typing in `input`, `textarea`, `select`, or contenteditable;
- native Tab order remains unchanged;
- focus states use existing cyan focus treatment;
- no content is hidden solely by color;
- results remain ordinary links;
- `prefers-reduced-motion` disables decorative transitions;
- progressive script must not remove labels or semantic roles.

## Testing

### Unit / transformation tests

`search-page.test.js` must verify:

- custom search stylesheet/script are injected exactly once;
- paths are correct for `_search/ru/index.html`;
- search page marker is injected;
- normalization is idempotent;
- existing bundle/resource normalization remains intact.

### Browser search smoke

Upgrade `scripts/search-smoke.cjs` to verify desktop and mobile scenarios:

- HTTP/search resources load without failures;
- dedicated stylesheet and script are loaded;
- progressive enhancement marker appears;
- search input exists and is keyboard focusable;
- `/` shortcut focuses the input;
- no horizontal overflow;
- component/page-level Axe serious/critical violations are absent;
- desktop/mobile screenshots are saved.

Do not require a specific query result count unless the generated fixture/index makes that deterministic.

### Visual regression

Add versioned baselines:

- `search-desktop.png`;
- `search-mobile.png`.

Baselines are accepted only from a run where unit/build/integrity/browser/Axe checks have already passed.

## Constraints

- Do not replace Diplodoc search or introduce a second index/search implementation.
- No new production dependency or frontend framework.
- No runtime external API.
- No domain/hosting changes.
- Existing search functionality and generated-search browser smoke must remain operational.
- Existing quality thresholds must not be weakened.
