# P2.3a Custom Domain Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `https://trueruslan.ru` a fully tested but explicitly gated production origin while preserving the current GitHub Pages subpath as the safe default until DNS and HTTPS are ready.

**Architecture:** Add one canonical site manifest plus a focused deployment resolver that owns the effective `SITE_URL`/`PRODUCTION_URL`. Reuse that contract in Pages deployment, weekly health, generated metadata and production smoke. Activation remains configuration-driven and fail-closed.

**Tech Stack:** Node.js 24, native `node:test`, GitHub Actions, Diplodoc static build, parse5, existing browser/Axe/Lighthouse/visual harness.

## Global Constraints

- Preserve static-first + build-time intelligence + progressive enhancement.
- No backend, CMS, runtime configuration fetch, DNS/API credentials or repository `CNAME` file.
- Normal deployment remains legacy until explicit custom-domain activation.
- Repository variable name is exactly `TR_PRODUCTION_SITE_URL`.
- Supported site modes are exactly `auto`, `legacy`, `custom`.
- Custom origin is exactly `https://trueruslan.ru`.
- Analytics privacy semantics, dependencies, visual baselines and Evidence trust semantics remain unchanged.
- Reports may contain public origins and closed state only; never analytics tokens or hashes.

---

### Task 1: Canonical Site Manifest and Resolver

**Files:**
- Create: `data/site.json`
- Create: `scripts/site-deployment.js`
- Create: `scripts/site-deployment.test.js`

**Interfaces:**
- Produces: `loadSiteManifest(path)`, `validateSiteManifest(value)`, `resolveSiteDeployment({mode, configuredOrigin, manifest})`, `writeSiteDeploymentEnvironment(state, options)`, `writeSiteDeploymentReport(state, path)`.
- Closed state: `{mode, origin, productionUrl, target, reason}` where target is `legacy` or `custom`.

- [ ] **Step 1: Write failing manifest/resolver tests**

Cover exact manifest values, trailing-slash/query/hash rejection, custom root-origin requirement, all five closed reasons, absent auto configuration, invalid configured origin and invalid mode.

- [ ] **Step 2: Run resolver tests and confirm RED**

Run: `node --test scripts/site-deployment.test.js`

Expected: FAIL because `scripts/site-deployment.js` and `data/site.json` do not exist.

- [ ] **Step 3: Implement minimal validated resolver and CLI**

The CLI reads:

```text
SITE_DEPLOYMENT_MODE
TR_PRODUCTION_SITE_URL
GITHUB_ENV
SITE_DEPLOYMENT_REPORT_PATH
```

It writes:

```text
SITE_URL=<resolved origin>
PRODUCTION_URL=<resolved origin>/
SITE_DEPLOYMENT_TARGET=<legacy|custom>
SITE_DEPLOYMENT_REASON=<closed reason>
```

and `site-deployment-contract.json` containing only `mode`, `origin`, `productionUrl`, `target`, `reason`.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node --test scripts/site-deployment.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/site.json scripts/site-deployment.js scripts/site-deployment.test.js
git commit -m "feat: add site deployment contract"
```

---

### Task 2: Generated Identity for Legacy and Custom Origins

**Files:**
- Modify: `scripts/seo.js`
- Modify: `scripts/seo.test.js`
- Modify: `scripts/copy-assets.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `loadSiteManifest()` and manifest `legacyOrigin` for the local/default fallback.
- Produces: deterministic generated identity for either the legacy subpath or custom root origin.

- [ ] **Step 1: Add failing tests for canonical manifest fallback and custom artifact identity**

Tests must prove:

```text
getSiteUrl() without SITE_URL -> manifest.legacyOrigin
custom postprocess -> https://trueruslan.ru/ canonical
custom robots -> https://trueruslan.ru/sitemap.xml
custom sitemap/feed/hreflang -> no /trueruslan-landing prefix
legacy postprocess -> preserves /trueruslan-landing
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test scripts/seo.test.js scripts/copy-assets.test.js`

Expected: FAIL on manifest-owned fallback/custom assertions.

- [ ] **Step 3: Implement manifest-backed default without changing explicit SITE_URL behavior**

`getSiteUrl()` continues to prefer `SITE_URL`, but reads `legacyOrigin` from `data/site.json` when absent. Update package metadata only where it can safely describe the future public identity without changing active deployment behavior; do not hard-switch build output.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node --test scripts/seo.test.js scripts/copy-assets.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/seo.js scripts/seo.test.js scripts/copy-assets.test.js package.json
git commit -m "test: verify custom domain artifact identity"
```

---

### Task 3: Production Monitoring Ownership

**Files:**
- Modify: `data/external-links.json`
- Modify: `scripts/external-health.js`
- Create or modify: `scripts/external-health.test.js`
- Modify: `scripts/production-smoke.js`
- Modify: `scripts/production-smoke.test.js`

**Interfaces:**
- Consumes: resolved `PRODUCTION_URL`/`SITE_URL`.
- Produces: `deriveProductionEntries(baseUrl)` for external health and expected-origin verification in production smoke.

- [ ] **Step 1: Write failing monitoring tests**

Prove that:

- production entries are derived for both legacy subpath and custom root;
- `data/external-links.json` contains no `category: production` records;
- production smoke verifies RU/EN canonical origins;
- bounded redirects may occur, but final canonical origin must equal the expected origin;
- reports remain free of analytics tokens.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test scripts/external-health.test.js scripts/production-smoke.test.js`

Expected: FAIL because production entries are still static and expected-origin verification is absent.

- [ ] **Step 3: Implement production derivation and origin checks**

`runExternalHealth()` prepends derived homepage/projects/resume/PDF entries using `process.env.PRODUCTION_URL || getSiteUrl()` and then appends the non-production manifest entries.

`runProductionSmoke()` accepts `expectedOrigin`; it fetches RU/EN HTML, checks canonical URLs against the normalized expected origin and preserves existing endpoint/identity/analytics behavior.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node --test scripts/external-health.test.js scripts/production-smoke.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/external-links.json scripts/external-health.js scripts/external-health.test.js scripts/production-smoke.js scripts/production-smoke.test.js
git commit -m "feat: derive production monitoring from site origin"
```

---

### Task 4: Pages and Weekly Workflow Integration

**Files:**
- Modify: `.github/workflows/static.yml`
- Modify: `.github/workflows/external-health.yml`
- Create: `scripts/site-workflow.test.js`
- Modify: `scripts/analytics-workflow.test.js`

**Interfaces:**
- Consumes: `node scripts/site-deployment.js` environment output.
- Produces: one resolved `SITE_URL`/`PRODUCTION_URL` used by build, smoke and weekly health.

- [ ] **Step 1: Write failing workflow ownership tests**

Require:

```text
site_mode choice: auto, legacy, custom
vars.TR_PRODUCTION_SITE_URL
site resolver before analytics resolver and build
no github.io/repository-name origin derivation in workflows
production smoke receives resolved PRODUCTION_URL and EXPECTED_SITE_ORIGIN
weekly health resolves the same contract in auto
site-deployment-contract.json uploaded in both workflows
```

- [ ] **Step 2: Run workflow tests and confirm RED**

Run: `node --test scripts/site-workflow.test.js scripts/analytics-workflow.test.js`

Expected: FAIL before workflow wiring.

- [ ] **Step 3: Wire resolver into both workflows**

Pages workflow order:

```text
checkout -> setup -> npm ci -> tests -> site resolver -> analytics resolver -> build -> integrity -> analytics artifact verification -> deploy -> production smoke
```

Weekly workflow order:

```text
checkout -> setup -> npm ci -> site resolver(auto) -> analytics resolver(auto) -> external health -> production smoke
```

- [ ] **Step 4: Run workflow tests and full unit suite**

Run:

```bash
node --test scripts/site-workflow.test.js scripts/analytics-workflow.test.js
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/static.yml .github/workflows/external-health.yml scripts/site-workflow.test.js scripts/analytics-workflow.test.js
git commit -m "ci: gate custom domain deployment"
```

---

### Task 5: Operator Documentation and Full Verification

**Files:**
- Create: `docs/CUSTOM_DOMAIN.md`
- Modify: `README.md`
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Documents exact readiness/cutover/rollback operations and keeps durable state truthful.

- [ ] **Step 1: Write the operator runbook**

Document:

- current DNS/HTTPS external gate;
- repository variable `TR_PRODUCTION_SITE_URL`;
- manual `site_mode=custom` + `analytics_mode=required` first cutover;
- Cloudflare analytics hostname/token replacement;
- `Enforce HTTPS` timing;
- verification commands for apex/www/HTTPS/redirects;
- rollback to `site_mode=legacy` and legacy variable.

- [ ] **Step 2: Update durable docs without claiming completed HTTPS cutover**

State must distinguish:

```text
repository custom-domain readiness: verified after PR CI
DNS/HTTPS production cutover: external, pending
```

- [ ] **Step 3: Run local full verification**

Run:

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: all commands PASS with legacy default.

Run a second build with:

```bash
SITE_URL=https://trueruslan.ru npm run build:docs
npm run check:site
```

Expected: PASS and generated canonical/feed/sitemap/robots/hreflang identity uses the custom root origin.

- [ ] **Step 4: Open PR and require exact-head complete matrix GREEN**

Verify changed files, PR head SHA, Build run and every configured quality step including browser/Axe/Lighthouse, RU/EN, privacy analytics smoke and visual regression.

- [ ] **Step 5: Squash merge only the verified exact head**

After merge, separately verify:

- open PRs: zero;
- latest commits;
- merged SHA;
- readiness state in durable docs;
- no claim that HTTPS cutover is complete.
