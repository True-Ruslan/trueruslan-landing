# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4C Hybrid CV + AI Recognition Note.
>
> Durable snapshot: что представляет собой проект, что принято, чем это доказано, какие границы остаются и что делать дальше.

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

Repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance остаются разными фактами.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — static-first инженерное портфолио и knowledge platform Руслана Немыкина.

Платформа объединяет RU/EN homepage, web-CV и PDF, evidence-backed flagship case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, generated search, Photo Stories, Sources Knowledge Base, Project Evidence, Content Freshness, Cloudflare Web Analytics, GitHub Pages и exact-deployment browser verification.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth и external/search-engine state не изменяются автоматически.

---

## 2. Latest accepted product truth

Последний принятый user-facing milestone:

**P3.4C — Hybrid CV + AI recognition boundaries**.

Production route:

```text
/landing/notes/hybrid-cv-ai-recognition-boundaries/
```

Note фиксирует Vlezet authority model:

- `VlezetDocument` — единственный persistent geometry authority;
- local CV создаёт reviewable Draft;
- raw AI proposal остаётся недоверенным evidence;
- `requestId`, `referenceRevision` и `localDraftFingerprint` связывают batch с точным snapshot;
- deterministic validation и current-state revalidation выполняются до mutation;
- только explicit Apply создаёт одну atomic operation с Undo/Redo;
- malformed, stale, overload и provider failure fail closed и оставляют local state без mutation;
- benchmark, browser, CI и product acceptance не смешиваются.

### Feature PR #130

```text
feature PR:                     #130 — MERGED
TDD RED head:                   842959fb765702a634ec0592f218f1275d3ca93e
RED Build:                      #952 / 31028991923 — expected FAILURE
RED existing/new contracts:     389 PASS / 4 expected FAIL
exact accepted head:            731dbf0a6d217a40c17a8c8f1494f342fcb35e7e
accepted squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
final Build:                    #961 / 31029662846 — SUCCESS
unit tests:                     393 PASS / 0 FAIL
quality artifact:               8940244292
quality digest:                 sha256:1f3a013c543171230e0a69975e69beaf18b252ca2337a63938f692f6a7c162d9
review threads:                 0 open
```

### Exact production acceptance

```text
Pages workflow:                 #160 / 31030249235 — SUCCESS
accepted deployed SHA:          8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Pages deployment ID:            5766332284
Pages created:                  2026-08-05T17:29:25Z
Pages updated:                  2026-08-05T17:30:11Z
Production Live Smoke:          #132 / 31030324160 — SUCCESS
baseline/platform/flagship:     PASS
P3.4A/P3.4B/P3.4C Note smokes:  PASS
favicon smoke:                  PASS
production artifact:            8940409941
production digest:              sha256:9cb66c8e3b2b432c9bbdd160542f3b5566e1e3e21f3be07711f16d5f95fae700
```

P3.4C accepted только на этом exact deployed SHA.

---

## 3. External project evidence boundaries

### Vlezet

Accepted baseline:

- M7.8B;
- PR #41 merge `08800dd66fa298ff31d1a7e6b33e91964cdb8d16`;
- 27 local wall candidates, 19 AI confirmations, 8 review candidates;
- openings deferred;
- source geometry/topology F1 `0.837989`;
- no mutation before explicit Apply.

Current pending evidence:

- M7.8C PR #42 — Draft, требует representative product-owner retest;
- PR #44 — Draft real-fixture benchmark foundation; wall F1 `0.827338`, opening F1 `0.627451`, ниже merge threshold `0.85`;
- PR #45 — Draft hybrid proposal recovery; architecture and partial implementation не равны product acceptance.

Новая Note не утверждает, что recognition завершён, и не повышает статус PR #42, PR #44 или PR #45.

### VillAIgence

```text
current published candidate:   0.1.25+1.21.1
M11 Phase A:                   PR #103 — 28 scenarios + 7 GameTests
M11 Phase B:                   PR #104 — exact production-JAR startup/restart
provider boundary:             PR #108 — deterministic provider-client proof
M11 Phase C:                   PR #110 — Draft
lifecycle:                     release-candidate
public label:                  ACCEPTANCE IN PROGRESS
```

GameTests, package identity, exact-JAR startup/restart, real-provider checks и installed gameplay acceptance остаются разными evidence layers.

---

## 4. Historical acceptance ledger

### Repository-native clean URLs — DONE

PR #114 и PR #115 перевели public identity на repository-native directory URLs.

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
representative route:           /landing/resume/
```

Canonical, Sitemap, feed и search используют clean routes. legacy `.html` остаётся compatibility entrypoint.

### P3.1 — Homepage evidence paths — DONE

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

### P3.2 — TrueRuslan Landing flagship — DONE

```text
PR #119 head:                  6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
PR #120 head:                  c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build #119:                     #868 / 30998184982 — SUCCESS
Build #120:                     #869 / 30998966087 — SUCCESS
Pages deployment ID:            5760275658
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Routes: `/landing/projects/portfolio-platform/`, `/en/projects/portfolio-platform/`. Production selector: `main.dc-doc-page__content`.

### P3.3 — Flagship normalization — DONE

```text
PR #122 RED head:              f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
PR #122 exact head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
PR #122 squash:                c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Routes: `/landing/projects/livingworld/`, `/landing/projects/vlezet/`, `/en/projects/livingworld/`.

### P3.4A — Deployment success is not production verification — DONE

Route: `/landing/notes/deployment-success-is-not-production-verification/`.

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
Production Live Smoke #108:    FAILURE — verifier defect
PR #126 RED head:              43ccee7b09220000660e425ea32cc87938a7b653
PR #126 exact head:            50a7185d799eea96adb7dcea8cd20e9e9a400784
PR #126 squash:                0a1cd6ad40870366fecfdce3bbdae7e8722b2119
Build:                          #927 / 31016127657 — SUCCESS
quality artifact:               8934699715
quality digest:                 sha256:607a2d901e77ebe5862fd760393f6a4435699dd69d1dc8abb910007fc0611b52
Pages:                          #156 / 31016942589 — SUCCESS
Pages deployment ID:            5763802525
Production Live Smoke:          #114 / 31017023851 — SUCCESS
production artifact:            8935003712
production digest:              sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480
```

### P3.4B — Clean URLs without Cloudflare routing — DONE

Route: `/landing/notes/clean-urls-without-cloudflare-routing/`.

```text
PR #128 RED head:              4d14dd6842423a17f12d8cb2734df36cdb162b41
PR #128 exact head:            dd1911ebbc5faf66a56144c75dd45215b4042293
PR #128 squash:                4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb
Build:                          #945 / 31021101326 — SUCCESS
quality artifact:               8936766318
quality digest:                 sha256:38d1a612b9e684a2faccf71f889217933b115434391a5e60a5baff49b746178d
Pages deployment ID:            5764711503
Production Live Smoke:          #123 / 31021657939 — SUCCESS
production artifact:            8936914548
production digest:              sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51
```

Repository-native directory URLs are authoritative. Legacy compatibility preserves query and fragment while search-engine replacement remains external observation.

### P3.4C — Hybrid CV + AI recognition boundaries — DONE

Feature and exact production evidence are recorded in section 2. Accepted M7.8B remains separate from Draft M7.8C and PR #42/#44/#45.

---

## 5. Operational boundaries

### Search engines

Issue #111 remains open for authenticated Yandex Webmaster actions and delayed crawler observation. Repository readiness and successful deployment do not prove Google/Yandex replacement.

### Content Freshness

Issue #78 remains open with an older generated report until a default-branch owner run refreshes it. Do not reinterpret stale issue text as canonical product truth.

### Dependencies

Issue #82 remains the Diplodoc/markdown-it blocker. Review on or after **2026-08-17**. Do not use `npm audit fix --force`, local shims or an unreviewed fork.

---

## 6. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

Continue with:

**P3.4D — GameTests versus installed gameplay acceptance**.

The next bounded Engineering Note should explain what source tests, package identity, GameTests, exact production-JAR startup/restart, physical Voice Chat, real-provider checks, multiplayer and cumulative installed gameplay acceptance each prove — and what they do not prove.
