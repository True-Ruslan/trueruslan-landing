# P2.3a Custom Domain Readiness — Design

Date: 2026-08-01

## Context

The site is currently built for `https://true-ruslan.github.io/trueruslan-landing/`. The custom apex domain `trueruslan.ru` is verified in the GitHub account and already routes over HTTP to GitHub Pages, but repository-level DNS validation and HTTPS issuance are blocked by the external DNS state for `www.trueruslan.ru`.

The repository can be prepared now, but it must not publish `https://trueruslan.ru` as canonical truth until GitHub Pages can serve it over HTTPS.

## Goals

1. Make production identity a single validated build/deployment concern.
2. Preserve the current GitHub Pages subpath as the safe default until explicit cutover.
3. Prepare the complete artifact for `https://trueruslan.ru/` and root deployment.
4. Make the cutover bounded, fail-closed and reversible without editing application code.
5. Keep analytics, RU/EN, search, feeds, SEO and monitoring under the existing privacy and quality contracts.

## Non-goals

- Do not provision DNS, GitHub Pages custom-domain settings, TLS or Cloudflare accounts through repository code.
- Do not publish the custom origin as the default before the external HTTPS gate is green.
- Do not add a backend, CMS, runtime configuration fetch, redirects service or second deployment target.
- Do not introduce a `CNAME` repository file; Pages is deployed through GitHub Actions.
- Do not change visual design, content, dependencies, analytics event semantics or Evidence trust semantics.

## Considered approaches

### A. Immediate hard switch

Change every origin to `https://trueruslan.ru` now.

Rejected: canonical, feed and social metadata would point to an HTTPS endpoint that GitHub cannot currently certify.

### B. Keep all current hardcoded URLs and prepare an unmerged cutover branch

Rejected: readiness would remain unverified and drift-prone while DNS support is pending.

### C. Config-driven two-phase cutover — selected

Merge the readiness contract while retaining the legacy origin by default. Activate the custom origin only through a validated repository variable/manual mode after DNS and HTTPS are ready.

## Canonical site manifest

Create `data/site.json` as the only hand-maintained source for public deployment identity:

```json
{
  "legacyOrigin": "https://true-ruslan.github.io/trueruslan-landing",
  "customOrigin": "https://trueruslan.ru",
  "customHostname": "trueruslan.ru",
  "alternateHostname": "www.trueruslan.ru"
}
```

All origins are HTTPS, contain no query/hash and have no trailing slash. `legacyOrigin` may contain the project subpath; `customOrigin` must be an apex/root origin.

## Deployment contract

Create `scripts/site-deployment.js` with focused ownership:

- `loadSiteManifest(path)` validates the canonical manifest.
- `resolveSiteDeployment({mode, configuredOrigin, manifest})` returns a closed state.
- `writeSiteDeploymentEnvironment(...)` writes `SITE_URL`, `PRODUCTION_URL` and bounded state to GitHub environment files.
- `writeSiteDeploymentReport(...)` writes `site-deployment-contract.json` without credentials or unrelated environment data.

Supported modes:

- `auto`: absent `TR_PRODUCTION_SITE_URL` resolves to legacy; exact legacy/custom value resolves accordingly; any other configured value fails closed.
- `legacy`: forces `legacyOrigin`, ignoring the configured variable.
- `custom`: forces `customOrigin`; used only for the first controlled cutover.

Closed reasons:

- `legacy-default`
- `configured-legacy`
- `configured-custom`
- `forced-legacy`
- `forced-custom`

The repository variable is exactly `TR_PRODUCTION_SITE_URL`. After production cutover it should contain exactly `https://trueruslan.ru` so normal `auto` deployments remain custom-domain deployments.

## Build and route behavior

The existing generated-site architecture remains unchanged:

- generated links and assets remain relative;
- SEO, OpenGraph, JSON-LD, sitemap, robots, Atom and hreflang receive the resolved `SITE_URL`;
- the legacy origin retains `/trueruslan-landing`;
- the custom origin emits root URLs without that subpath;
- one build continues to own RU/default and `/en/`;
- one Diplodoc local-search index remains under `_search/ru/`.

The custom-mode artifact must be tested before activation for:

- canonical homepage `https://trueruslan.ru/`;
- `https://trueruslan.ru/en/`;
- sitemap, robots and Atom URLs;
- canonical/OpenGraph/JSON-LD/hreflang URLs;
- absence of the legacy origin in generated public identity metadata;
- working relative CSS, JS, images, PDF, search and navigation from root.

## Workflow integration

### Pages workflow

`.github/workflows/static.yml` gains a `site_mode` dispatch input (`auto`, `legacy`, `custom`). Before tests/build it resolves the site deployment contract using:

- `SITE_DEPLOYMENT_MODE` from input/default `auto`;
- `TR_PRODUCTION_SITE_URL` from repository variables.

The resolver owns `SITE_URL` for build metadata and `PRODUCTION_URL` for smoke testing. The workflow must not derive production identity from `github.repository_owner`, repository name or the Pages output URL.

The existing analytics resolver remains independent and consumes the already resolved build environment.

### Weekly health

`.github/workflows/external-health.yml` resolves the same site contract in `auto` and verifies the resolved production origin. This prevents monitoring from drifting from the deployed canonical origin.

### External link manifest

Production entries are removed from `data/external-links.json`. `scripts/external-health.js` derives production homepage/projects/resume/PDF endpoints from the resolved production origin and appends the remaining external/profile/project entries from the manifest.

This preserves one canonical production identity.

## Production verification

Extend `scripts/production-smoke.js` with an optional expected-origin contract:

- verify final homepage origin equals the expected origin after bounded redirects;
- verify canonical URL on RU and EN homepages belongs to the expected origin;
- preserve existing endpoint, identity and analytics checks;
- keep reports token-free.

In legacy mode the verifier accepts the legacy project subpath. In custom mode it requires root-origin URLs.

The old GitHub Pages entrypoint may redirect after custom-domain activation; it is not treated as an independent canonical production site.

## Cutover gate

Readiness PR may merge while DNS/HTTPS is unresolved. Final production cutover requires all of:

1. GitHub repository Pages DNS check green.
2. `https://trueruslan.ru/` serves a valid certificate.
3. `www.trueruslan.ru` resolves/redirects as intended.
4. Cloudflare Web Analytics site/token exists for `trueruslan.ru`.
5. Repository variable `TR_PRODUCTION_SITE_URL` is set to `https://trueruslan.ru`.
6. Analytics token variable is updated for the new hostname.
7. Manual Pages deployment runs with `site_mode=custom` and `analytics_mode=required`.
8. Generated and deployed RU/EN verification is green.
9. `Enforce HTTPS` is enabled in GitHub Pages.

If any gate fails, force `site_mode=legacy` or restore the legacy repository variable and redeploy.

## Testing strategy

TDD coverage must include:

- manifest validation;
- all mode/configuration transitions and invalid values;
- token-free bounded report/environment output;
- workflow ownership/order and absence of hardcoded workflow origins;
- production endpoint derivation for both subpath and root origins;
- custom-mode generated metadata/feed/sitemap/robots/i18n identity;
- external-health production endpoint derivation;
- full existing unit, build, integrity, browser, accessibility, cross-browser, privacy analytics and visual-regression matrix.

## Security and privacy

- No DNS/API credentials enter the repository.
- Site origin is public configuration, not a secret.
- Analytics remains optional pageviews/RUM only.
- No cookies, persistent visitor identifiers, replay, fingerprinting, advertising or cross-site tracking are added.
- Reports contain origins and closed state only; no analytics token or token hash.

## Operational outcome

After P2.3a merges:

- repository readiness for both origins is verified;
- normal deployments remain legacy until explicit activation;
- DNS support resolution is the only blocker for HTTPS cutover;
- final cutover is a bounded configuration/operations step rather than a broad code migration.
