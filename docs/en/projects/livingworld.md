# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** is an MCA-derived Minecraft 1.21.1 mod that has grown from AI-assisted villager dialogue into an experiment in persistent NPC society: text and voice interaction, Memory 2.0, relationships, operator-authored context and bounded server-owned actions.

<span data-tr-project-status="livingworld"></span>

[GitHub repository ↗](https://github.com/True-Ruslan/villAIgence)

The internal `LivingWorld / livingworld` names remain compatibility-sensitive engine, configuration and world-data identities. The public project name changed without silently renaming the `mca` mod id, Java package root or `<world>/livingworld/` storage.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

<!-- case-study:problem -->
## Problem: a convincing NPC must still obey the server

The initial idea was simple: talk to an MCA villager through text or voice and make the character feel like part of the current Minecraft world rather than a separate chatbot.

The provider call was not the hard part. The real system has to decide who owns the conversation, which context was actually observed, what the NPC may remember, whether an asynchronous answer is still current and where an LLM proposal ends before any authoritative game mutation begins.

> The server owns identity, context, memory, relationships, actions and persistent evidence. The model may propose; it never becomes the authority.

<!-- case-study:constraints -->
## Constraints that shaped the architecture

### Mutable game state cannot leak into asynchronous work

STT, Chat and TTS may finish after the session, player or NPC state has changed. The server therefore captures an immutable bounded context before provider work and revalidates current state before applying any result.

### Text and voice share one conversation core

```text
voice PCM → STT → validated message ┐
                                     ├→ context → Chat → response → optional TTS
text command → validated message ────┘
```

Voice is transport. A failed TTS stage must not erase a useful text response, and a failed STT stage must not disable text interaction.

### Memory is not one provider-shaped transcript

VillAIgence separates bounded legacy dialogue history, episodic Memory 2.0 events, semantic FACT/BELIEF entries, relationships, voice identity and operator-authored lore. Current server-observed world facts remain authoritative over recalled or authored context.

### Release evidence has multiple boundaries

Green source CI does not prove that a remapped distributable JAR starts on the installed server. Package structure, embedded identity, startup, focused gameplay regressions, restart and persistent hashes are separate gates.

<!-- case-study:decisions -->
## Key decisions

### Server-owned session and immutable context

A conversation begins with an authoritative `player ↔ NPC` session. Text or voice is accepted only inside that session. The server captures bounded identity, observed facts, operator lore and memory, then revalidates the session and world before an answer can affect state.

### Memory 2.0 preserves provenance and ownership

Episodic events describe what happened. Semantic entries distinguish server-observed FACT from PLAYER_TOLD, NPC_TOLD or INFERRED BELIEF. Actions and relationship changes enter memory only after server-owned execution. Deterministic IDs and per-NPC retention prevent retries from duplicating effects or one NPC from evicting another NPC's knowledge.

### Operator Lore remains background context

The client editor never owns files or arbitrary identities. Permission checks, trusted target resolution, SHA-256 revision conflicts and atomic world-local writes remain server-authoritative. Operator lore is not automatically promoted into semantic FACT.

### Provider failures degrade by capability

STT, Chat and TTS have independent bounded failure paths. Authenticated redirects are blocked, bodies and active PCM are limited, unsafe endpoints fail closed and diagnostics exclude credentials, prompts and transcripts.

### Selective MCA synchronization protects authority boundaries

Gameplay fixes are adopted as isolated packages instead of a broad upstream merge. Water navigation, tombstones, conversion identity, beds, ladders, pathfinding, mourning, gifts, fishing and mounted archers retain focused tests and acceptance scope.

<!-- case-study:failures -->
## What real failures changed

The installed `0.1.20+1.21.1` candidate passed the main dialogue, voice, lore, persistence, restart and most gameplay scenarios, but still ended as a partial PASS: an NPC drowned after becoming trapped in water, a filled grave disappeared under Silk Touch, runtime identity reported a snapshot and one Chat request took about 272 seconds.

The following `0.1.21+1.21.1` candidate failed during startup because a tombstone Mixin could not resolve its production target. Safe rollback restored `0.1.20`, preserved six persistent hashes and recovered the server, voice and monitoring surfaces.

These failures showed why a correct source-level intention and green package tests cannot be collapsed into installed acceptance. PR #102 moved tombstone preservation into owned source and removed the unsafe injection rather than weakening the startup gate.

<!-- case-study:current-state -->
## Current state

The canonical source head represented by this page is `e13660f5998fa1ed343548252d573140adc5b0c9`.

The merged correction train through PR #102 covers narrow water navigation, filled-grave preservation, exact release identity and direct tombstone wiring. Automated source and package gates are green.

The exact `0.1.22+1.21.1` installed startup, water, grave, restart and cumulative acceptance are still pending. The project is therefore presented as a corrective candidate, not as an accepted production-ready release.

<!-- case-study:evidence -->
## Evidence and verification boundary

The complete machine-like Project Evidence snapshot and timeline remain on the [Russian canonical VillAIgence page](../../landing/projects/livingworld.md). They are generated from shared registries rather than copied into a second English evidence model.

That snapshot distinguishes installed partial acceptance, automated corrective code and an installed startup failure. Green CI remains evidence with a bounded scope, not a universal readiness claim.

<!-- case-study:retrospective -->
## What I would change if I started today

I would define the full authority map before deep provider integration: mutable server state → immutable snapshot → external proposal → revalidation → authoritative effect.

I would also begin with episodic and semantic memory as separate models instead of evolving from a transcript, and I would define operator lore as background context from day one.

Finally, every release candidate would follow the same gate from the start:

```text
source tests
→ distributable package inspection
→ exact embedded identity
→ installed startup
→ focused regressions
→ restart and persistent hashes
→ cumulative acceptance
→ promotion
```

---

Related English notes:

- [Designing a server-authoritative AI NPC pipeline](../notes/server-authoritative-ai-npcs.md)
- [Why successful LLM output still may violate the contract](../notes/llm-output-is-a-protocol-boundary.md)
