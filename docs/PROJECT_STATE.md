# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после repository-native clean URL migration в PR #114, исправления production verifier в PR #115 и утверждения следующего milestone Portfolio 1.0.
>
> Durable snapshot: что представляет собой проект, что принято, какие доказательства существуют, какие границы остаются и что делать дальше.

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

- standalone homepage;
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
- bounded RU/EN;
- privacy-friendly Cloudflare Web Analytics;
- production-oriented quality gates.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth, external profiles и search-engine state не изменяются автоматически.

---

## 2. Latest accepted product and repository truth

### Product milestone: repository-native clean URLs

Последний принятый user-facing milestone — PR #114 `feat: publish repository-native clean URLs`.

```text
feature PR:                     #114 — MERGED
exact PR head:                  8702afe63ad3dca3ad0c17da47409c1660e126ef
accepted product squash:        cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
CodeQL:                         #295 / 30962674018 — SUCCESS
Dependency Review:              #250 / 30962673979 — SUCCESS
Dependency Audit Evidence:      #57 / 30962673975 — SUCCESS
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Firefox/WebKit:                 PASS
search/VillAIgence search:      PASS
RU/EN/analytics/metadata:       PASS
Engineering Map:                PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
review threads:                 0 open
quality artifact:               8913565133
quality digest:                 sha256:8c3124ed00bf37e1243460cd204ac840084555b101b3f12146832b40effaa7ed
```

Accepted public route examples:

```text
/
/landing/resume/
/landing/projects/
/landing/notes/
/landing/publications/
/landing/photos/
/en/
/_search/ru/
```

### Operational closure: clean-route production smoke

PR #115 fixed an outdated post-deployment assertion that still expected a legacy `.html` route after the site correctly resolved to the directory URL.

```text
operational PR:                 #115 — MERGED
exact head:                     d28b05afd23f05e997d28e9015f3eab4f0a3be5e
master squash:                  4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Build:                          #825 / 30983923977 — SUCCESS
Production Live Smoke #52:      30983923979 — SUCCESS
CodeQL:                         #293 / 30983924043 — SUCCESS
Dependency Review:              #253 / 30983923991 — SUCCESS
review threads:                 0 open
```

Production Live Smoke #52 validated the current deployed clean-route behavior before merge. PR #115 changed verification contracts, not the public content model.

---

## 3. Clean URL contract — DONE

PR #114 moved public pages from `*.html` identities to repository-native directory routes backed by `index.html`.

Permanent contract:

- `/` remains the homepage;
- generated content is served as `/path/`;
- internal links use clean directory routes;
- canonical, hreflang, OpenGraph, Sitemap and Atom feed contain clean routes;
- public Sitemap and feed reject `.html` identities;
- Diplodoc router pathname, depth and base are aligned with directory routes;
- internal Lunr/Diplodoc search IDs remain stable while rendered result links are clean;
- GitHub Pages subpath and custom-domain builds derive their active base from generated canonical state;
- sibling projects on the same `github.io` origin are not rewritten;
- local development and all browser-quality checks exercise canonical routes.

Legacy `.html` entrypoints remain only as compatibility pages with:

- `noindex,follow`;
- clean canonical metadata;
- meta refresh;
- `location.replace` preserving query and fragment.

GitHub Pages cannot emit repository-configured HTTP 301 redirects. The static compatibility page is therefore the accepted repository-only migration boundary. Cloudflare Rewrite Rules or Workers are not required.

PR #115 permanently separates:

1. canonical clean-route verification;
2. explicit legacy `.html` compatibility verification.

---

## 4. Search-engine operational state

The repository publishes:

- `https://trueruslan.ru/sitemap.xml`;
- canonical HTTPS metadata;
- clean URLs;
- `robots.txt` with Sitemap declaration;
- root `/favicon.svg`;
- no public `.html` identities in Sitemap or Atom feed.

Issue #111 remains open only for authenticated Yandex Webmaster operator state and delayed crawler observation:

- confirm or resubmit the Sitemap in the HTTPS property;
- confirm HTTP→HTTPS/main mirror state;
- select “No region”;
- submit key clean routes for recrawl;
- recheck diagnostics after 10–14 days.

Google Search Console and Yandex Webmaster recrawl requests may accelerate observation, but repository correctness does not imply immediate index replacement.

Explicit non-goals remain:

- Yandex Metrica without a separate privacy decision;
- Yandex Business without a real local-service requirement;
- artificial regional or commercial claims;
- runtime SEO service or automatic search-console mutation.

---

## 5. Yandex favicon reconciliation — DONE in repository

PR #112 established a crawler-stable root favicon contract.

```text
feature PR:                     #112 — MERGED
accepted squash:                18358a4939dc4062669dbcb45850e9beb26e1cac
Build:                          #778 / 30953202266 — SUCCESS
source Pages:                   #142 / 30953599246 — SUCCESS
Production Live Smoke:          #45 / 30953667481 — SUCCESS
```

Deployed evidence:

```text
URL:                            https://trueruslan.ru/favicon.svg
HTTP:                           200
Content-Type:                   image/svg+xml
bytes:                          591
homepage/resume href:           /favicon.svg
```

Issue #111 must not be treated as evidence of a remaining favicon code defect. Any remaining warning is external crawler/cache state until reproduced against the deployed artifact.

---

## 6. Resume baseline — DONE

PR #108 synchronized the August 2026 professional profile. PR #110 published the latest user-managed PDF and aligned the timeline.

```text
latest resume PR:               #110 — MERGED
squash:                         4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                          #765 / 30942487224 — SUCCESS
source Pages:                   #141 / 30950087819 — SUCCESS
Production Live Smoke:          #37 / 30950157904 — SUCCESS
```

Permanent boundary:

- RU/EN web-CV and metadata receive semantic checks;
- PDF receives structural/passive checks;
- compressed PDF content is not guessed through raw-byte substring matching;
- semantic PDF extraction requires a reviewed parser;
- no metrics, leadership claims or proprietary implementation details are invented.

---

## 7. Distribution and external profiles — DONE

Controlled snapshot:

```text
profiles:                       4
verified:                       4
stale:                          0
unverified:                     0
```

Verified identities:

- GitHub profile;
- Habr profile;
- Telegram personal;
- Telegram Blog.

Distribution readiness is not an engagement claim. Any state change requires fresh rendered evidence.

---

## 8. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B remains the latest accepted recognition slice;
- M7.8C remains pending until exact-head automation and the same real-plan owner retest;
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
- a genuine Photo Story requires authentic material, chronology, captions and alt text;
- fake/demo albums remain prohibited.

---

## 9. Operational and security state

### Content Freshness

- issue #78 — closed/completed;
- latest controlled report — 0 findings/errors/warnings;
- PR runs create evidence without automatic issue mutation;
- Draft repository activity is recorded without public promotion.

### Dependencies

```text
0 critical
0 high
6 moderate
```

All six moderate records reduce to build-time `markdown-it@13.0.2` through Diplodoc compatibility. Issue #82 remains open. Next planned review: **2026-08-17**.

Do not use:

- `npm audit fix --force`;
- local `node_modules` shims;
- an unreviewed fork;
- a parser update that breaks Diplodoc internal imports.

A fix is accepted only after upstream compatibility and the complete exact-head matrix pass.

---

## 10. Approved next product milestone

The next approved milestone is:

**Portfolio 1.0 — Evidence-first flagship content**.

Approved specification:

`docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`

Goal:

- make Resume, flagship projects and engineering materials explicit primary paths;
- normalize VillAIgence, Vlezet and TrueRuslan Landing around one evidence-first case-study contract;
- strengthen related-content navigation;
- publish grounded Notes from completed engineering work;
- selectively expand the highest-value English pages.

Recommended first implementation slice:

**P3.1 — Homepage evidence paths**.

It has the highest user-facing value with the smallest architectural surface and establishes the hierarchy required by later flagship and content work.

---

## 11. Current priorities

1. preserve the accepted clean URL and production verifier contracts;
2. complete external Google/Yandex recrawl actions and observe index replacement;
3. implement P3.1 Homepage evidence paths;
4. add the TrueRuslan Landing flagship case study;
5. normalize VillAIgence and Vlezet without changing their acceptance states;
6. publish grounded Engineering Notes from completed work;
7. review issue #82 on or after 2026-08-17;
8. draw analytics conclusions only after 3–4 weeks of meaningful aggregate traffic.

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
- Draft evidence is not accepted evidence;
- dependency evidence never authorizes an unverified fix;
- PDF structural validity is not semantic PDF extraction;
- search-engine diagnosis refresh is not implied by a green production check;
- no quality-gate weakening.

---

## 13. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits, exact-head CI, latest Pages deployment and Production Live Smoke. Confirm PR #114 squash `cf07c39378e7c531583e80eaef5edc7e7d1f2bad` is the accepted clean URL product milestone; PR #115 squash `4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c` aligns production verification with canonical routes; Production Live Smoke #52 passed; issue #111 contains only authenticated search-console observation work; issue #82 remains the markdown-it/Diplodoc blocker; profile snapshot is `4 verified / 0 stale`; Vlezet M7.8B remains accepted while M7.8C is pending; VillAIgence PR #103/#104 automation remains separate from cumulative manual acceptance; next product slice is P3.1 Homepage evidence paths.
