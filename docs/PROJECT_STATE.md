# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.2 TrueRuslan Landing flagship и verifier hotfix PR #120.
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

**Portfolio 1.0 P3.2 — TrueRuslan Landing flagship case study**.

### Feature PR #119

```text
feature PR:                     #119 — MERGED
exact feature head:             6736c9fd917f213621e5e88273304dda8ddda760
accepted feature squash:        d11aeddeed492dce512e123d216e0191a5906ca9
RED Build:                      30993547130 — expected FAILURE
final feature Build:            #868 / 30998184982 — SUCCESS
CodeQL:                         #340 — SUCCESS
Dependency Review:              #296 — SUCCESS
unit tests:                     368 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/RU-EN/analytics:         PASS
metadata/Engineering Map:       PASS
visual regression:              PASS
custom-domain artifact:         PASS
quality artifact:               8927189167
quality digest:                 sha256:9bd264d534ba31f51669d6701319cb2b4671574e329d7e36f9047bb48affc997
review threads:                 0 open
```

PR #119 published the feature successfully. The first deployment-only platform verifier then exposed a verifier defect: broad `locator('main')` matched both the Diplodoc layout main and document main. The page, deployment and baseline production smoke were healthy.

### Verifier hotfix PR #120

```text
hotfix PR:                      #120 — MERGED
exact hotfix head:              c2fa3327061148b5e4adf703bd707d6925639df3
accepted hotfix squash:         dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
CodeQL:                         #342 — SUCCESS
Dependency Review:              #297 — SUCCESS
PR-safe Production Live Smoke:  #79 — SUCCESS
visual regression:              PASS with unchanged baselines
quality artifact:               8927499611
quality digest:                 sha256:3d2d22594d5f270edecb5e00b418efa7ca2bf6ff7ba81563804e32a3ff3168a2
review threads:                 0 open
```

### Exact production proof

```text
accepted deployed SHA:          dcb278cb4f52d5e8afc314a9f30689edb5153af0
Pages deployment ID:            5760275658
Pages state:                    SUCCESS
Pages created:                  2026-08-05T10:54:59Z
Pages updated:                  2026-08-05T10:55:37Z
Production Live Smoke:          #80 / 30999331791 — SUCCESS
baseline production smoke:      PASS
portfolio platform RU/EN smoke: PASS
favicon smoke:                  PASS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Exact artifact и deployed production остаются отдельными acceptance layers.

---

## 3. Portfolio 1.0 P3.1 — DONE

PR #117 сделал homepage evidence-first professional entry point:

- три primary paths: Resume, Projects, Materials;
- bounded evidence из `data/projects.json` и `data/project-evidence.json`;
- public homepage flagships: VillAIgence, Vlezet, Engineering Portfolio Platform;
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

Accepted case-study contract:

1. problem and audience;
2. constraints and risks;
3. accepted production boundary;
4. static-first architecture and canonical sources;
5. build-time generators and post-processing;
6. rejected alternatives;
7. clean URL and GitHub Pages limitations;
8. CI, artifact, deployment and live evidence separation;
9. known limitations;
10. next milestone and related content.

Delivered:

- RU/EN pages and hreflang pairing;
- dedicated homepage and Projects-hub links;
- canonical metadata, Sitemap, search and OpenGraph integration;
- platform Project History and Project Evidence;
- controlled flagship/evidence set expanded to four projects;
- PR-safe baseline live smoke separated from deployment-only feature verification;
- deployment-only checks for homepage link, RU/EN canonical routes, alternates, evidence, timeline, search and favicon;
- Projects hub desktop/mobile visual baselines reviewed and accepted;
- CodeQL comments resolved through an exact repository-link contract.

The verifier must target `main.dc-doc-page__content`; broad `locator('main')` is permanently prohibited by regression coverage.

---

## 5. Clean URL contract — DONE

PR #114 moved public content to repository-native directory URLs without Cloudflare routing.

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
```

Public examples:

```text
/
/landing/resume/
/landing/projects/
/landing/projects/portfolio-platform/
/landing/notes/
/en/
/en/projects/portfolio-platform/
/_search/ru/
```

Canonical, hreflang, OpenGraph, Sitemap, Atom feed and rendered search links use clean routes. Legacy `.html` remains only as static `noindex,follow` compatibility preserving query and fragment. GitHub Pages cannot emit repository-defined HTTP 301 redirects.

PR #115 aligned canonical and legacy production verification:

```text
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
```

---

## 6. Search-engine operational state

Repository contracts are complete:

- HTTPS canonical domain;
- clean public URLs;
- `sitemap.xml` and `robots.txt`;
- root `/favicon.svg`;
- no public `.html` identities in Sitemap or Atom feed.

Issue #111 remains open only for authenticated Yandex Webmaster operator state and delayed crawler observation:

- confirm/resubmit Sitemap in the HTTPS property;
- confirm HTTP→HTTPS/main mirror state;
- select “No region”;
- submit representative clean routes for recrawl;
- recheck diagnostics and indexed URL replacement after 10–14 days.

Google Search Console and Yandex Webmaster recrawl may accelerate observation, but a green deployment does not imply immediate index replacement.

---

## 7. Resume, distribution and favicon baselines

### Resume

PR #110 remains the current PDF/timeline baseline.

```text
squash:                         4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                          #765 — SUCCESS
Production Live Smoke:          #37 — SUCCESS
```

Web-CV is semantically checked. PDF is structurally/passively checked; compressed semantics are not guessed from raw bytes.

### Distribution

```text
verified:                       4
stale:                          0
unverified:                     0
```

GitHub, Habr, Telegram personal and Telegram Blog are verified. Distribution readiness is not an engagement claim.

### Favicon

PR #112 established root `/favicon.svg`. Production Live Smoke #80 reconfirmed the deployed favicon after P3.2.

---

## 8. External project boundaries

### Vlezet

- lifecycle: `pre-production`;
- M7.8B remains accepted;
- M7.8C remains pending exact-head automation plus the same real-plan owner retest;
- Draft evidence must not promote public status.

### VillAIgence

```text
M11 Phase A:                   PR #103 — 28 scenarios + 7 GameTests
M11 Phase B:                   PR #104 — exact production-JAR startup/restart
lifecycle:                     release-candidate
public label:                  ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence remain separate from real-provider, gameplay and cumulative manual acceptance.

### Publications and Photo Stories

- Publications contains only completed, externally verifiable work;
- genuine Photo Stories require authentic material, chronology, captions and alt text;
- fake/demo albums remain prohibited.

---

## 9. Operational and security state

### Content Freshness

- issue #78 — closed/completed;
- controlled report — 0 findings/errors/warnings;
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

## 10. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

Next slice:

**P3.3 — Flagship normalization**.

Normalize VillAIgence and Vlezet to the accepted evidence-first ordering without changing their lifecycle or acceptance status:

1. problem/user;
2. constraints;
3. accepted boundary;
4. architecture/source of truth;
5. rejected alternatives;
6. implemented capabilities;
7. evidence;
8. limitations;
9. next accepted milestone;
10. related content.

Do not promote:

- VillAIgence beyond `ACCEPTANCE IN PROGRESS` without cumulative manual acceptance;
- Vlezet M7.8C before exact-head automation plus the same real-plan owner retest.

---

## 11. Current priorities

1. preserve P3.1/P3.2 production acceptance and clean URL contracts;
2. implement P3.3 flagship normalization;
3. complete Google/Yandex recrawl actions and observe index replacement;
4. publish grounded Engineering Notes from completed work;
5. review issue #82 on or after 2026-08-17;
6. draw analytics conclusions only after 3–4 weeks of meaningful aggregate traffic.

---

## 12. Invariants

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
- dependency evidence never authorizes an unverified fix;
- PDF structural validity is not semantic PDF extraction;
- search-engine diagnosis refresh is not implied by a green production check;
- no quality-gate weakening.

---

## 13. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits, exact-head CI, latest Pages deployment and Production Live Smoke. Confirm PR #119 squash `d11aeddeed492dce512e123d216e0191a5906ca9` delivered P3.2; PR #120 squash `dcb278cb4f52d5e8afc314a9f30689edb5153af0` fixed deployment verification; Build #869 and Production Live Smoke #80 passed; Pages deployment ID `5760275658` published the exact accepted SHA; PR #114/#115 remain the clean URL baseline; issue #111 is external search-console observation only; issue #82 remains the Diplodoc/markdown-it blocker; Vlezet M7.8B remains accepted while M7.8C is pending; VillAIgence PR #103/#104 automation remains separate from cumulative manual acceptance; continue with P3.3 Flagship normalization.
