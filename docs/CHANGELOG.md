# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-04**, после exact post-merge production verification.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-04

## O3 — Production Deployment Verification — DONE

### PR #96 — deployed production live smoke

Added a permanent read-only Playwright workflow that verifies deployed production independently from generated PR artifacts.

Delivered:

- push-to-`master`, daily, manual and path-scoped PR triggers;
- deployment identity from GitHub Deployments API environment `github-pages`;
- exact `GITHUB_SHA` requirement on push;
- latest successful deployment inspection on PR/schedule/manual without claiming caller deployment;
- apex homepage, `www → apex`, Note, canonical/OpenGraph, Atom feed, interactive search and Cloudflare beacon assertions;
- rejection of legacy Pages-origin leakage and first-party browser/request failures;
- 30-day evidence artifact;
- no deployment, issue, content, lockfile, DNS or git mutation.

TDD RED:

```text
head:                       cdf2d90027c8a374636849724ce6fa42cf7baa7b
Build:                      #697 / 30860462086 — expected FAILURE
unit tests:                 331 PASS / 2 expected FAIL
failure scope:              missing workflow and smoke script
```

Final PR evidence:

```text
exact head:                 593377c24c6af8bbfb044bd6f20bac622e27b270
squash:                     ba4e51810dd532ca0a144fef084276dcba82a02e
Build:                      #706 / 30861085205 — SUCCESS
CodeQL:                     #156 / 30861085202 — SUCCESS
Dependency Review:          #134 / 30861085223 — SUCCESS
Production Live Smoke:      #7 / 30861085240 — SUCCESS
unit tests:                 333 PASS / 0 FAIL
Lighthouse:                 100 / 100 / 100 / 100
quality artifact:           8874434515
quality digest:             sha256:63584f0bf6b3dc8835de8bccc1273acf58d69db0e9977c144fbbb520cbe9362c
```

Post-merge exact production evidence:

```text
Production Live Smoke:      #8 / 30861417601 — SUCCESS
deployed SHA:               ba4e51810dd532ca0a144fef084276dcba82a02e
caller SHA:                 ba4e51810dd532ca0a144fef084276dcba82a02e
deployment id:              5735124034
state:                      success
live artifact:              8874490022
live digest:                sha256:cbc5b4099e9e08e0392f996a2434e219a216aac863f2c342b79c129096a0d7b8
retention:                  through 2026-09-02
```

Artifact assertions:

- homepage HTTP 200 and expected title;
- exactly one Cloudflare beacon;
- `www` Note URL resolved to apex with the same path;
- persistence Note HTTP 200 with exact title/H1/canonical/`og:url`;
- Atom feed HTTP 200, `application/xml`, Note title and canonical URL present;
- browser query `persistence contract` returned the exact Note route;
- no page errors, console errors or request failures.

The earlier limitation “latest Pages deployment/live search not independently proven” is closed.

---

## Operational Maintenance Closure — DONE

### PR #91 — pull-request Content Freshness evidence

Added a path-scoped PR trigger. PR runs upload deterministic evidence without issue mutation; scheduled/manual runs retain issue ownership.

```text
Content Freshness:          #13 / 30857597584 — SUCCESS
findings:                   0
artifact:                   8873073130
```

Issue #78 was closed as completed.

### PR #93 — exact dependency audit evidence

Added a read-only weekly/manual/path-scoped workflow preserving raw `npm audit --json`, normalized reports, every affected range and `npm explain` chains.

```text
exact head:                 23cffa3bd863de70fd70fa2bd8d1aa4a5c8a64a1
squash:                     9055ed182c7590643a09533c9d4011bada84d399
Dependency Audit:           #4 / 30858629032 — SUCCESS
measured:                   3 high / 6 moderate / 0 critical
```

### PR #94 — high-severity audit remediation

Applied compatible patch-only overrides:

```text
brace-expansion 2.1.3 → 2.1.4
brace-expansion 5.0.8 → 5.0.9
undici         7.28.0 → 7.29.0
```

```text
squash:                     2e1bbd8e4b8e8e77319691a785f5ce14402f3389
Build:                      #695 / 30859354170 — SUCCESS
Dependency Audit:           #7 / 30859354182 — SUCCESS
final audit:                0 high / 6 moderate / 0 critical
```

Issue #82 remains open only for the moderate markdown-it/Diplodoc upstream blocker.

---

## P2.4k — Restart and Persistence as Product Contract — DONE

Published **«Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence»**.

```text
feature PR:                 #89 — MERGED
squash:                     40af9e52237f03da58355caa065a40b64ad597d8
Build:                      #680 / 30856377655 — SUCCESS
unit tests:                 327 PASS / 0 FAIL
```

The Note separates byte/storage, structural, semantic and behavioral continuity.

---

# 2026-08-03

## P2.4j — Deterministic Authority — DONE

Published **«AI может предложить, но не применить: как строить deterministic authority»**.

```text
feature PR:                 #87 — MERGED
squash:                     2fba404bbca9680d934f11f30c8a76347a5ab7b1
Build:                      #668 / 30853751417 — SUCCESS
unit tests:                 324 PASS / 0 FAIL
```

## P2.4i — Installed Acceptance — DONE

Published **«От source tests к installed acceptance: что доказывает каждый release gate»**.

```text
feature PR:                 #85 — MERGED
squash:                     c03f8403b77df5a91238d62bd8a143c046511a92
Build:                      #655 / 30833707629 — SUCCESS
unit tests:                 321 PASS / 0 FAIL
```

## P2.4h — Product Evidence Reconciliation — DONE

Recorded Vlezet M7.8B accepted evidence and separated VillAIgence GameTest from production-JAR restart proof.

- VillAIgence PR #103 — 28-scenario catalogue and seven Fabric GameTests;
- VillAIgence PR #104 — exact production-JAR startup, controlled shutdown and restart acceptance;
- cumulative real-provider/gameplay acceptance remained pending.

```text
feature PR:                 #83 — MERGED
squash:                     5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:                      #641 / 30829739512 — SUCCESS
unit tests:                 318 PASS / 0 FAIL
```

---

# Earlier milestones

- 2026-08-02 — `/now`, VillAIgence/Vlezet flagships, Publications and stabilized search/photo surfaces.
- 2026-08-01 — canonical domain rollout, header/navigation consolidation and HTTPS production cutover.
- 2026-07-30 — production analytics activation and legacy operational closure.
- 2026-07-23 — privacy analytics, Minimal RU/EN and additional grounded Note.
- 2026-07-22 — flagship format, metadata cleanup, browser harness, freshness, Notes, Evidence, Sources and Photo Stories foundation.

---

## Durable continuity principle

After every major milestone synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`. These snapshots never substitute for actual repository state, exact-head CI, `github-pages` deployment, live custom-domain checks, source-project acceptance or provider telemetry.
