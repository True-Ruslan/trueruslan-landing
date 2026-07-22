# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P0.5 Grounded Engineering Notes PR #25.
>
> Roadmap отвечает на вопрос **«что делать дальше, в каком порядке и зачем?»**.
> Фактическое текущее состояние — `docs/PROJECT_STATE.md`, история — `docs/CHANGELOG.md`.

## Принципы roadmap

Любое развитие должно сохранять:

- **static-first**;
- **build-time intelligence**;
- **progressive enhancement**;
- core content доступен без runtime API и, где применимо, без JavaScript;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core content;
- no build-time GitHub API dependency в основном site build;
- no duplicate sources of truth;
- сначала реальные data/evidence, потом presentation;
- evidence не говорит больше, чем доказывает его bounded scope;
- новые quality gates не ослабляют существующие.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# P0 — актуальный приоритет

## P0.1 Photo Stories platform — DONE

Реализовано:

- Photo Stories platform — PR #15;
- post-merge QA polish — PR #17;
- canonical `/photos/`;
- albums/archive registries;
- cinematic/editorial story pages;
- fullscreen lightbox;
- keyboard/touch/hash navigation;
- responsive/browser QA.

### Эксплуатационный follow-up

- первая настоящая Photo Story создаётся только при появлении реальной связной серии;
- fake/demo albums не добавлять;
- actual production deployment после значимых merges проверять отдельно.

Первая история **не блокирует развитие продукта**.

---

## P0.2 Первая настоящая Photo Story — CONTENT DEPENDENT

Когда появится подходящий материал:

- 8–20 осмысленно отобранных кадров;
- cover;
- короткий intro от первого лица;
- место/дата/category;
- meaningful `alt`;
- editorial layout sequence;
- проверить hero/OG/deep links/lightbox/lazy loading/LCP.

---

# Portfolio v0.4 — Knowledge & Evidence

## P0.3 Sources Registry / Knowledge Base — DONE

PR #20:

`feat: build Sources Registry knowledge base`

Squash commit:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Реализовано:

- canonical `data/sources.json`;
- 31 migrated real records;
- strict build-time validation;
- deterministic semantic rendering;
- compact cards/counters;
- page-local query/topic/type filtering;
- stable anchors/related materials;
- native `<details>`;
- responsive presentation;
- semantic no-JS fallback;
- dedicated browser/Axe/no-JS gate.

Важная граница:

**Sources filter — только page-local UI. Diplodoc остаётся единственным site-wide full-text search engine.**

---

## P0.4 Project Evidence Layer — DONE

PR #22:

`feat: add Project Evidence Layer`

Squash commit:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact implementation head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Verification:

**Build #247 / run `29935334882`: fully green.**

### Реализовано

Canonical source of truth:

`data/project-evidence.json`

Первый scope:

- `livingworld`;
- `node-zero`.

Trust states:

- `verified`;
- `stale`;
- `unverified`.

Есть:

- strict schema/reference/date/URL validation;
- controlled version/protocol facts;
- bounded evidence signals;
- explicit automated/manual distinction;
- required `scope` — что именно доказывает signal;
- build-time placeholder injection;
- semantic no-JS fallback для Diplodoc hydration-state pages;
- visually distinct trust states без reliance только на цвет;
- mobile-safe presentation;
- dedicated browser/Axe/no-JS smoke.

### Initial controlled snapshots

LivingWorld:

- `verified`;
- `lastVerified = 2026-07-22`;
- bounded CI + merged milestone evidence;
- green CI явно не трактуется как human multiplayer/microphone/spatial-audio acceptance.

NODE ZERO:

- `stale`;
- last fully verified foundation gate `2026-07-14`;
- successful production-foundation evidence сохранён;
- newer player/vertical-slice work не получает verification claim из старого foundation gate.

### Архитектурные границы

- no runtime GitHub API;
- no build-time GitHub API dependency в основном site build;
- manual controlled snapshot;
- `verified` никогда не выводится автоматически из CI/release/PR;
- `stale`/`unverified` не ломают build только из-за trust state;
- malformed evidence ломает build.

---

## P0.5 Grounded Engineering Notes — DONE

PR #25:

`feat: publish grounded Engineering Notes milestone`

Squash commit:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact implementation head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Verification:

**Build #257 / run `29943616448`: fully green по полной configured matrix.**

### Что добавлено

Три новые repository-grounded Engineering Notes:

1. **Как IntersectionObserver спрятал огромную таблицу**
   - bibliography reveal regression;
   - `threshold: 0.08` и tall-element geometry;
   - misleading fullscreen symptom;
   - browser regression;
   - переход от giant table к Sources Registry.

2. **Почему build-time data недостаточно без no-JS representation**
   - canonical Sources Registry;
   - Diplodoc hydration state;
   - пустой React root при disabled JavaScript;
   - semantic `<noscript>` fallback;
   - one canonical source / no runtime fetch;
   - page-local progressive filtering без второго site-wide search engine.

3. **Почему green CI не означает verified product**
   - automated vs manual evidence;
   - bounded `scope`;
   - `verified / stale / unverified`;
   - LivingWorld и NODE ZERO как разные trust cases;
   - generated `<base href>` stylesheet regression как пример artifact-level verification.

### Интеграция

- `data/notes.json` теперь содержит 6 notes;
- related-note graph обновлён;
- Notes hub обновлён;
- TOC/search/sitemap discovery обновлены;
- per-note SEO/OpenGraph metadata добавлены;
- Atom feed получает новые entries через canonical manifest;
- добавлен content contract, требующий три P0.5 slugs.

### Почему milestone ограничен тремя notes

Definition of Done требовал минимум 3–5 новых grounded notes.

Выбран минимально полный scope из трёх тем с самым сильным repository-local evidence trail. Это лучше, чем расширять milestone историями из других repositories без отдельной source verification.

Будущие content candidates:

- voice AI pipeline Minecraft NPC: microphone → STT → routing → LLM → memory → TTS;
- почему «почти правильный JSON» от LLM всё равно protocol error.

Они не являются blocking debt P0.5.

---

## P0.6 Content Freshness Guard — NEXT

### Зачем

После `data/projects.json` + `data/project-evidence.json` главный риск — controlled snapshot может со временем устареть.

Примеры:

- сайт говорит `release-candidate`, а release уже вышел;
- `lastVerified` слишком старый;
- evidence URL умер;
- registry/timeline/evidence начинают противоречить друг другу;
- current repository state ушёл дальше последнего verified snapshot.

### Что сделать

Scheduled GitHub Action / maintenance workflow:

- сравнивает hand-maintained state с доступными repository/release signals;
- проверяет возраст `lastVerified`;
- проверяет evidence links;
- выявляет contradictions между project registry/timeline/evidence;
- создаёт или обновляет actionable issue/report;
- **не переписывает public content автоматически**;
- **не переводит evidence в `verified` автоматически**.

Freshness Guard работает поверх уже созданной canonical evidence model.

### Preferred implementation shape

1. отдельный deterministic checker module для registry/evidence freshness rules;
2. unit tests для date/freshness/contradiction semantics;
3. maintenance/report command, который можно запускать локально и в CI;
4. scheduled workflow как thin orchestration layer;
5. actionable Markdown/JSON report или GitHub issue update;
6. никаких runtime dependencies для public site build.

### Definition of Done

- stale/freshness rules явно задокументированы;
- age threshold не превращается в auto-`stale` public mutation;
- broken/unreachable evidence signals обнаруживаются как maintenance finding;
- registry/evidence contradictions имеют deterministic diagnostics;
- scheduled workflow не меняет canonical public registries автоматически;
- unit/CI verification green;
- failure/report output достаточно конкретен для ручного исправления snapshot.

---

# P1 — поддерживаемость и глубина

## P1.1 Consolidated Browser Quality Harness

Сейчас quality suite намеренно состоит из нескольких focused runners:

- browser-quality;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 smoke;
- cross-browser;
- search;
- metadata;
- Engineering Map;
- visual regression;
- layout overflow.

Общая проблема — повторяются server/browser/context/Axe/overflow/screenshot primitives.

Создать модульный `quality-harness/`:

- shared static-server lifecycle;
- browser/context factories;
- request/page-error diagnostics;
- overflow helpers;
- Axe helpers;
- screenshot/evidence helpers;
- declarative route/scenario definitions.

**Не превращать это в один giant runner.**

---

## P1.2 Project metadata cleanup

Исторический debt:

- `package.json` version не отражает текущий milestone;
- description всё ещё должна быть приведена к engineering portfolio / personal knowledge platform;
- keywords проверить после content expansion.

Версию менять только как осознанное milestone/release решение.

---

## P1.3 Stronger flagship case-study format

Для LivingWorld и NODE ZERO постепенно привести narrative к структуре:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

Project Evidence Layer уже даёт factual section 5–6; narrative не должен дублировать machine-like state вручную.

---

## P1.4 Additional grounded Engineering Notes

После P0.6 можно продолжать content expansion, но только из source-verified incidents.

Приоритетные кандидаты:

- voice AI pipeline Minecraft NPC;
- malformed/nullable structured LLM responses;
- другие incidents из LivingWorld/NODE ZERO/Vlezet после проверки соответствующих repositories и current state.

Не писать абстрактные SEO-статьи ради количества.

---

# P2 — аудитория и эксплуатация

## P2.1 Минимальный RU/EN

Не переводить весь сайт сразу.

Стартовый слой позже:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Русский остаётся default.

## P2.2 Privacy-friendly analytics

Только продуктово полезные aggregate signals и без invasive ad profiling/cookie surface.

## P2.3 Custom domain / hosting

Отложено до реальной причины уходить с текущего GitHub Pages setup.

## P2.4 Richer architecture explorer

Расширять Engineering Map только при появлении достаточного количества реальных architecture artifacts. Не строить 3D/canvas experience ради эффекта.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- AI chat поверх резюме;
- аккаунты;
- comments/likes;
- CMS;
- database;
- backend ради static content;
- runtime GitHub API;
- второй site-wide search engine;
- social feed;
- infinite scroll;
- сложную 3D-визуализацию ради эффекта.

---

# Оптимальная последовательность следующих действий

```text
1. Operationally verify actual production deployment when endpoint evidence is available
        ↓
2. Build P0.6 Content Freshness Guard
        ↓
3. Consolidate shared browser-quality primitives
        ↓
4. Metadata/version cleanup + stronger flagship case-study structure
        ↓
5. Add more grounded Notes after cross-repository source verification
        ↓
6. Add first real Photo Story whenever genuine material is ready (non-blocking)
        ↓
7. Minimal EN / privacy analytics / custom domain later
```

## Правило при новом чате

Перед любым новым milestone сначала:

1. открыть `docs/PROJECT_STATE.md`;
2. открыть `docs/ROADMAP.md`;
3. открыть `docs/CHANGELOG.md`;
4. проверить actual open PR/latest commits/exact-head CI;
5. не считать public production deployment подтверждённым только потому, что `master` обновился.
