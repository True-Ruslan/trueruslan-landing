# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.4E ACCEPTED IN PRODUCTION**
>
> Date: **2026-08-06**
>
> Product: `True-Ruslan/trueruslan-landing`

## Product outcome

TrueRuslan Landing presents professional experience, public engineering projects, current work, publications and reusable technical conclusions through one static-first, evidence-first platform.

The public narrative remains:

**what I build → what I study → what I publish → what I learned → what evidence supports it**.

## Invariants

- static-first and build-time intelligence;
- progressive enhancement;
- semantic content without JavaScript;
- one canonical RU/EN build and search architecture;
- canonical registries own volatile project truth;
- repository-native directory URLs;
- no public canonical/Sitemap/feed URL contains `.html`;
- legacy `.html` exists only as bounded compatibility;
- Draft evidence never becomes accepted evidence automatically;
- repository, artifact, deployment, browser, search-engine and external-product acceptance are separate layers;
- exact artifact and installed acceptance remain separate release gates;
- valid or parseable bytes do not automatically prove complete, current, accessible or semantically equivalent content;
- no quality-gate weakening.

---

## Milestone status

### P3.1 — Homepage evidence paths — DONE

Homepage exposes Resume, Projects and Materials paths, a bounded public flagship set and `/now` context without promoting private or Draft work.

### P3.2 — TrueRuslan Landing flagship — DONE

Dedicated RU/EN platform case studies document static-first architecture, canonical registries, clean URLs, GitHub Pages and deployment verification.

### P3.3 — Flagship normalization — DONE

RU VillAIgence, RU Vlezet and controlled EN VillAIgence use one evidence-first order while preserving lifecycle and external acceptance boundaries.

### P3.4A — Deployment success is not production verification — DONE

Canonical route:

```text
/landing/notes/deployment-success-is-not-production-verification/
```

The Note separates repository readiness, generated artifact, exact Pages deployment, Production Live Smoke, bounded product acceptance and search-engine observation.

### P3.4B — Clean URLs without Cloudflare routing — DONE

Canonical route:

```text
/landing/notes/clean-urls-without-cloudflare-routing/
```

The Note records repository-native directory output, Diplodoc base/depth migration, one canonical/hreflang/OpenGraph/Sitemap/Atom/search contract, Cloudflare as DNS/CDN/analytics rather than application router, and legacy `.html` compatibility preserving query and fragment.

### P3.4C — Hybrid CV + AI recognition boundaries — DONE

Canonical route:

```text
/landing/notes/hybrid-cv-ai-recognition-boundaries/
```

The Note preserves `VlezetDocument` as the sole persistent geometry authority. Local CV and raw provider output remain proposals; `localDraftFingerprint`, deterministic validation, current-state revalidation and explicit Apply precede one atomic mutation.

Accepted baseline remains M7.8B. M7.8C PR #42, PR #44 and PR #45 remain Draft and require product-owner retest.

```text
PR #130 RED head:              842959fb765702a634ec0592f218f1275d3ca93e
PR #130 exact head:            731dbf0a6d217a40c17a8c8f1494f342fcb35e7e
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Build:                          #961 / 31029662846 — SUCCESS
quality artifact:               8940244292
quality digest:                 sha256:1f3a013c543171230e0a69975e69beaf18b252ca2337a63938f692f6a7c162d9
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
production artifact:            8940409941
production digest:              sha256:9cb66c8e3b2b432c9bbdd160542f3b5566e1e3e21f3be07711f16d5f95fae700
```

### P3.4D — GameTests versus installed gameplay acceptance — DONE

Canonical route:

```text
/landing/notes/gametests-vs-installed-gameplay-acceptance/
```

#### Problem

A green Minecraft automation pipeline can accidentally be described as product acceptance even though each gate observes a narrower property: source policy, package identity, controlled server behavior, exact production-JAR startup, protocol compatibility or installed user-visible behavior.

#### Evidence model

- source/unit contracts verify deterministic policy and wiring;
- remapped package, embedded `fabric.mod.json`, manifest and SHA-256 verify distributable identity;
- GameTests execute selected mechanics inside a controlled server runtime;
- exact production-JAR startup/restart executes the candidate outside Loom/dev runtime in two JVMs;
- literal-loopback Chat/STT/TTS verifies production provider-client protocol code without external credentials;
- `VAI-CONCUR-003` verifies logical-client revision conflict and replay behavior;
- `VAI-CONCUR-004` remains the real installed two-client UI/network canary;
- physical microphone, Simple Voice Chat UDP/Opus, real-provider and focused gameplay checks remain installed evidence;
- inventory/grave/resurrection canary and cumulative product-owner acceptance remain pending;
- rollback and recovery readiness remain part of acceptance.

#### Accepted evidence boundary

Accepted bounded automation includes PR #103, PR #104, PR #105, PR #108, PR #110 and PR #112. PR #114 remains Draft. Green GameTests do not prove installed gameplay correctness and the published candidate is not described as fully accepted.

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

#### Problem

A PDF can exist at a stable route, return `application/pdf`, start with `%PDF-`, be downloadable and parseable, yet still be incomplete, stale, inaccessible, hard to read or semantically different from the canonical web-CV.

#### Evidence model

- file existence and stable route prove delivery location only;
- MIME, Content-Disposition, `%PDF-`, parseability and binary size prove bounded transport/format properties;
- page count and structural checks do not prove required-section coverage;
- text extraction and required markers do not prove current professional truth or good human-readable layout;
- web-CV ↔ PDF semantic equivalence is a separate editorial contract;
- rendered DOM proves the JavaScript-enhanced web-CV surface;
- raw HTML proves the no-JavaScript fallback surface;
- binary PDF response proves exact deployed bytes;
- Atom feed and generated search prove Note discoverability;
- accessibility, ATS compatibility and human layout acceptance remain distinct reviews.

#### Feature evidence

```text
PR #134 RED head:              ad3d46817bb40002e4f311acac2632929886780f
RED Build:                      #985 / 31048729901 — expected FAILURE
RED result:                     399 PASS / 4 expected FAIL
PR #134 exact head:            fd09071730bf1a6d227ad544734b4ef15bb0a1f0
PR #134 squash:                f184236fec2f8985fe9f893a7d6819ad4e6eea37
Build:                          #996 / 31049874523 — SUCCESS
unit tests:                     403 PASS / 0 FAIL
quality artifact:               8948085565
quality digest:                 sha256:a31c074f337263d35181a7073fd5cbd6ef8f96ff0af92757c9cdb0c8e27d43b0
```

#### Production corrections

PR #135–#137 corrected observable resume scopes without weakening binary or semantic requirements.

PR #138 introduced an idempotent build-time RU/EN `<noscript data-tr-resume-fallback>` postprocessor before clean-route publishing.

```text
PR #138 exact head:            a82fbeeb660a2a1eb6d3d6c7963708ef946fcc5f
PR #138 squash:                90df9b8741b0d40b6ca3981f649624b55bfc85c1
Build:                          #1010 / 31083663155 — SUCCESS
unit tests:                     410 PASS / 0 FAIL
quality artifact:               8960804973
quality digest:                 sha256:47292ba7cb21abfc9d0ef7d862efdfc34423ef27a5df1a95145f3fcdb95e142e
```

PR #139 made raw production observation deterministic with query `tr_evidence_sha=<EXPECTED_DEPLOYED_SHA>`, `Cache-Control: no-cache` and `Pragma: no-cache`, while preserving the canonical URL and all PDF assertions.

```text
PR #139 RED head:              de79262c5db1e484b455409800c3dc060bf474b4
PR #139 exact head:            0ccd8a5dc669212a46f9d2f3d2f5f6a73685be87
PR #139 squash:                a570dc420c83af33b483cb55c5904b3575ff729a
Build:                          #1013 / 31086478496 — SUCCESS
unit tests:                     411 PASS / 0 FAIL
quality artifact:               8961719018
quality digest:                 sha256:78ba029a7ae88cb9b20f456c0c5cffdd9609a0b4856cc7bbf456cc2e39f02e47
```

#### Exact production acceptance

```text
Pages:                          #169 / 31086909691 — SUCCESS
Pages deployment ID:            5776481884
Production Live Smoke:          #168 / 31086909906 — SUCCESS
production artifact:            8961927073
production digest:              sha256:681f8a098349bc4e44078273f5086f892f0dec7750abbe87de8ecf96702f24bc
PDF size:                       277792 bytes
PDF SHA-256:                    efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613
```

The exact production verifier accepted the Note only after rendered DOM, raw HTML, binary PDF, Atom feed and generated search passed independently on deployed SHA `a570dc420c83af33b483cb55c5904b3575ff729a`.

### P3.4F — Evidence-driven project state — NEXT

The next bounded slice must formalize public project state as a derived evidence view rather than duplicated narrative.

Acceptance direction:

- canonical registries own volatile facts;
- verified fact, engineering inference and limitation are explicit;
- repository activity, generated artifact, deployed production, external-product acceptance and operator/search-engine observation remain separate;
- Draft and stale evidence are visible but never promoted automatically;
- evidence identity and observation date are recorded;
- automatic reports remain reviewable and non-mutating;
- semantic/no-JavaScript content, Atom feed and generated search remain available;
- exact-head and exact-deployment verification are required.

Continue with **P3.4F — Evidence-driven project state**.

---

## Operational boundaries

- issue #111 remains external search-engine/operator state;
- issue #78 remains pending default-branch Content Freshness owner refresh;
- issue #82 remains the Diplodoc dependency blocker until a secure compatible upstream line exists;
- no force audit fix, local shim or unreviewed fork;
- no removal of legacy compatibility before observed crawler replacement.
