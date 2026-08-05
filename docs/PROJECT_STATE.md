# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4B Clean URLs Note.
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

Платформа объединяет standalone RU/EN homepage, Diplodoc knowledge pages, web-CV и PDF resume, evidence-backed case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, generated search, Photo Stories, Sources Knowledge Base, Project Evidence, Content Freshness, privacy-friendly analytics и exact-deployment production verification.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth, external profiles и search-engine state не изменяются автоматически.

---

## 2. Latest accepted product truth

Последний принятый user-facing milestone:

**Portfolio 1.0 P3.4B — Clean URLs without Cloudflare routing**.

Production route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

Note объясняет repository-native directory URLs, Diplodoc depth/base migration, единый canonical/hreflang/OpenGraph/Sitemap/Atom/search identity contract и границы static legacy compatibility. Cloudflare остаётся DNS/CDN/analytics infrastructure, но не application router.

### Feature PR #128

```text
feature PR:                     #128 — MERGED
TDD RED head:                   4d14dd6842423a17f12d8cb2734df36cdb162b41
RED Build:                      #934 / 31020006933 — expected FAILURE
RED existing/new contracts:     384 PASS / 3 expected FAIL
exact accepted head:            dd1911ebbc5faf66a56144c75dd45215b4042293
accepted squash:                4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb
final Build:                    #945 / 31021101326 — SUCCESS
CodeQL:                         #426 / 31021101539 — SUCCESS
Dependency Review:              #373 — SUCCESS
Distribution Readiness:         #60 — SUCCESS
PR-safe Production Live Smoke:  #122 — SUCCESS
unit tests:                     388 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/Axe/Lighthouse:         PASS
Firefox/WebKit:                 PASS
generated search:               PASS
Atom feed:                      PASS
RU/EN/analytics/metadata:       PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
quality artifact:               8936766318
quality digest:                 sha256:38d1a612b9e684a2faccf71f889217933b115434391a5e60a5baff49b746178d
review threads:                 0 open
```

### Exact production acceptance

```text
accepted deployed SHA:          4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb
Pages deployment ID:            5764711503
Pages created:                  2026-08-05T15:42:35Z
Pages updated:                  2026-08-05T15:43:15Z
Production Live Smoke:          #123 / 31021657939 — SUCCESS
baseline production smoke:      PASS
portfolio platform smoke:       PASS
current flagship smoke:         PASS
P3.4A Note smoke:               PASS
P3.4B Clean URLs Note smoke:    PASS
favicon smoke:                  PASS
production artifact:            8936914548
production digest:              sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51
```

P3.4B production smoke проверил route, canonical/OpenGraph, content markers, legacy `.html`, query and fragment preservation, Atom feed и generated search на exact deployed SHA.

Граница утверждений:

- repository-native directory URLs приняты и работают без Cloudflare routing;
- GitHub Pages compatibility page не является HTTP 301;
- search-engine observation остаётся внешним delayed fact;
- удаление legacy `.html` не разрешено до наблюдаемой index migration.

---

## 3. Portfolio 1.0 P3.1 — DONE

**P3.1 — Homepage evidence paths** доставлен PR #117.

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

Приняты explicit Resume/Projects/Materials paths, bounded registry evidence, public-only flagship set, `/now` и bounded RU/EN hierarchy.

---

## 4. Portfolio 1.0 P3.2 — DONE

**P3.2 — TrueRuslan Landing flagship**:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

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

Deployment verifier использует scoped `main.dc-doc-page__content`.

---

## 5. Portfolio 1.0 P3.3 — DONE

**P3.3 — Flagship normalization**:

```text
/landing/projects/livingworld/
/landing/projects/vlezet/
/en/projects/livingworld/
```

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

### Current external boundaries

Vlezet:

- lifecycle `pre-production` / `ACTIVE DEVELOPMENT`;
- M7.8B accepted;
- M7.8C PR #42 и stacked PR #44/#45 остаются Draft/pending representative real-plan owner gates.

VillAIgence:

- lifecycle `release-candidate` / `ACCEPTANCE IN PROGRESS`;
- current candidate `0.1.25+1.21.1`;
- PR #103 Phase A, PR #104 exact production-JAR startup/restart и PR #108 deterministic provider boundary — bounded automated evidence;
- PR #110 Phase C остаётся Draft/RED;
- real-provider, physical Voice Chat, multiplayer, gameplay и cumulative owner acceptance остаются отдельными gates.

---

## 6. Portfolio 1.0 P3.4A — DONE

**P3.4A — Deployment success is not production verification**:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
```

Первый exact deployment не был принят:

```text
Production Live Smoke #108:    FAILURE
classification:                 verifier defect
cause:                          stale hard-coded external evidence
```

PR #126 исправил verifier через canonical `data/project-evidence.json`.

```text
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

---

## 7. Clean URL contract — DONE

PR #114 перенёс public content на repository-native directory URLs без Cloudflare routing; PR #115 синхронизировал production verifier.

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
```

Примеры:

```text
/
/landing/resume/
/landing/projects/
/landing/notes/
/en/
/_search/ru/
```

Canonical, hreflang, OpenGraph, Sitemap, Atom feed и rendered search links используют clean routes. Legacy `.html` остаётся static `noindex,follow` compatibility preserving query and fragment.

---

## 8. Operational state

### Search engines

Issue #111 остаётся только для authenticated Yandex Webmaster actions и delayed crawler observation. Green deployment не означает немедленную замену URL в Google/Yandex.

### Content Freshness

PR #124 exact-head evidence сообщил 0 findings, но issue #78 остаётся open со старым generated report до default-branch owner run. Issue body не является текущей canonical truth.

### Dependencies

```text
0 critical
0 high
6 moderate
```

Все шесть moderate records относятся к build-time `markdown-it@13.0.2` через Diplodoc compatibility. Issue #82 остаётся open; review on or after **2026-08-17**. Не использовать `npm audit fix --force`, local shims или unreviewed fork.

---

## 9. Approved next product slice

Portfolio 1.0 остаётся **IN PROGRESS**.

Следующий bounded slice:

**P3.4C — Hybrid CV + AI recognition boundaries**.

Note должна быть основана на accepted Vlezet evidence и объяснить:

- deterministic geometry как authoritative product state;
- CV/LLM output как proposal, а не mutation;
- immutable candidate identity и current-state revalidation;
- explicit Apply;
- M7.8B accepted против M7.8C Draft/owner retest;
- почему benchmark, browser checks и green CI не заменяют representative real-plan product acceptance;
- границы PR #42/#44/#45 без promotion Draft work.

---

## 10. Invariants

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
- generated artifact, deployment and browser proof remain distinct;
- exact artifact и installed acceptance remain separate release gates;
- Draft evidence is not accepted evidence;
- no quality-gate weakening.

## 11. New-session handoff

> Open durable state and Portfolio 1.0 specification. Confirm PR #128 RED head `4d14dd6842423a17f12d8cb2734df36cdb162b41`, exact head `dd1911ebbc5faf66a56144c75dd45215b4042293` and squash `4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb`; Build #945 and Production Live Smoke #123 passed; Pages deployment ID `5764711503` published the exact SHA; production artifact `8936914548` has digest `sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51`. Preserve issue #111, issue #82 and issue #78 boundaries. Continue with P3.4C Hybrid CV + AI recognition boundaries.
