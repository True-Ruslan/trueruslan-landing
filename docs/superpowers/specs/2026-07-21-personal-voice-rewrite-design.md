# Personal Engineering Diary Voice — Design

## Goal

Rewrite the user-facing copy of the portfolio so it sounds like one person maintaining a living personal site rather than a product brochure, technical README, or recruiter landing page.

The voice should be calm, first-person, technically grounded and lightly addressed to readers. It should feel closer to a personal engineering diary: what I am working on, why I became interested in it, what I noticed while building it, what I changed my mind about, and what a reader may find useful here.

The rewrite must preserve factual accuracy, current project statuses, technical details, links and public/private boundaries.

## Voice

### Core qualities

The default voice is:

- first-person: `я работаю`, `я заметил`, `мне интересно`, `я постепенно пришёл к мысли`, `в этом проекте я хотел проверить`;
- calm rather than emotional;
- personal without becoming confessional;
- technical without sounding like internal architecture documentation;
- lightly reader-directed: `здесь я собрал`, `ниже можно посмотреть`, `если вы пришли за...`;
- concrete rather than promotional;
- reflective where reflection adds meaning.

### What to avoid

Avoid:

- marketing language: `production-grade excellence`, `flagship`, `cutting-edge`, `уникальный`, `мощный`, `лучший`;
- corporate portfolio abstractions when plain language works: repeated `инженерный фокус`, `источник истины`, `ограниченный pipeline`, `production-oriented`, `case study`;
- artificial enthusiasm: `я невероятно увлечён`, `обожаю`, `потрясающий проект`;
- generic self-praise;
- excessive English where a natural Russian phrase is clearer;
- turning every paragraph into a principle or manifesto;
- addressing readers too often.

Technical English terms remain when they are the actual language of the domain or codebase: Java, Spring Boot, backend, runtime, CI/CD, LLM, API, Kafka, Docker, etc.

## Narrative model

Most narrative pages should naturally answer some subset of these questions:

1. What is this page/project about?
2. Why did I start doing it or why does it matter to me?
3. What turned out to be more interesting or difficult than expected?
4. How do I currently think about the problem?
5. What is the real current state, without overselling it?
6. What can a reader inspect next?

Not every page needs all six. The text should read as prose, not as a questionnaire.

## Page roles

### Standalone homepage

Role: a short personal introduction, not a CV summary.

The hero should answer: who I am, what I spend most of my engineering time on now, and what this site is for.

Current marketing-like card descriptions should become short personal explanations. Keep the scan-friendly structure, but use prose that sounds authored by me.

`Currently building` remains status-oriented and factual because it is generated from data, but surrounding copy should explain that this is simply what I am spending time on now.

### About

Role: the most personal professional page.

Rewrite from a taxonomy of principles into a coherent first-person story:

- I mainly work with Java/backend systems;
- what I have gradually learned to value in engineering;
- why system boundaries, reliability and maintainability matter to me;
- how AI entered my workflow and where I remain cautious;
- teaching, postgraduate research and interests outside production code.

Keep technical stack references, but do not turn the page into another resume.

### Projects hub

Role: a personal index of projects and experiments.

Replace portfolio-label language such as `Flagship projects`, `Featured case studies`, repeated `Инженерный фокус` with calmer framing.

Each project preview should briefly say:

- what I was trying to build or explore;
- what makes the project interesting to me;
- current honest status;
- link to the deeper page.

Commercial experience remains factual and restrained.

### Individual project pages

Role: engineering diary entries that still function as technical case studies.

Preferred structure:

1. personal opening: why I started or what problem attracted me;
2. what the project is now;
3. key technical decisions explained in first person;
4. what went wrong / what I learned / what changed during development where supported by facts;
5. honest readiness/current boundary;
6. diagrams and technical sections retained where useful.

Do not invent retrospective lessons that are not grounded in repository history or known project facts.

For proprietary/private projects, keep all existing disclosure boundaries.

### Engineering Notes hub and articles

Role: closest thing to an actual technical diary.

Notes should sound like thoughts written after solving a concrete problem:

- `Я сначала пытался...`
- `В какой-то момент стало понятно...`
- `После этого я оставил...`

Keep architecture and code reasoning rigorous, but remove textbook/tutorial voice where possible.

The articles should remain useful to an external engineer, so personal narrative must lead to transferable conclusions rather than replace them.

### Engineering Map

Role: explain why I made the map and how I personally connect areas of work.

Avoid presenting it as an objective skill graph or rating. The text should explicitly say that this is how I currently see the connections between technologies, problems, projects and notes.

### Resume

Role: the most structured and scan-friendly page.

Keep:

- factual experience;
- stack;
- timelines/panels;
- PDF workflow;
- concise headings.

Rewrite only narrative framing and explanatory paragraphs into first person. Do not make experience bullets anecdotal or diary-like enough to reduce recruiter readability.

### Bibliography / sources

Role: a personal reading log rather than a database dump.

The large source table stays factual. Add/rewrite framing copy to explain why I keep it, how I use it, and that summaries are working notes rather than authoritative reviews.

Do not rewrite source summaries unless there is a concrete quality problem; the main task is author voice around the register.

### Photos

Role: a small personal archive.

Remove generic filler such as `работа разработчика — это не только код` and repeated notes that photos may be added later.

Use one short introduction explaining that I keep a few moments from work, study, events and ordinary life here. Captions should remain simple and factual.

### Contacts

Role: a quiet closing page.

Use direct first-person wording: where it is easiest to reach me and what context is useful to include. Keep all contact details unchanged unless separately verified.

## Factuality rules

- Do not change project readiness/status without evidence.
- Do not add metrics, users, technologies, employers, dates or outcomes that are not already verified.
- Do not infer proprietary architecture.
- Preserve exact external links and contact details unless separately verified.
- Preserve legal/licensing/privacy boundaries.
- Claims like `100+ sellers`, release-candidate status, Java/Fabric/Unity versions, academic specialty and employment context must remain as currently documented unless repository evidence says otherwise.

## Repetition control

The current site repeats several ideas across homepage, About, Resume and Projects: system boundaries, reliability, source of truth, maintainability, AI as a tool.

After rewrite:

- homepage introduces themes briefly;
- About explains the personal engineering worldview;
- Resume lists evidence/experience;
- Projects shows those ideas through concrete work;
- Notes explores individual conclusions in depth.

Do not repeat the same manifesto sentence across multiple pages.

## Language conventions

- Primary language: Russian.
- Keep established technical terms in English where natural.
- Prefer short and medium sentences over dense noun chains.
- Prefer verbs over nominalizations.
- Use em dash sparingly.
- Avoid unnecessary bolding inside narrative paragraphs.
- Headings should be natural and specific, not marketing categories.

Examples of heading direction:

- `Flagship projects` → `Над чем я сейчас работаю серьёзнее всего`
- `Featured case studies` → `Другие проекты, к которым я возвращаюсь`
- `Что объединяет эти проекты` → `Что я в них ищу`
- `Инженерный принцип` → integrate into prose or use `Что для меня важно в работе`

These are directional examples, not mandatory literal replacements.

## Scope

Rewrite user-facing prose in:

- `templates/index.html`;
- `docs/landing/about.md`;
- `docs/landing/projects.md`;
- all public project pages under `docs/landing/projects/`;
- `docs/landing/engineering-map.md`;
- `docs/landing/notes.md` and all existing articles under `docs/landing/notes/`;
- `docs/landing/resume.md` narrative framing;
- `docs/landing/bibliography.md` framing only;
- `docs/landing/photos.md`;
- `docs/landing/contacts.md`.

Out of scope unless required by rewritten page text:

- visual redesign;
- navigation architecture;
- project code or behavior;
- search implementation;
- CV PDF contents;
- rewriting third-party/source summaries in the bibliography table;
- SEO metadata changes except where old descriptions materially contradict the new page positioning.

## Quality checks

### Editorial consistency

Review the complete diff for:

- first-person voice consistency;
- repeated phrases and repeated principles;
- marketing/corporate language;
- unnecessary English;
- factual drift;
- accidental over-personalization.

### Structural safety

Preserve:

- Markdown/YFM syntax;
- custom HTML class names and data attributes;
- generated placeholders such as `{{CURRENTLY_BUILDING}}`;
- links;
- diagrams/images;
- Resume PDF hooks;
- Engineering Map build slot.

Run the existing full test/build/integrity/browser/visual suite after the rewrite. Text-induced layout changes are allowed, but visual baselines may only be updated after all functional gates are green and after confirming that the differences are intentional text-flow changes.

## Success criteria

A reader should feel that:

- the same person wrote the whole site;
- the author is technically serious but not selling himself aggressively;
- projects are explained through personal reasoning rather than portfolio jargon;
- the site feels maintained and alive;
- facts remain easy to find;
- the resume still works as a resume;
- the text sounds like a calm engineering diary that happens to be open to readers.
