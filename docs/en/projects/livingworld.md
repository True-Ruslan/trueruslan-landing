# LivingWorld — server-authoritative AI NPCs for Minecraft

**LivingWorld** is a Fabric 1.21.1 mod for MCA Reborn that I use as an experiment in building AI-driven characters inside a normal multiplayer Minecraft server.

<span data-tr-project-status="livingworld"></span>

[GitHub repository ↗](https://github.com/True-Ruslan/minecraft-botics-ai)

![LivingWorld architecture](../../assets/diagrams/livingworld-architecture.svg)

<!-- case-study:problem -->
## Problem: an AI character still has to live by server rules

The initial idea sounded simple: instead of opening a separate chatbot window, talk to an MCA villager directly in the game through text or voice and make the character feel like part of the world.

Connecting an LLM turned out to be the easy part. The real problem was everything around it: **who owns the conversation, what context can be trusted, what the NPC should remember, what happens when an external provider partially fails and whether an old asynchronous answer still belongs to the current session**.

My core rule became:

> The server remains the source of truth for session ownership, context, memory and game actions. AI is a capability of the system, not its authority.

<!-- case-study:constraints -->
## Constraints that shaped the architecture

### Session ownership is more important than the input channel

A player may own one NPC conversation session, while one NPC must not accidentally participate in multiple independent conversations at the same time.

A voice packet by itself grants nothing. Voice is transport; the server first has to prove that this player owns the active session with this NPC.

### External capabilities fail independently

```text
voice PCM → STT → validated text → LLM → bounded response → TTS PCM
text command ────────────────────┘
```

STT can fail while text still works. TTS can fail after a useful text response already exists. An LLM provider can time out without giving old work the right to mutate a later session.

### Asynchronous work can outlive its own context

While STT, LLM or TTS is running, the player may end the conversation, disconnect or start a newer request. Cancellation therefore has to be normal control flow rather than an exceptional cleanup path.

### Memory must not belong to one prompt format

Persistent NPC identity, facts and relationships should survive a change in provider or prompt assembly strategy. Conversation context, durable memory, world context and provider-specific prompt representation are different concerns.

### LLM output cannot directly mutate the game world

Even a valid structured response remains an external proposal. Action type, parameters, current NPC/session state and world rules must pass a separate validation and authorization boundary.

<!-- case-study:decisions -->
## Key decisions

### Server-authoritative session ownership

A conversation starts with a server-owned `player ↔ NPC` session, not with an LLM request.

1. the player interacts with a live MCA villager;
2. the server creates an exclusive session;
3. text or voice is accepted only inside that session;
4. every answer belongs to a specific NPC and current owner;
5. ending or superseding the session invalidates related asynchronous work.

### Text and voice converge into one conversation core

Voice becomes a normalized message first. After that, text and voice follow the same session validation, context assembly, memory, LLM, fallback and cancellation rules.

### Provider stages have independent degradation boundaries

A TTS failure should not destroy a useful text response. An STT failure should not break the text channel. Timeouts and malformed responses should fail in bounded ways and release session resources predictably.

### Memory is separate from prompt representation

The server assembles bounded identity, memory and world context before a provider call. Persistent memory is not simply an endless provider-shaped transcript.

### The model proposes; the server decides

![LivingWorld request lifecycle and trust boundaries](../../assets/diagrams/livingworld-request-lifecycle.svg)

The trust flow is intentionally layered:

```text
input ownership
→ normalized message
→ server-built context and memory
→ LLM proposal
→ strict validation
→ persistence policy / action authorization
→ bounded effects
```

A structured and convincing model response does not become authoritative merely because it looks correct.

<!-- case-study:failures -->
## What I underestimated at first

### “Connect an LLM” is not the center of the problem

The hardest questions appeared before the provider call: ownership, concurrency, lifecycle and trust boundaries. Voice, memory and asynchronous providers only amplify ambiguity if those rules are not explicit first.

### A transcript is not a memory model

Simply replaying previous messages couples durable character state to a provider-specific prompt shape. Separating current context, durable facts/relationships, rebuildable world context and prompt representation is more resilient.

### Partial failure matters more than the perfect happy path

STT, LLM and TTS do not fail as one unit. Designing fallback per capability preserves useful results instead of collapsing the whole conversation into a generic “AI unavailable” state.

### Cancellation is control flow

An answer can be technically correct and still have no right to exist in the current session. Superseded work needs an explicit lifecycle state.

<!-- case-study:current-state -->
## Current state

LivingWorld is developed as a release-candidate system rather than presented as a finished multiplayer product. The canonical status badge above is injected from the same project registry used by the Russian site.

The architecture already brings session ownership, text/voice convergence, memory, provider boundaries, cancellation and controlled action authorization into one system. The remaining release boundary is dominated by real multiplayer and human acceptance rather than adding another isolated feature.

I intentionally do not duplicate version numbers, verification dates or trust claims in this translation.

<!-- case-study:evidence -->
## Evidence and verification boundary

The full machine-like Project Evidence snapshot and project timeline remain on the [Russian canonical LivingWorld page](../../landing/projects/livingworld.md). They are generated from shared registries and are intentionally not cloned into an English evidence model.

Automated tests can prove contracts such as persistence, session ownership, cancellation, rejection/fallback paths and reproducible builds. They cannot replace two real clients, real microphones, human evaluation of speech recognition/positional audio or staging provider-degradation checks.

That distinction is part of the product model: green CI is evidence with a scope, not a universal claim of product readiness.

<!-- case-study:retrospective -->
## What I would change if I started today

I would formalize the session/cancellation state machine before deep provider integration. That would make ownership, superseded requests and asynchronous lifetime boundaries explicit earlier.

I would also define degradation contracts for STT, LLM and TTS up front: what remains useful after each failure and which resources/state must be released.

Finally, I would separate persistent memory from prompt representation from day one and define manual acceptance gates alongside CI before the pipeline became complex.

---

Related English notes:

- [Designing a server-authoritative AI NPC pipeline](../notes/server-authoritative-ai-npcs.md)
- [Why successful LLM output still may violate the contract](../notes/llm-output-is-a-protocol-boundary.md)
