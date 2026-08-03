# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-03**, после merge P2.4j Deterministic Authority Engineering Note.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано, что доказано и что дальше?**

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

После чтения документов отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard, Content Freshness Guard и maintenance issues. Repository readiness, generated artifact, deployed production state, external-project acceptance и provider telemetry — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Проект объединяет standalone homepage, Diplodoc knowledge pages, web-CV, project hub и evidence-backed case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, full-text search, Photo Stories, Sources Knowledge Base, Project Evidence Layer, Content Freshness Guard, bounded RU/EN, Cloudflare Web Analytics и production-oriented CI.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

```text
master after P2.4j:        2fba404bbca9680d934f11f30c8a76347a5ab7b1
feature PR:                #87 — MERGED
exact feature head:        b38d225d837e5e347184ca09c685a479923ba06e
Build:                     #668 / 30853751417 — SUCCESS
CodeQL:                    #110 / 30853751740 — SUCCESS
Dependency Review:         #96 / 30853751469 — SUCCESS
unit tests:                324 PASS / 0 FAIL
Lighthouse:                100 / 100 / 100 / 100
quality artifact:          8871721514
artifact digest:           sha256:af0a406ec92352ab356618a563e885cd8413818bfaa59326a83235db3f521838
artifact retention:        through 2026-08-17
```

Build #668 прошёл production build, generated-site integrity, mobile overflow, Chromium/Axe/Lighthouse, Publications, Sources KB, Project Evidence, diagrams, Photo Stories, portfolio v0.3, Firefox/WebKit, generated search, exact `deterministic authority` search-route check, RU/EN, analytics, metadata/OpenGraph, Engineering Map, visual regression и custom-domain artifact verification.

Documentation-only continuity sync records this final feature squash. Its CI is repository evidence, not a new product milestone. Feature merge and production Pages deployment remain separate facts.

---

## 3. P2.4j — Deterministic Authority Around Probabilistic Proposals — DONE

Published Engineering Note:

**«AI может предложить, но не применить: как строить deterministic authority»**

Canonical route:

`landing/notes/probabilistic-proposals-deterministic-authority.html`

### Core model

```text
probabilistic or untrusted proposal
→ known identity binding
→ shape and bounds validation
→ product-policy authorization
→ current-state revalidation
→ APPLY / CONFLICT / REJECT / UNCHANGED
→ one atomic authoritative mutation
```

Правдоподобие, валидный JSON и высокий confidence являются evidence, но не предоставляют mutation authority.

### Vlezet evidence boundary

```text
accepted foundation:        M7.8B PR #41
M7.8B status:                accepted / принят
representative result:       27 local / 19 AI-confirmed / 8 review
Source geometry F1:          0.837989
Source topology F1:          0.837989
current external work:       M7.8C PR #42 — DRAFT, owner retest pending
lifecycle:                   pre-production
```

Принятая M7.8B модель:

- local CV создаёт bounded candidates;
- AI получает exact local IDs and coordinates;
- unknown IDs, moved geometry и cloud-only geometry fail closed;
- ID и geometry остаются неизменяемыми во время verification;
- provider может менять evidence/confidence, но не создавать, перемещать, растягивать, утолщать или re-host geometry;
- canonical document не меняется до explicit Apply;
- Apply и semantic Undo остаются product-authority operations;
- stronger provider может подтвердить больше существующих candidates, но не восстановить отсутствующую local geometry.

PR #42 используется только как Draft implementation evidence: strict-ID and geometry-immutable verification, active/diagnostic geometry и blocked-candidate exclusion. Он не считается принятой M7.8C возможностью и не меняет public lifecycle.

### VillAIgence server-authority boundary

Evidence base: merged operator-lore PR #85 plus separate automated acceptance PRs #103/#104.

- permission проверяется server-side;
- `WORLD`, `PLAYER`, `VILLAGER` и `VILLAGE` identities выводятся из authenticated/live server state;
- request не приносит произвольные UUID, dimension ID или village ID как authority;
- payload size, UTF-8, control-character и scope limits fail closed;
- write требует expected SHA-256 revision;
- stale revision возвращает `CONFLICT` и current canonical value without mutation;
- replay возвращает `UNCHANGED`;
- persistent mutation происходит только на `APPLY`.

Это не утверждение о fully autonomous world mutation. Real-provider, two-client, focused live gameplay и cumulative product-owner acceptance остаются отдельными pending gates.

### TDD evidence

```text
RED head:              1422efbaa6f0d4791d511bfb71fa89f1712c6604
RED Build:             #658 / 30852218324 — expected FAILURE
RED tests:             321 PASS / 3 expected FAIL
RED CodeQL:            #100 / 30852218498 — SUCCESS
RED Dependency Review: #86 / 30852220087 — SUCCESS
failure scope:         missing registry, Markdown and index/TOC/page-meta surfaces

final head:            b38d225d837e5e347184ca09c685a479923ba06e
Build:                 #668 / 30853751417 — SUCCESS
CodeQL:                #110 / 30853751740 — SUCCESS
Dependency Review:     #96 / 30853751469 — SUCCESS
unit tests:            324 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
```

Все pre-existing tests прошли на RED. Финальный exact head прошёл полный matrix.

### Delivered

- canonical `data/notes.json` record;
- grounded Markdown article;
- Notes index and TOC;
- page metadata/OpenGraph;
- previous/next/related build-time navigation;
- Atom feed inclusion;
- generated Diplodoc search;
- exact browser assertion for query `deterministic authority` and canonical Note route;
- permanent content/evidence contract;
- no new schema, renderer, CSS, runtime, backend, API, analytics event or second search engine.

### Claim boundary

P2.4j does not claim:

- accepted or merged Vlezet M7.8C PR #42;
- arbitrary-plan recognition accuracy beyond accepted evidence;
- provider ability to repair missing Vlezet geometry;
- authorization of VillAIgence gameplay/world mutation from valid JSON alone;
- completed real-provider, multiplayer or cumulative VillAIgence acceptance;
- universal AI-safety guarantees;
- invented reliability, latency, adoption or accuracy metrics.

---

## 4. Завершённые milestones

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

### Repository hardening

- Governance/security/ownership/immutable Actions/CodeQL/Dependency Review — PR #67.
- Compatible dependency updates — PRs #69/#71/#76/#77.
- Vulnerable `fast-xml-parser` path removed — PR #79.
- Low-risk cleanup — PR #80.
- `linkify-it@5.0.2` remediation and measured `markdown-it` blocker — PR #81.

---

## 5. Current product boundaries

### Vlezet

M7.8B remains the latest accepted public recognition slice. M7.8C PR #42 is Draft and requires the same real-plan owner retest before acceptance. Public lifecycle remains `pre-production`.

### VillAIgence

```text
canonical source head:      61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:        0.1.23+1.21.1
M11 Phase A PR:             #103 — 28 scenarios + 7 GameTests
M11 Phase B PR:             #104 — production-JAR startup/restart
lifecycle:                  release-candidate
public label:               ACCEPTANCE IN PROGRESS
```

PR #104 proves exact remapped candidate startup outside Loom/dev classpath, two independent JVM runs, clean stop/save/exit and stable paths/hashes for six canonical stores. It does not complete provider/gameplay/manual acceptance.

### Publications and Photo Stories

Publications contains only completed, externally verifiable work. Photo Stories platform is ready, but the first genuine story requires authentic material; fake/demo albums remain prohibited.

---

## 6. Production and custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Previously confirmed: GitHub domain verification, Pages DNS, certificate and Enforce HTTPS, `www → apex`, RU/EN canonical identity, one Cloudflare beacon per localized homepage and no legacy Pages-origin leakage in custom-domain artifacts.

PR quality gates verify the custom-domain artifact contract. Latest push-triggered Pages deployment and owner visual acceptance must not be inferred from PR CI.

---

## 7. Known problems / debt

### Operational follow-up

- confirm latest Pages deployment and the new Note route;
- confirm deployed Atom feed and exact generated search result;
- keep issue #78 open until a fresh Content Freshness Guard report is clean;
- keep issue #82 open and re-triage the current audit signal.

### Dependency residual risk

Current `npm ci` on unchanged dependency graph reported:

```text
6 moderate
2 high
critical count not reported by the summary line
```

This is a newly observed registry/audit signal during PR #87, not a dependency change introduced by the content PR. Dependency Review remains SUCCESS. The prior durable claim `6 moderate / 0 high / 0 critical` is stale and must not be repeated until a fresh audit identifies exact advisories and paths.

Do not use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork. Issue #82 remains the maintenance owner.

### Product/content debt

- Vlezet M7.8C owner retest and acceptance remain external product work;
- VillAIgence cumulative manual acceptance remains pending;
- first genuine Photo Story requires authentic material;
- Publications grows only from stable evidence;
- Cloudflare data requires deliberate distribution and a 3–4 week observation window before audience conclusions.

---

## 8. Следующий оптимальный шаг

### P2.4k — restart and persistence as product contract

Explain why stored bytes are insufficient without:

- startup/read-back/restart evidence;
- deterministic IDs and per-entity isolation;
- controlled shutdown and recovery;
- six-store path/hash continuity;
- schema/migration compatibility;
- user-visible continuity rather than storage implementation alone.

---

## 9. Нельзя ломать без нового design decision

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
- no weakening quality gates for speed.

---

## 10. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md` in `True-Ruslan/trueruslan-landing`. Check actual open PRs, latest commits and exact-head CI. Separately verify Pages deployment, production routes, Cloudflare telemetry, Content Freshness issue #78 and dependency issue #82. For Vlezet distinguish accepted M7.8B from Draft M7.8C. For VillAIgence distinguish source/package/GameTest/production-JAR/server-authority/manual cumulative evidence.
