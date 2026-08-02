# Publications and appearances showcase — design

**Date:** 2026-08-02  
**Status:** approved  
**Repository:** `True-Ruslan/trueruslan-landing`

## Goal

Create a first-class, static-first section for externally published or publicly delivered work: technical articles, scientific publications, conference talks, interviews and proceedings contributions.

The section must strengthen the professional and academic profile without merging external publications into Engineering Notes or duplicating the original material on this site.

The page has one central contract:

> Every item is a completed, externally verifiable publication or appearance. Drafts, planned talks, submitted papers and work in progress are excluded.

## Product position

The site keeps four distinct content surfaces:

- **Projects** — products and systems I have built or am building;
- **Publications** — work published or presented on external platforms;
- **Engineering Notes** — original technical writing published directly on this site;
- **Sources** — references used by site content and research.

`Publications` is not an alias for Engineering Notes and does not become a second blog engine. It is a curated evidence-backed catalogue that routes readers to canonical external sources.

## Audience

The primary readers are:

- engineering and hiring managers evaluating public technical work;
- engineers looking for articles or talks by topic;
- academic readers looking for scientific publications or proceedings;
- conference organisers, editors and collaborators checking prior public work.

The page is written in first person, calm and factual, consistent with the current Russian site.

## Inclusion boundary

An item may be published only when all of the following are true:

1. the article, paper, interview or proceedings contribution is already published, or the talk/event has already taken place;
2. the user had a substantive public role: author, co-author, speaker, panellist or interview subject;
3. a stable external verification point exists;
4. the title, date, platform/event and role can be represented without inference;
5. the canonical external source is linked.

Accepted verification points include:

- canonical article page;
- journal or publisher page;
- DOI record;
- official conference programme or session page;
- official video recording;
- proceedings or collection page/PDF;
- official interview page;
- stable presentation page when the talk itself is independently verifiable.

Attendance without a speaker/author role is excluded. Certificates alone do not create a catalogue item unless they verify an otherwise documented public appearance. Private files, drafts and unpublished manuscripts are excluded.

## Initial scope

The first release imports every currently discoverable item that satisfies the inclusion boundary from these approved discovery sources:

- the user's canonical Habr profile and article pages;
- external publication links already present in the site repository;
- official journal, publisher, DOI, conference, video and proceedings pages;
- stable external evidence supplied by the user.

The implementation must not invent missing metadata or create placeholder entries. If an external material cannot be independently verified, it remains outside the public catalogue until evidence is available.

## Information architecture

Create the canonical page:

`docs/landing/publications.md` → `landing/publications.html`

Public title:

**Публикации и выступления**

Introductory copy explains that the catalogue contains only already published or completed external materials.

The page contains:

1. page hero;
2. curated featured publications;
3. compact in-page navigation to populated groups;
4. full grouped catalogue in reverse chronological order;
5. a short evidence note explaining the inclusion boundary.

## Grouping model

The public catalogue uses these groups:

1. **Технические статьи**
2. **Научные публикации**
3. **Доклады и конференции**
4. **Интервью и приглашённые материалы**
5. **Публикации в сборниках**

Empty groups are not rendered.

Display groups are derived only from the controlled material type:

| `kind` | Public group |
|---|---|
| `technical-article` | Технические статьи |
| `scientific-publication` | Научные публикации |
| `talk` | Доклады и конференции |
| `interview` | Интервью и приглашённые материалы |
| `proceedings-publication` | Публикации в сборниках |

Conference work is represented by the public contribution, not by event attendance. A conference paper in proceedings belongs to scientific publications or proceedings; a delivered session belongs to talks and conferences. One real-world contribution may expose several links but must not become duplicate catalogue records.

## Single source of truth

Add `data/publications.json` as the only content registry for the catalogue and all derived surfaces.

Each record contains:

- `id` — stable unique identifier;
- `title` — official title;
- `kind` — controlled content type;
- `platform` — publication platform, publisher or event;
- `date` — ISO date of publication or completed appearance;
- `role` — controlled public role;
- `language` — source language;
- `summary` — original concise site summary, not copied promotional text;
- `topics` — controlled topic labels;
- `canonicalUrl` — primary external verification source;
- `links` — optional additional verified resources;
- `featured` — whether the item is eligible for the homepage and top-of-page selection;
- `featuredOrder` — explicit editorial order when featured;
- `relatedProjects` — optional validated project slugs;
- `relatedNotes` — optional validated Engineering Note slugs;
- `verifiedAt` — ISO date when the external evidence was last checked.

Controlled `kind` values:

- `technical-article`;
- `scientific-publication`;
- `talk`;
- `interview`;
- `proceedings-publication`.

Controlled `role` values:

- `author`;
- `co-author`;
- `speaker`;
- `panellist`;
- `interview-subject`.

Allowed additional link types:

- `video`;
- `slides`;
- `doi`;
- `pdf`;
- `event`;
- `source`.

No separate display-group field is stored. This prevents classification drift between the data model and rendered sections.

## Rendering architecture

Publications are rendered at build time from `data/publications.json`.

The existing static build remains authoritative:

```text
data/publications.json
        ↓ structural validation
build-time publication renderer
        ↓
publications page + homepage featured block
        ↓
Diplodoc/static HTML + generated search
```

No client-side API, CMS, database, scraper or runtime GitHub/Habr integration is introduced.

The implementation may extend the current postprocessor or add one focused build module, but it must keep publication validation and rendering isolated behind a clear interface. The Markdown source owns stable editorial framing; generated placeholders own catalogue cards derived from the registry.

## Page presentation

### Hero

The hero uses a clear external-publication framing rather than blog language.

Recommended eyebrow:

`PUBLICATIONS · TALKS · RESEARCH`

Recommended lead:

> Здесь собраны мои материалы, опубликованные на внешних площадках: технические и научные статьи, доклады, выступления, интервью и публикации в сборниках. Я добавляю сюда только уже опубликованные или состоявшиеся материалы.

### Featured section

Render two to four manually curated items.

Featured selection is editorial, not calculated from volatile view counts. External metrics such as views, votes or likes are excluded from the primary data model because they become stale and are not necessary to establish publication quality.

A featured card contains:

- type/platform marker;
- official title;
- date;
- concise summary;
- role;
- topic labels;
- one primary action: `Читать`, `Смотреть` or `Открыть публикацию`;
- optional secondary verified link such as slides or DOI.

### Catalogue cards

Every catalogue card contains:

- date;
- type and platform/event;
- title;
- summary;
- role;
- language when useful;
- topic labels;
- canonical external action;
- optional secondary links;
- optional contextual links to related projects or Engineering Notes.

External actions must be visibly external and use safe link attributes.

The first release is text-first. It does not copy external cover images, article screenshots, conference branding or publisher logos into the repository. Platform badges may be typographic.

## Homepage emphasis

Add a dedicated homepage block titled **Избранные публикации**.

It renders up to three records from the same registry using `featured` and `featuredOrder`.

Rules:

- no duplicate publication data in the homepage template;
- if fewer than three verified featured records exist, render only the available records;
- no empty placeholder cards;
- include a final link to the full catalogue;
- preserve the current homepage hierarchy so publications complement, rather than displace, active projects.

Recommended position: after the current active-project section and before the broader “Чем я в основном занимаюсь” section. This gives public work strong visibility while keeping current product development first.

## Navigation and existing surfaces

Add **Публикации** to the main navigation next to `Notes`.

Retain the existing Habr utility link as a direct platform shortcut. The new page is the canonical cross-platform catalogue, while the Habr icon remains a convenient external destination.

Add contextual links from:

- `Обо мне`;
- `Резюме`;
- the homepage exploration section;
- related project pages where a publication directly explains that project;
- related Engineering Notes where the relationship is explicit.

Do not add publication links to every project or note by default. Relationships must be declared in the registry and validated.

## Search, metadata and feed boundary

The page and all rendered titles/summaries must be ordinary semantic HTML so Diplodoc remains the sole site-wide search owner.

Add page metadata/OpenGraph for `landing/publications.html`.

External catalogue records are not added to the Engineering Notes Atom feed because the site does not own their canonical content. The publications page itself remains discoverable through ordinary site navigation and search.

No local article-detail pages are created in the first milestone. The catalogue links directly to canonical external sources, avoiding duplicate content and false ownership signals.

## Accessibility and progressive enhancement

The complete catalogue must be usable without JavaScript.

Requirements:

- semantic section headings and lists;
- clear external-link labels;
- keyboard-accessible actions;
- sufficient contrast;
- no hover-only metadata;
- no client-side filtering required for access;
- in-page anchor navigation works without JavaScript;
- mobile cards do not overflow on long titles, venue names, DOI links or topic labels.

Interactive filters are a non-goal for the initial catalogue. Static grouping is clearer at the expected scale and preserves the static-first contract. Filtering may be reconsidered only after the catalogue becomes large enough to create a real navigation problem.

## Validation contract

Add focused registry tests before implementation.

Structural validation must reject:

- duplicate IDs;
- duplicate canonical URLs;
- unsupported kinds or roles;
- invalid or non-HTTPS canonical URLs;
- missing title, date, platform, role, summary or canonical URL;
- publication/event dates later than the build date;
- featured records without a deterministic order;
- duplicate featured order values;
- unsupported additional link types;
- invalid additional URLs;
- related project slugs that do not exist;
- related Engineering Note slugs that do not exist.

External factual verification remains a required manual acceptance step: every canonical and secondary link must resolve to the represented material and support the recorded title, date, platform/event and role.

Sorting is deterministic:

- featured records by `featuredOrder`;
- catalogue records by date descending, then title;
- groups in the fixed public order defined above.

## TDD and verification

### RED phase

Add tests that require:

- a structurally valid `data/publications.json` registry;
- the canonical publications page and navigation entry;
- homepage featured-publications placeholder/output;
- no future-dated records;
- no duplication between generated homepage and catalogue data;
- static/no-JS catalogue representation;
- metadata and search coverage.

The tests must fail before the registry, page and renderer exist.

### GREEN phase

Implement the smallest build-time path that satisfies the design without introducing a second content engine.

### Required automated gates

- unit tests;
- production Diplodoc build;
- generated-site integrity;
- publication registry validation;
- homepage publication rendering;
- no-JS representation;
- generated search coverage;
- metadata/OpenGraph validation;
- accessibility/browser smoke;
- mobile overflow;
- visual regression review;
- custom-domain artifact verification.

### Manual review

Review exact-head desktop and mobile screenshots for:

- publication hierarchy and readability;
- featured section prominence without overpowering active projects;
- clear distinction between external publications and Engineering Notes;
- long technical/scientific titles;
- platform/event labels;
- external-link clarity;
- empty-group suppression;
- no unsupported claims or invented metadata.

Open every canonical and secondary external link included in the initial registry and verify that it resolves to the represented material.

## Durable documentation

After acceptance, update:

- `docs/PROJECT_STATE.md`;
- `docs/ROADMAP.md`;
- `docs/CHANGELOG.md`.

Record the exact accepted registry scope and any materials intentionally excluded because verification was unavailable.

## Non-goals

- republishing complete external articles on this site;
- merging Publications into Engineering Notes;
- showing drafts, planned talks or submitted papers;
- automatic scraping from Habr, journals or conference sites;
- runtime APIs, database or CMS;
- live view/vote counters;
- client-side filters for the initial catalogue;
- copying external logos, covers or screenshots without a separate asset decision;
- creating local detail pages for every publication;
- changing the site-wide search owner;
- weakening existing quality or evidence boundaries;
- full English catalogue translation in this milestone.
