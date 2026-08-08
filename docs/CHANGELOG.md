# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-08**, после controlled reconciliation свежего external-project evidence и усиления default-branch Content Freshness refresh; P3.6 measurement остаётся открытым.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## 2026-08-08 — External project evidence reconciliation

Content Freshness Guard run `31245800700` обнаружил четыре maintenance warnings после обновлений внешних проектов: новый официальный VillAIgence release, repository drift VillAIgence, repository drift Vlezet и repository drift самого portfolio-platform. Эти сигналы были вручную reconciled в canonical evidence без автоматического повышения lifecycle или acceptance.

Vlezet сохраняет **M7.8B** как последний accepted recognition slice. Representative product-owner retest 2026-08-08 зафиксирован как usefulness FAIL для automatic M7.8C: PR #42 закрыт unmerged, PR #44/#45 закрыты unmerged и остаются только R&D evidence. Новый PR #52 записан как pending Draft design-only **Assisted Tracing** boundary без принятого product code, обязательного AI/network path или geometry-authority promotion.

VillAIgence обновлён до текущего официального `0.2.0+1.21.1`. Byte-identical installed candidate фиксирует **7 PASS / 0 FAIL** по обязательному clean-world Memory 2.0 набору, при этом `VAI-M2-INST-005` остаётся NOT TESTED / automated evidence only, а `VAI-CONCUR-004` — NOT TESTED / DEFERRED. PR #123 записан как merged controlled BELIEF admission, PR #125 — как pending Draft/RED PLAYER_TOLD BELIEF candidate extraction; lifecycle остаётся `release-candidate` / `ACCEPTANCE IN PROGRESS`.

Portfolio Platform evidence синхронизирован с уже принятым P3.6C exact-production boundary: consent-gated Yandex Metrica, Pages #187 / deployment `5803497490`, Production Live #288 и zero Yandex provider requests before consent. P3.6 measurement остаётся **NEXT / WAITING** до реальных equal-duration `operator-observed` aggregate windows, traffic-sufficiency assessment и human review.

Reconciliation выполнен evidence-first и TDD:

- tests-only reconciliation commit дал ожидаемый RED Build #1271 / `31246756169`: новый контракт обнаружил старый Vlezet `lastVerified=2026-08-05`, остальные 533 tests прошли;
- отдельный tests-only workflow contract дал ожидаемый RED Build #1295 / `31247658367`: 534 tests прошли, единственный FAIL потребовал отсутствующий path-scoped `push: master` refresh;
- Content Freshness workflow получил узкий `master` trigger только для canonical freshness paths, сохранил `contents: read`, `issues: write`, не получил repository write authority и по-прежнему не мутирует canonical content;
- browser acceptance обновлена на текущие bounded facts вместо устаревших `0.1.25`, M7.9 и старых Draft assertions; новые проверки требуют explicit failed/unavailable/pending states, `0.2.0`, `7 PASS / 0 FAIL`, NOT TESTED boundaries, PR #123/#125 и Assisted Tracing PR #52;
- RU/EN/no-JavaScript, Firefox/WebKit, search, privacy-friendly analytics, Yandex consent lifecycle, metadata, Engineering Map, visual regression и custom-domain quality gates проходят на reconciled state.

## 2026-08-08 — P3.6C Yandex Metrica browser collection — PRODUCTION ACCEPTED

PR #158 was squash-merged as `9bccf042fa6f9ce3ab289c7d023077c137ab238c` after exact-head Build/CodeQL/Dependency Review and consent-lifecycle verification. The owner confirmed the counter-side privacy gate before rollout. Pages #187 built the production artifact with the real repository counter variable and its fail-closed verifier accepted the bounded consent controller without a static provider script or expanded tracking options.

Deployment-triggered Production Live Smoke #288 resolved the exact successful Pages deployment and ran the real-site pre-consent browser check without granting consent or sending test telemetry. The check passed with **zero Yandex requests before consent**; the production workflow also preserved the exact deployment identity and uploaded durable evidence.

```text
PR #158 squash / deployed SHA:       9bccf042fa6f9ce3ab289c7d023077c137ab238c
Pages:                               #187 / 31227641778 — SUCCESS
Pages deployment ID:                 5803497490
Pages artifact:                      9012660943
Pages artifact digest:               sha256:79e2f08aae0523b5d84274be08cd2e554ab4d88e8f01e7f745fc6547109be622
Pages production reports:            9012663370
Pages reports digest:                sha256:baa0333182cd825287a67e0cca9b444bef1273ce631409d2bc945f53f161767d
Production Live Smoke:               #288 / 31227681975 — SUCCESS
Yandex pre-consent production smoke: PASS — zero Yandex requests before consent
production artifact:                 9012692719
production digest:                   sha256:1688d968db168f8342b9fca95b3550cbd7b4065aed0d6e6d282dc5e4fb22230a
```

P3.6C is therefore **PRODUCTION ACCEPTED** for exact deployed SHA `9bccf042fa6f9ce3ab289c7d023077c137ab238c`. P3.6 measurement remains open / NOT ACCEPTED until real equal-duration `operator-observed` aggregate windows, the minimum observation duration, traffic-sufficiency assessment and human review are complete.

## 2026-08-07 — P3.6B real Reports API connection and P3.6C consent-gated browser collection

P3.6B moved from synthetic-only readiness to a real authenticated Yandex Metrica Reports API connection. The configured repository counter and read-only OAuth access were verified by connection-check run `31201235872` — SUCCESS for completed UTC day 2026-08-06. This accepts the API connection/tooling boundary only; P3.6 measurement remains open.

P3.6C is implemented in **PR #158** with **explicit consent** before any Yandex browser provider request. The final postprocessor is after clean URLs; generated pages contain only a first-party consent controller until opt-in. Webvisor/session replay, Click Map, link tracking, accurate-bounce events, hash tracking, title transmission, custom events, user parameters, ecommerce and noscript tracking are disabled or forbidden. Consent withdrawal disables future collection and denied-state reloads do not load the provider.

P3.6C is **pending production acceptance** until PR #158 is merged, the exact SHA is deployed by Pages with the real counter variable, the final artifact verifier passes, and Production Live Smoke proves a fresh RU/EN context makes zero Yandex provider requests before consent. P3.6 itself remains NOT ACCEPTED pending real observation windows, traffic-sufficiency assessment and human review.

## 2026-08-07 — P3.6A Measurement readiness

PR #155 added the bounded P3.6 measurement-readiness layer without manufacturing external analytics evidence. The analyzer accepts aggregate Cloudflare/Search Console/Yandex observations only, rejects raw/user-level telemetry, enforces the migration observation window, equal-duration comparison windows and post-window operator assessment, and emits descriptive deltas without automatic engagement or product-impact conclusions.

Synthetic PR/master proof is explicitly separated from real measurement: it reports `synthetic-pipeline-proof`, keeps `readyForHumanReview=false` and is **not production measurement evidence**. Manual real input must be `operator-observed`; raw observations live only under `$RUNNER_TEMP` and are never uploaded.

```text
PR #155 squash / deployed SHA:       7cc56d024fbde53156a9136b14b00c81c6718811
PR Build:                            #1187 / 31185270870 — SUCCESS
PR quality artifact:                 8996659434
PR quality digest:                   sha256:07b6c53547894d1456525ed5574ecb9554c15a2178c16193435cf91937b06a32
PR Measurement Checkpoint:           #16 / 31185271128 — SUCCESS
PR synthetic artifact:               8996446081
PR synthetic digest:                 sha256:7a1f05c829867c7bc0fff757a512a95f11e2c1fcb27a3684d2acc90ecfbef87a
post-merge Measurement Checkpoint:   #17 / 31185967995 — SUCCESS
post-merge synthetic artifact:       8996722305
post-merge synthetic digest:         sha256:d6ab858824c2284a964a4b37f0e7377bb322af8baed922b8af83b27bbb36bce9
Pages:                               #184 / 31185967012 — SUCCESS
Pages deployment ID:                 5795968137
Pages artifact:                      8996733610
Pages artifact digest:               sha256:bda25b1331e9843a7b6f3364f47fdbea8f5fa7ef09a6445c55729062f3e6bfbf
Production Live Smoke:               #267 / 31186078593 — SUCCESS
production artifact:                 8996831585
production digest:                   sha256:d8e4fae2cf63bfc1d2c8742eea68d4fbdb3d9ef588df834d2e65473fa22a475d
```

Synthetic workflow evidence is classified as `synthetic-pipeline-proof`, has `readyForHumanReview=false`, and is **not production measurement evidence**. Real P3.6 remains open until `operator-observed` aggregate observations exist, the minimum post-migration window has elapsed, baseline/current windows have equal duration, the operator assessment occurs after the current window closes, traffic sufficiency is explicitly assessed, and a human reviews the descriptive report. No automatic engagement, causality or product-impact conclusion is permitted.

P3.6 remains **NEXT / WAITING** for real external aggregate evidence and human review.

## 2026-08-07 — P3.5C English Publications

PR #153 published `/en/publications/` as a controlled English catalogue over the same canonical `data/publications.json`. Original Russian publication titles, source language and canonical Habr URLs remain bibliographic identity; English summaries/topics are presentation fields in the same records. No second publication registry, second site-wide search index or English-only publication state was introduced.

Verification found and corrected two model mismatches without weakening acceptance. First, broad Russian-copy checks could match substrings inside legitimate original titles, so localization assertions were scoped to actual UI nodes. Second, Diplodoc sanitized `aria-label` from prebuilt Catalogue state, so the Topics semantic label was moved to real screen-reader-only DOM text. Generated-search acceptance now queries unique registry-derived English content (`syntax overhead`) and requires the `/en/publications/` result rather than assuming a specific bounded snippet.

```text
PR #153 squash / deployed SHA:  f189d100785f0aea363df306fb7a923c06ee61a2
Build:                          #1158 / 31179795922 — SUCCESS
quality artifact:               8994422472
quality digest:                 sha256:60ccfc9a37515a6a78bea2b8876e05e3119581d72b90ab4a1a8d2954a3da26d0
CodeQL:                         #663 / 31179795959 — SUCCESS
Dependency Review:              #586 / 31179796022 — SUCCESS
Distribution Readiness:         #137 / 31179795919 — SUCCESS
Pages:                          #182 / 31180427543 — SUCCESS
Pages deployment ID:            5794904843
Pages artifact:                 8994536006
Pages artifact digest:          sha256:847a0705f2ce1896a2046abdfec428b4c4ef43cf39270f62fb675b3e785468b1
Production Live Smoke:          #263 / 31180478038 — SUCCESS
P3.5C English Publications smoke: PASS
production artifact:            8994603193
production digest:              sha256:f7eedbffc29f7f8ed322cf14d654ad19f0cc35fca3e53aa1bcd64000ca652d80
```

Next bounded checkpoint: **P3.6 — Measurement checkpoint — NEXT**, only after sufficient aggregate traffic.

## 2026-08-07 — P3.5B English /now

PR #150 published the controlled English current-work route `/en/now/` from the same canonical `data/now.json`: one shared update date, localized presentation, Project Registry-derived cards, RU/EN canonical pairing, metadata/OpenGraph, generated search and semantic no-JavaScript fallback. No `now-en.json` or second current-state model was introduced.

The first exact deployment was healthy, but the new P3.5B production verifier failed because it inspected raw relative project hrefs without applying Diplodoc's `<base href="../../">`. The exact Pages artifact proved the page itself resolved correctly in browsers. PR #151 added a RED regression and corrected the verifier to resolve hrefs through `document.baseURI` before exact canonical comparison; product code and content did not need a corrective change.

```text
PR #150 feature squash:         b0b041968b955ed619cbfe560640dde1244833de
PR #151 final squash/deployed:  96ea3ec5de18d99a811405b36a5b60066d9c374c
feature Build:                  #1105 / 31158466856 — SUCCESS
feature quality artifact:       8986214202
feature quality digest:         sha256:e89e69f84cdcc00bc6b0656caee9e2282211eb3fba57c1e1b46b64cece1861eb
correction Build:               #1107 / 31159529244 — SUCCESS
correction quality artifact:    8986592511
correction quality digest:      sha256:e519aa06bca1d2a9c1a581c9504daef0b4933f21bfc6596a19299bae137af0bf
Pages:                          #180 / 31161876484 — SUCCESS
Pages deployment ID:            5791352097
Pages artifact:                 8987394027
Pages artifact digest:          sha256:7c456d8e8f534bed6c2f2c410f615004c7d2dff37b71fe0ea7709cfb7129f999
Production Live Smoke:          #230 / 31161925498 — SUCCESS
P3.5B English Now smoke:        PASS
production artifact:            8987452957
production digest:              sha256:2fe174a95fca6daa28d261f281576597d6d383d432a7a0cc32f9cdbb231d08b5
```

Next bounded slice: **P3.5C — English Publications — NEXT**.

## 2026-08-07 — P3.5A English Vlezet flagship

PR #148 completed the third controlled English flagship at `/en/projects/vlezet/` without creating a second project-state model.

Added canonical RU/EN pairing, metadata/OpenGraph, navigation, generated search, localized registry-derived Project Evidence, semantic no-JavaScript fallback, mobile/accessibility coverage and exact-deployment flagship verification. Volatile heads/run identities remain owned by dated canonical evidence rather than article prose.

GitHub Advanced Security found a potential check-then-read filesystem race in Project Evidence. A RED regression reproduced the class, direct reads with fail-closed `ENOENT` handling removed it, and CodeQL automatically resolved the review thread on the corrected head.

```text
PR #148 squash / deployed SHA:  17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87
Build:                          #1081 / 31153441505 — SUCCESS
unit tests:                     428 PASS / 0 FAIL
quality artifact:               8984294852
quality digest:                 sha256:31615e8b6240535e653bf618cc913d00515675636ddfc2ecff7ed11b3ec50b2f
CodeQL:                         #581 / 31153441477 — SUCCESS
Dependency Review:              #509 / 31153441537 — SUCCESS
Distribution Readiness:         #95 / 31153441483 — SUCCESS
Pages:                          #177 / 31155442788 — SUCCESS
Pages deployment ID:            5790177102
Production Live Smoke:          #214 / 31155442779 — SUCCESS
production artifact:            8985006008
production digest:              sha256:a91b35963c685068c6ee79aff269de3baa297d9a6b8fcc321a945e696db84784
post-merge CodeQL:              #582 / 31155442796 — SUCCESS
```

Next bounded slice: **P3.5B — English /now — NEXT**.

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
Pages:                          #175 / 31110585951 — SUCCESS
Pages deployment ID:            5781321808
Production Live Smoke:          #190 / 31110583631 — SUCCESS
production artifact:            8971978059
production digest:              sha256:ac8e8cdf0dfe3d05e03e668a6bad1b051c226a0918e993e436c45efcc607a106
```

P3.4F is therefore DONE. P3.5A is the next accepted product slice.

## 2026-08-06 — P3.4E Passive PDF completeness

PRs #134–#139 established the distinction between a valid transport artifact and a semantically complete resume. The web CV remains canonical; the PDF is a bounded downloadable distribution artifact. Exact bytes, MIME, Content-Disposition, parseability, page count and text extraction are verified independently from human-readable layout, ATS compatibility and editorial completeness.

PR #138 added real RU/EN `<noscript data-tr-resume-fallback>` content. PR #139 added deterministic `tr_evidence_sha` plus no-cache headers for exact raw production observation.

```text
PR #139 squash:                a570dc420c83af33b483cb55c5904b3575ff729a
Pages:                          #169 / 31086909691 — SUCCESS
Production Live Smoke:          #168 / 31086909906 — SUCCESS
PDF SHA-256:                    efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613
```

## 2026-08-06 — P3.4D GameTests versus installed gameplay acceptance

PR #132 published the grounded note `/landing/notes/gametests-vs-installed-gameplay-acceptance/` and made automated evidence boundaries explicit: source/unit tests, remapped JAR, Fabric GameTests, exact production-JAR startup/restart, deterministic provider clients and logical-client concurrency are not substitutes for installed two-client, physical Voice Chat or cumulative product-owner acceptance.

```text
PR #132 squash:                02894431e042b89943e4bdb3cb43f336fa9ad75d
Build:                          #978 / 31042919449 — SUCCESS
Pages:                          #162 / 31043536231 — SUCCESS
Production Live Smoke:          #139 / 31043534975 — SUCCESS
```

## 2026-08-06 — P3.4C Hybrid CV + AI recognition boundaries

PR #130 published `/landing/notes/hybrid-cv-ai-recognition-boundaries/`. `VlezetDocument` remains authoritative; local CV and provider output remain proposals; `localDraftFingerprint`, current-state revalidation and explicit Apply preserve deterministic authority. Accepted M7.8B remains separate from Draft M7.8C and stacked PR #44/#45.

```text
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
```

## 2026-08-06 — P3.4B Clean URLs without Cloudflare routing

PR #128 published `/landing/notes/clean-urls-without-cloudflare-routing/`. The note records repository-native directory URLs, canonical/hreflang/OpenGraph/Sitemap/Atom/search convergence, legacy `.html` compatibility and the explicit non-goal of using Cloudflare as an application router.

## 2026-08-06 — P3.4A Deployment success is not production verification

PR #125 added `/landing/notes/deployment-success-is-not-production-verification/`. Production Live Smoke #108 exposed a verifier defect; PR #126 corrected canonical evidence derivation before final acceptance. The note preserves the distinction between repository readiness, generated artifact, GitHub Pages deployment, exact deployed production and external acceptance.

## 2026-08-05 — Portfolio 1.0 evidence-first foundation

PRs #116–#124 established the Portfolio 1.0 specification, homepage evidence paths, the TrueRuslan Landing flagship, normalized flagship presentation and current external-project evidence reconciliation.

Accepted principles include canonical registries, no automatic lifecycle promotion, exact deployment verification and static-first public architecture.

## Earlier history

Earlier completed milestones remain preserved in Git history and the durable state/roadmap, including Photo Stories, Sources Registry, Project Evidence, Grounded Notes foundation, Content Freshness Guard, Browser Quality Harness, Flagship Case-Study Format, Minimal RU/EN, Cloudflare Web Analytics, custom domain/HTTPS and repository-native clean URLs.

---

## Operational boundaries

- `issue #111` — authenticated Yandex Webmaster actions and delayed crawler observation remain external/operator-owned.
- `issue #78` — Content Freshness owner refresh remains reviewable/non-mutating.
- `issue #82` — Diplodoc/markdown-it blocker; review on or after **2026-08-17**; no `npm audit fix --force`, local shim or unreviewed fork.
