# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-04**, после Content Freshness closure, exact dependency triage и high-severity remediation.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

---

# 2026-08-04

## Operational Maintenance Closure — DONE

### PR #91 — pull-request Content Freshness evidence

Added a path-scoped PR trigger for controlled project/evidence/history changes. PR runs execute the existing bounded probe and deterministic report, upload a 30-day artifact and explicitly skip issue mutation. Scheduled/manual runs remain the automatic maintenance-issue owner.

TDD RED:

```text
head:                68c7e5f39405666e032ee071476af14226029b94
Build:               #682 / 30857522116 — expected FAILURE
failure:             missing PR trigger and issue-isolation condition
```

Final evidence:

```text
exact head:          6d64ed81e6bfebd856f502c993ce9f574c55aa4b
squash:              7afade6cc6e1cdfce2d14b28d5a4ff42b28453ee
Build:               #683 / 30857597259 — SUCCESS
CodeQL:              #129 / 30857597245 — SUCCESS
Dependency Review:   #111 / 30857597225 — SUCCESS
Content Freshness:   #13 / 30857597584 — SUCCESS
unit tests:          328 PASS / 0 FAIL
freshness artifact:  8873073130
artifact digest:     sha256:f54ca989f6a696258a1b976217b71363b711681fd284300cbc91914ace7971c0
findings:            0
```

The previous VillAIgence release/repository drift and Vlezet repository-drift warnings no longer reproduce. Issue #78 was closed as completed.

### PR #93 — exact dependency audit evidence

Added a read-only `Dependency Audit Evidence` workflow with weekly/manual/path-scoped PR triggers. It preserves:

- raw `npm audit --json`;
- normalized JSON and Markdown;
- every advisory source/affected-range instance;
- `npm explain --json` chains for every vulnerable package record;
- 30-day artifacts.

It never performs a fix, lockfile mutation, issue mutation, commit or push.

TDD RED:

```text
head:                2be6e19ee3b00218135d0f350acea7e0b9d4d748
Build:               #685 / 30858133181 — expected FAILURE
failure:             missing generator and workflow
```

Final evidence:

```text
exact head:          23cffa3bd863de70fd70fa2bd8d1aa4a5c8a64a1
squash:              9055ed182c7590643a09533c9d4011bada84d399
Build:               #690 / 30858629038 — SUCCESS
CodeQL:              #137 / 30858629067 — SUCCESS
Dependency Review:   #118 / 30858629031 — SUCCESS
Dependency Audit:    #4 / 30858629032 — SUCCESS
unit tests:          330 PASS / 0 FAIL
audit artifact:      8873443014
artifact digest:     sha256:e65d636ff062dd64c4dbe983a14edbac9c514a1e2efce3b4411ce0fc2ba8765b
```

Measured exact lockfile state:

```text
9 package records
3 high
6 moderate
0 critical
```

High records came from `undici@7.28.0`, vulnerable `brace-expansion@2.1.3` / `5.0.8`, and propagated `minimatch`. Moderate records came from the known `markdown-it@13.0.2` / Diplodoc family.

### PR #94 — high-severity audit remediation

Applied compatible patch-only overrides:

```text
brace-expansion 2.1.3 → 2.1.4
brace-expansion 5.0.8 → 5.0.9
undici         7.28.0 → 7.29.0
```

A temporary branch-only contents-write workflow generated an npm integrity-safe lockfile and was deleted before final CI. The merge scope contained only `package.json`, `package-lock.json` and the permanent security contract.

TDD RED:

```text
head:                edd6501a2e41b15739af2974bfdc3d2d95002894
Build:               #691 / 30859103405 — expected FAILURE
unit tests:          330 PASS / 1 expected FAIL
violations:          brace-expansion@2.1.3, brace-expansion@5.0.8, undici@7.28.0
```

Final evidence:

```text
exact head:          ef47f18d52ca2d3e334e3c95d8fa312f167cc217
squash:              2e1bbd8e4b8e8e77319691a785f5ce14402f3389
Build:               #695 / 30859354170 — SUCCESS
CodeQL:              #143 / 30859354188 — SUCCESS
Dependency Review:   #123 / 30859354189 — SUCCESS
Dependency Audit:    #7 / 30859354182 — SUCCESS
unit tests:          331 PASS / 0 FAIL
Lighthouse:          100 / 100 / 100 / 100
quality artifact:    8873810664
quality digest:      sha256:e2fb7c614257c4dbd7b5eaa091fca4eb236be8bf717eadc17b810d6bbaa3fd17
audit artifact:      8873716981
audit digest:        sha256:0fe1ca448dbe00eeeba54fe89bea1efbb99d6428c5e7fda2c110cf0814f9e765
```

Final audit:

```text
6 package records
0 high
6 moderate
0 critical
```

The propagated minimatch high record disappeared with the corrected brace-expansion nodes. Issue #82 remains open only for the moderate markdown-it/Diplodoc compatibility blocker. No forced fix, local shim or unreviewed fork was used.

---

## P2.4k — Restart and Persistence as Product Contract — DONE

Published:

**«Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence»**

Canonical route:

`landing/notes/restart-persistence-is-a-product-contract.html`

The Note separates storage durability, structural readability, semantic continuity and behavioral continuity. Evidence uses VillAIgence PR #66/#67 live persistence checks, startup rollback PRs #92/#95/#102, PR #103 GameTest lifecycle and PR #104 exact production-JAR two-JVM restart.

```text
feature PR:          #89 — MERGED
exact feature head:  e73a94d5d2b832d188e62b8790b4d039ac797a44
squash:              40af9e52237f03da58355caa065a40b64ad597d8
Build:               #680 / 30856377655 — SUCCESS
CodeQL:              #124 / 30856377996 — SUCCESS
Dependency Review:   #108 / 30856377653 — SUCCESS
unit tests:          327 PASS / 0 FAIL
Lighthouse:          100 / 100 / 100 / 100
```

PR #104 remains automated no-mutation production-JAR restart evidence, not completed provider/multiplayer/manual cumulative acceptance.

---

# 2026-08-03

## P2.4j — Deterministic Authority Around Probabilistic Proposals — DONE

Published **«AI может предложить, но не применить: как строить deterministic authority»**.

```text
feature PR:          #87 — MERGED
exact feature head:  b38d225d837e5e347184ca09c685a479923ba06e
squash:              2fba404bbca9680d934f11f30c8a76347a5ab7b1
Build:               #668 / 30853751417 — SUCCESS
unit tests:          324 PASS / 0 FAIL
```

Accepted Vlezet M7.8B remains separate from Draft M7.8C. VillAIgence server authority remains separate from provider/model proposal and manual cumulative acceptance.

## P2.4i — Installed Acceptance Engineering Note — DONE

Published **«От source tests к installed acceptance: что доказывает каждый release gate»**.

```text
feature PR:          #85 — MERGED
exact feature head:  9d9fcff92c9a9826391028b2f2e25c524e7463ea
squash:              c03f8403b77df5a91238d62bd8a143c046511a92
Build:               #655 / 30833707629 — SUCCESS
unit tests:          321 PASS / 0 FAIL
```

## P2.4h — Product Evidence Reconciliation — DONE

Vlezet M7.8B was recorded as accepted with F1 `0.837989`; VillAIgence PR #103 GameTests and PR #104 production-JAR restart were recorded as separate evidence layers.

```text
feature PR:          #83 — MERGED
exact feature head:  e50495e7f988e362905c7b137efd6541e7f94e33
squash:              5978f727206fa386e9cce18c26c9ba7b7eade2eb
Build:               #641 / 30829739512 — SUCCESS
unit tests:          318 PASS / 0 FAIL
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

After every major milestone synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`. These snapshots never substitute for actual repository state, exact-head CI, Pages deployment, production DNS/TLS, source-project acceptance or provider telemetry.
