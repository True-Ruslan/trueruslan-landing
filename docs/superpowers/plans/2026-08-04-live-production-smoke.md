# Live Production Smoke Implementation Plan

**Goal:** Add a permanent read-only Playwright gate for the deployed custom-domain site and exact GitHub Pages build identity.

## Task 1 — RED contracts

- Create `scripts/production-live-workflow.test.js`.
- Require `.github/workflows/production-live.yml` and `scripts/production-live-smoke.cjs`.
- Assert push/schedule/manual/path-scoped PR triggers, read-only permissions, pinned actions/tools, Pages build resolution, artifact upload and no mutation commands.
- Assert the smoke source includes apex/www, Note, feed, interactive search, canonical/OpenGraph, Cloudflare and legacy-origin boundaries.
- Open Draft PR and confirm all pre-existing tests pass while the two new existence contracts fail.

## Task 2 — Playwright smoke

- Create `scripts/production-live-smoke.cjs` using the existing pinned quality-tool loader.
- Test the homepage, www→apex behavior, persistence Note metadata, feed content and real search interaction.
- Capture first-party diagnostics, screenshots and JSON summary under `production-artifacts/`.

## Task 3 — Workflow

- Create `.github/workflows/production-live.yml`.
- Resolve Pages build metadata with pinned `actions/github-script`.
- On push, poll until `status=built` and `commit=GITHUB_SHA`.
- On other triggers, record latest built commit without claiming caller deployment.
- Install pinned Playwright Chromium, run smoke and upload 30-day evidence.

## Task 4 — Verification and merge

- Require the live workflow, full Build, CodeQL and Dependency Review on exact PR head.
- Inspect production evidence directly.
- Review scope, remove Draft and squash merge.
- Confirm the push-triggered production run verifies the resulting master SHA.
- Synchronize the three durable docs only after the deployed master run is green.
