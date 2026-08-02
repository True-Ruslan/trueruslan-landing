# Vlezet flagship case study — design

**Date:** 2026-08-02  
**Status:** approved and updated after M7.8B product-owner failure  
**Repository:** `True-Ruslan/trueruslan-landing`

## Goal

Publish a grounded flagship case study for Vlezet that explains the product and the engineering reasoning behind it without turning active recognition work into an unsupported success claim.

The page must make one central idea clear:

> Vlezet treats the apartment document and deterministic geometry as authority. CV and LLM systems produce measurable, editable proposals that become ordinary geometry only after explicit review and Apply.

## Source of truth

Claims are limited to public, repository-backed evidence from `True-Ruslan/vlezet`:

- canonical `docs/PROJECT_STATE.md`;
- accepted milestone PRs and acceptance records through M7.8A;
- current Draft PR #41 for M7.8B, including the literal failed real-plan product-owner review and corrective iteration;
- exact-head CI and benchmark evidence recorded in those PRs.

Private apartment plans and owner screenshots are not copied into the portfolio repository.

## Audience

The primary reader is an engineer or hiring manager who wants to understand:

- what Vlezet is beyond a UI screenshot;
- which parts of the system are authoritative;
- how dimensions, rooms, openings, furniture and recognition relate;
- why recognition is benchmarked and still reviewable;
- what failed during development and what those failures changed;
- what is proven today and what remains unfinished.

The page is written in first person, calm and technical, consistent with the rest of the portfolio.

## Narrative contract

Vlezet becomes the third controlled flagship and follows the existing seven-section case-study contract:

1. problem;
2. constraints;
3. decisions;
4. failures;
5. current state;
6. bounded evidence;
7. retrospective.

It also owns exactly one project timeline placeholder, one Project Evidence placeholder and one architecture diagram.

## Product framing

Vlezet is described as a precise apartment planner for non-professional owners and buyers:

- draw or import a real apartment;
- work in understandable millimetres and usable dimensions;
- derive rooms and areas from geometry;
- place furniture and explain fit, collisions and clearances;
- use 3D as a projection of the same document;
- use CV/LLM recognition as assistance rather than geometry authority.

The case study avoids generic claims such as “AI accurately recognises any plan”. The M7.8B real-plan failure is a first-class part of the narrative rather than a hidden caveat.

## Core architecture story

The architecture diagram and narrative show this authority flow:

```text
reference image / PDF
        ↓ calibration and source normalisation
local CV + optional cloud review
        ↓ editable Recognition Draft
review / accept / reject / correct
        ↓ explicit Apply
VlezetDocument in millimetres
        ↓ deterministic derived systems
rooms · areas · dimensions · fit · planning · read-only 3D
```

Cross-cutting rules:

- Konva and Three.js are projections, not sources of truth;
- rooms and areas are derived;
- existing geometry is never silently replaced;
- provider keys and raw model responses are runtime-only;
- deterministic validation remains authoritative;
- Undo/Redo uses semantic commands;
- recognition confidence is bounded by evidence.

## Public project registry

Add Vlezet as an active, public, featured project:

- slug: `vlezet`;
- status class: `pre-production`;
- public label: `ACTIVE DEVELOPMENT`;
- canonical page: `landing/projects/vlezet.html`;
- GitHub link: `https://github.com/True-Ruslan/vlezet`;
- timeline: `vlezet`.

This adds the project to generated active-project surfaces from the existing registry. No second project data source is introduced.

## Project timeline

The timeline remains compact and truthful:

1. **Past:** authoritative local-first planner foundation through accepted M7.7;
2. **Current:** M7.8A benchmark accepted; M7.8B failed representative real-plan review and remains in corrective Draft iteration;
3. **Next:** prove a reviewable architectural shell on clutter-heavy and real sources before openings, room faces, labels, areas and confidence work.

The timeline must not imply that current Draft recognition quality is accepted.

## Evidence model

Add a bounded Vlezet entry to `data/project-evidence.json`.

Recommended status: `verified`, because the snapshot and accepted historical milestones are current and source-backed; individual signal states carry the result of each milestone, including the failed M7.8B review.

Signals:

- accepted M7.7 furniture/fit milestone with browser and product-owner evidence;
- accepted M7.8A benchmark foundation with product-owner calibration acceptance;
- M7.8B as `failed`, explicitly recording 417 local wall candidates, zero openings, symbol-network pollution, corrective structural masking and current non-accepted Source metrics.

The evidence panel must distinguish:

- proven deterministic/editor capabilities;
- an accepted benchmark system that can reveal failure;
- failed real-plan recognition acceptance;
- unfinished opening/room/area recognition;
- the difference between green CI and product acceptance.

## Project hub placement

Add Vlezet under “Над чем я сейчас работаю серьёзнее всего”, before LivingWorld, because it is currently under active product development and has the newest evidence loop.

The hub copy should be brief and route the reader to the full case study. The canonical project status is rendered from `data/projects.json` through the existing placeholder mechanism.

## Metadata and navigation

Add:

- RU page metadata/OpenGraph contract for `landing/projects/vlezet.html`;
- Vlezet item in the Projects section of `docs/toc.yaml`;
- generated search coverage through ordinary Diplodoc content;
- no English translation in this milestone.

English expansion remains conditional under the existing bounded RU/EN policy. English project cards may link to the Russian case study using the current fallback behaviour.

## Diagram requirements

Create `docs/assets/diagrams/vlezet-recognition-authority.svg`.

Requirements:

- semantic `<title>` and `<desc>`;
- no embedded `<style>`;
- no class-based critical paint;
- all visible paint in SVG presentation attributes;
- readable dark-theme palette;
- geometry and labels remain legible when embedded in Diplodoc;
- no private plan image or proprietary source asset.

The diagram is a conceptual authority map, not a fake product screenshot.

## Verification

### TDD contract

First extend `scripts/flagship-case-study.test.js` so `vlezet` is required as the third controlled flagship. The test must fail before the page and diagram exist.

Then implement the page and all data/navigation surfaces.

### Required automated gates

- unit tests;
- production Diplodoc build;
- generated-site integrity;
- flagship narrative contract;
- project registry/history/evidence validation;
- browser smoke, accessibility and Lighthouse;
- generated search;
- metadata/OpenGraph;
- Engineering Map compatibility;
- visual regression review;
- custom-domain artifact verification.

### Manual review

Review exact-head desktop and mobile screenshots for:

- hierarchy and readability;
- diagram legibility;
- project hub placement;
- no horizontal overflow;
- explicit failed M7.8B product-owner boundary;
- visible Evidence boundaries;
- no broad recognition-success claim.

## Non-goals

- changing Vlezet product code;
- copying private floor plans or screenshots;
- claiming final recognition accuracy;
- adding a live demo or runtime GitHub API;
- adding a new renderer, CMS, backend or analytics event;
- translating the full case study into English;
- changing the site-wide search owner;
- weakening any existing quality gate.
