# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4B Clean URLs Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; product specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## 2026-08-05 — P3.4B Clean URLs without Cloudflare routing

PR #128 опубликовал grounded Engineering Note:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

Добавлено:

- объяснение repository-native directory URLs;
- Diplodoc `<base href>`, `router.pathname` и `router.depth` migration;
- canonical/hreflang/OpenGraph/Sitemap/Atom/generated-search identity contract;
- Cloudflare как DNS/CDN/analytics, но не application router;
- явная граница GitHub Pages HTTP 301;
- legacy `.html` `noindex,follow` compatibility preserving query and fragment;
- verified fact / engineering inference / limitation;
- Notes Registry, index, toc, metadata, clean route, Atom feed и search integration;
- deployment-only P3.4B route/canonical/legacy/feed/search smoke.

```text
PR #128 RED head:              4d14dd6842423a17f12d8cb2734df36cdb162b41
RED Build:                      #934 / 31020006933 — expected FAILURE
RED result:                     384 PASS / 3 expected FAIL
PR #128 exact head:            dd1911ebbc5faf66a56144c75dd45215b4042293
PR #128 squash:                4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb
Build:                          #945 / 31021101326 — SUCCESS
CodeQL:                         #426 / 31021101539 — SUCCESS
Dependency Review:              #373 — SUCCESS
Distribution Readiness:         #60 — SUCCESS
PR-safe Production Smoke:       #122 — SUCCESS
unit tests:                     388 PASS / 0 FAIL
quality artifact:               8936766318
quality digest:                 sha256:38d1a612b9e684a2faccf71f889217933b115434391a5e60a5baff49b746178d
Pages deployment ID:            5764711503
Production Live Smoke:          #123 / 31021657939 — SUCCESS
baseline/platform/flagship/P3.4A/P3.4B/favicon smokes: PASS
production artifact:            8936914548
production digest:              sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51
```

Production verified the exact squash SHA. Search-engine observation remains delayed external state; no Google/Yandex completion claim was introduced.

## 2026-08-05 — P3.4A Deployment success is not production verification

PR #125 опубликовал Note:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

```text
PR #125 RED head:              688b98a58937dbf9b5c9f45667d4cfdef1327294
PR #125 exact head:            9c0a24c6adfd1794adc70facdc1ace4dc01a3d86
PR #125 squash:                c4f3cb5a3aa71b958d906d15eb975833b46d3571
Build:                          #922 / 31014792446 — SUCCESS
quality artifact:               8934487200
quality digest:                 sha256:61fde2c53551057d5d01b9f409d86c0aa50be6b20f8de3a4e9ae0b66988126ad
Production Live Smoke #108:    FAILURE — verifier defect
```

PR #126 удалил stale hard-coded flagship evidence и перевёл verifier на canonical registry.

```text
PR #126 RED head:              43ccee7b09220000660e425ea32cc87938a7b653
PR #126 exact head:            50a7185d799eea96adb7dcea8cd20e9e9a400784
PR #126 squash:                0a1cd6ad40870366fecfdce3bbdae7e8722b2119
Build:                          #927 / 31016127657 — SUCCESS
quality artifact:               8934699715
quality digest:                 sha256:607a2d901e77ebe5862fd760393f6a4435699dd69d1dc8abb910007fc0611b52
Pages:                          #156 / 31016942589 — SUCCESS
Pages deployment ID:            5763802525
Production Live Smoke:          #114 / 31017023851 — SUCCESS
production artifact:            8935003712
production digest:              sha256:23f344e3562d6b61106c8dc59a4b3e9ce2293192555c9f31ac09e7eb9916d480
```

## 2026-08-05 — External project evidence reconciliation

PR #124 обновил bounded VillAIgence/Vlezet evidence без promotion Draft work.

- Vlezet M7.8B accepted; M7.8C PR #42 и PR #44/#45 remain Draft/pending owner gates.
- VillAIgence candidate `0.1.25+1.21.1`; PR #103/#104/#108 bounded automated evidence; PR #110 Draft.

## 2026-08-05 — P3.3 Flagship normalization

```text
PR #122 RED head:              f2c5b065a8f1a1cd8adbad6ebb4ed7743cb33ad7
PR #122 exact head:            ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
PR #122 squash:                c90a221a21f51e897661667f981483bad922ad0d
Build:                          #893 / 31005675334 — SUCCESS
quality artifact:               8930321636
quality digest:                 sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
Pages:                          #152 / 31006504250 — SUCCESS
Pages deployment ID:            5761717586
Production Live Smoke:          #95 / 31006557622 — SUCCESS
production artifact:            8930571510
production digest:              sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Normalized `/landing/projects/livingworld/`, `/landing/projects/vlezet/` и `/en/projects/livingworld/` to one evidence-first contract.

## 2026-08-05 — P3.2 TrueRuslan Landing flagship

```text
PR #119 head:                  6736c9fd917f213621e5e88273304dda8ddda760
PR #119 squash:                d11aeddeed492dce512e123d216e0191a5906ca9
Build:                          #868 / 30998184982 — SUCCESS
PR #120 head:                  c2fa3327061148b5e4adf703bd707d6925639df3
PR #120 squash:                dcb278cb4f52d5e8afc314a9f30689edb5153af0
Build:                          #869 / 30998966087 — SUCCESS
Pages deployment ID:            5760275658
Production Live Smoke:          #80 / 30999331791 — SUCCESS
production artifact:            8927580319
production digest:              sha256:71198afc2ae475a9322ee74f5ea54a5b2190baa884cc8f54da01de7efdf21e08
```

Added `/landing/projects/portfolio-platform/`, `/en/projects/portfolio-platform/` and scoped `main.dc-doc-page__content` verification.

## 2026-08-05 — P3.1 Homepage evidence paths

```text
PR #117 squash:                fe1a796df37313401c07e25c0672dc32db30a1c4
Build:                          #836 / 30989449993 — SUCCESS
Pages:                          #147 / 30989921979 — SUCCESS
Production Live Smoke:          #58 / 30989981685 — SUCCESS
```

## 2026-08-05 — Repository-native clean URLs

PR #114 created directory artifacts and PR #115 aligned production verification.

```text
PR #114 squash:                cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:                          #822 / 30962673977 — SUCCESS
PR #115 squash:                4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Production Live Smoke #52:      SUCCESS
```

Canonical routes include `/landing/resume/`; legacy `.html` remains static compatibility.

## Earlier platform foundation

Completed before Portfolio 1.0:

- Photo Stories;
- Sources Registry / Knowledge Base;
- Project Evidence and Content Freshness;
- browser/accessibility/cross-browser/visual quality harness;
- RU/EN layer;
- privacy-friendly analytics;
- custom domain and HTTPS;
- Publications, `/now`, Engineering Map and generated search;
- dependency audit and Production Live Smoke;
- distribution/external profile controls;
- resume/PDF and favicon contracts.

## Current operational boundaries

- issue #111 — Yandex Webmaster operator actions and delayed indexing observation;
- issue #78 — older generated report until default-branch Content Freshness owner run;
- issue #82 — Diplodoc/markdown-it dependency review on or after 2026-08-17;
- no legacy cleanup before observed index migration;
- Draft external-project evidence is not accepted product evidence.
