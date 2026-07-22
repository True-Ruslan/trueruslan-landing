# TrueRuslan Portfolio v0.3 — design

## Goal

Evolve the existing static-first engineering portfolio into a living engineering space without introducing a backend, CMS, runtime GitHub API dependency, or frontend framework.

The release should make project state easier to maintain, show what is happening now, expose project evolution over time, improve technical-note discoverability, and add a fast global navigation surface.

## Scope

v0.3 includes five P0 capabilities:

1. Single Project Registry as the canonical source for project identity, status, links, tags, and presentation metadata.
2. `/now` page generated from maintained data and concise editorial copy.
3. Project timelines for flagship projects, starting with LivingWorld and NODE ZERO.
4. Engineering Notes improvements: structured metadata, related navigation, and RSS/Atom feed generation.
5. Global `Cmd/Ctrl+K` command palette that reuses existing static/local-search boundaries rather than creating a second search backend.

Out of scope for this release: multilingual site, analytics, custom domain, runtime API, CMS, authentication, database, React/Next.js migration, AI chatbot, and automated external-repository ingestion.

## Architectural principles

- Preserve the current `static-first + build-time intelligence + progressive enhancement` architecture.
- No runtime fetch is required for core content.
- Content remains usable without JavaScript.
- New generated content must be deterministic and testable.
- Prefer one canonical data source and derived manifests over duplicated project metadata.
- Keep Diplodoc responsible for knowledge pages and local search; keep the standalone homepage lightweight.

## 1. Project Registry

Introduce `data/projects.json` as the canonical project registry.

Each project record contains:

- `slug`
- `name`
- `status`
- `statusLabel`
- `summary`
- `featured`
- `active`
- `visibility`
- `href`
- `tags`
- optional `links`
- optional `timeline`
- optional `noteSlugs`

The registry becomes the authoritative source for project identity and state used by build-time consumers.

Existing `data/currently-building.json` is removed or converted into a derived compatibility output generated from the registry. The implementation should avoid keeping two hand-maintained sources with overlapping fields.

Validation rules:

- unique slug
- required strings are non-empty
- `href` is safe and local unless explicitly declared external
- tags are bounded
- known status values only
- active projects must have a usable destination
- referenced timeline data must exist

## 2. `/now`

Add `docs/landing/now.md` and a small build-time data source such as `data/now.json` only for information that is not project metadata.

The page presents:

- what is actively being built
- what is currently being explored/learned
- what is currently being written
- a short "updated" marker

Active project cards are derived from `projects.json`, not duplicated in `now.json`.

Navigation and sitemap must expose `/now` as a first-class destination.

## 3. Project timelines

Add structured timeline data under `data/project-history/<slug>.json` for flagship projects.

Initial coverage:

- LivingWorld
- NODE ZERO

A timeline entry contains:

- date or month
- label/title
- concise description
- optional version
- state: `past`, `current`, or `next`
- optional evidence link

Case-study pages render a semantic timeline that works without JavaScript. Progressive CSS/JS may enhance emphasis and navigation but is not required for comprehension.

The registry references timeline availability rather than duplicating timeline entries.

## 4. Engineering Notes metadata and feed

Introduce a canonical notes metadata manifest, e.g. `data/notes.json`, containing:

- slug
- title
- description
- published date
- updated date
- reading-time estimate
- tags
- related note slugs

Build-time validation ensures referenced note files exist and related links are valid.

Enhance note pages with metadata and related/previous/next navigation where practical without replacing Diplodoc's primary page content.

Generate deterministic RSS/Atom output into the built site. Feed items include title, canonical URL, summary, published/updated date, and tags where supported.

## 5. Global command palette

Add a progressive command palette opened with:

- `Cmd+K`
- `Ctrl+K`
- `/` where it does not interfere with editable controls

The palette provides two layers:

1. deterministic quick destinations: Projects, Now, Notes, Engineering Map, Resume, GitHub;
2. a search handoff to the existing generated local-search page.

It must not implement a competing full-text search index.

Requirements:

- keyboard accessible
- focus trapped only while open and restored on close
- Escape closes
- reduced-motion safe
- semantic fallback navigation remains available without JavaScript
- no framework dependency

## Data flow

```text
projects.json
   ├─ homepage active-project cards
   ├─ /now active project section
   ├─ projects hub metadata
   ├─ Engineering Map project validation/link metadata where applicable
   └─ build-time navigation/search command metadata

project-history/*.json
   └─ flagship case-study timelines

notes.json
   ├─ note metadata blocks
   ├─ related/prev/next navigation
   └─ RSS/Atom feed

now.json
   └─ learning/writing/current-focus copy only
```

## Error handling

All new manifests are validated during the existing build/post-processing boundary. Invalid or inconsistent project/note/timeline data fails the build with actionable messages rather than silently omitting content.

Examples of build failures:

- duplicate project slug
- unknown timeline project
- missing note page
- related note points to unknown slug
- unsafe URL
- invalid date
- duplicate timeline state marked `current` where only one is allowed

## Testing

Add unit/contract tests for:

- project registry validation
- derivation of active projects
- timeline validation/rendering
- notes metadata validation
- RSS/Atom deterministic generation
- command-palette navigation manifest

Extend generated-site integrity/browser coverage for:

- `/now`
- command-palette keyboard open/close/focus behavior
- timeline presence on LivingWorld and NODE ZERO
- feed availability and valid content type/content structure
- mobile horizontal overflow
- Axe serious/critical violations

Do not expand Lighthouse scope unless the new UI materially changes existing measured pages.

## Migration strategy

1. Add registry and validators first.
2. Migrate `currently-building` consumers to registry-derived data.
3. Add `/now`.
4. Add timelines.
5. Add Notes metadata/feed.
6. Add command palette.
7. Update docs and quality gates.
8. Remove obsolete duplicated data only after all consumers use the registry.

## Success criteria

- One hand-maintained source defines project identity/status.
- Homepage and `/now` show consistent active-project state.
- LivingWorld and NODE ZERO have useful visible timelines.
- Engineering Notes expose structured metadata and a working feed.
- `Cmd/Ctrl+K` provides fast keyboard navigation without adding a second search engine.
- Existing build, integrity, accessibility, performance, cross-browser, visual-regression, and production-smoke guarantees remain green.
