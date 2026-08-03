# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-03**, во время P2.4j Deterministic Authority Engineering Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-03

## P2.4j — Deterministic Authority Around Probabilistic Proposals — IN PROGRESS

Engineering Note:

**«AI может предложить, но не применить: как строить deterministic authority»**

Canonical generated route:

`landing/notes/probabilistic-proposals-deterministic-authority.html`

### Why

The previous Notes separated protocol parsing, CI evidence and installed acceptance. P2.4j records the next boundary: a probabilistic or otherwise untrusted component may create proposals, but only deterministic product authority may change canonical state.

### Selected design

- one Russian grounded Note in the existing static Notes platform;
- one shared proposal-to-mutation pipeline;
- accepted Vlezet M7.8B PR #41 as the public recognition foundation;
- Vlezet M7.8C PR #42 used only as Draft evidence awaiting product-owner retest;
- VillAIgence operator-lore PR #85 as the server-authority and revision-conflict case;
- stable links to source PRs rather than transient workflow URLs;
- existing Notes registry, build-time navigation, Atom feed and Diplodoc search;
- no new schema, renderer, CSS, runtime, backend, API, analytics event or search engine.

### Authority pipeline

```text
probabilistic or untrusted proposal
→ known identity binding
→ shape and bounds validation
→ product-policy authorization
→ current-state revalidation
→ APPLY / CONFLICT / REJECT / UNCHANGED
→ one atomic authoritative mutation
```

### Vlezet evidence

Accepted M7.8B PR #41:

- `27 local / 19 AI-confirmed / 8 review`;
- Source geometry/topology F1 `0.837989`;
- exact local candidate IDs and coordinates sent to AI;
- IDs and geometry remain immutable during verification;
- unknown IDs, moved geometry, cloud-only geometry and unbounded responses fail closed;
- no canonical `VlezetDocument` mutation before explicit Apply;
- semantic Undo remains the recovery boundary;
- stronger provider may confirm more existing candidates but cannot invent missing local geometry.

Draft M7.8C PR #42:

- strict-ID and geometry-immutable verification continues;
- active geometry is separated from diagnostic geometry;
- blocked candidates cannot enter topology, opening-host analysis or Apply;
- AI cannot create, move, resize, thicken or re-host geometry;
- automated gates are not substituted for the same real-plan owner retest;
- no accepted/merged/product-ready claim is made.

### VillAIgence evidence

Merged operator-lore PR #85:

- permission checked server-side;
- WORLD/PLAYER/VILLAGER/VILLAGE targets resolved from authenticated/live server state;
- arbitrary UUID/dimension/village identities absent from request authority;
- payload bounds and canonicalization fail closed;
- write compares expected and current SHA-256 revision;
- stale edit returns `CONFLICT` plus current canonical value without mutation;
- replay returns `UNCHANGED`;
- persistent store changes only on `APPLY`.

PR #103 GameTests and PR #104 production-JAR lifecycle acceptance remain separate automated evidence. Real-provider, multiplayer, focused live gameplay and product-owner cumulative acceptance remain pending.

### TDD RED

```text
RED head:              1422efbaa6f0d4791d511bfb71fa89f1712c6604
Build:                 #658 / 30852218324 — expected FAILURE
unit tests:            321 PASS / 3 expected FAIL
CodeQL:                #100 / 30852218498 — SUCCESS
Dependency Review:     #86 / 30852220087 — SUCCESS
RED artifact:          8871091646
```

The failures were limited to the absent registry entry, Markdown source and index/TOC/page-meta integration. All pre-existing tests passed.

### Delivered

- canonical Note registry record with related Notes and 12-minute reading time;
- grounded Markdown article;
- Notes index and TOC entry;
- metadata/OpenGraph identity;
- previous/next/related navigation;
- Atom feed inclusion;
- generated search coverage;
- exact browser search assertion for query `deterministic authority` and canonical Note route;
- permanent `deterministic-authority-note` contract;
- durable PROJECT_STATE/ROADMAP/CHANGELOG synchronization.

### Implementation GREEN

```text
head:                  e8cad3b7f0dbf468ffebb1d55ea4d269143a758d
Build:                 #665 / 30853200992 — SUCCESS
CodeQL:                #107 / 30853201468 — SUCCESS
Dependency Review:     #93 / 30853201100 — SUCCESS
unit tests:            324 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8871540363
artifact digest:       sha256:ffafe7d916a39a25b6162f8fdc06656bc855ef3133ab2496c81ac0e5364a25e6
artifact retention:    through 2026-08-17
```

The complete production build, integrity, mobile, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio, Firefox/WebKit, generic search, exact deterministic-authority search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual-regression and custom-domain matrix passed.

Durable document changes require one more final exact-head matrix before PR #87 can merge.

### Claim boundary

P2.4j does not claim accepted M7.8C, arbitrary-plan recognition accuracy, provider repair of missing geometry, authorization from valid JSON alone, completed VillAIgence real-provider/multiplayer acceptance, universal AI-safety guarantees or invented reliability/adoption/latency metrics.

### New maintenance signal

`npm ci` on the unchanged dependency graph now reports `6 moderate / 2 high`. Dependency Review remains SUCCESS, so this content PR did not introduce a dependency delta. The previous durable `0 high` claim is stale; issue #82 must receive a fresh advisory/path triage after the feature milestone. `npm audit fix --force`, local shims and unreviewed forks remain rejected.

### Next

P2.4k — restart and persistence as product contract.

---

## P2.4i — Installed Acceptance Engineering Note — DONE

Published `От source tests к installed acceptance: что доказывает каждый release gate`.

```text
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash on master:      c03f8403b77df5a91238d62bd8a143c046511a92
Build:                 #655 / 30833707629 — SUCCESS
CodeQL:                #95 / 30833706682 — SUCCESS
Dependency Review:     #83 / 30833707121 — SUCCESS
unit tests:            321 PASS / 0 FAIL
```

The Note keeps source contracts, package identity, GameTests, exact production-JAR startup/restart, rollback and cumulative installed acceptance separate. PR #103 and PR #104 remain distinct evidence layers.

---

## P2.4h — Product Evidence Reconciliation — DONE

- Vlezet M7.8B PR #41 recorded as accepted/merged with geometry/topology F1 `0.837989`, `27 local / 19 AI-confirmed / 8 review` and known limitations;
- VillAIgence `0.1.20` partial PASS and `0.1.21` startup failure/rollback retained;
- corrective PRs #99–#102 recorded;
- PR #103 GameTests and PR #104 production-JAR startup/restart recorded separately;
- candidate `0.1.23+1.21.1`, lifecycle `release-candidate`, label `ACCEPTANCE IN PROGRESS` preserved;
- `/now`, RU/EN narratives, evidence, timelines and durable state synchronized.

```text
feature PR:            #83 — MERGED
exact feature head:    e50495e7f988e362905c7b137efd6541e7f94e33
squash:                5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:                 #641 / 30829739512 — SUCCESS
unit tests:            318 PASS / 0 FAIL
```

---

## Repository hardening

- PR #67 — governance, security policy, ownership, immutable Actions, CodeQL, Dependency Review and bounded Dependabot.
- PRs #69/#71/#74/#76/#77 — compatible dependency/Action and durable hardening updates.
- PR #79 — vulnerable `fast-xml-parser` 4.x path removed with compatibility contracts.
- PR #80 — low-risk audit cleanup.
- PR #81 — `linkify-it@5.0.2` remediation and measured `markdown-it@13.0.2` upstream blocker.
- Issue #82 remains the dependency maintenance owner and now requires fresh triage of the newly observed high-severity audit signal.

---

# 2026-08-02

- P2.4g `/now` synchronization — PR #65.
- P2.4f VillAIgence flagship — PR #63.
- P2.4e External Publications Showcase — PR #61.
- P2.4d Vlezet flagship — PR #59.
- P2.4c Search/Photo/rendered-asset stabilization — PRs #53/#54/#55/#57/#58.

# 2026-08-01

- P2.4b Header utility navigation and language consolidation — PR #51.
- P2.4a Canonical rollout and custom-host telemetry — PRs #48–#50.
- P2.3b HTTPS Production Cutover — run `30704218399`.

# Earlier milestones

- 2026-07-30 — production analytics activation and legacy operational closure.
- 2026-07-23 — privacy analytics, Minimal RU/EN and additional grounded Note.
- 2026-07-22 — flagship format, metadata cleanup, browser harness, freshness, Notes, Evidence, Sources and Photo Stories foundation.

---

## Durable continuity principle

After every major milestone synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`. These snapshots never substitute for actual repository state, exact-head CI, Pages deployment, production DNS/TLS, source-project acceptance or provider telemetry.
