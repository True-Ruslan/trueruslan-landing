# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-01**, после merge P2.3a Custom Domain Readiness PR #45.
>
> Текущее состояние — `docs/PROJECT_STATE.md`; история — `docs/CHANGELOG.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

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
- deployment modes `auto|required|disabled`;
- fail-closed preflight;
- generated/deployed RU/EN verification;
- weekly monitoring;
- token-free reports;
- operator runbook and kill switch.

### P2.2a Operational closure — DONE

- strict Pages run `30572276691`;
- legacy production beacon enabled and verified;
- RU/EN production smoke green;
- provider telemetry observed in Cloudflare;
- initial sample intentionally marked insufficient for product conclusions.

### P2.3a Custom Domain Readiness — DONE (repository)

Feature evidence:

- PR #45 — `feat: prepare custom domain deployment`;
- squash `f2a232e55979ed17014596262abfaf2a70ef2e63`;
- exact feature head `117128fba94ae9c4df787125393a9d08f2b712c5`;
- Build #390 / run `30700124919` fully green.

Implemented:

- canonical `data/site.json` for legacy/custom identity;
- repository variable `TR_PRODUCTION_SITE_URL`;
- site modes `auto|legacy|custom`;
- fail-closed origin resolution;
- bounded `site-deployment-contract.json`;
- resolved-origin Pages and weekly workflows;
- origin-derived production health endpoints;
- deployed homepage/RU/EN canonical verification;
- second real PR build for `https://trueruslan.ru`;
- custom artifact verification for canonical, hreflang, robots, sitemap and Atom;
- full activation/rollback runbook `docs/CUSTOM_DOMAIN.md`.

Repository default remains legacy until explicit external cutover.

---

# NOW — P2.3b HTTPS Production Cutover

## Status

**BLOCKED BY EXTERNAL DNS/TLS STATE.**

Confirmed:

- `trueruslan.ru` purchased in Timeweb;
- GitHub account-level domain verification succeeded;
- apex A records point to all four GitHub Pages IPv4 addresses;
- HTTP request to apex reaches the intended site;
- repository code can build and verify both legacy and custom origins.

Not complete:

- GitHub repository Pages DNS check remains unsuccessful;
- `InvalidDNSError` is present;
- `Enforce HTTPS` is unavailable;
- public standard CNAME response for `www.trueruslan.ru` is unresolved;
- Timeweb support response is pending;
- GitHub Pages TLS certificate is not verified;
- custom origin is not yet accepted as canonical production truth;
- Cloudflare Web Analytics site/token for the new hostname is not verified.

## External gate

Before cutover require all of:

1. Timeweb resolves the `www` CNAME / `REFUSED` issue or provides a supported standard configuration.
2. GitHub repository `Settings → Pages` shows green DNS check.
3. `https://trueruslan.ru/` presents a valid GitHub Pages certificate.
4. `www.trueruslan.ru` resolves and redirects to apex as intended.
5. `Enforce HTTPS` is available and enabled.
6. A Cloudflare Web Analytics site/token exists for `trueruslan.ru`.

No repository code change is required merely to wait for these conditions.

## Cutover sequence

After external gate is green:

1. Set repository variable exactly:

   `TR_PRODUCTION_SITE_URL=https://trueruslan.ru`

2. Replace `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` with the token for the new hostname.
3. Manually run `Deploy static content to Pages` with:
   - `site_mode=custom`;
   - `analytics_mode=required`.
4. Require success for:
   - tests;
   - site preflight;
   - analytics preflight;
   - build/integrity;
   - generated RU/EN analytics state;
   - Pages deploy;
   - final homepage origin;
   - RU/EN canonical identity;
   - production analytics state.
5. Verify externally:
   - HTTP → HTTPS;
   - `www` → apex;
   - RU and EN;
   - search;
   - projects, `/now`, Notes, Photo Stories, Resume/PDF;
   - Atom, sitemap, robots;
   - CSS/JS/images/OG;
   - provider telemetry for the new hostname.
6. Preserve deployment reports and perform a separate durable operational-closure PR.

## Rollback

If custom cutover fails:

1. Do not weaken verification.
2. Run Pages with `site_mode=legacy`.
3. Restore `TR_PRODUCTION_SITE_URL` to the legacy exact value or remove it.
4. Diagnose DNS, TLS, Pages routing, generated identity and analytics as separate layers.

---

# After P2.3b

## Real content and distribution loop — RECOMMENDED

Priority content:

1. flagship Vlezet case study based on real UI/UX, geometry and assisted-recognition work;
2. flagship VillAIgence case study based on voice pipeline, Memory 2.0, semantic memory, determinism, security and persistence;
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

After distribution collect aggregate data for at least 3–4 weeks before major audience-driven decisions.

Bounded signals:

- page views and visits;
- top routes and entry pages;
- RU/default vs `/en/`;
- referrers and countries;
- desktop/mobile;
- LCP/INP/CLS at P75.

Do not treat owner test traffic as audience validation.

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
- Webvisor, replay, click maps, user IDs and broad behavioural tracking remain excluded unless separately approved.

## Richer architecture explorer — CONDITIONAL

Only with enough real architecture artifacts and demonstrated audience/content value.

## First real Photo Story — CONTENT DEPENDENT

Only genuine material; fake/demo album remains forbidden.

---

# Что не является priority

Без нового обоснования не планировать:

- migration away from GitHub Pages;
- paid hosting merely because a custom domain exists;
- private TLS certificate management;
- DNS/provider API credentials in repository;
- repository `CNAME` file for Actions deployment;
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
P2.3a repository readiness DONE
        ↓
Timeweb www/CNAME resolution
        ↓
GitHub Pages DNS check GREEN
        ↓
GitHub TLS + Enforce HTTPS
        ↓
Cloudflare site/token for trueruslan.ru
        ↓
TR_PRODUCTION_SITE_URL + analytics token
        ↓
manual custom|required deployment
        ↓
production/telemetry verification
        ↓
durable P2.3b operational closure
        ↓
real content + distribution
        ↓
3–4 weeks aggregate observation
```

## Правило для нового чата

Перед любым следующим action:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`, `CUSTOM_DOMAIN`;
2. проверить actual open PR/latest commits/exact-head CI;
3. проверить GitHub Pages DNS check и `Enforce HTTPS`;
4. проверить public apex/www DNS;
5. проверить active `TR_PRODUCTION_SITE_URL` state через deployment report;
6. проверить latest Pages deployment and RU/EN canonical/analytics reports;
7. проверить Cloudflare telemetry текущего production hostname;
8. при freshness-вопросах проверить latest Content Freshness runs/issues.
