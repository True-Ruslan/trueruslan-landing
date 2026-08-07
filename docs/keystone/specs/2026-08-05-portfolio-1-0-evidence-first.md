# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.6A MEASUREMENT READINESS ACCEPTED; P3.6 MEASUREMENT WAITING**
>
> Date: **2026-08-07**
>
> Product: `True-Ruslan/trueruslan-landing`

## Product outcome

TrueRuslan Landing presents professional experience, public engineering projects, current work, publications and reusable technical conclusions through one static-first, evidence-first platform.

The public narrative remains:

**what I build → what I study → what I publish → what I learned → what evidence supports it**.

## Invariants

- static-first and build-time intelligence;
- progressive enhancement;
- semantic content without JavaScript;
- one canonical RU/EN build and search architecture;
- canonical registries own volatile project truth;
- repository-native directory URLs;
- no public canonical/Sitemap/feed URL contains `.html`;
- legacy `.html` exists only as bounded compatibility;
- Draft evidence never becomes accepted evidence automatically;
- repository, artifact, deployment, browser, search-engine and external-product acceptance are separate layers;
- exact artifact and installed acceptance remain separate release gates;
- valid or parseable bytes do not automatically prove complete, current, accessible or semantically equivalent content;
- no quality-gate weakening.

---

## Milestone status

### P3.1 — Homepage evidence paths — DONE

Homepage exposes Resume, Projects and Materials paths, a bounded public flagship set and `/now` context without promoting private or Draft work.

### P3.2 — TrueRuslan Landing flagship — DONE

Dedicated RU/EN platform case studies document static-first architecture, canonical registries, clean URLs, GitHub Pages and deployment verification.

### P3.3 — Flagship normalization — DONE

RU VillAIgence, RU Vlezet and controlled EN VillAIgence use one evidence-first order while preserving lifecycle and external acceptance boundaries.

### P3.4A — Deployment success is not production verification — DONE

Canonical route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

The Note separates repository readiness, generated artifact, exact Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation.

### P3.4B — Clean URLs without Cloudflare routing — DONE

Canonical route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

The Note records repository-native directory output, Diplodoc base/depth migration, one canonical/hreflang/OpenGraph/Sitemap/Atom/search contract, Cloudflare as DNS/CDN/analytics rather than application router, and legacy `.html` compatibility preserving query and fragment.

### P3.4C — Hybrid CV + AI recognition boundaries — DONE

Canonical route:

```text
/landing/notes/hybrid-cv-ai-recognition-boundaries/
```

The Note preserves `VlezetDocument` as the sole persistent geometry authority. Local CV and raw provider output remain proposals; `localDraftFingerprint`, deterministic validation, current-state revalidation and explicit Apply precede one atomic mutation.

Accepted baseline remains M7.8B. M7.8C PR #42, PR #44 and PR #45 remain Draft and require product-owner retest.

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

### P3.4D — GameTests versus installed gameplay acceptance — DONE

Canonical route:

```text
/landing/notes/gametests-vs-installed-gameplay-acceptance/
```

#### Problem

A green Minecraft automation pipeline can accidentally be described as product acceptance even though each gate observes a narrower property: source policy, package identity, controlled server behavior, exact production-JAR startup, protocol compatibility or installed user-visible behavior.

#### Evidence model

- source/unit contracts verify deterministic policy and wiring;
- remapped package, embedded `fabric.mod.json`, manifest and SHA-256 verify distributable identity;
- GameTests execute selected mechanics inside a controlled server runtime;
- exact production-JAR startup/restart executes the candidate outside Loom/dev runtime in two JVMs;
- literal-loopback Chat/STT/TTS verifies production provider-client protocol code without external credentials;
- `VAI-CONCUR-003` verifies logical-client revision conflict and replay behavior;
- `VAI-CONCUR-004` remains the real installed two-client UI/network canary;
- physical microphone, Simple Voice Chat UDP/Opus, real-provider and focused gameplay checks remain installed evidence;
- inventory/grave/resurrection canary and cumulative product-owner acceptance remain pending;
- rollback and recovery readiness remain part of acceptance.

#### Accepted evidence boundary

Accepted bounded automation includes PR #103, PR #104, PR #105, PR #108, PR #110 and PR #112. PR #114 remains Draft. Green GameTests do not prove installed gameplay correctness and the published candidate is not described as fully accepted.

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

#### Problem

A PDF can exist at a stable route, return `application/pdf`, start with `%PDF-`, be downloadable and parseable, yet still be incomplete, stale, inaccessible, hard to read or semantically different from the canonical web-CV.

#### Evidence model

- file existence and stable route prove delivery location only;
- MIME, Content-Disposition, `%PDF-`, parseability and binary size prove bounded transport/format properties;
- page count and structural checks do not prove required-section coverage;
- text extraction and required markers do not prove current professional truth or good human-readable layout;
- web-CV ↔ PDF semantic equivalence is a separate editorial contract;
- rendered DOM proves the JavaScript-enhanced web-CV surface;
- raw HTML proves the no-JavaScript fallback surface;
- binary PDF response proves exact deployed bytes;
- Atom feed and generated search prove Note discoverability;
- accessibility, ATS compatibility and human layout acceptance remain distinct reviews.

#### Feature evidence

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

#### Production corrections

PR #135–#137 corrected observable resume scopes without weakening binary or semantic requirements.

PR #138 introduced an idempotent build-time RU/EN `<noscript data-tr-resume-fallback>` postprocessor before clean-route publishing.

```text
PR #138 exact head:            a82fbeeb660a2a1eb6d3d6c7963708ef946fcc5f
PR #138 squash:                90df9b8741b0d40b6ca3981f649624b55bfc85c1
Build:                          #1010 / 31083663155 — SUCCESS
unit tests:                     410 PASS / 0 FAIL
quality artifact:               8960804973
quality digest:                 sha256:47292ba7cb21abfc9d0ef7d862efdfc34423ef27a5df1a95145f3fcdb95e142e
```

PR #139 made raw production observation deterministic with query `tr_evidence_sha=<EXPECTED_DEPLOYED_SHA>`, `Cache-Control: no-cache` and `Pragma: no-cache`, while preserving the canonical URL and all PDF assertions.

```text
PR #139 RED head:              de79262c5db1e484b455409800c3dc060bf474b4
PR #139 exact head:            0ccd8a5dc669212a46f9d2f3d2f5f6a73685be87
PR #139 squash:                a570dc420c83af33b483cb55c5904b3575ff729a
Build:                          #1013 / 31086478496 — SUCCESS
unit tests:                     411 PASS / 0 FAIL
quality artifact:               8961719018
quality digest:                 sha256:78ba029a7ae88cb9b20f456c0c5cffdd9609a0b4856cc7bbf456cc2e39f02e47
```

#### Exact production acceptance

```text
Pages:                          #169 / 31086909691 — SUCCESS
Pages deployment ID:            5776481884
Production Live Smoke:          #168 / 31086909906 — SUCCESS
production artifact:            8961927073
production digest:              sha256:681f8a098349bc4e44078273f5086f892f0dec7750abbe87de8ecf96702f24bc
PDF size:                       277792 bytes
PDF SHA-256:                    efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613
```

The exact production verifier accepted the Note only after rendered DOM, raw HTML, binary PDF, Atom feed and generated search passed independently on deployed SHA `a570dc420c83af33b483cb55c5904b3575ff729a`.

### P3.4F — Evidence-driven project state — DONE

Canonical route:

```text
/landing/notes/evidence-driven-project-state/
```

#### Accepted evidence model

- canonical registries own volatile facts;
- verified fact, engineering inference and limitation are explicit;
- `verified`, `stale` and `unverified` remain distinct trust states;
- repository activity, generated artifact, deployed production, external-product acceptance and operator/search-engine observation remain separate;
- Draft and pending product-owner evidence never promote automatically;
- evidence identity includes observation date, exact SHA, artifact digest and deployment identity where applicable;
- automatic reports remain reviewable and non-mutating;
- semantic/no-JavaScript content, registry-derived metadata/OpenGraph, Atom feed and generated search remain available;
- exact-head CI and exact-deployment production verification remain separate gates.

#### Feature and workflow evidence

```text
PR #141 exact head:             bd7b25019871aa22d56a4a1584f871c0012e5f59
PR #141 squash:                 cef4275977893ae23e00d9231fd87b3f587b123f
Build:                          #1037 — SUCCESS
quality artifact:               8967149410
quality digest:                 sha256:50f72f4d75dee81b0c61f7edec1e3f07f77be9983473acc69a672e998d4938a9
final workflow PR #145 head:    e356279c736c0df25778b60509ba903f7555cc61
final workflow PR #145 squash:  8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Build:                          #1044 / 31110081521 — SUCCESS
quality artifact:               8971423729
quality digest:                 sha256:afb44aaab0820e923330f4688fedaec3be9ced452dc2ea7de4de5136a09ff0ca
```

PR #142–#145 preserve the failed Pages hypotheses as operational evidence. The accepted contract uses one fail-closed deployment action per workflow run and a new attempt-scoped artifact for an explicit rerun; same-run retry is not treated as valid recovery.

#### Exact production acceptance

```text
Pages:                          #175 / 31110585951 — SUCCESS
accepted deployed SHA:          8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Pages deployment ID:            5781321808
Pages artifact:                 8971641004
Pages artifact digest:          sha256:8ee14188edb566e2d727d857b2bffe9063a3acf76ed5cbfb6afe312011a1a171
Production Live Smoke:          #190 / 31110583631 — SUCCESS
production artifact:            8971978059
production digest:              sha256:ac8e8cdf0dfe3d05e03e668a6bad1b051c226a0918e993e436c45efcc607a106
observedAt:                     2026-08-06T14:36:34Z
```

The exact production verifier accepted canonical/OpenGraph metadata, semantic content, no-JavaScript availability, Atom feed, generated search, every preceding P3.4 smoke and the dedicated P3.4F boundary on deployed SHA `8d2c3aa45d2b02ad3c22de75aca3602b009c13e6`.

### P3.5A — English Vlezet flagship — DONE

Controlled route `/en/projects/vlezet/` reuses canonical Vlezet lifecycle and evidence registries. Presentation copy is localized, while volatile project identities remain registry-owned. Browser/no-JavaScript/search/metadata contracts and the exact-deployment flagship smoke passed without introducing a separate English CMS or search index.

```text
PR #148 squash / deployed SHA:  17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87
Build:                          #1081 / 31153441505 — SUCCESS
unit tests:                     428 PASS / 0 FAIL
CodeQL:                         #581 / 31153441477 — SUCCESS
Pages:                          #177 / 31155442788 — SUCCESS
Pages deployment ID:            5790177102
Production Live Smoke:          #214 / 31155442779 — SUCCESS
production artifact:            8985006008
production digest:              sha256:a91b35963c685068c6ee79aff269de3baa297d9a6b8fcc321a945e696db84784
```

The CodeQL TOCTOU finding discovered during review was reproduced, fixed without behavior weakening and automatically resolved on the corrected exact head.

### P3.5B — English /now — DONE

Controlled route `/en/now/` reuses the canonical `data/now.json`, one shared `updated` date, Project Registry-derived active cards and the single generated Diplodoc search. English presentation, metadata/hreflang, mobile/accessibility and semantic no-JavaScript fallback are localized without a second current-state registry.

The first exact deployment of PR #150 exposed a verifier false negative: valid relative project links were interpreted without the document `<base>`. PR #151 corrected only the verifier by resolving hrefs through `document.baseURI` and comparing exact canonical EN routes. Final acceptance therefore uses the corrected verifier on the later exact deployed squash SHA.

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

Controlled route `/en/publications/` localizes presentation over the existing canonical publication registry. Original publication titles, source language and external canonical URLs remain bibliographic identity; English summaries/topics remain bounded presentation fields in the same records. One generated site-wide search remains authoritative, and the Notes Atom feed remains Notes-only. No second publication registry, English-only lifecycle state or second search index was introduced.

The accepted accessibility contract uses real screen-reader-only Topics text instead of relying on an `aria-label` that Diplodoc may sanitize in prebuilt Catalogue state. Search acceptance uses unique registry-derived English content and verifies the English Publications route without treating snippet formatting as product truth.

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

The repository now owns the bounded measurement machinery, not the missing external evidence. Inputs are aggregate-only and explicitly classified as `operator-observed` or `synthetic`. Synthetic executions always produce `synthetic-pipeline-proof`, preserve `readyForHumanReview=false`, and are not production measurement evidence. Raw/user-level telemetry is rejected; raw observation input is never uploaded.

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

### P3.6 — Measurement checkpoint — NEXT / WAITING

Real measurement remains bounded by sufficient `operator-observed` aggregate traffic and the documented minimum-window/equal-duration/operator-timestamp rules. Until that evidence exists and is reviewed by a human, no engagement, causality or product-impact conclusion is promoted.

---

## Operational boundaries

- issue #111 remains external search-engine/operator state;
- issue #78 remains pending default-branch Content Freshness owner refresh;
- issue #82 remains the Diplodoc dependency blocker until a secure compatible upstream line exists;
- no force audit fix, local shim or unreviewed fork;
- no removal of legacy compatibility before observed crawler replacement.
