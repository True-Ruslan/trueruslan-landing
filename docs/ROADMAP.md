# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-23**, после merge P2.2 Privacy-friendly analytics PR #40.
>
> Roadmap отвечает на вопрос **«что делать дальше, в каком порядке и зачем?»**.
> Текущее состояние — `docs/PROJECT_STATE.md`, история — `docs/CHANGELOG.md`.

## Принципы roadmap

Любое развитие должно сохранять:

- **static-first**;
- **build-time intelligence**;
- **progressive enhancement**;
- core content без runtime API и, где применимо, без JavaScript;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core content;
- no duplicate sources of truth;
- один site-wide full-text search owner — Diplodoc;
- maintenance signals не переписывают public truth автоматически;
- сначала реальные data/evidence, потом presentation;
- evidence не говорит больше bounded scope;
- analytics не становится runtime/product dependency;
- aggregate measurement не расширяется в behavioural tracking без нового explicit design/privacy review;
- shared infrastructure не скрывает domain ownership;
- quality gates не ослабляются ради velocity.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# P0 — foundation завершён

## P0.1 Photo Stories platform — DONE

PR #15 + QA polish PR #17. Canonical `/photos/`, registries, story routes, lightbox, keyboard/touch/hash navigation и dedicated QA готовы.

## P0.2 First real Photo Story — CONTENT DEPENDENT

Только при genuine material. Fake/demo albums не добавлять.

## P0.3 Sources Registry / Knowledge Base — DONE

PR #20 / squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.

31 real records, strict validation, semantic deterministic rendering, page-local filters, stable anchors, responsive/no-JS behavior.

## P0.4 Project Evidence Layer — DONE

PR #22 / squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`.

Exact head `7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`, Build #247 / run `29935334882` fully green.

**Green CI/release/PR никогда автоматически не делает project `verified`.**

## P0.5 Grounded Engineering Notes — DONE

PR #25 / squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.

## P0.6 Content Freshness Guard — DONE

PR #27 / squash `33770983789fbde5c59a94972709360286a06ad5`.

Exact head `4b50dd78a41b3cbe2fce327e6c752508134862d0`, Build #269 / run `29947803201` fully green.

Guard создаёт maintenance signals/report/issues, но не меняет public registries/trust state автоматически.

---

# P1 — maintainability и depth завершены

## P1.1 Consolidated Browser Quality Harness — DONE

PR #29 / squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.

Shared browser primitives вынесены в `scripts/quality-harness/`; focused runners сохранили ownership.

## P1.2 Project Metadata Cleanup — DONE

PR #31 / squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.

Package identity соответствует engineering portfolio / knowledge platform; `private: true`; `version: 0.2.0` намеренно не используется как product maturity indicator.

## P1.3 Stronger Flagship Case-Study Format — DONE

PR #34 / squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.

LivingWorld и NODE ZERO используют Markdown-first narrative:

`Problem → Constraints → Decisions → What failed → Current state → Evidence → What I would change now`.

Project Registry/timeline/Evidence ownership не дублируется.

## P1.4 Additional Grounded Engineering Notes — DONE

PR #36 / squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`.

Exact head `ced6ce0208d691fd891e8b8e1cf03be4c40465d5`, Build #308 / run `29961571632` fully green.

Добавлена `llm-output-is-a-protocol-boundary`; всего Engineering Notes — 7.

---

# P2 — audience и эксплуатация

## P2.1 Minimal RU/EN — DONE

Feature PR #38 / squash:

`00f7513f685b8a8348005d0ab704ce96abe64950`

Exact implementation head:

`d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`

Build #339 / run `30000373281`: **fully green по полной configured matrix**.

Реализовано ровно 7 RU/EN pairs при архитектуре **one build / one site / one search index**. Русский остаётся default/root; `/en/` — bounded namespace; shared Registry/Evidence/timelines/Notes truth не дублируется.

Design:

`docs/superpowers/specs/2026-07-23-minimal-ru-en-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-minimal-ru-en.md`

---

## P2.2 Privacy-friendly analytics — DONE (implementation)

Feature PR #40 / squash:

`2dacace5de6b6c1225e82b372faef093850f4c9f`

Exact implementation head:

`577fe9149988497d954f8ad9316467089ce50286`

Build #351 / run `30003347268`: **fully green по полной configured matrix**.

### Measurement decision

Выбран минимальный вопрос-first analytics scope:

1. какие public routes реально используются;
2. как распределяется usage между default/RU и `/en/`;
3. какие surfaces могут оправдать дальнейший translation/content investment;
4. какой real-user performance/Core Web Vitals получают посетители.

Analytics не добавлена «потому что так принято» и не используется для user journeys, personalization или advertising attribution.

### Provider / architecture

Выбран:

**Cloudflare Web Analytics manual beacon**.

Canonical policy:

`data/analytics.json`

Implementation:

`scripts/analytics.js`

Production activation env:

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

Ключевой contract:

**no token → successful build + zero analytics beacons + zero analytics network capability.**

`copy-assets.js` остаётся единственным postprocess/build orchestrator.

### Privacy boundary

Policy и tests запрещают:

- custom events;
- cookies;
- persistent browser-storage identifiers;
- cross-site tracking;
- session replay.

Также integration не добавляет:

- user/account IDs;
- fingerprinting;
- advertising audiences;
- analytics-driven product behavior.

Любое расширение beyond `pageviews-and-rum` требует нового explicit design/privacy review.

### RU/EN semantics

Одна analytics layer для всего сайта.

Locale определяется существующим route structure:

- `/en/**` → EN;
- root/`landing/**` → default/RU.

Не создавались locale cookies, user identity или отдельная EN analytics system/property path.

### Failure semantics

Analytics является optional enhancement.

При blocker/network/provider failure:

- content работает;
- navigation работает;
- search работает;
- language switching работает;
- product state не зависит от telemetry.

### Dedicated quality gate

Добавлен обязательный:

`Privacy-friendly analytics browser smoke`

Он:

1. проверяет 0 beacons в normal CI build;
2. создаёт временный fixture;
3. внедряет fixed fake token;
4. блокирует Cloudflare analytics endpoints;
5. проверяет RU/EN/search surfaces;
6. проверяет единый bounded config;
7. проверяет отсутствие analytics-related cookies/storage;
8. проверяет blocked-network product behavior;
9. проверяет overflow + Axe.

### TDD / debugging trail

- Build #341 — RED policy contract;
- Build #343 — policy/token GREEN;
- Build #344 — RED injection contract;
- Build #345 — injection/build/integrity GREEN;
- Build #346 — RED orchestrator integration contract;
- Build #347 — integration GREEN, tokenless default preserved;
- Build #350 — browser RED: test model ошибочно ожидал `<main>` на generated search surface;
- root cause исправлен по existing search contract без ослабления privacy assertions;
- Build #351 — final exact-head full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-23-privacy-friendly-analytics-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-privacy-friendly-analytics.md`

Operator runbook:

`docs/ANALYTICS.md`

---

## P2.2a Production analytics activation — NEXT / EXTERNAL OPERATIONAL DEPENDENCY

Это **не новый code feature**. Implementation уже готова и проверена.

Actual production analytics пока нельзя считать активной или verified.

Нужно:

1. подтвердить фактический production deployment mechanism;
2. создать/configure Cloudflare Web Analytics site для actual production hostname;
3. получить реальный public site token;
4. передать его production build environment как `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
5. rebuild/redeploy;
6. проверить generated beacon на deployed artifact;
7. подтвердить фактическое появление telemetry в provider dashboard.

Fake token нельзя использовать как production evidence.

### После activation

Сначала собрать реальный aggregate signal, затем принимать следующую product decision.

Не расширять event model заранее и не начинать следующий feature только ради заполнения roadmap.

---

## P2.3 Custom domain / hosting — CONDITIONAL

Делать только если появится реальная operational причина:

- cleaner public identity;
- analytics/deployment need;
- caching/security/headers/redirects constraints;
- GitHub Pages перестаёт удовлетворять требованиям.

Сам факт существования roadmap item не является причиной миграции.

## P2.4 Richer architecture explorer — CONDITIONAL

Только когда накопится достаточно реальных architecture artifacts и есть доказанная audience/content value. Не строить 3D/canvas experience ради эффекта.

## Further RU/EN expansion — EVIDENCE-DRIVEN

Переводить следующие surfaces только при реальном usage/content signal. Не превращать Minimal RU/EN в механический full-site translation backlog.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- полный перевод всего сайта одним milestone;
- отдельный EN build/CMS;
- второй site-wide search engine;
- advertising analytics;
- custom-event explosion;
- cross-site tracking;
- fingerprinting;
- session replay;
- per-user analytics;
- AI chat поверх резюме;
- accounts/comments/likes;
- backend/database ради static content;
- runtime GitHub API;
- social feed/infinite scroll;
- automatic public-state mutation из CI/release/freshness signals;
- giant QA runner;
- decorative version bumps.

---

# Оптимальная последовательность

```text
1. P2.2a Activate existing privacy analytics in real production
        ↓
2. Verify actual telemetry and observe aggregate usage/performance
        ↓
3. Choose the next product milestone from evidence, not roadmap inertia
```

Possible evidence-driven branches after observation:

```text
P2.3 Custom domain / hosting       — only with operational reason
P2.4 Architecture explorer         — only with enough real artifacts/value
Selective RU/EN/content expansion  — only with audience signal
```

Independent content track:

```text
First real Photo Story whenever genuine material is ready
```

Operational side-check:

- actual production deployment подтверждать отдельно от merge;
- actual analytics activation/first telemetry подтверждать отдельно от implementation;
- Content Freshness actual scheduled/manual run подтверждать отдельно.

## Правило при новом чате

Перед новым milestone:

1. открыть `docs/PROJECT_STATE.md`;
2. открыть `docs/ROADMAP.md`;
3. открыть `docs/CHANGELOG.md`;
4. проверить actual open PR/latest commits/exact-head CI;
5. если речь о production — проверить deployed endpoint/deployment mechanism;
6. если речь об analytics — проверить actual token activation + provider telemetry;
7. если речь о freshness — проверить latest Content Freshness workflow runs/issues.
