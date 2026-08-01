# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-01**, после merge P2.3a Custom Domain Readiness PR #45.
>
> Это смысловая история проекта: что сделали, зачем, какие решения приняли, какие ошибки обнаружили и чем подтвердили результат.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-01

## P2.3a — Custom Domain Readiness

### Зачем

После покупки `trueruslan.ru` возникли две разные задачи:

1. подготовить repository/build/deployment architecture к новому root origin;
2. дождаться и проверить внешний DNS/TLS cutover в GitHub Pages.

Смешивать их было нельзя. Немедленная hardcoded замена всех URL на `https://trueruslan.ru` опубликовала бы canonical/feed/social identity на endpoint, для которого GitHub ещё не выпустил сертификат. Простое ожидание DNS оставило бы миграцию непроверенной и drift-prone.

Выбрана двухфазная модель:

- **P2.3a repository readiness** — можно завершить и проверить заранее;
- **P2.3b HTTPS production cutover** — выполняется только после green external gate.

### Design decision

Создан один canonical manifest public site identity:

`data/site.json`

Он содержит:

- legacy origin `https://true-ruslan.github.io/trueruslan-landing`;
- custom origin `https://trueruslan.ru`;
- apex `trueruslan.ru`;
- alternate `www.trueruslan.ru`.

Production identity больше не принадлежит одновременно `package.json`, workflow expressions и `data/external-links.json`.

### Site deployment contract

Добавлен:

`scripts/site-deployment.js`

Repository variable:

`TR_PRODUCTION_SITE_URL`

Modes:

- `auto`;
- `legacy`;
- `custom`.

Closed semantics:

- `auto` + no variable → `legacy-default`;
- `auto` + exact legacy origin → `configured-legacy`;
- `auto` + exact custom origin → `configured-custom`;
- `legacy` → `forced-legacy`;
- `custom` → `forced-custom`;
- unknown mode или другое configured origin → fail closed.

Resolver записывает:

- `SITE_URL`;
- `PRODUCTION_URL`;
- `SITE_DEPLOYMENT_TARGET`;
- `SITE_DEPLOYMENT_REASON`;
- bounded `site-deployment-contract.json`.

No DNS credentials, TLS keys, provider API tokens или runtime configuration fetch не добавлены.

### Generated public identity

`getSiteUrl()` теперь:

1. предпочитает explicit `SITE_URL`;
2. иначе читает legacy default из `data/site.json`.

Resolved origin используется для:

- canonical;
- OpenGraph/Twitter URL;
- JSON-LD;
- sitemap;
- robots;
- Atom feed;
- RU/EN `hreflang`.

Из private `package.json` удалён дублирующий `homepage`.

### Monitoring ownership

Из `data/external-links.json` удалены hardcoded production records. Файл снова хранит только external/profile/project identities.

`scripts/external-health.js` теперь выводит production homepage/projects/resume/PDF из resolved production origin.

`scripts/production-smoke.js` сохраняет прежние endpoint, homepage/feed identity и analytics checks и дополнительно проверяет:

- final homepage URL;
- RU homepage canonical;
- EN homepage canonical;
- принадлежность canonical exact expected origin.

### Workflow integration

Pages workflow получил input:

`site_mode=auto|legacy|custom`

Порядок deployment:

1. tests;
2. site deployment resolver;
3. analytics deployment resolver;
4. build;
5. integrity;
6. analytics artifact verification;
7. Pages upload/deploy;
8. endpoint/site identity/analytics production smoke;
9. bounded report upload.

Weekly `External health` использует тот же site contract в `auto`, поэтому deployment и monitoring больше не могут независимо drift-ить по origin.

Analytics остаётся отдельным contract с собственными modes `auto|required|disabled` и прежней privacy boundary.

### Dual-origin PR verification

Добавлен:

`scripts/site-artifact.js`

После всей существующей legacy browser/accessibility/visual matrix PR CI удаляет `docs-html` и выполняет вторую реальную сборку:

```bash
SITE_URL=https://trueruslan.ru npm run build:docs
npm run check:site
node scripts/site-artifact.js \
  docs-html \
  https://trueruslan.ru \
  https://true-ruslan.github.io/trueruslan-landing
```

Verifier проверяет:

- RU canonical;
- EN canonical;
- RU/EN `hreflang`;
- robots sitemap URL;
- sitemap root/RU/EN identity;
- Atom self/site links;
- отсутствие legacy origin на контролируемых custom public identity surfaces.

Visual baselines не менялись: browser/visual matrix продолжает выполняться на legacy-default artifact, а custom build проверяется отдельным deterministic gate.

### TDD / debugging trail

#### Build #370 — expected RED

Run `30699331464`.

Contract tests существовали раньше `scripts/site-deployment.js`.

#### Build #373 — expected RED

Run `30699437392`.

Test потребовал manifest-owned fallback до изменения `getSiteUrl()`.

#### Build #376 — expected RED

Run `30699568089`.

Origin-derived health и deployed canonical checks ещё отсутствовали.

#### Build #380 — expected RED

Run `30699716353`.

Workflow ownership contract существовал раньше wiring.

#### Build #383 — debugging RED

Run `30699811320`.

Новая one-source-of-truth architecture прошла собственные tests, но два старых теста всё ещё считали `package.json.homepage` production owner. Они были обновлены на `data/site.json`; runtime behavior не ослаблялся.

#### Build #387 — expected RED

Run `30699991565`.

PR CI ещё не имел real custom artifact build/verifier.

#### Build #389 — GREEN checkpoint

Run `30700066864`.

Полная matrix впервые включила custom-domain build/integrity/artifact verification.

#### Build #390 — final exact-head GREEN

Exact head:

`117128fba94ae9c4df787125393a9d08f2b712c5`

Run:

`30700124919`

Fully green:

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

### Merge result

PR #45 — `feat: prepare custom domain deployment`.

Squash commit:

`f2a232e55979ed17014596262abfaf2a70ef2e63`

### Operator documentation

Added:

- `docs/CUSTOM_DOMAIN.md`;
- `docs/superpowers/specs/2026-08-01-custom-domain-readiness-design.md`;
- `docs/superpowers/plans/2026-08-01-custom-domain-readiness.md`.

Runbook фиксирует:

- repository variable;
- modes;
- external gate;
- DNS/HTTPS verification;
- Cloudflare hostname/token migration;
- first `custom|required` deployment;
- verification;
- fail-closed rollback.

### External production state after merge

Repository readiness и production cutover остаются разными фактами.

Owner-verified external facts:

- GitHub account domain verification — success;
- apex A records — четыре GitHub Pages address;
- HTTP apex routing — intended site observed;
- repository Pages DNS check — `InvalidDNSError`;
- `Enforce HTTPS` — unavailable;
- `www` CNAME queries — `REFUSED` despite Timeweb UI configuration;
- Timeweb support response — pending.

Therefore:

1. **Repository custom-domain ready — YES.**
2. **GitHub Pages DNS/TLS gate — NO.**
3. **HTTPS canonical cutover — NO.**
4. **Cloudflare telemetry for new hostname — NO.**

Final cutover requires green DNS check, valid GitHub Pages TLS, `Enforce HTTPS`, new Cloudflare site/token, `TR_PRODUCTION_SITE_URL=https://trueruslan.ru`, and manual `site_mode=custom` + `analytics_mode=required` deployment.

### Unchanged boundaries

Not changed:

- package dependency/lockfile graph;
- visual baselines/thresholds;
- content/search architecture;
- RU/EN source ownership;
- Project Evidence trust semantics;
- analytics pageviews/RUM privacy boundary;
- public content/design;
- hosting provider.

---

# 2026-07-30

## P2.2a operational closure — production analytics live

### Strict production deployment

- workflow `Deploy static content to Pages`;
- run `30572276691`;
- branch `master`;
- source SHA `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- `analytics_mode=required`;
- result: success.

Deployment evidence:

- `enabled: true`;
- expectation `enabled`;
- reason `configured-token`;
- all monitored legacy production endpoints healthy;
- RU homepage: one valid beacon;
- EN homepage: one valid beacon;
- report artifact id `8771279567`;
- digest `sha256:65e31cb8d6ea1c4e208bdc488eed19f0a395dcd37feada04f958e92998b63944`.

### Provider telemetry observed

Initial Cloudflare snapshot:

- Page views: 4;
- Visits: 0;
- Page load time: 282 ms;
- LCP P50: 388 ms;
- LCP P75: 740 ms;
- LCP P90/P99: 1316 ms;
- LCP / INP / CLS shown as good.

This closed provider-side observation but remained too small for audience/product conclusions.

## P2.2a — Production analytics activation contract

PR #42 — `ci: activate and verify production analytics`.

- squash `522140dda2cab121e6a5c2a099dce9e491f1b49b`;
- exact head `21181a30d85d9f68536b266a326f849d4b451959`;
- Build #367 / run `30560152774` fully green.

Added:

- deployment modes `auto|required|disabled`;
- repository variable `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
- fail-closed token/mode preflight;
- generated/deployed RU/EN verification;
- weekly verification;
- token-free reports;
- activation/rollback runbook.

Privacy boundary remained unchanged: no provider credentials, custom events, cookies, persistent IDs, fingerprinting, replay, advertising or cross-site tracking.

## Durable continuity after P2.2a

PR #43:

- squash `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- exact docs head `3d4f4754c5e92a56aeb99a2439b067e71ec58bab`;
- Build #368 / run `30561811875` fully green.

PR #44 later recorded the actual strict production and telemetry state:

- squash `43c47beadaee0324daea65cdacc76e2b9a5b11c3`;
- exact docs head `9eead1135826db8434fb7ebf82783c0d000a2b28`;
- Build #369 / run `30579272472` fully green.

---

# 2026-07-23

## P2.2 — Privacy-friendly analytics

- PR #40 / squash `2dacace5de6b6c1225e82b372faef093850f4c9f`;
- exact head `577fe9149988497d954f8ad9316467089ce50286`;
- Build #351 / run `30003347268` fully green.

Added bounded Cloudflare Web Analytics manual beacon, tokenless default, pageviews/RUM policy and blocked-network browser gate.

## P2.1 — Minimal RU/EN

- PR #38 / squash `00f7513f685b8a8348005d0ab704ce96abe64950`;
- exact head `d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`;
- Build #339 / run `30000373281` fully green.

Seven bilingual route pairs under one build/site/search architecture.

## P1.4 — Additional Grounded Engineering Note

PR #36 / squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`, Build #308.

Added `llm-output-is-a-protocol-boundary`.

---

# 2026-07-22

## P1.3 — Flagship Case-Study Format

PR #34 / squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.

LivingWorld and NODE ZERO received the shared Markdown-first engineering narrative.

## P1.2 — Project Metadata Cleanup

PR #31 / squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.

Package identity aligned with engineering portfolio / knowledge platform; `private: true`.

## P1.1 — Browser Quality Harness

PR #29 / squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.

Created modular quality ownership while preserving focused runner boundaries.

## P0.6 — Content Freshness Guard

PR #27 / squash `33770983789fbde5c59a94972709360286a06ad5`, Build #269.

Detects drift without automatically rewriting public truth/trust.

## P0.5 — Grounded Engineering Notes

PR #25 / squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.

Added repository-grounded Notes and metadata/search/feed integration.

## P0.4 — Project Evidence Layer

PR #22 / squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`, Build #247.

Added bounded evidence snapshots and `verified/stale/unverified` semantics.

## P0.3 — Sources Knowledge Base

PR #20 / squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.

Added real records, strict validation, semantic/no-JS rendering and local filters.

## P0.1 — Photo Stories platform

PR #15 + QA PR #17.

Platform ready; fake/demo album was not created.

---

## Durable continuity principle

After major milestones synchronize:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

These files are snapshots, not substitutes for actual repository, CI, Pages DNS/TLS, deployment reports and provider checks.
