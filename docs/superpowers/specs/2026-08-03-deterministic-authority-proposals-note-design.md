# Deterministic Authority Around Probabilistic Proposals — Design

**Date:** 2026-08-03  
**Milestone:** P2.4j  
**Status:** approved for implementation

## Goal

Publish one grounded Russian Engineering Note explaining why probabilistic systems may propose evidence or decisions, while deterministic product boundaries remain the only authority allowed to mutate canonical state.

Working title:

**«AI может предложить, но не применить: как строить deterministic authority»**

Canonical slug:

`probabilistic-proposals-deterministic-authority`

## Why this Note exists

The landing already contains:

- a general Note about why green CI is not product verification;
- a VillAIgence release-gate retrospective;
- flagship evidence for Vlezet and VillAIgence.

The missing layer is the mutation boundary itself. Both flagship products accept uncertain or untrusted input, but neither grants that input direct authority over canonical state.

The Note must explain the shared pipeline without turning it into a generic AI-safety essay.

## Evidence scope

### Vlezet — accepted foundation

Use accepted M7.8B PR #41 as the public product foundation:

- local CV creates bounded reviewable candidates;
- AI receives exact local IDs and coordinates;
- AI may confirm/reject and adjust confidence evidence only;
- unknown IDs, moved geometry, cloud-only geometry, unbounded lines and overloaded responses are rejected;
- no `VlezetDocument` mutation occurs before explicit Apply;
- Apply and Undo remain semantic product operations;
- zero stale decisions and zero incorrect high-confidence candidates are recorded in the accepted benchmark;
- stronger providers can verify more existing candidates but cannot create missing geometry.

### Vlezet — current unaccepted evidence

PR #42 is a Draft awaiting product-owner retest. It may be referenced only as current implementation evidence, never as an accepted milestone or public capability claim.

Allowed bounded observations:

- strict-ID and geometry-immutable AI verification continues;
- active geometry is separated from diagnostic geometry;
- blocked candidates cannot participate in topology, opening-host analysis or Apply;
- AI cannot create, move, resize, thicken or re-host geometry;
- current exact-head automated gates pass, while the same real-plan retest remains mandatory.

The Note must explicitly label this evidence as Draft / not product-accepted.

### VillAIgence — server authority

Use merged operator-lore authority PR #85 and the risk catalogue as the deterministic mutation case:

- client/provider-originated values are untrusted requests;
- permission is checked server-side;
- WORLD and PLAYER identities are resolved by the server;
- VILLAGER and VILLAGE targets are resolved from a live nearby entity, current dimension and current home-village state;
- arbitrary UUID, dimension and village IDs are not accepted from the request;
- payload size, UTF-8, control-character and scope limits fail closed;
- writes require the current SHA-256 revision;
- stale writes return explicit `CONFLICT` and current canonical state;
- replay returns `UNCHANGED` without mutation;
- only the `APPLY` decision reaches the persistent store.

This is a server-authority example. The Note must not claim that every VillAIgence LLM response currently drives world mutation or that real-provider cumulative acceptance is complete.

## Core model

The Note presents one reusable seven-stage pipeline:

```text
probabilistic or untrusted proposal
→ bind to known identity
→ validate shape and bounds
→ authorize by product policy
→ re-read current canonical state
→ decide APPLY / CONFLICT / REJECT / UNCHANGED
→ perform one atomic authoritative mutation
```

The product boundary, not model confidence, owns the transition from proposal to truth.

## Required arguments

1. **Valid syntax is not authority.** Valid JSON, plausible geometry or high confidence only prove parseability or evidence strength.
2. **Identity must be bounded.** A proposal may refer only to server/local identities already known to the product.
3. **Geometry/value immutability reduces blast radius.** Verification may change evidence without silently replacing the candidate being verified.
4. **Current-state revalidation is mandatory.** A decision made against revision N must not overwrite revision N+1.
5. **Ambiguity is a product state.** Pending, diagnostic, conflict and rejected are valid outcomes; guessing is not required.
6. **Mutation is atomic and reversible where the product supports it.** Vlezet uses explicit Apply plus semantic Undo; VillAIgence returns canonical statuses and mutates only on APPLY.
7. **Evidence boundaries remain separate.** Draft CI, accepted product evidence, live provider evidence and cumulative acceptance are not interchangeable.

## Claim boundaries

The Note must not claim:

- that Vlezet M7.8C PR #42 is accepted or merged;
- arbitrary-plan recognition accuracy beyond accepted evidence;
- that AI can repair missing Vlezet geometry;
- that valid VillAIgence JSON authorizes gameplay/world mutation;
- completed VillAIgence real-provider or multiplayer cumulative acceptance;
- universal AI-safety guarantees;
- invented reliability, latency, adoption or accuracy metrics.

## Static integration

Use the existing Notes platform only:

- `data/notes.json`;
- `docs/landing/notes/<slug>.md`;
- `docs/landing/notes.md`;
- `docs/toc.yaml`;
- `data/page-meta.json`;
- build-time Note metadata/navigation;
- Atom feed;
- generated Diplodoc search;
- existing browser/accessibility/visual/custom-domain quality gates.

No new schema, renderer, CSS, browser runtime, backend, API, analytics event or search engine.

## Testing strategy

Add a permanent content contract before implementation.

The contract must require:

- exact registry slug/title/date/tags;
- canonical Markdown source;
- both Vlezet and VillAIgence evidence links;
- explicit accepted-vs-Draft distinction for Vlezet PR #41/#42;
- immutable IDs/geometry and explicit Apply language;
- server-side target resolution, revision conflict and current-state revalidation;
- `APPLY / CONFLICT / REJECT / UNCHANGED` decision model;
- claim boundaries;
- Notes index, TOC and page metadata integration.

The first PR Build must fail only because the new Note surfaces do not yet exist. All pre-existing tests must remain green.

## Completion criteria

1. The Note is grounded in exact source-project evidence.
2. Accepted and Draft evidence are visibly distinct.
3. Both product examples map to the same deterministic authority pipeline.
4. Registry, index, TOC, metadata, feed, navigation and search include the Note.
5. Full Build, CodeQL and Dependency Review pass on the final exact PR head.
6. PR is squash-merged with expected-head protection.
7. PROJECT_STATE, ROADMAP and CHANGELOG are synchronized after the feature merge.

## Next milestone after P2.4j

P2.4k — restart and persistence as a product contract, focused on read-back, restart, identity isolation, schema compatibility and user-visible continuity rather than stored bytes alone.
