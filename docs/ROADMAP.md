# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P1.2 Project Metadata Cleanup PR #31.
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

Создан `scripts/quality-harness/` с shared infrastructure primitives для paths, tools/browser launch, static server, context/page lifecycle, diagnostics, overflow/Axe, evidence и common scenarios.

Focused runners остались focused; giant monolithic runner/DSL не создавался. `visual-regression.cjs` намеренно оставлен отдельным.

## P1.2 Project metadata cleanup — DONE

PR #31 / squash:

`1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact implementation head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

Build #296 / run `29954043887`: **fully green по полной configured matrix**.

### Реализовано

`package.json` identity приведён к фактическому продукту:

- description → `TrueRuslan engineering portfolio and knowledge platform`;
- `private: true`;
- keywords → engineering portfolio / knowledge platform / backend engineering / software architecture / Engineering Notes;
- удалён obsolete primary keyword `landing`;
- repository/bugs URLs нормализованы на `True-Ruslan`;
- working GitHub Pages homepage сохранён без изменений.

Добавлен `scripts/package-metadata.test.js`, защищающий canonical metadata, URL identity, `private: true`, version decision и package-lock consistency.

### Deliberate version decision

`version: 0.2.0` оставлен **намеренно**.

Причина:

- сайт не публикуется как npm package;
- package semver contract отсутствует;
- product milestones не равны npm releases;
- bump до `0.4.0`/`1.0.0` был бы декоративным claim.

Будущий version bump требует отдельного explicit versioning/release contract.

`package-lock.json` не менялся: dependency graph и root name/version unchanged.

### TDD trail

- Build #295 / run `29953964548` — expected RED на stale metadata;
- Build #296 / run `29954043887` — final exact-head full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-22-project-metadata-cleanup-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-project-metadata-cleanup.md`

---

## P1.3 Stronger flagship case-study format — NEXT

### Почему сейчас

Infrastructure, evidence, freshness, content grounding и package identity уже стабилизированы. Следующий максимальный product-value шаг — сделать два flagship case studies сильнее как человеческие инженерные истории, а не только как набор registry/timeline/evidence blocks.

Controlled scope первой итерации:

- LivingWorld;
- NODE ZERO.

### Narrative structure

Каждый flagship постепенно привести к структуре:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

### Critical boundary

Project Evidence уже владеет machine-like current/evidence facts.

Narrative **не должен**:

- вручную дублировать canonical status/trust facts;
- обещать больше, чем подтверждает Evidence Layer;
- превращаться в маркетинговый case study с invented impact metrics;
- создавать второй источник истины по current project state.

Narrative должен объяснять reasoning:

- зачем проект существует;
- какие реальные ограничения определяли решения;
- какие архитектурные решения были приняты и почему;
- что не сработало/сломалось;
- чему это научило;
- что бы автор изменил сейчас.

### Implementation direction

Предпочтительный путь:

- сохранить ordinary Diplodoc Markdown authoring;
- использовать существующие timeline/evidence registries там, где уже есть canonical structured facts;
- улучшать semantic page structure без нового frontend framework/CMS;
- при необходимости добавить лёгкие build-time conventions/components только если они уменьшают duplication между двумя flagship pages;
- не строить универсальный case-study engine заранее без реальной повторяемой необходимости.

### Definition of Done

- LivingWorld и NODE ZERO имеют понятную narrative hierarchy;
- Problem/Constraints/Decisions/Failures явно читаются;
- current state/evidence не расходятся с canonical registries;
- first-person calm engineering diary tone сохранён;
- no invented metrics/claims;
- mobile/no-JS/search/SEO behavior сохранён;
- full exact-head quality matrix green.

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
- giant QA runner, скрывающий domain-specific tests;
- декоративные version bumps без release semantics.

---

# Оптимальная последовательность следующих действий

```text
1. P1.3 Stronger flagship case-study narrative structure
        ↓
2. Additional grounded Notes after source verification
        ↓
3. First real Photo Story whenever genuine material is ready (non-blocking)
        ↓
4. Minimal EN / privacy analytics / custom domain later
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
