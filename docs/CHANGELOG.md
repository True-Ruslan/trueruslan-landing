# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после repository-native clean URL migration, production-smoke alignment и утверждения Portfolio 1.0.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; approved product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

---

# 2026-08-05

## Repository-native Clean URLs — DONE

### PR #114 — publish repository-native clean URLs

Goal:

Move public content from `*.html` identities to repository-native directory routes such as `/landing/resume/` without Cloudflare Rewrite Rules, Workers, runtime backend routing or a second hosting layer.

Delivered:

- kept `/` as the standalone homepage;
- generated every content page as a directory route backed by `index.html`;
- changed internal links to clean trailing-slash routes;
- changed canonical, hreflang, OpenGraph, Sitemap and Atom feed identities to clean routes;
- rejected public `.html` identities in custom-domain Sitemap and feed acceptance;
- preserved legacy `.html` as `noindex,follow` compatibility pages;
- preserved query parameters and fragments through `location.replace`;
- aligned Diplodoc router pathname, depth and base with directory routes;
- preserved next/previous navigation without changing visual baselines;
- kept internal Lunr/Diplodoc search document IDs unchanged;
- converted rendered search result links to clean URLs;
- derived GitHub Pages subpath or custom-domain base from the generated homepage canonical;
- excluded sibling projects on the same `github.io` origin from rewriting;
- converted local server, browser, search, RU/EN, analytics, metadata and production checks to canonical routes;
- kept Cloudflare out of the routing contract.

Repository-only redirect boundary:

GitHub Pages cannot emit repository-configured HTTP 301 redirects. Legacy `.html` pages therefore remain static compatibility entrypoints with canonical metadata, `noindex,follow`, meta refresh and JavaScript replacement. Canonical directory routes are served directly by GitHub Pages.

TDD RED:

```text
head:                           af4388ba3603d5f226f6a6bdf5d3301e125720ba
Build:                          #781 / 30957760533 — expected FAILURE
existing tests:                 345 PASS
new contract tests:             2 expected FAIL
failure scope:                  missing scripts/clean-urls.js
```

Final exact-head evidence:

```text
head:                           8702afe63ad3dca3ad0c17da47409c1660e126ef
squash:                         cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
CodeQL:                         #295 / 30962674018 — SUCCESS
Dependency Review:              #250 / 30962673979 — SUCCESS
Dependency Audit Evidence:      #57 / 30962673975 — SUCCESS
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/VillAIgence search:      PASS
RU/EN/analytics/metadata:       PASS
Engineering Map:                PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
review threads:                 0 open
quality artifact:               8913565133
quality digest:                 sha256:8c3124ed00bf37e1243460cd204ac840084555b101b3f12146832b40effaa7ed
```

The public site then worked through clean routes including `/landing/resume/`, `/landing/projects/`, `/landing/notes/`, `/en/` and `/_search/ru/`.

---

## Clean-route Production Live Smoke Alignment — DONE

### PR #115 — align production live smoke with clean URLs

After PR #114 deployed successfully, the post-deployment verifier still expected the old Note `.html` path. The browser correctly resolved to the clean directory route, but the outdated assertion reported that correct result as a failure.

Delivered:

- centralized production route constants;
- changed canonical Note verification to `/landing/notes/restart-persistence-is-a-product-contract/`;
- changed production search verification to `/_search/ru/`;
- retained the legacy `.html` route as an explicit compatibility test;
- verified query and fragment preservation;
- included the route module and its test in Production Live Smoke path filters;
- updated the workflow-contract test to inspect both route and runtime modules;
- changed no public content behavior.

Final evidence:

```text
head:                           d28b05afd23f05e997d28e9015f3eab4f0a3be5e
squash:                         4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Build:                          #825 / 30983923977 — SUCCESS
Production Live Smoke #52:      30983923979 — SUCCESS
CodeQL:                         #293 / 30983924043 — SUCCESS
Dependency Review:              #253 / 30983923991 — SUCCESS
review threads:                 0 open
```

Old failed smoke runs remain red as historical evidence of the obsolete assertion. They do not represent a failed Pages deployment.

---

## Durable Clean URL State and Portfolio 1.0 Planning — IN IMPLEMENTATION

The durable documentation previously still named PR #112 as the latest accepted product milestone. This change synchronizes the canonical project snapshot with PR #114/#115 and converts the approved next direction into an implementation-ready specification.

Delivered in the current change:

- updates `docs/PROJECT_STATE.md` to the clean URL product and verifier baseline;
- updates `docs/ROADMAP.md` to Portfolio 1.0;
- updates this changelog with exact PR #114/#115 evidence;
- adds `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`;
- adds a permanent regression test for clean URL durable markers and the approved milestone;
- keeps issue #111 as an external search-console observation boundary;
- keeps issue #82 as the markdown-it/Diplodoc dependency blocker;
- preserves Vlezet and VillAIgence acceptance boundaries.

Approved next implementation slice:

**P3.1 — Homepage evidence paths**.

---

## Yandex Webmaster Favicon Reconciliation — DONE

### PR #112 — publish a crawler-stable root favicon contract

Delivered:

- canonical root `/favicon.svg`;
- byte-equal SVG publication;
- absolute generated icon links;
- root/nested/search regression coverage;
- deployment-only live verification;
- issue #111 separating repository work from authenticated Yandex Webmaster state;
- no Yandex Metrica, Yandex Business or artificial regional claim.

```text
head:                           00e7823d558c7a3473ee9fcf96692d583552f578
squash:                         18358a4939dc4062669dbcb45850e9beb26e1cac
Build:                          #778 / 30953202266 — SUCCESS
source Pages:                   #142 / 30953599246 — SUCCESS
Production Live Smoke:          #45 / 30953667481 — SUCCESS
```

The deployed favicon remained HTTP 200 `image/svg+xml`, and homepage/Resume resolved `/favicon.svg` exactly.

---

# 2026-08-04

## User-managed PDF and Resume Timeline Alignment — DONE

### PR #110

Delivered:

- current user-managed `cv.pdf`;
- shared timeline axis coordinate;
- aligned markers and direct job headings;
- scoped removal of Diplodoc anchor padding;
- generator-independent passive PDF validation.

```text
squash:                         4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                          #765 / 30942487224 — SUCCESS
source Pages:                   #141 / 30950087819 — SUCCESS
Production Live Smoke:          #37 / 30950157904 — SUCCESS
```

Permanent boundary: web-CV is semantically checked; binary PDF is structurally/passively checked; compressed PDF semantics are not guessed from raw bytes.

## August 2026 Resume Refresh — DONE

### PR #108

Established the accepted professional-profile baseline across RU/EN Resume, About, homepage and metadata without invented metrics, leadership claims or proprietary details.

## Vlezet Draft Freshness Reconciliation — DONE

### PR #106

Recorded M7.8C PR #42 only as bounded pending Draft evidence while preserving M7.8B as accepted. Issue #78 closed with a clean freshness report. No public lifecycle promotion was made.

## Final External Profile Verification — DONE

### PR #104

Controlled snapshot:

```text
GitHub profile:                 verified
Habr:                           verified
Telegram personal:              verified
Telegram Blog:                  verified
summary:                        4 verified / 0 stale / 0 unverified
```

## VillAIgence accepted automation evidence preserved

Durable public-state reconciliation continues to distinguish:

```text
M11 Phase A:                   PR #103 — 28 scenarios + 7 GameTests
M11 Phase B:                   PR #104 — exact production-JAR startup/restart
```

These do not replace cumulative real-provider, gameplay and manual acceptance.

---

# Earlier accepted milestones

- Distribution Contract & Profile Audit — PR #98.
- Production Live Smoke — PR #96.
- High-severity dependency remediation — PR #94.
- Exact dependency audit evidence — PR #93.
- Content Freshness operational closure — PR #91.
- Restart and Persistence Engineering Note — PR #89.
- Deterministic Authority Engineering Note — PR #87.
- Installed Acceptance Engineering Note — PR #85.
- Product Evidence Reconciliation — PR #83.
- `/now` synchronization — PR #65.
- VillAIgence flagship — PR #63.
- Publications — PR #61.
- Vlezet flagship — PR #59.
- Canonical/domain/search stabilization — PRs #45–#58.
- Minimal RU/EN — PR #38.
- Flagship case-study and evidence foundations — PRs #20–#36.
- Photo Stories platform — PRs #15/#17.

---

# Open operational boundaries

## Issue #111 — Yandex Webmaster observation

Repository favicon, Sitemap, HTTPS and clean URL contracts are complete. Remaining work requires authenticated Webmaster actions and crawler refresh:

- confirm/resubmit Sitemap;
- verify HTTP→HTTPS/main mirror;
- set “No region”;
- request recrawl for representative clean routes;
- recheck after 10–14 days.

## Issue #82 — upstream Diplodoc compatibility

Residual dependency state remains:

```text
0 critical
0 high
6 moderate
```

All records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Review on or after **2026-08-17**. Do not use `npm audit fix --force`, local shims or an unreviewed fork.
