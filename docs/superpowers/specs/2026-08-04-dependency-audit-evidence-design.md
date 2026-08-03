# Dependency Audit Evidence — Design

## Goal

Produce exact, reviewable dependency-security evidence for the repository lockfile without automatic upgrades, forced fixes or issue mutation.

## Problem

`npm ci` currently prints only the aggregate summary `6 moderate / 2 high`. Issue #82 needs exact advisory identities, vulnerable package records and transitive dependency chains before any remediation decision. GitHub Dependency Review proves this PR introduces no dependency delta, but it does not replace a current full-lockfile audit.

## Selected design

Add a read-only `Dependency Audit Evidence` workflow with:

- weekly schedule;
- manual `workflow_dispatch`;
- path-scoped `pull_request` trigger for dependency/audit files;
- `contents: read` only;
- exact `npm ci` followed by a Node report generator;
- raw `npm audit --json` preservation;
- normalized JSON and Markdown summaries;
- `npm explain --json` output for each vulnerable package;
- 30-day artifact retention;
- no issue writes, lockfile mutation, `npm audit fix`, git commit or push.

## Report model

The normalized report contains:

- generated date;
- Node and npm versions;
- audit exit code;
- summary counts from `metadata.vulnerabilities`;
- one record per vulnerable package:
  - package name;
  - severity;
  - direct/transitive status;
  - affected range;
  - installed node paths;
  - fix availability;
  - advisory source/title/URL/range;
  - raw `npm explain` dependency chain;
- deduplicated advisory list.

## Trust boundaries

- An `npm audit` exit code of `1` with valid JSON is a successful evidence collection when vulnerabilities exist.
- Missing, malformed or empty audit JSON is a workflow failure.
- The workflow never treats a fix as safe merely because npm proposes it.
- `fixAvailable: true` is evidence only; compatibility tests and the complete project matrix remain mandatory.
- The report does not close issue #82 automatically.
- Dependency Review and full-lockfile audit answer different questions and remain separate gates.

## Trigger policy

Pull requests run the workflow only when one of these changes:

```text
.github/workflows/dependency-audit.yml
package.json
package-lock.json
scripts/dependency-audit-report.js
scripts/dependency-audit-report.test.js
```

This gives immediate evidence for the initial workflow and future dependency changes without adding a registry audit to unrelated content PRs.

## Testing

TDD RED first:

- report parser/normalizer contract exists before implementation;
- workflow contract exists before workflow implementation;
- existing tests remain green.

GREEN requires:

- deterministic fixture normalization;
- advisory deduplication;
- valid vulnerability summary;
- workflow trigger/permission/artifact contracts;
- real PR audit artifact;
- full existing Build/CodeQL/Dependency Review matrix.

## Non-goals

- no dependency upgrade in this milestone;
- no upstream fork or local shim;
- no `npm audit fix --force`;
- no automatic issue mutation;
- no public-site runtime or content change.
