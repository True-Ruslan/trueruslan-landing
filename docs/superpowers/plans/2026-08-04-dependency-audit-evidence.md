# Dependency Audit Evidence Implementation Plan

**Goal:** Capture exact `npm audit --json` advisories and dependency chains for issue #82 through a reusable read-only workflow.

**Architecture:** A Node CLI owns audit collection and normalization; a path-scoped GitHub Actions workflow owns execution and artifact retention. The public site and dependency graph remain unchanged.

## Task 1 — RED contracts

- Create `scripts/dependency-audit-report.test.js`.
- Require a generator module exporting `normalizeAudit` and `renderMarkdown`.
- Verify summary preservation, advisory deduplication, package records, fix evidence and explain chains from deterministic fixtures.
- Require `.github/workflows/dependency-audit.yml` with weekly/manual/path-scoped PR triggers, `contents: read`, pinned upload action and no issue/git/fix mutation.
- Open Draft PR and record expected RED while all pre-existing tests pass.

## Task 2 — Report generator

- Create `scripts/dependency-audit-report.js`.
- Use `spawnSync` for `npm audit --json` and `npm explain <package> --json`.
- Accept audit exit `0` or `1` only when stdout parses as JSON.
- Write:
  - `npm-audit-raw.json`;
  - `dependency-audit-report.json`;
  - `dependency-audit-report.md`.
- Export pure normalization/rendering functions for tests.
- Never run fix commands or mutate package files.

## Task 3 — Workflow

- Create `.github/workflows/dependency-audit.yml`.
- Triggers: weekly schedule, manual dispatch, path-scoped PR.
- Permissions: `contents: read` only.
- Run `npm ci`, then the generator.
- Upload all three files as `dependency-audit-report` for 30 days.

## Task 4 — Exact evidence

- Run the real workflow on the PR.
- Inspect the downloaded artifact directly.
- Update issue #82 with exact summary, advisory IDs, vulnerable packages and dependency chains.
- Do not close #82 unless compatible remediation is implemented and the full matrix proves zero findings.

## Task 5 — Verification and merge

- Require full Build, CodeQL and Dependency Review on exact head.
- Review changed scope and merge with expected-head protection.
- Synchronize durable docs after O1/O2 operational evidence is final.
