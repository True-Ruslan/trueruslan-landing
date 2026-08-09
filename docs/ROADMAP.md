# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement ожидает внешние aggregate observations.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- repository-native directory URLs;
- legacy `.html` only as compatibility entrypoints;
- no automatic public truth, profile or search-engine mutation;
- bounded Evidence semantics;
- Draft evidence не является accepted evidence;
- repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance как разные факты;
- exact artifact и installed acceptance остаются отдельными release gates;
- volatile external evidence derives from canonical registries;
- валидный или parseable artifact не считается автоматически complete, current, accessible или semantically equivalent;
- no quality-gate weakening.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Completed milestones

- Photo Stories — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes foundation — PR #25.
- Content Freshness Guard — PR #27.
- Browser Quality Harness — PR #29.
- Flagship Case-Study Format — PR #34.
- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45.
- Repository-native clean URLs — PR #114/#115.
- Durable Portfolio 1.0 specification — PR #116.
- P3.1 Homepage evidence paths — PR #117/#118.
- P3.2 TrueRuslan Landing flagship — PR #119/#120/#121.
- P3.3 Flagship normalization — PR #122/#123.
- Current external-project evidence reconciliation — PR #124.
- P3.4A Deployment Verification Note — PR #125/#126.
- P3.4B Clean URLs Note — PR #128/#129.
- P3.4C Hybrid CV + AI Recognition Note — PR #130/#131.
- P3.4D GameTests Acceptance Note — PR #132/#133.
- P3.4E Passive PDF Completeness Note — PR #134–#139.
- P3.4F Evidence-driven Project State Note and Pages recovery contract — PR #141–#145.
- P3.5A English Vlezet flagship — PR #148.
- P3.5B English /now — PR #150/#151.
- P3.5C English Publications — PR #153.
- P3.6A Measurement readiness — PR #155.
- P3.6B Yandex Metrica Reports API connection — PR #157.
- P3.6C consent-gated Yandex Metrica browser collection — PR #158 / PRODUCTION ACCEPTED.
- Homepage/Experience/NotchHub presentation refinement — PR #167/#168 / PRODUCTION ACCEPTED.

---

# Portfolio 1.0 — IN PROGRESS

## P3.1 — Homepage evidence paths — DONE

Accepted: Resume/Projects/Materials paths, bounded registry evidence, public-only flagship set, `/now` and one RU/EN architecture.

## P3.2 — TrueRuslan Landing flagship — DONE

Accepted routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

Production verification uses `main.dc-doc-page__content` and exact deployed identity.

## P3.3 — Flagship normalization — DONE

Accepted routes:

```text
/landing/projects/livingworld/
/landing/projects/vlezet/
/en/projects/livingworld/
```

Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`. M7.8B remains the accepted recognition slice. The later automatic M7.8C path failed representative product-owner usefulness acceptance on 2026-08-08: PR #42 is closed unmerged, stacked PR #44/#45 are closed unmerged R&D evidence, and PR #52 is the new **Draft design-only Assisted Tracing gate** with no accepted product code yet.

VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`. The current official release is `0.2.0+1.21.1`; the byte-identical clean-world candidate passed the required installed Memory 2.0 suite **7 PASS / 0 FAIL**, while `VAI-M2-INST-005` remains NOT TESTED / automated evidence only and `VAI-CONCUR-004` remains NOT TESTED / DEFERRED. PR #110 and PR #123 are merged bounded evidence; PR #125 is the current Draft/RED PLAYER_TOLD BELIEF candidate-extraction slice and is not accepted product truth.

## P3.4 — Grounded Engineering Notes — DONE

### P3.4A — Deployment success is not production verification — DONE

Canonical route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Accepted outcome: repository readiness, generated artifact, GitHub Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation are separate evidence layers. Production Live Smoke #108 exposed a verifier defect; PR #126 corrected canonical evidence derivation before final acceptance.

### P3.4B — Clean URLs without Cloudflare routing — DONE

Canonical route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

Accepted outcome: repository-native directory URLs; one canonical/hreflang/OpenGraph/Sitemap/Atom/search contract; Cloudflare not required as application router; legacy `.html` compatibility preserving query and fragment; delayed search-engine observation kept external.

### P3.4C — Hybrid CV + AI recognition boundaries — DONE

Canonical route:

```text
/landing/notes/hybrid-cv-ai-recognition-boundaries/
```

Accepted outcome: `VlezetDocument` remains authoritative; local CV and provider output remain proposals; `localDraftFingerprint`, current-state revalidation and explicit Apply preserve deterministic authority. Historical P3.4C acceptance remains tied to M7.8B; later PR #42/#44/#45 were closed unmerged after the automatic path failed product usefulness acceptance, and current PR #52 is a separate design-only Assisted Tracing boundary.

Exact production evidence:

```text
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
```

### P3.4D — GameTests versus installed gameplay acceptance — DONE

Canonical route:

```text
/landing/notes/gametests-vs-installed-gameplay-acceptance/
```

Accepted outcome:

- source/unit contracts, remapped package, GameTests and exact production-JAR are separate evidence layers;
- literal-loopback provider-client proof does not imply real-provider acceptance;
- `VAI-CONCUR-003` logical-client automation remains separate from `VAI-CONCUR-004` real installed two-client canary;
- PR #110 and PR #112 are bounded automation evidence;
- historical Phase-E/Draft evidence remains distinct from later installed acceptance;
- physical microphone, Simple Voice Chat UDP/Opus, inventory/grave/resurrection canaries and product-owner acceptance remain separate installed gates;
- rollback and recovery remain part of acceptance;
- green GameTests do not prove installed gameplay correctness.

Later VillAIgence `0.2.0+1.21.1` clean-world acceptance proves only its documented required installed set at **7 PASS / 0 FAIL**. `VAI-M2-INST-005` and `VAI-CONCUR-004` remain explicitly NOT TESTED and are not promoted from adjacent automation.

Exact production evidence:

```text
PR #132 RED head:              237a3225954e1b4b633422b690b1e3fb02983f89
PR #132 exact head:            b4f49b29dc9c16ff4d3c2412d5b4d2ea18282239
PR #132 squash:                02894431e042b89943e4bdb3cb43f336fa9ad75d
Build:                          #978 / 31042919449 — SUCCESS
unit tests:                     398 PASS / 0 FAIL
quality artifact:               8945409733
quality digest:                 sha256:cbf160fc9877e31acc89729ae077ee3f2cad815425be4200253a06659f9339c2
Pages:                          #162 / 31043536231 — SUCCESS
Pages deployment ID:            5768748824
Production Live Smoke:          #139 / 31043534975 — SUCCESS
production artifact:            8945575207
production digest:              sha256:0f1d56a3735f366512e627f7669ae017ed932bf7a2a4ee19ad0fc4ed0c5b347f
```

### P3.4E — Passive PDF validation versus semantic completeness — DONE

Canonical route:

```text
/landing/notes/passive-pdf-validation-vs-semantic-completeness/
```

Accepted outcome:

- file existence, stable route, `%PDF-`, parseability, MIME, Content-Disposition, downloadable bytes, page count and text extraction remain separate checks;
- валидный PDF не описывается как автоматически complete, current, accessible или semantically equivalent web-CV;
- web-CV remains canonical editorial source; PDF remains bounded distribution artifact;
- rendered DOM, raw HTML, binary PDF, Atom feed and generated search are verified independently;
- PR #138 publishes a real RU/EN `<noscript data-tr-resume-fallback>` before clean-route output;
- PR #139 uses deterministic `tr_evidence_sha` plus `Cache-Control: no-cache` and `Pragma: no-cache` for exact raw production observation;
- automation does not replace editorial, accessibility, ATS or human-readable layout review.

Feature and correction evidence:

```text
PR #134 RED head:              ad3d46817bb40002e4f311acac2632929886780f
PR #134 exact head:            fd09071730bf1a6d227ad544734b4ef15bb0a1f0
PR #134 squash:                f184236fec2f8985fe9f893a7d6819ad4e6eea37
Build:                          #996 / 31049874523 — SUCCESS
unit tests:                     403 PASS / 0 FAIL
quality artifact:               8948085565
quality digest:                 sha256:a31c074f337263d35181a7073fd5cbd6ef8f96ff0af92757c9cdb0c8e27d43b0
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
```

Exact production evidence:

```text
Pages:                          #169 / 31086909691 — SUCCESS
Pages deployment ID:            5776481884
Production Live Smoke:          #168 / 31086909906 — SUCCESS
production artifact:            8961927073
production digest:              sha256:681f8a098349bc4e44078273f5086f892f0dec7750abbe87de8ecf96702f24bc
PDF size:                       277792 bytes
PDF SHA-256:                    efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613
```

### P3.4F — Evidence-driven project state — DONE

Accepted model:

1. volatile public facts derive from canonical registries rather than duplicated prose;
2. verified fact, engineering inference and limitation are explicit;
3. repository activity, generated artifact, deployed production, external-product acceptance and operator/search-engine state remain separate;
4. Draft and pending product-owner evidence are never promoted automatically;
5. evidence records observation dates and exact identities;
6. `verified`, `stale` and `unverified` remain visible trust states;
7. automatic reports remain reviewable and non-mutating;
8. semantic/no-JavaScript content, canonical/OpenGraph metadata, Atom feed and generated search remain available;
9. exact-head and exact-deployment verification are mandatory.

```text
feature PR #141 squash:         cef4275977893ae23e00d9231fd87b3f587b123f
final workflow PR #145 squash:  8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Build:                          #1044 / 31110081521 — SUCCESS
quality artifact:               8971423729
quality digest:                 sha256:afb44aaab0820e923330f4688fedaec3be9ced452dc2ea7de4de5136a09ff0ca
Pages:                          #175 / 31110585951 — SUCCESS
accepted deployed SHA:          8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Pages deployment ID:            5781321808
Pages artifact:                 8971641004
Pages artifact digest:          sha256:8ee14188edb566e2d727d857b2bffe9063a3acf76ed5cbfb6afe312011a1a171
Production Live Smoke:          #190 / 31110583631 — SUCCESS
production artifact:            8971978059
production digest:              sha256:ac8e8cdf0dfe3d05e03e668a6bad1b051c226a0918e993e436c45efcc607a106
```

The failed timeout and same-run retry experiments remain part of the operational evidence: PR #143 and PR #144 were superseded by the one-deploy-per-run, fresh-`run_attempt` recovery contract in PR #145.

## P3.5 — Selective English expansion — IN PROGRESS

### P3.5A — English Vlezet flagship — DONE

Accepted route: `/en/projects/vlezet/`. One RU/EN pair, canonical metadata, generated search, localized registry-derived Project Evidence, semantic no-JavaScript fallback and exact-deployment flagship smoke are accepted without a second lifecycle/evidence model.

```text
PR #148 squash / deployed SHA:  17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87
Build:                          #1081 / 31153441505 — SUCCESS
Pages:                          #177 / 31155442788 — SUCCESS
Pages deployment ID:            5790177102
Production Live Smoke:          #214 / 31155442779 — SUCCESS
production artifact:            8985006008
production digest:              sha256:a91b35963c685068c6ee79aff269de3baa297d9a6b8fcc321a945e696db84784
```

### P3.5B — English /now — DONE

Accepted route: `/en/now/`. English editorial presentation derives from the same canonical `data/now.json`, keeps one shared `updated` date, and reuses Project Registry cards, the same generated search, canonical RU/EN pairing, metadata/OpenGraph and semantic no-JavaScript fallback. No `now-en.json` or second current-state model exists.

The first exact deployment after PR #150 exposed a verifier false negative rather than a product defect: the deployed page used Diplodoc `<base href="../../">` with valid relative project links. PR #151 corrected the production verifier to resolve raw hrefs through `document.baseURI` before exact canonical comparison; no product behavior was weakened or changed.

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

### P3.5C — English Publications — DONE

Accepted route: `/en/publications/`. English presentation reuses the same canonical `data/publications.json`; original titles, source language and Habr canonical URLs remain bibliographic identity. English summaries/topics, Catalogue, Featured and semantic no-JavaScript fallback are localized without a second publication registry or search owner. The single generated Diplodoc search is verified with registry-derived English content rather than snippet wording.

```text
PR #153 squash / deployed SHA:  f189d100785f0aea363df306fb7a923c06ee61a2
Build:                          #1158 / 31179795922 — SUCCESS
quality artifact:               8994422472
quality digest:                 sha256:60ccfc9a37515a6a78bea2b8876e05e3119581d72b90ab4a1a8d2954a3da26d0
Pages:                          #182 / 31180427543 — SUCCESS
Pages deployment ID:            5794904843
Pages artifact:                 8994536006
Pages artifact digest:          sha256:847a0705f2ce1896a2046abdfec428b4c4ef43cf39270f62fb675b3e785468b1
Production Live Smoke:          #263 / 31180478038 — SUCCESS
P3.5C English Publications smoke: PASS
production artifact:            8994603193
production digest:              sha256:f7eedbffc29f7f8ed322cf14d654ad19f0cc35fca3e53aa1bcd64000ca652d80
```

### P3.6A — Measurement readiness — DONE

Accepted tooling provides a fail-closed aggregate-only analyzer, deterministic report CLI and minimally privileged Measurement Checkpoint workflow. Synthetic PR/master executions are permanently classified as `synthetic-pipeline-proof`; they cannot become `ready-for-human-review` and are not production measurement evidence. Manual real observations must declare `evidenceClass: "operator-observed"`.

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

### P3.6B — Yandex Metrica Reports API — CONNECTED / DONE AS TOOLING

PR #157 added bounded read-only aggregate Reports API enrichment. The real authenticated connection is verified by run `31201235872` — SUCCESS. The browser OAuth boundary remains separate and the token is not exposed to generated pages.

### P3.6C — Consent-gated Yandex Metrica browser collection — PRODUCTION ACCEPTED

Accepted with **explicit consent**: no Yandex provider network/script/cookies before opt-in; Webvisor, Click Map, link tracking, accurate-bounce events, hash tracking, title transmission, custom events, user parameters, ecommerce and noscript tracking are disabled or forbidden. PR CI uses a fake counter and intercepts provider traffic; production acceptance automation never grants consent.

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

The owner confirmed the counter-side privacy settings before acceptance. P3.6C is accepted only on exact deployed SHA `9bccf042fa6f9ce3ab289c7d023077c137ab238c`. This does **not** close P3.6 measurement.

### Homepage/Experience/NotchHub presentation refinement — PRODUCTION ACCEPTED

Accepted presentation outcome for issue #166:

- compact RU/EN homepage rhythm with the terminal before primary paths;
- visible `Опыт` / `Experience` path while `/landing/resume/` remains stable and PDF remains a bounded distribution artifact;
- one header/navigation utility contract across standalone and generated pages;
- NotchHub becomes the featured/current RU/EN flagship while accepted `0.1.0` evidence remains separate from M1 Draft PR #10;
- Vlezet remains active, public, searchable, directly reachable and evidence-backed but `featured=false`;
- prominent `/now` cards use `active && featured`, so lifecycle truth is not repurposed as presentation priority.

The first feature deployment exposed the Vlezet `/en/now/` spotlight leak; PR #168 corrected that real production defect with RED-first coverage before final acceptance.

```text
feature PR:                     #167 — MERGED
hotfix PR:                      #168 — MERGED
final accepted source SHA:      4395128144c069663e67c660e5b549cfca851ae8
Pages:                          #196 / 31260596290 — SUCCESS
Pages deployment ID:            5809298234
Production Live Smoke:          #331 / 31260625145 — SUCCESS
P3.5B English Now smoke:        PASS
production artifact:            9022691131
production digest:              sha256:14de956b15e6c3c4c1c2cf0256e5652e229a7c7d5b4d0be81e6e802feaf52bef
```

This presentation refinement is accepted independently of the numbered P3.6 measurement checkpoint.

### Work with me / private practice — PRODUCTION ACCEPTED

Accepted routes:

```text
/landing/work-with-me/
/en/work-with-me/
```

One canonical collaboration model owns mutable availability/contact/policy truth. Engineering remains primary, Teaching & Mentoring a full secondary line, and direct Telegram/email handoff replaces forms/CRM/booking/public pricing. Homepage, Contacts and exactly curated contextual CTA surfaces are verified in RU/EN, semantic no-JavaScript, generated search, Chromium/Firefox/WebKit, Axe/overflow/visual and exact-deployment production gates.

```text
feature PR:                       #171 — MERGED
accepted squash / deployed SHA:  433ee076f3f90dfe14feea97f59ad84bca0c337a
exact-head Build:                 #1427 / 31285618671 — SUCCESS
quality artifact:                 9029759379
quality digest:                   sha256:cc321f83f41539df0e256fcb23c5d28801d5f70093ab79b97bca594796a28987
CodeQL:                          #949 / 31285618637 — SUCCESS
Dependency Review:               #855 / 31285618645 — SUCCESS
Pages:                           #199 / 31285875710 — SUCCESS
Pages deployment ID:             5814010976
Pages artifact:                  9029779285
Pages artifact digest:           sha256:a22a8436e963650ddb89a22e2d6914b449575933a2a4b3a1618561503e469a86
Production Live Smoke:           #350 / 31285898990 — SUCCESS
Work with me production smoke:   PASS
production artifact:             9029804820
production digest:               sha256:e01e5baf0675d826334b2d75dd865e66833eaf2f804181a2061f7389b3505577
observedAt:                      2026-08-09T00:20:13.227Z
```

This capability is accepted independently of P3.6. **P3.6 remains NEXT / WAITING** for real equal-duration operator-observed aggregate evidence and human review.

### C1 — Presentation foundation — PRODUCTION ACCEPTED

Portfolio Clarity & Scanability implementation has started with a bounded production foundation:

- Onest Variable is self-hosted with exact reviewed WOFF2 subsets and OFL license;
- shared readability tokens use a 17px desktop / 16px mobile body target, 1.62 line height and 70ch long-form width;
- RU/EN primary navigation is limited to five semantic destinations while secondary knowledge surfaces remain in the content tree;
- mobile overflow, Chromium accessibility/Lighthouse, Firefox/WebKit, privacy, metadata/search and visual-regression gates remain green without weakening.

- PR #174 squash / deployed SHA: `9cc9d69e6b49e3e9f3432788f0deb943d7acebf5`;
- final exact-head Build #1463 / `31304311486` — SUCCESS;
- Pages #202 / `31304612906` — SUCCESS;
- Pages deployment `5817134996` — success;
- Production Live Smoke #354 / `31304642055` — SUCCESS;
- production artifact `9035548962`;
- production digest `sha256:41af56c91d59b5c80134d49b1928b0fde348384334c8863ddd9c74c9f4e5c85c`;
- production observation: `2026-08-09T08:55:33.810Z`.

Next redesign slice: **C2 — Homepage structure**. C1 does not start/reset/close P3.6; the final accepted redesign remains the new presentation-baseline boundary.

## P3.6 — Measurement checkpoint — NEXT / WAITING

After sufficient aggregate traffic, run the manual checkpoint with real `operator-observed` Cloudflare Web Analytics, Google Search Console and Yandex Webmaster aggregates. P3.6 remains an observation checkpoint, not permission to infer engagement or product impact from an insufficient sample or from synthetic pipeline proof.

---

# Operational checkpoints

- issue #111 — authenticated Yandex Webmaster actions and crawler observation;
- issue #78 — 2026-08-08 reconciliation обновляет canonical evidence; default-branch Content Freshness refresh после merge должен подтвердить отсутствие оставшихся findings;
- issue #82 — review on or after **2026-08-17**; no `npm audit fix --force`, local shim or unreviewed fork.

## New-session rule

Open durable state and Portfolio 1.0 specification. Check actual PRs, exact-head CI, Pages deployment and Production Live Smoke. Confirm P3.4F feature and exact production acceptance for SHA `8d2c3aa45d2b02ad3c22de75aca3602b009c13e6`, Pages run `31110585951`, deployment `5781321808` and Production Live run `31110583631`. Preserve issue #111, issue #82 and issue #78 boundaries. Confirm P3.5A exact production acceptance for SHA `17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87`, Pages run `31155442788`, deployment `5790177102` and Production Live run `31155442779`. Confirm P3.5B exact production acceptance for SHA `96ea3ec5de18d99a811405b36a5b60066d9c374c`, Pages run `31161876484`, deployment `5791352097` and Production Live run `31161925498`. Confirm P3.5C exact production acceptance for SHA `f189d100785f0aea363df306fb7a923c06ee61a2`, Pages run `31180427543`, deployment `5794904843` and Production Live run `31180478038`. Confirm P3.6A Measurement readiness acceptance for SHA `7cc56d024fbde53156a9136b14b00c81c6718811`, post-merge Measurement Checkpoint run `31185967995`, Pages run `31185967012`, deployment `5795968137` and Production Live run `31186078593`. Confirm P3.6B real Reports API connection run `31201235872`. Confirm P3.6C production acceptance for SHA `9bccf042fa6f9ce3ab289c7d023077c137ab238c`, Pages run `31227641778`, deployment `5803497490`, Production Live run `31227681975` and production evidence digest `sha256:1688d968db168f8342b9fca95b3550cbd7b4065aed0d6e6d282dc5e4fb22230a`. Confirm the accepted presentation refinement for SHA `4395128144c069663e67c660e5b549cfca851ae8`, Pages run `31260596290`, deployment `5809298234` and deployment-triggered Production Live run `31260625145`.

Then reconcile current external project evidence before making product claims: Vlezet must keep M7.8B accepted while PR #42/#44/#45 stay closed-unmerged and PR #52 remains a pending design-only Assisted Tracing boundary until its own acceptance; VillAIgence must keep official `0.2.0+1.21.1`, installed `7 PASS / 0 FAIL`, explicit NOT TESTED boundaries and Draft/RED PR #125 separate. Continue with **P3.6 — Measurement checkpoint — NEXT / WAITING** only when real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.