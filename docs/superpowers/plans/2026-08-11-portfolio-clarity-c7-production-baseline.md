# Portfolio Clarity C7 Production Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one tracked C7 presentation-baseline descriptor as contextual provenance for the existing P3.6 measurement checkpoint without changing the private observation schema, resetting the clean-URL measurement boundary, or claiming product impact.

**Architecture:** Keep `data/presentation-baseline.json` separate from operator-observed measurement input. The existing measurement report CLI receives the tracked baseline through an explicit `--presentation-baseline` path, validates it, attaches only bounded provenance to derived report output, and leaves `scripts/measurement-checkpoint.js` ownership of `cleanUrlMigrationAt` and readiness unchanged. GitHub Actions passes the tracked file directly and introduces no new secret.

**Tech Stack:** Node.js 24, node:test, GitHub Actions YAML, tracked JSON/Markdown repository state.

## Global Constraints

- C7 status remains `pending-production-acceptance` until exact production proof exists.
- `cleanUrlMigrationAt` remains `2026-08-05T00:00:00Z` and is not reset by C7.
- P3.6 remains NEXT / WAITING for real equal-duration `operator-observed` aggregates, explicit traffic sufficiency, and human review.
- The private `P3_6_MEASUREMENT_OBSERVATIONS_JSON` schema remains unchanged.
- No new analytics secret, registry, causal conclusion, engagement claim, conversion claim, or SEO-impact claim is introduced.
- Final C7 acceptance requires exact Pages deployment, deployment-triggered Production Live, then a durable acceptance update.

---

### Task 1: Canonical tracked presentation baseline

**Files:**
- Create: `data/presentation-baseline.json`
- Create: `docs/keystone/specs/2026-08-11-portfolio-clarity-c7-baseline-handoff.md`
- Test: `scripts/portfolio-clarity-c7.test.js`

**Interfaces:**
- Consumes: approved C7 RED contract in `scripts/portfolio-clarity-c7.test.js`.
- Produces: tracked schema-v1 baseline with `status`, `slice`, `measurementMode`, `resetsCleanUrlMeasurement`, nullable production acceptance identity, and explicit handoff boundaries.

- [x] **Step 1: Write the failing test** — already committed as PR #198 head `a06ac57c0d34842027d867dc239128b36e1f937d`.
- [x] **Step 2: Run test to verify it fails** — Build #1792 / `31490550901`: 681 PASS / 5 expected C7 FAIL.
- [ ] **Step 3: Create minimal tracked baseline and handoff spec** with pending production identity and explicit no-reset/no-causal boundaries.
- [ ] **Step 4: Run the C7 contract and full unit suite; expect all C7 tests and all prior tests PASS.**
- [ ] **Step 5: Commit the bounded baseline/spec change on `feat/portfolio-clarity-c7-production-baseline`.**

### Task 2: Measurement report provenance input

**Files:**
- Modify: `scripts/measurement-checkpoint-report.js`
- Modify: `scripts/measurement-checkpoint-report.test.js`
- Test: `scripts/portfolio-clarity-c7.test.js`

**Interfaces:**
- Consumes: `presentationBaselinePath` pointing to tracked `data/presentation-baseline.json` plus the existing private observation `inputPath`.
- Produces: derived report object with bounded `presentationBaseline` provenance while `analyzeMeasurementCheckpoint(observations, {minimumObservationDays})` remains the sole readiness calculation.

- [ ] **Step 1: Extend report tests so `--presentation-baseline` parses, malformed/missing baseline fails closed, and stored derived JSON contains bounded context without changing observation fields.**
- [ ] **Step 2: Run focused report tests and confirm failure before implementation.**
- [ ] **Step 3: Implement strict baseline loading/validation and attach bounded provenance after measurement analysis.**
- [ ] **Step 4: Run focused report tests and the C7 contract; expect PASS.**
- [ ] **Step 5: Commit the report provenance implementation.**

### Task 3: Workflow handoff and full verification

**Files:**
- Modify: `.github/workflows/measurement-checkpoint.yml`
- Test: `scripts/portfolio-clarity-c7.test.js`

**Interfaces:**
- Consumes: tracked `data/presentation-baseline.json` directly from checkout.
- Produces: report CLI invocation with `--presentation-baseline data/presentation-baseline.json`; no `P3_6_PRESENTATION_BASELINE_JSON` secret.

- [ ] **Step 1: Add the tracked baseline to Measurement Checkpoint path filters and CLI invocation.**
- [ ] **Step 2: Run the C7 contract and full `npm test`; expect 0 FAIL.**
- [ ] **Step 3: Let PR CI run Build, CodeQL, Dependency Review, and Measurement Checkpoint on the exact head.**
- [ ] **Step 4: Review diff and review threads; do not mark C7 production accepted on PR evidence.**
- [ ] **Step 5: After green exact-head CI, merge only when shipping gates pass, then require exact Pages + deployment-triggered Production Live before durable C7 acceptance.**
