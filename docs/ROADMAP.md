# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-23**, после merge P1.4 Additional Grounded Engineering Notes PR #36.
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

Exact head `7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`, Build #247 / run `29935334882` fully green.

Canonical evidence, `verified / stale / unverified`, bounded automated/manual signals, no-JS rendering и trust-aware QA.

**Green CI/release/PR никогда автоматически не делает project `verified`.**

## P0.5 Grounded Engineering Notes — DONE

PR #25 / squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Build #257 / run `29943616448` fully green.

Добавлены три repository-grounded notes; после P1.4 всего Engineering Notes стало 7.

## P0.6 Content Freshness Guard — DONE

PR #27 / squash:

`33770983789fbde5c59a94972709360286a06ad5`

Exact head `4b50dd78a41b3cbe2fce327e6c752508134862d0`, Build #269 / run `29947803201` fully green.

Guard проверяет age/link/repository/release/timeline/signal drift и создаёт maintenance report/issue, но никогда автоматически не меняет public registries/trust state.

Operational follow-up: первый реальный post-merge scheduled/manual run наблюдать отдельно.

---

# P1 — maintainability и глубина завершены

## P1.1 Consolidated Browser Quality Harness — DONE

PR #29 / squash:

`06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact head `00633c69e56354cbb8821c34a1b772cf259c3e18`, Build #293 / run `29951464481` fully green.

Создан `scripts/quality-harness/` с shared infrastructure primitives. Focused runners остались focused; giant monolithic runner/DSL не создавался.

## P1.2 Project Metadata Cleanup — DONE

PR #31 / squash:

`1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact head `12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`, Build #296 / run `29954043887` fully green.

Package identity соответствует engineering portfolio / knowledge platform; `private: true`; canonical URLs/keywords; `version: 0.2.0` оставлен намеренно до explicit release contract.

## P1.3 Stronger Flagship Case-Study Format — DONE

PR #34 / squash:

`107b69311f6eed408de5306406d9ff41f0e32ea2`

Exact head `edda2fbbf94b808f8955a2efb00e885dbb964040`, Build #301 / run `29958607263` fully green.

LivingWorld и NODE ZERO используют общий Markdown-first narrative contract:

1. Problem
2. Constraints
3. Decisions
4. What failed / corrected assumptions
5. Current state
6. Evidence
7. What I would change now

Project Registry/timeline/Evidence ownership сохранён; новый universal case-study engine не создан.

## P1.4 Additional Grounded Engineering Notes — DONE

PR #36 / squash:

`24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`

Exact implementation head:

`ced6ce0208d691fd891e8b8e1cf03be4c40465d5`

Build #308 / run `29961571632`: **fully green по полной configured matrix**.

### Реализовано

Добавлена note:

`llm-output-is-a-protocol-boundary`

Тема:

**provider success ≠ application contract success**.

Grounded facts проверены по текущему `True-Ruslan/minecraft-botics-ai`:

- strict parser config;
- trailing-token rejection;
- unknown fields/actions;
- scalar type/null rejection;
- no permissive coercion;
- bounded domain validation;
- duplicate/conflicting action rejection;
- strict JSON validation перед persistence policy/action authorization;
- bounded provider-degradation fallback.

Старые недоступные MCA-fork incidents не были превращены в неподтверждённые публичные claims.

### TDD trail

- Build #303 / run `29961363873` — expected RED после contract-first требования нового slug;
- Build #308 / run `29961571632` — final exact-head full matrix GREEN.

### Scope decision

Вторая generic voice-pipeline note не опубликована: она сейчас слишком сильно дублировала бы существующую `server-authoritative-ai-npcs`.

Notes architecture не менялась: Markdown + `data/notes.json` + existing build-time feed/search/sitemap/SEO.

---

# P2 — аудитория и эксплуатация

## P2.1 Minimal RU/EN — NEXT

### Почему сейчас

Foundation, evidence, freshness, quality infrastructure, flagship narrative и первая волна grounded technical writing уже стабилизированы.

Следующий high-value product step — сделать лучшие части portfolio доступными англоязычному читателю **без полного перевода всего knowledge space**.

### Initial scope

Первый EN layer ограничить:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Русский остаётся default language.

### Design questions до implementation

Отдельный spec должен решить:

1. **URL strategy**
   - отдельный `/en/` subtree или другой deterministic static routing;
   - никаких client-only language routes.

2. **Canonical / hreflang**
   - explicit RU/EN alternates;
   - корректные canonical URLs;
   - не создавать duplicate-content ambiguity.

3. **Authoring ownership**
   - shared machine-like registries не дублировать вручную;
   - language-specific prose хранить явно и version-controlled;
   - не строить CMS/i18n framework заранее.

4. **Navigation / switcher**
   - понятный language switch;
   - graceful no-JS behavior;
   - switch должен вести на semantic counterpart или честный fallback, а не угадывать nonexistent routes.

5. **Search**
   - Diplodoc остаётся владельцем full-text search;
   - не создавать второй search engine;
   - определить, нужен ли отдельный EN index или единый supported Diplodoc strategy.

6. **SEO/social**
   - metadata/OpenGraph для EN страниц;
   - hreflang/canonical/sitemap integration.

7. **Quality gates**
   - generated route integrity;
   - language-switch navigation;
   - no broken alternate links;
   - mobile/accessibility/cross-browser;
   - search/metadata regression.

### Critical boundary

**Не создавать два независимых вручную расходящихся сайта.**

Shared factual registries должны оставаться canonical там, где смысл language-neutral. Переводимый prose может иметь отдельные RU/EN sources, но ownership должен быть явным.

### Definition of Done

- initial EN scope полностью определён и реализован;
- Russian default behavior не сломан;
- deterministic static URLs;
- canonical/hreflang корректны;
- language switcher semantic/no-JS usable;
- project/evidence/notes data ownership не дублирован без необходимости;
- search strategy остаётся в границах Diplodoc;
- SEO/sitemap/social metadata интегрированы;
- full exact-head quality matrix green.

## P2.2 Privacy-friendly analytics

Только product-useful aggregate signals без invasive ad profiling/cookie surface.

Не добавлять аналитику «потому что у сайтов она есть». Сначала определить решения, которые реально будут приниматься по данным.

## P2.3 Custom domain / hosting

Отложено до реальной причины уходить с текущего GitHub Pages setup.

## P2.4 Richer architecture explorer

Расширять Engineering Map только при достаточном количестве реальных architecture artifacts.

Не строить 3D/canvas experience ради эффекта.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- полный перевод всего сайта одним milestone;
- отдельный CMS/i18n backend ради EN;
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
1. P2.1 Minimal RU/EN
        ↓
2. Privacy-friendly analytics only after a concrete measurement design
        ↓
3. Custom domain / hosting only when there is a real operational reason
        ↓
4. Richer architecture explorer only when real artifacts justify it
```

Независимый content track:

```text
First real Photo Story whenever genuine material is ready
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
