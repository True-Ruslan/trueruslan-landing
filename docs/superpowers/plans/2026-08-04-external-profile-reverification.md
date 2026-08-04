# External Profile Reverification Implementation Plan

**Goal:** update the controlled distribution snapshot from fresh rendered public evidence without mutating external profiles automatically.

## Task 1 — RED contract

- Update `scripts/distribution-readiness.test.js` to require:
  - GitHub, Habr and Telegram personal as `verified`;
  - Telegram Blog as `stale` with legacy-link evidence;
  - summary counts `3 verified / 1 stale / 0 unverified`.
- Open a Draft PR and confirm all pre-existing contracts pass while the new measured-state assertions fail.

## Task 2 — Canonical data and runbook

- Update only the four audited profile records in `data/external-links.json`.
- Preserve rendered public evidence wording and the Telegram Blog stale boundary.
- Regenerate `docs/DISTRIBUTION.md` byte-for-byte from the canonical registries.

## Task 3 — Exact-head verification

- Require Distribution Readiness evidence, Build, CodeQL and Dependency Review.
- Require the complete browser/accessibility/search/metadata/visual/custom-domain matrix.
- Review changed-file scope and squash merge.

## Task 4 — Production and continuity

- Require the deployment-driven Production Live Smoke for the exact squash SHA.
- Synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG` with the measured `3 verified / 1 stale` state.
- Keep Telegram Blog as the only remaining external-profile gate until its rendered public description exposes `https://trueruslan.ru/` and no legacy Pages URL.
