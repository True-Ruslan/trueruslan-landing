# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-30**, после strict production analytics activation и первого подтверждённого provider telemetry snapshot.
>
> Это смысловая история проекта: что сделали, зачем, какие решения приняли, какие ошибки обнаружили и чем подтвердили результат.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`.

---

# 2026-07-30

## P2.2a operational closure — production analytics live

### Зачем

После merge repository activation contract оставались два непроверенных факта:

1. действительно ли strict GitHub Pages deployment публикует enabled beacon;
2. действительно ли Cloudflare принимает и отображает production telemetry.

Ни green PR CI, ни наличие integration code сами по себе этого не доказывали.

### Strict production deployment

Владелец проекта создал реальный Cloudflare Web Analytics site token, сохранил его как GitHub Actions repository variable и вручную запустил:

- workflow `Deploy static content to Pages`;
- run `30572276691`;
- branch `master`;
- source SHA `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- `analytics_mode=required`.

Result: **success**.

Green steps включали:

- tests;
- analytics deployment preflight;
- production build;
- generated-site integrity;
- generated analytics verification;
- Pages artifact upload;
- GitHub Pages deployment;
- deployed Pages smoke;
- production verification report upload.

### Preserved deployment evidence

`analytics-deployment-contract.json`:

```json
{
  "mode": "required",
  "enabled": true,
  "expectation": "enabled",
  "reason": "configured-token"
}
```

`production-smoke-report.json`:

- checked at `2026-07-30T18:52:23.959Z`;
- base URL `https://true-ruslan.github.io/trueruslan-landing/`;
- `ok: true`;
- no identity errors;
- all monitored public routes/assets healthy;
- RU `index.html`: 1 valid beacon;
- EN `en/index.html`: 1 valid beacon.

GitHub artifact:

- name `production-verification-reports`;
- id `8771279567`;
- digest `sha256:65e31cb8d6ea1c4e208bdc488eed19f0a395dcd37feada04f958e92998b63944`.

### Provider telemetry observed

Владелец предоставил Cloudflare Web Analytics dashboard snapshot после deployment.

Initial bounded snapshot:

- Page views: 4;
- Visits: 0;
- Page load time: 282 ms;
- LCP P50: 388 ms;
- LCP P75: 740 ms;
- LCP P90: 1316 ms;
- LCP P99: 1316 ms;
- LCP / INP / CLS shown as good/green.

Это доказывает provider-side telemetry observation, но не даёт достаточной статистической базы для audience или performance decisions. Первые просмотры могли быть owner verification traffic.

### Operational truth after closure

1. **Repository ready — verified.**
2. **Production beacon active — verified.**
3. **Telemetry observed — verified.**
4. **Enough evidence for product decisions — not yet.**

### Product consequence

Analytics infrastructure больше не является blocker.

Следующая фаза — public identity, real content, distribution и 3–4 недели aggregate observation. Secondary analytics, custom events и behavioural tracking не добавляются без доказанной необходимости и нового privacy decision.

---

## P2.2a — Production analytics activation contract

### Implementation

PR #42 — `ci: activate and verify production analytics`.

- squash `522140dda2cab121e6a5c2a099dce9e491f1b49b`;
- exact head `21181a30d85d9f68536b266a326f849d4b451959`;
- Build #367 / run `30560152774` fully green.

Added:

- `scripts/analytics-deployment.js`;
- deployment modes `auto|required|disabled`;
- fail-closed token/mode preflight;
- generated RU/EN beacon verification;
- deployed RU/EN verification;
- weekly External health verification;
- token-free bounded reports;
- operator activation/rollback runbook.

TDD/debugging evidence:

- Build #353 — RED, resolver absent;
- Build #354 — resolver GREEN;
- Build #356 — RED, inspection contracts before implementation;
- Build #358 — inspection GREEN;
- Build #359 — RED, workflow contract before wiring;
- Build #361 — debugging RED, missing weekly fail-closed expectation guard;
- Build #362 — workflow integration GREEN;
- Build #366 — regression RED, `deferx` could be accepted as `defer`;
- exact attribute-name boundary added;
- Build #367 — final full GREEN.

Privacy boundary remained unchanged: no account/API credentials, custom events, cookies, persistent IDs, fingerprinting, session replay, advertising or cross-site tracking.

## Durable continuity after P2.2a

PR #43 — `docs: sync state after analytics activation contract`.

- squash `5b9bd5b1e022bb8a5f24a53bdf4200613bd2a59e`;
- exact docs head `3d4f4754c5e92a56aeb99a2439b067e71ec58bab`;
- Build #368 / run `30561811875` fully green.

At that snapshot repository readiness was verified, while production beacon and telemetry were intentionally marked unverified. The strict run and provider snapshot above close those facts without rewriting history.

---

# 2026-07-23

## P2.2 — Privacy-friendly analytics

- PR #40 / squash `2dacace5de6b6c1225e82b372faef093850f4c9f`;
- exact head `577fe9149988497d954f8ad9316467089ce50286`;
- Build #351 / run `30003347268` fully green.

Added bounded Cloudflare Web Analytics manual beacon, tokenless default, strict pageviews/RUM privacy policy and blocked-network browser gate.

## P2.1 — Minimal RU/EN

- PR #38 / squash `00f7513f685b8a8348005d0ab704ce96abe64950`;
- exact head `d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`;
- Build #339 / run `30000373281` fully green.

Seven bilingual route pairs under one build/site/search architecture.

## P1.4 — Additional Grounded Engineering Note

- PR #36 / squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`;
- Build #308.

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

Created modular `scripts/quality-harness/` while preserving focused runner ownership.

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

Added 31 real records, strict validation, semantic/no-JS rendering and local filters.

## P0.1 — Photo Stories platform

PR #15 + QA PR #17.

Platform ready; fake/demo album was not created.

---

## Durable continuity principle

After major milestones synchronize:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

These files are snapshots, not substitutes for actual repository, CI, Pages deployment and provider checks.
