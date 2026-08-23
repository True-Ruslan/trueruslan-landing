# Repository Hardening State

> Durable snapshot: **2026-08-22** (reconciled against live GitHub state via `gh api`/`gh issue view`; original snapshot was 2026-08-03 and had gone stale — issues #70/#72/#73 below were still listed as pending three weeks after they were actually closed)
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

Tracked remediation — both closed:

- issue #72 — remove vulnerable transitive `fast-xml-parser` 4.x. **CLOSED.** `package.json` now pins `"fast-xml-parser": "5.10.1"` via `overrides`; confirmed resolved in `npm ls fast-xml-parser` on 2026-08-22.
- issue #73 — classify and remediate the complete remaining npm audit inventory. **CLOSED.**

A fresh `npm audit --production` on 2026-08-22 reports **6 moderate** findings, all `markdown-it`/`markdownlint` ReDoS advisories (GHSA-38c4-r59v-3vqw, GHSA-6v5v-wf23-fmfq) pulled in transitively through `@diplodoc/cli` → `@diplodoc/transform`/`@diplodoc/translation`. No fix is available without a breaking downgrade of `@diplodoc/cli`; exploitability is low because markdown content is authored by the site owner, not public input. This is a new open item, not covered by issue #73's closure — track it separately if it needs a dedicated issue.

## 3. Administrative hardening — closed

Issue #70 (the owner checklist below) is **CLOSED**, and every setting it tracked is confirmed live via the GitHub API as of 2026-08-22:

- `master` is protected by an active ruleset (`Protect master`, ruleset id `20283974`, created 2026-08-03);
- `allow_squash_merge: true`, `allow_merge_commit: false`, `allow_rebase_merge: false` — squash-only is enforced at the repo level, not just by convention;
- `delete_branch_on_merge: true` — merged branches are deleted automatically;
- `secret_scanning: enabled`, `secret_scanning_push_protection: enabled`, `dependabot_security_updates: enabled`.

The `agent/portfolio-signature` preservation/tag step and the rest of the issue-#70 checklist are covered by the issue's own closure — see the issue thread for the final checklist state rather than re-deriving it here.

## 4. Branch hygiene snapshot

The ~75-branch figure was the pre-cleanup baseline. As of 2026-08-22 the repository has **36 branches** (`gh api repos/True-Ruslan/trueruslan-landing/branches --paginate`). Obsolete `agent/*`/`docs/*`/`feat/*`/`fix/*`/`chore/*` branches have been removed per issue #70; remaining branches are `master` plus in-flight work.

## 5. Security invariants now enforced in source control

- Third-party Actions must use immutable 40-character commit SHAs.
- Every workflow must declare an explicit permissions boundary.
- Pull-request Build runs use a fixed runner and cancel superseded executions.
- Dependency changes introducing moderate-or-higher known vulnerabilities fail Dependency Review.
- CodeQL analyzes JavaScript/TypeScript changes on pushes, pull requests and a weekly schedule.
- Security reports have a private reporting path and must not expose secrets in public issues.
- Dependency remediation must preserve `npm ci` reproducibility and the full product-quality matrix.

## 6. Remaining risks and next actions

Issues #70, #72 and #73 are closed; the checklist below is what is actually still open as of 2026-08-22.

1. Track the 6 moderate `markdown-it`/`markdownlint` ReDoS advisories (§2) against upstream `@diplodoc/cli` releases; revisit once a non-breaking fix exists.
2. Keep major dependency upgrades isolated; do not auto-merge them solely because Dependabot created the pull request.
3. This document itself went stale for ~3 weeks after issues #70/#72/#73 closed (see the reconciliation note at the top) — re-verify against `gh issue view`/`gh api` before trusting it rather than assuming it's current.

## 7. Source-of-truth references

- PR #67 — merged repository hardening implementation.
- PR #68 — rejected vulnerable grouped dependency update.
- PR #69 — accepted isolated `parse5` major update.
- issue #70 — administrative ruleset, security-settings and branch-cleanup checklist.
- issue #72 — confirmed `fast-xml-parser` remediation.
- issue #73 — complete npm audit classification and remediation.

When opening a new project chat, read this file after `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md`, then inspect actual open PRs, issues, branches, security alerts and latest CI. Repository source policy and GitHub administrative state are separate facts.
