# Vlezet — precise apartment geometry without CAD

**Vlezet** is a local-first apartment planner for reconstructing a real home from walls, openings and furniture, checking dimensions and areas, viewing the result in 3D, and using plan recognition as editable assistance rather than as a source of truth.


[Open the repository on GitHub ↗](https://github.com/True-Ruslan/vlezet)

![Boundary between recognition proposals and authoritative Vlezet geometry](../../assets/diagrams/vlezet-recognition-authority.svg)

## At a glance

<dl class="tr-project-glance" data-tr-project-glance="vlezet">
<dt>My contribution</dt>
<dd>Product and domain architecture for geometry authority, editing, recognition boundaries and acceptance strategy.</dd>
<dt>Stack</dt>
<dd>TypeScript · Next.js · Geometry · Computer vision · Three.js</dd>
<dt>Challenge</dt>
<dd>Keep an apartment plan precise and editable while recognition stays assistance rather than an authority that silently rewrites geometry.</dd>
<dt>Result</dt>
<dd>M7.8B remains the accepted boundary; the automatic follow-up path failed usefulness acceptance, so Assisted Tracing is the current bounded direction.</dd>
<dt>Status</dt>
<dd><span data-tr-project-status="vlezet"></span></dd>
</dl>

<!-- case-study:problem -->
## Problem: an apartment plan must remain accurate after the first impression

A first planner prototype is comparatively easy: draw a rectangle, place a sofa and show an approximate area.

A real apartment breaks that model. A wall has a centre axis and thickness. An opening has width, a position on a specific host wall and an opening direction. A room exists because walls form a closed topology, not because the interface painted a polygon. Furniture can appear to fit while blocking a door or leaving an unusable passage.

Importing a photograph or PDF adds uncertainty: rotation, margins, perspective, labels, dimension lines, plumbing, furniture and door arcs. Even syntactically valid model output does not prove that reconstructed geometry matches the source plan.

> Recognition may propose geometry. It becomes authoritative only after review, deterministic validation and explicit Apply into the shared document.

<!-- case-study:constraints -->
## Constraints and risks

### Millimetres are the only persistent world unit

Canvas pixels change with zoom, viewport and display density. `VlezetDocument` stores millimetres. Konva, Three.js, on-screen dimensions and PNG export only project that canonical model.

### One document replaces parallel truths

`VlezetDocument` owns walls, openings, objects and versioned persistence. Rooms, areas, dimensions, 3D meshes and fit diagnostics are derived from it.

Recognition Drafts, planning Previews, UI filters, highlights and evidence remain temporary. They must not silently become a second apartment project beside the authoritative document.

### Existing geometry cannot be replaced silently

Local computer vision and any optional model-assisted step cannot clear an apartment that the user has already drawn. Candidates may be accepted, rejected or corrected, but document mutation occurs only through an explicit Apply operation.

### Recognition quality must be useful, not merely measurable

M7.8B proved that bounded local extraction, deterministic topology and verification-only AI can be measured honestly. The next automatic path attempted to classify openings and validate host walls, but the representative product-owner retest showed that green deterministic gates did not make the result useful enough for the real plan.

That failure changed the strategy. The project no longer treats increasingly complex automatic reconstruction as the default next step. The next bounded direction is **Assisted Tracing**: the user explicitly points to or draws intended geometry, while local raster analysis may refine only the current ephemeral preview when evidence is unambiguous.

### 3D remains a projection

The Three.js view is read-only. It has no independent coordinate store, furniture-fit state or opening editor. Every edit returns to the shared 2D and domain command path.

<!-- case-study:current-state -->
## Current lifecycle and acceptance boundary

Milestones **M0 through M7.8B** are accepted in the main product line.

The accepted product includes:

- walls, topology, rooms, openings, dimensions and areas in millimetres;
- furniture with exact transforms and collision, door-zone and clearance diagnostics;
- semantic Undo and Redo;
- local projects, autosave, backup, import, export and PNG output;
- reference-plan import, calibration and tracing;
- editable local candidates with explicit Apply;
- a deterministic read-only 3D projection;
- bounded planning alternatives with Preview and revalidated atomic Apply;
- a responsive editor shell, inspectors, onboarding and furniture-fit workflow;
- a versioned recognition benchmark;
- M7.8B region-first wall extraction, bounded topology and verification-only AI.

M7.8B was accepted with known limitations. On its representative source it produced 27 local wall candidates: 19 were AI-confirmed and 8 remained pending review. Accepted Source geometry F1 and Source topology F1 were both `0.837989`.

The later automatic M7.8C direction is now explicitly recorded as **product-owner usefulness FAIL / closed unmerged**. PR #42 was closed unmerged after the 2026-08-08 representative retest showed that the automatic opening / host-wall path was still not useful enough despite green deterministic gates.

PR #44 and PR #45 were also **closed unmerged** with that strategy pivot. Their benchmark and proposal-safety work remains useful R&D evidence, but neither slice was accepted into the product boundary.

The current pending design boundary is **Assisted Tracing design gate and product-owner acceptance** in Draft PR #52. PR #52 starts from fresh main and intentionally contains no accepted product implementation yet. It defines a user-directed interaction model, local-only optional raster assistance, abstention on ambiguous evidence, and no mandatory AI or network path.

PR #42, PR #44 and PR #45 therefore remain historical failed / unavailable R&D evidence; PR #52 is pending design evidence. None of them changes the accepted M7.8B boundary by repository activity alone.

The public lifecycle remains **pre-production — ACTIVE DEVELOPMENT**.

<!-- case-study:decisions -->
## Architecture and key decisions

### Framework-independent geometry authority

The domain model, calculations and semantic history live below React, Konva and Three.js. Topology and dimensions can therefore be verified without a browser, and a renderer can change without migrating persistent geometry.

### Semantic commands instead of UI snapshots

Undo and Redo store the meaning of an operation: add a wall, change thickness, apply a verified candidate batch or update an opening. One Apply can be undone in one step even when it created several entities.

### Furniture fit uses shared geometry

Fit combines containment, collision, door zones and real distances between rotated outlines. The UI exposes a deterministic result: placement status, shortest clearance, suggested zones and the reasons for a conflict.

### Recognition Draft is a separate trust stage

Recognition follows an explicit pipeline:

1. the user uploads JPG, PNG or PDF;
2. the image is calibrated to a real dimension;
3. local analysis creates bounded candidates or reference evidence;
4. any optional assistance remains a proposal, never an authority;
5. deterministic domain rules validate the proposal again;
6. the user compares the Draft with the source;
7. only Apply converts selected geometry into ordinary document entities.

### Benchmark before tuning

M7.8A introduced a versioned public-safe corpus, Core and Source execution, TP/FP/FN overlays, and metrics for wall geometry, topology, openings, rooms, areas, confidence and reconciliation.

The automatic-recognition experiments confirmed another rule: a threshold is not lowered to obtain green CI, but a green benchmark is also not sufficient if the product-owner usefulness acceptance fails on the representative plan.

### Region-first extraction instead of line-first noise

M7.8B moved local recognition toward region-first processing of thick architectural areas. Canny and Hough remain bounded fallback evidence rather than the primary owner of geometry.

Candidate overload fails closed: an overloaded Draft is not persisted, not sent to AI and not eligible for Apply.

### Assisted Tracing replaces automatic completion as the next default direction

The new direction moves the uncertainty boundary closer to the user action. Instead of asking an automatic pipeline to infer the entire plan, the user identifies the intended wall or opening and local analysis may refine only the current preview.

The planned authority rules are deliberately narrow:

- the user owns the semantic intent;
- local analysis may suggest a bounded snap or refinement;
- ambiguous evidence abstains rather than guessing;
- the preview is ephemeral until explicit Apply;
- no AI/network dependency is required for the core flow;
- normal domain validation, Undo and Redo remain authoritative after Apply.

### Failures that changed the architecture

The magnifier and calibration initially used the whole Canvas instead of the rendered image rectangle. Reversing calibration endpoints could rotate a plan. An early real-plan pass produced hundreds of symbol and furniture lines instead of an architectural shell. Valid provider JSON also proved capable of describing spatially wrong geometry.

The later M7.8C retest added a product-level lesson: deterministic gates can protect invariants without proving that an automatic reconstruction is useful enough. That is why the failed automatic path was closed instead of being promoted or endlessly tuned on top of main.

<!-- case-study:alternatives -->
## Alternatives considered and rejected

### Canvas pixels as persistent coordinates

Rejected. Pixels change with zoom, viewport and device. Millimetres remain the only canonical geometry.

### Direct overwrite from recognition output

Rejected. A Recognition Draft cannot clear or replace the existing `VlezetDocument`; only explicit Apply creates a semantic command.

### A cloud model as a second geometry owner

Rejected. AI may not silently move walls, change thickness, re-host openings or apply a result. The accepted M7.8B verification-only model preserved local identity, and the Assisted Tracing direction removes any mandatory AI/network path from the next product slice.

### Continuing automatic reconstruction until every visible opening is inferred

Rejected as the immediate product direction after the representative usefulness acceptance failed. The project keeps the benchmark and safety work as R&D evidence, but does not treat more automation as progress by itself.

### Lowering benchmark thresholds for merge

Rejected. A red measured result is more useful than a green pipeline that stopped protecting the product.

### A separate authoritative 3D model

Rejected. A second geometry store would drift. The 3D view remains a read-only projection of the shared document.

<!-- case-study:evidence -->
## Evidence boundary

<div data-tr-project-evidence="vlezet"></div>

The registry-backed evidence now separates:

- accepted product workflow and deterministic geometry contracts;
- M7.8A reproducible benchmark authority;
- M7.8B product-owner acceptance with exact metrics and limitations;
- PR #42 as **failed** automatic M7.8C evidence after the product-owner usefulness acceptance failed and the PR was closed unmerged;
- PR #44 and PR #45 as **closed unmerged** R&D evidence, not accepted product state;
- PR #52 as the pending Draft **Assisted Tracing** design gate with no accepted product code yet.

A `verified` state applies only to the stated scopes and observation date. It does not mean that Vlezet can reconstruct an arbitrary architectural plan without manual review, and it does not promote failed, unavailable or pending slices.

<!-- case-study:limitations -->
## Known limitations

- some exterior or primary walls may still be missed or fragmented by automatic recognition;
- a thick load-bearing wall may still appear as parallel axes on an unseen plan;
- visible windows may be absent from an automatic Draft;
- short plumbing or service-block lines may enter structural candidates;
- accepted M7.8B Source topology F1 `0.837989` remains below the final M7.8 target of `0.90`;
- automated metrics do not replace owner acceptance on the same real plan;
- the automatic M7.8C path failed representative usefulness acceptance and is not on main;
- Assisted Tracing is still a Draft design boundary, not an accepted capability;
- perspective-photo recognition is unresolved;
- room-face derivation, OCR labels, area constraints and confidence calibration remain later slices.

<!-- case-study:next -->
## Next accepted step

The next bounded step is **Assisted Tracing** implementation only after PR #52's design gate is accepted.

The first implementation should remain deliberately narrow:

1. the user selects or draws the intended geometry explicitly;
2. local reference-image analysis may refine only the current preview when evidence is unambiguous;
3. ambiguous evidence returns no refinement;
4. preview state never mutates `VlezetDocument` implicitly;
5. explicit Apply creates the normal semantic command;
6. Undo and Redo remain independent and deterministic;
7. browser and product-owner acceptance must prove that the workflow is faster and clearer than manual tracing without reintroducing automatic geometry authority.

PR #52 is therefore a design gate, not a merge claim. The accepted recognition slice remains M7.8B until a later implementation has its own RED→GREEN evidence, browser verification and product-owner acceptance.

<!-- case-study:related -->
## Related material

- [Probabilistic proposals versus deterministic authority — Russian (RU) →](../../landing/notes/probabilistic-proposals-deterministic-authority.md)
- [Why green CI is not verified product — Russian (RU) →](../../landing/notes/green-ci-is-not-product-verification.md)
- [Engineering Projects](../projects.md)
- [Repository ↗](https://github.com/True-Ruslan/vlezet)

<!-- case-study:retrospective -->
## Retrospective

I would define `VlezetDocument` and millimetres as the formal authority contract earlier. Many later decisions then become straightforward: Canvas is a projection, rooms are derived, 3D is read-only, Preview is ephemeral and Apply is a semantic command.

The recognition benchmark should also have existed before the first quality tuning. M7.8B and the later automatic experiments added a stronger rule: benchmark quality, deterministic safety and representative product-owner usefulness are separate mandatory evidence layers.

The 2026-08-08 strategy pivot is useful precisely because a failed acceptance was preserved instead of being hidden. PR #42, PR #44 and PR #45 are not wasted work: they record what the automatic approach could and could not prove. Closing them unmerged prevents that evidence from silently becoming product truth.

I would also separate five checks from the beginning:

1. the algorithm or provider returned a response;
2. the response passed protocol and structural validation;
3. the proposal references permitted local evidence;
4. the candidate passed deterministic domain validation;
5. the workflow is useful on the representative real plan and was accepted by a person.

Uncertainty must be designed as part of the product. A bounded Assisted Tracing preview that can abstain is more valuable than an automatic reconstruction that looks clean while silently lying about the apartment.
