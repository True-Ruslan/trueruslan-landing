# P2.5a Distribution Contract & Profile Audit — Design

## Goal

Create a deterministic, evidence-bounded distribution kit for the portfolio without adding automatic posting, behavioural tracking, duplicated page metadata or unverified engagement claims.

## Current facts

- `data/page-meta.json` owns page title, description, path and OpenGraph identity.
- `data/external-links.json` owns configured non-production external identities used by External Health.
- `https://trueruslan.ru` is the canonical production origin.
- GitHub profile currently contains the canonical site URL.
- Habr profile is reachable but does not expose the canonical site backlink in the observed public profile.
- Telegram channel and personal profile are reachable but still expose the legacy GitHub Pages URL.

Profile reachability, visible backlink correctness and operator completion are separate facts.

## Architecture

### 1. Canonical distribution targets

Add `data/distribution-targets.json`.

A target stores only distribution-specific data:

- stable `id`;
- `pagePath` referencing `data/page-meta.json`;
- bounded `audiences`;
- bounded `channels`;
- concise `framing`;
- explicit `evidenceBoundary`;
- deterministic `priority`.

Title, description and canonical URL are derived from page metadata and the canonical site origin. They are never duplicated in the target registry.

Controlled audiences:

- `recruiter`;
- `engineer`;
- `researcher`;
- `general`.

Controlled channels:

- `github`;
- `habr`;
- `telegram`;
- `direct`.

### 2. External profile audit

Extend profile records in `data/external-links.json` with distribution audit metadata:

- stable `id`;
- `distributionState`: `verified`, `stale` or `unverified`;
- `lastVerified`;
- `verificationScope`;
- `requiredAction`.

Only configured `profile` entries require distribution audit metadata. Project and production-project health entries remain valid without it.

Meaning:

- `verified`: observed public profile exposes the intended canonical identity/backlink within the stated scope;
- `stale`: profile is reachable but visible identity/backlink is outdated or incomplete;
- `unverified`: insufficient evidence to classify the visible profile state.

The registry is a manual controlled snapshot. Automated probing may produce evidence, but must not change the state.

### 3. Deterministic operator kit

Add `scripts/distribution-readiness.js` to:

- validate both registries;
- resolve targets against canonical page metadata;
- derive canonical URLs without tracking parameters;
- reject legacy origins, duplicate paths/IDs, unknown channels/audiences and unsafe text;
- summarize profile states;
- render deterministic JSON and Markdown artifacts.

Generated files under `distribution-artifacts/`:

- `distribution-readiness.json`;
- `distribution-checklist.md`.

The Markdown checklist must include:

- target title and canonical URL;
- recommended audiences and channels;
- framing and evidence boundary;
- profile audit state;
- exact required operator action for stale/unverified profiles;
- post-update verification checkbox.

### 4. Durable operator runbook

Add tracked `docs/DISTRIBUTION.md` generated from the same renderer. A contract test requires byte equality with deterministic output so the runbook cannot drift from registries.

The file is an operator document, not a new public navigation item or a second search surface.

### 5. Read-only workflow

Add `.github/workflows/distribution-readiness.yml`:

- weekly schedule;
- manual dispatch;
- path-scoped pull requests;
- `contents: read` only;
- run deterministic generator;
- upload artifacts for 30 days;
- no git, issue, deployment, profile or content mutation.

## Initial target set

The controlled set remains intentionally small:

1. homepage;
2. Vlezet flagship case study;
3. VillAIgence flagship case study;
4. Engineering Notes index;
5. installed-acceptance Note;
6. deterministic-authority Note;
7. restart/persistence Note;
8. Publications index.

## Initial external profile snapshot

- GitHub profile — `verified`: canonical `https://trueruslan.ru/` backlink observed.
- Habr profile — `stale`: profile reachable, canonical site backlink not observed.
- Telegram Blog — `stale`: legacy Pages backlink observed.
- Telegram personal profile — `stale`: legacy Pages backlink observed.

This snapshot does not claim that profile descriptions cannot change after verification time.

## Security and privacy boundaries

Prohibited:

- automatic posting;
- automatic profile mutation;
- per-user or per-channel UTM identifiers;
- redirect/tracking service ownership;
- session replay;
- behavioural analytics expansion;
- engagement forecasts or success claims;
- distribution of Draft/unaccepted product evidence as completed work.

## Acceptance criteria

- RED proves missing registry/module/workflow/runbook contracts.
- GREEN validates the controlled registries and exact tracked runbook.
- Workflow uploads deterministic evidence.
- Existing External Health remains compatible with extended records.
- Full repository CI remains green.
- After merge, Production Live Smoke must verify the exact squash deployment even though P2.5a does not alter public routes.
