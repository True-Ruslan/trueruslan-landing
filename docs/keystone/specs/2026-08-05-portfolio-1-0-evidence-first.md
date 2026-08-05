# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.3 ACCEPTED IN PRODUCTION**
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
- Vlezet PR #42 is green Draft automation plus mandatory real-plan owner retest;
- VillAIgence PR #110 is Draft/RED development evidence only;
- dedicated browser and deployment-only production smoke verify all normalized routes;
- no visual baseline or tolerance change was required.

```text
TDD RED head:                  f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
RED Build:                      #871 — expected FAILURE
exact accepted head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
accepted squash:                c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
CodeQL:                         #368 — SUCCESS
Dependency Review:              #321 — SUCCESS
Content Freshness:              #67 — SUCCESS
unit tests:                     376 PASS / 0 FAIL
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
baseline/platform/flagship/favicon smokes: PASS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Preserved external acceptance:

- Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted; M7.8C Draft pending representative real-plan owner retest.
- VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`; PR #103/#104 automated evidence remains bounded; PR #110 remains Draft/RED; cumulative real-provider/gameplay/manual acceptance is pending.

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

TrueRuslan Landing, VillAIgence and Vlezet now follow this common contract. The controlled English layer remains bounded and does not create duplicate evidence registries.

### UX states

- **Happy:** semantic content, status, evidence and related links are present.
- **Empty:** optional groups are omitted; fake placeholders are prohibited.
- **Loading/pending:** only progressive enhancements load; core content remains generated HTML.
- **Error/failure:** missing canonical data or ordered markers fail the build.
- **Edge/constraint:** Draft evidence, repository readiness, deployment and external acceptance remain visibly distinct.

## Technical direction

- static-first build-time generation and progressive enhancement;
- one canonical data source per content type;
- Diplodoc as the only site-wide full-text search owner;
- canonical directory routes and legacy `.html` only as compatibility entrypoints;
- no public canonical/Sitemap/feed URL contains `.html`;
- one RU/EN build and search architecture;
- Project Registry status applies to existing canonical project pages automatically;
- deployment-only feature smoke uses `main.dc-doc-page__content`, not broad `locator('main')`;
- no runtime API, database, account system or duplicate index.

---

## Remaining scope

### P3.4 — Grounded Engineering Notes — NEXT

Publish a bounded series from completed work:

- repository-native clean URLs without Cloudflare routing;
- deployment success versus production smoke;
- hybrid CV + AI recognition boundaries;
- GameTests versus installed gameplay acceptance;
- passive PDF validation and semantic boundaries;
- evidence-driven project state.

Recommended first Note:

**P3.4A — Deployment success is not production verification**.

It can be grounded entirely in accepted P3.1–P3.3 repository, artifact, Pages and Production Live Smoke evidence.

Each Note must:

- distinguish verified fact, inference and limitation;
- use existing Notes Registry, clean routes, generated search and Atom feed;
- link to relevant case studies and evidence;
- avoid invented metrics or broadened acceptance claims;
- remain useful without JavaScript;
- pass exact-head and production acceptance.

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
- [x] exact Pages deployment and baseline/platform/flagship/favicon production smokes pass;
- [ ] grounded P3.4 Note series is published from accepted evidence.

## Recommended next implementation slice

Start with **P3.4A — Deployment success is not production verification**. It has the strongest accepted platform evidence and requires no unverified external-project promotion.
