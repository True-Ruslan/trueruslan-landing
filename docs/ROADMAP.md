# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-15**. AI Navigator engineering baseline production-accepted на `ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f`; public AI остаётся OFF. Controlled launch остаётся `not-published`; P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; P4.1C/P3.6 остаются evidence-gated.
>
> Полный roadmap snapshot до этого reconciliation сохранён byte-for-byte в `docs/archive/2026-08-14/ROADMAP.md`.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; Portfolio 1.0 specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`; AI design/plan — `docs/superpowers/specs/2026-08-15-ai-navigator-static-rag-design.md` и `docs/superpowers/plans/2026-08-15-ai-navigator-static-rag.md`.

## Current accepted baseline

### Portfolio / site

- N1–N6 presentation/editorial implementation — **DONE / PRODUCTION ACCEPTED**.
- Navigation IA, Engineering Notes reader architecture, clean URLs, search/discovery readiness, launch pack and production verification — accepted.
- Transparent `trueruslan.com` repository readiness — accepted via #247; external DNS/Cloudflare alias remains **NOT LIVE**.
- Current production SHA `ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f`: Pages #272, Production Live #618, master CodeQL #1740 — SUCCESS.

### AI Navigator

- #248 design — **DONE**.
- #249 TDD implementation plan — **DONE**.
- #250 deterministic public corpus + 50-case RU/EN retrieval benchmark — **DONE**.
- #251 explicit embedding index + offline verification + deterministic hybrid retrieval — **DONE**.
- #252 mode-gated semantic search integration + query embedding Worker boundary — **DONE**.
- #253 grounded answers + preflight/security/provider-free acceptance gates — **DONE / PRODUCTION ACCEPTED WITH PUBLIC MODE OFF**.
- CodeQL-discovered corpus sanitizer closing-tag findings — **DONE / TDD FIXED** before #250 merge.
- `data/ai-navigator.json` production mode — **OFF**.

## Priority A — controlled manual launch / real discovery evidence

This remains the highest-priority product/operator step because the accepted launch pack still has no real publication event.

1. Review and deliberately publish selected drafts from the accepted **10-target / 38-draft** pack.
2. Repository automation must not authenticate, post, schedule, mutate external profiles or add unapproved URL parameters.
3. After launch, collect authenticated/operator-supplied Google Search Console and Yandex Webmaster observations.
4. Continue P4.1B only from real observations; keep raw private exports outside Git.
5. Select P4.1C metadata/copy/internal-link changes only when reviewed evidence supports a concrete change.
6. Complete P3.6 only when the documented real traffic/window/evidence thresholds are satisfied.

Status:

- controlled launch — **NEXT OPERATOR ACTION / NOT PUBLISHED**;
- P4.1B — **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**;
- P4.1C — **WAITING**;
- P3.6 — **NEXT / WAITING FOR EXTERNAL EVIDENCE**;
- clean-URL observation clock — `2026-08-05T00:00:00Z`.

## Priority B — AI Navigator real acceptance, still no public activation

The repository engineering baseline is complete. The next engineering step must validate the real provider/index path without coupling ordinary CI/build to OpenRouter.

### AI-5 — real provider/index acceptance — NEXT ENGINEERING GATE

Required before any public semantic-search canary:

- create/use a **dedicated hard-spend-capped OpenRouter key** for this experiment;
- bind it only to the Worker/explicit acceptance path; never expose it to browser/static artifacts;
- run explicit document-embedding refresh against the accepted corpus;
- validate exact model and dimensions (`openai/text-embedding-3-small`, 512 unless an approved plan revision changes them);
- store only derived static embedding artifacts/manifests, never credentials;
- run offline index verification and the reviewed semantic retrieval benchmark;
- record real provider latency/error/cost evidence separately from repository readiness;
- fail closed if provider evidence or benchmark thresholds are insufficient.

Ordinary `npm test` / build / Pages deploy must continue working with no OpenRouter secret or network requirement.

### AI-6 — SEARCH canary — WAITING FOR AI-5

Only after AI-5 acceptance:

- enable bounded `search` mode for an explicit canary;
- preserve the existing Diplodoc path and fallback;
- verify CORS/preflight, query embedding, static index loading, hybrid ranking, timeout and provider-failure behavior in production;
- record retrieval quality, latency, provider errors and spend;
- no answer generation yet if SEARCH acceptance is not stable.

### AI-7 — FULL canary + verdict — WAITING FOR SEARCH

Only after SEARCH acceptance:

- enable `full` mode with explicit `Ask AI` action;
- preserve Worker-owned canonical grounding and strict citations;
- verify insufficient-evidence behavior and no browsing/world-knowledge fallback;
- record answer quality/latency/cost/error evidence;
- finish with explicit **KEEP / DOWNGRADE / REMOVE** verdict.

Removal must remain cheap: no canonical content, URL, SEO or database migration.

## Maintenance lane

### #82 — Diplodoc / markdown-it

- remains upstream blocker;
- do not force incompatible markdown-it major versions or local shims;
- re-evaluate only on a compatible upstream Diplodoc release;
- closure requires zero relevant moderate/high/critical audit findings plus full translation/build/browser/security matrix.

### #78 — Content Freshness

- reopened 2026-08-15 with repository-drift warnings for `portfolio-platform` and `vlezet`;
- this reconciliation addresses portfolio-platform durable state;
- verify Vlezet separately before closing #78;
- never promote Draft/current-repository activity to accepted external product evidence automatically.

### #111 / #212

- remain operator/external observation work;
- no repository-only closure or fabricated Search Console/Webmaster data.

## Guardrails for all next work

- static-first and progressive enhancement;
- no second canonical content owner;
- no second ordinary full-text search owner;
- no browser/provider secret;
- no hidden public AI activation;
- no automatic external publication/profile/search-console mutation;
- exact-head CI before merge and exact deployed production verification after merge;
- repository readiness, deployed production, provider acceptance, public canary and product-impact evidence remain separate states;
- no quality/security gate weakening.
