# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-02**, после публикации External Publications Showcase.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-02

## P2.4e — External Publications Showcase

PR #61 опубликовал самостоятельный раздел **«Публикации и выступления»** для completed, externally verifiable work.

```text
feature PR:          #61
exact feature head:  1386df46b57d5c9164a13039a286cafb1f296037
Build / run:         #539 / 30757856207 SUCCESS
squash on master:    4036df1744840e558a6514ce6ae09eceb624b69e
unit tests:          300 PASS / 0 FAIL
artifact id:         8836540794
artifact digest:     sha256:d69dd36389ab7f6aa59120a2355e34962af2188e8dea733e9ed93826d59ac4d5
artifact retention:  through 2026-08-16
```

### Product model

Сайт теперь явно разделяет:

- Projects — продукты и системы;
- Publications — внешние статьи, выступления, интервью и научные материалы;
- Engineering Notes — оригинальные материалы сайта;
- Sources — references и knowledge base.

Publications не стал вторым блогом и не копирует внешние статьи. Каждая запись ведёт на canonical external source.

### Initial verified catalogue

Добавлены ровно три статьи Habr:

1. `2025-08-23` — «Простенький лендинг/wiki для вас и вашего проекта или как покорить Diplodoc'а и опубликовать на GitHub Pages»;
2. `2025-08-01` — «Как Java-разработчику эффективно решать алгоритмические задачи»;
3. `2025-03-04` — «Автоматизированный электропривод ленточного конвейера: Разработка системы управления с возможностью удаленного контроля».

Для первого релиза не добавлены scientific publications, talks, interviews и proceedings: стабильная внешняя точка, удовлетворяющая inclusion boundary, не была подтверждена. Пустые категории не отображаются.

### Single source of truth

Добавлен `data/publications.json` с immutable validation:

- controlled kinds и roles;
- unique IDs и canonical URLs;
- HTTPS-only sources;
- exact non-future dates;
- deterministic featured order;
- validated project/Note relationships;
- no volatile views/votes/likes.

Registry используется одновременно для:

- полного каталога;
- homepage Featured;
- contextual links;
- browser and search assertions.

### Search architecture

Первоначальная post-build инъекция не попадала в Diplodoc index. Это было зафиксировано отдельным search-boundary RED.

Исправление:

```text
data/publications.json
        ↓
publication-content-generator.js
        ↓
docs/_includes/publications-catalogue.md
        ↓ native Diplodoc include before indexing
landing/publications.html + generated search
```

`build:docs` и `build:docs:fast` теперь детерминированно генерируют include перед `yfm`.

Postprocessor отвечает только за:

- curated Featured block;
- Publications stylesheet;
- compact no-JS fallback.

Diplodoc остаётся единственным site-wide search owner. Все три названия находятся штатным search и ведут на одну страницу Publications. Локальные detail pages и второй search engine не добавлялись.

### No-JavaScript contract

- полный каталог доступен без JavaScript;
- Featured не дублируется в fallback;
- пустой неинициализированный Diplodoc root скрывается только внутри `<noscript>`;
- no-JS mobile начинается сразу с заголовка и трёх материалов;
- external links сохраняют safe attributes.

### Site integration

Добавлено:

- `docs/landing/publications.md`;
- navigation item рядом с Notes;
- top-level Diplodoc sidebar item;
- homepage `Избранные публикации` после active projects;
- homepage exploration card;
- About and Resume links;
- RU metadata/OpenGraph;
- text-first responsive cards;
- dedicated `publications.css`.

Прямой Habr utility link сохранён.

### TDD

Initial RED:

```text
head:        3e0d4e7fce1f6923c4865adde588c4017ac99be7
Build/run:   #491 / 30755225315
result:      265 existing tests PASS; 6 expected missing-surface failures
```

Search-boundary RED:

```text
head:        60b8781e268d81d8b12db7033fb2c4473a3de564
Build/run:   #530 / 30757328760
result:      296 existing tests PASS; generator module intentionally missing
```

GREEN:

```text
head:        1386df46b57d5c9164a13039a286cafb1f296037
Build/run:   #539 / 30757856207 SUCCESS
squash:      4036df1744840e558a6514ce6ae09eceb624b69e
```

### Quality gates

Build #539 прошёл:

- 300 unit tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- dedicated Publications enhanced desktop and no-JS mobile smoke;
- Sources Knowledge Base;
- Project Evidence;
- NODE ZERO diagrams;
- Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- generated search for all three article titles;
- RU/EN;
- analytics;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- custom-domain artifact verification.

Engineering Notes Atom feed boundary подтверждён: внешние публикации в feed не попадают.

### Manual visual review

Проверены exact-head screenshots:

- home desktop/mobile;
- resume desktop/mobile;
- Publications enhanced desktop/mobile;
- Publications no-JS mobile.

Подтверждено:

- Featured расположен после active projects;
- длинные заголовки переносятся корректно;
- empty groups отсутствуют;
- no-JS root gap устранён;
- horizontal overflow отсутствует;
- только четыре ожидаемых home/resume baseline были обновлены;
- финальный mean channel delta для них — `0.00`.

No backend, CMS, database, runtime API, scraper, site-wide search replacement, behavioural analytics, separate English build or custom-domain contract changed.

---

## P2.4d — Vlezet flagship case study

PR #59 опубликовал Vlezet как третий controlled flagship после LivingWorld и NODE ZERO.

```text
exact head:      a409a152f60ea9d11dce8790920d84c3b70c1633
Build / run:     #486 / 30752888855 SUCCESS
squash:          aa32ce01e3345612fa9ebdad2b2b096399225b5f
unit tests:      265 PASS
artifact:        8835053206
artifact digest: sha256:7a3dde6a0a36ebaeed6ea59c3c0e477a8522c786eb6703a5044567bddb767ddc
```

Главная архитектурная формула:

> Recognition Draft остаётся proposal layer. Авторитетной геометрия становится только после review, deterministic validation и explicit Apply в millimetre-based `VlezetDocument`.

Страница сохранила failed M7.8B product acceptance:

- M7.7 и M7.8A accepted;
- M7.8B Draft PR #41, `FAIL — DO NOT MERGE`;
- representative real plan: 417 local wall candidates, 0 openings;
- current aggregate Source geometry/topology F1 около `0.492537 / 0.462687`;
- arbitrary-plan recognition не заявляется;
- private plan/screenshots не публиковались.

---

## Durable state sync after P2.4c — PR #58

```text
exact docs head: 58d75ca81d64dfa17bb5dea284cc8aa73db9fc9d
Build / run:     #460 / 30751486202 SUCCESS
squash:          28fa21627440a64ba04baeab5ed4288b19537496
```

---

## P2.4c — Search, Photo shell and rendered-asset stabilization

- Search Back navigation — PR #53.
- Single-contour search field and centered button — PR #54.
- Photo index moved into shared Diplodoc shell — PR #55.
- NODE ZERO SVG critical paint moved to presentation attributes — PR #57.

Draft PR #56 was superseded before production implementation.

---

# 2026-08-01

## P2.4b — Header utility navigation and language consolidation

PR #51:

- utility order `GitHub → Habr → Telegram → Search → Language`;
- accessible icon-only controls;
- bounded RU/EN menu;
- floating duplicate switch removed;
- simplified hero actions.

```text
exact:  8bd77b90f778f6384be3b9de93e69c9bc4b77e21
Build:  #418 / 30719138639 SUCCESS
squash: c6a7b74e8b0f7d07f44794505d348ab6ef5afb4e
```

## P2.4a — Canonical rollout and first custom-host telemetry

- Landing README/CV updated to `https://trueruslan.ru/`;
- Vlezet and VillAIgence READMEs updated;
- first Cloudflare custom-host telemetry observed;
- sample remained insufficient for audience/product conclusions.

## P2.3b — HTTPS Production Cutover

Strict custom deployment run `30704218399` succeeded:

- custom origin `https://trueruslan.ru`;
- analytics required;
- production smoke `ok: true`;
- RU/EN canonical identity verified;
- one analytics beacon on RU and EN;
- owner confirmed HTTPS apex and `www → apex`.

---

# Earlier milestones

## 2026-07-30

- P2.2a production analytics activation and legacy operational closure.

## 2026-07-23

- P2.2 Privacy-friendly analytics — PR #40.
- P2.1 Minimal RU/EN — PR #38.
- P1.4 Additional Grounded Engineering Note — PR #36.

## 2026-07-22

- P1.3 Flagship Case-Study Format — PR #34.
- P1.2 Project Metadata Cleanup — PR #31.
- P1.1 Browser Quality Harness — PR #29.
- P0.6 Content Freshness Guard — PR #27.
- P0.5 Grounded Engineering Notes — PR #25.
- P0.4 Project Evidence Layer — PR #22.
- P0.3 Sources Knowledge Base — PR #20.
- P0.1 Photo Stories platform — PR #15 + #17.

---

## Durable continuity principle

After each major milestone synchronize:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

These files are snapshots, not substitutes for actual repository state, exact-head CI, Pages deployment reports, production DNS/TLS and provider telemetry.
