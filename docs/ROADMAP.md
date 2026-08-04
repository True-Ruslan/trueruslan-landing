# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после exact post-merge Production Live Smoke.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking без explicit privacy review;
- repository readiness, generated artifact, deployed production, external-project acceptance и provider telemetry как разные факты;
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
- Installed Acceptance Engineering Note — PR #85.
- Deterministic Authority Engineering Note — PR #87.
- Restart and Persistence Engineering Note — PR #89.

## Operational / security hardening

- Freshness PR evidence and clean issue #78 closure — PR #91.
- Exact full-lockfile dependency audit evidence — PR #93.
- High-severity `brace-expansion` / `undici` remediation — PR #94.
- Production Live Smoke — PR #96.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# O3 — Production Deployment Verification — DONE

PR #96 added a permanent read-only Playwright gate.

```text
feature PR:                     #96 — MERGED
exact PR head:                  593377c24c6af8bbfb044bd6f20bac622e27b270
squash:                         ba4e51810dd532ca0a144fef084276dcba82a02e
Build:                          #706 / 30861085205 — SUCCESS
CodeQL:                         #156 / 30861085202 — SUCCESS
Dependency Review:              #134 / 30861085223 — SUCCESS
PR Production Live Smoke:       #7 / 30861085240 — SUCCESS
post-merge Live Smoke:          #8 / 30861417601 — SUCCESS
unit tests:                     333 PASS / 0 FAIL
Lighthouse:                     100 / 100 / 100 / 100
live artifact:                  8874490022
live digest:                    sha256:cbc5b4099e9e08e0392f996a2434e219a216aac863f2c342b79c129096a0d7b8
```

Exact production proof:

```text
deployed SHA:                   ba4e51810dd532ca0a144fef084276dcba82a02e
caller SHA:                     ba4e51810dd532ca0a144fef084276dcba82a02e
github-pages deployment id:     5735124034
state:                          success
```

Verified live surfaces:

- apex homepage;
- `www → apex` path preservation;
- persistence Note canonical/OpenGraph metadata;
- Atom feed;
- interactive search exact route;
- single Cloudflare beacon;
- no legacy-origin leakage;
- no browser/request failures.

Generated artifact and deployed production remain distinct evidence layers.

---

# NOW — P2.5 Distribution Readiness

## Goal

Prepare canonical, deterministic distribution surfaces for the portfolio without automatic posting, behavioural tracking or fake engagement claims.

## Planned scope

### D1 — Canonical share-target registry

Create one controlled registry for:

- homepage;
- Vlezet flagship;
- VillAIgence flagship;
- Engineering Notes index;
- selected grounded Notes;
- Publications index.

Each record must define stable canonical URL, title, short bounded summary, audience and allowed channels.

### D2 — Deterministic validation

Add tests that require:

- unique IDs and URLs;
- exact canonical metadata coverage;
- no legacy Pages origin;
- no unpublished/non-verifiable target;
- safe channel vocabulary;
- no automatic UTM/user-level identifiers;
- deterministic rendering/output.

### D3 — External-profile link audit

Create a reviewable registry/report with states:

- `verified`;
- `stale`;
- `unverified`.

Scope: GitHub profile/README, Habr profile, Telegram channel and other explicitly configured public identities. No automatic profile mutation.

### D4 — Human distribution checklist

Generate a static checklist for deliberate manual publication:

- destination;
- canonical URL;
- recommended framing;
- evidence boundary;
- verification date;
- post-publication link confirmation.

### D5 — Quality and production proof

Require:

- unit tests;
- production build;
- generated-site integrity;
- Chromium/Axe/Lighthouse;
- Firefox/WebKit;
- search;
- RU/EN;
- metadata/OpenGraph;
- visual regression;
- custom-domain artifact;
- exact post-merge Production Live Smoke.

## Explicit non-goals

- automatic social posting;
- behavioural analytics/session replay;
- per-user attribution;
- engagement promises;
- fake/demo Photo Story;
- public project-status promotion without source acceptance.

---

# Conditional parallel work

## Genuine Photo Story

Start only when authentic material, chronology, captions/alt text and hero/layout decision exist. No demo album.

## External product updates

- Vlezet public truth changes only after exact-head automation plus same real-plan owner acceptance. M7.8C PR #42 remains Draft.
- VillAIgence promotion beyond `release-candidate` still requires real Text/STT/Chat/TTS and Voice Chat, deadline behavior, logical two-client conflict, focused gameplay canaries and product-owner cumulative acceptance.

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
- automatic public-state mutation;
- decorative version bumps.

## New-session rule

Open durable docs, check actual open PR/latest commits/exact-head CI, separately verify latest `github-pages` deployment and Production Live Smoke, confirm issue #78 is closed, issue #82 is the only open repository issue, Vlezet M7.8C remains Draft until owner acceptance, and VillAIgence automation remains separate from manual cumulative acceptance.
