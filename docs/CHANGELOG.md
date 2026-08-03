# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-03**, после merge P2.4i Installed Acceptance Engineering Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-03

## P2.4i — Installed Acceptance Engineering Note — DONE

Published:

**«От source tests к installed acceptance: что доказывает каждый release gate»**

Canonical route:

`landing/notes/source-tests-to-installed-acceptance.html`

### Why

P2.4h already separated VillAIgence PR #103 GameTests from PR #104 production-JAR startup/restart evidence. P2.4i converted that evidence chain into a concrete release-engineering retrospective without rewriting the general Note `Почему green CI не означает verified product`.

### Selected design

- one Russian grounded Note in the existing static Notes platform;
- canonical `data/notes.json` ownership;
- existing build-time metadata/navigation and Atom feed;
- Diplodoc remains sole site-wide search owner;
- stable evidence links to VillAIgence PR #98–#104;
- no new schema, renderer, CSS, runtime, backend, API or analytics event.

### Narrative

```text
0.1.20 installed PARTIAL PASS
→ water / filled-grave / embedded-version / approximately 272-second Chat defects
→ corrective PRs #99–#101
→ exact 0.1.21 installed STARTUP FAIL
→ safe rollback + six persistent hashes preserved
→ PR #102 direct owned-source startup correction
→ PR #103 28-scenario catalogue + seven GameTests
→ PR #104 exact production-JAR two-JVM startup/restart PASS
→ real-provider / two-client / focused live gameplay / owner cumulative acceptance pending
```

The article distinguishes source logic, build/remapped package, exact identity, GameTests, production-JAR startup, controlled restart, persistence hashes, installed canaries and cumulative promotion. Rollback is recorded as a valid acceptance result with service/persistence oracles.

### TDD RED

```text
RED head:              1687a00fcecb614df386eeceea1057fc63a9b2f4
Build:                 #645 / 30832535417 — expected FAILURE
unit tests:            318 PASS / 3 expected FAIL
CodeQL:                #85 / 30832537884 — SUCCESS
Dependency Review:     #73 / 30832535753 — SUCCESS
RED artifact:          8863494780
```

The failures were limited to the missing registry entry, Markdown source and index/TOC/page-meta integration. All pre-existing tests passed.

### Delivered

- article Markdown source;
- Note registry entry with related Notes and 11-minute reading time;
- Notes index and TOC entry;
- metadata/OpenGraph identity;
- previous/next/related navigation;
- Atom feed inclusion;
- generated search coverage;
- permanent `release-gates-note` contract;
- durable PROJECT_STATE/ROADMAP/CHANGELOG sync.

### Intermediate GREEN

```text
head:                  a6e67fe9e94f8199eddb2500f500c4914ae45a7f
Build:                 #651 / 30832936159 — SUCCESS
CodeQL:                #91 / 30832936148 — SUCCESS
Dependency Review:     #79 / 30832933816 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
artifact:              8863770773
```

### Durable-contract correction

Build #654 found one stale documentation contract: ROADMAP no longer contained the explicit `exact artifact → installed acceptance` phrase required by P2.4h. The architecture boundary was restored without weakening the test or changing production code.

### Final exact-head GREEN and merge

```text
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash on master:      c03f8403b77df5a91238d62bd8a143c046511a92
Build:                 #655 / 30833707629 — SUCCESS
CodeQL:                #95 / 30833706682 — SUCCESS
Dependency Review:     #83 / 30833707121 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8864072101
artifact digest:       sha256:b89fb185c7a2b8f54aa1dae81415cd28be92fe885c89e108a293894ae9cb2daa
artifact retention:    through 2026-08-17
```

The full production build, integrity, mobile, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagram, Photo Stories, portfolio, Firefox/WebKit, search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual-regression and custom-domain matrix passed.

### Claim boundary

P2.4i does not claim completed cumulative VillAIgence acceptance, equivalence between GameTests and operator-server behavior, real provider/Voice Chat proof from startup/restart evidence, semantic correctness of every record from stable hashes or invented reliability/adoption/latency metrics.

### Next

P2.4j — grounded Note about deterministic authority around probabilistic LLM/CV proposals in Vlezet and VillAIgence.

---

## P2.4h — Product Evidence Reconciliation — DONE

- Vlezet M7.8B PR #41 recorded as accepted/merged with geometry/topology F1 `0.837989`, 27 local / 19 AI-confirmed / 8 review and known limitations;
- timeline advanced to M7.8C;
- VillAIgence `0.1.20` partial PASS and `0.1.21` startup failure/rollback retained;
- corrective PRs #99–#102 recorded;
- PR #103 GameTests and PR #104 production-JAR startup/restart recorded separately;
- candidate `0.1.23+1.21.1`, lifecycle `release-candidate`, label `ACCEPTANCE IN PROGRESS` preserved;
- `/now`, RU/EN narratives, evidence, timelines and durable state synchronized;
- registry-owned status browser tests introduced.

```text
feature PR:            #83 — MERGED
exact feature head:    e50495e7f988e362905c7b137efd6541e7f94e33
squash:                5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:                 #641 / 30829739512 — SUCCESS
CodeQL:                #79 / 30829740495 — SUCCESS
Dependency Review:     #69 / 30829738958 — SUCCESS
unit tests:            318 PASS / 0 FAIL
```

PR #84 persisted final P2.4h continuity as squash `84fff6ceecbca5efb8019927b826c66cc19a50e2` after its own complete matrix.

---

## Repository hardening

- PR #67 — governance, security policy, ownership, immutable Actions, CodeQL, Dependency Review and bounded Dependabot.
- PRs #69/#71/#74/#76/#77 — compatible dependency/Action and durable hardening updates.
- PR #79 — vulnerable `fast-xml-parser` 4.x path removed with compatibility contracts.
- PR #80 — low-risk audit cleanup.
- PR #81 — `linkify-it@5.0.2` remediation and measured `markdown-it@13.0.2` upstream blocker.

Residual audit remains `6 moderate / 0 high / 0 critical`, all build-time through current Diplodoc. Issue #82 review: **2026-08-17**. Local shim, unreviewed fork and `npm audit fix --force` remain rejected.

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
