# Vlezet flagship case study — implementation plan

**Goal:** publish Vlezet as the third controlled flagship case study using existing registry, timeline, evidence, metadata and quality-gate architecture.

**Architecture:** one Markdown case study plus one static SVG authority map. Canonical project metadata remains in `data/projects.json`; timeline and verification facts remain in their existing data registries. Diplodoc owns rendering and search. No runtime data fetch is added.

---

## Task 1 — establish the RED flagship contract

**Modify:** `scripts/flagship-case-study.test.js`

1. Add `vlezet` to `FLAGSHIPS` with:
   - `docs/landing/projects/vlezet.md`;
   - timeline/evidence key `vlezet`;
   - diagram `../../assets/diagrams/vlezet-recognition-authority.svg`.
2. Change the controlled-set assertion to `livingworld`, `node-zero`, `vlezet`.
3. Commit the test-only change.
4. Confirm exact-head CI fails because the page does not yet exist.

Expected RED: `ENOENT` for `docs/landing/projects/vlezet.md` or the equivalent missing flagship artifact failure.

## Task 2 — add the canonical project surfaces

**Modify:**

- `data/projects.json`;
- `data/page-meta.json`;
- `docs/toc.yaml`;
- `docs/landing/projects.md`.

**Create:**

- `data/project-history/vlezet.json`.

Steps:

1. Add Vlezet as public, featured and active with `pre-production` status and `ACTIVE DEVELOPMENT` label.
2. Add canonical GitHub link and timeline key.
3. Add RU metadata for `landing/projects/vlezet.html`.
4. Add Vlezet to Projects navigation before LivingWorld.
5. Add a compact project-hub introduction before LivingWorld and render status via `<span data-tr-project-status="vlezet"></span>`.
6. Add past/current/next timeline entries, clearly keeping M7.8B under review.

## Task 3 — add bounded project evidence

**Modify:** `data/project-evidence.json`

1. Add a Vlezet evidence record with `lastVerified: 2026-08-02`.
2. Record stack/version labels that are explicitly present in canonical project state.
3. Add bounded signals for:
   - M7.7 accepted deterministic furniture/fit workflow;
   - M7.8A accepted benchmark foundation;
   - M7.8B pending owner acceptance with measured wall-topology improvements and known recognition gaps.
4. Avoid treating current Draft PR #41 as merged or production accepted.

## Task 4 — create the architecture authority diagram

**Create:** `docs/assets/diagrams/vlezet-recognition-authority.svg`

1. Add semantic `<title>` and `<desc>`.
2. Draw the flow from source plan to calibration, CV/cloud proposals, editable Draft, explicit Apply, `VlezetDocument`, and deterministic derived systems.
3. Show validation/review as the authority boundary.
4. Use SVG presentation attributes only; no embedded style or critical classes.
5. Use no private source-plan image.

## Task 5 — write the flagship case study

**Create:** `docs/landing/projects/vlezet.md`

1. Add introduction and GitHub link.
2. Embed the authority diagram.
3. Add the `vlezet` timeline placeholder.
4. Write the seven canonical sections in order:
   - problem;
   - constraints;
   - decisions;
   - failures;
   - current state;
   - evidence;
   - retrospective.
5. Ground the narrative in repository-backed facts:
   - millimetres and `VlezetDocument` authority;
   - derived rooms/areas/3D;
   - semantic Undo/Redo;
   - deterministic furniture/fit semantics;
   - Draft + explicit Apply recognition boundary;
   - benchmark-first M7.8A;
   - HoughLinesP `data32S` root cause and M7.8B benchmark delta;
   - opening/room/area work still unfinished;
   - real-plan owner acceptance remains separate from exact-head CI.
6. Add exactly one Evidence placeholder.

## Task 6 — verify GREEN locally through repository CI

1. Run/trigger the full standard PR workflow on the exact feature head.
2. Verify unit tests and the flagship contract pass.
3. Verify production build and generated-site integrity.
4. Verify browser, accessibility, Lighthouse, cross-browser, search, metadata, visual regression and custom-domain artifact gates.
5. Inspect generated project hub and Vlezet page artifacts/screenshots.
6. Correct only evidence-backed defects; do not weaken tests.

## Task 7 — publish and integrate

1. Open a Draft PR with design, scope, evidence boundaries and RED/GREEN record.
2. Ensure no unresolved review threads.
3. When exact-head CI and manual artifact review pass, mark Ready.
4. Squash-merge with expected-head protection.
5. Run a follow-up durable state sync recording the new milestone and latest evidence.
6. Treat Pages deployment and owner production acceptance as separate post-merge facts.
