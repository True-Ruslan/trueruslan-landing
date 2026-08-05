# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4D GameTests Acceptance Note.
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

**P3.4D — GameTests versus installed gameplay acceptance**.

Production route:

```text
/landing/notes/gametests-vs-installed-gameplay-acceptance/
```

Note фиксирует VillAIgence release-evidence model:

- source/unit contracts проверяют policy и deterministic wiring;
- remapped package, embedded `fabric.mod.json`, manifest и SHA-256 проверяют distributable identity;
- GameTests проверяют mechanics внутри controlled server runtime;
- exact production-JAR проверяется отдельным two-JVM startup/restart harness;
- literal-loopback provider-client proof не равен real-provider acceptance;
- `VAI-CONCUR-003` — logical-client automation, `VAI-CONCUR-004` — real installed two-client canary;
- physical microphone, Simple Voice Chat и UDP/Opus остаются installed-client evidence;
- inventory/grave/resurrection canary и cumulative product-owner acceptance остаются отдельными gates;
- rollback и recovery являются частью acceptance.

### Feature PR #132

```text
feature PR:                     #132 — MERGED
TDD RED head:                   237a3225954e1b4b633422b690b1e3fb02983f89
RED Build:                      #969 / 31042289632 — expected FAILURE
RED existing/new contracts:     394 PASS / 4 expected FAIL
exact accepted head:            b4f49b29dc9c16ff4d3c2412d5b4d2ea18282239
accepted squash:                02894431e042b89943e4bdb3cb43f336fa9ad75d
final Build:                    #978 / 31042919449 — SUCCESS
unit tests:                     398 PASS / 0 FAIL
quality artifact:               8945409733
quality digest:                 sha256:cbf160fc9877e31acc89729ae077ee3f2cad815425be4200253a06659f9339c2
review threads:                 0 open
```

### Exact production acceptance

```text
Pages workflow:                 #162 / 31043536231 — SUCCESS
accepted deployed SHA:          02894431e042b89943e4bdb3cb43f336fa9ad75d
Pages deployment ID:            5768748824
Pages created:                  2026-08-05T20:19:37Z
Pages updated:                  2026-08-05T20:20:15Z
Production Live Smoke:          #139 / 31043534975 — SUCCESS
baseline/platform/flagship:     PASS
P3.4A/P3.4B/P3.4C/P3.4D smokes: PASS
favicon smoke:                  PASS
production artifact:            8945575207
production digest:              sha256:0f1d56a3735f366512e627f7669ae017ed932bf7a2a4ee19ad0fc4ed0c5b347f
```

P3.4D accepted только на этом exact deployed SHA.

---

## 3. External project evidence boundaries

### Vlezet

Accepted baseline:

- M7.8B;
- PR #41 merge `08800dd66fa298ff31d1a7e6b33e91964cdb8d16`;
- local CV Draft и AI proposal не получают geometry authority;
- no mutation before explicit Apply.

Still pending:

- M7.8C PR #42 — Draft, нужен representative product-owner retest;
- PR #44 — Draft real-fixture benchmark foundation;
- PR #45 — Draft hybrid proposal recovery.

P3.4C — Hybrid CV + AI recognition boundaries сохраняет `VlezetDocument`, `localDraftFingerprint`, current-state revalidation и explicit Apply. M7.8B accepted остаётся отдельным от PR #42, PR #44 и PR #45.

### VillAIgence

```text
current published candidate:    0.1.25+1.21.1
release commit:                 588cc676d356271c4cf74eb21131f6d071476e48
current accepted branch head:   67e0644b355708c06747e3ec4659a337bc4189b3
M11 Phase A:                    PR #103 — GameTests and package gates
M11 Phase B:                    PR #104 — exact production-JAR startup/restart
inventory ownership:            PR #105 — focused GameTests
provider boundary:              PR #108 — deterministic provider-client proof
voice deadline/exactly-once:    PR #110 — bounded automation
logical-client concurrency:     PR #112 — VAI-CONCUR-003
M11 Phase E automation:         PR #114 — Draft
lifecycle:                      release-candidate
public label:                   ACCEPTANCE IN PROGRESS
```

PR #114 remains Draft. Physical Voice Chat, real-provider checks, `VAI-CONCUR-004`, inventory/grave/resurrection canary и cumulative installed product-owner acceptance не выводятся из зелёных GameTests.

---

## 4. Historical acceptance ledger

### Repository-native clean URLs — DONE

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
representative route:           /landing/resume/
```

Repository-native directory URLs authoritative; legacy `.html` остаётся compatibility entrypoint и сохраняет query and fragment.

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

Routes: `/landing/projects/livingworld/`, `/landing/projects/vlezet/`, `/en/projects/livingworld/`. PR #110 remains part of the VillAIgence evidence ledger; M7.8B and M7.8C remain distinct.

### P3.4 — Grounded Engineering Notes — IN PROGRESS

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

### P3.4C — Hybrid CV + AI recognition boundaries — DONE

Route: `/landing/notes/hybrid-cv-ai-recognition-boundaries/`.

```text
PR #130 RED head:              842959fb765702a634ec0592f218f1275d3ca93e
PR #130 exact head:            731dbf0a6d217a40c17a8c8f1494f342fcb35e7e
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Build:                          #961 / 31029662846 — SUCCESS
quality artifact:               8940244292
quality digest:                 sha256:1f3a013c543171230e0a69975e69beaf18b252ca2337a63938f692f6a7c162d9
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
production artifact:            8940409941
production digest:              sha256:9cb66c8e3b2b432c9bbdd160542f3b5566e1e3e21f3be07711f16d5f95fae700
```

Accepted M7.8B remains separate from Draft M7.8C and PR #42/#44/#45; product-owner retest remains required.

### P3.4D — GameTests versus installed gameplay acceptance — DONE

Feature and exact production evidence are recorded in section 2. Green GameTests are not installed gameplay acceptance.

---

## 5. Operational boundaries

- `issue #111` — authenticated Yandex/search-engine observation;
- `issue #78` — default-branch Content Freshness owner refresh;
- `issue #82` — Diplodoc/markdown-it blocker; review on or after **2026-08-17**;
- no `npm audit fix --force`, local shim or unreviewed fork;
- no legacy cleanup before observed crawler replacement.

---

## 6. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

Continue with:

**P3.4E — Passive PDF validation versus semantic completeness**.

Следующая bounded Engineering Note должна объяснить, что file existence, MIME, PDF header, page count, passive/no-JavaScript embedding и downloadable bytes доказывают доставку документа, но не доказывают полноту текста, актуальность профессионального профиля, корректную структуру, доступность чтения и semantic equivalence web-CV ↔ PDF.