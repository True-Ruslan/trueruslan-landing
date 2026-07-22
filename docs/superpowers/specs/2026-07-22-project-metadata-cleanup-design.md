# P1.2 Project Metadata Cleanup — Design

Date: 2026-07-22
Status: approved for implementation under delegated project autonomy

## Goal

Bring repository/package identity in line with the actual product: a personal engineering portfolio and knowledge platform, not a landing-page npm package.

The change must improve metadata truthfulness without changing runtime behavior, generated public content, routing, build architecture, quality thresholds, or deployment semantics.

## Current problem

`package.json` still reflects an early project phase:

- `version` is `0.2.0` without a defined package-release/semver contract;
- description is `Многостраничный лендинг TrueRuslan`;
- keywords emphasize `landing`, generic documentation and Markdown rather than the current engineering platform scope;
- repository/bugs URLs use non-canonical owner casing;
- the package is not intended to be published to npm, but this is not expressed explicitly.

`package-lock.json` mirrors the package name/version and must remain consistent.

## Decision

### Product identity

Keep the existing npm-compatible package name:

`@true-ruslan/trueruslan-landing`

The name is an internal repository/package identity and changing it would create unnecessary lockfile and tooling churn without product value.

Update the description to identify the project as an engineering portfolio and knowledge platform.

Use keywords centered on the real scope:

- engineering-portfolio
- knowledge-platform
- backend-engineering
- software-architecture
- engineering-notes
- diplodoc
- personal-site

Remove `landing` as a primary identity keyword.

### Publication semantics

Add:

`"private": true`

The repository is a deployable website/application workspace, not a package intended for npm publication. This prevents accidental publication and makes package intent explicit. It does not change site runtime or build output.

### Canonical URLs

Preserve the working GitHub Pages homepage exactly:

`https://true-ruslan.github.io/trueruslan-landing/`

Normalize repository and issue URLs to the canonical project owner spelling used by the repository:

`True-Ruslan`

Do not change deployment URL casing because GitHub Pages hostname semantics are separate from repository display casing and the current homepage is already canonical for deployment.

### Version decision

Keep `version: 0.2.0` unchanged in this milestone.

Reason:

- the repository does not currently publish npm releases;
- there is no defined mapping between product milestones (`Portfolio v0.3`, `v0.4`, P0/P1 roadmap milestones) and npm package semver;
- bumping to `0.4.0`, `1.0.0`, or another number would create a false release claim;
- `private: true` makes the non-publishable package semantics explicit.

A future version change requires a separate explicit decision establishing what the version represents and when it advances.

`package-lock.json` remains at `0.2.0` and must continue to match `package.json`.

## Contract test

Add a focused metadata contract test under `scripts/*.test.js` so it runs through the existing `npm test` command.

The test must verify:

1. package name remains `@true-ruslan/trueruslan-landing`;
2. package is `private: true`;
3. description identifies engineering portfolio/knowledge platform and does not contain landing-only identity;
4. required modern keywords are present and deprecated `landing` keyword is absent;
5. repository and bugs URLs use canonical `True-Ruslan/trueruslan-landing` identity;
6. GitHub Pages homepage remains unchanged;
7. package and lockfile root name/version remain consistent;
8. version remains deliberately `0.2.0` until a real versioning contract is introduced.

The test protects metadata truth, not formatting or keyword ordering beyond the required semantic set.

## Files in implementation scope

- `package.json`
- `package-lock.json` only if necessary to preserve root metadata consistency
- `scripts/package-metadata.test.js`
- milestone continuity docs after feature merge

No source/UI/CSS/content registry changes are in scope.

## Verification

Required before merge:

- TDD RED: metadata contract fails against the current stale metadata;
- GREEN after package metadata cleanup;
- full existing CI matrix passes on exact implementation head;
- diff review confirms no generated public content, visual baseline, quality threshold, route, or workflow changes.

## Rejected alternatives

### Bump to `0.4.0`

Rejected because Portfolio v0.4 is a product architecture milestone, not an established npm package release contract.

### Bump directly to `1.0.0`

Rejected because it would imply a release/semver maturity contract that the repository has never defined.

### Rename the npm package

Rejected as unnecessary churn. The existing scoped package name is technically valid and sufficiently tied to repository identity.

## Definition of Done

- package identity reflects engineering portfolio / knowledge platform reality;
- accidental npm publication is prevented;
- canonical repository URLs are normalized without changing the live homepage URL;
- version decision is explicit and non-decorative;
- metadata truth is protected by an automated contract test;
- package-lock root metadata stays consistent;
- complete exact-head CI matrix is green;
- durable state/roadmap/changelog are synchronized after merge.