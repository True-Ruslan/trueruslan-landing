# Vlezet — precise apartment geometry without CAD

**Vlezet** is a local-first apartment planner for reconstructing a real home from walls, openings and furniture, checking dimensions and areas, viewing the result in 3D, and using plan recognition as editable assistance rather than as a source of truth.

**Current status:** <span data-tr-project-status="vlezet"></span>

[Open the repository on GitHub ↗](https://github.com/True-Ruslan/vlezet)

![Boundary between recognition proposals and authoritative Vlezet geometry](../../assets/diagrams/vlezet-recognition-authority.svg)

<!-- case-study:problem -->
## Problem: an apartment plan must remain accurate after the first impression

A first planner prototype is comparatively easy: draw a rectangle, place a sofa and show an approximate area.

A real apartment breaks that model. A wall has a centre axis and thickness. An opening has width, position on a specific host wall and an opening direction. A room exists because walls form a closed topology, not because the interface painted a polygon. Furniture can appear to fit while blocking a door or leaving an unusable passage.

Importing a photograph or PDF adds uncertainty: rotation, margins, perspective, labels, dimension lines, plumbing, furniture and door arcs. Even a syntactically valid LLM response does not prove that reconstructed geometry matches the source plan.

> Recognition may propose geometry. It becomes authoritative only after review, deterministic validation and explicit Apply into the shared document.

<!-- case-study:constraints -->
## Constraints and risks

### Millimetres are the only persistent world unit

Canvas pixels change with zoom, viewport and display density. The persistent model stores millimetres. Konva, Three.js, on-screen dimensions and PNG export only project that model.

### One document instead of several parallel truths

`VlezetDocument` owns walls, openings, objects and versioned persistence. Rooms, areas, dimensions, 3D meshes and fit diagnostics are derived from it.

Recognition Drafts, planning Previews, UI filters, highlights and evidence remain temporary. They must not silently become a second apartment project beside the authoritative document.

### Existing geometry cannot be replaced silently

Local computer vision and cloud review cannot clear an apartment that the user has already drawn. Candidates may be accepted, rejected or corrected, but document mutation occurs only through an explicit Apply operation.

### An AI proposal is not authoritative geometry

Accepted M7.8B restricted cloud review to exact local candidate IDs. Later Draft PR #45 explores recovery of missing openings only as separate proposals. Each proposal must retain host evidence, pass deterministic raster, topology and overlap checks, remain reviewable, and enter the document only through explicit Apply. The model receives no AI geometry authority.

### 3D remains a projection

The Three.js view is read-only. It has no independent coordinate store, furniture-fit state or opening editor. Every edit returns to the shared 2D and domain command path.

<!-- case-study:current-state -->
## Current lifecycle and acceptance boundary

Milestones **M0 through M7.8B** are accepted in the main product line.

The accepted product already includes:

- walls, topology, rooms, openings, dimensions and areas in millimetres;
- furniture with exact transforms and collision, door-zone and clearance diagnostics;
- semantic Undo and Redo;
- local projects, autosave, backup, import, export and PNG output;
- reference-plan import, calibration and tracing;
- editable local and OpenRouter candidates with explicit Apply;
- a deterministic read-only 3D projection;
- bounded planning alternatives with Preview and revalidated atomic Apply;
- a responsive editor shell, inspectors, onboarding and furniture-fit workflow;
- a versioned recognition benchmark;
- M7.8B region-first wall extraction, bounded topology and verification-only AI.

M7.8B was accepted with known limitations. On the representative source it produced 27 local wall candidates: 19 were AI-confirmed and 8 remained pending review. Accepted Source geometry F1 and Source topology F1 were both `0.837989`. Openings were intentionally deferred instead of being guessed without host-wall evidence.

The current acceptance boundary is **M7.8C Opening Classification and Host-Wall Validation**. PR #42 remains a Draft at observed head `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a`. CI #3138, Recognition Benchmark #316 and M7 Browser Audit #769 pass, but the same representative real-plan product-owner retest is still mandatory.

Parallel work is recorded only as stacked Draft evidence:

- PR #44 at observed head `cd29740cf240d591785fc6607147d2bf07ece0b6` introduces the M7.9 real-fixture benchmark. Standard CI passes, while real wall geometry F1 `0.827338` and real opening F1 `0.627451` remain below the immutable `0.85` merge threshold;
- PR #45 at observed head `2c4d0f44e56753b9c44dd6c30a720d1a97f50c2e` explores M7.8C.1 hybrid proposal recovery on top of PR #44. AI may return a separate proposal, but it cannot create authoritative geometry without deterministic validation, review and Apply.

PR #42, PR #44 and PR #45 remain Draft work. They do not raise the lifecycle or replace the accepted M7.8B boundary.

The public lifecycle remains **pre-production — ACTIVE DEVELOPMENT**.

<!-- case-study:decisions -->
## Architecture and key decisions

### Framework-independent geometry authority

The domain model, calculations and semantic history live below React, Konva and Three.js. Topology and dimensions can therefore be verified without a browser, and a renderer can change without migrating persistent geometry.

### Semantic commands instead of UI snapshots

Undo and Redo store the meaning of an operation: add a wall, change thickness, apply a verified candidate batch or update an opening. One Apply can be undone in one step even when it created several entities.

### Furniture fit uses the shared geometry model

Fit combines containment, collision, door zones and real distances between rotated outlines. The UI exposes a deterministic result: placement status, shortest clearance, suggested zones and the reasons for a conflict.

### Recognition Draft is a separate trust stage

Recognition follows an explicit pipeline:

1. the user uploads JPG, PNG or PDF;
2. the image is calibrated to a real dimension;
3. local computer vision creates bounded candidates;
4. optional AI returns verification or separate proposals within the permitted Draft contract;
5. every proposal is checked again by deterministic domain rules;
6. the user compares the Draft with the source;
7. only Apply converts selected candidates into ordinary document entities.

### Benchmark before tuning

M7.8A introduced a versioned public-safe corpus, Core and Source execution, TP/FP/FN overlays, and metrics for wall geometry, topology, openings, rooms, areas, confidence and reconciliation.

PR #44 extends this model with repository-owned analogues of real plans, but it does not lower a threshold to obtain green CI. Wall and opening F1 below `0.85` remain explicit blockers. Incorrect-high-confidence, unknown-host and stale-decision counters must remain zero.

### Region-first extraction instead of line-first noise

M7.8B moved local recognition toward region-first processing of thick architectural areas. Canny and Hough remain bounded fallback evidence rather than the primary owner of geometry.

Candidate overload fails closed: an overloaded Draft is not persisted, not sent to AI and not eligible for Apply.

### Hybrid AI can recover only bounded proposals

PR #45 separates local geometry from AI recovery. Missing doors or windows may appear only as proposal records with host evidence. Local walls remain immutable; AI cannot move or delete them. Thin-wall recovery is a separate future stage.

## Failures that changed the architecture

### Magnifier and calibration used the wrong coordinate space

A wide image produced letterbox margins inside the Canvas. The pointer, magnifier, markers and calibration line were calculated against the whole stage instead of the rendered image rectangle. The correction introduced one transform based on image bounds and rejected input inside the margins.

### Reversing A to B must not rotate the plan

For a horizontal or vertical calibration line, its axis matters, not endpoint order. Calibration became an undirected axis, so reversing the selected points no longer rotates the saved plan by roughly 180 degrees.

### OpenCV returned more line data than the program consumed

`HoughLinesP` in OpenCV.js exposes coordinates as flat groups of `x1, y1, x2, y2` in `data32S`. Iterating only through `lines.rows` consumed a fraction of the output. Reading the complete raster then revealed that many lines belonged to symbols rather than walls.

### The first real-plan review produced a symbol network instead of a shell

An early M7.8B iteration created 417 local wall candidates, zero openings and a connected network of labels, furniture and plumbing. The corrective design added a region-first structural mask, bounded fallback, candidate budgets, Draft sanitisation and a ban on cloud-only geometry.

### Valid AI output can still be spatially wrong

Response healing and JSON Schema repair protocol defects. They do not prove that a wall occupies the same location as the source image. Unknown IDs, moved coordinates, cloud-only walls, unbounded lines and overloaded responses are rejected before product state.

### An opening cannot be accepted without a host wall

A gap in a line can be a door, window, label or edge-detection artefact. M7.8B deliberately produced zero openings rather than claiming a confident opening without a verified host wall. M7.8C and hybrid proposals are organised around mandatory host-wall validation.

<!-- case-study:alternatives -->
## Alternatives considered and rejected

### Canvas pixels as persistent coordinates

Rejected. Pixels change with zoom, viewport and device. Millimetres remain the only canonical geometry.

### Direct overwrite from recognition output

Rejected. A Recognition Draft cannot clear or replace the existing `VlezetDocument`; only explicit Apply creates a semantic command.

### A cloud model as a second geometry owner

Rejected. Even when AI may propose a missing opening, the proposal remains a separate evidence object and passes the same deterministic validation. The model cannot silently move walls, change thickness, re-host openings or apply a result.

### Line-first Hough as the primary owner

Rejected. It mixes walls with furniture, plumbing, labels and dimension lines. Region-first structural extraction better matches architectural geometry, while Hough remains supplemental evidence.

### Lowering the benchmark threshold for merge

Rejected. PR #44 preserves immutable `0.85` real wall and opening gates plus zero-valued safety counters. A red measured result is more useful than a green pipeline that stopped protecting the product.

### A separate authoritative 3D model

Rejected. A second geometry store would drift. The 3D view remains a read-only projection of the shared document.

<!-- case-study:evidence -->
## Evidence boundary

<div data-tr-project-evidence="vlezet"></div>

The evidence model separates:

- accepted product workflow and deterministic geometry contracts;
- M7.8A reproducible benchmark authority;
- M7.8B product-owner acceptance with exact metrics and limitations;
- PR #42 as a pending Draft with green automated gates and a mandatory owner retest;
- PR #44 as a stacked Draft with measurable real-fixture blockers;
- PR #45 as stacked Draft proposal architecture without AI geometry authority.

A `verified` state applies only to the stated scopes. It does not mean that Vlezet can reconstruct an arbitrary architectural plan without manual review, and it does not promote any Draft slice.

<!-- case-study:limitations -->
## Known limitations

- some exterior or primary walls may still be missed or fragmented;
- in the current real-plan retest one thick load-bearing wall appeared as two parallel axes;
- visible windows may be absent from a Draft;
- short plumbing or service-block lines may enter structural candidates;
- accepted M7.8B Source topology F1 `0.837989` remains below the final M7.8 target of `0.90`;
- PR #42 automated metrics do not replace owner acceptance on the same real plan;
- PR #44 real wall and opening F1 remain below the immutable `0.85` threshold;
- PR #45 Stage 1 proposal recovery has no independent product acceptance;
- perspective-photo recognition is unresolved;
- room-face derivation, OCR labels, area constraints and confidence calibration remain later slices.

<!-- case-study:next -->
## Next accepted step

The next gate is a product-owner retest of the exact PR #42 head against the same representative real plan.

The retest must confirm:

1. one centre axis instead of duplicated thick-wall geometry;
2. windows located in valid exterior-wall gaps with a known host wall;
3. no plumbing-symbol contours among active walls;
4. unchanged geometry counts and coordinates after AI verification;
5. incremental Apply without duplicates;
6. independent Undo and Redo for multiple Apply batches.

Only an explicit acceptance result or a concrete defect report can justify the next bounded correction, exact-head automation rerun and possible squash merge of M7.8C. Stacked PR #44 and PR #45 must then satisfy their own immutable metrics, safety counters and product-owner gates; their existence cannot bypass PR #42 acceptance.

<!-- case-study:related -->
## Related material

- [Probabilistic proposals versus deterministic authority — Russian (RU) →](../../landing/notes/probabilistic-proposals-deterministic-authority.md)
- [Why green CI is not verified product — Russian (RU) →](../../landing/notes/green-ci-is-not-product-verification.md)
- [Engineering Projects](../projects.md)
- [Repository ↗](https://github.com/True-Ruslan/vlezet)

<!-- case-study:retrospective -->
## Retrospective

I would define `VlezetDocument` and millimetres as the formal authority contract earlier. Many later decisions then become straightforward: Canvas is a projection, rooms are derived, 3D is read-only, Preview is ephemeral and Apply is a semantic command.

The recognition benchmark should also have existed before the first quality tuning. M7.8B and the later Draft experiments added another rule: a public benchmark, a representative product-owner source and immutable safety gates must remain separate mandatory evidence.

I would also separate five checks from the beginning:

1. the provider returned a response;
2. the response passed protocol validation;
3. the proposal references permitted local evidence;
4. the candidate passed deterministic domain validation;
5. the geometry resembles the source and was accepted by a person.

Uncertainty must be designed as part of the product. Showing medium confidence, an unknown host wall and an editable Draft is more useful than a clean image that silently lies about the apartment.
