# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.3 Flagship normalization.
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

**Portfolio 1.0 P3.3 — Flagship normalization**.

### Feature PR #122

```text
feature PR:                     #122 — MERGED
TDD RED head:                   f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
RED Build:                      #871 — expected FAILURE
exact accepted head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
accepted squash:                c90a221a21f51e897661667f981483bad922ad0d
final Build:                    #893 / 31005675334 — SUCCESS
CodeQL:                         #368 — SUCCESS
Dependency Review:              #321 — SUCCESS
Content Freshness:              #67 — SUCCESS
PR-safe Production Live Smoke:  #93 — SUCCESS
unit tests:                     376 PASS / 0 FAIL
site integrity:                 PASS
mobile overflow:                PASS
browser/accessibility:          PASS
Lighthouse:                     PASS
Project Evidence JS/no-JS:      PASS
P3.3 normalized page smoke:     PASS
Firefox/WebKit:                 PASS
search/RU-EN/analytics:         PASS
metadata/Engineering Map:       PASS
visual regression:              PASS with unchanged baselines
custom-domain artifact:         PASS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
review threads:                 0 open
```

### Exact production proof

```text
Pages workflow:                 #152 / 31006504250 — SUCCESS
accepted deployed SHA:          c90a221a21f51e897661667f981483bad922ad0d
Pages deployment ID:            5761717586
Pages created:                  2026-08-05T12:38:32Z
Pages updated:                  2026-08-05T12:39:14Z
Production Live Smoke:          #95 / 31006557622 — SUCCESS
baseline production smoke:      PASS
portfolio platform smoke:       PASS
flagship normalization smoke:   PASS
favicon smoke:                  PASS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Exact artifact, deployed production и external-project acceptance остаются отдельными layers.

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

Accepted common order:

1. problem and user;
2. constraints and risks;
3. current lifecycle and accepted boundary;
4. architecture and source of truth;
5. alternatives considered and rejected;
6. implemented capabilities and failure lessons;
7. verification and evidence;
8. known limitations;
9. next accepted milestone;
10. related material and retrospective.

Delivered:

- RU VillAIgence and RU Vlezet normalized to one marker contract;
- controlled EN VillAIgence normalized without creating a second evidence registry;
- canonical routes, slugs, diagrams and repository identities preserved;
- canonical Project Registry status now renders automatically on existing project pages;
- Vlezet PR #42 captured as green exact-head automation plus mandatory real-plan owner retest;
- VillAIgence PR #110 captured only as Draft/RED development evidence;
- Project Evidence explicitly renders pending states in JS and no-JS modes;
- dedicated browser smoke checks ordered headings, status, evidence, timeline and related links;
- deployment-only production smoke checks all three normalized pages against exact Pages SHA;
- desktop screenshots were manually reviewed; no visual baseline update or tolerance change was required.

Acceptance boundaries did not change:

### Vlezet

- lifecycle: `pre-production`;
- public label: `ACTIVE DEVELOPMENT`;
- accepted recognition slice: M7.8B;
- M7.8C remains Draft and pending the same representative real-plan product-owner retest;
- CI #3138, Recognition Benchmark #316 and M7 Browser Audit #769 do not replace owner acceptance.

### VillAIgence

```text
M11 Phase A:                   PR #103 — 28 scenarios + 7 GameTests
M11 Phase B:                   PR #104 — exact production-JAR startup/restart
M11 Phase C:                   PR #110 — Draft/RED shared deadline contract
lifecycle:                     release-candidate
public label:                  ACCEPTANCE IN PROGRESS
```

Candidate `0.1.23+1.21.1` retains automated production-JAR startup/restart evidence. Real-provider, multiplayer, focused gameplay and cumulative manual acceptance remain pending.

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

- issue #78 — closed/completed;
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

Next slice:

**P3.4 — Grounded Engineering Notes**.

Publish a bounded series from completed and evidenced work. Initial candidates:

1. repository-native clean URLs without Cloudflare routing;
2. deployment success versus production smoke;
3. hybrid CV + AI recognition boundaries;
4. GameTests versus installed gameplay acceptance;
5. passive PDF validation versus semantic extraction;
6. evidence-driven project state.

Each Note must:

- be derived from accepted project evidence;
- separate verified fact, inference and limitation;
- link back to the relevant case study and repository evidence;
- avoid invented metrics or promotion;
- use the existing Notes Registry, generated search and Atom feed;
- pass full exact-head and production acceptance.

---

## 10. Current priorities

1. preserve P3.1–P3.3 production acceptance and clean URL contracts;
2. implement P3.4 Grounded Engineering Notes;
3. complete Google/Yandex recrawl actions and observe index replacement;
4. review issue #82 on or after 2026-08-17;
5. draw analytics conclusions only after 3–4 weeks of meaningful aggregate traffic.

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
- dependency evidence never authorizes an unverified fix;
- PDF structural validity is not semantic PDF extraction;
- search-engine diagnosis refresh is not implied by a green production check;
- no quality-gate weakening.

---

## 12. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits, exact-head CI, latest Pages deployment and Production Live Smoke. Confirm PR #122 head `ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46` and squash `c90a221a21f51e897661667f981483bad922ad0d` delivered P3.3; Build #893, Pages #152 and Production Live Smoke #95 passed; Pages deployment ID `5761717586` published the exact accepted SHA; production artifact `8930571510` has digest `sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13`; PR #114/#115 remain the clean URL baseline; issue #111 is external search-console observation only; issue #82 remains the Diplodoc/markdown-it blocker; Vlezet M7.8B remains accepted while M7.8C is Draft; VillAIgence PR #103/#104 automation and PR #110 Draft remain separate from cumulative manual acceptance; continue with P3.4 Grounded Engineering Notes.
