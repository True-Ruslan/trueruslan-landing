# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-03**, после merge P2.4i Installed Acceptance Engineering Note.
>
> Текущее состояние — `docs/PROJECT_STATE.md`; история — `docs/CHANGELOG.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

## Принципы

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- no backend/CMS/database без необходимости;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking без explicit privacy review;
- quality gates без ослабления;
- repository readiness, generated artifact, deployed state, external-project acceptance и provider telemetry как разные факты.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Завершённые milestones

## P0 — foundation

- Photo Stories platform — PRs #15/#17; first genuine story remains content-dependent.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
- Content Freshness Guard — PR #27.

## P1 — maintainability / depth

- Browser Quality Harness — PR #29.
- Project Metadata Cleanup — PR #31.
- Flagship Case-Study Format — PR #34.
- Additional Grounded Note — PR #36.

## P2 — audience / operations / content

- Minimal RU/EN — PR #38.
- Privacy-friendly analytics and activation — PRs #40/#42.
- Custom domain and HTTPS — PR #45, run `30704218399`.
- Canonical rollout/header/search/Photo stabilization — PRs #48–#58.
- Vlezet flagship — PR #59.
- Publications — PR #61.
- VillAIgence flagship — PR #63.
- `/now` synchronization — PR #65.
- Product Evidence Reconciliation — PR #83.
- Installed Acceptance Engineering Note — PR #85.

## Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency updates — PRs #69/#71/#76/#77/#79/#80/#81.
- Residual `markdown-it@13.0.2` risk — issue #82, next review 2026-08-17.

---

# P2.4i — Installed Acceptance Engineering Note — DONE

Published:

**От source tests к installed acceptance: что доказывает каждый release gate**.

The Note preserves **exact artifact → installed acceptance** as an explicit boundary: exact release identity and package inspection are required evidence, but they do not prove that the same artifact starts, stops, saves and restarts in the production runtime.

```text
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash on master:      c03f8403b77df5a91238d62bd8a143c046511a92
Build:                 #655 / 30833707629 — SUCCESS
CodeQL:                #95 / 30833706682 — SUCCESS
Dependency Review:     #83 / 30833707121 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8864072101
artifact digest:       sha256:b89fb185c7a2b8f54aa1dae81415cd28be92fe885c89e108a293894ae9cb2daa
```

Delivered surfaces:

- canonical Note registry and Markdown source;
- Notes index and TOC;
- metadata/OpenGraph;
- previous/next/related navigation;
- Atom feed;
- generated search;
- permanent RED/GREEN contract;
- synchronized durable state.

Boundaries retained:

- `0.1.20` remains partial PASS;
- `0.1.21` remains installed startup failure with safe rollback;
- PR #103 GameTests and PR #104 production-JAR lifecycle proof remain separate;
- real provider, two-client, focused live gameplay and product-owner cumulative acceptance remain pending;
- no new runtime, renderer, backend, API, analytics event or search engine.

---

# Immediate operational follow-up

1. Confirm latest Pages deployment after PR #85.
2. Confirm production Notes index and `source-tests-to-installed-acceptance` route.
3. Confirm deployed Atom feed and generated search.
4. Run or inspect Content Freshness Guard; close issue #78 only when generated evidence is clean.
5. Keep issue #82 open until upstream compatibility exists.

---

# NOW — P2.4j Deterministic Authority Around Probabilistic Proposals

## Goal

Publish a grounded Engineering Note using both Vlezet and VillAIgence:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

## Vlezet evidence

- local CV proposes bounded wall/opening candidates;
- AI may confirm or reject known candidate IDs;
- provider strength can verify more existing candidates but cannot create missing geometry outside the candidate set;
- deterministic validation owns geometry/topology invariants;
- explicit Apply owns authoritative document mutation;
- stale review decisions must be revalidated against current draft state.

## VillAIgence evidence

- strict JSON parsing and type/domain validation treat provider output as external protocol data;
- a syntactically valid decision is still only a proposal;
- server policy, permissions, current world state and entity identity own authorization;
- cancellation and current-state revalidation prevent stale model decisions from mutating the world;
- provider text never becomes authoritative merely because HTTP/provider execution succeeded.

## Required narrative boundaries

- distinguish generation, verification, validation, authorization and mutation;
- explain why deterministic authority is not the same as eliminating AI uncertainty;
- include explicit stale-decision/current-state revalidation;
- avoid generic AI-safety or model-quality claims unsupported by project evidence;
- preserve Vlezet pre-production and VillAIgence release-candidate lifecycle boundaries.

## Expected static integration

Use the existing Notes registry/index/TOC/page-meta/feed/search architecture. No new runtime, visual system, backend or analytics event.

---

# Following content milestones

## P2.4k — restart and persistence as product contract

Explain why stored bytes are insufficient without startup/read-back/restart evidence, deterministic IDs, per-entity isolation, six-store hashes, schema/migration compatibility and user-visible continuity.

## First genuine Photo Story

Only authentic material with confirmed chronology, publishable alt text/captions and an explicit hero/layout decision. No fake/demo album.

## External profile rollout and distribution

After deployment confirmation:

- update stale canonical links in external profiles;
- announce selectively and link directly to the relevant Note/case study;
- observe aggregate referrers without behavioural tracking.

## Aggregate observation window

Observe for 3–4 weeks: aggregate requests/page views, privacy-bounded country/device data, meaningful content surfaces and concrete discovery-path improvements. Owner test traffic is not audience validation.

---

# External product dependencies

## Vlezet M7.8C

Landing updates only after source evidence exists for opening classification, known host-wall identity, bounded placement, stale-decision protection, exact-head benchmark/browser evidence and product-owner acceptance. M7.8B remains the latest accepted public recognition slice.

## VillAIgence cumulative acceptance

Promotion beyond `release-candidate` still requires real Text/STT/Chat/TTS and Voice Chat, Chat deadline behavior, logical two-client conflict, focused water and filled-grave canaries, restart/six-store persistence and product-owner cumulative acceptance.

Do not edit `/now` as a substitute for updating canonical registry/evidence/timeline after a newly accepted source milestone.

---

# Publications growth rules

Add only completed, externally verifiable work with known title/date/platform/role and stable canonical evidence. Do not add drafts, submitted papers, future appearances, attendance-only events or live popularity metrics.

---

# Conditional future branches

- Selective RU/EN expansion only for a concrete valuable page.
- Secondary analytics only when missing aggregate data blocks a decision and after privacy review.
- Richer architecture explorer only with enough real artifacts.
- Publication filters/detail pages only after catalogue growth.
- Dependency modernization only through issue #82; never blind `npm audit fix --force`.

---

# Что не является priority

Без нового evidence-backed design decision не планировать migration from GitHub Pages, paid hosting merely for the custom domain, private TLS management, separate EN CMS/build, second full-text search, runtime publication APIs, advertising analytics/session replay, AI chat over the CV, accounts/comments/likes, backend/database for static content, runtime GitHub API, automatic public-state mutation or decorative version bumps.

---

# Оптимальная последовательность

```text
P2.4i deployment confirmation
→ P2.4j deterministic authority around AI proposals
→ P2.4k restart/persistence product contract
→ genuine Photo Story when authentic material exists
→ external-profile rollout and selective distribution
→ 3–4 weeks aggregate observation
→ choose further work from evidence
```

## Правило для нового чата

Перед следующим milestone открыть durable docs; проверить actual open PR/latest commits/exact-head CI; separately verify Pages/production routes, HTTPS/redirects, Cloudflare, Vlezet/VillAIgence source truth, Content Freshness issue #78 and dependency issue #82; distinguish source/package/GameTest/production-JAR/manual cumulative evidence.
