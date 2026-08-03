# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-03**, после merge P2.4j Deterministic Authority Engineering Note.
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
- repository readiness, generated artifact, deployed state, external-project acceptance и provider telemetry как разные факты;
- **exact artifact → installed acceptance** как явную release boundary.

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
- Deterministic Authority Engineering Note — PR #87.

## Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency updates — PRs #69/#71/#76/#77/#79/#80/#81.
- Dependency maintenance owner — issue #82; current audit signal requires fresh triage.

---

# P2.4i — Installed Acceptance Engineering Note — DONE

Published:

**От source tests к installed acceptance: что доказывает каждый release gate**.

```text
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash on master:      c03f8403b77df5a91238d62bd8a143c046511a92
Build:                 #655 / 30833707629 — SUCCESS
unit tests:            321 PASS / 0 FAIL
```

This milestone preserves source tests, package identity, GameTests, production-JAR startup/restart, rollback and cumulative installed acceptance as separate evidence layers.

---

# P2.4j — Deterministic Authority Around Probabilistic Proposals — DONE

Published:

**AI может предложить, но не применить: как строить deterministic authority**.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

```text
feature PR:            #87 — MERGED
exact feature head:    b38d225d837e5e347184ca09c685a479923ba06e
squash on master:      2fba404bbca9680d934f11f30c8a76347a5ab7b1
Build:                 #668 / 30853751417 — SUCCESS
CodeQL:                #110 / 30853751740 — SUCCESS
Dependency Review:     #96 / 30853751469 — SUCCESS
unit tests:            324 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8871721514
artifact digest:       sha256:af0a406ec92352ab356618a563e885cd8413818bfaa59326a83235db3f521838
```

Delivered:

- one proposal → identity → validation → authorization → current-state revalidation → decision → atomic mutation model;
- accepted Vlezet M7.8B PR #41 separated from Draft M7.8C PR #42;
- immutable candidate IDs/geometry, deterministic validation, explicit Apply and semantic Undo;
- VillAIgence server-side permission/identity resolution, SHA-256 revision conflict and mutation only on APPLY;
- canonical Note registry, index, TOC, metadata/OpenGraph, feed and build-time navigation;
- exact browser search assertion for query `deterministic authority` and canonical Note route;
- no schema, renderer, CSS, runtime, backend, API, analytics event or second search engine.

Boundaries retained:

- Vlezet PR #42 remains Draft and owner-retest dependent;
- arbitrary-plan recognition accuracy is not claimed;
- provider cannot repair missing Vlezet geometry;
- valid VillAIgence JSON is not mutation authority;
- real-provider, multiplayer and cumulative acceptance remain pending;
- no universal AI-safety or invented product metrics.

---

# Immediate operational follow-up

1. Confirm latest Pages deployment after PR #87.
2. Confirm production Note route, Atom feed and exact generated search result.
3. Run or inspect Content Freshness Guard; close issue #78 only when generated evidence is clean.
4. Re-triage issue #82 because current `npm ci` reports `6 moderate / 2 high` on the unchanged graph.
5. Never use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork.

---

# NOW — P2.4k Restart and Persistence as Product Contract

## Goal

Publish a grounded Engineering Note explaining why persistence is a product contract rather than a successful file write.

## Required argument

```text
write bytes
→ controlled shutdown
→ independent startup
→ read-back and identity reconstruction
→ path/hash/schema checks
→ semantic continuity
→ product acceptance
```

Stored bytes prove only that serialization occurred. They do not prove that the exact release can start, read the data, preserve entity identity, survive migration and expose the same user-visible state after restart.

## Evidence base

### VillAIgence

- deterministic NPC/memory identifiers and per-entity isolation;
- Memory 2.0 stores and six canonical persistent files;
- `0.1.20` partial installed acceptance;
- `0.1.21` startup failure followed by safe rollback;
- six persistent hashes preserved across rollback;
- PR #104 two independent exact production-JAR JVM runs with controlled stop/save/exit and stable paths/hashes;
- manual cumulative provider/gameplay acceptance remains separate.

### Landing / static platform

Use only where helpful to distinguish generated artifact persistence from deployed production state. Do not imply that static build continuity is equivalent to game-world persistence.

## Required boundaries

- bytes vs readable semantic state;
- stable path/hash vs semantic correctness;
- deterministic identity vs accidental array/order identity;
- schema compatibility and migration;
- entity isolation and cross-entity contamination;
- rollback as service and persistence recovery;
- exact release restart vs dev/Loom runtime;
- automated persistence evidence vs owner-visible continuity.

## Static integration

Use the existing Notes registry/index/TOC/page-meta/feed/search architecture and current quality matrix. No new runtime, database, API, analytics event or search engine.

---

# Following content milestones

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

Landing public truth updates only after exact-head automated evidence plus the same real-plan product-owner acceptance. Until then M7.8B remains the latest accepted public recognition slice.

## VillAIgence cumulative acceptance

Promotion beyond `release-candidate` still requires real Text/STT/Chat/TTS and Voice Chat, Chat deadline behavior, logical two-client conflict, focused water and filled-grave canaries, restart/six-store persistence and product-owner cumulative acceptance.

Do not edit `/now` as a substitute for updating canonical registry/evidence/timeline after a newly accepted source milestone.

---

# Publications growth rules

Add only completed, externally verifiable work with known title/date/platform/role and stable canonical evidence. Do not add drafts, submitted papers, future appearances, attendance-only events or live popularity metrics.

---

# Что не является priority

Без нового evidence-backed design decision не планировать migration from GitHub Pages, paid hosting merely for the custom domain, private TLS management, separate EN CMS/build, second full-text search, runtime publication APIs, advertising analytics/session replay, AI chat over the CV, accounts/comments/likes, backend/database for static content, runtime GitHub API, automatic public-state mutation or decorative version bumps.

## Правило для нового чата

Перед следующим milestone открыть durable docs; проверить actual open PR/latest commits/exact-head CI; отдельно проверить Pages/production routes, Cloudflare, Vlezet/VillAIgence source truth, Content Freshness issue #78 and dependency issue #82; distinguish accepted, Draft, package, GameTest, production-JAR, server-authority, persistence and manual cumulative evidence.
