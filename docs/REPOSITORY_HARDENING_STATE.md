# Repository Hardening State

> Durable snapshot: **2026-08-03**
>
> This document records the GitHub governance, supply-chain security and repository-hygiene milestone independently from product feature state.

## 1. Completed and merged

### PR #67 — Repository governance hardening

Merged to `master` as:

```text
e021a344850204f2e927bad089b99b8a96ce195d
```

The pull request introduced:

- `SECURITY.md` with reporting, scope, threat boundaries and security invariants;
- `.github/CODEOWNERS`;
- `.github/pull_request_template.md`;
- bounded weekly Dependabot updates for npm and GitHub Actions;
- CodeQL analysis for JavaScript/TypeScript with extended security queries;
- Dependency Review for pull requests, blocking moderate-or-higher vulnerable dependency changes;
- immutable full-SHA pinning for every external GitHub Action;
- explicit least-privilege workflow permissions;
- fixed `ubuntu-24.04` runners;
- cancellation of superseded pull-request Build runs;
- removal of the redundant legacy Docker deployment workflow;
- executable repository-policy tests that reject floating Action tags and missing permissions.

Exact-head acceptance:

```text
head:               8ed615c753fdedd809593f35877a0c684e642f10
Build run:          30767765533 — SUCCESS
CodeQL run:         30767765540 — SUCCESS
Dependency Review:  30767765534 — SUCCESS
unit tests:         311 PASS / 0 FAIL
```

The complete existing quality matrix passed, including build, generated-site integrity, Chromium/Axe/Lighthouse, Firefox/WebKit, search, RU/EN, publications, sources, project evidence, diagrams, Photo Stories, privacy analytics, metadata/OpenGraph, visual regression and custom-domain artifact verification.

### PR #69 — `parse5` major update

Dependabot proposed `parse5` `7.3.0 → 8.0.1` as an isolated major update.

It was merged only after all acceptance gates passed:

```text
head:               ee845cad46f2d54b7401bc44d122a1060c750dde
Build run:          30768006162 — SUCCESS
CodeQL run:         30768006158 — SUCCESS
Dependency Review:  30768006164 — SUCCESS
squash on master:   8ae9b6cfa1b914eee31243b43d7d9551e202b998
```

## 2. Rejected dependency update

### PR #68 — production minor/patch group — CLOSED, NOT MERGED

The grouped update included Diplodoc and Gravity UI packages. It was rejected by Dependency Review because its resolved graph contained vulnerable `fast-xml-parser@4.5.7`.

The gate was not bypassed and its severity threshold was not weakened.

Tracked remediation:

- issue #72 — remove vulnerable transitive `fast-xml-parser` 4.x;
- issue #73 — classify and remediate the complete remaining npm audit inventory.

The historical audit output before this milestone reported 18 findings: 9 moderate and 9 high. This is a baseline only; a fresh JSON audit against current `master` is required before claiming the current count.

## 3. Administrative hardening still pending

The connected GitHub integration can change repository files, pull requests and issues, but does not expose write operations for repository rulesets, merge settings, secret-scanning settings, tags or branch-ref deletion.

Issue #70 is the authoritative owner checklist for these operations:

- protect `master` through a branch ruleset;
- require Build, CodeQL and Dependency Review where applicable;
- require conversation resolution and linear history;
- block force pushes and deletion of `master`;
- use squash-only merge policy;
- enable automatic deletion of merged branches;
- enable dependency graph, Dependabot alerts/security updates, secret scanning, push protection and private vulnerability reporting;
- preserve `agent/portfolio-signature` as tag `archive/portfolio-signature-2026-07-20`;
- remove all obsolete branches after the archive tag is confirmed.

These settings must not be treated as enabled until their checkboxes are completed in issue #70 and verified in the GitHub UI.

## 4. Branch hygiene snapshot

Before administrative cleanup, the repository still contained approximately 75 branches:

- `master`;
- active Dependabot branches;
- the merged hardening branch;
- numerous merged `agent/*`, `docs/*`, `feat/*`, `fix/*`, `chore/*` and temporary branches.

The exact deletion allow-list and acceptance checks are recorded in issue #70.

The only divergent historical prototype requiring preservation before deletion is `agent/portfolio-signature`, which contains 24 old unique commits but has been functionally superseded by the current portfolio, metadata and Engineering Notes architecture.

## 5. Security invariants now enforced in source control

- Third-party Actions must use immutable 40-character commit SHAs.
- Every workflow must declare an explicit permissions boundary.
- Pull-request Build runs use a fixed runner and cancel superseded executions.
- Dependency changes introducing moderate-or-higher known vulnerabilities fail Dependency Review.
- CodeQL analyzes JavaScript/TypeScript changes on pushes, pull requests and a weekly schedule.
- Security reports have a private reporting path and must not expose secrets in public issues.
- Dependency remediation must preserve `npm ci` reproducibility and the full product-quality matrix.

## 6. Remaining risks and next actions

1. Complete issue #70 in the GitHub UI and verify ruleset behavior with a test pull request.
2. Resolve issue #72 without suppressing the advisory or weakening Dependency Review.
3. Produce a fresh `npm audit --json` inventory and work issue #73 by reachability and dependency path.
4. Delete obsolete branches after the archive tag exists and automatic branch deletion is enabled.
5. Keep major dependency upgrades isolated; do not auto-merge them solely because Dependabot created the pull request.
6. Continue product/content development only after repository administrative controls and dependency risk are explicitly understood.

## 7. Source-of-truth references

- PR #67 — merged repository hardening implementation.
- PR #68 — rejected vulnerable grouped dependency update.
- PR #69 — accepted isolated `parse5` major update.
- issue #70 — administrative ruleset, security-settings and branch-cleanup checklist.
- issue #72 — confirmed `fast-xml-parser` remediation.
- issue #73 — complete npm audit classification and remediation.

When opening a new project chat, read this file after `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md`, then inspect actual open PRs, issues, branches, security alerts and latest CI. Repository source policy and GitHub administrative state are separate facts.
