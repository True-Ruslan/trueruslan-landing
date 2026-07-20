# Flagship Portfolio Phase — Design Specification

## Goal

Make the portfolio more memorable and evidence-driven by adding live project status, two flagship case studies, and a consistent architecture-diagram language without changing hosting or the established quality pipeline.

## Architecture

- `data/currently-building.json` is the single source of truth for active-project cards on the standalone homepage.
- `scripts/standalone-home.js` validates and renders that data into a `{{CURRENTLY_BUILDING}}` template slot at build time.
- Flagship case studies remain Markdown knowledge pages under `docs/landing/projects/`.
- Architecture diagrams are accessible standalone SVG assets under `docs/assets/diagrams/`, using the existing graphite/cyan/violet visual identity.
- The projects hub and `toc.yaml` link to both new case studies so sitemap/integrity checks cover them.

## Currently Building contract

Each entry contains:

- `slug`: stable lowercase identifier;
- `name`: public project name;
- `status`: short uppercase stage label;
- `summary`: one concise sentence;
- `href`: local case-study URL;
- `tags`: 2–5 short technology/domain labels.

Build must fail for missing fields, duplicate slugs, empty arrays, unsafe local paths, or invalid tag counts.

Initial projects:

1. LivingWorld — release-candidate AI NPC mod for Minecraft/Fabric.
2. NODE ZERO — Unity psychological techno-horror vertical slice.
3. Engineering Portfolio Platform — this site's static/Diplodoc quality architecture.

## Flagship case studies

### LivingWorld

Use only verified public repository facts. Emphasize server authority, bounded sessions, text/voice paths, server-side STT/LLM/TTS/context/memory/action authorization, pinned release baseline, CI evidence boundary and remaining real-client acceptance work.

### NODE ZERO

Use only verified public repository facts. Emphasize product premise, MIRROR constraint manipulation, Unity 6.3 LTS/URP/C#, vertical-slice strategy, authored gameplay boundaries, documentation-first production process and proprietary status.

## Diagram language

- background `#090B10`;
- system boundaries `#8B5CF6`;
- primary flows `#4CC9F0`;
- verified/release states `#4ADE80`;
- readable embedded `<title>` and `<desc>`;
- text remains legible at mobile widths;
- no external fonts or scripts.

## Testing

- unit tests for validation and deterministic HTML escaping/rendering;
- generated-site integrity must validate new links and SVGs;
- existing Chromium/Firefox/WebKit/Axe/Lighthouse gates remain unchanged;
- visual baselines are updated only from a green functional browser run and committed with the intentional homepage change.
