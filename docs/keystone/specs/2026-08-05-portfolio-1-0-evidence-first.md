# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.4A ACCEPTED IN PRODUCTION**
>
> Date: **2026-08-05**
>
> Product: `True-Ruslan/trueruslan-landing`

## Goal

Turn the production-stable portfolio and knowledge platform into a clear professional entry point where a reader can quickly understand:

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

- explicit Resume, Projects and Materials paths;
- bounded evidence from canonical Project Registry and Project Evidence;
- public homepage flagships: VillAIgence, Vlezet and Engineering Portfolio Platform;
- fail-closed exclusion of private NODE ZERO;
- current `/now` context;
- bounded RU/EN information architecture;
- static semantic HTML with progressive enhancement.

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

### P3.2 — TrueRuslan Landing flagship — DONE

Production routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

Delivered by PR #119 and verifier hotfix PR #120:

- complete RU/EN platform case study;
- canonical Project History and Project Evidence;
- homepage, Projects hubs, toc, metadata, hreflang, Sitemap, OpenGraph and generated search integration;
- PR-safe baseline smoke separated from deployment-only verification;
- scoped `main.dc-doc-page__content` production selector;
- reviewed Projects hub visual baselines.

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

### P3.3 — Flagship normalization — DONE

Production routes:

```text
/landing/projects/livingworld/
/landing/projects/vlezet/
/en/projects/livingworld/
```

Delivered by PR #122:

- RU VillAIgence, RU Vlezet and controlled EN VillAIgence follow one complete evidence-first structure;
- accepted lifecycle boundaries appear before architecture claims;
- rejected alternatives, limitations, next milestone, related material and retrospective are explicit;
- canonical routes, slugs, diagrams and repository identities are unchanged;
- Project Registry statuses automatically render on existing canonical project pages;
- Project Evidence pending states render in JavaScript and no-JavaScript modes;
- dedicated browser and deployment-only production smoke verify all normalized routes;
- no visual baseline or tolerance change was required.

```text
TDD RED head:                  f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
exact accepted head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
accepted squash:                c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Preserved current external acceptance after PR #124:

- Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted; M7.8C PR #42 and stacked PR #44/#45 remain Draft/pending representative real-plan owner gates.
- VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`; candidate `0.1.25+1.21.1`, PR #103/#104/#108 automation and PR #110 Draft remain separate from cumulative real-provider/gameplay/manual acceptance.

### P3.4A — Deployment success is not production verification — DONE

Production route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Delivered by PR #125:

- a grounded RU Engineering Note from accepted platform evidence;
- repository readiness, generated artifact, exact GitHub Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation remain distinct;
- verified fact, engineering inference and limitation are explicitly separated;
- P3.2 PR #119/#120 verifier incident and P3.3 evidence are linked rather than paraphrased into unsupported claims;
- Notes Registry, Notes index, toc, metadata, clean URL, Atom feed and generated search are deterministic;
- semantic content remains useful without JavaScript;
- a deployment-only smoke verifies route, canonical/OpenGraph, required evidence markers, Atom feed and generated search against the exact deployed SHA.

```text
TDD RED head:                  688b98a58937dbf9b5c9f45667d4cfdef1327294
RED Build:                      #909 / 31013712895 — expected FAILURE
exact accepted head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
accepted squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
```

The first deployment was intentionally not accepted:

```text
Production Live Smoke #108:    FAILURE
classification:                 verifier defect
cause:                          stale hard-coded VillAIgence release expectation
```

PR #126 corrected the deployment verifier by deriving current release evidence from canonical `data/project-evidence.json` rather than copying a volatile literal.

```text
TDD RED head:                  43ccee7b09220000660e425ea32cc87938a7b653
exact accepted head:            50a7185d799eea96adb7dcea8cd20e9e9a400784
accepted squash:                0a1cd6ad40870366fecfdce3bbdae7e8722b2119
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

The accepted outcome demonstrates the Note's own claim: a successful Pages deployment was not sufficient until the browser verifier itself was corrected and the complete exact-production chain passed.

---

## Product experience contract

### Homepage hierarchy — ACCEPTED

1. identity and specialization;
2. Resume, Projects and Materials primary paths;
3. bounded evidence strip;
4. VillAIgence, Vlezet and TrueRuslan Landing flagships;
5. current `/now` context;
6. Publications and secondary platform surfaces.

### Flagship case-study contract — ACCEPTED FOR THREE PUBLIC FLAGSHIPS

Each normalized flagship page answers, in order:

1. problem and user;
2. constraints and risks;
3. current lifecycle and accepted boundary;
4. architecture and source of truth;
5. alternatives considered and rejected;
6. implemented capabilities and failure lessons;
7. verification and evidence;
8. known limitations;
9. next accepted milestone;
10. related Notes, Publications, repository links and retrospective.

### Grounded Engineering Note contract — ACCEPTED FOR P3.4A

Each P3.4 Note must:

1. begin from accepted project evidence;
2. distinguish verified fact, inference and limitation;
3. link to the relevant case study and repository evidence;
4. avoid invented metrics or broadened acceptance claims;
5. register deterministic metadata and relationships;
6. participate in clean routes, generated search and Atom feed;
7. remain useful without JavaScript;
8. pass exact-head, exact-deployment and feature-specific production verification.

### UX states

- **Happy:** semantic content, status, evidence and related links are present.
- **Empty:** optional groups are omitted; fake placeholders are prohibited.
- **Loading/pending:** only progressive enhancements load; core content remains generated HTML.
- **Error/failure:** missing canonical data or ordered markers fail the build.
- **Edge/constraint:** Draft evidence, repository readiness, deployment, external acceptance and search-engine observation remain visibly distinct.

## Technical direction

- static-first build-time generation and progressive enhancement;
- one canonical data source per content type;
- Diplodoc as the only site-wide full-text search owner;
- canonical directory routes and legacy `.html` only as compatibility entrypoints;
- no public canonical/Sitemap/feed URL contains `.html`;
- one RU/EN build and search architecture;
- Project Registry status applies to existing canonical project pages automatically;
- deployment-only feature smoke uses `main.dc-doc-page__content`, not broad `locator('main')`;
- volatile external evidence is read from canonical registries, not duplicated in production verifiers;
- no runtime API, database, account system or duplicate index.

---

## Remaining scope

### P3.4B — Clean URLs without Cloudflare routing — NEXT

Publish a grounded Note from accepted PR #114/#115 evidence.

The Note must explain:

- why repository-native directory routes became the public identity;
- how generated HTML, Diplodoc router depth and base paths were normalized;
- why canonical, hreflang, OpenGraph, Sitemap, Atom feed and generated search moved together;
- why Cloudflare remains DNS/CDN/aggregate-analytics infrastructure rather than an application router;
- why GitHub Pages cannot emit repository-configured HTTP 301 redirects;
- why legacy `.html` entrypoints remain static `noindex,follow` compatibility preserving query and fragment;
- why exact production verification and delayed Google/Yandex observation are separate layers;
- what evidence would authorize eventual removal of legacy compatibility.

Acceptance requirements:

- facts grounded in PR #114/#115 and exact production evidence;
- verified fact, inference and limitation separated;
- relevant platform case study and Notes linked;
- deterministic Notes Registry, clean route, Sitemap/search/Atom integration;
- semantic/no-JS content;
- exact-head and deployment-only production verification;
- no unsupported claim that crawler replacement is complete.

### Later P3.4 Notes

- Hybrid CV + AI recognition boundaries.
- GameTests versus installed gameplay acceptance.
- Passive PDF validation and semantic boundaries.
- Evidence-driven project state.

### P3.5 — Selective English expansion

Translate only high-value surfaces: homepage, Resume, three flagships, `/now`, selected Notes and Publications. Do not create a separate English build or CMS.

### P3.6 — Measurement checkpoint

After 3–4 weeks of meaningful aggregate traffic, inspect aggregate traffic and clean-route indexing without making unsupported engagement claims.

## Non-goals

- backend or runtime CMS;
- comments, likes or accounts;
- second search engine;
- session replay or behavioural analytics;
- automatic profile, search-console or public-status mutation;
- fabricated metrics, leadership claims or testimonials;
- migration from GitHub Pages without a reproduced platform blocker.

## Acceptance criteria

- [x] homepage primary paths are visible and keyboard accessible;
- [x] homepage claims are backed by canonical project/evidence data;
- [x] private NODE ZERO is absent from homepage flagships;
- [x] TrueRuslan Landing has dedicated RU/EN case studies and evidence boundaries;
- [x] VillAIgence follows the complete common case-study order;
- [x] Vlezet follows the complete common case-study order;
- [x] controlled EN VillAIgence follows the same narrative order without duplicate evidence data;
- [x] registry-owned status renders on canonical project pages;
- [x] pending Project Evidence works with and without JavaScript;
- [x] related Notes and repository links are deterministic and validated;
- [x] canonical, Sitemap, feed and search identities use clean routes;
- [x] exact-head, browser, accessibility, cross-browser, RU/EN, metadata, visual and custom-domain gates pass;
- [x] exact Pages deployment and baseline/platform/current-flagship/P3.4A/favicon production smokes pass;
- [x] P3.4A is published from accepted evidence with explicit fact/inference/limitation boundaries;
- [ ] remaining grounded P3.4 Note series is published from accepted evidence.

## Recommended next implementation slice

Continue with **P3.4B — Clean URLs without Cloudflare routing**. The clean URL migration has complete repository, artifact, deployment and production evidence, while search-engine replacement can remain explicitly bounded as delayed external observation.
