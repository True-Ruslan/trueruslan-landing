# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-03**, после полного GREEN implementation matrix для P2.4h Product Evidence Reconciliation.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-03

## P2.4h — Product Evidence Reconciliation

Content Freshness Guard issue #78 обнаружил, что public landing отстал от source repositories:

- Vlezet PR #41 уже был product-owner accepted и squash-merged, но landing продолжал показывать M7.8B как failed Draft;
- VillAIgence получил release/tag `0.1.23+1.21.1`, M11 risk-based GameTests и production-JAR startup/restart acceptance, но landing останавливался на `0.1.22 live acceptance pending`.

### Selected design

Выбрана manual, bounded reconciliation без runtime GitHub API и без automatic public truth mutation.

Source-of-truth boundaries сохранены:

```text
data/projects.json
→ project identity / lifecycle / route

data/project-history/*.json
→ public evolution timeline

data/project-evidence.json
→ dated bounded evidence signals

docs/landing/projects/*.md
→ authored case-study narrative

data/now.json
→ short-lived editorial snapshot
```

Не изменены:

- schemas;
- renderers;
- CSS;
- routes;
- search ownership;
- analytics policy;
- visual thresholds;
- backend/runtime architecture.

### TDD RED

```text
implementation PR:     #83
RED head:              fe269ad4a0207968b87aaff4901bffce25ae58f5
Build:                 30826688736 — expected FAILURE
unit tests:            317 PASS / 1 expected FAIL
failure:               Vlezet M7.8B state `failed`, expected `merged`
CodeQL:                30826688612 — SUCCESS
Dependency Review:     30826689352 — SUCCESS
```

The failure occurred only in the new repository reconciliation contract. All 317 pre-existing tests passed.

### Vlezet reconciliation

Source evidence:

```text
PR:                     #41 — MERGED
accepted head:          a5003371f2feb4fa37edbd2513b0b5312bc5dd07
squash:                 08800dd66fa298ff31d1a7e6b33e91964cdb8d16
Standard CI:            30767495988 / #2834 — PASS
Recognition Benchmark: 30767496002 / #165 — PASS
M7 Browser Audit:       30767495992 / #618 — PASS
Source geometry F1:     0.837989
Source topology F1:     0.837989
```

Representative accepted result:

```text
local wall candidates: 27
confirmed after AI:     19
remaining for review:   8
openings:               0 — deferred to M7.8C
```

Landing changes:

- M7.8B signal changed from `failed` to `merged`;
- failed-Draft current narrative replaced by accepted-with-limitations state;
- initial 417-candidate failure retained as historical negative evidence;
- region-first extraction, bounded fallback, overload protection and verification-only AI recorded;
- timeline advanced to **M7.8C Opening Classification and Host-Wall Validation**;
- lifecycle remains `pre-production`;
- accurate arbitrary-plan recognition is not claimed.

### VillAIgence reconciliation

Historical evidence retained:

- `0.1.20+1.21.1` partial PASS with water, grave, identity and latency defects;
- `0.1.21+1.21.1` startup FAIL on the tombstone Mixin;
- safe rollback preserving six persistent hashes and restoring service;
- corrective PRs #99–#102.

New evidence:

#### PR #103 — M11 Phase A

- validated 28-scenario acceptance catalogue across seven risk domains;
- seven real-server Fabric GameTests;
- MCA navigation wiring;
- NPC → tombstone item → NPC identity/inventory round trip;
- real Silk Touch filled-grave drops;
- empty-grave negative control;
- deterministic water-navigation properties;
- fail-closed test-mod leakage guard.

#### PR #104 — M11 Phase B

```text
exact head:            9a03a6535e1d6349ddcfa62d6edbe67fbc7f6cfa
squash/source head:    61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:   0.1.23+1.21.1
```

Automated scope:

- exact remapped Fabric candidate installed outside Loom/dev classpath;
- two separate JVM runs reached Minecraft ready state;
- controlled `stop`, complete world save and exit code 0;
- stable relative paths and SHA-256 values across restart for:
  - `memory.json`;
  - `memory2.json`;
  - `semantic-memory.json`;
  - `relationships.json`;
  - `voices.json`;
  - `operator-lore.json`;
- fixture classes and mod ID absent from distributable JAR.

Landing changes:

- lifecycle remains `release-candidate`;
- public label advanced from `CORRECTIVE CANDIDATE` to `ACCEPTANCE IN PROGRESS`;
- PR #103 and PR #104 added as separate automated evidence signals;
- RU and EN VillAIgence case studies synchronized;
- timeline advanced to M11 risk-based production-JAR acceptance;
- cumulative real-provider, multiplayer, focused water/grave and product-owner acceptance remains pending.

### `/now` synchronization

Date advanced to `2026-08-03`.

The snapshot now distinguishes:

- Vlezet M7.8B accepted progress with Source F1 `0.837989` and retained uncertainty;
- VillAIgence automated production-JAR startup/restart proof;
- manual cumulative acceptance still pending;
- manual deterministic reconciliation as the owner of public truth.

### Test-contract corrections

Intermediate candidates revealed stale test assumptions rather than production defects:

```text
Build #634 / 30827956405
→ Russian page was checked with an English-only cumulative-acceptance phrase

Build #635 / 30828062261
→ browser-quality still required VillAIgence 0.1.22

Build #636 / 30828352405
→ Project Evidence smoke still expected three VillAIgence signals

Build #637 / 30828673190
→ portfolio v0.3 hard-coded CORRECTIVE CANDIDATE
```

Corrections:

- cumulative acceptance assertion accepts localized wording;
- browser scenario requires `0.1.23+1.21.1`, `production-JAR` and cumulative boundary;
- Project Evidence smoke requires five signals, state counts `accepted=1 / failed=1 / merged=3`, PR #103 and PR #104 in enhanced and no-JS output;
- Projects hub and `/now` status checks now derive expected labels from canonical `data/projects.json` instead of duplicating lifecycle copy.

### Implementation GREEN

```text
implementation head:   bf4bd811233ef90159cb90864c1dc8d79752486e
Build:                 #638 / 30829054939 — SUCCESS
CodeQL:                #76 / 30829056057 — SUCCESS
Dependency Review:     #66 / 30829054307 — SUCCESS
unit tests:            318 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8862245353
artifact digest:       sha256:ed04a93d4989a968514383c2e5d85097463f97f31446fe988e7300d11e8f8dff
artifact retention:    through 2026-08-17
```

Build #638 passed production build, site integrity, mobile, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio v0.3, Firefox/WebKit, search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression and custom-domain artifact verification.

A final docs-only exact-head matrix and squash merge remain before P2.4h becomes master truth.

### Durable documentation

Updated:

- `docs/PROJECT_STATE.md`;
- `docs/ROADMAP.md`;
- `docs/CHANGELOG.md`.

The next landing milestone is a narrow Engineering Note about source tests, integration GameTests, package identity, exact artifact, installed startup/restart and cumulative acceptance. It is explicitly distinct from the existing general green-CI/Evidence Layer Note.

---

## Repository hardening and dependency security review

### PR #67 — repository governance

Added:

- `SECURITY.md`;
- ownership and pull-request contracts;
- bounded Dependabot configuration;
- CodeQL;
- Dependency Review;
- immutable full-SHA GitHub Actions;
- fixed runner and concurrency policy;
- removal of redundant Docker deployment workflow;
- permanent repository invariants.

### PR #69 — parse5 major update

Accepted after the complete unit, build, browser, accessibility, visual, custom-domain, CodeQL and dependency-review matrix passed.

### PR #71 — pinned GitHub Actions update

Updated checkout, setup-node and CodeQL immutable SHAs after complete matrix verification.

### PR #74 — durable hardening sync

Recorded governance, CI, Dependabot and dependency-review outcomes and separated source-controlled readiness from GitHub administrative state.

### PRs #76 and #77 — compatible indirect updates

Updated `postcss` and `fast-uri` within the existing compatibility boundary.

### PR #79 — remove vulnerable fast-xml-parser 4.x

- removed the vulnerable 4.x dependency path;
- bounded override to `fast-xml-parser@5.10.1`;
- preserved Diplodoc translation behavior;
- added permanent security and compatibility regression coverage.

### PR #80 — low-risk audit remediation

- removed unused `@gravity-ui/page-constructor`;
- applied compatible patch/minor overrides;
- added lockfile and dependency invariants.

### PR #81 — linkify remediation and markdown-it blocker

```text
exact head:          14f44204fbf8cc8f0452eadf6722157aba0e8120
squash:              a554a2b59fe6a6e6369530567e9beba445311e17
Build:               30814355266 — SUCCESS
CodeQL:              30814355897 — SUCCESS
Dependency Review:   30814356860 — SUCCESS
unit tests:          317 PASS / 0 FAIL
fresh audit:         6 moderate / 0 high / 0 critical
```

Delivered:

- `linkify-it@5.0.2`;
- parser security and compatibility regression coverage;
- measured residual risk;
- issue #82 with owner and next review date.

The six residual package-level records reduce to build-time `markdown-it@13.0.2`.

Upgrade above `14.1.1` is blocked by `@diplodoc/translation@1.7.26` imports of removed internal paths. A local shim, unreviewed fork and `npm audit fix --force` were rejected.

Next review: **2026-08-17**.

---

# 2026-08-02

## P2.4g — `/now` synchronization after flagship milestones

```text
feature PR:          #65
exact feature head:  fdc2d2ddf54f67aacf1e730f210fb6aae7325cdf
Build / run:         #571 / 30763586234 — SUCCESS
squash on master:    2ef556a6e910be001355193d9d96f499131d5094
unit tests:          307 PASS / 0 FAIL
```

Refreshed the authored current-focus snapshot after Vlezet, External Publications and VillAIgence flagship milestones while preserving registry-owned project state and stable `livingworld.html` compatibility.

## P2.4f — VillAIgence flagship case study

PR #63 published the public VillAIgence identity, Memory 2.0/operator-lore/security/release evidence and authority/acceptance diagram while preserving the stable `livingworld` route.

## P2.4e — External Publications Showcase

PR #61 published a static-first catalogue of three externally verified Habr articles. Drafts and unverified records remained excluded.

## P2.4d — Vlezet flagship case study

PR #59 published Vlezet as a controlled flagship with explicit geometry/recognition authority boundaries.

## P2.4c — Search, Photo shell and rendered-asset stabilization

- Search Back navigation — PR #53.
- Single-contour search field and centered button — PR #54.
- Photo index moved into shared Diplodoc shell — PR #55.
- NODE ZERO SVG critical paint stabilization — PR #57.
- Durable state sync — PR #58.

---

# 2026-08-01

## P2.4b — Header utility navigation and language consolidation

PR #51 established canonical utility order, accessible icon-only controls, bounded RU/EN menu and removed the duplicate floating switch.

## P2.4a — Canonical rollout and custom-host telemetry

Landing, CV and flagship repository links moved to `https://trueruslan.ru/`; first Cloudflare custom-host telemetry was observed without drawing audience conclusions.

## P2.3b — HTTPS Production Cutover

Strict custom deployment run `30704218399` confirmed custom origin, production smoke, RU/EN canonical identity and one analytics beacon per localized homepage.

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

These files are snapshots, not substitutes for actual repository state, exact-head CI, Pages deployment reports, production DNS/TLS, source-project acceptance or provider telemetry.
