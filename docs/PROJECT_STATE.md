# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-01**, после merge P2.3a Custom Domain Readiness PR #45.
>
> Главный durable snapshot для ответа на вопрос **«что представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, GitHub Pages DNS/HTTPS state, Cloudflare dashboard и maintenance workflows.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project case studies;
- `/now`;
- Engineering Notes + Atom feed;
- Engineering Map;
- Diplodoc full-text search + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN layer;
- optional privacy-friendly analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, deployment и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

---

## 2. Последний завершённый repository milestone

### P2.3a — Custom Domain Readiness

Feature PR:

`#45 — feat: prepare custom domain deployment`

Squash commit в `master`:

`f2a232e55979ed17014596262abfaf2a70ef2e63`

Exact verified feature head:

`117128fba94ae9c4df787125393a9d08f2b712c5`

Verification:

**Build #390 / run `30700124919`: fully green по полной расширенной matrix.**

P2.3a подготовил репозиторий к `https://trueruslan.ru`, но намеренно не объявляет завершённым внешний DNS/TLS cutover.

### Canonical site identity

Добавлен единственный hand-maintained manifest:

`data/site.json`

Он владеет:

- legacy origin `https://true-ruslan.github.io/trueruslan-landing`;
- custom origin `https://trueruslan.ru`;
- apex hostname `trueruslan.ru`;
- alternate hostname `www.trueruslan.ru`.

Production URL больше не дублируется в `package.json`, Pages/health workflows и `data/external-links.json`.

### Site deployment contract

Добавлен:

`scripts/site-deployment.js`

Repository variable:

`TR_PRODUCTION_SITE_URL`

Поддерживаемые modes:

- `auto` — normal push/default;
- `legacy` — принудительный rollback/diagnostic mode;
- `custom` — контролируемый first cutover mode.

`auto` semantics:

- variable отсутствует → legacy origin;
- exact legacy value → legacy origin;
- exact custom value → custom origin;
- любое другое configured value → fail closed до build/deploy.

Resolver экспортирует в workflow:

- `SITE_URL`;
- `PRODUCTION_URL`;
- `SITE_DEPLOYMENT_TARGET`;
- `SITE_DEPLOYMENT_REASON`.

Bounded report:

`site-deployment-contract.json`

### Generated identity и dual-origin verification

SEO, canonical, OpenGraph, JSON-LD, sitemap, robots, Atom и `hreflang` получают resolved `SITE_URL`.

PR quality matrix теперь выполняет:

1. полный legacy-default build и существующие browser/accessibility/visual gates;
2. отдельную реальную пересборку с `SITE_URL=https://trueruslan.ru`;
3. generated-site integrity;
4. `scripts/site-artifact.js` для проверки custom root identity.

Custom artifact gate проверяет:

- RU homepage canonical;
- EN homepage canonical;
- RU/EN `hreflang`;
- `robots.txt` sitemap URL;
- `sitemap.xml` root/RU/EN identity;
- Atom self/site links;
- отсутствие legacy origin на контролируемых public identity surfaces.

### Production и weekly monitoring

Pages workflow теперь:

1. запускает tests;
2. разрешает site deployment contract;
3. разрешает независимый analytics contract;
4. строит сайт с resolved origin;
5. выполняет integrity и analytics artifact verification;
6. деплоит Pages;
7. проверяет deployed endpoints, homepage final URL, RU/EN canonical identity и analytics state.

Weekly `External health` использует тот же `auto` site contract. Production endpoints выводятся из resolved origin, а не хранятся отдельными hardcoded records.

### Operator runbook

Полный activation/verification/rollback runbook:

`docs/CUSTOM_DOMAIN.md`

Design:

`docs/superpowers/specs/2026-08-01-custom-domain-readiness-design.md`

Plan:

`docs/superpowers/plans/2026-08-01-custom-domain-readiness.md`

---

## 3. TDD / debugging evidence P2.3a

Expected RED checkpoints:

- Build #370 / run `30699331464` — site resolver отсутствовал;
- Build #373 / run `30699437392` — canonical manifest fallback отсутствовал;
- Build #376 / run `30699568089` — origin-derived monitoring и canonical verification отсутствовали;
- Build #380 / run `30699716353` — workflow ownership отсутствовал;
- Build #383 / run `30699811320` — старые package tests выявили дублирующего owner `homepage`;
- Build #387 / run `30699991565` — custom artifact verifier/CI gate отсутствовал.

GREEN checkpoints:

- Build #389 / run `30700066864` — первая complete matrix с реальным custom-domain artifact build;
- Build #390 / run `30700124919` — final exact-head complete GREEN.

Build #390 подтвердил:

- unit/contract tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources KB;
- Project Evidence;
- Photo Stories;
- portfolio regression;
- Firefox/WebKit;
- generated search;
- Minimal RU/EN;
- privacy analytics browser smoke;
- Metadata/OpenGraph;
- Engineering Map;
- unchanged visual regression;
- custom-domain build/integrity/artifact verification;
- quality evidence upload.

---

## 4. Custom-domain operational truth — строго раздельно

### 1. Repository custom-domain ready — YES

Подтверждено PR #45, exact feature head и Build #390.

### 2. GitHub account domain ownership verified — YES

Владелец подтвердил статус:

`Successfully verified trueruslan.ru`

TXT verification record должен сохраняться.

### 3. Apex DNS points to GitHub Pages — YES

Публичные DNS возвращали четыре GitHub Pages IPv4 address:

- `185.199.108.153`;
- `185.199.109.153`;
- `185.199.110.153`;
- `185.199.111.153`.

### 4. HTTP routing to the intended site — OBSERVED

Владелец подтвердил, что `http://trueruslan.ru/` отдаёт нужный Diplodoc/portfolio site.

Это не доказывает TLS readiness или завершённый canonical cutover.

### 5. Repository Pages DNS check — NOT GREEN

GitHub repository `Settings → Pages` показывал:

- `DNS check unsuccessful`;
- `InvalidDNSError`;
- `Enforce HTTPS` unavailable.

### 6. Alternate `www` DNS contract — UNRESOLVED

В Timeweb создано:

`www.trueruslan.ru CNAME true-ruslan.github.io`

Но CNAME-запросы через authoritative Timeweb DNS, `1.1.1.1` и `8.8.8.8` возвращали `REFUSED`, при этом A-запросы раскрывались в GitHub Pages IP.

Поддержка Timeweb рассматривает обращение. Без её ответа нельзя считать стандартный CNAME contract подтверждённым.

### 7. HTTPS certificate / Enforce HTTPS — NO

GitHub Pages certificate ещё не подтверждён, `Enforce HTTPS` недоступен.

Не выпускать и не устанавливать отдельный сертификат Timeweb: TLS должен обслуживать GitHub Pages.

### 8. Custom canonical production deployment — NO VERIFIED EVIDENCE

`https://trueruslan.ru` пока не принят как активный canonical production origin в durable state.

Repository variable `TR_PRODUCTION_SITE_URL` и manual `site_mode=custom` activation должны выполняться только после green DNS/TLS gate.

### 9. Cloudflare telemetry for new hostname — NO VERIFIED EVIDENCE

Существующий analytics site/token относится к legacy GitHub Pages hostname. Для `trueruslan.ru` нужен отдельный Cloudflare Web Analytics site/token и новый strict production verification.

---

## 5. Предыдущая production analytics truth

P2.2/P2.2a для legacy production уже закрыты:

- PR #40 — privacy-friendly analytics implementation;
- PR #42 — production activation contract;
- strict deployment run `30572276691` — success;
- legacy RU/EN beacon state — verified;
- Cloudflare provider telemetry — observed.

Initial dashboard snapshot:

- Page views: `4`;
- Visits: `0`;
- Page load time: `282 ms`;
- LCP P50: `388 ms`;
- LCP P75: `740 ms`;
- LCP P90/P99: `1316 ms`;
- LCP / INP / CLS displayed as good.

Выборка остаётся слишком малой для audience/product conclusions.

---

## 6. Архитектурные принципы

Главная граница:

**static-first + build-time intelligence + progressive enhancement**.

Без нового design decision нельзя ломать:

- core content без runtime API;
- JS как enhancement, а не единственный источник содержания;
- no backend/CMS/database без необходимости;
- no runtime/build-time GitHub API dependency в основном site build;
- один canonical source of truth на сущность;
- deterministic build-time generation;
- semantic/no-JS content;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- analytics как optional telemetry, не product dependency;
- one RU/EN site/build/search architecture;
- no behavioural/user tracking без нового explicit privacy review;
- no weakening quality gates ради feature velocity.

---

## 7. Canonical data и ownership

Registries/configs:

- `data/site.json` — public deployment identity;
- `data/projects.json`;
- `data/project-history/*.json`;
- `data/project-evidence.json`;
- `data/now.json`;
- `data/notes.json`;
- `data/engineering-graph.json`;
- `data/page-meta.json`;
- `data/i18n.json`;
- `data/analytics.json`;
- `data/photo-albums.json`;
- `data/photo-archive.json`;
- `data/sources.json`;
- `data/external-links.json` — только non-production external identities.

Main build/postprocess orchestrator:

`scripts/copy-assets.js`

Focused operations ownership:

- `scripts/site-deployment.js` — site mode/origin resolution;
- `scripts/site-artifact.js` — generated public identity verification;
- `scripts/analytics-deployment.js` — analytics mode/token resolution;
- `scripts/production-smoke.js` — deployed availability/site identity/analytics;
- `scripts/external-health.js` — resolved-origin production + external health;
- `.github/workflows/static.yml` — Pages deployment;
- `.github/workflows/external-health.yml` — weekly production monitoring.

---

## 8. Milestones

### P0 — foundation

- P0.1 Photo Stories platform — DONE: PR #15 + #17.
- P0.2 First real Photo Story — CONTENT DEPENDENT.
- P0.3 Sources Registry / KB — DONE: PR #20.
- P0.4 Project Evidence — DONE: PR #22, Build #247.
- P0.5 Grounded Notes — DONE: PR #25, Build #257.
- P0.6 Content Freshness Guard — DONE: PR #27, Build #269.

### P1 — maintainability / depth

- P1.1 Browser Quality Harness — DONE: PR #29, Build #293.
- P1.2 Project Metadata Cleanup — DONE: PR #31, Build #296.
- P1.3 Flagship Case-Study Format — DONE: PR #34, Build #301.
- P1.4 Additional Grounded Note — DONE: PR #36, Build #308.

### P2 — audience / operations

- P2.1 Minimal RU/EN — DONE: PR #38, Build #339.
- P2.2 Privacy-friendly analytics — DONE: PR #40, Build #351.
- P2.2a Production analytics activation contract — DONE: PR #42, Build #367.
- P2.2a Operational closure — DONE: strict run `30572276691` + provider snapshot.
- **P2.3a Custom Domain Readiness — DONE (repository): PR #45, Build #390.**
- **P2.3b HTTPS Production Cutover — BLOCKED BY EXTERNAL DNS/TLS STATE.**

---

## 9. Следующий оптимальный шаг

Не расширять продукт и не менять analytics scope до закрытия внешнего cutover.

Правильная последовательность:

1. получить ответ поддержки Timeweb по `www` CNAME / `REFUSED`;
2. добиться green GitHub repository Pages DNS check;
3. дождаться валидного GitHub Pages TLS certificate;
4. включить `Enforce HTTPS`;
5. создать Cloudflare Web Analytics site/token для `trueruslan.ru`;
6. установить repository variable:
   `TR_PRODUCTION_SITE_URL=https://trueruslan.ru`;
7. обновить `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` token нового hostname;
8. вручную запустить Pages:
   - `site_mode=custom`;
   - `analytics_mode=required`;
9. потребовать green generated/deployed RU/EN site identity и analytics verification;
10. проверить HTTP→HTTPS, `www`→apex, routes/assets/search/feed/sitemap и provider telemetry;
11. сохранить reports/run evidence и выполнить отдельный durable operational closure.

После успешного cutover переходить к real content/distribution и 3–4 неделям aggregate observation.

---

## 10. Намеренные запреты

Без нового обоснования не добавлять:

- backend/CMS/database ради static content;
- runtime GitHub API;
- DNS/provider account credentials в repository;
- private TLS key/certificate;
- repository `CNAME` file для Actions deployment;
- второй search engine;
- отдельный EN build/site;
- automatic translation как public truth;
- advertising analytics;
- custom-event explosion;
- fingerprinting/session replay/cross-site tracking;
- accounts/comments/likes;
- AI chat поверх резюме;
- automatic mutation public trust state;
- giant QA runner;
- decorative version bumps.

---

## 11. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` и `docs/CUSTOM_DOMAIN.md`. Затем проверь actual open PR, latest commits и exact-head CI. Для custom-domain вопроса отдельно проверь GitHub Pages DNS check, `Enforce HTTPS`, public apex/www DNS, latest Pages deployment reports, active `TR_PRODUCTION_SITE_URL`, RU/EN canonical state и Cloudflare telemetry нового hostname.
