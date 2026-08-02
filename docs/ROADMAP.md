# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-02**, после синхронизации `/now` с Vlezet, Publications и VillAIgence milestones.
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
- P2.4e External Publications Showcase — DONE: PR #61, Build #539.
- P2.4f VillAIgence flagship case study — DONE: PR #63, Build #567.
- **P2.4g `/now` synchronization — DONE: PR #65, Build #571.**

## P2.4g evidence

```text
feature PR:          #65
exact feature head:  fdc2d2ddf54f67aacf1e730f210fb6aae7325cdf
Build / run:         #571 / 30763586234 — SUCCESS
squash on master:    2ef556a6e910be001355193d9d96f499131d5094
unit tests:          307 PASS / 0 FAIL
artifact:            8838265730
artifact digest:     sha256:917d75578563a23a8a7b9186dcb143ec890a98d81f3823460251ffcf4be997a8
```

Delivered:

- current date `2026-08-02`;
- focus on real acceptance, content consolidation and measured distribution;
- Vlezet proposal/review/validation/Apply boundary;
- VillAIgence source/package/installed-acceptance boundary;
- three explicit Engineering Note directions;
- stale public LivingWorld copy removed while stable `livingworld.html` route remains;
- no schema, renderer, CSS, route or visual-baseline change;
- full 29-stage quality matrix green.

---

# NOW — Grounded Content and Distribution Loop

Infrastructure, custom domain, search, evidence, flagship case studies and external Publications are no longer the main blockers.

## Immediate operational follow-up

1. Confirm latest Pages deployment after PR #65 and continuity sync.
2. Confirm production `/now` date/copy/project cards visually.
3. Confirm production Vlezet, VillAIgence and Publications routes remain correct.
4. Keep weekly External health and Content Freshness workflows green.
5. Manually update external surfaces if stale:
   - GitHub profile Website;
   - Habr profile/articles;
   - Telegram profile/channel descriptions;
   - other professional profiles.
6. Begin deliberate distribution and observe aggregate Cloudflare data for 3–4 weeks.

Do not treat owner test traffic as audience validation.

---

# Priority content sprint

## 1. Engineering Note: exact-head CI versus installed acceptance — NEXT

### Core thesis

A green source/PR pipeline proves only the gates it actually executed. It does not automatically prove that the exact distributable artifact:

- contains the expected embedded identity;
- starts in the real target environment;
- preserves persistent state;
- passes focused gameplay/product regressions;
- survives restart and rollback;
- is ready for promotion.

### Evidence base

Use the VillAIgence sequence:

```text
0.1.20 installed PARTIAL PASS
        ↓
source/package corrections
        ↓
0.1.21 installed STARTUP FAIL
        ↓
safe rollback + six persistent hashes preserved
        ↓
0.1.22 corrective code candidate
        ↓
exact installed cumulative acceptance pending
```

Required narrative boundaries:

- distinguish source tests, remapped/package validation and installed runtime acceptance;
- explain why a startup blocker outranks downstream gameplay checks;
- show rollback as an acceptance result, not an embarrassment to hide;
- do not claim accepted `0.1.22` before exact installed evidence exists;
- avoid invented reliability, latency or adoption metrics.

Expected deliverables:

- canonical Note registry entry;
- grounded article page with source/evidence links;
- previous/next/related navigation;
- Atom feed inclusion;
- generated search coverage;
- metadata/OpenGraph;
- browser/accessibility/visual acceptance;
- continuity sync after merge.

## 2. Engineering Note: deterministic authority around LLM/CV proposals

Use both products:

- Vlezet recognition Draft remains proposal until review, deterministic validation and explicit Apply;
- VillAIgence LLM output remains proposal until server policy and current-state revalidation.

Core principle:

**Probabilistic systems may propose; deterministic product boundaries decide what becomes authoritative.**

Do not begin this Note before Note #1 is merged unless the two can be shown to be materially independent and the quality matrix capacity remains reasonable.

## 3. Engineering Note: restart and persistence as product contract

Explain:

- why stored bytes are insufficient without restart/read-back evidence;
- deterministic IDs and per-entity isolation;
- persistent hashes during rollback;
- schema/migration compatibility;
- difference between storage implementation and user-visible continuity.

## 4. First genuine Photo Story

Only authentic material. No fake/demo album.

Required input:

- real photographs;
- confirmed chronology/context;
- publishable alt text and captions;
- explicit selection of hero/layout.

## 5. External profile rollout and distribution

After the first new Note:

- update canonical site links in external profiles;
- publish/announce selectively, not as bulk promotion;
- link directly to the most relevant case study or Note;
- verify resulting routes and referrers without adding behavioural tracking.

## 6. Aggregate observation window

Observe for 3–4 weeks:

- requests/page views at aggregate level;
- country/device data only within current Cloudflare privacy boundary;
- which content surfaces attract meaningful visits;
- whether search/discovery paths suggest a concrete next improvement.

Do not add Metrica, replay, click maps, identifiers or per-user tracking merely to increase data volume.

---

# Product acceptance dependencies

## VillAIgence `0.1.22` — EXTERNAL DEPENDENCY

Landing must be updated only after exact installed evidence exists for:

1. startup;
2. water navigation;
3. filled-grave drop preservation;
4. exact runtime identity;
5. restart and persistent hashes;
6. cumulative Text/STT/Chat/TTS/Voice Chat/Operator Lore/gameplay scenarios.

Until then, status remains corrective candidate / live acceptance pending.

## Vlezet recognition — ACTIVE PRODUCT WORK, NOT LANDING CLAIM

Landing continues to preserve:

- M7.7 and M7.8A accepted;
- M7.8B failed product acceptance;
- CV/local and AI output as reviewable proposals;
- no accurate arbitrary-plan recognition claim.

When Vlezet obtains a newly accepted milestone, update registry/evidence/timeline separately rather than editing `/now` as a substitute.

---

# Publications growth rules

The catalogue may expand only when all conditions hold:

1. material is already published/completed;
2. the user has a substantive public role;
3. official title/date/platform/role are known;
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
- certificate-only records without independently documented contribution;
- live views/votes/likes;
- automatically scraped public truth.

---

# Evidence-driven future branches

## Selective RU/EN expansion — CONDITIONAL

Only when actual usage or content value identifies a concrete page. Do not create parallel content merely for symmetry.

## Secondary analytics / Yandex Metrica — CONDITIONAL

Re-open only when:

- Cloudflare systematically undercounts a relevant audience;
- missing data blocks a real decision;
- consent-controlled loading and privacy notice are justified;
- replay, Webvisor, click maps, user IDs and broad behavioural tracking remain excluded unless separately approved.

## Richer architecture explorer — CONDITIONAL

Only with enough real artifacts and demonstrated content value.

## Publication filters/local detail pages — CONDITIONAL

Do not add while the catalogue remains small. Static groups and canonical external links are clearer and cheaper.

## Dependency modernization — SEPARATE REVIEW

The build currently reports transitive audit findings. Do not run blind `npm audit fix --force`.

A future dependency-hardening milestone must:

- identify direct versus transitive ownership;
- compare supported Diplodoc/browser tooling versions;
- preserve deterministic build/search/visual behavior;
- use a dedicated PR and full matrix;
- avoid mixing dependency churn with content work.

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
P2.4d Vlezet flagship DONE
        ↓
P2.4e External Publications Showcase DONE
        ↓
P2.4f VillAIgence flagship DONE
        ↓
P2.4g /now synchronization DONE
        ↓
Engineering Note: exact-head CI ≠ installed acceptance
        ↓
Engineering Note: deterministic authority around AI proposals
        ↓
Engineering Note: restart/persistence product contract
        ↓
genuine Photo Story when authentic material is ready
        ↓
external-profile rollout + public distribution
        ↓
3–4 weeks aggregate observation
        ↓
choose further content/product work from evidence
```

## Правило для нового чата

Перед следующим milestone:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`, `CUSTOM_DOMAIN`;
2. проверить actual open PR/latest commits/exact-head CI;
3. проверить latest Pages deployment reports;
4. проверить HTTPS/redirects and RU/EN canonical identity;
5. проверить production `/now`, Publications, Vlezet и VillAIgence routes;
6. проверить Cloudflare telemetry current hostname;
7. проверить current VillAIgence release/installed-acceptance truth;
8. при freshness-вопросах проверить latest Content Freshness runs/issues.
