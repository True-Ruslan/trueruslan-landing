# Restart and Persistence Product Contract — Design

## Goal

Publish one grounded Engineering Note that explains why persisted bytes are not yet a persistence guarantee. The product contract is continuity across controlled shutdown, exact-artifact restart, read-back, identity/isolation checks and user-visible behavior.

## Selected narrative

The Note uses VillAIgence as the primary case study and follows this evidence chain:

```text
in-memory state
→ bounded deterministic serialization
→ controlled shutdown and completed save
→ one canonical path per store
→ valid UTF-8 JSON and expected root shape
→ exact artifact starts the same world again
→ state is read back without silent recovery or duplication
→ stable identity and per-entity isolation survive restart
→ user-visible behavior remains continuous
```

A matching hash is strong evidence for byte continuity, but not by itself proof that:

- the application loaded the file;
- the schema is compatible;
- identities still refer to the same entities;
- two NPCs did not exchange state;
- the loaded state produces the intended behavior;
- migration or recovery paths are safe.

## Evidence base

### PR #66 — live 0.1.14 forgetting and decay checkpoint

Use only recorded, bounded claims:

- semantic capacity was temporarily reduced and restored;
- an older corroborated Basiliso FACT survived retention pressure;
- semantic UUID and `sourceEventIds` survived pressure and restart;
- decay ordering resolved otherwise equal entries;
- weak Casimiro relationship evidence was evicted;
- pressure remained isolated between Basiliso and Casimiro;
- five persistent files were byte-identical after restart;
- the rejected-new-append no-rewrite behavior remained automated-only, not live-proven.

This evidence shows that persistence includes identity, ordering and isolation semantics, not just file survival.

### PR #67 — live 0.1.15 security and restart checkpoint

Use these bounded claims:

- all six world-local files remained hash-identical across restart;
- Pio and Justino remained isolated;
- Pio retained the player name and favourite colour;
- a controlled TTS failure preserved visible text and Memory 2.0 dialogue;
- rejected hostile endpoints caused no credential transmission or persistence mutation;
- production configuration was restored byte-for-byte.

This evidence connects stored continuity with observable recall and failure isolation.

### PRs #92, #95 and #102 — startup failure plus safe rollback

Use them as negative evidence:

- exact candidates could pass repository/package gates and still fail before world load;
- gameplay acceptance did not start after the startup blocker;
- rollback restored the previous artifact;
- persistent hashes remained unchanged;
- service and ports recovered.

A persistence contract therefore includes a safe recovery decision, not only a successful forward upgrade.

### PR #103 — identity and inventory lifecycle

Use the GameTest NPC → tombstone item → NPC round trip to explain semantic persistence:

- UUID, name and full inventory multiset must survive the lifecycle;
- a valid serialized item is insufficient if the restored entity is semantically different;
- this is GameTest evidence, not production-JAR restart evidence.

### PR #104 — exact production-JAR restart oracle

Use its exact boundary:

- the remapped Fabric candidate ran outside Loom/development classpath;
- two independent JVM runs reached ready state;
- both received `stop`, completed save and exited with code 0;
- exactly one valid JSON copy of each canonical store was discovered;
- relative paths and SHA-256 values remained stable;
- fixture code was excluded from the distributable JAR.

Canonical stores:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

State explicitly that PR #104 proves no-mutation restart continuity for a deterministic fixture. It does not prove every migration, provider path, multiplayer race or cumulative gameplay scenario.

## Product model

The Note must separate four levels:

1. **Storage durability** — bytes can be written and remain present.
2. **Structural readability** — one canonical file is found and parses under the expected schema/root shape.
3. **Semantic continuity** — identity, evidence links, ordering, relationships and per-entity ownership remain correct.
4. **Behavioral continuity** — after restart the user observes the same recall, permissions, gameplay state and failure isolation.

The strongest acceptable public claim is always the narrowest level fully supported by evidence.

## Failure taxonomy

The article must explain these distinct failures:

- save never completed;
- duplicate or moved canonical store;
- invalid UTF-8/JSON;
- schema or migration incompatibility;
- silent empty-state recovery;
- valid bytes with wrong entity identity;
- cross-entity contamination;
- correct hashes but application never read the store;
- forward candidate rejected but rollback mutates state;
- successful restart with incorrect user-visible behavior.

## Static integration

Use the existing Notes platform only:

- one new `data/notes.json` record;
- one Markdown article;
- Notes index and TOC entry;
- `data/page-meta.json` entry;
- build-time previous/next/related navigation;
- Atom feed inclusion through the existing generator;
- Diplodoc generated search;
- one exact browser search assertion for the new canonical route;
- one permanent content/evidence contract.

No new schema, renderer, CSS, browser runtime, backend, API, analytics event or second search engine.

## Proposed identity

```text
slug: restart-persistence-is-a-product-contract
title: Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence
published: 2026-08-04
updated: 2026-08-04
reading time: 12 minutes
tags: Persistence, Reliability, Recovery, Acceptance
```

Related Notes:

- `source-tests-to-installed-acceptance`;
- `green-ci-is-not-product-verification`;
- `probabilistic-proposals-deterministic-authority`.

## Claim boundaries

The Note must not claim:

- that equal hashes prove semantic correctness by themselves;
- that PR #104 completed real-provider or cumulative installed acceptance;
- that every historical file format has a verified migration path;
- that GameTests and production-JAR restart are equivalent;
- that all six stores always must remain byte-identical after intentional writes;
- zero data-loss probability;
- universal persistence guarantees beyond recorded evidence.

## Testing strategy

TDD RED first. The new test must fail only because the registry, article and discovery surfaces are absent. Existing tests must remain green.

GREEN requires:

- exact metadata identity;
- required evidence markers for PRs #66, #67, #103 and #104;
- all six canonical store names;
- explicit distinction between byte, structural, semantic and behavioral continuity;
- rollback and migration/schema boundaries;
- index, TOC and page metadata exposure;
- generated search returning the canonical Note route for query `persistence contract`;
- complete existing CI/browser/accessibility/visual/custom-domain matrix.

## Self-review

- Placeholder scan: no TODO/TBD or incomplete requirement.
- Consistency: hashes are treated as byte-continuity evidence, never as complete semantic proof.
- Scope: one grounded static Note and its existing discovery/test surfaces.
- Ambiguity: intentional mutation, migration, rollback and cumulative acceptance boundaries are explicit.
