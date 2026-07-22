# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge P0.6 Content Freshness Guard PR #27.
>
> Главный durable snapshot для ответа на вопрос **«что сейчас представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
>
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> После этого всегда дополнительно проверять actual open PR, latest commits и exact-head CI. Public production deployment и первый реальный maintenance-workflow run проверять отдельно.

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
- production-oriented CI, accessibility, browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — от первого лица: спокойный инженерный дневник, без корпоративного маркетинга, fake demos и неподтверждённых claims.

---

## 2. Текущее состояние `master`

### Последний technical milestone

**P0.6 — Content Freshness Guard**.

PR #27:

`feat: add Content Freshness Guard`

Squash commit:

`33770983789fbde5c59a94972709360286a06ad5`

Exact implementation head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Verification:

**Build #269 / workflow run `29947803201`: fully green по полной configured matrix.**

P0.6 добавил отдельный maintenance-layer поверх Project Registry + Project Evidence:

- deterministic pure detector `scripts/content-freshness.js`;
- configurable `lastVerified` age rule, default 30 days;
- evidence-link reachability diagnostics;
- repository activity/release drift diagnostics;
- structured timeline/current-state diagnostics;
- verified-signal chronology diagnostics;
- local JSON + Markdown report command;
- bounded GitHub/HTTP external probe;
- daily + manual GitHub Actions workflow;
- idempotent create/update/close одного actionable GitHub issue;
- report/observation artifacts.

Ключевая trust boundary:

**Freshness Guard обнаруживает, но не переписывает public truth.**

Он никогда автоматически:

- не меняет `data/projects.json`;
- не меняет `data/project-evidence.json`;
- не меняет timelines;
- не переводит `verified / stale / unverified`;
- не трактует green CI/release/repository activity как full product verification.

Workflow permissions:

- `contents: read`;
- `issues: write`;
- checkout `persist-credentials: false`;
- нет `git commit` / `git push` path.

### Operational caveat P0.6

Implementation и workflow contract подтверждены exact-head CI.

**Первый фактический post-merge scheduled/manual execution `.github/workflows/content-freshness.yml` отдельно ещё не считается наблюдённым в этом snapshot.**

Не утверждать, что issue create/update/close уже выполнялся в production, пока нет конкретного workflow run evidence.

### Предыдущий product milestone

**P0.5 — Grounded Engineering Notes**, PR #25.

Squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`: **fully green**.

Добавлено 3 repository-grounded notes, всего Engineering Notes стало 6.

### Предыдущий architecture milestone

**Portfolio v0.4 — Project Evidence Layer**, PR #22.

Squash:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

### Сейчас в разработке

После merge PR #27 active feature implementation PR должен отсутствовать; проверять runtime state отдельно.

Следующий оптимальный technical priority:

**P1.1 — Consolidated Browser Quality Harness.**

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
- существующие quality gates не ослабляются ради новой feature;
- evidence не говорит больше, чем реально доказывает его bounded `scope`.

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

Maintenance tooling P0.6 находится **вне core public site runtime/build truth**:

- `scripts/content-freshness.js`;
- `scripts/content-freshness-report.js`;
- `scripts/content-freshness-probe.js`;
- `.github/workflows/content-freshness.yml`.

`npm run check:freshness` создаёт deterministic JSON/Markdown maintenance report.

`npm run probe:freshness` собирает bounded external observations.

---

## 5. Реализованные продуктовые системы

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

Canonical source:

`data/project-evidence.json`

Controlled scope сейчас:

- `livingworld`;
- `node-zero`.

Trust states:

- `verified`;
- `stale`;
- `unverified`.

Каждый signal хранит bounded scope и distinction automated/manual.

Green CI/release/PR не может автоматически сделать project `verified`.

Core evidence имеет semantic no-JS fallback и не требует runtime fetch.

Initial trust snapshots:

- LivingWorld — `verified`, `lastVerified = 2026-07-22` с bounded scope;
- NODE ZERO — `stale`, last fully verified foundation gate `2026-07-14`.

### 5.3 Content Freshness Guard — DONE

Design:

`docs/superpowers/specs/2026-07-22-content-freshness-guard-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-content-freshness-guard.md`

Deterministic findings включают:

- `evidence-too-old`;
- `evidence-link-unreachable`;
- `repository-drift`;
- `release-candidate-has-new-release`;
- `timeline-missing` / `timeline-current-count`;
- `verified-signal-after-check`.

Важно:

- exact 30-day boundary остаётся clean; finding появляется после threshold;
- stale/unverified valid states сами по себе не ошибка;
- guard не требует evidence snapshot для каждого project, потому что Evidence Layer имеет намеренно ограниченный controlled scope;
- network/repository observations не превращаются в automatic public claims.

TDD history:

- Build #259 — detector contract RED;
- Build #260 — detector GREEN;
- Build #261/#262 — probe/report contracts RED;
- Build #265 — probe/report GREEN;
- Build #266 — workflow safety contract RED;
- Build #267 — workflow contract GREEN;
- Build #269 — final exact-head full matrix GREEN.

### 5.4 Sources Registry / Knowledge Base — DONE

PR #20 / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Есть 31 migrated real records, strict validation, deterministic semantic rendering, page-local query/topic/type filters, stable anchors, related materials, responsive UI и semantic no-JS fallback.

Sources filtering не является вторым site-wide search engine.

### 5.5 Photo Stories — PLATFORM DONE

- PR #15 — platform;
- PR #17 — post-merge QA polish.

Есть canonical `/photos/`, album/archive registries, cinematic story routes, fullscreen lightbox, keyboard/touch/hash navigation, filters, sitemap/search/metadata integration и browser smoke.

`photo-albums.json` намеренно пуст до первой genuine связной серии.

### 5.6 Engineering Notes — P0.5 DONE

Canonical metadata:

`data/notes.json`

Опубликовано 6 notes.

P0.5 добавил:

- `intersection-observer-giant-table`;
- `static-first-sources-no-js`;
- `green-ci-is-not-product-verification`.

Работают metadata/relations, previous/next, Atom feed, TOC/search/sitemap discovery и per-page SEO/OpenGraph.

### 5.7 `/now`, Engineering Map, Search, Resume/SEO

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

## 6. Quality gates и доказательства

Проект проверяет final generated artifact, а не только source code.

Основная Build matrix:

- `npm test`;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser smoke;
- Axe;
- Lighthouse;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality evidence upload.

### P0.6 exact verification

Exact head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Build #269 / run `29947803201`:

**fully green по всей configured matrix**.

Workflow security contract отдельно проверяет:

- schedule + `workflow_dispatch`;
- `contents: read`;
- `issues: write`;
- отсутствие `contents: write`;
- отсутствие `git commit/push`;
- report/probe wiring;
- artifact output;
- stable issue marker и close path.

---

## 7. Известные незавершённые части / technical debt

### P1 — Quality architecture

Browser QA состоит из нескольких focused runners.

Повторяются primitives:

- static server lifecycle;
- browser/context setup;
- request/page-error diagnostics;
- Axe helpers;
- overflow helpers;
- screenshot/evidence helpers.

Нужен модульный `quality-harness/`, **не giant monolithic runner**.

### Metadata debt

`package.json` требует отдельной осознанной cleanup-задачи:

- version историческая;
- description всё ещё говорит «лендинг»;
- keywords нужно пересмотреть после расширения platform scope.

Версию менять только как explicit milestone/release decision.

### Flagship narrative debt

LivingWorld и NODE ZERO постепенно привести к структуре:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

### Content follow-ups

Дополнительные grounded Notes candidates после отдельной source verification:

- voice AI pipeline Minecraft NPC;
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

### P1.1 — Consolidated Browser Quality Harness

Следующий шаг — убрать duplication внутри уже зрелого quality suite, не меняя product behavior и не ослабляя gates.

Создать модульный `quality-harness/` с shared primitives:

- static server lifecycle;
- browser/context factories;
- request/page-error diagnostics;
- Axe helpers;
- overflow helpers;
- screenshot/evidence helpers;
- declarative route/scenario definitions.

Не превращать suite в один giant runner.

После P1.1:

1. metadata/version cleanup;
2. stronger flagship case-study structure;
3. additional grounded Notes после source verification;
4. first real Photo Story при genuine material;
5. minimal EN / analytics / domain позже.

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
- automatic mutation of trust/public project state из maintenance signals.

Предпочитать:

- version-controlled registries;
- deterministic build-time generation;
- semantic/no-JS content;
- progressive vanilla JS;
- bounded evidence;
- maintenance findings вместо automatic truth mutation.

---

## 10. Production caveats

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
