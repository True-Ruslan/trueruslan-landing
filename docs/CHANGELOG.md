# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-01**, после завершения P2.4b header utility navigation and language consolidation.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-01

## P2.4b — Header utility navigation and language consolidation

PR #51 завершил утверждённую переработку шапки, внешних ссылок, поиска, переключателя языка и hero-actions.

### UI behavior

- utility order: `GitHub → Habr → Telegram → Search → Language`;
- GitHub, Habr, Telegram и поиск используют доступные icon-only controls;
- язык является последним правым элементом шапки;
- floating language switch и его duplicate visual/hit layer удалены;
- RU/EN pair routing использует существующие i18n metadata;
- untranslated routes получают language-home fallback;
- menu поддерживает keyboard navigation, Escape, outside click, focus return и no-JS links;
- `Резюме` удалено только из hero и сохранено в primary navigation;
- RU/EN hero теперь содержит Projects + GitHub + Habr + Telegram;
- CTA indicators имеют одного CSS owner, поэтому double arrows отсутствуют.

Canonical external links:

- `https://github.com/True-Ruslan`;
- `https://habr.com/ru/users/TrueRuslan/`;
- `https://t.me/TrueRuslan_Blog`.

### Verification evidence

```text
feature PR:          #51
exact feature head:  8bd77b90f778f6384be3b9de93e69c9bc4b77e21
Build / run:         #418 / 30719138639 — SUCCESS
squash on master:    c6a7b74e8b0f7d07f44794505d348ab6ef5afb4e
```

Green gates included unit tests, production build, generated-site integrity, mobile overflow, Chromium/Axe/Lighthouse, Sources, Project Evidence, Photo Stories, portfolio v0.3, Firefox/WebKit, generated search, RU/EN route/header/keyboard behavior, privacy analytics, metadata/OpenGraph, Engineering Map, reviewed visual regression and custom-domain artifact verification.

No search ownership, Cmd/Ctrl+K behavior, Cloudflare analytics, custom-domain contract, hosting, dependency or content-authority behavior changed.

---

## P2.4a — Canonical link rollout and first custom-host telemetry

### Cloudflare provider evidence

```text
last 24 hours, GMT+3, bots excluded
visits: 7
page views: 8
page load time: 656 ms
LCP P50/P75/P90/P99: 648 / 744 / 829 / 829 ms
observed LCP sample: 100% Good
```

The binary provider-observation gate is closed. The sample is not audience validation; 3–4 weeks of aggregate observation remain required.

### Rollout evidence

```text
planning PR #48: 174c8483be42a9001f790edaa641580c4da5f9c5 → 9bedf491ca035549621147edaea51c02af9a79c1
Build #393 / 30714283321 — SUCCESS

Landing PR #49: 2ec11652e118dfe89da3daf5b2cb1b34a89612b6 → 8e9f961e558790edfe66e972cef625097d465c6d
Build #397 / 30714659945 — SUCCESS

Vlezet PR #36 → accbf57a9ef810217f7066d0e9a862b7e5a406a1
Vlezet continuity PR #37 → 1aa82a39b9f45e401c63e487f35b17a740200f59
CI: 30714871143 / 30715303395 / 30715303389 — SUCCESS

VillAIgence PR #90 → 62091309f61667ce38a6c60aa9477309093392c5
VillAIgence continuity PR #91 → 780aea86bcdf68c26436e3e0e8f84dfce56fe6a9
CI: 30714996167 / 30714996171 / 30714996231 / 30715480021 / 30715480026 / 30715480020 — SUCCESS
```

PDF verification: three duplicate URI annotations replaced, three pages rendered before/after at 200 DPI, zero changed pages/pixels, no visible layout/content change.

Remaining manual surfaces: GitHub profile Website field, Habr, Telegram and other external professional profiles.

No runtime, dependency, hosting, rollback, analytics-policy, privacy, search or product-authority behavior changed.

---

## P2.3b — HTTPS Production Cutover

### External gate closure

После P2.3a repository readiness был завершён внешний GitHub Pages gate:

- `trueruslan.ru` verified на уровне GitHub account;
- apex A records направлены на четыре GitHub Pages IPv4;
- `www.trueruslan.ru CNAME true-ruslan.github.io` опубликован;
- конфликтующая Timeweb AAAA-запись удалена;
- GitHub repository Pages DNS check стал successful;
- GitHub Pages TLS certificate установлен;
- `Enforce HTTPS` включён;
- владелец подтвердил работу публичных ссылок и `www` redirect to apex.

### Strict custom deployment

Workflow:

`Deploy static content to Pages`

Run:

`30704218399`

Source:

- branch `master`;
- SHA `9a92a0bea78ecf7aa471d445fe3513cfadc7d378`;
- `site_mode=custom`;
- `analytics_mode=required`.

Result:

**job `deploy` — success.**

Green steps:

- tests;
- site deployment contract;
- analytics deployment contract;
- build;
- generated-site integrity;
- generated analytics verification;
- Pages artifact upload;
- GitHub Pages deploy;
- deployed production smoke;
- verification report upload.

### Site deployment evidence

`site-deployment-contract.json`:

```json
{
  "mode": "custom",
  "origin": "https://trueruslan.ru",
  "productionUrl": "https://trueruslan.ru/",
  "target": "custom",
  "reason": "forced-custom"
}
```

This proves the deployment used the custom origin rather than legacy fallback.

### Analytics deployment evidence

`analytics-deployment-contract.json`:

```json
{
  "mode": "required",
  "enabled": true,
  "expectation": "enabled",
  "reason": "configured-token"
}
```

### Deployed production evidence

`production-smoke-report.json`:

- checked at `2026-08-01T14:39:56.996Z`;
- base URL `https://trueruslan.ru/`;
- report `ok: true`;
- identity errors: none;
- homepage final URL `https://trueruslan.ru/`;
- RU canonical `https://trueruslan.ru/`;
- EN canonical `https://trueruslan.ru/en/`;
- RU beacon count `1`;
- EN beacon count `1`.

Healthy endpoints/assets:

- homepage;
- Projects;
- `/now`;
- Engineering Map;
- Engineering Notes;
- Photo Stories;
- Atom feed;
- Resume and PDF;
- OpenGraph images;
- CSS/JS assets;
- favicon.

Artifact:

- name `production-verification-reports`;
- id `8819800463`;
- digest `sha256:49bd2a9e40ebda41cc4aa8c925e15392aff9fbcd7739ca01d2934550116b58c0`;
- expiry `2026-08-15T14:39:57Z`.

### Operational truth after cutover

1. **Domain ownership — verified.**
2. **DNS contract — verified.**
3. **GitHub Pages TLS / Enforce HTTPS — active.**
4. **Custom canonical production origin — verified.**
5. **RU/EN production identity — verified.**
6. **Analytics beacon on custom origin — verified.**
7. **Provider dashboard telemetry for custom hostname — verified.**

The first custom-host snapshot is recorded in P2.4a. It confirms telemetry delivery but remains too small for audience or product conclusions.

### Product consequence

Infrastructure work is no longer the next priority. The roadmap advances to real content, external distribution and a 3–4 week aggregate observation window.

---

## P2.3a — Custom Domain Readiness

Feature PR #45:

- squash `f2a232e55979ed17014596262abfaf2a70ef2e63`;
- exact head `117128fba94ae9c4df787125393a9d08f2b712c5`;
- Build #390 / run `30700124919` fully green.

Implemented:

- canonical `data/site.json`;
- `TR_PRODUCTION_SITE_URL`;
- `auto|legacy|custom` site modes;
- fail-closed origin resolution;
- generated and deployed identity verification;
- dual-origin CI build;
- custom artifact verifier;
- activation and rollback runbook.

Durable sync PR #46:

- squash `9a92a0bea78ecf7aa471d445fe3513cfadc7d378`;
- exact docs head `7ad48f0453e6c8247d07d985af1cba22647cbcc5`;
- Build #391 / run `30700514596` fully green.

P2.3a deliberately separated repository readiness from the external DNS/TLS cutover that P2.3b has now closed.

---

# 2026-07-30

## P2.2a operational closure — production analytics live

Legacy strict deployment:

- run `30572276691`;
- analytics mode `required`;
- legacy RU/EN beacon state verified;
- provider telemetry observed;
- initial sample marked insufficient for product conclusions.

## P2.2a Production analytics activation contract

PR #42:

- squash `522140dda2cab121e6a5c2a099dce9e491f1b49b`;
- exact head `21181a30d85d9f68536b266a326f849d4b451959`;
- Build #367 / run `30560152774` fully green.

Added `auto|required|disabled`, fail-closed preflight, generated/deployed RU/EN verification, weekly monitoring and bounded reports.

Continuity:

- PR #43 / Build #368;
- PR #44 / Build #369 recorded actual legacy telemetry.

---

# 2026-07-23

## P2.2 Privacy-friendly analytics

PR #40 / Build #351.

Added optional Cloudflare pageviews/RUM layer with tokenless default and no custom events, cookies, persistent IDs, replay or cross-site tracking.

## P2.1 Minimal RU/EN

PR #38 / Build #339.

Seven bilingual route pairs under one build/site/search architecture.

## P1.4 Additional Grounded Engineering Note

PR #36 / Build #308.

Added `llm-output-is-a-protocol-boundary`.

---

# 2026-07-22

- P1.3 Flagship Case-Study Format — PR #34, Build #301.
- P1.2 Project Metadata Cleanup — PR #31, Build #296.
- P1.1 Browser Quality Harness — PR #29, Build #293.
- P0.6 Content Freshness Guard — PR #27, Build #269.
- P0.5 Grounded Engineering Notes — PR #25, Build #257.
- P0.4 Project Evidence Layer — PR #22, Build #247.
- P0.3 Sources Knowledge Base — PR #20.
- P0.1 Photo Stories platform — PR #15 + QA PR #17.

---

## Durable continuity principle

After major milestones synchronize:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

These files are snapshots, not substitutes for actual repository, CI, Pages deployment reports, DNS/TLS state and provider checks.
