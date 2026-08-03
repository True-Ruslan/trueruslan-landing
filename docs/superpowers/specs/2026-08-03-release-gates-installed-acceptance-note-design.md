# Release Gates and Installed Acceptance Engineering Note — Design

## Status

Approved design for the next TrueRuslan Landing content milestone after P2.4h Product Evidence Reconciliation.

## Problem

The existing Engineering Note `green-ci-is-not-product-verification` explains the general rule that a green pipeline is bounded evidence rather than a complete product claim. VillAIgence now provides a concrete release-engineering sequence that deserves a narrower case study:

```text
source tests
→ loader/build checks
→ distributable package
→ exact embedded identity
→ server GameTests
→ exact production-JAR startup
→ controlled shutdown/restart
→ persistent-store hashes
→ focused installed canaries
→ cumulative provider/multiplayer acceptance
→ promotion
```

Without a dedicated article, several materially different gates can be collapsed into the vague statement “CI passed.” That loses the most useful lesson from the `0.1.20`–`0.1.23` acceptance history: a failure at a later layer does not invalidate earlier evidence, and success at an earlier layer does not prove the later layer.

## Selected approach

Publish one Russian grounded Engineering Note focused on VillAIgence as a release-engineering case study.

Working title:

**От source tests к installed acceptance: что доказывает каждый release gate**

Canonical slug:

`source-tests-to-installed-acceptance`

The article will follow the actual evidence chain:

1. `0.1.20+1.21.1` installed partial PASS exposed water, filled-grave, embedded-version and Chat-latency defects despite passing repository gates.
2. Corrective PRs #99–#101 repaired source/package contracts, but did not yet prove installed startup.
3. Exact `0.1.21+1.21.1` failed before world load because a production Mixin target could not resolve.
4. Safe rollback to `0.1.20` restored service and preserved six persistent hashes; rollback is recorded as a successful acceptance outcome, not hidden as an embarrassment.
5. PR #102 removed the startup injection blocker and strengthened the remapped package contract.
6. PR #103 introduced a risk-based 28-scenario catalogue and seven Fabric GameTests, proving selected integration properties inside a real test server while explicitly not claiming production-JAR lifecycle acceptance.
7. PR #104 installed the exact remapped candidate outside Loom/dev classpath, started two separate JVMs, stopped and saved cleanly, and verified stable paths and SHA-256 values for six canonical stores.
8. Real provider, two-client, focused live gameplay and product-owner cumulative acceptance remain a distinct pending boundary.

## Alternatives considered

### 1. Extend the existing green-CI Note

Rejected. It would mix a stable general principle with a time-bounded VillAIgence release narrative, make the earlier article less focused and obscure the distinction between Evidence Layer semantics and exact-artifact acceptance engineering.

### 2. Compare VillAIgence and Vlezet equally

Rejected for this milestone. Vlezet is useful for a later Note about deterministic authority around probabilistic proposals, but it does not provide the same installed-package/startup/restart chain. A dual-project article would weaken the release-gate narrative.

### 3. Create an interactive release-gate diagram or new renderer

Rejected as unnecessary. Existing Markdown, Note metadata, navigation, Atom feed, search, page metadata and site quality gates are sufficient. A text diagram inside the article communicates the layer model without new runtime, CSS or component ownership.

## Content architecture

The article will contain these bounded sections:

1. **Один зелёный статус скрывает разные вопросы** — establishes that each layer has a different oracle.
2. **Source and unit tests** — explain what deterministic source contracts prove and what namespace/classpath/runtime facts they cannot prove.
3. **Build, package and embedded identity** — use PR #101 and the snapshot-version mismatch to show that a release filename is not artifact identity.
4. **Installed startup as a separate gate** — use the `0.1.21` Mixin failure to show why startup blockers outrank downstream gameplay checks.
5. **Rollback is a valid acceptance result** — record six stable persistent hashes and restored service.
6. **GameTests are integration evidence, not installed evidence** — explain PR #103’s risk catalogue and seven GameTests.
7. **Production-JAR startup/restart evidence** — explain PR #104’s exact remapped candidate, isolated server, two JVM runs, clean stop/save, exit code 0 and six-store hashes.
8. **What remains outside automation** — real Text/STT/Chat/TTS, Voice Chat, logical two-client conflict, focused live water/grave and product-owner cumulative acceptance.
9. **Practical release-gate model** — compact checklist for reading or designing a release pipeline.
10. **Evidence** — stable links to PR #98–#104 and the canonical validation document.

## Public claim boundary

The Note must not claim:

- that `0.1.23+1.21.1` has completed cumulative installed acceptance;
- that GameTests are equivalent to operator-server behavior;
- that production-JAR startup/restart proves real external-provider behavior;
- that stable hashes alone prove semantic correctness of every stored record;
- that a published release or successful package check proves world load;
- reliability, adoption, latency or failure-rate metrics not contained in accepted evidence.

The Note must explicitly state:

- `0.1.20` was a partial PASS;
- `0.1.21` startup failed before world/gameplay acceptance;
- rollback preserved six persistent hashes and restored the previous service;
- PR #103 and PR #104 prove different layers;
- cumulative acceptance remains pending.

## Integration with the existing Notes platform

The implementation will follow current conventions:

- add one entry to `data/notes.json`;
- create `docs/landing/notes/source-tests-to-installed-acceptance.md`;
- add the article to the Reliability section of `docs/landing/notes.md`;
- add one TOC item under Engineering Notes;
- add one `data/page-meta.json` entry;
- rely on existing build-time Note enhancement for reading metadata and previous/next/related navigation;
- rely on existing Atom feed generation and Diplodoc search indexing;
- use `green-ci-is-not-product-verification`, `static-site-quality-gates` and `server-authoritative-ai-npcs` as related Notes.

No new schema, renderer, CSS, JavaScript runtime, backend, API, analytics event or search engine is introduced.

## Testing strategy

### RED contract

Add a new test file before content implementation. It will require:

- canonical Note registry entry with the selected slug, title, dates, tags and related Notes;
- source Markdown containing all required acceptance layers and exact evidence markers;
- explicit pending cumulative-acceptance language;
- Notes index, TOC and page metadata integration;
- no unsupported “fully verified” or equivalent broad claim.

The first run must fail because the new Note does not yet exist.

### GREEN verification

After implementation:

- `npm test` must pass;
- `npm run build:docs` must pass;
- generated-site integrity must pass;
- existing Notes browser smoke must confirm metadata/navigation/feed;
- generated search must find the new title and VillAIgence release-gate terms;
- metadata/OpenGraph, accessibility, visual regression and custom-domain artifact gates must pass in the standard CI matrix.

## Success criteria

The milestone is complete when:

1. the grounded Note is readable as a standalone case study and does not duplicate the general green-CI article;
2. every factual release claim is supported by accepted VillAIgence evidence;
3. the Note is present in registry, index, navigation, Atom feed, search and metadata;
4. the exact PR head passes Build, CodeQL and Dependency Review;
5. the PR is squash-merged and durable state documents are synchronized separately if required.
