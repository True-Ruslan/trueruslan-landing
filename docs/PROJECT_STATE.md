# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-01**, после успешного P2.3b HTTPS Production Cutover на `https://trueruslan.ru`.
>
> Главный durable snapshot для ответа на вопрос **«что представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
> 4. `docs/CUSTOM_DOMAIN.md`
>
> Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment reports, production HTTPS/redirects, Cloudflare dashboard и maintenance workflows.

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
- privacy-friendly Cloudflare Web Analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, deployment и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

---

## 2. Последний завершённый milestone

### P2.3b — HTTPS Production Cutover — DONE

Новый canonical production origin:

`https://trueruslan.ru`

Deployment:

- workflow: `Deploy static content to Pages`;
- run: `30704218399`;
- branch: `master`;
- source SHA: `9a92a0bea78ecf7aa471d445fe3513cfadc7d378`;
- job `deploy`: **success**;
- `site_mode=custom`;
- `analytics_mode=required`.

Все deployment steps завершились успешно:

- tests;
- site deployment preflight;
- analytics deployment preflight;
- production build;
- generated-site integrity;
- generated analytics verification;
- Pages artifact upload;
- GitHub Pages deployment;
- deployed production smoke;
- production verification reports upload.

### Site deployment contract

Сохранённый `site-deployment-contract.json`:

```json
{
  "mode": "custom",
  "origin": "https://trueruslan.ru",
  "productionUrl": "https://trueruslan.ru/",
  "target": "custom",
  "reason": "forced-custom"
}
```

Это подтверждает, что опубликован именно custom-origin artifact, а не legacy fallback.

### Analytics deployment contract

Сохранённый `analytics-deployment-contract.json`:

```json
{
  "mode": "required",
  "enabled": true,
  "expectation": "enabled",
  "reason": "configured-token"
}
```

Analytics и site identity остаются независимыми fail-closed contracts.

### Production smoke evidence

`production-smoke-report.json`:

- checked at `2026-08-01T14:39:56.996Z`;
- base URL `https://trueruslan.ru/`;
- `ok: true`;
- identity errors: none;
- homepage final URL: `https://trueruslan.ru/`;
- RU canonical: `https://trueruslan.ru/`;
- EN canonical: `https://trueruslan.ru/en/`;
- RU analytics beacon count: `1`;
- EN analytics beacon count: `1`.

Healthy production surfaces include:

- homepage;
- Projects;
- `/now`;
- Engineering Map;
- Engineering Notes;
- Photo Stories;
- Atom feed;
- Resume and PDF;
- OpenGraph images;
- CSS and JavaScript assets;
- favicon.

Production verification artifact:

- name: `production-verification-reports`;
- artifact id: `8819800463`;
- digest: `sha256:49bd2a9e40ebda41cc4aa8c925e15392aff9fbcd7739ca01d2934550116b58c0`;
- expires: `2026-08-15T14:39:57Z`.

### Manual owner acceptance

Владелец подтвердил:

- GitHub Pages DNS check — successful;
- `Enforce HTTPS` — enabled;
- HTTPS apex — working;
- `www` redirects to apex;
- все проверенные публичные ссылки работают.

---

## 3. Custom-domain operational truth

### 1. Domain ownership verified — YES

GitHub account-level verification для `trueruslan.ru` успешна. TXT verification record должен сохраняться.

### 2. DNS configured for GitHub Pages — YES

Apex:

- `185.199.108.153`;
- `185.199.109.153`;
- `185.199.110.153`;
- `185.199.111.153`.

Alternate:

`www.trueruslan.ru CNAME true-ruslan.github.io`

Лишняя Timeweb AAAA-запись была удалена; после этого GitHub DNS check стал green.

### 3. GitHub Pages TLS / Enforce HTTPS — YES

GitHub Pages certificate установлен, `https://trueruslan.ru/` работает, `Enforce HTTPS` включён.

Отдельный SSL-сертификат Timeweb не используется и не нужен.

### 4. Canonical custom production deployment — YES

Подтверждено run `30704218399`, custom site contract и production smoke.

### 5. Analytics beacon on custom hostname — YES

Подтверждено required analytics contract и production RU/EN smoke: ровно один owned beacon на каждой главной странице.

### 6. Cloudflare provider telemetry for custom hostname — OBSERVATION PENDING

Deployment доказывает публикацию корректного beacon, но durable state пока не содержит отдельного dashboard snapshot с данными нового hostname.

Это не блокирует завершение HTTPS cutover. Отдельно нужно подтвердить первые реальные page views/RUM в Cloudflare для `trueruslan.ru`.

---

## 4. Repository architecture supporting the cutover

P2.3a был завершён до внешнего переключения:

- PR #45 — `feat: prepare custom domain deployment`;
- squash `f2a232e55979ed17014596262abfaf2a70ef2e63`;
- exact head `117128fba94ae9c4df787125393a9d08f2b712c5`;
- Build #390 / run `30700124919` — fully green.

Durable readiness sync:

- PR #46 — `docs: sync custom domain readiness state`;
- squash `9a92a0bea78ecf7aa471d445fe3513cfadc7d378`;
- exact docs head `7ad48f0453e6c8247d07d985af1cba22647cbcc5`;
- Build #391 / run `30700514596` — fully green.

Core ownership:

- `data/site.json` — legacy/custom public identity;
- `scripts/site-deployment.js` — `auto|legacy|custom` resolver;
- `scripts/site-artifact.js` — generated custom identity verification;
- `scripts/production-smoke.js` — deployed availability, canonical identity and analytics;
- `.github/workflows/static.yml` — Pages deployment;
- `.github/workflows/external-health.yml` — weekly monitoring;
- `docs/CUSTOM_DOMAIN.md` — activation/verification/rollback runbook.

Rollback remains available through `site_mode=legacy` without weakening verification.

---

## 5. Previous completed milestones

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
- P2.2a Legacy analytics operational closure — DONE: run `30572276691` + provider snapshot.
- P2.3a Custom Domain Readiness — DONE: PR #45, Build #390.
- **P2.3b HTTPS Production Cutover — DONE: run `30704218399`.**

---

## 6. Architectural boundaries

Главная граница:

**static-first + build-time intelligence + progressive enhancement**.

Без нового design decision нельзя ломать:

- core content без runtime API;
- JS как enhancement;
- no backend/CMS/database без необходимости;
- one canonical source of truth;
- deterministic build-time generation;
- semantic/no-JS content;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- one RU/EN site/build/search architecture;
- analytics как optional aggregate telemetry;
- no behavioural tracking без explicit privacy review;
- no weakening quality gates ради скорости.

---

## 7. Known operational notes / debt

- Локальный plain-DNS `dig` из российской сети давал ложные `REFUSED`; Google/Cloudflare DoH был надёжнее. Это network diagnostic caveat, не product defect.
- Legacy GitHub Pages origin сохраняется как transport/rollback compatibility, но canonical public identity теперь `https://trueruslan.ru`.
- Нужно подтвердить первые Cloudflare telemetry data для нового hostname.
- First real Photo Story всё ещё зависит от authentic content.
- Выборка analytics должна накапливаться 3–4 недели после реального распространения сайта до серьёзных product decisions.

---

## 8. Следующий оптимальный шаг

Инфраструктурный custom-domain milestone завершён. Следующая фаза — **real content and distribution loop**.

Приоритет:

1. подтвердить provider telemetry для `trueruslan.ru`;
2. обновить внешние публичные ссылки на новый домен: GitHub profile, project READMEs, CV, Habr/Telegram и используемые профессиональные профили;
3. подготовить сильный Vlezet case study;
4. подготовить flagship VillAIgence case study;
5. обновить `/now`;
6. выпустить 1–2 grounded Engineering Notes;
7. добавить первую genuine Photo Story при готовом материале;
8. собирать aggregate data 3–4 недели;
9. выбирать дальнейший RU/EN/content/product milestone по evidence.

Яндекс.Метрика остаётся conditional: только если Cloudflare систематически не даёт достаточного российского signal и оправдан отдельный consent/privacy layer.

---

## 9. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` и `docs/CUSTOM_DOMAIN.md`. Затем проверь actual open PR, latest commits и exact-head CI. Отдельно проверь latest Pages deployment reports, HTTPS/redirect state, active custom site contract, RU/EN canonical/analytics state и Cloudflare telemetry для `trueruslan.ru`.
