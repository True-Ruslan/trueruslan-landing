# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после публикации актуального резюме и exact-SHA production verification.
>
> Durable snapshot: что представляет собой проект, что доказано, какие границы остаются и что делать дальше.

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`;
5. `docs/DISTRIBUTION.md`.

После чтения отдельно проверять actual open PR, latest commits, exact-head CI, latest `github-pages` deployment, Production Live Smoke, Cloudflare aggregate telemetry и external-project acceptance. Repository readiness, generated artifact, deployed production, profile snapshot и provider/gameplay evidence — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и static-first knowledge platform Руслана Немыкина.

Платформа объединяет standalone homepage, Diplodoc knowledge pages, web-CV и downloadable PDF resume, evidence-backed case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, full-text search, Photo Stories, Sources Knowledge Base, Project Evidence, Content Freshness, bounded RU/EN, privacy-friendly Cloudflare Web Analytics и production-oriented quality gates.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth и внешние профили не изменяются автоматически.

---

## 2. Latest accepted product and production truth

Последний принятый продуктовый milestone — обновление профессионального профиля и резюме в PR #108.

```text
feature PR:                      #108 — MERGED
exact PR head:                   3055c82dc7f6c58d723a5f5c60e0af9f344c240b
accepted product squash:         a85b24d220f9bbfd57176a081f7bce59e41782e8
Build:                           #756 / 30938001730 — SUCCESS
CodeQL:                          #218 / 30938008191 — SUCCESS
Dependency Review:               #184 / 30937995608 — SUCCESS
Distribution Readiness:          #24 / 30937995575 — SUCCESS
unit tests:                      340 PASS / 0 FAIL
Lighthouse:                      100 / 100 / 100 / 100
visual regression:               PASS
quality artifact:                8904045978
quality digest:                  sha256:43b0e5fa5eaf56f1dc3604215c3ac1b0454fbd67d460f134a2d6342a489cc3c7
review threads:                  5 resolved / 0 open
```

Exact post-merge production proof:

```text
source Pages workflow:            #139 / 30938565671 — SUCCESS
Production Live Smoke:             #33 / 30938639622 — SUCCESS
event:                             workflow_run
deployed/caller SHA:               a85b24d220f9bbfd57176a081f7bce59e41782e8
github-pages deployment id:        5749294655
deployment state:                  success
live artifact:                     8904183580
live digest:                       sha256:14d81aba0d281cf9a36e67a83b467871f7c2442c2e9937169d7fb22f1c26b93e
```

The durable documentation closure can produce a later docs-only `master` SHA. Therefore `a85b24d...` is recorded as the latest accepted product/deployment identity, while actual `master` must still be checked directly.

Live assertions independently passed for the exact deployed bundle, including apex/www routing, canonical metadata, Atom feed, generated search interaction, Cloudflare beacon and absence of page/console/request failures. Generated artifact CI, controlled evidence and deployed browser proof remain separate layers.

---

## 3. August 2026 Resume Refresh — DONE

PR #108 replaced stale professional-profile surfaces with the supplied August 2026 facts.

Delivered:

- current RU/EN web-CV;
- compact downloadable `docs/assets/documents/cv.pdf`;
- 5+ years of commercial experience;
- current QWEP role and products;
- Java 21–25 / Spring Boot 3.5–4 current stack;
- Runet Business Systems, Bell Integrator and earlier experience;
- AI-tool adoption and corporate MCP-server work;
- updated education, teaching and research context;
- synchronized About pages, homepage Java range and metadata;
- reviewed desktop/mobile resume visual baselines.

Permanent regression evidence validates both text surfaces and the binary PDF. PDF links are parsed structurally and require the exact canonical `https://trueruslan.ru/` identity; legacy `.com` and GitHub Pages origins are rejected.

Boundaries preserved:

- no route/runtime/search/analytics/dependency/infrastructure change;
- no invented metrics, leadership claims or proprietary implementation details;
- no quality-gate weakening.

---

## 4. Distribution and external profiles — DONE

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

Any future state change requires fresh rendered evidence and must not be inferred from an owner report alone. Distribution readiness is not an engagement or audience-growth claim.

---

## 5. Vlezet Draft Freshness Reconciliation — DONE

Content Freshness reopened issue #78 after repository activity became newer than the controlled Vlezet snapshot. Inspection showed that the activity belonged to M7.8C PR #42, which remains an open Draft awaiting the same real-plan product-owner retest.

PR #106 recorded only bounded evidence:

- Vlezet `lastVerified` → `2026-08-04`;
- M7.8B remains the accepted recognition slice;
- M7.8C remains the next slice;
- PR #42 at observed head `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a` is `pending` Draft evidence;
- no acceptance, merge or public lifecycle promotion claim was added.

```text
Content Freshness:                 #15 / 30906476451 — SUCCESS
report:                            0 findings / 0 warnings / 0 errors
artifact:                          8891241809
digest:                            sha256:4e2db8777b44a3678e8cc8a77153cfe00887b93c9d7b838a71a3b7c70182a5f1
issue #78:                         CLOSED / COMPLETED
```

---

## 6. Production Live Smoke orchestration — DONE

PR #99 changed the primary production-verification boundary to the completed `Deploy static content to Pages` workflow through `workflow_run`; direct push remains a fallback. PR #100 proved activation order.

Latest exact proof is Live Smoke #33 for `a85b24d...`. The workflow resolved successful deployment `5749294655`, checked out the identical SHA and passed the deployed browser smoke before preserving evidence.

---

## 7. Operational and security state

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

### Resume-specific security review

Five CodeQL review threads around URL matching were fixed before merge. The final contract parses `/URI (...)` values through `URL` and compares protocol, hostname, port and pathname structurally. Final CodeQL #218 passed with zero open review threads.

---

## 8. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B accepted / принят as the latest public recognition slice;
- M7.8C PR #42 remains open Draft and pending evidence;
- automated gates do not replace the same real-plan product-owner retest;
- do not merge or update public completion state before explicit owner acceptance.

### VillAIgence

```text
M11 Phase A: PR #103 — 28 scenarios + 7 GameTests
M11 Phase B: PR #104 — exact production-JAR startup/restart
lifecycle:                    release-candidate
public label:                 ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence remain separate from real-provider/gameplay/manual cumulative acceptance. Exact artifact and installed acceptance remain separate release gates.

### Publications and Photo Stories

- Publications contains only completed, externally verifiable work;
- first genuine Photo Story requires authentic material and confirmed chronology;
- fake/demo albums remain prohibited.

---

## 9. Current gate and next decisions

The resume-refresh gate is closed. There is no active external-profile or freshness gate.

Next autonomous product work should not fabricate urgency. Candidate milestones:

- P2.5d public share UI only after a concrete user-facing need;
- genuine Photo Story only after authentic material arrives;
- Vlezet reconciliation only after M7.8C owner acceptance;
- VillAIgence promotion only after cumulative manual/provider/gameplay acceptance;
- dependency blocker review on/after 2026-08-17;
- analytics conclusions only after 3–4 weeks of meaningful aggregate Cloudflare traffic.

The optimal immediate state is operational stability: preserve verified production/distribution/evidence snapshots and continue only when an evidence-backed gate changes or the owner introduces a concrete content/product idea.

---

## 10. Invariants

- static-first;
- build-time intelligence;
- progressive enhancement;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc as sole site-wide search owner;
- no automatic public truth or profile mutation;
- bounded Evidence semantics;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking without privacy review;
- exact artifact → installed acceptance remains explicit;
- byte continuity is not semantic or behavioral continuity;
- generated artifact, deployment and browser proof remain distinct;
- dependency evidence never authorizes an unverified fix;
- distribution readiness is not an engagement claim;
- Draft evidence is not accepted evidence;
- binary resume and web-CV must remain synchronized through permanent tests;
- no weakening quality gates for speed.

---

## 11. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits and exact-head CI. Confirm accepted resume product SHA `a85b24d220f9bbfd57176a081f7bce59e41782e8` was deployed by Pages #139 and verified by Production Live Smoke #33; issue #78 remains closed with a clean report; issue #82 remains the markdown-it/Diplodoc blocker; profile snapshot is `4 verified / 0 stale`; Vlezet M7.8B remains accepted while M7.8C PR #42 remains pending Draft until owner acceptance; and VillAIgence automated evidence remains separate from cumulative acceptance.
