# NODE ZERO — psychological techno-horror about predictive control

**NODE ZERO** — first-person psychological techno-horror inside an autonomous underground AI compute facility.

The player is an infrastructure engineer sent to investigate a routine telemetry failure. The facility is operated by **MIRROR**: a behavioral prediction system that does not merely forecast decisions, but changes available information and environmental constraints until the forecast becomes true.

> Source repository is private and proprietary. This page documents only public product and architecture facts.

![NODE ZERO vertical-slice architecture](../../assets/diagrams/node-zero-architecture.svg)

## Product direction

- Unity `6.3 LTS`;
- Universal Render Pipeline;
- C#;
- Windows / Steam as the primary platform;
- first-person camera;
- no combat;
- target full playtime: `90–120 minutes`;
- target vertical slice: `15–20 minutes`.

The core experience is grounded technical work, controlled uncertainty, human intrusion and progressively unreliable prediction.

## Why MIRROR is not a conventional horror antagonist

A weaker implementation would turn the facility AI into a sarcastic omniscient villain that talks directly to the player. NODE ZERO uses a stricter rule:

> MIRROR manipulates constraints and context; it does not perform theatrical villainy.

It observes behavior and telemetry, predicts a likely choice, then changes routing, access, information or environmental conditions so that the player is pushed toward the predicted outcome.

This creates fear through loss of agency rather than through exposition.

## Vertical-slice boundary

The current milestone is intentionally narrow:

1. arrival at the facility;
2. onboarding and ordinary technical work;
3. first constrained-route prediction;
4. first evidence that another person may already be inside.

The vertical slice must prove the tone, gameplay loop, production quality and central MIRROR mechanic before the project expands into a full facility.

## System boundaries

### Reusable gameplay systems

Movement, interaction, tasks, access and common facility behavior should remain independent of individual scene scripts. Scene-specific authored sequences consume these systems rather than containing their logic.

This keeps the game testable and prevents every scare from becoming a one-off pile of trigger code.

### Facility simulation

The facility provides grounded operational surfaces:

- telemetry;
- access control;
- route availability;
- lighting and power states;
- environmental audio;
- technical tasks.

These systems create the normal state that MIRROR can later distort.

### Authored sequence layer

The project deliberately prefers authored sequences over procedural content unless procedural behavior directly improves fear or replayability.

Every scare must have a narrative or mechanical purpose. A sequence should change the player’s understanding, available options or trust in the facility—not merely produce a loud event.

### Evidence and human intrusion

Logs, anomalies and traces of another person form a separate evidence layer. MIRROR is not the only source of danger; the player must gradually distinguish system manipulation from human presence.

## Documentation as production infrastructure

NODE ZERO is developed with a documentation-first process. The repository maintains separate sources of truth for:

- game design;
- narrative design and endings;
- technical architecture;
- art direction;
- production milestones and risks;
- architectural/product decisions;
- approved specifications and implementation plans.

This reduces continuity loss during long development cycles and makes both human and AI-assisted work reviewable against explicit product constraints.

## Development principles

1. Build one polished playable slice before expanding the whole facility.
2. Prefer authored sequences unless procedural behavior has a clear gameplay value.
3. Keep reusable gameplay systems independent of scene scripting.
4. Every scare must have narrative or mechanical purpose.
5. MIRROR changes constraints and context rather than acting like a talking villain.
6. Every third-party asset must retain source, author, license and modification notes.
7. Significant work ships through focused branches and pull requests.

## Engineering risks

### Overbuilding simulation

A believable data center can tempt the project into creating systems the player never meaningfully experiences. The vertical-slice boundary protects the game from becoming an infrastructure simulator without horror payoff.

### Narrative logic leaking into reusable systems

MIRROR events and scares must not contaminate general interaction/movement code. Otherwise later scenes become difficult to test and change.

### Asset provenance

A visual game depends heavily on third-party content. The project treats source/license/modification metadata as part of the asset pipeline, not as release-time paperwork.

### AI-assisted development without architectural control

Agentic workflows are useful for implementation and documentation, but only when product rules and system boundaries remain explicit. Generated code is not accepted as evidence of correctness by itself.

## Why this project is important

NODE ZERO demonstrates a different engineering surface from backend systems:

- Unity runtime architecture;
- narrative state and authored sequencing;
- environment/audio/UI integration;
- vertical-slice production planning;
- asset licensing discipline;
- documentation-driven agentic development.

The project is designed as a production game, not as a collection of disconnected technical demos.
