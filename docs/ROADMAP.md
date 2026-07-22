# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P1.3 Stronger Flagship Case-Study Format PR #34.
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
- narrative не дублирует canonical machine-like current/trust facts;
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

Создан `scripts/quality-harness/` с shared infrastructure primitives. Focused runners остались focused; giant monolithic runner/DSL не создавался. `visual-regression.cjs` намеренно оставлен отдельным.

## P1.2 Project metadata cleanup — DONE

PR #31 / squash:

`1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact implementation head:

`12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`

Build #296 / run `29954043887`: **fully green по полной configured matrix**.

Реализовано:

- package identity → engineering portfolio / knowledge platform;
- `private: true`;
- canonical repository/bugs URLs;
- modern keywords;
- metadata contract test;
- `version: 0.2.0` оставлен намеренно до explicit package-release contract.

## P1.3 Stronger flagship case-study format — DONE

PR #34 / squash:

`107b69311f6eed408de5306406d9ff41f0e32ea2`

Exact implementation head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

Build #301 / run `29958607263`: **fully green по полной configured matrix**.

### Реализовано

LivingWorld и NODE ZERO переведены на общий Markdown-first narrative contract:

1. Problem
2. Constraints
3. Decisions
4. What failed / corrected assumptions
5. Current state
6. Evidence
7. What I would change now

### Critical source-of-truth boundary

Существующие owners сохранены:

- `data/projects.json` — identity/status/summary/links/tags;
- `data/project-history/*.json` — structured evolution;
- `data/project-evidence.json` — trust/current verification;
- Markdown — human-authored reasoning и retrospective.

Не создан новый case-study registry/renderer/CMS/schema.

### Contract protection

`scripts/flagship-case-study.test.js` проверяет:

- семь stable section markers;
- canonical order;
- timeline placeholder ровно один раз;
- Project Evidence placeholder ровно один раз;
- architecture diagram ровно один раз;
- controlled flagship set `livingworld`, `node-zero`.

### TDD trail

- Build #299 / run `29958395678` — RED до миграции;
- Build #300 / run `29958496645` — промежуточный RED после LivingWorld;
- Build #301 / run `29958607263` — final full matrix GREEN.

### Что не менялось

- project/timeline/evidence registries;
- CSS;
- build/postprocess renderers;
- routes;
- visual baselines/thresholds;
- CI workflow order/budgets.

Design:

`docs/superpowers/specs/2026-07-22-flagship-case-study-format-design.md`

Plan:

`docs/superpowers/plans/2026-07-22-flagship-case-study-format.md`

---

## P1.4 Additional grounded Engineering Notes — NEXT

### Почему сейчас

После P1.3 основные flagship pages уже объясняют человеческий engineering reasoning, а infrastructure/evidence/freshness/quality layers стабилизированы.

Следующий низкорисковый high-value шаг — добавить ещё 1–2 сильных Engineering Notes на основе реальных repository incidents/decisions, а не SEO-контента ради количества.

### Обязательная первая стадия — source verification

До написания note:

1. определить candidate incident/decision;
2. открыть соответствующий repository/docs/PR/commits/tests;
3. отделить факты от памяти/интерпретации;
4. проверить, что тема не дублирует существующие 6 notes;
5. только после этого фиксировать narrative.

### Candidate A — malformed / almost-correct LLM JSON

Предпочтительный первый кандидат для проверки.

Потенциальный engineering lesson:

- structured LLM output — внешний protocol boundary;
- «почти валидный JSON» не должен просачиваться в user-visible response/state;
- parsing/validation/fallback должны быть explicit;
- provider success ≠ contract success;
- malformed fields/null content/JSON tails требуют bounded recovery rather than unchecked casts/string concatenation.

Важно: конкретные incidents и claims писать только после проверки исходного repository history.

### Candidate B — Minecraft NPC voice pipeline

Проверять только если новая note даст самостоятельный lesson и не станет пересказом существующей:

`server-authoritative-ai-npcs`

Возможный уникальный angle — end-to-end voice degradation/latency/identity/acceptance boundary, но решение принимать только после source verification.

### Implementation direction

Сохранить существующую Notes architecture:

- Markdown source в `docs/landing/notes/*.md`;
- canonical metadata/relations в `data/notes.json`;
- existing Diplodoc/build-time postprocess;
- Atom feed;
- TOC/search/sitemap/SEO integration;
- no second renderer/search index/CMS.

### Definition of Done

- 1–2 новые notes основаны на реально проверенных repository facts;
- у каждой есть конкретный problem/failure/decision/takeaway;
- нет invented incidents/metrics;
- нет смыслового дубля существующих notes;
- metadata/relations/feed/search/SEO integrated;
- content contract updated;
- full exact-head quality matrix green.

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
- универсальный case-study engine без repeated need;
- декоративные version bumps без release semantics.

---

# Оптимальная последовательность следующих действий

```text
1. P1.4 Additional grounded Engineering Notes
   └─ сначала cross-repository source verification
        ↓
2. First real Photo Story whenever genuine material is ready (non-blocking)
        ↓
3. Minimal EN / privacy analytics / custom domain later
        ↓
4. Richer architecture explorer only when real artifacts justify it
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
