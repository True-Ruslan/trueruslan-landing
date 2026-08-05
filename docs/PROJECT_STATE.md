# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.1 Homepage evidence paths.
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
- evidence-backed case studies;
- `/now`;
- Engineering Notes + Atom feed;
- Publications;
- Engineering Map;
- site-wide full-text search;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence и Content Freshness;
- privacy-friendly Cloudflare Web Analytics;
- exact-head CI, Pages deployment и production browser verification.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth, external profiles и search-engine state не изменяются автоматически.

---

## 2. Latest accepted product truth

Последний принятый user-facing milestone:

**Portfolio 1.0 P3.1 — Homepage evidence paths**, PR #117.

```text
feature PR:                     #117 — MERGED
exact PR head:                  67d3f6593c45d1239630f71be6a3cb15a33f4519
accepted squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
RED Build:                      #827 / 30987736270 — expected FAILURE
final Build:                    #836 / 30989449993 — SUCCESS
CodeQL:                         #306 / 30989449931 — SUCCESS
Dependency Review:              #264 / 30989449930 — SUCCESS
unit tests:                     360 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/VillAIgence search:      PASS
RU/EN/analytics/metadata:       PASS
Engineering Map:                PASS
visual regression:              PASS
custom-domain artifact:         PASS
review threads:                 0 open
quality artifact:               8923559602
quality digest:                 sha256:429dadb1b84c59e73e9a977e296422084e754f235eaeb538b866d749ea43c64e
```

Exact post-merge production proof:

```text
Pages workflow:                 #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
deployed SHA:                   fe1a796df37313401c07e25c0672dc32db30a1c4
```

Production Live Smoke resolved the exact successful Pages deployment and passed the deployed homepage, clean URL, search, feed, favicon and browser/request-error contracts.

---

## 3. Portfolio 1.0 P3.1 — DONE

The homepage is now an evidence-first professional entry point.

### Accepted hierarchy

1. identity and specialization;
2. three explicit one-action paths:
   - Resume;
   - Projects;
   - Engineering Notes / Publications;
3. three bounded current evidence signals;
4. three public flagship projects;
5. current `/now` context;
6. Publications and secondary platform surfaces.

### Canonical data boundaries

Homepage project and evidence claims come from:

- `data/projects.json`;
- `data/project-evidence.json`.

The stable homepage flagship set is intentionally explicit:

- VillAIgence;
- Vlezet;
- Engineering Portfolio Platform.

Private NODE ZERO is excluded fail-closed. The homepage does not infer public eligibility from visibility alone; a flagship must remain present, public, active and featured.

### Preserved acceptance boundaries

- VillAIgence `production-JAR startup + restart PASS` is automated installed evidence, not cumulative manual acceptance.
- Vlezet M7.8B remains the accepted recognition slice; M7.8C remains pending.
- Portfolio production status describes the deployed static platform, not audience growth or search-engine indexing.
- English content remains intentionally bounded; Russian-only destinations are labeled.

### Visual acceptance

Only the intentionally changed RU homepage baselines were updated:

- `home-desktop.png`;
- `home-mobile.png`.

All other visual baselines remained unchanged. Desktop/mobile screenshots were manually reviewed after accessibility, overflow and browser checks passed.

---

## 4. Clean URL contract — DONE

PR #114 moved public content to repository-native directory URLs without Cloudflare routing.

```text
feature PR:                     #114 — MERGED
exact head:                     8702afe63ad3dca3ad0c17da47409c1660e126ef
accepted squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
```

Public examples:

```text
/
/landing/resume/
/landing/projects/
/landing/notes/
/landing/publications/
/en/
/_search/ru/
```

Permanent contract:

- internal generated links use clean routes;
- canonical, hreflang, OpenGraph, Sitemap and Atom feed contain clean routes;
- public Sitemap/feed reject `.html` identities;
- search keeps stable internal IDs but returns clean public URLs;
- GitHub Pages subpath and custom-domain builds derive their base from generated canonical state;
- local/browser/production checks exercise canonical routes.

Legacy `.html` remains only as a static `noindex,follow` compatibility entrypoint preserving query and fragment. GitHub Pages cannot emit repository-defined HTTP 301 redirects; this is the accepted repository-only boundary.

PR #115 aligned Production Live Smoke with canonical clean routes:

```text
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
```

---

## 5. Search-engine operational state

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

Google Search Console and Yandex Webmaster recrawl may accelerate observation, but a green repository/deployment contract does not imply immediate index replacement.

Non-goals:

- Yandex Metrica without privacy review;
- Yandex Business without a real local-service requirement;
- artificial regional/commercial claims;
- runtime SEO service or automatic search-console mutation.

---

## 6. Resume, distribution and favicon baselines

### Resume

PR #110 remains the latest accepted PDF/timeline baseline.

```text
squash:                         4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                          #765 — SUCCESS
Production Live Smoke:          #37 — SUCCESS
```

RU/EN web-CV is semantically checked. PDF is structurally/passively checked; compressed PDF semantics are not guessed from raw bytes.

### Distribution

Controlled external-profile snapshot:

```text
verified:                       4
stale:                          0
unverified:                     0
```

GitHub, Habr, Telegram personal and Telegram Blog are verified. Distribution readiness is not an engagement claim.

### Favicon

PR #112 established root `/favicon.svg` and deployed crawler-stable links.

```text
squash:                         18358a4939dc4062669dbcb45850e9beb26e1cac
Production Live Smoke:          #45 — SUCCESS
```

Any remaining Yandex warning is external crawler/cache state unless reproduced against production.

---

## 7. External project boundaries

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

## 8. Operational and security state

### Content Freshness

- issue #78 — closed/completed;
- latest controlled report — 0 findings/errors/warnings;
- Draft repository activity is recorded without public promotion.

### Dependencies

```text
0 critical
0 high
6 moderate
```

All six moderate records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Issue #82 remains open. Review on or after **2026-08-17**.

Do not use:

- `npm audit fix --force`;
- local `node_modules` shims;
- an unreviewed fork;
- a parser update that breaks Diplodoc internal imports.

---

## 9. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

Next slice:

**P3.2 — TrueRuslan Landing flagship case study**.

It must create a dedicated evidence-first destination for the portfolio platform and cover:

1. product purpose and audience;
2. static-first architecture;
3. canonical registries and build-time intelligence;
4. clean URL migration and GitHub Pages constraints;
5. exact-head CI versus generated artifact versus Pages deployment versus Production Live Smoke;
6. rejected alternatives and known limitations;
7. related Engineering Notes, repository and evidence links.

The homepage platform flagship currently links to the Projects hub because the dedicated case study does not yet exist. P3.2 must replace that temporary destination.

---

## 10. Current priorities

1. preserve P3.1 production acceptance and clean URL contracts;
2. implement P3.2 TrueRuslan Landing flagship;
3. complete external Google/Yandex recrawl actions and observe index replacement;
4. normalize VillAIgence and Vlezet under the common case-study contract without changing their accepted states;
5. publish grounded Engineering Notes from completed work;
6. review issue #82 on or after 2026-08-17;
7. draw analytics conclusions only after 3–4 weeks of meaningful aggregate traffic.

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
- Draft evidence is not accepted evidence;
- dependency evidence never authorizes an unverified fix;
- PDF structural validity is not semantic PDF extraction;
- search-engine diagnosis refresh is not implied by a green production check;
- no quality-gate weakening.

---

## 12. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits, exact-head CI, latest Pages deployment and Production Live Smoke. Confirm PR #117 squash `fe1a796df37313401c07e25c0672dc32db30a1c4` is the accepted P3.1 homepage baseline; Build #836, Pages #147 and Production Live Smoke #58 passed; PR #114/#115 remain the clean URL baseline; issue #111 contains only authenticated search-console observation; issue #82 remains the Diplodoc/markdown-it blocker; Vlezet M7.8B remains accepted while M7.8C is pending; VillAIgence PR #103/#104 automation remains separate from cumulative manual acceptance; next product slice is P3.2 TrueRuslan Landing flagship.
