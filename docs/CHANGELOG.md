# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.1 Homepage evidence paths.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

---

# 2026-08-05

## Portfolio 1.0 P3.1 — Homepage Evidence Paths — DONE

### PR #117 — add homepage evidence paths

Goal:

Turn the standalone homepage into a clear evidence-first professional entry point without introducing a backend, duplicate search, behavioural analytics or a second project/evidence source.

Delivered:

- replaced duplicated hero social links and generic skill badges with three explicit one-action paths:
  - Resume;
  - Projects;
  - Engineering Notes / Publications;
- added three bounded evidence cards from `data/projects.json` and `data/project-evidence.json`;
- established a stable public flagship set:
  - VillAIgence;
  - Vlezet;
  - Engineering Portfolio Platform;
- excluded private NODE ZERO fail-closed;
- preserved VillAIgence automated/manual acceptance separation;
- preserved Vlezet M7.8B accepted and M7.8C pending separation;
- added direct current `/now` context;
- reduced duplicate secondary homepage navigation;
- implemented the same bounded hierarchy for RU and EN;
- kept static semantic HTML and progressive enhancement;
- preserved clean URL post-processing and Diplodoc as the only site-wide search owner;
- added focused renderer, production-template and privacy-boundary tests;
- manually reviewed desktop/mobile screenshots after accessibility and overflow checks;
- updated only the intentionally changed homepage visual baselines.

TDD RED:

```text
head:                           2aa66e614fd2422aff3ef52f6c8a2453f9e0ee2a
Build:                          #827 / 30987736270 — expected FAILURE
existing tests:                 353 PASS
failure scope:                  missing homepage evidence renderer exports
```

An intermediate run found two stale tests that still encoded the removed hero social block and the former Publications position. The implementation remained unchanged; the tests were corrected to the approved composition.

Final exact-head evidence:

```text
head:                           67d3f6593c45d1239630f71be6a3cb15a33f4519
squash:                         fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
CodeQL:                         #306 / 30989449931 — SUCCESS
Dependency Review:              #264 / 30989449930 — SUCCESS
unit tests:                     360 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/VillAIgence search:      PASS
RU/EN/analytics/metadata:       PASS
Engineering Map:                PASS
visual regression:              PASS
custom-domain artifact:         PASS
review threads:                 0 open
quality artifact:               8923559602
quality digest:                 sha256:429dadb1b84c59e73e9a977e296422084e754f235eaeb538b866d749ea43c64e
```

Exact production evidence:

```text
Pages workflow:                 #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
deployed SHA:                   fe1a796df37313401c07e25c0672dc32db30a1c4
```

The deployed homepage, clean routes, generated search, Atom feed, favicon, canonical metadata and browser/request-error boundaries passed.

Next slice:

**P3.2 — TrueRuslan Landing flagship case study**.

---

## Durable Clean URL State and Portfolio 1.0 Planning — DONE

### PR #116

Synchronized `PROJECT_STATE`, `ROADMAP` and `CHANGELOG` after PR #114/#115, added the Portfolio 1.0 specification and selected P3.1 as the first implementation slice.

```text
squash:                         a58e421cbe455ce1ad2e6e38ff65ea78e1ec4fa8
Build:                          #826 — SUCCESS
```

---

## Repository-native Clean URLs — DONE

### PR #114

Moved public content from `*.html` identities to repository-native directory routes without Cloudflare Rewrite Rules or Workers.

Delivered:

- directory `index.html` output;
- clean internal links;
- clean canonical/hreflang/OpenGraph/Sitemap/Atom identities;
- stable internal search IDs with clean rendered result links;
- GitHub Pages subpath and custom-domain base support;
- static legacy `.html` compatibility with `noindex,follow` and query/fragment preservation;
- full browser, search, RU/EN and production-quality contract.

```text
head:                           8702afe63ad3dca3ad0c17da47409c1660e126ef
squash:                         cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
CodeQL:                         SUCCESS
Dependency Review:              SUCCESS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
```

Public examples:

```text
/landing/resume/
/landing/projects/
/landing/notes/
/en/
/_search/ru/
```

GitHub Pages cannot emit repository-configured HTTP 301 responses. Legacy `.html` remains only as the accepted static compatibility boundary.

---

## Clean-route Production Live Smoke Alignment — DONE

### PR #115

Fixed an obsolete production assertion that expected a legacy `.html` path after the browser correctly resolved to the canonical directory route.

```text
squash:                         4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Build:                          #825 — SUCCESS
Production Live Smoke #52:      SUCCESS
CodeQL:                         SUCCESS
Dependency Review:              SUCCESS
```

Canonical clean routes and legacy compatibility are now verified separately.

---

## Yandex Webmaster Favicon Reconciliation — DONE IN REPOSITORY

### PR #112

Established root `/favicon.svg`, deterministic generated links and deployed browser verification.

```text
squash:                         18358a4939dc4062669dbcb45850e9beb26e1cac
Build:                          #778 — SUCCESS
Pages:                          #142 — SUCCESS
Production Live Smoke:          #45 — SUCCESS
```

Issue #111 remains open only for authenticated Yandex Webmaster actions and crawler refresh.

---

# 2026-08-04

## User-managed PDF and Resume Timeline Alignment — DONE

### PR #110

Published the current `cv.pdf`, aligned the Resume timeline and replaced generator-specific PDF assumptions with passive structural validation.

```text
squash:                         4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                          #765 — SUCCESS
Pages:                          #141 — SUCCESS
Production Live Smoke:          #37 — SUCCESS
```

## August 2026 Resume Refresh — DONE

### PR #108

Established the accepted professional-profile baseline across RU/EN Resume, About, homepage and metadata without invented metrics or proprietary claims.

## Vlezet Draft Freshness Reconciliation — DONE

### PR #106

Recorded M7.8C only as pending Draft evidence while preserving M7.8B as accepted. No public lifecycle promotion was made.

## External Profile Verification — DONE

### PR #104

```text
GitHub:                         verified
Habr:                           verified
Telegram personal:              verified
Telegram Blog:                  verified
summary:                        4 verified / 0 stale / 0 unverified
```

## VillAIgence automation evidence preserved

```text
M11 Phase A:                   PR #103 — 28 scenarios + 7 GameTests
M11 Phase B:                   PR #104 — exact production-JAR startup/restart
```

These do not replace cumulative real-provider, gameplay and manual acceptance.

---

# Earlier accepted milestones

- Distribution Contract & Profile Audit — PR #98.
- Production Live Smoke — PR #96.
- Dependency remediation and audit evidence — PRs #93/#94.
- Content Freshness closure — PR #91.
- Engineering Notes — PRs #85/#87/#89.
- Product Evidence Reconciliation — PR #83.
- `/now` — PR #65.
- VillAIgence flagship — PR #63.
- Publications — PR #61.
- Vlezet flagship — PR #59.
- Domain/header/search stabilization — PRs #45–#58.
- Minimal RU/EN — PR #38.
- Evidence/case-study foundations — PRs #20–#36.
- Photo Stories — PRs #15/#17.

---

# Open operational boundaries

## Issue #111 — Yandex Webmaster observation

Repository favicon, Sitemap, HTTPS and clean URL contracts are complete. Remaining work is authenticated operator state and delayed crawler refresh.

## Issue #82 — upstream Diplodoc compatibility

```text
0 critical
0 high
6 moderate
```

All records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Review on or after **2026-08-17**. Do not use `npm audit fix --force`, local shims or an unreviewed fork.
