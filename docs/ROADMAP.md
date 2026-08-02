# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-02**, после публикации VillAIgence flagship case study.
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
- stable project routes/keys без migration plan;
- one RU/EN site/build/search architecture;
- analytics как optional aggregate telemetry;
- no behavioural/user tracking без explicit privacy review;
- quality gates без ослабления;
- repository readiness, deployed state, source-product acceptance и provider telemetry как разные факты.

Главная продуктовая формула:

**что я создаю → что я изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

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
- P2.2a Production analytics activation — DONE: PR #42 + strict deployment.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical rollout and first custom-host telemetry — DONE: PRs #48–#50.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and rendered-asset stabilization — DONE: PRs #53/#54/#55/#57.
- P2.4c durable state sync — DONE: PR #58.
- P2.4d Vlezet flagship case study — DONE: PR #59, Build #486.
- P2.4e External Publications Showcase — DONE: PR #61, Build #539.
- **P2.4f VillAIgence flagship case study — DONE: PR #63, Build #567.**

## P2.4f evidence

```text
feature PR:          #63
exact feature head:  90e03b4a793bde9d8088ee930da74ebc19edfa3c
Build / run:         #567 / 30761930974 SUCCESS
squash on master:    00da9ee983f17f8f5e1b5e5f353fad852fee337c
unit tests:          306 PASS / 0 FAIL
artifact:            8837765509
artifact digest:     sha256:3aa538f9bad7eeeefd54ff24511fe700b90eedc7c872e85ffe5bd673322fa78c
```

Delivered:

- public VillAIgence identity on the stable `livingworld` route/key;
- current Project Registry, timeline and three-signal Evidence snapshot;
- seven-section authority/memory/security/release narrative;
- RU and bounded EN case-study surfaces;
- production-safe authority + installed-acceptance SVG;
- exact source boundary through VillAIgence head `e13660f5998fa1ed343548252d573140adc5b0c9`;
- explicit `0.1.20 PARTIAL PASS`, `0.1.21 STARTUP FAIL`, `0.1.22 live acceptance pending` distinction;
- Chromium/Axe/Lighthouse, mobile, Firefox/WebKit, search, Evidence, diagram, metadata, Engineering Map and visual gates;
- custom-domain artifact verification.

No runtime VillAIgence code or release was changed. The landing milestone does not close the source project's pending installed `0.1.22+1.21.1` acceptance.

---

# NOW — Content Consolidation and Distribution Loop

Infrastructure, flagship depth and the external-publication catalogue are no longer the main blockers.

## Immediate operational follow-up

1. Confirm latest Pages deployment after PR #63 and continuity sync.
2. Confirm production VillAIgence route, diagram, Evidence, search and canonical metadata visually.
3. Confirm production Vlezet and Publications routes remain correct.
4. Keep weekly External health and Content Freshness green.
5. Manually update external surfaces if stale:
   - GitHub profile Website;
   - Habr profile/articles;
   - Telegram profile/channel descriptions;
   - other professional profiles.
6. Distribute the site and observe aggregate Cloudflare data for 3–4 weeks.

Do not treat owner test traffic as audience validation.

## Priority content sprint

### 1. Vlezet flagship case study — DONE

Published with explicit Draft authority and failed representative recognition acceptance.

### 2. External Publications Showcase — DONE

Published as an evidence-backed external catalogue. Add records only after publication/completion and stable canonical verification.

### 3. VillAIgence flagship case study — DONE

Published with stable route compatibility and source/package/installed acceptance boundaries.

### 4. `/now` synchronization — NEXT

Update current focus to reflect:

- Vlezet recognition remains active and product acceptance is not complete;
- VillAIgence landing case study is published while exact source-product `0.1.22` installed acceptance remains pending;
- Publications is live and grows only by verified completed work;
- next landing work is content consolidation/distribution, not a new infrastructure layer.

Expected deliverables:

- update `data/now.json` and generated `/now` content;
- preserve registry-derived active project cards/statuses;
- avoid copying volatile source-project details that require frequent manual changes;
- exact-head browser/search/visual verification;
- continuity update only if the resulting product state materially changes.

### 5. Grounded Engineering Notes

Publish 1–2 notes derived from completed implementation evidence. Strong candidates:

1. **Почему source/package green не равен installed acceptance**
   - VillAIgence `0.1.21` startup failure;
   - direct owned-source wiring versus fragile Mixin injection;
   - exact JAR identity, startup, focused replay, restart and persistent hashes.

2. **Authority map вокруг LLM proposal**
   - immutable bounded context;
   - FACT/BELIEF provenance;
   - operator lore;
   - revalidation before authoritative effect.

3. **Почему benchmark PASS может провалить representative product source**
   - Vlezet M7.8A versus M7.8B;
   - metrics, source fixtures and owner acceptance as separate gates.

4. **Почему post-build HTML может не попасть в search index**
   - Publications search-boundary RED;
   - native prebuild include versus postprocessing.

Each Note must cite project evidence and avoid broad universal claims.

### 6. First genuine Photo Story

Only authentic material. No fake/demo album. Platform is ready; content is the blocker.

### 7. Distribution and observation

After `/now` and Notes:

- publish/share the site on relevant external profiles;
- collect aggregate Cloudflare telemetry for 3–4 weeks;
- compare landing, projects, notes, publications and search usage only at aggregate level;
- choose further RU/EN/content work from evidence.

---

# Source-project dependencies

## VillAIgence installed acceptance — EXTERNAL TO LANDING

The landing must keep current source truth bounded:

- `0.1.20` installed partial PASS;
- `0.1.21` startup FAIL + safe rollback;
- PR #102 automated/package correction;
- exact `0.1.22` installed cumulative acceptance pending.

When VillAIgence source evidence changes:

1. verify current branch head, release/tag and open PRs;
2. read exact installed acceptance evidence;
3. update landing timeline/Evidence only if the bounded public truth changed;
4. never infer installed PASS from merged code or green source CI.

## Vlezet recognition acceptance — EXTERNAL TO LANDING

M7.8B remains unaccepted until representative source quality and owner acceptance pass. Landing changes only after source-project evidence changes.

---

# Publications growth rules

The catalogue may expand when all conditions hold:

1. article/paper/interview is published or the appearance already occurred;
2. the user has a substantive public role;
3. official title, date, platform/event and role are known;
4. stable canonical external evidence exists;
5. no inference or placeholder metadata is needed.

Allowed future kinds:

- technical articles;
- scientific publications;
- talks and conferences;
- interviews and invited materials;
- proceedings publications.

Do not add drafts, future appearances, attendance-only events, volatile counters or automatically scraped public truth.

---

# Evidence-driven future branches

## Selective RU/EN expansion — CONDITIONAL

Only when actual usage or content value identifies a concrete page. Keep one build/search architecture.

## Secondary analytics / Yandex Metrica — CONDITIONAL

Do not add now. Re-open only when Cloudflare systematically misses a decision-critical Russian audience signal and consent/privacy costs are justified.

## Richer architecture explorer — CONDITIONAL

Only with enough real architecture artifacts and demonstrated audience/content value.

## Publication filters or local detail pages — CONDITIONAL

Do not add while the catalogue remains small. Static groups and canonical external links are clearer.

---

# Что не является priority

Без нового evidence-backed design decision не планировать:

- migration away from GitHub Pages;
- paid hosting merely because a custom domain exists;
- private TLS certificate management;
- DNS/provider credentials in repository;
- separate EN build/CMS;
- second site-wide search engine;
- runtime publication APIs or scrapers;
- advertising analytics;
- custom-event explosion;
- fingerprinting/session replay/cross-site tracking;
- per-user analytics;
- AI chat поверх резюме;
- accounts/comments/likes;
- backend/database ради static content;
- runtime GitHub API;
- automatic public-state mutation;
- giant QA runner;
- decorative version bumps;
- performance optimization while real P75 metrics remain healthy.

---

# Оптимальная последовательность

```text
P2.3b HTTPS custom-domain cutover DONE
        ↓
P2.4a provider telemetry + repository link rollout DONE
        ↓
P2.4b header/social/language navigation DONE
        ↓
P2.4c search/photo/rendered-asset stabilization DONE
        ↓
P2.4d Vlezet flagship DONE
        ↓
P2.4e External Publications Showcase DONE
        ↓
P2.4f VillAIgence flagship DONE
        ↓
latest Pages/owner acceptance + /now synchronization
        ↓
1–2 Grounded Engineering Notes + genuine Photo Story when material exists
        ↓
manual external-profile rollout + public distribution
        ↓
3–4 weeks aggregate observation
        ↓
choose further RU/EN/content/product work from evidence
```

## Правило для нового чата

Перед следующим milestone:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`, `CUSTOM_DOMAIN`;
2. проверить actual open PR/latest commits/exact-head CI;
3. проверить latest Pages deployment reports;
4. проверить HTTPS/redirects and RU/EN canonical identity;
5. проверить production VillAIgence/Publications/Vlezet routes;
6. проверить Cloudflare telemetry current hostname;
7. проверить current VillAIgence and Vlezet source-project acceptance truth before changing claims;
8. при freshness-вопросах проверить latest Content Freshness runs/issues.
