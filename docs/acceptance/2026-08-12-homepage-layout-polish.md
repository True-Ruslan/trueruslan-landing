# Homepage layout polish — production acceptance

Date: **2026-08-12**

Status: **N2 DONE / PRODUCTION ACCEPTED**

## Scope

N2 refined the existing homepage bridge layout without introducing another layout/runtime owner or changing route, content, locale, search, privacy or evidence semantics.

The dedicated browser gate reproduced three concrete presentation defects before the final CSS correction:

- inter-transition rhythm: `32 / 84 / 32 px`;
- first desktop bridge copy/action center delta: `50.5 px`;
- remaining desktop copy-to-CTA gap after vertical/rhythm correction: `233 px`.

The accepted correction is intentionally bounded:

- bridge copy and actions are vertically centered;
- the missing bridge-to-collaboration adjacent spacing selector is restored;
- bridge actions remain near their copy instead of being forced to the remote right edge;
- tablet/mobile stacking and semantic content ownership are unchanged.

## TDD and exact-head acceptance

Final feature head:

```text
d580312fd1af9321fa3eb258994c792d2a299a64
```

Quality/security gates:

```text
Build:                           #1989 / 31642255697 — SUCCESS
Dependency Review:               #1410 / 31642255660 — SUCCESS
CodeQL:                          #1549 / 31642255702 — SUCCESS
homepage layout browser smoke:   SUCCESS
visual regression:               SUCCESS
review threads:                  clean / resolved
```

The intentional geometry change was visually reviewed from CI evidence. Only `home-desktop.png` and `home-mobile.png` in the existing bounded visual-baseline override were updated; the global visual-regression threshold was not weakened.

An earlier CodeQL review finding in the test RegExp helper was fixed with complete metacharacter escaping before final acceptance.

## Merge and deployment acceptance

```text
PR:                              #221
accepted squash / deployed SHA:  d2911b416c6bc500a8a9543e636ae045d37869e9
Pages:                           #243 / 31642904089 — SUCCESS
Production Live Smoke:           #538 / 31642903876 — SUCCESS
```

Production Live #538 resolved the exact successful Pages deployment for the same SHA and passed the deployed baseline smoke, Yandex pre-consent, Portfolio Platform, flagship normalization, English Now, English Publications, Work with me, P3.4A–F, favicon and deployment-identity checks.

## Evidence boundary

This is presentation acceptance only. It is not evidence of SEO, ranking, CTR, engagement or conversion improvement.

External-state boundaries remain unchanged:

- controlled launch: `not-published`;
- P4.1B: `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE`;
- P4.1C: `WAITING`;
- P3.6: `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- clean-URL observation clock: `2026-08-05T00:00:00Z`.

## Next bounded slice

Proceed with **N3 + N3b + N3c**: Work with me visual polish, Now intro framing, and current-versus-historical professional context reconciliation. That work must use existing Resume facts as canonical detail and preserve generated current-state ownership for volatile project status.
