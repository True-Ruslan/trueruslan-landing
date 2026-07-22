# P1.2 Project Metadata Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align package/repository metadata with the current engineering portfolio / knowledge platform identity and protect that identity with an automated contract test.

**Architecture:** Keep metadata as static package manifests. Add one focused Node `node:test` contract that reads `package.json` and `package-lock.json` and asserts semantic identity invariants. Do not introduce runtime code or new dependencies.

**Tech Stack:** Node.js 24+, npm 11.5.1+, native `node:test`, JSON manifests, existing GitHub Actions quality matrix.

## Global Constraints

- Keep package name exactly `@true-ruslan/trueruslan-landing`.
- Keep GitHub Pages homepage exactly `https://true-ruslan.github.io/trueruslan-landing/`.
- Keep `version` exactly `0.2.0` in this milestone.
- Add `"private": true`.
- Repository/bugs URLs must use canonical owner spelling `True-Ruslan`.
- Remove landing-only package identity.
- No runtime/build/public-content/UI/route/visual-baseline/quality-threshold/workflow behavior changes.
- `package.json` and root `package-lock.json` name/version must remain consistent.

---

### Task 1: Add failing metadata identity contract

**Files:**
- Create: `scripts/package-metadata.test.js`
- Read: `package.json`
- Read: `package-lock.json`

**Interfaces:**
- Consumes: JSON manifests from repository root.
- Produces: metadata invariants executed automatically by existing `npm test` (`node --test scripts/*.test.js`).

- [ ] **Step 1: Create failing contract test**

Create `scripts/package-metadata.test.js`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

const REQUIRED_KEYWORDS = [
  'engineering-portfolio',
  'knowledge-platform',
  'backend-engineering',
  'software-architecture',
  'engineering-notes',
  'diplodoc',
  'personal-site',
];

test('package metadata reflects the engineering portfolio and knowledge platform identity', () => {
  assert.equal(pkg.name, '@true-ruslan/trueruslan-landing');
  assert.equal(pkg.private, true);
  assert.match(pkg.description, /engineering portfolio/i);
  assert.match(pkg.description, /knowledge platform/i);
  assert.doesNotMatch(pkg.description, /многостраничный лендинг/i);

  for (const keyword of REQUIRED_KEYWORDS) {
    assert.ok(pkg.keywords.includes(keyword), `missing package keyword: ${keyword}`);
  }
  assert.equal(pkg.keywords.includes('landing'), false);

  assert.equal(pkg.repository.url, 'https://github.com/True-Ruslan/trueruslan-landing.git');
  assert.equal(pkg.bugs.url, 'https://github.com/True-Ruslan/trueruslan-landing/issues');
  assert.equal(pkg.homepage, 'https://true-ruslan.github.io/trueruslan-landing/');
});

test('package version remains deliberately stable and lockfile root metadata matches', () => {
  assert.equal(pkg.version, '0.2.0');
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].name, pkg.name);
  assert.equal(lock.packages[''].version, pkg.version);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test
```

Expected: FAIL in `package-metadata.test.js` because current metadata has no `private: true`, still says `Многостраничный лендинг TrueRuslan`, contains the `landing` keyword, lacks required modern keywords, and repository/bugs URLs use old owner casing.

- [ ] **Step 3: Commit RED test**

Commit message:

```text
test: define project metadata identity contract
```

---

### Task 2: Implement minimal package metadata cleanup

**Files:**
- Modify: `package.json`
- Inspect/modify only if required: `package-lock.json`
- Test: `scripts/package-metadata.test.js`

**Interfaces:**
- Consumes: Task 1 contract.
- Produces: truthful private workspace/package metadata with unchanged package version and homepage.

- [ ] **Step 1: Update `package.json` minimally**

Set the top-level identity fields to:

```json
{
  "name": "@true-ruslan/trueruslan-landing",
  "version": "0.2.0",
  "private": true,
  "description": "TrueRuslan engineering portfolio and knowledge platform",
  "type": "module",
  "homepage": "https://true-ruslan.github.io/trueruslan-landing/",
  "repository": {
    "type": "git",
    "url": "https://github.com/True-Ruslan/trueruslan-landing.git"
  },
  "bugs": {
    "url": "https://github.com/True-Ruslan/trueruslan-landing/issues",
    "email": "ruslan.nemikin@gmail.com"
  }
}
```

Replace keywords with exactly:

```json
[
  "engineering-portfolio",
  "knowledge-platform",
  "backend-engineering",
  "software-architecture",
  "engineering-notes",
  "diplodoc",
  "personal-site"
]
```

Preserve all existing engines, scripts, dependencies, devDependencies, author and license fields unchanged.

- [ ] **Step 2: Preserve lockfile root version semantics**

Do not bump `package-lock.json` version fields. Confirm top-level/root package `name` and `version` remain:

```json
"name": "@true-ruslan/trueruslan-landing",
"version": "0.2.0"
```

No lockfile change is necessary unless npm tooling rewrites metadata for a substantive reason. Do not regenerate dependency resolutions.

- [ ] **Step 3: Run tests and verify GREEN**

Run:

```bash
npm test
```

Expected: all tests PASS, including both metadata contract tests.

- [ ] **Step 4: Commit implementation**

Commit message:

```text
chore: align project package metadata
```

---

### Task 3: Verify full product-quality matrix and preserve scope

**Files:**
- No intended source modifications.
- Review PR changed-file list/diff.

**Interfaces:**
- Consumes: implementation candidate head.
- Produces: exact-head CI evidence and scope proof.

- [ ] **Step 1: Open draft PR from `chore/p1-2-project-metadata-cleanup` to `master`**

PR title:

```text
chore: align project metadata identity
```

PR body must state:

- engineering portfolio / knowledge platform identity;
- `private: true` npm-publication boundary;
- deliberate `0.2.0` no-bump decision;
- canonical repository URLs with unchanged Pages homepage;
- metadata contract test;
- no runtime/build/product behavior intent.

- [ ] **Step 2: Verify exact-head GitHub Actions**

Required green steps:

- Test;
- Build docs;
- generated-site integrity;
- browser/Axe/Lighthouse;
- Sources;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- Firefox/WebKit;
- Search;
- Metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality evidence upload.

Any failure must be fixed without weakening an existing gate.

- [ ] **Step 3: Scope-review changed files**

Allowed implementation files before continuity sync:

```text
package.json
scripts/package-metadata.test.js
docs/superpowers/specs/2026-07-22-project-metadata-cleanup-design.md
docs/superpowers/plans/2026-07-22-project-metadata-cleanup.md
```

`package-lock.json` may change only if needed for package root metadata consistency; dependency resolution churn is not allowed.

Confirm no changes to:

- public content/CSS;
- data registries;
- routes;
- visual baselines;
- Lighthouse budgets;
- CI workflow ordering.

- [ ] **Step 4: Mark PR ready and squash-merge exact verified head**

Only merge the SHA that passed the full matrix.

---

### Task 4: Synchronize durable project continuity

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: actual P1.2 squash SHA, exact implementation head and CI run evidence.
- Produces: canonical durable state with P1.2 DONE and P1.3 NEXT.

- [ ] **Step 1: Create docs-only continuity branch from post-P1.2 `master`**

- [ ] **Step 2: Record actual milestone evidence**

Update docs with:

- P1.2 PR number/title;
- actual squash commit SHA;
- exact implementation head SHA;
- exact successful Build/run number;
- metadata identity changes;
- explicit reason `0.2.0` was retained;
- `private: true` publication boundary;
- contract-test coverage;
- confirmation that runtime/build/product behavior was not intentionally changed.

Set next technical priority to:

```text
P1.3 — Stronger flagship case-study format
```

Do not claim public deployment or maintenance-workflow operational facts without separate evidence.

- [ ] **Step 3: Open docs-only PR and run full CI**

Changed files must be exactly the three continuity docs.

- [ ] **Step 4: Squash-merge exact green docs head and re-check `master`**

Confirm:

- no open PRs;
- latest commits are P1.2 continuity sync then P1.2 implementation;
- `PROJECT_STATE.md` says P1.2 DONE and P1.3 NEXT.
