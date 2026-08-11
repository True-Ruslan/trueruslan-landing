# Portfolio Clarity C5 — Knowledge surfaces — PRODUCTION ACCEPTED

> Accepted: 2026-08-11
> Accepted deployed SHA: `00900e832d69356bbccaa874f1b625876dad1e21`
> Durable state only; this ledger does not start, reset or close P3.6 Measurement.

## Exact evidence

- feature PR: #193 — MERGED;
- exact feature head: `f99c4534932a86e6cac0876b4a082639786d4ad9`;
- TDD RED Build #1721 / `31404495416` — expected FAILURE, 661 PASS / exactly 5 C5 FAIL;
- final exact-head Build #1754 / `31437853159` — SUCCESS;
- quality artifact `9081845821`, digest `sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8`;
- CodeQL #1296 / `31437853182` — SUCCESS;
- Dependency Review #1182 / `31437853183` — SUCCESS;
- accepted squash / exact deployed SHA: `00900e832d69356bbccaa874f1b625876dad1e21`;
- Pages #218 / `31466807721` — SUCCESS;
- github-pages deployment `5845809144` — success;
- Pages artifact `9091830845`, digest `sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6`;
- Pages production verification reports `9091833853`, digest `sha256:606c1516529640b51cab480dd0e8a8b9347072c3a2be9b33f032419cf38e6179`;
- deployment-triggered Production Live #486 / `31466868392` — SUCCESS;
- production-live artifact `9091881791`, digest `sha256:4e3349bdbb8b44326049750074810b3f6ed150e7b6b8922bf75aee43354d93b0`.

## Accepted product boundary

C5 applies the approved scan-first presentation contract to the knowledge layer:

- **Engineering Notes** uses a concise registry-derived index from canonical `data/notes.json`, with latest-first summaries, reading time, tags and semantic no-JavaScript fallback; no second Notes index registry exists;
- **Publications RU/EN** presents Featured/published work and the generated catalogue before methodology framing while the canonical Publications Registry keeps bibliographic ownership;
- **Engineering Map** renders the graph before taxonomy explanation, preserves the reading guide after real scroll, and uses reviewed map-first visual baselines (`1440×1465` desktop / `390×2817` mobile) without changing global visual thresholds;
- **Sources** exposes the useful searchable/filterable knowledge base before meta framing while the existing Sources Registry remains authoritative.

Canonical registries, one Diplodoc site-wide search owner, clean URLs, static-first/no-JavaScript behavior, privacy/SEO ownership and evidence boundaries are unchanged.

## Measurement boundary

C5 acceptance is presentation/runtime acceptance, not evidence that engagement, conversion or SEO improved. It does not start, reset or close P3.6 Measurement. P3.6 remains **NEXT / WAITING** for sufficient real equal-duration operator-observed aggregate evidence and human review.
