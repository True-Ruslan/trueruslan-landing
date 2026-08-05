# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4C Hybrid CV + AI Recognition Note.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## 2026-08-05 — P3.4C Hybrid CV + AI recognition boundaries

PR #130 опубликовал grounded Engineering Note:

```text
/landing/notes/hybrid-cv-ai-recognition-boundaries/
```

Добавлено:

- `VlezetDocument` как единственный persistent geometry authority;
- local CV Draft и raw AI proposal как отдельные reviewable/untrusted layers;
- immutable batch identity через `requestId`, `referenceRevision`, `localDraftFingerprint`;
- deterministic validation и current-state revalidation;
- explicit Apply как единственная atomic mutation boundary с Undo/Redo;
- fail-closed malformed, stale, overload и provider-failure paths;
- accepted M7.8B evidence отдельно от Draft M7.8C PR #42 и stacked PR #44/#45;
- различие benchmark, browser, CI и product acceptance;
- Notes Registry, index, toc, metadata, Atom feed и generated search integration;
- отдельный exact-deployment P3.4C production smoke.

```text
PR #130 RED head:              842959fb765702a634ec0592f218f1275d3ca93e
RED Build:                      #952 / 31028991923 — expected FAILURE
RED result:                     389 PASS / 4 expected FAIL
PR #130 exact head:            731dbf0a6d217a40c17a8c8f1494f342fcb35e7e
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Build:                          #961 / 31029662846 — SUCCESS
unit tests:                     393 PASS / 0 FAIL
quality artifact:               8940244292
quality digest:                 sha256:1f3a013c543171230e0a69975e69beaf18b252ca2337a63938f692f6a7c162d9
Pages:                          #160 / 31030249235 — SUCCESS
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
baseline/platform/flagship/P3.4A/P3.4B/P3.4C/favicon smokes: PASS
production artifact:            8940409941
production digest:              sha256:9cb66c8e3b2b432c9bbdd160542f3b5566e1e3e21f3be07711f16d5f95fae700
```

No claim was introduced that M7.8C, PR #42, PR #44 or PR #45 are accepted. Representative product-owner retest remains required.

Next bounded Note:

**P3.4D — GameTests versus installed gameplay acceptance**.

## 2026-08-05 — P3.4B Clean URLs without Cloudflare routing

PR #128 опубликовал `/landing/notes/clean-urls-without-cloudflare-routing/`; PR #129 закрыл durable state.

Repository-native directory URLs, canonical/hreflang/OpenGraph/Sitemap/Atom/search migration, legacy `.html` query and fragment compatibility and delayed search-engine observation were recorded as one bounded contract.

## 2026-08-05 — P3.4A Deployment success is not production verification

PR #125 опубликовал `/landing/notes/deployment-success-is-not-production-verification/`. Production Live Smoke #108 обнаружил verifier defect; PR #126 устранил stale hard-coded evidence, после чего exact deployment прошёл Production Live Smoke #114.

## 2026-08-05 — P3.3 Flagship normalization

PR #122 нормализовал RU VillAIgence, RU Vlezet и controlled EN VillAIgence. Lifecycle и external acceptance boundaries не расширялись.

## 2026-08-05 — P3.2 TrueRuslan Landing flagship

PR #119 создал RU/EN platform case study; PR #120 закрепил production selector `main.dc-doc-page__content`.

## 2026-08-05 — P3.1 Homepage evidence paths

PR #117 сделал homepage evidence-first entry point; PR #118 синхронизировал durable state.

## Operational boundaries

- issue #111 — authenticated Yandex/search-engine observation;
- issue #78 — default-branch Content Freshness owner refresh;
- issue #82 — Diplodoc/markdown-it dependency blocker, review on or after 2026-08-17;
- no `npm audit fix --force` or unreviewed compatibility bypass.
