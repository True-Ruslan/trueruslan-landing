# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после repository-native clean URL migration, production-smoke alignment и утверждения Portfolio 1.0.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; approved specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- repository-native directory URLs for public content;
- legacy `.html` only as compatibility entrypoints;
- no automatic public truth, external-profile or search-engine mutation;
- bounded Evidence semantics;
- Draft evidence не является accepted evidence;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking без explicit privacy review;
- repository readiness, generated artifact, deployed production, search-engine observation и external-project acceptance как разные факты;
- exact artifact and installed/deployed acceptance as separate release gates;
- PDF structural validity ≠ semantic PDF extraction;
- dependency evidence не является автоматическим разрешением на fix;
- distribution readiness не является audience-growth claim;
- no quality-gate weakening.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Completed milestones

## Foundation and evidence platform

- Photo Stories platform — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
- Content Freshness Guard — PR #27.
- Browser Quality Harness — PR #29.
- Project Metadata Cleanup — PR #31.
- Flagship Case-Study Format — PR #34.
- Additional Grounded Note — PR #36.

## Audience, operations and content

- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45.
- Canonical rollout/header/search/Photo stabilization — PRs #48–#58.
- Vlezet flagship — PR #59.
- Publications — PR #61.
- VillAIgence flagship — PR #63.
- `/now` synchronization — PR #65.
- Product Evidence Reconciliation — PR #83.
- Installed Acceptance Engineering Note — PR #85.
- Deterministic Authority Engineering Note — PR #87.
- Restart and Persistence Engineering Note — PR #89.
- Distribution Contract & Profile Audit — PR #98.
- External Profile Reverification — PRs #102/#104.
- August 2026 Resume Refresh — PR #108.
- User-managed PDF and Resume Timeline Alignment — PR #110.
- Yandex Webmaster Favicon Reconciliation — PR #112.
- Repository-native clean URLs — PR #114.
- Clean-route Production Live Smoke alignment — PR #115.

## Operational and security hardening

- Freshness PR evidence and issue #78 closure — PR #91.
- Exact dependency audit evidence — PR #93.
- High-severity dependency remediation — PR #94.
- Production Live Smoke — PR #96.
- Deployment-driven live trigger repair — PRs #99/#100.
- Vlezet Draft freshness reconciliation — PR #106.
- Structural PDF validation and timeline regression coverage — PR #110.
- Root favicon artifact/link/live verification contract — PR #112.
- Directory-route build/search/SEO/browser contract — PR #114.
- Canonical versus legacy production-route verification — PR #115.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# Repository-native clean URLs — DONE

PR #114 established clean directory routes without Cloudflare routing.

```text
exact head:                     8702afe63ad3dca3ad0c17da47409c1660e126ef
squash:                         cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
CodeQL:                         #295 / 30962674018 — SUCCESS
Dependency Review:              #250 / 30962673979 — SUCCESS
Dependency Audit Evidence:      #57 / 30962673975 — SUCCESS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
```

Permanent public identities use `/page/`, for example:

```text
/landing/resume/
/landing/projects/
/landing/notes/
/en/
/_search/ru/
```

Canonical, hreflang, OpenGraph, Sitemap, Atom feed, generated search links, local serving and browser checks use the same route model.

Legacy `.html` remains only as a static `noindex,follow` compatibility entrypoint preserving query and fragment. GitHub Pages cannot provide repository-defined HTTP 301 responses, and Cloudflare Rewrite/Worker configuration is intentionally unnecessary.

PR #115 fixed the production verifier after the successful rollout:

```text
head:                           d28b05afd23f05e997d28e9015f3eab4f0a3be5e
squash:                         4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Build:                          #825 / 30983923977 — SUCCESS
Production Live Smoke #52:      30983923979 — SUCCESS
CodeQL:                         #293 / 30983924043 — SUCCESS
Dependency Review:              #253 / 30983923991 — SUCCESS
```

The verifier now treats clean routes as canonical and checks legacy compatibility separately.

---

# Search-engine migration operations — ACTIVE EXTERNAL OBSERVATION

Repository work is complete:

- Sitemap and robots are generated;
- public Sitemap/feed identities contain no `.html` routes;
- clean canonical metadata is deployed;
- root favicon and HTTPS contracts are deployed;
- production smoke validates canonical routes.

Issue #111 remains only for authenticated Yandex Webmaster actions and delayed crawler observation:

1. confirm/resubmit Sitemap in the HTTPS property;
2. verify HTTP→HTTPS/main mirror state;
3. select “No region”;
4. request recrawl for the homepage and representative clean routes;
5. recheck diagnostics and indexed URLs after 10–14 days.

Google Search Console should use the same updated Sitemap plus a small representative set of manual URL inspection requests. Do not use temporary removals for normal canonical migration.

No code change is justified merely because a search console has not refreshed cached diagnostics.

---

# NEXT — Portfolio 1.0: Evidence-first flagship content

Approved specification:

`docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`

## Goal

Make the platform a clear professional entry point where readers can quickly move between experience, flagship projects, engineering materials and supporting evidence.

## Audience

- technical leads and engineering managers;
- backend engineers and architects;
- recruiters evaluating engineering depth;
- potential collaborators;
- readers of Engineering Notes and Publications.

## P3.1 — Homepage evidence paths

**Priority: NEXT.**

Deliver:

- explicit first-screen hierarchy;
- three primary one-action paths:
  - Resume;
  - flagship Projects;
  - Engineering Notes / Publications;
- three bounded evidence-backed signals instead of generic decorative skill proof;
- current `/now` context;
- featured VillAIgence, Vlezet and TrueRuslan Landing entries;
- unchanged performance, accessibility and no-JS boundaries.

Acceptance criteria:

- primary paths are visible and keyboard accessible;
- claims derive from canonical project/evidence data;
- standalone homepage remains independent of Diplodoc runtime bundles;
- mobile overflow, browser/accessibility, Lighthouse and visual checks pass;
- no new runtime service or duplicate data source is introduced.

## P3.2 — TrueRuslan Landing flagship case study

Create a dedicated evidence-first case study covering:

- product purpose and audience;
- static-first architecture;
- build-time registries and post-processing;
- repository-native clean URL migration;
- search, canonical, feed and SEO boundaries;
- exact-head CI, Pages deployment and Production Live Smoke separation;
- rejected alternatives and known constraints;
- related Engineering Notes and repository evidence.

## P3.3 — Flagship normalization

Align VillAIgence and Vlezet to one case-study contract:

1. problem/user;
2. constraints;
3. accepted lifecycle boundary;
4. architecture/source of truth;
5. alternatives rejected;
6. implemented capabilities;
7. evidence;
8. limitations;
9. next accepted milestone;
10. related content.

Do not promote:

- Vlezet M7.8C before exact-head automation plus real-plan owner acceptance;
- VillAIgence beyond `ACCEPTANCE IN PROGRESS` before cumulative real-provider/gameplay/manual evidence.

## P3.4 — Grounded Engineering Notes series

Publish 4–6 Notes from completed work:

- clean URLs without Cloudflare routing;
- deployment success versus production smoke;
- hybrid CV + AI recognition boundaries;
- GameTests versus installed gameplay acceptance;
- passive PDF validation versus semantics;
- evidence-driven project state.

Every Note must be grounded in accepted project evidence and connected back to relevant projects.

## P3.5 — Selective English expansion

Translate only high-value surfaces first:

- homepage;
- Resume;
- three flagship case studies;
- `/now`;
- selected Engineering Notes;
- Publications.

Do not create a separate English CMS, build or search architecture.

## P3.6 — Measurement checkpoint

After 3–4 weeks of meaningful aggregate traffic:

- compare Cloudflare aggregate traffic;
- inspect Google/Yandex indexing of clean routes;
- verify old `.html` identities are declining;
- identify high-value entry pages and search themes;
- make no engagement claim without sufficient data.

---

# Operational checkpoints

## Dependency blocker

Review issue #82 on or after **2026-08-17**.

Accept an update only when:

- upstream Diplodoc no longer relies on removed `markdown-it` internals;
- lockfile resolves a secure parser line;
- `npm audit --json` contains no moderate/high/critical findings;
- translation compatibility and complete exact-head matrix pass.

Do not use `npm audit fix --force`, local shims or an unreviewed fork.

## External products

- Vlezet M7.8B remains accepted; M7.8C remains pending.
- VillAIgence PR #103/#104 automated evidence remains separate from cumulative acceptance.
- update public project state only from accepted, bounded evidence.

## Photo Stories

Create the first genuine story only when authentic material, chronology, captions, alt text and layout decision exist. No demo album.

## Share UI

P2.5d remains conditional on a concrete user-facing sharing need. Do not add generic share buttons merely because the registry exists.

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

Open durable state and the approved Portfolio 1.0 specification. Check actual open PRs, latest commits, exact-head CI, latest Pages deployment and Production Live Smoke. Confirm PR #114 squash `cf07c39378e7c531583e80eaef5edc7e7d1f2bad` remains the clean URL product baseline; PR #115 squash `4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c` remains the production-verifier closure; issue #111 is external observation only; issue #82 remains the dependency blocker; Vlezet and VillAIgence acceptance boundaries are unchanged; start implementation with **P3.1 — Homepage evidence paths**.
