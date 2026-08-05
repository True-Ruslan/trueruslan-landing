# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4C Hybrid CV + AI Recognition Note.
>
> Current state — `docs/PROJECT_STATE.md`; history — `docs/CHANGELOG.md`; specification — `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`.

## Principles

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- repository-native directory URLs;
- legacy `.html` only as compatibility entrypoints;
- no automatic public truth, profile or search-engine mutation;
- bounded Evidence semantics;
- Draft evidence не является accepted evidence;
- repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance как разные факты;
- exact artifact и installed acceptance остаются отдельными release gates;
- volatile external evidence derives from canonical registries;
- no quality-gate weakening.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Completed milestones

- Photo Stories — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes foundation — PR #25.
- Content Freshness Guard — PR #27.
- Browser Quality Harness — PR #29.
- Flagship Case-Study Format — PR #34.
- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45.
- Repository-native clean URLs — PR #114/#115.
- Durable Portfolio 1.0 specification — PR #116.
- P3.1 Homepage evidence paths — PR #117/#118.
- P3.2 TrueRuslan Landing flagship — PR #119/#120/#121.
- P3.3 Flagship normalization — PR #122/#123.
- Current external-project evidence reconciliation — PR #124.
- P3.4A Deployment Verification Note — PR #125/#126.
- P3.4B Clean URLs Note — PR #128/#129.
- P3.4C Hybrid CV + AI Recognition Note — PR #130.

---

# Portfolio 1.0 — IN PROGRESS

## P3.1 — Homepage evidence paths — DONE

Accepted: Resume/Projects/Materials paths, bounded registry evidence, public-only flagship set, `/now` and one RU/EN architecture.

## P3.2 — TrueRuslan Landing flagship — DONE

Accepted routes:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
```

Production verification uses `main.dc-doc-page__content` and exact deployed identity.

## P3.3 — Flagship normalization — DONE

Accepted routes:

```text
/landing/projects/livingworld/
/landing/projects/vlezet/
/en/projects/livingworld/
```

Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted. M7.8C PR #42 and stacked PR #44/#45 remain Draft/pending product-owner gates.

VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`; PR #103/#104/#108 provide bounded automation, PR #110 remains Draft, cumulative installed acceptance remains separate.

## P3.4 — Grounded Engineering Notes — IN PROGRESS

### P3.4A — Deployment success is not production verification — DONE

Canonical route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

Accepted outcome: repository readiness, generated artifact, GitHub Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation are separate evidence layers. Production Live Smoke #108 exposed a verifier defect; PR #126 corrected canonical evidence derivation before final acceptance.

### P3.4B — Clean URLs without Cloudflare routing — DONE

Canonical route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

Accepted outcome: repository-native directory URLs; one canonical/hreflang/OpenGraph/Sitemap/Atom/search contract; Cloudflare not required as application router; legacy `.html` compatibility preserving query and fragment; delayed search-engine observation kept external.

### P3.4C — Hybrid CV + AI recognition boundaries — DONE

Canonical route:

```text
/landing/notes/hybrid-cv-ai-recognition-boundaries/
```

Accepted outcome:

- `VlezetDocument` remains authoritative;
- local CV and raw provider output remain proposals;
- `requestId`, `referenceRevision` and `localDraftFingerprint` bind batch identity;
- deterministic validation and current-state revalidation precede explicit Apply;
- Apply is atomic and compatible with Undo/Redo;
- malformed, stale, overload and provider failure fail closed;
- M7.8B is accepted evidence;
- M7.8C PR #42, PR #44 and PR #45 remain Draft pending product-owner retest;
- benchmark, browser, CI and product acceptance remain distinct.

Exact production evidence:

```text
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
```

### P3.4D — GameTests versus installed gameplay acceptance — NEXT

Publish a grounded VillAIgence Note explaining the proof boundaries between:

1. source/unit contracts;
2. remapped package and embedded identity;
3. GameTests in controlled server runtime;
4. exact production-JAR startup/restart;
5. provider-client protocol evidence;
6. physical Voice Chat and real-provider checks;
7. multiplayer and focused gameplay verification;
8. cumulative installed product-owner acceptance;
9. rollback and recovery evidence.

Acceptance criteria:

- facts derived from accepted VillAIgence release/automation evidence;
- PR #103/#104/#108 accepted scopes separated from PR #110 Draft and manual acceptance;
- verified fact, engineering inference and limitation explicit;
- deterministic Notes Registry, clean route, Atom feed and generated search participation;
- semantic/no-JS content;
- exact-head and deployment-only production verification;
- no claim that a green GameTest suite proves installed gameplay correctness.

### Later P3.4 candidates

- Passive PDF validation versus semantics.
- Evidence-driven project state.

## P3.5 — Selective English expansion

Translate only high-value surfaces: homepage, Resume, three flagships, `/now`, selected Notes and Publications. Do not create a separate English CMS, build or search architecture.

## P3.6 — Measurement checkpoint

After sufficient aggregate traffic:

- compare Cloudflare aggregate traffic;
- inspect Google/Yandex indexing of clean routes;
- verify old `.html` identities are declining;
- identify high-value entry pages and search themes;
- make no engagement claim without sufficient data.

---

# Operational checkpoints

## Search-engine operations

Issue #111 remains only for authenticated Yandex Webmaster actions and crawler observation. Do not add repository code solely to clear stale cached diagnostics.

## Content Freshness owner state

Issue #78 requires a default-branch owner refresh. The older generated issue body is not current canonical truth.

## Dependency blocker

Review issue #82 on or after **2026-08-17**. Do not use `npm audit fix --force`, local shims or an unreviewed fork.

---

# Not priority

Without a reproduced product need, do not plan backend/database for static content, a second full-text search, behavioural analytics, automatic public/profile/search-engine mutation, migration from GitHub Pages, or removal of legacy `.html` compatibility before crawler replacement is observed.

## New-session rule

Open durable state and Portfolio 1.0 specification. Check actual PRs, exact-head CI, Pages deployment and Production Live Smoke. Confirm P3.4C feature PR #130 and exact production acceptance for SHA `8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7`. Preserve issue #111, issue #82 and issue #78 boundaries. Continue with **P3.4D — GameTests versus installed gameplay acceptance**.
