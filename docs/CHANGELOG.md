# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4A Deployment Verification Note и verifier closure PR #126.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

---

# 2026-08-05

## Portfolio 1.0 P3.4A — Deployment Verification Note — DONE

### PR #125 — publish grounded Engineering Note

Goal:

Publish a bounded Note explaining why successful deployment does not by itself prove production verification, using accepted TrueRuslan Landing evidence rather than abstract claims.

Canonical route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Delivered:

- separated repository readiness, generated artifact, exact GitHub Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation;
- grounded the narrative in the accepted P3.2 PR #119/#120 verifier incident and P3.3 exact evidence;
- explicitly separated **Проверенный факт**, **Инженерный вывод** and **Ограничение**;
- linked the platform case study and related Notes;
- added deterministic Notes Registry metadata;
- integrated Notes index, toc, page metadata, clean route, Atom feed and generated search;
- preserved semantic/no-JavaScript content;
- added fail-closed unit contracts;
- added deployment-only P3.4A route/content/feed/search verification.

TDD RED:

```text
head:                           688b98a58937dbf9b5c9f45667d4cfdef1327294
Build:                          #909 / 31013712895 — expected FAILURE
existing/new contracts:         377 PASS / 3 expected FAIL
failure scope:                  registry, Markdown and index/toc/page-meta integration
```

Exact-head feature evidence:

```text
head:                           9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
squash:                         c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
CodeQL:                         #400 / 31014793568 — SUCCESS
Dependency Review:              #350 — SUCCESS
PR-safe Production Live Smoke:  #106 — SUCCESS
unit tests:                     381 PASS / 0 FAIL
build/site integrity:           PASS
mobile overflow:                PASS
browser/Axe/Lighthouse:         PASS
Firefox/WebKit:                 PASS
generated search/Atom:          PASS
RU/EN/analytics/metadata:       PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
review threads:                 0 open
```

### First exact deployment — NOT ACCEPTED

GitHub Pages published the exact feature SHA and baseline/platform smokes passed. The workflow then failed before the new Note smoke because the existing flagship verifier still copied historical VillAIgence candidate `0.1.23+1.21.1`.

```text
accepted deployed SHA:          c4f3cb5a3aa71b958d906d15eb975833b46d3571
Pages deployment ID:            5763499690
Production Live Smoke:          #108 / 31015504931 — FAILURE
classification:                 verifier defect
production artifact:            8934310334
production digest:              sha256:42d038cd35f0281d9c69c472b6111aab06a62bc98c88b7876fafcf7601979d13
```

The failure was not rerun away. Production acceptance remained open.

### PR #126 — align flagship production smoke with current evidence

Root cause:

`production-flagship-normalization-smoke.cjs` duplicated volatile external-project evidence as hard-coded strings rather than reading the canonical Project Evidence registry.

Delivered:

- loads `data/project-evidence.json`;
- derives VillAIgence `Current published candidate` through a fail-closed lookup;
- removes the stale hard-coded `0.1.23+1.21.1` expectation;
- requires current VillAIgence PR #108 and pending PR #110 evidence;
- requires Vlezet M7.8B/M7.8C, PR #44, PR #45 and product-owner retest boundaries;
- records the resolved candidate in production evidence;
- adds regression contracts preventing copied release drift.

TDD RED:

```text
head:                           43ccee7b09220000660e425ea32cc87938a7b653
Build:                          #924 / 31015797096 — expected FAILURE
existing/new contracts:         381 PASS / 2 expected FAIL
failure scope:                  stale candidate and missing current markers
```

Exact-head hotfix evidence:

```text
head:                           50a7185d799eea96adb7dcea8cd20e9e9a400784
squash:                         0a1cd6ad40870366fecfdce3bbdae7e8722b2119
Build:                          #927 / 31016127657 — SUCCESS
CodeQL:                         #406 / 31016129663 — SUCCESS
Dependency Review:              #355 — SUCCESS
PR-safe Production Live Smoke:  #112 — SUCCESS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
quality artifact:               8934699715
quality digest:                 sha256:607a2d901e77ebe5862fd760393f6a4435699dd69d1dc8abb910007fc0611b52
review threads:                 0 open
```

Final exact production evidence:

```text
Pages workflow:                 #156 / 31016942589 — SUCCESS
accepted deployed SHA:          0a1cd6ad40870366fecfdce3bbdae7e8722b2119
Pages deployment ID:            5763802525
Pages created:                  2026-08-05T14:46:57Z
Pages updated:                  2026-08-05T14:47:51Z
Production Live Smoke:          #114 / 31017023851 — SUCCESS
baseline smoke:                 PASS
portfolio platform smoke:       PASS
current flagship smoke:         PASS
P3.4A Note smoke:               PASS
favicon smoke:                  PASS
production artifact:            8935003712
production digest:              sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480
```

P3.4A is accepted in production only at this final exact SHA.

Next slice:

**P3.4B — Clean URLs without Cloudflare routing**.

---

## Current External Project Evidence Reconciliation — DONE

### PR #124

Reconciled current VillAIgence and Vlezet repository activity without promoting Draft work or changing lifecycle states.

Delivered:

- VillAIgence candidate `0.1.25+1.21.1` as published exact release evidence;
- bounded PR #105/#107/#108/#109 evidence;
- PR #110 only as pending Draft/RED;
- Vlezet M7.8B preserved as accepted;
- PR #42, PR #44 and PR #45 as pending Draft evidence;
- `/now`, Project Evidence, histories, RU/EN flagships and browser contracts synchronized.

```text
head:                           fe82754eb6f181e9c81840e7710553bf8341a3d9
squash:                         adad07f39130c724541163022be0b085323ce1b3
Build:                          #908 / 31011725079 — SUCCESS
Content Freshness PR evidence:  0 findings
```

Issue #78 still requires a default-branch owner refresh; its older generated body is not canonical project truth.

---

## Portfolio 1.0 P3.3 — Flagship Normalization — DONE

### PR #122

Delivered:

- normalized RU VillAIgence, RU Vlezet and controlled EN VillAIgence;
- canonical status rendering;
- bounded pending evidence in JS/no-JS modes;
- browser, cross-browser and deployment-only production checks;
- unchanged lifecycle and external acceptance boundaries.

```text
TDD RED head:                  f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
exact head:                     ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
squash:                         c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

---

## Portfolio 1.0 P3.2 — TrueRuslan Landing Flagship — DONE

### PR #119

Added dedicated clean RU/EN platform case studies, canonical Project History/Evidence, homepage and Projects integration, metadata, hreflang, Sitemap, search and deployment-only platform verification.

```text
head:                           6736c9fd917f213621e5e88273304dda8ddda760
squash:                         d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
```

### PR #120

Replaced broad `locator('main')` with `main.dc-doc-page__content` and closed production verification.

```text
head:                           c2fa3327061148b5e4adf703bd707d6925639df3
squash:                         dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
Pages deployment ID:            5760275658
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

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

---

## Repository-native Clean URLs — DONE

### PR #114

Moved public identity to repository-native directory routes without Cloudflare application routing.

```text
squash:                         cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
```

### PR #115

Separated canonical clean-route production verification from legacy `.html` compatibility.

```text
squash:                         4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
```

Legacy `.html` remains only as `noindex,follow` compatibility preserving query and fragment.

---

# Earlier accepted milestones

- Portfolio 1.0 durable planning — PR #116.
- Yandex favicon contract — PR #112.
- Resume/PDF baseline — PRs #108/#110.
- Vlezet Draft reconciliation — PR #106.
- Distribution and external profiles — PRs #98/#102/#104.
- Production Live Smoke — PR #96.
- Dependency remediation and audit evidence — PRs #93/#94.
- Content Freshness closure — PR #91.
- Engineering Notes — PRs #85/#87/#89.
- Product Evidence Reconciliation — PR #83.
- `/now` — PR #65.
- VillAIgence flagship — PR #63.
- Publications — PR #61.
- Vlezet flagship — PR #59.
- Custom domain and stabilization — PRs #45–#58.
- Minimal RU/EN — PR #38.
- Evidence/case-study foundations — PRs #20–#36.
- Photo Stories — PRs #15/#17.

---

# Open operational boundaries

## Issue #78 — Content Freshness owner refresh

PR #124 exact-head evidence reported 0 findings. The issue still contains an older generated report until a default-branch owner run refreshes and closes it.

## Issue #111 — Yandex Webmaster observation

Repository favicon, Sitemap, HTTPS and clean URL contracts are complete. Remaining work is authenticated operator state and delayed crawler refresh.

## Issue #82 — upstream Diplodoc compatibility

```text
0 critical
0 high
6 moderate
```

All records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Review on or after **2026-08-17**. Do not use `npm audit fix --force`, local shims or an unreviewed fork.
