# Controlled Launch Pack

Status: **implementation candidate; publication remains manual and not yet evidenced**.

## Purpose

Prepare deterministic launch/share drafts from the already accepted distribution-readiness model without creating a second source of truth and without mutating any external service.

The launch pack exists because the repository is technically ready for distribution while the site owner has not yet performed a public launch. Preparation and publication are deliberately separate evidence classes.

## Authority

Canonical launch targets continue to be owned by:

- `data/distribution-targets.json` for target identity, audiences, allowed channels, framing and evidence boundaries;
- `data/page-meta.json` for page titles and presentation metadata;
- `scripts/distribution-readiness.js` for validation, clean-URL projection and exact production-origin ownership;
- `docs/DISTRIBUTION.md` for the deterministic human-readable readiness runbook.

`scripts/launch-pack.js` is a derived presentation layer only. It must not become a competing registry.

## Output contract

The generator produces local/CI artifacts under `distribution-artifacts/`:

- `controlled-launch-pack.json`;
- `controlled-launch-pack.md`.

Every generated pack is explicitly:

- `status: prepared`;
- `publicationState: not-published`;
- `mode: manual-only`;
- derived from canonical distribution readiness.

A draft may exist only for a channel already allowed by the canonical target. Current controlled channels are GitHub, Habr, Telegram and direct sharing.

## URL boundary

Every draft must use the exact canonical production origin:

`https://trueruslan.ru`

The generator fails closed on:

- credentials in URLs;
- query parameters or fragments;
- UTM/tracking mutations;
- legacy `/landing/` identities;
- public `.html` identities;
- non-directory clean routes.

The launch pack never creates alternate share URLs.

## Copy boundary

Ready-to-paste draft text is derived from accepted target title/framing and the canonical URL. The target evidence boundary remains visible as operator context but is not silently expanded into stronger claims.

Prepared copy must not be interpreted as evidence of:

- publication;
- reach or impressions;
- clicks or engagement;
- ranking or SEO impact;
- hiring or collaboration outcomes;
- product impact.

A human should review a draft immediately before posting because distribution context can change independently of repository state.

## External-action boundary

This feature does **not**:

- authenticate to external channels;
- call posting APIs;
- schedule announcements;
- send network requests;
- write external account state;
- mark a draft as published.

Actual publication remains a deliberate operator action outside repository automation. Real publication evidence may be recorded only after the external post/profile state exists and can be observed.

## Workflow ownership

The existing read-only `Distribution Readiness` workflow owns launch-pack generation. It keeps `contents: read`, generates the pack into the same reviewable `distribution-artifacts/` directory and uploads those artifacts for inspection.

Local reproduction:

```bash
npm run report:launch-pack
```

## Measurement boundary

The first real Google Search Console export supplied on 2026-08-12 is a sparse **pre-public-launch / clean-URL-migration baseline**. It is useful for future before/after context but is not statistically sufficient for CTR, ranking or causal conclusions.

Therefore launch-pack acceptance does not:

- complete P4.1B evidence review;
- open P4.1C automatically;
- complete or reset P3.6;
- reset the clean-URL observation clock (`2026-08-05T00:00:00Z`).

After a real controlled launch, external observations must accumulate before any evidence-backed optimization decision is made.
