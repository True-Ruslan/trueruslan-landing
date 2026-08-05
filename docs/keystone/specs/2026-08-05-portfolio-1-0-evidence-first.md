# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.2 ACCEPTED IN PRODUCTION**
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

Delivered by PR #119 and verifier hotfix PR #120.

Production routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

Delivered:

- complete RU/EN evidence-first case study;
- problem, constraints, current boundary, architecture, rejected alternatives, evidence, limitations, next step and related-content sections;
- homepage, Projects hubs and toc integration;
- canonical metadata, hreflang, Sitemap, OpenGraph and generated search integration;
- canonical Project History and Project Evidence;
- controlled flagship/evidence set expanded to four projects;
- PR-safe baseline smoke separated from deployment-only feature verification;
- deployment-only checks for both routes, homepage link, evidence, timeline, search and favicon;
- reviewed Projects hub desktop/mobile visual baselines;
- exact repository-link validation and scoped Diplodoc document selector.

Exact feature evidence:

```text
PR #119 exact head:            6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
CodeQL:                         #340 — SUCCESS
Dependency Review:              #296 — SUCCESS
unit tests:                     368 PASS / 0 FAIL
quality artifact:               8927189167
quality digest:                 sha256:9bd264d534ba31f51669d6701319cb2b4671574e329d7e36f9047bb48affc997
```

Verifier and production closure:

```text
PR #120 exact head:            c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
CodeQL:                         #342 — SUCCESS
Dependency Review:              #297 — SUCCESS
Pages deployment ID:            5760275658 — SUCCESS
Production Live Smoke:          #80 / 30999331791 — SUCCESS
portfolio platform RU/EN smoke: PASS
favicon smoke:                  PASS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

## Product experience contract

### Homepage hierarchy — ACCEPTED

1. identity and specialization;
2. Resume, Projects and Materials primary paths;
3. bounded evidence strip;
4. VillAIgence, Vlezet and TrueRuslan Landing flagships;
5. current `/now` context;
6. Publications and secondary platform surfaces.

### Flagship case-study contract — ACCEPTED FOR TRUERUSLAN LANDING

Each normalized flagship page must answer, in order:

1. problem and user;
2. constraints and risks;
3. current lifecycle and accepted boundary;
4. architecture and source of truth;
5. alternatives considered and rejected;
6. implemented capabilities;
7. verification and evidence;
8. known limitations;
9. next accepted milestone;
10. related Notes, Publications and repository links.

### UX states

- **Happy:** semantic content, evidence and related links are present.
- **Empty:** optional groups are omitted; fake placeholders are prohibited.
- **Loading/pending:** only progressive enhancements load; core content remains generated HTML.
- **Error/failure:** missing canonical data fails the build.
- **Edge/constraint:** Draft evidence, repository readiness, deployment and external acceptance remain visibly distinct.

## Technical direction

- static-first build-time generation and progressive enhancement;
- one canonical data source per content type;
- Diplodoc as the only site-wide full-text search owner;
- canonical directory routes and legacy `.html` only as compatibility entrypoints;
- no public canonical/Sitemap/feed URL contains `.html`;
- one RU/EN build and search architecture;
- no runtime API, database, account system or duplicate index;
- deployment-only feature smoke uses `main.dc-doc-page__content`, not broad `locator('main')`.

## Remaining scope

### P3.3 — Flagship normalization — NEXT

Normalize VillAIgence and Vlezet to the accepted case-study contract while preserving:

- Vlezet Draft/accepted separation;
- VillAIgence automated/manual acceptance separation;
- stable canonical routes and existing repository identities.

### P3.4 — Grounded content series

Publish Notes based on completed work:

- repository-native clean URLs without Cloudflare routing;
- deployment success versus production smoke;
- hybrid CV + AI recognition boundaries;
- GameTests versus installed gameplay acceptance;
- passive PDF validation and semantic boundaries;
- evidence-driven project state.

### P3.5 — Selective English expansion

Translate only high-value surfaces first: homepage, Resume, three flagships, `/now` and selected Notes. Do not create a separate English build or CMS.

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
- [x] related Notes and repository links are deterministic and validated;
- [x] canonical, Sitemap, feed and search identities use clean routes;
- [x] exact-head, browser, accessibility, cross-browser, RU/EN, metadata, visual and custom-domain gates pass;
- [x] Pages deployment and deployment-driven baseline/platform/favicon smokes pass;
- [ ] VillAIgence follows the complete common case-study order;
- [ ] Vlezet follows the complete common case-study order.

## Recommended next implementation slice

Start with **P3.3 — Flagship normalization**. TrueRuslan Landing now defines the accepted structure; VillAIgence and Vlezet should be normalized without expanding their current product claims.
