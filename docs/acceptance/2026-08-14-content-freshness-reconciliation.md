# 2026-08-14 — Content Freshness reconciliation

Status: **PR acceptance in progress**

This ledger records the bounded reconciliation of the public project-evidence snapshots that were reported by Content Freshness issue #78. It does not promote lifecycle, installed acceptance, publication state, search impact or private evidence by inference.

## Reconciled boundaries

### Vlezet

- Registry lifecycle remains `pre-production` / `ACTIVE DEVELOPMENT`.
- M8.2 precision drawing and structural editing is now recorded as product-owner accepted and protected squash-merged by PR #87 as `e323e331a435ae356b91decbdea80dde95028d8a`.
- PR #88 is recorded as the post-merge truth reconciliation.
- The current engineering next boundary is the project-wide testing-policy and coverage audit before M8.3. M8.3 being technically unblocked does not change lifecycle.

### VillAIgence / livingworld

- Registry lifecycle remains `release-candidate` / `ACCEPTANCE IN PROGRESS`.
- Official release is `0.3.1+1.21.1`, release commit `bc7c68ac2f3a4f761aa3b03a2f5c1fe1201745ab`.
- Fabric JAR SHA-256 is `f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f`.
- PR #165 is recorded as the bounded targeted Memory 2.0 recall correction; PR #167 is the installed corrective acceptance handoff.
- Automated release/post-release gates are green, but installed `VAI-PCM-MULTI-001` remains **PENDING**. No installed 0.3.1 acceptance is claimed.
- Historical installed `0.2.0+1.21.1` evidence remains `7 PASS / 0 FAIL`; `VAI-M2-INST-005` remains NOT TESTED / automated-only and `VAI-CONCUR-004` remains NOT TESTED / DEFERRED.
- 0.4 stays blocked until real installed corrective evidence exists.

### Portfolio Platform

- Registry lifecycle remains `production`.
- Current production baseline is reconciled to master `f0e489d75f5bcb1f64057e1046faad877bf3f952` after N6 production acceptance and canonical state reconciliation.
- PR #234 records the Work with me production-verifier correction; PR #237 records canonical PROJECT_STATE / ROADMAP / CHANGELOG reconciliation.
- Controlled launch remains `not-published`.
- P4.1B remains `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE`; P4.1C remains `WAITING`; P3.6 remains `NEXT / WAITING FOR EXTERNAL EVIDENCE`.
- No SEO, ranking, engagement or causal product-impact conclusion is introduced.

### Node Zero

- Trust state remains `stale` / `REVIEW REQUIRED`.
- The 2026-08-14 date records an explicit freshness review of the controlled snapshot, not a product verification or acceptance event.
- No new authoritative private-repository or executable acceptance evidence was available in the portfolio evidence boundary.
- July production-foundation acceptance therefore remains the last positive executable evidence; no lifecycle, version or acceptance claim is promoted.

## TDD / contract reconciliation

The first PR-head Build after updating canonical evidence correctly exposed 15 stale current-state assertions that still encoded the previous 2026-08-12 snapshot (Vlezet M8.2 Draft, VillAIgence 0.2 as the current official release, and the older Portfolio production baseline). Those failures were treated as RED evidence: the tests were updated to assert the new reviewed truth while preserving every lifecycle and external-evidence boundary above.

The updated contracts explicitly require:

- Vlezet M8.2 accepted while the project remains pre-production;
- VillAIgence 0.3.1 published while installed corrective acceptance remains pending and 0.4 blocked;
- Portfolio N6 production baseline while controlled launch remains not-published and P3.6/P4.1C remain evidence-gated;
- Node Zero remaining stale with an unavailable/manual freshness-review signal and no invented acceptance.

## Freshness evidence

On the data reconciliation head `12b4361cefbdcdb69cd69ba4c5c9682496e93dba`, Content Freshness run `31783136817` completed successfully. Artifact `9212463519` (`content-freshness-report`) has digest:

`sha256:0978a25f4d92b294efc33e6895e7724e71c9982c8b467468453c8e74ab6332a6`

Its deterministic summary is:

```text
total:   0
info:    0
warning: 0
error:   0
findings: []
```

A fresh exact-head Build, Dependency Review, CodeQL and Content Freshness run is required after the current-state contract updates. Merge and issue #78 closure are allowed only after those exact-head gates are green. Post-merge production acceptance remains a separate required boundary.
