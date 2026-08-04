# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-04**, после P2.5a Distribution Readiness и deployment-trigger acceptance.
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
master:                          c2de903eabd34ed7d07ace5e3f1eabca48b720e5
P2.5a PR:                        #98 — MERGED
P2.5a exact head:                87685e94f2f81f72510555bb4b613c77bce34d36
P2.5a squash:                    6973f09ff4613aaa809600f09711d274dbf44cec
trigger repair PR:               #99 — MERGED
trigger repair squash:           0ec1faef21cf528ecc54d5a16d99552ed3d4805e
design activation PR:            #100 — MERGED
current design squash:           c2de903eabd34ed7d07ace5e3f1eabca48b720e5
unit tests:                       337 PASS / 0 FAIL
Lighthouse:                       100 / 100 / 100 / 100
```

P2.5a exact-head evidence:

```text
Build:                            #719 / 30885477166 — SUCCESS
CodeQL:                           #171 / 30885477170 — SUCCESS
Dependency Review:                #147 / 30885477189 — SUCCESS
Distribution Readiness:           #3 / 30885477173 — SUCCESS
quality artifact:                 8882993166
quality digest:                   sha256:3888468f04c68c0fa77de8e90d4622cb106d095e60976b962fa4d85b1870cea6
distribution artifact:            8882890037
distribution digest:              sha256:a5be6111f1e3504f4544ef6660a37ec34c8c4b629b289ff48c8537fd84ac4d91
```

Current exact deployment-trigger proof:

```text
source Pages workflow:            #131 / 30887587364 — SUCCESS
Production Live Smoke:             #16 / 30887639653 — SUCCESS
event:                             workflow_run
deployed/caller SHA:               c2de903eabd34ed7d07ace5e3f1eabca48b720e5
github-pages deployment id:        5739649211
deployment state:                  success
live artifact:                     8883727019
live digest:                       sha256:083a787be0b8fee001fd78c1ae25657c70408d42db3eafc740d7667775c03984
retention:                         through 2026-09-03
checked at:                        2026-08-04T07:24:28Z
```

Live assertions independently passed:

- apex homepage HTTP 200 and expected title;
- exactly one Cloudflare Web Analytics beacon;
- `www` Note URL resolves to apex with path preserved;
- persistence Note HTTP 200 with exact title/H1/canonical/`og:url`;
- legacy Pages origin absent;
- Atom feed HTTP 200 and contains the Note title/canonical URL;
- real browser query `persistence contract` returns the exact Note route;
- page errors, console errors and request failures — none.

---

## 3. P2.5a — Distribution Contract & Profile Audit — DONE

PR #98 delivered a deterministic distribution operator kit without automatic posting or metadata duplication.

Canonical data model:

- `data/page-meta.json` remains owner of title, description, path and OpenGraph identity;
- `data/distribution-targets.json` stores only distribution-specific references and boundaries;
- `data/external-links.json` remains owner of configured external identities and controlled profile snapshots;
- `docs/DISTRIBUTION.md` is byte-equal deterministic output from the registries.

Controlled target set: **8**.

- homepage;
- Vlezet flagship;
- VillAIgence flagship;
- Engineering Notes index;
- installed-acceptance Note;
- deterministic-authority Note;
- restart/persistence Note;
- Publications index.

Profile snapshot:

```text
profiles:                          4
verified:                          1
stale:                             3
unverified:                        0
```

Measured states:

- GitHub profile — `verified`: canonical `https://trueruslan.ru/` backlink observed;
- Habr — `stale`: public profile reachable, canonical backlink not observed;
- Telegram personal — `stale`: legacy GitHub Pages backlink observed;
- Telegram Blog — `stale`: legacy GitHub Pages backlink observed.

Security review corrected incomplete substring URL checks. Canonical distribution URLs now require parsed exact `https://trueruslan.ru` origin/hostname with empty search/hash. Both CodeQL review threads were resolved.

P2.5a production proof:

```text
Production Live Smoke:             #12 / 30886377666 — SUCCESS
deployed SHA:                      6973f09ff4613aaa809600f09711d274dbf44cec
deployment id:                     5739340422
live artifact:                     8883255231
live digest:                       sha256:f0cc62934b1c1754eba546dea3ce3dfe5af3535a4db5a466407a6f36b67a3f42
```

P2.5a improves readiness; it does not claim audience growth or engagement.

---

## 4. Production Live Smoke trigger repair — DONE

After P2.5a merge, successful Pages deployment existed but the direct-push Production Live Smoke run did not appear within the expected trigger window. Workflow server-side state remained `active`.

PR #99 changed the primary exact-deployment orchestration boundary to completed `Deploy static content to Pages` via `workflow_run`.

Current trigger model:

- `workflow_run` after successful Pages workflow — primary;
- direct push — fallback;
- daily schedule;
- manual dispatch;
- path-scoped pull requests.

Exact event propagation:

- expected SHA: `github.event.workflow_run.head_sha`;
- source conclusion must be `success`;
- source workflow run ID/conclusion are stored in the artifact;
- exact deployment must resolve to the expected SHA through GitHub Deployments API.

Repair exact-head evidence:

```text
RED head:                         dfe81988e66fdf9883359183b050aca92b07f62f
RED:                              336 PASS / 1 expected FAIL
GREEN head:                       4fbe518787421038361246784729ece0a7da9779
Build:                            #721 / 30886377658 — SUCCESS
CodeQL:                           #174 / 30886377653 — SUCCESS
Dependency Review:                #149 / 30886377654 — SUCCESS
PR live smoke:                    #12 / 30886377666 — SUCCESS
quality artifact:                 8883344281
quality digest:                   sha256:57b794be4c4ca6c456e9b895db1367347a82827cac301be31a137e0043743740
```

Repair squash fallback production proof:

```text
Production Live Smoke:             #13 / 30886807440 — SUCCESS
deployed SHA:                      0ec1faef21cf528ecc54d5a16d99552ed3d4805e
deployment id:                     5739513348
artifact:                          8883438510
digest:                            sha256:f2afbc1bb7335fb7eb20e83fa8df3109c2a8fa5d64948e427479542b0d04a313
```

Activation-order proof was completed by PR #100's subsequent deployment: event `workflow_run` #16 verified exact squash `c2de903e...` from source Pages run #131.

---

## 5. Operational and security state

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

## 6. External project boundaries

### Vlezet

- public lifecycle: `pre-production`;
- M7.8B remains accepted as the latest public recognition slice;
- M7.8C PR #42 remains open Draft;
- automated gates are green, but the same real-plan product-owner retest remains mandatory;
- do not merge or update public completion state before explicit owner acceptance.

Latest observed Draft head: `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a`.

### VillAIgence

```text
canonical source head:             61b66e38e99c1dc9bdc26089bfb345a250a881e2
published candidate:               0.1.23+1.21.1
M11 Phase A: PR #103 — 28 scenarios + 7 GameTests
M11 Phase B: PR #104 — production-JAR startup/restart
lifecycle:                         release-candidate
public label:                      ACCEPTANCE IN PROGRESS
```

Source/package/GameTest/production-JAR/persistence/server-authority evidence remain separate from real-provider/gameplay/manual cumulative acceptance.

### Publications and Photo Stories

- Publications contains only completed, externally verifiable work;
- first genuine Photo Story requires authentic material and confirmed chronology;
- fake/demo albums remain prohibited.

---

## 7. Current gate — external profile canonicalization

The next useful step is not another repository feature. Three stale public profiles require deliberate owner edits:

1. Habr — add canonical `https://trueruslan.ru/` backlink;
2. Telegram personal — replace legacy GitHub Pages backlink with `https://trueruslan.ru/`;
3. Telegram Blog — replace legacy GitHub Pages backlink with `https://trueruslan.ru/`.

After those edits:

- re-fetch rendered public profiles;
- verify exact canonical backlink;
- update `lastVerified`, `verificationScope` and state from `stale` to `verified`;
- regenerate `docs/DISTRIBUTION.md`;
- run Distribution Readiness, full CI and exact Production Live Smoke.

No available repository tool can safely mutate Habr or Telegram profile descriptions. Automatic profile mutation remains prohibited.

---

## 8. Next autonomous decisions after the gate

- P2.5b public share UI: only if an explicit product need appears after profile cleanup; not automatic priority.
- genuine Photo Story: only after authentic material arrives.
- Vlezet reconciliation: only after M7.8C owner acceptance.
- VillAIgence promotion: only after cumulative manual/provider/gameplay acceptance.
- dependency blocker: review on/after 2026-08-17.
- analytics conclusions: only after 3–4 weeks of meaningful aggregate Cloudflare traffic.

---

## 9. Invariants

Do not break without a new evidence-backed design decision:

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

> Open `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/CUSTOM_DOMAIN.md` and `docs/DISTRIBUTION.md`. Check actual open PRs, latest commits and exact-head CI. Confirm Production Live Smoke event `workflow_run` verifies current `master`, issue #78 remains closed, issue #82 remains the moderate markdown-it/Diplodoc blocker, external profile states are still accurate, Vlezet M7.8C remains Draft until owner acceptance, and VillAIgence automated evidence remains separate from cumulative acceptance.
