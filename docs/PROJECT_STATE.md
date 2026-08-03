# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после Content Freshness closure, exact dependency triage и high-severity remediation.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано, что доказано и что дальше?**

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

После чтения отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard и external-project acceptance. Repository readiness, generated artifact, deployed production state и provider telemetry — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Проект объединяет standalone homepage, Diplodoc knowledge pages, web-CV, evidence-backed project case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, full-text search, Photo Stories, Sources Knowledge Base, Project Evidence Layer, Content Freshness Guard, bounded RU/EN, privacy-friendly Cloudflare Web Analytics и production-oriented CI.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

```text
master after security remediation:  2e1bbd8e4b8e8e77319691a785f5ce14402f3389
security PR:                        #94 — MERGED
exact security head:                ef47f18d52ca2d3e334e3c95d8fa312f167cc217
Build:                              #695 / 30859354170 — SUCCESS
CodeQL:                             #143 / 30859354188 — SUCCESS
Dependency Review:                  #123 / 30859354189 — SUCCESS
Dependency Audit:                   #7 / 30859354182 — SUCCESS
unit tests:                         331 PASS / 0 FAIL
Lighthouse:                         100 / 100 / 100 / 100
quality artifact:                   8873810664
quality digest:                     sha256:e2fb7c614257c4dbd7b5eaa091fca4eb236be8bf717eadc17b810d6bbaa3fd17
audit artifact:                     8873716981
audit digest:                       sha256:0fe1ca448dbe00eeeba54fe89bea1efbb99d6428c5e7fda2c110cf0814f9e765
```

Build #695 прошёл production build, generated-site integrity, mobile overflow, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio v0.3, Firefox/WebKit, generated search, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression и custom-domain artifact verification.

Documentation-only continuity sync фиксирует final operational/security state. Push-triggered Pages deployment и production visual acceptance остаются отдельными фактами.

---

## 3. P2.4k — Restart and Persistence as Product Contract — DONE

Published Engineering Note:

**«Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence»**

Canonical route:

`landing/notes/restart-persistence-is-a-product-contract.html`

Core evidence model:

```text
write
→ completed save
→ controlled shutdown
→ exact artifact restart
→ unique canonical discovery
→ parse and schema check
→ semantic identity/isolation check
→ user-visible continuity
```

Persistence разделена на storage durability, structural readability, semantic continuity и behavioral continuity. Equal SHA-256 подтверждает byte continuity только в no-mutation scenario и не заменяет read-back, identity/isolation или behavioral checks.

```text
feature PR:            #89 — MERGED
exact feature head:    e73a94d5d2b832d188e62b8790b4d039ac797a44
squash:                40af9e52237f03da58355caa065a40b64ad597d8
Build:                 #680 / 30856377655 — SUCCESS
unit tests:            327 PASS / 0 FAIL
```

PR #104 remains automated no-mutation production-JAR restart evidence, not completed provider/multiplayer/manual cumulative acceptance.

---

## 4. Operational Maintenance Closure — DONE

### O1 — Content Freshness reconciliation

PR #91 added path-scoped pull-request freshness evidence while retaining scheduled/manual issue ownership. PR runs upload the deterministic report but cannot create, update or close the maintenance issue.

```text
PR:                    #91 — MERGED
exact head:            6d64ed81e6bfebd856f502c993ce9f574c55aa4b
squash:                7afade6cc6e1cdfce2d14b28d5a4ff42b28453ee
Content Freshness:     #13 / 30857597584 — SUCCESS
findings:              0
errors/warnings/info:  0 / 0 / 0
artifact:              8873073130
artifact digest:       sha256:f54ca989f6a696258a1b976217b71363b711681fd284300cbc91914ace7971c0
```

The three earlier release/repository-drift warnings no longer reproduce. Issue #78 is closed as completed.

### O2 — Exact dependency advisory/path triage

PR #93 added a read-only weekly/manual/path-scoped `Dependency Audit Evidence` workflow. It preserves raw `npm audit --json`, normalized JSON/Markdown and `npm explain --json` chains without fix, lockfile or issue mutation.

```text
PR:                    #93 — MERGED
exact head:            23cffa3bd863de70fd70fa2bd8d1aa4a5c8a64a1
squash:                9055ed182c7590643a09533c9d4011bada84d399
Build:                 #690 / 30858629038 — SUCCESS
Dependency Audit:      #4 / 30858629032 — SUCCESS
measured records:      9
high/moderate/critical: 3 / 6 / 0
```

Measured high families were `undici`, `brace-expansion` and the propagated `minimatch` record. The moderate family remained `markdown-it@13.0.2` propagated through current Diplodoc tooling.

### O2.1 — High-severity remediation

PR #94 applied compatible patch-only overrides and an npm-generated integrity-safe lockfile:

```text
brace-expansion 2.1.3 → 2.1.4
brace-expansion 5.0.8 → 5.0.9
undici         7.28.0 → 7.29.0
```

A temporary branch-only contents-write workflow generated the lockfile and was deleted before final CI; it is not present in `master`.

Final exact audit:

```text
package records: 6
high:           0
moderate:       6
critical:       0
```

The propagated `minimatch` high record disappeared with the fixed `brace-expansion` nodes. Issue #82 remains open only for the measured moderate markdown-it/Diplodoc compatibility blocker.

---

## 5. Завершённые milestones

### P0 — foundation

- Photo Stories platform — PRs #15/#17; first genuine story remains content-dependent.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
- Content Freshness Guard — PR #27.

### P1 — maintainability / depth

- Browser Quality Harness — PR #29.
- Project Metadata Cleanup — PR #31.
- Flagship Case-Study Format — PR #34.
- Additional Grounded Note — PR #36.

### P2 — audience / operations / content

- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45, run `30704218399`.
- Canonical rollout/header/search/Photo stabilization — PRs #48–#58.
- Vlezet flagship — PR #59.
- Publications — PR #61.
- VillAIgence flagship — PR #63.
- `/now` synchronization — PR #65.
- Product Evidence Reconciliation — PR #83.
- Installed Acceptance Engineering Note — PR #85.
- Deterministic Authority Engineering Note — PR #87.
- Restart and Persistence Engineering Note — PR #89.
- Freshness PR evidence and issue closure — PR #91.
- Exact dependency audit evidence — PR #93.
- High audit remediation — PR #94.

---

## 6. Current product boundaries

### Vlezet

M7.8B remains the latest accepted public recognition slice. M7.8C PR #42 is Draft and still requires the same real-plan product-owner retest before acceptance. Public lifecycle remains `pre-production`.

### VillAIgence

```text
canonical source head:      61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:        0.1.23+1.21.1
M11 Phase A PR:             #103 — 28 scenarios + 7 GameTests
M11 Phase B PR:             #104 — production-JAR startup/restart
lifecycle:                  release-candidate
public label:               ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence remain separate from real-provider/gameplay/manual cumulative acceptance.

### Publications and Photo Stories

Publications contains only completed, externally verifiable work. Photo Stories platform is ready, but the first genuine story requires authentic material; fake/demo albums remain prohibited.

---

## 7. Production and custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Previously confirmed: GitHub domain verification, Pages DNS, certificate and Enforce HTTPS, `www → apex`, RU/EN canonical identity, one Cloudflare beacon per localized homepage and no legacy Pages-origin leakage in custom-domain artifacts.

PR quality gates verify the custom-domain artifact contract. Latest push-triggered Pages deployment, live Note/feed/search routes and owner visual acceptance must not be inferred from PR CI.

---

## 8. Known problems / debt

### Dependency residual risk

Current exact audit:

```text
6 moderate
0 high
0 critical
```

All six package records reduce to the known build-time `markdown-it@13.0.2` family:

- `GHSA-38C4-R59V-3VQW`;
- `GHSA-6V5V-WF23-FMFQ`;
- propagated through `@diplodoc/cli`, `@diplodoc/file-extension`, `@diplodoc/transform`, `@diplodoc/translation`, `markdown-it` and `markdownlint`.

Do not use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork. Issue #82 remains open until a compatible upstream Diplodoc release and zero-finding exact-head matrix exist.

### Product/content debt

- Vlezet M7.8C owner retest and acceptance remain external product work;
- VillAIgence cumulative manual acceptance remains pending;
- first genuine Photo Story requires authentic material;
- Publications grows only from stable evidence;
- Cloudflare data requires deliberate distribution and a 3–4 week observation window before audience conclusions.

---

## 9. Следующий оптимальный шаг

### O3 — Production Deployment Verification

Where tooling permits, verify independently:

1. latest Pages deployment belongs to current `master`;
2. the persistence Note route returns successfully;
3. Atom feed contains the Note;
4. production search returns the canonical route;
5. custom-domain HTTPS/canonical/analytics boundaries remain intact.

After live verification, the next content milestone is conditional: first genuine Photo Story only when authentic material exists; otherwise wait for accepted Vlezet/VillAIgence evidence or meaningful aggregate analytics.

---

## 10. Нельзя ломать без нового design decision

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content without runtime API;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc as sole site-wide search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications inclusion boundary;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking without privacy review;
- exact artifact → installed acceptance remains an explicit boundary;
- byte continuity is not semantic or behavioral continuity;
- dependency audit evidence never authorizes an unverified fix;
- no weakening quality gates for speed.

---

## 11. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md` in `True-Ruslan/trueruslan-landing`. Check actual open PRs, latest commits and exact-head CI. Separately verify Pages/live routes and Cloudflare telemetry. Confirm issue #78 remains closed, issue #82 remains open only for the moderate markdown-it/Diplodoc blocker, Vlezet M7.8B remains accepted while M7.8C is Draft, and VillAIgence automated evidence remains separate from manual cumulative acceptance.
