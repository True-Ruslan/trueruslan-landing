# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.1 ACCEPTED IN PRODUCTION**
>
> Date: **2026-08-05**
>
> Product: `True-Ruslan/trueruslan-landing`

## Goal

Turn the production-stable portfolio and knowledge platform into a clear professional entry point where a reader can quickly understand:

1. what Ruslan builds;
2. what engineering problems he solves;
3. how the decisions were made;
4. what evidence supports the claims;
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

## Accepted production slice

### P3.1 — Homepage evidence paths — DONE

Delivered by PR #117:

- three explicit one-action paths for Resume, Projects and Materials;
- bounded evidence cards sourced from canonical Project Registry and Project Evidence;
- a stable public flagship set: VillAIgence, Vlezet and Engineering Portfolio Platform;
- fail-closed exclusion of private NODE ZERO;
- preserved VillAIgence automated/manual and Vlezet accepted/Draft boundaries;
- current `/now` context;
- reduced secondary homepage duplication;
- equivalent bounded RU/EN information architecture;
- static semantic HTML with progressive enhancement;
- new reviewed desktop/mobile visual baselines only for the changed homepage.

Exact evidence:

```text
feature PR:                     #117 — MERGED
exact head:                     67d3f6593c45d1239630f71be6a3cb15a33f4519
accepted squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
RED Build:                      #827 / 30987736270 — expected FAILURE
final Build:                    #836 / 30989449993 — SUCCESS
CodeQL:                         #306 / 30989449931 — SUCCESS
Dependency Review:              #264 / 30989449930 — SUCCESS
unit tests:                     360 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/RU-EN/analytics:         PASS
visual regression:              PASS
custom-domain artifact:         PASS
quality artifact:               8923559602
quality digest:                 sha256:429dadb1b84c59e73e9a977e296422084e754f235eaeb538b866d749ea43c64e
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

## Product experience contract

### Homepage hierarchy — ACCEPTED

1. **Identity and specialization** — current role and engineering focus.
2. **Primary paths**:
   - `Опыт` → Resume;
   - `Проекты` → flagship case studies;
   - `Материалы` → Engineering Notes and Publications.
3. **Evidence strip** — three bounded current signals instead of generic skill badges.
4. **Flagship projects** — VillAIgence, Vlezet and TrueRuslan Landing platform identity.
5. **Active work** — bounded `/now` snapshot.
6. **Featured publications and secondary platform sections**.

### Flagship case-study contract — NEXT WORK

Each flagship page must answer, in this order:

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

- **Happy:** semantic page content, evidence blocks and related links are present.
- **Empty:** optional evidence groups are omitted; no fake placeholders or demo claims are rendered.
- **Loading/pending:** only progressive enhancements may load; core content remains generated static HTML.
- **Error/failure:** missing required canonical data fails the build; optional enhancement failures do not hide content.
- **Edge/constraint:** Draft evidence, external acceptance and production deployment remain visibly distinct from accepted product truth.

## Technical direction

- Keep static-first build-time generation and progressive enhancement.
- Keep one canonical data source for projects, evidence, notes and publications.
- Keep Diplodoc as the only site-wide full-text search owner.
- Use canonical directory routes (`/page/`) and keep legacy `.html` only as compatibility entrypoints.
- Keep Sitemap, Atom feed, canonical, hreflang and OpenGraph identities free of public `.html` routes.
- Reuse Project Registry, Project Evidence, Notes Registry, Publications Registry and `/now` data.
- Add no runtime API, database, account system or duplicate content index.

## Remaining scope

### P3.2 — TrueRuslan Landing flagship — NEXT

- add the site itself as a dedicated evidence-first engineering case study;
- document product purpose and audience;
- document static-first architecture, registries and build-time intelligence;
- explain repository-native clean URL migration and GitHub Pages constraints;
- distinguish exact-head CI, generated artifact, Pages deployment and Production Live Smoke;
- record rejected alternatives and known limitations;
- connect relevant Engineering Notes and repository evidence.

### P3.3 — Flagship normalization

- align VillAIgence and Vlezet to the common case-study contract;
- preserve Vlezet Draft/accepted separation;
- preserve VillAIgence automated/manual acceptance separation.

### P3.4 — Grounded content series

Publish 4–6 Notes based on completed work:

- repository-native clean URLs without Cloudflare routing;
- deployment success versus production smoke;
- hybrid CV + AI recognition boundaries;
- GameTests versus installed gameplay acceptance;
- passive PDF validation and semantic boundaries;
- evidence-driven project state.

### P3.5 — Selective English expansion

Translate only the highest-value surfaces first: homepage, Resume, three flagships, `/now` and selected Notes. Do not create a separate English build or CMS.

## Non-goals

- backend or runtime CMS;
- comments, likes or accounts;
- second search engine;
- session replay or behavioural analytics;
- automatic profile, search-console or public-status mutation;
- generic share buttons without a concrete scenario;
- fabricated metrics, leadership claims, testimonials or demo Photo Stories;
- migration from GitHub Pages without a reproduced platform blocker.

## Acceptance criteria

- [x] all three primary homepage paths are visible and keyboard accessible;
- [x] homepage claims are backed by canonical project/evidence data;
- [x] private NODE ZERO is absent from homepage flagships;
- [x] core homepage content remains useful without JavaScript;
- [x] no public canonical/Sitemap/feed URL contains `.html`;
- [x] unit, build, site-integrity, browser, accessibility, Lighthouse, Firefox/WebKit, search, RU/EN, analytics, metadata, visual and custom-domain checks pass for P3.1;
- [x] CodeQL and Dependency Review pass for P3.1;
- [x] post-merge Pages deployment and deployment-driven Production Live Smoke pass for P3.1;
- [ ] three flagship pages follow the complete common case-study contract;
- [ ] TrueRuslan Landing has its own dedicated case study and evidence boundary;
- [ ] related-content links are deterministic and validated at build time.

## Recommended next implementation slice

Start with **P3.2 — TrueRuslan Landing flagship**. P3.1 established the homepage hierarchy and public platform identity; P3.2 must now give that platform identity a dedicated evidence-first destination rather than linking only to the projects hub.
