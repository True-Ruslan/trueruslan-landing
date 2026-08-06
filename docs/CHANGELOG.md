# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-06**, после exact production-acceptance Portfolio 1.0 P3.4F Evidence-driven Project State Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## 2026-08-06 — P3.4F Evidence-driven project state

PR #141 опубликовал grounded Engineering Note:

```text
/landing/notes/evidence-driven-project-state/
```

Добавлено:

- canonical registries как владельцы volatile public facts;
- явные классы verified fact, engineering inference и limitation;
- trust states `verified`, `stale`, `unverified`;
- независимые repository, generated artifact, deployed production, external-product acceptance и operator/search-engine layers;
- запрет автоматического promotion Draft PR, freshness observation и pending product-owner evidence;
- `observedAt`, exact SHA, artifact digest и deployment identity;
- reviewable/non-mutating automation;
- semantic/no-JavaScript content, registry-derived metadata/OpenGraph, Atom feed, generated search и отдельный P3.4F production smoke.

```text
PR #141 RED Build:              #1024 — expected FAILURE
PR #141 exact head:             bd7b25019871aa22d56a4a1584f871c0012e5f59
PR #141 squash:                 cef4275977893ae23e00d9231fd87b3f587b123f
Build:                          #1037 — SUCCESS
quality artifact:               8967149410
quality digest:                 sha256:50f72f4d75dee81b0c61f7edec1e3f07f77be9983473acc69a672e998d4938a9
CodeQL:                         #531 — SUCCESS
Dependency Review:              #465 — SUCCESS
```

Exact production acceptance выявила отдельный operational defect в Pages workflow. Исправления выполнялись evidence-first, и неудачные гипотезы не скрыты:

- PR #142 сделал Pages artifact name attempt-scoped и устранил конфликт артефактов на rerun;
- PR #143 увеличил polling budget, но GitHub Pages всё равно ограничивал deployment десятью минутами;
- PR #144 добавил same-run retry, однако production logs доказали, что отменённый deployment identity немедленно отменяет второй action того же run;
- PR #145 удалил disproven retry, сохранил один fail-closed deploy action и закрепил recovery только новым `github.run_attempt` с уникальным артефактом.

```text
PR #145 exact head:             e356279c736c0df25778b60509ba903f7555cc61
PR #145 squash / deployed SHA:  8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Build:                          #1044 / 31110081521 — SUCCESS
unit tests:                     420 PASS / 0 FAIL
quality artifact:               8971423729
quality digest:                 sha256:afb44aaab0820e923330f4688fedaec3be9ced452dc2ea7de4de5136a09ff0ca
CodeQL:                         #542 — SUCCESS
Dependency Review:              #472 — SUCCESS
Pages:                          #175 / 31110585951 — SUCCESS
Pages deployment ID:            5781321808
Pages artifact:                 8971641004
Pages artifact digest:          sha256:8ee14188edb566e2d727d857b2bffe9063a3acf76ed5cbfb6afe312011a1a171
Production Live Smoke:          #190 / 31110583631 — SUCCESS
baseline/platform/flagship/P3.4A/P3.4B/P3.4C/P3.4D/P3.4E/P3.4F/favicon: PASS
production artifact:            8971978059
production digest:              sha256:ac8e8cdf0dfe3d05e03e668a6bad1b051c226a0918e993e436c45efcc607a106
observedAt:                     2026-08-06T14:36:34Z
```

P3.4F принят только для exact deployed SHA `8d2c3aa45d2b02ad3c22de75aca3602b009c13e6`. Факт публикации Note, успешный build или repository activity по отдельности не заменяют exact deployment identity и independent Production Live Smoke.

Next bounded slice:

**P3.5 — Selective English expansion**.

## 2026-08-06 — P3.4E Passive PDF validation versus semantic completeness

PR #134 опубликовал grounded Engineering Note:

```text
/landing/notes/passive-pdf-validation-vs-semantic-completeness/
```

Добавлено:

- file existence, stable route, `%PDF-`, parseability, MIME, Content-Disposition и downloadable bytes как отдельные технические evidence layers;
- page count, text extraction и required-section coverage отдельно от binary validity;
- web-CV ↔ PDF semantic equivalence отдельно от текущей professional-profile truth;
- явная граница: валидный или parseable PDF не становится автоматически complete, current, accessible или human-readable;
- web-CV как canonical editorial source, PDF как bounded distribution artifact;
- rendered DOM, raw HTML, binary PDF, Atom feed и generated search как независимые observation surfaces;
- exact deployment-only P3.4E smoke.

```text
PR #134 RED head:              ad3d46817bb40002e4f311acac2632929886780f
RED Build:                      #985 / 31048729901 — expected FAILURE
RED result:                     399 PASS / 4 expected FAIL
PR #134 exact head:            fd09071730bf1a6d227ad544734b4ef15bb0a1f0
PR #134 squash:                f184236fec2f8985fe9f893a7d6819ad4e6eea37
Build:                          #996 / 31049874523 — SUCCESS
unit tests:                     403 PASS / 0 FAIL
quality artifact:               8948085565
quality digest:                 sha256:a31c074f337263d35181a7073fd5cbd6ef8f96ff0af92757c9cdb0c8e27d43b0
```

Exact production verification последовательно обнаружила несколько независимых проблем и не была ослаблена:

- PR #135 исправил слишком узкий resume DOM scope;
- PR #136 заменил layout-dependent `body.innerText()` на bounded rendered DOM surfaces;
- PR #137 отделил raw HTML no-JavaScript evidence от scripting-enabled browser DOM;
- PR #138 исправил реальный product defect и внедрил RU/EN `<noscript data-tr-resume-fallback>` до clean-route publishing;
- PR #139 исправил stale edge observation deterministic query `tr_evidence_sha=<exact SHA>` и заголовками `Cache-Control: no-cache` / `Pragma: no-cache`.

```text
PR #138 exact head:            a82fbeeb660a2a1eb6d3d6c7963708ef946fcc5f
PR #138 squash:                90df9b8741b0d40b6ca3981f649624b55bfc85c1
Build:                          #1010 / 31083663155 — SUCCESS
unit tests:                     410 PASS / 0 FAIL
quality artifact:               8960804973
quality digest:                 sha256:47292ba7cb21abfc9d0ef7d862efdfc34423ef27a5df1a95145f3fcdb95e142e
PR #139 RED head:              de79262c5db1e484b455409800c3dc060bf474b4
PR #139 exact head:            0ccd8a5dc669212a46f9d2f3d2f5f6a73685be87
PR #139 squash:                a570dc420c83af33b483cb55c5904b3575ff729a
Build:                          #1013 / 31086478496 — SUCCESS
unit tests:                     411 PASS / 0 FAIL
quality artifact:               8961719018
quality digest:                 sha256:78ba029a7ae88cb9b20f456c0c5cffdd9609a0b4856cc7bbf456cc2e39f02e47
Pages:                          #169 / 31086909691 — SUCCESS
Pages deployment ID:            5776481884
Production Live Smoke:          #168 / 31086909906 — SUCCESS
baseline/platform/flagship/P3.4A/P3.4B/P3.4C/P3.4D/P3.4E/favicon: PASS
production artifact:            8961927073
production digest:              sha256:681f8a098349bc4e44078273f5086f892f0dec7750abbe87de8ecf96702f24bc
PDF size:                       277792 bytes
PDF SHA-256:                    efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613
```

Automated marker checks не заменяют editorial review, PDF accessibility review, ATS testing и human-readable layout acceptance.

Next bounded Note:

**P3.4F — Evidence-driven project state**.

## 2026-08-05 — P3.4D GameTests versus installed gameplay acceptance

PR #132 опубликовал grounded Engineering Note:

```text
/landing/notes/gametests-vs-installed-gameplay-acceptance/
```

Добавлено:

- source/unit contracts, remapped package и GameTests как разные evidence layers;
- `fabric.mod.json`, manifest и SHA-256 как package-identity evidence;
- exact production-JAR two-JVM startup/restart как отдельный gate;
- literal-loopback provider-client proof отдельно от real-provider acceptance;
- `VAI-CONCUR-003` logical-client automation отдельно от `VAI-CONCUR-004` real installed two-client canary;
- accepted bounded PR #110/#112 evidence без promotion Draft PR #114;
- physical microphone, Simple Voice Chat UDP/Opus, inventory/grave/resurrection canary и cumulative product-owner acceptance как installed gates;
- rollback и recovery как часть acceptance;
- Notes Registry, index, toc, metadata, Atom feed и generated search integration;
- отдельный exact-deployment P3.4D production smoke.

```text
PR #132 RED head:              237a3225954e1b4b633422b690b1e3fb02983f89
RED Build:                      #969 / 31042289632 — expected FAILURE
RED result:                     394 PASS / 4 expected FAIL
PR #132 exact head:            b4f49b29dc9c16ff4d3c2412d5b4d2ea18282239
PR #132 squash:                02894431e042b89943e4bdb3cb43f336fa9ad75d
Build:                          #978 / 31042919449 — SUCCESS
unit tests:                     398 PASS / 0 FAIL
quality artifact:               8945409733
quality digest:                 sha256:cbf160fc9877e31acc89729ae077ee3f2cad815425be4200253a06659f9339c2
Pages:                          #162 / 31043536231 — SUCCESS
Pages deployment ID:            5768748824
Production Live Smoke:          #139 / 31043534975 — SUCCESS
baseline/platform/flagship/P3.4A/P3.4B/P3.4C/P3.4D/favicon smokes: PASS
production artifact:            8945575207
production digest:              sha256:0f1d56a3735f366512e627f7669ae017ed932bf7a2a4ee19ad0fc4ed0c5b347f
```

Green GameTests were not presented as installed gameplay correctness. The published `0.1.25+1.21.1` artifact remains separate from pending installed canaries. PR #114 remains Draft.

## 2026-08-05 — P3.4C Hybrid CV + AI recognition boundaries

PR #130 опубликовал `/landing/notes/hybrid-cv-ai-recognition-boundaries/` and preserved `VlezetDocument`, `localDraftFingerprint`, current-state revalidation and explicit Apply as the deterministic geometry-authority boundary.

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

## 2026-08-05 — P3.4B Clean URLs without Cloudflare routing

PR #128 опубликовал `/landing/notes/clean-urls-without-cloudflare-routing/`; PR #129 закрыл durable state.

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

Repository-native directory URLs, canonical/hreflang/OpenGraph/Sitemap/Atom/search migration, legacy `.html` query and fragment compatibility and delayed search-engine observation were recorded as one bounded contract.

## 2026-08-05 — P3.4A Deployment success is not production verification

PR #125 опубликовал `/landing/notes/deployment-success-is-not-production-verification/`. Production Live Smoke #108 обнаружил verifier defect; PR #126 устранил stale hard-coded evidence, после чего exact deployment прошёл Production Live Smoke #114.

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
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

## 2026-08-05 — P3.3 Flagship normalization

PR #122 нормализовал RU VillAIgence, RU Vlezet и controlled EN VillAIgence. Lifecycle и external acceptance boundaries не расширялись.

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

## 2026-08-05 — P3.2 TrueRuslan Landing flagship

PR #119 создал RU/EN platform case study; PR #120 закрепил production selector `main.dc-doc-page__content`.

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

## 2026-08-05 — P3.1 Homepage evidence paths

PR #117 сделал homepage evidence-first entry point; PR #118 синхронизировал durable state.

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

## Repository-native clean URLs

PR #114/#115 established the directory-route contract.

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
representative route:           /landing/resume/
```

## Operational boundaries

- issue #111 — authenticated Yandex/search-engine observation;
- issue #78 — default-branch Content Freshness owner refresh;
- issue #82 — Diplodoc/markdown-it dependency blocker, review on or after 2026-08-17;
- no `npm audit fix --force` or unreviewed compatibility bypass.
