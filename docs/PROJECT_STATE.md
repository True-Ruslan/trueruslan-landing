# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после Yandex Webmaster favicon reconciliation, exact-SHA Pages deployment и deployment-driven Production Live Smoke.
>
> Durable snapshot: что представляет собой проект, что доказано, какие границы остаются и что делать дальше.

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`;
5. `docs/DISTRIBUTION.md`.

После чтения отдельно проверять actual open PR, latest commits, exact-head CI, latest `github-pages` deployment, Production Live Smoke, Cloudflare aggregate telemetry и external-project acceptance. Repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Платформа объединяет standalone homepage, Diplodoc knowledge pages, RU/EN web-CV и downloadable PDF resume, evidence-backed case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, full-text search, Photo Stories, Sources Knowledge Base, Project Evidence, Content Freshness, bounded RU/EN, privacy-friendly Cloudflare Web Analytics и production-oriented quality gates.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth, external profiles и search-engine state не изменяются автоматически.

---

## 2. Latest accepted product and production truth

Последний принятый продуктовый milestone — Yandex Webmaster favicon reconciliation в PR #112.

```text
feature PR:                      #112 — MERGED
exact PR head:                   00e7823d558c7a3473ee9fcf96692d583552f578
accepted product squash:         18358a4939dc4062669dbcb45850e9beb26e1cac
Build:                           #778 / 30953202266 — SUCCESS
CodeQL:                          #243 / 30953202233 — SUCCESS
Dependency Review:               #206 / 30953202243 — SUCCESS
Dependency Audit Evidence:       #17 / 30953202563 — SUCCESS
unit tests:                      345 PASS / 0 FAIL
site integrity:                  36 HTML / 1115 references — PASS
browser/accessibility:           PASS
Firefox/WebKit:                  PASS
search/RU-EN/analytics:          PASS
visual regression:               PASS
custom-domain artifact:          PASS
review threads:                  0 open
quality artifact:                8910068861
quality digest:                  sha256:d309cff946ce4473f8aec309531df7124787c864bd139693cf5ddc31ddac1f80
```

Exact post-merge production proof:

```text
source Pages workflow:           #142 / 30953599246 — SUCCESS
Production Live Smoke:            #45 / 30953667481 — SUCCESS
event:                            workflow_run
deployed/caller SHA:              18358a4939dc4062669dbcb45850e9beb26e1cac
github-pages deployment id:       5752049616
deployment state:                 success
live artifact:                    8910151878
live digest:                      sha256:fe0ce39de71919915edc3760ac0768bf62e21b922312688a1d6cf8d7fd4c01e1
```

The deployment-driven live run checked out the exact squash SHA and resolved the identical successful Pages deployment. Apex/www routing, canonical metadata, Atom feed, generated search, Cloudflare beacon and absence of browser/request errors passed independently.

---

## 3. Yandex Webmaster favicon reconciliation — DONE in repository

Yandex Webmaster reported that the favicon was unavailable to the robot and separately recommended SVG/120×120 favicon.

Root cause established from the generated Pages artifact:

- canonical SVG existed at `assets/images/favicon.svg`;
- generated artifact had no root `/favicon.svg`;
- generated pages depended on a relative URL and `<base>` behavior;
- Sitemap and HTTPS were already valid production contracts and were not the favicon root cause.

PR #112 delivered:

- byte-equal publication of `docs/assets/images/favicon.svg` as generated `/favicon.svg`;
- deterministic post-processing of every generated icon link to `/favicon.svg`;
- coverage for root, nested, search, self-closing and reordered link syntax;
- root-absolute Diplodoc configuration;
- deployment-only Playwright verification preserved inside Production Live Smoke.

Exact deployed favicon evidence:

```text
URL:                              https://trueruslan.ru/favicon.svg
HTTP:                             200
Content-Type:                     image/svg+xml
bytes:                            591
homepage href:                    /favicon.svg
resume href:                      /favicon.svg
resolved URL:                     https://trueruslan.ru/favicon.svg
```

Repository work for YW-01/YW-05 is complete. Issue #111 remains open only for authenticated Yandex Webmaster operator state:

- confirm `https://trueruslan.ru/sitemap.xml` in the HTTPS property;
- confirm HTTP→HTTPS move/main mirror state;
- select “No region”;
- submit homepage recrawl;
- recheck diagnostics after 10–14 days.

Yandex Metrica, Yandex Business and an artificial regional-commercial claim remain explicit non-goals without a separate product/privacy requirement. A green live contract does not prove that Yandex has already refreshed its cached diagnosis.

---

## 4. August 2026 Resume baseline — DONE

PR #108 synchronized the current professional profile and original August PDF/web surfaces. PR #110 then replaced the user-managed PDF and corrected resume timeline alignment.

Latest resume milestone:

```text
feature PR:                      #110 — MERGED
exact head:                      4f224975928a42bd8ea5f311e5e8e1598a87dc28
squash:                          4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                           #765 / 30942487224 — SUCCESS
CodeQL:                          #229 / 30942487265 — SUCCESS
Dependency Review:               #193 / 30942487179 — SUCCESS
source Pages:                    #141 / 30950087819 — SUCCESS
Production Live Smoke:           #37 / 30950157904 — SUCCESS
```

Delivered by PR #110:

- current downloadable `docs/assets/documents/cv.pdf`;
- timeline line and markers share one horizontal coordinate;
- markers align with the first line of job headings;
- Diplodoc anchor padding is removed only from direct resume job headings;
- generator-independent binary PDF checks.

Current permanent resume contract is intentionally split:

- RU/EN web-CV and metadata receive semantic content checks;
- binary PDF receives structural/passive checks: valid PDF header and EOF, meaningful size, and absence of JavaScript, Launch or EmbeddedFile payloads;
- compressed PDF text and URLs are not inferred through unsafe raw-byte substring matching;
- semantic PDF extraction may be added later only through a reviewed real PDF parser.

No metrics, leadership claims or proprietary implementation details are invented.

---

## 5. Distribution and external profiles — DONE

PR #98 delivered deterministic distribution targets and operator evidence. PRs #102/#104 completed external-profile canonicalization.

Controlled snapshot:

```text
profiles:                          4
verified:                          4
stale:                             0
unverified:                        0
```

Verified identities:

- GitHub profile;
- Habr profile;
- Telegram personal;
- Telegram Blog.

Any future state change requires fresh rendered evidence. Distribution readiness is not an engagement or audience-growth claim.

---

## 6. Vlezet Draft freshness reconciliation — DONE

PR #106 recorded M7.8C PR #42 only as bounded pending Draft evidence while preserving M7.8B as the accepted recognition slice.

```text
accepted recognition slice:       M7.8B
next recognition slice:           M7.8C
PR #42 state:                      open Draft / pending evidence
observed head:                     c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a
product-owner acceptance:          pending
Content Freshness report:          0 findings / 0 warnings / 0 errors
issue #78:                         CLOSED / COMPLETED
```

Draft evidence does not authorize merge, acceptance or public lifecycle promotion.

---

## 7. Production Live Smoke orchestration — DONE

PR #99 changed the primary production-verification boundary to the completed `Deploy static content to Pages` workflow through `workflow_run`; direct push remains a fallback. PR #100 proved activation order.

PR #112 extended the same read-only workflow rather than creating another verifier. The favicon assertion runs only for deployable events and is skipped on pull requests so an undeployed branch is never judged against current production.

Generated artifact CI, Pages deployment and deployed browser proof remain distinct layers.

---

## 8. Operational and security state

### Content Freshness

- issue #78 — closed/completed;
- latest controlled report — 0 findings/errors/warnings;
- PR runs create evidence without issue mutation;
- Draft repository activity is recorded without promoting project status.

### Dependencies

```text
0 critical
0 high
6 moderate
```

All six moderate records reduce to build-time `markdown-it@13.0.2` / Diplodoc compatibility. Issue #82 remains open. Next planned review: **2026-08-17**. Do not use `npm audit fix --force`, local `node_modules` shims or an unreviewed fork.

### Search-engine diagnostics

- repository favicon defect — fixed and deployed;
- Sitemap — available and declared by `robots.txt`, external Webmaster usage state pending;
- HTTPS — canonical production contract, external main-mirror refresh may lag;
- region — intentionally “No region”;
- Metrica/Business — accepted non-goals.

---

## 9. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B accepted / принят as latest public recognition slice;
- M7.8C remains pending Draft until exact-head automation and the same real-plan owner retest;
- do not update public completion state before explicit owner acceptance.

### VillAIgence

```text
M11 Phase A: PR #103 — 28 scenarios + 7 GameTests
M11 Phase B: PR #104 — exact production-JAR startup/restart
lifecycle:                    release-candidate
public label:                 ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence remain separate from real-provider/gameplay/manual cumulative acceptance.

### Publications and Photo Stories

- Publications contains only completed, externally verifiable work;
- first genuine Photo Story requires authentic material and confirmed chronology;
- fake/demo albums remain prohibited.

---

## 10. Current gate and next decisions

The repository-side Yandex favicon gate is closed. There is no active resume, external-profile or freshness feature gate.

Immediate operating priorities:

1. complete the authenticated Yandex Webmaster actions in issue #111 and wait for recrawl/diagnostic refresh;
2. preserve exact production, favicon, resume and all-verified distribution snapshots;
3. review dependency issue #82 on or after **2026-08-17**;
4. reconcile Vlezet only after M7.8C owner acceptance;
5. promote VillAIgence only after cumulative manual/provider/gameplay acceptance;
6. draw analytics conclusions only after 3–4 weeks of meaningful aggregate Cloudflare traffic;
7. create a genuine Photo Story only after authentic material exists;
8. accept concrete owner-proposed product/content ideas that preserve static-first architecture.

P2.5d public share UI remains conditional on a concrete user-facing need. Do not fabricate urgency or add generic share buttons merely because a registry exists.

---

## 11. Invariants

- static-first;
- build-time intelligence;
- progressive enhancement;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc as sole site-wide search owner;
- no automatic public truth, profile or search-engine mutation;
- bounded Evidence semantics;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking without privacy review;
- exact artifact → installed/deployed acceptance remains explicit;
- generated artifact, deployment and browser proof remain distinct;
- dependency evidence never authorizes an unverified fix;
- Draft evidence is not accepted evidence;
- PDF structural validity is not semantic PDF extraction;
- search-engine diagnosis refresh is not implied by a green production check;
- no weakening quality gates for speed.

---

## 12. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits and exact-head CI. Confirm PR #112 squash `18358a4939dc4062669dbcb45850e9beb26e1cac` was deployed by Pages #142 and verified by deployment-driven Production Live Smoke #45; root favicon is HTTP 200 SVG and both homepage/Resume resolve `/favicon.svg` exactly; issue #111 remains open only for authenticated Yandex Webmaster actions; PR #110 is the latest resume/PDF layout baseline; issue #82 remains the markdown-it/Diplodoc blocker; profile snapshot is `4 verified / 0 stale`; Vlezet M7.8B remains accepted while M7.8C is pending Draft; VillAIgence automation remains separate from cumulative acceptance.
