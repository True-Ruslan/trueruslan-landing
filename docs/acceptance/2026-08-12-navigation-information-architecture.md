# Navigation information architecture — production acceptance

Date: **2026-08-12**

Status: **PRODUCTION ACCEPTED**

This ledger records the exact implementation, repository verification, Pages deployment and deployment-triggered production verification for the Navigation Information Architecture cleanup approved in #216 and implemented in #217.

## Accepted product contract

- visible Diplodoc sidebar roots: `Проекты → Опыт → Материалы → Работа со мной → Обо мне`;
- `Материалы` is a first-class RU hub containing `Публикации`, `Engineering Map`, `Engineering Notes` and `Источники`;
- `Engineering Notes` keeps `Все заметки` first and preserves the complete existing note tree;
- `Обо мне` contains `Сейчас`, `Фото`, `Контакты`;
- the existing English TOC branch remains build-owned but `hidden: true`; direct EN routes and the top-right language selector remain available;
- RU standalone/generated header navigation points `Материалы` to the Materials hub;
- no new runtime navigation owner, dependency, locale build, site-wide search index or browser-language redirect was introduced.

## TDD and exact-head verification

```text
PR:                              #217
approved design:                 #216
initial RED:                     751 PASS / 3 expected FAIL
second RED:                      754 PASS / 1 expected FAIL
final feature head:              3900b9ad4444c0ba529fed33fada53490033cf8b
Build:                           #1976 / 31624469154 — SUCCESS
Dependency Review:               #1397 / 31624469139 — SUCCESS
CodeQL:                          #1533 / 31624469226 — SUCCESS
Distribution Readiness:          #201 / 31624469136 — SUCCESS
quality artifact:                9152770039
quality digest:                  sha256:9c41388ea300522db106809238222c80e7ef84763bbd85cc4b21f5a30675a14a
Navigation IA browser smoke:     PASS
Visual regression:               PASS
```

The only reviewed visual baseline change was the mobile Resume bottom prev/next navigation caused by the approved TOC order. The unrelated Projects sample was preserved byte-for-byte after CI caught an accidental manual transcription drift.

## Exact production acceptance

```text
accepted squash / deployed SHA: 9831521d5d248fa01c491e3cec031cef07fc8ec5
Pages:                           #240 / 31626103994 — SUCCESS
Pages deployment ID:             5874711313
Pages artifact:                  9153170230
Pages artifact digest:           sha256:268dc1d0c36b6e70998cd12b10304068e703cc6d8b69c8fb4078a84cb4ed81da
Pages verification reports:      9153176713
Pages reports digest:            sha256:40dfbddb658f6f894caff1d320bf71b7d61b961835cbefcb0bfc175db4f585ac
Production Live Smoke:           #533 / 31626170633 — SUCCESS
production artifact:             9153258510
production digest:               sha256:a4b26ea2fbb75850b7f38d979f7888d0167f3407b6eb6566449e7384c8787fef
```

Deployment-triggered Production Live #533 resolved the exact successful Pages deployment and passed baseline production availability, Yandex pre-consent, Portfolio Platform, flagship normalization, English Now, English Publications, Work with me, P3.4A–F and favicon gates before preserving the Pages deployment identity and uploading evidence.

## Evidence boundaries

This acceptance proves the deployed Navigation IA and its bounded compatibility/quality contracts. It does **not** prove search ranking, CTR, engagement, conversion or causal product impact.

The change does not alter external-evidence state:

- controlled launch remains `not-published`;
- P4.1B review remains **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**;
- P4.1C remains **WAITING**;
- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**;
- clean-URL observation clock remains `2026-08-05T00:00:00Z`.

A later documentation-only deployment must not replace the product acceptance identity above.