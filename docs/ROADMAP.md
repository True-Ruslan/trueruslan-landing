# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после проверки внешних профилей и Vlezet freshness reconciliation.
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
- Draft evidence не является accepted evidence;
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
- Distribution Contract & Profile Audit — PR #98.
- External Profile Reverification — PRs #102/#104.

## Operational / security hardening

- Freshness PR evidence and issue #78 closure — PR #91.
- Exact dependency audit evidence — PR #93.
- High-severity dependency remediation — PR #94.
- Production Live Smoke — PR #96.
- Deployment-driven live trigger repair — PRs #99/#100.
- Vlezet Draft freshness reconciliation — PR #106.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# P2.5a — Distribution Contract & Profile Audit — DONE

PR #98 delivered eight canonical share targets, deterministic validation/runbook generation, controlled profile states and read-only Distribution Readiness evidence. Initial state: `1 verified / 3 stale / 0 unverified`.

---

# P2.5b/P2.5c — External Profile Reverification — DONE

Final controlled snapshot:

```text
verified:      4
stale:         0
unverified:    0
```

Verified:

- GitHub profile;
- Habr profile;
- Telegram personal profile;
- Telegram Blog.

Telegram Blog verification is grounded in the public `/s/` channel representation and multiple fresh preview endpoints exposing `https://trueruslan.ru/`. One initial bare-card response was stale cache and is not treated as current public truth.

```text
feature PR:                     #104 — MERGED
exact head:                     5972236eac07325bf3bf1d8cf42ad24455c9a600
squash:                         b5766cfa9cba20fb9588c05e6e6d891ded329357
Build:                          #732 / 30904009048 — SUCCESS
Distribution Readiness:         #11 / 30904008961 — SUCCESS
Production Live Smoke:          #25 / 30904659212 — SUCCESS
```

The external-profile canonicalization gate is closed. Any future state change requires fresh rendered evidence.

---

# Vlezet Draft Freshness Reconciliation — DONE

Freshness issue #78 reopened because repository activity on 2026-08-04 was newer than the previous controlled Vlezet snapshot. Inspection confirmed that the activity belonged to M7.8C PR #42, which remains Draft and still requires the same real-plan product-owner retest.

PR #106 recorded only a bounded pending signal:

```text
accepted recognition slice:     M7.8B
next recognition slice:         M7.8C
PR #42 state:                    open Draft / pending evidence
observed head:                   c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a
product-owner acceptance:        pending
```

Exact evidence:

```text
feature PR:                      #106 — MERGED
exact head:                      c749a2fe3e9fdae789e6902bab266bf324c69b2d
squash:                          5742a25b16ec4c1128fc0bcf03227cf6e4666f60
Build:                           #735 / 30906476472 — SUCCESS
CodeQL:                          #195 / 30906476404 — SUCCESS
Dependency Review:               #163 / 30906476638 — SUCCESS
Content Freshness:               #15 / 30906476451 — SUCCESS
unit tests:                      338 PASS / 0 FAIL
freshness report:                0 findings / 0 warnings / 0 errors
Production Live Smoke:           #29 / 30907129018 — SUCCESS
```

Issue #78 is closed/completed from clean evidence. This reconciliation does not authorize merging PR #42 or changing Vlezet public lifecycle.

---

# NOW — operational stability

There is no active external-profile or freshness gate that justifies another automatic feature immediately.

Current operating priorities:

1. preserve exact production verification and all-verified profile snapshot;
2. keep M7.8B accepted while M7.8C remains pending Draft until owner retest;
3. review dependency issue #82 on or after **2026-08-17**;
4. wait for real evidence before changing VillAIgence public status;
5. use aggregate Cloudflare data only after enough meaningful traffic exists;
6. create a genuine Photo Story only after authentic material and chronology are available.

---

# Conditional next product work

## P2.5d public share UI

Start only when a concrete user-facing sharing need exists. Do not add generic share buttons merely because a registry exists.

## Genuine Photo Story

Start only when authentic material, chronology, captions/alt text and hero/layout decision exist. No demo album.

## External product updates

- Vlezet M7.8B status: accepted / принят. M7.8C PR #42 remains pending Draft until exact-head automation plus the same real-plan owner acceptance.
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

Open durable docs, check actual open PR/latest commits/exact-head CI, separately verify latest `github-pages` deployment and Production Live Smoke, confirm issue #78 is closed with a clean report, issue #82 is the only open repository issue, the profile snapshot is `4 verified / 0 stale`, Vlezet M7.8B remains accepted while M7.8C PR #42 remains pending Draft until owner acceptance, and VillAIgence automation remains separate from manual cumulative acceptance.
