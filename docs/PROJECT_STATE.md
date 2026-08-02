# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-02**, после публикации VillAIgence flagship case study.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано и что дальше?**
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
> 4. `docs/CUSTOM_DOMAIN.md`
>
> Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard и maintenance workflows. Repository readiness, deployed production state и provider telemetry — разные факты.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project hub и evidence-backed flagship case studies;
- `/now`;
- Engineering Notes + Atom feed;
- **Публикации и выступления** как отдельный каталог внешних материалов;
- Engineering Map;
- Diplodoc full-text search + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN layer;
- privacy-friendly Cloudflare Web Analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, deployment и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

Последний product feature:

```text
feature PR:          #63 — MERGED
exact feature head:  90e03b4a793bde9d8088ee930da74ebc19edfa3c
Build / run:         #567 / 30761930974 — SUCCESS
squash on master:    00da9ee983f17f8f5e1b5e5f353fad852fee337c
unit tests:          306 PASS / 0 FAIL
quality artifact:    8837765509
artifact digest:     sha256:3aa538f9bad7eeeefd54ff24511fe700b90eedc7c872e85ffe5bd673322fa78c
artifact retention:  through 2026-08-16
```

Build #567 прошёл:

- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications и Sources Knowledge Base;
- Project Evidence в enhanced и no-JavaScript режимах;
- VillAIgence diagram Chromium raster validation;
- NODE ZERO diagrams;
- Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- generated Diplodoc search;
- dedicated `VillAIgence → landing/projects/livingworld.html` search assertion;
- Minimal RU/EN;
- privacy analytics;
- metadata/OpenGraph;
- Engineering Map + accessibility;
- reviewed visual regression для 10 screenshots;
- custom-domain artifact verification для `https://trueruslan.ru`.

Latest Pages deployment и owner production acceptance после merge должны проверяться отдельно.

---

## 3. Последний завершённый milestone

### P2.4f — VillAIgence flagship case study — DONE

PR #63 обновил существующий `livingworld` flagship до актуального публичного проекта **VillAIgence**.

Стабильные compatibility-sensitive идентификаторы намеренно сохранены:

- project slug: `livingworld`;
- route: `landing/projects/livingworld.html`;
- timeline/evidence key: `livingworld`;
- внутренние Minecraft-идентификаторы `mca`, Java package, `config/livingworld.json` и `<world>/livingworld/` не переименованы.

Публичное имя, repository URL, narrative, metadata, timeline и Evidence теперь используют VillAIgence.

### Что объясняет case study

Seven-section narrative показывает систему как одну authority architecture:

1. **Problem** — убедительный NPC всё равно должен подчиняться серверу.
2. **Constraints** — mutable game state, async providers, multi-NPC identity, world-local persistence и exact-artifact release gates.
3. **Decisions** — immutable bounded context, text/voice convergence, Memory 2.0, FACT/BELIEF provenance, Operator Lore и server-owned actions.
4. **Failures** — transcript-first memory, broad navigation hook, destructive grave drop, snapshot identity, approximately 272-second Chat request и production-unsafe Mixin startup failure.
5. **Current state** — corrective code candidate после PR #102, без broad installed PASS claim.
6. **Evidence** — separate installed, automated и failed signals.
7. **Retrospective** — authority map и release gate важнее feature breadth.

### Runtime authority model

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

LLM не становится источником истины. Сервер владеет идентичностью, текущими наблюдениями, памятью, отношениями, действиями и persistent evidence.

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

Страница намеренно разделяет текущую source-repository truth:

- `0.1.20+1.21.1` — **PARTIAL PASS**: основной Text/STT/Chat/TTS/Voice Chat, Operator Lore, persistence/restart и большинство gameplay-сценариев прошли, но остались water drowning, destructive filled-grave Silk Touch, snapshot identity и один примерно 272-second Chat request;
- `0.1.21+1.21.1` — installed startup FAIL на `MixinTombstoneBlock`; rollback к `0.1.20` сохранил шесть persistent hashes и восстановил server/voice/monitor operation;
- PRs #99–#102 — automated/package corrections для water navigation, grave preservation, exact release identity и direct owned-source tombstone wiring;
- exact `0.1.22+1.21.1` installed startup/water/grave/restart/cumulative acceptance — **pending**.

Канонический source head на момент milestone:

`e13660f5998fa1ed343548252d573140adc5b0c9`

Перед merge он был перепроверен; открытых VillAIgence PR не было.

### Evidence и timeline

Canonical `livingworld` snapshot обновлён до `2026-08-02` и содержит ровно три bounded signals:

1. installed `0.1.20` partial acceptance — manual/accepted-with-defects;
2. corrective PR train #99–#102 — automated/merged, installed acceptance excluded;
3. installed `0.1.21` startup blocker + safe rollback — manual/failed.

Timeline:

- security baseline + Memory 2.0;
- Operator Lore S9–S10c;
- installed `0.1.20` partial PASS;
- current `0.1.22` corrective code candidate;
- next exact installed cumulative acceptance.

### Diagram и search

Добавлен production-safe SVG:

`docs/assets/diagrams/villaigence-authority-and-acceptance.svg`

Он показывает отдельно:

- runtime authority lane;
- release evidence lane;
- `0.1.20 PARTIAL PASS`;
- `0.1.21 STARTUP FAIL`;
- `0.1.22 LIVE RETEST PENDING`.

Critical paint находится в SVG presentation attributes; embedded `<style>`/class dependency отсутствует. Chromium raster smoke подтвердил intrinsic `1200×760` и основные cyan/violet/green layers.

Штатный Diplodoc search находит `VillAIgence` и ведёт на стабильный `landing/projects/livingworld.html`. Duplicate `projects/villaigence` route не создавался.

### TDD evidence

```text
RED exact head:   e9c8f8ee93e9e9b3036f04ae6f46a037ef99329e
RED Build/run:    #541 / 30760215988
RED result:       299 PASS / 6 expected old-identity/data/metadata/missing-SVG failures

GREEN exact head: 90e03b4a793bde9d8088ee930da74ebc19edfa3c
GREEN Build/run:  #567 / 30761930974 SUCCESS
squash on master: 00da9ee983f17f8f5e1b5e5f353fad852fee337c
```

### Manual visual acceptance

Проверены exact-head screenshots:

- home desktop/mobile;
- Projects desktop/mobile;
- VillAIgence desktop/mobile;
- Evidence mobile;
- authority/release diagram;
- Engineering Map.

Подтверждено:

- project placement и hierarchy сохранены;
- diagram не обрезается;
- timeline/Evidence различают partial PASS, failed startup и pending candidate;
- misleading accepted `0.1.22` language отсутствует;
- overflow отсутствует;
- обновлены только три reviewed baseline: `home-mobile`, `projects-desktop`, `projects-mobile`;
- их final visual delta — `0.00`;
- Resume остался exact `0.00`;
- home desktop и Engineering Map не re-baselined, поскольку остались внутри существующих bounded thresholds.

---

## 4. Ранее завершённые milestones

### P0 — foundation

- P0.1 Photo Stories platform — DONE: PR #15 + #17.
- P0.2 First genuine Photo Story — CONTENT DEPENDENT.
- P0.3 Sources Registry / KB — DONE: PR #20.
- P0.4 Project Evidence — DONE: PR #22.
- P0.5 Grounded Notes — DONE: PR #25.
- P0.6 Content Freshness Guard — DONE: PR #27.

### P1 — maintainability / depth

- P1.1 Browser Quality Harness — DONE: PR #29.
- P1.2 Project Metadata Cleanup — DONE: PR #31.
- P1.3 Flagship Case-Study Format — DONE: PR #34.
- P1.4 Additional Grounded Note — DONE: PR #36.

### P2 — audience / operations / content

- P2.1 Minimal RU/EN — DONE: PR #38.
- P2.2 Privacy-friendly analytics — DONE: PR #40.
- P2.2a Production analytics activation — DONE: PR #42 + strict deployment.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical rollout and first custom-host telemetry — DONE: PRs #48–#50.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and SVG stabilization — DONE: PRs #53/#54/#55/#57.
- P2.4c durable sync — DONE: PR #58.
- P2.4d Vlezet flagship case study — DONE: PR #59, Build #486.
- P2.4e External Publications Showcase — DONE: PR #61, Build #539.
- **P2.4f VillAIgence flagship case study — DONE: PR #63, Build #567.**

### Vlezet truth boundary

Vlezet остаётся controlled flagship. M7.7 и M7.8A приняты; M7.8B остаётся Draft с product-owner `FAIL — DO NOT MERGE`. Landing не заявляет accurate arbitrary-plan recognition и не хранит private apartment plans/screenshots.

### Publications truth boundary

Каталог содержит только completed, externally verifiable work. Сейчас в нём три Habr-статьи. Drafts, future appearances и непроверенные научные материалы не показываются.

---

## 5. Production и custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Ранее подтверждены:

- GitHub account domain verification;
- GitHub Pages DNS check;
- certificate и Enforce HTTPS;
- `www → apex`;
- strict custom deployment;
- RU canonical `/` и EN canonical `/en/`;
- one Cloudflare analytics beacon on RU и EN;
- initial provider telemetry.

Build #567 также подтвердил custom-domain artifact contract и отсутствие leakage legacy GitHub Pages origin.

Отдельный SSL-сертификат Timeweb не используется и не нужен.

---

## 6. Known problems / debt

- Latest Pages deployment после PR #63 нужно подтвердить отдельно от feature CI.
- Owner production visual acceptance новой VillAIgence страницы — отдельный operational fact.
- Exact installed `0.1.22+1.21.1` acceptance относится к source project VillAIgence и всё ещё pending; landing feature не закрывает этот product gate.
- Cloudflare sample недостаточен для audience/product conclusions; нужен distribution window 3–4 недели.
- External profile Website/links требуют ручной проверки и обновления, если ещё stale.
- First genuine Photo Story зависит от authentic material.
- Vlezet M7.8B recognition не принят.
- `/now` после Vlezet, Publications и VillAIgence milestones требует content sync.
- Каталог Publications расширяется только после появления подтверждаемой canonical external source.

Network caveat:

- local plain-DNS `dig` из российской сети ранее давал ложные `REFUSED`; DoH был надёжнее. Это diagnostic caveat, не product defect.

---

## 7. Следующий оптимальный шаг

Глубокие flagship и Publications surfaces уже реализованы. Следующий content/operations loop:

1. синхронизировать `/now` с Vlezet, Publications и VillAIgence;
2. выпустить 1–2 grounded Engineering Notes из реальных решений;
3. добавить первую genuine Photo Story, когда готов authentic material;
4. завершить manual external-profile rollout;
5. распространять сайт и собирать aggregate Cloudflare telemetry 3–4 недели;
6. выбирать дальнейший RU/EN/content/product milestone по evidence.

Сильные кандидаты для Notes:

- почему source/package green не равен installed acceptance;
- как проектировать authority map вокруг LLM proposal;
- почему restart + persistent hashes являются product contract;
- как post-build content может не попасть в search index;
- почему benchmark PASS может не пройти representative product source.

Не создавать новый большой infrastructure milestone без реального сигнала.

---

## 8. Нельзя ломать без нового design decision

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc как единственный site-wide search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications inclusion boundary;
- stable project routes/keys без migration plan;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking без privacy review;
- no weakening quality gates ради скорости.

---

## 9. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` и `docs/CUSTOM_DOMAIN.md`. Затем проверь actual open PR, latest commits и exact-head CI. Отдельно проверь latest Pages deployment reports, HTTPS/redirect state, production VillAIgence/Publications/Vlezet pages и Cloudflare telemetry для `trueruslan.ru`. Для VillAIgence release claims отдельно проверь current `True-Ruslan/villAIgence` head, open PR, release artifact и installed acceptance evidence.
