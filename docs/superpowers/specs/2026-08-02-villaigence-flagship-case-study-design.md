# VillAIgence Flagship Case Study — Design

**Date:** 2026-08-02  
**Repository:** `True-Ruslan/trueruslan-landing`  
**Source repository:** `True-Ruslan/villAIgence`  
**Target route:** `landing/projects/livingworld.html`

## 1. Goal

Upgrade the existing LivingWorld case study into the current public **VillAIgence** flagship without breaking the established route, project identity key, evidence renderer or search architecture.

The page must explain VillAIgence as a server-authoritative Minecraft 1.21.1 system that combines:

- text and voice NPC dialogue;
- STT → Chat → TTS capability stages;
- immutable server-owned AI context;
- episodic Memory 2.0;
- typed semantic FACT/BELIEF memory;
- relationships and deterministic persistence;
- operator-authored lore with a server-authoritative editor;
- provider failure isolation and bounded network security;
- selective MCA synchronization;
- exact-artifact, restart, rollback and installed-server acceptance boundaries.

The case study must be credible because it preserves partial and failed acceptance evidence instead of turning green CI into a broad release claim.

## 2. Public identity and compatibility

### Public name

- Display name: **VillAIgence**.
- Supporting tagline: **Giving villagers a mind of their own.**
- Public repository: `https://github.com/True-Ruslan/villAIgence`.

### Stable internal identity

The existing landing project key remains `livingworld`:

- registry slug: `livingworld`;
- route: `landing/projects/livingworld.html`;
- timeline key: `livingworld`;
- evidence key: `livingworld`;
- existing search and inbound links remain valid.

The page may explain that `LivingWorld / livingworld` remains compatibility-sensitive internal engine/data naming in the mod. The landing must not imply that the Minecraft mod ID, package root, config path or world-data directory were renamed.

## 3. Truth boundary

The page must distinguish four independent kinds of evidence:

1. **Automated repository validation** — unit tests, Fabric/NeoForge builds, package inspection, security policy and reproducibility checks.
2. **Exact release artifact verification** — official JAR identity, checksums and embedded metadata.
3. **Installed-server acceptance** — startup, gameplay, voice, persistence, restart and rollback against an exact JAR.
4. **Product acceptance state** — whether a candidate may be described as accepted for continued release promotion.

### Current source-repository truth at design time

- Primary branch: `1.21.1`.
- Current head: `e13660f5998fa1ed343548252d573140adc5b0c9`.
- Open PRs: none.
- `0.1.20+1.21.1` installed acceptance: **PARTIAL PASS — release defects found**.
- Confirmed `0.1.20` passes include Text, STT, Chat, TTS, Voice Chat, Operator Lore scopes, persistence/restart, rollback-world loading and most synchronized gameplay scenarios.
- Confirmed `0.1.20` defects include water drowning, destructive filled-grave Silk Touch behavior, embedded snapshot identity and one approximately 272-second Chat request.
- Water-navigation correction: merged PR #99; automated and package validation green; installed retest pending.
- Filled-grave preservation correction: merged PR #100; automated validation green; installed retest pending.
- Exact release identity correction: merged PR #101; automated, package and release-dry-run validation green.
- Installed `0.1.21+1.21.1`: startup blocked by `MixinTombstoneBlock`; rollback to `0.1.20` preserved six persistent hashes and restored server/voice/monitor operation.
- Direct owned-source tombstone correction: merged PR #102; automated/package validation green.
- Exact `0.1.22+1.21.1` installed startup, water, grave and cumulative acceptance remain pending.

The landing must not claim that `0.1.22` is an accepted installed release until newer source evidence proves it.

## 4. Narrative structure

The page keeps the controlled flagship seven-section contract:

1. **Problem** — an AI villager must remain subordinate to server authority, multiplayer ownership and persistent world state.
2. **Constraints** — asynchronous providers, mutable game state, world-local persistence, multi-NPC isolation, compatibility-sensitive MCA identifiers and exact-artifact release validation.
3. **Decisions** — immutable bounded context, one conversation core, typed memory, server-owned FACT/action authority, operator lore, capability-level degradation and exact release identity.
4. **Failures** — transcript-first memory limits, provider coupling, broad Mixin hooks, green CI versus failed installed startup, water drowning, destructive grave drop and excessive Chat latency.
5. **Current state** — automated candidate state after PR #102, with live `0.1.22` acceptance still pending.
6. **Evidence** — generated Project Evidence snapshot with explicitly bounded scope.
7. **Retrospective** — design authority, persistence and release gates before feature breadth.

## 5. Architecture diagram

Add a production-safe SVG diagram showing the complete authority flow:

```text
Player text / voice
        ↓
server session and identity validation
        ↓
immutable bounded context
  ├─ observed world facts
  ├─ operator lore
  ├─ episodic memory
  └─ semantic FACT/BELIEF
        ↓
STT / Chat / TTS provider capabilities
        ↓
LLM proposal
        ↓
server policy + revalidation
        ↓
Minecraft action / relationship / persistence
```

A second visual lane must show the evidence/release boundary:

```text
source + tests
→ remapped distributable JAR
→ exact release identity
→ installed startup
→ focused gameplay regression
→ restart / persistent hashes
→ cumulative acceptance
```

SVG requirements:

- semantic `<title>` and `<desc>`;
- critical paint in presentation attributes;
- no embedded `<style>` dependency;
- responsive viewBox;
- no private server paths, secrets, prompts or transcripts.

## 6. Registry and timeline changes

### `data/projects.json`

Update the existing `livingworld` record:

- `name`: `VillAIgence`;
- status: corrective release candidate / active development wording;
- summary: persistent server-authoritative AI society layer;
- repository URL: `True-Ruslan/villAIgence`;
- tags expanded to Memory 2.0 / Security where appropriate;
- route and slug unchanged.

### `data/project-history/livingworld.json`

Replace the old local-RC timeline with a bounded sequence:

- past: security baseline and Memory 2.0 foundation;
- past: operator lore S9–S10c and cumulative `0.1.20` partial acceptance;
- current: corrective `0.1.22` candidate after PR #102;
- next: exact installed startup, water, grave, restart and cumulative acceptance;
- future: additive legacy memory migration and long-horizon society behavior only after acceptance.

Exactly one entry is `current`.

## 7. Evidence snapshot

Refresh the existing `livingworld` snapshot to `2026-08-02`.

Version facts should remain stable and public-safe:

- Minecraft 1.21.1;
- Java 21;
- primary Fabric package;
- NeoForge compile compatibility;
- Memory 2.0 persistence;
- latest accepted installed checkpoint versus current corrective candidate state.

Signals:

1. **Installed `0.1.20` partial acceptance** — manual/accepted-with-defects semantics, scope lists both passes and four defects.
2. **Corrective PR train #99–#102** — automated merged scope, explicitly not installed acceptance.
3. **Installed `0.1.21` startup failure and safe rollback** — manual failed state, preserving six persistent hashes and restored service operation.

The snapshot status may remain `verified` because the bounded statements themselves are verified; the positive badge must not imply that the release candidate passed live acceptance.

## 8. Site integration

Update:

- project page title and copy;
- project registry card and project hub label;
- page metadata/OpenGraph;
- navigation text where the old public name appears;
- project evidence and timeline;
- relevant related-note wording;
- generated search expectations;
- browser artifact preservation.

Do not create a second VillAIgence route or duplicate project card in this milestone.

## 9. Quality and TDD

### RED contracts

Add tests before implementation that require:

- public `VillAIgence` identity while preserving `livingworld` slug/route;
- canonical GitHub URL;
- current source head and acceptance boundary in the page/evidence data;
- seven case-study markers;
- new diagram with production-safe paint;
- timeline with exactly one current corrective-candidate milestone;
- controlled flagship set remains intentionally small;
- browser routes continue using `landing/projects/livingworld.html`;
- no broad `0.1.22` installed PASS claim.

### GREEN validation

The exact feature head must pass the full configured matrix:

- unit tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Project Evidence enhanced/no-JS;
- diagram browser raster check;
- portfolio smoke;
- Firefox/WebKit;
- generated search;
- RU/EN boundary;
- analytics;
- metadata/OpenGraph;
- visual regression;
- custom-domain artifact verification.

### Manual review

Review exact-head screenshots for:

- homepage and Projects card rename;
- VillAIgence desktop/mobile page;
- diagram legibility;
- evidence distinction between partial PASS, failed startup and pending live retest;
- no overflow or misleading positive release language.

Visual baselines are updated only after manual review and only for surfaces changed intentionally.

## 10. Non-goals

This milestone does not:

- modify `True-Ruslan/villAIgence` runtime code;
- publish or tag `0.1.22`;
- claim installed acceptance that has not occurred;
- expose private prompts, transcripts, keys, server paths or world data;
- rename compatibility-sensitive `mca` / `livingworld` identifiers;
- add a backend, CMS, database or runtime GitHub API;
- add live provider metrics or volatile release counters;
- expand the controlled flagship set beyond the existing three projects;
- implement legacy `memory.json` migration or rumor propagation.

## 11. Acceptance

The milestone is complete when:

- the public site consistently presents the project as VillAIgence;
- old route compatibility is preserved;
- the page explains authority, memory, operator lore, security and release evidence as one coherent system;
- exact source facts through PR #102 are represented without overclaiming;
- all exact-head quality gates pass;
- reviewed screenshots confirm the design;
- durable project state is synchronized in a separate follow-up PR after feature merge.
