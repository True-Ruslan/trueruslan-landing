# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-03**, после полного GREEN implementation matrix для P2.4h Product Evidence Reconciliation.
>
> Текущее состояние — `docs/PROJECT_STATE.md`; история — `docs/CHANGELOG.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

## Принципы

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- no backend/CMS/database без необходимости;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- analytics как optional aggregate telemetry;
- no behavioural/user tracking без explicit privacy review;
- quality gates без ослабления;
- repository readiness, deployed state, external-project acceptance и provider telemetry как разные факты.

Главная продуктовая формула:

**что я создаю → что я изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Завершённые milestones

## P0 — foundation

- P0.1 Photo Stories platform — DONE: PR #15 + #17.
- P0.2 First genuine Photo Story — CONTENT DEPENDENT.
- P0.3 Sources Registry / KB — DONE: PR #20.
- P0.4 Project Evidence — DONE: PR #22.
- P0.5 Grounded Notes — DONE: PR #25.
- P0.6 Content Freshness Guard — DONE: PR #27.

## P1 — maintainability / depth

- P1.1 Browser Quality Harness — DONE: PR #29.
- P1.2 Project Metadata Cleanup — DONE: PR #31.
- P1.3 Flagship Case-Study Format — DONE: PR #34.
- P1.4 Additional Grounded Note — DONE: PR #36.

## P2 — audience / operations / content

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
- P2.4h Product Evidence Reconciliation — IMPLEMENTED: PR #83, merge pending.

## Repository hardening

- Governance, security policy, ownership, PR contracts, immutable Action SHAs, CodeQL, Dependency Review and bounded Dependabot — DONE: PR #67.
- Compatible dependency updates and cleanup — DONE: PRs #69/#71/#76/#77/#79/#80/#81.
- Residual `markdown-it@13.0.2` risk — TRACKED: issue #82, next review 2026-08-17.

---

# P2.4h implementation evidence

```text
PR:                    #83
implementation head:   bf4bd811233ef90159cb90864c1dc8d79752486e
Build:                 #638 / 30829054939 — SUCCESS
CodeQL:                #76 / 30829056057 — SUCCESS
Dependency Review:     #66 / 30829054307 — SUCCESS
unit tests:            318 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8862245353
artifact digest:       sha256:ed04a93d4989a968514383c2e5d85097463f97f31446fe988e7300d11e8f8dff
```

Delivered:

- Vlezet M7.8B PR #41 recorded as accepted and merged with Source geometry/topology F1 `0.837989` and known limitations;
- Vlezet timeline advanced to M7.8C Opening Classification and Host-Wall Validation;
- VillAIgence PR #103 risk-based GameTests and PR #104 production-JAR startup/restart recorded as separate automated scopes;
- current candidate `0.1.23+1.21.1` recorded;
- lifecycle preserved as `release-candidate`, label advanced to `ACCEPTANCE IN PROGRESS`;
- cumulative provider, multiplayer, focused gameplay and product-owner acceptance remains pending;
- `/now`, RU/EN case studies, Project Evidence, timelines and durable documents synchronized;
- status smoke now derives expected labels from canonical Project Registry;
- schemas, renderers, CSS, routes, search ownership, analytics and visual thresholds unchanged.

Before merge:

1. pass the final docs-only exact-head Build, CodeQL and Dependency Review;
2. mark PR #83 ready;
3. squash-merge with expected head protection.

After merge:

1. confirm latest Pages deployment;
2. confirm production `/now`, Vlezet, VillAIgence and Publications routes;
3. rerun/inspect Content Freshness Guard;
4. close issue #78 only if reconciled drift is gone;
5. keep issue #82 open.

---

# Priority content sprint

## 1. Engineering Note: exact artifact and installed acceptance — NEXT

### Working title

**От source tests к installed acceptance: что именно доказывает каждый release gate**.

### Why this is not a duplicate

The existing Note `Почему green CI не означает verified product` explains bounded Evidence semantics generally.

The new Note must be a concrete release-engineering case study about:

```text
source tests
→ integration GameTests
→ distributable package
→ exact embedded identity
→ production-JAR startup
→ controlled shutdown and restart
→ persistent hashes
→ focused live regressions
→ cumulative provider/multiplayer acceptance
→ promotion
```

### Evidence base

```text
0.1.20 installed PARTIAL PASS
        ↓
0.1.21 installed STARTUP FAIL
        ↓
safe rollback + six persistent hashes preserved
        ↓
corrective PRs #99–#102
        ↓
PR #103 risk-based GameTests
        ↓
PR #104 exact production-JAR startup/restart PASS
        ↓
cumulative real-provider and gameplay acceptance pending
```

### Required narrative boundaries

- explain what source, integration, package, exact artifact and installed acceptance each prove;
- distinguish development GameTests from production-JAR lifecycle evidence;
- explain why startup blockers outrank downstream gameplay checks;
- treat rollback as a valid acceptance outcome;
- keep automated restart/hash proof separate from cumulative provider and operator acceptance;
- avoid invented reliability, latency or adoption metrics.

### Expected deliverables

- canonical Note registry entry;
- grounded article page with source/evidence links;
- previous/next/related navigation;
- Atom feed inclusion;
- generated search coverage;
- metadata/OpenGraph;
- browser/accessibility/visual acceptance;
- continuity sync after merge.

## 2. Engineering Note: deterministic authority around LLM/CV proposals

Use both products:

- Vlezet M7.8B: local CV proposes bounded candidates; AI verifies existing IDs; deterministic validation and explicit Apply own mutation;
- VillAIgence: provider output remains proposal until server policy and current-state revalidation.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

## 3. Engineering Note: restart and persistence as product contract

Explain:

- why stored bytes are insufficient without startup/read-back/restart evidence;
- deterministic IDs and per-entity isolation;
- six persistent hashes during rollback and automated restart;
- schema/migration compatibility;
- difference between storage implementation and user-visible continuity.

## 4. First genuine Photo Story

Only authentic material. No fake/demo album.

Required input:

- real photographs;
- confirmed chronology/context;
- publishable alt text and captions;
- explicit hero/layout selection.

## 5. External profile rollout and distribution

After the first new Note:

- update canonical site links in external profiles;
- announce selectively, not as bulk promotion;
- link directly to the relevant case study or Note;
- verify routes and aggregate referrers without behavioural tracking.

## 6. Aggregate observation window

Observe for 3–4 weeks:

- aggregate requests/page views;
- country/device data only within the current Cloudflare privacy boundary;
- which content surfaces attract meaningful visits;
- whether discovery paths identify a concrete improvement.

Do not treat owner test traffic as audience validation.

---

# External product dependencies

## Vlezet M7.8C — ACTIVE PRODUCT WORK, NOT LANDING IMPLEMENTATION

Landing may update again only after source-project evidence exists for:

1. door/window/unknown classification;
2. known host-wall identity;
3. bounded placement validation;
4. zero unknown-host accepted openings;
5. no stale decisions;
6. exact-head benchmark/browser evidence;
7. product-owner acceptance.

Until then, M7.8B remains the latest accepted public recognition slice.

## VillAIgence cumulative acceptance — EXTERNAL DEPENDENCY

Automated Phase A/B evidence is accepted within scope. Promotion beyond release-candidate requires exact installed evidence for:

1. real Text/STT/Chat/TTS and Voice Chat;
2. Chat deadline behavior;
3. logical two-client lore conflict;
4. focused water navigation canary;
5. filled-grave break/place canary;
6. restart and six-store persistence;
7. product-owner cumulative acceptance.

Do not edit `/now` as a substitute for updating canonical project registry/evidence/timeline after a newly accepted source milestone.

---

# Publications growth rules

The catalogue may expand only when all conditions hold:

1. material is already published/completed;
2. the user has a substantive public role;
3. official title/date/platform/role are known;
4. stable canonical external evidence exists;
5. no inference or placeholder metadata is needed.

Do not add drafts, submitted papers, future appearances, attendance-only events or live popularity metrics.

---

# Conditional future branches

## Selective RU/EN expansion

Only when actual usage or content value identifies a concrete page. Do not create parallel content merely for symmetry.

## Secondary analytics / Yandex Metrica

Re-open only when Cloudflare systematically undercounts a relevant audience or missing data blocks a real decision. Consent-controlled loading and privacy review are required. Replay, Webvisor, click maps and identifiers remain excluded unless separately approved.

## Richer architecture explorer

Only with enough real artifacts and demonstrated content value.

## Publication filters/local detail pages

Do not add while the catalogue remains small.

## Dependency modernization

Issue #82 is a separate upstream compatibility review. Do not run blind `npm audit fix --force` and do not mix dependency churn with content work.

---

# Что не является priority

Без нового evidence-backed design decision не планировать:

- migration away from GitHub Pages;
- paid hosting merely because a custom domain exists;
- private TLS certificate management;
- separate EN build/CMS;
- second site-wide search engine;
- runtime publication APIs or scrapers;
- advertising analytics;
- custom-event explosion;
- fingerprinting/session replay/cross-site tracking;
- AI chat поверх резюме;
- accounts/comments/likes;
- backend/database ради static content;
- runtime GitHub API;
- automatic public-state mutation;
- giant QA runner;
- decorative version bumps;
- performance optimization while real P75 metrics remain healthy.

---

# Оптимальная последовательность

```text
P2.4h final exact-head verification + merge
        ↓
production deployment + freshness confirmation
        ↓
Engineering Note: source/package/exact artifact/installed acceptance
        ↓
Engineering Note: deterministic authority around AI proposals
        ↓
Engineering Note: restart/persistence product contract
        ↓
genuine Photo Story when authentic material is ready
        ↓
external-profile rollout + public distribution
        ↓
3–4 weeks aggregate observation
        ↓
choose further content/product work from evidence
```

## Правило для нового чата

Перед следующим milestone:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`, `CUSTOM_DOMAIN`;
2. проверить actual open PR/latest commits/exact-head CI;
3. проверить latest Pages deployment reports;
4. проверить HTTPS/redirects and RU/EN canonical identity;
5. проверить production `/now`, Publications, Vlezet и VillAIgence routes;
6. проверить Cloudflare telemetry current hostname;
7. проверить current Vlezet and VillAIgence source truth;
8. различать automated GameTest/package/production-JAR evidence и manual cumulative acceptance;
9. проверить latest Content Freshness runs/issues.
