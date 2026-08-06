# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-06**, после production-acceptance Portfolio 1.0 P3.4E Passive PDF Completeness Note.
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
- валидный или parseable artifact не считается автоматически complete, current, accessible или semantically equivalent;
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
- P3.4D GameTests Acceptance Note — PR #132/#133.
- P3.4E Passive PDF Completeness Note — PR #134–#139.

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

### P3.4E — Passive PDF validation versus semantic completeness — DONE

Canonical route:

```text
/landing/notes/passive-pdf-validation-vs-semantic-completeness/
```

Accepted outcome:

- file existence, stable route, `%PDF-`, parseability, MIME, Content-Disposition, downloadable bytes, page count and text extraction remain separate checks;
- валидный PDF не описывается как автоматически complete, current, accessible или semantically equivalent web-CV;
- web-CV remains canonical editorial source; PDF remains bounded distribution artifact;
- rendered DOM, raw HTML, binary PDF, Atom feed and generated search are verified independently;
- PR #138 publishes a real RU/EN `<noscript data-tr-resume-fallback>` before clean-route output;
- PR #139 uses deterministic `tr_evidence_sha` plus `Cache-Control: no-cache` and `Pragma: no-cache` for exact raw production observation;
- automation does not replace editorial, accessibility, ATS or human-readable layout review.

Feature and correction evidence:

```text
PR #134 RED head:              ad3d46817bb40002e4f311acac2632929886780f
PR #134 exact head:            fd09071730bf1a6d227ad544734b4ef15bb0a1f0
PR #134 squash:                f184236fec2f8985fe9f893a7d6819ad4e6eea37
Build:                          #996 / 31049874523 — SUCCESS
unit tests:                     403 PASS / 0 FAIL
quality artifact:               8948085565
quality digest:                 sha256:a31c074f337263d35181a7073fd5cbd6ef8f96ff0af92757c9cdb0c8e27d43b0
PR #138 squash:                90df9b8741b0d40b6ca3981f649624b55bfc85c1
Build:                          #1010 / 31083663155 — SUCCESS
unit tests:                     410 PASS / 0 FAIL
quality artifact:               8960804973
quality digest:                 sha256:47292ba7cb21abfc9d0ef7d862efdfc34423ef27a5df1a95145f3fcdb95e142e
PR #139 RED head:              de79262c5db1e484b455409800c3dc060bf474b4
PR #139 exact head:            0ccd8a5dc669212a46f9d2f3d2f5f6a73685be87
PR #139 squash:                a570dc420c83af33b483cb55c5904b3575ff729a
Build:                          #1013 / 31086478496 — SUCCESS
unit tests:                     411 PASS / 0 FAIL
quality artifact:               8961719018
quality digest:                 sha256:78ba029a7ae88cb9b20f456c0c5cffdd9609a0b4856cc7bbf456cc2e39f02e47
```

Exact production evidence:

```text
Pages:                          #169 / 31086909691 — SUCCESS
Pages deployment ID:            5776481884
Production Live Smoke:          #168 / 31086909906 — SUCCESS
production artifact:            8961927073
production digest:              sha256:681f8a098349bc4e44078273f5086f892f0dec7750abbe87de8ecf96702f24bc
PDF size:                       277792 bytes
PDF SHA-256:                    efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613
```

### P3.4F — Evidence-driven project state — NEXT

Formalize and publish a bounded model for project state that:

1. derives volatile public facts from canonical registries rather than duplicated prose;
2. separates verified fact, engineering inference and limitation;
3. distinguishes repository activity, generated artifact, deployed production, external-product acceptance and operator/search-engine state;
4. does not promote Draft or pending product-owner evidence;
5. records observation dates and exact evidence identities;
6. exposes stale/unverified states explicitly;
7. keeps automatic reports reviewable and non-mutating;
8. preserves semantic/no-JavaScript content, Atom feed and generated search;
9. receives exact-head and exact-deployment verification.

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

Open durable state and Portfolio 1.0 specification. Check actual PRs, exact-head CI, Pages deployment and Production Live Smoke. Confirm P3.4E feature/corrections and exact production acceptance for SHA `a570dc420c83af33b483cb55c5904b3575ff729a`. Preserve issue #111, issue #82 and issue #78 boundaries. Continue with **P3.4F — Evidence-driven project state**.
