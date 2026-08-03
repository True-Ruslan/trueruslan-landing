# Product Evidence Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile Vlezet and VillAIgence public evidence with their latest accepted source-repository state without broadening automated proof into unsupported product claims.

**Architecture:** Keep the existing static-first registries and authored case studies. Add one repository contract test, update canonical data and narrative files, then synchronize durable project documents. No renderer, schema or runtime integration changes.

**Tech Stack:** Node.js 24 test runner, JSON registries, Markdown/Diplodoc, GitHub Actions.

## Global Constraints

- Preserve static-first, build-time intelligence and progressive enhancement.
- Preserve `data/projects.json` as project identity/lifecycle owner.
- Preserve `data/project-evidence.json` as bounded evidence owner.
- Preserve `data/project-history/*.json` as timeline owner.
- Keep VillAIgence lifecycle `release-candidate`; automated production-JAR startup/restart is not cumulative manual acceptance.
- Keep Vlezet lifecycle `pre-production`; M7.8B acceptance does not imply accurate arbitrary-plan recognition.
- Do not change schemas, renderers, CSS, routes, analytics, search ownership or visual baselines unless a failing gate proves it necessary.

---

### Task 1: Add a failing reconciliation contract

**Files:**
- Create: `scripts/product-evidence-reconciliation.test.js`

**Interfaces:**
- Consumes: JSON and Markdown files from the existing repository.
- Produces: a deterministic repository-state contract executed by `node --test scripts/*.test.js`.

- [ ] **Step 1: Write the failing test**

Create an ESM Node test that reads `data/projects.json`, `data/project-evidence.json`, both project-history files, both case studies, `data/now.json` and the three durable docs. Assert:

```js
assert.equal(vlezetSignal.state, 'merged');
assert.match(vlezetHistoryCurrent.title, /Opening Classification|M7\.8C/);
assert.ok(livingworldSignals.some((signal) => signal.label.includes('PR #103')));
assert.ok(livingworldSignals.some((signal) => signal.label.includes('PR #104')));
assert.equal(livingworldProject.status, 'release-candidate');
assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
assert.match(vlezetPage, /M0–M7\.8B/);
assert.doesNotMatch(vlezetPage, /PR remains Draft|остаётся Draft PR/);
assert.match(livingworldPage, /production-JAR startup.*restart/is);
assert.match(now.updated, /^2026-08-03$/);
assert.match(projectState, /M7\.8B.*accepted|M7\.8B.*принят/is);
assert.match(roadmap, /M7\.8C/);
assert.match(changelog, /PR #104/);
```

- [ ] **Step 2: Verify RED**

Open a draft PR from the branch and wait for the Build workflow associated with the RED head. Expected result: unit test failure caused by the stale Vlezet/VillAIgence snapshot, while unrelated workflow structure remains intact.

- [ ] **Step 3: Commit**

Commit message:

```text
test: require current product evidence reconciliation
```

---

### Task 2: Reconcile canonical project data

**Files:**
- Modify: `data/projects.json`
- Modify: `data/project-evidence.json`
- Modify: `data/project-history/vlezet.json`
- Modify: `data/project-history/livingworld.json`
- Modify: `data/now.json`

**Interfaces:**
- Consumes: Vlezet PR #41 accepted evidence and VillAIgence PRs #103/#104 exact-head evidence.
- Produces: bounded data consumed by existing project registry, timeline, evidence and `/now` renderers.

- [ ] **Step 1: Update Vlezet evidence**

Change PR #41 from failed draft to merged accepted scope. Record:

```text
M7.8B accepted and squash-merged
Source geometry F1 0.837989
Source topology F1 0.837989
27 local wall candidates, 19 AI-confirmed, 8 pending review on the representative source
openings deferred
```

Keep explicit limitations and avoid an arbitrary-plan accuracy claim.

- [ ] **Step 2: Advance Vlezet timeline**

Move M7.8B to `past`; make M7.8C opening classification and host-wall validation `current`; keep room-face/semantic expansion as `next`.

- [ ] **Step 3: Update VillAIgence evidence**

Add automated signals for:

```text
PR #103 — 28-scenario risk-based acceptance catalogue and seven real Fabric GameTests
PR #104 — exact remapped production JAR reached ready state twice, stopped cleanly and preserved six store paths and SHA-256 values across restart
```

Retain 0.1.20 partial PASS and 0.1.21 startup failure as historical manual evidence. Record release/tag `0.1.23+1.21.1` as the current published candidate only within the automated acceptance boundary.

- [ ] **Step 4: Advance VillAIgence lifecycle label and timeline**

Keep status `release-candidate`; set status label to `ACCEPTANCE IN PROGRESS`. Make automated risk-based installed acceptance current and cumulative provider/gameplay/operator acceptance next.

- [ ] **Step 5: Refresh `/now`**

Set `updated` to `2026-08-03` and rewrite focus/learning/writing so it distinguishes accepted precision-limited Vlezet work from automated-but-not-cumulative VillAIgence acceptance.

- [ ] **Step 6: Run GREEN contract through CI**

Expected: the new repository contract passes after all data updates.

---

### Task 3: Reconcile authored case studies

**Files:**
- Modify: `docs/landing/projects/vlezet.md`
- Modify: `docs/landing/projects/livingworld.md`

**Interfaces:**
- Consumes: canonical data from Task 2 and source-repository acceptance evidence.
- Produces: truthful public narrative aligned with generated timeline/evidence blocks.

- [ ] **Step 1: Update Vlezet narrative**

Replace the failed-draft narrative with:

- accepted M7.8B region-first normalisation and wall topology;
- the representative accepted result and benchmark scores;
- known precision limitations;
- openings deferred to M7.8C;
- no claim of general accurate recognition.

- [ ] **Step 2: Update VillAIgence narrative**

Move current source head to `61b66e38e99c1dc9bdc26089bfb345a250a881e2`. Explain Phase A GameTests and Phase B production-JAR startup/restart proof. Keep manual cumulative acceptance, real provider integration, two-client behavior and focused live canaries pending.

- [ ] **Step 3: Verify generated contracts**

Expected Build checks:

```text
unit tests pass
generated Project Evidence contains bounded automated/manual signals
Vlezet and VillAIgence browser smoke pass
search includes updated terms
mobile overflow remains zero
Axe serious/critical remains zero
visual regression remains within thresholds
custom-domain artifact remains valid
```

---

### Task 4: Synchronize durable documentation

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: completed reconciliation implementation and exact CI evidence.
- Produces: a new-session handoff that matches repository truth.

- [ ] **Step 1: Update PROJECT_STATE**

Record the reconciliation milestone, current branch/PR evidence, Vlezet M7.8B accepted boundary, VillAIgence M11 Phase A/B automated boundary, issue #82 residual dependency risk and remaining operational/manual facts.

- [ ] **Step 2: Update ROADMAP**

Mark evidence reconciliation done. Select the narrow Engineering Note about source/package/exact artifact/installed acceptance as next. Keep Vlezet M7.8C and VillAIgence remaining acceptance as external product dependencies rather than landing implementation tasks.

- [ ] **Step 3: Update CHANGELOG**

Add a 2026-08-03 entry covering repository hardening PRs #67–#81 and the evidence reconciliation milestone. Include exact PR/CI data after the final run is known.

- [ ] **Step 4: Run final full matrix**

Require Build, CodeQL and Dependency Review on the final exact PR head. Do not merge on partial or stale evidence.

- [ ] **Step 5: Merge and close maintenance drift**

Squash-merge after all exact-head gates pass. Confirm issue #78 can close only if the next Content Freshness run no longer reports the reconciled Vlezet/VillAIgence drift; leave issue #82 open.
