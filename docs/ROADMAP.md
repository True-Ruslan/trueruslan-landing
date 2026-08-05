# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.1 Homepage evidence paths.
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
- generated artifact, deployed production, search-engine observation и external-product acceptance как разные факты;
- no quality-gate weakening.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Completed milestones

## Foundation and evidence platform

- Photo Stories — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
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
- Distribution and external profiles — PRs #98/#102/#104.
- Resume/PDF baseline — PRs #108/#110.
- Yandex favicon contract — PR #112.
- Repository-native clean URLs — PR #114.
- Clean-route production verification — PR #115.
- Durable Portfolio 1.0 specification — PR #116.
- Portfolio 1.0 P3.1 Homepage evidence paths — PR #117.

## Operational and security hardening

- issue #78 freshness closure — PR #91.
- dependency audit evidence — PR #93.
- high-severity dependency remediation — PR #94.
- Production Live Smoke — PR #96.
- deployment-driven trigger — PRs #99/#100.
- Vlezet Draft reconciliation — PR #106.
- root favicon live contract — PR #112.
- clean URL build/search/SEO/browser contract — PR #114.
- canonical versus legacy live verification — PR #115.
- remaining markdown-it/Diplodoc blocker — issue #82.

---

# Portfolio 1.0 — IN PROGRESS

## P3.1 — Homepage evidence paths — DONE

PR #117 made the homepage an evidence-first professional entry point.

Delivered:

- three explicit one-action paths: Resume, Projects and Materials;
- three bounded evidence signals from canonical project/evidence registries;
- public-only flagship set: VillAIgence, Vlezet and Engineering Portfolio Platform;
- fail-closed exclusion of private NODE ZERO;
- preserved VillAIgence automated/manual and Vlezet accepted/Draft boundaries;
- current `/now` context;
- reduced secondary duplication;
- bounded RU/EN hierarchy;
- reviewed desktop/mobile homepage baselines.

```text
exact head:                     67d3f6593c45d1239630f71be6a3cb15a33f4519
squash:                         fe1a796df37313401c07e25c0672dc32db30a1c4
RED Build:                      #827 / 30987736270 — expected FAILURE
final Build:                    #836 / 30989449993 — SUCCESS
CodeQL:                         #306 / 30989449931 — SUCCESS
Dependency Review:              #264 / 30989449930 — SUCCESS
unit tests:                     360 PASS / 0 FAIL
visual regression:              PASS
custom-domain artifact:         PASS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

## P3.2 — TrueRuslan Landing flagship — NEXT

Create a dedicated clean route for the portfolio platform instead of linking its homepage flagship only to the Projects hub.

Required case-study contract:

1. product purpose and audience;
2. constraints and risks;
3. accepted production boundary;
4. static-first architecture and source of truth;
5. build-time registries, generators and post-processing;
6. alternatives considered and rejected;
7. clean URL migration and GitHub Pages redirect limitations;
8. exact-head CI, generated artifact, Pages deployment and Production Live Smoke as separate evidence layers;
9. known limitations and next milestone;
10. related Engineering Notes, Publications, repository and evidence links.

Acceptance criteria:

- dedicated canonical route exists in RU and the controlled EN layer;
- Projects hub and homepage flagship link to it;
- content derives current state from canonical project/evidence data where applicable;
- no invented metrics or claims;
- related-content links are deterministic and validated;
- search, Sitemap, metadata, clean URLs and RU/EN pairing include the page;
- full exact-head and production acceptance matrix passes.

## P3.3 — Flagship normalization

Align VillAIgence and Vlezet to the same case-study order without changing their accepted lifecycle states.

Do not promote:

- Vlezet M7.8C before exact-head automation plus real-plan owner acceptance;
- VillAIgence beyond `ACCEPTANCE IN PROGRESS` before cumulative real-provider/gameplay/manual evidence.

## P3.4 — Grounded Engineering Notes

Publish 4–6 Notes from completed work:

- clean URLs without Cloudflare routing;
- deployment success versus production smoke;
- hybrid CV + AI recognition boundaries;
- GameTests versus installed gameplay acceptance;
- passive PDF validation versus semantics;
- evidence-driven project state.

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

# Clean URL and search-engine operations

Repository work is complete:

- clean public directory routes;
- canonical/hreflang/OpenGraph/Sitemap/feed without public `.html` identities;
- legacy `.html` only as `noindex,follow` compatibility;
- root favicon and HTTPS contracts;
- deployed production verification.

Issue #111 remains only for authenticated Yandex Webmaster actions and crawler observation:

1. confirm/resubmit Sitemap;
2. verify HTTP→HTTPS/main mirror;
3. select “No region”;
4. request recrawl for representative clean routes;
5. recheck diagnostics and indexed URLs after 10–14 days.

Do not add repository code solely to clear a stale cached diagnostic.

---

# Operational checkpoints

## Dependency blocker

Review issue #82 on or after **2026-08-17**. Accept an update only when upstream Diplodoc supports a secure markdown-it line and the complete exact-head matrix passes.

Do not use `npm audit fix --force`, local shims or an unreviewed fork.

## External projects

- Vlezet M7.8B remains accepted; M7.8C remains pending.
- VillAIgence PR #103/#104 automated evidence remains separate from cumulative acceptance.
- update public project state only from accepted bounded evidence.

## Conditional work

- Photo Stories: only authentic material and chronology; no demo album.
- Share UI: only a concrete user-facing sharing need.
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

Open durable state and Portfolio 1.0 specification. Check actual PRs, commits, exact-head CI, Pages and Production Live Smoke. Confirm PR #117 squash `fe1a796df37313401c07e25c0672dc32db30a1c4` is the accepted P3.1 baseline; Pages #147 and Production Live Smoke #58 passed; PR #114/#115 remain the clean URL baseline; issue #111 is external observation only; issue #82 remains the dependency blocker; Vlezet and VillAIgence acceptance boundaries are unchanged; continue with **P3.2 — TrueRuslan Landing flagship**.
