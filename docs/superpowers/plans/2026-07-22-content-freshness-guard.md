# Content Freshness Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build P0.6 Content Freshness Guard as a deterministic maintenance detector plus thin scheduled GitHub workflow that reports drift without mutating canonical public state.

**Architecture:** `scripts/content-freshness.js` owns pure policy and deterministic findings. `scripts/content-freshness-probe.js` collects optional GitHub/HTTP observations, and `scripts/content-freshness-report.js` composes canonical registries + observations into JSON/Markdown reports. `.github/workflows/content-freshness.yml` only orchestrates schedule/manual runs, artifacts, and one idempotent GitHub issue.

**Tech Stack:** Node.js 24 ESM, built-in `fetch`, `node:test`, GitHub Actions, GitHub REST API.

## Global Constraints

- Public site remains static-first; no runtime API dependency.
- `data/projects.json`, `data/project-evidence.json`, and timelines remain hand-maintained canonical sources.
- Guard never automatically changes `verified | stale | unverified`.
- Guard never commits or pushes canonical registry changes.
- Green CI/release/repository activity is only a bounded maintenance signal, never automatic product verification.
- Default `lastVerified` age threshold is 30 days and configurable.
- Freshness findings do not fail the ordinary site build; invalid inputs/execution failures do.

---

### Task 1: Detector contracts and RED gate

**Files:**
- Create: `scripts/content-freshness.test.js`
- Create: `scripts/content-freshness.js`

**Interfaces:**
- Produces: `analyzeContentFreshness({projects, evidence, timelines, observations, now, maxVerifiedAgeDays}) -> {generatedAt, summary, findings}`
- Produces: `renderFreshnessMarkdown(report) -> string`

- [ ] Write failing tests for fresh snapshots, age boundary, missing evidence coverage, unreachable evidence URL observations, repository drift, deterministic ordering, and stale/unverified validity.
- [ ] Run `npm test` in PR CI and confirm RED because detector exports/behavior are missing.
- [ ] Implement minimal pure detector and deterministic Markdown rendering.
- [ ] Re-run `npm test` until GREEN.

### Task 2: Local report command

**Files:**
- Create: `scripts/content-freshness-report.js`
- Modify: `package.json`

**Interfaces:**
- Consumes canonical `data/projects.json`, `data/project-evidence.json`, `data/project-history/*.json`.
- Optional input: `--observations <path>`.
- Outputs: `quality-artifacts/content-freshness-report.json` and `.md` by default.

- [ ] Add CLI-focused tests/contract coverage for deterministic output and malformed observations.
- [ ] Implement argument parsing, canonical loading/validation reuse, timeline loading, report writing, and human summary.
- [ ] Add `npm run check:freshness`.
- [ ] Verify command exits 0 for clean/findings runs and non-zero only on invalid input/execution failure.

### Task 3: External observation probe

**Files:**
- Create: `scripts/content-freshness-probe.js`
- Create: `scripts/content-freshness-probe.test.js`

**Interfaces:**
- Input: projects/evidence registries.
- Output JSON: `{generatedAt, repositories, links}`.
- Repository observation fields: `url`, `pushedAt`, optional `latestRelease`.
- Link observation fields: `status`, optional `httpStatus`, optional `error`.

- [ ] Write tests for GitHub URL parsing, bounded repository observation normalization, evidence URL deduplication, and network failure normalization using injected fetch.
- [ ] Implement probe with built-in fetch and optional `GITHUB_TOKEN`.
- [ ] Ensure private/unconfigured projects are skipped rather than guessed.

### Task 4: Scheduled workflow and idempotent issue reporting

**Files:**
- Create: `.github/workflows/content-freshness.yml`

- [ ] Add daily `schedule` and `workflow_dispatch`.
- [ ] Use permissions `contents: read`, `issues: write`.
- [ ] Run `npm ci`, probe, report command, and upload JSON/Markdown artifact.
- [ ] Use a stable issue marker `<!-- content-freshness-guard -->` to create/update one issue when findings exist and close it when clean.
- [ ] Never run git commit/push or edit canonical registries.

### Task 5: Exact-head verification and continuity

**Files:**
- Modify after feature merge: `docs/PROJECT_STATE.md`
- Modify after feature merge: `docs/ROADMAP.md`
- Modify after feature merge: `docs/CHANGELOG.md`

- [ ] Verify exact feature head through full existing Build matrix.
- [ ] Review workflow diff for mutation permissions/commands.
- [ ] Squash-merge feature PR only when fully green.
- [ ] Create docs-only continuity PR recording exact squash SHA, exact verified head, workflow behavior, remaining debt, and P1.1 as next technical priority.
- [ ] Verify continuity head through full matrix and squash-merge.
