# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4A Deployment Verification Note и verifier closure PR #126.
>
> Durable snapshot: что представляет собой проект, что принято, чем это доказано, какие границы остаются и что делать дальше.

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`;
5. `docs/CUSTOM_DOMAIN.md`;
6. `docs/DISTRIBUTION.md`.

После чтения отдельно проверять actual open PR, latest commits, exact-head CI, latest `github-pages` deployment, Production Live Smoke, Cloudflare aggregate telemetry и external-project acceptance. Repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Платформа объединяет:

- standalone RU/EN homepage;
- Diplodoc knowledge pages;
- RU/EN web-CV и downloadable PDF resume;
- evidence-backed flagship case studies;
- `/now`;
- Engineering Notes + Atom feed;
- Publications;
- Engineering Map;
- site-wide generated search;
- Photo Stories foundation;
- Sources Knowledge Base;
- Project Evidence и Content Freshness;
- privacy-friendly Cloudflare Web Analytics;
- exact-head CI, GitHub Pages deployment и production browser verification.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth, external profiles и search-engine state не изменяются автоматически.

---

## 2. Latest accepted product truth

Последний принятый user-facing milestone:

**Portfolio 1.0 P3.4A — Deployment success is not production verification**.

Production route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Note разделяет:

1. repository readiness;
2. generated artifact;
3. exact GitHub Pages deployment;
4. Production Live Smoke;
5. bounded product acceptance;
6. search-engine observation.

Она основана на принятом P3.2 verifier incident PR #119/#120 и exact P3.3 repository/artifact/deployment evidence. В тексте явно разделены **Проверенный факт**, **Инженерный вывод** и **Ограничение**.

### Feature PR #125

```text
feature PR:                     #125 — MERGED
TDD RED head:                   688b98a58937dbf9b5c9f45667d4cfdef1327294
RED Build:                      #909 / 31013712895 — expected FAILURE
RED existing/new contracts:     377 PASS / 3 expected FAIL
exact accepted head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
accepted squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
final Build:                    #922 / 31014792446 — SUCCESS
CodeQL:                         #400 / 31014793568 — SUCCESS
Dependency Review:              #350 — SUCCESS
PR-safe Production Live Smoke:  #106 — SUCCESS
unit tests:                     381 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/Axe/Lighthouse:         PASS
Firefox/WebKit:                 PASS
generated search:               PASS
Atom feed:                      PASS
RU/EN/analytics/metadata:       PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
review threads:                 0 open
```

### First production attempt — verifier defect

The exact P3.4A SHA was published, baseline and platform smokes passed, but Production Live Smoke #108 stopped before the new Note smoke because the older flagship verifier still required historical VillAIgence candidate `0.1.23+1.21.1`.

```text
accepted deployed SHA:          c4f3cb5a3aa71b958d906d15eb975833b46d3571
Pages deployment ID:            5763499690
Production Live Smoke:          #108 / 31015504931 — FAILURE
classification:                 verifier defect
failure:                        stale hard-coded external evidence
production artifact:            8934310334
production digest:              sha256:42d038cd35f0281d9c69c472b6111aab06a62bc98c88b7876fafcf7601979d13
```

A successful deployment did not become acceptance merely because the page was live. The failure was investigated and fixed rather than hidden with a rerun.

### Verifier closure PR #126

PR #126 removed duplicated volatile release evidence from `production-flagship-normalization-smoke.cjs`. The verifier now derives `Current published candidate` from canonical `data/project-evidence.json` and checks current bounded VillAIgence/Vlezet markers.

```text
hotfix PR:                      #126 — MERGED
TDD RED head:                   43ccee7b09220000660e425ea32cc87938a7b653
RED Build:                      #924 / 31015797096 — expected FAILURE
RED existing/new contracts:     381 PASS / 2 expected FAIL
exact accepted head:            50a7185d799eea96adb7dcea8cd20e9e9a400784
accepted squash:                0a1cd6ad40870366fecfdce3bbdae7e8722b2119
final Build:                    #927 / 31016127657 — SUCCESS
CodeQL:                         #406 / 31016129663 — SUCCESS
Dependency Review:              #355 — SUCCESS
PR-safe Production Live Smoke:  #112 — SUCCESS
quality artifact:               8934699715
quality digest:                 sha256:607a2d901e77ebe5862fd760393f6a4435699dd69d1dc8abb910007fc0611b52
review threads:                 0 open
```

### Exact production acceptance

```text
Pages workflow:                 #156 / 31016942589 — SUCCESS
accepted deployed SHA:          0a1cd6ad40870366fecfdce3bbdae7e8722b2119
Pages deployment ID:            5763802525
Pages created:                  2026-08-05T14:46:57Z
Pages updated:                  2026-08-05T14:47:51Z
Production Live Smoke:          #114 / 31017023851 — SUCCESS
baseline production smoke:      PASS
portfolio platform smoke:       PASS
current flagship smoke:         PASS
P3.4A Note smoke:               PASS
favicon smoke:                  PASS
production artifact:            8935003712
production digest:              sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480
```

P3.4A is accepted only at this final exact deployed SHA.

---

## 3. Portfolio 1.0 P3.1 — DONE

PR #117 сделал homepage evidence-first professional entry point:

- primary paths Resume, Projects и Materials;
- bounded evidence из canonical registries;
- public homepage flagships VillAIgence, Vlezet и Engineering Portfolio Platform;
- private NODE ZERO исключён fail-closed;
- current `/now` context;
- bounded RU/EN hierarchy.

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

---

## 4. Portfolio 1.0 P3.2 — DONE

Dedicated production routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

PR #119 создал RU/EN evidence-first platform case study. PR #120 исправил deployment verifier и закрепил `main.dc-doc-page__content` как document selector.

```text
PR #119 head:                  6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
PR #120 head:                  c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
Pages deployment ID:            5760275658
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

---

## 5. Portfolio 1.0 P3.3 — DONE

Normalized routes:

```text
/landing/projects/livingworld/
/landing/projects/vlezet/
/en/projects/livingworld/
```

PR #122 normalized the three surfaces to one evidence-first order without broadening lifecycle or acceptance claims.

```text
TDD RED head:                  f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
exact accepted head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
accepted squash:                c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

### Current external evidence reconciliation

PR #124 synchronized public evidence after new VillAIgence and Vlezet repository activity without changing accepted lifecycle boundaries.

```text
PR #124 head:                  fe82754eb6f181e9c81840e7710553bf8341a3d9
PR #124 squash:                adad07f39130c724541163022be0b085323ce1b3
Build:                          #908 / 31011725079 — SUCCESS
Content Freshness PR evidence:  0 findings
```

Current bounded state:

### Vlezet

- lifecycle: `pre-production`;
- public label: `ACTIVE DEVELOPMENT`;
- accepted recognition slice: M7.8B;
- PR #42 remains pending M7.8C product-owner retest;
- PR #44 and PR #45 remain stacked Draft evidence;
- green CI or benchmark evidence does not replace representative real-plan owner acceptance.

### VillAIgence

```text
current published candidate:   0.1.25+1.21.1
M11 Phase A:                   PR #103 — 28 scenarios + 7 GameTests
M11 Phase B:                   PR #104 — exact production-JAR startup/restart
provider boundary:             PR #108 — deterministic literal-loopback Chat/STT/TTS
M11 Phase C:                   PR #110 — Draft/RED shared deadline contract
lifecycle:                     release-candidate
public label:                  ACCEPTANCE IN PROGRESS
```

Exact release publication and automated provider-client evidence remain separate from real-provider, physical Voice Chat, multiplayer, focused gameplay and cumulative product-owner acceptance.

---

## 6. Clean URL contract — DONE

PR #114 moved public content to repository-native directory URLs without Cloudflare routing.

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
```

Public examples:

```text
/
/landing/resume/
/landing/projects/
/landing/projects/livingworld/
/landing/projects/vlezet/
/landing/projects/portfolio-platform/
/landing/notes/
/en/
/_search/ru/
```

Canonical, hreflang, OpenGraph, Sitemap, Atom feed and rendered search links use clean routes. Legacy `.html` remains only as static `noindex,follow` compatibility preserving query and fragment.

---

## 7. Search-engine operational state

Repository contracts are complete: HTTPS canonical domain, clean public URLs, Sitemap, robots, favicon and no public `.html` identities in Sitemap/feed.

Issue #111 remains open only for authenticated Yandex Webmaster operator state and delayed crawler observation:

- confirm/resubmit Sitemap;
- confirm HTTP→HTTPS/main mirror;
- select “No region”;
- submit representative clean routes for recrawl;
- recheck diagnostics and indexed URL replacement after 10–14 days.

A green deployment does not imply immediate Google/Yandex index replacement.

---

## 8. Operational and security state

### Content Freshness

- PR #124 exact-head Content Freshness evidence reported 0 findings;
- issue #78 is still open with its older generated report because a default-branch owner run has not yet refreshed/closed it;
- issue state must not be treated as current canonical product truth until that owner run occurs;
- Draft repository activity is recorded without public promotion.

### Dependencies

```text
0 critical
0 high
6 moderate
```

All six moderate records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Issue #82 remains open. Review on or after **2026-08-17**.

Do not use `npm audit fix --force`, local shims, an unreviewed fork or a parser update that breaks Diplodoc internals.

---

## 9. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

P3.4A is complete. Continue with:

**P3.4B — Clean URLs without Cloudflare routing**.

The Note should explain:

- why repository-native directory output was selected;
- why Cloudflare remained DNS/CDN/analytics infrastructure rather than an application router;
- how canonical, hreflang, OpenGraph, Sitemap, Atom feed and generated search migrated together;
- why GitHub Pages cannot provide repository-configured HTTP 301 responses;
- why legacy `.html` compatibility remains `noindex,follow` until crawler replacement is observed;
- which facts are verified locally/production and which remain delayed search-engine observation.

Acceptance criteria remain:

- verified fact, inference and limitation are explicit;
- relevant case study and evidence are linked;
- Notes Registry, clean route, generated search and Atom feed are deterministic;
- semantic/no-JS content remains complete;
- exact-head and exact-deployment production matrices pass;
- no invented traffic or indexing claim.

---

## 10. Current priorities

1. preserve P3.1–P3.4A production acceptance and exact deployment contracts;
2. implement P3.4B Clean URLs without Cloudflare routing;
3. refresh issue #78 through a default-branch Content Freshness owner run;
4. complete Google/Yandex recrawl actions and observe index replacement;
5. review issue #82 on or after 2026-08-17;
6. draw analytics conclusions only after 3–4 weeks of meaningful aggregate traffic.

---

## 11. Invariants

- static-first;
- build-time intelligence;
- progressive enhancement;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc as sole site-wide search owner;
- repository-native clean public URLs;
- legacy `.html` only as compatibility entrypoints;
- no automatic public truth, profile or search-engine mutation;
- bounded Evidence semantics;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking without privacy review;
- generated artifact, deployment and browser proof remain distinct;
- exact artifact and installed acceptance remain separate release gates;
- Draft evidence is not accepted evidence;
- volatile external evidence must be derived from canonical registries rather than copied into verifiers;
- dependency evidence never authorizes an unverified fix;
- PDF structural validity is not semantic PDF extraction;
- search-engine diagnosis refresh is not implied by a green production check;
- no quality-gate weakening.

---

## 12. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits, exact-head CI, latest Pages deployment and Production Live Smoke. Confirm PR #125 head `9c0a24c6adfd1794adc70facdc1ace4dc01a3d86` and squash `c4f3cb5a3aa71b958d906d15eb975833b46d3571` delivered P3.4A; the first Production Live Smoke #108 failed because of a stale flagship verifier; PR #126 head `50a7185d799eea96adb7dcea8cd20e9e9a400784` and squash `0a1cd6ad40870366fecfdce3bbdae7e8722b2119` fixed it by deriving current evidence from `data/project-evidence.json`; Build #927, Pages #156 and Production Live Smoke #114 passed; Pages deployment ID `5763802525` published the exact accepted SHA; production artifact `8935003712` has digest `sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480`; issue #111 remains external search-console observation; issue #82 remains the Diplodoc/markdown-it blocker; issue #78 still needs a default-branch owner refresh; continue with P3.4B Clean URLs without Cloudflare routing.
