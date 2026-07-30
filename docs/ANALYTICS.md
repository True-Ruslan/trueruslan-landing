# Privacy-friendly analytics

TrueRuslan uses an **optional** Cloudflare Web Analytics integration for a deliberately narrow measurement scope.

The site does not depend on analytics to render, navigate, search, switch languages or expose public content.

## What we measure

The analytics layer exists to answer four aggregate product questions:

1. Which public routes are actually used?
2. How much traffic enters through Russian/default routes versus `/en/`?
3. Which pages may justify more translation or content investment?
4. What real-user page-load/Core Web Vitals performance do visitors experience?

Canonical measurement model:

`pageviews-and-rum`

Canonical policy:

`data/analytics.json`

## What our integration does not add

TrueRuslan analytics code does not add:

- custom click/event tracking;
- user or account IDs;
- analytics cookies;
- localStorage/sessionStorage/IndexedDB identifiers;
- persistent visitor IDs;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- analytics-driven personalization or product behavior.

Any expansion beyond this boundary requires a new design and privacy review.

## Provider

Provider id:

`cloudflare-web-analytics`

Integration mode:

**manual Cloudflare Web Analytics beacon injected at build time**.

The integration works without moving DNS or hosting to Cloudflare. The provider script is an optional third-party enhancement and is not part of TrueRuslan's source of truth or runtime control flow.

## Core activation contract

Production configuration variable:

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

The actual public site token is not stored in repository files.

Without a configured token, a normal build:

```bash
npm run build:docs
```

succeeds and emits **no** analytics beacon.

Build log:

```text
Analytics: disabled (no token).
```

This remains the default for pull-request CI.

With a valid token, the existing build pipeline injects exactly one owned beacon per generated HTML page:

```html
<script
  type="module"
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon="..."
  data-tr-analytics="cloudflare-web-analytics"
></script>
```

## Why a GitHub Actions variable, not a secret

The Cloudflare Web Analytics site token is embedded in deployed public HTML. It is a site identifier, not a Cloudflare account/API credential.

Use a GitHub Actions **repository configuration variable** because:

- it represents non-sensitive deployment configuration;
- it can be changed or removed without a code commit;
- the Pages deployment and scheduled weekly health workflow can read the same value;
- treating it as a secret would not make it confidential after deployment.

The deployment preflight still masks a configured value in Actions logs to reduce accidental disclosure during shell execution.

Never store Cloudflare API credentials in this repository or workflow for this integration.

## Configure the production token

### 1. Create the Cloudflare Web Analytics site

In Cloudflare Web Analytics:

1. add a site for the actual production hostname;
2. use the hostname shown by the current GitHub Pages deployment;
3. copy the generated public site token from the site's JavaScript snippet.

Do not copy an account API token or Global API Key.

### 2. Add the GitHub Actions repository variable

Open:

```text
Repository Settings
→ Secrets and variables
→ Actions
→ Variables
→ New repository variable
```

Set:

```text
Name:  TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
Value: <public site token copied from Cloudflare Web Analytics>
```

Use repository scope. The scheduled `External health` workflow intentionally does not bind itself to the `github-pages` deployment environment, so an environment-only variable would not be visible to weekly monitoring.

Do not create a conflicting environment-scoped value with the same name.

## Deployment modes

The workflow `Deploy static content to Pages` supports three explicit modes.

### `auto`

Default for every push to `master` and for manual runs unless changed.

Behavior:

- valid configured variable → analytics enabled;
- variable absent/blank → analytics disabled;
- malformed configured value → deployment fails before build/upload.

This is the normal steady-state mode.

### `required`

Manual deployment mode for first activation or strict verification.

Behavior:

- valid configured variable → build and deploy continue;
- variable absent/blank → workflow fails before build/deploy;
- malformed value → workflow fails before build/deploy.

Use this for the first intentional activation so an analytics-free deployment cannot be mistaken for a successful activation.

### `disabled`

Manual kill-switch mode.

Behavior:

- analytics is forced off even when the GitHub variable exists;
- generated RU and EN pages must contain zero owned beacons;
- post-deploy verification must also confirm zero beacons.

This provides immediate rollback without deleting configuration first.

## First production activation

After creating the Cloudflare site and GitHub variable:

1. open GitHub Actions;
2. select `Deploy static content to Pages`;
3. choose `Run workflow`;
4. select `analytics_mode = required`;
5. run the workflow;
6. require all steps to pass, including generated analytics verification and deployed Pages smoke;
7. open the deployed RU and EN pages only after the workflow succeeds;
8. check the Cloudflare Web Analytics dashboard for incoming data.

Provider data may take several minutes to appear. A successful Pages deployment proves the beacon contract, but not that telemetry has already been processed by the provider.

## Normal deployment

After successful first activation, normal pushes to `master` use `auto`:

```text
configured token → enabled build → RU/EN artifact verification
→ Pages deploy → RU/EN production verification
```

No separate analytics build pipeline exists.

## Disable or roll back

Two supported paths:

### Immediate manual kill switch

Run `Deploy static content to Pages` manually with:

`analytics_mode = disabled`

This ignores the configured variable for that deployment and verifies that production becomes analytics-free.

### Persistent disable

Remove `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` from GitHub Actions repository variables, then trigger or wait for the next `auto` deployment.

The next artifact and deployed RU/EN pages must contain zero owned analytics beacons.

No application code rollback is required.

## Deployment verification

### Preflight

`scripts/analytics-deployment.js` resolves:

- `auto`;
- `required`;
- `disabled`.

It writes a bounded report:

`analytics-deployment-contract.json`

The report contains only mode, enabled state, expected deployed state and reason. It never contains the token or token hash.

### Generated artifact

Before Pages upload, the workflow checks:

- `docs-html/index.html`;
- `docs-html/en/index.html`.

Enabled expectation requires exactly one valid owned Cloudflare beacon on each page. Disabled expectation requires zero.

### Deployed Pages

After `actions/deploy-pages`, `scripts/production-smoke.js` verifies:

- existing public endpoints and identity markers;
- Russian homepage analytics state;
- English homepage analytics state;
- exact configured token match when analytics is enabled;
- zero owned beacons when disabled.

Bounded report:

`production-smoke-report.json`

The report never contains the token.

### Weekly monitoring

`External health` runs weekly and manually. It resolves the current repository configuration in `auto`, checks existing public endpoints and reuses the same production analytics verifier.

This detects:

- an enabled beacon unexpectedly disappearing;
- analytics unexpectedly appearing after disablement;
- malformed or duplicated deployed beacon markup;
- RU/EN deployment drift;
- ordinary production endpoint failures.

The monitor fetches HTML but does not execute the Cloudflare beacon script.

## Local verification

### Tokenless build

```bash
unset TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
npm run build:docs
```

Expected:

- build succeeds;
- log says analytics is disabled;
- generated HTML contains no owned beacon.

### Token-enabled fixture

Use only a non-production test token or a real public site token in an environment where sending analytics is intentional:

```bash
TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN='<TOKEN>' npm run build:docs
```

Expected:

- one beacon per generated HTML page;
- RU and EN pages use the same provider/token;
- no locale-specific analytics system appears.

### Automated quality contract

```bash
npm test
npm run build:docs
npm run check:site
node scripts/analytics-browser-smoke.cjs
```

The dedicated privacy browser smoke never sends real analytics. It uses a temporary copy, injects a fixed fake token, blocks provider requests and checks cookies/storage, product behavior, overflow and accessibility.

## Operational truth model

Keep three states separate.

### 1. Repository ready

The workflow, preflight, artifact verifier and production smoke are merged and exact-head CI is green.

This does **not** prove analytics is deployed.

### 2. Production beacon active

A real Pages deployment passes enabled RU/EN verification with the configured public site token.

This does **not** prove the provider has received or processed telemetry.

### 3. Telemetry observed

The Cloudflare Web Analytics dashboard shows actual post-deployment data.

Only this state proves telemetry has been observed.

Never infer state 2 from state 1 or state 3 from state 2.

## Failure behavior

If the provider script is blocked or unavailable after deployment:

- content remains available;
- navigation, search and language switching remain independent;
- no TrueRuslan product state is lost;
- no retry/fallback UI is shown;
- analytics failure is telemetry loss, not product failure.

## Privacy/legal note

This document describes the technical behavior and boundaries of the TrueRuslan integration. It is not legal advice and does not claim that one consent rule applies universally to every jurisdiction or future provider configuration.

A provider, hosting, measurement or storage-policy change must re-open the privacy/consent decision before deployment.
