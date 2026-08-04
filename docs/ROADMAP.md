# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после P2.5a Distribution Readiness и deployment-trigger acceptance.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; operator kit — `docs/DISTRIBUTION.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth or profile mutation;
- bounded Evidence semantics;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking без explicit privacy review;
- repository readiness, generated artifact, deployed production, profile snapshot, external-project acceptance и provider telemetry как разные факты;
- exact artifact → installed acceptance как явную release boundary;
- byte continuity ≠ structural readability ≠ semantic continuity ≠ behavioral continuity;
- dependency evidence не является автоматическим разрешением на fix;
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
- Installed Acceptance Note — PR #85.
- Deterministic Authority Note — PR #87.
- Restart and Persistence Note — PR #89.
- Distribution Contract & Profile Audit — PR #98.

## Operational / security hardening

- Freshness PR evidence and clean issue #78 closure — PR #91.
- Exact dependency audit evidence — PR #93.
- High-severity dependency remediation — PR #94.
- Production Live Smoke — PR #96.
- Deployment-driven live trigger repair — PR #99.
- Trigger model activation-order proof — PR #100.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# P2.5a — Distribution Contract & Profile Audit — DONE

```text
feature PR:                     #98 — MERGED
exact head:                     87685e94f2f81f72510555bb4b613c77bce34d36
squash:                         6973f09ff4613aaa809600f09711d274dbf44cec
Build:                          #719 / 30885477166 — SUCCESS
CodeQL:                         #171 / 30885477170 — SUCCESS
Dependency Review:              #147 / 30885477189 — SUCCESS
Distribution Readiness:         #3 / 30885477173 — SUCCESS
unit tests:                     337 PASS / 0 FAIL
Lighthouse:                     100 / 100 / 100 / 100
```

Delivered:

- eight controlled canonical targets derived from `data/page-meta.json`;
- exact canonical-host validation without tracking query/hash;
- external profile audit states in existing `data/external-links.json`;
- deterministic JSON/Markdown evidence;
- byte-equal tracked `docs/DISTRIBUTION.md`;
- weekly/manual/path-scoped read-only workflow;
- no automatic posting, profile mutation, redirect service or user-level attribution.

Measured snapshot:

```text
verified:                       1
stale:                          3
unverified:                     0
```

P2.5a production proof:

```text
Production Live Smoke:          #12 / 30886377666 — SUCCESS
deployed SHA:                   6973f09ff4613aaa809600f09711d274dbf44cec
deployment id:                  5739340422
artifact:                       8883255231
```

---

# Production Live Smoke trigger repair — DONE

The direct-push-only exact-deployment trigger was not reliable after P2.5a. PR #99 added completed Pages `workflow_run` as the primary orchestration boundary and retained push as fallback.

```text
repair PR:                      #99 — MERGED
repair squash:                  0ec1faef21cf528ecc54d5a16d99552ed3d4805e
Build:                          #721 / 30886377658 — SUCCESS
CodeQL:                         #174 / 30886377653 — SUCCESS
Dependency Review:              #149 / 30886377654 — SUCCESS
fallback Live Smoke:            #13 / 30886807440 — SUCCESS
```

Activation-order acceptance:

```text
design PR:                      #100 — MERGED
exact design squash:            c2de903eabd34ed7d07ace5e3f1eabca48b720e5
source Pages run:               #131 / 30887587364 — SUCCESS
Production Live Smoke:          #16 / 30887639653 — SUCCESS
event:                          workflow_run
deployment id:                  5739649211
artifact:                       8883727019
```

The deployment listener is now proven independently from the direct-push fallback.

---

# NOW — external profile canonicalization gate

Repository automation is complete for P2.5a. The next useful work requires deliberate owner edits outside GitHub.

## Required profile updates

### Habr

Current state: `stale`.

Required outcome:

- public profile contains `https://trueruslan.ru/`;
- rendered link is verified;
- registry state changes to `verified` only after observation.

### Telegram personal

Current state: `stale` because the visible profile exposes the legacy GitHub Pages backlink.

Required outcome:

- legacy backlink removed;
- canonical `https://trueruslan.ru/` exposed;
- rendered profile verified.

### Telegram Blog

Current state: `stale` because the visible channel description exposes the legacy GitHub Pages backlink.

Required outcome:

- legacy backlink removed;
- canonical `https://trueruslan.ru/` exposed;
- rendered channel verified.

## Acceptance after owner edits

1. fetch public rendered profiles;
2. verify exact canonical backlink;
3. update `lastVerified`, `verificationScope` and state;
4. regenerate `docs/DISTRIBUTION.md`;
5. run Distribution Readiness workflow;
6. run complete Build/CodeQL/Dependency Review matrix;
7. merge and require exact `workflow_run` Production Live Smoke.

Automatic profile mutation is prohibited and unavailable through current repository tools.

---

# Conditional next work

## P2.5b public share UI

Do not implement by default. Consider only after profile cleanup and an explicit product need. The current operator kit already provides canonical URLs, audiences, framing and evidence boundaries.

## Genuine Photo Story

Start only when authentic material, chronology, captions/alt text and hero/layout decision exist. No demo album.

## External product updates

- Vlezet public truth changes only after exact-head automation plus same real-plan owner acceptance. M7.8C PR #42 remains Draft; M7.8B remains accepted.
- VillAIgence promotion beyond `release-candidate` still requires real Text/STT/Chat/TTS and Voice Chat, deadline behavior, logical two-client conflict, focused gameplay canaries and product-owner cumulative acceptance. PR #103 and PR #104 remain separate automated evidence layers.

## Dependency blocker

Review issue #82 on or after **2026-08-17**. Accept a fix only when upstream Diplodoc supports a secure markdown-it line and the complete exact-head matrix passes.

## Analytics

Use only aggregate Cloudflare data. Wait 3–4 weeks of meaningful traffic before drawing audience conclusions.

---

# Not priority

Without a new evidence-backed decision, do not plan:

- migration from GitHub Pages;
- paid hosting merely for the custom domain;
- separate EN CMS/build;
- second full-text search;
- runtime publication APIs;
- behavioural analytics/session replay;
- accounts/comments/likes;
- backend/database for static content;
- automatic public/profile mutation;
- decorative version bumps.

## New-session rule

Open durable docs and `docs/DISTRIBUTION.md`; check actual open PR/latest commits/exact-head CI; separately verify latest `github-pages` deployment and event `workflow_run` Production Live Smoke; confirm issue #78 is closed, issue #82 is the remaining repository blocker, external profile states are accurate, Vlezet M7.8C remains Draft and VillAIgence automated evidence remains separate from cumulative acceptance.
