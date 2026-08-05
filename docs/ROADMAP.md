# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-05**, после production-acceptance Portfolio 1.0 P3.4D GameTests Acceptance Note.
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
- P3.4C Hybrid CV + AI Recognition Note — PR #130/#131.
- P3.4D GameTests Acceptance Note — PR #132.

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

Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`; M7.8B accepted, while M7.8C PR #42 and stacked PR #44/#45 remain Draft/pending product-owner gates.

VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`. PR #103/#104/#105/#108/#110/#112 provide bounded automation. PR #114 remains Draft and cumulative installed acceptance remains separate.

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

Accepted outcome: `VlezetDocument` remains authoritative; local CV and provider output remain proposals; `localDraftFingerprint`, current-state revalidation and explicit Apply preserve deterministic authority. M7.8B remains separate from Draft M7.8C PR #42 and PR #44/#45.

Exact production evidence:

```text
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
```

### P3.4D — GameTests versus installed gameplay acceptance — DONE

Canonical route:

```text
/landing/notes/gametests-vs-installed-gameplay-acceptance/
```

Accepted outcome:

- source/unit contracts, remapped package, GameTests and exact production-JAR are separate evidence layers;
- literal-loopback provider-client proof does not imply real-provider acceptance;
- `VAI-CONCUR-003` logical-client automation remains separate from `VAI-CONCUR-004` real installed two-client canary;
- PR #110 and PR #112 are bounded automation evidence;
- PR #114 remains Draft;
- physical microphone, Simple Voice Chat UDP/Opus, inventory/grave/resurrection canary and cumulative product-owner acceptance remain installed gates;
- rollback and recovery remain part of acceptance;
- green GameTests do not prove installed gameplay correctness.

Exact production evidence:

```text
PR #132 RED head:              237a3225954e1b4b633422b690b1e3fb02983f89
PR #132 exact head:            b4f49b29dc9c16ff4d3c2412d5b4d2ea18282239
PR #132 squash:                02894431e042b89943e4bdb3cb43f336fa9ad75d
Build:                          #978 / 31042919449 — SUCCESS
unit tests:                     398 PASS / 0 FAIL
quality artifact:               8945409733
quality digest:                 sha256:cbf160fc9877e31acc89729ae077ee3f2cad815425be4200253a06659f9339c2
Pages:                          #162 / 31043536231 — SUCCESS
Pages deployment ID:            5768748824
Production Live Smoke:          #139 / 31043534975 — SUCCESS
production artifact:            8945575207
production digest:              sha256:0f1d56a3735f366512e627f7669ae017ed932bf7a2a4ee19ad0fc4ed0c5b347f
```

### P3.4E — Passive PDF validation versus semantic completeness — NEXT

Publish a grounded Note explaining the difference between:

1. file existence and stable route;
2. PDF signature/header and parseability;
3. MIME/content disposition and downloadable bytes;
4. passive/no-JavaScript embedding;
5. page count and structural checks;
6. text extraction and required-section coverage;
7. web-CV ↔ PDF semantic equivalence;
8. current professional-profile truth;
9. accessibility and human-readable layout;
10. exact deployed-document verification.

Acceptance criteria:

- facts derived from the existing resume/PDF build, integrity, browser and content contracts;
- explicit distinction between artifact validity and semantic completeness;
- no claim that a parseable PDF is current, complete or accessible;
- verified fact, engineering inference and limitation explicit;
- deterministic Notes Registry, clean route, Atom feed and generated search participation;
- semantic/no-JS content;
- exact-head and deployment-only production verification.

### Later P3.4 candidate

- Evidence-driven project state.

## P3.5 — Selective English expansion

Translate only high-value surfaces: homepage, Resume, three flagships, `/now`, selected Notes and Publications. Do not create a separate English CMS, build or search architecture.

## P3.6 — Measurement checkpoint

After sufficient aggregate traffic, compare aggregate traffic and clean-route indexing without making engagement claims from insufficient data.

---

# Operational checkpoints

- issue #111 — authenticated Yandex Webmaster actions and crawler observation;
- issue #78 — default-branch Content Freshness owner refresh;
- issue #82 — review on or after **2026-08-17**; no `npm audit fix --force`, local shim or unreviewed fork.

## New-session rule

Open durable state and Portfolio 1.0 specification. Check actual PRs, exact-head CI, Pages deployment and Production Live Smoke. Confirm P3.4D feature PR #132 and exact production acceptance for SHA `02894431e042b89943e4bdb3cb43f336fa9ad75d`. Preserve issue #111, issue #82 and issue #78 boundaries. Continue with **P3.4E — Passive PDF validation versus semantic completeness**.