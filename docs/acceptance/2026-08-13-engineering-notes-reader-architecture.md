# Engineering Notes Reader Architecture — Production Acceptance

Date: **2026-08-13**  
Status: **PRODUCTION ACCEPTED**

## Accepted scope

This ledger records the bounded N5 Engineering Notes reader-architecture implementation selected by audit PR #227 and design PR #228.

Accepted behavior:

- `/landing/notes/` remains the single public Notes hub;
- `data/notes.json` remains the canonical per-Note registry;
- all 16 current Notes remain published on their existing URLs;
- every Note has validated `series`, `seriesOrder` and `readerRole`;
- the hub renders one compact `С чего начать` block, three guided reader series and the complete chronological `Все заметки` catalogue;
- established meaningful related-reading edges are preserved and every Note has at least one inbound/outbound registry path;
- the four N5 zero-inbound deep dives receive deliberate inbound paths;
- six audited scan-copy descriptions are clarified without new factual claims;
- enhanced and no-JS representations expose the same reader architecture;
- existing generated search, Atom feed, canonical, clean-route, sitemap and metadata ownership remain unchanged.

Not introduced:

- no Note deletion, merge, redirect or canonical consolidation;
- no runtime content API;
- no client-side filtering requirement;
- no second Notes/series manifest;
- no second search owner;
- no SEO, ranking, CTR, engagement or conversion claim.

## TDD evidence

Initial RED head:

```text
15a54a2d152e77429fd440cefe379a5504ef5f66
```

Build #2035 intentionally failed at `Test` with **778 PASS / 4 FAIL**. The failures were exactly the new reader contracts: reader-schema validation, exact series assignment, inbound graph completeness and hub reader rendering. Production manifest/renderer remained unchanged at that RED stage.

Existing regression tests subsequently surfaced accepted historical related edges and integration-fixture assumptions. The implementation preserved those historical relationships and upgraded the fixtures to exercise the same strict reader schema rather than weakening production validation.

## Exact-head acceptance

```text
final feature head:     b5567fdd14430c67746da2dbbbfb0dee1f491470
Build:                  #2044 / 31685171581 — SUCCESS
Dependency Review:      31685171386 — SUCCESS
CodeQL:                 #1612 / 31685171699 — SUCCESS
quality artifact:       9175280938
quality digest:         sha256:eb367d8b81ca203b54d58d4b474d699ec64f4ca6f07f0988c5c5f162b42dc025
```

The exact-head matrix passed unit/contract tests, production-like docs build, generated-site integrity, mobile overflow, browser accessibility + Lighthouse, dedicated Publications/Sources/Engineering Notes/Project Evidence smokes, Firefox/WebKit compatibility, RU/EN + generated search, privacy/Metrica, metadata/OpenGraph, Engineering Map, visual regression, custom-domain artifact and Search Discovery readiness.

Dedicated Notes reader browser evidence:

```text
enhanced mobile: 16 catalogue / 3 Start here / 3 series / 16 guided / 0 overflow / 0 serious-critical Axe
no-JS desktop:    16 catalogue / 3 Start here / 3 series / 16 guided / 0 overflow
```

CI screenshots were manually reviewed. A large blank region above the no-JS fallback was compared against the previously accepted N5 audit screenshot and confirmed to be pre-existing Diplodoc no-JS shell behavior rather than a regression introduced by PR #229.

## Exact production acceptance

```text
PR #229 squash / deployed SHA:  1a0db35795aea1ea966e1452bcdb106bb5419ba1
Pages:                           #251 / 31685895669 — SUCCESS
GitHub Pages deployment:         5885271220
Pages artifact:                  9175388951
Pages artifact digest:           sha256:68b36f9f44ea475cbb344d1a39c10fde67ecd3a837f280e17b66b9ff122b9200
Pages verification reports:      9175392494
Pages reports digest:            sha256:556786a26ecb3dce249ace8cf86c48ab8a23e773ae0934589a4246f7b7d781f5
Production Live Smoke:           #556 / 31685963890 — SUCCESS
Production Live artifact:        9175455505
Production Live digest:          sha256:1a08c34a1bc911ee78771528efa1808dd8e6a9e95b8a1c69fda025bbe72c673d
master CodeQL:                   #1613 / 31685895573 — SUCCESS
```

Repository readiness, feature-head acceptance, merged deployment and production observation all resolve to the intended bounded reader architecture.

## External-state boundary

This acceptance does **not** change external evidence or publication state:

- controlled launch: `not-published`;
- P4.1B: `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE`;
- P4.1C: `WAITING`;
- P3.6: `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- clean-URL observation clock: `2026-08-05T00:00:00Z`.

The next operator action is the already-prepared deliberate controlled manual launch. Search/copy/internal-link changes after that remain evidence-gated.
