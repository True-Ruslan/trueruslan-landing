# Production Analytics Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing privacy-friendly analytics layer activatable, enforceable, reversible and verifiable in the real GitHub Pages deployment without committing a production token.

**Architecture:** A focused `scripts/analytics-deployment.js` module resolves `auto|required|disabled` modes from a GitHub Actions configuration variable and verifies generated/deployed RU/EN HTML. The existing Pages workflow remains the only production build/deploy pipeline; `production-smoke.js` and the weekly health workflow reuse the same expectation contract.

**Tech Stack:** Node.js 24 ESM, node:test, GitHub Actions, existing `scripts/analytics.js`, GitHub Pages Actions, built-in Fetch API.

## Global Constraints

- Configuration variable name is exactly `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`.
- Deployment modes are exactly `auto`, `required`, `disabled`.
- Normal `master` push uses `auto`.
- `required` fails before build/deploy without a valid token.
- `disabled` forces a tokenless artifact even when configuration exists.
- No production token or token hash may appear in committed files, JSON reports or uploaded artifacts.
- No Cloudflare account/API credential or provisioning automation is added.
- No custom events, cookies, persistent IDs, fingerprinting, session replay or cross-site tracking are added.
- Existing build, privacy browser gate, accessibility, Lighthouse and visual regression strictness remain unchanged.
- Repository readiness, deployed beacon state and observed Cloudflare telemetry remain separate truths.

---

### Task 1: Deployment mode resolver and safe CLI contract

**Files:**
- Create: `scripts/analytics-deployment.js`
- Create: `scripts/analytics-deployment.test.js`

**Interfaces:**
- Consumes: existing `normalizeAnalyticsToken(token)` from `scripts/analytics.js`.
- Produces:
  - `resolveAnalyticsDeployment({mode, token}): {mode, enabled, expectation, reason}`
  - `writeAnalyticsDeploymentContract(result, reportPath): void`
  - CLI environment inputs: `ANALYTICS_DEPLOYMENT_MODE`, `ANALYTICS_SITE_TOKEN`, optional `GITHUB_ENV`, optional `GITHUB_OUTPUT`.

- [ ] **Step 1: Write failing resolver tests**

Create tests equivalent to:

```js
assert.deepEqual(resolveAnalyticsDeployment({mode: 'auto', token: ''}), {
  mode: 'auto',
  enabled: false,
  expectation: 'disabled',
  reason: 'token-not-configured',
});

assert.deepEqual(resolveAnalyticsDeployment({mode: 'auto', token: fakeToken}), {
  mode: 'auto',
  enabled: true,
  expectation: 'enabled',
  reason: 'configured-token',
});

assert.throws(
  () => resolveAnalyticsDeployment({mode: 'required', token: ''}),
  /analytics token is required/i,
);

assert.deepEqual(resolveAnalyticsDeployment({mode: 'disabled', token: fakeToken}), {
  mode: 'disabled',
  enabled: false,
  expectation: 'disabled',
  reason: 'forced-disabled',
});

assert.throws(() => resolveAnalyticsDeployment({mode: 'invalid', token: ''}), /invalid analytics deployment mode/i);
assert.throws(() => resolveAnalyticsDeployment({mode: 'auto', token: '<bad>'}), /invalid configured analytics token/i);
```

Also assert serialized summary does not contain the fake token or any token hash field.

- [ ] **Step 2: Run focused test and verify RED**

Run:

`node --test scripts/analytics-deployment.test.js`

Expected: `ERR_MODULE_NOT_FOUND` or missing exports.

- [ ] **Step 3: Implement minimal resolver**

Required closed enums:

```js
const MODES = new Set(['auto', 'required', 'disabled']);
const REASONS = new Set(['configured-token', 'token-not-configured', 'forced-disabled']);
```

Rules:

```text
disabled -> do not validate/use non-empty token; expectation disabled
auto + blank -> disabled/token-not-configured
auto + valid -> enabled/configured-token
required + blank -> throw
required + valid -> enabled/configured-token
invalid nonblank token in auto|required -> existing normalizeAnalyticsToken error
```

- [ ] **Step 4: Implement CLI side effects without token leakage**

CLI must:

1. resolve mode/token;
2. call `console.log` only with mode/expectation/reason;
3. if token is nonblank, emit `::add-mask::<token>` before other workflow writes;
4. write `ANALYTICS_EXPECTATION=<enabled|disabled>` to `GITHUB_ENV`;
5. write `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<token>` only when enabled, otherwise an empty value;
6. write `analytics_expectation=<enabled|disabled>` to `GITHUB_OUTPUT`;
7. write `analytics-deployment-contract.json` without token material.

- [ ] **Step 5: Add CLI fixture test**

Spawn the script with temporary `GITHUB_ENV`/`GITHUB_OUTPUT` paths and assert:

```text
report contains mode/enabled/expectation/reason only
GITHUB_ENV contains expected state
GITHUB_ENV contains token only for enabled fixture
stdout contains add-mask command but no ordinary token echo after masking command
```

Do not upload the temporary environment file as an artifact.

- [ ] **Step 6: Run `npm test` and verify GREEN**

Expected: all tests pass.

- [ ] **Step 7: Commit**

Commit message:

`feat: add analytics deployment mode resolver`

---

### Task 2: Generated HTML and production analytics inspection

**Files:**
- Modify: `scripts/analytics-deployment.js`
- Modify: `scripts/analytics-deployment.test.js`
- Modify: `scripts/production-smoke.js`
- Modify: `scripts/production-smoke.test.js`

**Interfaces:**
- Produces:
  - `inspectAnalyticsHtml(html, {expectation, token?}): {ok, beaconCount, errors}`
  - `verifyAnalyticsArtifact(outputDir, {expectation, token?, routes?}): {ok, expectation, routes}`
  - `runProductionSmoke(baseUrl, {fetchImpl?, analyticsExpectation?, analyticsToken?})`.

- [ ] **Step 1: Write failing HTML inspection tests**

Use existing `injectAnalyticsIntoHtml()` to create enabled fixtures rather than duplicating the beacon string.

Assert:

```text
disabled + no marker -> ok
disabled + marker -> failure
enabled + one valid marker + matching token -> ok
enabled + no marker -> failure
enabled + duplicate marker -> failure
enabled + wrong token -> failure
enabled + malformed data-cf-beacon -> failure
enabled + spa:true -> failure
enabled + wrong src/type/missing defer -> failure
result/report never includes token
```

- [ ] **Step 2: Run focused test and verify RED**

Run:

`node --test scripts/analytics-deployment.test.js`

Expected: inspection exports missing.

- [ ] **Step 3: Implement bounded inspection**

Use deterministic string/attribute extraction; do not execute HTML or the third-party script.

Owned marker selector contract:

`data-tr-analytics="cloudflare-web-analytics"`

Validate exactly:

```text
src=https://static.cloudflareinsights.com/beacon.min.js
type=module
defer attribute present
data-cf-beacon parses to object with token and spa:false
```

Return only bounded errors and beacon count; never return parsed token.

- [ ] **Step 4: Implement RU/EN artifact verification**

Default routes:

```js
['index.html', 'en/index.html']
```

Read each file under `outputDir`; missing files are failures. Summary contains route, ok, beaconCount, errors.

- [ ] **Step 5: Write failing production-smoke tests**

Mock Fetch responses for:

- all existing endpoint checks;
- homepage identity;
- Atom feed identity;
- RU and EN analytics HTML.

Assert:

```text
analyticsExpectation defaults to ignore and preserves existing behavior
enabled verifies RU + EN and matching token
disabled verifies RU + EN have zero markers
missing/duplicate/wrong-token beacon makes report.ok false
report.analytics exists only when expectation != ignore
JSON.stringify(report) does not contain token
```

- [ ] **Step 6: Extend `runProductionSmoke()`**

Add defaults:

```js
analyticsExpectation = 'ignore'
analyticsToken = undefined
```

When enabled/disabled, fetch base homepage and `en/index.html`, inspect both, append bounded failures and report section.

CLI reads:

```text
ANALYTICS_EXPECTATION (default ignore)
TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN (verification only)
```

- [ ] **Step 7: Run focused and full tests GREEN**

Run:

```bash
node --test scripts/analytics-deployment.test.js scripts/production-smoke.test.js
npm test
```

- [ ] **Step 8: Commit**

Commit message:

`test: verify analytics state in artifacts and production`

---

### Task 3: Wire Pages deployment and weekly monitoring

**Files:**
- Modify: `.github/workflows/static.yml`
- Modify: `.github/workflows/external-health.yml`
- Create: `scripts/analytics-workflow.test.js`

**Interfaces:**
- Consumes CLI from Task 1 and verification functions from Task 2.
- Produces explicit production modes and uploaded bounded reports.

- [ ] **Step 1: Write failing workflow text contract**

Read both YAML files as UTF-8 text and assert:

```text
static.yml has workflow_dispatch analytics_mode choice with auto|required|disabled
static.yml references vars.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
preflight command appears before npm run build:docs
artifact verification appears after build and before upload-pages-artifact
post-deploy smoke receives ANALYTICS_EXPECTATION
external-health.yml references the same repository variable
external-health runs analytics preflight and production-smoke
both workflows upload analytics-deployment-contract.json
no 16-128 character literal matching the analytics token pattern is present in workflow YAML
```

Use string positions for ordering; do not build a YAML parser.

- [ ] **Step 2: Run focused test and verify RED**

Run:

`node --test scripts/analytics-workflow.test.js`

Expected: missing mode/preflight/workflow integration assertions.

- [ ] **Step 3: Modify Pages workflow**

Required trigger:

```yaml
workflow_dispatch:
  inputs:
    analytics_mode:
      description: Analytics deployment mode
      required: true
      default: auto
      type: choice
      options:
        - auto
        - required
        - disabled
```

Preflight step environment:

```yaml
ANALYTICS_DEPLOYMENT_MODE: ${{ inputs.analytics_mode || 'auto' }}
ANALYTICS_SITE_TOKEN: ${{ vars.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN }}
```

Run:

`node scripts/analytics-deployment.js`

Local artifact verification step after build:

```bash
node -e "import('./scripts/analytics-deployment.js').then(({verifyAnalyticsArtifact}) => { const result = verifyAnalyticsArtifact('docs-html', {expectation: process.env.ANALYTICS_EXPECTATION, token: process.env.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN}); if (!result.ok) { console.error(JSON.stringify(result, null, 2)); process.exit(1); } })"
```

Post-deploy smoke environment must include `ANALYTICS_EXPECTATION` and resolved token.

Upload both:

```text
production-smoke-report.json
analytics-deployment-contract.json
```

- [ ] **Step 4: Modify weekly external health workflow**

Add `npm ci`, then analytics preflight with `auto`, then existing external health, then production smoke against:

`https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/`

Provide `ANALYTICS_EXPECTATION` and resolved token to production smoke. Upload bounded reports; never upload `$GITHUB_ENV`.

- [ ] **Step 5: Run unit/workflow/build verification**

Run through PR CI:

```text
npm test
npm run build:docs
npm run check:site
```

The ordinary PR build must remain tokenless and analytics browser smoke must remain green.

- [ ] **Step 6: Commit**

Commit message:

`ci: activate and verify analytics through Pages deployment`

---

### Task 4: Operator documentation, exact-head CI and deployment truth

**Files:**
- Modify: `docs/ANALYTICS.md`
- Modify PR body and, after merge, durable state docs in a separate docs-only PR.

**Interfaces:**
- Produces a complete activation/rollback/verification runbook and truthful milestone evidence.

- [ ] **Step 1: Update operator runbook**

Document exact UI path:

```text
Repository Settings → Secrets and variables → Actions → Variables → New repository variable
Name: TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
Value: public site token copied from Cloudflare Web Analytics Manage site
```

Document:

- why variable rather than secret/hardcode;
- first activation: manually run `Deploy static content to Pages` with `analytics_mode=required`;
- normal push: `auto`;
- kill switch: manual `disabled`;
- deletion of variable + next push also disables;
- post-deploy and weekly reports;
- how to distinguish repository ready / production beacon active / telemetry observed;
- Cloudflare dashboard data may take several minutes after activation;
- no claim of telemetry until dashboard evidence exists.

- [ ] **Step 2: Open draft feature PR after first RED commit**

PR body must preserve RED/GREEN history and external account boundary.

- [ ] **Step 3: Run final exact-head full PR matrix**

Required green matrix includes all existing gates:

- Test;
- build/integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources;
- Evidence;
- Photo Stories;
- Portfolio regression;
- Firefox/WebKit;
- search;
- RU/EN;
- privacy analytics browser smoke;
- metadata;
- Engineering Map;
- visual regression;
- artifacts.

- [ ] **Step 4: Scope review**

Confirm:

- no production token committed;
- no token/hash in reports/tests/docs;
- no dependency/lockfile change expected;
- no custom events/privacy expansion;
- no visual/budget/trust weakening;
- only Pages/health workflows receive repository variable reference;
- PR builds remain analytics-free.

- [ ] **Step 5: Squash-merge exact verified feature head**

Use `expected_head_sha` from the successful full run.

- [ ] **Step 6: Observe automatic master Pages deployment**

After merge, verify the actual `Deploy static content to Pages` run separately.

Expected without a configured real variable:

```text
auto mode -> analytics disabled
local artifact verification -> disabled pass
post-deploy RU/EN verification -> disabled pass
```

If a real variable already exists unexpectedly, expected state is enabled and exact deployed token verification must pass.

Do not infer provider telemetry from this deployment.

- [ ] **Step 7: Durable continuity PR**

Update exactly:

- `docs/PROJECT_STATE.md`;
- `docs/ROADMAP.md`;
- `docs/CHANGELOG.md`.

Record:

- feature PR/squash/exact-head Build;
- actual Pages deployment run/result when available;
- repository readiness;
- whether beacon is deployed enabled or disabled;
- telemetry remains unobserved unless independently verified;
- remaining external step is only Cloudflare site/token setup when disabled.

Run full exact-head matrix before merging docs-only PR.
