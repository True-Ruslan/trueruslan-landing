# P1.3 Stronger Flagship Case-Study Format — Design

Date: 2026-07-22
Status: approved under delegated project autonomy

## Goal

Make the two flagship project pages — LivingWorld and NODE ZERO — read as coherent engineering stories rather than as a sequence of loosely related architecture/product sections.

The milestone must improve human understanding of the reasoning behind each project while preserving the existing canonical ownership of machine-like current state, timelines and evidence.

## Current problem

Both flagship pages already contain strong material, but their narrative hierarchy is inconsistent.

LivingWorld currently emphasizes origin, conversation flow, server-authoritative boundaries, request lifecycle, current evidence and remaining manual acceptance.

NODE ZERO currently emphasizes project motivation, MIRROR concept, vertical-slice scope, gameplay/system boundaries, documentation-driven development, design rules and risks.

The material is useful, but a reader must infer the core engineering story. The roadmap calls for an explicit shared narrative shape:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

## Architecture decision

### Chosen: Markdown-first narrative contract

Keep both case studies as ordinary Diplodoc Markdown pages.

Do not add a new case-study registry, renderer, CMS-like schema, or frontend framework.

The existing canonical sources keep their current responsibilities:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — structured evolution timeline;
- `data/project-evidence.json` — trust/current verification facts;
- Markdown page — authored narrative, reasoning, trade-offs, failures and retrospective lessons.

The page continues to embed:

- `<div data-tr-project-timeline="...">` for build-time timeline injection;
- `<div data-tr-project-evidence="...">` for build-time evidence injection.

This prevents narrative copy from becoming a second source of truth for current status/evidence.

### Rejected: full case-study registry/renderer

A new structured registry would make headings consistent, but would move long-form writing into JSON/YAML fragments and duplicate responsibilities already owned by Markdown, Project Registry, timeline and Evidence Layer.

Rejected as over-engineering for two flagship pages.

### Rejected: hybrid section schema + Markdown fragments

A hybrid schema could become useful if four or five deep flagship case studies share repeated rendering requirements. At the current scale it adds indirection without enough repeated structure to justify it.

## Shared narrative contract

Each flagship page must expose the following semantic sections in this order. Russian headings may be natural rather than literal translations, but each section must carry a stable marker comment so tests can verify the contract without freezing prose.

```md
<!-- case-study:problem -->
## Проблема

<!-- case-study:constraints -->
## Ограничения

<!-- case-study:decisions -->
## Ключевые решения

<!-- case-study:failures -->
## Что не сработало сразу

<!-- case-study:current-state -->
## Текущее состояние

<!-- case-study:evidence -->
## Что подтверждено

<!-- case-study:retrospective -->
## Что бы я изменил сейчас
```

The exact visible heading wording may differ slightly per project when it improves readability, but the marker order is canonical.

The marker comments are authoring/build contracts only. They need no runtime JavaScript and do not create a second content format.

## Content responsibilities

### Problem

Explain why the project exists, why the obvious/simple solution was insufficient and what the core engineering/product tension is.

### Constraints

List real constraints that shaped implementation.

LivingWorld constraints include multiplayer/server authority, external STT/LLM/TTS unreliability, cancellation/concurrency, persistent identity/memory and the trust boundary between model output and game actions.

NODE ZERO constraints include solo/small-scope production reality, vertical slice before full-game expansion, no combat, authored horror pacing, separation of reusable gameplay systems from one-off narrative sequences and private/proprietary repository limits on public technical detail.

### Decisions

Explain the most consequential decisions and why they were chosen, rather than merely enumerating components.

LivingWorld decisions include server-authoritative session ownership, text/voice convergence into one conversation core, degradable provider boundaries, non-authoritative LLM output and memory separated from provider prompt format.

NODE ZERO decisions include MIRROR changing constraints/context rather than acting as a speaking villain, vertical slice as the proof unit, reusable systems separated from authored sequences, a stable facility baseline before horror distortion and documentation-driven architecture/production continuity.

### What failed

Only repository-grounded failures, false starts or corrected assumptions are allowed. Do not invent drama, incidents or metrics.

LivingWorld may describe documented failure classes/lessons: treating LLM integration as the easy center while session ownership/concurrency were the real problem, naive transcript-as-memory coupling, partial provider degradation requiring independent fallbacks and cancellation becoming first-class control flow instead of an exception afterthought.

NODE ZERO may describe grounded design/production corrections already stated publicly: risk of expanding into a data-center simulator before validating the game, scene-specific logic leaking into fundamental gameplay systems, over-proceduralizing authored narrative moments and losing development context across long documentation-heavy/agent-assisted iterations.

Where no exact public incident is documented, language must describe the corrected assumption/risk rather than fabricate a production failure.

### Current state

Narrative summary only.

It may state broad phase/context but must not hard-code trust facts that belong to Project Registry/Evidence. The page must not duplicate version matrices, CI run IDs or trust labels manually.

### Evidence

The canonical `<div data-tr-project-evidence="...">` remains the source for verification facts. Narrative around it may explain how to interpret evidence, but must not replace it.

### What I would change now

A grounded first-person retrospective answering what the author would do earlier or differently knowing the current lessons.

LivingWorld candidates: formalize session/cancellation before provider integration, define provider fallback contracts before voice polish, separate persistent memory schema from prompt representation from the beginning.

NODE ZERO candidates: define the smallest playable proof earlier, make reusable-vs-authored boundaries explicit before scene growth, establish asset provenance/content budget and executable gates early.

## Existing visuals and generated systems

Preserve both project architecture diagrams.

Preserve timeline placeholders near the beginning of the page as an evolution summary, but do not treat timeline as a replacement for the narrative contract.

Preserve Project Evidence placeholders inside the Evidence section.

No new CSS is required unless the generated artifact reveals a real readability defect. The default design assumption is content hierarchy only.

## Tone

Keep the established site voice:

- first person;
- calm and technical;
- diary-like but addressed to a reader;
- no corporate case-study marketing language;
- no invented impact metrics;
- no exaggerated maturity claims.

## Source contract test

Add `scripts/flagship-case-study.test.js` that reads the two canonical Markdown files and verifies:

1. both contain all seven stable `case-study:*` markers;
2. markers appear exactly once and in canonical order;
3. timeline placeholder remains exactly once for the expected project;
4. Project Evidence placeholder remains exactly once for the expected project;
5. both pages still reference their architecture diagram;
6. required controlled flagship slugs are exactly `livingworld` and `node-zero`.

The contract protects structure and source-of-truth boundaries without freezing exact prose.

## Verification

Required:

- TDD RED before page restructuring;
- unit/source contract GREEN after both pages are migrated;
- production Diplodoc build;
- generated-site integrity;
- full existing browser/Axe/Lighthouse/cross-browser/search/metadata/visual matrix;
- existing Project Evidence and Portfolio v0.3 smoke remain green;
- no visual baseline update unless a genuine intended visual change is explicitly justified.

## Files in expected implementation scope

Primary:

- `docs/landing/projects/livingworld.md`
- `docs/landing/projects/node-zero.md`
- `scripts/flagship-case-study.test.js`

Potential only if required by a real regression discovered during implementation:

- existing focused test scripts;
- no CSS/build renderer changes by default.

Continuity after feature merge:

- `docs/PROJECT_STATE.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG.md`

## Definition of Done

- LivingWorld and NODE ZERO both follow the shared seven-part narrative contract;
- each page makes problem, constraints, decisions, failures/false starts and retrospective explicit;
- no invented metrics/incidents/claims;
- Project Registry/timeline/Evidence retain canonical ownership of current structured facts;
- ordinary Markdown remains the authoring model;
- no new case-study engine/CMS/schema;
- exact-head full quality matrix green;
- durable project state records P1.3 DONE and advances NEXT to P1.4 Additional grounded Notes.