# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**, после merge P0.5 Grounded Engineering Notes PR #25.
>
> Главный durable snapshot для ответа на вопрос **«что сейчас представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
>
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> После этого всегда дополнительно проверять actual open PR, latest commits и exact-head CI. Public production deployment проверять отдельно.

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
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — от первого лица: спокойный инженерный дневник, без корпоративного маркетинга, fake demos и неподтверждённых claims.

---

## 2. Текущее состояние `master`

### Последний продуктовый milestone

**P0.5 — Grounded Engineering Notes**.

PR #25:

`feat: publish grounded Engineering Notes milestone`

Squash commit:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact implementation head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Verification:

**Build #257 / workflow run `29943616448`: fully green по полной configured matrix.**

Milestone добавил 3 новые repository-grounded заметки и довёл общее количество Engineering Notes до 6.

Новые заметки:

1. `intersection-observer-giant-table` — reveal/`IntersectionObserver` regression на giant bibliography table;
2. `static-first-sources-no-js` — Sources Registry migration, Diplodoc hydration state и semantic no-JS representation;
3. `green-ci-is-not-product-verification` — bounded evidence, freshness и граница между green CI и verified product claim.

Интеграция включает:

- canonical metadata/relations в `data/notes.json`;
- Notes hub;
- TOC/search/sitemap discovery;
- page-specific SEO/OpenGraph metadata;
- Atom feed через существующий manifest pipeline;
- canonical content contract, требующий присутствия всех трёх P0.5 slugs.

Design:

`docs/superpowers/specs/2026-07-22-grounded-engineering-notes-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-grounded-engineering-notes.md`

### Предыдущий крупный architecture milestone

**Portfolio v0.4 — Project Evidence Layer**, PR #22.

Squash commit:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact implementation head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Verification:

**Build #247 / workflow run `29935334882`: fully green.**

### Сейчас в разработке

После merge PR #25 **active feature implementation PR отсутствует**.

Этот continuity follow-up — docs-only синхронизация durable state и не является новым product feature milestone.

Следующий продуктовый/technical приоритет:

**P0.6 — Content Freshness Guard поверх Project Registry + Project Evidence Layer.**

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
- evidence не говорит больше, чем реально доказывает его bounded `scope`.

Diplodoc остаётся владельцем единственного site-wide local full-text search index.

---

## 4. Canonical data и build architecture

Основные registries:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — structured flagship timelines;
- `data/project-evidence.json` — controlled evidence snapshots;
- `data/now.json` — focus/learning/writing;
- `data/notes.json` — Engineering Notes metadata/relations;
- `data/engineering-graph.json` — Engineering Map;
- `data/page-meta.json` — SEO/social metadata;
- `data/photo-albums.json` — Photo Stories albums;
- `data/photo-archive.json` — одиночный photo archive;
- `data/sources.json` — Sources Knowledge Base;
- `data/external-links.json` — public endpoints для monitoring.

Главный build/postprocess orchestrator:

`scripts/copy-assets.js`

Ключевые build-time systems:

1. assets/UI resources;
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

Первый scope:

- `livingworld`;
- `node-zero`.

Schema generic для дальнейшего расширения.

#### Trust model

- `verified` — snapshot явно проверен и считается текущим только в пределах записанного scope;
- `stale` — evidence раньше было meaningful, но текущее состояние требует re-verification;
- `unverified` — актуальное verification claim не делается.

`stale`/`unverified` сами по себе не ломают build.

Malformed/inconsistent evidence ломает build.

#### Validation

`scripts/project-evidence.js` проверяет:

- registry shape/non-empty state;
- project reference против `data/projects.json`;
- duplicate project snapshots;
- trust enum;
- обязательный `lastVerified` для verified/stale;
- реальные calendar dates;
- version facts и duplicate labels;
- signal kind/mode/state;
- manual/automated mode coherence;
- required bounded `scope`;
- duplicate signals;
- HTTPS URL safety;
- minimum signals для verified/stale.

#### Rendering / no-JS

Case-study Markdown содержит declarative placeholders.

Build-time renderer генерирует semantic block с trust state, last checked date, version/protocol facts, automated/manual distinction, signal state, bounded proof scope и evidence links.

Если Diplodoc хранит article body только в hydration state, build добавляет semantic `<noscript>` fallback.

Runtime fetch не нужен.

#### Initial controlled snapshots

**LivingWorld**:

- `verified`;
- `lastVerified = 2026-07-22`;
- bounded CI evidence: run `29736858315`;
- merged world-perception milestone PR #6;
- scope прямо исключает false claim о completed human two-client microphone/spatial-audio acceptance.

**NODE ZERO**:

- `stale`;
- last fully verified foundation gate `2026-07-14`;
- successful production-foundation acceptance сохранён;
- player-foundation PR #9 был observed `2026-07-22` как pending/draft milestone;
- старый successful foundation gate не превращён в claim о готовности текущего player/vertical-slice milestone.

Trust state различается не только цветом: verified — solid, stale — dashed, unverified — dotted/neutral treatment.

### 5.3 Sources Registry / Knowledge Base — DONE

PR #20 / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Есть:

- canonical `data/sources.json`;
- 31 migrated real records;
- strict validation;
- semantic deterministic cards;
- page-local query/topic/type filtering;
- stable anchors/related materials;
- responsive UI;
- semantic no-JS fallback;
- dedicated browser/Axe/no-JS gate.

Sources filtering — только page-local UI. Diplodoc остаётся global full-text search owner.

### 5.4 Photo Stories — PLATFORM DONE

Основная implementation:

- PR #15 — `8aa2149fc8aec3751f2da73321c06a89111f9efd`;
- QA polish PR #17 — `7936638bd6473ad4f1ff0b2ef42db2289e937d83`.

Готово:

- canonical `/photos/`;
- album/archive registries;
- story routes;
- cinematic/editorial layouts;
- fullscreen lightbox;
- keyboard/touch/hash deep links;
- filters;
- sitemap/search/metadata integration;
- browser smoke.

`photo-albums.json` намеренно пуст до появления первой настоящей связной серии. Fake/demo stories не добавляются.

### 5.5 Engineering Notes — P0.5 DONE

Canonical metadata:

`data/notes.json`

Всего опубликовано 6 заметок:

1. `portfolio-runtime-boundary`;
2. `static-site-quality-gates`;
3. `server-authoritative-ai-npcs`;
4. `intersection-observer-giant-table`;
5. `static-first-sources-no-js`;
6. `green-ci-is-not-product-verification`.

Работают:

- dates / reading time / tags;
- previous/next navigation;
- related-note graph;
- deterministic Atom feed;
- TOC/search/sitemap discovery;
- per-page metadata/OpenGraph;
- canonical manifest/file validation.

P0.5 специально выбрал 3 incidents с самым сильным repository-local evidence trail. Темы voice AI pipeline и malformed LLM JSON остаются будущими grounded content candidates после отдельной cross-repository source verification.

### 5.6 `/now`, Engineering Map, Search, Resume/SEO

Реализованы:

- `/now` с registry-derived active project state;
- Engineering Map technologies → domains → projects → notes;
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

Основные gates:

- `npm test`;
- production Diplodoc build;
- generated-site integrity;
- broken local links/assets/OG checks;
- mobile overflow;
- Chromium browser smoke;
- Axe accessibility;
- Lighthouse;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression;
- Firefox/WebKit compatibility;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression.

### P0.5 exact verification

Exact feature head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`:

**fully green**.

Green:

- tests, включая canonical grounded-note contract;
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
- quality evidence upload.

### Project Evidence exact verification

Exact feature head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

### Important regression history

- Build #225 — Project Evidence validator contract;
- Build #227 — renderer contract;
- Build #230 — canonical registry contract;
- Build #232 — generated-page/no-JS injection;
- Build #234 — orchestration;
- Build #241 — browser trust-style gate;
- Build #244 — stylesheet resolution regression при Diplodoc `<base href>`.

Во время Project Evidence styling naive document-relative stylesheet URL конфликтовал с generated `<base href>`. Site integrity поймал broken asset; fix сделан в resource resolution pipeline без ослабления integrity gate.

---

## 7. Известные незавершённые части / technical debt

### P0

1. **Content Freshness Guard** ещё не реализован.
2. Первая настоящая Photo Story отсутствует — платформа готова, нужен настоящий связный материал.

### Quality architecture

Browser QA состоит из нескольких focused runners.

Нужен общий модульный `quality-harness/` с shared server/browser/context/Axe/overflow/screenshot primitives, но без giant monolithic runner.

### Metadata debt

`package.json` требует отдельной cleanup-задачи:

- version историческая;
- description должна отражать engineering portfolio / knowledge platform;
- keywords нужно пересмотреть после content expansion.

### Content follow-ups

Grounded Notes milestone закрыт минимально полноценным scope из 3 новых notes. Дополнительные реальные темы, которые можно публиковать позже:

- voice AI pipeline Minecraft NPC: microphone → STT → routing → LLM → memory → TTS;
- почему «почти правильный JSON» от LLM всё равно protocol error.

Не публиковать их без source verification из соответствующих project repositories.

### Отложено сознательно

- custom domain/paid hosting;
- privacy-friendly analytics;
- partial RU/EN;
- richer architecture explorer.

---

## 8. Следующий оптимальный этап

### P0.6 — Content Freshness Guard

Следующий шаг — построить maintenance layer поверх `data/projects.json` + `data/project-evidence.json`, который обнаруживает устаревшие controlled snapshots, но не переписывает public truth автоматически.

Guard должен:

- сравнивать hand-maintained state с доступными repository/release signals;
- проверять возраст `lastVerified`;
- проверять evidence links;
- находить contradictions между Project Registry, timelines и Project Evidence;
- создавать/обновлять actionable issue или report;
- **не переводить project в `verified` автоматически**;
- **не переписывать public content автоматически**.

После Freshness Guard:

1. consolidated browser quality primitives;
2. metadata/version cleanup;
3. stronger flagship case-study structure;
4. additional grounded Notes после source verification;
5. first real Photo Story при появлении genuine material;
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

## 10. Production caveat

Repository implementation и generated artifacts подтверждены CI.

**Фактический GitHub Pages deployment после последних merges отдельно не подтверждён в этом snapshot.**

Не считать public endpoint автоматически синхронизированным с `master`, пока это не подтверждено post-deploy smoke или ручной endpoint-проверкой.

---

## 11. Как восстановить контекст в новом чате

Оптимальный запрос:

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

State-файл — snapshot.

Для текущего состояния всегда дополнительно проверять:

- open PR;
- latest commits;
- latest exact-head CI;
- actual production deployment, если вопрос касается production.
