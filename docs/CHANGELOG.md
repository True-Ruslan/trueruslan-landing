# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-23**, после merge P1.4 Additional Grounded Engineering Notes PR #36.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-23

## P1.4 — Additional Grounded Engineering Notes

### Зачем

После P1.3 flagship case studies уже объясняли engineering reasoning человека, но roadmap оставлял ещё один content-depth шаг: добавить сильную note, основанную не на абстрактном AI-совете, а на реально проверяемом repository contract.

Предпочтительным кандидатом был класс ошибок structured LLM output: malformed / almost-correct JSON, неверные types/null/coercion и разница между provider success и application contract success.

### Обязательная source verification

До написания note был проверен текущий private repository:

`True-Ruslan/minecraft-botics-ai`

Verified source basis:

- `src/main/java/dev/trueruslan/livingworld/ai/AiDecisionParser.java`;
- `src/test/java/dev/trueruslan/livingworld/ai/AiDecisionParserTest.java`;
- `docs/ARCHITECTURE.md`;
- `docs/RC_E2E_RUNBOOK.md`.

Подтверждено кодом/tests/docs:

- `FAIL_ON_UNKNOWN_PROPERTIES`;
- `FAIL_ON_TRAILING_TOKENS`;
- `FAIL_ON_NULL_FOR_PRIMITIVES`;
- disabled float-to-int coercion;
- disabled scalar coercion;
- required-field validation;
- bounded speech/relationship/memory/action limits;
- exact action whitelist;
- duplicate/conflicting action rejection;
- negative tests для trailing tokens, strings/floats/nulls, null array elements и conflicts;
- architecture flow `LLM proposal -> strict JSON validation -> deterministic persistence policy -> live action authorization`;
- malformed provider response как explicit degradation scenario с bounded sanitized fallback и no unsafe state/world mutation.

### Evidence boundary

Старый MCA fork, где исторически встречались ранние provider/parser incidents, не был доступен через connected GitHub source во время P1.4.

Поэтому публичная note намеренно **не утверждает конкретные старые stack traces, exact payloads, release numbers или chronology как independently verified facts**.

Это сохранило repository-grounded характер content milestone.

### Design decision

Рассматривались варианты:

1. одна глубокая note про structured LLM output как external protocol boundary — **выбрано**;
2. одновременно добавить отдельную generic voice-pipeline note — отклонено из-за сильного overlap с `server-authoritative-ai-npcs`;
3. объединить STT/LLM/TTS/timeouts/parsing в одну omnibus provider-reliability note — отклонено как слишком широкий scope.

Design:

`docs/superpowers/specs/2026-07-23-llm-output-protocol-boundary-note-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-llm-output-protocol-boundary-note.md`

### Implementation

**PR #36 — `content: add grounded LLM protocol boundary note`**

Squash commit:

`24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`

Exact implementation head:

`ced6ce0208d691fd891e8b8e1cf03be4c40465d5`

Добавлена note:

`llm-output-is-a-protocol-boundary`

Публичный заголовок:

**«Почему успешный ответ LLM ещё не означает успешный контракт»**.

Главный lesson:

> **Provider success не равен contract success.**

Narrative разделяет уровни:

```text
transport/provider success
        ↓
syntax/schema validity
        ↓
domain contract validity
        ↓
persistence policy
        ↓
live action authorization
```

Note объясняет:

- почему `200 OK` ещё ничего не говорит о domain validity;
- почему trailing token делает «почти правильный» JSON invalid;
- почему `1`, `"1"`, `1.0` и `null` нельзя молча считать одним значением;
- почему permissive coercion на trust boundary скрывает protocol failure;
- почему parser — security/trust boundary, а не convenience helper;
- почему parsed `AiDecision` остаётся proposal;
- зачем persistence policy и action authorization отдельны;
- почему malformed response должен уходить в bounded deterministic fallback и не отравлять следующий healthy turn;
- почему negative contract tests фиксируют то, что система обещает **не интерпретировать**.

### Integration

Использована только существующая Notes architecture:

- Markdown source;
- `data/notes.json` canonical metadata/relations;
- Notes hub;
- `data/page-meta.json`;
- `docs/toc.yaml`;
- existing build-derived Atom/search/sitemap/SEO.

Relations:

- new note → `server-authoritative-ai-npcs`;
- new note → `green-ci-is-not-product-verification`;
- `server-authoritative-ai-npcs` → new note backlink.

Всего Engineering Notes после milestone: **7**.

### TDD

#### Build #303 — RED

Exact head:

`380ed5e267b05eb4a2fad1b7019121c13c0f46f5`

Run:

`29961363873`

Сначала `scripts/notes-content.test.js` был расширен обязательным slug:

`llm-output-is-a-protocol-boundary`

До production content `Test` ожидаемо упал; downstream build/browser gates были skipped.

#### Build #308 — final GREEN

Exact head:

`ced6ce0208d691fd891e8b8e1cf03be4c40465d5`

Run:

`29961571632`

Полностью green вся configured matrix:

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources Knowledge Base;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- diagnostics/evidence upload.

### Scope proof

Feature PR изменил ровно:

- `data/notes.json`;
- `data/page-meta.json`;
- `docs/landing/notes.md`;
- `docs/landing/notes/llm-output-is-a-protocol-boundary.md`;
- P1.4 design;
- P1.4 implementation plan;
- `docs/toc.yaml`;
- `scripts/notes-content.test.js`.

Не менялись:

- CSS;
- Notes renderer/build architecture;
- runtime APIs;
- visual baselines/thresholds;
- Lighthouse budgets;
- CI workflow ordering.

### Result

P1 maintainability/depth sequence завершена.

Следующий actionable roadmap priority:

**P2.1 — Minimal RU/EN**.

Первая настоящая Photo Story остаётся content-dependent/non-blocking.

---

# 2026-07-22

## P1.3 — Stronger Flagship Case-Study Format

**PR #34 — `content: strengthen flagship case-study narratives`**

Squash:

`107b69311f6eed408de5306406d9ff41f0e32ea2`

Exact head:

`edda2fbbf94b808f8955a2efb00e885dbb964040`

Build #301 / run `29958607263`: **fully green**.

LivingWorld и NODE ZERO получили общий Markdown-first contract:

`Problem → Constraints → Decisions → What failed → Current state → Evidence → What I would change now`.

Canonical Project Registry / timeline / Project Evidence ownership сохранён. Добавлен structural contract `scripts/flagship-case-study.test.js`.

TDD trail:

- Build #299 — RED до миграции;
- Build #300 — intermediate RED после LivingWorld;
- Build #301 — final full matrix GREEN.

---

## P1.2 — Project Metadata Cleanup

**PR #31 — `chore: align project metadata identity`**

Squash:

`1df2a2905ef2eb4b52173271f9012defc33b25ab`

Exact head `12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`, Build #296 / run `29954043887` fully green.

Результат:

- `private: true`;
- engineering portfolio / knowledge platform package identity;
- canonical repository/bugs URLs;
- modern keywords;
- metadata contract test;
- `version: 0.2.0` оставлен намеренно до explicit package-release contract.

---

## P1.1 — Consolidated Browser Quality Harness

**PR #29 — `refactor: consolidate browser quality harness`**

Squash:

`06e60425e31ef19ddae0c3ac8b0991808b45837e`

Exact head `00633c69e56354cbb8821c34a1b772cf259c3e18`, Build #293 / run `29951464481` fully green.

Создан modular `scripts/quality-harness/`; focused runners сохранили domain ownership; giant runner/DSL не создан.

---

## P0.6 — Content Freshness Guard

**PR #27 — `feat: add Content Freshness Guard`**

Squash:

`33770983789fbde5c59a94972709360286a06ad5`

Exact head `4b50dd78a41b3cbe2fce327e6c752508134862d0`, Build #269 / run `29947803201` fully green.

Guard обнаруживает age/link/repository/release/timeline/signal drift и создаёт maintenance report/issue, но никогда автоматически не переписывает public truth/trust state.

Operational caveat: первый фактический post-merge scheduled/manual run подтверждать отдельным run evidence.

### Repository-hygiene incident

Во время design setup был случайно создан временный `_never_` probe file прямым Contents API commit (`4f7ec91...`). Он был немедленно удалён cleanup commit `b5ce6e5...`.

Net tree effect: **zero**.

---

## P0.5 — Grounded Engineering Notes

**PR #25 — `feat: publish grounded Engineering Notes milestone`**

Squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head `8a2973961e5ec38e4c8b3e0626460c04e88438a8`, Build #257 / run `29943616448` fully green.

Добавлены:

1. `intersection-observer-giant-table`;
2. `static-first-sources-no-js`;
3. `green-ci-is-not-product-verification`.

---

## Portfolio v0.4 — Project Evidence Layer

**PR #22** / squash:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head `7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`, Build #247 / run `29935334882` fully green.

Созданы canonical evidence snapshots, `verified / stale / unverified`, bounded automated/manual signals и trust-aware rendering/QA.

Ключевой lesson:

**green CI не равно verified product без bounded scope и current manual interpretation.**

---

## Portfolio v0.4 — Sources Registry / Knowledge Base

**PR #20** / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Giant bibliography table заменена canonical `data/sources.json`: 31 real records, strict validation, deterministic semantic cards, page-local filtering, stable anchors, responsive/no-JS behavior.

Первый no-JS smoke обнаружил, что data в generated artifact не гарантирует readable content без hydration. Решение — semantic fallback без второго canonical source.

---

## Photo Stories — cinematic personal archive

**PR #15** — platform, squash `8aa2149fc8aec3751f2da73321c06a89111f9efd`.

**PR #17** — QA polish, squash `7936638bd6473ad4f1ff0b2ef42db2289e937d83`.

Готовы `/photos/`, album/archive registries, story routes, cinematic/editorial layouts, fullscreen lightbox, keyboard/touch/hash navigation, sitemap/search/meta integration и dedicated browser smoke.

Fake/demo album не создавался.

---

## Portfolio v0.3 — living engineering space

**PR #13** / squash:

`b472aff67d69fb3cd6afa0577864371547f52a5b`

Milestone закрепил переход от landing page к living engineering portfolio / knowledge platform:

- canonical Project Registry;
- `/now`;
- structured flagship timelines;
- Engineering Notes metadata/relations/feed;
- Engineering Map;
- command palette;
- stronger generated-site quality gates.

---

## Durable continuity updates

После крупных milestones durable state синхронизируется отдельными docs-only follow-ups, чтобы новый чат восстанавливал контекст из repository truth.

Актуальные источники контекста:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI поверх snapshot docs.
