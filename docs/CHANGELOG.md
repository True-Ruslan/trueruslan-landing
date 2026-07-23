# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-23**, после merge P2.2 Privacy-friendly analytics PR #40.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы: **что сделали, зачем, какие решения приняли, какие проблемы обнаружили и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-23

## P2.2 — Privacy-friendly analytics

### Зачем

После bilingual milestone сайт уже имел достаточно зрелые content, evidence, SEO и quality layers, чтобы следующий шаг был не очередным feature ради roadmap, а попыткой получить минимальный реальный usage/performance signal.

Цель P2.2 — ответить только на четыре aggregate question:

1. какие public routes реально используются;
2. как распределяется usage между default/RU и `/en/`;
3. какие surfaces могут оправдать дальнейший translation/content investment;
4. какой real-user performance/Core Web Vitals получают посетители.

### Provider / design decision

Выбран:

**Cloudflare Web Analytics manual beacon**.

Причины:

- соответствует bounded pageview/RUM scope;
- не требует нового application backend;
- не требует отдельной analytics infrastructure;
- не требует duplicate RU/EN analytics system;
- позволяет сохранить analytics как optional enhancement.

Отклонены для этого milestone:

- Plausible Cloud — сильный privacy-friendly вариант, но richer/paid functionality была избыточна для текущих decision questions;
- self-hosted analytics — создаёт server/upgrade/backup/security/availability ownership без достаточной необходимости.

Design:

`docs/superpowers/specs/2026-07-23-privacy-friendly-analytics-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-privacy-friendly-analytics.md`

Operator runbook:

`docs/ANALYTICS.md`

### Feature implementation

**PR #40 — `feat: add privacy-friendly analytics`**

Squash:

`2dacace5de6b6c1225e82b372faef093850f4c9f`

Exact implementation head:

`577fe9149988497d954f8ad9316467089ce50286`

Final verification:

**Build #351 / run `30003347268`: fully green по полной configured matrix.**

### Canonical privacy policy

Добавлен:

`data/analytics.json`

Policy фиксирует:

- provider: `cloudflare-web-analytics`;
- measurement: `pageviews-and-rum`;
- activation: `token-required`;
- custom events: `false`;
- cookies: `false`;
- persistent storage: `false`;
- cross-site tracking: `false`;
- session replay: `false`.

Policy строго валидируется; unknown/expanded privacy fields не принимаются молча.

### Build-time integration

Добавлен:

`scripts/analytics.js`

Ключевой contract:

**без `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` analytics полностью отсутствует из generated artifact.**

Tokenless build:

- проходит успешно;
- HTML остаётся без analytics beacon;
- CI/PR builds не имеют analytics network capability.

Token-enabled build:

- использует тот же `scripts/copy-assets.js` orchestrator;
- внедряет один owned Cloudflare module/defer beacon на HTML page;
- deterministic;
- idempotent;
- malformed configured token приводит к bounded build error.

Real production token не коммитился и не выдумывался.

### Privacy boundary

TrueRuslan integration не добавляет:

- custom click/event tracking;
- user/account IDs;
- analytics cookies;
- localStorage/sessionStorage analytics IDs;
- persistent visitor IDs;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- analytics-driven personalization/product behavior.

Любое расширение beyond `pageviews-and-rum` требует нового explicit design/privacy review.

### RU/EN semantics

Одна analytics layer для всего сайта.

Locale уже выражен URL structure:

- `/en/**` → EN;
- root/`landing/**` → default/RU.

Не создавались locale cookie, user identity или отдельная EN analytics property/system.

### Failure behavior

Analytics остаётся optional telemetry.

При ad/privacy blocker, network failure или unavailable provider:

- content не зависит от analytics;
- navigation не зависит от analytics;
- search не зависит от analytics;
- language switching не зависит от analytics;
- никаких product retry/state semantics вокруг analytics не создаётся.

### Dedicated privacy/failure gate

Добавлен:

`scripts/analytics-browser-smoke.cjs`

и обязательный CI step:

`Privacy-friendly analytics browser smoke`

Gate:

1. доказывает 0 analytics beacons в normal CI artifact;
2. создаёт temporary copy;
3. внедряет только fixed fake token;
4. блокирует Cloudflare analytics network endpoints;
5. проверяет RU, EN и generated search;
6. проверяет exact bounded beacon config;
7. проверяет отсутствие analytics-related cookies/storage;
8. проверяет продукт при blocked analytics;
9. проверяет overflow + serious/critical Axe.

CI никогда не отправляет real analytics через этот gate.

### TDD / debugging trail

#### Build #341 — expected RED

Run `30002195925`.

Policy tests появились до `scripts/analytics.js`; `Test` failed, downstream skipped.

#### Build #343 — GREEN checkpoint

Strict policy/token contract passed.

#### Build #344 — expected RED

Run `30002327923`.

Deterministic injection contract появился до injection implementation.

#### Build #345 — GREEN checkpoint

Injection tests + production build + integrity passed.

#### Build #346 — expected RED

Run `30002524534`.

`postprocessOutput()` ещё не владел analytics integration contract.

#### Build #347 — GREEN checkpoint

Single-orchestrator integration passed; tokenless production default preserved.

#### Build #350 — browser RED

Run `30002983283`.

Все старые gates до analytics step были green. Новый analytics smoke упал на generated search, потому что тест ошибочно предполагал наличие `<main>` на каждой generated surface.

Root cause подтверждён preserved log и сравнением с canonical `search-smoke.cjs`: Diplodoc search рендерится через `#root` + search input.

Исправлена модель теста, а не privacy assertions:

- all surfaces требуют non-empty body;
- normal pages сохраняют `main + H1` contract;
- search требует visible search input;
- cookie/storage/blocking/config/overflow/Axe assertions не ослаблены.

#### Build #351 — final GREEN

Exact head:

`577fe9149988497d954f8ad9316467089ce50286`

Run:

`30003347268`

Полностью green:

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources KB;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- Firefox/WebKit;
- generated search;
- Minimal RU EN browser smoke;
- **Privacy-friendly analytics browser smoke**;
- Metadata/OpenGraph;
- Engineering Map;
- unchanged visual regression;
- quality evidence upload.

### Production activation status

**Implementation завершена; actual production analytics activation не подтверждена.**

Причина: реального Cloudflare Web Analytics site token для actual production hostname в доступном project context нет.

Нельзя считать feature operationally active только по факту merge.

Для activation нужно отдельно:

1. подтвердить actual production deployment mechanism;
2. создать/configure Cloudflare Web Analytics site;
3. получить public site token;
4. передать его production build environment как `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
5. rebuild/redeploy;
6. проверить generated beacon и actual provider telemetry.

До этого production остаётся analytics-free by design.

### Architecture preserved

Не изменялись:

- dependency/package-lock graph;
- visual baselines/thresholds;
- Lighthouse budgets;
- Project Evidence/trust semantics;
- one-search boundary;
- RU/EN source-of-truth architecture.

Не добавлялись:

- backend/CMS/database;
- self-hosted analytics infra;
- custom events;
- cookie banner без технической необходимости;
- runtime analytics dependency.

### Result

P2.2 code milestone закрыт.

Следующий правильный шаг — **P2.2a production activation + observation**, а не автоматический новый feature.

После реальных aggregate data следующая product decision должна быть evidence-driven.

---

## P2.1 — Minimal RU/EN

**PR #38 — `feat: add minimal RU EN portfolio layer`**

Squash `00f7513f685b8a8348005d0ab704ce96abe64950`.

Exact head `d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`, Build #339 / run `30000373281` fully green.

Реализованы ровно 7 bilingual pairs при one-build/one-search/shared-truth architecture. Новый bilingual Axe gate также обнаружил и помог исправить hydrated Diplodoc accessible-name/scrollable-code defects без ослабления Axe.

---

## P1.4 — Additional Grounded Engineering Notes

PR #36 / squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`.

Exact head `ced6ce0208d691fd891e8b8e1cf03be4c40465d5`, Build #308 / run `29961571632` fully green.

Добавлена `llm-output-is-a-protocol-boundary`. Главный lesson: **provider success ≠ application contract success**.

---

# 2026-07-22

## P1.3 — Stronger Flagship Case-Study Format

PR #34 / squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.

LivingWorld и NODE ZERO получили общий Markdown-first contract:

`Problem → Constraints → Decisions → What failed → Current state → Evidence → What I would change now`.

Canonical Registry/timeline/Evidence ownership сохранён.

## P1.2 — Project Metadata Cleanup

PR #31 / squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.

Package identity приведён к engineering portfolio / knowledge platform; `private: true`; version не используется как maturity indicator.

## P1.1 — Consolidated Browser Quality Harness

PR #29 / squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.

Создан modular `scripts/quality-harness/`; focused runners сохранили domain ownership.

## P0.6 — Content Freshness Guard

PR #27 / squash `33770983789fbde5c59a94972709360286a06ad5`, Build #269.

Guard обнаруживает drift, но не переписывает public truth/trust автоматически.

Repository-hygiene incident: временный `_never_` probe commit `4f7ec91...` был немедленно удалён cleanup `b5ce6e5...`; net tree effect zero.

## P0.5 — Grounded Engineering Notes

PR #25 / squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.

Добавлены repository-grounded Notes:

- `intersection-observer-giant-table`;
- `static-first-sources-no-js`;
- `green-ci-is-not-product-verification`.

## Portfolio v0.4 — Project Evidence Layer

PR #22 / squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`, Build #247.

Canonical evidence snapshots, `verified / stale / unverified`, bounded signals, trust-aware rendering/QA.

Key lesson: **green CI не равно verified product без bounded scope и current interpretation**.

## Portfolio v0.4 — Sources Registry / Knowledge Base

PR #20 / squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.

31 real records, canonical `data/sources.json`, strict validation, semantic cards, filters, stable anchors, responsive/no-JS fallback.

## Photo Stories

PR #15 platform / squash `8aa2149fc8aec3751f2da73321c06a89111f9efd`.

PR #17 QA / squash `7936638bd6473ad4f1ff0b2ef42db2289e937d83`.

Platform готова; fake/demo album не создавался.

## Portfolio v0.3 — living engineering space

PR #13 / squash `b472aff67d69fb3cd6afa0577864371547f52a5b`.

Закреплён переход от landing page к living engineering portfolio / knowledge platform: Project Registry, `/now`, timelines, Engineering Notes/feed, Engineering Map, command palette и stronger generated-site QA.

---

## Durable continuity principle

После крупных milestones состояние синхронизируется в:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

Эти docs — snapshot, не замена actual repository checks. В новом чате поверх них всегда проверять open PR, latest commits, exact-head CI и отдельно operational facts вроде deployment/analytics/freshness runs.
