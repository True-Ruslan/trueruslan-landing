# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.3 Flagship normalization.
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

Feature and production evidence:

```text
PR #122 RED head:              f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
RED Build:                      #871 — expected FAILURE
PR #122 exact head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
PR #122 squash:                c90a221a21f51e897661667f981483bad922ad0d
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

Accepted outcome:

- RU VillAIgence, RU Vlezet and controlled EN VillAIgence use one evidence-first order;
- Project Registry status automatically renders on existing canonical project pages;
- Project Evidence pending states work in JS and no-JS modes;
- ordered sections, related links, timelines and evidence are checked in Chromium, Firefox and WebKit;
- exact deployed pages are checked only after the matching Pages deployment;
- no route, slug, lifecycle or accepted external-project state was broadened.

Preserved external boundaries:

- Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted; M7.8C Draft pending representative real-plan owner retest.
- VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`; PR #103/#104 automation accepted within scope; PR #110 remains Draft/RED; cumulative real-provider/gameplay/manual acceptance pending.

## P3.4 — Grounded Engineering Notes — NEXT

Publish a bounded 4–6 Note series from completed, evidenced work.

Candidate order:

1. **Clean URLs without Cloudflare routing** — directory output, canonical/feed/search migration and GitHub Pages redirect limitation.
2. **Deployment success is not production verification** — exact artifact, Pages deployment and browser smoke as separate evidence layers.
3. **Hybrid CV + AI recognition boundaries** — local candidates, verification-only AI, deterministic Apply and owner retest.
4. **GameTests versus installed gameplay acceptance** — development integration, exact production JAR, focused live canaries and cumulative acceptance.
5. **Passive PDF validation versus semantics** — structural validity, browser delivery and limits of raw-byte inspection.
6. **Evidence-driven project state** — accepted, failed, pending and Draft signals without automatic promotion.

Acceptance criteria for each Note:

- derived from accepted evidence and existing case studies;
- clearly separates verified facts, inference and limitation;
- links to the relevant case study, repository evidence and related Notes;
- no invented metrics or broadened acceptance claims;
- deterministic Notes Registry metadata;
- clean route, Sitemap/search/Atom integration;
- useful without JavaScript;
- full exact-head and production matrices pass.

Recommended first implementation slice:

**P3.4A — Deployment success is not production verification**.

Reason: the platform already has complete repository, generated-artifact, Pages and Production Live Smoke evidence from P3.1–P3.3, so the Note can be fully grounded without waiting for external project acceptance.

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

Open durable state and Portfolio 1.0 specification. Check actual PRs, commits, exact-head CI, Pages and Production Live Smoke. Confirm PR #122 head `ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46` and squash `c90a221a21f51e897661667f981483bad922ad0d` delivered P3.3; Build #893, Pages #152 and Production Live Smoke #95 passed; Pages deployment ID `5761717586` published the exact accepted SHA; issue #111 remains external observation only; issue #82 remains the dependency blocker; Vlezet and VillAIgence acceptance boundaries are unchanged; continue with **P3.4A — Deployment success is not production verification**.
