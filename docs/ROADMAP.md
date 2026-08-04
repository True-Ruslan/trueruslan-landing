# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после публикации актуального резюме и exact-SHA production verification.
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
- binary resume и web-CV должны оставаться синхронизированы permanent regression contract;
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
- August 2026 Resume Refresh — PR #108.

## Operational / security hardening

- Freshness PR evidence and issue #78 closure — PR #91.
- Exact dependency audit evidence — PR #93.
- High-severity dependency remediation — PR #94.
- Production Live Smoke — PR #96.
- Deployment-driven live trigger repair — PRs #99/#100.
- Vlezet Draft freshness reconciliation — PR #106.
- Structural PDF-link validation and resolved CodeQL findings — PR #108.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# August 2026 Resume Refresh — DONE

PR #108 synchronized the downloadable PDF and all primary RU/EN professional-profile surfaces from the supplied current facts.

Delivered:

- compact current `cv.pdf` with canonical `https://trueruslan.ru/` links;
- 5+ years commercial experience;
- QWEP role/products and Java 21–25 / Spring Boot 3.5–4 stack;
- current prior-work, AI/MCP, education, teaching and research context;
- synchronized Resume, About, homepage and metadata;
- permanent content/PDF contract;
- reviewed desktop/mobile visual baselines;
- exact URL parsing instead of unsafe substring/regex host checks.

Exact evidence:

```text
feature PR:                      #108 — MERGED
exact head:                      3055c82dc7f6c58d723a5f5c60e0af9f344c240b
squash:                          a85b24d220f9bbfd57176a081f7bce59e41782e8
Build:                           #756 / 30938001730 — SUCCESS
CodeQL:                          #218 / 30938008191 — SUCCESS
Dependency Review:               #184 / 30937995608 — SUCCESS
Distribution Readiness:          #24 / 30937995575 — SUCCESS
unit tests:                      340 PASS / 0 FAIL
Lighthouse:                      100 / 100 / 100 / 100
visual regression:               PASS
source Pages:                     #139 / 30938565671 — SUCCESS
Production Live Smoke:            #33 / 30938639622 — SUCCESS
github-pages deployment id:       5749294655
live artifact:                    8904183580
live digest:                      sha256:14d81aba0d281cf9a36e67a83b467871f7c2442c2e9937169d7fb22f1c26b93e
```

The milestone is closed. Future resume updates should repeat the same data → web surfaces → binary artifact → visual review → exact deployment proof chain.

---

# P2.5a — Distribution Contract & Profile Audit — DONE

PR #98 delivered eight canonical share targets, deterministic validation/runbook generation, controlled profile states and read-only Distribution Readiness evidence.

---

# P2.5b/P2.5c — External Profile Reverification — DONE

Final controlled snapshot:

```text
verified:      4
stale:         0
unverified:    0
```

Verified: GitHub, Habr, Telegram personal and Telegram Blog. Any future state change requires fresh rendered evidence.

---

# Vlezet Draft Freshness Reconciliation — DONE

PR #106 recorded M7.8C PR #42 only as bounded pending Draft evidence while preserving M7.8B as the accepted recognition slice.

```text
accepted recognition slice:     M7.8B
next recognition slice:         M7.8C
PR #42 state:                    open Draft / pending evidence
observed head:                   c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a
product-owner acceptance:        pending
Content Freshness:               #15 / 30906476451 — SUCCESS
issue #78:                       CLOSED / COMPLETED
```

This reconciliation does not authorize merging PR #42 or changing Vlezet public lifecycle.

---

# NOW — operational stability

There is no active resume, external-profile or freshness gate that justifies another automatic feature immediately.

Current operating priorities:

1. preserve exact production verification, current resume contract and all-verified profile snapshot;
2. keep M7.8B accepted while M7.8C remains pending Draft until owner retest;
3. review dependency issue #82 on or after **2026-08-17**;
4. wait for real evidence before changing VillAIgence public status;
5. use aggregate Cloudflare data only after enough meaningful traffic exists;
6. create a genuine Photo Story only after authentic material and chronology are available;
7. accept concrete owner-proposed content/product ideas when they fit the static-first architecture.

---

# Conditional next product work

## P2.5d public share UI

Start only when a concrete user-facing sharing need exists. Do not add generic share buttons merely because a registry exists.

## Genuine Photo Story

Start only when authentic material, chronology, captions/alt text and hero/layout decision exist. No demo album.

## External product updates

- Vlezet M7.8B status: accepted / принят. M7.8C PR #42 remains pending Draft until exact-head automation plus the same real-plan owner acceptance.
- VillAIgence M11 Phase A PR #103 and M11 Phase B PR #104 remain separate from real-provider/gameplay/manual cumulative acceptance.

## Resume/content updates

Start only from a supplied or independently verifiable source. Keep RU/EN web surfaces, metadata and binary PDF synchronized. Do not invent metrics, titles, leadership claims or proprietary details.

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

Open durable docs, check actual open PR/latest commits/exact-head CI, separately verify latest `github-pages` deployment and Production Live Smoke, confirm PR #108 resume product SHA `a85b24d...` remains the accepted deployed baseline, issue #78 is closed with a clean report, issue #82 is the only known repository blocker, profile snapshot is `4 verified / 0 stale`, Vlezet M7.8B remains accepted while M7.8C PR #42 remains pending Draft, and VillAIgence automation remains separate from manual cumulative acceptance.
