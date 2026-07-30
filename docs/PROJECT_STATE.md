# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-30**, после merge P2.2a Production analytics activation contract PR #42.
>
> Главный durable snapshot для ответа на вопрос **«что представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> Затем отдельно проверять actual open PR, latest commits, exact-head CI, Pages deployment, analytics provider state и maintenance workflows.

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

## 2. Текущее состояние `master`

### Последний milestone

**P2.2a — Production analytics activation contract**.

Feature PR:

`#42 — ci: activate and verify production analytics`

Squash commit:

`522140dda2cab121e6a5c2a099dce9e491f1b49b`

Exact implementation head:

`21181a30d85d9f68536b266a326f849d4b451959`

Verification:

**Build #367 / run `30560152774`: fully green по полной configured PR matrix.**

### Что реализовано

P2.2 уже умел опционально внедрять Cloudflare Web Analytics beacon при наличии `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`.

P2.2a закрыл deployment gap между этим build-time integration и GitHub Pages.

Добавлен единый production contract:

- GitHub Actions **repository variable** `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
- `auto` — default для push в `master`;
- `required` — strict manual activation/verification;
- `disabled` — manual kill switch;
- invalid configured token останавливает workflow до build/upload/deploy;
- absent token в `auto` сохраняет analytics-free deployment;
- существующий Pages workflow остаётся единственным production build/deploy path.

### Preflight и state model

Добавлен:

`scripts/analytics-deployment.js`

Он владеет:

- `resolveAnalyticsDeployment({mode, token})`;
- bounded deployment report;
- exact HTML beacon inspection;
- RU/EN generated artifact verification;
- token masking/wiring через GitHub Actions environment files.

Closed deployment states:

- `configured-token`;
- `token-not-configured`;
- `forced-disabled`.

Diagnostic reports не содержат token или token hash.

### Generated artifact verification

До Pages upload проверяются:

- `docs-html/index.html`;
- `docs-html/en/index.html`.

Для `enabled` требуются:

- ровно один owned beacon;
- official Cloudflare source;
- exact `type="module"`;
- exact `defer` attribute;
- valid `data-cf-beacon` с только `token` и `spa: false`;
- token, совпадающий с configured deployment token.

Для `disabled` требуется 0 owned beacons.

Third-party script не исполняется.

### Post-deploy verification

`scripts/production-smoke.js` теперь сохраняет прежние availability/identity checks и дополнительно умеет проверять deployed RU/EN analytics state.

После `actions/deploy-pages` workflow проверяет:

- production homepage;
- production `/en/index.html`;
- exact enabled beacon или полное отсутствие beacon в disabled state.

Bounded report:

`production-smoke-report.json`

### Weekly monitoring

`.github/workflows/external-health.yml` теперь:

1. устанавливает dependencies;
2. разрешает current analytics contract в `auto`;
3. выполняет прежний external endpoint health check;
4. проверяет Pages RU/EN и configured analytics state;
5. загружает token-free health/production/deployment reports.

Weekly monitor не исполняет Cloudflare beacon script.

### Operator workflow

Полный runbook:

`docs/ANALYTICS.md`

Он фиксирует:

- repository variable setup;
- почему variable, а не Secret/hardcode;
- first activation через manual `required`;
- normal `auto`;
- emergency `disabled`;
- persistent disable через удаление repository variable;
- generated/deployed/weekly verification;
- разницу между repository readiness, deployed beacon и telemetry.

### Privacy/security boundary

Не добавлены:

- Cloudflare account/API credentials;
- provider provisioning automation;
- custom events;
- cookies;
- persistent visitor identifiers;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- analytics-driven product behavior.

Public Cloudflare site token при enabled deployment неизбежно присутствует в deployed HTML/Pages artifact. Это intended public disclosure boundary.

Token не должен присутствовать в:

- repository source;
- deployment contract report;
- production smoke report;
- health reports;
- PR quality artifacts.

### TDD / debugging trail P2.2a

- Build #353 / run `30538155450` — RED: resolver отсутствовал;
- Build #354 — resolver/CLI GREEN checkpoint;
- Build #356 / run `30538461394` — RED: HTML/artifact/production inspection contracts раньше implementation;
- Build #358 — inspection GREEN checkpoint;
- Build #359 — RED: workflow ownership contract раньше wiring;
- Build #361 — debugging RED: weekly monitor не имел explicit fail-closed expectation guard;
- Build #362 — workflow integration GREEN checkpoint;
- scope review уточнил repository-only variable и public Pages artifact boundary;
- Build #366 / run `30560000925` — regression RED: `deferx` ошибочно мог считаться `defer`;
- parser получил exact attribute-name boundary;
- Build #367 / run `30560152774` — final full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-30-production-analytics-activation-design.md`

Authoritative amendment:

`docs/superpowers/specs/2026-07-30-production-analytics-activation-design-amendment.md`

Plan:

`docs/superpowers/plans/2026-07-30-production-analytics-activation.md`

---

## 3. Operational truth — строго раздельно

### 1. Repository ready — YES

Подтверждено:

- feature PR #42 merged;
- exact implementation head verified;
- Build #367 полностью green;
- production workflow, rollback и weekly checks находятся в `master`.

### 2. Production beacon active — NOT INDEPENDENTLY VERIFIED IN THIS SNAPSHOT

Push-triggered Pages run после merge нельзя подтвердить через доступный connector: его commit-run wrapper возвращает только PR-triggered runs и не предоставляет list-deployments/list-push-runs endpoint.

Поэтому snapshot не утверждает ни `enabled`, ни `disabled` deployed state без production report/run evidence.

### 3. Telemetry observed — NO VERIFIED EVIDENCE

Cloudflare dashboard data не проверялась. Green CI или deployed beacon сами по себе не доказывают provider telemetry.

### External account action

Для первой реальной activation, если repository variable ещё не создана:

1. создать Cloudflare Web Analytics site для actual production hostname;
2. скопировать public site token;
3. создать repository variable `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
4. вручную запустить Pages workflow с `analytics_mode=required`;
5. потребовать green local + post-deploy RU/EN verification;
6. отдельно подтвердить данные в Cloudflare dashboard.

---

## 4. Архитектурные принципы

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

## 5. Canonical data и runtime ownership

Registries/configs:

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
- `data/external-links.json`.

Main build/postprocess orchestrator:

`scripts/copy-assets.js`

Focused analytics production ownership:

- `scripts/analytics.js` — policy + build injection;
- `scripts/analytics-deployment.js` — deployment resolution + static verification;
- `scripts/analytics-browser-smoke.cjs` — privacy/failure browser contract;
- `scripts/production-smoke.js` — deployed availability/identity/analytics state;
- `.github/workflows/static.yml` — Pages deployment;
- `.github/workflows/external-health.yml` — weekly production health.

---

## 6. Milestones

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
- P2.2 Privacy-friendly analytics implementation — DONE: PR #40, Build #351.
- P2.2a Production analytics activation contract — DONE (repository): PR #42, Build #367.
- First real provider activation/telemetry — EXTERNAL + NOT VERIFIED.

---

## 7. Current quality matrix

Configured PR matrix включает:

- `npm test`;
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
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- diagnostics/evidence upload.

Latest exact feature evidence:

`21181a30d85d9f68536b266a326f849d4b451959`

Build #367 / run `30560152774`:

**fully green**.

---

## 8. Следующий оптимальный шаг

Не начинать автоматически P2.3/P2.4.

Правильная последовательность:

1. выполнить external Cloudflare site/token setup, если его ещё нет;
2. выполнить manual `required` Pages deployment;
3. сохранить actual production verification evidence;
4. подтвердить provider telemetry;
5. собрать aggregate usage/performance signal;
6. выбрать следующий milestone по данным.

После evidence выбирать между:

- selective RU/EN/content expansion;
- P2.3 custom domain/hosting при operational need;
- P2.4 richer architecture explorer при достаточном количестве real artifacts;
- first genuine Photo Story при наличии authentic material.

---

## 9. Намеренные запреты

Без нового обоснования не добавлять:

- backend/CMS/database ради static content;
- runtime GitHub API;
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

## 10. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и exact-head CI. Если речь о production или analytics, отдельно проверь Pages deployment report, deployed RU/EN beacon state и Cloudflare telemetry.
