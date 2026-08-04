# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после завершения O3 Production Deployment Verification.
>
> Durable snapshot: что представляет собой проект, что доказано, какие границы остаются и что делать дальше.

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

После чтения отдельно проверять actual open PR, latest commits, exact-head CI, latest `github-pages` deployment, live custom-domain routes, Cloudflare aggregate telemetry и external-project acceptance. Repository readiness, generated artifact, deployed production state и provider/gameplay evidence — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Платформа объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- evidence-backed project case studies;
- `/now`;
- Engineering Notes + Atom feed;
- Publications;
- Engineering Map;
- full-text search;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN;
- privacy-friendly Cloudflare Web Analytics;
- production-oriented CI и independent live-production smoke.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Current repository and production truth

```text
master:                         ba4e51810dd532ca0a144fef084276dcba82a02e
feature PR:                     #96 — MERGED
exact PR head:                  593377c24c6af8bbfb044bd6f20bac622e27b270
Build:                          #706 / 30861085205 — SUCCESS
CodeQL:                         #156 / 30861085202 — SUCCESS
Dependency Review:              #134 / 30861085223 — SUCCESS
PR Production Live Smoke:       #7 / 30861085240 — SUCCESS
unit tests:                     333 PASS / 0 FAIL
Lighthouse:                     100 / 100 / 100 / 100
quality artifact:               8874434515
quality digest:                 sha256:63584f0bf6b3dc8835de8bccc1273acf58d69db0e9977c144fbbb520cbe9362c
```

Post-merge production proof:

```text
Production Live Smoke:          #8 / 30861417601 — SUCCESS
deployed/caller SHA:             ba4e51810dd532ca0a144fef084276dcba82a02e
github-pages deployment id:      5735124034
deployment state:                success
live artifact:                   8874490022
live digest:                     sha256:cbc5b4099e9e08e0392f996a2434e219a216aac863f2c342b79c129096a0d7b8
retention:                       through 2026-09-02
checked at:                      2026-08-03T23:13:05Z
```

Production assertions independently passed:

- `https://trueruslan.ru/` — HTTP 200, expected title;
- exactly one Cloudflare Web Analytics beacon;
- `www` Note URL redirects/resolves to apex and preserves path;
- persistence Note — HTTP 200, exact H1/title/canonical/`og:url`;
- legacy `true-ruslan.github.io/trueruslan-landing` origin absent;
- `feed.xml` — HTTP 200, `application/xml`, contains the Note title and canonical URL;
- real browser interaction with query `persistence contract` returns the exact canonical Note route;
- page errors, console errors, first-party and third-party request failures — none.

Generated artifact CI and deployed production proof remain separate evidence layers.

---

## 3. Current completed milestone — O3 Production Deployment Verification

PR #96 added a permanent read-only Playwright production gate.

Trigger model:

- every push to `master`;
- daily schedule;
- manual dispatch;
- path-scoped pull requests for the workflow/script/contracts.

Deployment identity:

- source: standard GitHub Deployments API;
- environment: `github-pages`;
- push run requires successful deployment for exact `GITHUB_SHA`;
- PR/schedule/manual runs inspect latest successful production without claiming caller deployment.

Safety boundary:

- no deployment mutation;
- no issue/content/lockfile/DNS/git mutation;
- evidence only;
- 30-day artifact with deployment identity, JSON summary, Note/feed HTML/XML and screenshots.

O3 is **DONE** because push run #8 proved the exact squash SHA in production.

---

## 4. P2.4k — Restart and Persistence as Product Contract — DONE

Published Engineering Note:

**«Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence»**

Canonical route:

`landing/notes/restart-persistence-is-a-product-contract.html`

Core evidence chain:

```text
write
→ completed save
→ controlled shutdown
→ exact artifact restart
→ unique canonical discovery
→ parse/schema check
→ semantic identity/isolation check
→ user-visible continuity
```

Persistence разделена на storage durability, structural readability, semantic continuity и behavioral continuity. Equal SHA-256 подтверждает byte continuity только в no-mutation scenario и не заменяет read-back, identity/isolation или behavioral checks.

```text
feature PR:                  #89 — MERGED
exact feature head:          e73a94d5d2b832d188e62b8790b4d039ac797a44
squash:                      40af9e52237f03da58355caa065a40b64ad597d8
Build:                       #680 / 30856377655 — SUCCESS
unit tests:                  327 PASS / 0 FAIL
```

---

## 5. Operational and security closure

### O1 — Content Freshness reconciliation — DONE

PR #91 added path-scoped PR evidence while retaining scheduled/manual issue ownership.

```text
Content Freshness:           #13 / 30857597584 — SUCCESS
findings/errors/warnings:     0 / 0 / 0
artifact:                    8873073130
```

Issue #78 is closed as completed.

### O2 — Exact dependency advisory/path triage — DONE

PR #93 added a read-only workflow preserving raw audit JSON, normalized reports and `npm explain` chains.

Initial exact state:

```text
9 package records
3 high
6 moderate
0 critical
```

### O2.1 — High-severity remediation — DONE

PR #94 applied compatible patch-only overrides:

```text
brace-expansion 2.1.3 → 2.1.4
brace-expansion 5.0.8 → 5.0.9
undici         7.28.0 → 7.29.0
```

Final exact audit:

```text
6 package records
0 high
6 moderate
0 critical
```

All six remaining records reduce to the known build-time `markdown-it@13.0.2` / Diplodoc compatibility blocker. Issue #82 remains open. Do not use `npm audit fix --force`, a local `node_modules` shim or an unreviewed fork.

---

## 6. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B remains accepted as the latest public recognition slice;
- M7.8C PR #42 remains open Draft;
- automated gates are green, but the same real-plan product-owner retest remains mandatory;
- do not merge or update public completion state before explicit owner acceptance.

Latest observed Draft head: `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a`.

### VillAIgence

```text
canonical source head:        61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:          0.1.23+1.21.1
M11 Phase A: PR #103 — 28 scenarios + 7 GameTests
M11 Phase B: PR #104 — production-JAR startup/restart
lifecycle:                    release-candidate
public label:                 ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence remain separate from real-provider/gameplay/manual cumulative acceptance.

### Publications and Photo Stories

- Publications contains only completed, externally verifiable work;
- Photo Stories platform is ready;
- first genuine story requires authentic material and confirmed chronology;
- fake/demo albums remain prohibited.

---

## 7. Known debt

### Dependency residual risk

Issue #82 tracks the upstream markdown-it/Diplodoc blocker:

- 6 moderate;
- 0 high;
- 0 critical;
- next planned review: **2026-08-17**.

### Product/content debt

- Vlezet M7.8C owner retest and acceptance;
- VillAIgence cumulative manual acceptance;
- first genuine Photo Story;
- Publications growth only from stable evidence;
- aggregate analytics need a 3–4 week observation window before conclusions.

---

## 8. Next milestone — P2.5 Distribution Readiness

Goal: prepare bounded, canonical distribution surfaces without behavioural tracking or fake engagement.

Planned slice:

1. canonical share-target registry for homepage, flagship case studies and Engineering Notes;
2. deterministic share-link validation and metadata coverage;
3. external-profile link audit with explicit verified/stale/unverified states;
4. human-readable distribution checklist for GitHub/Habr/Telegram/profile updates;
5. no automatic posting, UTM user profiling, session replay or public-state mutation;
6. full unit/build/browser/accessibility/visual/custom-domain and live-production verification.

This milestone may improve readiness, but it does not claim audience growth before aggregate Cloudflare evidence exists.

---

## 9. Completed milestone index

### Foundation / depth

- Photo Stories platform — PRs #15/#17;
- Sources Registry / KB — PR #20;
- Project Evidence — PR #22;
- Grounded Notes — PR #25;
- Content Freshness Guard — PR #27;
- Browser Quality Harness — PR #29;
- Project Metadata Cleanup — PR #31;
- Flagship Case-Study Format — PR #34;
- Additional Grounded Note — PR #36.

### Audience / operations / content

- Minimal RU/EN — PR #38;
- Privacy-friendly analytics — PRs #40/#42;
- Custom domain and HTTPS — PR #45;
- canonical rollout/header/search/Photo stabilization — PRs #48–#58;
- Vlezet flagship — PR #59;
- Publications — PR #61;
- VillAIgence flagship — PR #63;
- `/now` synchronization — PR #65;
- Product Evidence Reconciliation — PR #83;
- Installed Acceptance Note — PR #85;
- Deterministic Authority Note — PR #87;
- Restart/Persistence Note — PR #89;
- Freshness PR evidence — PR #91;
- exact dependency audit — PR #93;
- high-severity remediation — PR #94;
- Production Live Smoke — PR #96.

---

## 10. Invariants

Do not break without a new evidence-backed design decision:

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
- exact artifact → installed acceptance remains explicit;
- byte continuity is not semantic or behavioral continuity;
- generated artifact and deployed production remain distinct;
- dependency audit evidence never authorizes an unverified fix;
- no weakening quality gates for speed.

---

## 11. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/CUSTOM_DOMAIN.md`. Check actual open PRs, latest commits and exact-head CI. Confirm Production Live Smoke still verifies the current `master` deployment, issue #78 remains closed, issue #82 remains open only for the moderate markdown-it/Diplodoc blocker, Vlezet M7.8C remains Draft until owner acceptance, and VillAIgence automated evidence remains separate from manual cumulative acceptance.
