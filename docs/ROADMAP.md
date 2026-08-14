# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-14**, N6 full-site editorial UX + bounded copy polish production-accepted; controlled launch остаётся `not-published`, P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C остаются evidence-gated.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## 2026-08-14 accepted N6 full-site editorial UX + bounded copy polish

- **N6A full-site audit — DONE / RESEARCH ACCEPTED** via PR #231: 50/50 canonical routes, zero configured final warnings, Onest retained, eight bounded copy corrections selected.
- **N6C copy polish — DONE / PRODUCT ACCEPTED** via PR #233: bounded RU/EN reader-facing copy only; architecture, URLs, registries, typography and deep content ownership preserved.
- **Post-merge production verifier regression — CLOSED**: Production Live #561/#562 failed only because the RU no-JS verifier still required English `Context`; deployed RU content matched the accepted N6C copy.
- **Verifier correction — DONE / PRODUCTION ACCEPTED** via PR #234 / exact product SHA `635b4a0760765a515277ad8abcbb1500bf646027`; Pages #255, Production Live #564/#565 and master CodeQL #1662 are SUCCESS.
- **Durable N6 acceptance — DONE / PRODUCTION VERIFIED** via PR #236 / `01b4508355c33a81a5e9d1b5f5815a6c37318a9b`; Pages #256, Production Live #566/#567 and master CodeQL #1665 are SUCCESS. Ledger: `docs/acceptance/2026-08-14-n6-editorial-production-acceptance.md`.
- **N1–N6 presentation/editorial implementation is complete.** Do not start another unguided visual, copy, metadata or internal-link rewrite.
- **Next product/operator action remains controlled manual launch** using the accepted 10-target / 38-draft launch pack. Repository automation must not post, authenticate, schedule or mutate external publication state.
- After launch, continue P4.1B only from real authenticated/operator-supplied Search Console / Yandex Webmaster evidence. P4.1C and P3.6 remain evidence-gated; clean-URL clock remains `2026-08-05T00:00:00Z`.
- Maintenance remains independent: issue #82 is the upstream Diplodoc/markdown-it blocker (next review 2026-08-17); #78 requires fresh cross-repository evidence; #111 and #212 require authenticated operator/external observations.

## 2026-08-13 accepted Portfolio UX/content polish + Engineering Notes reader architecture

- **N2 Homepage — DONE / PRODUCTION ACCEPTED** via PR #221; durable acceptance #222.
- **N3/N3b/N3c Work with me / Now / professional context — DONE / PRODUCTION ACCEPTED** via PR #223; durable acceptance #224.
- **N4 Publications — DONE / PRODUCTION ACCEPTED** via PR #225; durable acceptance #226.
- **N5 Engineering Notes audit — DONE / RESEARCH ACCEPTED** via PR #227: all 16 Notes retained; no destructive merge/delete/canonical migration selected; reader orientation identified as the actual problem.
- **N5 reader architecture design — DONE** via PR #228.
- **N5 selected reader implementation — DONE / PRODUCTION ACCEPTED** via PR #229 / exact deployed SHA `1a0db35795aea1ea966e1452bcdb106bb5419ba1`. The hub now provides `С чего начать`, three validated guided series and the complete `Все заметки` catalogue from the same canonical `data/notes.json`; all current Note routes/search/feed/canonical/clean-URL contracts remain unchanged.
- PR #229 exact-head Build #2044 / `31685171581`, Dependency Review `31685171386`, CodeQL #1612 / `31685171699` — SUCCESS; Pages #251 / `31685895669`, deployment `5885271220`, Production Live #556 / `31685963890`, master CodeQL #1613 / `31685895573` — SUCCESS. Durable acceptance: `docs/acceptance/2026-08-13-engineering-notes-reader-architecture.md`.
- **Portfolio UX/content polish implementation sequence N1–N5 is complete.** Further unguided visual/SEO rewriting is not the next product step.
- **Next operator action: controlled manual launch** using the already accepted launch pack. Repository automation must not post, authenticate, schedule or mutate external publication state.
- After launch, accumulate real Search Console / Yandex Webmaster observations before P4.1C metadata/copy/internal-link decisions. P4.1B remains sparse/in-progress; P4.1C and P3.6 remain evidence-gated; clean-URL clock remains `2026-08-05T00:00:00Z`.
- Maintenance remains separate: issue #82 upstream Diplodoc/markdown-it blocker is still open; Content Freshness #78 must be reconciled only from fresh Vlezet/VillAIgence/Portfolio evidence, not from this presentation acceptance.

## 2026-08-12 accepted Navigation information architecture

- **Navigation IA cleanup — DONE / PRODUCTION ACCEPTED** via PR #217 / exact deployed SHA `9831521d5d248fa01c491e3cec031cef07fc8ec5`.
- Visible root order is now `Проекты → Опыт → Материалы → Работа со мной → Обо мне`; Materials owns Publications, Engineering Map, Engineering Notes and Sources, while About owns Сейчас, Фото and Контакты.
- English remains a hidden build-only TOC branch; direct EN routes and the existing language selector are preserved. No second navigation runtime, dependency, locale build or search owner was introduced.
- Exact-head Build #1976, Dependency Review #1397, CodeQL #1533, Distribution Readiness #201 and the full browser/visual/custom-domain matrix passed before merge.
- Pages #240 / `31626103994`, deployment `5874711313` and deployment-triggered Production Live #533 / `31626170633` are SUCCESS. Production evidence is preserved in `docs/acceptance/2026-08-12-navigation-information-architecture.md`.
- **Next product action remains evidence/operation-led, not another ungrounded navigation rewrite**: controlled manual launch is still `not-published`; P4.1B remains sparse/in-progress; P4.1C and P3.6 remain evidence-gated. Clean-URL clock stays `2026-08-05T00:00:00Z`.

## 2026-08-12 accepted real search baseline / controlled launch pack

- **P4.1B real Google Search Console adapter — DONE / PRODUCTION ACCEPTED** via PR #213 / `831535461f3c72d53e3510574ae7ae9c52ab54f6`: exact-head Build #1933, CodeQL #1487 and Dependency Review #1355 — SUCCESS; Pages #236 / 31606858974 — SUCCESS; Production Live #524 / 31606858968 and #525 / 31606948825 — SUCCESS.
- First authenticated/operator-supplied Google Search Console Search Performance export is available privately and established the real Russian CSV shape. Public durable state records only that it is a **sparse pre-public-launch / clean-URL-migration baseline**; raw metrics remain outside Git.
- **P4.1B real external evidence review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**: query evidence is currently empty and traffic/migration maturity is insufficient for stable CTR, ranking or causal SEO conclusions.
- **Controlled launch pack — DONE / PRODUCTION ACCEPTED** via PR #214 / `bed23ac0330ca112b94259998adcd8187203988a`: Build #1939 / 31610400124 — SUCCESS; Distribution Readiness #185 / 31610400129 — SUCCESS; **10 targets / 38 manual drafts / not-published**; Pages #237 / 31611168208 — SUCCESS; Production Live #526 / 31611168202 and #527 / 31611259926 — SUCCESS.
- **Controlled manual launch — NEXT OPERATOR ACTION / NOT PUBLISHED**: review the generated drafts and publish deliberately through the selected external channels. Repository automation must not post, schedule, authenticate to external accounts or mutate canonical URLs.
- After the real launch, accumulate external observations before choosing any P4.1C metadata/copy/internal-link change.
- **P4.1C — WAITING** for reviewed evidence strong enough to justify a concrete change.
- **P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE** remains separate; clean-URL observation clock stays `2026-08-05T00:00:00Z`.

## 2026-08-12 accepted evidence / P4.1B intake baseline

- PR #209 / `ccf1996ced5c90511812ad435bb5829df56d30b3`: current Vlezet/VillAIgence/Portfolio evidence reconciled; final Build #1914 / 31597254382 — SUCCESS; **723 PASS / 0 FAIL**; Content Freshness #191 — SUCCESS; Pages #233 and Production Live #519 — SUCCESS. Lifecycle, installed-release and P3.6 boundaries were preserved.
- **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED** via PR #210 / `6083e4d950d74b272cce199fedccc730dfcc4fed`: Build #1922 / 31599699918 — SUCCESS; **731 PASS / 0 FAIL**; Pages #234 / 31600575541 — SUCCESS; Production Live #520 / 31600575540 — SUCCESS; post-merge CodeQL #1475 / 31600575547 — SUCCESS.
- **P4.1B real external evidence review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**: PR #213 consumed the first actual Google Search Console export shape; continue review only as real query/page/indexing observations accumulate.
- Raw export adapters are implemented only against an actual operator-provided shape; no sample metrics or guessed schemas become evidence.
- **P4.1C — WAITING** for reviewed real P4.1B evidence or a concrete structural finding.
- **P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE** remains separate; clean-URL observation clock stays `2026-08-05T00:00:00Z`.

## 2026-08-12 accepted maintenance baseline

- PR #205 / `94a3748e5fd82ac707f2bcc69e4cab255ba217e5`: CodeQL Action v4.37.6; Build #1887 / 31579461177 — SUCCESS; CodeQL #1435 / 31579461126 — SUCCESS; Pages #230 / 31580165353 — SUCCESS; Production Live Smoke #511 / 31580165196 — SUCCESS.
- PR #185 — **CLOSED UNMERGED / SECURITY BLOCKED** at `c4e6b8dd87f224ed92dca8598d8d49737bea1d0f`: functional CI green, but Dependency Audit #222 / 31580402634 reported **7 moderate / 0 high / 0 critical**; issue #82 — OPEN blocker, next review **2026-08-17**.
- PR #207 — **CLOSED UNMERGED**: regenerated candidate has byte-identical `package-lock.json` blob `dac054d274e48ce93828e97b83d09cc121024575`, therefore inherits the same #82 blocker.
- PR #206 / `ef40c960e1849ee0551cb478d0cd71a3f69ef601`: removed Dependabot unmanaged labels; TDD RED Build #1890 / 31581385552 — expected FAILURE; final Build #1891 / 31581517909 — SUCCESS; 715 PASS / 0 FAIL; Pages #231 / 31582194873 — SUCCESS; Production Live Smoke #515 / 31582244697 — SUCCESS.
- Dependency maintenance must remain fail-closed: functional green does not override an increased known-vulnerability footprint.
- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; `2026-08-05T00:00:00Z` remains the clean-URL observation clock. **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED; P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; P4.1C — WAITING**.

## 2026-08-12 accepted launch / discovery baseline

- PR #202 / `91c4d3d5cb464a107e3d14d8d091cf4eb0c1638f`: Pages #226 / 31572318752 — SUCCESS; Production Live Smoke #504 / 31572389064 — SUCCESS; 10 targets / 4 profiles / 0 stale / 0 unverified.
- PR #203 / `ffd420c4b2b9e42385529b7654eaaab5f0dbd9cf`: 701 PASS / 0 FAIL; Pages #227 / 31573207215 — SUCCESS; Production Live Smoke #505 / 31573207182 — SUCCESS; 10 launch + 5 supplemental metadata surfaces.
- P4.1A PR #201 / `e75a4d24a5d9f2b8ace95c9a0629e7567992741b`: Build #1879 / 31573775442 — SUCCESS; 709 PASS / 0 FAIL; Pages #228 / 31574516725 — SUCCESS; Production Live Smoke #507 / 31574516705 — SUCCESS; 11 strategic surfaces / 21 clean routes / 0 findings; externalEvidence=not-collected.
- **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED** via PR #210; **P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**: collect real Search Console / Yandex Webmaster observations only when meaningful external evidence exists.
- **P4.1C — WAITING**: user-facing metadata/copy/internal-link changes require P4.1B evidence or a concrete structural finding.
- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; `2026-08-05T00:00:00Z` remains the clean-URL observation clock.

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
- Portfolio Clarity C5 — Knowledge surfaces — PR #193 / PRODUCTION ACCEPTED.
- Portfolio Clarity C6 — final EN/SEO reconciliation — PR #195/#196 / PRODUCTION ACCEPTED.
- Portfolio Clarity C7 — production baseline + P3.6 handoff — PR #198 / PRODUCTION ACCEPTED.

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

Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`. M7.8B remains the accepted recognition slice; later automatic M7.8C R&D stayed closed-unmerged. PR #52 is now closed unmerged/superseded, **M8.1 is product-owner accepted and merged via PR #85**, and **M8.2 PR #87 is the current Draft product boundary** with scenarios 01–07 passed but a focused clipboard retest still pending. No merge/release/lifecycle promotion is claimed for M8.2 before that retest and explicit closure.

VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`. The current official release is `0.2.0+1.21.1`; the byte-identical clean-world candidate passed the required installed Memory 2.0 suite **7 PASS / 0 FAIL**, while `VAI-M2-INST-005` remains NOT TESTED / automated evidence only and `VAI-CONCUR-004` remains NOT TESTED / DEFERRED. Post-release source work advanced independently: PR #125 is merged bounded BELIEF-extraction evidence, PR #153 merged causal NPC↔NPC social mutation, and PR #155 is the current Draft Personality/social-snapshot follow-up. None of these source milestones expands installed 0.2.0 acceptance.

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

### C2 — Homepage clarity — PRODUCTION ACCEPTED

Accepted production hierarchy: **Hero → Proof → Selected work → Experience → Writing → Work with me → Personal**. The first exact deployment exposed only a stale C1 production-verifier assumption; PR #184 corrected that verifier without weakening product gates.

- feature PR #183 squash: `5fe5c6e15a61e54edd39e94140c7554ba19c5203`;
- final accepted / deployed SHA: `361543c383b394d1f4cb061a97473038972340cf`;
- verifier exact-head Build #1633 / `31341749976` — SUCCESS;
- Pages #211 / `31342012579` — SUCCESS;
- Pages deployment `5823994260` — success;
- deployment-triggered Production Live #471 / `31342042518` — SUCCESS;
- production artifact digest: `sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6`.

C2 keeps exactly four proof facts, three selected projects and five semantic primary-navigation destinations in RU/EN. It does not start/reset/close P3.6.

### C3 — Projects and flagship summary layer — PRODUCTION ACCEPTED

Accepted production hierarchy: **Selected work → Commercial work → Labs & experiments**. Selected work is exactly VillAIgence, NotchHub and TrueRuslan Landing; MarketDB is the bounded commercial proof; Vlezet and lower-priority projects remain directly reachable without equal spotlight weight. VillAIgence, NotchHub, TrueRuslan Landing and Vlezet each expose a shared five-field registry-backed `Коротко / At a glance` layer before the deep-dive/evidence layer.

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

C3 preserves project lifecycle/evidence ownership and does not start, reset or close P3.6.

### C4 — Professional surfaces — PRODUCTION ACCEPTED

Accepted scan-first professional layer: Experience, Work with me, About, Now and Contacts are concise and useful on first scan while canonical mutable truth stays registry-owned. Resume keeps passive PDF/no-JS semantics and reviewed desktop/mobile presentation; generated search, privacy, SEO and clean routes remain unchanged.

- PR #191 exact feature head: `90551bf476a167a589ee1b4a5fab2cb11c8cd923`;
- exact-head Build #1712 / `31400871629` — SUCCESS;
- CodeQL #1252 / `31400871940` — SUCCESS;
- Dependency Review #1140 / `31400871675` — SUCCESS;
- accepted squash / deployed SHA: `12ea58e815ebf09bcc5915e92a715cd3bfed5241`;
- Pages #216 / `31401684624` — SUCCESS;
- Pages deployment `5834505086` — success;
- deployment-triggered Production Live #482 / `31402338027` — SUCCESS;
- production artifact digest: `sha256:8548b1740dd7d8e746feaedcc08ce6b227df786fa4646b4b7018e9bb1928f264`.

C4 does not start, reset or close P3.6 Measurement.

## C5 — Knowledge surfaces — DONE / PRODUCTION ACCEPTED

Accepted outcome: Engineering Notes index derives from canonical `data/notes.json`; Publications RU/EN puts published work before methodology; Engineering Map is map-first with reviewed responsive visuals; Sources puts searchable/filterable utility before meta framing. No second Notes/Publications/Sources registry or site-wide search owner was introduced.

```text
PR #193 exact head:              f99c4534932a86e6cac0876b4a082639786d4ad9
Build:                           #1754 / 31437853159 — SUCCESS
quality artifact:                9081845821
quality digest:                  sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8
accepted squash / deployed SHA:  00900e832d69356bbccaa874f1b625876dad1e21
Pages:                           #218 / 31466807721 — SUCCESS
Pages deployment ID:             5845809144
Pages artifact:                  9091830845
Pages artifact digest:           sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6
Production Live Smoke:           #486 / 31466868392 — SUCCESS
production artifact:             9091881791
production digest:               sha256:4e3349bdbb8b44326049750074810b3f6ed150e7b6b8922bf75aee43354d93b0
```

C5 does not start, reset or close P3.6 Measurement.

### C6 — final EN/SEO reconciliation — PRODUCTION ACCEPTED

Accepted outcome: one canonical 13-pair RU/EN manifest drives browser acceptance; EN discovery copy and paired links are reconciled; `data/page-meta.json` remains the sole metadata owner; one bilingual Person JSON-LD identity covers RU/EN home; generated Diplodoc search remains the sole site-wide search owner; exact production acceptance includes the focused deployed English Now search-oracle correction.

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

The first feature deployment was deliberately not accepted because Production Live #490 exposed the stale deployed P3.5B query. Final exact SHA `4751e14f4464b1c55153bf8803d7367d67b5fa7b` passed Pages #221, deployment `5847044248` and deployment-triggered Production Live #493 with P3.5B and all downstream deployment-only gates executed successfully.

C6 does not start, reset or close P3.6 Measurement.

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

## P3.6 — Measurement checkpoint — NEXT / WAITING

After sufficient aggregate traffic, run the manual checkpoint with real `operator-observed` Cloudflare Web Analytics, Google Search Console and Yandex Webmaster aggregates. P3.6 remains an observation checkpoint, not permission to infer engagement or product impact from an insufficient sample or from synthetic pipeline proof.

## P4.1 — Search & Discovery — IN PROGRESS

P4.1 is a separate discovery program and does not close, reset or reinterpret P3.6 Measurement. Durable specification: `docs/keystone/specs/2026-08-11-p4-1-search-discovery.md`.

### P4.1A — Search Discovery repository readiness — REPOSITORY ACCEPTED

Bounded structural audit over the existing canonical owners: `data/page-meta.json`, `data/i18n.json`, clean-route projection and the single Diplodoc generated search owner. `data/search-discovery.json` is coverage policy only, not a second metadata registry. Generated readiness evidence is written to `quality-artifacts/search-discovery-readiness.{json,md}` from the ordinary test/Build path.

P4.1A stores no Search Console/Webmaster impressions, clicks, CTR, position or indexing observations and makes no search-performance claim. Repository acceptance evidence: exact head `02c587d7adaca57d13cf9e68dd3babf269285d2f`; Build #1858 / `31537039625` — SUCCESS; quality artifact `9119360015`, digest `sha256:411410e9e3f9afecb04984de72b66bedcc6ad67d9a03f16d068ab4fb375632d3`; CodeQL #1408 / `31537039524` — SUCCESS; Dependency Review #1286 / `31537039489` — SUCCESS; Dependency Audit #215 / `31537039452` — SUCCESS. The final Build artifact contains `search-discovery-readiness.json/.md/.log` with **11 strategic surfaces / 21 clean routes / 0 findings / READY** and `externalEvidence=not-collected`.

### P4.1B — External Search Console / Webmaster evidence — NEXT

After P4.1A acceptance, collect bounded real aggregate Google Search Console and Yandex Webmaster observations for queries/pages, clean-versus-legacy indexing, coverage problems and RU/EN discovery. Synthetic or inferred values cannot become external evidence.

### P4.1C — Evidence-backed discovery improvements — WAITING

Only structural findings or real P4.1B evidence may justify user-facing title/description, information-scent, structured-data or internal-link changes. Preserve C1–C7 scanability and avoid keyword stuffing.

---

# Operational checkpoints

- issue #111 — authenticated Yandex Webmaster actions and crawler observation;
- issue #78 — CLOSED / COMPLETED on 2026-08-11 after default-branch Content Freshness #177 reported 0 findings on `master@40773f4953d43174eec25e1070a5925abbb3234a`;
- issue #82 — review on or after **2026-08-17**; no `npm audit fix --force`, local shim or unreviewed fork.

## New-session rule

Open durable state and Portfolio 1.0 specification. Check actual PRs, exact-head CI, Pages deployment and Production Live Smoke. Confirm P3.4F feature and exact production acceptance for SHA `8d2c3aa45d2b02ad3c22de75aca3602b009c13e6`, Pages run `31110585951`, deployment `5781321808` and Production Live run `31110583631`. Preserve issue #111 and issue #82 boundaries; confirm issue #78 remains CLOSED / COMPLETED after default-branch Content Freshness #177 reported 0 findings. Confirm P3.5A exact production acceptance for SHA `17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87`, Pages run `31155442788`, deployment `5790177102` and Production Live run `31155442779`. Confirm P3.5B exact production acceptance for SHA `96ea3ec5de18d99a811405b36a5b60066d9c374c`, Pages run `31161876484`, deployment `5791352097` and Production Live run `31161925498`. Confirm P3.5C exact production acceptance for SHA `f189d100785f0aea363df306fb7a923c06ee61a2`, Pages run `31180427543`, deployment `5794904843` and Production Live run `31180478038`. Confirm P3.6A Measurement readiness acceptance for SHA `7cc56d024fbde53156a9136b14b00c81c6718811`, post-merge Measurement Checkpoint run `31185967995`, Pages run `31185967012`, deployment `5795968137` and Production Live run `31186078593`. Confirm P3.6B real Reports API connection run `31201235872`. Confirm P3.6C production acceptance for SHA `9bccf042fa6f9ce3ab289c7d023077c137ab238c`, Pages run `31227641778`, deployment `5803497490`, Production Live run `31227681975` and production evidence digest `sha256:1688d968db168f8342b9fca95b3550cbd7b4065aed0d6e6d282dc5e4fb22230a`. Confirm the accepted presentation refinement for SHA `4395128144c069663e67c660e5b549cfca851ae8`, Pages run `31260596290`, deployment `5809298234` and deployment-triggered Production Live run `31260625145`.

Then reconcile current external project evidence before making product claims: Vlezet must keep M7.8B as accepted recognition history, PR #42/#44/#45 closed-unmerged, PR #52 closed unmerged/superseded, M8.1 PR #85 product-owner accepted/merged and M8.2 PR #87 Draft with focused clipboard retest pending; VillAIgence must keep official `0.2.0+1.21.1`, installed `7 PASS / 0 FAIL`, explicit NOT TESTED boundaries, merged post-release source capability through PR #125/#153 and Draft/pending PR #155 separate from installed acceptance. Confirm C4 exact production acceptance for SHA `12ea58e815ebf09bcc5915e92a715cd3bfed5241`, Pages run `31401684624`, deployment `5834505086` and Production Live run `31402338027`. Confirm C5 exact production acceptance for SHA `00900e832d69356bbccaa874f1b625876dad1e21`, Pages run `31466807721`, deployment `5845809144` and Production Live run `31466868392`. The Portfolio Clarity redesign implementation sequence is complete through **C7 — production baseline + P3.6 handoff**. P4.1A Search Discovery repository readiness is accepted on exact head `02c587d7adaca57d13cf9e68dd3babf269285d2f`; P4.1B external Search Console / Yandex Webmaster evidence is next. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** untouched until real `operator-observed` aggregate evidence satisfies the documented equal-duration window, traffic-sufficiency and human-review boundaries.