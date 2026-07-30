# P2.2a Production analytics activation contract — design

Date: 2026-07-30

## Goal

Close the repository-side gap between the already implemented privacy-friendly analytics layer and the real GitHub Pages production deployment.

P2.2 already provides:

- canonical privacy policy in `data/analytics.json`;
- deterministic optional Cloudflare Web Analytics injection in `scripts/analytics.js`;
- build-time activation through `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
- tokenless builds with zero analytics capability;
- a dedicated browser privacy/failure gate.

The missing production link is that `.github/workflows/static.yml` currently does not pass any repository/environment configuration variable into the build. Even after creating a real Cloudflare Web Analytics site, production cannot activate the existing integration without editing workflow code or manually injecting runner state.

P2.2a must make activation explicit, testable, reversible and observable while preserving tokenless safety.

## External boundary

This milestone can fully implement and verify the repository/GitHub Actions contract.

It cannot invent or provision a real Cloudflare account/site identity without account credentials. The remaining external action is intentionally narrow:

1. create a Cloudflare Web Analytics site for the actual production hostname;
2. copy its public site token;
3. store it as the GitHub Actions configuration variable `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
4. trigger or wait for a production deployment.

Cloudflare documents that non-proxied sites are added by hostname in the Web Analytics dashboard and then use the generated JavaScript snippet. The token is embedded in public HTML, so it is non-sensitive configuration rather than an application credential.

## Chosen architecture

### Configuration owner

Use a GitHub Actions **repository or `github-pages` environment variable** named:

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

GitHub Actions exposes configuration variables through the `vars` context. An unset variable resolves to an empty string, which fits the current tokenless build contract.

Do not hardcode a production token in:

- `data/analytics.json`;
- workflow YAML;
- tests;
- documentation examples;
- generated artifacts committed to git.

Do not require a GitHub Secret for the public site token. The workflow will mask the value at runtime before any shell processing to reduce accidental log exposure, but the deployed HTML remains the canonical public disclosure boundary.

### Deployment modes

The Pages workflow supports three explicit modes:

1. `auto`
   - default for pushes to `master`;
   - enable analytics when the GitHub variable is present;
   - remain analytics-free when it is absent.
2. `required`
   - manual deployment only;
   - fail before build/deploy when the variable is absent or invalid;
   - use this for the first intentional activation and future strict verification.
3. `disabled`
   - manual deployment only;
   - force a tokenless build even if the GitHub variable exists;
   - acts as an immediate rollback/kill switch without deleting configuration.

`workflow_dispatch` exposes a choice input `analytics_mode` with `auto` as the default.

Push deployments always resolve to `auto`; untrusted PR input never reaches the production Pages workflow because it only runs on `master` push or manual dispatch.

## Activation preflight

Add a focused module/CLI:

`scripts/analytics-deployment.js`

Responsibilities:

- validate requested mode: `auto | required | disabled`;
- validate the optional token through the existing `normalizeAnalyticsToken()` contract;
- derive a bounded deployment result:
  - `enabled: true|false`;
  - `expectation: enabled|disabled`;
  - `reason` from a closed enum;
- never include the token in JSON summaries or console output;
- in CLI mode, write:
  - `analytics-deployment-contract.json`;
  - `ANALYTICS_EXPECTATION` to `GITHUB_ENV` when present;
  - a masked `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` to `GITHUB_ENV` only when enabled;
  - an empty token to `GITHUB_ENV` when disabled;
- fail with a bounded error for `required` + missing/invalid token;
- fail for invalid configured tokens in `auto`, rather than silently disabling a malformed configuration.

Reason enum:

- `configured-token`;
- `token-not-configured`;
- `forced-disabled`.

The summary may contain mode, enabled, expectation and reason, but never the token or its hash.

## GitHub Pages workflow integration

Modify `.github/workflows/static.yml`.

### Workflow-level inputs/configuration

Add `workflow_dispatch.inputs.analytics_mode` choice:

- `auto`;
- `required`;
- `disabled`.

Provide the GitHub variable to the preflight step under a neutral temporary environment name:

`ANALYTICS_SITE_TOKEN: ${{ vars.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN }}`

Do not expose it in step names, summaries or ordinary output.

### Order

1. checkout;
2. setup Pages/Node;
3. install dependencies;
4. unit tests;
5. resolve analytics deployment contract;
6. build docs using the resolved `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` environment;
7. generated-site integrity;
8. verify the local generated artifact matches `ANALYTICS_EXPECTATION`;
9. upload/deploy Pages artifact;
10. post-deploy smoke using the same expectation;
11. upload production smoke and activation contract reports.

No second build pipeline is introduced.

### Failure semantics

- absent variable + `auto`: deploy succeeds analytics-free;
- valid variable + `auto`: deploy includes analytics;
- absent variable + `required`: deployment stops before build/upload/deploy;
- invalid variable + `auto|required`: deployment stops before build/upload/deploy;
- any variable + `disabled`: deployment succeeds analytics-free;
- mismatch between expected and generated/deployed HTML: deployment workflow fails;
- removing the variable or selecting `disabled` remains an immediate rollback path.

## Artifact verification

Add pure HTML inspection helpers to `scripts/analytics-deployment.js` or a tightly scoped companion export.

Required checks:

- disabled expectation:
  - zero `script[data-tr-analytics="cloudflare-web-analytics"]` markers;
- enabled expectation:
  - exactly one owned marker;
  - official `https://static.cloudflareinsights.com/beacon.min.js` source;
  - `type="module"`;
  - `defer` present;
  - valid `data-cf-beacon` JSON;
  - `spa: false`;
  - token equals the validated configured token when a token is supplied to verification.

Verification must inspect representative RU and EN pages:

- `index.html`;
- `en/index.html`.

The helper must not execute the third-party script.

## Production smoke extension

Extend `scripts/production-smoke.js` with an analytics expectation contract.

New public options:

- `analyticsExpectation: ignore | enabled | disabled`;
- `analyticsToken?: string`.

Default remains `ignore` for backward compatibility with callers that only want availability/identity checks.

When expectation is not `ignore`, fetch and verify:

- deployed homepage;
- deployed `/en/` homepage.

For enabled mode, require the bounded beacon contract and optional exact token match.

For disabled mode, require zero owned analytics beacons.

The production report adds a bounded section:

```json
{
  "analytics": {
    "expectation": "enabled",
    "ok": true,
    "routes": [
      {"route": "index.html", "ok": true, "beaconCount": 1},
      {"route": "en/index.html", "ok": true, "beaconCount": 1}
    ]
  }
}
```

No token or token hash appears in the report.

CLI reads:

- `ANALYTICS_EXPECTATION`;
- `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` only for exact enabled verification.

## Weekly production monitoring

Extend `.github/workflows/external-health.yml` without replacing its existing external-link checks.

Add:

1. `npm ci` because production smoke remains part of the tested repository runtime and future imports should not depend on accidental zero-dependency assumptions;
2. analytics preflight in `auto` using the same GitHub variable;
3. `node scripts/production-smoke.js <canonical GitHub Pages URL>`;
4. upload `production-smoke-report.json` and `analytics-deployment-contract.json` alongside health artifacts.

This gives weekly detection of:

- Pages endpoint drift;
- RU/EN identity failures;
- analytics unexpectedly disappearing after activation;
- analytics unexpectedly appearing after intended disablement;
- mismatched or malformed deployed beacon markup.

The monitor must not send analytics itself beyond ordinary HTTP GET requests. It never executes the beacon script.

## Tests

### Unit tests

Add `scripts/analytics-deployment.test.js` covering:

- `auto` + no token → disabled / `token-not-configured`;
- `auto` + valid token → enabled / `configured-token`;
- `required` + no token → bounded failure;
- `required` + valid token → enabled;
- `disabled` + valid token → disabled / `forced-disabled`;
- invalid mode → bounded failure;
- malformed token in `auto|required` → bounded failure;
- generated summary never contains token;
- HTML inspection enabled/disabled/malformed/duplicate cases;
- RU + EN artifact verification.

Extend `scripts/production-smoke.test.js` covering:

- backward-compatible `ignore` default;
- enabled expectation on RU + EN;
- disabled expectation on RU + EN;
- missing beacon failure;
- duplicate beacon failure;
- wrong token failure;
- report contains no token.

### Workflow contract test

Add a deterministic test, preferably `scripts/analytics-workflow.test.js`, that reads workflow YAML as text and verifies critical ownership without introducing a YAML dependency:

- `analytics_mode` choices exist;
- repository `vars` token reference exists only in production/health workflow scope;
- analytics preflight precedes `Build docs`;
- local artifact verification precedes upload/deploy;
- post-deploy smoke receives `ANALYTICS_EXPECTATION`;
- no literal production token is present;
- `disabled` and `required` modes remain represented.

Do not attempt to fully parse GitHub Actions expressions with a custom parser.

### Existing full matrix

All existing PR gates remain unchanged in strictness, including the P2.2 privacy browser smoke and visual regression.

## Documentation

Update `docs/ANALYTICS.md` with:

- exact GitHub variable name;
- repository/environment variable setup path;
- why a variable, not a secret/hardcoded value;
- first activation procedure using manual `required` deployment;
- normal `auto` behavior;
- emergency `disabled` rollback;
- how post-deploy and weekly monitoring prove the state;
- explicit statement that code/CI readiness is not proof of real Cloudflare telemetry until the dashboard receives data.

Durable `PROJECT_STATE`, `ROADMAP`, `CHANGELOG` are updated only after feature merge with exact CI/deployment evidence.

## Security and privacy boundary

- no Cloudflare account/API credential is added;
- no API automation creates Cloudflare resources;
- no production token is committed;
- no token is written to reports/artifacts;
- runtime masking reduces accidental Actions log exposure;
- token remains public in deployed HTML by design;
- no custom events, cookies, persistent IDs, fingerprinting, session replay or cross-site tracking are added;
- site behavior remains independent of analytics availability.

## Operational truth model

Three distinct states must remain separate:

1. **Repository ready**
   - workflow/preflight/smoke code merged and exact-head CI green.
2. **Production beacon active**
   - a Pages deployment with `required` or configured `auto` passes local and post-deploy beacon verification.
3. **Telemetry observed**
   - Cloudflare dashboard shows actual data after deployment.

State 1 does not imply 2. State 2 does not imply 3.

## Definition of Done

P2.2a repository milestone is complete when:

- deployment modes are explicit and tested;
- GitHub Actions variable can activate the existing build-time integration;
- `required` fails safely without configuration;
- `disabled` provides a tested kill switch;
- generated RU/EN artifacts are checked before deployment;
- deployed RU/EN pages are checked after deployment;
- weekly monitoring re-checks the configured state;
- no token is committed or emitted into reports;
- full exact-head PR quality matrix is green;
- feature PR is merged from the exact verified head;
- durable state records repository readiness separately from real activation/telemetry.

Actual Cloudflare site creation and variable value remain an explicit external account action unless suitable authenticated Cloudflare/GitHub-variable tools become available.

## Non-goals

- create or manage a Cloudflare account;
- store Cloudflare API credentials;
- query analytics data through GraphQL/API;
- add custom events or funnels;
- add a cookie/consent banner;
- migrate hosting away from GitHub Pages;
- add a custom domain;
- make analytics mandatory for normal site operation;
- claim telemetry exists before provider evidence.
