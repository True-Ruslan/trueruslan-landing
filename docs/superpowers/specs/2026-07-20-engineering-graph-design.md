# Signature Engineering Graph — Design

## Goal

Add a memorable, accessible Engineering Map that connects skills, engineering domains, projects and technical notes without turning the portfolio into a heavy SPA or adding runtime network dependencies.

## Product shape

The map answers a visitor question that a technology list cannot: **how do the technologies, systems and projects relate to each other?**

Example relationships:

```text
JAVA → SPRING BOOT → BACKEND SYSTEMS → TASKHUB
                    └→ DISTRIBUTED SYSTEMS → KAFKA / DATA

AI ENGINEERING → AGENTIC SYSTEMS → LIVINGWORLD
                               └→ NODE ZERO WORKFLOW

RELIABILITY → QUALITY GATES → ENGINEERING NOTES
```

The experience has two layers:

1. **Semantic fallback** — ordinary HTML groups/links that remain useful with JavaScript disabled.
2. **Progressive graph** — an enhanced node/edge view with keyboard-accessible filters and detail panel.

## Data model

`data/engineering-graph.json` is the single source of truth.

Each node has:

- unique `id`;
- human label;
- `kind`: `technology`, `domain`, `project`, or `note`;
- short description;
- optional internal `href`;
- optional tag list.

Each edge has:

- `from` node id;
- `to` node id;
- relationship label.

Validation rejects duplicate IDs, missing nodes, self-edges, duplicate edges, unsafe links, invalid kinds and orphan nodes.

## Rendering architecture

Build-time post-processing reads the manifest and injects two artifacts into `landing/engineering-map.html`:

- accessible fallback HTML grouped by node kind;
- escaped JSON in `<script type="application/json" data-tr-engineering-graph-data>`.

`custom.js` enhances only when the graph host exists:

- creates filter buttons (`All`, `Backend`, `AI`, `Reliability`, `GameDev`);
- renders a responsive SVG edge layer and semantic HTML node buttons/links on top;
- clicking/focusing a node highlights its first-degree neighborhood;
- a live detail panel explains the selected node and exposes its internal link;
- keyboard navigation uses normal Tab order; no custom arrow-key trap;
- resize recomputes edges from actual DOM node positions.

No external fetch occurs at runtime.

## Layout

Use CSS grid rather than force-directed physics. Nodes have explicit `column` and `row` coordinates in the manifest, producing deterministic screenshots and stable mental grouping.

Desktop: 5-column map.
Mobile/tablet: progressive graph collapses to grouped cards while edge SVG is hidden; filters still work.

## Accessibility

- graph host has an accessible heading/description;
- nodes are real `<a>` or `<button>` elements;
- filters use `aria-pressed`;
- selected detail updates inside `aria-live="polite"`;
- color is never the only representation of node kind;
- `prefers-reduced-motion` disables transitions;
- fallback content remains in DOM and is hidden only after successful enhancement.

## SEO and social preview

Add Engineering Map as a high-value page in `data/page-meta.json`, generating its own deterministic OG card and canonical metadata.

## Quality gates

- unit tests for graph validation and deterministic fallback/embedded JSON rendering;
- generated-site integrity verifies node links and OG asset;
- browser graph smoke verifies enhancement, filters, selection/detail behavior, no overflow and keyboard-focusable nodes;
- Axe/Lighthouse existing gates remain unchanged;
- visual regression adds dedicated Engineering Map desktop/mobile screenshots rather than overloading homepage baselines.

## Constraints

- No custom domain, paid hosting, analytics or runtime API.
- No graph/rendering library.
- No new production dependency.
- No force-directed/random layout.
- Do not weaken existing quality gates.
