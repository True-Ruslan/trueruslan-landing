# Portfolio Clarity C7 — production baseline + P3.6 handoff

Status: **production-accepted**

## Purpose

C7 closes the redesign implementation sequence by recording one tracked **presentation baseline** as contextual provenance for the existing P3.6 Measurement Checkpoint. It does not create a second analytics system, a second measurement registry, or a second source of operator observations.

The presentation baseline is repository-owned, non-secret context. Private aggregate observations remain supplied through the existing `P3_6_MEASUREMENT_OBSERVATIONS_JSON` boundary and keep their existing schema.

## Measurement boundary

The clean-URL measurement boundary remains:

```text
cleanUrlMigrationAt = 2026-08-05T00:00:00Z
```

C7 **does not reset** and must not reset that boundary. `data/presentation-baseline.json` records `resetsCleanUrlMeasurement=false` and `measurementMode=context-only` so presentation provenance cannot become the clock for P3.6 readiness.

P3.6 remains **NEXT / WAITING**. Real measurement still requires all of the existing conditions:

- evidence class `operator-observed`;
- complete **equal-duration** baseline and current aggregate windows;
- explicit operator assertion that aggregate traffic is sufficient;
- the existing minimum observation-window rule derived from `cleanUrlMigrationAt`;
- **human review** before any product interpretation.

Synthetic workflow fixtures remain pipeline proof only and are not production measurement evidence.

## Presentation baseline lifecycle

Before exact production acceptance, the canonical descriptor remains `pending-production-acceptance` and carries no invented deployment identity:

- `acceptedAt = null`;
- `deployedSha = null`;
- `pagesDeploymentId = null`;
- `productionLiveRunId = null`.

The Measurement Checkpoint may copy this bounded descriptor into its derived report as provenance. It must not merge it into operator observations, derive readiness from it, or persist raw/user-level analytics data.

## Claims boundary

C7 makes **no causal conclusion** about engagement, conversion, discoverability, SEO, or product impact. A presentation baseline only identifies which presentation state accompanies later descriptive aggregate observations. Correlation or directional deltas do not establish causality.

The existing measurement report remains responsible for refusing automatic engagement and product-impact conclusions.

## Production gate

Repository CI or a PR artifact cannot self-accept C7. Finalization requires all of the following on the exact merged C7 SHA:

1. successful exact Pages deployment with a concrete deployment ID;
2. successful **deployment-triggered Production Live** verification against that deployed SHA;
3. review of the resulting production evidence and artifact identity;
4. a separate **durable acceptance** update that changes the presentation baseline from pending only after the production proof exists and records the exact accepted identities in `PROJECT_STATE.md`, `ROADMAP.md`, `CHANGELOG.md`, and the C7 acceptance ledger.

Until those gates are complete, C7 remains pending and P3.6 remains open.

## Accepted production evidence

The production gate is now satisfied for the C7 feature squash. The historical pre-acceptance state was `pending-production-acceptance`; it advanced only after the exact deployed evidence below existed.

- PR #198 exact feature head: `6a511b8f7cc102cdcc1b00f1dda26bc57fdefae3`;
- exact-head Build #1799 / `31515510234` — SUCCESS;
- quality artifact `9111068659`, digest `sha256:528e13cbe2883644c4673ce18bd0475b8acb87bb81b98e7ad806953bacc27e24`;
- Measurement Checkpoint #174 / `31515510155` — SUCCESS;
- measurement artifact `9110870252`, digest `sha256:6aeca4695acb1cae8933a852ee6ad8fc1323a80208a90cb7abb0084afdbd229c`;
- accepted squash / exact deployed SHA: `134043fa2bb5f6612266a04eab2853f71b207328`;
- Pages #223 / `31516118934` — SUCCESS;
- github-pages deployment `5855067883` — success;
- Pages artifact `9111122104`, digest `sha256:22471106f7981d7cfd8b8d7245aeea0db140c1a2c3fc0fb7b092ca30e5814e41`;
- Pages production verification reports `9111138147`, digest `sha256:f3bf385afa7b727cd62a26ccdbeef5d64eb711e516c4a90e993d7a7c7f9e6b75`;
- deployment-triggered Production Live #498 / `31516213818` — SUCCESS;
- production artifact `9111213502`, digest `sha256:fcacde8fd83e068fe094c05a0da07a23bb8ba88a42e15d87507cf5d8ccc1a1d8`.

The accepted presentation baseline remains `context-only`, keeps `resetsCleanUrlMeasurement=false`, and preserves `cleanUrlMigrationAt=2026-08-05T00:00:00Z`. This acceptance does not close P3.6: real evidence remains `operator-observed`, equal-duration, traffic-sufficient and subject to human review. No causal engagement, conversion, SEO or product-impact conclusion is authorized.
