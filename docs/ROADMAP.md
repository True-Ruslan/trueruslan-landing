# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-30**, после strict production activation run `30572276691` и первого подтверждённого Cloudflare telemetry snapshot.
>
> Текущее состояние — `docs/PROJECT_STATE.md`; история — `docs/CHANGELOG.md`.

## Принципы

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- no backend/CMS/database без реальной необходимости;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- one RU/EN site/build/search architecture;
- analytics как optional aggregate telemetry;
- no behavioural/user tracking без нового explicit privacy review;
- quality gates без ослабления.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# Завершённые milestones

## P0 — foundation

- **P0.1 Photo Stories platform — DONE**: PR #15 + #17.
- **P0.2 First real Photo Story — CONTENT DEPENDENT**.
- **P0.3 Sources Registry / KB — DONE**: PR #20.
- **P0.4 Project Evidence — DONE**: PR #22, Build #247.
- **P0.5 Grounded Notes — DONE**: PR #25, Build #257.
- **P0.6 Content Freshness Guard — DONE**: PR #27, Build #269.

## P1 — maintainability / depth

- **P1.1 Browser Quality Harness — DONE**: PR #29, Build #293.
- **P1.2 Project Metadata Cleanup — DONE**: PR #31, Build #296.
- **P1.3 Flagship Case-Study Format — DONE**: PR #34, Build #301.
- **P1.4 Additional Grounded Note — DONE**: PR #36, Build #308.

## P2 — audience / operations

### P2.1 Minimal RU/EN — DONE

- PR #38 / squash `00f7513f685b8a8348005d0ab704ce96abe64950`;
- Build #339 / run `30000373281` fully green;
- one build, one site, one search index, Russian default/root, bounded `/en/` namespace.

### P2.2 Privacy-friendly analytics — DONE

- PR #40 / squash `2dacace5de6b6c1225e82b372faef093850f4c9f`;
- Build #351 / run `30003347268` fully green;
- Cloudflare Web Analytics manual beacon;
- pageviews/RUM-only policy;
- tokenless build = zero analytics capability;
- no custom events/cookies/persistent identifiers/cross-site tracking/session replay;
- one analytics layer for RU/EN;
- dedicated blocked-network privacy browser gate.

### P2.2a Production analytics activation contract — DONE

- PR #42 / squash `522140dda2cab121e6a5c2a099dce9e491f1b49b`;
- exact head `21181a30d85d9f68536b266a326f849d4b451959`;
- Build #367 / run `30560152774` fully green;
- repository variable `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
- deployment modes `auto|required|disabled`;
- fail-closed preflight;
- generated RU/EN verification;
- deployed RU/EN verification;
- weekly production-state monitoring;
- token-free reports;
- operator runbook и kill switch.

### P2.2a Operational closure — DONE

Strict production activation:

- run `30572276691`;
- master SHA `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- mode `required`;
- contract `enabled: true`, expectation `enabled`;
- all deploy steps green;
- all monitored public endpoints healthy;
- RU homepage: 1 valid beacon;
- EN homepage: 1 valid beacon.

Provider telemetry:

- Cloudflare dashboard displays non-zero production data;
- initial snapshot: 4 page views, 0 visits, 282 ms page load time;
- LCP P50 388 ms, P75 740 ms, P90/P99 1316 ms;
- LCP / INP / CLS green;
- sample is too small for product decisions.

---

# NOW — observation and public-use phase

Analytics is no longer a blocker. The project now needs real audience entry points and stronger public content.

## Immediate operational work

1. Keep `External health` and Pages deployment green.
2. Do not change analytics scope while the baseline is tiny.
3. Observe aggregate data for at least 3–4 weeks after public distribution begins.
4. Track only bounded signals:
   - page views and visits;
   - top routes and entry pages;
   - RU/default vs `/en/`;
   - referrers and countries;
   - desktop/mobile;
   - LCP/INP/CLS at P75.

Do not treat owner test traffic as audience validation.

---

# Recommended next milestone

## P2.3 Custom domain + public launch — RECOMMENDED, USER/EXTERNAL DEPENDENCY

Reason:

- mature site needs a stable public identity;
- shorter link for CV, GitHub, Habr and Telegram;
- public URL becomes independent from repository name and future hosting;
- GitHub Pages can remain the host; paid hosting is not required.

Prerequisite:

- select and purchase a domain;
- registrar must be reliable and payable from the user's context.

Implementation scope after domain selection:

1. verify domain in GitHub;
2. configure GitHub Pages custom domain and DNS;
3. enable/verify HTTPS;
4. update canonical URL, OpenGraph, JSON-LD, sitemap, Atom, hreflang and production smoke;
5. update Cloudflare Web Analytics hostname/property as needed;
6. strict deploy and cross-network verification;
7. preserve redirects and old URL compatibility where possible.

Do not migrate hosting unless GitHub Pages creates a real operational constraint.

---

# Parallel content milestone

## Real content and distribution loop — RECOMMENDED

Priority content:

1. flagship Vlezet case study based on real UI/UX and geometry work;
2. flagship VillAIgence case study based on voice pipeline, Memory 2.0, semantic memory, determinism and persistence;
3. update `/now`;
4. 1–2 grounded Engineering Notes from actual implementation decisions;
5. first genuine Photo Story if authentic material is ready.

Distribution entry points:

- GitHub profile README;
- Vlezet and VillAIgence READMEs;
- CV;
- Habr profile/articles;
- Telegram;
- other professional profiles only where actually used.

---

# Evidence-driven future branches

## Selective RU/EN/content expansion — CONDITIONAL

Only when actual route usage or content value identifies a concrete surface.

## Secondary analytics / Yandex Metrica — CONDITIONAL

Do not add now.

Re-open only when:

- Cloudflare systematically undercounts the Russian audience;
- the missing data blocks a real decision;
- a consent-controlled loader and privacy notice are justified;
- Webvisor, session replay, click maps, user IDs and broad behavioural tracking remain excluded unless separately approved.

## Richer architecture explorer — CONDITIONAL

Only with enough real architecture artifacts and demonstrated audience/content value.

## First real Photo Story — CONTENT DEPENDENT

Only genuine material; fake/demo album remains forbidden.

---

# Что не является priority

Без нового обоснования не планировать:

- полный перевод сайта одним milestone;
- отдельный EN build/CMS;
- второй site-wide search engine;
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
Production analytics live + telemetry observed
        ↓
Durable operational baseline
        ↓
Custom domain decision / purchase
        ↓
P2.3 custom domain + public launch
        ↓
Real case studies + notes + distribution
        ↓
3–4 weeks aggregate observation
        ↓
Choose further RU/EN/content/product work from evidence
```

## Правило для нового чата

Перед любым следующим milestone:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`;
2. проверить actual open PR/latest commits/exact-head CI;
3. проверить latest Pages deployment/report;
4. проверить deployed RU/EN beacon state;
5. проверить current Cloudflare observation window;
6. при freshness-вопросах проверить latest Content Freshness runs/issues.
