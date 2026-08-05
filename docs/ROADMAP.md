# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.2 TrueRuslan Landing flagship и PR #120 verifier closure.
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

---

# Portfolio 1.0 — IN PROGRESS

## P3.1 — Homepage evidence paths — DONE

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

Accepted outcome:

- Resume, Projects and Materials are explicit primary paths;
- bounded evidence comes from canonical registries;
- VillAIgence, Vlezet and Engineering Portfolio Platform are public homepage flagships;
- private NODE ZERO is fail-closed excluded;
- RU/EN and no-JS boundaries remain intact.

## P3.2 — TrueRuslan Landing flagship — DONE

Dedicated clean routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

Feature evidence:

```text
PR #119 head:                  6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
CodeQL:                         #340 — SUCCESS
Dependency Review:              #296 — SUCCESS
unit tests:                     368 PASS / 0 FAIL
quality artifact:               8927189167
quality digest:                 sha256:9bd264d534ba31f51669d6701319cb2b4671574e329d7e36f9047bb48affc997
```

Verifier closure:

```text
PR #120 head:                  c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
CodeQL:                         #342 — SUCCESS
Dependency Review:              #297 — SUCCESS
PR-safe Production Live Smoke:  #79 — SUCCESS
Pages deployment ID:            5760275658 — SUCCESS
Production Live Smoke:          #80 / 30999331791 — SUCCESS
platform RU/EN smoke:           PASS
favicon smoke:                  PASS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Accepted outcome:

- dedicated RU/EN evidence-first case study;
- homepage, Projects hubs, toc, search, Sitemap, metadata, OpenGraph and hreflang integration;
- canonical Project History and Project Evidence;
- four controlled flagship/evidence projects;
- CI, artifact, Pages deployment and live browser proof remain distinct;
- Cloudflare is not required as application routing runtime;
- deployment-only smoke verifies both routes, homepage link, search and favicon;
- `main.dc-doc-page__content` is the required Diplodoc document selector.

## P3.3 — Flagship normalization — NEXT

Normalize **VillAIgence** and **Vlezet** to the complete evidence-first order already accepted for TrueRuslan Landing.

Required sequence:

1. problem and user;
2. constraints and risks;
3. current lifecycle and accepted boundary;
4. architecture and canonical source of truth;
5. alternatives considered and rejected;
6. implemented capabilities;
7. verification and evidence;
8. known limitations;
9. next accepted milestone;
10. related Notes, Publications and repository links.

Acceptance criteria:

- VillAIgence and Vlezet follow the same structural marker order;
- existing canonical route identities remain unchanged;
- timeline and Project Evidence placeholders remain unique;
- related Notes are deterministic and validated;
- current lifecycle labels remain registry-owned;
- full exact-head, visual and production matrices pass;
- no acceptance claim is broadened.

Do not promote:

- VillAIgence beyond `ACCEPTANCE IN PROGRESS` before cumulative real-provider/gameplay/manual acceptance;
- Vlezet M7.8C before exact-head automation plus the same representative real-plan owner retest.

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

# Search-engine operations

Repository work is complete. Issue #111 remains only for authenticated Yandex Webmaster actions and crawler observation:

1. confirm/resubmit Sitemap;
2. verify HTTP→HTTPS/main mirror;
3. select “No region”;
4. request recrawl for representative clean routes, including the new platform case study;
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

Open durable state and Portfolio 1.0 specification. Check actual PRs, commits, exact-head CI, Pages and Production Live Smoke. Confirm PR #119 squash `d11aeddeed492dce512e123d216e0191a5906ca9` delivered P3.2, PR #120 squash `dcb278cb4f52d5e8afc314a9f30689edb5153af0` closed production verification, Pages deployment ID `5760275658` and Production Live Smoke #80 passed; PR #114/#115 remain the clean URL baseline; issue #111 is external observation only; issue #82 remains the dependency blocker; Vlezet and VillAIgence acceptance boundaries are unchanged; continue with **P3.3 — Flagship normalization**.
