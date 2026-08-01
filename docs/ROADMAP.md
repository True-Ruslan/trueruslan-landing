# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-01**, после завершения P2.4b header utility navigation and language consolidation.
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
- one RU/EN site/build/search architecture;
- analytics как optional aggregate telemetry;
- no behavioural/user tracking без explicit privacy review;
- quality gates без ослабления;
- repository readiness, deployed state и provider telemetry как разные факты.

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

- PR #38;
- Build #339 / run `30000373281` fully green;
- one build, one site, one search index, Russian default/root, bounded `/en/` namespace.

### P2.2 Privacy-friendly analytics — DONE

- PR #40;
- Build #351 / run `30003347268` fully green;
- pageviews/RUM-only Cloudflare layer;
- no custom events, cookies, persistent identifiers, replay or cross-site tracking;
- dedicated privacy/failure browser gate.

### P2.2a Production analytics activation — DONE

- PR #42;
- Build #367 / run `30560152774` fully green;
- `auto|required|disabled` analytics modes;
- generated/deployed RU/EN verification;
- weekly monitoring;
- strict legacy production run `30572276691`;
- provider telemetry observed for the legacy hostname.

### P2.3a Custom Domain Readiness — DONE

- PR #45;
- squash `f2a232e55979ed17014596262abfaf2a70ef2e63`;
- exact head `117128fba94ae9c4df787125393a9d08f2b712c5`;
- Build #390 / run `30700124919` fully green;
- canonical `data/site.json`;
- `TR_PRODUCTION_SITE_URL`;
- `auto|legacy|custom` site modes;
- dual-origin CI verification;
- activation and rollback runbook.

### P2.3b HTTPS Production Cutover — DONE

External gate completed:

- domain ownership verified;
- apex A records point to GitHub Pages;
- `www` CNAME points to `true-ruslan.github.io`;
- conflicting Timeweb AAAA removed;
- GitHub Pages DNS check successful;
- GitHub Pages certificate installed;
- `Enforce HTTPS` enabled;
- owner manual link acceptance passed.

Strict production deployment:

- run `30704218399`;
- source SHA `9a92a0bea78ecf7aa471d445fe3513cfadc7d378`;
- site mode `custom`;
- analytics mode `required`;
- job `deploy` success;
- production origin `https://trueruslan.ru`;
- all monitored endpoints healthy;
- RU canonical `https://trueruslan.ru/`;
- EN canonical `https://trueruslan.ru/en/`;
- one analytics beacon on RU and EN;
- production report `ok: true`.

Artifact evidence:

- `production-verification-reports` id `8819800463`;
- digest `sha256:49bd2a9e40ebda41cc4aa8c925e15392aff9fbcd7739ca01d2934550116b58c0`.

### P2.4a Canonical link rollout and first custom-host telemetry — DONE

Completed:

- first Cloudflare dashboard telemetry for `trueruslan.ru` confirmed;
- Landing README and CV point to `https://trueruslan.ru/`;
- Vlezet and VillAIgence READMEs point to the canonical portfolio;
- CV annotation-only edit passed zero-pixel visual comparison;
- exact-head CI and continuity documentation passed in all three repositories.

First dashboard sample:

```text
last 24 hours, GMT+3, bots excluded
7 visits / 8 page views
page load time 656 ms
LCP P50/P75/P90/P99 648/744/829/829 ms
100% Good in the observed LCP sample
```

This closes provider observation, not audience validation.

### P2.4b Header utility navigation and language consolidation — DONE

Completed:

- header utility order is `GitHub → Habr → Telegram → Search → Language`;
- social/search surfaces use accessible icon-only controls;
- language is the final rightmost control and opens a bounded RU/EN menu;
- floating language switch and duplicate visual/hit area are removed;
- paired routes reuse existing i18n metadata, untranslated routes fall back to language home;
- no-JS language links, keyboard behavior, focus return and outside-click close are verified;
- hero actions are Projects + GitHub + Habr + Telegram;
- Resume remains in primary navigation but is absent from hero;
- CTA indicators have one CSS owner, eliminating duplicate arrows;
- exact-head CI, cross-browser, accessibility, mobile and intentional visual regression passed.

Evidence:

```text
PR #51
exact feature head 8bd77b90f778f6384be3b9de93e69c9bc4b77e21
Build #418 / run 30719138639 SUCCESS
squash c6a7b74e8b0f7d07f44794505d348ab6ef5afb4e
```

Search ownership, Cmd/Ctrl+K, Cloudflare analytics, hosting and custom-domain contracts remain unchanged.

---

# NOW — P2.4 Real Content and Distribution Loop

Infrastructure and header/navigation polish are no longer primary blockers. The site now needs stronger real content and external entry points.

## Immediate operational follow-up

Completed:

- first Cloudflare page views/RUM for `trueruslan.ru` confirmed;
- Landing README and CV updated;
- Vlezet and VillAIgence READMEs updated;
- cross-repository durable state synchronized;
- GitHub, Habr and Telegram entry points are available directly from the site header and home hero.

Still required:

1. Keep Pages deployment and weekly External health green.
2. Manually update surfaces outside current write access:
   - GitHub profile Website field;
   - Habr profile/articles;
   - Telegram profile/channel descriptions;
   - other profiles actually used.
3. Distribute the site and observe aggregate data for at least 3–4 weeks.

Bounded signals:

- page views and visits;
- top routes and entry pages;
- RU/default vs `/en/`;
- referrers and countries;
- desktop/mobile;
- LCP/INP/CLS at P75.

Do not treat owner test traffic as audience validation.

## Priority content sprint

### 1. Vlezet flagship case study

Use real evidence from:

- assisted recognition;
- wall/door/window ambiguity;
- geometry and area semantics;
- furniture library and placement UX;
- rotated-contour distance;
- user feedback, fixes and acceptance.

### 2. VillAIgence flagship case study

Use real evidence from:

- text/voice NPC dialogue;
- STT/Chat/TTS pipeline;
- Memory 2.0;
- semantic facts and relationships;
- deterministic IDs and persistence;
- restart/server verification;
- security and failure handling.

### 3. `/now`

Synchronize current active development, released milestones and near-term focus.

### 4. Grounded Engineering Notes

Publish 1–2 notes derived from actual implementation decisions rather than generic tutorials.

### 5. First genuine Photo Story

Only authentic material; no fake/demo album.

---

# Evidence-driven future branches

## Selective RU/EN expansion — CONDITIONAL

Only when actual usage or content value identifies a concrete surface.

## Secondary analytics / Yandex Metrica — CONDITIONAL

Do not add now.

Re-open only when:

- Cloudflare systematically undercounts the Russian audience;
- missing data blocks a real decision;
- consent-controlled loading and privacy notice are justified;
- replay, Webvisor, click maps, user IDs and broad behavioural tracking remain excluded unless separately approved.

## Richer architecture explorer — CONDITIONAL

Only with enough real architecture artifacts and demonstrated audience/content value.

---

# Что не является priority

Без нового обоснования не планировать:

- migration away from GitHub Pages;
- paid hosting merely because a custom domain exists;
- private TLS certificate management;
- DNS/provider credentials in repository;
- separate EN build/CMS;
- second site-wide search engine;
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
manual external-profile updates + distribution
        ↓
Vlezet + VillAIgence case studies
        ↓
/now + Engineering Notes + genuine Photo Story
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
5. проверить active site/analytics contracts;
6. проверить Cloudflare telemetry current hostname;
7. при freshness-вопросах проверить latest Content Freshness runs/issues.
