# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после merge P2.4k Restart and Persistence Engineering Note.
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
- **exact artifact → installed acceptance** как явную release boundary;
- **byte continuity ≠ structural readability ≠ semantic continuity ≠ behavioral continuity**.

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
- Restart and Persistence Engineering Note — PR #89.

## Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency updates — PRs #69/#71/#76/#77/#79/#80/#81.
- Dependency maintenance owner — issue #82; current audit signal requires exact advisory/path triage.

---

# P2.4i — Installed Acceptance Engineering Note — DONE

Published **От source tests к installed acceptance: что доказывает каждый release gate**.

```text
feature PR:            #85 — MERGED
exact feature head:    9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash on master:      c03f8403b77df5a91238d62bd8a143c046511a92
Build:                 #655 / 30833707629 — SUCCESS
unit tests:            321 PASS / 0 FAIL
```

Source tests, package identity, GameTests, production-JAR startup/restart, rollback and cumulative installed acceptance remain separate evidence layers.

---

# P2.4j — Deterministic Authority Around Probabilistic Proposals — DONE

Published **AI может предложить, но не применить: как строить deterministic authority**.

```text
feature PR:            #87 — MERGED
exact feature head:    b38d225d837e5e347184ca09c685a479923ba06e
squash on master:      2fba404bbca9680d934f11f30c8a76347a5ab7b1
Build:                 #668 / 30853751417 — SUCCESS
unit tests:            324 PASS / 0 FAIL
```

Probabilistic proposals remain evidence until deterministic identity, validation, authorization, current-state revalidation and explicit Apply permit one authoritative mutation.

---

# P2.4k — Restart and Persistence as Product Contract — DONE

Published:

**Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence**

Canonical route:

`landing/notes/restart-persistence-is-a-product-contract.html`

## Product model

```text
write
→ completed save
→ controlled shutdown
→ exact artifact restart
→ unique canonical discovery
→ parse and schema check
→ semantic identity/isolation check
→ user-visible continuity
```

Four evidence levels:

1. storage durability;
2. structural readability;
3. semantic continuity;
4. behavioral continuity.

Equal SHA-256 is byte-continuity evidence for a no-mutation scenario. It cannot prove read-back, schema compatibility, identity ownership, per-entity isolation or user-visible behavior. Intentional writes and migration may legitimately change hashes.

## Evidence base

- PR #66 — live semantic UUID/`sourceEventIds`, decay ordering and Basiliso/Casimiro isolation across pressure and restart;
- PR #67 — six-store hashes plus Pio/Justino isolation, observable recall and controlled TTS/security failure isolation;
- PRs #92/#95/#102 — startup failure before world load and safe rollback with unchanged persistent state and recovered service;
- PR #103 — GameTest UUID/name/full-inventory NPC round trip;
- PR #104 — exact production-JAR, two independent JVMs, controlled stop/save/exit, exactly one valid JSON per canonical store and stable no-mutation paths/hashes.

Canonical stores:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

## Verification and merge

```text
RED head:              1dfddfa3a7750b62caef4618a6836f7778580a76
RED Build:             #670 / 30855380512 — expected FAILURE
RED tests:             324 PASS / 3 expected FAIL

feature PR:            #89 — MERGED
exact feature head:    e73a94d5d2b832d188e62b8790b4d039ac797a44
squash on master:      40af9e52237f03da58355caa065a40b64ad597d8
Build:                 #680 / 30856377655 — SUCCESS
CodeQL:                #124 / 30856377996 — SUCCESS
Dependency Review:     #108 / 30856377653 — SUCCESS
unit tests:            327 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8872727513
artifact digest:       sha256:932a3275d3cd7d28b9ca117ad6548ce79efbc25fc195803a7cd44748e5a0c625
```

## Static integration

- canonical Notes registry record;
- grounded Markdown article;
- Notes index and TOC;
- metadata/OpenGraph;
- previous/next/related build-time navigation;
- Atom feed;
- generated Diplodoc search;
- exact search assertion for query `persistence contract` and canonical route;
- permanent content/evidence contract;
- no new runtime, schema, renderer, CSS, backend, API, analytics event or second search engine.

## Boundaries retained

- stable bytes do not prove semantic correctness;
- schema/migration/read-back are separate gates;
- GameTest evidence is not production-JAR restart evidence;
- PR #104 is no-mutation automated persistence evidence, not cumulative acceptance;
- rollback proves recovery, not success of the rejected candidate;
- production Pages deployment is not inferred from PR CI.

---

# NOW — Operational Maintenance Closure

После P2.4k следующая conceptual Note не является immediate priority.

## O1 — Content Freshness reconciliation

- получить fresh Content Freshness Guard report;
- проверить, воспроизводятся ли три warnings issue #78 после registry reconciliation;
- закрыть #78 только при clean generated evidence;
- не считать stale issue body текущим scan result.

## O2 — Exact dependency advisory/path triage

- получить `npm audit --json` на exact lockfile;
- определить две high records, advisory IDs и transitive paths;
- проверить, относятся ли они к существующей build-time markdown-it family или к новому path;
- обновить issue #82 measured evidence;
- не применять `npm audit fix --force`, local shims или unreviewed fork.

## O3 — Production deployment verification

Если инструменты позволяют, проверить:

- latest Pages deployment соответствует merged master SHA;
- новая Note route доступна;
- Atom feed содержит Note;
- production search возвращает canonical route;
- custom-domain HTTPS/canonical/analytics boundaries сохранены.

PR artifact evidence остаётся отдельным от live deployment evidence.

## O4 — Genuine content and distribution

- first genuine Photo Story только с authentic material и confirmed chronology;
- external profile links и selective announcements только после production verification;
- aggregate Cloudflare observation 3–4 weeks до audience conclusions.

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

Перед следующим milestone открыть durable docs; проверить actual open PR/latest commits/exact-head CI; отдельно проверить Pages/production routes, Cloudflare, Vlezet/VillAIgence source truth, Content Freshness issue #78 and dependency issue #82; distinguish accepted, Draft, package, GameTest, production-JAR, persistence, server-authority and manual cumulative evidence.
