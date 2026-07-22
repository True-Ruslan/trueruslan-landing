# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-23**, после merge P1.4 Additional Grounded Engineering Notes PR #36.
>
> Главный durable snapshot для ответа на вопрос **«что сейчас представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
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

### Последний technical/content milestone

**P1.4 — Additional Grounded Engineering Notes**.

Feature PR #36:

`content: add grounded LLM protocol boundary note`

Squash commit:

`24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`

Exact implementation head:

`ced6ce0208d691fd891e8b8e1cf03be4c40465d5`

Verification:

**Build #308 / workflow run `29961571632`: fully green по полной configured matrix.**

TDD RED:

- exact head `380ed5e267b05eb4a2fad1b7019121c13c0f46f5`;
- Build #303 / run `29961363873`;
- `Test` ожидаемо упал после добавления нового обязательного slug в canonical Notes contract до production content;
- downstream build/browser gates были skipped.

### Что изменил P1.4

Добавлена седьмая Engineering Note:

`llm-output-is-a-protocol-boundary`

Публичный заголовок:

**«Почему успешный ответ LLM ещё не означает успешный контракт»**.

Главный engineering lesson:

**provider/transport success ≠ application contract success**.

Заметка разбирает structured LLM output как внешний protocol boundary:

- trailing tokens после почти корректного JSON;
- unknown fields/actions;
- неправильные scalar types;
- `null` вместо required domain values;
- отказ от permissive scalar/float coercion;
- strict schema + bounded domain validation;
- duplicate/conflicting actions;
- sanitized failure categories;
- valid parsed decision как proposal, а не authority;
- отдельные persistence policy и live action authorization gates;
- bounded deterministic fallback и восстановление следующего healthy turn.

### Source-verification boundary P1.4

Перед написанием note был отдельно проверен текущий private repository `True-Ruslan/minecraft-botics-ai`.

Grounded sources:

- `AiDecisionParser.java`;
- `AiDecisionParserTest.java`;
- `docs/ARCHITECTURE.md`;
- `docs/RC_E2E_RUNBOOK.md`.

Старый MCA fork, где исторически встречались ранние parser/provider incidents, в момент P1.4 не был доступен через connected GitHub source.

Поэтому публичная note **не выдаёт старые stack traces, release numbers, exact historical payloads или chronology за independently verified repository facts**.

Это намеренная evidence boundary, а не потеря контекста.

### Почему опубликована одна note, а не две

Кандидат про generic Minecraft NPC voice pipeline сознательно не опубликован.

Причина: существующая note `server-authoritative-ai-npcs` уже покрывает:

- session ownership;
- text/voice convergence;
- provider orchestration;
- cancellation;
- fallback;
- authority boundaries.

Вторая generic voice note сейчас создала бы смысловой дубль.

### Notes architecture после P1.4

Всего Engineering Notes: **7**.

Canonical metadata/relations:

`data/notes.json`

Authoring:

`docs/landing/notes/*.md`

Discovery/integration:

- `docs/landing/notes.md`;
- `docs/toc.yaml`;
- `data/page-meta.json`;
- existing build-derived Atom feed;
- Diplodoc search;
- sitemap;
- SEO/OpenGraph.

P1.4 не добавлял новый renderer/schema/CMS/backend/runtime source fetch/second search index.

Canonical content contract:

`scripts/notes-content.test.js`

Теперь он требует и `llm-output-is-a-protocol-boundary`.

### Предыдущий milestone — P1.3

**P1.3 — Stronger Flagship Case-Study Format**.

PR #34 / squash:

`107b69311f6eed408de5306406d9ff41f0e32ea2`

Exact head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

Build #301 / run `29958607263`: **fully green**.

LivingWorld и NODE ZERO используют общий Markdown-first narrative contract:

1. Problem
2. Constraints
3. Decisions
4. What failed / corrected assumptions
5. Current state
6. Evidence
7. What I would change now

Canonical project/timeline/evidence ownership при этом не дублируется в Markdown.

### Сейчас в разработке

P1.4 feature implementation завершена и смержена.

Следующий оптимальный actionable product/technical priority:

**P2.1 — Minimal RU/EN.**

Первая настоящая Photo Story остаётся **content-dependent/non-blocking** задачей: platform готова, fake/demo album добавлять нельзя.

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
- Diplodoc владеет единственным site-wide full-text search index;
- quality infrastructure не скрывает domain ownership;
- существующие quality gates не ослабляются ради feature/refactor;
- evidence не говорит больше, чем реально доказывает bounded `scope`.

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

Quality shared infrastructure:

`scripts/quality-harness/`

Maintenance freshness tooling:

- `scripts/content-freshness.js`;
- `scripts/content-freshness-report.js`;
- `scripts/content-freshness-probe.js`;
- `.github/workflows/content-freshness.yml`.

Maintenance signals не владеют canonical public truth.

---

## 5. Реализованные milestones

### P0 — foundation

- **P0.1 Photo Stories platform — DONE**: PR #15 + QA PR #17.
- **P0.2 First real Photo Story — CONTENT DEPENDENT**.
- **P0.3 Sources Registry / Knowledge Base — DONE**: PR #20, squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.
- **P0.4 Project Evidence Layer — DONE**: PR #22, squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`, Build #247.
- **P0.5 Grounded Engineering Notes — DONE**: PR #25, squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.
- **P0.6 Content Freshness Guard — DONE**: PR #27, squash `33770983789fbde5c59a94972709360286a06ad5`, Build #269.

### P1 — maintainability и depth

- **P1.1 Consolidated Browser Quality Harness — DONE**: PR #29, squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.
- **P1.2 Project Metadata Cleanup — DONE**: PR #31, squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.
- **P1.3 Stronger Flagship Case-Study Format — DONE**: PR #34, squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.
- **P1.4 Additional Grounded Engineering Notes — DONE**: PR #36, squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`, Build #308.

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

Latest feature exact head:

`ced6ce0208d691fd891e8b8e1cf03be4c40465d5`

Build #308 / run `29961571632`:

**fully green по всей configured matrix**.

P1.4 не менял:

- CSS;
- renderer/build architecture;
- visual baselines/thresholds;
- Lighthouse budgets;
- CI workflow ordering.

---

## 7. Известные незавершённые части / technical debt

### P2.1 — Minimal RU/EN — NEXT

Не переводить весь сайт сразу.

Первый слой должен быть маленьким и продуктово полезным:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Перед реализацией нужен отдельный design для URL/language routing, canonical/hreflang, authoring ownership, search и fallback semantics.

Критическая граница: **не создать два вручную расходящихся сайта и не дублировать machine-like registries без необходимости**.

### Content-dependent

Первая настоящая Photo Story отсутствует. Platform готова; fake/demo album не добавлять.

### Operational caveats

- фактический GitHub Pages deployment после последних merges отдельно не подтверждён этим snapshot;
- первый реальный post-merge Content Freshness scheduled/manual run отдельно не подтверждён этим snapshot.

Не считать эти operational facts автоматически доказанными только из merge/CI.

### Versioning

`version: 0.2.0` не является product maturity indicator.

Пока нет explicit package release contract, version не bump’ать механически.

### Отложено сознательно

- privacy-friendly analytics;
- custom domain / paid hosting;
- richer architecture explorer.

---

## 8. Следующий оптимальный этап

### P2.1 — Minimal RU/EN

Цель следующего milestone — дать англоязычному читателю небольшой, качественный вход в лучшие части portfolio, не превращая перевод в отдельную CMS/second site.

Перед implementation нужно определить:

1. URL strategy и default language;
2. canonical/hreflang semantics;
3. какие данные общие, а какой prose language-specific;
4. как не дублировать project/evidence registries;
5. search behavior для RU/EN;
6. language switcher + no-JS behavior;
7. exact initial page scope;
8. QA/SEO contracts.

После P2.1:

1. privacy-friendly analytics — только при чётком product-useful signal design;
2. custom domain/hosting — только при реальной необходимости;
3. richer architecture explorer — только при достаточном количестве реальных artifacts;
4. first real Photo Story — когда появится genuine material, независимо от технического roadmap.

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
- giant monolithic QA runner;
- декоративный version bump без release semantics;
- полный дублирующий EN-site, который вручную расходится с RU canonical data.

Предпочитать:

- version-controlled registries;
- deterministic build-time generation;
- semantic/no-JS content;
- progressive vanilla JS;
- bounded evidence;
- modular shared infrastructure + focused domain tests.

---

## 10. Как восстановить контекст в новом чате

Оптимальный запрос:

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

State-файл — snapshot.

Всегда дополнительно проверять:

- open PR;
- latest commits;
- latest exact-head CI;
- latest Content Freshness workflow runs/issues, если вопрос касается freshness monitoring;
- actual production deployment, если вопрос касается production.
