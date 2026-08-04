# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после финальной проверки внешних профилей и Vlezet freshness reconciliation.
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
master:                          5742a25b16ec4c1128fc0bcf03227cf6e4666f60
Vlezet drift PR:                 #106 — MERGED
exact PR head:                   c749a2fe3e9fdae789e6902bab266bf324c69b2d
Build:                           #735 / 30906476472 — SUCCESS
CodeQL:                          #195 / 30906476404 — SUCCESS
Dependency Review:               #163 / 30906476638 — SUCCESS
Content Freshness:               #15 / 30906476451 — SUCCESS
unit tests:                      338 PASS / 0 FAIL
freshness report:                0 findings / 0 warnings / 0 errors
Lighthouse:                      100 / 100 / 100 / 100
quality artifact:                8891350070
freshness artifact:              8891241809
```

Exact post-merge production proof:

```text
source Pages workflow:            #137 / 30907086802 — SUCCESS
Production Live Smoke:             #29 / 30907129018 — SUCCESS
event:                             workflow_run
deployed/caller SHA:               5742a25b16ec4c1128fc0bcf03227cf6e4666f60
github-pages deployment id:        5743302605
deployment state:                  success
live artifact:                     8891509306
live digest:                       sha256:b5d5531d942af9239fa8e4b1ce26feba15f70b1b4c0c197a15ec7417568a301b
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

Generated artifact CI, controlled freshness evidence and deployed browser proof remain separate layers.

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

The first bare Telegram card probe returned an older cached representation, while cache-busted previews and the public `/s/` channel representation consistently exposed the canonical site. The repository records independently fresh rendered evidence, not the stale cache response.

```text
final profile PR:                  #104 — MERGED
squash:                            b5766cfa9cba20fb9588c05e6e6d891ded329357
Build:                             #732 / 30904009048 — SUCCESS
Distribution Readiness:            #11 / 30904008961 — SUCCESS
profile counts:                    4 verified / 0 stale / 0 unverified
Production Live Smoke:             #25 / 30904659212 — SUCCESS
```

External-profile canonicalization is complete. Future state changes require fresh rendered evidence and must not be inferred from an owner report alone.

---

## 5. Vlezet Draft Freshness Reconciliation — DONE

Content Freshness reopened issue #78 after repository activity became newer than the controlled Vlezet snapshot. Inspection showed that the activity belonged to M7.8C PR #42, which remains an open Draft awaiting the same real-plan product-owner retest.

PR #106 updated only bounded evidence:

- Vlezet `lastVerified` → `2026-08-04`;
- M7.8B remains the accepted recognition slice;
- M7.8C remains the next slice;
- PR #42 at observed head `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a` is recorded as `pending` Draft evidence;
- no product-owner acceptance, merge or public promotion claim was added.

A permanent regression contract prevents this Draft signal from replacing M7.8B acceptance.

Clean evidence:

```text
Content Freshness:                 #15 / 30906476451 — SUCCESS
report:                            0 findings / 0 warnings / 0 errors
artifact:                          8891241809
digest:                            sha256:4e2db8777b44a3678e8cc8a77153cfe00887b93c9d7b838a71a3b7c70182a5f1
issue #78:                         CLOSED / COMPLETED
```

---

## 6. Production Live Smoke trigger — DONE

PR #99 changed the primary exact-deployment orchestration boundary to completed `Deploy static content to Pages` via `workflow_run`; direct push remains a fallback. PR #100 proved activation order. Current exact production proof is Live Smoke #29 for `5742a25b...`.

---

## 7. Operational and security state

### Content Freshness

- issue #78 — closed/completed;
- latest clean report: 0 findings/errors/warnings;
- PR runs create evidence without issue mutation;
- Draft repository activity is recorded without promoting project status.

### Dependencies

```text
0 critical
0 high
6 moderate
```

All six moderate records reduce to build-time `markdown-it@13.0.2` / Diplodoc compatibility. Issue #82 remains open. Next planned review: **2026-08-17**. Do not use `npm audit fix --force`, local `node_modules` shims or an unreviewed fork.

---

## 8. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B accepted / принят as the latest public recognition slice;
- M7.8C PR #42 remains open Draft and is recorded only as pending evidence;
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

There is no active external-profile or freshness gate.

Next autonomous product work should not fabricate urgency. Candidate milestones:

- P2.5d public share UI only after a concrete product need;
- genuine Photo Story only after authentic material arrives;
- Vlezet reconciliation only after M7.8C owner acceptance;
- VillAIgence promotion only after cumulative manual/provider/gameplay acceptance;
- dependency blocker review on/after 2026-08-17;
- analytics conclusions only after 3–4 weeks of meaningful aggregate Cloudflare traffic.

The optimal immediate state is operational stability: preserve verified distribution and evidence snapshots and continue only when an evidence-backed gate changes.

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
- no weakening quality gates for speed.

---

## 11. New-session handoff

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits and exact-head CI. Confirm Production Live Smoke `workflow_run` verifies current `master`, issue #78 remains closed with a clean report, issue #82 remains the markdown-it/Diplodoc blocker, the profile snapshot is `4 verified / 0 stale`, Vlezet M7.8B remains accepted while M7.8C PR #42 remains pending Draft until owner acceptance, and VillAIgence automated evidence remains separate from cumulative acceptance.
