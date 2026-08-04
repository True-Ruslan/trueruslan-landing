# P2.5a Distribution Readiness — Implementation Plan

## Goal

Build a deterministic distribution kit from existing canonical page metadata and external-link records.

## 1. RED contracts

Add `scripts/distribution-readiness.test.js` that requires:

- `data/distribution-targets.json`;
- profile audit fields in `data/external-links.json`;
- `scripts/distribution-readiness.js`;
- `.github/workflows/distribution-readiness.yml`;
- `docs/DISTRIBUTION.md`.

The tests must require unique target IDs and page paths, controlled channels and audiences, canonical URLs without tracking parameters, bounded profile states and dates, exact runbook rendering and a read-only artifact workflow.

Open a Draft PR and confirm only the new contracts fail.

## 2. Registries and validation

- Add eight controlled page targets.
- Extend existing profile entries rather than creating another profile manifest.
- Resolve title, description and URL from `data/page-meta.json`.
- Preserve compatibility with External Health.

## 3. Generator

Implement load, validate, resolve and deterministic rendering helpers.

Write:

- `distribution-artifacts/distribution-readiness.json`;
- `distribution-artifacts/distribution-checklist.md`.

Add a check mode that compares the tracked runbook with renderer output.

## 4. Workflow

Add weekly, manual and path-scoped pull-request triggers. Use read-only repository access, pinned actions and a 30-day artifact. The workflow must not change repository or external profile state.

## 5. Verification

Require exact-head unit tests, the Distribution Readiness artifact, Build, CodeQL, Dependency Review and the complete browser, accessibility, search, metadata, visual and custom-domain matrix.

After review, squash merge and require Production Live Smoke for the exact merge SHA.

## 6. Continuity

Record feature evidence, profile-state counts and remaining manual profile updates in a docs-only follow-up PR. Defer any public share UI to a separately justified P2.5b slice.
