# Portfolio Clarity C6 — final EN/SEO reconciliation — PRODUCTION ACCEPTED

> Accepted: 2026-08-11
> Accepted deployed SHA: `4751e14f4464b1c55153bf8803d7367d67b5fa7b`
> Durable state only; this ledger does not start, reset or close P3.6 Measurement.

## Exact evidence

- feature PR: #195 — MERGED;
- feature exact head: `3104089b500e1f680117eb86e14347f3a7309b35`;
- TDD RED Build #1761 / `31468805456` — expected FAILURE, 671 PASS / exactly 6 C6 FAIL;
- final feature Build #1783 / `31471924720` — SUCCESS;
- feature quality artifact `9093868321`, digest `sha256:48409af7a388f1eee24cbbf79026078f2105ad3a3c591af102e1b2efbce0b229`;
- CodeQL #1327 / `31471924729` — SUCCESS;
- Dependency Review #1211 / `31471924711` — SUCCESS;
- feature squash: `3bed9077ea02f50d1e2d0bb13cc3430174486a7e`;
- first C6 Pages #220 / `31472663458` — SUCCESS, but Production Live #490 / `31472764023` correctly failed only on a stale deployed English Now search oracle, so this SHA was not accepted;
- production-verifier correction PR: #196 — MERGED;
- correction RED Build #1784 / `31472974712` — expected FAILURE, 677 PASS / exactly 1 hotfix FAIL;
- correction exact head: `ffadb765ac29ffad4988727c980be7bffc0dd58a`;
- correction Build #1785 / `31473097553` — SUCCESS;
- correction quality artifact `9094266213`, digest `sha256:39dc83dd0a565bf7b628d6032b144bbf627b05cf3615a497661bbe0de6f8b877`;
- correction CodeQL #1330 / `31473097480` — SUCCESS;
- correction Dependency Review #1213 / `31473097505` — SUCCESS;
- accepted squash / exact deployed SHA: `4751e14f4464b1c55153bf8803d7367d67b5fa7b`;
- Pages #221 / `31473635637` — SUCCESS;
- github-pages deployment `5847044248` — success;
- Pages artifact `9094332009`, digest `sha256:fc7deaf6764a48f676c89cfaefdc1e210ebe0d37d064af3c792f06590c72ef7e`;
- Pages production verification reports `9094335892`, digest `sha256:4bdef3935198ac59c323183827d89762f66b2aec0e9420492dd27ada83397293`;
- deployment-triggered Production Live #493 / `31473689705` — SUCCESS;
- P3.5B English Now deployed smoke — PASS;
- production-live artifact `9094397196`, digest `sha256:1d3c3b4cb6f068b2bb9e755ea17cc466f7afe4306e899d690b1d63c3ce5ec27f`.

## Accepted product boundary

C6 closes the approved final English/SEO reconciliation slice without creating parallel owners:

- all **13 controlled RU/EN pairs** are exercised by browser acceptance derived from canonical `data/i18n.json`, including canonical/hreflang and no-JavaScript behavior;
- top-level English Projects/Now and professional links use natural user-facing language, paired EN routes where they exist and explicit labels for deliberate RU-only deep links;
- existing `data/page-meta.json` remains the canonical metadata owner; C6 adds generated browser coverage for EN home/Experience rather than duplicating or rewriting metadata ownership;
- one bilingual **Person JSON-LD** identity is present on RU and EN home surfaces with `alternateName: Ruslan Nemykin`, not a second Person source;
- generated search remains the sole Diplodoc site-wide search owner;
- the deployed **English Now** production verifier now searches stable user-facing copy (`short snapshot`) while preserving exact `/en/now/`, rendered, no-JS, canonical/hreflang, project-link and diagnostics assertions.

Static-first architecture, clean URLs, privacy/Metrica, accessibility, visual thresholds and evidence ownership remain unchanged.

## Measurement boundary

C6 acceptance is presentation/runtime/SEO-contract acceptance, not evidence that engagement, conversion or SEO improved. It does not start, reset or close P3.6 Measurement. P3.6 remains **NEXT / WAITING** for sufficient real equal-duration `operator-observed` aggregate evidence and human review.

Next redesign slice: **C7 — production baseline + P3.6 handoff**.
