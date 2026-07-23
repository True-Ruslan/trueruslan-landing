# Privacy-friendly analytics

TrueRuslan uses an **optional** Cloudflare Web Analytics integration for a deliberately narrow measurement scope.

The site does not depend on analytics to render, navigate, search, switch languages or expose any public content.

## What we measure

P2.2 is intended to answer four aggregate product questions:

1. Which public routes are actually used?
2. How much traffic enters through Russian/default routes versus `/en/`?
3. Which pages may justify more translation or content investment?
4. What real-user page-load/Core Web Vitals performance do visitors experience?

The configured measurement model is:

`pageviews-and-rum`

The canonical policy is:

`data/analytics.json`

## What our integration does not add

TrueRuslan analytics code does not add:

- custom click/event tracking;
- user/account IDs;
- analytics cookies;
- localStorage/sessionStorage/IndexedDB identifiers;
- persistent visitor IDs;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- analytics-driven personalization or product behavior.

A future change to any of these boundaries requires a new design/privacy review rather than a silent configuration change.

## Provider

Provider id:

`cloudflare-web-analytics`

Integration mode:

**manual Cloudflare Web Analytics beacon** injected at build time.

TrueRuslan does not require Cloudflare DNS/proxying for this integration. The analytics script is a third-party optional enhancement and is not part of the application's source-of-truth or runtime control flow.

## Default: analytics disabled

Without a configured token, a normal build:

```bash
npm run build:docs
```

completes successfully and emits **no** analytics beacon.

The build log contains:

```text
Analytics: disabled (no token).
```

This is the default for CI/PR builds.

## Production activation

Prerequisite: create/configure a Cloudflare Web Analytics site for the actual production hostname and obtain its public site token from Cloudflare.

Set the token only in the environment that performs the production site build:

```bash
export TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN='<PUBLIC_SITE_TOKEN>'
npm run build:docs
```

The token must match the bounded identifier format accepted by `scripts/analytics.js`.

Do not commit a real production token into repository files, examples or tests.

When enabled, the build log reports:

```text
Analytics: cloudflare-web-analytics enabled on <N> HTML page(s).
```

The generated HTML contains exactly one owned marker per page:

```html
<script
  type="module"
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon="..."
  data-tr-analytics="cloudflare-web-analytics"
></script>
```

## Disable instantly

Remove `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` from the production build environment and rebuild/redeploy the site.

The next generated artifact contains zero TrueRuslan analytics beacons.

No code rollback is required to disable collection.

## Verification

### Tokenless build

```bash
unset TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
npm run build:docs
```

Expected:

- build succeeds;
- log says analytics is disabled;
- generated HTML contains no `data-tr-analytics="cloudflare-web-analytics"`.

### Token-enabled local verification

Use a non-production test token that satisfies the validator, or a real public site token only in an environment where sending analytics is intended.

```bash
TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN='<TOKEN>' npm run build:docs
```

Expected:

- one beacon per generated HTML page;
- RU and EN pages use the same provider/token;
- no second locale-specific analytics system appears.

### Automated quality contract

Run:

```bash
npm test
npm run build:docs
npm run check:site
node scripts/analytics-browser-smoke.cjs
```

The dedicated browser smoke never sends real analytics. It:

1. confirms the ordinary CI artifact has zero analytics beacons;
2. copies `docs-html` to a temporary fixture;
3. injects a fixed fake token;
4. blocks Cloudflare analytics network requests;
5. validates RU, EN and search routes;
6. checks analytics-related cookies/storage, overflow, accessibility and product diagnostics.

## Failure behavior

Expected behavior when the analytics script is blocked by an ad/privacy blocker or cannot load:

- page content remains available;
- navigation/search/language switching remain independent;
- no TrueRuslan product state is lost;
- no retry/fallback UI is shown;
- analytics failure is treated as telemetry loss, not product failure.

## Privacy/legal note

This document describes the technical behavior and boundaries of the TrueRuslan integration. It is not legal advice and does not claim that one consent rule applies universally to every jurisdiction or future provider configuration.

A provider, hosting, measurement or storage-policy change must re-open the privacy/consent decision before deployment.
