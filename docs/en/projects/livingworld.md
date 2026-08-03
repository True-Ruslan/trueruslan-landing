# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** is an MCA-derived Minecraft 1.21.1 mod that has grown from AI-assisted villager dialogue into an experiment in persistent NPC society: text and voice interaction, Memory 2.0, relationships, operator-authored context and bounded server-owned actions.

<span data-tr-project-status="livingworld"></span>

[GitHub repository ↗](https://github.com/True-Ruslan/villAIgence)

The internal `LivingWorld / livingworld` names remain compatibility-sensitive engine, configuration and world-data identities. The public project name changed without silently renaming the `mca` mod id, Java package root or `<world>/livingworld/` storage.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

<!-- case-study:problem -->
## Problem: a convincing NPC must still obey the server

The provider call is not the hardest part. The real system must decide who owns a conversation, which context was actually observed, what the NPC may remember, whether an asynchronous answer is still current and where an LLM proposal ends before an authoritative game mutation begins.

> The server owns identity, context, memory, relationships, actions and persistent evidence. The model may propose; it never becomes the authority.

Release evidence has the same boundary problem. A green source pipeline does not automatically prove that the exact remapped JAR starts, saves, restarts and survives the real provider or multiplayer scenarios expected from the product.

<!-- case-study:constraints -->
## Constraints that shaped the architecture

### Mutable game state cannot leak into asynchronous work

STT, Chat and TTS may finish after the session, player or NPC state has changed. The server captures an immutable bounded context before provider work and revalidates current state before applying any result.

### Text and voice share one conversation core

```text
voice PCM → STT → validated message ┐
                                     ├→ context → Chat → response → optional TTS
text command → validated message ────┘
```

Voice is transport. A failed TTS stage must not erase a useful text response, and a failed STT stage must not disable text interaction.

### Memory is not one provider-shaped transcript

VillAIgence separates bounded legacy dialogue history, episodic Memory 2.0 events, semantic FACT/BELIEF entries, relationships, voice identity and operator-authored lore. Current server-observed world facts remain authoritative over recalled or authored context.

### Release proof is layered

The acceptance chain is explicit:

```text
source tests
→ real integration GameTests
→ distributable package inspection
→ exact embedded identity
→ production-JAR startup
→ controlled shutdown and restart
→ focused live regressions
→ cumulative provider and multiplayer acceptance
→ promotion
```

<!-- case-study:decisions -->
## Key decisions

### Server-owned session and immutable context

A conversation begins with an authoritative `player ↔ NPC` session. Text or voice is accepted only inside that session. The server captures bounded identity, observed facts, operator lore and memory, then revalidates the session and world before an answer can affect state.

### Memory 2.0 preserves provenance and ownership

Episodic events describe what happened. Semantic entries distinguish server-observed FACT from PLAYER_TOLD, NPC_TOLD or INFERRED BELIEF. Actions and relationship changes enter memory only after server-owned execution. Deterministic IDs and per-NPC retention prevent retries from duplicating effects or one NPC from evicting another NPC's knowledge.

### Operator Lore remains background context

The client editor never owns files or arbitrary identities. Permission checks, trusted target resolution, SHA-256 revision conflicts and atomic world-local writes remain server-authoritative. Operator lore is not automatically promoted into semantic FACT.

### Risk-based acceptance covers architecture, not only known defects

PR #103 introduced a validated 28-scenario catalogue across seven risk domains and seven real-server Fabric GameTests. The suite verifies MCA navigation wiring, NPC-to-tombstone-to-NPC identity and inventory preservation, real Silk Touch filled-grave drops, an empty-grave negative control and deterministic water-navigation properties.

The test mod is excluded from the distributable artifact. GameTest evidence remains development integration evidence; it is not represented as production-JAR startup or manual operator acceptance.

### The exact production JAR is tested outside the development classpath

PR #104 installs the exact remapped Fabric candidate into an isolated Minecraft server. The harness validates a deterministic dependency manifest, waits for the ready marker, sends `stop`, requires a complete save and exit code 0, then repeats the lifecycle in a second JVM.

It discovers exactly one valid copy of all six canonical stores and requires stable relative paths and identical SHA-256 values across restart. Fixture classes and metadata are forbidden from leaking into the player/server JAR.

<!-- case-study:failures -->
## What real failures changed

The installed `0.1.20+1.21.1` candidate passed the main dialogue, voice, lore, persistence, restart and most gameplay scenarios, but still ended as a partial PASS: an NPC drowned after becoming trapped in water, a filled grave disappeared under Silk Touch, runtime identity reported a snapshot and one Chat request took about 272 seconds.

The following `0.1.21+1.21.1` candidate failed during startup because a tombstone Mixin could not resolve its production target. Safe rollback restored `0.1.20`, preserved six persistent hashes and recovered the server, voice and monitoring surfaces.

These failures showed why source-level intent and package checks cannot be collapsed into installed acceptance. The correction train narrowed water navigation, moved grave preservation into owned source and made embedded release identity fail closed.

They also changed the acceptance strategy. Startup, shutdown, restart and persistence are now automated against the exact production artifact, while real provider, multiplayer and gameplay canaries remain explicit separate gates.

<!-- case-study:current-state -->
## Current state

The canonical source head represented by this page is `61b66e38e99c1dc9bdc26089bfb345a250a881e2`.

The current published candidate is `0.1.23+1.21.1`. Its bounded automated evidence includes:

- a validated 28-scenario risk catalogue;
- seven real-server Fabric GameTests;
- exact remapped production-JAR installation outside Loom/dev classpaths;
- two separate JVM runs reaching the Minecraft ready marker;
- controlled shutdown, complete world save and exit code 0;
- unchanged relative paths and SHA-256 values for `memory.json`, `memory2.json`, `semantic-memory.json`, `relationships.json`, `voices.json` and `operator-lore.json` across restart;
- fail-closed exclusion of test fixture code from the distributable JAR.

Cumulative acceptance is still pending. This automated boundary does not prove real Text/STT/Chat/TTS and Voice Chat behavior, a global Chat deadline, logical two-client lore conflicts, focused live water and grave canaries or final product-owner acceptance.

The public lifecycle therefore remains **release candidate — acceptance in progress**, not production-ready.

<!-- case-study:evidence -->
## Evidence and verification boundary

The complete Project Evidence snapshot and timeline remain on the [Russian canonical VillAIgence page](../../landing/projects/livingworld.md). They are generated from shared registries rather than copied into a second English evidence model.

That snapshot preserves historical `0.1.20` partial acceptance and the `0.1.21` startup failure, then adds separate scopes for PR #103 GameTests and PR #104 production-JAR startup/restart evidence. No automated signal is widened into cumulative manual acceptance.

<!-- case-study:retrospective -->
## What I would change if I started today

I would define the full authority map before deep provider integration: mutable server state → immutable snapshot → external proposal → revalidation → authoritative effect.

I would begin with episodic and semantic memory as separate models instead of evolving from a transcript, and I would define operator lore as background context from day one.

I would also establish the full release gate before the first public candidate. Source tests, integration tests, package inspection, startup, restart and manual product acceptance answer different questions. Keeping those questions separate makes a failed gate useful evidence instead of something to hide behind an overall green badge.

---

Related English notes:

- [Designing a server-authoritative AI NPC pipeline](../notes/server-authoritative-ai-npcs.md)
- [Why successful LLM output still may violate the contract](../notes/llm-output-is-a-protocol-boundary.md)
