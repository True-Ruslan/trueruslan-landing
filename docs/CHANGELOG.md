# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P1.1 Consolidated Browser Quality Harness PR #29.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## P1.1 — Consolidated Browser Quality Harness

### Design / planning

Design:

`docs/superpowers/specs/2026-07-22-consolidated-browser-quality-harness-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-consolidated-browser-quality-harness.md`

Главное решение:

**вынести только стабильные infrastructure primitives и сохранить focused runners владельцами своих domain assertions.**

Рассматривались три формы:

1. shared primitives + focused runners — выбрано;
2. один declarative mega-runner/DSL — отклонён из-за blast radius и потери domain ownership;
3. только server/browser helper — отклонён как недостаточный, потому что diagnostics/Axe/overflow/evidence duplication осталась бы.

### Implementation

**PR #29 — `refactor: consolidate browser quality harness`**  
Merged: 2026-07-22  
Squash commit: `06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact implementation head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

### Shared harness

Создан `scripts/quality-harness/`.

#### `paths.cjs`

Один источник путей для:

- repository root;
- `docs-html`;
- `.quality-tools/node_modules`;
- `quality-artifacts`.

#### `tools.cjs`

Общие primitives:

- quality-tool loader;
- Chrome/Chromium discovery;
- Chromium channel-first launch;
- explicit executable fallback.

#### `static-server.cjs`

Общий Express lifecycle:

- extensionless `.html` serving;
- configurable port;
- stoppable lifecycle;
- optional gzip transport для production-like browser-quality/Lighthouse path.

#### `browser.cjs`

Общий context/page lifecycle factory без domain logic.

#### `diagnostics.cjs`

Общие diagnostics:

- page errors;
- same-origin request failures;
- HTTP >=400 capture;
- expected abort filtering;
- deterministic deduplication;
- caller-provided scenario labels.

#### `assertions.cjs`

Общие generic assertions:

- document horizontal overflow;
- strict real `maxScrollX` measurement для layout smoke;
- Axe serious/critical filtering;
- reusable accessibility gate helper.

#### `evidence.cjs`

Общие artifact helpers:

- artifacts directory;
- stable screenshot defaults;
- JSON/text output.

#### `scenarios.cjs`

Immutable common viewport/core-route declarations, но не feature assertion DSL.

### Migrated focused runners

Shared infrastructure используют:

- `browser-quality.cjs`;
- `sources-knowledge-base-smoke.cjs`;
- `project-evidence-smoke.cjs`;
- `photo-stories-browser-smoke.cjs`;
- `v03-browser-smoke.cjs`;
- `cross-browser-smoke.cjs`;
- `search-smoke.cjs`;
- `metadata-smoke.cjs`;
- `engineering-graph-smoke.cjs`;
- `layout-overflow-smoke.cjs`.

Каждый runner сохранил свою domain responsibility:

- command palette/project status/timeline assertions остаются в v0.3 smoke;
- Sources filters/no-JS remain in Sources smoke;
- Evidence trust/border/scope remain in Evidence smoke;
- Photo lightbox/hash/focus/image-readiness remain in Photo smoke;
- generated search enhancement/resource/shortcut assertions remain in Search smoke;
- metadata/canonical/OG PNG contract remain in Metadata smoke;
- graph filters/detail semantics remain in Engineering Map smoke;
- Firefox/WebKit behavior remains in cross-browser smoke.

### Intentional non-migration

`visual-regression.cjs` оставлен отдельным.

Причина: он сравнивает PNG samples против baseline model и не является browser orchestration runner. Искусственное включение в общий browser harness не уменьшало бы meaningful duplication и повышало риск изменить comparison semantics.

### Preservation review

Перед final verification отдельно пойманы и исправлены три subtle drift risk:

1. Cross-browser home route сначала унаследовал `/index.html` из common scenario, но исторический runner проверял `/`; route восстановлен как `/`.
2. Metadata smoke через общий context factory получил бы dark default; явно сохранена прежняя light/default-like browser context semantics.
3. Project Evidence screenshot path должен быть standalone-safe; переведён на shared `captureScreenshot`, который сам создаёт artifacts directory.

Эти исправления сделаны **до** final exact-head verification.

### Что не менялось

P1.1 не изменил:

- CSS;
- public content;
- `tests/visual-baselines.json`;
- visual regression thresholds;
- Lighthouse budget;
- workflow step ordering;
- product routes/feature assertions;
- Project Evidence trust semantics;
- no-JS behavior contracts;
- screenshot/artifact naming contracts.

### TDD / verification trail

#### Build #271 — RED

Shared-harness contract tests импортировали ещё не существующие `scripts/quality-harness/*.cjs` modules.

`Test` ожидаемо упал; downstream gates были skipped.

Run:

`29950434704`

#### Build #280 — shared harness GREEN

Pure/shared contracts прошли после минимальной implementation:

- paths;
- tool loader/Chromium fallback;
- static server;
- context factory;
- diagnostics helpers;
- overflow/Axe helpers;
- evidence helpers;
- common scenario constants.

Run:

`29950664284`

#### Build #284 — core migration slice GREEN

После migration core runners green прошли:

- layout overflow;
- Chromium browser/Axe/Lighthouse;
- v0.3;
- Firefox/WebKit compatibility.

Run:

`29950951055`

#### Build #293 — final exact-head verification

Exact head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Run:

`29951464481`

**Полностью green вся configured matrix:**

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile layout overflow;
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

### Result

Quality suite теперь имеет общий modular infrastructure layer, но остаётся набором читаемых focused tests.

Следующий roadmap priority:

**P1.2 — Project metadata cleanup.**

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

Operational caveat: первый фактический post-merge scheduled/manual workflow run нужно подтверждать отдельным run evidence.

### Repository-hygiene incident

Во время design setup был случайно создан временный `_never_` probe file прямым Contents API commit (`4f7ec91...`). Он был немедленно удалён cleanup commit `b5ce6e5...`.

Net tree effect: **zero**.

Incident сохранён в истории прозрачно; product/runtime data не затрагивались.

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
- добавлен normal-viewport browser regression.

Позже giant table как model была заменена Sources Registry.

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

Ключевые continuity merges до P1.1:

- Sources — PR #21 / `5535948d756585c44550d14f3e2424be82a3b767`;
- Project Evidence — PR #23 / `ac520553cbe38ab022d49abc3b48dd0bd67c76c8`;
- Project Evidence cleanup — PR #24 / `6e83ab5dcbbc23ae2274fddbd0daed8efa058e23`;
- Grounded Notes — PR #26 / `81a404738dc69bed832080c9f852316a33cedba9`;
- Content Freshness — PR #28 / `65191a63eb3af8df596a861f16cbe2c926bdca34`.

Актуальные источники контекста:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI поверх snapshot docs.
