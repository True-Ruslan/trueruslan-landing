# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-03**, после merge P2.4h Product Evidence Reconciliation.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано, что доказано и что дальше?**

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard и maintenance workflows. Repository readiness, deployed production state, external-project acceptance и provider telemetry — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project hub и evidence-backed flagship case studies;
- `/now` как authored snapshot текущего фокуса;
- Engineering Notes + Atom feed;
- каталог внешних публикаций и выступлений;
- Engineering Map;
- Diplodoc full-text search + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN layer;
- privacy-friendly Cloudflare Web Analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, visual и custom-domain gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

### Последний завершённый milestone

```text
milestone:             P2.4h — Product Evidence Reconciliation
feature PR:            #83 — MERGED
exact feature head:    e50495e7f988e362905c7b137efd6541e7f94e33
squash on master:      5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:                 #641 / 30829739512 — SUCCESS
CodeQL:                #79 / 30829740495 — SUCCESS
Dependency Review:     #69 / 30829738958 — SUCCESS
unit tests:            318 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
quality artifact:      8862581638
artifact digest:       sha256:5c85da305745e2f66307c543cd3d356d1b6f2f7d5e459400ad54ae8d08432afe
artifact retention:    through 2026-08-17
```

Build #641 прошёл полный configured matrix:

- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications и Sources Knowledge Base;
- Project Evidence в enhanced и no-JS режимах;
- VillAIgence и NODE ZERO diagram raster gates;
- Photo Stories;
- portfolio v0.3, включая registry-owned status checks;
- Firefox/WebKit;
- generated search и dedicated VillAIgence search;
- Minimal RU/EN;
- privacy analytics;
- metadata/OpenGraph;
- Engineering Map + accessibility;
- visual regression;
- custom-domain artifact verification для `https://trueruslan.ru`.

The final squash and operational follow-up are persisted by a documentation-only continuity sync. Its exact-head CI is repository evidence, not a new product milestone.

### TDD evidence

```text
RED head:              fe269ad4a0207968b87aaff4901bffce25ae58f5
RED Build:             30826688736 — expected FAILURE
RED result:            317 PASS / 1 expected FAIL
failure:               Vlezet M7.8B evidence was `failed`, expected `merged`
RED CodeQL:            30826688612 — SUCCESS
RED Dependency Review: 30826689352 — SUCCESS
```

Intermediate GREEN candidates exposed stale test contracts rather than production defects:

- Build #634 — English-only cumulative-acceptance assertion on the Russian page;
- Build #635 — browser scenario still required `0.1.22`;
- Build #636 — Project Evidence smoke still expected three VillAIgence signals;
- Build #637 — portfolio smoke hard-coded `CORRECTIVE CANDIDATE`.

The final fix made portfolio status checks derive expected labels from canonical `data/projects.json`, reducing future duplicated truth.

---

## 3. P2.4h result

Delivered:

- Vlezet M7.8B moved from stale failed-Draft representation to accepted, merged, precision-limited evidence;
- Vlezet timeline advanced to M7.8C Opening Classification and Host-Wall Validation;
- VillAIgence PR #103 risk-based GameTests recorded separately from PR #104 production-JAR startup/restart evidence;
- current VillAIgence candidate recorded as `0.1.23+1.21.1`;
- VillAIgence lifecycle preserved as `release-candidate`, public label advanced to `ACCEPTANCE IN PROGRESS`;
- `/now` refreshed to `2026-08-03`;
- RU Vlezet, RU VillAIgence and paired EN VillAIgence narratives synchronized;
- Project Evidence, timelines and durable documents updated;
- no schema, renderer, CSS, route, analytics or search-ownership change.

### Earlier completed milestones

#### P0 — foundation

- P0.1 Photo Stories platform — DONE: PR #15 + #17.
- P0.2 First genuine Photo Story — CONTENT DEPENDENT.
- P0.3 Sources Registry / KB — DONE: PR #20.
- P0.4 Project Evidence — DONE: PR #22.
- P0.5 Grounded Notes — DONE: PR #25.
- P0.6 Content Freshness Guard — DONE: PR #27.

#### P1 — maintainability / depth

- P1.1 Browser Quality Harness — DONE: PR #29.
- P1.2 Project Metadata Cleanup — DONE: PR #31.
- P1.3 Flagship Case-Study Format — DONE: PR #34.
- P1.4 Additional Grounded Note — DONE: PR #36.

#### P2 — audience / operations / content

- P2.1 Minimal RU/EN — DONE: PR #38.
- P2.2 Privacy-friendly analytics — DONE: PR #40.
- P2.2a Production analytics activation — DONE: PR #42.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical rollout and custom-host telemetry — DONE: PRs #48–#50.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and rendered-asset stabilization — DONE: PRs #53/#54/#55/#57/#58.
- P2.4d Vlezet flagship case study — DONE: PR #59.
- P2.4e External Publications Showcase — DONE: PR #61.
- P2.4f VillAIgence flagship case study — DONE: PR #63.
- P2.4g `/now` synchronization — DONE: PR #65.
- P2.4h Product Evidence Reconciliation — DONE: PR #83.

### Repository hardening — DONE within current compatible boundary

- PR #67 — governance, `SECURITY.md`, ownership/PR contracts, bounded Dependabot, CodeQL, Dependency Review, immutable Action SHAs and workflow cleanup.
- PR #69 — `parse5` major update after full matrix.
- PR #71 — pinned GitHub Actions update.
- PR #74 — durable hardening state.
- PRs #76/#77 — compatible `postcss` and `fast-uri` updates.
- PR #79 — vulnerable `fast-xml-parser` 4.x path removed; permanent regression gates added.
- PR #80 — compatible low-risk findings remediated; unused `@gravity-ui/page-constructor` removed.
- PR #81 — `linkify-it` updated to `5.0.2`; residual `markdown-it` blocker measured and tracked.

---

## 4. Current product boundaries

### Vlezet

```text
accepted milestones:       M0–M7.8B
M7.8B PR:                   #41 — MERGED
accepted head:              a5003371f2feb4fa37edbd2513b0b5312bc5dd07
squash:                     08800dd66fa298ff31d1a7e6b33e91964cdb8d16
Source geometry F1:         0.837989
Source topology F1:         0.837989
representative candidates:  27 local / 19 AI-confirmed / 8 review
openings:                    0 — deferred to M7.8C
next:                        M7.8C Opening Classification and Host-Wall Validation
```

Landing claim boundary:

- Vlezet остаётся `pre-production`;
- M7.8B принят с известными precision limitations;
- CV/LLM output остаётся proposal до review, deterministic validation и explicit Apply;
- stronger provider models могут подтвердить больше existing candidates, но не создают missing geometry;
- accurate arbitrary-plan recognition не заявляется;
- private apartment plans/screenshots не публикуются.

### VillAIgence

```text
canonical source head:      61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:        0.1.23+1.21.1
M11 Phase A PR:             #103 — 28-scenario catalogue + 7 GameTests
M11 Phase B PR:             #104 — production-JAR startup/restart acceptance
historical installed:       0.1.20 partial PASS
historical failure:         0.1.21 startup FAIL + safe rollback
lifecycle:                  release-candidate
public label:               ACCEPTANCE IN PROGRESS
```

PR #104 proves within automated scope:

- exact remapped Fabric candidate installed outside Loom/dev classpath;
- two independent JVM runs reached Minecraft ready state;
- controlled `stop`, complete save and exit code 0;
- stable relative paths and SHA-256 values across restart for:
  - `memory.json`;
  - `memory2.json`;
  - `semantic-memory.json`;
  - `relationships.json`;
  - `voices.json`;
  - `operator-lore.json`;
- test fixture code absent from distributable JAR.

Not yet promoted to cumulative acceptance:

- real Text/STT/Chat/TTS and Voice Chat provider path;
- global Chat deadline under real transport;
- logical two-client lore conflict;
- focused live water and filled-grave canaries;
- full product-owner installed acceptance.

Public name remains **VillAIgence**, stable route remains `landing/projects/livingworld.html`.

### Publications

- catalogue contains only completed, externally verifiable work;
- currently three Habr articles;
- drafts, future appearances and unverified scientific records remain excluded;
- canonical external source owns full text.

### Photo Stories

- platform is ready;
- first genuine story depends on authentic material;
- fake/demo album is prohibited.

---

## 5. Production and custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Previously confirmed:

- GitHub account domain verification;
- GitHub Pages DNS check;
- certificate and Enforce HTTPS;
- `www → apex`;
- strict custom deployment;
- RU canonical `/` and EN canonical `/en/`;
- one Cloudflare analytics beacon on RU and EN;
- no legacy GitHub Pages origin leakage in custom-domain artifact.

Build #641 confirmed the custom-domain artifact contract for P2.4h.

A separate Timeweb TLS certificate is not used or required.

Latest Pages deployment and owner production visual acceptance after PR #83 remain operational facts separate from PR CI.

---

## 6. Known problems / debt

### Active operational follow-up

- latest Pages deployment and production visual acceptance require separate confirmation;
- issue #78 should close only after a new Content Freshness run confirms no remaining Vlezet/VillAIgence drift.

### Dependency residual risk

Fresh audit after PR #81:

```text
6 moderate
0 high
0 critical
```

All package-level records reduce to build-time `markdown-it@13.0.2`.

A safe upgrade above `14.1.1` is blocked by `@diplodoc/translation@1.7.26`, which imports removed internal paths:

- `markdown-it/lib/renderer`;
- `markdown-it/lib/token`.

Tracked in issue #82:

- upstream owner: `diplodoc-platform/translation` maintainers;
- local owner: `True-Ruslan`;
- next review: **2026-08-17**.

Do not use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork.

### Product/content debt

- Vlezet M7.8C and later room/label/area slices are external product work, not landing claims;
- VillAIgence cumulative manual acceptance remains pending despite automated production-JAR proof;
- Cloudflare sample is insufficient for audience/product conclusions; deliberate distribution plus 3–4 weeks observation are required;
- external profile Website/links require manual verification if stale;
- first genuine Photo Story requires authentic material;
- Publications grows only from stable canonical external evidence.

### CI hygiene

Some passing smoke tools still log expected missing optional resources such as `favicon.ico` or a deliberately absent English search index as `ENOENT`. These are not product failures, but future maintenance should downgrade expected absence to explicit informational diagnostics.

### Diagnostic caveat

Local plain-DNS `dig` from some Russian networks previously returned false `REFUSED`; DoH was more reliable. This is a diagnostic caveat, not a product defect.

---

## 7. Следующий оптимальный шаг

After continuity sync and production confirmation, the next landing milestone is a narrow grounded Engineering Note:

### Recommended topic

**От source tests к installed acceptance: что именно доказывает каждый release gate**.

This is not a duplicate of the existing general Note `Почему green CI не означает verified product`.

The new article should focus on:

```text
source tests
→ integration GameTests
→ distributable package
→ embedded identity
→ production-JAR startup
→ controlled shutdown/restart
→ persistent hashes
→ focused live regressions
→ cumulative provider/multiplayer acceptance
→ promotion
```

Primary evidence:

- VillAIgence `0.1.20` partial PASS;
- `0.1.21` startup FAIL and safe rollback;
- corrective PRs #99–#102;
- M11 Phase A PR #103;
- M11 Phase B PR #104;
- remaining cumulative acceptance boundary.

After it:

1. Engineering Note about deterministic authority around LLM/CV proposals;
2. Engineering Note about restart/persistence as product contract;
3. genuine Photo Story when authentic material is ready;
4. external-profile rollout and selective distribution;
5. 3–4 weeks aggregate Cloudflare observation;
6. choose further work from evidence.

---

## 8. Нельзя ломать без нового design decision

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
- no weakening quality gates for speed.

---

## 9. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md` in `True-Ruslan/trueruslan-landing`. Then check actual open PRs, latest commits and exact-head CI. Separately verify latest Pages deployment, production `/now`, Publications, Vlezet and VillAIgence routes, HTTPS/redirect state and Cloudflare telemetry. Before changing flagship evidence, reconcile the source repositories and distinguish automated package/production-JAR evidence from manual cumulative product acceptance.
