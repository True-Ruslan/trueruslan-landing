# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** is an MCA-derived Minecraft 1.21.1 mod that has grown from AI-assisted villager dialogue into an experiment in persistent NPC society: text and voice interaction, Memory 2.0, relationships, operator-authored context and bounded server-owned actions.

<span data-tr-project-status="livingworld"></span>

[GitHub repository ↗](https://github.com/True-Ruslan/villAIgence)

The internal `LivingWorld / livingworld` names remain compatibility-sensitive engine, configuration and world-data identities. The public project name changed without silently renaming the `mca` mod id, Java package root or `<world>/livingworld/` storage.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

<!-- case-study:problem -->
## Problem: a convincing NPC must still obey the server

The provider call is not the hardest part. The system must decide who owns a conversation, which context was actually observed, what the NPC may remember, whether an asynchronous answer is still current and where an LLM proposal ends before an authoritative game mutation begins.

> The server owns identity, context, memory, relationships, actions and persistent evidence. The model may propose; it never becomes the authority.

Release evidence has the same boundary problem. A green source pipeline does not automatically prove that the exact remapped JAR starts, saves, restarts and survives the real provider or multiplayer scenarios expected from the product.

<!-- case-study:constraints -->
## Constraints and risks

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

### Provider and release proof are layered boundaries

Authenticated redirects, unsafe endpoints, malformed JSON, oversized bodies and unbounded waits must fail closed. Source tests, GameTests, package inspection, production-JAR startup, restart and cumulative acceptance remain distinct proof layers.

<!-- case-study:current-state -->
## Current lifecycle and accepted boundary

The accepted automated boundary belongs to the published candidate `0.1.23+1.21.1`.

It currently proves:

- a validated 28-scenario risk catalogue;
- seven real-server Fabric GameTests;
- exact remapped production-JAR installation outside Loom/dev classpaths;
- two JVM runs reaching the Minecraft ready marker;
- controlled shutdown, complete world save and exit code 0;
- stable relative paths and SHA-256 values for all six canonical stores across restart;
- fail-closed exclusion of test fixtures from the distributable JAR.

This is production-JAR startup and restart evidence. It does not prove cumulative real-provider, multiplayer and gameplay acceptance. The public lifecycle remains **release candidate — ACCEPTANCE IN PROGRESS**.

Active development is separate. Draft PR #110 at observed head `e0b763aa4a5caea8897aadc6ee2cab6c1b407c89` defines a RED contract for one shared STT → Chat retries → TTS deadline and exactly-once dialogue and relationship commits. Security and Java PR checks pass, while the main CI intentionally fails because the production APIs do not exist yet. PR #110 is not an implementation or acceptance claim.

<!-- case-study:decisions -->
## Architecture and key decisions

### Server-owned session and immutable context

A conversation begins with an authoritative `player ↔ NPC` session. Text or voice is accepted only inside that session. The server captures bounded identity, observed facts, operator lore and memory, then revalidates the session and world before an answer can affect state.

### Memory 2.0 preserves provenance and ownership

Episodic events describe what happened. Semantic entries distinguish server-observed FACT from PLAYER_TOLD, NPC_TOLD or INFERRED BELIEF. Actions and relationship changes enter memory only after server-owned execution. Deterministic IDs and per-NPC retention prevent retries from duplicating effects or one NPC from evicting another NPC's knowledge.

### Operator Lore remains background context

The client editor never owns files or arbitrary identities. Permission checks, trusted target resolution, SHA-256 revision conflicts and atomic world-local writes remain server-authoritative. Operator lore is not automatically promoted into semantic FACT.

### Capability-level degradation preserves useful results

STT, Chat and TTS have separate failure boundaries. A successful Chat result can remain useful when TTS fails, while retries must never duplicate dialogue, actions or relationship changes.

### Risk-based and exact-artifact gates answer different questions

PR #103 introduced the risk catalogue and GameTests. PR #104 installed the exact remapped candidate into an isolated production server and verified startup, controlled shutdown, restart and persistent-store hashes. Neither gate is represented as cumulative product-owner acceptance.

## Real failures that changed the system

The installed `0.1.20+1.21.1` candidate passed the main dialogue, voice, lore, persistence, restart and most gameplay scenarios, but still ended as a partial PASS: an NPC drowned after becoming trapped in water, a filled grave disappeared under Silk Touch, runtime identity reported a snapshot and one Chat request took about 272 seconds.

The following `0.1.21+1.21.1` candidate failed during startup because a tombstone Mixin could not resolve its production target. Safe rollback restored `0.1.20`, preserved six persistent hashes and recovered the server, voice and monitoring surfaces.

These failures narrowed water navigation, moved grave preservation into owned source, made embedded release identity fail closed and established startup/restart as automatic gates. They also exposed why one user turn needs a shared monotonic deadline rather than independent stage budgets.

<!-- case-study:alternatives -->
## Alternatives considered and rejected

### Client-owned authority

Rejected. The client may request and display an interaction, but it cannot own NPC identity, facts, relationships or world mutations.

### Transcript-only memory

Rejected. A single message list cannot represent provenance, semantic FACT/BELIEF, executed actions, relationship changes and deterministic retention.

### LLM-created facts or direct actions

Rejected. The model may propose; current server state is revalidated before any permitted effect is executed.

### Broad upstream synchronization and production-sensitive Mixins

Rejected in favour of small owned-source packages. Installed startup failure showed that source-compatible injection is not sufficient production evidence.

### Source CI as release acceptance

Rejected. Package identity, real-server startup, save, restart and persistent read-back require separate gates.

### Fresh timeout budgets for every provider stage

Rejected. Sequential STT, Chat retries and TTS must share one user-visible budget instead of accumulating independent maximum waits.

<!-- case-study:evidence -->
## Evidence boundary

The complete Project Evidence snapshot and timeline remain on the [Russian canonical VillAIgence page](../../landing/projects/livingworld.md). They are generated from shared registries rather than copied into a second English evidence model.

That snapshot separates historical partial acceptance, startup failure and rollback, corrective work, GameTests, production-JAR startup/restart and Draft PR #110. Automated evidence is never widened into cumulative acceptance.

<!-- case-study:limitations -->
## Known limitations

- cumulative real-provider Text/STT/Chat/TTS and Voice Chat acceptance is pending;
- the shared orchestration deadline currently exists only as the RED contract in Draft PR #110;
- a logical two-client Operator Lore conflict test is still required;
- focused live water-navigation and filled-grave canaries remain mandatory;
- user-visible Chat latency needs a global deadline contract;
- final product-owner acceptance and promotion are not complete;
- Fabric remains the primary package while NeoForge is a compatibility build with separate boundaries.

<!-- case-study:next -->
## Next accepted milestone

First, implement M11 Phase C and make the shared STT → Chat retries → TTS deadline contract green without duplicating dialogue or relationship commits.

Then run one exact published candidate through cumulative real-provider, multiplayer, focused gameplay, restart and product-owner acceptance. Until that sequence passes, the lifecycle remains `release-candidate` / `ACCEPTANCE IN PROGRESS`.

<!-- case-study:related -->
## Related material

- [Designing a server-authoritative AI NPC pipeline →](../notes/server-authoritative-ai-npcs.md)
- [Why successful LLM output still may violate the contract →](../notes/llm-output-is-a-protocol-boundary.md)
- [Russian canonical evidence and timeline →](../../landing/projects/livingworld.md)
- [GitHub repository ↗](https://github.com/True-Ruslan/villAIgence)

<!-- case-study:retrospective -->
## What I would change if I started today

I would define the complete authority map before deep provider integration:

```text
mutable server state
→ immutable bounded snapshot
→ external proposal
→ current-state revalidation
→ authoritative effect
```

I would separate episodic and semantic memory from the first version and define Operator Lore as background context immediately.

I would also establish the full release gate before the first public candidate. Source tests, integration tests, package inspection, startup, restart, live canaries and manual acceptance answer different questions. Keeping those questions separate makes a failed gate useful evidence instead of something hidden behind an overall green badge.
