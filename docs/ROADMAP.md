# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P1.1 Consolidated Browser Quality Harness PR #29.
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
- maintenance signals не переписывают public truth автоматически;
- сначала реальные data/evidence, потом presentation;
- evidence не говорит больше, чем доказывает bounded scope;
- shared infrastructure не скрывает focused domain ownership;
- quality gates не ослабляются ради refactor/feature velocity.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# P0 — foundation layer завершён

## P0.1 Photo Stories platform — DONE

PR #15 + QA polish PR #17.

Готовы canonical `/photos/`, registries, cinematic/editorial routes, fullscreen lightbox, keyboard/touch/hash navigation и browser QA.

## P0.2 First real Photo Story — CONTENT DEPENDENT

Добавлять только при genuine material. Fake/demo albums не добавлять.

## P0.3 Sources Registry / Knowledge Base — DONE

PR #20 / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

31 real records, strict validation, semantic deterministic rendering, page-local filters, stable anchors, responsive/no-JS behavior и dedicated QA.

## P0.4 Project Evidence Layer — DONE

PR #22 / squash:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

Canonical evidence, `verified / stale / unverified`, bounded automated/manual signals, no-JS rendering и trust-aware QA.

**Green CI/release/PR никогда автоматически не делает project `verified`.**

## P0.5 Grounded Engineering Notes — DONE

PR #25 / squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`: **fully green**.

Добавлены 3 repository-grounded notes; всего Engineering Notes — 6.

## P0.6 Content Freshness Guard — DONE

PR #27 / squash:

`33770983789fbde5c59a94972709360286a06ad5`

Exact head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Build #269 / run `29947803201`: **fully green**.

Guard проверяет age/link/repository/release/timeline/signal drift и создаёт maintenance report/issue, но никогда автоматически не меняет public registries/trust state.

Operational follow-up: первый реальный post-merge scheduled/manual run наблюдать отдельно.

---

# P1 — maintainability и глубина

## P1.1 Consolidated Browser Quality Harness — DONE

PR #29 / squash:

`06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact implementation head:

`00633c69e56354cbb8821c34a1b772cf259c3e18`

Build #293 / run `29951464481`: **fully green по полной configured matrix**.

### Реализовано

Создан `scripts/quality-harness/`:

- paths;
- quality-tool/browser discovery;
- static-server lifecycle;
- context/page factory;
- page/request/HTTP diagnostics;
- overflow/real-scroll helpers;
- Axe helpers;
- screenshots/JSON/text evidence helpers;
- immutable common viewports/core scenarios.

На него переведены focused browser runners:

- browser-quality;
- Sources Knowledge Base;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- cross-browser;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- layout overflow.

### Critical design boundary

**Focused runners остались focused.**

Не создан giant monolithic runner/DSL. Domain-specific interactions/assertions остались в своих scripts.

Не изменены:

- CSS/public content;
- visual baselines/thresholds;
- Lighthouse budget;
- workflow ordering;
- feature trust/content semantics.

`visual-regression.cjs` намеренно не переписан под browser harness.

### TDD trail

- Build #271 — RED shared-harness contracts;
- Build #280 — shared primitives GREEN;
- Build #284 — core migration slice GREEN;
- Build #293 — final exact-head full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-22-consolidated-browser-quality-harness-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-consolidated-browser-quality-harness.md`

---

## P1.2 Project metadata cleanup — NEXT

### Почему сейчас

Product evolved from «многостраничный лендинг» в engineering portfolio / knowledge platform, но `package.json` всё ещё несёт раннюю identity:

- `version: 0.2.0`;
- description: `Многостраничный лендинг TrueRuslan`;
- keywords сильнее описывают Diplodoc/landing phase, чем текущий scope.

Это небольшой controlled milestone с низким product risk после завершения большой quality-infrastructure работы.

### Что сделать

1. Зафиксировать современное package identity:
   - name/repository/homepage проверить на canonical spelling/URLs;
   - description обновить под engineering portfolio / knowledge platform;
   - keywords пересмотреть под backend engineering, knowledge platform, portfolio, architecture/engineering notes.
2. Отдельно принять deliberate decision по version:
   - не bump автоматически;
   - проверить смысл existing `0.2.0` и milestone history;
   - выбрать новую version только если она честно обозначает package/project milestone.
3. Добавить/обновить metadata contract test, чтобы старое «landing-only» описание не вернулось незаметно.
4. Не менять runtime/build/product behavior.
5. Прогнать полную existing CI matrix.

### Definition of Done

- `package.json` identity соответствует фактическому продукту;
- version decision явно объяснён;
- no accidental URL/name drift;
- metadata contract защищён test;
- build/runtime output функционально не изменён;
- full exact-head matrix green.

---

## P1.3 Stronger flagship case-study format

LivingWorld и NODE ZERO постепенно привести к narrative structure:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

Project Evidence владеет machine-like current/evidence facts; narrative не должен вручную дублировать registry state.

## P1.4 Additional grounded Notes

Только после source verification соответствующих repositories.

Candidates:

- Minecraft NPC voice AI pipeline;
- malformed/almost-correct LLM JSON handling.

Не писать абстрактные SEO-статьи ради количества.

---

# P2 — аудитория и эксплуатация

## P2.1 Minimal RU/EN

Не переводить весь сайт сразу.

Первый слой позже:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Русский остаётся default.

## P2.2 Privacy-friendly analytics

Только product-useful aggregate signals без invasive ad profiling/cookie surface.

## P2.3 Custom domain / hosting

Отложено до реальной причины уходить с текущего GitHub Pages setup.

## P2.4 Richer architecture explorer

Расширять Engineering Map только при достаточном количестве реальных architecture artifacts.

Не строить 3D/canvas experience ради эффекта.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- AI chat поверх резюме;
- accounts;
- comments/likes;
- CMS;
- database;
- backend ради static content;
- runtime GitHub API;
- второй site-wide search engine;
- social feed;
- infinite scroll;
- automatic public-state mutation из CI/release/freshness signals;
- giant QA runner, скрывающий domain-specific tests.

---

# Оптимальная последовательность следующих действий

```text
1. P1.2 Project metadata cleanup
        ↓
2. P1.3 Stronger flagship case-study narrative structure
        ↓
3. Additional grounded Notes after source verification
        ↓
4. First real Photo Story whenever genuine material is ready (non-blocking)
        ↓
5. Minimal EN / privacy analytics / custom domain later
```

Operational side-check, не блокирующий feature roadmap:

- при наличии evidence проверить первый реальный post-merge Content Freshness workflow run;
- при вопросах production отдельно проверить фактический GitHub Pages deployment.

## Правило при новом чате

Перед новым milestone:

1. открыть `docs/PROJECT_STATE.md`;
2. открыть `docs/ROADMAP.md`;
3. открыть `docs/CHANGELOG.md`;
4. проверить actual open PR/latest commits/exact-head CI;
5. если речь о freshness — проверить latest Content Freshness workflow run/issues;
6. не считать public deployment подтверждённым только потому, что `master` обновился.
