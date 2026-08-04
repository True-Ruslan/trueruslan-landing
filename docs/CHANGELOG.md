# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-04**, после P2.5a Distribution Readiness и deployment-trigger acceptance.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; operator kit — `docs/DISTRIBUTION.md`.

---

# 2026-08-04

## P2.5a — Distribution Contract & Profile Audit — DONE

### PR #98 — canonical distribution readiness

Added a deterministic operator/evidence contract without duplicating page metadata or adding automatic publication/tracking.

Delivered:

- eight canonical distribution targets referencing `data/page-meta.json` paths only;
- target audiences/channels, framing and evidence boundaries;
- exact canonical `https://trueruslan.ru` host validation with no query/hash;
- profile audit metadata in existing `data/external-links.json`;
- states `verified`, `stale`, `unverified`;
- deterministic JSON and Markdown artifacts;
- byte-equal tracked `docs/DISTRIBUTION.md`;
- weekly/manual/path-scoped read-only workflow;
- no profile mutation, redirect service, UTM attribution or engagement claim.

TDD RED:

```text
head:                       aee74c82b091d4db3a047803f241acedf6cae39c
Build:                      #711 / 30884284014 — expected FAILURE
unit tests:                 333 PASS / 4 expected FAIL
failure scope:              missing registry/module/runbook/workflow
```

Security correction:

- CodeQL found two incomplete substring URL checks;
- implementation/test now parse URL components and require exact canonical origin/hostname;
- both inline findings resolved.

Final feature evidence:

```text
head:                       87685e94f2f81f72510555bb4b613c77bce34d36
squash:                     6973f09ff4613aaa809600f09711d274dbf44cec
Build:                      #719 / 30885477166 — SUCCESS
CodeQL:                     #171 / 30885477170 — SUCCESS
Dependency Review:          #147 / 30885477189 — SUCCESS
Distribution Readiness:     #3 / 30885477173 — SUCCESS
unit tests:                 337 PASS / 0 FAIL
Lighthouse:                 100 / 100 / 100 / 100
quality artifact:           8882993166
quality digest:             sha256:3888468f04c68c0fa77de8e90d4622cb106d095e60976b962fa4d85b1870cea6
distribution artifact:      8882890037
distribution digest:        sha256:a5be6111f1e3504f4544ef6660a37ec34c8c4b629b289ff48c8537fd84ac4d91
```

Measured profile snapshot:

```text
GitHub profile:             verified
Habr:                       stale
Telegram personal:          stale
Telegram Blog:              stale
```

P2.5a exact production evidence:

```text
Production Live Smoke:      #12 / 30886377666 — SUCCESS
deployed SHA:               6973f09ff4613aaa809600f09711d274dbf44cec
deployment id:              5739340422
artifact:                   8883255231
digest:                     sha256:f0cc62934b1c1754eba546dea3ce3dfe5af3535a4db5a466407a6f36b67a3f42
```

Browser assertions passed for homepage, www→apex, Note metadata, feed, interactive search and Cloudflare beacon with no page/console/request failures.

---

## Production Live Smoke trigger repair — DONE

### PR #99 — deployment-driven exact verification

Observed after P2.5a:

- workflow remained server-side active;
- exact Pages deployment succeeded;
- direct-push live run did not appear within the expected trigger window.

Repair:

- completed `Deploy static content to Pages` via `workflow_run` became the primary trigger;
- direct push retained as fallback;
- exact expected SHA derived from `workflow_run.head_sha`;
- source conclusion must be success;
- source workflow run ID/conclusion stored in artifact.

TDD and final evidence:

```text
RED head:                   dfe81988e66fdf9883359183b050aca92b07f62f
RED result:                 336 PASS / 1 expected FAIL
GREEN head:                 4fbe518787421038361246784729ece0a7da9779
squash:                     0ec1faef21cf528ecc54d5a16d99552ed3d4805e
Build:                      #721 / 30886377658 — SUCCESS
CodeQL:                     #174 / 30886377653 — SUCCESS
Dependency Review:          #149 / 30886377654 — SUCCESS
PR Live Smoke:              #12 / 30886377666 — SUCCESS
unit tests:                 337 PASS / 0 FAIL
quality artifact:           8883344281
quality digest:             sha256:57b794be4c4ca6c456e9b895db1367347a82827cac301be31a137e0043743740
```

Repair squash fallback production proof:

```text
Production Live Smoke:      #13 / 30886807440 — SUCCESS
deployed SHA:               0ec1faef21cf528ecc54d5a16d99552ed3d4805e
deployment id:              5739513348
artifact:                   8883438510
digest:                     sha256:f2afbc1bb7335fb7eb20e83fa8df3109c2a8fa5d64948e427479542b0d04a313
```

### PR #100 — activation-order validation

The listener could not prove itself on the same merge that introduced `workflow_run`, because it was not present on default branch before the source Pages run began. PR #100 created the first subsequent controlled deployment.

```text
head:                       b90308e1a434e4ef22b11e930732ae06195902c6
squash:                     c2de903eabd34ed7d07ace5e3f1eabca48b720e5
Build:                      #722 / 30887203329 — SUCCESS
CodeQL:                     #176 / 30887203406 — SUCCESS
Dependency Review:          #150 / 30887203119 — SUCCESS
quality artifact:           8883644635
quality digest:             sha256:ee84367abc2bf0d9e5a7eb938715be11c71a0d61fee7a3f77e5a6a9955e1b63d
```

Deployment-driven acceptance:

```text
source Pages run:           #131 / 30887587364 — SUCCESS
Production Live Smoke:      #16 / 30887639653 — SUCCESS
event:                      workflow_run
deployed/caller SHA:        c2de903eabd34ed7d07ace5e3f1eabca48b720e5
deployment id:              5739649211
artifact:                   8883727019
digest:                     sha256:083a787be0b8fee001fd78c1ae25657c70408d42db3eafc740d7667775c03984
```

The primary deployment-driven trigger is now proven independently from fallback push.

---

## O3 — Production Deployment Verification — DONE

PR #96 introduced the read-only Playwright live-production gate and separated generated artifact proof from deployed browser proof.

```text
feature squash:             ba4e51810dd532ca0a144fef084276dcba82a02e
Build:                      #706 / 30861085205 — SUCCESS
post-merge Live Smoke:      #8 / 30861417601 — SUCCESS
artifact:                   8874490022
```

Verified apex, www→apex, canonical/OpenGraph, Atom feed, interactive search, Cloudflare beacon and browser/request diagnostics.

---

## Operational Maintenance Closure — DONE

### PR #91 — Content Freshness PR evidence

```text
Content Freshness:          #13 / 30857597584 — SUCCESS
findings:                   0
artifact:                   8873073130
```

Issue #78 was closed.

### PR #93 — exact dependency audit evidence

```text
squash:                     9055ed182c7590643a09533c9d4011bada84d399
measured:                   3 high / 6 moderate / 0 critical
```

### PR #94 — high-severity remediation

```text
squash:                     2e1bbd8e4b8e8e77319691a785f5ce14402f3389
final audit:                0 high / 6 moderate / 0 critical
```

Issue #82 remains open only for the build-time markdown-it/Diplodoc blocker.

---

## P2.4k — Restart and Persistence as Product Contract — DONE

```text
feature PR:                 #89 — MERGED
squash:                     40af9e52237f03da58355caa065a40b64ad597d8
Build:                      #680 / 30856377655 — SUCCESS
unit tests:                 327 PASS / 0 FAIL
```

---

# 2026-08-03

## P2.4j — Deterministic Authority — DONE

```text
feature PR:                 #87 — MERGED
squash:                     2fba404bbca9680d934f11f30c8a76347a5ab7b1
Build:                      #668 / 30853751417 — SUCCESS
unit tests:                 324 PASS / 0 FAIL
```

## P2.4i — Installed Acceptance — DONE

```text
feature PR:                 #85 — MERGED
squash:                     c03f8403b77df5a91238d62bd8a143c046511a92
Build:                      #655 / 30833707629 — SUCCESS
unit tests:                 321 PASS / 0 FAIL
```

## P2.4h — Product Evidence Reconciliation — DONE

Recorded Vlezet M7.8B accepted evidence and separated VillAIgence automated layers:

- PR #103 — 28-scenario catalogue + seven GameTests;
- PR #104 — exact production-JAR startup/shutdown/restart acceptance;
- cumulative real-provider/gameplay acceptance remained pending;
- M7.8C remained a separate owner-acceptance boundary.

```text
feature PR:                 #83 — MERGED
squash:                     5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:                      #641 / 30829739512 — SUCCESS
unit tests:                 318 PASS / 0 FAIL
```

---

# Earlier milestones

- 2026-08-02 — `/now`, flagships, Publications and stabilized search/photo surfaces.
- 2026-08-01 — canonical domain rollout, header/navigation consolidation and HTTPS production cutover.
- 2026-07-30 — production analytics activation and legacy operational closure.
- 2026-07-23 — privacy analytics, Minimal RU/EN and grounded Notes.
- 2026-07-22 — flagship format, metadata, browser harness, freshness, Evidence, Sources and Photo Stories foundation.

---

## Durable continuity principle

After every major milestone synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`. These snapshots never substitute for actual repository state, exact-head CI, `github-pages` deployment, Production Live Smoke, external profile observation, source-project acceptance or provider telemetry.
