# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-02**, после публикации Vlezet flagship case study.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-02

## P2.4d — Vlezet flagship case study

PR #59 опубликовал Vlezet как третий controlled flagship после LivingWorld и NODE ZERO.

### Product content

Добавлено:

- `docs/landing/projects/vlezet.md`;
- seven-section case-study narrative;
- `docs/assets/diagrams/vlezet-recognition-authority.svg`;
- canonical project registry entry;
- project-hub placement;
- navigation и RU metadata/OpenGraph;
- past/current/next timeline;
- bounded Project Evidence snapshot.

Главная архитектурная формула:

> Recognition Draft остаётся proposal layer. Авторитетной геометрия становится только после review, deterministic validation и explicit Apply в millimetre-based `VlezetDocument`.

Case study объясняет:

- one persistent geometry authority;
- derived rooms, areas, dimensions и read-only 3D;
- semantic Undo/Redo;
- deterministic furniture fit;
- calibration coordinate transforms;
- benchmark-first CV quality;
- protocol/domain/product acceptance boundaries.

### Failed recognition acceptance preserved

Страница намеренно фиксирует текущую product truth:

- M7.7 furniture/fit — accepted and merged in Vlezet PR #35;
- M7.8A benchmark foundation — accepted and merged in PR #40;
- M7.8B — Draft PR #41, `PRODUCT-OWNER REVIEW: FAIL — DO NOT MERGE`;
- representative real plan: 417 local wall candidates, 0 openings, symbol/furniture network;
- AI reconciliation сохранил polluted network и добавил unsupported long lines;
- corrective isolated reproduction: примерно 948 → 115 unique segments и 12 346 → 249 admissible pairs;
- current aggregate Source geometry/topology F1 около `0.492537 / 0.462687`;
- accurate arbitrary-plan recognition не заявляется.

Private plan и owner screenshots в repository не добавлялись.

### TDD

RED:

```text
exact test head: bd5951e6f396dc2001d468b68ad02559dc8ed498
Build / run:    #461 / 30751734792
result:         262 PASS / 1 expected ENOENT for missing Vlezet page
```

GREEN:

```text
exact head:     a409a152f60ea9d11dce8790920d84c3b70c1633
Build / run:    #486 / 30752888855 SUCCESS
squash:         aa32ce01e3345612fa9ebdad2b2b096399225b5f
unit tests:     265 PASS
artifact id:    8835053206
artifact digest: sha256:7a3dde6a0a36ebaeed6ea59c3c0e477a8522c786eb6703a5044567bddb767ddc
```

### Quality architecture changes

- Vlezet добавлен в controlled flagship contract;
- Vlezet добавлен в canonical Project Evidence controlled set;
- postprocessor materializes all three required flagship Evidence blocks;
- orchestration fixture расширен до Vlezet/LivingWorld/NODE ZERO;
- Vlezet Evidence проверяется в enhanced и no-JavaScript режимах;
- desktop/mobile Chromium screenshots добавлены;
- Firefox/WebKit route checks добавлены;
- generated Vlezet HTML и screenshots сохраняются в CI artifact;
- production-safe SVG contract запрещает embedded/class-based critical paint;
- home/projects visual baselines обновлены только после manual review.

Build #486 fully passed:

- unit tests;
- production build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources;
- Project Evidence;
- NODE ZERO diagrams;
- Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- search;
- RU/EN;
- analytics;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- custom-domain artifact verification.

No backend, CMS, runtime GitHub API, analytics-policy, site-wide search owner, separate English build or custom-domain contract changed.

---

## Durable state sync after P2.4c — PR #58

PR #58 synchronized `PROJECT_STATE`, `ROADMAP` and `CHANGELOG` after search/photo/SVG stabilization.

```text
exact docs head: 58d75ca81d64dfa17bb5dea284cc8aa73db9fc9d
Build / run:     #460 / 30751486202 SUCCESS
squash:          28fa21627440a64ba04baeab5ed4288b19537496
```

---

## P2.4c — Search, Photo shell and rendered-asset stabilization

### Search return navigation — PR #53

- visible `Назад` control;
- same-origin browser history;
- deployment-safe homepage fallback;
- custom domain and legacy subpath support;
- accessibility/mobile coverage.

```text
exact:  49e1943ef1a5711c931ad961e508cb3b0a8dc7b4
Build:  #424 / 30741301071 SUCCESS
squash: 436a29178004a6b5b7ef5d27a957e80e03c9a109
```

### Search visual contract — PR #54

- one outer field contour;
- inherited Diplodoc pseudo-layers neutralized;
- transparent native input;
- explicit flex-centered submit button;
- measured label offset `<0.01 px / 0 px`.

```text
exact:  15c58ead52d2c0ba20c551989d80008c1ab5a7d5
Build:  #428 / 30742678180 SUCCESS
squash: a3bcc4e5ab3b6776fc0a2b3a728aea2a086ebc27
```

### Photo index in shared Diplodoc shell — PR #55

- `landing/photos.html` became canonical;
- current header/sidebar/mobile shell preserved;
- standalone duplicate index chrome removed;
- `/photos/` became redirect-only compatibility route;
- archive/lightbox/hash/focus/reduced-motion preserved;
- fake album count remains `0`.

```text
exact:  c4d11cd56efc654130ebc1a6b54f963fd2011fdc
Build:  #452 / 30747300783 SUCCESS
squash: 8428e81dff371002e5a4e047140a9467d507aeca
```

### NODE ZERO SVG production rendering — PR #57

- critical paint moved to SVG presentation attributes;
- embedded style/class dependencies removed;
- semantic title/desc preserved;
- unit and Chromium raster/color regression added.

```text
exact:  f1d08e2be2bebfdf94a500a1bc59ef74d3ec153c
Build:  #459 / 30749536943 SUCCESS
squash: e037a0db0d67d142fef3f68d178fd64a6812ee77
```

Draft PR #56 was superseded before production implementation.

---

# 2026-08-01

## P2.4b — Header utility navigation and language consolidation

PR #51:

- utility order `GitHub → Habr → Telegram → Search → Language`;
- accessible icon-only controls;
- language rightmost with bounded RU/EN menu;
- floating duplicate switch removed;
- paired route/fallback behavior;
- simplified hero actions;
- one CTA indicator owner.

```text
exact:  8bd77b90f778f6384be3b9de93e69c9bc4b77e21
Build:  #418 / 30719138639 SUCCESS
squash: c6a7b74e8b0f7d07f44794505d348ab6ef5afb4e
```

## P2.4a — Canonical rollout and first custom-host telemetry

- Landing README/CV updated to `https://trueruslan.ru/`;
- Vlezet and VillAIgence READMEs updated;
- CV annotation-only edit produced zero changed rendered pixels;
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
