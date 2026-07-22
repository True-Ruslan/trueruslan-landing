# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge PR #20.
>
> Главный источник ответа на вопрос **«что сейчас представляет собой проект и в каком он состоянии?»**.
> Для восстановления контекста нового чата читать:
>
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Это уже не обычный landing page. Проект объединяет:

- лёгкую standalone-главную;
- knowledge pages на Diplodoc;
- web-CV;
- реальные project case studies;
- страницу `/now`;
- Engineering Notes + Atom feed;
- Engineering Map;
- локальный полнотекстовый поиск;
- Cmd/Ctrl+K command palette;
- Photo Stories / личный визуальный архив;
- Sources Knowledge Base;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — от первого лица: спокойный инженерный дневник, без корпоративного маркетинга и fake claims.

---

## 2. Текущее состояние `master`

### Последний крупный milestone

**Portfolio v0.4 — Knowledge & Evidence: Sources Registry / Knowledge Base**.

Merged через PR #20:

- `feat: build Sources Registry knowledge base`
- squash commit: `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Перед merge exact PR head `bd6d1cfce69b9ccff2d1f50622c2ca81f25f43e7` полностью прошёл **Build #223**.

### Непосредственно перед ним

- PR #17 — Photo Stories post-merge QA polish;
  - merged commit `7936638bd6473ad4f1ff0b2ef42db2289e937d83`;
- PR #19 — approved design Sources Registry / Knowledge Base;
  - merged commit `363c79c811748823184a795b8174378fc471f58d`;
- PR #20 — Sources Registry implementation;
  - merged commit `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.

### Сейчас в разработке

После merge PR #20 отдельного feature implementation PR в работе нет.

Следующий приоритет по roadmap: **Project Evidence Layer**.

Первая настоящая Photo Story остаётся контент-зависимой задачей и не блокирует развитие v0.4.

---

## 3. Архитектурные принципы

Ключевая граница проекта:

**static-first + build-time intelligence + progressive enhancement**.

Без отдельного нового design decision нельзя ломать следующие правила:

- core content должен быть доступен без runtime API;
- JavaScript улучшает UX, но не является единственным источником содержания;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для базового public content;
- один canonical source of truth на сущность;
- deterministic build-time generation;
- semantic HTML;
- progressive vanilla JS;
- существующие quality gates не ослабляются ради новой feature.

---

## 4. Основные части системы

### 4.1 Standalone homepage

`templates/index.html`

Корневая страница не тянет тяжёлый Diplodoc/React viewer runtime.

Она build-time получает project state из canonical registry и использует собственный лёгкий визуальный слой.

### 4.2 Diplodoc knowledge pages

`docs/landing/**/*.md`

Здесь находятся:

- About;
- Projects;
- Resume;
- `/now`;
- Engineering Notes;
- Engineering Map;
- Sources;
- Contacts и другие структурированные страницы.

Diplodoc остаётся владельцем site-wide local full-text search index.

### 4.3 Canonical data

Основные version-controlled registries:

- `data/projects.json` — identity/status/summary/links/tags проектов;
- `data/project-history/*.json` — structured flagship timelines;
- `data/now.json` — focus/learning/writing без дублирования project state;
- `data/notes.json` — Engineering Notes metadata/relations;
- `data/engineering-graph.json` — Engineering Map;
- `data/page-meta.json` — SEO/social metadata;
- `data/photo-albums.json` — Photo Stories albums;
- `data/photo-archive.json` — одиночный photo archive;
- `data/sources.json` — Sources Knowledge Base;
- `data/external-links.json` — public endpoints для monitoring.

### 4.4 Build-time post-processing

Главный orchestrator — `scripts/copy-assets.js` плюс focused modules.

Pipeline:

1. нормализует assets и search;
2. генерирует standalone homepage;
3. валидирует Project Registry и инъектирует project state;
4. собирает `/now`;
5. генерирует project timelines;
6. дополняет Engineering Notes и строит Atom feed;
7. валидирует и генерирует Sources Knowledge Base;
8. строит Photo Stories routes;
9. инъектирует Engineering Map;
10. генерирует deterministic OpenGraph PNG;
11. инъектирует metadata/JSON-LD;
12. создаёт sitemap/robots/.nojekyll;
13. запускает generated-site integrity checks.

---

## 5. Что уже реализовано

### 5.1 Visual/content foundation

- graphite/cyan/violet dark-first identity;
- standalone homepage;
- responsive layout;
- keyboard focus;
- `prefers-reduced-motion`;
- progressive reveal/interactions;
- единый спокойный first-person engineering voice.

### 5.2 Projects

- Projects hub;
- canonical `data/projects.json`;
- LivingWorld flagship case study;
- NODE ZERO flagship case study;
- TaskHub;
- MiniChess;
- Godot Atmospheric Horror Template;
- registry-derived project status badges;
- structured LivingWorld/NODE ZERO timelines;
- engineering SVG diagrams.

### 5.3 `/now`

- active projects/statuses из Project Registry;
- focus/learning/writing из `data/now.json`;
- project state вручную не дублируется.

### 5.4 Engineering Notes

Реализованы:

- dates;
- reading time;
- tags;
- related notes;
- previous/next;
- deterministic `feed.xml`.

Базовые опубликованные заметки включают:

- runtime boundary standalone landing vs Diplodoc;
- quality gates статического engineering site;
- server-authoritative AI NPC architecture.

### 5.5 Engineering Map

- technologies → domains → projects → notes;
- strict validation;
- semantic fallback;
- filters/highlighting;
- responsive presentation;
- dedicated Axe/browser QA.

### 5.6 Search/navigation

- Diplodoc local search — единственный site-wide full-text engine;
- search page стилизована под проект;
- explicit navigation;
- Cmd/Ctrl+K command palette;
- command palette не создаёт второй search index.

### 5.7 Resume

- first-class web-CV;
- deployment-safe embedded PDF;
- fallback/download;
- root-domain + GitHub Pages subpath compatibility.

### 5.8 SEO/sharing

- sitemap;
- robots;
- canonical URLs;
- title/description;
- OpenGraph/Twitter;
- JSON-LD;
- deterministic 1200×630 social cards без внешнего image service.

### 5.9 Photo Stories

Полноценная static-first фотоархитектура:

- canonical `/photos/`;
- `data/photo-albums.json`;
- `data/photo-archive.json`;
- `/photos/<slug>/`;
- cinematic hero;
- layouts `wide`, `portrait`, `pair`, `triptych`, `standard`;
- fullscreen lightbox;
- keyboard navigation;
- touch/swipe;
- focus restoration;
- hash deep links;
- filters;
- legacy `/landing/photos.html` compatibility;
- sitemap/search/metadata integration;
- build-time validation;
- browser smoke.

`photo-albums.json` намеренно остаётся пустым до появления первой настоящей связной фотосерии.

Реальные одиночные кадры остаются в «Из архива».

### 5.10 Sources Registry / Knowledge Base

Реализовано в PR #20.

Canonical source of truth:

`data/sources.json`

Туда без потери исходного набора перенесены **31 существующая запись** старой bibliography table.

#### Data contract

Strict build-time validation проверяет:

- registry shape;
- unique stable kebab-case IDs;
- duplicate IDs/URLs;
- absolute `http/https` URLs;
- controlled `sourceType`;
- required publisher/topics/summary;
- ISO dates, если они указаны;
- `related` references;
- self-relations.

Неизвестные dates/authors при миграции не выдумывались.

#### Build-time rendering

`scripts/sources-registry.js`:

- загружает registry;
- валидирует;
- детерминированно сортирует;
- генерирует semantic knowledge-base HTML;
- инъектирует его в существующий `landing/bibliography.html`.

Bibliography Markdown больше не хранит огромную hand-maintained таблицу — это semantic intro/injection shell.

#### UI

Есть:

- compact source cards;
- topic counters;
- page-local query filtering;
- topic filter;
- source-type filter;
- clear-all;
- result count;
- stable `#source-...` deep links;
- native `<details>` для длинных summaries;
- responsive/mobile layout.

#### Важная search boundary

Sources search — **только page-local filter над уже отрендеренными records**.

Он не является вторым site-wide full-text engine.

Diplodoc local search остаётся единственным global search index.

#### No-JavaScript boundary

Во время реализации обнаружилось, что Diplodoc generated page может хранить article content только внутри hydration state.

Чтобы выполнить static-first contract, build-time pipeline добавляет semantic `<noscript>` fallback с тем же registry content, когда Sources Knowledge Base была инъектирована через `diplodoc-state`.

При обычном JS fallback не дублирует runtime UI.

При отключённом JS доступны все 31 source record.

---

## 6. Quality gates и evidence

Проект проверяет финальный generated artifact, а не только source code.

Основные gates:

- `npm test`;
- production Diplodoc build;
- generated-site integrity;
- broken local links/assets/OG checks;
- mobile overflow;
- Chromium browser smoke;
- Axe accessibility;
- Lighthouse budgets;
- Firefox/WebKit compatibility;
- local search browser smoke;
- metadata/OpenGraph smoke;
- Engineering Map smoke;
- Photo Stories smoke;
- Sources Knowledge Base smoke;
- visual regression;
- post-deploy Pages smoke;
- scheduled external/public endpoint monitoring.

### Sources milestone verification

Exact implementation head:

`bd6d1cfce69b9ccff2d1f50622c2ca81f25f43e7`

**Build #223: success.**

В нём green:

- tests;
- production build;
- site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources Knowledge Base smoke;
- Photo Stories;
- Portfolio v0.3 smoke;
- Firefox/WebKit;
- local search;
- metadata/OG;
- Engineering Map;
- visual regression.

Dedicated Sources evidence на verified implementation candidate:

- sources: `31`;
- query `ClickHouse` → `1` visible result;
- topic `JPA` → `3`;
- type `blog` → `1`;
- mobile horizontal overflow: `0`;
- serious/critical Axe violations: `0`;
- JavaScript-disabled sources: `31`;
- no-JS horizontal overflow: `0`.

### Production caveat

Repository/build artifact подтверждён CI.

**Фактический GitHub Pages deployment после merge `4f4e8ff2...` отдельно не подтверждён в этом snapshot.**

Не считать production автоматически синхронизированным с `master`, пока это не подтверждено post-deploy smoke или ручной проверкой endpoint.

---

## 7. Известные незавершённые части / technical debt

### P0 / product

1. **Project Evidence Layer** ещё не реализован.
2. **Content Freshness Guard** ещё не реализован.
3. Engineering Notes пока мало относительно объёма реальных incidents.
4. Нет первой настоящей Photo Story — архитектура готова, контент должен быть реальной связной серией.

### Quality architecture

Browser QA исторически состоит из нескольких runner scripts.

Нужен общий модульный `quality-harness/`:

- shared static server lifecycle;
- browser/context factories;
- request/page-error diagnostics;
- overflow/assertion helpers;
- Axe helpers;
- screenshot/evidence helpers;
- declarative scenarios.

Не делать один giant runner.

### Metadata debt

`package.json` исторически всё ещё требует осознанной cleanup-задачи:

- version не отражает текущий milestone;
- description должен описывать engineering portfolio / knowledge platform, а не старый multi-page landing.

### Отложено сознательно

- custom domain/paid hosting;
- privacy-friendly analytics;
- partial RU/EN;
- richer architecture explorer.

---

## 8. Следующий оптимальный этап

### P0.4 Project Evidence Layer

Теперь, когда Sources Registry реализован, следующий главный шаг v0.4 — сделать project claims доказуемыми.

Предлагаемая validated сущность:

`data/project-evidence.json`

или отдельный evidence layer, связанный с Project Registry.

Для flagship projects хранить controlled snapshot:

- `lastVerified`;
- verified version/protocol;
- latest known release;
- last green CI/build;
- relevant PR/release/workflow links;
- verification status;
- что доказано автоматически;
- что требует manual acceptance.

Без runtime GitHub API.

После Evidence Layer:

1. 3–5 grounded Engineering Notes из реальных incidents;
2. Content Freshness Guard;
3. consolidated browser quality harness;
4. metadata/version cleanup;
5. richer flagship case-study format;
6. minimal EN / analytics / domain позже.

---

## 9. Архитектурные решения, которые считаются намеренными

Без нового design decision не добавлять:

- backend;
- CMS;
- database;
- runtime GitHub API;
- frontend framework ради framework;
- runtime content fetch для core content;
- второй site-wide full-text search engine;
- likes/comments/accounts;
- AI chat поверх резюме как gimmick.

Предпочитать:

- version-controlled registries;
- deterministic build-time generation;
- semantic/no-JS content;
- progressive vanilla JS;
- evidence вместо декоративных claims.

---

## 10. Как восстановить контекст в новом чате

Оптимальный запрос:

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

State-файл — snapshot на дату обновления.

Для текущего состояния всегда дополнительно проверять:

- open PR;
- latest commits;
- latest exact-head CI;
- actual production deployment, если вопрос касается production.
