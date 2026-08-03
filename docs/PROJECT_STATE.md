# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после merge P2.4k Restart and Persistence Engineering Note.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано, что доказано и что дальше?**

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

После чтения отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard, Content Freshness Guard и maintenance issues. Repository readiness, generated artifact, deployed production state, external-project acceptance и provider telemetry — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Проект объединяет standalone homepage, Diplodoc knowledge pages, web-CV, project hub и evidence-backed case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, full-text search, Photo Stories, Sources Knowledge Base, Project Evidence Layer, Content Freshness Guard, bounded RU/EN, Cloudflare Web Analytics и production-oriented CI.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

```text
master after P2.4k:        40af9e52237f03da58355caa065a40b64ad597d8
feature PR:                #89 — MERGED
exact feature head:        e73a94d5d2b832d188e62b8790b4d039ac797a44
Build:                     #680 / 30856377655 — SUCCESS
CodeQL:                    #124 / 30856377996 — SUCCESS
Dependency Review:         #108 / 30856377653 — SUCCESS
unit tests:                327 PASS / 0 FAIL
Lighthouse:                100 / 100 / 100 / 100
quality artifact:          8872727513
artifact digest:           sha256:932a3275d3cd7d28b9ca117ad6548ce79efbc25fc195803a7cd44748e5a0c625
artifact retention:        through 2026-08-17
```

Build #680 прошёл production build, generated-site integrity, mobile overflow, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio v0.3, Firefox/WebKit, generated search, exact `persistence contract` search-route check, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression и custom-domain artifact verification.

Documentation-only continuity sync фиксирует final feature squash. Feature merge, push-triggered Pages deployment и production visual acceptance остаются отдельными фактами.

---

## 3. P2.4k — Restart and Persistence as Product Contract — DONE

Published Engineering Note:

**«Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence»**

Canonical route:

`landing/notes/restart-persistence-is-a-product-contract.html`

### Core model

```text
write
→ completed save
→ controlled shutdown
→ exact artifact restart
→ unique canonical discovery
→ parse and schema check
→ semantic identity/isolation check
→ user-visible continuity
```

Persistence разделена на четыре уровня:

1. **storage durability** — bytes существуют после completed save;
2. **structural readability** — найден один canonical store, UTF-8/JSON/root/schema допустимы;
3. **semantic continuity** — UUID, evidence links, ordering, ownership и per-entity isolation остаются корректными;
4. **behavioral continuity** — пользователь после restart наблюдает тот же recall, identity, permissions и failure isolation.

Equal SHA-256 подтверждает byte continuity только в no-mutation scenario. Он не доказывает, что runtime прочитал правильный store или восстановил правильный смысл. После intentional writes или migration hash может измениться; тогда требуется отдельное read-back и semantic evidence.

### Evidence boundary

#### PR #66

- corroborated FACT Basiliso пережил pressure;
- semantic UUID и `sourceEventIds` пережили pressure и restart;
- decay ordering разрешил otherwise equal entries;
- слабый Casimiro relationship FACT был вытеснен;
- pressure Basiliso и Casimiro осталось изолированным;
- пять persistent files были byte-identical;
- rejected-new-append no-rewrite остался automated-only, не live-proven.

#### PR #67

Все шесть world-local stores были hash-identical across restart:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

Дополнительно Pio и Justino сохранили isolation, Pio сохранил имя игрока и любимый цвет, controlled TTS failure сохранил visible text и Memory 2.0 dialogue, hostile endpoints не передали credentials и не изменили persistence, production configuration восстановлена byte-for-byte.

#### Startup failure and rollback

PRs #92, #95 и #102 используются как отрицательное evidence:

- exact candidates падали до world load;
- downstream gameplay acceptance не начиналась;
- rollback возвращал предыдущий artifact;
- persistent hashes не менялись;
- service readiness, monitoring и ports восстанавливались.

Rollback доказывает recovery outcome, а не качество rejected candidate.

#### PR #103

GameTest round trip `NPC → tombstone item → NPC` требовал сохранить UUID, name и полный inventory multiset. Это semantic lifecycle evidence, но не production-JAR restart evidence.

#### PR #104

- exact remapped Fabric JAR запускался вне Loom/dev classpath;
- два независимых JVM достигали ready state;
- оба получали `stop`, завершали save и выходили с code `0`;
- каждый canonical store обнаруживался ровно один раз и был valid JSON;
- relative paths и SHA-256 оставались стабильными в no-mutation restart;
- fixture code отсутствовал в distributable JAR.

PR #104 не завершает migration coverage, real-provider, multiplayer, focused live gameplay или product-owner cumulative acceptance.

### TDD evidence

```text
RED head:              1dfddfa3a7750b62caef4618a6836f7778580a76
RED Build:             #670 / 30855380512 — expected FAILURE
RED tests:             324 PASS / 3 expected FAIL
RED CodeQL:            #114 / 30855380544 — SUCCESS
RED Dependency Review: #98 / 30855380504 — SUCCESS
failure scope:         missing registry, Markdown and index/TOC/page-meta surfaces

implementation head:   266acea5bb01d725a2473981481580591bb47ceb
Build:                 #677 / 30855874811 — SUCCESS
unit tests:            327 PASS / 0 FAIL

final head:            e73a94d5d2b832d188e62b8790b4d039ac797a44
Build:                 #680 / 30856377655 — SUCCESS
CodeQL:                #124 / 30856377996 — SUCCESS
Dependency Review:     #108 / 30856377653 — SUCCESS
unit tests:            327 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
```

Build #676 выявил одну слишком широкую запрещённую формулировку внутри отрицания. Текст был сужен без ослабления test contract.

### Delivered

- canonical `data/notes.json` record;
- grounded Markdown article;
- Notes index and TOC;
- page metadata/OpenGraph;
- previous/next/related build-time navigation;
- Atom feed inclusion;
- generated Diplodoc search;
- exact browser assertion for query `persistence contract` and canonical Note route;
- permanent content/evidence contract;
- no new schema, renderer, CSS, runtime, backend, API, analytics event or second search engine.

### Claim boundary

P2.4k does not claim:

- semantic correctness from hashes alone;
- equal hashes after intentional writes or migration;
- complete migration coverage for every historical schema;
- equivalence between GameTests and production-JAR restart;
- completed VillAIgence provider/multiplayer/manual cumulative acceptance;
- zero probability of data loss;
- production deployment from PR CI.

---

## 4. Завершённые milestones

### P0 — foundation

- Photo Stories platform — PRs #15/#17; first genuine story remains content-dependent.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
- Content Freshness Guard — PR #27.

### P1 — maintainability / depth

- Browser Quality Harness — PR #29.
- Project Metadata Cleanup — PR #31.
- Flagship Case-Study Format — PR #34.
- Additional Grounded Note — PR #36.

### P2 — audience / operations / content

- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45, run `30704218399`.
- Canonical rollout/header/search/Photo stabilization — PRs #48–#58.
- Vlezet flagship — PR #59.
- Publications — PR #61.
- VillAIgence flagship — PR #63.
- `/now` synchronization — PR #65.
- Product Evidence Reconciliation — PR #83.
- Installed Acceptance Engineering Note — PR #85.
- Deterministic Authority Engineering Note — PR #87.
- Restart and Persistence Engineering Note — PR #89.

### Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency updates — PRs #69/#71/#76/#77.
- Vulnerable `fast-xml-parser` path removed — PR #79.
- Low-risk cleanup — PR #80.
- `linkify-it@5.0.2` remediation and measured `markdown-it` blocker — PR #81.

---

## 5. Current product boundaries

### Vlezet

M7.8B remains the latest accepted public recognition slice. M7.8C PR #42 is Draft and requires the same real-plan owner retest before acceptance. Public lifecycle remains `pre-production`.

### VillAIgence

```text
canonical source head:      61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:        0.1.23+1.21.1
M11 Phase A PR:             #103 — 28 scenarios + 7 GameTests
M11 Phase B PR:             #104 — production-JAR startup/restart
lifecycle:                  release-candidate
public label:               ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence остаются отдельными от real-provider/gameplay/manual cumulative acceptance.

### Publications and Photo Stories

Publications contains only completed, externally verifiable work. Photo Stories platform готова, но первая genuine story требует authentic material; fake/demo albums запрещены.

---

## 6. Production and custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Ранее подтверждены GitHub domain verification, Pages DNS, certificate и Enforce HTTPS, `www → apex`, RU/EN canonical identity, один Cloudflare beacon на localized homepage и отсутствие legacy Pages-origin leakage в custom-domain artifact.

PR quality gates проверяют custom-domain artifact contract. Latest push-triggered Pages deployment и owner visual acceptance нельзя выводить из PR CI.

---

## 7. Known problems / debt

### Operational follow-up

- получить fresh Content Freshness Guard report и закрыть issue #78 только при clean generated evidence;
- получить exact `npm audit --json` advisory/path triage для issue #82;
- проверить latest Pages deployment, production Note route, Atom feed и search, если инструменты позволяют;
- update public truth только после accepted external evidence.

### Dependency residual risk

Current `npm ci` на неизменённом dependency graph сообщает:

```text
6 moderate
2 high
critical count not reported by the summary line
```

Dependency Review остаётся SUCCESS, поэтому P2.4k не внес dependency delta. Не применять `npm audit fix --force`, local `node_modules` shim или unreviewed fork. Issue #82 остаётся maintenance owner.

### Product/content debt

- Vlezet M7.8C owner retest и acceptance остаются external product work;
- VillAIgence cumulative manual acceptance остаётся pending;
- first genuine Photo Story требует authentic material;
- Publications растёт только из stable evidence;
- Cloudflare data требует deliberate distribution и 3–4 week observation window.

---

## 8. Следующий оптимальный шаг

### Operational Maintenance Closure

1. Fresh Content Freshness Guard and issue #78 reconciliation.
2. Exact `npm audit --json` advisory/path triage for issue #82.
3. Latest Pages/live Note/feed/search verification where tooling permits.
4. Source-project public truth updates only after accepted evidence.
5. First genuine Photo Story only when authentic material exists.

Следующая conceptual Note не является immediate priority, пока operational facts не закрыты или явно не заблокированы.

---

## 9. Нельзя ломать без нового design decision

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content without runtime API;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc as sole site-wide search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications inclusion boundary;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking without privacy review;
- exact artifact → installed acceptance remains an explicit boundary;
- byte continuity is not semantic or behavioral continuity;
- no weakening quality gates for speed.

---

## 10. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md` in `True-Ruslan/trueruslan-landing`. Check actual open PRs, latest commits and exact-head CI. Separately verify Pages deployment, production routes, Cloudflare telemetry, Content Freshness issue #78 and dependency issue #82. For Vlezet distinguish accepted M7.8B from Draft M7.8C. For VillAIgence distinguish source/package/GameTest/production-JAR/persistence/server-authority/manual cumulative evidence.
