# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-11**, после exact-production acceptance C7 — production baseline + P3.6 handoff; redesign implementation sequence завершён, P3.6 measurement остаётся открытым.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## 2026-08-11 — C7 production baseline + P3.6 handoff — PRODUCTION ACCEPTED

- Added one tracked `data/presentation-baseline.json` as `context-only` provenance for the existing P3.6 Measurement Checkpoint, separate from private operator observations and readiness analysis.
- Kept `cleanUrlMigrationAt=2026-08-05T00:00:00Z` and `resetsCleanUrlMeasurement=false`; C7 did not restart the observation clock.
- Extended the existing measurement report/workflow with an explicit tracked `--presentation-baseline` input without adding a secret, second analytics owner or second observation schema.
- Preserved the existing P3.6 rules: real evidence remains equal-duration `operator-observed` aggregates plus explicit traffic sufficiency and human review.
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

C7 completes the Portfolio Clarity redesign implementation sequence only. P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** and no engagement, conversion, SEO or causal product-impact claim is made.

## 2026-08-11 — C6 final EN/SEO reconciliation — PRODUCTION ACCEPTED

- Replaced the stale hard-coded i18n browser pair list with canonical `data/i18n.json` ownership, so all **13 controlled RU/EN pairs** are covered by generated canonical/hreflang/no-JavaScript acceptance.
- Reconciled top-level English Projects/Now and professional links into natural user-facing copy, using paired EN routes where available and explicit labels for intentional RU-only deep links.
- Kept `data/page-meta.json` as the sole canonical metadata owner while adding generated browser coverage for EN home/Experience canonical metadata/OpenGraph.
- Extended one Person JSON-LD identity across RU and EN home with `alternateName: Ruslan Nemykin`; no second structured-data identity was introduced.
- Preserved one Diplodoc generated search owner. C6 updated the EN Now search oracle from removed implementation-oriented copy to stable user-facing `short snapshot`.
- The first exact feature deployment passed Pages but Production Live #490 exposed the same stale phrase in the deployment-only P3.5B verifier. PR #196 corrected only that verifier query plus its regression contract; no product/runtime behavior changed.
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

C6 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C7 — production baseline + P3.6 handoff**.

## 2026-08-11 — C5 Knowledge surfaces — PRODUCTION ACCEPTED

- Replaced the hand-authored Engineering Notes mini-catalogue with a compact latest-first index derived from canonical `data/notes.json`; added semantic no-JavaScript output and a dedicated registry/count/order/overflow/Axe browser gate.
- Reordered Publications RU/EN so Featured and generated catalogue precede methodology framing without changing bibliographic ownership.
- Moved Engineering Map before taxonomy explanation, verified the reading guide after real scroll and reviewed only the intentional map-first desktop/mobile visual overrides (`1440×1465` / `390×2817`) with unchanged global thresholds.
- Moved Sources searchable/filterable knowledge utility before meta framing while preserving the existing Sources Registry and page-local filter ownership.
- Resolved the Advanced Security TOCTOU finding in the new Notes index postprocessor with direct read + explicit `ENOENT` handling and regression coverage.
- PR #193 exact head: `f99c4534932a86e6cac0876b4a082639786d4ad9`;
- final exact-head Build #1754 / `31437853159` — SUCCESS;
- quality artifact `9081845821`, digest `sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8`;
- CodeQL #1296 / `31437853182` — SUCCESS;
- Dependency Review #1182 / `31437853183` — SUCCESS;
- accepted squash / deployed SHA: `00900e832d69356bbccaa874f1b625876dad1e21`;
- Pages #218 / `31466807721` — SUCCESS;
- Pages deployment `5845809144` — success;
- Pages artifact `9091830845`, digest `sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6`;
- Pages verification reports `9091833853`, digest `sha256:606c1516529640b51cab480dd0e8a8b9347072c3a2be9b33f032419cf38e6179`;
- deployment-triggered Production Live #486 / `31466868392` — SUCCESS;
- production artifact `9091881791`, digest `sha256:4e3349bdbb8b44326049750074810b3f6ed150e7b6b8922bf75aee43354d93b0`.

C5 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C6 — final EN/SEO reconciliation**.

## 2026-08-10 — C4 Professional surfaces — PRODUCTION ACCEPTED

- Reworked RU/EN Experience into a concise hero, direct contact action, five grouped stack areas and impact-first role summaries; removed the duplicated Profile/flat technology wall.
- Reduced RU/EN Work with me to exactly three useful tracks, canonical availability, three implementation steps, direct handoff and explicit boundaries.
- Reduced RU/EN About to three concise personal-professional sections while preserving current Java/Spring and AI/MCP facts without duplicating full Experience/Projects narratives.
- Moved the canonical generated Now snapshot before meta explanation in RU/EN; `data/now.json` and Project Registry remain authoritative.
- Made Telegram/email immediate on Contacts while profiles and qualification remain secondary; collaboration renderer still does not own Contacts.
- Reviewed the intentional Resume visual change before acceptance; final desktop/mobile samples are `1440×3631` / `390×4964` with unchanged global visual thresholds.
- PR #191 exact head: `90551bf476a167a589ee1b4a5fab2cb11c8cd923`;
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

C4 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C5 — Knowledge surfaces**.

## 2026-08-10 — C3 Projects and flagship summary layer — PRODUCTION ACCEPTED

- Rebuilt RU/EN Projects into **Selected work → Commercial work → Labs & experiments**.
- Kept the spotlight to VillAIgence, NotchHub and TrueRuslan Landing; MarketDB is public-safe commercial proof, while Vlezet remains directly reachable without returning to the spotlight.
- Added one shared five-field registry-backed `Коротко / At a glance` layer to VillAIgence, NotchHub, TrueRuslan Landing and Vlezet in RU/EN before deep evidence.
- Preserved NODE ZERO private/proprietary boundaries, canonical project/evidence ownership, clean routes, one Diplodoc search owner, no-JavaScript semantics, privacy, SEO and accessibility.
- Reviewed only the intentionally changed Projects desktop/mobile visual baselines; global visual thresholds remain unchanged.
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

C3 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C4 — Professional surfaces**.

## 2026-08-10 — C2 Homepage clarity — PRODUCTION ACCEPTED

- Implemented the approved C2 fast-scan homepage hierarchy in RU/EN: **Hero → Proof → Selected work → Experience → Writing → Work with me → Personal**.
- Replaced first-scan Layer-3 evidence density with four concise professional proof facts and kept the spotlight to three selected projects.
- Kept exactly five semantic primary-navigation destinations; Contacts remains secondary and directly reachable.
- Preserved canonical registries, no-JavaScript content, generated search, canonical clean routes, privacy/Metrica and SEO contracts.
- Feature PR #183 squash: `5fe5c6e15a61e54edd39e94140c7554ba19c5203`; exact-head Build #1631 / `31341099744` — SUCCESS, 636 tests and all 31 quality stages.
- First C2 Pages #210 / `31341477318` deployed successfully, but deployment-triggered Production Live #467 / `31341502294` failed only because the Work with me production verifier still required removed C1 homepage cards.
- PR #184 corrected that verifier with RED-first coverage; exact-head Build #1633 / `31341749976`, CodeQL #1167 and Dependency Review #1061 — SUCCESS.
- Final accepted / deployed SHA: `361543c383b394d1f4cb061a97473038972340cf`.
- Final Pages #211 / `31342012579` — SUCCESS; deployment `5823994260`; Pages artifact `9046113610`, digest `sha256:c1d3dfec2f2c171ad4d224c04bb4765ef2d7d5099e2feacb6ee3bab35cb88ea1`.
- Deployment-triggered Production Live #471 / `31342042518` — SUCCESS; artifact `9046144255`, digest `sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6`.
- Exact production Work with me/C2 evidence reports RU/EN `proofFacts=4`, `selectedProjects=3`, `primaryNavigationItems=5`, with no product-side browser errors on that surface.

C2 remains an intermediate redesign slice and does not start, reset or close P3.6 Measurement. Next implementation slice: **C3 — Projects and flagship summary layer**.

## 2026-08-09 — C1 Presentation foundation — PRODUCTION ACCEPTED

- Began implementation of the approved **Portfolio Clarity & Scanability** redesign with an intentionally bounded foundation slice.
- Replaced the generic system/UI typography with self-hosted **Onest Variable** using reviewed Cyrillic + Latin WOFF2 subsets, exact SHA-256 contracts and retained SIL OFL 1.1 text.
- Added shared readability tokens: 17px desktop body target, 16px mobile body target, 1.62 line-height and 70ch long-form width.
- Reduced primary navigation to exactly five semantic destinations in both RU and EN while keeping /now, Engineering Map, Notes, Publications, Sources, Photos and Contacts available through the existing content tree/sidebar.
- Extended build-time asset publication to WOFF2 and license text; no runtime font CDN was introduced.
- TDD RED: head `a6e3c067c63d8ca91245e941b89c9ac0b0514a1a`, Build #1442 / `31301733976`, 585 PASS / exactly 5 expected FAIL.
- Final source acceptance: Build #1463 / `31304311486`, 591 PASS / 0 FAIL; CodeQL #988 and Dependency Review #891 SUCCESS; full browser/a11y/Lighthouse/cross-browser/privacy/SEO/visual matrix SUCCESS.
- Manual visual review accepted only the homepage desktop/mobile baseline change caused by the new font; unrelated shared baselines were preserved.
- Production accepted exact squash SHA `9cc9d69e6b49e3e9f3432788f0deb943d7acebf5`.

- PR #174 squash / deployed SHA: `9cc9d69e6b49e3e9f3432788f0deb943d7acebf5`;
- final exact-head Build #1463 / `31304311486` — SUCCESS;
- Pages #202 / `31304612906` — SUCCESS;
- Pages deployment `5817134996` — success;
- Production Live Smoke #354 / `31304642055` — SUCCESS;
- production artifact `9035548962`;
- production digest `sha256:41af56c91d59b5c80134d49b1928b0fde348384334c8863ddd9c74c9f4e5c85c`;
- production observation: `2026-08-09T08:55:33.810Z`.

C1 is not the final redesign measurement baseline. P3.6 remains **NEXT / WAITING**, and the next implementation slice is **C2 — Homepage structure**.

## 2026-08-09 — Work with me / private practice — PRODUCTION ACCEPTED

PR #171 implemented the approved evidence-led private-practice design from PR #170. It adds RU/EN Work with me routes backed by one fail-closed `data/collaboration.json`, a restrained homepage bridge, canonical Contacts handoff and an exact contextual CTA allowlist. There is no form, CRM, booking, payment flow, public pricing, lead database, conversion tracking, session replay or AI seller.

TDD and acceptance caught three important boundaries before merge: the initial product RED established the missing surfaces; a dedicated browser gate exposed incomplete no-JavaScript Diplodoc output; and final Advanced Security review exposed a postprocessor TOCTOU race. The no-JS artifact became a full semantic fallback with inspected mobile presentation, and the race was reproduced by Build #1426 before direct read + fail-closed `ENOENT` remediation.

Final feature production evidence:

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

Production Work with me verification passed RU/EN rendered and no-JavaScript pages, canonical availability/contact truth, homepage ordering and exactly three primary paths, Contacts handoff, 7 allowed versus 5 forbidden contextual surfaces, generated search and first-party runtime diagnostics. P3.6 measurement remains open / NEXT / WAITING; this feature does not imply engagement or product-impact evidence.

## 2026-08-08 — Homepage density, Experience, unified header and NotchHub — PRODUCTION ACCEPTED

Issue #166 was implemented through PR #167 as a bounded presentation slice: compact RU/EN homepage rhythm, terminal before primary paths, `Опыт` / `Experience` as the visible navigation label with stable `/landing/resume/`, dedicated Experience metric typography, one standalone/generated header contract, NotchHub as the featured current RU/EN flagship, and Vlezet editorial de-emphasis without changing its active lifecycle, direct route, history or evidence.

The first merged feature SHA was not promoted to accepted despite green source/build gates. Pages #195 deployed it successfully, but deployment-triggered Production Live #329 found a real product mismatch: **Vlezet still appeared in the English `Current work` grid** because `/now` selected every `active` project even though Vlezet had `featured=false`.

```text
feature PR #167 merged SHA:      2ccb495872b94027980ecaaab1ee7bbc0f3a8ba8
Pages:                           #195 / 31259962668 — SUCCESS
Pages deployment ID:             5809180757
Production Live Smoke:           #329 / 31259991547 — FAILURE
failed gate:                     P3.5B English Now — Vlezet leaked into Current work
```

PR #168 fixed the presentation/lifecycle boundary with TDD. RED head `722925563c4b91d3cb7060704b596d08b7686f3c` produced exactly one expected regression failure. GREEN head `b51c922a56efa517bd6418e4cdbc114698e9ebf4` changed prominent `/now` selection to `active && featured`, so Vlezet remains `active=true` while no longer appearing in the spotlight. Full Build #1381, CodeQL #900 and Dependency Review #809 passed before squash merge.

Final exact-production acceptance:

```text
hotfix PR:                       #168 — MERGED
final accepted source SHA:       4395128144c069663e67c660e5b549cfca851ae8
Pages:                           #196 / 31260596290 — SUCCESS
Pages deployment ID:             5809298234
Production Live Smoke:           #331 / 31260625145 — SUCCESS
P3.5B English Now smoke:         PASS
production artifact:             9022691131
production digest:               sha256:14de956b15e6c3c4c1c2cf0256e5652e229a7c7d5b4d0be81e6e802feaf52bef
```

All deployment-triggered production gates passed on the exact accepted SHA. P3.6 measurement remains open: this presentation acceptance does not provide or infer the required real equal-duration aggregate observations, traffic sufficiency or human review.

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

Next bounded slice: **P3.5B — English /now — NEXT**. Publications remains P3.5C.

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