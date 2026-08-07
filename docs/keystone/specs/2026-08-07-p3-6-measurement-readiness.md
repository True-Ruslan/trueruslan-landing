# Portfolio 1.0 P3.6 — measurement readiness

> Status: **P3.6A IMPLEMENTED / P3.6 MEASUREMENT NOT YET ACCEPTED**
>
> Date: **2026-08-07**

## Purpose

P3.6 is an observation checkpoint, not an analytics oracle. The repository may prepare and validate a reviewable evidence package, but it must not claim that engagement or product impact improved or declined until an operator has supplied sufficient aggregate observations and reviewed the result.

P3.6A provides the bounded machinery for that future review. It does **not** manufacture the missing external evidence.

## Evidence boundary

The checkpoint accepts only aggregate observations from:

- Cloudflare Web Analytics — aggregate pageviews;
- Google Search Console — aggregate impressions, clicks, indexed clean URLs and indexed legacy `.html` URLs;
- Yandex Webmaster — the same aggregate search/indexing fields;
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

Possible report states:

- `insufficient-observation-window` — the minimum post-migration window has not elapsed;
- `insufficient-aggregate-traffic` — the window is long enough, but the operator explicitly considers the aggregate sample too sparse;
- `ready-for-human-review` — the bounded evidence package is complete enough to inspect manually.

`ready-for-human-review` is not equivalent to “engagement improved”.

## Sanitized input schema

The manual workflow reads a repository secret named:

```text
P3_6_MEASUREMENT_OBSERVATIONS_JSON
```

The secret must contain JSON shaped like this example. The numbers below are illustrative only and are **not production observations**.

```json
{
  "schemaVersion": 1,
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

## Workflow behavior

`.github/workflows/measurement-checkpoint.yml` has three bounded execution modes:

1. **Pull request** — synthetic aggregate fixture verifies the report pipeline. No external/private metric is needed.
2. **Push to `master` when the measurement pipeline itself changes** — the same synthetic fixture proves the merged workflow actually executes and uploads derived evidence.
3. **Manual `workflow_dispatch`** — reads `P3_6_MEASUREMENT_OBSERVATIONS_JSON` and performs the real aggregate checkpoint.

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

P3.6A can be accepted when the analyzer, CLI, workflow contract and synthetic post-merge workflow proof are green.

**P3.6 itself must remain open** until real aggregate observations exist, the minimum external observation window has elapsed, comparable equal-duration windows are available, the operator has explicitly assessed traffic sufficiency after the current window closes, and the resulting report has been reviewed without promoting unsupported engagement or causality claims.
