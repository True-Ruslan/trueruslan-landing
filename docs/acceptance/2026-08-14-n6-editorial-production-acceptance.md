# N6 Full-site Editorial UX + Copy Polish — Production Acceptance

Date: **2026-08-14**

Status: **PRODUCTION ACCEPTED**

This ledger records the post-N5 N6 editorial program: the full-site audit, the bounded public-copy implementation, the stale production-verifier defect discovered after merge, and the exact deployed SHA that restored all production gates.

## Scope and invariants

N6 was limited to editorial/reader quality. It did not reopen site architecture, typography, canonical URLs, navigation/search ownership, registries, analytics or external search-evidence state.

Preserved: static-first/build-time/progressive-enhancement architecture; Onest typography; QWEP as current full-time commercial context; MarketDB as closed historical commercial context; existing project/Note/publication identities; no automatic external posting or Search Console/Webmaster mutation; no ranking/CTR/engagement/conversion claim.

## N6A — full-site editorial/UX audit

PR #231; exact head `7218cad982b146d72140c149e2905df82ea59617`; squash/deployed SHA `99af9cd2e9f31f124fb095cd2b7b2b23cc1e2a97`.

Result: **50/50 canonical routes** resolved; Tier 1 = 14, Tier 2 = 18, Tier 3 = 18; final configured automated warnings = **0**; Onest disposition = **KEEP**; exactly **8** bounded N6C copy corrections selected.

```text
read-only audit run:             31706835072 — SUCCESS
audit artifact:                  9183532020
audit digest:                    sha256:b2fff87182c34910a84a1ded97191e08f72464627606aeba74fc24d5239ca647
exact-head Build:                31708994459 — SUCCESS
exact-head CodeQL:               31708994416 — SUCCESS
Dependency Review:               SUCCESS
quality artifact:                9184636731
quality digest:                  sha256:44169c8c1b4f73e69a849ac4ae36b7f7034855e4b78c7d7b71e1a290db6fe619
post-merge Pages:                31709848292 — SUCCESS
post-merge CodeQL:               31709848339 — SUCCESS
deployment-triggered Production: #560 / 31709940436 — SUCCESS
```

Human ledger: `docs/audits/2026-08-13-full-site-editorial-ux-qa.md`.

## N6C — bounded editorial copy polish

PR #233. TDD RED `ea88241d573905db21d2b4e060b0ceb922d27de1`; Build `31710435092` failed exactly eight new copy contracts: **797 PASS / 8 intended FAIL**.

Final exact head `513243b7156227888a5ec9f3eecbe3e23939e3bd`; initial squash/deployed SHA `ec4b0b7ead1117b2bb507e25e517400b36e771a1`.

Scope: RU Projects, Work with me, About, Materials, Publications, Engineering Notes hub; EN Projects and About. No typography, URL, registry, workflow, deep case-study or deep Note architecture change.

```text
Build:                           #2087 / 31725770799 — SUCCESS
Dependency Review:               #1508 / 31725770759 — SUCCESS
CodeQL:                          #1658 / 31725770921 — SUCCESS
quality artifact:                9191401875
quality digest:                  sha256:69bedc072015008886ac91ddcd36e37d16e2c59cc068361d5ae0512c73b5fbbf
review threads:                  0
```

## Post-merge verifier regression

The N6C deployment succeeded, but the first two Production Live runs on `ec4b0b7ead1117b2bb507e25e517400b36e771a1` failed at the same verifier step:

```text
Production Live push:            #561 / 31731621136 — FAILURE
Production Live workflow_run:    #562 / 31731693651 — FAILURE
failing gate:                    Run deployed Work with me smoke
failure:                         Error: ru no-JS missing Context
```

Earlier production gates in those jobs passed. Root cause was a stale verifier contract: N6C intentionally translated RU Work with me service/process labels, while `production-work-with-me-smoke.cjs` still applied the old English no-JS token list to both locales.

## PR #234 — verifier correction

The fix changes only the production verifier and adds a regression contract; public product behavior is unchanged.

RED commit `088dceaea3edba7dfc3115a499fc8af797d99379`:

```text
Build:                           31744750885 — expected FAILURE at Test
result:                          805 PASS / 1 intended FAIL
RED artifact:                    9198509630
RED digest:                      sha256:a05d2e77d4ad19db8b060e8771051d3a7463dda4633749007784a13b0bcf2b12
```

GREEN exact head `2f7ad5a11fef85e9d5e88028f6fba05674d4e637`:

```text
Build:                           #2089 / 31744917904 — SUCCESS
Dependency Review:               31744917926 — SUCCESS
CodeQL:                          31744917942 — SUCCESS
GitHub Advanced Security:        no new alerts
quality artifact:                9198759058
quality digest:                  sha256:2802631b5c10fb2d8c8359801ad8ba15e8ab0a7a728aadab6445b55cfef15993
review threads:                  0
```

RU no-JS now checks the accepted N6C reader-facing Russian labels; EN keeps the accepted English labels. Existing date, Telegram/email, no-sales-runtime, SEO, homepage, contacts, contextual CTA and generated-search assertions remain unchanged.

## Exact production acceptance

PR #234 squash / final deployed SHA: `635b4a0760765a515277ad8abcbb1500bf646027`.

```text
Pages:                           #255 / 31745658299 — SUCCESS
Pages deployment ID:             5896352977
Pages artifact:                  9198872713
Pages artifact digest:           sha256:9b1a92c0838b68c0a85b61ef2fddd42ae04e44c3e2b5410c70c589373019fc01
Pages verification reports:      9198879250
Pages reports digest:            sha256:7dcb5a116c97deb776fa4f66dc469b8093ee7a3828cbe1d872bdb7ce48906388
Production Live push:            #564 / 31745658315 — SUCCESS
Production Live workflow_run:    #565 / 31745724350 — SUCCESS
production artifact:             9198954485
production digest:               sha256:a30b2e8cb15b7b00ebd22dc2b18a8f2f9d0f1c2eb970006db6c6dff1ad750b4c
master CodeQL:                   #1662 / 31745658298 — SUCCESS
```

Deployment-triggered Production Live #565 passed every production gate, including the previously failing Work with me smoke, P3.4A–F and favicon verification. The release blocker is closed on the exact deployed SHA above.

## External-state boundary

Unchanged:

- controlled manual launch: **`not-published`**;
- P4.1B: **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**;
- P4.1C: **WAITING**;
- P3.6: **NEXT / WAITING FOR EXTERNAL EVIDENCE**;
- clean-URL observation clock: **`2026-08-05T00:00:00Z`**;
- issue #82 remains the independent upstream Diplodoc/markdown-it blocker;
- Content Freshness #78 remains evidence-gated.

## Next action

No additional unguided visual or SEO rewrite is justified by N6 acceptance. The next product/operator action remains the prepared **deliberate controlled manual launch**, followed by accumulation and review of real Google Search Console / Yandex Webmaster observations before any evidence-backed P4.1C change.
