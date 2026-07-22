# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge P1.1 Consolidated Browser Quality Harness PR #29.
>
> Главный durable snapshot для ответа на вопрос **«что сейчас представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
>
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> После этого всегда дополнительно проверять actual open PR, latest commits и exact-head CI. Public deployment и реальные maintenance-workflow runs проверять отдельно.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Это уже не обычный landing page. Проект объединяет:

- лёгкую standalone-главную;
- Diplodoc knowledge pages;
- web-CV;
- project case studies;
- `/now`;
- Engineering Notes + Atom feed;
- Engineering Map;
- локальный полнотекстовый поиск;
- Cmd/Ctrl+K command palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — от первого лица: спокойный инженерный дневник, без корпоративного маркетинга, fake demos и неподтверждённых claims.

---

## 2. Текущее состояние `master`

### Последний technical milestone

**P1.1 — Consolidated Browser Quality Harness**.

PR #29:

`refactor: consolidate browser quality harness`

Squash commit:

`06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact implementation head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Verification:

**Build #293 / workflow run `29951464481`: fully green по полной configured matrix.**

### Что изменил P1.1

Создан модульный `scripts/quality-harness/`:

- `paths.cjs` — canonical quality paths;
- `tools.cjs` — `.quality-tools` loading, Chrome discovery, Chromium launch fallback;
- `static-server.cjs` — общий static-server lifecycle с optional gzip transport;
- `browser.cjs` — context/page lifecycle factory;
- `diagnostics.cjs` — page/request/HTTP diagnostics, same-origin filtering, expected abort handling;
- `assertions.cjs` — horizontal overflow/real-scroll/Axe primitives;
- `evidence.cjs` — screenshots и JSON/text artifacts;
- `scenarios.cjs` — immutable common viewports/core route declarations.

На shared primitives переведены focused runners:

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

**Domain ownership не объединён в giant runner.** Каждый focused smoke по-прежнему владеет своими interaction/assertion semantics.

`visual-regression.cjs` намеренно оставлен отдельным и не переписан под browser harness: его PNG sample/baseline comparison model отличается и не требовала искусственной абстракции.

### Что P1.1 сознательно НЕ изменил

- CSS/public content;
- `tests/visual-baselines.json`;
- visual thresholds;
- Lighthouse budget;
- workflow step ordering;
- product routes;
- feature-specific assertions;
- no-JS scenarios;
- trust semantics Project Evidence;
- screenshot/artifact naming contracts.

Во время self-review до final verification отдельно исправлены preservation-нюансы:

- cross-browser home route сохранён как `/`;
- metadata smoke сохранил прежнюю light/default-like browser context semantics;
- Project Evidence screenshots сохранили standalone-safe artifact creation.

### P1.1 TDD / verification trail

- Build #271 / run `29950434704` — ожидаемый RED: tests импортировали ещё не существующие harness modules;
- Build #280 / run `29950664284` — shared harness contracts GREEN;
- Build #284 / run `29950951055` — core migrated runners GREEN;
- Build #293 / run `29951464481` — final exact-head full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-22-consolidated-browser-quality-harness-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-consolidated-browser-quality-harness.md`

### Сейчас в разработке

После merge PR #29 active feature implementation PR отсутствует; текущий continuity follow-up — docs-only.

Следующий оптимальный technical priority:

**P1.2 — Project metadata cleanup.**

Первая настоящая Photo Story остаётся content-dependent/non-blocking задачей.

---

## 3. Архитектурные принципы

Ключевая граница проекта:

**static-first + build-time intelligence + progressive enhancement**.

Без отдельного design decision нельзя ломать следующие правила:

- core content доступен без runtime API;
- JavaScript улучшает UX, но не является единственным источником содержания;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core public content;
- no build-time GitHub API dependency в основном site build;
- maintenance workflows не становятся источником public truth;
- один canonical source of truth на сущность;
- deterministic build-time generation;
- semantic HTML;
- progressive vanilla JS;
- quality infrastructure не должна скрывать domain ownership;
- существующие quality gates не ослабляются ради рефакторинга;
- evidence не говорит больше, чем реально доказывает bounded `scope`.

Diplodoc остаётся владельцем единственного site-wide local full-text search index.

---

## 4. Canonical data и build architecture

Основные registries:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — structured flagship timelines;
- `data/project-evidence.json` — manual controlled evidence snapshots;
- `data/now.json` — focus/learning/writing;
- `data/notes.json` — Engineering Notes metadata/relations;
- `data/engineering-graph.json` — Engineering Map;
- `data/page-meta.json` — SEO/social metadata;
- `data/photo-albums.json` — Photo Stories albums;
- `data/photo-archive.json` — одиночный photo archive;
- `data/sources.json` — Sources Knowledge Base;
- `data/external-links.json` — public endpoints для monitoring.

Главный site build/postprocess orchestrator:

`scripts/copy-assets.js`

Maintenance tooling P0.6 находится вне core public site truth:

- `scripts/content-freshness.js`;
- `scripts/content-freshness-report.js`;
- `scripts/content-freshness-probe.js`;
- `.github/workflows/content-freshness.yml`.

Quality infrastructure P1.1 находится в:

`scripts/quality-harness/`

Она переиспользуется focused CI runners, но не определяет product/domain assertions вместо них.

---

## 5. Реализованные системы и milestones

### 5.1 Projects / case studies

Есть Projects hub и canonical `data/projects.json`.

Case studies:

- LivingWorld;
- NODE ZERO;
- TaskHub;
- MiniChess;
- Godot Atmospheric Horror Template.

Для flagship проектов есть structured timelines и architecture diagrams.

### 5.2 Project Evidence Layer — DONE

PR #22 / squash:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

Controlled scope:

- `livingworld` — `verified`, `lastVerified = 2026-07-22`, bounded scope;
- `node-zero` — `stale`, last fully verified foundation gate `2026-07-14`.

Trust states:

- `verified`;
- `stale`;
- `unverified`.

Green CI/release/PR никогда автоматически не делает project `verified`.

### 5.3 Content Freshness Guard — DONE

PR #27 / squash:

`33770983789fbde5c59a94972709360286a06ad5`

Exact head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Build #269 / run `29947803201`: **fully green**.

Guard обнаруживает maintenance findings:

- old `lastVerified`;
- unreachable evidence links;
- repository/release drift;
- structured timeline contradictions;
- verified snapshot с более новым signal после last check.

Ключевая trust boundary:

**Guard обнаруживает, но никогда автоматически не переписывает public truth или `verified / stale / unverified`.**

Workflow permissions ограничены `contents: read` + `issues: write`, checkout `persist-credentials: false`, commit/push path отсутствует.

### 5.4 Grounded Engineering Notes — DONE

PR #25 / squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`: **fully green**.

Всего опубликовано 6 Engineering Notes. P0.5 добавил:

- `intersection-observer-giant-table`;
- `static-first-sources-no-js`;
- `green-ci-is-not-product-verification`.

### 5.5 Sources Registry / Knowledge Base — DONE

PR #20 / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Есть 31 migrated real records, strict validation, deterministic semantic rendering, page-local filtering, stable anchors/related materials, responsive UI и semantic no-JS fallback.

Sources filtering не является вторым site-wide search engine.

### 5.6 Photo Stories — PLATFORM DONE

- PR #15 — main platform;
- PR #17 — QA polish.

Есть canonical `/photos/`, album/archive registries, story routes, cinematic/editorial layouts, fullscreen lightbox, keyboard/touch/hash navigation, sitemap/search/metadata integration и dedicated browser smoke.

`photo-albums.json` намеренно пуст до первой genuine связной серии. Fake/demo albums не добавлять.

### 5.7 `/now`, Engineering Map, Search, Resume/SEO — DONE

Реализованы:

- `/now` с registry-derived active project state;
- Engineering Map;
- Diplodoc local search;
- styled search page;
- command palette без второго search index;
- first-class web-CV;
- sitemap/robots/canonical;
- OpenGraph/Twitter;
- JSON-LD;
- deterministic social cards.

---

## 6. Quality architecture и exact evidence

Проект проверяет final generated artifact, а не только source code.

Configured Build matrix:

- `npm test`;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression;
- Firefox/WebKit compatibility;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality diagnostics/evidence upload.

P1.1 exact implementation head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Build #293 / run `29951464481`:

**fully green по всей configured matrix**.

Особенно важно:

- visual regression прошёл без обновления baseline;
- existing focused runner boundaries сохранены;
- новый harness покрыт `scripts/quality-harness.test.js`;
- refactor не потребовал weakening/exceptions в existing quality gates.

---

## 7. Известные незавершённые части / technical debt

### P1.2 — Project metadata cleanup — NEXT

`package.json` всё ещё содержит исторические metadata:

- `version: 0.2.0`;
- description: `Многостраничный лендинг TrueRuslan`;
- keywords отражают раннюю landing/Diplodoc фазу сильнее, чем текущий engineering portfolio / knowledge platform scope.

Версию менять только как explicit milestone/release decision, а не механически.

### P1.3 — Flagship narrative depth

LivingWorld и NODE ZERO постепенно привести к структуре:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

Project Evidence уже владеет machine-like current/evidence facts; narrative не должен вручную дублировать registry state.

### Additional grounded Notes

Candidates после отдельной source verification:

- Minecraft NPC voice AI pipeline;
- malformed / almost-correct LLM JSON protocol failures.

### Content-dependent

Первая настоящая Photo Story отсутствует. Platform готова; fake/demo album не добавлять.

### Отложено сознательно

- minimal RU/EN;
- privacy-friendly analytics;
- custom domain / paid hosting;
- richer architecture explorer.

---

## 8. Следующий оптимальный этап

### P1.2 — Project metadata cleanup

Следующий небольшой controlled milestone:

1. проверить, какую semantic version реально имеет смысл зафиксировать после evolution от landing к engineering portfolio/knowledge platform;
2. обновить `package.json` description;
3. пересмотреть keywords под фактический scope;
4. не менять package metadata просто ради косметического bump;
5. сохранить build/runtime behavior неизменным;
6. проверить package metadata contract/unit tests и полную CI matrix.

После P1.2:

1. P1.3 stronger flagship case-study narrative structure;
2. additional grounded Notes после cross-repository source verification;
3. first real Photo Story при genuine material;
4. minimal EN / analytics / domain позже.

---

## 9. Намеренные архитектурные запреты

Без нового design decision не добавлять:

- backend;
- CMS;
- database;
- runtime GitHub API;
- frontend framework ради framework;
- runtime content fetch для core content;
- второй site-wide full-text search engine;
- likes/comments/accounts;
- AI chat поверх резюме как gimmick;
- automatic mutation of trust/public project state из maintenance signals;
- giant monolithic QA runner, скрывающий domain ownership.

Предпочитать:

- version-controlled registries;
- deterministic build-time generation;
- semantic/no-JS content;
- progressive vanilla JS;
- bounded evidence;
- modular shared infrastructure + focused domain tests.

---

## 10. Operational caveats

Repository implementation и generated artifacts подтверждены CI.

**Фактический GitHub Pages deployment после последних merges отдельно не подтверждён в этом snapshot.**

**Первый реальный post-merge Content Freshness scheduled/manual run отдельно не подтверждён в этом snapshot.**

Не считать эти operational facts автоматически доказанными только из merge/CI.

---

## 11. Как восстановить контекст в новом чате

Оптимальный запрос:

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

State-файл — snapshot.

Всегда дополнительно проверять:

- open PR;
- latest commits;
- latest exact-head CI;
- latest Content Freshness workflow runs/issues, если вопрос касается freshness monitoring;
- actual production deployment, если вопрос касается production.
