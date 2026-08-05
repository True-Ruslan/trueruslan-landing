# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.2 TrueRuslan Landing flagship и verifier hotfix PR #120.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

---

# 2026-08-05

## Portfolio 1.0 P3.2 — TrueRuslan Landing Flagship — DONE

### PR #119 — add TrueRuslan Landing flagship case study

Goal:

Give the portfolio platform a dedicated evidence-first RU/EN destination instead of linking its homepage flagship only to the generic Projects hub.

Delivered:

- dedicated clean routes:
  - `/landing/projects/portfolio-platform/`;
  - `/en/projects/portfolio-platform/`;
- complete problem → constraints → current boundary → architecture → rejected alternatives → evidence → limitations → next → related-content order;
- canonical Project History and Project Evidence;
- homepage, RU/EN Projects hubs and toc links;
- metadata, OpenGraph, hreflang, Sitemap and generated search integration;
- controlled flagship/evidence set expanded from three to four projects;
- PR-safe baseline production smoke separated from deployment-only feature verification;
- deployment-only assertions for both pages, homepage link, evidence, timeline, search and favicon;
- exact repository Markdown-link validation;
- reviewed Projects hub desktop/mobile visual baselines.

TDD RED:

```text
initial Build:                  30993547130 — expected FAILURE
existing contracts:             360 PASS
new P3.2 contracts:             expected FAIL before implementation
```

Final exact-head feature evidence:

```text
head:                           6736c9fd917f213621e5e88273304dda8ddda760
squash:                         d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
CodeQL:                         #340 — SUCCESS
Dependency Review:              #296 — SUCCESS
Production Live Smoke #76:      SUCCESS
Content Freshness #45:          SUCCESS
Distribution Readiness #44:     SUCCESS
unit tests:                     368 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/RU-EN/analytics:         PASS
metadata/Engineering Map:       PASS
visual regression:              PASS
custom-domain artifact:         PASS
review threads:                 0 open
quality artifact:               8927189167
quality digest:                 sha256:9bd264d534ba31f51669d6701319cb2b4671574e329d7e36f9047bb48affc997
```

The first deployment-only platform smoke reached the published case study but failed because broad `locator('main')` matched two valid Diplodoc main elements. Baseline production smoke had already passed; this was a verifier defect, not a site defect.

### PR #120 — scope portfolio production smoke to document content

Delivered:

- replaced broad `locator('main')` with `main.dc-doc-page__content`;
- added an explicit visibility wait;
- preserved canonical, alternate, evidence, timeline, homepage and search assertions;
- added regression coverage forbidding the ambiguous selector.

Exact-head evidence:

```text
head:                           c2fa3327061148b5e4adf703bd707d6925639df3
squash:                         dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
CodeQL:                         #342 — SUCCESS
Dependency Review:              #297 — SUCCESS
PR-safe Production Live Smoke:  #79 — SUCCESS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
quality artifact:               8927499611
quality digest:                 sha256:3d2d22594d5f270edecb5e00b418efa7ca2bf6ff7ba81563804e32a3ff3168a2
review threads:                 0 open
```

Final production evidence:

```text
accepted deployed SHA:          dcb278cb4f52d5e8afc314a9f30689edb5153af0
Pages deployment ID:            5760275658 — SUCCESS
Production Live Smoke:          #80 / 30999331791 — SUCCESS
baseline smoke:                 PASS
portfolio platform RU/EN smoke: PASS
favicon smoke:                  PASS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Next slice:

**P3.3 — Flagship normalization** for VillAIgence and Vlezet without changing accepted lifecycle boundaries.

---

## Portfolio 1.0 P3.1 — Homepage Evidence Paths — DONE

### PR #117

Delivered explicit Resume, Projects and Materials paths, bounded registry-backed evidence, public-only homepage flagships, `/now` context and bounded RU/EN hierarchy.

```text
head:                           67d3f6593c45d1239630f71be6a3cb15a33f4519
squash:                         fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

### PR #118

Recorded P3.1 production acceptance and promoted P3.2.

---

## Durable Clean URL State and Portfolio 1.0 Planning — DONE

### PR #116

Synchronized state after PR #114/#115 and created the Portfolio 1.0 specification.

```text
squash:                         a58e421cbe455ce1ad2e6e38ff65ea78e1ec4fa8
Build:                          #826 — SUCCESS
```

---

## Repository-native Clean URLs — DONE

### PR #114

```text
head:                           8702afe63ad3dca3ad0c17da47409c1660e126ef
squash:                         cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
```

Delivered directory routes, clean internal/search/SEO/feed identities and static legacy `.html` compatibility preserving query and fragment. GitHub Pages cannot emit repository-configured HTTP 301 responses.

### PR #115

Aligned canonical clean-route and legacy compatibility production verification.

```text
squash:                         4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Build:                          #825 — SUCCESS
Production Live Smoke #52:      SUCCESS
```

---

## Yandex Webmaster Favicon Reconciliation — DONE IN REPOSITORY

### PR #112

Established root `/favicon.svg`, deterministic generated links and deployed browser verification. Issue #111 remains open only for authenticated Yandex Webmaster actions and crawler refresh.

---

# 2026-08-04

## Resume and PDF baseline — DONE

- PR #108 — August 2026 professional-profile refresh.
- PR #110 — current `cv.pdf`, timeline alignment and passive structural PDF validation.

```text
PR #110 squash:                4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                          #765 — SUCCESS
Pages:                          #141 — SUCCESS
Production Live Smoke:          #37 — SUCCESS
```

## Vlezet Draft freshness reconciliation — DONE

PR #106 recorded M7.8C only as pending Draft evidence while preserving M7.8B as accepted.

## External profile verification — DONE

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
- Dependency audit/remediation — PRs #93/#94.
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
