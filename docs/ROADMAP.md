# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**.
>
> Этот roadmap отвечает на вопрос **«что делать дальше, в каком порядке и зачем?»**. Текущее фактическое состояние — в `docs/PROJECT_STATE.md`, история изменений — в `docs/CHANGELOG.md`.

## Принципы roadmap

Любое новое развитие должно сохранять текущие архитектурные границы:

- **static-first**;
- **build-time intelligence**;
- **progressive enhancement**;
- core content доступен без JavaScript;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для базового контента;
- no duplicate sources of truth;
- сначала реальные данные/evidence, потом визуальная оболочка;
- новые quality gates не ослабляют существующие.

Главная продуктовая формула следующего этапа:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

## P0 — завершить текущее состояние

### 0.1 Завершить Photo Stories polish

**Статус:** в работе, draft PR #17.

Нужно:

1. проверить visual artifacts PR #17;
2. убедиться, что mobile hero title не выходит за viewport;
3. убедиться, что archive images загружены до screenshot evidence;
4. сохранить все существующие overflow/accessibility gates;
5. merge только при полном green CI и визуально корректном результате.

После merge:

- проверить публичный `/photos/` на фактическом GitHub Pages deployment;
- убедиться, что legacy `/landing/photos.html` корректно переводит на новый archive;
- проверить lightbox на desktop/mobile в production.

### 0.2 Добавить первую настоящую Photo Story

Архитектура уже готова, но `data/photo-albums.json` намеренно пуст.

Первый album должен быть реальной связной историей:

- 8–20 осмысленно отобранных кадров;
- одна cover-фотография;
- короткий intro от первого лица;
- место/дата/category;
- осмысленные `alt`;
- editorial layout sequence;
- никаких fake/demo фотографий.

После первой истории отдельно проверить:

- generated `/photos/<slug>/`;
- cinematic hero;
- OpenGraph cover;
- hash deep links;
- keyboard/touch lightbox;
- lazy loading и LCP.

---

# Portfolio v0.4 — Knowledge & Evidence

Это следующий крупный продуктовый этап после стабилизации Photo Stories.

## P0.3 Sources Registry + Knowledge Base

### Зачем

Сейчас `Список изученных источников` — большая Markdown-таблица. Она хранит полезный материал, но плохо масштабируется и воспринимается как рабочий список, а не как карта знаний.

### Что сделать

Создать canonical registry, например:

`data/sources.json`

Build-time генерировать knowledge base с:

- поиском по title/summary;
- tag filters: Java, AI, DB, Architecture, DevOps и т. п.;
- source filters: Habr, книги, документация, статьи и другие типы;
- сортировкой по дате добавления;
- compact list/cards;
- expandable summary;
- related materials;
- topic counters;
- deep links на отдельные источники или устойчивые anchors;
- semantic no-JS fallback.

### Критерий готовности

Bibliography перестаёт быть гигантской вручную поддерживаемой таблицей и становится публичной картой того, что реально изучается.

---

## P0.4 Project Evidence Layer

### Зачем

Case studies уже сильные, но часть статусов всё ещё выглядит как текстовое утверждение. Нужен слой фактического подтверждения.

### Предлагаемая модель

`data/project-evidence.json` или расширение Project Registry отдельной validated сущностью.

Для flagship-проектов хранить build-time snapshot:

- `lastVerified`;
- verified version/protocol;
- latest known release;
- last green CI/build;
- relevant PR/release/build links;
- verification status;
- краткое пояснение, что доказано автоматически, а что требует manual acceptance.

### UI

На project page компактный блок:

```text
VERIFIED
Last checked: 2026-07-22
CI: green
Tested version: ...
Evidence: release / PR / workflow
```

### Ограничение

Не делать runtime GitHub API calls. Snapshot должен обновляться build-time/scheduled workflow/manual controlled process.

---

## P0.5 Content Freshness Guard

### Зачем

Главный риск живого portfolio — stale claims: сайт продолжает показывать старый status/version после развития реального проекта.

### Что сделать

Scheduled GitHub Action, который:

- сравнивает hand-maintained state с доступными repository/release signals;
- проверяет возраст `lastVerified`;
- выявляет потенциально устаревшие claims;
- создаёт/обновляет GitHub issue при проблеме;
- **не переписывает публичный контент автоматически**.

Примеры:

- site говорит `release-candidate`, а уже вышел release;
- evidence не обновлялось больше заданного периода;
- ссылка на release/CI умерла;
- project registry и timeline противоречат друг другу.

---

## P0.6 Увеличить Engineering Notes реальными историями

Не добавлять абстрактные SEO-статьи. Использовать реальные инженерные incidents и решения.

Приоритетные темы:

1. **Как маленькая CSS-анимация спрятала огромную таблицу на production**
   - IntersectionObserver threshold;
   - tall element geometry;
   - почему fullscreen «лечил» баг;
   - regression browser test.

2. **Как я строил голосовой AI pipeline для Minecraft NPC**
   - microphone → STT → NPC routing → LLM → memory → TTS;
   - server-authoritative boundaries;
   - реальные failure modes.

3. **Почему почти правильный JSON от LLM всё равно считается ошибкой**
   - nullable content;
   - malformed typed fields;
   - controlled fallback;
   - parsing boundaries.

4. **OpenRouter audio/PCM оказался сложнее обычного TTS API**
   - protocol boundaries;
   - provider-specific behavior;
   - validation/observability.

Цель v0.4: минимум **3–5 новых grounded Engineering Notes**.

---

# P1 — поддерживаемость и глубина

## P1.1 Consolidated Browser Quality Harness

Сейчас quality suite исторически разделён на несколько runner scripts:

- browser-quality;
- bibliography reveal smoke;
- Photo Stories smoke;
- v0.3 smoke;
- cross-browser smoke;
- search smoke;
- metadata smoke;
- Engineering Map smoke;
- visual regression.

### Проблема

Каждая новая feature может создавать собственный server/browser lifecycle и дублировать helpers.

### Решение

Создать общий `quality-harness/`:

- единый static server lifecycle;
- browser/context factories;
- shared request/page-error diagnostics;
- overflow/assertion helpers;
- Axe helpers;
- screenshot/evidence helpers;
- declarative route/scenario definitions.

Не объединять всё в один гигантский файл. Нужны небольшие модули с ясными boundaries.

---

## P1.2 Project metadata cleanup

Исправить исторический metadata debt:

- `package.json` version больше не должен бессмысленно оставаться `0.2.0`;
- description заменить с `Многостраничный лендинг TrueRuslan` на описание engineering portfolio / personal knowledge platform;
- обновить keywords.

Версию выбирать осознанно вместе с ближайшим release/milestone, а не просто механически bump.

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

Особенно полезно для LivingWorld, где уже есть реальные incidents:

- structured JSON parsing;
- `content: null`;
- OpenRouter audio/PCM;
- provider 402/balance behavior;
- server/client responsibility;
- fallback responses;
- voice pipeline routing.

---

# P2 — расширение аудитории и эксплуатация

## P2.1 Минимальный RU/EN

Не переводить весь сайт сразу.

Начать только с:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Русский остаётся default. Английский — отдельный аккуратный `/en/` слой без дублирования runtime.

---

## P2.2 Privacy-friendly analytics

Собирать только продуктово полезные сигналы:

- homepage → destination click;
- project opens;
- Notes reads;
- Resume PDF downloads;
- Cmd/Ctrl+K usage;
- Photo Stories opens.

Предпочтение — privacy-first/minimal analytics без invasive cookies и advertising profiling.

---

## P2.3 Custom domain / hosting

Отложено до момента, когда появится реальная причина уходить с текущего GitHub Pages setup.

Перед покупкой:

- сравнить стоимость домена;
- продление, а не только первый год;
- DNS/SSL simplicity;
- GitHub Pages custom-domain compatibility;
- необходимость отдельного hosting вообще.

Не менять архитектуру сайта только ради нового домена.

---

## P2.4 Richer architecture explorer

Engineering Map уже решает базовую задачу связей. Более сложный architecture explorer имеет смысл только если появится достаточно реальных architecture artifacts.

Не строить 3D/canvas visualization ради эффекта.

---

# Что сознательно НЕ является roadmap priority

Не планировать без нового обоснования:

- AI chat поверх резюме;
- аккаунты;
- комментарии;
- likes;
- CMS;
- database;
- backend только ради управления статическим content;
- runtime GitHub API;
- собственный второй search engine;
- social feed;
- бесконечную ленту;
- сложные декоративные 3D experiences.

Причина: они увеличивают runtime complexity, cost/privacy surface и риск ошибок сильнее, чем ценность для текущей цели portfolio.

---

# Оптимальная последовательность следующих действий

```text
1. Finish PR #17 Photo Stories polish
        ↓
2. Verify production /photos
        ↓
3. Add first real Photo Story when content is ready
        ↓
4. Start v0.4: Sources Registry / Knowledge Base
        ↓
5. Project Evidence Layer
        ↓
6. 3–5 grounded Engineering Notes
        ↓
7. Content Freshness Guard
        ↓
8. Consolidate browser quality harness
        ↓
9. Metadata/version cleanup + richer case studies
        ↓
10. Minimal EN / privacy analytics / domain later
```

## Правило при новом чате

Перед выбором следующей задачи обязательно:

1. прочитать `PROJECT_STATE.md`;
2. проверить open PR;
3. проверить latest CI;
4. сравнить фактический state с этим roadmap;
5. только после этого выбирать следующий пункт.

Roadmap — направление, а не оправдание игнорировать изменившееся состояние репозитория.
