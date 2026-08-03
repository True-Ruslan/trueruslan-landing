# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-03**, во время P2.4j Deterministic Authority Engineering Note.
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
CodeQL:                #95 / 30833706682 — SUCCESS
Dependency Review:     #83 / 30833707121 — SUCCESS
unit tests:            321 PASS / 0 FAIL
```

This milestone preserves source tests, package identity, GameTests, production-JAR startup/restart, rollback and cumulative installed acceptance as separate evidence layers.

---

# NOW — P2.4j Deterministic Authority Around Probabilistic Proposals

## Goal

Publish:

**AI может предложить, но не применить: как строить deterministic authority**.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

## Authority pipeline

```text
proposal
→ known identity binding
→ shape and bounds validation
→ product-policy authorization
→ current-state revalidation
→ APPLY / CONFLICT / REJECT / UNCHANGED
→ atomic authoritative mutation
```

## Vlezet evidence

### Accepted foundation

- M7.8B PR #41 is accepted / принят;
- local CV proposes bounded candidates;
- AI verifies exact known candidate IDs and coordinates;
- IDs and geometry remain immutable during verification;
- unknown IDs, moved geometry and cloud-only geometry fail closed;
- provider strength can verify more existing candidates but cannot create missing geometry;
- deterministic validation and explicit Apply own canonical document mutation;
- semantic Undo remains the recovery boundary.

### Current Draft evidence

Vlezet M7.8C PR #42 is Draft and awaits product-owner retest. It may support the article as current implementation evidence but must not be represented as accepted, merged or production-ready.

Allowed observations:

- strict-ID / geometry-immutable verification;
- active vs diagnostic geometry;
- blocked candidates excluded from topology, host analysis and Apply;
- AI cannot create, move, resize, thicken or re-host geometry.

## VillAIgence evidence

Use merged operator-lore PR #85:

- permission is checked server-side;
- WORLD/PLAYER/VILLAGER/VILLAGE identity is derived from authenticated/live state;
- arbitrary UUID/dimension/village IDs are not accepted as request authority;
- payload bounds and canonicalization fail closed;
- write compares expected and current SHA-256 revision;
- stale write returns `CONFLICT` without mutation;
- replay returns `UNCHANGED`;
- persistent store changes only on `APPLY`.

PR #103 GameTests and PR #104 production-JAR lifecycle proof remain separate acceptance layers. Real-provider, multiplayer and product-owner cumulative acceptance remain pending.

## Static integration

Required surfaces:

- canonical Notes registry;
- grounded Markdown article;
- Notes index and TOC;
- page metadata/OpenGraph;
- build-time previous/next/related navigation;
- Atom feed;
- generated Diplodoc search;
- exact browser assertion for query `deterministic authority`;
- permanent content/evidence contract;
- existing browser/accessibility/visual/custom-domain matrix.

No new schema, renderer, CSS, runtime, backend, API, analytics event or search engine.

## TDD evidence

```text
PR:                    #87
RED head:              1422efbaa6f0d4791d511bfb71fa89f1712c6604
RED Build:             #658 / 30852218324 — expected FAILURE
RED tests:             321 PASS / 3 expected FAIL
RED CodeQL:            #100 / 30852218498 — SUCCESS
RED Dependency Review: #86 / 30852220087 — SUCCESS
failure scope:         missing registry, article and discovery surfaces

implementation head:   e8cad3b7f0dbf468ffebb1d55ea4d269143a758d
Build:                 #665 / 30853200992 — SUCCESS
CodeQL:                #107 / 30853201468 — SUCCESS
Dependency Review:     #93 / 30853201100 — SUCCESS
unit tests:            324 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8871540363
artifact digest:       sha256:ffafe7d916a39a25b6162f8fdc06656bc855ef3133ab2496c81ac0e5364a25e6
```

Final exact-head matrix must run after durable documentation changes. PR merge and production Pages deployment remain separate facts.

## Completion criteria

1. accepted Vlezet #41 and Draft #42 are visibly distinct;
2. both products map to the same deterministic authority pipeline;
3. the Note does not promote project lifecycle or invent metrics;
4. feed, navigation and generated search include the Note;
5. exact query `deterministic authority` returns the canonical Note route;
6. Build, CodeQL and Dependency Review pass on final exact head;
7. PR #87 squash-merges with expected-head protection;
8. final squash is persisted through a docs-only continuity sync.

---

# Immediate operational follow-up

1. Confirm latest Pages deployment after merge.
2. Confirm production Note route, Atom feed and generated search result.
3. Run or inspect Content Freshness Guard; close issue #78 only when generated evidence is clean.
4. Re-triage issue #82 because current `npm ci` reports `6 moderate / 2 high` on the unchanged graph.
5. Never use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork.

---

# NEXT — P2.4k Restart and Persistence as Product Contract

Explain why stored bytes are insufficient without:

- startup and read-back;
- controlled shutdown and independent restart;
- deterministic identity and per-entity isolation;
- six-store path/hash continuity;
- schema/migration compatibility;
- rollback and recovery oracles;
- user-visible continuity rather than storage implementation alone.

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

Перед следующим milestone открыть durable docs; проверить actual open PR/latest commits/exact-head CI; отдельно проверить Pages/production routes, Cloudflare, Vlezet/VillAIgence source truth, Content Freshness issue #78 and dependency issue #82; distinguish accepted, Draft, package, GameTest, production-JAR, server-authority and manual cumulative evidence.
