# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-02**, после синхронизации `/now` с актуальными flagship и content milestones.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-02

## P2.4g — `/now` synchronization after flagship milestones

PR #65 обновил authored snapshot текущего инженерного фокуса после Vlezet flagship, External Publications Showcase и VillAIgence flagship.

```text
feature PR:          #65
exact feature head:  fdc2d2ddf54f67aacf1e730f210fb6aae7325cdf
Build / run:         #571 / 30763586234 — SUCCESS
squash on master:    2ef556a6e910be001355193d9d96f499131d5094
unit tests:          307 PASS / 0 FAIL
artifact id:         8838265730
artifact digest:     sha256:917d75578563a23a8a7b9186dcb143ec890a98d81f3823460251ffcf4be997a8
artifact retention:  through 2026-08-16
```

### Problem

`data/now.json` оставался на snapshot `2026-07-22` и больше не соответствовал опубликованной структуре портфолио:

- public project уже называется VillAIgence, но `/now` всё ещё упоминал LivingWorld;
- Vlezet flagship и recognition acceptance boundary не были отражены;
- External Publications Showcase и новый content/distribution phase отсутствовали;
- planned writing не опирался на свежие реальные acceptance failures.

### Selected design

Выбран минимальный data-only refresh.

Сохранены две независимые source-of-truth области:

```text
data/projects.json
→ project identity / status / href / active cards

data/now.json
→ date / focus / learning / writing
```

Не добавлялись:

- `recentlyCompleted` или `next` schema;
- второй roadmap;
- commit-driven automatic public truth;
- новый renderer;
- CSS redesign;
- runtime API/CMS/backend.

### Editorial snapshot

Дата обновлена до:

`2026-08-02`

Focus теперь фиксирует переход:

- от наращивания portfolio infrastructure;
- к real product acceptance;
- к явным accepted/unaccepted boundaries;
- к grounded authored content;
- к постепенному external distribution;
- без преждевременных выводов по короткому analytics sample.

### Learning lines

Добавлены три текущие области:

1. **VillAIgence** — модель как proposal, authoritative server state, source/package gates, installed acceptance, rollback и persistent evidence.
2. **Vlezet** — CV/LLM proposals, confidence, manual review, deterministic validation и explicit Apply.
3. **Static-first distribution** — один источник истины и aggregate telemetry после достаточного observation window.

### Writing lines

Зафиксированы три будущие Engineering Notes:

1. зелёный exact-head CI не равен успешной приёмке установленного продукта;
2. deterministic authority вокруг LLM/CV proposals;
3. restart/persistence как product contract.

### Public identity compatibility

Test fixture и repository snapshot contract теперь требуют:

- public name `VillAIgence`;
- отсутствие public `LivingWorld` copy в `/now`;
- stable slug `livingworld`;
- stable href `landing/projects/livingworld.html`.

Project Registry продолжает автоматически выводить active cards для:

- Vlezet;
- VillAIgence;
- NODE ZERO;
- Engineering Portfolio Platform.

### Explicit non-claims

Copy не заявляет:

- установленную acceptance VillAIgence `0.1.22+1.21.1`;
- accurate arbitrary-plan recognition для Vlezet;
- meaningful audience validation по ранней Cloudflare telemetry.

### TDD

RED:

```text
head:        d4cfd2d0b9d961efcdcedb8eddca197aadbe7e32
Build/run:   #569 / 30763497159
result:      306 PASS / 1 expected FAIL
failure:     current date 2026-07-22, expected 2026-08-02
```

После первого data update тест обнаружил внутреннее противоречие implementation plan:

```text
head:        7d89d4c0aedfb6a8672e484eee2e6550467b5fb8
Build/run:   #570 / 30763542736
result:      306 PASS / 1 FAIL
cause:       assertion required plural "Engineering Notes"
actual copy: singular "Engineering Note"
resolution:  test expectation corrected; production data unchanged
```

GREEN:

```text
head:        fdc2d2ddf54f67aacf1e730f210fb6aae7325cdf
Build/run:   #571 / 30763586234 — SUCCESS
result:      307 PASS / 0 FAIL
squash:      2ef556a6e910be001355193d9d96f499131d5094
```

### Exact-head quality gates

Build #571 прошёл:

- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications;
- Sources Knowledge Base;
- Project Evidence;
- VillAIgence and NODE ZERO diagram raster gates;
- Photo Stories;
- portfolio v0.3, включая `/now`;
- Firefox/WebKit;
- generated search;
- dedicated VillAIgence search;
- Minimal RU/EN;
- privacy analytics;
- metadata/OpenGraph;
- Engineering Map + accessibility;
- visual regression;
- custom-domain artifact verification.

### Manual artifact review

Проверены:

- `v03-now.png`;
- `now-generated.html`.

Подтверждено:

- date `2026-08-02`;
- active cards registry-derived;
- stable VillAIgence route;
- no stale public LivingWorld name;
- корректный перенос длинных learning/writing пунктов;
- no horizontal overflow;
- no serious/critical Axe violations;
- no misleading release/adoption claims;
- no visual baseline update required.

### Architecture impact

Не изменены:

- `docs/landing/now.md`;
- `scripts/now-page.js`;
- JSON schema;
- CSS;
- routes;
- search ownership;
- metadata/OpenGraph registry;
- visual thresholds;
- analytics/custom-domain contracts.

---

## P2.4f — VillAIgence flagship case study

PR #63 обновил существующий `livingworld` flagship до актуального публичного проекта VillAIgence при сохранённом stable route/key compatibility.

```text
exact head:      90e03b4a793bde9d8088ee930da74ebc19edfa3c
Build / run:     #567 / 30761930974 — SUCCESS
squash:          00da9ee983f17f8f5e1b5e5f353fad852fee337c
unit tests:      306 PASS / 0 FAIL
artifact:        8837765509
artifact digest: sha256:3aa538f9bad7eeeefd54ff24511fe700b90eedc7c872e85ffe5bd673322fa78c
```

Главные результаты:

- Memory 2.0, FACT/BELIEF provenance и Operator Lore narrative;
- server-authoritative text/voice/action boundary;
- provider network/security constraints;
- exact-artifact release evidence lane;
- `0.1.20` partial PASS, `0.1.21` startup FAIL и pending `0.1.22` installed acceptance;
- production-safe authority/acceptance SVG;
- dedicated search, diagram, Evidence и browser gates.

---

## P2.4e — External Publications Showcase

PR #61 опубликовал самостоятельный раздел **«Публикации и выступления»** для completed, externally verifiable work.

```text
exact head:      1386df46b57d5c9164a13039a286cafb1f296037
Build / run:     #539 / 30757856207 — SUCCESS
squash:          4036df1744840e558a6514ce6ae09eceb624b69e
unit tests:      300 PASS / 0 FAIL
artifact:        8836540794
artifact digest: sha256:d69dd36389ab7f6aa59120a2355e34962af2188e8dea733e9ed93826d59ac4d5
```

Initial catalogue содержит три externally verified Habr-статьи. Drafts, future appearances и непроверенные scientific records не добавлены.

---

## P2.4d — Vlezet flagship case study

PR #59 опубликовал Vlezet как controlled flagship с explicit authority и failed-recognition boundaries.

```text
exact head:      a409a152f60ea9d11dce8790920d84c3b70c1633
Build / run:     #486 / 30752888855 — SUCCESS
squash:          aa32ce01e3345612fa9ebdad2b2b096399225b5f
unit tests:      265 PASS
artifact:        8835053206
artifact digest: sha256:7a3dde6a0a36ebaeed6ea59c3c0e477a8522c786eb6703a5044567bddb767ddc
```

M7.7 и M7.8A приняты; M7.8B остаётся `FAIL — DO NOT MERGE`. Arbitrary-plan recognition не заявляется.

---

## P2.4c — Search, Photo shell and rendered-asset stabilization

- Search Back navigation — PR #53.
- Single-contour search field and centered button — PR #54.
- Photo index moved into shared Diplodoc shell — PR #55.
- NODE ZERO SVG critical paint moved to presentation attributes — PR #57.
- Durable state sync — PR #58.

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
Build:  #418 / 30719138639 — SUCCESS
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
