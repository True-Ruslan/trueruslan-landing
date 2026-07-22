# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge P1.3 Stronger Flagship Case-Study Format PR #34.
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

### Последний technical/product milestone

**P1.3 — Stronger Flagship Case-Study Format**.

PR #34:

`content: strengthen flagship case-study narratives`

Squash commit:

`107b69311f6eed408de5306406d9ff41f0e32ea2`

Exact implementation head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

Verification:

**Build #301 / workflow run `29958607263`: fully green по полной configured matrix.**

### Что изменил P1.3

Два flagship case studies — **LivingWorld** и **NODE ZERO** — переведены на общий Markdown-first narrative contract:

1. Problem
2. Constraints
3. Decisions
4. What failed / corrected assumptions
5. Current state
6. Evidence
7. What I would change now

Это не новый renderer или schema. Обычный Diplodoc Markdown остаётся authoring layer для человеческого narrative.

Canonical ownership сохранён:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — structured evolution timeline;
- `data/project-evidence.json` — trust/current verification facts;
- Markdown — reasoning, trade-offs, failures/false starts и retrospective.

### LivingWorld после P1.3

Страница теперь явно объясняет:

- почему задача оказалась не «подключить LLM», а построить server-authoritative conversation system;
- session ownership, provider degradation, cancellation, persistent memory и action-authority constraints;
- почему text/voice сходятся в один conversation core;
- почему LLM output не является authority;
- почему transcript не равен устойчивой модели памяти;
- почему partial failure и cancellation являются частью normal control flow;
- что broadly находится на local release-candidate границе, не дублируя machine-like trust facts;
- что бы я проектировал раньше, начиная систему заново.

Architecture/request-lifecycle diagrams, timeline и Project Evidence integration сохранены.

### NODE ZERO после P1.3

Страница теперь явно объясняет:

- почему MIRROR должна менять context/constraints, а не быть разговаривающим «злым AI»;
- почему vertical slice важнее раннего расширения объекта;
- no-combat, authored pacing, reusable-system boundaries, proprietary/public boundary и asset provenance constraints;
- риск построить data-center simulator вместо игры;
- риск протащить one-off narrative logic в фундаментальные gameplay systems;
- когда procedural complexity хуже authored sequence;
- почему documentation/agent output не заменяют executable validation;
- что бы я зафиксировал раньше при повторном старте проекта.

Architecture/system-flow diagrams, timeline и Project Evidence integration сохранены.

### Structural contract

Добавлен:

`scripts/flagship-case-study.test.js`

Он защищает для controlled flagship set `livingworld`, `node-zero`:

- семь `case-study:*` markers ровно по одному разу;
- canonical marker order;
- timeline placeholder ровно один раз;
- Project Evidence placeholder ровно один раз;
- architecture diagram сохранён ровно один раз.

Тест защищает структуру и source-of-truth boundaries, но не замораживает конкретную формулировку prose.

### TDD trail

- Build #299 / run `29958395678` — ожидаемый RED до миграции страниц;
- Build #300 / run `29958496645` — ожидаемый промежуточный RED после миграции только LivingWorld;
- Build #301 / run `29958607263` — обе страницы мигрированы, полный exact-head matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-22-flagship-case-study-format-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-flagship-case-study-format.md`

### Что P1.3 сознательно НЕ изменил

- `data/projects.json`;
- `data/project-history/*.json`;
- `data/project-evidence.json`;
- CSS;
- build/postprocess renderers;
- routes;
- visual baselines/thresholds;
- Lighthouse budget;
- CI workflow ordering.

Новый универсальный case-study engine не создан: для двух flagship pages это был бы YAGNI и новый слой authoring complexity.

### Сейчас в разработке

P1.3 feature implementation завершена и смержена.

Следующий оптимальный technical/content priority:

**P1.4 — Additional grounded Engineering Notes.**

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
- evidence не говорит больше, чем реально доказывает bounded `scope`;
- narrative не дублирует machine-like current/trust facts, если ими уже владеет canonical registry.

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

Maintenance tooling P0.6:

- `scripts/content-freshness.js`;
- `scripts/content-freshness-report.js`;
- `scripts/content-freshness-probe.js`;
- `.github/workflows/content-freshness.yml`.

Quality infrastructure P1.1:

`scripts/quality-harness/`

Package identity contract P1.2:

`scripts/package-metadata.test.js`

Flagship narrative contract P1.3:

`scripts/flagship-case-study.test.js`

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

LivingWorld и NODE ZERO — controlled flagships с:

- shared seven-part narrative contract;
- structured timelines;
- architecture diagrams;
- Project Evidence integration.

### 5.2 Project Evidence Layer — DONE

PR #22 / squash:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

Controlled snapshot states:

- `verified`;
- `stale`;
- `unverified`.

Green CI/release/PR никогда автоматически не делает project `verified`.

### 5.3 Content Freshness Guard — DONE

PR #27 / squash:

`33770983789fbde5c59a94972709360286a06ad5`

Build #269 / run `29947803201`: **fully green**.

Guard обнаруживает age/link/repository/release/timeline/signal drift и создаёт maintenance report/issue.

**Guard обнаруживает, но никогда автоматически не переписывает public truth или trust state.**

### 5.4 Grounded Engineering Notes — DONE foundation

PR #25 / squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Build #257 / run `29943616448`: **fully green**.

Всего опубликовано 6 Engineering Notes. P0.5 добавил:

- `intersection-observer-giant-table`;
- `static-first-sources-no-js`;
- `green-ci-is-not-product-verification`.

Следующий content milestone P1.4 должен добавлять только новые repository-grounded notes после отдельной source verification.

### 5.5 Sources Registry / Knowledge Base — DONE

PR #20 / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

31 real records, strict validation, deterministic semantic rendering, page-local filtering, stable anchors/related materials, responsive UI и semantic no-JS fallback.

Sources filtering не является вторым site-wide search engine.

### 5.6 Photo Stories — PLATFORM DONE

- PR #15 — main platform;
- PR #17 — QA polish.

Есть canonical `/photos/`, album/archive registries, story routes, cinematic/editorial layouts, fullscreen lightbox, keyboard/touch/hash navigation, sitemap/search/metadata integration и dedicated browser smoke.

`photo-albums.json` намеренно пуст до первой genuine связной серии. Fake/demo albums не добавлять.

### 5.7 `/now`, Engineering Map, Search, Resume/SEO — DONE

Реализованы `/now`, Engineering Map, Diplodoc local search, styled search page, command palette, web-CV, sitemap/robots/canonical, OpenGraph/Twitter, JSON-LD и deterministic social cards.

### 5.8 Maintainability milestones — DONE

P1.1 Consolidated Browser Quality Harness:

- PR #29 / squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`;
- Build #293 / run `29951464481` fully green.

P1.2 Project Metadata Cleanup:

- PR #31 / squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`;
- Build #296 / run `29954043887` fully green;
- package marked `private: true`;
- description/keywords/canonical URLs aligned;
- `version: 0.2.0` deliberately retained until a real package release contract exists.

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

P1.3 exact implementation head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

Build #301 / run `29958607263`:

**fully green по всей configured matrix**.

Особенно важно:

- generated-site integrity прошёл после крупной Markdown restructuring;
- Project Evidence injection/smoke остались green;
- Portfolio v0.3 regression остался green;
- Firefox/WebKit compatibility green;
- search/meta/Engineering Map green;
- visual regression green без baseline update.

---

## 7. Известные незавершённые части / technical debt

### P1.4 — Additional grounded Engineering Notes — NEXT

Новые notes писать только после source verification соответствующих repositories/commits/issues/PRs.

Сильные candidates:

- malformed / almost-correct LLM JSON как protocol failure class;
- Minecraft NPC voice pipeline — только если новая note не дублирует уже существующую `server-authoritative-ai-npcs`.

Не писать абстрактные SEO-статьи ради количества.

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

### P1.4 — Additional grounded Engineering Notes

Оптимальная последовательность:

1. проверить исходные repositories и найти 1–2 действительно сильных, подтверждаемых инженерных incident/decision narratives;
2. проверить, что новая тема не дублирует существующие 6 notes;
3. выбрать только те истории, где есть реальный failure/constraint/decision/takeaway;
4. добавить Markdown + canonical `data/notes.json` metadata/relations;
5. сохранить Atom/search/SEO integration через существующую architecture;
6. прогнать content contract и полную exact-head CI matrix.

Первый кандидат для проверки — **malformed / almost-correct LLM JSON как protocol boundary problem**, потому что он потенциально даёт отдельный инженерный урок и меньше пересекается с уже опубликованной server-authoritative AI NPC note.

После P1.4:

1. first real Photo Story при genuine material;
2. minimal EN / analytics / domain позже;
3. richer architecture explorer только при достаточном количестве реальных artifacts.

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
- giant monolithic QA runner, скрывающий domain ownership;
- универсальный case-study engine без достаточного repeated need;
- декоративные version bumps без release semantics.

Предпочитать:

- version-controlled registries;
- deterministic build-time generation;
- semantic/no-JS content;
- progressive vanilla JS;
- bounded evidence;
- ordinary Markdown для long-form narrative;
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
