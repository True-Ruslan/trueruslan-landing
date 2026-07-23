# Privacy-friendly Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional Cloudflare Web Analytics page/RUM measurement as a privacy-bounded build-time enhancement that is completely absent without a configured site token.

**Architecture:** `data/analytics.json` owns the stable analytics policy; `scripts/analytics.js` validates policy/token and idempotently injects one manual Cloudflare beacon into generated HTML. Existing `scripts/copy-assets.js` remains the only build/postprocess orchestrator. CI production builds remain tokenless; a dedicated browser smoke clones generated output to a temporary fixture, injects a fake token, blocks Cloudflare requests, and verifies privacy/failure semantics without emitting real analytics.

**Tech Stack:** Node.js 24, ESM scripts, parse5/glob already present in repository, node:test, Playwright/Axe via `scripts/quality-harness/`, GitHub Actions.

## Global Constraints

- Russian/default and `/en/` use one analytics layer/property; no duplicate locale analytics system.
- No cookies/localStorage/sessionStorage/IndexedDB introduced by TrueRuslan analytics code.
- No custom events, user IDs, persistent identifiers, fingerprinting, session replay, advertising audiences or cross-site tracking.
- No backend/CMS/database/self-hosted analytics infrastructure.
- No runtime config fetch and no analytics dependency for rendering/navigation/search.
- Missing token means successful build with zero analytics beacon.
- Malformed configured token fails the build before broken markup is emitted.
- No visual baseline, Lighthouse budget, accessibility or trust/evidence assertion may be weakened.
- No fake production Cloudflare token may be committed.

---

### Task 1: Canonical analytics policy and validator

**Files:**
- Create: `data/analytics.json`
- Create: `scripts/analytics.js`
- Create: `scripts/analytics.test.js`

**Interfaces:**
- Consumes: JSON policy object from `data/analytics.json`; optional token string.
- Produces:
  - `validateAnalyticsPolicy(policy): AnalyticsPolicy`
  - `loadAnalyticsPolicy(manifestPath?): AnalyticsPolicy`
  - `normalizeAnalyticsToken(token): string | null`
  - later tasks extend the same module with injection functions.

- [ ] **Step 1: Write failing policy/token tests**

Tests must assert:

```js
const validPolicy = {
  provider: 'cloudflare-web-analytics',
  measurement: 'pageviews-and-rum',
  activation: 'token-required',
  customEvents: false,
  cookies: false,
  persistentStorage: false,
  crossSiteTracking: false,
  sessionReplay: false,
};

assert.equal(validateAnalyticsPolicy(validPolicy).provider, 'cloudflare-web-analytics');
assert.throws(() => validateAnalyticsPolicy({...validPolicy, customEvents: true}), /custom events.*forbidden/i);
assert.throws(() => validateAnalyticsPolicy({...validPolicy, cookies: true}), /cookies.*forbidden/i);
assert.equal(normalizeAnalyticsToken(undefined), null);
assert.equal(normalizeAnalyticsToken('abcDEF0123456789abcDEF0123456789'), 'abcDEF0123456789abcDEF0123456789');
assert.throws(() => normalizeAnalyticsToken('<script>'), /invalid.*analytics token/i);
```

- [ ] **Step 2: Run `npm test` and verify RED**

Expected: `ERR_MODULE_NOT_FOUND` for `scripts/analytics.js` or missing exported functions.

- [ ] **Step 3: Add canonical policy**

`data/analytics.json` must be exactly equivalent to:

```json
{
  "provider": "cloudflare-web-analytics",
  "measurement": "pageviews-and-rum",
  "activation": "token-required",
  "customEvents": false,
  "cookies": false,
  "persistentStorage": false,
  "crossSiteTracking": false,
  "sessionReplay": false
}
```

- [ ] **Step 4: Implement strict validation/token normalization**

Rules:

```text
provider === cloudflare-web-analytics
measurement === pageviews-and-rum
activation === token-required
all five privacy-risk booleans === false
no unknown top-level keys
token absent/blank => null
token present => /^[A-Za-z0-9_-]{16,128}$/
```

- [ ] **Step 5: Run `npm test` and verify GREEN**

Expected: all repository unit/contract tests pass.

- [ ] **Step 6: Commit**

Commit message:

`test: define privacy analytics policy contract`

---

### Task 2: Deterministic optional beacon injection

**Files:**
- Modify: `scripts/analytics.js`
- Modify: `scripts/analytics.test.js`

**Interfaces:**
- Consumes: validated policy, generated HTML string/directory, normalized token.
- Produces:
  - `injectAnalyticsIntoHtml(html, policy, token): string`
  - `applyAnalytics(outputDir, policy, token): {enabled: boolean, updated: string[], provider: string}`

- [ ] **Step 1: Add failing injection tests**

Required assertions:

```js
const source = '<!doctype html><html><head><title>x</title></head><body></body></html>';
assert.equal(injectAnalyticsIntoHtml(source, validPolicy, null), source);

const enabled = injectAnalyticsIntoHtml(source, validPolicy, fakeToken);
assert.match(enabled, /data-tr-analytics="cloudflare-web-analytics"/);
assert.match(enabled, /type="module"/);
assert.match(enabled, /defer/);
assert.match(enabled, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
assert.match(enabled, /"spa":false/);
assert.equal((enabled.match(/data-tr-analytics=/g) ?? []).length, 1);
assert.equal(injectAnalyticsIntoHtml(enabled, validPolicy, fakeToken), enabled);
assert.doesNotMatch(enabled, /localStorage|sessionStorage|document\.cookie|customEvent|trackEvent/i);
```

Directory fixture tests must include at least:

```text
index.html
en/index.html
landing/projects.html
_search/ru/index.html
```

and prove one identical provider/token beacon per HTML file with token, zero without token.

- [ ] **Step 2: Run focused test and verify RED**

Run:

`node --test scripts/analytics.test.js`

Expected: injection exports missing/failing.

- [ ] **Step 3: Implement injection**

Use parse5 or equivalent deterministic DOM manipulation already available in repository.

Beacon contract:

```html
<script type="module" defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"<TOKEN>","spa":false}' data-tr-analytics="cloudflare-web-analytics"></script>
```

Rules:

- append inside `<head>`;
- token null => return original bytes unchanged;
- existing `data-tr-analytics="cloudflare-web-analytics"` => do not duplicate;
- when enabled, process every `**/*.html` below target output directory in deterministic sorted order;
- no non-HTML files changed.

- [ ] **Step 4: Run focused + full tests GREEN**

Run:

```bash
node --test scripts/analytics.test.js
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

Commit message:

`feat: add deterministic optional analytics injection`

---

### Task 3: Integrate into the single build/postprocess orchestrator

**Files:**
- Modify: `scripts/copy-assets.js`
- Modify existing copy-assets/postprocess tests if present; otherwise extend `scripts/analytics.test.js` with an orchestrator fixture contract.

**Interfaces:**
- Consumes: `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` from `process.env` only at `main()`/default production orchestration boundary.
- Produces: `postprocessOutput(...).analytics` summary with `{enabled, updated, provider}`.

- [ ] **Step 1: Write failing build-integration contract**

Prove:

```text
postprocess fixture with token undefined -> analytics.enabled === false and no beacon
postprocess fixture with fake token -> analytics.enabled === true and RU + EN fixture pages contain one beacon
malformed token -> bounded error before successful completion
```

The injectable function arguments must permit tests to pass `analyticsToken` explicitly; tests must not mutate real process environment globally.

- [ ] **Step 2: Run test and verify RED**

Expected: postprocess result has no analytics summary/integration.

- [ ] **Step 3: Wire analytics near end of `postprocessOutput()`**

Required shape:

```js
const analyticsPolicy = loadAnalyticsPolicy(analyticsPolicyPath);
const analytics = applyAnalytics(outputDir, analyticsPolicy, analyticsToken);
```

Default parameters:

```text
analyticsPolicyPath = data/analytics.json for production docs
analyticsToken = process.env.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

Test/non-production fixture behavior must follow existing optional-manifest conventions so unrelated fixture tests do not suddenly require production paths.

Build log:

```text
Analytics: disabled (no token)
```

or

```text
Analytics: cloudflare-web-analytics enabled on N HTML page(s)
```

- [ ] **Step 4: Run `npm test`, `npm run build:docs`, `npm run check:site`**

Expected tokenless default build:

- all commands pass;
- `docs-html` contains zero `data-tr-analytics` beacons;
- no analytics network capability exists in generated CI artifact.

- [ ] **Step 5: Commit**

Commit message:

`feat: integrate optional analytics into site build`

---

### Task 4: Dedicated privacy/failure browser quality gate

**Files:**
- Create: `scripts/analytics-browser-smoke.cjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: existing tokenless `docs-html`, `scripts/analytics.js`, shared `scripts/quality-harness/*` primitives.
- Produces: `quality-artifacts/analytics-browser-summary.json` and focused CI step.

- [ ] **Step 1: Implement isolated fixture setup in smoke**

The smoke must:

1. create a temporary output directory;
2. copy `docs-html` into it;
3. call analytics injection with fixed fake token `testAnalyticsToken0123456789ABCDEF`;
4. start shared static server against the temporary directory;
5. never mutate committed/generated `docs-html` used by later gates.

- [ ] **Step 2: Add browser assertions**

Representative routes:

```text
/index.html
/en/index.html
/landing/projects/livingworld.html
/en/projects/livingworld.html
/_search/ru/index.html
```

For each representative route assert:

- exactly one `script[data-tr-analytics="cloudflare-web-analytics"]`;
- same fake token/provider config;
- script `type=module`, `defer`, official Cloudflare source, `spa:false`;
- no analytics cookies after load;
- no TrueRuslan-owned localStorage/sessionStorage keys introduced;
- page content/H1 remains present;
- no horizontal overflow regression.

Intercept and abort requests matching:

```text
https://static.cloudflareinsights.com/**
https://cloudflareinsights.com/**
```

Then assert product diagnostics remain clean despite blocked analytics.

Do not globally weaken diagnostics helpers; the exception is local to this runner.

- [ ] **Step 3: Add Axe representative check**

Run Axe on EN LivingWorld/mobile or equivalent existing representative and require zero serious/critical violations.

- [ ] **Step 4: Run smoke locally/CI-compatible**

After installing existing `.quality-tools`, run:

`node scripts/analytics-browser-smoke.cjs`

Expected: PASS and JSON summary artifact.

- [ ] **Step 5: Wire workflow step after Minimal RU EN smoke and before metadata/visual tail**

Step:

```yaml
- name: Privacy-friendly analytics browser smoke
  shell: bash
  run: |
    set -o pipefail
    node scripts/analytics-browser-smoke.cjs 2>&1 | tee analytics-browser-smoke.log
```

Preserve `analytics-browser-smoke.log` and summary in `quality-artifacts`.

- [ ] **Step 6: Commit**

Commit message:

`test: add privacy analytics browser quality gate`

---

### Task 5: Operator documentation and exact-head verification

**Files:**
- Create: `docs/ANALYTICS.md`
- Modify PR body only after exact CI evidence; durable state docs are intentionally deferred until after feature merge.

**Interfaces:**
- Consumes: final implementation contract.
- Produces: activation/disable/verification runbook.

- [ ] **Step 1: Write operator document**

It must explicitly document:

```text
What: aggregate page/path + RUM/Core Web Vitals only
Why: route/language/content-investment/performance decisions
Not collected by our integration: custom events, user IDs, cookies/storage, session replay, fingerprinting, advertising tracking
Provider: Cloudflare Web Analytics manual beacon
Activation env: TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN
Disable: remove env var/token and rebuild/deploy
Tokenless build: zero analytics scripts
Ad blocker/network failure: expected; site remains functional
Production activation prerequisite: create Cloudflare Web Analytics site for the actual hostname and place its public site token in the production build environment
```

Do not claim universal legal advice or absolute consent-law conclusions.

- [ ] **Step 2: Run final exact-head full matrix via PR CI**

Required green steps include:

- Test;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources;
- Project Evidence;
- Photo Stories;
- Portfolio regression;
- Firefox/WebKit;
- generated search;
- Minimal RU EN browser smoke;
- **Privacy-friendly analytics browser smoke**;
- Metadata/OpenGraph;
- Engineering Map;
- unchanged visual regression;
- quality evidence upload.

- [ ] **Step 3: Scope review before merge**

Confirm:

- no package/dependency changes unless technically unavoidable (expected: none);
- no visual baseline/threshold changes;
- no analytics production token committed;
- no custom event code;
- no cookie/storage code;
- no separate RU/EN analytics system;
- no backend/runtime dependency.

- [ ] **Step 4: Squash-merge exact verified head**

Use `expected_head_sha` equal to the exact head that passed the complete matrix.

- [ ] **Step 5: Continuity follow-up**

Create docs-only branch/PR updating exactly:

- `docs/PROJECT_STATE.md`;
- `docs/ROADMAP.md`;
- `docs/CHANGELOG.md`.

Record feature PR/squash/exact-head CI, privacy boundary, activation caveat, and next roadmap priority. Run the same complete matrix on the docs-only exact head before merge.
