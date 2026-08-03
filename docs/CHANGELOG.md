# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-03**, во время P2.4i Installed Acceptance Engineering Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-03

## P2.4i — Installed Acceptance Engineering Note

### Purpose

После P2.4h landing уже корректно различал VillAIgence PR #103 GameTests и PR #104 production-JAR startup/restart evidence. Следующий milestone превратил эту evidence chain в отдельную grounded Engineering Note:

**«От source tests к installed acceptance: что доказывает каждый release gate»**.

The existing Note `Почему green CI не означает verified product` remains the general explanation of bounded Evidence semantics. P2.4i is a concrete VillAIgence release-engineering retrospective.

### Selected design

- one Russian Note in the existing static Notes platform;
- no new schema, renderer, CSS, browser runtime, backend, API, analytics event or search engine;
- canonical slug `source-tests-to-installed-acceptance`;
- existing manifest owns metadata, Atom feed and previous/next/related navigation;
- Diplodoc remains the only site-wide full-text search owner;
- stable source links point to accepted VillAIgence PR #98–#104 and the canonical startup validation document.

### Evidence narrative

The Note records:

```text
0.1.20 installed PARTIAL PASS
→ water / filled-grave / embedded-version / approximately 272-second Chat defects
→ corrective PRs #99–#101
→ exact 0.1.21 installed STARTUP FAIL
→ safe rollback + six persistent hashes preserved
→ PR #102 removes the production-unsafe Mixin
→ PR #103 adds 28 scenarios and seven GameTests
→ PR #104 proves exact production-JAR startup/restart across two JVMs
→ cumulative provider/multiplayer/live gameplay acceptance remains pending
```

The article explicitly separates:

- source/unit logic;
- loader/build and remapped package shape;
- exact embedded identity;
- development GameTest integration;
- exact production-JAR startup;
- controlled shutdown/restart;
- six-store path/hash continuity;
- focused installed canaries;
- cumulative product-owner promotion.

Rollback is treated as a valid acceptance outcome with service recovery and persistence oracles, not as evidence to hide.

### TDD RED

A permanent repository contract was added before the content:

```text
PR:                    #85
RED head:              1687a00fcecb614df386eeceea1057fc63a9b2f4
Build:                 #645 / 30832535417 — expected FAILURE
unit tests:            318 PASS / 3 expected FAIL
CodeQL:                #85 / 30832537884 — SUCCESS
Dependency Review:     #73 / 30832535753 — SUCCESS
RED artifact:          8863494780
```

The three failures were exact and intentional:

1. missing Note registry entry;
2. missing canonical Markdown source;
3. missing Notes index, TOC and page metadata integration.

All 318 pre-existing tests passed.

### Delivered implementation

- `docs/landing/notes/source-tests-to-installed-acceptance.md`;
- `data/notes.json` entry with 11-minute reading time and bounded related Notes;
- Notes index entry under reliability/testing;
- TOC discovery;
- `data/page-meta.json` OpenGraph/metadata identity;
- permanent `scripts/release-gates-note.test.js` contract;
- canonical grounded-note requirement in `scripts/notes-content.test.js`;
- generated Note metadata and previous/next/related navigation;
- Atom feed inclusion;
- generated search coverage.

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

Build #651 passed production build, generated-site integrity, mobile, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio v0.3, Firefox/WebKit, search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression and custom-domain artifact verification.

### Claim boundary

P2.4i does not claim:

- completed VillAIgence cumulative installed acceptance;
- equivalence between GameTests and operator-server behavior;
- real Text/STT/Chat/TTS or Voice Chat proof from startup/restart evidence;
- semantic correctness of every persistent record from stable hashes alone;
- invented reliability, adoption or latency metrics.

### Finalization state

Durable docs were synchronized after implementation GREEN. This produces a new exact PR head; final Build, CodeQL, Dependency Review, artifact evidence and squash must be recorded after PR #85 completes.

### Next milestone

P2.4j — grounded Note about deterministic authority around probabilistic LLM/CV proposals, using both Vlezet and VillAIgence.

---

## P2.4h — Product Evidence Reconciliation

Content Freshness Guard issue #78 found that landing evidence had drifted from Vlezet and VillAIgence source repositories.

### Delivered

- Vlezet M7.8B PR #41 recorded as accepted/merged with geometry/topology F1 `0.837989`, 27 local / 19 AI-confirmed / 8 review and known limitations;
- Vlezet timeline advanced to M7.8C;
- VillAIgence `0.1.20` partial PASS and `0.1.21` startup failure/rollback retained;
- corrective PRs #99–#102 recorded;
- PR #103 risk-based GameTests and PR #104 production-JAR startup/restart recorded as separate scopes;
- current candidate `0.1.23+1.21.1` recorded;
- lifecycle remains `release-candidate`, public label `ACCEPTANCE IN PROGRESS`;
- `/now`, RU/EN flagship narratives, Project Evidence, timelines and durable state synchronized;
- portfolio status tests derive expected labels from canonical `data/projects.json`.

### TDD and final evidence

```text
RED head:              fe269ad4a0207968b87aaff4901bffce25ae58f5
RED Build:             30826688736 — expected FAILURE
RED tests:             317 PASS / 1 expected FAIL

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

PR #84 recorded the final P2.4h continuity state as squash `84fff6ceecbca5efb8019927b826c66cc19a50e2` after its own complete exact-head matrix.

---

## Repository hardening and dependency security review

### PR #67 — repository governance

Added `SECURITY.md`, ownership and pull-request contracts, bounded Dependabot, CodeQL, Dependency Review, immutable Action SHAs, fixed runner/concurrency policy and permanent repository invariants.

### PRs #69/#71/#74/#76/#77

Accepted compatible dependency, pinned Action and durable hardening updates after configured verification matrices.

### PR #79 — remove vulnerable fast-xml-parser 4.x

Removed the vulnerable 4.x path, bounded `fast-xml-parser@5.10.1`, preserved Diplodoc translation and added permanent security/compatibility regression coverage.

### PR #80 — low-risk audit remediation

Removed unused `@gravity-ui/page-constructor`, applied compatible patch/minor overrides and added lockfile invariants.

### PR #81 — linkify remediation and markdown-it blocker

```text
squash:              a554a2b59fe6a6e6369530567e9beba445311e17
Build:               30814355266 — SUCCESS
CodeQL:               30814355897 — SUCCESS
Dependency Review:    30814356860 — SUCCESS
unit tests:           317 PASS / 0 FAIL
fresh audit:          6 moderate / 0 high / 0 critical
```

All residual package records reduce to build-time `markdown-it@13.0.2`. Upgrade above `14.1.1` is blocked by current Diplodoc internal imports. Issue #82 remains open; next review **2026-08-17**. Local shim, unreviewed fork and `npm audit fix --force` remain rejected.

---

# 2026-08-02

## P2.4g — `/now` synchronization

PR #65 refreshed the current-focus snapshot after Vlezet, Publications and VillAIgence flagship milestones while preserving registry-owned project state.

## P2.4f — VillAIgence flagship case study

PR #63 published VillAIgence identity, Memory 2.0/operator-lore/security/release evidence and the authority/acceptance diagram under the stable `livingworld` route.

## P2.4e — External Publications Showcase

PR #61 published three externally verified Habr articles. Drafts and unverified records remained excluded.

## P2.4d — Vlezet flagship case study

PR #59 published Vlezet with explicit geometry/recognition authority boundaries.

## P2.4c — search, Photo shell and rendered-asset stabilization

PRs #53/#54/#55/#57/#58 stabilized Search Back, search UI, Photo shared shell, NODE ZERO SVG paint and durable state.

---

# 2026-08-01

- P2.4b Header utility navigation and language consolidation — PR #51.
- P2.4a Canonical rollout and custom-host telemetry — PRs #48–#50.
- P2.3b HTTPS Production Cutover — run `30704218399`.

---

# Earlier milestones

- 2026-07-30 — production analytics activation and legacy operational closure.
- 2026-07-23 — P2.2 analytics, P2.1 Minimal RU/EN, P1.4 additional grounded Note.
- 2026-07-22 — flagship format, metadata cleanup, browser harness, freshness, Notes, Evidence, Sources and Photo Stories foundation.

---

## Durable continuity principle

After each major milestone synchronize:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

These snapshots never substitute for actual repository state, exact-head CI, Pages deployment reports, production DNS/TLS, source-project acceptance or provider telemetry.
