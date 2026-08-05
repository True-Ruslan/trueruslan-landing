# Portfolio 1.0 — Evidence-first flagship content

> Status: **IN PROGRESS — P3.4C ACCEPTED IN PRODUCTION**
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

#### Problem

Verification-only AI could confirm or reject candidates already emitted by local CV, but it could not recover omissions such as missing windows, doors or thin boundaries because unknown IDs and new geometry were intentionally forbidden.

#### Authority model

- `VlezetDocument` is the sole persistent geometry authority.
- local CV creates a deterministic reviewable Draft.
- raw provider output is runtime-only untrusted evidence.
- an AI batch is bound to `requestId`, `referenceRevision` and `localDraftFingerprint`.
- deterministic sanitation may produce eligible, blocked or duplicate proposals.
- current-state revalidation runs immediately before mutation.
- only explicit Apply may create one atomic semantic operation with Undo/Redo.
- malformed, stale, overload and provider failures fail closed with no mutation.

#### Accepted evidence boundary

Accepted baseline:

- M7.8B;
- Vlezet PR #41 merge `08800dd66fa298ff31d1a7e6b33e91964cdb8d16`;
- immutable known candidates;
- AI verification without geometry authority;
- explicit Apply and semantic Undo.

Still pending:

- M7.8C PR #42 — Draft and product-owner retest;
- PR #44 — Draft real-fixture benchmark foundation;
- PR #45 — Draft hybrid proposal recovery;
- representative real-plan product acceptance.

Automated benchmark, browser and CI evidence do not by themselves prove product acceptance.

#### Feature evidence

```text
PR #130 RED head:              842959fb765702a634ec0592f218f1275d3ca93e
RED Build:                      #952 / 31028991923 — expected FAILURE
PR #130 exact head:            731dbf0a6d217a40c17a8c8f1494f342fcb35e7e
PR #130 squash:                8bc5b2134cd10cd8cf27f46ec0bc2fb4ee6c67d7
Build:                          #961 / 31029662846 — SUCCESS
quality artifact:               8940244292
quality digest:                 sha256:1f3a013c543171230e0a69975e69beaf18b252ca2337a63938f692f6a7c162d9
```

#### Exact production evidence

```text
Pages:                          #160 / 31030249235 — SUCCESS
Pages deployment ID:            5766332284
Production Live Smoke:          #132 / 31030324160 — SUCCESS
production artifact:            8940409941
production digest:              sha256:9cb66c8e3b2b432c9bbdd160542f3b5566e1e3e21f3be07711f16d5f95fae700
```

The exact production verifier checked route, title and semantic content, Draft boundaries, canonical, OpenGraph URL, Atom feed and generated search.

### P3.4D — GameTests versus installed gameplay acceptance — NEXT

The next Note must separate:

- source/unit tests;
- package/remap identity;
- GameTests;
- exact production-JAR startup/restart;
- deterministic provider-client proof;
- physical Voice Chat and real-provider checks;
- multiplayer and focused gameplay verification;
- cumulative installed product-owner acceptance;
- rollback and recovery.

It must preserve accepted VillAIgence PR #103/#104/#108 evidence, PR #110 Draft status and the difference between automation and installed gameplay truth.

Continue with **P3.4D — GameTests versus installed gameplay acceptance**.

---

## Operational boundaries

- issue #111 remains external search-engine/operator state;
- issue #78 remains pending default-branch Content Freshness owner refresh;
- issue #82 remains the Diplodoc dependency blocker until a secure compatible upstream line exists;
- no force audit fix, local shim or unreviewed fork;
- no removal of legacy compatibility before observed crawler replacement.
