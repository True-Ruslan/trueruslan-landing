# Engineering Notes: content, navigation and SEO audit

Date: **2026-08-13**  
Planned artifact path retained from the approved N5 plan: `2026-08-12-engineering-notes-content-seo-audit.md`.

Status: **N5 AUDIT / RESEARCH COMPLETE — NO STRUCTURAL MERGE SELECTED**

## Executive decision

The current Engineering Notes set should **not** be consolidated by deleting pages, changing canonical URLs, or redirecting Note routes.

The main problem is reader navigation, not lack of substance:

- the registry contains 16 substantial, sectioned Notes;
- several Notes intentionally reuse the same evidence/verification vocabulary because they describe different system boundaries;
- three pairs have high tag overlap, but manual review shows different reader intent and different evidence;
- the current chronological `related` graph is strongly biased toward older gateway Notes and gives several newer deep dives no inbound Note relation;
- the Notes hub does not yet answer the scan-first question: **“where should I start for this topic?”**

The recommended next implementation is therefore non-destructive:

1. add a compact **Start here** path;
2. group Notes into three explicit reader-oriented series while retaining the complete chronological catalogue;
3. make related-reading edges deliberate and reciprocal enough that newer deep dives are discoverable;
4. strengthen a small number of summaries/intros whose intent is easy to confuse with a neighbouring Note;
5. preserve every current Note URL.

No SEO benefit is claimed from these changes in advance. They are primarily editorial/navigation improvements that also align with official crawlability/site-structure guidance.

---

## Evidence boundary

This audit combines:

- current `data/notes.json`;
- all 16 `docs/landing/notes/*.md` sources;
- deterministic inventory from `scripts/engineering-notes-audit.js`;
- current generated related-reading ownership in `scripts/notes-content.js`;
- bounded pre-launch search evidence already recorded by P4.1B;
- current primary guidance from Google Search Central and Yandex Webmaster.

The existing Google Search Console baseline is sparse and pre-announcement: **1 click / 8 impressions** in the reviewed window, with no exposed query rows. It is not enough to determine whether separate Note URLs are succeeding, cannibalising each other, or underperforming.

Therefore:

- no ranking/CTR/engagement conclusion is made;
- absence of traffic is not used as evidence that a Note should be removed;
- no Note merge is justified by keyword/tag overlap alone;
- search-engine replacement of URLs remains an external observed state, not a repository acceptance fact.

External state remains unchanged:

- controlled launch: `not-published`;
- P4.1B: `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE`;
- P4.1C: `WAITING`;
- P3.6: `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- clean-URL observation clock: `2026-08-05T00:00:00Z`.

---

## Official-source research

### People-first content: depth is not a word-count target

Google Search Central recommends original, substantial, useful content created for people and explicitly says Google has **no preferred word count**. It also warns against adding or removing content merely to make a site look fresh or to chase search traffic.

Primary source:

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Yandex similarly describes a good site as original, substantial, useful, people-oriented, easy to navigate and easy to understand. Its quality guidance treats very little information, unoriginal content and low-value generated pages as negative patterns, but does not establish a target article length.

Primary sources:

- https://yandex.com/support/webmaster/en/yandex-indexing/webmaster-advice
- https://yandex.com/support/webmaster/en/recommendations/usability

**Audit implication:** word count is an inventory signal only. It is not a merge/keep threshold. The current Notes are evaluated by distinct reader purpose, first-hand evidence, clarity and usefulness.

### Duplicate and near-duplicate content: similarity must be substantive

Google's canonical guidance is for duplicate or very similar pages. Redirects and `rel="canonical"` are strong canonicalisation signals, but they should not be introduced simply because two pages share tags or vocabulary.

Primary source:

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

Yandex defines duplicate pages as pages with nearly or completely identical text and notes that genuine duplicates can waste crawl resources or compete. Its remediation guidance likewise uses redirects/canonicalisation for actual duplicate content.

Primary sources:

- https://yandex.com/support/webmaster/en/yandex-indexing/about-doubles
- https://yandex.com/support/webmaster/en/robot-workings/canonical

**Audit implication:** the three highest-overlap pairs below do not meet the evidence bar for consolidation. Their primary content, examples and user questions are materially different.

### Internal linking and site structure: reader paths matter

Google states that crawlable `<a href>` links help it discover pages and that descriptive, relevant anchor text helps users and Google understand linked content.

Primary source:

- https://developers.google.com/search/docs/crawling-indexing/links-crawlable

Yandex recommends a clear link structure, regular HTML links, assigning each document to a comprehensible section and navigation that lets users find documents quickly.

Primary source:

- https://yandex.com/support/webmaster/en/recommendations/site-structure

**Audit implication:** the existing generated related links are valid crawlable links, but the graph is not yet an intentional learning path. Adding Start here + series + better related edges is a lower-risk and more reader-oriented first response than combining URLs.

### If a future merge changes URLs

Google's current URL-move guidance recommends an explicit old→new URL mapping, permanent redirects to the corresponding consolidated page, updated canonicals/internal links/sitemaps, redirect tests, monitoring and keeping redirects for a long period (generally at least one year). It explicitly allows older URLs to redirect to a new consolidated page when multiple pages have genuinely been combined.

Primary source:

- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

Yandex likewise recommends redirects from old pages to corresponding new pages and discourages redirecting many unrelated pages to one generic destination. Its HTTP status guidance recommends `301` for permanent page moves.

Primary sources:

- https://yandex.com/support/webmaster/en/yandex-indexing/www-migration
- https://yandex.ru/support/webmaster/ru/error-dictionary/http-codes

**Audit implication:** a future Note merge is a migration, not a text-edit operation. It would require explicit redirect/canonical/search/feed/sitemap/internal-link tests and post-deployment search-engine observation. No such migration is selected in this audit.

---

## Deterministic inventory

Inventory head used for the measurements below:

```text
88f4df21cd96db9c1111593e3302fe96b75726cc
```

Build:

```text
#2030 / 31679272317 — SUCCESS
```

Aggregate inventory:

| Signal | Value |
|---|---:|
| Registered Notes | 16 |
| Source bytes | 224,436 |
| Approx. prose words | 17,351 |
| `##+` headings | 174 |
| Registry reading-time range | 6–15 min |
| Smallest prose inventory | 355 words |
| Largest prose inventory | 2,083 words |
| High-overlap review pairs | 3 |

The word counter intentionally removes fenced code and markup noise. It is an approximate editorial inventory metric, not an SEO quality score.

### Link-graph finding

The current registry `related` edges are valid and useful, but they are historically skewed:

- `green-ci-is-not-product-verification`: 9 inbound related edges;
- `static-site-quality-gates`: 9;
- `source-tests-to-installed-acceptance`: 5;
- `server-authoritative-ai-npcs`: 4;
- several newer deep dives have **0** registry inbound edges: `clean-urls-without-cloudflare-routing`, `hybrid-cv-ai-recognition-boundaries`, `gametests-vs-installed-gameplay-acceptance`, `evidence-driven-project-state`.

This is not an indexing-failure claim. It is a repository-level navigation observation: newer Notes can be reached from the hub and their own outbound relations, but the Note-to-Note graph does not yet give them a strong reciprocal path.

---

## Per-note decision table

`In/Out` below means registry-generated related-reading edges, not all site-wide links. `Body links` counts explicit Markdown links to other Note files inside the article body.

| Note / URL | Inventory | Opening / evidence | In/Out | Primary disposition | Rationale |
|---|---|---|---:|---|---|
| `portfolio-runtime-boundary` — `/landing/notes/portfolio-runtime-boundary/` | 355 words · 5 headings · 6 min | Strong personal problem→decision opening; concrete architecture/result | 2/2 | **keep URL, group into explicit series/hub** | Compact but complete; natural gateway for Static-first Web. No duplication signal. |
| `static-site-quality-gates` — `/landing/notes/static-site-quality-gates/` | 563 · 9 · 7 min | Clear regression-driven setup; concrete CI layers | 9/5 | **keep URL, group into explicit series/hub** | Strong gateway for Evidence & Verification; high inbound count reflects its existing hub-like role. |
| `server-authoritative-ai-npcs` — `/landing/notes/server-authoritative-ai-npcs/` | 696 · 8 · 8 min | Strong project problem and authority boundary; concrete LivingWorld pipeline | 4/2 | **keep URL, group into explicit series/hub** | Distinct system-design article; good AI-series entry, not a protocol-parser duplicate. |
| `intersection-observer-giant-table` — `/landing/notes/intersection-observer-giant-table/` | 551 · 5 · 6 min | Strong symptom→root-cause narrative; concrete regression | 2/2 | **keep URL, group into explicit series/hub** | Distinct browser failure mode; fits Static-first Web as a focused incident note. |
| `static-first-sources-no-js` — `/landing/notes/static-first-sources-no-js/` | 645 · 6 · 7 min | Clear false assumption and observable no-JS outcome | 4/3 | **keep URL, group into explicit series/hub** | Distinct static-first representation boundary; complements runtime-boundary note rather than repeating it. |
| `green-ci-is-not-product-verification` — `/landing/notes/green-ci-is-not-product-verification/` | 663 · 7 · 8 min | Conceptually clear evidence-scope gateway | 9/1 | **keep URL, strengthen intro/summary** | Most central Note in the graph. Summary should explicitly position it as the general evidence-scope model, not another release/deployment deep dive. |
| `llm-output-is-a-protocol-boundary` — `/landing/notes/llm-output-is-a-protocol-boundary/` | 919 · 8 · 7 min | Strong transport-success≠contract-success thesis | 2/2 | **keep URL, strengthen intro/summary** | Shares AI/validation vocabulary with authority notes; clarify that this Note owns parsing/schema/protocol validation before authorization. |
| `source-tests-to-installed-acceptance` — `/landing/notes/source-tests-to-installed-acceptance/` | 2,083 · 17 · 11 min · 8 GitHub evidence links | Deep first-hand corrective-release retrospective | 5/3 | **keep URL, strengthen intro/summary** | Longest Note; overlap with GameTests is thematic, but this article owns the end-to-end release-gate progression and corrective history. Summary should say so immediately. |
| `probabilistic-proposals-deterministic-authority` — `/landing/notes/probabilistic-proposals-deterministic-authority/` | 1,392 · 11 · 12 min · 5 GitHub evidence links | Cross-project architecture pattern with concrete evidence | 2/3 | **keep URL, strengthen intro/summary** | General deterministic-authority pattern across projects; distinguish from the Vlezet-specific hybrid-CV case study and LLM parsing boundary. |
| `restart-persistence-is-a-product-contract` — `/landing/notes/restart-persistence-is-a-product-contract/` | 1,676 · 14 · 12 min · 7 GitHub evidence links | Strong product-contract framing; multiple continuity layers | 1/3 | **keep URL, group into explicit series/hub** | Distinct persistence/recovery question with deep evidence; belongs in Evidence & Verification. |
| `deployment-success-is-not-production-verification` — `/landing/notes/deployment-success-is-not-production-verification/` | 1,171 · 11 · 10 min · 3 GitHub evidence links · 1 fact marker | Clear deployment-vs-live boundary and TrueLanding incident | 3/3 | **keep URL, group into explicit series/hub** | Distinct delivery-layer intent; complements green-CI gateway and source/install acceptance. |
| `clean-urls-without-cloudflare-routing` — `/landing/notes/clean-urls-without-cloudflare-routing/` | 1,291 · 15 · 12 min · 1 body Note link · 2 GitHub evidence links · 1 fact marker | Excellent concrete route migration thesis and boundaries | 0/3 | **keep URL, group into explicit series/hub** | Strong Static-first Web deep dive; zero registry inbound is a navigation gap, not a content weakness. |
| `hybrid-cv-ai-recognition-boundaries` — `/landing/notes/hybrid-cv-ai-recognition-boundaries/` | 1,801 · 20 · 14 min · 2 body Note links · 4 GitHub evidence links · 8 fact markers | Detailed Vlezet case study with explicit authority boundary | 0/3 | **keep URL, strengthen intro/summary** | High overlap with general authority Note but materially different intent: concrete CV/AI implementation and acceptance evidence. |
| `gametests-vs-installed-gameplay-acceptance` — `/landing/notes/gametests-vs-installed-gameplay-acceptance/` | 1,729 · 13 · 15 min · 3 body Note links · 11 fact markers | Focused installed-game/testing-layer analysis | 0/3 | **keep URL, strengthen intro/summary** | Shares Release Engineering tags with source/install Note, but owns GameTests vs installed gameplay/system-layer question. Needs stronger differentiation in scan copy, not a merge. |
| `passive-pdf-validation-vs-semantic-completeness` — `/landing/notes/passive-pdf-validation-vs-semantic-completeness/` | 1,244 · 12 · 13 min · 3 body Note links · 10 fact markers | Strong layered proof model; concrete CV/PDF contract | 1/3 | **keep URL, group into explicit series/hub** | Distinct artifact/semantic-completeness problem; good Evidence & Verification deep dive. |
| `evidence-driven-project-state` — `/landing/notes/evidence-driven-project-state/` | 572 · 13 · 11 min · 3 body Note links | Dense but clearly structured state/evidence model | 0/3 | **keep URL, group into explicit series/hub** | Distinct ongoing truth/freshness model; zero registry inbound should be repaired through intentional reader paths. |

### Editorial reading of the inventory

The lower-word-count Notes are not automatically “thin”:

- `portfolio-runtime-boundary` is short because it makes one architecture decision and closes it;
- `intersection-observer-giant-table` is a focused incident/root-cause note;
- `evidence-driven-project-state` is compact prose but highly sectioned and concept-dense.

Conversely, the longest Notes are not automatically stronger SEO pages. Their length comes from concrete acceptance histories, examples and evidence. The correct editorial question is whether a reader can identify the purpose before committing to a 10–15 minute article.

---

## Overlap review: why no merge candidate survives

The deterministic inventory surfaced exactly three high-overlap pairs.

### 1. `source-tests-to-installed-acceptance` ↔ `gametests-vs-installed-gameplay-acceptance`

Tag Jaccard: **0.600**.

Why they look similar:

- both discuss release engineering, acceptance and reliability;
- both use VillAIgence evidence;
- both distinguish automated gates from installed behavior.

Why they remain separate:

- `source-tests...` is a longitudinal corrective-release story and end-to-end gate taxonomy from source through promotion;
- `gametests...` is a focused explanation of why GameTests and installed gameplay are different test/system boundaries;
- both are already long (2,083 vs 1,729 prose words). Combining them would create a much harder-to-scan article and erase a specific reader question.

Decision: **no merge; strengthen scan copy and place both in one series with explicit sequencing.**

### 2. `probabilistic-proposals-deterministic-authority` ↔ `hybrid-cv-ai-recognition-boundaries`

Tag Jaccard: **0.600**; description similarity: **0.286**.

Why they look similar:

- AI, authority and validation are central in both;
- both use proposal→validation→apply boundaries.

Why they remain separate:

- `probabilistic...` is a reusable cross-project architecture pattern;
- `hybrid-cv...` is a concrete Vlezet recognition case study with CV geometry, immutable draft identity, sanitizer and acceptance evidence;
- the general article gives a vocabulary; the case study demonstrates an implementation.

Decision: **no merge; make the general→case-study relationship explicit.**

### 3. `llm-output-is-a-protocol-boundary` ↔ `probabilistic-proposals-deterministic-authority`

Tag Jaccard: **0.600**.

Why they look similar:

- both treat AI output as untrusted input;
- both use validation/reliability language.

Why they remain separate:

- `llm-output...` owns transport success vs schema/protocol validity;
- `probabilistic...` owns authorization/revalidation against current state and the mutation boundary;
- one is about **parsing a message safely**, the other about **deciding whether an accepted proposal may change authoritative state**.

Decision: **no merge; sequence them in the AI series and differentiate summaries.**

---

## Proposed reader architecture

This is a recommendation for Task 8, not an implementation in the audit PR.

### Start here

Keep this section to three gateway choices:

1. **Evidence & Verification** → `green-ci-is-not-product-verification`
2. **AI Authority & Protocol Boundaries** → `probabilistic-proposals-deterministic-authority`
3. **Static-first Web Engineering** → `portfolio-runtime-boundary`

The hub should still expose the complete chronological catalogue below these gateways. “Start here” is orientation, not a replacement index.

### Series A — Evidence & Verification

Primary sequence:

1. `green-ci-is-not-product-verification`
2. `static-site-quality-gates`
3. `source-tests-to-installed-acceptance`
4. `gametests-vs-installed-gameplay-acceptance`
5. `restart-persistence-is-a-product-contract`
6. `deployment-success-is-not-production-verification`
7. `passive-pdf-validation-vs-semantic-completeness`
8. `evidence-driven-project-state`

Reader promise: understand what each kind of evidence proves, what it does not prove, and how repository/build/artifact/runtime/manual/external truth remain separate.

### Series B — AI Authority & Protocol Boundaries

Primary sequence:

1. `probabilistic-proposals-deterministic-authority`
2. `llm-output-is-a-protocol-boundary`
3. `server-authoritative-ai-npcs`
4. `hybrid-cv-ai-recognition-boundaries`

Reader promise: treat AI output as a proposal crossing protocol, validation, authorization and deterministic-mutation boundaries, then see the pattern applied in game and CV systems.

### Series C — Static-first Web Engineering

Primary sequence:

1. `portfolio-runtime-boundary`
2. `static-first-sources-no-js`
3. `intersection-observer-giant-table`
4. `clean-urls-without-cloudflare-routing`

Reader promise: build a static-first site where runtime is optional, important content remains available, visual enhancement cannot hide core content, and public URLs are decoupled from generated filenames.

`static-site-quality-gates` and `deployment-success-is-not-production-verification` are useful cross-links from this series but should keep Evidence & Verification as their primary series to avoid duplicating catalogue ownership.

---

## Ranked Task 8 implementation scope

### Priority 1 — Start here + series metadata/hub

Recommended implementation:

- add bounded build-time metadata in `data/notes.json` for primary `series` and optional `role` (`gateway` / `deep-dive` / `incident`);
- validate allowed series/roles in `scripts/notes-content.js`;
- render a compact three-choice Start here block and three series paths above the full chronological Notes catalogue;
- keep every existing Note URL, Atom entry and canonical route unchanged;
- no runtime API, filtering state or second search owner.

Acceptance:

- all 16 Notes still appear in the complete catalogue;
- exactly three Start here gateway links;
- every Note belongs to exactly one primary series;
- all generated series links are ordinary crawlable `<a href>` links;
- no-JS fallback exposes the same reader paths;
- mobile/desktop/a11y/visual/browser checks remain green.

### Priority 2 — Intentional related-reading graph

Update `related` ownership so newer deep dives are not dead ends in the Note-to-Note graph.

Minimum target:

- every Note has at least one inbound registry relation;
- overlap pairs explicitly link to each other where useful;
- related links favour “next useful concept/case” rather than only publication chronology;
- avoid turning every Note into a link farm.

### Priority 3 — Differentiate six scan summaries/intros

Keep URLs/content bodies, but sharpen the first-screen promise for:

- `green-ci-is-not-product-verification` — general evidence-scope gateway;
- `llm-output-is-a-protocol-boundary` — parse/schema protocol boundary;
- `source-tests-to-installed-acceptance` — end-to-end corrective release-gate retrospective;
- `probabilistic-proposals-deterministic-authority` — reusable authority/mutation pattern;
- `hybrid-cv-ai-recognition-boundaries` — Vlezet CV/AI case study;
- `gametests-vs-installed-gameplay-acceptance` — GameTests vs installed gameplay boundary.

Prefer changing registry descriptions and, only where needed, the first two or three sentences. Do not inflate word count.

### Priority 4 — Post-launch evidence review, not pre-launch consolidation

After controlled launch and enough external evidence exists, revisit:

- actual query intent per Note;
- whether two Notes repeatedly appear for the same query and fail to satisfy users;
- Yandex duplicate/low-demand observations;
- inbound/internal reader paths and engagement evidence.

Only then consider merge/canonical migration.

---

## Merge/redirect migration contract if future evidence justifies it

No merge is selected now. If one is selected later, implementation must include at least:

1. written old→destination URL mapping and duplication rationale;
2. exact permanent compatibility redirect behavior for each old Note URL;
3. destination self-canonical and no conflicting canonical on the old route;
4. internal links moved to the destination rather than relying on redirects;
5. Notes Registry ownership migrated without creating two canonical records;
6. generated search ownership updated;
7. Atom/feed ownership updated deliberately;
8. Sitemap/canonical route assertions updated;
9. unit + generated artifact + browser tests for old and destination routes;
10. Pages exact-SHA deployment verification;
11. Production Live verification;
12. external Google/Yandex observation tracked separately until search engines process the migration.

A structural merge must not silently reset the existing clean-URL observation clock or be called “SEO accepted” immediately after deployment.

---

## Selected audit conclusion

For the current pre-launch portfolio, the best next move is **reader architecture before URL architecture**.

The Notes already contain substantial, first-hand engineering material. The risky part is asking a new visitor to infer the conceptual map from 16 chronologically presented titles that reuse deliberate engineering vocabulary.

N5 therefore closes with:

```text
KEEP ALL CURRENT NOTE URLS
+ START HERE
+ THREE EXPLICIT SERIES
+ BETTER RELATED READING
+ SIX SCAN-COPY DIFFERENTIATIONS
- NO MERGE
- NO REDIRECT
- NO CANONICAL CONSOLIDATION
- NO SEO IMPACT CLAIM
```

Task 8 should implement only these non-destructive selected changes behind source/build/browser/no-JS/accessibility tests, then pass the same exact-head → review → squash → Pages → Production Live acceptance sequence used by the rest of TrueLanding.
