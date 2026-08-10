# C2 — Homepage clarity — PRODUCTION ACCEPTED

> Date: **2026-08-10**
>
> Initiative: **Portfolio Clarity & Scanability**
>
> Scope: RU/EN homepage fast-scan hierarchy and the production verifier correction required by that hierarchy.

## Accepted identity

C2 product behavior was introduced by PR #183 and the deployment-only Work with me verifier was corrected by PR #184 after the first exact deployment exposed a stale C1 assumption.

- feature PR #183 squash: `5fe5c6e15a61e54edd39e94140c7554ba19c5203`;
- feature exact-head Build #1631 / `31341099744` — **SUCCESS**, 636 unit tests and all 31 quality stages;
- feature CodeQL #1164 / `31341099741` — **SUCCESS**;
- feature Dependency Review #1059 / `31341099743` — **SUCCESS**;
- first C2 Pages #210 / `31341477318` — **SUCCESS**;
- first deployment `5823901635` — **success**;
- first deployment-triggered Production Live #467 / `31341502294` — **FAILURE** only because `production-work-with-me-smoke.cjs` still required removed C1 `data-home-path` cards;
- verifier PR #184 exact head: `a59039c822115aaa596b6324c75ccc335b55663f`;
- verifier exact-head Build #1633 / `31341749976` — **SUCCESS**;
- verifier quality artifact `9046096931`;
- verifier quality digest `sha256:b5aa16b9698c4796917bd06d2d189ded44725c511b95861fcb4fb30609d7e737`;
- verifier CodeQL #1167 / `31341749979` — **SUCCESS**;
- verifier Dependency Review #1061 / `31341749988` — **SUCCESS**;
- verifier PR-safe Production Live #469 / `31341749983` — **SUCCESS**;
- final accepted / deployed SHA: `361543c383b394d1f4cb061a97473038972340cf`;
- final Pages #211 / `31342012579` — **SUCCESS**;
- final Pages deployment `5823994260` — **success**;
- final Pages artifact `9046113610`;
- final Pages artifact digest `sha256:c1d3dfec2f2c171ad4d224c04bb4765ef2d7d5099e2feacb6ee3bab35cb88ea1`;
- final Pages verification reports `9046115282`;
- final Pages verification reports digest `sha256:6d914edbdfb47923c30579c3be18156744b4828d768c37dcfa149dadc27796dc`;
- deployment-triggered Production Live #471 / `31342042518` — **SUCCESS**;
- production live artifact `9046144255`;
- production live digest `sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6`;
- production Work with me/C2 observation: `2026-08-09T23:31:42.924Z`.

The deployment evidence records the exact accepted SHA, successful `github-pages` deployment `5823994260`, source Pages workflow `31342012579`, and a successful deployment-triggered Production Live run.

## Accepted product boundary

The exact production homepage now implements the approved C2 scan path in RU and EN:

**Hero → Proof → Selected work → Experience → Writing → Work with me → Personal**.

Accepted behavior:

- hero front-loads `Java Backend Engineer` and `5+` years of commercial experience;
- hero exposes one primary Projects action plus Experience and Work with me;
- exactly four compact proof facts replace the former Layer-3 evidence cards in the first scan path;
- exactly three selected projects remain in the homepage spotlight;
- Experience, Writing, Work with me and Personal are compact bridges rather than equal-weight sitemap sections;
- primary navigation remains exactly five semantic destinations;
- RU Contacts remains secondary but directly reachable through the existing content tree/sidebar and footer;
- collaboration copy is positive-first while availability/contact truth continues to come from the canonical collaboration registry;
- no-JavaScript behavior, generated search, clean canonical routes, privacy/Metrica, SEO metadata and evidence ownership remain intact.

Deployment-triggered `work-with-me-production-summary.json` records for both RU and EN:

```text
proofFacts:             4
selectedProjects:       3
primaryNavigationItems: 5
collaborationBridge:    true
```

It also records zero product-side browser errors for that acceptance surface.

## Failed verifier boundary

Production Live #467 is retained as useful negative evidence. The deployed C2 product was already present, but one deployment-only verifier still encoded the removed C1 homepage contract. PR #184 changed only that production verification model and its regression contract; it did not weaken product, privacy, SEO, route or evidence requirements.

The final acceptance is therefore tied to `361543c383b394d1f4cb061a97473038972340cf`, not to the earlier feature merge alone.

## Durable synchronization TDD

The durable-state update was also performed RED-first rather than rewriting the ledgers without a contract.

- RED head: `9523de8749ab5d2c294541ffba99a9b2f828c4ae`;
- RED Build #1636 / `31371981062` — **expected FAILURE**;
- unit result: **639 PASS / exactly 1 expected FAIL**;
- the only failure was the new C2 durable-acceptance assertion requiring `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md` to record C2 and advance the redesign to C3;
- Dependency Review #1064 / `31371981054` — **SUCCESS** on the RED head;
- deterministic durable migration run `31372467517` — **SUCCESS** after a fail-closed duplicated-anchor correction;
- roadmap new-session alignment migration run `31372771271` — **SUCCESS**;
- temporary migration scripts/workflows removed themselves from the final diff.

The final PR head must still pass the ordinary repository quality/security matrix before this ledger change is merged. Green PR CI is repository acceptance for the documentation update; it does not redefine the already accepted C2 production SHA above.

## Measurement boundary

C2 remains an intermediate redesign slice. It **does not start, reset or close P3.6 Measurement**, and no engagement, conversion or causal product-impact claim is inferred from C2 shipping.

The final accepted Portfolio Clarity & Scanability redesign remains the point that establishes the new presentation baseline for the later P3.6 handoff.

## Next implementation slice

The next approved slice is **C3 — Projects and flagship summary layer**:

- Projects index hierarchy: Selected work → Commercial work → Labs & experiments;
- concise project cards instead of multi-paragraph mini-case-studies;
- one common flagship `At a glance` summary layer;
- progressive disclosure for VillAIgence, NotchHub, TrueRuslan Landing and Vlezet;
- NODE ZERO only where proprietary/public boundaries permit;
- stale TrueRuslan Landing next-step copy corrected;
- canonical lifecycle/evidence registries remain authoritative and no project lifecycle is promoted by presentation changes.
