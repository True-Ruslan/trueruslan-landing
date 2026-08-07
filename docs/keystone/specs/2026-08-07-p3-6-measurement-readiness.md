# Portfolio 1.0 P3.6 — measurement readiness

> Status: **P3.6A ACCEPTED / P3.6 MEASUREMENT NOT YET ACCEPTED**
>
> Date: **2026-08-07**

## Purpose

P3.6 is an observation checkpoint, not an analytics oracle. The repository may prepare and validate a reviewable evidence package, but it must not claim that engagement or product impact improved or declined until an operator has supplied sufficient aggregate observations and reviewed the result.

P3.6A provides the bounded machinery for that future review. It does **not** manufacture the missing external evidence.

## Evidence boundary

Every input declares an explicit evidence class:

- `operator-observed` — sanitized aggregates actually observed by the operator and eligible for the bounded readiness states below;
- `synthetic` — test-only fixture data used to prove the pipeline. Its report status is always `synthetic-pipeline-proof` and it can never become `ready-for-human-review`.

The checkpoint accepts only aggregate observations from:

- Cloudflare Web Analytics — aggregate pageviews;
- Google Search Console — aggregate impressions, clicks, indexed clean URLs and indexed legacy `.html` URLs;
- Yandex Webmaster — the same aggregate search/indexing fields;
- optional Yandex Metrica Reports API enrichment — aggregate visits, pageviews and users only;
- an explicit operator assertion stating whether the aggregate traffic volume is sufficient for descriptive review.

The analyzer rejects raw or user-level tracking fields such as session/user/visitor/client/device identifiers, IP addresses, cookies, email, referrer and user-agent data.

The output is limited to descriptive baseline/current values and absolute deltas. It always records:

```text
automaticConclusionsAllowed = false
engagementConclusion = null
productImpactConclusion = null
```

No causal conclusion is produced automatically.

## Observation window

The clean-URL migration boundary is `2026-08-05T00:00:00Z`.

The default minimum observation window is **10 days**, matching the existing external recheck boundary around issue #111. A report created earlier remains valid evidence of **insufficient observation time**, not evidence of product impact.

Once the minimum observation window is satisfied, baseline and current windows must have **equal duration** before descriptive deltas are accepted for review. The operator assessment timestamp must also be on or after the end of the current observation window; an assessment cannot certify data that had not finished accumulating.

Operator-observed report states:

- `insufficient-observation-window` — the minimum post-migration window has not elapsed;
- `insufficient-aggregate-traffic` — the window is long enough, but the operator explicitly considers the aggregate sample too sparse;
- `ready-for-human-review` — the bounded evidence package is complete enough to inspect manually.

Synthetic fixtures use only `synthetic-pipeline-proof` and are never measurement evidence.

`ready-for-human-review` is not equivalent to “engagement improved”.

## Sanitized input schema

The manual workflow reads a repository secret named:

```text
P3_6_MEASUREMENT_OBSERVATIONS_JSON
```

The secret must contain `evidenceClass: "operator-observed"` and JSON shaped like this example. The numbers below are illustrative only and are **not production observations**.

```json
{
  "schemaVersion": 1,
  "evidenceClass": "operator-observed",
  "cleanUrlMigrationAt": "2026-08-05T00:00:00Z",
  "baseline": {
    "window": {
      "start": "2026-07-22T00:00:00Z",
      "end": "2026-08-04T23:59:59Z"
    },
    "cloudflare": {
      "pageviews": 80
    },
    "search": {
      "google": {
        "impressions": 30,
        "clicks": 3,
        "indexedCleanUrls": 4,
        "indexedLegacyHtmlUrls": 11
      },
      "yandex": {
        "impressions": 20,
        "clicks": 2,
        "indexedCleanUrls": 3,
        "indexedLegacyHtmlUrls": 12
      }
    }
  },
  "current": {
    "window": {
      "start": "2026-08-05T00:00:00Z",
      "end": "2026-08-18T23:59:59Z"
    },
    "cloudflare": {
      "pageviews": 110
    },
    "search": {
      "google": {
        "impressions": 45,
        "clicks": 4,
        "indexedCleanUrls": 10,
        "indexedLegacyHtmlUrls": 5
      },
      "yandex": {
        "impressions": 32,
        "clicks": 3,
        "indexedCleanUrls": 9,
        "indexedLegacyHtmlUrls": 6
      }
    }
  },
  "operatorAssessment": {
    "aggregateTrafficSufficient": true,
    "assessedAt": "2026-08-19T08:00:00Z",
    "basis": "Two complete aggregate windows are available and the operator considers the sample sufficient for descriptive review."
  }
}
```

When P3.6B Yandex Metrica enrichment is configured, the workflow derives the optional `metrica` object for both comparison windows from the exact same window dates. Operators should not manually duplicate those Metrica values in the base JSON when API enrichment is enabled.

## Workflow behavior

`.github/workflows/measurement-checkpoint.yml` has three bounded execution modes:

1. **Pull request** — a fixture with `evidenceClass: "synthetic"` verifies the report pipeline. No external/private metric is needed, and the report is permanently classified as `synthetic-pipeline-proof`.
2. **Push to `master` when the measurement pipeline itself changes** — the same synthetic fixture proves the merged workflow actually executes and uploads derived test evidence.
3. **Manual `workflow_dispatch`** — reads `P3_6_MEASUREMENT_OBSERVATIONS_JSON`; the analyzer requires `evidenceClass: "operator-observed"` before the result can ever become `ready-for-human-review`.

The raw observations file exists only at:

```text
$RUNNER_TEMP/measurement-observations.json
```

It is never uploaded as an artifact.

The workflow uploads only:

```text
measurement-checkpoint-report.json
measurement-checkpoint-report.md
```

The report itself contains its evidence class, so synthetic pipeline artifacts cannot be mistaken for operator-observed measurement evidence.

## P3.6B — optional Yandex Metrica Reports API enrichment

P3.6B adds a bounded optional enrichment stage to the manual path. It is specified in `docs/keystone/specs/2026-08-07-p3-6b-yandex-metrica-reporting.md`.

The synthetic PR/master path includes fixed aggregate Metrica fixture values only to prove the schema/report pipeline. It never calls Yandex and remains `synthetic-pipeline-proof`.

For a manual run, the workflow checks the repository variable `YANDEX_METRIKA_COUNTER_ID` and Actions secret `YANDEX_METRIKA_OAUTH_TOKEN` as one configuration pair. If both are absent, the checkpoint behaves exactly as P3.6A did. If only one is present, the run fails closed. If both are present, the workflow calls the read-only Yandex Metrica Reports API for the exact baseline/current windows and writes an enriched temporary input at:

```text
$RUNNER_TEMP/measurement-observations-enriched.json
```

Neither temporary observation file is uploaded. Only the derived measurement report is retained.

The Metrica API path does not change the P3.6 acceptance semantics. A successful authenticated API call proves only that aggregate observations were retrieved; it does not by itself make the sample sufficient, produce an engagement conclusion, or accept P3.6.

## Local/reproducible execution

Given a sanitized local observation file:

```bash
node scripts/measurement-checkpoint-report.js \
  --input /path/to/measurement-observations.json \
  --output-dir measurement-artifacts \
  --minimum-observation-days 10
```

The generated JSON is machine-reviewable; the Markdown report is intended for human review and explicitly repeats the evidence boundary.

## Acceptance of P3.6

P3.6A is accepted on exact squash SHA `7cc56d024fbde53156a9136b14b00c81c6718811`. The analyzer, CLI, workflow contract, PR synthetic proof, post-merge synthetic proof, Pages deployment and Production Live regressions are green.

```text
PR #155 squash / deployed SHA:       7cc56d024fbde53156a9136b14b00c81c6718811
PR Build:                            #1187 / 31185270870 — SUCCESS
PR quality artifact:                 8996659434
PR quality digest:                   sha256:07b6c53547894d1456525ed5574ecb9554c15a2178c16193435cf91937b06a32
PR Measurement Checkpoint:           #16 / 31185271128 — SUCCESS
PR synthetic artifact:               8996446081
PR synthetic digest:                 sha256:7a1f05c829867c7bc0fff757a512a95f11e2c1fcb27a3684d2acc90ecfbef87a
post-merge Measurement Checkpoint:   #17 / 31185967995 — SUCCESS
post-merge synthetic artifact:       8996722305
post-merge synthetic digest:         sha256:d6ab858824c2284a964a4b37f0e7377bb322af8baed922b8af83b27bbb36bce9
Pages:                               #184 / 31185967012 — SUCCESS
Pages deployment ID:                 5795968137
Pages artifact:                      8996733610
Pages artifact digest:               sha256:bda25b1331e9843a7b6f3364f47fdbea8f5fa7ef09a6445c55729062f3e6bfbf
Production Live Smoke:               #267 / 31186078593 — SUCCESS
production artifact:                 8996831585
production digest:                   sha256:d8e4fae2cf63bfc1d2c8742eea68d4fbdb3d9ef588df834d2e65473fa22a475d
```

The post-merge measurement artifact identifies itself as `synthetic` / `synthetic-pipeline-proof`, keeps `readyForHumanReview=false`, and is evidence of pipeline operation only — not production measurement evidence.

**P3.6 itself remains open** until real `operator-observed` aggregate observations exist, the minimum external observation window has elapsed, comparable equal-duration windows are available, the operator has explicitly assessed traffic sufficiency after the current window closes, and the resulting report has been reviewed without promoting unsupported engagement or causality claims.
