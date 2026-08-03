# Product Evidence Reconciliation Design

## Goal

Synchronize the public Vlezet and VillAIgence snapshots with evidence created after the 2026-08-02 landing milestone, while preserving the rule that automated checks prove only their recorded scope and never silently promote a product to a broader accepted state.

## Source-of-truth boundaries

- `data/projects.json` owns project identity, lifecycle label, summary and route.
- `data/project-history/*.json` owns the public project evolution timeline.
- `data/project-evidence.json` owns bounded dated evidence signals.
- `docs/landing/projects/*.md` owns the authored case-study narrative.
- `data/now.json` owns the short-lived editorial focus snapshot.
- `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` and `docs/CHANGELOG.md` own durable handoff state.
- Source repositories remain authoritative for their implementation, CI, release and product-acceptance facts.

No automatic mutation, runtime GitHub API, backend or second evidence store is introduced.

## Vlezet reconciliation

The landing currently records M7.8B as a failed draft. The source repository now records PR #41 as product-accepted and squash-merged.

The synchronized snapshot will state:

- M0–M7.8B are implemented, accepted and merged;
- M7.8B delivered region-first source normalisation, bounded wall topology, overload protection and verification-only AI;
- accepted evidence remains explicitly limited by Source geometry/topology F1 `0.837989`;
- recognition remains assistive and can miss or fragment walls;
- doors/windows and host-wall correctness are not delivered by M7.8B;
- M7.8C opening classification and host-wall validation is next.

The project remains `pre-production` and no arbitrary-plan-accuracy claim is added.

## VillAIgence reconciliation

The landing currently stops at a corrective `0.1.22` candidate with installed acceptance pending. The source repository has since merged:

- PR #103: a 28-scenario risk-based acceptance catalogue and real Fabric GameTests;
- PR #104: isolated production-JAR startup, controlled shutdown, restart and six-store persistence verification across two JVM runs;
- release/tag `0.1.23+1.21.1` detected by Content Freshness Guard.

The synchronized snapshot will state:

- automated GameTest and production-JAR startup/restart acceptance are now proven for their exact scopes;
- the production candidate reached ready state twice, stopped cleanly and preserved paths and SHA-256 values for six canonical stores;
- test-only fixture code is excluded from the distributable JAR;
- this does not prove cumulative manual gameplay/provider acceptance;
- Text/STT/Chat/TTS, real two-client behavior, focused water/grave canaries and operator acceptance remain separate gates.

The lifecycle stays `release-candidate`. The label may advance from `CORRECTIVE CANDIDATE` to `ACCEPTANCE IN PROGRESS`, but not to production or accepted release.

## Editorial focus

`data/now.json` will move to `2026-08-03` and reflect the new evidence boundary:

- Vlezet moved from failed M7.8B review to an accepted but precision-limited milestone;
- VillAIgence moved from source/package-only correction to automated production-JAR startup/restart proof;
- the next Engineering Note remains a narrow article about exact artifact and installed acceptance, not a duplicate of the existing general Evidence Layer note.

## Documentation reconciliation

Durable documentation will record:

- repository hardening PRs #67–#81;
- the residual `markdown-it@13.0.2` blocker tracked in issue #82;
- Vlezet M7.8B acceptance and M7.8C next;
- VillAIgence M11 Phase A/B evidence and remaining manual acceptance boundary;
- issue #78 resolution criteria.

## Testing strategy

A new repository contract test will fail against the stale snapshot and require:

- Vlezet PR #41 to be `merged`, not `failed`;
- Vlezet current timeline to be M7.8C;
- VillAIgence evidence to contain PRs #103 and #104;
- VillAIgence lifecycle to remain `release-candidate` with `ACCEPTANCE IN PROGRESS`;
- case studies to contain the new bounded claims and exclude stale pending-only language;
- `data/now.json` and durable docs to use the 2026-08-03 reconciliation state.

After the data/content update, the complete existing Build, browser, accessibility, visual, search, metadata and custom-domain matrix must remain green.

## Non-goals

- publishing a new VillAIgence acceptance claim without exact manual evidence;
- changing Vlezet geometry or recognition implementation;
- dependency upgrades beyond the already recorded PR #81 state;
- redesigning project pages, evidence components or timelines;
- closing issue #82;
- adding analytics or runtime integrations.
