# C1 — Presentation foundation — PRODUCTION ACCEPTED

> Date: **2026-08-09**
>
> Initiative: **Portfolio Clarity & Scanability**
>
> Scope: typography/readability foundation and five-destination primary navigation only.

## Accepted identity

- PR #174 squash / deployed SHA: `9cc9d69e6b49e3e9f3432788f0deb943d7acebf5`;
- final exact-head Build #1463 / `31304311486` — **SUCCESS**;
- CodeQL #988 / `31304311485` — **SUCCESS**;
- Dependency Review #891 / `31304311479` — **SUCCESS**;
- exact-head quality artifact `9035522999`;
- exact-head quality digest `sha256:f43c9d50609cbd0fd10fe6a099dc471fb82ff02c97ee47b68a6f7ad837ba34f1`;
- Pages #202 / `31304612906` — **SUCCESS**;
- Pages deployment `5817134996` — **success**;
- Pages verification artifact `9035545977`;
- Pages verification digest `sha256:4f0fc0a14850af002e08b4eeefc1cb1d45dcd76b3bf1d3713a656fe0a6988b0f`;
- deployment-triggered Production Live Smoke #354 / `31304642055` — **SUCCESS**;
- production artifact `9035548962`;
- production digest `sha256:41af56c91d59b5c80134d49b1928b0fde348384334c8863ddd9c74c9f4e5c85c`;
- production observation: `2026-08-09T08:55:33.810Z`.

## Accepted product boundary

C1 establishes the first production-accepted presentation foundation from the approved redesign specification:

- self-hosted **Onest Variable** with reviewed Cyrillic and Latin WOFF2 subsets, exact SHA-256 contracts and retained SIL OFL 1.1 license;
- shared readable typography tokens: `17px` desktop body target, `16px` mobile body target, `1.62` line height and `70ch` long-form width;
- exactly five semantic primary destinations in RU and EN;
- secondary knowledge/content destinations remain first-class through the content tree/sidebar;
- `.woff2` and OFL `.txt` assets are part of the generated artifact;
- no runtime Google Fonts/jsDelivr dependency;
- existing mobile overflow, Chromium accessibility/Lighthouse, Firefox/WebKit, privacy, metadata, search, custom-domain and visual-regression gates remained green without budget weakening.

The homepage visual change caused by Onest was manually reviewed before updating only the existing homepage desktop/mobile visual override baselines. Shared baselines for unrelated surfaces were not changed.

## Measurement boundary

C1 is **not** the final redesign baseline. The final accepted Portfolio Clarity & Scanability redesign remains the point after which a new post-redesign observation window may be treated as the new presentation baseline.

This acceptance **does not start, reset or close P3.6 Measurement**. P3.6 remains **NEXT / WAITING** for real equal-duration operator-observed aggregate evidence, traffic-sufficiency assessment and human review.

## Next implementation slice

The next approved slice is **C2 — Homepage structure**:

**Hero → Proof → Selected work → Experience → Writing → Work with me → Personal**

C2 must remain a separate TDD/product-acceptance boundary and must preserve the C1 typography/navigation foundation unless new evidence justifies a change.
