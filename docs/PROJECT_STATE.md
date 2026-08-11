# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-11**, после exact-production acceptance C7 — production baseline + P3.6 handoff; redesign implementation sequence завершён, P3.6 measurement остаётся открытым.
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

Платформа объединяет RU/EN homepage, web-CV и PDF, evidence-backed flagship case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, generated search, Photo Stories, Sources Knowledge Base, Project Evidence, Content Freshness, Cloudflare Web Analytics, consent-gated Yandex Metrica, GitHub Pages и exact-deployment browser verification.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth и external/search-engine state не изменяются автоматически.

---

## 2. Latest accepted product truth

Последний принятый user-facing milestone:

**P3.5C — English Publications**.

Production route:

```text
/en/publications/
```

Inherited evidence model from P3.4F:

- canonical registries владеют volatile public facts; narrative prose не становится вторым mutable source of truth;
- verified fact, engineering inference и limitation обозначаются раздельно;
- `verified`, `stale` и `unverified` остаются явными trust states и не сворачиваются в общий положительный статус;
- repository activity, generated artifact, deployed production, external-product acceptance и operator/search-engine observation остаются независимыми evidence layers;
- Draft PR, pending product-owner acceptance и freshness observations не продвигаются автоматически;
- evidence фиксирует `observedAt`, exact commit SHA, artifact digest и deployment identity там, где соответствующий слой существует;
- автоматические отчёты остаются reviewable и non-mutating;
- semantic/no-JavaScript HTML, canonical/OpenGraph metadata, Atom feed и generated search проверяются отдельно;
- exact-head CI не заменяет exact-deployment production acceptance.

### P3.4F feature and operational evidence

```text
feature PR:                     #141 — MERGED
TDD RED Build:                  #1024 — expected FAILURE
PR #141 exact head:             bd7b25019871aa22d56a4a1584f871c0012e5f59
PR #141 squash:                 cef4275977893ae23e00d9231fd87b3f587b123f
Build:                          #1037 — SUCCESS
quality artifact:               8967149410
quality digest:                 sha256:50f72f4d75dee81b0c61f7edec1e3f07f77be9983473acc69a672e998d4938a9
CodeQL:                         #531 — SUCCESS
Dependency Review:              #465 — SUCCESS
```

Production acceptance также выявила Pages workflow defects, которые были исправлены без ослабления fail-closed semantics:

- PR #142 сделал Pages artifact identity attempt-scoped;
- PR #143 увеличил polling budget, но был superseded после подтверждения platform 10-minute limit;
- PR #144 проверил same-run retry, который production logs опровергли как невалидный для cancelled deployment identity;
- PR #145 оставил один fail-closed deploy action на workflow run и перенёс recovery на новый `github.run_attempt` с уникальным artifact name.

```text
final workflow PR:              #145 — MERGED
PR #145 exact head:             e356279c736c0df25778b60509ba903f7555cc61
accepted squash / deployed SHA: 8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Build:                          #1044 / 31110081521 — SUCCESS
unit tests:                     420 PASS / 0 FAIL
quality artifact:               8971423729
quality digest:                 sha256:afb44aaab0820e923330f4688fedaec3be9ced452dc2ea7de4de5136a09ff0ca
CodeQL:                         #542 — SUCCESS
Dependency Review:              #472 — SUCCESS
review threads:                 0 open
```

### P3.4F exact production acceptance

```text
Pages workflow:                 #175 / 31110585951 — SUCCESS
accepted deployed SHA:          8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Pages deployment ID:            5781321808
Pages artifact:                 8971641004
Pages artifact digest:          sha256:8ee14188edb566e2d727d857b2bffe9063a3acf76ed5cbfb6afe312011a1a171
Pages production reports:       8971922945
Pages reports digest:           sha256:b5fa444bae5b030e650f2a2f1ddc8bf3067188cf18ed23ad46b38cc560045484
Production Live Smoke:          #190 / 31110583631 — SUCCESS
baseline/platform/flagship:     PASS
P3.4A/P3.4B/P3.4C/P3.4D/P3.4E/P3.4F: PASS
favicon smoke:                  PASS
production artifact:            8971978059
production digest:              sha256:ac8e8cdf0dfe3d05e03e668a6bad1b051c226a0918e993e436c45efcc607a106
observedAt:                     2026-08-06T14:36:34Z
```

P3.4F accepted только на exact deployed SHA `8d2c3aa45d2b02ad3c22de75aca3602b009c13e6`. Repository activity или generated bytes без deployment identity и independent Production Live Smoke не считаются эквивалентным доказательством.

### P3.5A exact production acceptance

P3.5A добавил controlled English Vlezet flagship без второго lifecycle/evidence source of truth. English presentation получает status и Project Evidence из тех же canonical registries; volatile heads/run IDs не дублируются в narrative prose.

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
Pages artifact:                 8984956581
Pages artifact digest:          sha256:aba35d85b288676c6d284469145a4108eba97123acface36de6a0b1df26ecd82
Production Live Smoke:          #214 / 31155442779 — SUCCESS
production artifact:            8985006008
production digest:              sha256:a91b35963c685068c6ee79aff269de3baa297d9a6b8fcc321a945e696db84784
post-merge CodeQL:              #582 / 31155442796 — SUCCESS
```

GitHub Advanced Security TOCTOU finding in Project Evidence file reads was reproduced with a RED contract, fixed by direct reads plus fail-closed `ENOENT` handling, and automatically resolved by the subsequent CodeQL scan. P3.5A is accepted only on the exact deployed squash SHA above.

### P3.5B exact production acceptance

P3.5B publishes `/en/now/` without creating a second current-state source of truth. RU and EN editorial slices share one canonical `data/now.json` and one `updated` date; active project identity, lifecycle labels and links remain derived from Project Registry; one generated Diplodoc search remains the site-wide search owner. Canonical/hreflang, metadata/OpenGraph, mobile/accessibility and semantic no-JavaScript behavior are verified separately.

The first exact deployment of PR #150 was product-correct but exposed a production-verifier false negative caused by comparing a raw relative project href without applying the document base URI. The exact Pages artifact showed `<base href="../../">` plus valid relative links. PR #151 changed only the verifier and its regression contract: raw hrefs are now resolved through `document.baseURI` and compared to exact canonical EN routes.

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

P3.5B is accepted only on exact deployed SHA `96ea3ec5de18d99a811405b36a5b60066d9c374c`; PR #150 repository/build success and the earlier failed production-verifier run are not treated as equivalent production acceptance.

### P3.5C exact production acceptance

P3.5C publishes `/en/publications/` without creating a second publication registry or search owner. `data/publications.json` remains canonical: original publication titles, source language and Habr canonical URLs remain bibliographic identity, while English summaries and topics are bounded presentation fields in the same records. Catalogue, Featured, semantic no-JavaScript fallback and the single generated Diplodoc search are verified independently.

Feature verification exposed two test-model boundaries without weakening product requirements: localization assertions were scoped to UI nodes so original Russian bibliographic titles remain valid, and the Topics label moved from sanitizer-sensitive `aria-label` to real screen-reader-only DOM text that survives Diplodoc output. Search acceptance uses unique registry-derived English text `syntax overhead` and asserts the `/en/publications/` route rather than depending on bounded snippet wording.

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

P3.5C is accepted only on exact deployed SHA `f189d100785f0aea363df306fb7a923c06ee61a2`; exact-head CI without the corresponding Pages deployment identity and Production Live Smoke is not equivalent production acceptance.

### P3.6A — Measurement readiness — DONE

P3.6A is the latest accepted engineering/tooling milestone. It adds a privacy-bounded aggregate measurement analyzer, deterministic JSON/Markdown report CLI, manual secret-backed workflow and synthetic PR/master proof without changing the latest accepted user-facing product truth (P3.5C).

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

### P3.6B — Yandex Metrica Reports API — CONNECTED / TOOLING ACCEPTED

P3.6B extends the accepted P3.6A measurement tooling with read-only aggregate Yandex Metrica Reports API enrichment. The real authenticated connection was verified against the configured counter; OAuth remains least-privilege `metrika:read` and is confined to GitHub Actions.

```text
PR #157 squash / deployed SHA:       f0600dceef16d3471f5a2c67fecd28ff18f174dc
real connection check:               31201235872 — SUCCESS
probe day:                            2026-08-06 UTC
```

The successful authenticated probe proves API/counter access only. It does **not** accept P3.6 measurement, manufacture historical traffic or replace the observation-window and human-review gates.

### P3.6C — Consent-gated Yandex Metrica browser collection — PRODUCTION ACCEPTED

P3.6C implements **explicit consent** browser collection as progressive enhancement. No Yandex provider script, provider request or provider cookie is allowed before explicit consent. The bounded init disables Webvisor/session replay, Click Map, outbound-link tracking, accurate-bounce events, hash tracking and page-title transmission; custom events, user parameters, ecommerce and noscript tracking remain out of scope. Withdrawal after active initialization persists `denied`, sets the disable flag and reloads into a pre-init denied state.

The owner confirmed the counter-side privacy gate before production acceptance. Exact Pages #187 built the real-counter artifact from merged SHA `9bccf042fa6f9ce3ab289c7d023077c137ab238c`; the final verifier accepted one bounded controller on representative RU/EN routes. Deployment-triggered Production Live #288 resolved the exact successful Pages deployment and the real-site Yandex pre-consent smoke proved **zero Yandex requests before consent**.

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

P3.6C is accepted only for the exact deployed SHA and evidence above. P3.6 remains open: production collection acceptance is not equivalent to real equal-duration aggregate observations, sufficient traffic or human review.

### Portfolio presentation refinement — PRODUCTION ACCEPTED

Issue #166 refined the accepted portfolio presentation without changing the evidence model or closing P3.6. PR #167 compacted the RU/EN homepage rhythm, moved the terminal before the primary paths, made `Опыт` / `Experience` the visible navigation label while preserving `/landing/resume/`, normalized standalone and generated header chrome, improved Experience metric typography, and introduced NotchHub as the current featured RU/EN case study. NotchHub keeps accepted `0.1.0`/M0/R0.1/P0/P0.1 evidence separate from M1 Draft PR #10. Vlezet remains `active=true`, directly reachable and evidence-backed, but `featured=false`.

The first merged feature SHA exposed a real production acceptance gap: the prominent English `/en/now/` `Current work` grid still rendered every active project, so de-emphasized Vlezet leaked into the spotlight. PR #168 added RED-first regression coverage and changed only the presentation selection to `active && featured`, preserving Vlezet lifecycle truth.

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

This is the latest accepted user-facing presentation refinement. It does not replace P3.5C as the last numbered user-facing Portfolio 1.0 milestone and does not promote P3.6 measurement.

### Work with me / private practice — PRODUCTION ACCEPTED

PR #171 publishes a bounded RU/EN collaboration capability at `/landing/work-with-me/` and `/en/work-with-me/` without changing TrueLanding into a generic freelancer catalogue. One fail-closed `data/collaboration.json` owns reusable availability, direct contacts, pricing/legal policy and the curated contextual CTA allowlist. Core content remains static/no-JavaScript; homepage keeps exactly three primary paths; Contacts derives the same direct handoff; no form, CRM, booking, payments, public price list, lead database or conversion tracking was added.

Acceptance required more than green source CI. Dedicated browser verification exposed and corrected an incomplete no-JavaScript Diplodoc artifact; manual screenshot review then removed empty hydration-root space and duplicate anchor labels from the semantic fallback. Final review also reproduced a CodeQL TOCTOU finding with a RED contract and fixed it through direct reads plus fail-closed `ENOENT` handling before the final exact-head matrix.

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

The feature is accepted only on exact deployed SHA `433ee076f3f90dfe14feea97f59ad84bca0c337a` and Production Live #350. The later durable-docs deployment is not replacement product evidence. P3.6 measurement remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** and receives no engagement, causality or product-impact promotion from this feature.

**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**

---

### C1 — Presentation foundation — PRODUCTION ACCEPTED

The first runtime slice of **Portfolio Clarity & Scanability** is production-accepted. It establishes self-hosted Onest Variable typography, bounded readability tokens and one five-destination RU/EN primary navigation while preserving secondary content, static-first/no-JS behavior and every existing quality gate.

- PR #174 squash / deployed SHA: `9cc9d69e6b49e3e9f3432788f0deb943d7acebf5`;
- final exact-head Build #1463 / `31304311486` — SUCCESS;
- Pages #202 / `31304612906` — SUCCESS;
- Pages deployment `5817134996` — success;
- Production Live Smoke #354 / `31304642055` — SUCCESS;
- production artifact `9035548962`;
- production digest `sha256:41af56c91d59b5c80134d49b1928b0fde348384334c8863ddd9c74c9f4e5c85c`;
- production observation: `2026-08-09T08:55:33.810Z`.

The durable acceptance ledger is `docs/acceptance/2026-08-09-portfolio-clarity-c1.md`. This is an isolated foundation slice, not the final redesign measurement baseline: **P3.6 — Measurement checkpoint — NEXT / WAITING** remains unchanged until the full accepted redesign and its new observation window exist.

### C2 — Homepage clarity — PRODUCTION ACCEPTED

The second runtime slice of **Portfolio Clarity & Scanability** is production-accepted. RU/EN homepage presentation now follows the fast-scan hierarchy **Hero → Proof → Selected work → Experience → Writing → Work with me → Personal** while canonical project/evidence truth, no-JavaScript behavior, generated search, privacy and SEO ownership remain unchanged.

- feature PR #183 squash: `5fe5c6e15a61e54edd39e94140c7554ba19c5203`;
- final verifier PR #184 squash / deployed SHA: `361543c383b394d1f4cb061a97473038972340cf`;
- verifier exact-head Build #1633 / `31341749976` — SUCCESS;
- final Pages #211 / `31342012579` — SUCCESS;
- Pages deployment `5823994260` — success;
- Pages artifact `9046113610`, digest `sha256:c1d3dfec2f2c171ad4d224c04bb4765ef2d7d5099e2feacb6ee3bab35cb88ea1`;
- deployment-triggered Production Live #471 / `31342042518` — SUCCESS;
- production artifact `9046144255`, digest `sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6`;
- production homepage acceptance: RU/EN `proofFacts=4`, `selectedProjects=3`, `primaryNavigationItems=5`.

The first C2 deployment was product-correct but Production Live #467 exposed a stale C1-only Work with me verifier. PR #184 corrected only that verification contract; final acceptance is therefore tied to exact deployed SHA `361543c383b394d1f4cb061a97473038972340cf` and deployment `5823994260`.

Durable ledger: `docs/acceptance/2026-08-10-portfolio-clarity-c2.md`. C2 does not start, reset or close P3.6 Measurement.

### C3 — Projects and flagship summary layer — PRODUCTION ACCEPTED

The third runtime slice of **Portfolio Clarity & Scanability** is production-accepted. RU/EN Projects now use **Selected work → Commercial work → Labs & experiments**, while the four public flagships — VillAIgence, NotchHub, TrueRuslan Landing and Vlezet — expose one shared five-field `Коротко / At a glance` layer before deep evidence. Canonical registries continue to own volatile project status and evidence truth.

- PR #189 integrated head: `d58e4fe53e53ab52c59d63222642c87f36aa4662`;
- integrated exact-head Build #1686 / `31385511275` — SUCCESS;
- CodeQL #1224 / `31385511279` — SUCCESS;
- Dependency Review #1114 / `31385511434` — SUCCESS;
- quality artifact `9061720498`, digest `sha256:254e5a9ffadc5327777fcd9b65a149bfc5f3b75a1d4c08d7a87fa8ddbe3e5e59`;
- accepted squash / deployed SHA: `c54fd7c0e3554ffb6063fecfaa8135d02e9a6679`;
- Pages #214 / `31388753309` — SUCCESS;
- Pages deployment `5832077852` — success;
- Pages artifact `9062771335`, digest `sha256:e1781720e49e152b8d6dcc9ee1f34e1a718116ee5cac70c091358c01b28b40ed`;
- Pages verification reports `9062785516`, digest `sha256:2b2344c7a8f5e584293285af757dce9ddaa05aec657176995c0f284791f0dbe2`;
- deployment-triggered Production Live #478 / `31388848079` — SUCCESS;
- production artifact `9062864420`, digest `sha256:413205da34291556eabae8bf4d7f46f2af04be4fc63ce9cd42d8da801730c544`.

Durable ledger: `docs/acceptance/2026-08-10-portfolio-clarity-c3.md`. C3 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

### C4 — Professional surfaces — PRODUCTION ACCEPTED

The fourth runtime slice of **Portfolio Clarity & Scanability** is production-accepted. Experience, Work with me, About, Now and Contacts now use the approved scan-first professional presentation while canonical collaboration/Now/project registries, no-JavaScript semantics, one Diplodoc search owner, privacy/SEO and clean-route ownership remain unchanged.

- PR #191 exact feature head: `90551bf476a167a589ee1b4a5fab2cb11c8cd923`;
- exact-head Build #1712 / `31400871629` — SUCCESS;
- quality artifact `9067791638`, digest `sha256:0699049422b719281dbb68980bcde478a0adbd37dfad03ac19b69280ab32151c`;
- CodeQL #1252 / `31400871940` — SUCCESS;
- Dependency Review #1140 / `31400871675` — SUCCESS;
- accepted squash / deployed SHA: `12ea58e815ebf09bcc5915e92a715cd3bfed5241`;
- Pages #216 / `31401684624` — SUCCESS;
- Pages deployment `5834505086` — success;
- Pages artifact `9067905904`, digest `sha256:b1ed622b6b40f7b4fbec5e11afa161ca40eb53337fdfb9f7cc625d7fef4d1d4e`;
- deployment-triggered Production Live #482 / `31402338027` — SUCCESS;
- production artifact `9068239234`, digest `sha256:8548b1740dd7d8e746feaedcc08ce6b227df786fa4646b4b7018e9bb1928f264`.

Durable ledger: `docs/acceptance/2026-08-10-portfolio-clarity-c4.md`. C4 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

### C5 — Knowledge surfaces — PRODUCTION ACCEPTED

The fifth runtime slice of **Portfolio Clarity & Scanability** is production-accepted. Engineering Notes, Publications RU/EN, Engineering Map and Sources now use the approved scan-first knowledge presentation without creating parallel registries or a second site-wide search owner.

- PR #193 exact feature head: `f99c4534932a86e6cac0876b4a082639786d4ad9`;
- exact-head Build #1754 / `31437853159` — SUCCESS;
- quality artifact `9081845821`, digest `sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8`;
- CodeQL #1296 / `31437853182` — SUCCESS;
- Dependency Review #1182 / `31437853183` — SUCCESS;
- accepted squash / deployed SHA: `00900e832d69356bbccaa874f1b625876dad1e21`;
- Pages #218 / `31466807721` — SUCCESS;
- github-pages deployment `5845809144` — success;
- Pages artifact `9091830845`, digest `sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6`;
- Pages production verification reports `9091833853`, digest `sha256:606c1516529640b51cab480dd0e8a8b9347072c3a2be9b33f032419cf38e6179`;
- deployment-triggered Production Live #486 / `31466868392` — SUCCESS;
- production artifact `9091881791`, digest `sha256:4e3349bdbb8b44326049750074810b3f6ed150e7b6b8922bf75aee43354d93b0`.

Durable ledger: `docs/acceptance/2026-08-11-portfolio-clarity-c5.md`. C5 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

### C6 — final EN/SEO reconciliation — PRODUCTION ACCEPTED

The sixth runtime slice of **Portfolio Clarity & Scanability** is production-accepted. Canonical i18n acceptance now covers all 13 controlled RU/EN pairs from one manifest, English discovery copy and paired links are reconciled, existing metadata ownership is browser-verified on EN surfaces, and one bilingual Person JSON-LD identity is shared across RU/EN home.

- feature PR #195 exact head: `3104089b500e1f680117eb86e14347f3a7309b35`;
- feature Build #1783 / `31471924720` — SUCCESS;
- feature squash: `3bed9077ea02f50d1e2d0bb13cc3430174486a7e`;
- production-verifier correction PR #196 exact head: `ffadb765ac29ffad4988727c980be7bffc0dd58a`;
- correction Build #1785 / `31473097553` — SUCCESS;
- accepted squash / exact deployed SHA: `4751e14f4464b1c55153bf8803d7367d67b5fa7b`;
- Pages #221 / `31473635637` — SUCCESS;
- github-pages deployment `5847044248` — success;
- deployment-triggered Production Live #493 / `31473689705` — SUCCESS;
- production-live artifact `9094397196`, digest `sha256:1d3c3b4cb6f068b2bb9e755ea17cc466f7afe4306e899d690b1d63c3ce5ec27f`.

The first feature deployment was not promoted: Production Live #490 exposed only a stale deployed English Now search query after the C6 copy change. PR #196 corrected that production verifier with RED-first coverage; final Production Live #493 executed P3.5B and every other deployment-only gate successfully on exact SHA `4751e14f4464b1c55153bf8803d7367d67b5fa7b`.

Durable ledger: `docs/acceptance/2026-08-11-portfolio-clarity-c6.md`. C6 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

### C7 — production baseline + P3.6 handoff — PRODUCTION ACCEPTED

The final runtime slice of **Portfolio Clarity & Scanability** is production-accepted. One tracked presentation baseline is retained as `context-only` provenance for the existing P3.6 Measurement Checkpoint; it remains separate from operator observations, does not alter readiness, and does not create a second analytics or measurement source of truth.

- PR #198 exact feature head: `6a511b8f7cc102cdcc1b00f1dda26bc57fdefae3`;
- exact-head Build #1799 / `31515510234` — SUCCESS;
- quality artifact `9111068659`, digest `sha256:528e13cbe2883644c4673ce18bd0475b8acb87bb81b98e7ad806953bacc27e24`;
- Measurement Checkpoint #174 / `31515510155` — SUCCESS;
- measurement artifact `9110870252`, digest `sha256:6aeca4695acb1cae8933a852ee6ad8fc1323a80208a90cb7abb0084afdbd229c`;
- accepted squash / exact deployed SHA: `134043fa2bb5f6612266a04eab2853f71b207328`;
- Pages #223 / `31516118934` — SUCCESS;
- github-pages deployment `5855067883` — success;
- Pages artifact `9111122104`, digest `sha256:22471106f7981d7cfd8b8d7245aeea0db140c1a2c3fc0fb7b092ca30e5814e41`;
- Pages production verification reports `9111138147`, digest `sha256:f3bf385afa7b727cd62a26ccdbeef5d64eb711e516c4a90e993d7a7c7f9e6b75`;
- deployment-triggered Production Live #498 / `31516213818` — SUCCESS;
- production artifact `9111213502`, digest `sha256:fcacde8fd83e068fe094c05a0da07a23bb8ba88a42e15d87507cf5d8ccc1a1d8`.

`data/presentation-baseline.json` is now `production-accepted`. Its `measurementMode=context-only`, `resetsCleanUrlMeasurement=false`, and `cleanUrlMigrationAt=2026-08-05T00:00:00Z` preserve the original clean-URL observation clock rather than resetting it at the end of the redesign.

Durable ledger: `docs/acceptance/2026-08-11-portfolio-clarity-c7.md`. C7 completes the Portfolio Clarity redesign implementation sequence only. P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** for real equal-duration `operator-observed` aggregates, explicit traffic-sufficiency assessment and human review. C7 makes no engagement, conversion, SEO or causal product-impact claim.

## 3. External project evidence boundaries

Content Freshness observation от **2026-08-08** был вручную reconciled с текущими репозиториями. Новые release/PR/activity signals обновляют evidence snapshot, но сами по себе не повышают lifecycle и не заменяют product-owner/installed acceptance.

### Vlezet

Accepted baseline остаётся:

- M7.8B;
- PR #41 merge `08800dd66fa298ff31d1a7e6b33e91964cdb8d16`;
- local CV Draft и AI proposal не получают geometry authority;
- no mutation before explicit Apply;
- public lifecycle: `pre-production` / `ACTIVE DEVELOPMENT`.

Текущий reconciliation:

- PR #42 — **CLOSED UNMERGED / product-owner usefulness FAIL** после representative retest 2026-08-08; automatic M7.8C не принят;
- PR #44 — **CLOSED UNMERGED**, deterministic real-fixture benchmark сохранён только как R&D evidence;
- PR #45 — **CLOSED UNMERGED**, hybrid proposal recovery сохранён только как R&D evidence и не даёт AI geometry authority;
- PR #52 — **OPEN DRAFT / design-only Assisted Tracing gate**, product code ещё не принят.

Следующая bounded direction — Assisted Tracing: пользователь явно выбирает/рисует rough geometry, локальный raster helper может уточнить только текущий ephemeral preview при однозначном evidence, неоднозначность обязана abstain, обязательного AI/network path нет. M7.8B остаётся последним accepted recognition slice до отдельного TDD/browser/product-owner acceptance.

### VillAIgence

```text
current official release:       0.2.0+1.21.1
release commit:                 e426f588efefa6aa48a6e536c4a998421bbda241
installed candidate SHA-256:    56293f86634b50b2def044429aac6f2cf0d197eb16ac1e60224708f7b3333aee
required installed result:      7 PASS / 0 FAIL
VAI-M2-INST-005:                NOT TESTED / automated evidence only
VAI-CONCUR-004:                 NOT TESTED / DEFERRED
voice deadline/exactly-once:    PR #110 — MERGED
controlled BELIEF admission:    PR #123 — MERGED
PLAYER_TOLD extraction:         PR #125 — OPEN DRAFT / RED
lifecycle:                      release-candidate
public label:                   ACCEPTANCE IN PROGRESS
```

Official release и bounded installed 7 PASS / 0 FAIL не превращают deferred categories в PASS и не повышают lifecycle автоматически. PR #123 закрепил provenance-safe BELIEF admission: `PLAYER_TOLD`/`NPC_TOLD`/`INFERRED` остаются BELIEF, `SYSTEM_OBSERVED` не входит через BELIEF API, FACT authority остаётся server-owned. PR #125 — отдельный Draft/RED extraction slice без второго provider request и без AI→FACT path; он не является accepted product truth.

### Portfolio Platform

Canonical Project Evidence обновлён до принятого P3.6C production boundary:

- exact deployed SHA `9bccf042fa6f9ce3ab289c7d023077c137ab238c`;
- Pages #187 / run `31227641778` / deployment `5803497490`;
- Production Live #288 / run `31227681975`;
- production pre-consent smoke: zero Yandex requests before consent;
- P3.6 measurement по-прежнему **OPEN / WAITING FOR EXTERNAL EVIDENCE**.

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

Routes: `/landing/projects/livingworld/`, `/landing/projects/vlezet/`, `/en/projects/livingworld/`. Historical P3.3 acceptance remains unchanged, while the 2026-08-11 controlled reconciliation advances current external truth without lifecycle promotion: Vlezet keeps M7.8B as accepted recognition history, records M8.1 PR #85 as product-owner accepted/merged and M8.2 PR #87 as Draft with focused clipboard retest pending; VillAIgence keeps official installed 0.2.0+1.21.1 at 7 PASS / 0 FAIL, records merged source capability through PR #153 and keeps PR #155 Draft/pending.

### P3.4 — Grounded Engineering Notes — DONE

#### P3.4A — Deployment success is not production verification — DONE

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

#### P3.4B — Clean URLs without Cloudflare routing — DONE

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

#### P3.4C — Hybrid CV + AI recognition boundaries — DONE

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

Accepted M7.8B remains separate from later recognition R&D. The representative retest rejected automatic M7.8C usefulness and PR #42/#44/#45 stayed closed unmerged. Later product development advanced separately: PR #52 is now closed unmerged/superseded, M8.1 PR #85 is product-owner accepted/merged, and M8.2 PR #87 is Draft with focused clipboard retest pending. This reconciliation updates current evidence without rewriting P3.4C's historical production acceptance or promoting Vlezet beyond pre-production.

#### P3.4D — GameTests versus installed gameplay acceptance — DONE

Route: `/landing/notes/gametests-vs-installed-gameplay-acceptance/`.

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

Source/unit contracts, remapped package, GameTests, exact production-JAR, literal-loopback, `VAI-CONCUR-003`, `VAI-CONCUR-004`, PR #110, PR #112, historical Phase-E/Draft evidence, installed canaries, product-owner acceptance, rollback и recovery остаются отдельными evidence layers. Later `0.2.0` installed acceptance does not retroactively convert deferred `VAI-CONCUR-004` or other untested categories into PASS.

#### P3.4E — Passive PDF validation versus semantic completeness — DONE

File existence, stable route, `%PDF-`, parseability, MIME, Content-Disposition и downloadable bytes доказывают только ограниченные transport/format properties. Валидный или parseable PDF сам по себе не доказывает completeness, currentness, доступность, ATS compatibility, human-readable layout или semantic equivalence canonical web-CV.

Feature, corrections and exact production evidence remain preserved in the durable history and specification.

#### P3.4F — Evidence-driven project state — DONE

Route: `/landing/notes/evidence-driven-project-state/`.

Canonical registry ownership, fact/inference/limitation classes, `verified`/`stale`/`unverified` states, five independent evidence layers, non-mutating automation, no-JavaScript content, feed/search discoverability and exact deployment identity are accepted.

```text
PR #141 squash:                 cef4275977893ae23e00d9231fd87b3f587b123f
final workflow PR #145 squash:  8d2c3aa45d2b02ad3c22de75aca3602b009c13e6
Build:                          #1044 / 31110081521 — SUCCESS
Pages:                          #175 / 31110585951 — SUCCESS
Pages deployment ID:            5781321808
Production Live Smoke:          #190 / 31110583631 — SUCCESS
production artifact:            8971978059
production digest:              sha256:ac8e8cdf0dfe3d05e03e668a6bad1b051c226a0918e993e436c45efcc607a106
```

---

## 5. Operational boundaries

- `issue #111` — authenticated Yandex/search-engine observation;
- `issue #78` — 2026-08-11 controlled reconciliation updates Vlezet, VillAIgence and Portfolio Platform canonical evidence without lifecycle promotion; close only after the post-merge default-branch Content Freshness run reports 0 findings;
- `issue #82` — Diplodoc/markdown-it blocker; review on or after **2026-08-17**;
- no `npm audit fix --force`, local shim or unreviewed fork;
- no legacy cleanup before observed crawler replacement.

---

## 6. Approved next product slice

Portfolio 1.0 implementation is **COMPLETE THROUGH C7**; measurement acceptance remains separate.

**Portfolio Clarity redesign implementation sequence — COMPLETE through C7.**

P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; it was not closed or reset by C2/C3/C4/C5/C6/C7 presentation work.

P3.6A measurement-readiness tooling уже принято на exact SHA `7cc56d024fbde53156a9136b14b00c81c6718811`. Сам P3.6 остаётся observation checkpoint: запускать его только с реальными `operator-observed` aggregate observations после минимального post-migration window, с equal-duration baseline/current windows, explicit traffic-sufficiency assessment после закрытия current window и human review. Synthetic `synthetic-pipeline-proof` не является production measurement evidence и не разрешает engagement, causality или product-impact claims.