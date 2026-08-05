# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.3 Flagship normalization.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

---

# 2026-08-05

## Portfolio 1.0 P3.3 — Flagship Normalization — DONE

### PR #122 — normalize VillAIgence and Vlezet flagships

Goal:

Bring RU VillAIgence, RU Vlezet and the controlled EN VillAIgence layer to the evidence-first flagship order established by TrueRuslan Landing, without changing routes, lifecycle states or accepted external-project boundaries.

Delivered:

- normalized all three pages to:
  - problem and user;
  - constraints and risks;
  - current lifecycle and accepted boundary;
  - architecture and source of truth;
  - alternatives considered and rejected;
  - implemented capabilities and failure lessons;
  - evidence;
  - limitations;
  - next accepted milestone;
  - related material and retrospective;
- preserved canonical routes, slugs, diagrams and repository identities;
- kept the EN VillAIgence layer on shared RU canonical evidence rather than creating a second registry;
- refreshed Vlezet PR #42 as bounded green Draft automation plus mandatory real-plan owner retest;
- recorded VillAIgence PR #110 only as Draft/RED development evidence;
- made existing canonical project pages automatic Project Registry status targets;
- strengthened Project Evidence rendering for pending states in JavaScript and no-JavaScript modes;
- added dedicated browser checks for ordered headings, status, evidence, timeline and related links;
- added a deployment-only production smoke for RU VillAIgence, RU Vlezet and EN VillAIgence;
- preserved PR-safe baseline production verification;
- manually reviewed generated desktop pages;
- changed no visual baseline and no test tolerance.

TDD RED:

```text
head:                           f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
Build:                          #871 — expected FAILURE
existing contracts:             368 PASS
new failing contracts:          6
failure scope:                  marker order, canonical statuses and bounded Draft evidence
```

Exact-head feature evidence:

```text
head:                           ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
squash:                         c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
CodeQL:                         #368 — SUCCESS
Dependency Review:              #321 — SUCCESS
Content Freshness:              #67 — SUCCESS
PR-safe Production Live Smoke:  #93 — SUCCESS
unit tests:                     376 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Project Evidence JS/no-JS:      PASS
P3.3 normalized page smoke:     PASS
Firefox/WebKit:                 PASS
search/RU-EN/analytics:         PASS
metadata/Engineering Map:       PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
review threads:                 0 open
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
```

Exact production evidence:

```text
Pages workflow:                 #152 / 31006504250 — SUCCESS
accepted deployed SHA:          c90a221a21f51e897661667f981483bad922ad0d
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
baseline smoke:                 PASS
portfolio platform smoke:       PASS
flagship normalization smoke:   PASS
favicon smoke:                  PASS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Acceptance boundaries remained unchanged:

- Vlezet — `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted; M7.8C Draft pending representative real-plan owner retest.
- VillAIgence — `release-candidate` / `ACCEPTANCE IN PROGRESS`; PR #103 and PR #104 automated evidence remains bounded; PR #110 remains Draft/RED; cumulative manual acceptance pending.

Next slice:

**P3.4A — Deployment success is not production verification**.

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

## Issue #111 — Yandex Webmaster observation

Repository favicon, Sitemap, HTTPS and clean URL contracts are complete. Remaining work is authenticated operator state and delayed crawler refresh.

## Issue #82 — upstream Diplodoc compatibility

```text
0 critical
0 high
6 moderate
```

All records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Review on or after **2026-08-17**. Do not use `npm audit fix --force`, local shims or an unreviewed fork.
