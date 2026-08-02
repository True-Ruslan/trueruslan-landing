# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-02**, после публикации External Publications Showcase.
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
- analytics как optional aggregate telemetry;
- no behavioural/user tracking без explicit privacy review;
- quality gates без ослабления;
- repository readiness, deployed state и provider telemetry как разные факты.

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
- **P2.4e External Publications Showcase — DONE: PR #61, Build #539.**

## P2.4e evidence

```text
feature PR:          #61
exact feature head:  1386df46b57d5c9164a13039a286cafb1f296037
Build / run:         #539 / 30757856207 SUCCESS
squash on master:    4036df1744840e558a6514ce6ae09eceb624b69e
unit tests:          300 PASS / 0 FAIL
artifact:            8836540794
artifact digest:     sha256:d69dd36389ab7f6aa59120a2355e34962af2188e8dea733e9ed93826d59ac4d5
```

Delivered:

- standalone `Публикации и выступления` page;
- one validated `data/publications.json` registry;
- three externally verified Habr technical articles;
- homepage Featured block after active projects;
- navigation, About, Resume and metadata integration;
- native prebuild Diplodoc include for search indexing;
- compact no-JS catalogue without Featured duplication;
- generated search coverage for all three titles;
- feed separation from Engineering Notes;
- Chromium, Axe, Lighthouse, Firefox, WebKit and mobile overflow coverage;
- reviewed home/resume/Publications visual evidence;
- custom-domain artifact verification.

No scientific publications, talks, interviews or proceedings were added without a stable external verification point. Empty categories remain hidden.

---

# NOW — Real Content and Distribution Loop

Infrastructure and several deep content surfaces are no longer blockers.

## Immediate operational follow-up

1. Confirm latest Pages deployment after PR #61 and continuity sync.
2. Confirm production Publications route, canonical metadata, search and external links visually.
3. Confirm production Vlezet route remains correct.
4. Keep weekly External health green.
5. Manually update external surfaces if stale:
   - GitHub profile Website;
   - Habr profile/articles;
   - Telegram profile/channel descriptions;
   - other professional profiles.
6. Distribute the site and observe aggregate Cloudflare data for 3–4 weeks.

Do not treat owner test traffic as audience validation.

## Priority content sprint

### 1. Vlezet flagship case study — DONE

Published with explicit authority and failed-recognition boundaries.

### 2. External Publications Showcase — DONE

Published as an evidence-backed cross-platform catalogue. Add future records only when the material is already published/completed and has a stable canonical source.

### 3. VillAIgence flagship case study — NEXT

Use real evidence from:

- text and voice NPC dialogue;
- STT → Chat → TTS pipeline;
- Memory 2.0;
- semantic FACT/ACTION/RELATIONSHIP_CHANGE;
- deterministic UUIDs and persistence;
- restart and rollback verification;
- multi-NPC isolation;
- server-authoritative actions;
- provider timeout/rate-limit/empty-response handling;
- response-size limits, redirects, loopback/SSRF protection;
- release acceptance defects, including navigation and tombstone behavior.

Narrative boundary:

- exact-head CI is not Minecraft server acceptance;
- partial PASS must remain partial;
- accepted memory/security milestones and current gameplay defects must be separated;
- no invented latency, reliability or adoption metrics.

Expected deliverables:

- canonical project registry/evidence refresh if needed;
- seven-section flagship page;
- architecture/security diagram with production-safe SVG paint;
- bounded past/current/next timeline;
- desktop/mobile/cross-browser/evidence gates;
- exact-head reviewed visual artifact;
- continuity sync after merge.

### 4. `/now`

Synchronize active development after Vlezet, Publications and VillAIgence milestones.

### 5. Grounded Engineering Notes

Publish 1–2 notes derived from real implementation decisions. Strong candidates:

- why post-build HTML does not automatically become searchable content;
- deterministic authority around LLM/CV proposals;
- server-side provider response budgets and redirect/SSRF boundaries;
- why restart persistence is a product contract rather than a storage detail.

### 6. First genuine Photo Story

Only authentic material. No fake/demo album.

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

Do not add:

- drafts or submitted papers;
- future appearances;
- attendance-only events;
- certificate-only records without an independently documented contribution;
- live views/votes/likes;
- automatically scraped public truth.

---

# Evidence-driven future branches

## Selective RU/EN expansion — CONDITIONAL

Only when actual usage or content value identifies a concrete page. Publications remains RU-only for now; do not create a separate English catalogue/build merely for symmetry.

## Secondary analytics / Yandex Metrica — CONDITIONAL

Do not add now.

Re-open only when:

- Cloudflare systematically undercounts the relevant Russian audience;
- missing data blocks a real decision;
- consent-controlled loading and privacy notice are justified;
- replay, Webvisor, click maps, user IDs and broad behavioural tracking remain excluded unless separately approved.

## Richer architecture explorer — CONDITIONAL

Only with enough real architecture artifacts and demonstrated audience/content value.

## Publication filters or local detail pages — CONDITIONAL

Do not add while the catalogue remains small. Static groups and canonical external links are currently clearer and cheaper.

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
latest Pages/owner acceptance + manual external-profile updates
        ↓
VillAIgence flagship case study
        ↓
/now + Grounded Engineering Notes + genuine Photo Story
        ↓
public distribution
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
5. проверить production Publications/Vlezet routes;
6. проверить Cloudflare telemetry current hostname;
7. проверить current VillAIgence release/PR truth before writing its case study;
8. при freshness-вопросах проверить latest Content Freshness runs/issues.
