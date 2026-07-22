# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P1.3 Stronger Flagship Case-Study Format PR #34.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## P1.3 — Stronger Flagship Case-Study Format

### Зачем

LivingWorld и NODE ZERO уже имели architecture diagrams, timelines, registry-derived state и Project Evidence, но читателю приходилось самому собирать инженерную историю из разнородных секций.

Цель P1.3 — сделать flagship pages понятными именно как истории принятия решений:

- какую проблему решает проект;
- какие ограничения сформировали архитектуру;
- какие решения были приняты и почему;
- какие предположения/направления оказались ошибочными или потребовали ограничения;
- где проект находится broadly;
- что реально подтверждено;
- что автор сделал бы иначе сейчас.

При этом нельзя было создать второй источник истины по status/trust/evidence.

### Design decision

Выбран **Markdown-first narrative contract**.

Design:

`docs/superpowers/specs/2026-07-22-flagship-case-study-format-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-flagship-case-study-format.md`

Рассматривались три подхода:

1. ordinary Markdown + shared structural contract — **выбрано**;
2. новый `case-studies.json` + renderer — отклонён как второй authoring layer/source complexity;
3. hybrid schema + Markdown fragments — отклонён как YAGNI для двух flagship pages.

Canonical ownership сохранён:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — structured evolution;
- `data/project-evidence.json` — trust/current verification facts;
- Markdown — human-authored reasoning, trade-offs, corrected assumptions/failures и retrospective.

### Implementation

**PR #34 — `content: strengthen flagship case-study narratives`**  
Merged: 2026-07-22  
Squash commit: `107b69311f6eed408de5306406d9ff41f0e32ea2`

Exact implementation head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

### Shared narrative contract

Обе страницы теперь следуют одному порядку:

1. Problem
2. Constraints
3. Decisions
4. What failed / corrected assumptions
5. Current state
6. Evidence
7. What I would change now

Source-level stable markers:

- `case-study:problem`;
- `case-study:constraints`;
- `case-study:decisions`;
- `case-study:failures`;
- `case-study:current-state`;
- `case-study:evidence`;
- `case-study:retrospective`.

Markers нужны как authoring/test contract и не создают runtime behavior.

### LivingWorld

Страница перестроена вокруг реальной инженерной проблемы: AI NPC должен жить по правилам server-authoritative multiplayer system.

Явно раскрыты:

- session ownership;
- text/voice convergence;
- partial STT/LLM/TTS degradation;
- cancellation как normal control flow;
- persistent memory отдельно от prompt representation;
- LLM output как proposal, а не authority;
- bounded automated evidence vs live multiplayer acceptance.

В `What failed` не придуманы драматические incidents. Зафиксированы реальные corrected assumptions/lessons:

- LLM integration не является центром сложности;
- transcript не равен memory model;
- partial provider failure важнее идеального happy path;
- cancellation нельзя оставлять поздним cleanup concern.

Architecture/request-lifecycle diagrams, timeline и Project Evidence сохранены.

### NODE ZERO

Страница перестроена вокруг продуктово-инженерной проблемы: сделать predictive system MIRROR частью страха через изменение context/constraints, а не через образ разговаривающего злодея.

Явно раскрыты:

- vertical slice как единица proof;
- no-combat constraint;
- stable facility baseline before distortion;
- reusable gameplay systems vs authored sequences;
- proprietary/public boundary;
- asset provenance/licensing как production constraint;
- documentation-driven/agent-assisted continuity.

В `What failed` описаны только grounded corrected directions/risks, а не выдуманные production incidents:

- риск построить data-center simulator вместо игры;
- риск протащить scene-specific logic в fundamental gameplay systems;
- unnecessary proceduralization authored moments;
- потеря architecture/product context между длинными iterations.

Architecture/system-flow diagrams, timeline и Project Evidence сохранены.

### Structural contract test

Добавлен:

`scripts/flagship-case-study.test.js`

Он проверяет:

- controlled flagship set = `livingworld`, `node-zero`;
- семь markers ровно по одному разу;
- canonical order;
- timeline placeholder ровно один раз;
- Project Evidence placeholder ровно один раз;
- architecture diagram ровно один раз.

Test защищает structure/source boundaries, но не фиксирует exact prose.

### TDD / verification

#### Build #299 — RED

Run:

`29958395678`

Structural contract добавлен до изменения flagship pages.

`Test` ожидаемо упал: страницы ещё не содержали required markers.

#### Build #300 — intermediate RED

Run:

`29958496645`

После миграции только LivingWorld suite всё ещё ожидаемо оставался RED, потому что NODE ZERO ещё не соответствовал contract.

#### Build #301 — final GREEN

Exact implementation head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

Run:

`29958607263`

**Полностью green вся configured matrix:**

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources Knowledge Base;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- diagnostics/evidence upload.

### Scope proof

Feature PR изменил ровно 5 файлов:

- `docs/landing/projects/livingworld.md`;
- `docs/landing/projects/node-zero.md`;
- `scripts/flagship-case-study.test.js`;
- P1.3 design;
- P1.3 implementation plan.

Не менялись:

- project/timeline/evidence registries;
- CSS;
- build/postprocess renderers;
- routes;
- visual baselines/thresholds;
- Lighthouse budget;
- CI workflow ordering.

### Result

Flagship pages теперь объясняют человеческий engineering/product reasoning, при этом current machine-like truth остаётся в canonical registries/Evidence.

Следующий roadmap priority:

**P1.4 — Additional grounded Engineering Notes**, обязательно начиная с cross-repository source verification.

---

## P1.2 — Project Metadata Cleanup

**PR #31 — `chore: align project metadata identity`**  
Squash: `1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

Build #296 / run `29954043887`: **fully green**.

Результат:

- description → engineering portfolio / knowledge platform;
- `private: true`;
- canonical repository/bugs URLs;
- modern keywords;
- `scripts/package-metadata.test.js`;
- `version: 0.2.0` оставлен намеренно до explicit release/semver contract;
- `package-lock.json` не менялся.

TDD:

- Build #295 — expected RED;
- Build #296 — final exact-head GREEN.

---

## P1.1 — Consolidated Browser Quality Harness

**PR #29 — `refactor: consolidate browser quality harness`**  
Squash: `06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Build #293 / run `29951464481`: **fully green**.

Создан modular `scripts/quality-harness/` для shared browser-quality infrastructure. Focused runners сохранили domain ownership; giant runner/DSL не создавался. `visual-regression.cjs` оставлен отдельным.

---

## P0.6 — Content Freshness Guard

**PR #27 — `feat: add Content Freshness Guard`**  
Squash: `33770983789fbde5c59a94972709360286a06ad5`

Exact head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Build #269 / run `29947803201`: **fully green**.

Реализованы:

- deterministic freshness detector;
- `lastVerified` age checks;
- link/repository/release/timeline/signal drift diagnostics;
- JSON + Markdown report;
- bounded external probe;
- daily/manual workflow;
- idempotent issue lifecycle.

Trust boundary:

**maintenance signals никогда автоматически не переписывают Project Registry, Project Evidence или trust state.**

Operational caveat: первый реальный post-merge scheduled/manual workflow run подтверждать отдельным evidence.

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

Созданы canonical evidence snapshots, `verified / stale / unverified`, bounded signals, semantic rendering/no-JS fallback и trust-aware QA.

Ключевой lesson:

**green CI не равно verified product без bounded scope и current manual interpretation.**

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

Первый no-JS smoke показал: data в build artifact ещё не гарантирует readable content без hydration. Решение — semantic fallback без второго canonical source и runtime fetch.

---

## Photo Stories — cinematic personal archive

**PR #15** — main platform / squash `8aa2149fc8aec3751f2da73321c06a89111f9efd`.  
**PR #17** — QA polish / squash `7936638bd6473ad4f1ff0b2ef42db2289e937d83`.

Готовы canonical `/photos/`, album/archive registries, story routes, cinematic/editorial layouts, fullscreen lightbox, keyboard/touch/hash navigation, sitemap/search/meta/OG integration и dedicated browser smoke.

Fake/demo album не создавался.

---

## Bibliography disappearing-table regression

**PR #14 — `fix: keep bibliography table visible after hydration`**

Root cause:

`IntersectionObserver threshold: 0.08` требовал видеть 8% очень высокого элемента; условие могло быть недостижимо в обычном viewport.

Fix:

- threshold снижен до `0`;
- добавлен normal-flow fallback;
- позже giant table как model заменена Sources Registry.

---

## Portfolio v0.3 — living engineering space

**PR #13 — `feat: evolve portfolio into a living engineering space`**  
Squash: `b472aff67d69fb3cd6afa0577864371547f52a5b`

Milestone закрепил переход от landing page к living engineering portfolio / knowledge platform:

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

Ключевые continuity merges до P1.3:

- Sources — PR #21 / `5535948d756585c44550d14f3e2424be82a3b767`;
- Project Evidence — PR #23 / `ac520553cbe38ab022d49abc3b48dd0bd67c76c8`;
- Project Evidence cleanup — PR #24 / `6e83ab5dcbbc23ae2274fddbd0daed8efa058e23`;
- Grounded Notes — PR #26 / `81a404738dc69bed832080c9f852316a33cedba9`;
- Content Freshness — PR #28 / `65191a63eb3af8df596a861f16cbe2c926bdca34`;
- Quality Harness — PR #30 / `56d476234fea471ed700369d1e57f9c39e536bd5`;
- Project Metadata — PR #32 / `cadbbe4e04360cfcb8942180a4ce2cc71835dd83`;
- P1.2 final continuity correction — PR #33 / `ba6cabe3b0ef7ae702a690136c79dcdb5f36e27c`.

Актуальные источники контекста:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI поверх snapshot docs.
