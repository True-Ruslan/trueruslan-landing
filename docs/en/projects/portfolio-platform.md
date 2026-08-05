# TrueRuslan Landing — static-first engineering portfolio platform

**TrueRuslan Landing** is the production platform behind this portfolio, web resume, case studies, Engineering Notes, Publications, Sources Knowledge Base and their evidence boundaries.

[Open the repository on GitHub ↗](https://github.com/True-Ruslan/trueruslan-landing)

**Current status:** <span data-tr-project-status="portfolio-platform"></span>

<!-- case-study:problem -->
## Problem: a portfolio should expose engineering decisions, not only technologies

A conventional portfolio can list skills and projects while hiding the questions that matter most:

- what problem the system solves;
- where authority and trust boundaries sit;
- what alternatives were rejected;
- which result is actually verified;
- whether green CI describes source, a generated artifact, a deployment or live production;
- which limitations remain after publication.

This platform therefore treats public claims as bounded engineering state. Active work, accepted work and externally observed state are kept distinct.

> A public claim must identify both its scope and the evidence layer that supports it.

<!-- case-study:constraints -->
## Constraints that shaped the platform

### Core content must survive without JavaScript

Pages are generated as semantic HTML. JavaScript progressively enhances search, filtering, diagrams, Photo Stories and the command palette, but it does not own the main text.

### Each data type has one canonical source

Projects, evidence, timelines, `/now`, Notes, Publications, Sources, metadata and RU/EN pairs live in reviewed registries. Build-time generators reuse those records instead of copying status text across pages.

### GitHub Pages is static hosting, not an application runtime

There is no backend, runtime API, database, account system or server-side CMS. A feature must be generated ahead of time or degrade to ordinary HTML and links.

### Search must have one owner

The Diplodoc generated index remains the only site-wide full-text search. Page-local filters and command actions do not create a second search or parallel index.

### Privacy expansion must be explicit

Cloudflare Web Analytics is optional aggregate telemetry only. The platform does not add session replay, fingerprinting, advertising profiles, cookies or custom user identifiers.

### English is a controlled layer, not a second platform

RU and EN share one build, one registry model and one search architecture. Russian-only destinations are labelled explicitly.

<!-- case-study:current-state -->
## Current production boundary

The platform is published on `https://trueruslan.ru` through GitHub Pages.

The accepted public surface includes:

- standalone RU/EN homepages;
- Diplodoc knowledge pages;
- RU/EN resume and downloadable PDF;
- Project Registry, Project Evidence and timelines;
- `/now`;
- Engineering Notes and Atom feed;
- Publications and Sources;
- Engineering Map and generated local search;
- canonical metadata, Sitemap, hreflang and OpenGraph;
- optional aggregate analytics;
- deployment-driven Production Live Smoke.

Public identity uses repository-native directory routes, including:

```text
/landing/projects/portfolio-platform/
/en/projects/portfolio-platform/
/landing/notes/
/_search/ru/
```

Legacy `.html` remains only as a `noindex,follow` compatibility entrypoint that preserves query and fragment. GitHub Pages cannot provide repository-configured HTTP 301 redirects, so this behavior is not presented as a server redirect.

<!-- case-study:decisions -->
## Architecture and key decisions

### Separate the standalone homepage from the knowledge runtime

The homepage uses a minimal renderer and does not load the Diplodoc runtime bundle. Knowledge pages retain Diplodoc navigation, content structure and search integration.

```text
canonical registries
        ↓
standalone renderer + Diplodoc build
        ↓
build-time content and route processing
        ↓
verified static artifact
        ↓
GitHub Pages deployment
        ↓
Production Live Smoke
```

### Prefer build-time intelligence to a runtime backend

Post-processing injects project state, evidence, timelines, Notes, Publications, Sources, metadata, OG cards, Sitemap, feed, analytics policy and clean directory routes. Missing placeholders, unsafe references and inconsistent registries fail the build.

### Keep clean URL ownership inside the repository

PR #114 publishes directory `index.html` files and rewrites internal, canonical, search, Sitemap and feed links. A Cloudflare Worker or Rewrite Rule is not required for application routing.

Cloudflare may remain the DNS/CDN and aggregate analytics layer, but the site can be built and served from the repository plus GitHub Pages without Cloudflare-specific runtime logic.

### Treat verification as layered evidence

The release boundary separates:

1. unit and registry contracts;
2. generated-site integrity;
3. Chromium accessibility and Lighthouse;
4. Firefox/WebKit compatibility;
5. search, RU/EN, metadata and analytics checks;
6. visual regression;
7. custom-domain artifact verification;
8. Pages deployment identity;
9. Production Live Smoke against the deployed SHA.

Exact artifact and deployed behavior are not interchangeable claims.

### Keep public truth reviewable

Freshness probes and repository activity can report drift, but they cannot automatically promote a project, rewrite a resume or expand a public claim.

<!-- case-study:alternatives -->
## Alternatives considered and rejected

### Runtime CMS or dedicated backend

Rejected because current content is versioned and naturally reviewed with code. A backend would introduce authentication, persistence and security surface without a demonstrated user need.

### A second search implementation

Rejected. Sources use page-local filtering and the command palette hands off to the canonical Diplodoc search instead of maintaining another index.

### Cloudflare Worker as the required clean URL router

Rejected after repository-native directory routes proved sufficient. A Worker would create a second operational truth outside the pull request and Pages artifact.

### Automatic public status mutation

Rejected because repository activity is not equivalent to product acceptance. Automation may surface drift, not broaden a claim.

### Behavioural analytics and session replay

Rejected because the privacy cost is disproportionate to the current measurement need. Aggregate telemetry is sufficient and is not used to make strong engagement conclusions from low traffic.

<!-- case-study:evidence -->
## Evidence boundary

The canonical Russian page renders the registry-backed Project Evidence block. The controlled English layer summarizes the same accepted boundaries without maintaining a separate evidence model:

- PR #114: repository-native clean URL contract;
- Build #836: exact-head repository and generated-artifact readiness;
- Pages #147: publication of the accepted squash;
- Production Live Smoke #58: deployed browser, route, search, feed and favicon proof.

None of these signals proves audience growth, ranking quality or immediate search-index replacement.

<!-- case-study:limitations -->
## Known limitations

- GitHub Pages cannot emit a repository-defined HTTP 301; legacy `.html` uses a static compatibility page.
- Search-console observations update on external crawler schedules.
- The English layer is intentionally incomplete.
- PDF verification is structural and passive; compressed semantics are not guessed from raw bytes.
- Aggregate Cloudflare telemetry is not yet sufficient for broad engagement decisions.
- Static-first architecture does not provide accounts, comments or user-generated content without a separate product decision.

<!-- case-study:next -->
## Next accepted slice

After P3.2, **P3.3 Flagship normalization** will align VillAIgence and Vlezet to the expanded case-study order while preserving their current acceptance boundaries.

VillAIgence remains `ACCEPTANCE IN PROGRESS` until cumulative manual acceptance exists. Vlezet M7.8C remains pending until exact-head automation and the same representative real-plan owner test pass.

<!-- case-study:related -->
## Related material

- [Why the landing page is separate from the Diplodoc runtime — Russian (RU) →](../../landing/notes/portfolio-runtime-boundary.md)
- [Static-site quality gates — Russian (RU) →](../../landing/notes/static-site-quality-gates.md)
- [Why green CI is not verified product — Russian (RU) →](../../landing/notes/green-ci-is-not-product-verification.md)
- [Engineering Projects](../projects.md)
- [Repository ↗](https://github.com/True-Ruslan/trueruslan-landing)

<!-- case-study:retrospective -->
## Retrospective

I would define source change, generated artifact, deployment and live acceptance as separate concepts earlier. Several false signals came from using the word “ready” for more than one evidence layer.

I would also establish the clean directory route contract before adding the custom domain. Route identity is easier to maintain when it belongs to the repository artifact from the start.

The durable lesson is that a static site becomes an engineering system once its claims, routes, content graph and deployment evidence must remain consistent through repeated change.
