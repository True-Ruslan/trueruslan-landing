# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-08-05**, после Yandex Webmaster favicon reconciliation и exact-SHA production closure.
>
> Current state — `docs/PROJECT_STATE.md`; next steps — `docs/ROADMAP.md`; operator kit — `docs/DISTRIBUTION.md`.

---

# 2026-08-05

## Yandex Webmaster Favicon Reconciliation — DONE

### PR #112 — publish a crawler-stable root favicon contract

Yandex Webmaster reported two related recommendations:

- favicon unavailable to the robot;
- add SVG or 120×120 favicon.

Generated-artifact inspection established the actual repository gap:

- the canonical SVG existed at `docs/assets/images/favicon.svg`;
- the generated Pages bundle had no root `/favicon.svg`;
- page links depended on relative URL resolution and `<base>`;
- production Sitemap and HTTPS were already separate valid contracts.

Delivered:

- added a deterministic Node-only favicon postprocessor;
- copied the canonical SVG byte-for-byte to generated `/favicon.svg`;
- normalized every generated icon link to `/favicon.svg` after all existing page generation and asset processing;
- covered root, nested, search, self-closing and reordered link syntax;
- changed Diplodoc configuration to the root-absolute favicon URL;
- added deployment-only Playwright checks to the existing Production Live Smoke workflow;
- created issue #111 to separate repository defects from authenticated Yandex Webmaster state;
- preserved Cloudflare aggregate analytics, Sitemap, HTTPS, static-first architecture and non-regional portfolio positioning;
- explicitly rejected Yandex Metrica, Yandex Business and artificial regional claims without a separate product/privacy requirement.

TDD RED evidence:

```text
head:                       6c2a267d1c5f0f16c6d25747ebb78f2fcf00a2d1
Build:                      #766 / 30952175051 — expected FAILURE
failure scope:              missing scripts/favicon.js contract
CodeQL:                     #231 — SUCCESS
Dependency Review:          #194 — SUCCESS
```

Final exact-head evidence:

```text
head:                       00e7823d558c7a3473ee9fcf96692d583552f578
squash:                     18358a4939dc4062669dbcb45850e9beb26e1cac
Build:                      #778 / 30953202266 — SUCCESS
CodeQL:                     #243 / 30953202233 — SUCCESS
Dependency Review:          #206 / 30953202243 — SUCCESS
Dependency Audit Evidence:  #17 / 30953202563 — SUCCESS
unit tests:                 345 PASS / 0 FAIL
site integrity:             36 HTML / 1115 references — PASS
browser/accessibility:      PASS
Firefox/WebKit:             PASS
search/RU-EN/analytics:     PASS
visual regression:          PASS
custom-domain artifact:     PASS
review threads:             0 open
quality artifact:           8910068861
quality digest:             sha256:d309cff946ce4473f8aec309531df7124787c864bd139693cf5ddc31ddac1f80
```

Exact post-merge production evidence:

```text
source Pages run:           #142 / 30953599246 — SUCCESS
Production Live Smoke:      #45 / 30953667481 — SUCCESS
event:                      workflow_run
deployed/caller SHA:        18358a4939dc4062669dbcb45850e9beb26e1cac
deployment id:              5752049616
deployment state:           success
live artifact:              8910151878
live digest:                sha256:fe0ce39de71919915edc3760ac0768bf62e21b922312688a1d6cf8d7fd4c01e1
```

Deployed favicon assertions passed:

```text
https://trueruslan.ru/favicon.svg   HTTP 200
Content-Type                       image/svg+xml
response size                      591 bytes
homepage href                      /favicon.svg
resume href                        /favicon.svg
resolved target                    https://trueruslan.ru/favicon.svg
```

Issue #111 remains open only for external actions that require the authenticated Yandex Webmaster UI: Sitemap property confirmation, HTTP→HTTPS/main mirror state, “No region”, homepage recrawl and a 10–14 day diagnostic recheck. A green deployed contract does not claim that Yandex has already refreshed its diagnosis.

---

# 2026-08-04

## User-managed PDF and Resume Timeline Alignment — DONE

### PR #110 — update CV and align timeline markers

After the original August professional-profile baseline, the user supplied a new downloadable PDF and reported that the Resume timeline axis/markers were visually shifted relative to job headings.

Root causes:

- the new PDF used compressed streams, while previous tests searched generator-specific raw bytes;
- Diplodoc anchor-compensation padding shifted direct `h3` job headings below item origins;
- the line and markers did not share one explicit horizontal coordinate.

Delivered:

- replaced `docs/assets/documents/cv.pdf` with the current user-managed file;
- introduced one shared timeline axis coordinate;
- centered the line and markers on that coordinate;
- aligned markers with the first line of each corresponding job heading;
- removed margin/padding only from direct Resume job headings;
- added permanent layout regression tests;
- changed PDF checks to generator-independent passive structure validation.

The current validation boundary is explicit:

- RU/EN web-CV and metadata remain semantically validated;
- PDF requires valid header/EOF, meaningful size and absence of JavaScript, Launch and EmbeddedFile payloads;
- compressed PDF content/URLs are not guessed through raw-byte substring matching.

Exact evidence:

```text
head:                       4f224975928a42bd8ea5f311e5e8e1598a87dc28
squash:                     4b5bf97d749b9c9bc1d41167da5f860d9c87760e
Build:                      #765 / 30942487224 — SUCCESS
CodeQL:                     #229 / 30942487265 — SUCCESS
Dependency Review:          #193 / 30942487179 — SUCCESS
source Pages:               #141 / 30950087819 — SUCCESS
Production Live Smoke:      #37 / 30950157904 — SUCCESS
quality artifact:           8905808784
quality digest:             sha256:ab8d4fbe545f00c93e00936ec62c94c0402d8414910cd21a97eabc6a43b6b313
```

---

## August 2026 Resume Refresh — DONE

### PR #108 — synchronize web-CV and downloadable PDF

Established the August professional-profile baseline:

- more than 5 years of commercial development experience;
- current QWEP role and key products;
- Java 21–25 / Spring Boot 3.5–4 current stack;
- Runet Business Systems, Bell Integrator and earlier experience;
- AI-tool adoption and corporate MCP-server work;
- updated education, teaching and research context;
- canonical personal site `https://trueruslan.ru/`.

Delivered synchronized RU/EN Resume, About, homepage and metadata surfaces, a current compact PDF, permanent content regression coverage and reviewed desktop/mobile baselines.

```text
head:                       3055c82dc7f6c58d723a5f5c60e0af9f344c240b
squash:                     a85b24d220f9bbfd57176a081f7bce59e41782e8
Build:                      #756 / 30938001730 — SUCCESS
CodeQL:                     #218 / 30938008191 — SUCCESS
Dependency Review:          #184 / 30937995608 — SUCCESS
Distribution Readiness:     #24 / 30937995575 — SUCCESS
unit tests:                 340 PASS / 0 FAIL
source Pages:               #139 / 30938565671 — SUCCESS
Production Live Smoke:      #33 / 30938639622 — SUCCESS
```

PR #110 superseded only the binary-PDF and timeline-layout parts of this milestone; the supplied professional facts remain the accepted web-profile baseline.

---

## Vlezet Draft Freshness Reconciliation — DONE

### PR #106 — record Draft activity without public promotion

Content Freshness issue #78 reopened because Vlezet repository activity was newer than controlled evidence. Inspection established that M7.8B remained accepted while M7.8C PR #42 remained open Draft and required the same real-plan product-owner retest.

Delivered bounded pending evidence without merge, acceptance or lifecycle promotion claims.

```text
squash:                     5742a25b16ec4c1128fc0bcf03227cf6e4666f60
Build:                      #735 / 30906476472 — SUCCESS
Content Freshness:          #15 / 30906476451 — SUCCESS
freshness report:           0 findings / 0 warnings / 0 errors
issue #78:                  CLOSED / COMPLETED
```

---

## Final External Profile Verification — DONE

PR #104 completed the controlled external-profile snapshot:

```text
GitHub profile:             verified
Habr:                       verified
Telegram personal:          verified
Telegram Blog:              verified
summary:                    4 verified / 0 stale / 0 unverified
```

Any future profile-state change requires fresh rendered evidence.

---

## Distribution Contract & Production Live Smoke Trigger — DONE

- PR #98 — deterministic distribution targets and profile audit.
- PR #99 — completed Pages `workflow_run` became the primary exact-deployment trigger.
- PR #100 — activation-order proof.
- direct push remains a fallback; generated artifact, deployment and browser proof remain separate.

---

## Operational Maintenance Closure — DONE

- PR #91 — original clean Content Freshness evidence.
- PR #93 — exact dependency audit evidence.
- PR #94 — high-severity remediation.
- Final known audit: `0 critical / 0 high / 6 moderate`.
- Issue #82 remains open only for the build-time markdown-it/Diplodoc blocker; next planned review is 2026-08-17.

---

# 2026-08-03

## Evidence and engineering-note milestones — DONE

- PR #83 — Product Evidence Reconciliation.
- VillAIgence M11 Phase A — PR #103: 28 risk scenarios and 7 GameTests.
- VillAIgence M11 Phase B — PR #104: exact production-JAR startup, clean shutdown and restart evidence.
- PR #85 — Installed Acceptance Engineering Note.
- PR #87 — Deterministic Authority Engineering Note.
- PR #89 — Restart and Persistence Engineering Note.

These milestones preserve the separation between source/package tests, exact artifact, installed acceptance, provider/gameplay/manual evidence and public lifecycle claims.

---

# Earlier milestones

- 2026-08-02 — `/now`, flagships, Publications and stabilized search/photo surfaces.
- 2026-08-01 — canonical domain rollout, header/navigation consolidation and HTTPS production cutover.
- 2026-07-30 — production analytics activation and legacy operational closure.
- 2026-07-23 — privacy analytics, Minimal RU/EN and grounded Notes.
- 2026-07-22 — flagship format, metadata, browser harness, freshness, Evidence, Sources and Photo Stories foundation.

---

## Durable continuity principle

After every major milestone synchronize `PROJECT_STATE`, `ROADMAP` and `CHANGELOG`. These snapshots never substitute for actual repository state, exact-head CI, `github-pages` deployment, Production Live Smoke, Yandex Webmaster observation, external-profile observation, source-project acceptance or provider telemetry.
