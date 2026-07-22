# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P1.2 Project Metadata Cleanup PR #31.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## P1.2 — Project Metadata Cleanup

### Зачем

После нескольких product/architecture milestones проект уже давно перестал быть «многостраничным лендингом», но `package.json` всё ещё описывал раннюю фазу:

- `description: Многостраничный лендинг TrueRuslan`;
- keyword `landing`;
- generic `documentation` / `markdown` identity;
- repository/bugs URLs с неканоничным owner casing;
- отсутствовал явный запрет на npm publication.

Roadmap отдельно запрещал делать декоративный version bump без осознанной release semantics.

### Design / planning

Design:

`docs/superpowers/specs/2026-07-22-project-metadata-cleanup-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-project-metadata-cleanup.md`

Главное решение:

**исправить package identity, но не изображать новый npm release.**

Рассматривались варианты:

1. сохранить `0.2.0` и сделать package semantics явными — выбрано;
2. bump до `0.4.0` по аналогии с Portfolio v0.4 — отклонено, потому что product milestone не равен npm semver;
3. bump до `1.0.0` — отклонено как ложный maturity/release claim.

### Implementation

**PR #31 — `chore: align project metadata identity`**  
Merged: 2026-07-22  
Squash commit: `1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact implementation head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

### Package identity

`package.json` теперь содержит:

- `private: true`;
- description: `TrueRuslan engineering portfolio and knowledge platform`;
- keywords:
  - `engineering-portfolio`;
  - `knowledge-platform`;
  - `backend-engineering`;
  - `software-architecture`;
  - `engineering-notes`;
  - `diplodoc`;
  - `personal-site`;
- repository/bugs URLs с canonical `True-Ruslan` owner spelling.

GitHub Pages homepage сохранён без изменений:

`https://true-ruslan.github.io/trueruslan-landing/`

`package-lock.json` не менялся: package name/version и dependency graph остались прежними.

### Publication boundary

Добавлен:

`"private": true`

Это фиксирует реальный контракт: repository — deployable site/application workspace, а не npm package для публикации.

### Deliberate version decision

`version: 0.2.0` сохранён намеренно.

Причины:

- npm publication отсутствует;
- semver lifecycle не определён;
- product milestones (`v0.3`, `v0.4`, P0/P1) не являются npm releases;
- новый номер без contract означал бы decorative claim.

Будущий version bump требует отдельного explicit versioning/release decision.

### Metadata contract

Добавлен:

`scripts/package-metadata.test.js`

Он проверяет:

- package name;
- `private: true`;
- current engineering portfolio / knowledge platform identity;
- отсутствие landing-only metadata;
- required modern keywords;
- canonical repository/bugs URLs;
- неизменный Pages homepage;
- deliberate `0.2.0` version;
- package/package-lock root name-version consistency.

### TDD / verification

#### Build #295 — RED

Run:

`29953964548`

Contract test был добавлен до production metadata changes.

`Test` ожидаемо упал на stale package identity; downstream build/browser gates были skipped.

#### Build #296 — final GREEN

Exact head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

Run:

`29954043887`

**Полностью green вся configured matrix:**

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources Knowledge Base;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- unchanged visual regression;
- diagnostics/evidence upload.

### Scope proof

Feature PR изменил ровно:

- `package.json`;
- `scripts/package-metadata.test.js`;
- P1.2 design;
- P1.2 implementation plan.

Не менялись:

- `package-lock.json`;
- CSS/public content;
- data registries;
- routes;
- visual baselines/thresholds;
- Lighthouse budget;
- CI workflow ordering.

### Result

Package identity теперь соответствует реальному продукту и защищён test contract.

Следующий roadmap priority:

**P1.3 — Stronger flagship case-study format.**

---

## P1.1 — Consolidated Browser Quality Harness

**PR #29 — `refactor: consolidate browser quality harness`**  
Squash: `06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Build #293 / run `29951464481`: **fully green**.

Создан modular `scripts/quality-harness/`:

- paths;
- quality-tool/browser discovery;
- static server lifecycle;
- context/page factory;
- diagnostics;
- overflow/Axe helpers;
- screenshot/evidence helpers;
- common immutable scenarios.

Focused runners сохранили domain ownership. Giant runner/DSL не создавался. `visual-regression.cjs` оставлен отдельным.

TDD trail:

- Build #271 — RED contracts;
- Build #280 — shared primitives GREEN;
- Build #284 — core migration GREEN;
- Build #293 — exact-head full matrix GREEN.

---

## P0.6 — Content Freshness Guard

**PR #27 — `feat: add Content Freshness Guard`**  
Squash: `33770983789fbde5c59a94972709360286a06ad5`

Exact head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Build #269 / run `29947803201`: **fully green**.

Ключевые части:

- pure deterministic detector;
- `lastVerified` age threshold;
- link/repository/release/timeline/signal drift diagnostics;
- JSON + Markdown report;
- bounded external probe;
- daily/manual workflow;
- idempotent GitHub issue lifecycle.

Trust boundary:

**maintenance signals никогда автоматически не переписывают Project Registry, Project Evidence или `verified / stale / unverified`.**

Operational caveat: первый фактический post-merge scheduled/manual workflow run подтверждать отдельным run evidence.

### Repository-hygiene incident

Во время design setup был случайно создан временный `_never_` probe file прямым Contents API commit (`4f7ec91...`). Он был немедленно удалён cleanup commit `b5ce6e5...`.

Net tree effect: **zero**.

---

## P0.5 — Grounded Engineering Notes

**PR #25 — `feat: publish grounded Engineering Notes milestone`**  
Squash: `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`: **fully green**.

Добавлены repository-grounded notes:

1. `intersection-observer-giant-table`;
2. `static-first-sources-no-js`;
3. `green-ci-is-not-product-verification`.

Всего Engineering Notes стало 6.

---

## Portfolio v0.4 — Project Evidence Layer

**PR #22 — `feat: add Project Evidence Layer`**  
Squash: `e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

Созданы:

- canonical `data/project-evidence.json`;
- manual controlled snapshots;
- `verified / stale / unverified`;
- bounded automated/manual signals;
- semantic build-time rendering/no-JS fallback;
- trust-aware browser quality gate.

Ключевой lesson:

**green CI не равно verified product без bounded scope и current manual interpretation.**

В milestone также был найден и исправлен stylesheet-resolution regression с Diplodoc `<base href>`; integrity gate не ослаблялся.

---

## Portfolio v0.4 — Sources Registry / Knowledge Base

**PR #20 — `feat: build Sources Registry knowledge base`**  
Squash: `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Старая giant bibliography table заменена на canonical `data/sources.json`:

- 31 real records;
- strict validation;
- deterministic semantic cards;
- page-local filtering;
- stable anchors/related materials;
- responsive UI;
- no-JS fallback.

Первый no-JS smoke обнаружил, что наличие data в build artifact не гарантирует readable content без hydration. Решение — semantic fallback без второго canonical source и без runtime fetch.

---

## Photo Stories — cinematic personal archive

**PR #15** — main platform.  
Squash: `8aa2149fc8aec3751f2da73321c06a89111f9efd`

**PR #17** — QA polish.  
Squash: `7936638bd6473ad4f1ff0b2ef42db2289e937d83`

Готовы:

- canonical `/photos/`;
- album/archive registries;
- story routes;
- cinematic hero/editorial layouts;
- fullscreen lightbox;
- keyboard/touch/hash navigation;
- focus restoration;
- sitemap/search/meta/OG integration;
- dedicated browser smoke.

Fake/demo album не создавался.

---

## Bibliography disappearing-table regression

**PR #14 — `fix: keep bibliography table visible after hydration`**

Root cause:

`IntersectionObserver threshold: 0.08` требовал видеть 8% очень высокого элемента; условие могло быть недостижимо в обычном viewport.

Fix:

- threshold снижен до `0` с сохранением root margin;
- добавлен normal-flow fallback;
- позже giant table как model была заменена Sources Registry.

---

## Portfolio v0.3 — living engineering space

**PR #13 — `feat: evolve portfolio into a living engineering space`**  
Squash: `b472aff67d69fb3cd6afa0577864371547f52a5b`

Milestone закрепил переход от «landing page» к living engineering portfolio / knowledge platform:

- canonical Project Registry;
- `/now`;
- structured flagship timelines;
- Engineering Notes metadata/relations/feed;
- Engineering Map;
- command palette;
- stronger generated-site quality gates.

---

## Durable continuity updates

После крупных milestones durable state синхронизируется отдельными docs-only follow-ups, чтобы новый чат восстанавливал контекст из repository truth.

Ключевые continuity merges до P1.2:

- Sources — PR #21 / `5535948d756585c44550d14f3e2424be82a3b767`;
- Project Evidence — PR #23 / `ac520553cbe38ab022d49abc3b48dd0bd67c76c8`;
- Project Evidence cleanup — PR #24 / `6e83ab5dcbbc23ae2274fddbd0daed8efa058e23`;
- Grounded Notes — PR #26 / `81a404738dc69bed832080c9f852316a33cedba9`;
- Content Freshness — PR #28 / `65191a63eb3af8df596a861f16cbe2c926bdca34`;
- Quality Harness — PR #30 / `56d476234fea471ed700369d1e57f9c39e536bd5`.

Актуальные источники контекста:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI поверх snapshot docs.
