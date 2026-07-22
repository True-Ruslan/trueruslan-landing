# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge PR #20.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## Portfolio v0.4 — Sources Registry / Knowledge Base

### Design gate

**PR #19 — `docs: design v0.4 Sources Registry knowledge base`**  
Merged: 2026-07-22  
Squash commit: `363c79c811748823184a795b8174378fc471f58d`

### Implementation

**PR #20 — `feat: build Sources Registry knowledge base`**  
Merged: 2026-07-22  
Squash commit: `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

### Зачем

Старая страница «Список изученных источников» была большой вручную поддерживаемой Markdown-таблицей.

Она сохраняла полезные материалы, но плохо масштабировалась:

- presentation markup одновременно был и data model;
- сложно было валидировать данные;
- фильтрация и связи требовали бы парсить таблицу;
- добавление metadata/date/related становилось хрупким;
- mobile presentation зависела от горизонтальной таблицы.

Цель v0.4 — превратить bibliography в публичную карту того, что реально изучается, не добавляя backend/CMS/database/runtime API.

### Архитектурное решение

Выбран уже доказавший себя паттерн проекта:

**canonical registry → strict validation → deterministic build-time generation → progressive enhancement**.

Создан единственный hand-maintained source of truth:

`data/sources.json`

Старая Markdown-таблица стала только migration input и после миграции была заменена коротким semantic intro + build-time injection target.

### Миграция

В canonical registry перенесены все **31 существующая реальная запись**.

При миграции:

- сохранены titles;
- сохранены URLs;
- сохранены summaries;
- legacy tags нормализованы только там, где это однозначно;
- созданы deterministic stable IDs;
- unknown dates/authors не выдумывались;
- one-time migration parser удалён после фиксации canonical JSON.

Migration contract теперь проверяет количество записей и representative URLs/content напрямую против `data/sources.json`.

### Strict validation

`scripts/sources-registry.js` проверяет:

- registry shape;
- unique kebab-case IDs;
- duplicate IDs;
- accidental duplicate URLs;
- только absolute `http/https` URLs;
- controlled `sourceType`;
- required `publisher`;
- non-empty topics;
- summary shape;
- ISO dates, если они присутствуют;
- unknown `related` IDs;
- self-relations.

Invalid registry deterministically ломает build вместо тихой публикации некорректного state.

### Build-time Knowledge Base

`copy-assets.js` теперь загружает Sources Registry как часть production post-processing и генерирует semantic knowledge-base content на существующем route:

`landing/bibliography.html`

Реализованы:

- compact source cards;
- topic counters;
- publisher/source type metadata;
- stable `#source-...` anchors;
- related-material model;
- native `<details>` для длинных summaries;
- deterministic ordering;
- responsive/mobile presentation.

### Progressive page-local UI

Добавлены:

- query filter;
- topic filter;
- source-type filter;
- clear-all;
- live result count;
- deep-link handling.

Search boundary зафиксирована отдельно:

**это только page-local filter по уже отрендеренным source records.**

Diplodoc local search остаётся единственным site-wide full-text engine. Второй индекс не создавался.

### No-JavaScript incident, обнаруженный во время реализации

Первый новый browser smoke обнаружил архитектурно важную проблему.

Хотя Sources content генерировался build-time, конкретный Diplodoc output хранил article HTML внутри `diplodoc-state`, а `<body>` содержал пустой React root.

При отключённом JavaScript:

- registry существовал в generated artifact;
- но пользователь не видел semantic content.

Это нарушало основной принцип проекта: core content не должен зависеть от hydration.

#### Исправление

Когда Knowledge Base инъектируется через `diplodoc-state`, build-time pipeline дополнительно создаёт semantic `<noscript>` fallback с тем же registry content.

Таким образом:

- обычный JS runtime не получает duplicate visible UI;
- при отключённом JS доступны все source records;
- runtime fetch не требуется;
- canonical data остаётся один.

Этот incident усилил static-first boundary проекта и дал reusable pattern для будущих knowledge features.

### QA evolution

Старый table-specific `bibliography-reveal-smoke.cjs` удалён только после появления более сильного replacement coverage.

Новый `sources-knowledge-base-smoke.cjs` проверяет:

- 31 rendered records;
- отсутствие legacy table;
- query filtering;
- topic filtering;
- source-type filtering;
- clear-all;
- hash deep links;
- mobile horizontal overflow;
- Axe serious/critical violations;
- JavaScript-disabled semantic content.

Generated bibliography HTML, logs и screenshots сохраняются в quality artifacts.

### TDD / failure evidence

Реализация шла через последовательные red/green gates:

- отсутствие registry module;
- validator/renderer contract;
- migration parser contract;
- canonical 31-record registry contract;
- `copy-assets` integration;
- real Diplodoc state injection;
- page-local filtering helpers;
- no-JS semantic boundary;
- browser smoke determinism.

Отдельно был исправлен flaky assertion самого smoke: тест перестал кликать нативный `<details>` как будто это custom application behavior и вместо этого проверяет корректный static DOM contract.

### Проверка

Exact implementation head:

`bd6d1cfce69b9ccff2d1f50622c2ca81f25f43e7`

**Build #223 прошёл полностью.**

Green gates:

- unit/contract tests;
- production docs build;
- generated-site integrity;
- mobile overflow;
- Chromium browser smoke;
- Axe;
- Lighthouse;
- Sources Knowledge Base smoke;
- Photo Stories smoke;
- Portfolio v0.3 smoke;
- Firefox/WebKit;
- local search smoke;
- metadata/OpenGraph;
- Engineering Map;
- visual regression.

Dedicated Sources evidence:

- sources: `31`;
- query `ClickHouse` → `1` visible result;
- topic `JPA` → `3`;
- source type `blog` → `1`;
- mobile overflow: `0`;
- serious/critical Axe violations: `0`;
- JavaScript-disabled records: `31`;
- no-JS overflow: `0`.

### Production caveat

Этот milestone подтверждён repository CI и generated artifacts.

Фактический GitHub Pages deployment после merge `4f4e8ff2...` в этом changelog отдельно не считается подтверждённым без post-deploy endpoint evidence.

---

## Photo Stories — личный визуальный архив как полноценная система

**PR #15 — `feat: build cinematic photo stories archive`**  
Merged: 2026-07-22  
Squash commit: `8aa2149fc8aec3751f2da73321c06a89111f9efd`

### Зачем

Старый раздел «Фото» был простой Markdown-страницей с тремя изображениями и заметно уступал остальному сайту.

Цель: сделать не соцсеть и не gallery grid, а личный визуальный дневник, где **одна история = один album**, а одиночные кадры остаются спокойным архивом.

### Что сделали

- canonical `/photos/`;
- `data/photo-albums.json` и `data/photo-archive.json`;
- chronological albums model;
- `/photos/<slug>/` pages;
- cinematic hero;
- editorial layouts `wide`, `portrait`, `pair`, `triptych`, `standard`;
- fullscreen lightbox;
- keyboard navigation / Esc;
- touch/swipe;
- focus restoration;
- hash deep links;
- progressive category filters;
- legacy `/landing/photos.html` bridge;
- navigation/search/sitemap/metadata/OG integration;
- build-time validation;
- dedicated browser smoke.

`photo-albums.json` намеренно оставлен пустым до появления первой настоящей связной фотосерии. Fake/demo albums не добавлялись.

### Проверка

Build #191 прошёл полный quality matrix.

---

## Post-merge Photo Stories QA polish

**PR #17 — `fix: polish Photo Stories mobile hero and QA evidence`**  
Merged: 2026-07-22  
Squash commit: `7936638bd6473ad4f1ff0b2ef42db2289e937d83`

### Что усилили

- browser assertion, что mobile hero title физически находится внутри viewport;
- ожидание загрузки всех трёх lazy archive images до screenshot evidence;
- geometry diagnostics.

Visual artifact подтвердил корректный 390px mobile viewport без title clipping; CSS change не добавлялся без необходимости.

Head PR прошёл Build #195.

---

## Bibliography disappearing table regression

**PR #14 — `fix: keep bibliography table visible after hydration`**  
Merged: 2026-07-22.

### Проблема

Старая bibliography table сначала появлялась, затем исчезала; fullscreen временно «лечил» симптом.

### Root cause

`setupReveal()` ставил высокий table element в `opacity: 0` и ждал `IntersectionObserver threshold: 0.08`.

При обычном viewport одновременно было видно меньше 8% всей огромной таблицы, поэтому observer никогда не переводил её в visible state. Fullscreen увеличивал intersection ratio.

### Исправление

- threshold → `0` с сохранением root margin;
- reveal больше не зависит от доли общей высоты элемента;
- browser regression test на normal viewport.

Позже v0.4 Sources Registry полностью убрал giant table как data/presentation model и заменил table-specific smoke более сильным Sources Knowledge Base/no-JS gate.

---

## Portfolio v0.3 — living engineering space

**PR #13 — `feat: evolve portfolio into a living engineering space`**  
Merged: 2026-07-22  
Squash commit: `b472aff67d69fb3cd6afa0577864371547f52a5b`

### Что сделали

#### Canonical Project Registry

- `data/projects.json` стал единственным hand-maintained project identity/status source;
- удалён дублирующий `currently-building.json`;
- homepage, `/now`, Projects и Engineering Map используют registry-derived state.

#### `/now`

- first-class page;
- active projects из registry;
- `data/now.json` хранит только focus/learning/writing.

#### Structured project timelines

- LivingWorld;
- NODE ZERO.

#### Engineering Notes maturity

- published/updated dates;
- reading time;
- tags;
- related/previous/next;
- deterministic Atom feed.

#### Command palette

- Cmd/Ctrl+K;
- `/` shortcut вне editable controls;
- destinations + handoff в существующий Diplodoc search.

### Архитектура

Без backend/CMS/database/runtime GitHub API/frontend framework.

После исправления visual baseline encoding Build #163 прошёл полностью.

---

# 2026-07-21

## Единый личный голос сайта

**PR #12 — `content: rewrite site in a personal engineering diary voice`**  
Merged: 2026-07-21.

Технически сайт был сильным, но часть текста звучала как product brochure/README.

Переписаны homepage, About, Projects/case studies, Map, Notes, Resume framing, Photos и Contacts.

Editorial principle:

- что я делаю;
- почему;
- что оказалось сложнее;
- какие решения принял;
- что доказано;
- что ещё не закончено.

---

# 2026-07-20 — основная трансформация проекта

## PR #1 — Production hardening foundation

- dev/prod post-processing parity;
- sitemap/post-processing tests;
- deploy only from `master`;
- hardened CI permissions/timeouts/checkout;
- nginx security/cache fixes.

Главный принцип: production build должен быть deterministic и тестируемым.

## PR #3 — Engineering portfolio visual redesign

- graphite/cyan/violet dark-first identity;
- custom CSS/JS через supported Diplodoc resources;
- sticky translucent navigation;
- responsive polish;
- engineering positioning;
- no animation framework/webfont/Diplodoc fork.

PR #2 был промежуточной redesign branch и не merged.

## PR #4 — Deployment-safe Resume PDF

- URL PDF вычисляется относительно actual page URL;
- safe iframe/download hydration;
- no-JS fallback;
- root + GitHub Pages subpath regression tests.

## PR #5 — Production quality gates + case studies

- generated-site integrity;
- broken refs checks;
- desktop/mobile browser smoke;
- network/page-error diagnostics;
- overflow;
- PDF verification;
- Axe;
- Lighthouse budgets;
- screenshots/reports;
- visual regression foundation;
- TaskHub/MiniChess/Godot case studies;
- first-class web-CV.

Quality budgets:

- Performance >= 85;
- Accessibility >= 95;
- Best Practices >= 95;
- SEO >= 95.

## PR #6 — Production reliability

- post-deploy Pages smoke;
- weekly endpoint monitoring;
- Firefox/WebKit compatibility;
- licensing/content-policy cleanup.

Важный принцип: CI green до deploy не равен подтверждённому production endpoint.

## PR #7 — Flagship projects + live project state

- первый structured active-project manifest;
- homepage active cards;
- LivingWorld flagship;
- NODE ZERO flagship;
- architecture SVG;
- Projects discovery.

## PR #8 — Engineering Notes + deterministic OpenGraph

- first-class Engineering Notes;
- первые grounded notes;
- `data/page-meta.json`;
- deterministic 1200×630 PNG renderer;
- canonical/OG/Twitter metadata;
- metadata browser smoke.

## PR #9 — Interactive Engineering Map

- `data/engineering-graph.json`;
- technologies/domains/projects/notes graph;
- strict validation;
- semantic fallback;
- progressive filters/highlighting;
- responsive UI;
- dedicated Axe/browser smoke.

## PR #10 — Restore discoverable search

После standalone homepage сам search engine не исчез, но пропала очевидная точка входа.

Вернули search в homepage/shared navigation без создания второго search engine.

## PR #11 — Search visual redesign

- search-specific CSS;
- progressive UI;
- semantic/accessibility improvements;
- keyboard UX;
- desktop/mobile/Axe/overflow smoke.

Diplodoc по-прежнему владеет index/query/results.

---

# Служебные PR

## PR #16

Случайный placeholder со старой squash-merged branch, сразу закрыт. Не является продуктовым milestone.

## PR #2

Первая redesign branch, не merged; чистая версия вошла через PR #3.

---

# Состояние после этого changelog

Завершены:

1. production/static-first foundation;
2. engineering portfolio redesign;
3. flagship cases + Project Registry;
4. `/now`;
5. Engineering Notes/Atom;
6. Engineering Map;
7. local search + command palette;
8. Photo Stories platform + QA polish;
9. Sources Registry / Knowledge Base.

Следующий главный продуктовый этап:

**Project Evidence Layer**.

После него:

- 3–5 новых grounded Engineering Notes;
- Content Freshness Guard;
- browser quality harness consolidation;
- metadata/version cleanup;
- richer flagship case studies;
- EN/analytics/domain — позже.

Первая настоящая Photo Story остаётся отдельной content-dependent задачей и не блокирует v0.4.

Подробный порядок: `docs/ROADMAP.md`.
