# Portfolio 1.0 P3.6B — Yandex Metrica Reports API enrichment

> Status: **IMPLEMENTED IN PR #157 / REAL API CONNECTION PENDING OPERATOR CONFIGURATION**
>
> Date: **2026-08-07**

## Purpose

P3.6B adds an optional, read-only Yandex Metrica Reports API source to the existing P3.6 aggregate measurement checkpoint. It reduces manual transcription of traffic totals while preserving the accepted P3.6 evidence, privacy and human-review boundaries.

P3.6B is not a second analytics product and does not change the public site runtime. It enriches only a manual `operator-observed` measurement input immediately before the existing P3.6 analyzer generates its derived report.

The integration can be accepted as tooling after deterministic tests and synthetic workflow proof. A real Yandex Metrica API connection remains a separate operator gate until repository credentials are configured and an authenticated probe succeeds. P3.6 itself remains unaccepted until the observation-window, traffic-sufficiency and human-review gates are satisfied.

## Authoritative API contract

The adapter uses only the Yandex Metrica Reporting API table endpoint:

```text
GET https://api-metrika.yandex.net/stat/v1/data
```

The request is intentionally dimensionless: **no dimensions** are sent. Only three aggregate session metrics are requested, in this exact order:

```text
ym:s:visits
ym:s:pageviews
ym:s:users
```

The request also pins:

```text
accuracy=full
timezone=+00:00
limit=1
```

`date1` and `date2` are derived from the already validated P3.6 baseline/current windows. The adapter does not accept independent API date arguments from the workflow, preventing the external source from silently drifting away from the measurement comparison windows.

The response is reduced immediately to:

```json
{
  "visits": 0,
  "pageviews": 0,
  "users": 0
}
```

The raw API response is not written to disk or uploaded.

## Sampling and response validation

P3.6B is fail-closed. A response is rejected when:

- the HTTP request fails;
- the body is not valid JSON;
- `sampled` is not exactly `false`;
- the response exposes unexpected dimensions;
- echoed metrics do not match the exact requested metric sequence;
- echoed date boundaries do not match the requested P3.6 window;
- `totals` does not contain exactly three non-negative safe integer aggregates.

`accuracy=full` is requested, but the implementation still validates the returned `sampled` flag rather than assuming that the request parameter alone proves an unsampled result.

## Authentication and least privilege

The Yandex OAuth application/token must have only the read scope required to retrieve statistics:

```text
metrika:read
```

The integration does not require `metrika:write`, offline-data, expenses or user-parameter permissions.

Runtime configuration is split by sensitivity:

```text
repository variable: YANDEX_METRIKA_COUNTER_ID
Actions secret:      YANDEX_METRIKA_OAUTH_TOKEN
```

The token is passed only as an HTTP header:

```text
Authorization: OAuth <token>
```

It is never placed in:

- a URL/query string;
- CLI arguments;
- repository files;
- generated measurement reports;
- GitHub Actions artifacts.

The counter ID is also omitted from the derived measurement report because it is not required to interpret the bounded aggregates.

## Manual workflow behavior

`.github/workflows/measurement-checkpoint.yml` keeps ordinary PR/master proof fully synthetic and credential-free.

### PR and master-push proof

The workflow uses fixed synthetic Metrica aggregates together with the existing Cloudflare/Search Console/Webmaster fixture. It does **not** call the Yandex API and remains classified as:

```text
synthetic-pipeline-proof
```

This proves only that the schema/report/workflow path works.

### Manual `workflow_dispatch`

The existing `P3_6_MEASUREMENT_OBSERVATIONS_JSON` secret is materialized under `$RUNNER_TEMP` as before.

The Metrica credential state is resolved as follows:

- counter ID absent + OAuth token absent -> enrichment disabled, existing P3.6 behavior continues;
- exactly one credential present -> fail closed;
- both present -> call the Reports API for the exact baseline and current windows and enrich the temporary observation object.

Temporary inputs are limited to:

```text
$RUNNER_TEMP/measurement-observations.json
$RUNNER_TEMP/measurement-observations-enriched.json
```

Both are runner-local files with restrictive permissions and are **never uploaded**.

Only the existing derived artifacts remain publishable:

```text
measurement-artifacts/measurement-checkpoint-report.json
measurement-artifacts/measurement-checkpoint-report.md
```

## P3.6 schema extension

Yandex Metrica is optional. A valid snapshot may omit it entirely. If present, it must exist in both comparison windows:

```json
{
  "metrica": {
    "visits": 41,
    "pageviews": 73,
    "users": 35
  }
}
```

A half-populated comparison is rejected. Unknown Metrica fields are rejected. The analyzer exposes only descriptive baseline/current/delta triples for the three aggregates.

Adding Metrica does not alter readiness logic. The report still records:

```text
automaticConclusionsAllowed = false
engagementConclusion = null
productImpactConclusion = null
```

No metric increase or decrease is automatically promoted to an engagement, causality or product-impact claim.

## Privacy boundary

### Reports API only

P3.6B uses the aggregate Reporting API. **No Logs API** or equivalent raw visit/hit export is in scope. Per-visitor, per-session, device, IP, cookie, referrer and similar user-level fields remain rejected by the P3.6 input contract.

### Browser tracking remains out of scope

P3.6B does **not** add a Yandex Metrica browser tracking tag to TrueRuslan pages.

The accepted frontend analytics policy currently forbids a silent expansion into cookies and persistent browser identifiers, custom events, cross-site tracking or session replay. Yandex's GDPR guidance explicitly treats the browser tracking tag and cookies as a user-facing privacy/consent concern. Therefore adding a frontend Metrica tag would require a separate product/privacy design and acceptance step rather than being smuggled into this API integration.

This means P3.6B can consume an existing Yandex Metrica counter if one is already collecting appropriate data, but it cannot create historical measurements or activate browser collection by itself.

## Operator setup

After PR #157 is accepted, real API activation requires these operator actions:

1. Confirm the Yandex Metrica counter that owns the intended `trueruslan.ru` statistics and copy its numeric counter ID.
2. Create a Yandex OAuth application for API access/debugging with `metrika:read` only.
3. Authorize the Yandex account that has read access to the counter and obtain the OAuth token.
4. In repository settings, create Actions variable `YANDEX_METRIKA_COUNTER_ID` with the numeric counter ID.
5. Create Actions secret `YANDEX_METRIKA_OAUTH_TOKEN` with the OAuth token. Do not paste the token into issues, PR comments, chat or repository files.
6. Once the P3.6 real observation window is valid, run `Measurement Checkpoint` manually with the existing `operator-observed` input.
7. Confirm that the run reports Metrica enrichment enabled and that only the derived JSON/Markdown report artifact is published.

If the counter does not yet exist or does not have historical data for the P3.6 windows, stop at step 5. Do not fabricate missing values and do not add a frontend tag as part of this slice.

## Failure behavior

- Missing both Metrica credentials: backward-compatible manual P3.6 run without Metrica.
- Partial credential configuration: hard failure before report generation.
- Invalid/expired token or inaccessible counter: hard API failure.
- Sampled or malformed response: hard failure.
- API outage/network failure: hard failure for the Metrica-enabled manual run; no fallback values are invented.
- Ordinary PR/master synthetic runs: independent of Yandex availability and credentials.

## Acceptance boundary

P3.6B tooling acceptance requires:

- adapter unit tests;
- schema/comparison tests;
- secure CLI tests;
- workflow contract tests;
- synthetic Measurement Checkpoint proof;
- full repository quality/security gates;
- no unresolved review findings.

Real Yandex Metrica evidence requires a later authenticated operator probe with the repository variable/secret configured. That probe is not inferred from synthetic CI.

**P3.6 MEASUREMENT REMAINS NOT YET ACCEPTED** until real aggregate observations, the minimum observation window, equal-duration comparison windows, explicit post-window traffic-sufficiency assessment and human review all exist.

## Primary references

- Yandex Metrica Reporting API table endpoint: `https://yandex.com/dev/metrika/en/stat/openapi/data`
- Yandex Metrica basic session metrics: `https://yandex.com/dev/metrika/en/stat/metrics/visits/basic`
- Yandex Metrica OAuth/scopes: `https://yandex.com/dev/metrika/en/intro/authorization`
- Yandex Metrica GDPR guidance: `https://yandex.com/support/metrica/en/general/gdpr`
