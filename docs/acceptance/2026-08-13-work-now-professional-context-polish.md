# Work with me / Now / professional context — production acceptance

Date: **2026-08-13**

Status: **PRODUCTION ACCEPTED**

This ledger records the exact implementation, repository verification, GitHub Pages deployment and deployment-triggered production verification for the approved N3 / N3b / N3c slice implemented in PR #223.

## Accepted product contract

- `Работа со мной` / `Work with me` uses a lighter scan-first presentation while preserving the existing collaboration truth, handoff, no-pricing boundary and no-JavaScript fallback;
- the three work tracks and three-step process remain explicit; ordered-list semantics are preserved while `01 / 02 / 03` is the only visible numbering layer;
- `/now/` and `/en/now/` lead with short public framing instead of an internal-status-style callout;
- generated Now project truth remains build-owned and is presented with readable measure and a lighter visual boundary rather than a heavy status panel;
- QWEP remains the current full-time commercial context in RU/EN public framing and the canonical Resume/Experience timeline;
- MarketDB remains professional history but is explicitly a closed historical independent commercial/startup project and is no longer presented as current commercial work;
- no MarketDB closing date was invented;
- no runtime/API/search owner, pricing model, analytics state, canonical URL or project lifecycle was changed.

## TDD, debugging and exact-head verification

```text
PR:                              #223
slice spec:                      docs/superpowers/specs/2026-08-13-work-now-professional-context-polish.md
final feature head:              0646b8119499dffa4c2a54ac6c2e56dd413042c0
Build:                           #2022 / 31652306145 — SUCCESS
Dependency Review:               #1443 / 31652306087 — SUCCESS
CodeQL:                          #1584 / 31652306300 — SUCCESS
quality artifact:                9163181951
quality digest:                  sha256:4188662e15999ee9ab5c2ba779091edb9c9d40634acefcc5f617eb7a0a3805d1
Work with me browser/no-JS/a11y: PASS
Firefox/WebKit compatibility:    PASS
RU/EN minimal/i18n smoke:        PASS
Visual regression:               10 / 10 PASS
```

The slice preserved multiple intentional RED stages. In particular, manual screenshot review found a real duplicate-numbering defect (`1. 01`, `2. 02`, `3. 03`) that source-level assertions had missed. A browser-level regression contract then reproduced the rendered/computed-DOM defect before the final fix. The accepted implementation keeps semantic `<ol>/<li>` markup, adds an explicit list role as a compatibility safeguard, suppresses the Diplodoc marker, and renders the stable `01 / 02 / 03` layer from `data-tr-work-order`.

The only accepted visual baseline changes were the reviewed Projects desktop/mobile surfaces required by the explicit MarketDB historical-context section. Global visual thresholds were not weakened.

## Exact production acceptance

```text
accepted squash / deployed SHA: 710db235c99a8cc1258eb44db0fa2c1bb3fc027b
Pages:                           #245 / 31652919904 — SUCCESS
Pages deployment ID:             5879409460
Pages artifact:                  9163262626
Pages artifact digest:           sha256:7c70bb8da7e022946d49ccfda09c2e63767637642b1f41396702129a8849af9c
Pages verification reports:      9163267620
Pages reports digest:            sha256:e12f31390fda2cd68c5386fa811063213803c622fdc4d3bfbd441febc842c459
Production Live Smoke:           #542 / 31652919885 — SUCCESS
production artifact:             9163318007
production digest:               sha256:00d3294a851eea7f3e4e377dba34aab288f37ee0ce4df5e89251a78afb020ddb
post-merge CodeQL:               #1585 / 31652919905 — SUCCESS
```

Deployment-triggered Production Live #542 resolved the exact successful Pages build for `710db235c99a8cc1258eb44db0fa2c1bb3fc027b` and passed deployed production availability, Yandex pre-consent, Portfolio Platform, flagship normalization, English Now, English Publications, Work with me, P3.4A–F and favicon gates before preserving the Pages deployment identity and uploading evidence.

## Evidence boundaries

This acceptance proves the deployed presentation/content correction and its compatibility/quality contracts. It does **not** prove search ranking, CTR, engagement, conversion or causal product impact.

External-evidence state remains unchanged:

- controlled launch remains `not-published`;
- P4.1B review remains **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**;
- P4.1C remains **WAITING**;
- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**;
- clean-URL observation clock remains `2026-08-05T00:00:00Z`.

The next bounded UX implementation slice is **N4 Publications visual cleanup**. N5 Engineering Notes remains a separate research/audit step; no note consolidation is justified by this acceptance.

A later documentation-only deployment must not replace the product acceptance identity above.
