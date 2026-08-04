# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после финальной canonical-проверки внешних профилей.
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

Платформа объединяет standalone homepage, Diplodoc knowledge pages, web-CV, evidence-backed case studies, `/now`, Engineering Notes + Atom feed, Publications, Engineering Map, full-text search, Photo Stories, Sources Knowledge Base, Project Evidence, Content Freshness, bounded RU/EN, privacy-friendly Cloudflare Web Analytics и production-oriented quality gates.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth и внешние профили не изменяются автоматически.

---

## 2. Current repository and production truth

```text
master:                          b5766cfa9cba20fb9588c05e6e6d891ded329357
final profile PR:                #104 — MERGED
exact PR head:                   5972236eac07325bf3bf1d8cf42ad24455c9a600
Build:                           #732 / 30904009048 — SUCCESS
CodeQL:                          #190 / 30904008962 — SUCCESS
Dependency Review:               #160 / 30904008979 — SUCCESS
Distribution Readiness:          #11 / 30904008961 — SUCCESS
unit tests:                      337 PASS / 0 FAIL
Lighthouse:                      100 / 100 / 100 / 100
quality artifact:                8890358619
distribution artifact:           8890251981
```

Exact post-merge production proof:

```text
source Pages workflow:            #135 / 30904603958 — SUCCESS
Production Live Smoke:             #25 / 30904659212 — SUCCESS
event:                             workflow_run
deployed/caller SHA:               b5766cfa9cba20fb9588c05e6e6d891ded329357
github-pages deployment id:        5742823833
deployment state:                  success
live artifact:                     8890532780
live digest:                       sha256:ecfde690fcc55c05b5b071c93d0542ceba5beccc1ae47dd424ac087307691be6
```

Live assertions independently passed:

- apex homepage HTTP 200 and expected title;
- exactly one Cloudflare Web Analytics beacon;
- `www` Note URL resolves to apex with path preserved;
- persistence Note HTTP 200 with exact H1/title/canonical/`og:url`;
- legacy Pages origin absent from tested site surfaces;
- Atom feed HTTP 200 and contains the Note title/canonical URL;
- real browser query `persistence contract` returns the exact Note route;
- page errors, console errors and request failures — none.

Generated artifact CI and deployed production proof remain separate evidence layers.

---

## 3. P2.5a — Distribution Contract & Profile Audit — DONE

PR #98 delivered a deterministic distribution operator kit without automatic posting or metadata duplication.

Canonical data model:

- `data/page-meta.json` owns title, description, path and OpenGraph identity;
- `data/distribution-targets.json` stores distribution-specific references and boundaries;
- `data/external-links.json` owns configured external identities and controlled profile snapshots;
- `docs/DISTRIBUTION.md` is byte-equal deterministic output from canonical registries.

Controlled target set: **8** — homepage, Vlezet, VillAIgence, Notes index, three grounded Notes and Publications.

Security review corrected incomplete URL substring checks. Canonical targets require parsed exact `https://trueruslan.ru` origin/hostname with empty search/hash.

P2.5a improves readiness; it does not claim audience growth or engagement.

---

## 4. P2.5b/P2.5c — External Profile Reverification — DONE

Final controlled snapshot:

```text
profiles:                          4
verified:                          4
stale:                             0
unverified:                        0
```

Measured states:

- GitHub profile — `verified`;
- Habr profile — `verified`;
- Telegram personal — `verified`;
- Telegram Blog — `verified` from the public channel feed and multiple fresh preview representations exposing `https://trueruslan.ru/`.

The first bare Telegram card probe returned an older cached representation, while cache-busted previews and the public `/s/` channel representation consistently exposed the canonical site. The repository records the independently fresh rendered evidence, not the stale cache response.

Final TDD evidence:

```text
RED head:                          7295d6957517532044293842109d66e1061fdb43
RED result:                        335 PASS / 2 expected FAIL
GREEN head:                        5972236eac07325bf3bf1d8cf42ad24455c9a600
Build:                             #732 / 30904009048 — SUCCESS
Distribution Readiness:            #11 / 30904008961 — SUCCESS
profile counts:                    4 verified / 0 stale / 0 unverified
```

External-profile canonicalization is complete. Future state changes still require fresh rendered evidence and must not be inferred from an owner report alone.

---

## 5. Production Live Smoke trigger — DONE

PR #99 changed the primary exact-deployment orchestration boundary to completed `Deploy static content to Pages` via `workflow_run`; direct push remains a fallback. PR #100 proved activation order. The final profile reconciliation was independently verified by Production Live Smoke #25 for exact SHA `b5766cfa...`.

---

## 6. Operational and security state

### Content Freshness

- issue #78 — closed;
- clean report: 0 findings/errors/warnings;
- PR runs create evidence without issue mutation.

### Dependencies

```text
0 critical
0 high
6 moderate
```

All six moderate records reduce to build-time `markdown-it@13.0.2` / Diplodoc compatibility. Issue #82 remains open. Next planned review: **2026-08-17**. Do not use `npm audit fix --force`, local `node_modules` shims or an unreviewed fork.

---

## 7. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B accepted / принят as the latest public recognition slice;
- M7.8C PR #42 remains open Draft;
- automated gates are green, but the same real-plan product-owner retest remains mandatory;
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

## 8. Current gate and next decisions

There is no active external-profile gate. All four controlled profiles expose the canonical site in fresh rendered public representations.

Next autonomous product work should not fabricate urgency. Candidate milestones:

- P2.5d public share UI only after a concrete product need;
- genuine Photo Story only after authentic material arrives;
- Vlezet reconciliation only after M7.8C owner acceptance;
- VillAIgence promotion only after cumulative manual/provider/gameplay acceptance;
- dependency blocker review on/after 2026-08-17;
- analytics conclusions only after 3–4 weeks of meaningful aggregate Cloudflare traffic.

The optimal immediate state is operational stability: preserve the verified distribution snapshot and continue only when one of the evidence-backed gates changes.

---

## 9. Invariants

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
- no weakening quality gates for speed.

---

## 10. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits and exact-head CI. Confirm Production Live Smoke event `workflow_run` verifies current `master`, issue #78 remains closed, issue #82 remains the moderate markdown-it/Diplodoc blocker, the profile snapshot is `4 verified / 0 stale`, Vlezet M7.8C remains Draft until owner acceptance, and VillAIgence automated evidence remains separate from cumulative acceptance.
