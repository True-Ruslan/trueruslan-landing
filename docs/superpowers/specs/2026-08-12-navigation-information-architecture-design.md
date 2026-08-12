# Navigation & Information Architecture Cleanup — Design

Date: 2026-08-12
Status: proposed for review before implementation

## Goal

Make the site navigation reflect one clear information architecture across the top header and Diplodoc sidebar, reduce sidebar noise, and make language switching a global UI action rather than a content category.

The target primary sequence is:

1. **Проекты**
2. **Опыт**
3. **Материалы**
4. **Работа со мной**
5. **Обо мне**

The change must preserve the project architecture:

**static-first + build-time intelligence + progressive enhancement**.

It must not delete public routes, create a second navigation runtime, weaken search/build/SEO contracts, or pretend that the current partial English layer is a fully translated site.

## Current state and problem

The top header already uses the desired five-item order:

`Проекты → Опыт → Материалы → Работа со мной → Обо мне`.

The Diplodoc sidebar still reflects an older flat information architecture:

- Проекты
- Сейчас
- Engineering Map
- Engineering Notes
- Публикации
- Работа со мной
- Обо мне
- Опыт
- Источники
- Фото
- Контакты
- English

This creates four concrete problems:

1. top navigation and sidebar describe different site structures;
2. engineering/publication material is split across unrelated root items;
3. `English` looks like a content section beside Russian content instead of a global locale choice;
4. secondary personal surfaces (`Сейчас`, `Фото`, `Контакты`) compete visually with the primary portfolio IA.

The current top-right language utility already owns RU/EN switching. The canonical RU/EN pair registry remains `data/i18n.json`.

## Constraints discovered in the current architecture

### Diplodoc build ownership

`docs/toc.yaml` is not merely visual navigation: it also participates in deciding which Markdown files are processed by the Diplodoc build.

Therefore the English branch must **not** simply be deleted from `toc.yaml` while English Markdown pages still depend on the main build.

Diplodoc supports `hidden: true` sections: they stay available by direct link and remain part of the build unless the CLI is explicitly run with `--remove-hidden-toc-items=true`.

Reference:

- https://diplodoc.com/docs/en/project/toc
- https://diplodoc.com/docs/en/tools/docs/settings

The repository must continue to build without `--remove-hidden-toc-items=true` for this design.

### Partial English coverage

The English layer is intentionally curated rather than complete. `data/i18n.json` currently owns pairs for:

- home;
- About;
- Resume / Experience;
- Projects;
- Now;
- Publications;
- Work with me;
- selected project case studies;
- selected Engineering Notes.

Engineering Map, Sources, Photo and several other Russian surfaces do not currently have English counterparts.

The language control must therefore preserve the existing semantics:

- use the paired route where a canonical pair exists;
- use the existing bounded locale fallback where a pair does not exist;
- never invent an English mirror merely to make navigation look symmetrical.

## Approaches considered

### Approach A — canonical TOC restructure + hidden English build branch

Restructure `docs/toc.yaml` into the desired visible IA, keep English entries in a hidden build-only section, and keep the existing header language runtime as the sole visible locale control.

**Advantages**

- one canonical navigation source;
- no new runtime navigation logic;
- preserves all current English build inputs;
- smallest architectural surface;
- aligns with static-first principles;
- nested Materials / Notes disclosure is owned by Diplodoc rather than custom JavaScript.

**Trade-offs**

- the hidden English branch remains present in source YAML even though it is not visible;
- partial English coverage remains partial by design.

**Decision: recommended.**

### Approach B — leave TOC flat and transform the sidebar at runtime

Use JavaScript after Diplodoc hydration to move entries, create a Materials node, remove English visually, and reorder items.

**Advantages**

- fewer changes to the source TOC.

**Disadvantages**

- duplicates navigation truth between YAML and JavaScript;
- creates hydration/DOM-order/accessibility failure modes;
- can cause visible layout movement;
- makes browser behavior responsible for information architecture;
- harder to test and maintain.

**Decision: rejected.**

### Approach C — separate RU and EN TOCs / separate locale builds

Introduce locale-specific TOCs or a second Diplodoc build so each locale owns a fully independent sidebar.

**Advantages**

- perfect locale-specific navigation once both language trees are complete.

**Disadvantages**

- materially increases build, search and content-drift complexity;
- current English coverage is intentionally incomplete;
- duplicates infrastructure before audience evidence justifies it;
- conflicts with the existing one-build / one-search architecture.

**Decision: deferred.**

## Chosen visible sidebar architecture

The visible root sidebar becomes exactly five primary groups/items in the same order as the header.

### 1. Проекты

Clickable parent: existing Projects hub.

Children: existing project case studies in their current canonical order. No project routes are changed.

### 2. Опыт

Direct link to the existing Resume / Experience surface.

No children in this slice.

### 3. Материалы

Clickable parent: a new **minimal Materials hub** (`landing/materials.md`) rather than routing the label `Материалы` to the Engineering Notes hub.

The hub is intentionally scan-first and contains only four primary destinations with short descriptions; it is not another long-form content page.

Children, in the required order:

1. **Публикации**
2. **Engineering Map**
3. **Engineering Notes**
4. **Источники**

#### Engineering Notes nested disclosure

`Engineering Notes` remains clickable and also owns the nested list of all current note routes.

The first nested item is **Все заметки**, followed by the current individual Notes in their existing canonical order.

This slice does **not** merge, delete, rename or rewrite individual Notes. Content consolidation belongs to the separate Engineering Notes audit.

### 4. Работа со мной

Direct link to the existing Work with me surface.

No content/visual redesign in this slice.

### 5. Обо мне

Clickable parent: existing About page.

Secondary personal-context pages move under this parent:

1. **Сейчас**
2. **Фото**
3. **Контакты**

Rationale: these surfaces are useful but secondary to the portfolio’s primary scanning path. Grouping them under About preserves discoverability while removing three unrelated root-level items.

This is the only intentional IA interpretation beyond the user’s explicit Materials grouping and top-level ordering, and should be reviewed before implementation.

## Language navigation design

### Visible behavior

- remove the visible `English` entry from the sidebar;
- keep the top-right language selector as the only global locale control;
- when a canonical pair exists, switch to that paired page;
- otherwise retain the existing locale fallback behavior;
- no browser-language auto-redirect.

### Build behavior

Do **not** delete the English Markdown entries from `docs/toc.yaml`.

Instead keep one final build-only English group with `hidden: true` so Diplodoc continues to process the current English Markdown routes without rendering `English` in the visible sidebar.

The implementation must verify in generated output that:

- `/en/` surfaces still build;
- hidden English navigation is absent from the visible RU sidebar;
- direct EN routes remain loadable;
- the language utility continues to work.

## Header alignment

The header already has the correct primary order, so this slice does not redesign the header.

One semantic correction is required:

- update header `Материалы` from the current Engineering Notes destination to the new Materials hub.

The other four header targets remain unchanged unless tests prove a route normalization issue.

## Materials hub design

The new Materials hub exists to make the top-level label truthful and give users a simple orientation surface.

Content model:

- H1: `Материалы`
- one short lead, maximum two lines on a normal desktop width;
- four concise navigation cards/rows in this order:
  1. Публикации
  2. Engineering Map
  3. Engineering Notes
  4. Источники

The hub should reuse existing visual primitives where practical. It must not introduce a new card system solely for this page.

No analytics claims, SEO claims, counters or inferred popularity labels are added.

## SEO, search and route boundaries

This slice is an IA/internal-linking change, not an SEO rewrite.

Rules:

- no existing route is deleted;
- no canonical URL is changed for existing pages;
- no `.html` compatibility policy is changed;
- no metadata rewrite for existing surfaces;
- one new clean Materials hub route is added through the existing build/metadata conventions;
- Diplodoc remains the sole full-text search owner;
- hidden English pages remain buildable and can remain discoverable through their canonical language pairs and existing sitemap/search machinery;
- the clean-URL observation clock is not reset.

## Accessibility and interaction

No custom sidebar accordion JavaScript is introduced.

Nested disclosure behavior is delegated to Diplodoc’s existing TOC rendering.

Acceptance must cover:

- keyboard access to Materials and Engineering Notes disclosure controls;
- logical focus order matching the visual root order;
- no duplicated visible `English` navigation item;
- no layout overflow at representative desktop/mobile widths;
- current-page state remains visible after nesting.

## TDD / implementation strategy

### RED contract first

Add a focused navigation IA regression test before changing production TOC/content.

The RED contract must require:

1. visible root order is exactly:
   `Проекты → Опыт → Материалы → Работа со мной → Обо мне`;
2. `Материалы` exists exactly once as a visible root item;
3. Materials children are exactly ordered:
   `Публикации → Engineering Map → Engineering Notes → Источники`;
4. Engineering Notes still owns every current note route and includes `Все заметки` first;
5. `Сейчас → Фото → Контакты` are nested under `Обо мне` in that order;
6. no visible sidebar node named `English` exists;
7. English build entries remain present and hidden rather than deleted;
8. header root order remains unchanged;
9. header Materials target points to the Materials hub;
10. all existing RU/EN route files required by the current i18n manifest remain present.

Expected RED reason: current `docs/toc.yaml` still has the old flat sidebar and visible English branch.

### GREEN implementation

Minimum intended file surface:

- `docs/toc.yaml`
- `docs/landing/materials.md`
- page metadata/route registry only if required by existing validation for the new hub;
- focused navigation IA tests;
- existing i18n/browser smoke only where necessary to prove hidden EN pages still build and switch correctly.

No new dependency.

No new runtime navigation script.

### Browser acceptance

On generated/deployed output verify at minimum:

- RU sidebar primary order;
- Materials disclosure;
- nested Engineering Notes disclosure;
- About disclosure with Сейчас / Фото / Контакты;
- absence of visible English sidebar entry;
- top-right RU/EN language menu still present;
- representative paired RU → EN and EN → RU transitions;
- representative unpaired RU page follows the existing bounded fallback rather than a broken route;
- desktop and mobile no-overflow;
- generated search still works;
- no console/page errors.

## Scope exclusions

Explicitly **not** part of this PR:

- homepage spacing/symmetry redesign;
- Work with me visual polish;
- Now intro redesign;
- QWEP / MarketDB commercial-context rewrite;
- Publications tag/card cleanup;
- Engineering Notes quality/count/content audit;
- merging or deleting Notes;
- full English-site translation;
- second locale build or second search index;
- automatic locale detection;
- publishing the controlled launch.

These remain subsequent slices from the already agreed UX/content polish plan.

## Rollback

The change is intentionally low-coupling:

- revert the TOC/hub/test commit(s);
- no database, external state or runtime migration exists;
- no URL removal means rollback does not require redirect repair.

## Definition of Done

- visible sidebar has exactly the five primary items in header order;
- Materials groups Publications, Engineering Map, Engineering Notes and Sources in the requested order;
- Engineering Notes is nested and retains all existing Notes;
- Сейчас / Фото / Контакты are grouped under Обо мне;
- no visible `English` sidebar section remains;
- existing English pages remain built through a hidden TOC branch;
- top-right language control is the sole visible locale selector;
- header Materials link resolves to the new Materials hub;
- no existing route/canonical is removed or renamed;
- no new runtime navigation JS or dependency is introduced;
- focused unit/contract tests are GREEN;
- full build/browser/a11y/i18n/search/visual gates are GREEN on the exact PR head;
- review has no blockers;
- after merge, Pages and Production Live Smoke are GREEN on the exact merge SHA;
- durable state/roadmap/changelog are reconciled without claiming that controlled launch has been published.
