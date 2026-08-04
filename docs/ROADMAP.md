# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после P2.5b External Profile Reverification.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; distribution operator kit — `docs/DISTRIBUTION.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth or external-profile mutation;
- bounded Evidence semantics;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking без explicit privacy review;
- repository readiness, generated artifact, deployed production, external-project acceptance и provider telemetry как разные факты;
- exact artifact and installed acceptance as separate release gates;
- byte continuity ≠ structural readability ≠ semantic continuity ≠ behavioral continuity;
- dependency evidence не является автоматическим разрешением на fix;
- distribution readiness не является audience-growth claim;
- quality gates без ослабления.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Completed milestones

## Foundation / depth

- Photo Stories platform — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
- Content Freshness Guard — PR #27.
- Browser Quality Harness — PR #29.
- Project Metadata Cleanup — PR #31.
- Flagship Case-Study Format — PR #34.
- Additional Grounded Note — PR #36.

## Audience / operations / content

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

## Operational / security hardening

- Freshness PR evidence and clean issue #78 closure — PR #91.
- Exact dependency audit evidence — PR #93.
- High-severity dependency remediation — PR #94.
- Production Live Smoke — PR #96.
- Deployment-driven live trigger repair — PRs #99/#100.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# P2.5a — Distribution Contract & Profile Audit — DONE

PR #98 delivered eight canonical share targets, deterministic validation/runbook generation, controlled profile states and read-only Distribution Readiness evidence. Initial state: `1 verified / 3 stale / 0 unverified`.

---

# P2.5b — External Profile Reverification — CURRENTLY 3/4 VERIFIED

PR #102 reconciled fresh rendered public evidence:

```text
verified:      3
stale:         1
unverified:    0
```

Verified:

- GitHub profile;
- Habr profile;
- Telegram personal profile.

Still stale:

- Telegram Blog — rendered public description still exposes the legacy GitHub Pages backlink and does not yet expose `https://trueruslan.ru/`.

Exact implementation evidence:

```text
feature PR:                     #102 — MERGED
exact head:                     ee6c9d5c08c5eee67c3ae7d7ff8fa3723af1458a
squash:                         5cd846e4c618d1f6d10aab21c844a26e41fc0777
Build:                          #728 / 30900062771 — SUCCESS
CodeQL:                         #184 / 30900062963 — SUCCESS
Dependency Review:              #156 / 30900062754 — SUCCESS
Distribution Readiness:         #8 / 30900062778 — SUCCESS
unit tests:                     337 PASS / 0 FAIL
Lighthouse:                     100 / 100 / 100 / 100
```

Exact production proof:

```text
Pages workflow:                 #136 / 30900569283 — SUCCESS
Production Live Smoke:          #21 / 30900609547 — SUCCESS
event:                          workflow_run
deployed/caller SHA:            5cd846e4c618d1f6d10aab21c844a26e41fc0777
deployment id:                  5742059989
live artifact:                  8888917544
```

---

# NOW — Telegram Blog final canonicalization gate

The rendered public Telegram Blog description must:

- expose `https://trueruslan.ru/`;
- no longer expose `https://true-ruslan.github.io/trueruslan-landing/about.html`.

After the public preview changes:

1. re-fetch the rendered channel page;
2. update `telegram-blog` to `verified` with a fresh date and positive verification scope;
3. regenerate `docs/DISTRIBUTION.md`;
4. require Distribution Readiness, Build, CodeQL and Dependency Review;
5. require full browser/accessibility/search/metadata/visual/custom-domain matrix;
6. require exact post-merge Production Live Smoke.

No available repository tool may mutate the Telegram channel automatically.

---

# Conditional next product work

## P2.5c public share UI

Start only when a concrete user-facing sharing need exists. Do not add generic share buttons merely because a registry exists.

## Genuine Photo Story

Start only when authentic material, chronology, captions/alt text and hero/layout decision exist. No demo album.

## External product updates

- Vlezet M7.8B status: accepted / принят. M7.8C PR #42 remains Draft until exact-head automation plus the same real-plan owner acceptance.
- VillAIgence M11 Phase A PR #103 and M11 Phase B PR #104 remain separate from real-provider/gameplay/manual cumulative acceptance.

## Dependency blocker

Review issue #82 on or after **2026-08-17**. Accept a fix only when upstream Diplodoc supports a secure markdown-it line and the complete exact-head matrix passes.

## Analytics

Use only aggregate Cloudflare data. Wait 3–4 weeks of meaningful traffic before drawing audience conclusions.

---

# Not priority

Without a new evidence-backed design decision, do not plan:

- migration from GitHub Pages;
- paid hosting merely for the custom domain;
- separate EN CMS/build;
- second full-text search;
- runtime publication APIs;
- behavioural analytics/session replay;
- accounts/comments/likes;
- backend/database for static content;
- automatic public-state or profile mutation;
- decorative version bumps.

## New-session rule

Open durable docs, check actual open PR/latest commits/exact-head CI, separately verify latest `github-pages` deployment and Production Live Smoke, confirm issue #78 is closed, issue #82 is the only open repository issue, the profile snapshot is `3 verified / 1 stale`, Vlezet M7.8C remains Draft until owner acceptance, and VillAIgence automation remains separate from manual cumulative acceptance.
