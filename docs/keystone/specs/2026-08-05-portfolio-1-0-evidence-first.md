# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.4D ACCEPTED IN PRODUCTION**
>
> Date: **2026-08-05**
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

Accepted bounded automation includes:

- PR #103 and PR #104 release gates;
- PR #105 focused inventory ownership GameTests;
- PR #108 deterministic provider-client proof;
- PR #110 shared deadline and exactly-once effects;
- PR #112 logical-client concurrency contract;
- official `0.1.25+1.21.1` artifact from commit `588cc676d356271c4cf74eb21131f6d071476e48`;
- current accepted branch head `67e0644b355708c06747e3ec4659a337bc4189b3`.

Still pending:

- PR #114 — Draft M11 Phase E automation-completion program;
- physical Voice Chat and real-provider canaries;
- `VAI-CONCUR-004` real installed two-client verification;
- focused inventory/grave/resurrection product-owner canary;
- broader gameplay and soak evidence;
- cumulative installed acceptance.

Green GameTests do not prove installed gameplay correctness and the published candidate is not described as fully accepted.

#### Feature evidence

```text
PR #132 RED head:              237a3225954e1b4b633422b690b1e3fb02983f89
RED Build:                      #969 / 31042289632 — expected FAILURE
RED result:                     394 PASS / 4 expected FAIL
PR #132 exact head:            b4f49b29dc9c16ff4d3c2412d5b4d2ea18282239
PR #132 squash:                02894431e042b89943e4bdb3cb43f336fa9ad75d
Build:                          #978 / 31042919449 — SUCCESS
unit tests:                     398 PASS / 0 FAIL
quality artifact:               8945409733
quality digest:                 sha256:cbf160fc9877e31acc89729ae077ee3f2cad815425be4200253a06659f9339c2
```

#### Exact production evidence

```text
Pages:                          #162 / 31043536231 — SUCCESS
Pages deployment ID:            5768748824
Production Live Smoke:          #139 / 31043534975 — SUCCESS
production artifact:            8945575207
production digest:              sha256:0f1d56a3735f366512e627f7669ae017ed932bf7a2a4ee19ad0fc4ed0c5b347f
```

The exact production verifier checked route, title and semantic content, Draft boundaries, canonical, OpenGraph URL, Atom feed and generated search.

### P3.4E — Passive PDF validation versus semantic completeness — NEXT

The next Note must separate:

- file existence and stable route;
- PDF signature/header and parseability;
- MIME/content disposition and downloadable bytes;
- passive/no-JavaScript embedding;
- page count and structural checks;
- text extraction and required-section coverage;
- web-CV ↔ PDF semantic equivalence;
- current professional-profile truth;
- accessibility and human-readable layout;
- exact deployed-document verification.

A parseable PDF must not be described as current, complete, semantically equivalent or accessible without the corresponding evidence.

Continue with **P3.4E — Passive PDF validation versus semantic completeness**.

---

## Operational boundaries

- issue #111 remains external search-engine/operator state;
- issue #78 remains pending default-branch Content Freshness owner refresh;
- issue #82 remains the Diplodoc dependency blocker until a secure compatible upstream line exists;
- no force audit fix, local shim or unreviewed fork;
- no removal of legacy compatibility before observed crawler replacement.