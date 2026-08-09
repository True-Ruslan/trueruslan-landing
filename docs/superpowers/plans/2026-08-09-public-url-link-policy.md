# Public URL Namespace & Link Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish clean RU canonical routes without `/landing` and enforce new-tab navigation for every inter-page/external anchor while preserving compatibility, SEO, static-first behavior, and existing quality gates.

**Architecture:** Keep source files under `docs/landing/**`; project public URLs at build time in `scripts/clean-urls.js`. Add a focused final-HTML link-policy postprocessor so generated Diplodoc and standalone anchors share one policy. Legacy `/landing/...` and `.html` paths remain `noindex,follow` redirects to the projected route.

**Tech Stack:** Node.js 24+, native `node:test`, filesystem build postprocessing, Diplodoc generated HTML, GitHub Pages, existing Playwright/Lighthouse quality harness.

## Global Constraints

- Source tree `docs/landing/**` is not physically moved.
- Root homepage remains `/`; English remains `/en/...`.
- Canonical RU page paths remove only the leading `landing/` segment.
- Existing `/landing/...` and `.html` entrypoints remain compatibility redirects.
- Inter-page and external anchors use `target="_blank" rel="noopener noreferrer"`.
- Same-document `#fragment`, `mailto:` and `tel:` links are not forced into `_blank`.
- No runtime router/backend/Cloudflare Worker is introduced.
- Diplodoc remains the only site-wide search owner.
- No quality gate is weakened.

---

### Task 1: RED route-projection contract

**Files:**
- Modify: `scripts/clean-urls.test.js`
- Create: `scripts/public-url-link-policy.test.js`

**Interfaces:**
- Consumes: current `toDirectoryUrl`, `publishDirectoryRoutes`, generated route behavior.
- Produces: failing expectations for `toPublicRoute(value, siteUrl?)`, legacy aliases, and generated canonical references.

- [ ] **Step 1: Write failing tests**

Add expectations equivalent to:

```js
assert.equal(toPublicRoute('landing/resume.html'), 'resume/');
assert.equal(toPublicRoute('/landing/projects/notchhub.html#ui'), '/projects/notchhub/#ui');
assert.equal(toPublicRoute('en/about.html'), 'en/about/');
```

Assert generated canonical/sitemap/internal links contain `/resume/` or `/projects/.../` and not `/landing/`.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
node --test scripts/clean-urls.test.js scripts/public-url-link-policy.test.js
```

Expected: failures limited to the unimplemented public-route projection/link policy.

- [ ] **Step 3: Commit RED**

```bash
git add scripts/clean-urls.test.js scripts/public-url-link-policy.test.js
git commit -m "test: define public URL and link policy"
```

---

### Task 2: Canonical public-route projection

**Files:**
- Modify: `scripts/clean-urls.js`
- Modify: `scripts/clean-urls.test.js`

**Interfaces:**
- Produces: `toPublicRoute(value, siteUrl = DEFAULT_SITE_URL)` and route/alias metadata used by `publishDirectoryRoutes`.

- [ ] **Step 1: Implement narrow projection**

Introduce a route transform that first performs current `.html -> /` normalization, then strips only a leading generated RU `landing/` segment. It must preserve query/fragment suffixes and GitHub Pages base paths.

Pseudo-contract:

```js
projectPublicPath('landing/resume/') === 'resume/'
projectPublicPath('landing/projects/vlezet/') === 'projects/vlezet/'
projectPublicPath('en/about/') === 'en/about/'
```

- [ ] **Step 2: Publish canonical indexes at projected paths**

For a source `landing/resume.html`, write canonical content to `resume/index.html` rather than `landing/resume/index.html`.

- [ ] **Step 3: Preserve aliases**

Write redirects at:

```text
landing/resume.html
landing/resume/index.html
```

both targeting `/resume/`, preserving query and hash in the JavaScript redirect.

- [ ] **Step 4: Rewrite canonical public references**

Run projection across canonical/hreflang/sitemap/internal generated references while preserving search identity resources.

- [ ] **Step 5: Verify focused tests GREEN**

```bash
node --test scripts/clean-urls.test.js scripts/public-url-link-policy.test.js
```

- [ ] **Step 6: Commit**

```bash
git add scripts/clean-urls.js scripts/clean-urls.test.js scripts/public-url-link-policy.test.js
git commit -m "feat: project RU pages to root canonical URLs"
```

---

### Task 3: Global final-HTML link policy

**Files:**
- Create: `scripts/link-policy.js`
- Create: `scripts/link-policy.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `applyLinkPolicy(html)` and `applyLinkPolicyToSite({outputDir})`.

- [ ] **Step 1: Write failing tests**

Cover:

```html
<a href="/projects/">...</a>
<a href="https://github.com/True-Ruslan">...</a>
<a href="#architecture">...</a>
<a href="mailto:...">...</a>
<a href="tel:...">...</a>
```

Expected:

- first two receive `_blank` and `noopener noreferrer`;
- fragment/mailto/tel remain without forced target;
- existing `rel="nofollow"` becomes `rel="nofollow noopener noreferrer"`;
- running the transformer twice is byte-stable.

- [ ] **Step 2: Implement with an HTML parser**

Use the already installed `parse5`/`parse5-utils`; do not use global HTML regex rewriting for attributes.

- [ ] **Step 3: Add build command after clean URLs**

Update build chain so the final generated HTML is processed after `postprocess:clean-urls` and before final integrity/production verification.

- [ ] **Step 4: Run focused tests**

```bash
node --test scripts/link-policy.test.js scripts/public-url-link-policy.test.js
```

- [ ] **Step 5: Commit**

```bash
git add scripts/link-policy.js scripts/link-policy.test.js package.json
git commit -m "feat: enforce new-tab navigation policy"
```

---

### Task 4: Navigation/search/SEO reconciliation

**Files:**
- Modify: `docs/toc.yaml` only where explicit target semantics are required.
- Modify: `scripts/clean-urls.js`
- Modify relevant existing tests for clean URLs, metadata, search, sitemap, navigation.

**Interfaces:**
- Consumes canonical route projection and final link policy.
- Produces a generated artifact with no canonical `/landing/` references and search results that open projected routes.

- [ ] **Step 1: Update generated search link formatter**

Ensure user-visible search links map `landing/foo.html` to `foo/`, while internal search registry identity remains unchanged if required by Diplodoc.

- [ ] **Step 2: Assert SEO outputs**

Verify canonical/hreflang/sitemap use projected URLs and legacy aliases are `noindex,follow`.

- [ ] **Step 3: Assert navigation policy**

Inspect representative final RU/EN homepage, project, note, search and contact pages for `_blank` on inter-page/external links and current-tab `#fragment` anchors.

- [ ] **Step 4: Run full unit suite**

```bash
npm test
```

Expected: 0 failures.

- [ ] **Step 5: Commit**

```bash
git add docs/toc.yaml scripts tests package.json
git commit -m "test: reconcile search and SEO with public routes"
```

---

### Task 5: Full quality matrix and review

**Files:**
- No intentional production changes unless a failing gate exposes a real defect.
- Update visual baseline only if a rendered visual legitimately changes and only after manual screenshot review.

- [ ] **Step 1: Run/build via PR CI**

Required gates: Build, CodeQL, Dependency Review.

- [ ] **Step 2: Require existing Build matrix**

Must include unit, generated-site integrity, mobile overflow, Chromium accessibility/Lighthouse, specialized page smokes, Firefox/WebKit, generated search, RU/EN, privacy, Yandex consent, metadata/OpenGraph, Engineering Map, visual regression, custom-domain artifact.

- [ ] **Step 3: Review all security threads**

No open CodeQL/review threads at merge time.

- [ ] **Step 4: Review generated route evidence**

Confirm representative URLs:

```text
https://trueruslan.ru/resume/
https://trueruslan.ru/projects/notchhub/
https://trueruslan.ru/notes/
https://trueruslan.ru/about/
```

and legacy aliases point to them.

---

### Task 6: Merge, exact-production acceptance, durable state

**Files:**
- Create acceptance ledger under `docs/acceptance/` after production succeeds.
- Update `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` with exact evidence.
- Add a durable regression test for accepted public route/link policy.

- [ ] **Step 1: Squash merge only after exact-head gates are green**

- [ ] **Step 2: Verify Pages deployment uses the squash SHA**

- [ ] **Step 3: Require Production Live Smoke success on the same SHA**

- [ ] **Step 4: Record deployment ID, production artifact/digest and observedAt**

- [ ] **Step 5: Merge docs-only acceptance ledger**

- [ ] **Step 6: Rebase/recreate C2 Homepage branch from the accepted master and continue C2 TDD**
