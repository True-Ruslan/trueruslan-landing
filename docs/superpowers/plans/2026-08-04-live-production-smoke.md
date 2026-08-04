# Live Production Smoke Implementation Plan

**Goal:** Maintain a permanent read-only Playwright gate for the deployed custom-domain site and exact `github-pages` deployment identity.

## Task 1 — Initial RED contracts

- Create `scripts/production-live-workflow.test.js`.
- Require `.github/workflows/production-live.yml` and `scripts/production-live-smoke.cjs`.
- Assert read-only permissions, pinned actions/tools, deployment resolution, artifact upload and no mutation commands.
- Assert the smoke source includes apex/www, Note, feed, interactive search, canonical/OpenGraph, Cloudflare and legacy-origin boundaries.
- Confirm all pre-existing tests pass while the new existence contracts fail.

## Task 2 — Playwright smoke

- Create `scripts/production-live-smoke.cjs` using the existing pinned quality-tool loader.
- Test the homepage, www→apex behavior, persistence Note metadata, feed content and real search interaction.
- Capture first-party diagnostics, screenshots and JSON summary under `production-artifacts/`.

## Task 3 — Deployment identity

- Resolve deployment metadata with pinned `actions/github-script` and the GitHub Deployments API.
- Use environment `github-pages` and the latest deployment status.
- Require a successful deployment for the exact expected SHA on exact-deployment events.
- On PR/schedule/manual, record the latest successful deployment without claiming caller deployment.

The Pages builds endpoint was evaluated first and rejected after returning `404` for the repository's current Pages source configuration. The Deployments API is the stable identity source.

## Task 4 — Initial verification

- Require the live workflow, full Build, CodeQL and Dependency Review on exact PR head.
- Inspect production evidence directly.
- Squash merge and verify the resulting master SHA.

## Task 5 — Trigger reliability repair

Observed regression after P2.5a:

- `production-live.yml` remained active;
- Pages deployment for the exact squash completed successfully;
- no direct-push Production Live Smoke run appeared within the expected trigger window.

TDD repair:

1. require a completed `workflow_run` trigger from `Deploy static content to Pages`;
2. propagate `workflow_run.head_sha` and source conclusion;
3. make `workflow_run` and `push` exact-deployment modes;
4. keep push as fallback;
5. record source workflow metadata in the artifact;
6. verify the exact P2.5a production deployment through the PR live run;
7. merge the repair;
8. verify the repair squash through direct fallback evidence;
9. validate the new `workflow_run` path on the first subsequent Pages deployment, because the listener must already exist on the default branch before its source run begins.

## Task 6 — Final continuity

After activation-order validation:

- record P2.5a feature/production evidence;
- record repair RED/GREEN evidence;
- record exact `workflow_run` event, source Pages run and artifact;
- synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG` in a docs-only PR;
- keep external-profile cleanup as a deliberate operator action rather than automatic mutation.
