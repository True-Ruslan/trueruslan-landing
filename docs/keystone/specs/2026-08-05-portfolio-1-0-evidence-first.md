# Portfolio 1.0 — Evidence-first flagship content

> Status: **APPROVED**
>
> Date: **2026-08-05**
>
> Product: `True-Ruslan/trueruslan-landing`

## Goal

Turn the existing production-stable portfolio and knowledge platform into a clear professional entry point where a reader can quickly understand:

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

## Success criteria

- the homepage exposes Resume, flagship projects and Engineering Notes as three explicit one-action paths;
- the professional specialization is understandable within the first screen and supporting evidence is visible without searching the sidebar;
- VillAIgence, Vlezet and TrueRuslan Landing use one evidence-first case-study contract;
- every public claim is either a bounded current-state statement or points to evidence;
- related projects, notes and publications form a navigable content graph;
- core content remains useful without JavaScript;
- canonical clean URLs, RU/EN architecture, search, accessibility, visual and production gates remain green.

## Product experience

### Homepage hierarchy

1. **Identity and specialization** — concise current role and engineering focus.
2. **Primary paths**:
   - `Опыт` → Resume;
   - `Проекты` → flagship case studies;
   - `Материалы` → Engineering Notes and Publications.
3. **Evidence strip** — three strongest current, verifiable signals rather than generic skill badges.
4. **Active work** — bounded `/now` snapshot.
5. **Featured flagship projects** — VillAIgence, Vlezet and TrueRuslan Landing.
6. **Featured Engineering Notes / Publications**.

### Flagship case-study contract

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
- **Loading/pending:** only progressive enhancements may load; core content remains server-generated static HTML.
- **Error/failure:** missing required canonical data fails the build; optional enhancement failures do not hide content.
- **Edge/constraint:** Draft evidence, external acceptance and production deployment remain visibly distinct from accepted product truth.

## Technical direction

- Keep static-first build-time generation and progressive enhancement.
- Keep one canonical data source for projects, evidence, notes and publications.
- Keep Diplodoc as the only site-wide full-text search owner.
- Use canonical directory routes (`/page/`) and keep legacy `.html` only as compatibility entrypoints.
- Keep Sitemap, Atom feed, canonical, hreflang and OpenGraph identities free of public `.html` routes.
- Reuse existing Project Registry, Project Evidence, Notes Registry, Publications Registry and `/now` data.
- Add no runtime API, database, account system or duplicate content index.

## Scope

### P3.1 — Homepage evidence paths

- clarify the first-screen message hierarchy;
- expose Resume, Projects and Materials as explicit primary routes;
- replace generic proof with bounded evidence-backed signals;
- preserve existing standalone-home performance and accessibility budgets.

### P3.2 — TrueRuslan Landing flagship

- add the site itself as an evidence-first engineering case study;
- document static-first architecture, build-time intelligence, clean URL migration, production gates and tradeoffs;
- connect relevant Engineering Notes.

### P3.3 — Flagship normalization

- align VillAIgence and Vlezet to the common contract without changing their accepted lifecycle states;
- preserve Vlezet Draft/accepted separation and VillAIgence automated/manual acceptance separation.

### P3.4 — Grounded content series

Publish 4–6 Notes based on completed work, starting with:

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

- [ ] all three primary homepage paths are visible and keyboard accessible;
- [ ] homepage claims are backed by canonical project/evidence data;
- [ ] three flagship pages follow the same content contract;
- [ ] TrueRuslan Landing has its own case study and evidence boundary;
- [ ] Draft, repository, generated artifact, deployment and external acceptance states remain distinct;
- [ ] related-content links are deterministic and validated at build time;
- [ ] no public canonical/Sitemap/feed URL contains `.html`;
- [ ] unit, build, site-integrity, browser, accessibility, Lighthouse, Firefox/WebKit, search, RU/EN, analytics, metadata, visual and custom-domain checks pass;
- [ ] CodeQL and Dependency Review pass;
- [ ] post-merge Pages deployment and deployment-driven Production Live Smoke pass.

## Recommended implementation slice

Start with **P3.1 — Homepage evidence paths**. It provides the highest user-facing value with the smallest architectural surface and establishes the navigation hierarchy that all subsequent case-study and content work will use.
