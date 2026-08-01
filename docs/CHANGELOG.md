# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-01**, после успешного P2.3b HTTPS Production Cutover на `https://trueruslan.ru`.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-01

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
7. **Provider dashboard telemetry for custom hostname — observation pending.**

The pending provider snapshot is an observation follow-up, not a blocker for the completed HTTPS cutover.

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
