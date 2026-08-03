# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-03**, во время P2.4i Installed Acceptance Engineering Note.
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

- P0.1 Photo Stories platform — DONE: PR #15 + #17.
- P0.2 First genuine Photo Story — CONTENT DEPENDENT.
- P0.3 Sources Registry / KB — DONE: PR #20.
- P0.4 Project Evidence — DONE: PR #22.
- P0.5 Grounded Notes — DONE: PR #25.
- P0.6 Content Freshness Guard — DONE: PR #27.

## P1 — maintainability / depth

- P1.1 Browser Quality Harness — DONE: PR #29.
- P1.2 Project Metadata Cleanup — DONE: PR #31.
- P1.3 Flagship Case-Study Format — DONE: PR #34.
- P1.4 Additional Grounded Note — DONE: PR #36.

## P2 — audience / operations / content

- P2.1 Minimal RU/EN — DONE: PR #38.
- P2.2 Privacy-friendly analytics — DONE: PR #40.
- P2.2a Production analytics activation — DONE: PR #42.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical rollout and custom-host telemetry — DONE: PRs #48–#50.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and rendered-asset stabilization — DONE: PRs #53/#54/#55/#57/#58.
- P2.4d Vlezet flagship case study — DONE: PR #59.
- P2.4e External Publications Showcase — DONE: PR #61.
- P2.4f VillAIgence flagship case study — DONE: PR #63.
- P2.4g `/now` synchronization — DONE: PR #65.
- P2.4h Product Evidence Reconciliation — DONE: PR #83.

## Repository hardening

- Governance, security policy, ownership, immutable Actions, CodeQL, Dependency Review and bounded Dependabot — DONE: PR #67.
- Compatible dependency and Action updates — DONE: PRs #69/#71/#76/#77/#79/#80/#81.
- Residual `markdown-it@13.0.2` risk — TRACKED: issue #82, review 2026-08-17.

---

# NOW — P2.4i Installed Acceptance Engineering Note

## Goal

Publish one grounded Russian Engineering Note:

**От source tests к installed acceptance: что доказывает каждый release gate**.

This is a concrete VillAIgence release-engineering case study and does not duplicate the general Evidence Layer Note `Почему green CI не означает verified product`.

## Required narrative

```text
0.1.20 installed PARTIAL PASS
→ water / grave / identity / Chat-duration defects
→ source and package corrections PR #99–#101
→ 0.1.21 installed STARTUP FAIL
→ safe rollback + six persistent hashes preserved
→ PR #102 startup correction
→ PR #103 28-scenario catalogue + seven GameTests
→ PR #104 exact production-JAR two-JVM startup/restart PASS
→ cumulative provider/multiplayer/live gameplay acceptance pending
```

The Note must explain:

- source tests as deterministic logic evidence;
- loader/build and remapped package as artifact-shape evidence;
- exact embedded identity as release traceability;
- installed startup as a separate production namespace/classpath gate;
- startup blockers as prerequisites that stop downstream gameplay checks;
- rollback as a valid acceptance outcome with its own service/persistence oracles;
- GameTests as integration evidence, not production-JAR lifecycle proof;
- two separate JVM runs, controlled stop/save/exit and six-store hash evidence;
- real-provider, two-client, focused live gameplay and product-owner cumulative acceptance as pending.

## Static integration

Required surfaces:

- `data/notes.json`;
- article Markdown source;
- Notes index;
- TOC;
- page metadata/OpenGraph;
- build-time Note metadata/navigation;
- Atom feed;
- generated Diplodoc search;
- standard browser/accessibility/visual/custom-domain gates.

No new schema, renderer, CSS, runtime, backend, API, analytics event or search engine.

## TDD evidence

```text
PR:                    #85
RED head:              1687a00fcecb614df386eeceea1057fc63a9b2f4
RED Build:             #645 / 30832535417 — expected FAILURE
RED tests:             318 PASS / 3 expected FAIL
failure scope:         missing registry, Markdown and index/TOC/page-meta surfaces
RED CodeQL:            #85 / 30832537884 — SUCCESS
RED Dependency Review: #73 / 30832535753 — SUCCESS
```

## Implementation GREEN

```text
implementation head:   a6e67fe9e94f8199eddb2500f500c4914ae45a7f
Build:                 #651 / 30832936159 — SUCCESS
CodeQL:                #91 / 30832936148 — SUCCESS
Dependency Review:     #79 / 30832933816 — SUCCESS
unit tests:            321 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8863770773
artifact digest:       sha256:39184bf7191e73c7e3b4c91c37cfead597b330fa5e2f30b030bb48b95acf287d
```

Final exact-head matrix must run after durable documentation changes. Merge and production continuity remain separate facts.

## Completion criteria

1. article preserves every accepted evidence boundary;
2. generated Note has metadata, previous/next/related navigation;
3. Atom feed contains the new entry;
4. generated search finds the title and release-engineering terms;
5. Build, CodeQL and Dependency Review pass on the final exact head;
6. PR #85 is squash-merged with expected-head protection;
7. final squash is recorded through a docs-only continuity sync only if needed.

---

# Immediate operational follow-up

1. Confirm latest Pages deployment after merge.
2. Confirm production Notes index and new Note route.
3. Confirm feed and generated search on the deployed artifact.
4. Run or inspect Content Freshness Guard; close issue #78 only when the generated report is clean.
5. Keep issue #82 open until upstream compatibility exists.

---

# Next content milestones

## P2.4j — deterministic authority around probabilistic proposals — NEXT

Use both flagship projects:

- Vlezet M7.8B: local CV proposes bounded candidates; AI may verify known candidate IDs; deterministic validation and explicit Apply own authoritative mutation.
- VillAIgence: provider output remains proposal until strict parsing, domain bounds, server policy and current-state revalidation.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

Required boundaries:

- distinguish generation/verification from authoritative mutation;
- show why AI cannot create missing Vlezet geometry outside candidate IDs;
- show why valid VillAIgence JSON still does not authorize state/world mutation;
- include stale-decision/current-state revalidation;
- avoid generic AI-safety claims unsupported by project evidence.

## P2.4k — restart and persistence as product contract

Explain:

- why stored bytes are insufficient without startup/read-back/restart evidence;
- deterministic IDs and per-entity isolation;
- six persistent hashes during rollback and automated restart;
- schema/migration compatibility;
- difference between storage implementation and user-visible continuity.

## First genuine Photo Story

Only authentic material. No fake/demo album.

Required input:

- real photographs;
- confirmed chronology/context;
- publishable alt text and captions;
- explicit hero/layout selection.

## External profile rollout and distribution

After the new Note is deployed:

- update canonical site links in external profiles where stale;
- announce selectively, not as bulk promotion;
- link directly to the relevant Note or case study;
- observe aggregate referrers without behavioural tracking.

## Aggregate observation window

Observe for 3–4 weeks:

- aggregate requests/page views;
- country/device data within the current Cloudflare privacy boundary;
- which content surfaces attract meaningful visits;
- whether discovery paths identify a concrete improvement.

Owner test traffic is not audience validation.

---

# External product dependencies

## Vlezet M7.8C

Landing updates only after source-project evidence exists for opening classification, known host-wall identity, bounded placement, stale-decision protection, exact-head benchmark/browser evidence and product-owner acceptance.

Until then M7.8B remains the latest accepted public recognition slice.

## VillAIgence cumulative acceptance

Automated Phase A/B evidence is accepted within scope. Promotion beyond `release-candidate` requires exact installed evidence for:

1. real Text/STT/Chat/TTS and Voice Chat;
2. Chat deadline behavior;
3. logical two-client lore conflict;
4. focused water navigation canary;
5. filled-grave break/place canary;
6. restart and six-store persistence;
7. product-owner cumulative acceptance.

Do not edit `/now` as a substitute for updating canonical project registry/evidence/timeline after a newly accepted source milestone.

---

# Publications growth rules

The catalogue expands only when:

1. material is already completed/published;
2. the user has a substantive public role;
3. official title/date/platform/role are known;
4. stable canonical external evidence exists;
5. no inference or placeholder metadata is needed.

Do not add drafts, submitted papers, future appearances, attendance-only events or live popularity metrics.

---

# Conditional future branches

- Selective RU/EN expansion only when a concrete page has demonstrated value.
- Secondary analytics only when missing aggregate data blocks a real decision and after privacy review.
- Richer architecture explorer only with enough real artifacts.
- Publication filters/local detail pages only after the catalogue meaningfully grows.
- Dependency modernization only through issue #82 upstream compatibility review; never blind `npm audit fix --force`.

---

# Что не является priority

Без нового evidence-backed design decision не планировать:

- migration away from GitHub Pages;
- paid hosting merely because a custom domain exists;
- private TLS certificate management;
- separate EN build/CMS;
- second site-wide search engine;
- runtime publication APIs or scrapers;
- advertising analytics or session replay;
- AI chat поверх резюме;
- accounts/comments/likes;
- backend/database ради static content;
- runtime GitHub API;
- automatic public-state mutation;
- giant QA runner;
- decorative version bumps.

---

# Оптимальная последовательность

```text
P2.4i installed-acceptance Note
→ final CI + merge + deployment confirmation
→ P2.4j deterministic authority around AI proposals
→ P2.4k restart/persistence product contract
→ genuine Photo Story when authentic material exists
→ external-profile rollout and selective distribution
→ 3–4 weeks aggregate observation
→ choose further work from evidence
```

## Правило для нового чата

Перед следующим milestone:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`, `CUSTOM_DOMAIN`;
2. проверить actual open PR/latest commits/exact-head CI;
3. проверить latest Pages deployment reports and production routes;
4. проверить HTTPS/redirects and RU/EN canonical identity;
5. проверить Cloudflare telemetry current hostname;
6. проверить current Vlezet and VillAIgence source truth;
7. различать source/package/GameTest/production-JAR/manual cumulative evidence;
8. проверить Content Freshness issue #78 and dependency issue #82.
