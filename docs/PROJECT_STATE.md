# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge P1.2 Project Metadata Cleanup PR #31.
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

**P1.2 — Project Metadata Cleanup**.

PR #31:

`chore: align project metadata identity`

Squash commit:

`1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact implementation head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

Verification:

**Build #296 / workflow run `29954043887`: fully green по полной configured matrix.**

### Что изменил P1.2

`package.json` теперь честно описывает фактический продукт:

- description: `TrueRuslan engineering portfolio and knowledge platform`;
- добавлен `private: true` — repository является deployable site workspace, а не npm package для публикации;
- keywords отражают engineering portfolio / knowledge platform / backend engineering / software architecture / Engineering Notes;
- старый primary keyword `landing` удалён;
- repository и bugs URLs нормализованы на canonical owner spelling `True-Ruslan`;
- GitHub Pages homepage `https://true-ruslan.github.io/trueruslan-landing/` сохранён без изменений.

### Deliberate version decision

`version: 0.2.0` **сознательно оставлен без bump**.

Причина:

- проект не публикуется как npm package;
- нет установленного mapping между product milestones (`Portfolio v0.3`, `v0.4`, P0/P1) и npm semver;
- bump до `0.4.0`, `1.0.0` или другого числа создавал бы декоративный/ложный release claim;
- `private: true` делает package semantics явными.

Будущий version change требует отдельного explicit versioning/release contract.

`package-lock.json` не изменялся: package name/version и dependency graph остались прежними.

### Metadata contract

Добавлен `scripts/package-metadata.test.js`, который защищает:

- package name;
- `private: true`;
- engineering portfolio / knowledge platform description;
- required modern keywords и отсутствие landing-only identity;
- canonical repository/bugs URLs;
- неизменный Pages homepage;
- deliberate `0.2.0` version decision;
- package/package-lock root name-version consistency.

TDD trail:

- Build #295 / run `29953964548` — ожидаемый RED на stale metadata;
- Build #296 / run `29954043887` — exact implementation head полностью GREEN.

Design:

`docs/superpowers/specs/2026-07-22-project-metadata-cleanup-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-project-metadata-cleanup.md`

### Предыдущий technical milestone

**P1.1 — Consolidated Browser Quality Harness**, PR #29.

Squash:

`06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Build #293 / run `29951464481`: **fully green**.

Создан `scripts/quality-harness/` с shared paths/tooling/static-server/browser lifecycle/diagnostics/overflow/Axe/evidence/scenario primitives. Focused runners сохранили свои domain-specific assertions; giant monolithic runner не создавался. `visual-regression.cjs` намеренно оставлен отдельным.

### Сейчас в разработке

После merge PR #31 active feature implementation PR отсутствует; текущий continuity follow-up — docs-only.

Следующий оптимальный technical priority:

**P1.3 — Stronger flagship case-study format.**

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
- существующие quality gates не ослабляются ради feature/refactor;
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

Quality infrastructure P1.1:

`scripts/quality-harness/`

Она переиспользуется focused CI runners, но не определяет product/domain assertions вместо них.

Package identity contract P1.2:

`scripts/package-metadata.test.js`

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

Для flagship проектов есть structured timelines, architecture diagrams и Project Evidence integration.

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

Guard обнаруживает age/link/repository/release/timeline/signal drift и создаёт maintenance report/issue.

Ключевая trust boundary:

**Guard обнаруживает, но никогда автоматически не переписывает public truth или `verified / stale / unverified`.**

### 5.4 Grounded Engineering Notes — DONE

PR #25 / squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

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

P1.2 exact implementation head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

Build #296 / run `29954043887`:

**fully green по всей configured matrix**.

Особенно важно:

- `package-lock.json` не менялся;
- public content/CSS/data registries/routes не менялись;
- visual baselines и thresholds не менялись;
- Lighthouse budget/workflow ordering не менялись;
- metadata cleanup защищён unit contract, а не только документацией.

---

## 7. Известные незавершённые части / technical debt

### P1.3 — Flagship narrative depth — NEXT

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

### Versioning

`0.2.0` не считать product maturity indicator. Пока нет explicit package release contract, version не bump’ать механически.

### Отложено сознательно

- minimal RU/EN;
- privacy-friendly analytics;
- custom domain / paid hosting;
- richer architecture explorer.

---

## 8. Следующий оптимальный этап

### P1.3 — Stronger flagship case-study format

Следующий этап — улучшить narrative depth двух flagship case studies: LivingWorld и NODE ZERO.

Цель:

- сделать историю инженерных решений понятной человеку, а не только registry/evidence системе;
- раскрыть problem/constraints/decisions/failures;
- отделить narrative от machine-like current state;
- переиспользовать Project Evidence как factual/current layer, не дублировать его вручную;
- сохранить static-first authoring и существующие quality gates.

После P1.3:

1. additional grounded Notes после cross-repository source verification;
2. first real Photo Story при genuine material;
3. minimal EN / analytics / domain позже.

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
