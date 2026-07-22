# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge PR #20.
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
- no duplicate sources of truth;
- сначала реальные data/evidence, потом декоративная оболочка;
- новые quality gates не ослабляют существующие.

Главная формула v0.4:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# P0 — актуальный приоритет

## P0.1 Photo Stories platform polish — DONE

Реализовано и merged:

- Photo Stories platform — PR #15;
- post-merge QA polish — PR #17.

Repository-side architecture и browser QA готовы.

### Осталось как эксплуатационный follow-up

- отдельно подтверждать actual GitHub Pages deployment после значимых merge;
- первая настоящая Photo Story добавляется только при наличии реальной связной серии.

Первая история **не блокирует v0.4**.

---

## P0.2 Первая настоящая Photo Story — CONTENT DEPENDENT

Когда будет подходящий материал:

- 8–20 осмысленно отобранных кадров;
- cover;
- короткий intro от первого лица;
- место/дата/category;
- осмысленные `alt`;
- editorial layout sequence;
- никаких fake/demo фото.

Проверить:

- generated `/photos/<slug>/`;
- hero/cover;
- OpenGraph;
- deep links;
- keyboard/touch lightbox;
- lazy loading/LCP.

---

# Portfolio v0.4 — Knowledge & Evidence

## P0.3 Sources Registry / Knowledge Base — DONE

Merged PR #20:

`feat: build Sources Registry knowledge base`

Squash commit:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

### Реализовано

- canonical `data/sources.json`;
- 31 migrated real bibliography records;
- strict build-time validation;
- deterministic rendering;
- compact semantic source cards;
- topic counters;
- page-local query/topic/type filtering;
- stable anchors;
- related-material model;
- native `<details>` summaries;
- no-JS semantic fallback;
- responsive/mobile presentation;
- dedicated browser/Axe/no-JS smoke;
- старый giant Markdown table больше не source of truth;
- старый table-specific reveal smoke удалён после появления stronger replacement coverage.

### Важная граница

Sources filter/search — только page-local progressive UI.

Diplodoc остаётся единственным site-wide full-text search engine.

---

## P0.4 Project Evidence Layer — NEXT

### Зачем

Case studies уже сильные, но project status/version/CI часть всё ещё выражается текстовыми claims.

Нужен отдельный validated evidence layer, чтобы ответить:

> чем именно подтверждается текущее состояние проекта?

### Предлагаемая модель

Создать:

`data/project-evidence.json`

или отдельную validated сущность, связанную с `data/projects.json`.

Для flagship projects хранить controlled snapshot:

- `project` / registry slug;
- `lastVerified`;
- verified version/protocol;
- latest known release;
- last green CI/build;
- relevant PR/release/build links;
- verification status;
- automated/manual evidence distinction;
- короткое пояснение scope доказательства.

### UI

Компактный Evidence block на case-study page, например:

```text
VERIFIED
Last checked: 2026-07-22
CI: green
Tested version: ...
Evidence: release / PR / workflow
```

### Архитектурное ограничение

**No runtime GitHub API calls.**

Evidence — build-time/scheduled/manual controlled snapshot.

### Definition of done

- canonical evidence model существует;
- strict validation;
- flagship pages используют evidence data, а не дублируют claims вручную;
- no-JS semantic content;
- stale/missing evidence видимо отличается от verified;
- tests/browser/accessibility gates green.

---

## P0.5 Engineering Notes — расширить реальными incidents

Не писать абстрактные SEO-статьи.

Приоритетные grounded темы:

### 1. Как маленькая CSS-анимация спрятала огромную таблицу

- IntersectionObserver threshold;
- tall element geometry;
- почему fullscreen «лечил» баг;
- regression browser test;
- как этот incident позже повлиял на Sources Knowledge Base/no-JS architecture.

### 2. Как строился voice AI pipeline для Minecraft NPC

- microphone → STT → NPC routing → LLM → memory → TTS;
- server-authoritative boundaries;
- реальные failure modes.

### 3. Почему почти правильный JSON от LLM всё равно ошибка

- nullable `content`;
- malformed typed fields;
- controlled fallback;
- parsing boundaries.

### 4. OpenRouter audio/PCM сложнее обычного TTS API

- provider/protocol boundaries;
- audio formats;
- validation/observability;
- provider-specific errors.

Цель v0.4: минимум **3–5 новых grounded Engineering Notes**.

---

## P0.6 Content Freshness Guard

### Зачем

Главный риск living portfolio — stale claims.

Примеры:

- сайт говорит `release-candidate`, а release уже вышел;
- evidence давно не проверялось;
- release/CI link умер;
- Project Registry, timeline и evidence противоречат друг другу.

### Что сделать

Scheduled GitHub Action:

- сравнивает hand-maintained state с repository/release signals;
- проверяет возраст `lastVerified`;
- выявляет stale claims;
- создаёт/обновляет issue;
- **не переписывает public content автоматически**.

Evidence Layer должен появиться до Freshness Guard, чтобы guard проверял ясную canonical модель.

---

# P1 — поддерживаемость и глубина

## P1.1 Consolidated Browser Quality Harness

Сейчас quality suite исторически разделён на runners:

- browser-quality;
- Sources Knowledge Base smoke;
- Photo Stories smoke;
- v0.3 smoke;
- cross-browser;
- search;
- metadata;
- Engineering Map;
- visual regression;
- layout overflow.

### Проблема

Каждая новая feature может повторять:

- static server lifecycle;
- browser/context creation;
- request/page-error diagnostics;
- Axe setup;
- overflow helpers;
- screenshot/evidence setup.

### Решение

Создать модульный `quality-harness/`:

- shared static server lifecycle;
- browser/context factories;
- diagnostics;
- overflow helpers;
- Axe helpers;
- screenshot/evidence helpers;
- declarative route/scenario definitions.

Не превращать всё в один giant script.

---

## P1.2 Project metadata cleanup

Исторический debt:

- `package.json` version больше не должен бессмысленно отражать старый milestone;
- description должен описывать engineering portfolio / personal knowledge platform;
- keywords обновить.

Версию выбирать вместе с осознанным milestone/release.

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

После Evidence Layer этот формат можно сделать фактически сильнее без декоративных claims.

---

# P2 — аудитория и эксплуатация

## P2.1 Минимальный RU/EN

Не переводить весь сайт сразу.

Стартовый слой:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Русский остаётся default, английский — отдельный аккуратный `/en/` слой без runtime duplication.

---

## P2.2 Privacy-friendly analytics

Только продуктово полезные сигналы:

- homepage → destination click;
- project opens;
- Notes reads;
- Resume PDF downloads;
- Cmd/Ctrl+K usage;
- Photo Stories opens;
- Sources interactions при реальной продуктовой необходимости.

Без invasive cookies/ad profiling.

---

## P2.3 Custom domain / hosting

Отложено до реальной причины уходить с текущего GitHub Pages setup.

Перед покупкой сравнить:

- стоимость первого года;
- стоимость продления;
- DNS/SSL simplicity;
- GitHub Pages compatibility;
- нужна ли отдельная hosting platform вообще.

Не менять architecture только ради домена.

---

## P2.4 Richer architecture explorer

Engineering Map уже решает базовую задачу связей.

Расширять только при появлении достаточного количества реальных architecture artifacts.

Не строить 3D/canvas visualization ради эффекта.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- AI chat поверх резюме;
- аккаунты;
- комментарии;
- likes;
- CMS;
- database;
- backend ради static content;
- runtime GitHub API;
- второй site-wide search engine;
- social feed;
- infinite scroll;
- сложные декоративные 3D experiences.

Они увеличивают runtime complexity/privacy/cost surface сильнее, чем дают ценности текущей цели portfolio.

---

# Оптимальная последовательность следующих действий

```text
1. Verify actual production deployment after latest master merge when endpoint evidence is available
        ↓
2. Start Project Evidence Layer
        ↓
3. Add 3–5 grounded Engineering Notes
        ↓
4. Build Content Freshness Guard
        ↓
5. Consolidate browser quality harness
        ↓
6. Metadata/version cleanup + richer flagship case studies
        ↓
7. Add first real Photo Story whenever real content is ready (non-blocking)
        ↓
8. Minimal EN / privacy analytics / custom domain later
```

## Правило при новом чате

Перед выбором следующей задачи:

1. прочитать `PROJECT_STATE.md`;
2. проверить open PR;
3. проверить latest commits;
4. проверить exact-head CI;
5. сравнить фактический state с roadmap;
6. если речь о production — отдельно проверить deployment endpoint.

Roadmap — направление, а не оправдание игнорировать изменившееся состояние репозитория.
