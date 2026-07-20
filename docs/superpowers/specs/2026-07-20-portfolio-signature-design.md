# Portfolio Signature Experience — Design

## Goal

Turn the already production-grade portfolio into a memorable engineering identity without adding a frontend framework or runtime dependency on external APIs.

## Scope

1. data-driven `Currently Building` section on the standalone homepage;
2. interactive but progressively enhanced `Engineering Graph`;
3. flagship case studies for LivingWorld and NODE ZERO based only on verified repository facts;
4. a lightweight `Engineering Notes` section with initial technical articles;
5. route-specific OpenGraph metadata and branded static OG cards for the homepage and flagship case studies;
6. navigation and sitemap integration.

Deferred:

- hosted analytics until domain/hosting strategy is selected;
- runtime GitHub API widgets, contribution heatmaps or other external-client dependencies;
- automatic scraping of private repositories during public-site builds.

## Data model

`data/portfolio.json` is the single curated source for homepage activity and Engineering Graph data.

It contains:

- current projects: title, status, short description, href, tags;
- graph topics: id, label, description, related project links and note links.

The build renders meaningful HTML from this data. JavaScript may enhance interaction, but no essential content depends on JavaScript.

## Currently Building

Homepage section shows 3–4 active directions with clear status labels:

- LivingWorld — RELEASE CANDIDATE;
- NODE ZERO — PRE-PRODUCTION;
- Engineering Portfolio — ACTIVE;
- Research / teaching direction — ONGOING when included.

The section is generated at build time from `data/portfolio.json`. No runtime GitHub/API fetch is used.

## Engineering Graph

The graph is a signature exploration surface, not primary navigation.

Topics:

- Java / Spring;
- Distributed Systems;
- Data;
- DevOps / Delivery;
- AI / LLM / Agents;
- Game Development;
- Education / Research.

Baseline HTML exposes all topics as accessible buttons/cards plus a detail panel. CSS lays them out as a visual network. Progressive JavaScript lets a user select a topic and updates the detail panel with related projects/notes. Keyboard activation and `aria-pressed` state are required. With JavaScript disabled, all links remain visible in semantic fallback content.

No canvas/WebGL/library is added.

## Flagship case studies

### LivingWorld

Public case study may state verified facts from the repository:

- Fabric 1.21.1 / Java 21;
- server-authoritative mod architecture;
- MCA Reborn villagers;
- explicit player-owned NPC sessions;
- text + Simple Voice Chat input;
- server-side STT, LLM, TTS, world context, memory and action authorization;
- spatial speech/subtitles;
- pinned runtime/artifact inputs and license notices;
- CI coverage including unit/package/reproducibility, resilience scenarios, Fabric game tests and production build;
- current evidence boundary and remaining real-client acceptance requirements.

Do not claim public deployment or completed real-world acceptance.

### NODE ZERO

Public case study may state verified facts from the repository:

- first-person psychological techno-horror;
- autonomous underground AI compute facility;
- MIRROR behavioral prediction system;
- Unity 6.3 LTS, URP, C#, Windows/Steam target;
- pre-production status;
- production-ready vertical-slice target;
- authored-sequence-first design principle;
- gameplay systems separated from scene-specific scripting;
- documented game/narrative/technical/art/production/decision layers.

Do not expose proprietary source or imply open-source licensing.

## Engineering Notes

Create a notes hub and two initial notes:

1. `Why the portfolio homepage is standalone while knowledge pages use Diplodoc` — architecture, performance/hydration trade-off, quality gates.
2. `Designing bounded AI NPC conversations for Minecraft` — public architectural principles: explicit session ownership, server authority, provider boundaries, evidence boundary and safety/action authorization.

Notes are concise engineering essays, not marketing posts. They link back to relevant case studies.

## OpenGraph

Create branded 1200×630 static PNG cards for:

- homepage;
- LivingWorld case study;
- NODE ZERO case study;
- Engineering Notes hub.

Cards use the existing graphite/cyan/violet identity and concise text. Generated image files are committed as static assets; production build does not require an image-generation dependency.

A deterministic post-processing metadata map injects route-specific:

- title;
- description;
- `og:title`;
- `og:description`;
- `og:image`;
- `og:type`;
- canonical URL.

The homepage template uses its dedicated OG card instead of the avatar.

## Accessibility and performance

- no runtime API calls;
- no new frontend framework;
- graph works with keyboard and without JS;
- `prefers-reduced-motion` remains respected;
- new homepage sections must not cause horizontal overflow at 390px;
- existing Lighthouse budgets remain unchanged;
- visual-regression baselines must be intentionally updated for the homepage after approved layout changes.

## Testing

- unit tests for portfolio data validation and build-time rendering;
- metadata injection tests for route-specific canonical/OG values;
- browser smoke asserts Currently Building and Engineering Graph are present;
- graph interaction test verifies topic selection updates accessible state/detail;
- generated-site integrity covers all new notes/case-study/OG assets;
- existing Chromium, Firefox/WebKit, Axe, Lighthouse and visual-regression gates remain mandatory.

## Success criteria

- homepage communicates active work rather than a static biography;
- LivingWorld and NODE ZERO are prominent, evidence-backed flagship case studies;
- Engineering Graph becomes a memorable secondary interaction without hurting accessibility/performance;
- technical notes demonstrate engineering reasoning;
- shared links have route-specific branded previews;
- no custom domain, paid service, analytics provider or runtime API dependency is introduced.
