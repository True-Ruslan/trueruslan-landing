# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-04**, во время P2.4k Restart and Persistence Engineering Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-04

## P2.4k — Restart and Persistence as Product Contract — IN PROGRESS

Engineering Note:

**«Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence»**

Canonical route after build:

`landing/notes/restart-persistence-is-a-product-contract.html`

### Why

Предыдущая Note описывала release gates и exact installed artifact. P2.4k фиксирует более узкую продуктовую границу: успешная serialization и совпадающий SHA-256 ещё не доказывают, что приложение после restart прочитало правильный canonical store, восстановило те же identities и сохранило пользовательское поведение.

### Selected design

- one Russian grounded Note in the existing static Notes platform;
- four distinct levels: storage durability, structural readability, semantic continuity and behavioral continuity;
- PR #66 and PR #67 as live identity/isolation/recall checkpoints;
- PRs #92/#95/#102 as startup-failure and safe-rollback evidence;
- PR #103 as GameTest lifecycle semantics;
- PR #104 as exact production-JAR no-mutation restart oracle;
- existing registry, build-time navigation, Atom feed and Diplodoc search;
- no new schema, renderer, CSS, runtime, backend, API, analytics event or search engine.

### Persistence pipeline

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

### Four evidence levels

1. **Storage durability** — bytes exist after completed save.
2. **Structural readability** — exactly one canonical file is found and accepted as UTF-8/JSON/root/schema.
3. **Semantic continuity** — UUIDs, evidence links, ordering, ownership and per-entity isolation remain correct.
4. **Behavioral continuity** — user-visible recall, identity, permissions and failure isolation remain correct after restart.

Equal hashes establish byte continuity only in a no-mutation scenario. Intentional writes and migration may legitimately change bytes and therefore require separate read-back and semantic oracles.

### PR #66 evidence

- Basiliso corroborated FACT survived retention pressure;
- semantic UUID and `sourceEventIds` survived pressure and restart;
- decay ordering resolved otherwise equal entries;
- weak Casimiro relationship FACT was evicted;
- Basiliso/Casimiro pressure remained isolated;
- five persistent files were byte-identical;
- rejected-new-append no-rewrite remained automated-only, not live-proven.

### PR #67 evidence

All six stores remained hash-identical across restart:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

Additionally:

- Pio and Justino remained isolated;
- Pio retained the player name and favourite colour;
- controlled TTS failure preserved visible text and Memory 2.0 dialogue;
- rejected hostile endpoints transmitted no credentials and caused no persistence mutation;
- production configuration was restored byte-for-byte.

### Startup failure and rollback

PRs #92, #95 and #102 demonstrate that an exact candidate may fail before world load. Downstream gameplay acceptance therefore does not start. Controlled rollback must restore the previous artifact, preserve persistent state and recover service readiness, monitoring and ports.

Rollback proves recovery outcome, not correctness of the rejected candidate.

### PR #103 evidence

The GameTest `NPC → tombstone item → NPC` round trip requires the same UUID, name and full inventory multiset. It is semantic lifecycle evidence and remains distinct from production-JAR restart evidence.

### PR #104 evidence

- exact remapped Fabric candidate outside Loom/development classpath;
- two independent JVM runs;
- ready marker, controlled `stop`, full save and exit code `0` twice;
- exactly one valid JSON copy of every canonical store;
- stable relative paths and SHA-256 across no-mutation restart;
- fixture code absent from the distributable JAR.

PR #104 does not prove every migration, provider path, multiplayer race or cumulative installed acceptance.

### TDD RED

```text
RED head:              1dfddfa3a7750b62caef4618a6836f7778580a76
Build:                 #670 / 30855380512 — expected FAILURE
unit tests:            324 PASS / 3 expected FAIL
CodeQL:                #114 / 30855380544 — SUCCESS
Dependency Review:     #98 / 30855380504 — SUCCESS
RED artifact:          8872239442
artifact digest:       sha256:bf5f54ca116e53bfac237e6626bd6b996787ebac9d3ec63a7335086cef5eacb7
```

Only the absent registry, Markdown and index/TOC/page-meta surfaces failed. Every pre-existing test passed.

### Intermediate correction

Build #676 produced `326 PASS / 1 FAIL`. The article contained a prohibited broad claim phrase inside an explicit negation. The wording was narrowed without weakening the contract.

### Implementation GREEN

```text
head:                  266acea5bb01d725a2473981481580591bb47ceb
Build:                 #677 / 30855874811 — SUCCESS
CodeQL:                #121 / 30855874711 — SUCCESS
Dependency Review:     #105 / 30855874772 — SUCCESS
unit tests:            327 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8872532865
artifact digest:       sha256:2c64346e46b3a927cc4f522c9fff3bbe41542d46d682b182029e6e4840bb69be
artifact retention:    through 2026-08-17
```

The complete production build, integrity, mobile, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio, Firefox/WebKit, generic search, exact `persistence contract` search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual-regression and custom-domain matrix passed.

### Delivered on implementation head

- canonical Note registry record with 12-minute reading time;
- grounded Markdown article;
- Notes index and TOC entry;
- metadata/OpenGraph identity;
- previous/next/related navigation;
- Atom feed inclusion;
- exact generated-search route assertion;
- permanent `restart-persistence-note` contract;
- durable PROJECT_STATE/ROADMAP/CHANGELOG synchronization;
- no runtime or dependency graph change.

### Claim boundary

P2.4k does not claim semantic correctness from hashes alone, unchanged hashes after intentional writes, complete historical migration coverage, equivalence between GameTests and production-JAR restart, completed provider/multiplayer/manual acceptance, zero data-loss probability or production deployment from PR CI.

### Next after merge

Operational maintenance closure: fresh Content Freshness report for issue #78, exact `npm audit --json` triage for issue #82 and live Pages/route/feed/search verification where tooling permits.

---

# 2026-08-03

## P2.4j — Deterministic Authority Around Probabilistic Proposals — DONE

Published:

**«AI может предложить, но не применить: как строить deterministic authority»**

Canonical route:

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

Draft M7.8C PR #42 remains unaccepted and owner-retest dependent.

### VillAIgence evidence

Merged operator-lore PR #85 keeps permission, identity resolution, bounds, SHA-256 revision conflict and persistent mutation server-authoritative. PR #103 GameTests and PR #104 production-JAR lifecycle acceptance remain separate automated evidence. Real-provider, multiplayer and product-owner cumulative acceptance remain pending.

### TDD and merge

```text
RED head:              1422efbaa6f0d4791d511bfb71fa89f1712c6604
RED Build:             #658 / 30852218324 — expected FAILURE
RED tests:             321 PASS / 3 expected FAIL

feature PR:            #87 — MERGED
exact feature head:    b38d225d837e5e347184ca09c685a479923ba06e
squash on master:      2fba404bbca9680d934f11f30c8a76347a5ab7b1
Build:                 #668 / 30853751417 — SUCCESS
CodeQL:                #110 / 30853751740 — SUCCESS
Dependency Review:     #96 / 30853751469 — SUCCESS
unit tests:            324 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8871721514
```

### New maintenance signal

`npm ci` on the unchanged dependency graph reports `6 moderate / 2 high`. Dependency Review remains SUCCESS, so the content milestone introduced no dependency delta. Issue #82 owns exact advisory/path triage; forced fixes, local shims and unreviewed forks remain rejected.

---

## P2.4i — Installed Acceptance Engineering Note — DONE

Published `От source tests к installed acceptance: что доказывает каждый release gate`.

```text
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash on master:      c03f8403b77df5a91238d62bd8a143c046511a92
Build:                 #655 / 30833707629 — SUCCESS
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
- Issue #82 remains the dependency maintenance owner and requires exact triage of the current high-severity summary.

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
