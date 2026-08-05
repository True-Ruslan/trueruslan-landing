# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.4B ACCEPTED IN PRODUCTION**
>
> Date: **2026-08-05**
>
> Product: `True-Ruslan/trueruslan-landing`

## Goal

Turn the production-stable portfolio and knowledge platform into a clear professional entry point where a reader can understand:

1. what Ruslan builds;
2. what engineering problems he solves;
3. how decisions were made;
4. what evidence supports each claim;
5. where to continue reading.

The milestone must increase clarity and evidence density without introducing a backend, CMS, second search engine, behavioural tracking or automatic public-state mutation.

## Audience

Primary:

- technical leads and engineering managers;
- backend engineers and architects;
- recruiters evaluating engineering depth;
- potential collaborators.

Secondary:

- readers of Engineering Notes and external publications;
- users following Vlezet and VillAIgence progress.

---

## Accepted production slices

### P3.1 — Homepage evidence paths — DONE

Delivered by PR #117:

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

Accepted: explicit Resume, Projects and Materials paths; bounded registry evidence; public-only flagships; `/now`; static semantic HTML; bounded RU/EN hierarchy.

### P3.2 — TrueRuslan Landing flagship — DONE

Routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

```text
PR #119 head:                  6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
PR #120 head:                  c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
Pages deployment ID:            5760275658
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Accepted: RU/EN platform case study, canonical Project History/Evidence, search/Sitemap/metadata integration, PR-safe baseline smoke and deployment selector `main.dc-doc-page__content`.

### P3.3 — Flagship normalization — DONE

Routes:

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

Accepted: three public flagships follow one evidence-first order. Vlezet M7.8B remains accepted while M7.8C and PR #42/#44/#45 remain Draft/pending owner gates. VillAIgence PR #103/#104/#108 bounded automation remains separate from PR #110 Draft and cumulative installed acceptance.

### P3.4A — Deployment success is not production verification — DONE

Route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Delivered by PR #125 with deterministic Notes Registry, index, toc, metadata, clean route, Atom feed, generated search and deployment-only Note smoke.

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
Production Live Smoke #108:    FAILURE — verifier defect
```

PR #126 corrected stale hard-coded flagship evidence through canonical `data/project-evidence.json`.

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
production artifact:            8935003712
production digest:              sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480
```

Accepted: repository readiness, generated artifact, exact Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation remain distinct.

### P3.4B — Clean URLs without Cloudflare routing — DONE

Route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

Delivered by PR #128:

- grounded Note from accepted PR #114/#115 evidence;
- repository-native directory URLs;
- Diplodoc `<base href>`, `router.pathname` and `router.depth` migration;
- canonical, hreflang, OpenGraph, Sitemap, Atom feed and rendered generated-search links as one public identity contract;
- Cloudflare kept as DNS/CDN/analytics infrastructure, not application router;
- GitHub Pages inability to express repository-configured HTTP 301 redirects;
- legacy `.html` `noindex,follow` compatibility preserving query and fragment;
- exact deployment/browser verification separated from delayed search-engine observation;
- deterministic registry, metadata, feed, search and deployment-only production smoke.

```text
PR #128 RED head:              4d14dd6842423a17f12d8cb2734df36cdb162b41
RED Build:                      #934 / 31020006933 — expected FAILURE
PR #128 exact head:            dd1911ebbc5faf66a56144c75dd45215b4042293
PR #128 squash:                4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb
Build:                          #945 / 31021101326 — SUCCESS
quality artifact:               8936766318
quality digest:                 sha256:38d1a612b9e684a2faccf71f889217933b115434391a5e60a5baff49b746178d
Pages deployment ID:            5764711503
Production Live Smoke:          #123 / 31021657939 — SUCCESS
production artifact:            8936914548
production digest:              sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51
```

Accepted: the routing contract is fully reproducible from the repository. Legacy compatibility is retained until index migration is observed; no Google/Yandex completion claim is made.

---

## Product experience contract

### Homepage hierarchy — ACCEPTED

1. identity and specialization;
2. Resume, Projects and Materials primary paths;
3. bounded evidence strip;
4. VillAIgence, Vlezet and TrueRuslan Landing flagships;
5. current `/now` context;
6. Publications and secondary platform surfaces.

### Flagship case-study contract — ACCEPTED

Each public flagship separates problem, constraints, lifecycle, architecture, alternatives, capabilities, evidence, limitations, next milestone, related material and retrospective.

### Grounded Engineering Note contract — ACCEPTED FOR P3.4A/P3.4B

Each Note must:

1. begin from accepted project evidence;
2. distinguish verified fact, inference and limitation;
3. link relevant case studies and evidence;
4. avoid invented metrics and broadened acceptance claims;
5. register deterministic metadata and relationships;
6. participate in clean routes, generated search and Atom feed;
7. remain useful without JavaScript;
8. pass exact-head, exact-deployment and feature-specific production verification.

### UX states

- **Happy:** semantic content, status, evidence and related links are present.
- **Empty:** optional groups are omitted; fake placeholders are prohibited.
- **Loading/pending:** only progressive enhancements load; core content remains generated HTML.
- **Error/failure:** missing canonical data or ordered markers fail the build.
- **Edge/constraint:** Draft evidence, repository readiness, deployment, external acceptance and search-engine observation remain distinct.

## Technical direction

- static-first build-time generation and progressive enhancement;
- one canonical data source per content type;
- Diplodoc as the only site-wide full-text search owner;
- canonical directory routes and legacy `.html` only as compatibility entrypoints;
- no public canonical/Sitemap/feed URL contains `.html`;
- one RU/EN build and search architecture;
- PR-safe baseline smoke separated from deployment-only feature verification;
- volatile verifier evidence derived from canonical registries;
- no runtime API, database, account system or duplicate index.

---

## Remaining scope

### P3.4C — Hybrid CV + AI recognition boundaries — NEXT

Publish a grounded Note from accepted Vlezet evidence.

The Note must explain:

- deterministic geometry as authoritative product state;
- local CV and LLM output as proposals rather than direct mutations;
- immutable candidate identity and source references;
- deterministic validation and current-state revalidation;
- explicit Apply as the only mutation boundary;
- rejection/fallback for malformed, unknown or stale proposals;
- M7.8B accepted versus M7.8C Draft and representative real-plan owner retest;
- benchmark, browser and green CI evidence versus product acceptance;
- PR #42/#44/#45 remain Draft and must not be promoted.

Continue with **P3.4C — Hybrid CV + AI recognition boundaries**.

### Later P3.4 candidates

- GameTests versus installed gameplay acceptance.
- Passive PDF validation versus semantic extraction.
- Evidence-driven project state.

### P3.5 — Selective English expansion

Translate only high-value surfaces. Do not create a separate English CMS, build or search architecture.

### P3.6 — Measurement checkpoint

After 3–4 weeks of meaningful aggregate traffic, inspect aggregate traffic and clean-route indexing without unsupported engagement claims.

## Non-goals

- backend or runtime CMS;
- comments, likes or accounts;
- second search engine;
- session replay or behavioural analytics;
- automatic profile, search-console or public-status mutation;
- fabricated metrics, leadership claims or testimonials;
- migration from GitHub Pages without a reproduced platform blocker;
- removal of legacy compatibility before observed search-engine migration.

## Acceptance criteria

- [x] homepage evidence paths accepted;
- [x] TrueRuslan Landing RU/EN flagship accepted;
- [x] VillAIgence/Vlezet normalization accepted;
- [x] P3.4A deployment-verification Note accepted on exact production;
- [x] P3.4B clean-URL Note accepted on exact production;
- [x] canonical, Sitemap, feed and search identities use clean routes;
- [x] exact-head browser/accessibility/cross-browser/metadata/visual/custom-domain gates pass;
- [x] exact deployment baseline/platform/flagship/P3.4A/P3.4B/favicon smokes pass;
- [ ] P3.4C Hybrid CV + AI recognition boundaries is published from accepted evidence.
