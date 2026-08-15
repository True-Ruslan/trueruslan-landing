# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-15**. AI Navigator engineering baseline production-accepted на `ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f`; public AI остаётся OFF. Controlled launch остаётся `not-published`; P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; P4.1C/P3.6 остаются evidence-gated.
>
> Полный changelog snapshot до 2026-08-15 сохранён byte-for-byte в `docs/archive/2026-08-14/CHANGELOG.md`.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`.

## 2026-08-15 — AI Navigator static-first engineering baseline — PRODUCTION ACCEPTED / PUBLIC AI OFF

### Design and implementation plan

- PR #248 recorded the approved static-first AI Navigator design: compact optional AI mode in the existing search surface, OFF on fresh production load, ordinary Diplodoc search preserved, semantic retrieval separate from explicit answer generation, canonical-public-content-only grounding, no database/vector database and reversible off/search/full modes.
- PR #249 converted the design into a TDD delivery plan covering deterministic corpus/benchmark, explicit static index, hybrid retrieval, mode-gated search integration, grounded answers, real provider acceptance, SEARCH canary, FULL canary and final keep/downgrade/remove verdict.

### Deterministic corpus and retrieval benchmark

- PR #250 implemented a deterministic canonical public corpus and reviewed **50-case RU/EN retrieval benchmark** with positive, paraphrase, exact-term and insufficient/private-adversarial cases.
- Corpus chunks use stable IDs, canonical URLs and content hashes; state/acceptance/private material is excluded from reader-owned corpus sources.
- During review CodeQL found two related sanitizer gaps around non-standard closing `script/style` tags. Both were reproduced before fixing:
  - RED `83380141b1f1b0eba35b4425871ce017d1a2ae0f` covered `</script >`;
  - GREEN `9854f6219ac0017d13dd8777412eca241fe5e681` closed the first form;
  - a second review exposed a broader malformed closing-tail form;
  - RED `81c9b4c58ac0dffb229e4769f42db785bb8dda3d` reproduced it;
  - final GREEN `54d78cfd0d1b817ece42086aee61062410cf59d6` changed script/style stripping to a conservative closing-tag contract and added permanent regressions.
- Final #250 exact-head Build #2204, CodeQL #1733 and Dependency Review #1568 — SUCCESS; both review conversations resolved before squash merge.

### Explicit static embedding index and hybrid retrieval

- PR #251 implemented explicit operator-only document embedding refresh, content-hash reuse, deterministic corpus artifact, Float32 embedding binary + manifest/digests, fully offline current-corpus verification and shared deterministic Node/browser hybrid ranking.
- Benchmark weight selection is gated by Recall@5 and exact-term no-regression constraints.
- Accepted corpus sanitizer regressions from #250 were preserved while adding the new `--write`/index maintenance path.
- Exact head `767b416fe980528c0a933c4d92328fbc24c98a76`: Build #2205, CodeQL #1735, Dependency Audit #267, Dependency Review #1569 — SUCCESS; no review threads.

### Optional semantic-search runtime

- PR #252 integrated a restrained AI control with the existing search surface without replacing Diplodoc ownership.
- Production OFF mode does not publish/load the AI corpus/index and makes no provider call.
- Enabled fixture/canary modes use verified static artifacts and browser-side deterministic hybrid ranking.
- A minimal stateless Worker boundary hides the OpenRouter key, validates model/dimensions, denies provider data collection, uses no-store responses and an 8-second runtime timeout; failures fall back without changing canonical content/URLs.
- PR #252 alone was explicitly not considered sufficient for public SEARCH canary because browser CORS/preflight acceptance belonged to the next layer.
- Exact head `326ab72865fabed63b6a12597e9d07770f45e0d0`: Build #2206, CodeQL #1737, Dependency Audit #268, Dependency Review #1570 — SUCCESS; no review threads.

### Grounded answers, CORS/preflight and provider-free acceptance

- PR #253 completed the OFF-by-default engineering acceptance layer.
- `/v1/answer` accepts only a question plus selected canonical chunk IDs; browser-provided context/model/provider settings are not trusted. The Worker resolves canonical public corpus context server-side.
- Strict structured answer schema, citation-subset validation and insufficient-evidence normalization prevent unsupported world-knowledge/browsing/tool fallback.
- Answer generation remains an explicit `Ask AI` action after retrieval.
- `/v1/embed` and `/v1/answer` have exact-origin CORS preflight contracts; preflight makes no provider call.
- Provider/corpus operations remain bounded, responses are no-store, and browser output uses safe rendering/fallback behavior.
- Added provider-free offline AI readiness verification, semantic benchmark cache and AI browser smoke to normal CI; real provider acceptance is a separate explicit workflow.
- Exact #253 head `8b9beacbda0e7c3042d7838b6242c790981c238f`: Build #2207 / `31905319214`, CodeQL #1739 / `31905319219`, Dependency Audit #269 / `31905319207`, Dependency Review #1571 / `31905319201` — SUCCESS; AI Navigator offline verification and browser smoke — SUCCESS.

### Final production verification

PR #253 squash produced exact deployed SHA:

```text
master / deployed SHA:            ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f
Pages:                            #272 / 31905664206 — SUCCESS
Production Live Smoke:            #618 / 31905664180 — SUCCESS
master CodeQL:                    #1740 / 31905664193 — SUCCESS
production AI mode:               off
```

Production Live #618 resolved the exact Pages deployment and passed the full deployed baseline suite. No public AI/provider/search-impact claim is introduced.

### Boundaries preserved

- public AI remains **OFF**;
- `workerBaseUrl` remains empty in production config;
- no dedicated provider key/spend cap is claimed from repository code;
- real embedding/provider acceptance and public SEARCH/FULL canaries remain future explicit gates;
- ordinary CI/build/deploy remains provider-free;
- controlled launch remains **not-published**;
- P4.1B remains **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**;
- P4.1C remains **WAITING**;
- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**;
- clean-URL clock remains `2026-08-05T00:00:00Z`.

## 2026-08-14 — Transparent `trueruslan.com` repository readiness

- PR #247 prepared a fail-closed Cloudflare alias adapter and host-preserving static/runtime same-site navigation contracts while keeping `trueruslan.ru` as the sole GitHub Pages custom domain and canonical SEO identity.
- No DNS/Cloudflare route activation, second canonical identity or live `.com` claim was introduced.
- Squash `5610584cf8333884fd64ae2aa5eec7229ea06a31` deployed successfully before the AI Navigator sequence; production smoke remained green.

## Historical record

The full pre-2026-08-15 changelog, including N1–N6, navigation, Engineering Notes reader architecture, clean URL migration, P4.1A/P4.1B readiness, dependency maintenance and earlier production acceptance evidence, is preserved unchanged at:

`docs/archive/2026-08-14/CHANGELOG.md`
