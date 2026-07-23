# P2.1 Minimal RU/EN — Design

Date: 2026-07-23
Status: approved for implementation under delegated project autonomy

## Goal

Add a deliberately small English-language layer to TrueRuslan without turning the repository into two independently maintained sites.

Russian remains the default/root language. English exists only for the highest-value public surfaces:

1. homepage;
2. About;
3. Resume;
4. Projects hub;
5. LivingWorld flagship case study;
6. `server-authoritative-ai-npcs` Engineering Note;
7. `llm-output-is-a-protocol-boundary` Engineering Note.

The milestone must preserve the project's existing architecture:

**static-first + build-time intelligence + progressive enhancement**.

## Current constraints

- The site has one Diplodoc build and one site-wide local search index.
- The root homepage is a standalone generated HTML template, while knowledge pages are Diplodoc Markdown.
- Russian URLs are already public and must not move.
- Project Registry, timelines, Project Evidence, Notes metadata and other registries are canonical truth and must not be cloned into language-specific copies.
- Existing SEO/page metadata is build-time generated.
- Existing quality gates include generated-site integrity, browser/Axe/Lighthouse, cross-browser, search, metadata/OpenGraph and visual regression.

## Chosen architecture

### 1. One build, one site, one search index

English pages live inside the existing `docs/` tree under `docs/en/` and are compiled by the same Diplodoc invocation as Russian content.

Do not create:

- `docs-en/` as a second independent documentation tree;
- a second Diplodoc build;
- a second search engine/index;
- runtime language fetching;
- a CMS/database/localization service.

The existing `_search/ru/` index remains the single site-wide full-text index and includes whatever pages the one build indexes. English search quality is intentionally minimal in P2.1; no duplicate index is introduced.

### 2. URL model

Russian remains canonical at existing paths:

- `/`
- `/landing/about.html`
- `/landing/resume.html`
- `/landing/projects.html`
- `/landing/projects/livingworld.html`
- `/landing/notes/server-authoritative-ai-npcs.html`
- `/landing/notes/llm-output-is-a-protocol-boundary.html`

English uses a clean `/en/` namespace:

- `/en/`
- `/en/about.html`
- `/en/resume.html`
- `/en/projects.html`
- `/en/projects/livingworld.html`
- `/en/notes/server-authoritative-ai-npcs.html`
- `/en/notes/llm-output-is-a-protocol-boundary.html`

No automatic locale redirect based on browser language. The root remains Russian and deterministic.

### 3. Canonical language-pair manifest

Add `data/i18n.json` as a small routing/relationship registry, not a prose source.

Each entry contains:

- stable `id`;
- `ru` generated HTML path;
- `en` generated HTML path.

Example:

```json
{
  "id": "livingworld",
  "ru": "landing/projects/livingworld.html",
  "en": "en/projects/livingworld.html"
}
```

The manifest owns only language-pair routing.

It does **not** own translated prose, project status, evidence, timelines or Notes metadata.

### 4. Authoring ownership

Russian prose remains in existing sources.

English prose is manually authored in:

- `templates/index.en.html` for the standalone homepage;
- `docs/en/*.md` for Diplodoc pages.

The English layer is curated, not machine-generated at runtime and not required to be word-for-word identical. It must preserve factual meaning and avoid claims not present in canonical sources.

Shared machine-like truth remains shared:

- project status comes from `data/projects.json` where injected;
- repository links stay canonical;
- no English clone of `data/projects.json`;
- no English clone of `data/project-evidence.json`;
- no English clone of project timelines;
- no English clone of `data/notes.json`.

### 5. LivingWorld evidence boundary

The English LivingWorld page is a curated narrative mirror, not a second Project Evidence renderer.

P2.1 does not localize the Project Evidence or timeline rendering systems.

The English page may:

- use shared registry-derived project status;
- explain the current architecture and reasoning in English;
- link explicitly to the Russian canonical page for the full timeline/evidence block.

This avoids duplicating current-state evidence or adding locale-specific machine truth.

### 6. English Projects hub fallback

The English Projects hub describes the portfolio in English.

Only LivingWorld receives an English case-study route in P2.1.

For untranslated project detail pages:

- links may intentionally lead to the existing Russian page;
- link text must clearly mark the fallback as `RU` / `Russian`;
- do not silently imply an English translation exists.

Project status placeholders for LivingWorld and NODE ZERO continue to come from the shared Project Registry.

### 7. Build-time i18n enhancer

Add `scripts/i18n.js` with pure/mostly-pure helpers plus an apply step.

Responsibilities:

- validate `data/i18n.json`;
- ensure generated RU and EN targets exist;
- set `<html lang="ru">` or `<html lang="en">` on paired pages;
- inject self-contained no-JS language switch links;
- inject `rel="alternate" hreflang="ru"`;
- inject `rel="alternate" hreflang="en"`;
- inject `rel="alternate" hreflang="x-default"` pointing to the Russian counterpart;
- keep output deterministic and idempotent.

The language switcher is a normal anchor, not JavaScript behavior.

A small build-time injected style may be used for the switcher so no new runtime asset pipeline is required.

### 8. Canonical URL semantics

Every locale page has a self-canonical URL through the existing page metadata layer:

- Russian page canonical -> Russian URL;
- English page canonical -> English URL.

`hreflang` connects the two pages.

`x-default` points to Russian because Russian remains the default/root locale.

Do not canonicalize English pages back to Russian; that would make the English pages non-canonical duplicates and defeat the bilingual layer.

### 9. Page metadata / OpenGraph

Add English entries to `data/page-meta.json` for all seven English routes.

English entries use:

- English title;
- English description;
- unique card slug;
- existing constrained display-title/kicker/tag rules.

This generates locale-specific OpenGraph cards through the existing system.

No second metadata system is introduced.

### 10. Standalone English homepage

Extend `scripts/standalone-home.js` minimally so the same rendering primitive can generate:

- Russian root `index.html`;
- English `en/index.html`.

`renderProjectCards` gains bounded locale-aware UI copy/href transformation support only where needed.

Canonical project data remains `data/projects.json`.

For active projects without an English detail page, English-home links use explicit Russian fallback routes rather than inventing missing translations.

### 11. Diplodoc navigation

Add the English pages to the existing `docs/toc.yaml` as one bounded `English` section so they are compiled by the same build and discoverable without a second navigation tree.

English Markdown pages include a compact English-local navigation line for the translated subset.

P2.1 does not attempt to fully localize the global Diplodoc shell/navigation; that would require a broader locale-aware navigation architecture.

The language switcher provides the direct RU/EN counterpart transition.

### 12. Sitemap and search

Because the English Markdown pages are in the same TOC, they enter the existing sitemap page collection automatically.

`en/index.html` is generated outside Diplodoc and must be added as an extra sitemap route through the i18n manifest/build step.

There remains exactly one site-wide search index.

### 13. Feed semantics

The existing Atom feed remains the Russian/canonical Engineering Notes feed in P2.1.

Do not publish duplicate English feed entries for translations. English note translations are locale mirrors of existing notes, not new note entities.

## Testing strategy

### Unit/contract tests

Add `scripts/i18n.test.js` covering:

- manifest validation;
- duplicate ids/paths rejection;
- safe path validation;
- deterministic pair lookup;
- `lang` injection;
- `hreflang` ru/en/x-default;
- switcher counterpart URL;
- idempotency;
- all seven required pairs exist in canonical manifest.

Extend focused existing tests only where necessary for:

- English standalone homepage generation;
- locale-aware project-card UI copy/hrefs;
- page metadata validation for English routes.

### RED phase

The first contract test must require `data/i18n.json` / seven pairs before production implementation exists.

Expected CI failure: `Test` only; downstream build/browser steps skipped.

### Generated-site / browser verification

Add a focused `scripts/i18n-browser-smoke.cjs` using the existing quality harness.

It must verify at minimum:

- `/en/index.html` exists and is English;
- English About/Resume/Projects/LivingWorld/two note routes load;
- RU -> EN and EN -> RU switch links work for representative pages;
- canonical is self-referential;
- hreflang ru/en/x-default are correct;
- English page has one H1 and no horizontal overflow;
- no console/page errors on representative EN pages;
- the existing single search route remains `_search/ru/index.html` and no `_search/en/` route is required.

Wire the smoke as a focused CI step without weakening existing gates.

## Controlled translation scope

Translate only:

1. homepage;
2. About;
3. Resume;
4. Projects hub;
5. LivingWorld;
6. server-authoritative AI NPC note;
7. LLM protocol boundary note.

Explicitly not in P2.1:

- `/now`;
- Engineering Map;
- NODE ZERO full case study;
- Sources Knowledge Base;
- Photo Stories;
- Contacts;
- all other Engineering Notes;
- full shell/navigation localization;
- automatic translation;
- locale negotiation/redirects;
- second search index;
- English Atom feed.

## Rejected alternatives

### Separate `docs-en/` + second Diplodoc build

Rejected because it creates two build/navigation/search worlds and materially increases drift risk.

### Custom English HTML renderer

Rejected because it introduces a second rendering architecture beside Markdown/Diplodoc.

### Translate the entire site at once

Rejected because translation drift and maintenance cost would grow faster than demonstrated audience value.

## Definition of Done

- seven English routes exist under `/en/`;
- Russian URLs remain unchanged and default;
- one build and one search index remain;
- seven RU/EN pairs are validated from `data/i18n.json`;
- self-canonical + ru/en/x-default hreflang are correct;
- no-JS language switching works;
- shared project truth is not duplicated;
- untranslated project links are explicitly marked as Russian fallback;
- English metadata/OpenGraph is generated through the existing system;
- focused i18n browser smoke exists;
- existing visual/performance/accessibility/cross-browser gates are not weakened;
- exact-head full CI matrix is green;
- durable state/roadmap/changelog are synchronized after merge.