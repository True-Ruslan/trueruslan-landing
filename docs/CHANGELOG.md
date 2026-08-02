# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-02**, после публикации VillAIgence flagship case study.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-02

## P2.4f — VillAIgence flagship case study

PR #63 обновил существующий `livingworld` flagship до актуального публичного проекта **VillAIgence**, сохранив route/key compatibility.

```text
feature PR:          #63
exact feature head:  90e03b4a793bde9d8088ee930da74ebc19edfa3c
Build / run:         #567 / 30761930974 SUCCESS
squash on master:    00da9ee983f17f8f5e1b5e5f353fad852fee337c
unit tests:          306 PASS / 0 FAIL
artifact id:         8837765509
artifact digest:     sha256:3aa538f9bad7eeeefd54ff24511fe700b90eedc7c872e85ffe5bd673322fa78c
artifact retention:  through 2026-08-16
```

### Compatibility boundary

Публично проект теперь везде называется VillAIgence, но намеренно сохранены:

- registry slug `livingworld`;
- route `landing/projects/livingworld.html`;
- timeline/evidence key `livingworld`;
- Minecraft compatibility-sensitive `mca`, Java package, `config/livingworld.json` и `<world>/livingworld/` identities.

Duplicate `projects/villaigence` route не создавался. Штатный Diplodoc search находит VillAIgence и ведёт на стабильный старый route.

### Current source truth

Перед merge повторно проверен `True-Ruslan/villAIgence`:

```text
primary branch head: e13660f5998fa1ed343548252d573140adc5b0c9
open PRs:            none
```

Landing фиксирует честную release sequence:

- `0.1.20+1.21.1` — installed **PARTIAL PASS**, основной Text/STT/Chat/TTS/Voice Chat, Operator Lore, persistence/restart и большинство gameplay-сценариев прошли;
- defects: NPC water drowning, destructive filled-grave Silk Touch, snapshot runtime identity, one approximately 272-second Chat request;
- `0.1.21+1.21.1` — installed startup FAIL на `MixinTombstoneBlock`;
- rollback к `0.1.20` сохранил шесть persistent hashes и восстановил server, TCP, UDP, Voice Chat и monitor;
- PRs #99–#102 — automated/package corrections для water navigation, filled grave, exact identity и direct owned-source tombstone wiring;
- exact `0.1.22+1.21.1` installed startup/water/grave/restart/cumulative acceptance остаётся **pending**.

Merged code не описывается как accepted installed release.

### Seven-section case study

Обновлены RU и bounded EN страницы. Narrative следует controlled flagship contract:

1. problem;
2. constraints;
3. decisions;
4. failures;
5. current state;
6. evidence;
7. retrospective.

Страница объясняет:

- server-owned `player ↔ NPC` session;
- immutable bounded context перед provider calls;
- text/voice convergence;
- episodic Memory 2.0;
- semantic FACT/BELIEF с provenance;
- deterministic IDs, per-NPC isolation и retention;
- Operator Lore S9–S10c с permission/revision/atomic-write boundary;
- STT/Chat/TTS capability-level degradation;
- body/time/redirect/loopback/SSRF network boundaries;
- selective MCA synchronization;
- exact-artifact release identity и installed acceptance gates.

### Authority model

```text
player text / voice
        ↓
server session + identity
        ↓
immutable bounded context
  ├─ observed world facts
  ├─ operator lore
  ├─ episodic Memory 2.0
  └─ semantic FACT / BELIEF
        ↓
STT / Chat / TTS + LLM proposal
        ↓
server policy + revalidation
        ↓
authoritative action / relationship / persistence
```

LLM output остаётся proposal. Сервер владеет identity, current observations, memory, relationships, actions и persistent evidence.

### Release evidence model

```text
source tests
→ distributable package
→ exact embedded identity
→ installed startup
→ focused gameplay regressions
→ restart and persistent hashes
→ cumulative acceptance
→ promotion
```

Это разделение стало центральной темой case study после production startup failure `0.1.21`.

### Project data

Обновлены:

- `data/projects.json` — public name, repository, status `CORRECTIVE CANDIDATE`, Memory 2.0/security tags;
- `data/project-history/livingworld.json` — five-entry past/current/next timeline;
- `data/project-evidence.json` — lastVerified `2026-08-02`, stable version facts и exactly three signals;
- `data/page-meta.json` — RU/EN VillAIgence OpenGraph identity;
- RU/EN Projects/About/navigation labels.

Evidence signals:

1. installed `0.1.20` partial acceptance — `accepted` with bounded defects;
2. corrective PRs #99–#102 — `merged`, installed acceptance excluded;
3. installed `0.1.21` startup blocker + rollback — `failed`.

### Production-safe diagram

Добавлен:

`docs/assets/diagrams/villaigence-authority-and-acceptance.svg`

Diagram имеет:

- semantic `<title>` / `<desc>`;
- intrinsic `1200×760` и responsive `viewBox`;
- critical paint в presentation attributes;
- no embedded `<style>` / class dependency;
- runtime authority lane;
- source/package/installed acceptance lane;
- explicit labels `0.1.20 PARTIAL PASS`, `0.1.21 STARTUP FAIL`, `0.1.22 LIVE RETEST PENDING`.

Dedicated Chromium raster smoke подтвердил dimensions и cyan/violet/green layers.

### TDD

RED:

```text
head:        e9c8f8ee93e9e9b3036f04ae6f46a037ef99329e
Build/run:   #541 / 30760215988
result:      299 PASS / 6 expected failures
scope:       old LivingWorld identity/data/metadata + missing VillAIgence SVG
```

GREEN:

```text
head:        90e03b4a793bde9d8088ee930da74ebc19edfa3c
Build/run:   #567 / 30761930974 SUCCESS
squash:      00da9ee983f17f8f5e1b5e5f353fad852fee337c
```

### Quality gates

Build #567 прошёл:

- 306 unit tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications and Sources Knowledge Base;
- Project Evidence enhanced/no-JS;
- VillAIgence diagram raster smoke;
- NODE ZERO diagrams;
- Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- generated search;
- dedicated VillAIgence search route assertion;
- RU/EN;
- analytics;
- metadata/OpenGraph;
- Engineering Map/Axe;
- visual regression for 10 screenshots;
- custom-domain artifact verification.

### Manual visual review

Проверены:

- home desktop/mobile;
- Projects desktop/mobile;
- VillAIgence desktop/mobile;
- Evidence mobile;
- authority/release diagram;
- Engineering Map.

Приняты только три intentional baseline changes:

- `home-mobile.png`;
- `projects-desktop.png`;
- `projects-mobile.png`.

Final delta для них `0.00`. Resume сохранил `0.00`; home desktop и Engineering Map остались внутри существующих thresholds без re-baseline.

No VillAIgence runtime code, release/tag, backend, CMS, database, runtime GitHub API, analytics policy или duplicate route добавлялись.

---

## P2.4e — External Publications Showcase

PR #61 создал самостоятельный раздел **«Публикации и выступления»** для completed, externally verifiable work.

```text
exact head:      1386df46b57d5c9164a13039a286cafb1f296037
Build / run:     #539 / 30757856207 SUCCESS
squash:          4036df1744840e558a6514ce6ae09eceb624b69e
unit tests:      300 PASS / 0 FAIL
artifact:        8836540794
artifact digest: sha256:d69dd36389ab7f6aa59120a2355e34962af2188e8dea733e9ed93826d59ac4d5
```

Delivered:

- one validated `data/publications.json` registry;
- three verified Habr articles;
- standalone Publications page;
- homepage Featured;
- navigation/About/Resume/metadata integration;
- prebuild native Diplodoc include so publications enter the search index;
- compact no-JS catalogue;
- Engineering Notes feed separation;
- full browser/cross-browser/search/visual/custom-domain gates.

No unverified scientific publications, future appearances, scrapers or volatile counters were added.

---

## P2.4d — Vlezet flagship case study

PR #59 опубликовал Vlezet как controlled flagship.

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

Страница сохранила failed M7.8B product acceptance; arbitrary-plan recognition не заявляется.

---

## P2.4c — Search, Photo shell and rendered-asset stabilization

- Search Back navigation — PR #53.
- Single-contour search field and centered button — PR #54.
- Photo index moved into shared Diplodoc shell — PR #55.
- NODE ZERO SVG critical paint moved to presentation attributes — PR #57.
- Durable sync — PR #58.

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

## P2.4a — Canonical rollout and first custom-host telemetry

- Landing/Vlezet/VillAIgence canonical links updated to `https://trueruslan.ru/`;
- first Cloudflare custom-host telemetry observed;
- sample remained insufficient for audience conclusions.

## P2.3b — HTTPS Production Cutover

Strict custom deployment run `30704218399` succeeded:

- custom origin `https://trueruslan.ru`;
- analytics required;
- RU/EN canonical identity verified;
- one analytics beacon on RU и EN;
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

These files are snapshots, not substitutes for actual repository state, exact-head CI, Pages deployment reports, production DNS/TLS, source-project installed acceptance and provider telemetry.
