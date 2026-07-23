# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-23**, после merge P2.2 Privacy-friendly analytics PR #40.
>
> Главный durable snapshot для ответа на вопрос **«что сейчас представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> Затем всегда проверять actual open PR, latest commits и exact-head CI. Production deployment, analytics activation и реальные maintenance-workflow runs подтверждать отдельно.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project case studies;
- `/now`;
- Engineering Notes + Atom;
- Engineering Map;
- один локальный полнотекстовый поиск + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- ограниченный RU/EN bilingual layer;
- optional privacy-friendly analytics layer;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

---

## 2. Текущее состояние `master`

### Последний milestone

**P2.2 — Privacy-friendly analytics**.

Feature PR #40:

`feat: add privacy-friendly analytics`

Squash commit:

`2dacace5de6b6c1225e82b372faef093850f4c9f`

Exact implementation head:

`577fe9149988497d954f8ad9316467089ce50286`

Verification:

**Build #351 / run `30003347268`: fully green по полной configured matrix.**

### Что реализовано в P2.2

Выбран bounded analytics model:

**Cloudflare Web Analytics manual beacon + pageviews/RUM only + build-time opt-in**.

Цель аналитики — отвечать только на aggregate product questions:

1. какие public routes реально используются;
2. как распределяется usage между default/RU и `/en/` routes;
3. какие surfaces заслуживают дальнейшего translation/content investment;
4. какой real-user performance/Core Web Vitals получают посетители.

Analytics не используется для персонализации, user journeys, advertising attribution или индивидуального tracking.

### Canonical analytics policy

Добавлен:

`data/analytics.json`

Policy фиксирует:

- provider: `cloudflare-web-analytics`;
- measurement: `pageviews-and-rum`;
- activation: `token-required`;
- custom events: forbidden;
- cookies: forbidden;
- persistent storage identifiers: forbidden;
- cross-site tracking: forbidden;
- session replay: forbidden.

Build-time implementation:

`scripts/analytics.js`

Он:

- строго валидирует policy;
- нормализует/валидирует optional site token;
- без token возвращает analytics-disabled state и не меняет HTML;
- с token детерминированно внедряет ровно один owned beacon на generated HTML page;
- idempotent;
- malformed configured token превращает в bounded build error.

### Activation boundary

Production token не хранится в canonical repository data.

Activation environment variable:

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

Ключевая гарантия:

**без этой переменной normal build полностью analytics-free.**

То есть:

- CI/PR builds не отправляют analytics;
- generated HTML не содержит `data-tr-analytics="cloudflare-web-analytics"`;
- analytics network capability отсутствует.

При configured token existing `scripts/copy-assets.js` остаётся единственным postprocess orchestrator и внедряет Cloudflare beacon в конце normal build pipeline.

### Privacy boundary

TrueRuslan integration не добавляет:

- custom click/event tracking;
- user/account IDs;
- cookies;
- localStorage/sessionStorage analytics IDs;
- persistent visitor IDs;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- analytics-driven product behavior.

Любое расширение beyond `pageviews-and-rum` требует нового design/privacy decision.

### RU/EN boundary

Существует **одна analytics system/property path для всего сайта**.

Language/locale различается уже существующим public route structure:

- `/en/**` → EN;
- root/`landing/**` → default/RU.

Не создано:

- отдельной EN analytics property/system;
- locale cookie;
- user identity для locale attribution.

### Failure semantics

Analytics — optional enhancement, не runtime dependency.

Если beacon:

- заблокирован privacy/ad blocker;
- не загружается;
- network unavailable;

то content, navigation, search и language switching продолжают работать независимо.

### Dedicated analytics quality gate

Добавлен:

`scripts/analytics-browser-smoke.cjs`

и обязательный CI step:

`Privacy-friendly analytics browser smoke`

Gate:

1. доказывает, что normal CI artifact содержит 0 analytics beacons;
2. копирует `docs-html` во временный fixture;
3. внедряет только fixed fake token;
4. блокирует Cloudflare analytics endpoints, чтобы CI не отправлял real telemetry;
5. проверяет RU, EN и generated search surfaces;
6. проверяет единый bounded provider/token config;
7. проверяет отсутствие analytics-related cookies/storage keys;
8. проверяет product behavior при blocked analytics;
9. проверяет overflow и serious/critical Axe contract.

### TDD / debugging trail P2.2

- Build #341 / run `30002195925` — RED: policy contract раньше implementation;
- Build #343 — policy/token GREEN checkpoint;
- Build #344 / run `30002327923` — RED: injection contract раньше implementation;
- Build #345 — deterministic injection + build/integrity GREEN checkpoint;
- Build #346 / run `30002524534` — RED: single-orchestrator integration contract раньше wiring;
- Build #347 — build integration GREEN checkpoint, tokenless default preserved;
- Build #350 / run `30002983283` — browser RED: analytics smoke неверно предположил `<main>` на generated search surface;
- root cause подтверждён preserved log; search уже имеет собственный canonical `#root + search input` contract;
- smoke model исправлен без ослабления privacy/blocking/storage/cookie assertions;
- Build #351 / run `30003347268` — final exact-head full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-23-privacy-friendly-analytics-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-privacy-friendly-analytics.md`

Operator runbook:

`docs/ANALYTICS.md`

### Operational status

**Implementation DONE; actual production analytics activation NOT YET VERIFIED.**

Причина честная и намеренная: в доступном repository/project context нет реального Cloudflare Web Analytics site token для фактического production hostname. Fake token не коммитился и production identity не выдумывалась.

Для real activation нужно отдельно:

1. создать/configure Cloudflare Web Analytics site для actual production hostname;
2. получить public site token;
3. передать его в environment, который реально выполняет production build;
4. rebuild/redeploy;
5. проверить generated beacon + фактическое появление telemetry в provider dashboard.

До этого production remains analytics-free by design.

---

## 3. Архитектурные принципы

Главная граница:

**static-first + build-time intelligence + progressive enhancement**.

Без отдельного design decision нельзя ломать:

- core content без runtime API;
- JS как enhancement, а не единственный источник содержания;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core public content;
- no build-time GitHub API dependency в основном site build;
- один canonical source of truth на сущность;
- deterministic build-time generation;
- semantic/no-JS content;
- Diplodoc владеет единственным site-wide full-text search index;
- maintenance signals не переписывают public truth автоматически;
- evidence не говорит больше bounded scope;
- analytics не становится product dependency;
- quality gates не ослабляются ради feature velocity.

Bilingual-specific rule:

**не превращать RU/EN в два независимо расходящихся сайта.**

Analytics-specific rule:

**не превращать aggregate measurement в behavioural/user tracking без нового explicit design/privacy review.**

---

## 4. Canonical data и build architecture

Основные registries/configs:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — flagship timelines;
- `data/project-evidence.json` — controlled evidence snapshots;
- `data/now.json`;
- `data/notes.json` — Notes metadata/relations;
- `data/engineering-graph.json`;
- `data/page-meta.json` — SEO/social metadata;
- `data/i18n.json` — только RU/EN route pairing;
- `data/analytics.json` — только bounded analytics policy;
- `data/photo-albums.json`;
- `data/photo-archive.json`;
- `data/sources.json`;
- `data/external-links.json`.

Главный build/postprocess orchestrator:

`scripts/copy-assets.js`

Quality shared infrastructure:

`scripts/quality-harness/`

Focused quality:

- `scripts/i18n.test.js`;
- `scripts/i18n-browser-smoke.cjs`;
- `scripts/analytics.test.js`;
- `scripts/analytics-browser-smoke.cjs`.

Freshness maintenance:

- `scripts/content-freshness.js`;
- `scripts/content-freshness-report.js`;
- `scripts/content-freshness-probe.js`;
- `.github/workflows/content-freshness.yml`.

---

## 5. Реализованные milestones

### P0 — foundation

- **P0.1 Photo Stories platform — DONE**: PR #15 + QA PR #17.
- **P0.2 First real Photo Story — CONTENT DEPENDENT**.
- **P0.3 Sources Registry / KB — DONE**: PR #20, squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.
- **P0.4 Project Evidence — DONE**: PR #22, squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`, Build #247.
- **P0.5 Grounded Notes — DONE**: PR #25, squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.
- **P0.6 Content Freshness Guard — DONE**: PR #27, squash `33770983789fbde5c59a94972709360286a06ad5`, Build #269.

### P1 — maintainability / depth

- **P1.1 Browser Quality Harness — DONE**: PR #29, squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.
- **P1.2 Project Metadata Cleanup — DONE**: PR #31, squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.
- **P1.3 Flagship Case-Study Format — DONE**: PR #34, squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.
- **P1.4 Additional Grounded Note — DONE**: PR #36, squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`, Build #308.

### P2 — audience / operations

- **P2.1 Minimal RU/EN — DONE**: PR #38, squash `00f7513f685b8a8348005d0ab704ce96abe64950`, Build #339.
- **P2.2 Privacy-friendly analytics implementation — DONE**: PR #40, squash `2dacace5de6b6c1225e82b372faef093850f4c9f`, Build #351.
- **P2.2a Production analytics activation — EXTERNAL/OPERATIONAL DEPENDENCY**.

---

## 6. Quality architecture и exact evidence

Configured matrix сейчас включает:

- `npm test`;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources KB;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- Minimal RU EN browser smoke;
- **Privacy-friendly analytics browser smoke**;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- diagnostics/evidence upload.

Latest feature exact head:

`577fe9149988497d954f8ad9316467089ce50286`

Build #351 / run `30003347268`:

**fully green по всей configured matrix**.

P2.2 не менял:

- dependency/package-lock graph;
- visual baselines/thresholds;
- Lighthouse budgets;
- search engine ownership;
- Project Evidence/trust semantics;
- RU/EN source-of-truth architecture.

---

## 7. Незавершённые части / technical debt

### P2.2a — Production analytics activation — NEXT operational action

Не является новым code feature.

Нужно сначала resolve actual production deployment path + Cloudflare site token, затем включить existing build-time integration и подтвердить real telemetry.

До получения реальных aggregate данных **не расширять analytics event model и не строить новые features только ради наличия roadmap item**.

### Content-dependent

Первая настоящая Photo Story отсутствует. Fake/demo album не добавлять.

### Operational caveats

- actual GitHub Pages deployment после последних merges отдельно не подтверждён этим snapshot;
- actual Cloudflare Web Analytics activation/first telemetry отдельно не подтверждены;
- первый реальный post-merge Content Freshness scheduled/manual run отдельно не подтверждён этим snapshot.

### Versioning

`version: 0.2.0` не является product maturity indicator; без explicit package release contract не bump’ать механически.

### Conditional future work

- custom domain / alternative hosting — только при operational need;
- richer architecture explorer — только при достаточном количестве real architecture artifacts;
- further EN translation — только по actual content/audience evidence.

---

## 8. Следующий оптимальный этап

### Сначала — production analytics activation и observation

Правильная последовательность:

1. определить фактический production deployment mechanism;
2. создать Cloudflare Web Analytics site для actual hostname;
3. configure `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` в production build environment;
4. rebuild/redeploy;
5. подтвердить beacon/telemetry;
6. собрать достаточно aggregate evidence, чтобы следующая product decision была data-informed.

До этого не нужно автоматически начинать P2.3/P2.4.

После появления реального operational/product signal выбирать между:

- P2.3 custom domain/hosting — если есть operational reason;
- P2.4 richer architecture explorer — если real architecture artifacts уже оправдывают complexity;
- selective further RU/EN/content work — если usage показывает ценность;
- first genuine Photo Story — когда есть authentic material.

---

## 9. Намеренные архитектурные запреты

Без нового design decision не добавлять:

- backend/CMS/database ради static content;
- runtime GitHub API;
- второй site-wide search engine;
- второй независимый EN site/build;
- automatic machine translation как source of public truth;
- advertising analytics / cross-site tracking / fingerprinting / session replay;
- custom analytics event explosion без доказанной decision value;
- accounts/comments/likes;
- AI chat поверх резюме как gimmick;
- automatic mutation public trust state;
- giant QA runner;
- decorative package version bumps.

---

## 10. Как восстановить контекст в новом чате

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

Всегда дополнительно проверять:

- open PR;
- latest commits;
- latest exact-head CI;
- actual production deployment, если вопрос касается production;
- actual analytics activation/telemetry, если вопрос касается analytics;
- latest Content Freshness workflow runs/issues, если вопрос касается freshness monitoring.
