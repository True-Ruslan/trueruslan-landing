# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-03**, во время P2.4i Installed Acceptance Engineering Note.
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

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project hub и evidence-backed flagship case studies;
- `/now` как authored current-focus snapshot;
- Engineering Notes + Atom feed;
- external Publications Showcase;
- Engineering Map;
- Diplodoc full-text search + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN layer;
- privacy-friendly Cloudflare Web Analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, visual и custom-domain gates.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

### Master baseline перед текущим milestone

```text
master:               84fff6ceecbca5efb8019927b826c66cc19a50e2
last content merge:   #83 — P2.4h Product Evidence Reconciliation
continuity merge:     #84 — final P2.4h durable state
open implementation:  #85 — P2.4i Installed Acceptance Engineering Note
branch:                content/release-gates-installed-acceptance-note
```

### Последний завершённый product milestone

```text
milestone:             P2.4h — Product Evidence Reconciliation
feature PR:            #83 — MERGED
exact feature head:    e50495e7f988e362905c7b137efd6541e7f94e33
squash on master:      5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:                 #641 / 30829739512 — SUCCESS
CodeQL:                #79 / 30829740495 — SUCCESS
Dependency Review:     #69 / 30829738958 — SUCCESS
unit tests:            318 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8862581638
```

P2.4h synchronized Vlezet M7.8B accepted evidence and VillAIgence PR #103/#104 production-JAR acceptance boundaries without changing schemas, renderers, routes, analytics or search ownership.

---

## 3. Active milestone — P2.4i Installed Acceptance Engineering Note

### Goal

Publish a grounded Note:

**«От source tests к installed acceptance: что доказывает каждый release gate»**.

Canonical route:

`landing/notes/source-tests-to-installed-acceptance.html`

The article is a concrete VillAIgence release-engineering case study, not a rewrite of the general Note `Почему green CI не означает verified product`.

### Evidence chain

```text
0.1.20 installed PARTIAL PASS
→ water / filled-grave / embedded-version / long-Chat defects
→ corrective PRs #99–#101
→ exact 0.1.21 installed STARTUP FAIL
→ safe rollback + six persistent hashes preserved
→ PR #102 direct owned-source startup correction
→ PR #103 risk-based catalogue + seven GameTests
→ PR #104 exact production-JAR two-JVM startup/restart PASS
→ real-provider / two-client / focused live gameplay / owner cumulative acceptance pending
```

### Delivered on the implementation head

- design spec and executable implementation plan;
- permanent RED/GREEN content contract;
- grounded Russian article with stable PR #98–#104 evidence links;
- canonical `data/notes.json` registry entry;
- Notes index and TOC discovery;
- page metadata/OpenGraph entry;
- existing build-time Note metadata and previous/next/related navigation;
- Atom feed inclusion through the canonical manifest;
- generated Diplodoc search coverage;
- no new schema, renderer, CSS, runtime, backend, API, analytics event or search engine.

### TDD RED

```text
PR:                    #85
RED head:              1687a00fcecb614df386eeceea1057fc63a9b2f4
Build:                 #645 / 30832535417 — expected FAILURE
unit tests:            318 PASS / 3 expected FAIL
failures:              missing note registry, source Markdown and index/TOC/page-meta integration
CodeQL:                #85 / 30832537884 — SUCCESS
Dependency Review:     #73 / 30832535753 — SUCCESS
RED artifact:          8863494780
```

All pre-existing 318 tests passed. Only the three new Note contracts failed.

### Implementation GREEN

```text
implementation head:   a6e67fe9e94f8199eddb2500f500c4914ae45a7f
Build:                 #651 / 30832936159 — SUCCESS
CodeQL:                #91 / 30832936148 — SUCCESS
Dependency Review:     #79 / 30832933816 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8863770773
artifact digest:       sha256:39184bf7191e73c7e3b4c91c37cfead597b330fa5e2f30b030bb48b95acf287d
artifact retention:    through 2026-08-17
```

Build #651 passed the complete configured matrix:

- production Diplodoc build and generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications, Sources KB and Project Evidence;
- VillAIgence/NODE ZERO diagrams and Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- generated search and VillAIgence search;
- Minimal RU/EN;
- analytics, metadata/OpenGraph and Engineering Map;
- visual regression;
- custom-domain artifact verification for `https://trueruslan.ru`.

This durable-doc update creates a new exact head. Final Build/CodeQL/Dependency Review and squash merge must be recorded after PR #85 completes.

### Claim boundary

The Note explicitly does **not** claim:

- completed VillAIgence cumulative installed acceptance;
- equivalence between GameTests and operator-server behavior;
- that production-JAR startup/restart proves real Text/STT/Chat/TTS or Voice Chat;
- that stable hashes prove semantic correctness of every stored record;
- invented reliability, adoption or latency metrics.

---

## 4. Завершённые milestones

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
- P2.2a Production analytics activation — DONE: PR #42.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical rollout and custom-host telemetry — DONE: PRs #48–#50.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and rendered-asset stabilization — DONE: PRs #53/#54/#55/#57/#58.
- P2.4d Vlezet flagship case study — DONE: PR #59.
- P2.4e External Publications Showcase — DONE: PR #61.
- P2.4f VillAIgence flagship case study — DONE: PR #63.
- P2.4g `/now` synchronization — DONE: PR #65.
- P2.4h Product Evidence Reconciliation — DONE: PR #83.
- P2.4i Installed Acceptance Engineering Note — IN PROGRESS: PR #85.

### Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency and Action updates — PRs #69/#71/#76/#77.
- Vulnerable `fast-xml-parser` 4.x removal — PR #79.
- Low-risk dependency cleanup — PR #80.
- `linkify-it@5.0.2` remediation and measured `markdown-it` blocker — PR #81.

---

## 5. Current project boundaries

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

PR #104 proves exact remapped candidate startup outside Loom/dev classpath, two independent JVM runs, clean stop/save/exit and stable paths/hashes for six canonical stores. It does not complete real-provider, two-client, focused live gameplay or product-owner cumulative acceptance.

### Publications

Only completed, externally verifiable work is included. Drafts, future appearances and unverified scientific records remain excluded.

### Photo Stories

Platform is ready; first genuine story requires authentic material. Fake/demo album remains prohibited.

---

## 6. Production and custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Previously confirmed:

- GitHub account domain verification;
- GitHub Pages DNS check;
- certificate and Enforce HTTPS;
- `www → apex`;
- strict custom deployment;
- RU canonical `/` and EN canonical `/en/`;
- one Cloudflare analytics beacon on RU and EN;
- no legacy Pages origin leakage in custom-domain artifact.

PR quality gates verify the custom-domain artifact contract. Latest push-triggered Pages deployment and owner visual acceptance remain separate operational facts and must not be inferred from PR CI.

---

## 7. Known problems / debt

### Operational follow-up

- complete and merge PR #85 after final exact-head matrix;
- confirm latest Pages deployment separately;
- keep issue #78 open until a fresh Content Freshness Guard run confirms reconciliation;
- keep issue #82 open until a compatible upstream Diplodoc release exists.

### Dependency residual risk

```text
6 moderate
0 high
0 critical
```

All package-level records reduce to build-time `markdown-it@13.0.2`. Upgrade above `14.1.1` is blocked by current `@diplodoc/translation` imports of removed internal paths. Next issue #82 review: **2026-08-17**.

Do not use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork.

### Product/content debt

- Vlezet M7.8C is external product work, not a landing claim;
- VillAIgence cumulative manual acceptance remains pending;
- first genuine Photo Story requires authentic material;
- Publications grows only from stable canonical evidence;
- Cloudflare data needs deliberate distribution and a 3–4 week observation window before audience conclusions.

### CI hygiene

Some passing smoke tools still log expected missing optional resources such as `favicon.ico` or an intentionally absent English search index as `ENOENT`. Future maintenance may downgrade expected absence to explicit informational diagnostics.

---

## 8. Следующий оптимальный шаг

After P2.4i merge and production continuity confirmation:

### P2.4j — Engineering Note: deterministic authority around probabilistic proposals

Use both flagship projects:

- Vlezet: local CV proposes bounded candidates; AI verifies known IDs; deterministic validation and explicit Apply own mutation.
- VillAIgence: provider output remains proposal until strict parsing, server policy and current-state revalidation.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

After it:

1. Engineering Note about restart/persistence as product contract;
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

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md` in `True-Ruslan/trueruslan-landing`. Then check actual open PRs, latest commits and exact-head CI. Separately verify latest Pages deployment, production routes, HTTPS/redirect state, Cloudflare telemetry, Content Freshness issue #78 and dependency blocker #82. For VillAIgence, distinguish source/package/GameTest/production-JAR evidence from manual cumulative installed acceptance.
