# Designing a server-authoritative AI NPC pipeline

When I started building LivingWorld, connecting an LLM looked like the obvious center of the task: send text, receive a response, show it to the player.

For a multiplayer game, that solves very little by itself. If an AI character is part of the world, the system still has to answer ordinary engineering questions: who owns the conversation, how memory is stored, how voice enters the system, when old requests become invalid and where the boundary sits between a model proposal and a real game action.

The architecture I ended up preferring is server-authoritative: session ownership, context, memory, provider orchestration and action permission stay under server control.

## 1. Start with a session, not an LLM call

Before any AI request, the server should already know:

- which player owns the conversation;
- which NPC is involved;
- whether the session is still active;
- whether the input channel is allowed;
- whether older work must be cancelled or superseded.

Without explicit session ownership, voice, cancellation and multiple concurrent players create ambiguous states very quickly.

## 2. Text and voice should converge into one conversation core

```text
Text input ───────────────────────┐
                                  ▼
Voice → PCM → STT → normalized message
                                  │
                                  ▼
                          conversation core
```

Voice is a transport mechanism, not a second domain model. After speech is normalized into a message, both channels should follow the same rules for session validation, context, memory, provider calls, fallback and cancellation.

## 3. The LLM is not the authority

A model may propose text or an action, but its output should not directly mutate the Minecraft world.

```text
LLM output
   ↓
structured proposal
   ↓
validation / authorization
   ├── rejected
   └── allowed → game action
```

Before an action, the server still validates its type, parameters, current NPC state, session ownership and world rules.

This matters especially because user text is part of the prompt. Prompt injection should not become a path to game-server command injection.

## 4. Keep memory separate from the prompt

Treating memory as “send the previous transcript again” couples durable state to one prompt shape and one provider strategy.

I prefer separating:

- short-lived conversation context;
- durable NPC facts and relationships;
- world context that can be rebuilt;
- provider-specific prompt representation.

That makes it possible to change providers or prompt assembly without redefining what the character actually remembers.

## 5. Cancellation is normal control flow

The pipeline contains slow external stages:

```text
STT → LLM → TTS
```

During them, a player can end the conversation, disconnect or submit newer work. The NPC may also stop being valid in the current context.

An old response can therefore be technically correct and still be unauthorized because the session that created it no longer exists. Cancellation and supersession need to flow through the pipeline as normal lifecycle states.

## 6. Fallback matters more than a perfect happy path

External capabilities fail independently:

- STT may fail while text input remains usable;
- the LLM may time out;
- TTS may fail after a valid text response already exists;
- persistence may fail independently of response generation.

I do not want those states collapsed into a generic “AI is broken”. Capability-specific degradation preserves useful output and makes recovery easier to reason about.

Examples:

- STT failure should not disable text chat;
- TTS failure should not discard a useful subtitle/text response;
- provider timeout must release session resources;
- persistence failure must not pretend that memory was saved.

## 7. Automated verification has a boundary

LivingWorld uses automated tests for contracts such as ownership, cancellation, persistence/restart behavior, rejection and fallback paths, reproducibility and synthetic multi-session scenarios.

That still is not identical to real multiplayer acceptance. Two-client voice behavior, real microphones, Russian STT quality, positional speech perception and staging provider degradation require live checks.

The useful distinction is simple:

> Automation proves specific properties. It does not automatically prove the whole product.

## The principle I keep returning to

The longer I work with these systems, the less useful I find the idea of “AI as the center of the application”.

A more robust model is:

> **AI is one capability of the system, not the source of truth for the system.**

Server-owned sessions, provider abstraction, separate memory and action authorization let the application use LLM capabilities without handing a probabilistic external system control over the lifecycle of the world.

---

Related:

- [LivingWorld case study](../projects/livingworld.md)
- [Why successful LLM output still may violate the contract](llm-output-is-a-protocol-boundary.md)
