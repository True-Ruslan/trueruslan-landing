# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-03**, после merge P2.4i Installed Acceptance Engineering Note.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано, что доказано и что дальше?**

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard, Content Freshness Guard и maintenance issues. Repository readiness, generated artifact, deployed production state, external-project acceptance и provider telemetry — разные факты.

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
master after P2.4i:    c03f8403b77df5a91238d62bd8a143c046511a92
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
Build:                 #655 / 30833707629 — SUCCESS
CodeQL:                #95 / 30833706682 — SUCCESS
Dependency Review:     #83 / 30833707121 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8864072101
artifact digest:       sha256:b89fb185c7a2b8f54aa1dae81415cd28be92fe885c89e108a293894ae9cb2daa
artifact retention:    through 2026-08-17
```

Build #655 прошёл production build, generated-site integrity, mobile overflow, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio v0.3, Firefox/WebKit, generated search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression и custom-domain artifact verification.

A documentation-only continuity sync records this final squash. Its CI is repository evidence, not a new product milestone.

---

## 3. P2.4i — Installed Acceptance Engineering Note — DONE

Published Note:

**«От source tests к installed acceptance: что доказывает каждый release gate»**

Canonical route:

`landing/notes/source-tests-to-installed-acceptance.html`

### Narrative boundary

```text
0.1.20 installed PARTIAL PASS
→ water / filled-grave / embedded-version / long-Chat defects
→ corrective PRs #99–#101
→ exact 0.1.21 installed STARTUP FAIL
→ safe rollback + six persistent hashes preserved
→ PR #102 direct owned-source startup correction
→ PR #103 28-scenario catalogue + seven GameTests
→ PR #104 exact production-JAR two-JVM startup/restart PASS
→ real-provider / two-client / focused live gameplay / owner cumulative acceptance pending
```

The Note separates:

- source/unit logic;
- loader/build and remapped package shape;
- exact embedded identity;
- GameTest integration;
- exact production-JAR startup;
- controlled stop/save/restart;
- six-store path/hash continuity;
- manual cumulative acceptance and promotion.

Rollback is recorded as a valid acceptance outcome with service recovery and persistence oracles.

### Static integration

Delivered:

- canonical `data/notes.json` entry;
- article Markdown source;
- Notes index and TOC;
- page metadata/OpenGraph;
- build-time Note metadata and previous/next/related navigation;
- Atom feed inclusion;
- generated Diplodoc search coverage;
- permanent `scripts/release-gates-note.test.js` contract;
- durable state synchronization.

No schema, renderer, CSS, browser runtime, backend, API, analytics event or second search engine was added.

### TDD RED

```text
RED head:              1687a00fcecb614df386eeceea1057fc63a9b2f4
Build:                 #645 / 30832535417 — expected FAILURE
unit tests:            318 PASS / 3 expected FAIL
failures:              missing registry, Markdown and index/TOC/page-meta surfaces
CodeQL:                #85 / 30832537884 — SUCCESS
Dependency Review:     #73 / 30832535753 — SUCCESS
```

All 318 pre-existing tests passed.

### Intermediate and final GREEN

```text
implementation head:   a6e67fe9e94f8199eddb2500f500c4914ae45a7f
Build:                 #651 / 30832936159 — SUCCESS
unit tests:            321 PASS / 0 FAIL

final head:            9d9fcff92c9a9826391028b2f2e25c524e7463ea
Build:                 #655 / 30833707629 — SUCCESS
CodeQL:                #95 / 30833706682 — SUCCESS
Dependency Review:     #83 / 30833707121 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
```

Build #654 exposed one stale durable-document contract requiring the explicit `exact artifact → installed acceptance` boundary in ROADMAP. The boundary was restored without weakening the test or changing production surfaces.

### Claim boundary

P2.4i does not claim:

- completed VillAIgence cumulative installed acceptance;
- equivalence between GameTests and operator-server behavior;
- real Text/STT/Chat/TTS or Voice Chat proof from startup/restart evidence;
- semantic correctness of every persistent record from stable hashes alone;
- invented reliability, adoption or latency metrics.

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

### Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency updates — PRs #69/#71/#76/#77.
- Vulnerable `fast-xml-parser` path removed — PR #79.
- Low-risk cleanup — PR #80.
- `linkify-it@5.0.2` remediation and measured `markdown-it` blocker — PR #81.

---

## 5. Current product boundaries

### Vlezet

```text
accepted milestones:       M0–M7.8B
M7.8B PR:                   #41 — MERGED
Source geometry F1:         0.837989
Source topology F1:         0.837989
representative candidates:  27 local / 19 AI-confirmed / 8 review
openings:                    0 — deferred to M7.8C
next:                        M7.8C Opening Classification and Host-Wall Validation
lifecycle:                   pre-production
```

CV/LLM output remains proposal until review, deterministic validation and explicit Apply. Accurate arbitrary-plan recognition is not claimed.

### VillAIgence

```text
canonical source head:      61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:        0.1.23+1.21.1
M11 Phase A PR:             #103 — 28 scenarios + 7 GameTests
M11 Phase B PR:             #104 — production-JAR startup/restart
historical installed:       0.1.20 partial PASS
historical failure:         0.1.21 startup FAIL + safe rollback
lifecycle:                   release-candidate
public label:               ACCEPTANCE IN PROGRESS
```

PR #104 proves exact remapped candidate startup outside Loom/dev classpath, two independent JVM runs, clean stop/save/exit and stable paths/hashes for six canonical stores. Real-provider, two-client, focused live gameplay and product-owner cumulative acceptance remain pending.

### Publications and Photo Stories

Publications contains only completed, externally verifiable work. Photo Stories platform is ready, but the first genuine story requires authentic material; fake/demo albums remain prohibited.

---

## 6. Production and custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Previously confirmed: GitHub domain verification, Pages DNS, certificate and Enforce HTTPS, `www → apex`, RU/EN canonical identity, one Cloudflare beacon per localized homepage and no legacy Pages-origin leakage in custom-domain artifacts.

PR quality gates verify the custom-domain artifact contract. Latest push-triggered Pages deployment and owner visual acceptance remain separate operational facts and must not be inferred from PR CI.

---

## 7. Known problems / debt

### Operational follow-up

- confirm latest Pages deployment and the new Note route;
- confirm deployed feed and generated search;
- keep issue #78 open until a fresh Content Freshness Guard report is clean;
- keep issue #82 open until compatible upstream Diplodoc releases exist.

### Dependency residual risk

```text
6 moderate
0 high
0 critical
```

All package-level records reduce to build-time `markdown-it@13.0.2`. Upgrade above `14.1.1` is blocked by current `@diplodoc/translation` internal imports. Next review: **2026-08-17**.

Do not use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork.

### Product/content debt

- Vlezet M7.8C remains external product work;
- VillAIgence cumulative manual acceptance remains pending;
- first genuine Photo Story requires authentic material;
- Publications grows only from stable evidence;
- Cloudflare data requires deliberate distribution and a 3–4 week observation window before audience conclusions.

---

## 8. Следующий оптимальный шаг

### P2.4j — deterministic authority around probabilistic proposals

Use both flagship projects:

- Vlezet: local CV proposes bounded candidates; AI verifies known IDs; deterministic validation and explicit Apply own mutation.
- VillAIgence: provider output remains proposal until strict parsing, server policy and current-state revalidation.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

After it:

1. Note about restart/persistence as product contract;
2. genuine Photo Story when authentic material exists;
3. selective external-profile rollout and distribution;
4. 3–4 weeks aggregate Cloudflare observation;
5. choose further work from evidence.

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
- no weakening quality gates for speed.

---

## 10. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md` in `True-Ruslan/trueruslan-landing`. Check actual open PRs, latest commits and exact-head CI. Separately verify latest Pages deployment, production routes, HTTPS/redirect state, Cloudflare telemetry, Content Freshness issue #78 and dependency blocker #82. For VillAIgence distinguish source/package/GameTest/production-JAR evidence from manual cumulative installed acceptance.
