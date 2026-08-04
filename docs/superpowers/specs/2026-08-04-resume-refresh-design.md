# Resume Refresh Design — 2026-08-04

## Goal

Replace the downloadable CV with the newly supplied three-page resume and synchronize every public surface that makes concrete professional-profile claims.

## Ground truth

The supplied CV establishes:

- more than five years of commercial experience;
- current role at QWEP;
- current stack centred on Java 21–25, Spring Boot 3.5–4, PostgreSQL, ClickHouse, Kafka and MinIO;
- previous work at Runet Business Systems, Bell Integrator, Reliability Technologies and New Automation Technologies;
- corporate MCP-server and AI-tooling work;
- teaching and postgraduate research;
- postgraduate, master's and bachelor's education records.

The visible contact URL and embedded personal-site link must both use `https://trueruslan.ru/`.

## Scope

1. Replace `docs/assets/documents/cv.pdf`.
2. Update Russian and English resume pages.
3. Update the current-stack paragraph on Russian and English About pages.
4. Update the homepage Java range.
5. Update Russian and English resume metadata.
6. Add a permanent content contract.
7. Verify PDF rendering, text replacement, annotations and metadata before repository publication.

## Content boundaries

- Do not invent metrics or responsibilities absent from the supplied CV.
- Do not expose proprietary architecture details.
- Keep the PDF as the canonical formal resume; the web pages are concise, readable projections.
- Preserve static-first rendering, current routes, PDF embedding and existing download URLs.
- Do not create a second resume data registry solely for this update.

## Acceptance

- RED contract fails only on stale resume claims and old PDF.
- GREEN contract passes with no `3+ years`, `Java 8–21`, `MarketDB` or `.com` website claim in current resume surfaces.
- PDF remains three pages, readable, unclipped and linked to the canonical domain.
- Full repository CI, browser, accessibility, metadata, visual and custom-domain matrix passes.
- Exact post-merge Pages deployment passes Production Live Smoke.
