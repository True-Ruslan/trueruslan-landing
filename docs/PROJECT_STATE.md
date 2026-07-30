# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-30**, после первой strict production activation и появления реальных данных в Cloudflare Web Analytics.
>
> Главный durable snapshot для ответа на вопрос **«что представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> Затем отдельно проверять actual open PR, latest commits, exact-head CI, последний Pages deployment, Cloudflare dashboard и maintenance workflows.

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

## 2. Последний завершённый milestone

### P2.2a — Production analytics activation: repository + production + telemetry

Repository implementation:

- PR #42 — `ci: activate and verify production analytics`;
- squash `522140dda2cab121e6a5c2a099dce9e491f1b49b`;
- exact implementation head `21181a30d85d9f68536b266a326f849d4b451959`;
- Build #367 / run `30560152774` — fully green по полной configured PR matrix.

Durable continuity после implementation:

- PR #43 — `docs: sync state after analytics activation contract`;
- squash `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- exact docs head `3d4f4754c5e92a56aeb99a2439b067e71ec58bab`;
- Build #368 / run `30561811875` — fully green.

### Что реализовано

Production analytics contract использует GitHub Actions **repository variable**:

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

Deployment modes:

- `auto` — default для push в `master`;
- `required` — strict manual activation/verification;
- `disabled` — manual kill switch.

Гарантии:

- invalid configured token останавливает workflow до build/upload/deploy;
- absent token в `auto` сохраняет analytics-free deployment;
- `required` не позволяет принять tokenless deployment за успешную activation;
- `disabled` принудительно публикует сайт без beacon;
- Pages workflow остаётся единственным production build/deploy path;
- diagnostic reports не содержат token или token hash.

### Generated и deployed verification

До Pages upload проверяются:

- `docs-html/index.html`;
- `docs-html/en/index.html`.

После `actions/deploy-pages` проверяются production RU/EN pages и основные публичные endpoints.

Enabled contract требует:

- ровно один owned beacon;
- official Cloudflare source;
- exact `type="module"`;
- exact `defer` attribute;
- valid `data-cf-beacon` с только `token` и `spa: false`;
- token, совпадающий с configured deployment token.

Disabled contract требует 0 owned beacons. Third-party script во время verifier/smoke не исполняется.

Основные owners:

- `scripts/analytics.js` — policy + build injection;
- `scripts/analytics-deployment.js` — mode resolution + static verification;
- `scripts/analytics-browser-smoke.cjs` — privacy/failure browser contract;
- `scripts/production-smoke.js` — deployed availability/identity/analytics state;
- `.github/workflows/static.yml` — Pages deployment;
- `.github/workflows/external-health.yml` — weekly production health.

---

## 3. Strict production activation evidence

Первая строгая публикация:

- workflow: `Deploy static content to Pages`;
- run: `30572276691`;
- source branch: `master`;
- source SHA: `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- mode: `required`;
- result: **success**.

Deployment contract report:

```json
{
  "mode": "required",
  "enabled": true,
  "expectation": "enabled",
  "reason": "configured-token"
}
```

Production smoke:

- checked at `2026-07-30T18:52:23.959Z`;
- base URL: `https://true-ruslan.github.io/trueruslan-landing/`;
- report `ok: true`;
- homepage, projects, `/now`, Engineering Map, Notes, Photo Stories, Atom, resume, PDF, OG images, styles, scripts и favicon — healthy;
- production RU `index.html` — 1 valid beacon;
- production EN `en/index.html` — 1 valid beacon;
- identity errors — none.

Preserved GitHub artifact:

- `production-verification-reports`;
- artifact id `8771279567`;
- digest `sha256:65e31cb8d6ea1c4e208bdc488eed19f0a395dcd37feada04f958e92998b63944`.

---

## 4. Provider telemetry evidence

Владелец проекта предоставил Cloudflare Web Analytics dashboard snapshot после strict deployment.

На snapshot за последние 24 часа:

- Page views: `4`;
- Visits: `0`;
- Page load time: `282 ms`;
- LCP P50: `388 ms`;
- LCP P75: `740 ms`;
- LCP P90: `1316 ms`;
- LCP P99: `1316 ms`;
- LCP / INP / CLS отображаются в green/good state.

Это подтверждает, что provider получил и отобразил production telemetry.

Ограничение evidence:

- выборка крайне мала;
- первые просмотры, вероятно, включают owner verification traffic;
- `0 visits` при `4 page views` на такой выборке не является основанием для bug claim;
- эти цифры нельзя использовать для product conclusions, аудитории или performance trends;
- screenshot не содержит долгосрочного observation window.

---

## 5. Operational truth — строго раздельно

### 1. Repository ready — YES

Подтверждено PR #42, exact implementation head и Build #367.

### 2. Production beacon active — YES

Подтверждено strict run `30572276691`, enabled deployment contract и green RU/EN production smoke.

### 3. Telemetry observed — YES

Подтверждено owner-provided Cloudflare dashboard snapshot с ненулевыми page views и Core Web Vitals.

### 4. Достаточно данных для product decisions — NO

Нужен более длинный aggregate observation window и внешний, не только owner-generated traffic.

---

## 6. Privacy/security boundary

Не добавлены:

- Cloudflare account/API credentials;
- provider provisioning automation;
- custom events;
- analytics cookies;
- persistent visitor identifiers;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- analytics-driven product behavior.

Public Cloudflare site token при enabled deployment находится в public HTML/Pages artifact по назначению. Он не хранится в repository source и исключён из diagnostic reports.

Любое расширение beyond `pageviews-and-rum` требует нового explicit design/privacy review.

---

## 7. Архитектурные принципы

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

## 8. Canonical data и ownership

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

---

## 9. Milestones

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
- P2.2a Production analytics activation contract — DONE: PR #42, Build #367.
- First strict production activation — DONE: run `30572276691`.
- First provider telemetry observation — DONE (initial bounded snapshot).

---

## 10. Current quality matrix

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

Latest exact implementation evidence:

- head `21181a30d85d9f68536b266a326f849d4b451959`;
- Build #367 / run `30560152774` — fully green.

Latest strict production evidence:

- master SHA `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- run `30572276691` — fully green deployment and production verification.

---

## 11. Следующий оптимальный шаг

Analytics infrastructure больше не является blocker.

Правильная последовательность:

1. сохранить текущий snapshot как baseline, но не интерпретировать 4 page views как audience signal;
2. обеспечить внешний трафик через GitHub profile, project READMEs, резюме, Хабр/Telegram и другие реальные entry points;
3. наблюдать aggregate routes, RU/EN, referrers и Core Web Vitals не менее 3–4 недель;
4. параллельно выбрать следующий bounded milestone, который не зависит от ложной статистической уверенности.

Recommended next candidates:

- **P2.3 Custom domain + public launch** — при готовности выбрать и купить домен;
- **Real content sprint** — сильные case studies Vlezet/VillAIgence, `/now`, Engineering Notes;
- **First genuine Photo Story** — при наличии authentic material;
- selective RU/EN expansion — только по usage/content signal.

Яндекс.Метрика не является immediate priority. Возвращаться к secondary provider стоит только если Cloudflare систематически не даёт достаточного российского signal и проект готов принять отдельный consent/privacy layer.

---

## 12. Намеренные запреты

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

## 13. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь actual open PR, последние commits и exact-head CI. Если речь о production или analytics, отдельно проверь latest Pages run/report, deployed RU/EN beacon state, weekly External health и текущий Cloudflare observation window.
