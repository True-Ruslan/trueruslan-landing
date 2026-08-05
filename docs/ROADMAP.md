# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4B Clean URLs Note.
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
- no behavioural tracking without privacy review;
- repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance как разные факты;
- exact artifact и installed acceptance остаются отдельными release gates;
- volatile external evidence derives from canonical registries rather than copied verifier literals;
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
- P3.3 flagship normalization — PR #122.
- P3.3 durable closure — PR #123.
- Current external-project evidence reconciliation — PR #124.
- P3.4A Deployment Verification Note — PR #125.
- Current flagship verifier closure — PR #126.
- P3.4A durable closure — PR #127.
- P3.4B Clean URLs Note — PR #128.

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
Pages deployment ID:            5760275658
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Routes: `/landing/projects/portfolio-platform/` и `/en/projects/portfolio-platform/`. Deployment verification scoped through `main.dc-doc-page__content`.

## P3.3 — Flagship normalization — DONE

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

Routes: `/landing/projects/livingworld/`, `/landing/projects/vlezet/`, `/en/projects/livingworld/`.

Preserved external boundaries:

- Vlezet M7.8B accepted; M7.8C PR #42 and PR #44/#45 remain Draft/pending owner gates.
- VillAIgence PR #103/#104/#108 provide bounded automated evidence; PR #110 remains Draft; cumulative installed acceptance is separate.

## P3.4 — Grounded Engineering Notes — IN PROGRESS

### P3.4A — Deployment success is not production verification — DONE

Route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
Production Live Smoke #108:    FAILURE — verifier defect
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

Accepted outcome: repository readiness, artifact, deployment, browser proof, product acceptance and search-engine observation remain separate layers.

### P3.4B — Clean URLs without Cloudflare routing — DONE

Route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

Delivered by PR #128:

- grounded Note from accepted PR #114/#115 evidence;
- repository-native directory URLs and Diplodoc `<base href>` / router depth constraints;
- canonical, hreflang, OpenGraph, Sitemap, Atom and generated search as one identity contract;
- Cloudflare bounded to DNS/CDN/analytics, not application routing;
- GitHub Pages HTTP 301 limitation stated explicitly;
- legacy `.html` `noindex,follow` compatibility preserving query and fragment;
- exact deployment/browser verification separated from search-engine observation;
- deterministic Notes Registry, toc, metadata, feed and search integration;
- separate deployment-only P3.4B production smoke.

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
baseline/platform/flagship/P3.4A/P3.4B/favicon smokes: PASS
production artifact:            8936914548
production digest:              sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51
```

Accepted outcome: clean routes are reproducible from the repository and verified on exact production without hidden Cloudflare routing. Search-engine index replacement remains external observation.

### P3.4C — Hybrid CV + AI recognition boundaries — NEXT

Publish a grounded Vlezet Note from accepted evidence.

Required scope:

1. deterministic geometry remains authoritative state;
2. local CV and LLM output remain proposals;
3. immutable candidate identity and source references;
4. deterministic validation and current-state revalidation;
5. explicit Apply as the only mutation boundary;
6. fallback and rejection behavior for malformed or stale proposals;
7. M7.8B accepted versus M7.8C Draft/representative real-plan owner retest;
8. benchmark/browser/CI evidence versus product acceptance;
9. PR #42/#44/#45 remain Draft and must not be promoted.

Acceptance criteria:

- verified fact, inference and limitation clearly separated;
- Vlezet case study and deterministic-authority Note linked;
- facts derive from accepted evidence only;
- no claim that recognition is complete or production accepted;
- Notes Registry, clean route, metadata, Atom feed and generated search deterministic;
- semantic/no-JS content;
- exact-head and deployment-only production verification.

### Later P3.4 candidates

- GameTests versus installed gameplay acceptance.
- Passive PDF validation versus semantics.
- Evidence-driven project state.

## P3.5 — Selective English expansion

Translate only high-value surfaces. Do not create a separate English CMS, build or search architecture.

## P3.6 — Measurement checkpoint

After 3–4 weeks of meaningful aggregate traffic, inspect Cloudflare aggregate traffic and Google/Yandex indexing. Make no engagement claim without sufficient evidence.

---

# Operational checkpoints

- Issue #111: authenticated Yandex actions and delayed crawler observation only.
- Issue #78: default-branch Content Freshness owner run required to refresh the older generated report.
- Issue #82: review on or after **2026-08-17**; no `npm audit fix --force`, shims or unreviewed fork.
- Legacy `.html` compatibility remains until clean-route migration is observed.

# Not priority

Without a reproduced product need, do not plan backend/CMS, second search, runtime publication APIs, accounts/comments, behavioural analytics, separate EN build, hosting migration or automatic public/search-engine mutation.

## New-session rule

Confirm PR #128 exact evidence, Build #945, Pages deployment ID `5764711503`, Production Live Smoke #123 and production artifact `8936914548`. Preserve issue #111/#78/#82 boundaries. Continue with **P3.4C — Hybrid CV + AI recognition boundaries**.
