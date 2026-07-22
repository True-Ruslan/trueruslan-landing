# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge PR #22.
>
> Главный источник ответа на вопрос **«что сейчас представляет собой проект и в каком он состоянии?»**.
> Для восстановления контекста нового чата читать:
>
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> После чтения файлов всегда дополнительно проверять актуальные commits, open PR и CI: state-файл — durable snapshot, а не runtime dashboard.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Это уже не обычный landing page. Проект объединяет:

- лёгкую standalone-главную;
- knowledge pages на Diplodoc;
- web-CV;
- project case studies;
- `/now`;
- Engineering Notes + Atom feed;
- Engineering Map;
- локальный полнотекстовый поиск;
- Cmd/Ctrl+K command palette;
- Photo Stories / личный визуальный архив;
- Sources Knowledge Base;
- Project Evidence Layer;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — от первого лица: спокойный инженерный дневник, без корпоративного маркетинга, fake demos и неподтверждённых claims.

---

## 2. Текущее состояние `master`

### Последний крупный milestone

**Portfolio v0.4 — Project Evidence Layer**.

Merged через PR #22:

- `feat: add Project Evidence Layer`
- squash commit: `e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact implementation head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Он полностью прошёл **Build #247 / workflow run `29935334882`**.

### Непосредственно перед ним

- PR #17 — Photo Stories post-merge QA polish;
  - merged `7936638bd6473ad4f1ff0b2ef42db2289e937d83`;
- PR #19 — approved Sources Registry design;
  - merged `363c79c811748823184a795b8174378fc471f58d`;
- PR #20 — Sources Registry / Knowledge Base implementation;
  - merged `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`;
- PR #21 — continuity docs sync после Sources milestone;
  - merged `5535948d756585c44550d14f3e2424be82a3b767`;
- PR #22 — Project Evidence Layer;
  - merged `e3e48ac56b45eddeb872c04b83bff1408da6556f`.

### Сейчас в разработке

Feature implementation PR после merge #22 отсутствует.

Текущий docs-only follow-up синхронизирует durable state с фактическим merge SHA и CI evidence.

Следующий продуктовый приоритет по roadmap: **P0.5 — 3–5 grounded Engineering Notes из реальных incidents**.

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
- один canonical source of truth на сущность;
- deterministic build-time generation;
- semantic HTML;
- progressive vanilla JS;
- существующие quality gates не ослабляются ради новой feature;
- evidence не должно говорить больше, чем реально доказывает его scope.

---

## 4. Основные части системы

### 4.1 Standalone homepage

`templates/index.html`

Корневая страница не тянет тяжёлый Diplodoc/React viewer runtime. Она build-time получает project state из canonical registry и использует собственный лёгкий визуальный слой.

### 4.2 Diplodoc knowledge pages

`docs/landing/**/*.md`

Здесь находятся About, Projects, Resume, `/now`, Engineering Notes, Engineering Map, Sources, Contacts и flagship case studies.

Diplodoc остаётся владельцем единственного site-wide local full-text search index.

### 4.3 Canonical data

Основные version-controlled registries:

- `data/projects.json` — identity/status/summary/links/tags проектов;
- `data/project-history/*.json` — structured flagship timelines;
- `data/project-evidence.json` — controlled evidence snapshots;
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

Ключевые этапы pipeline:

1. assets/search/UI resources;
2. standalone homepage;
3. Project Registry/status badges;
4. `/now`;
5. project timelines;
6. Project Evidence validation/rendering/injection;
7. Engineering Notes + Atom feed;
8. Sources Knowledge Base;
9. Photo Stories routes;
10. Engineering Map;
11. deterministic OpenGraph PNG;
12. metadata/JSON-LD;
13. sitemap/robots/.nojekyll;
14. generated-site integrity + browser quality gates.

---

## 5. Реализованные продуктовые системы

### 5.1 Projects

Есть Projects hub и canonical `data/projects.json`.

Case studies:

- LivingWorld;
- NODE ZERO;
- TaskHub;
- MiniChess;
- Godot Atmospheric Horror Template.

Для flagship проектов есть structured timelines и architecture diagrams.

### 5.2 Project Evidence Layer — PR #22

Canonical source of truth:

`data/project-evidence.json`

Первый scope:

- `livingworld`;
- `node-zero`.

Модель generic и может расширяться на остальные project slugs без redesign.

#### Trust model

Три явных состояния:

- `verified` — snapshot осознанно проверен и считается текущим в пределах записанного scope;
- `stale` — доказательства раньше были meaningful, но текущее состояние требует повторной проверки;
- `unverified` — актуальное verification claim не делается.

`stale` и `unverified` — валидные состояния и сами по себе не ломают build.

Malformed/inconsistent evidence — ломает build.

#### Validation

`scripts/project-evidence.js` проверяет:

- non-empty registry;
- project slug и связь с `data/projects.json`;
- duplicate project snapshots;
- trust status;
- обязательный `lastVerified` для verified/stale;
- реальные calendar dates;
- version facts и duplicate labels;
- controlled signal kind/mode/state;
- coherence `manual ↔ manual mode` и `ci/release/pr/build ↔ automated mode`;
- required bounded `scope`;
- duplicate signals;
- только HTTPS evidence URLs, если URL указан;
- наличие signals для verified/stale.

#### Rendering / static-first

Case-study Markdown хранит только декларативные placeholders:

- `data-tr-project-evidence="livingworld"`;
- `data-tr-project-evidence="node-zero"`.

Build-time renderer генерирует semantic evidence block с:

- trust state;
- last checked date;
- version/protocol facts;
- automated/manual distinction;
- signal state;
- bounded scope — что именно доказано;
- evidence links, когда существует стабильный допустимый URL.

Если Diplodoc держит article body только внутри hydration state, build добавляет semantic `<noscript>` fallback. Core evidence остаётся доступным без JavaScript.

#### Initial snapshots

**LivingWorld**:

- status: `verified`;
- `lastVerified`: `2026-07-22`;
- versions/protocols зафиксированы для Minecraft 1.21.1 / Java 21 / Fabric / MCA Reborn / Simple Voice Chat / LivingWorld 0.1.0;
- bounded CI evidence: run `29736858315`;
- merged world-perception milestone PR #6;
- scope прямо говорит, что green CI не доказывает human two-client microphone/spatial-audio acceptance.

**NODE ZERO**:

- status: `stale`;
- last fully verified foundation gate: `2026-07-14`;
- зафиксирован successful production-foundation acceptance;
- текущий player-foundation PR #9 наблюдён `2026-07-22` как pending/draft milestone;
- старый успешный foundation gate намеренно не превращён в claim, что текущий vertical slice проверен целиком.

#### UI

Trust state различается не только цветом:

- verified — solid trust border;
- stale — dashed trust border;
- unverified — dotted/neutral treatment.

Mobile layout одноколоночный, scopes/versions wrap-safe.

### 5.3 `/now`

- active projects/statuses из Project Registry;
- focus/learning/writing из `data/now.json`;
- project state вручную не дублируется.

### 5.4 Engineering Notes

Есть dates, reading time, tags, related notes, previous/next и deterministic `feed.xml`.

Опубликованные базовые заметки покрывают:

- runtime boundary standalone landing vs Diplodoc;
- quality gates статического engineering site;
- server-authoritative AI NPC architecture.

Контента пока мало относительно количества реальных incidents — это следующий главный продуктовый gap.

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
- Cmd/Ctrl+K command palette не создаёт второй search index.

### 5.7 Resume / SEO / sharing

- first-class web-CV;
- deployment-safe embedded PDF;
- sitemap/robots/canonical;
- OpenGraph/Twitter;
- JSON-LD;
- deterministic 1200×630 social cards.

### 5.8 Photo Stories

Static-first фотоархитектура готова:

- canonical `/photos/`;
- albums/archive registries;
- `/photos/<slug>/`;
- cinematic hero/editorial layouts;
- fullscreen lightbox;
- keyboard/touch/hash deep links;
- filters;
- legacy compatibility;
- sitemap/search/metadata integration;
- build-time validation;
- browser smoke.

`photo-albums.json` намеренно пуст до появления первой настоящей связной серии. Fake/demo stories не добавляются.

### 5.9 Sources Registry / Knowledge Base

PR #20 создал canonical `data/sources.json` с 31 мигрированной реальной записью.

Есть strict validation, deterministic cards, counters, page-local query/topic/type filtering, stable anchors, related materials, `<details>`, responsive UI и semantic no-JS fallback.

Sources filter — только page-local UI. Diplodoc остаётся единственным site-wide full-text search engine.

---

## 6. Quality gates и доказательства

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
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression smoke;
- Firefox/WebKit compatibility;
- local search smoke;
- metadata/OpenGraph smoke;
- Engineering Map smoke;
- visual regression.

### Project Evidence milestone verification

Exact implementation head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

**Build #247 / run `29935334882`: success по всей матрице.**

Dedicated Project Evidence artifact summary:

- LivingWorld: `verified`, 2 bounded signals;
- trust border: solid `4px`;
- NODE ZERO: `stale`, 2 bounded signals;
- trust border: dashed `4px`;
- mobile horizontal overflow: `0` для обоих;
- serious/critical Axe violations: `0`;
- JavaScript-disabled: оба evidence block присутствуют;
- no-JS overflow: `0`;
- no-JS trust styling также загружается корректно.

### Важные TDD/regression incidents milestone

Последовательные RED gates:

- Build #225 — validator contract;
- Build #227 — renderer contract;
- Build #230 — canonical registry contract;
- Build #232 — generated-page/no-JS injection;
- Build #234 — orchestration;
- Build #241 — browser trust-style gate;
- Build #244 — dedicated regression на stylesheet resolution при Diplodoc `<base href>`.

Во время styling обнаружилось, что document-relative `../../_assets/...` конфликтует с generated `<base href="../../">` и site-integrity правильно считал asset broken. Исправление сделано в resource resolution pipeline; integrity gate не ослаблялся.

### Production caveat

Repository implementation и generated artifacts подтверждены CI.

**Фактический GitHub Pages deployment после merge `e3e48ac...` в этом snapshot отдельно не подтверждён.**

Не считать public endpoint автоматически синхронизированным с `master`, пока это не подтверждено post-deploy smoke или ручной endpoint-проверкой.

---

## 7. Известные незавершённые части / technical debt

### P0 / product

1. Engineering Notes пока мало относительно количества реальных incidents.
2. **Content Freshness Guard** ещё не реализован.
3. Первая настоящая Photo Story отсутствует — платформа готова, нужен настоящий связный материал.

### Quality architecture

Browser QA исторически состоит из нескольких runners. Нужен общий модульный `quality-harness/` с shared server/browser/context/Axe/overflow/screenshot primitives, но без giant monolithic runner.

### Metadata debt

`package.json` требует отдельной cleanup-задачи:

- version всё ещё историческая;
- description должна отражать engineering portfolio / knowledge platform.

### Отложено сознательно

- custom domain/paid hosting;
- privacy-friendly analytics;
- partial RU/EN;
- richer architecture explorer.

---

## 8. Следующий оптимальный этап

### P0.5 — 3–5 grounded Engineering Notes

Следующий шаг — не новая инфраструктура, а превращение уже случившихся инженерных incidents в сильный публичный content layer.

Приоритетные темы:

1. как маленькая CSS/reveal логика спрятала огромную bibliography table;
2. как Sources migration привела к no-JS architecture;
3. voice AI pipeline Minecraft NPC: microphone → STT → routing → LLM → memory → TTS;
4. почему почти правильный JSON от LLM всё равно ошибка;
5. Project Evidence: почему green CI не равен verified product и как bounded scopes защищают от overclaiming.

После Notes:

1. Content Freshness Guard поверх `projects.json` + `project-evidence.json`;
2. consolidated browser quality harness;
3. metadata/version cleanup;
4. richer flagship case-study structure;
5. first real Photo Story при появлении реального материала;
6. minimal EN / analytics / domain позже.

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
- AI chat поверх резюме как gimmick.

Предпочитать:

- version-controlled registries;
- deterministic build-time generation;
- semantic/no-JS content;
- progressive vanilla JS;
- bounded evidence вместо декоративных claims.

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
