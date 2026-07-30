# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-30**, после merge P2.2a Production analytics activation contract PR #42.
>
> Это смысловая история проекта: что сделали, зачем, какие решения приняли, какие ошибки обнаружили и чем подтвердили результат.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`.

---

# 2026-07-30

## P2.2a — Production analytics activation contract

### Зачем

P2.2 добавил privacy-friendly build-time analytics, но production GitHub Pages workflow не передавал реальную configuration variable и не проверял deployed beacon state.

Кодовая готовность, deployed beacon и provider telemetry были разными фактами, но deployment path не умел фиксировать эту разницу автоматически.

### Design decision

Выбран GitHub Actions **repository variable**:

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

Не Secret, потому что Cloudflare Web Analytics site token является public site identifier и при enabled deployment находится в HTML.

Не hardcode, потому что deployment identity должна изменяться и отключаться без code commit.

Repository scope выбран вместо environment-only scope, поскольку один value должен быть доступен и Pages deployment, и scheduled `External health` workflow.

### Deployment modes

Добавлены три explicit mode:

- `auto` — default для push в `master`;
- `required` — strict manual activation/verification;
- `disabled` — manual kill switch.

Semantics:

- `auto` + valid token → enabled;
- `auto` + no token → analytics-free deployment;
- `required` + no/invalid token → fail before build/deploy;
- `disabled` → force analytics-free artifact независимо от configured token;
- malformed configured token never silently degrades to disabled.

### Implementation

**PR #42 — `ci: activate and verify production analytics`**

Squash:

`522140dda2cab121e6a5c2a099dce9e491f1b49b`

Exact implementation head:

`21181a30d85d9f68536b266a326f849d4b451959`

Final PR verification:

**Build #367 / run `30560152774`: fully green по полной configured matrix.**

Added:

- `scripts/analytics-deployment.js`;
- `scripts/analytics-deployment.test.js`;
- `scripts/analytics-workflow.test.js`;
- production analytics checks in `scripts/production-smoke.js`;
- production-smoke regression tests;
- Pages workflow activation/preflight/artifact verification;
- weekly health production-state verification;
- design, authoritative amendment, plan and operator runbook.

### Preflight contract

`scripts/analytics-deployment.js`:

- validates mode and optional token;
- derives bounded `mode/enabled/expectation/reason`;
- masks configured token before ordinary workflow output;
- writes `ANALYTICS_EXPECTATION` and build token through `GITHUB_ENV`;
- writes `analytics-deployment-contract.json` without token/hash;
- fails closed for invalid mode/configuration.

### Generated artifact verification

Before Pages upload the workflow verifies:

- `docs-html/index.html`;
- `docs-html/en/index.html`.

Enabled contract requires:

- exactly one owned beacon;
- exact official provider source;
- exact `type="module"`;
- exact `defer`;
- JSON config with only `token` and `spa: false`;
- exact configured token match.

Disabled contract requires zero owned beacons.

The verifier parses static HTML and never executes provider JavaScript.

### Production verification

After `actions/deploy-pages`, `scripts/production-smoke.js` verifies:

- existing public endpoint health;
- homepage identity;
- Atom feed identity;
- deployed RU analytics state;
- deployed EN analytics state;
- exact token match when enabled;
- zero beacons when disabled.

`production-smoke-report.json` remains token-free.

### Weekly monitoring

`External health` now:

1. runs `npm ci`;
2. resolves current contract in `auto`;
3. runs existing external endpoint checks;
4. checks deployed Pages RU/EN analytics state;
5. uploads bounded health/production/deployment reports.

It does not execute the Cloudflare script.

### TDD / debugging trail

#### Build #353 — expected RED

Run `30538155450`.

Resolver module was absent; `Test` failed and downstream skipped.

#### Build #354 — GREEN checkpoint

Deployment resolver/CLI, production build and integrity passed.

#### Build #356 — expected RED

Run `30538461394`.

HTML/artifact/production inspection contracts existed before implementation.

#### Build #358 — GREEN checkpoint

RU/EN artifact and production inspection passed tests/build/integrity.

#### Build #359 — expected RED

Workflow ownership/ordering contract preceded Pages and health wiring.

#### Build #361 — debugging RED

Pages contract passed, but weekly workflow lacked an explicit fail-closed guard around dynamic `ANALYTICS_EXPECTATION`.

The guard was added; privacy semantics were not weakened.

#### Build #362 — GREEN checkpoint

Workflow integration passed, including existing privacy analytics browser smoke.

#### Scope review amendment

Two ambiguities were corrected explicitly:

1. configuration variable is repository-scoped, not environment-only;
2. enabled Pages site artifact necessarily contains the public site token, while diagnostic/report artifacts must not.

#### Build #366 — expected regression RED

Run `30560000925`.

Test proved that `deferx` could be incorrectly accepted as `defer` by a permissive attribute regex.

Parser was changed to require an exact attribute-name boundary: whitespace, `=`, `/` or `>`.

#### Build #367 — final GREEN

Run `30560152774`.

Fully green:

- tests;
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
- quality evidence upload.

### Security/privacy result

Not added:

- real Cloudflare token in repository;
- account/API credentials;
- provisioning automation;
- token/hash in diagnostic reports;
- custom events;
- cookies;
- persistent IDs;
- fingerprinting;
- session replay;
- advertising/cross-site tracking;
- analytics product dependency.

### Operational result

Three facts remain separate:

1. **Repository ready — verified.**
2. **Production beacon active — not independently verified in this snapshot.**
3. **Telemetry observed — not verified.**

The available GitHub connector exposes PR-triggered runs but not list-push-runs/deployments, so the automatic master Pages run after merge was not promoted to a verified fact without report evidence.

The remaining external action is Cloudflare site/token setup plus manual `required` deployment and dashboard verification.

---

# 2026-07-23

## P2.2 — Privacy-friendly analytics

PR #40 / squash `2dacace5de6b6c1225e82b372faef093850f4c9f`.

Exact head `577fe9149988497d954f8ad9316467089ce50286`, Build #351 / run `30003347268` fully green.

Added bounded Cloudflare Web Analytics manual beacon, tokenless default, strict privacy policy and blocked-network browser gate.

## P2.1 — Minimal RU/EN

PR #38 / squash `00f7513f685b8a8348005d0ab704ce96abe64950`.

Exact head `d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`, Build #339 / run `30000373281` fully green.

Seven bilingual pairs under one build/site/search architecture.

## P1.4 — Additional Grounded Engineering Note

PR #36 / squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`, Build #308.

Added `llm-output-is-a-protocol-boundary`: provider success is not application contract success.

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
