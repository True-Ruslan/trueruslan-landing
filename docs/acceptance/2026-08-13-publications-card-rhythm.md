# Publications card rhythm — production acceptance

Date: **2026-08-13**

Status: **N4 DONE / PRODUCTION ACCEPTED**

## Scope

N4 fixes the Publications card rhythm requested in the portfolio UX/content polish plan without changing publication data, renderer semantics, canonical external URLs, locale ownership, analytics/search ownership, or launch state.

The accepted presentation change is intentionally bounded:

- featured cards share natural grid rows for metadata, title, summary, topic chips, and actions;
- different title/summary lengths no longer push topic chips to visibly different vertical positions;
- topic chips have stable line metrics and can shrink/wrap safely inside narrow cards;
- the previous featured-card `margin-top: auto` alignment hack is removed;
- catalogue cards, RU/EN content, and no-JS fallback semantics remain unchanged;
- no fixed card heights, truncation, visual-regression threshold changes, or baseline exceptions were introduced.

## TDD evidence

RED head:

```text
302c815604a858f3be3854ad307d1adc9b3ff19c
```

RED Build `31676746567` failed at `Test` only on the new N4 contract: **765 pass / 3 expected N4 failures**. The failures reproduced the old flex layout, missing topic-row alignment contract, and `margin-top: auto` action hack before implementation.

Final feature head:

```text
07eea3efa06d723c2ee3663ff057dff9b3c844b0
```

Exact-head quality/security gates:

```text
Build:                         #2026 / 31677127726 — SUCCESS
Dependency Review:             SUCCESS
CodeQL:                        SUCCESS / no new alerts
Publications browser smoke:    SUCCESS
browser accessibility:         SUCCESS
Lighthouse:                    SUCCESS
Firefox/WebKit compatibility:  SUCCESS
RU/EN + no-JS smoke:           SUCCESS
visual regression:             SUCCESS
review threads:                clean / resolved
```

The Publications browser smoke now verifies actual rendered geometry on enhanced desktop: featured title, summary, topics, and action rows must align within a 2 px tolerance, and every topic chip must remain inside its card bounds. This complements the source-level regression contract and prevents a CSS-only false positive.

CI screenshots for RU/EN enhanced desktop and RU/EN no-JS mobile were manually reviewed. Topic rows are visibly aligned, long chips wrap safely, catalogue cards remain natural, and no horizontal overflow is present. Existing visual baselines and thresholds were left unchanged.

## Merge and deployment acceptance

```text
PR:                            #225
accepted squash / deployed SHA: 0cb8028c5bac21c94daf8c16671d99e8f7fac38f
Pages:                         #247 / 31677844569 — SUCCESS
Production Live Smoke:         #546 / 31677844605 — SUCCESS
master CodeQL:                 #1591 / 31677844576 — SUCCESS
```

Production Live #546 resolved the successful Pages deployment for the same merged SHA and passed the deployed production matrix, including English Publications, Work with me, current flagship checks, P3.4A–F notes, favicon, Yandex pre-consent, and deployment-identity verification.

## Evidence boundary

This is presentation and production acceptance only. It is not evidence of SEO, ranking, CTR, engagement, or conversion improvement.

External-state boundaries remain unchanged:

- controlled launch: `not-published`;
- P4.1B: `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE`;
- P4.1C: `WAITING`;
- P3.6: `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- clean-URL observation clock: `2026-08-05T00:00:00Z`.

## Next bounded slice

Proceed with **N5 Engineering Notes audit** as a research/inventory slice first. Classify notes by depth, evidence, intent, overlap, and internal-link role before proposing any merge, redirect, consolidation, or route change. Sparse pre-launch search evidence must not be treated as proof that separate-note SEO is succeeding or failing.
