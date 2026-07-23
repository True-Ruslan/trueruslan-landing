# P2.1 Minimal RU/EN Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a seven-route English layer under `/en/` while preserving Russian root URLs, one Diplodoc build, one search index, shared canonical registries and existing quality gates.

**Architecture:** English Markdown pages are compiled by the existing Diplodoc build. `data/i18n.json` owns only RU/EN route pairing; `scripts/i18n.js` performs deterministic build-time `lang`, hreflang and no-JS switcher injection. The standalone English homepage is generated from `templates/index.en.html` through the existing standalone-home/project-registry primitives. Shared project truth remains in current registries; no English evidence/timeline/Notes registries are introduced.

**Tech Stack:** Node.js 24+, native `node:test`, Diplodoc CLI 5.x, parse5/parse5-utils, existing CommonJS Playwright quality harness, static HTML/Markdown.

## Global Constraints

- Russian remains the default/root language and existing Russian URLs must not move.
- English routes are exactly: `en/index.html`, `en/about.html`, `en/resume.html`, `en/projects.html`, `en/projects/livingworld.html`, `en/notes/server-authoritative-ai-npcs.html`, `en/notes/llm-output-is-a-protocol-boundary.html`.
- Keep exactly one Diplodoc build and one site-wide search index (`_search/ru/index.html`); do not create `_search/en/`.
- Add no backend, CMS, database, runtime translation fetch, automatic locale redirect or second rendering system.
- `data/i18n.json` owns only route pairing, never prose/project status/evidence/timeline/Notes truth.
- English LivingWorld does not duplicate localized Project Evidence/timeline state; it links to the Russian canonical page for full machine-like evidence.
- English untranslated-detail fallbacks must be explicitly marked `RU`/`Russian`.
- Every RU/EN pair uses self-canonical URLs and `hreflang=ru`, `hreflang=en`, `hreflang=x-default` with x-default -> RU.
- No existing quality threshold or visual baseline may be weakened to make this feature pass.

---

### Task 1: Define the canonical i18n route contract (TDD RED -> GREEN)

**Files:**
- Create: `scripts/i18n.test.js`
- Create: `data/i18n.json`
- Create: `scripts/i18n.js`

**Interfaces:**
- Produces `loadI18nManifest(manifestPath?) -> Pair[]`.
- Produces `validateI18nManifest(entries) -> Pair[]`.
- Produces `injectI18nLinks(html, {pair, locale, siteUrl}) -> string`.
- Produces `applyI18n(outputDir, pairs, siteUrl) -> string[]`.
- Pair shape: `{id: string, ru: string, en: string}`.

- [ ] **Step 1: Add the failing canonical contract test before manifest/implementation**

Create `scripts/i18n.test.js` with a first test that imports `loadI18nManifest` and requires these exact ids:

```js
const REQUIRED_PAIRS = [
  'home',
  'about',
  'resume',
  'projects',
  'livingworld',
  'note-ai-npcs',
  'note-llm-protocol-boundary',
];

test('canonical i18n manifest contains the controlled seven-page milestone', () => {
  const pairs = loadI18nManifest();
  assert.deepEqual(pairs.map((pair) => pair.id).sort(), [...REQUIRED_PAIRS].sort());
});
```

Also include focused tests for duplicate ids/paths, unsafe paths, href injection and idempotency. The initial branch intentionally has neither `scripts/i18n.js` nor `data/i18n.json`, so the RED signature is missing module/contract.

- [ ] **Step 2: Run `npm test` through PR CI and verify RED**

Expected: `Test` fails because `scripts/i18n.js`/canonical manifest are absent; downstream build/browser gates skip.

- [ ] **Step 3: Add exact canonical route manifest**

Create `data/i18n.json`:

```json
[
  {"id":"home","ru":"index.html","en":"en/index.html"},
  {"id":"about","ru":"landing/about.html","en":"en/about.html"},
  {"id":"resume","ru":"landing/resume.html","en":"en/resume.html"},
  {"id":"projects","ru":"landing/projects.html","en":"en/projects.html"},
  {"id":"livingworld","ru":"landing/projects/livingworld.html","en":"en/projects/livingworld.html"},
  {"id":"note-ai-npcs","ru":"landing/notes/server-authoritative-ai-npcs.html","en":"en/notes/server-authoritative-ai-npcs.html"},
  {"id":"note-llm-protocol-boundary","ru":"landing/notes/llm-output-is-a-protocol-boundary.html","en":"en/notes/llm-output-is-a-protocol-boundary.html"}
]
```

- [ ] **Step 4: Implement strict manifest validation**

`validateI18nManifest()` must require:

- non-empty array;
- ids matching `/^[a-z0-9-]+$/`;
- safe relative `.html` paths only;
- no `..`, backslashes, absolute URLs or leading `/`;
- unique ids;
- globally unique RU/EN paths;
- RU path must not start `en/`;
- EN path must start `en/`.

- [ ] **Step 5: Implement deterministic HTML enhancer**

Use parse5/parse5-utils. `injectI18nLinks()` must:

- set `<html lang>` to `ru` or `en`;
- remove only prior nodes marked `data-tr-i18n="true"`;
- append these `<link>` nodes to `<head>`:

```html
<link rel="alternate" hreflang="ru" href="<site>/<pair.ru>" data-tr-i18n="true">
<link rel="alternate" hreflang="en" href="<site>/<pair.en>" data-tr-i18n="true">
<link rel="alternate" hreflang="x-default" href="<site>/<pair.ru>" data-tr-i18n="true">
```

For `index.html`, normalize the public RU URL to `${siteUrl}/`; for `en/index.html`, normalize to `${siteUrl}/en/`.

Append one fixed, no-layout-shift switcher to `<body>`:

```html
<nav class="tr-language-switcher" aria-label="Language" data-tr-i18n="true">
  <a href="<counterpart absolute URL>" hreflang="<counterpart locale>" lang="<counterpart locale>">EN</a>
</nav>
```

On English pages the text is `RU`. Include a small `style[data-tr-i18n="true"]` in `<head>` for the fixed pill; style must not affect document flow.

- [ ] **Step 6: Implement `applyI18n()`**

For every pair:

- require both generated files to exist;
- inject RU and EN variants;
- write both files;
- return deterministic sorted updated paths.

- [ ] **Step 7: Run `npm test` and verify the i18n unit slice is GREEN**

Expected: all native node tests pass.

- [ ] **Step 8: Commit**

```text
feat: add canonical RU EN route layer
```

---

### Task 2: Generate the English standalone homepage from shared project truth

**Files:**
- Create: `templates/index.en.html`
- Modify: `scripts/standalone-home.js`
- Modify: `scripts/standalone-home.test.js`
- Modify: `scripts/project-registry.js`
- Modify: `scripts/project-registry.test.js`
- Modify: `scripts/copy-assets.js`

**Interfaces:**
- Extend `renderProjectCards(projects, {hrefTransform, locale})` where locale is `'ru' | 'en'`.
- Extend `renderStandaloneHome(template, siteUrl, projects, {locale, hrefTransform})`.
- `postprocessOutput()` writes both `index.html` and `en/index.html` before page metadata/i18n application.

- [ ] **Step 1: Add failing locale-aware project-card tests**

Verify English rendering contains:

```text
Technologies and areas
Open case study →
```

and uses a supplied href transform:

```js
renderProjectCards([validProject], {
  locale: 'en',
  hrefTransform: () => 'projects/livingworld.html',
});
```

- [ ] **Step 2: Add failing English standalone-home test**

Verify `renderStandaloneHome(..., {locale:'en', hrefTransform})` replaces placeholders, renders LivingWorld and emits translated CTA/ARIA UI copy without `_bundle/` runtime assets.

- [ ] **Step 3: Implement bounded locale UI copy**

Inside `project-registry.js`, define immutable copy:

```js
const PROJECT_CARD_COPY = {
  ru: {tagsLabel: 'Технологии и направления', cta: 'Открыть case study →'},
  en: {tagsLabel: 'Technologies and areas', cta: 'Open case study →'},
};
```

Reject unsupported locale values.

- [ ] **Step 4: Extend standalone-home rendering options**

Default remains Russian so existing callers/tests keep behavior.

- [ ] **Step 5: Create `templates/index.en.html`**

Create a manually authored English counterpart of the root homepage with:

- `<html lang="en">`;
- English title/description/hero/sections/footer;
- same visual class structure and same assets as Russian homepage, prefixed with `../` because output lives at `en/index.html`;
- `{{SITE_URL}}` and `{{CURRENTLY_BUILDING}}` placeholders;
- English primary links to `projects.html`, `about.html`, `resume.html`;
- single search link `../_search/ru/index.html` labelled `Search`;
- untranslated surfaces explicitly labelled `(RU)` when linked.

- [ ] **Step 6: Generate English home in `postprocessOutput()`**

Add constants:

```js
const STANDALONE_HOME_EN_TEMPLATE = path.join(ROOT, 'templates', 'index.en.html');
```

Write `docs-html/en/index.html` with locale `en` and href transformation:

- `landing/projects/livingworld.html` -> `projects/livingworld.html`;
- `landing/projects.html` -> `projects.html`;
- every other project detail -> `../<original href>`.

- [ ] **Step 7: Run `npm test`**

Expected: all tests green.

- [ ] **Step 8: Commit**

```text
feat: generate English standalone homepage
```

---

### Task 3: Add the controlled English Markdown surfaces and shared status injection

**Files:**
- Create: `docs/en/about.md`
- Create: `docs/en/resume.md`
- Create: `docs/en/projects.md`
- Create: `docs/en/projects/livingworld.md`
- Create: `docs/en/notes/server-authoritative-ai-npcs.md`
- Create: `docs/en/notes/llm-output-is-a-protocol-boundary.md`
- Modify: `docs/toc.yaml`
- Modify: `scripts/project-registry.js`
- Modify: `scripts/project-registry.test.js`

**Interfaces:**
- Extend `applyProjectRegistryContent(outputDir, projects, {targets})` with default targets preserving current behavior.
- English hub target: `en/projects.html`.

- [ ] **Step 1: Add failing multi-target status injection test**

Create temporary RU and EN hubs, both containing `data-tr-project-status="livingworld"`, then assert two replacements are made without duplicating registry state.

- [ ] **Step 2: Implement target-list support**

Default target list:

```js
['landing/projects.html']
```

Production call uses:

```js
['landing/projects.html', 'en/projects.html']
```

- [ ] **Step 3: Author `docs/en/about.md`**

Curated English version of current About page. Keep first-person engineering-diary tone; no invented metrics. Add compact top navigation:

```markdown
[Home](index.md) · [Projects](projects.md) · [About](about.md) · [Resume](resume.md) · [Search](../_search/ru/index.html)
```

- [ ] **Step 4: Author `docs/en/resume.md`**

English web-CV using only facts already present in the Russian resume/current public repository context. Preserve role/company/stack/education facts and existing public links. Do not translate private/internal details into new claims.

- [ ] **Step 5: Author `docs/en/projects.md`**

English portfolio hub:

- LivingWorld links to `projects/livingworld.md`;
- NODE ZERO, TaskHub, MiniChess and Godot detail links are explicitly marked `RU` where only Russian detail exists;
- LivingWorld/NODE ZERO status placeholders use shared `data-tr-project-status` markers;
- no duplicated status strings.

- [ ] **Step 6: Author `docs/en/projects/livingworld.md`**

Use the same seven-part narrative shape as the Russian flagship case study:

1. Problem
2. Constraints
3. Decisions
4. What failed / corrected assumptions
5. Current state
6. Evidence
7. What I would change now

Do **not** include Project Evidence/timeline placeholders. In Evidence, link to the Russian canonical LivingWorld page and state that machine-like timeline/evidence is maintained there from shared registries.

- [ ] **Step 7: Author both English note mirrors**

- `server-authoritative-ai-npcs.md`: session ownership, text/voice convergence, provider orchestration, memory boundaries and authorized actions.
- `llm-output-is-a-protocol-boundary.md`: provider success vs contract success, strict schema/domain validation, no permissive coercion, proposal vs authority, bounded fallback.

Do not create new `data/notes.json` entities or English Atom entries.

- [ ] **Step 8: Add bounded English section to `docs/toc.yaml`**

Append one `English` group containing the six Diplodoc English pages. Do not create a second navigation file/build.

- [ ] **Step 9: Run `npm test`**

Expected: all native tests green.

- [ ] **Step 10: Commit**

```text
content: add controlled English portfolio surfaces
```

---

### Task 4: Wire metadata, sitemap and post-processing without a second search index

**Files:**
- Modify: `data/page-meta.json`
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/page-meta.test.js` only if required for an explicit English-path regression contract
- Test: `scripts/i18n.test.js`

**Interfaces:**
- `postprocessOutput()` loads i18n manifest and calls `applyI18n()` after `applyPageMeta()` so canonical metadata is already final.
- `writeSitemap()` receives `en/index.html` as an extra route in addition to Photo Stories routes.

- [ ] **Step 1: Add seven English page-meta records**

Paths/cards:

```text
en/index.html -> home-en
en/about.html -> about-en
en/resume.html -> resume-en
en/projects.html -> projects-en
en/projects/livingworld.html -> livingworld-en
en/notes/server-authoritative-ai-npcs.html -> note-ai-npcs-en
en/notes/llm-output-is-a-protocol-boundary.html -> note-llm-protocol-en
```

Use English title/description and valid uppercase ASCII displayTitle/kicker/tags.

- [ ] **Step 2: Integrate i18n manifest into `copy-assets.js`**

Add:

```js
import {applyI18n, loadI18nManifest} from './i18n.js';
```

Load pairs once. Generate both homepages. Pass `en/index.html` as an extra sitemap route. Apply page metadata first, then `applyI18n(outputDir, pairs, siteUrl)`.

Return/log updated i18n targets.

- [ ] **Step 3: Preserve exactly one search index**

Do not change Diplodoc search configuration or create `_search/en` resources. Add a unit/contract assertion that canonical code contains no required English search route and browser smoke will assert `_search/en/index.html` is not required.

- [ ] **Step 4: Run `npm test` and production build**

Run through CI:

```text
npm test
npm run build:docs
npm run check:site
```

Expected: all green; generated English routes exist and local references resolve.

- [ ] **Step 5: Commit**

```text
feat: wire bilingual SEO and build integration
```

---

### Task 5: Add focused bilingual browser quality gate

**Files:**
- Create: `scripts/i18n-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Reuse `quality-harness/tools.cjs`, `static-server.cjs`, `browser.cjs`, `diagnostics.cjs`, `assertions.cjs`, `evidence.cjs`, `scenarios.cjs`.

- [ ] **Step 1: Implement representative route checks**

Browser smoke checks these URLs:

```text
/en/index.html
/en/about.html
/en/resume.html
/en/projects.html
/en/projects/livingworld.html
/en/notes/server-authoritative-ai-npcs.html
/en/notes/llm-output-is-a-protocol-boundary.html
```

For every route assert HTTP success and `<html lang="en">`.

- [ ] **Step 2: Verify SEO pair semantics**

For representative home, resume and LivingWorld pages assert:

- exactly one canonical and it is self-referential;
- one `hreflang=ru`;
- one `hreflang=en`;
- one `hreflang=x-default` to RU;
- language switcher points to counterpart and is a normal anchor.

Navigate EN -> RU through the switcher and verify RU `<html lang="ru">`.

- [ ] **Step 3: Verify browser quality**

For desktop EN home and mobile EN LivingWorld:

- `assertNoHorizontalOverflow`;
- no page/console/request diagnostic failures;
- one visible H1;
- serious/critical Axe violations = 0;
- capture screenshots as evidence only (not visual baselines).

- [ ] **Step 4: Verify single-search boundary**

Assert `/ _search/ru/index.html` (without the space in code) is reachable and the English UI points to it. Do not require `/ _search/en/index.html`.

- [ ] **Step 5: Wire CI step after Generated search browser smoke**

Add:

```yaml
- name: Minimal RU EN browser smoke
  shell: bash
  run: |
    set -o pipefail
    node scripts/i18n-browser-smoke.cjs 2>&1 | tee i18n-browser-smoke.log
```

Preserve the log in quality artifacts.

- [ ] **Step 6: Commit**

```text
test: add minimal RU EN browser quality gate
```

---

### Task 6: Exact-head PR verification and merge

**Files:**
- Review all feature diff files only; no intended new source changes.

- [ ] **Step 1: Open/maintain draft PR `feat/p2-1-minimal-ru-en -> master`**

Title:

```text
feat: add minimal RU EN portfolio layer
```

PR body must document:

- exact seven-route scope;
- one build / one search index boundary;
- route manifest ownership;
- self-canonical + hreflang semantics;
- no duplicated evidence/timeline/Notes registries;
- explicit RU fallback behavior;
- TDD RED run and final exact-head run.

- [ ] **Step 2: Run full configured matrix on final exact head**

Required green:

- Test;
- Build docs;
- generated-site integrity;
- mobile overflow;
- browser/Axe/Lighthouse;
- Sources;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- Minimal RU EN browser smoke;
- Metadata/OpenGraph;
- Engineering Map;
- visual regression;
- evidence upload.

Fix failures without weakening existing thresholds/baselines.

- [ ] **Step 3: Scope review**

Expected feature scope includes only:

```text
data/i18n.json
data/page-meta.json
templates/index.en.html
docs/en/**
docs/toc.yaml
scripts/i18n.js
scripts/i18n.test.js
scripts/i18n-browser-smoke.cjs
scripts/standalone-home.js
scripts/standalone-home.test.js
scripts/project-registry.js
scripts/project-registry.test.js
scripts/copy-assets.js
.github/workflows/build.yml
docs/superpowers/specs/2026-07-23-minimal-ru-en-design.md
docs/superpowers/plans/2026-07-23-minimal-ru-en.md
```

No dependency changes, second search index, backend/runtime API or visual-baseline weakening.

- [ ] **Step 4: Mark ready and squash-merge exact verified SHA**

---

### Task 7: Synchronize durable continuity

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: Create docs-only branch from post-P2.1 master**

- [ ] **Step 2: Record actual feature evidence**

Record:

- PR number/title;
- actual squash SHA;
- exact implementation head;
- RED and final GREEN Build/run numbers;
- exact seven-route EN scope;
- one-build/one-search boundary;
- i18n route manifest and hreflang semantics;
- untranslated fallback policy;
- no duplicated Project Evidence/timeline/Notes truth;
- actual next roadmap priority selected from remaining product backlog.

- [ ] **Step 3: Open docs-only PR and require full matrix GREEN**

Changed files exactly the three continuity docs.

- [ ] **Step 4: Squash-merge exact green docs head**

- [ ] **Step 5: Final read-only verification**

Confirm:

- zero open PRs;
- latest master commits are continuity sync then P2.1 feature;
- `PROJECT_STATE.md` says P2.1 DONE and the next canonical milestone unambiguously.