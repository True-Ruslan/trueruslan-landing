# Portfolio Clarity C7 — production baseline + P3.6 handoff

Status: **pending-production-acceptance**

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

1. successful exact **Pages deployment** with a concrete deployment ID;
2. successful **deployment-triggered Production Live** verification against that deployed SHA;
3. review of the resulting production evidence and artifact identity;
4. a separate **durable acceptance** update that changes the presentation baseline from pending only after the production proof exists and records the exact accepted identities in `PROJECT_STATE.md`, `ROADMAP.md`, `CHANGELOG.md`, and the C7 acceptance ledger.

Until those gates are complete, C7 remains pending and P3.6 remains open.
