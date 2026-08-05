# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4A Deployment Verification Note и verifier closure PR #126.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- repository-native directory URLs;
- legacy `.html` only as compatibility entrypoints;
- no automatic public truth, profile or search-engine mutation;
- bounded Evidence semantics;
- Draft evidence не является accepted evidence;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking without explicit privacy review;
- repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance как разные факты;
- exact artifact и installed acceptance остаются отдельными release gates;
- volatile external evidence derives from canonical registries rather than copied verifier literals;
- no quality-gate weakening.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Completed milestones

- Photo Stories — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes foundation — PR #25.
- Content Freshness Guard — PR #27.
- Browser Quality Harness — PR #29.
- Flagship Case-Study Format — PR #34.
- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45.
- Canonical/header/search/Photo stabilization — PRs #48–#58.
- Vlezet flagship — PR #59.
- Publications — PR #61.
- VillAIgence flagship — PR #63.
- `/now` — PR #65.
- Product Evidence Reconciliation — PR #83.
- Engineering Notes milestones — PRs #85/#87/#89.
- Content Freshness closure — PR #91.
- Dependency audit/remediation — PRs #93/#94.
- Production Live Smoke — PR #96.
- Deployment-driven live trigger — PRs #99/#100.
- Distribution and external profiles — PRs #98/#102/#104.
- Vlezet Draft reconciliation — PR #106.
- Resume/PDF baseline — PRs #108/#110.
- Yandex favicon contract — PR #112.
- Repository-native clean URLs — PR #114.
- Canonical/legacy production verification — PR #115.
- Durable Portfolio 1.0 specification — PR #116.
- P3.1 Homepage evidence paths — PR #117.
- P3.1 durable closure — PR #118.
- P3.2 TrueRuslan Landing flagship — PR #119.
- P3.2 production-selector hotfix — PR #120.
- P3.2 durable closure — PR #121.
- P3.3 VillAIgence/Vlezet flagship normalization — PR #122.
- P3.3 durable closure — PR #123.
- Current external-project evidence reconciliation — PR #124.
- P3.4A Deployment Verification Note — PR #125.
- Current flagship production verifier closure — PR #126.

---

# Portfolio 1.0 — IN PROGRESS

## P3.1 — Homepage evidence paths — DONE

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

Accepted outcome: explicit Resume/Projects/Materials paths, bounded registry evidence, public-only flagship set, `/now` context and bounded RU/EN hierarchy.

## P3.2 — TrueRuslan Landing flagship — DONE

```text
PR #119 head:                  6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
PR #120 head:                  c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
Pages deployment ID:            5760275658 — SUCCESS
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Accepted outcome: dedicated RU/EN platform case study, canonical Project History/Evidence, search/Sitemap/metadata integration and scoped deployment verification through `main.dc-doc-page__content`.

## P3.3 — Flagship normalization — DONE

Normalized production routes:

```text
/landing/projects/livingworld/
/landing/projects/vlezet/
/en/projects/livingworld/
```

```text
PR #122 RED head:              f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
PR #122 exact head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
PR #122 squash:                c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Accepted outcome: RU VillAIgence, RU Vlezet and controlled EN VillAIgence use one evidence-first order with canonical status, pending evidence, cross-browser and exact-deployment verification.

Preserved external boundaries after PR #124:

- Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted; M7.8C PR #42 and stacked PR #44/#45 remain Draft/pending owner gates.
- VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`; candidate `0.1.25+1.21.1`, PR #103/#104/#108 automation and PR #110 Draft remain separate from cumulative real-provider/gameplay/manual acceptance.

## P3.4 — Grounded Engineering Notes — IN PROGRESS

### P3.4A — Deployment success is not production verification — DONE

Canonical route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Delivered by PR #125:

- grounded RU Note from accepted P3.2/P3.3 evidence;
- explicit repository readiness → generated artifact → GitHub Pages deployment → Production Live Smoke → bounded acceptance → search-engine observation chain;
- separate verified fact, inference and limitation;
- Notes Registry, Notes index, toc, page metadata, clean route, Atom feed and generated search integration;
- semantic/no-JS content;
- deployment-only P3.4A route/content/feed/search smoke.

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
RED Build:                      #909 / 31013712895 — expected FAILURE
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
```

The first exact deployment was not accepted:

```text
Production Live Smoke #108:    FAILURE
classification:                 verifier defect
cause:                          stale hard-coded VillAIgence 0.1.23 evidence
```

PR #126 corrected the verifier by deriving volatile evidence from `data/project-evidence.json`.

```text
PR #126 RED head:              43ccee7b09220000660e425ea32cc87938a7b653
PR #126 exact head:            50a7185d799eea96adb7dcea8cd20e9e9a400784
PR #126 squash:                0a1cd6ad40870366fecfdce3bbdae7e8722b2119
Build:                          #927 / 31016127657 — SUCCESS
quality artifact:               8934699715
quality digest:                 sha256:607a2d901e77ebe5862fd760393f6a4435699dd69d1dc8abb910007fc0611b52
Pages:                          #156 / 31016942589 — SUCCESS
Pages deployment ID:            5763802525
Production Live Smoke:          #114 / 31017023851 — SUCCESS
baseline/platform/current-flagship/P3.4A/favicon smokes: PASS
production artifact:            8935003712
production digest:              sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480
```

Accepted outcome: P3.4A is published and verified at the exact deployed SHA. The incident itself proves the Note's core claim: deployment success did not substitute for production verification.

### P3.4B — Clean URLs without Cloudflare routing — NEXT

Publish a grounded Note from PR #114/#115 evidence.

Required scope:

1. initial `.html` public identity and why it became undesirable;
2. repository-native directory output and Diplodoc depth/base constraints;
3. canonical, hreflang, OpenGraph, Sitemap, Atom and generated-search migration as one contract;
4. Cloudflare retained for DNS/CDN/analytics, not required as application router;
5. GitHub Pages inability to emit repository-configured HTTP 301 redirects;
6. static legacy `.html` compatibility preserving query/fragment with `noindex,follow`;
7. exact deployment/browser verification versus delayed search-engine observation;
8. limitations and exit criterion for eventual legacy cleanup.

Acceptance criteria:

- facts derived from accepted PR #114/#115 and production evidence;
- verified fact, inference and limitation clearly separated;
- platform case study and relevant Notes linked;
- deterministic Notes Registry, clean route, Sitemap/search/Atom participation;
- semantic content without JavaScript;
- exact-head and deployment-only production verification;
- no claim that Google/Yandex replacement is complete before observed evidence.

### Later P3.4 candidates

- Hybrid CV + AI recognition boundaries.
- GameTests versus installed gameplay acceptance.
- Passive PDF validation versus semantics.
- Evidence-driven project state.

## P3.5 — Selective English expansion

Translate only high-value surfaces: homepage, Resume, three flagships, `/now`, selected Notes and Publications. Do not create a separate English CMS, build or search architecture.

## P3.6 — Measurement checkpoint

After 3–4 weeks of meaningful aggregate traffic:

- compare Cloudflare aggregate traffic;
- inspect Google/Yandex indexing of clean routes;
- verify old `.html` identities are declining;
- identify high-value entry pages and search themes;
- make no engagement claim without sufficient data.

---

# Search-engine operations

Repository work is complete. Issue #111 remains only for authenticated Yandex Webmaster actions and crawler observation:

1. confirm/resubmit Sitemap;
2. verify HTTP→HTTPS/main mirror;
3. select “No region”;
4. request recrawl for representative clean routes;
5. recheck diagnostics and indexed URLs after 10–14 days.

Do not add repository code solely to clear a stale cached diagnostic.

---

# Operational checkpoints

## Content Freshness owner state

PR #124 reported 0 findings at exact head, but generated issue #78 remains open with an older report until a default-branch owner run refreshes it. Do not manually reinterpret the stale issue body as current project truth.

## Dependency blocker

Review issue #82 on or after **2026-08-17**. Accept an update only when upstream Diplodoc supports a secure markdown-it line and the complete exact-head matrix passes.

Do not use `npm audit fix --force`, local shims or an unreviewed fork.

## Conditional work

- Photo Stories: authentic material and chronology only.
- Share UI: only for a concrete user-facing sharing need.
- Analytics decisions: only after enough aggregate traffic exists.

---

# Not priority

Without a reproduced product need, do not plan:

- migration from GitHub Pages;
- paid hosting merely for the custom domain;
- separate EN CMS/build;
- second full-text search;
- runtime publication APIs;
- behavioural analytics/session replay;
- accounts/comments/likes;
- backend/database for static content;
- automatic public/profile/search-engine mutation;
- Yandex Metrica without privacy review;
- Yandex Business without a real service requirement;
- decorative version bumps;
- removal of legacy `.html` compatibility before search-engine migration is observed.

## New-session rule

Open durable state and Portfolio 1.0 specification. Check actual PRs, commits, exact-head CI, Pages and Production Live Smoke. Confirm PR #125 delivered P3.4A, Production Live Smoke #108 exposed a stale verifier rather than being ignored, PR #126 derived current flagship evidence from the canonical registry, and final Pages #156 / Production Live Smoke #114 accepted exact SHA `0a1cd6ad40870366fecfdce3bbdae7e8722b2119`. Preserve issue #111, issue #82 and issue #78 owner-refresh boundaries. Continue with **P3.4B — Clean URLs without Cloudflare routing**.
