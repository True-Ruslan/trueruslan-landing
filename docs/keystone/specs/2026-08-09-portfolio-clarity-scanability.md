# Portfolio Clarity & Scanability — presentation redesign specification

> Status: **APPROVED FOR IMPLEMENTATION — DESIGN/SPEC ONLY**
>
> Date: **2026-08-09**
>
> Product: `True-Ruslan/trueruslan-landing`
>
> Scope owner: public presentation, information architecture, copy, typography, SEO presentation and progressive disclosure.
>
> This specification does **not** weaken existing static-first, evidence, privacy, accessibility, build, deployment or production-verification contracts. It also does **not** close P3.6 Measurement.

## 1. Product outcome

TrueRuslan Landing must work at two speeds without becoming two different products:

1. **Fast professional surface** — a visitor can understand who Ruslan is, what he does, why his work is credible and where to go next within roughly 5–15 seconds of scanning.
2. **Deep engineering layer** — interested readers can continue into project case studies, Engineering Notes, evidence, implementation history and explicit limitations without losing the existing evidence-first rigor.

The target product model is:

**Surface → Summary → Evidence → Deep dive**

The redesign is successful when the site feels lighter and easier to scan while preserving the engineering depth that differentiates it from a generic developer portfolio.

The redesign is **not** a conversion into a generic freelancer landing page, a visual-only facelift, a new SPA/runtime, a second CMS/search system or an excuse to remove inconvenient evidence.

---

## 2. Problem statement

The current site has unusually strong source material: commercial Java/backend experience, production work, public projects, measurable technical outcomes, Engineering Notes, publications, teaching/research and evidence-backed case studies.

The main presentation problem is not lack of information. It is **insufficient prioritization of information**.

Current surface pages frequently make the reader process several kinds of content at equal visual weight:

- professional positioning;
- technology lists;
- project status;
- internal acceptance terminology;
- negative scope disclaimers;
- navigation alternatives;
- deep engineering context;
- evidence mechanics.

This produces three recurring failure modes:

1. **Slow comprehension.** A first-time visitor needs too much reading before understanding role, seniority, strongest work and next action.
2. **Surface/deep-layer inversion.** Internal engineering precision such as `bounded`, `authority`, exact PR/SHA boundaries and repeated `does not mean` language appears before the visitor has decided to care about the project.
3. **Equal-weight overload.** Homepage/navigation/project indexes expose too many destinations or projects with similar prominence, forcing the visitor to build their own hierarchy.

The redesign must preserve depth while changing the order and weight of information.

---

## 3. Primary audiences and jobs-to-be-done

Audience priority is explicit. The site is not optimized equally for everyone.

### A1 — Employer / technical lead / recruiter — highest priority

Job:

- understand Ruslan's role and level quickly;
- identify core Java/backend experience and current technical direction;
- see credible commercial and personal-project proof;
- reach Experience, selected projects or contact without learning the site taxonomy first.

Success signal:

- role, 5+ years commercial experience, Java/backend specialization and at least one credible proof point are discoverable in the first scan path.

### A2 — Potential client / collaborator — high priority

Job:

- decide whether a backend, integration, architecture, AI/tooling or mentoring problem is plausibly in scope;
- understand how to start a conversation;
- see proof before reading process limitations.

Success signal:

- `Работа со мной / Work with me` explains useful task categories and direct handoff before process disclaimers.

### A3 — Engineer / technical reader — high value, deeper intent

Job:

- inspect architecture, tradeoffs, tests, release gates, evidence and code;
- read reusable Engineering Notes;
- verify that claims are bounded and technically grounded.

Success signal:

- no existing evidence depth is lost; case studies remain stronger after the fast summary layer.

### A4 — Student / researcher / general reader — secondary

Job:

- find publications, teaching/research context, sources and personal material without those sections competing with the primary professional flow.

---

## 4. Research basis

This specification intentionally turns external UX/SEO guidance into observable product rules rather than decorative references.

### 4.1 Scanning and front-loaded meaning

Nielsen Norman Group's eyetracking work on F-shaped and related scanning patterns shows that first lines and first words receive disproportionate attention when pages lack strong visual cues. Their recommendations include putting important points in the first two paragraphs, using informative headings/subheadings, visually grouping small related sets, using bullets and cutting unnecessary content.

Source:

- https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- https://www.nngroup.com/articles/be-succinct-writing-for-the-web/

Product consequence:

- primary surface pages must front-load identity, value and proof;
- headings must carry meaning even if body text is skipped;
- long explanatory preambles before useful content are forbidden on surface pages.

### 4.2 People-first SEO instead of word-count SEO

Google Search Central states that ranking systems are intended to prioritize helpful, reliable, people-first information; it explicitly says there is no preferred word count and asks whether headings/titles are descriptive and whether the page demonstrates first-hand expertise.

Source:

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Product consequence:

- surface pages may become substantially shorter without manufacturing replacement text for SEO;
- existing original technical depth remains discoverable through focused case studies and Notes;
- SEO optimization must improve intent, titles, headings, metadata and internal linking rather than prose volume.

### 4.3 Readability and text width

WCAG 2.2 Visual Presentation (Level AAA guidance) includes a mechanism for text width no greater than 80 glyphs and line spacing of at least 1.5. This project does not claim AAA solely from matching those values, but the guidance is directionally useful for long-form engineering content.

Source:

- https://www.w3.org/TR/WCAG22/#visual-presentation
- https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html

Product consequence:

- long-form prose target is approximately `68–72ch` unless a tested component requires otherwise;
- body line-height target is approximately `1.6` with no justified text;
- text resize/reflow behavior remains part of browser/accessibility verification.

### 4.4 Web-font performance

web.dev recommends controlling WebFont loading through `font-display`, using preload only for key known fonts and verifying text remains visible while fonts load; font loading can otherwise delay text or introduce layout shifts.

Source:

- https://web.dev/articles/optimize-webfont-loading
- https://web.dev/learn/performance/optimize-web-fonts

Product consequence:

- typography change is a performance-sensitive product change, not a CSS-only preference;
- one variable primary family is preferred to many separate font files;
- font loading, fallback metrics, CLS and Lighthouse remain acceptance gates.

---

## 5. Non-negotiable existing invariants

All redesign slices must preserve:

- static-first architecture;
- build-time intelligence;
- progressive enhancement;
- semantic core content without JavaScript;
- one canonical RU/EN build architecture;
- Diplodoc as the only site-wide full-text search owner;
- canonical registries as owners of volatile project/evidence/current-state truth;
- repository-native directory URLs;
- legacy `.html` only as compatibility entrypoints;
- existing canonical/hreflang/OpenGraph/Sitemap/feed contracts;
- explicit separation of repository, generated artifact, deployment, live browser and external/product acceptance evidence;
- no automatic promotion of Draft or unreviewed public truth;
- no weakening of CodeQL, Dependency Review, browser, accessibility, visual, privacy or production checks;
- Cloudflare/Yandex analytics privacy boundaries, including zero Yandex provider activity before explicit consent;
- exact-deployment Production Live acceptance before a redesign slice is considered production accepted.

---

## 6. Core presentation model

### Layer 1 — Surface

Purpose: answer the visitor's immediate questions with minimal reading.

Typical contents:

- role;
- specialization;
- 1–3 proof points;
- selected destination/CTA;
- project/result headline.

Forbidden at Layer 1 unless essential to the decision:

- SHA/run IDs;
- PR history;
- detailed acceptance taxonomies;
- repeated `not X / does not mean Y` framing;
- internal migration terminology;
- long technology inventories.

### Layer 2 — Summary

Purpose: provide enough context to decide whether to continue.

Typical contents:

- challenge;
- personal contribution;
- 3 key engineering decisions;
- measurable result/status;
- concise stack.

### Layer 3 — Evidence

Purpose: support bounded claims.

Typical contents:

- verified/stale/unverified state;
- exact identities where relevant;
- accepted/manual/automated boundaries;
- evidence cards/timeline;
- limitations.

### Layer 4 — Deep dive

Purpose: preserve the project's strongest differentiator — real engineering reasoning.

Typical contents:

- architecture;
- rejected alternatives;
- failures;
- release/process detail;
- retrospective;
- related Notes.

A visitor must never be required to understand Layer 3 or Layer 4 terminology in order to navigate Layer 1.

---

## 7. Information architecture

### 7.1 Primary navigation

Target primary navigation has at most **five semantic destinations**:

1. `Проекты / Projects`
2. `Опыт / Experience`
3. `Материалы / Writing` (presentation-level entry that routes to Notes/Publications without creating a second search/content registry)
4. `Работа со мной / Work with me`
5. `Обо мне / About`

Utility/right-side actions may include:

- Search;
- language switch;
- compact GitHub link/icon.

### 7.2 Secondary navigation/footer

The following remain public and directly reachable but do not compete in primary navigation:

- Сейчас / Now;
- Engineering Map;
- Sources;
- Photos;
- Contacts;
- Habr;
- Telegram blog;
- LinkedIn and other profiles.

### 7.3 URL stability

No redesign slice may rename or remove established public canonical routes solely to match the new hierarchy. Presentation hierarchy is allowed to change without URL churn.

`Материалы / Writing` should preferably be a presentation entry over existing Notes/Publications routes rather than a new independent content authority. If implementation proves a new route useful, it must remain a thin curated index and must not create a second content registry/search index.

---

## 8. Homepage contract

The homepage becomes the clearest expression of the new presentation model.

### 8.1 Required order

1. **Hero**
2. **Proof strip**
3. **Selected work**
4. **Commercial experience / professional context**
5. **Writing / Engineering Notes**
6. **Work with me bridge**
7. **Personal / teaching / research signal**

The final implementation may combine adjacent sections if the resulting scan path remains clearer and shorter.

### 8.2 Hero

Must communicate without scrolling or taxonomy knowledge:

- `Руслан Немыкин / Ruslan Nemykin`;
- primary role: Java/backend engineer;
- `5+ years` commercial experience;
- concise specialization: backend systems, integrations/data/distributed systems, with AI/tooling as an additional differentiator;
- one primary CTA (`Проекты` or `Опыт`) plus no more than two secondary actions.

Copy rule:

- one clear professional sentence is preferred over a list of abstract themes;
- `AI-native development`, `agentic workflows`, `production-grade tooling` and similar generic trend phrases must not be used as the core identity statement unless tied to a concrete claim.

### 8.3 Proof strip

Target 3–4 concrete facts, for example:

- `5+ лет коммерческой разработки`;
- `Java 11–25 / Spring Boot`;
- commercial production/integration context;
- selected measurable project result where public and stable.

Proof strip is not a second technology wall.

### 8.4 Selected work

Maximum **3–4 flagship cards**.

Current expected candidates:

- VillAIgence;
- NotchHub;
- TrueRuslan Landing;
- one commercial/publicly safe proof or NODE ZERO depending on content availability.

Vlezet remains public and evidence-backed but does not regain spotlight merely because it has a deep case study.

Each card must expose:

- project name;
- one-line human-readable value/problem;
- one proof/status signal;
- one link.

### 8.5 Removed/reduced homepage concepts

The following current concepts must not survive as separate equal-weight sections unless implementation evidence shows a clear need:

- standalone `Инженерный фокус` three-card taxonomy;
- six-card `Исследовать` sitemap-style block;
- long abstract `Current focus` buzzword string.

Their useful information may be absorbed into hero, proof, selected work, footer or About.

### 8.6 Homepage scan acceptance

A reviewer who reads only:

- H1;
- hero lead;
- proof-strip labels;
- section headings;
- selected-work titles;

must still be able to explain:

- who Ruslan is;
- what he primarily does;
- approximate professional experience;
- what kinds of systems he builds;
- which projects prove it;
- how to continue.

---

## 9. Projects index contract

The projects index becomes a curated portfolio, not a linear list of all project narratives.

### Required hierarchy

1. `Selected work` — 3–4 high-signal projects.
2. `Commercial work` — concise public-safe production experience/proof.
3. `Labs & experiments / Other projects` — compact grid/list for TaskHub, MiniChess, Godot template, Vlezet and other non-flagship work.

### Project-card rules

Flagship card:

- one-sentence problem/value;
- one current status/proof point;
- compact stack only where useful;
- no multi-paragraph mini-case-study on the index.

Secondary project card:

- title;
- one sentence;
- 2–4 technology/domain labels at most;
- direct case-study/repository link.

### Commercial proof

Public-safe commercial proof such as MarketDB usage or concrete enterprise domains must appear before low-priority hobby/lab detail when the claim is current and permitted to publish.

No confidential architecture or invented impact metrics may be introduced for stronger marketing copy.

---

## 10. Flagship case-study contract

Applies first to:

- VillAIgence;
- NotchHub;
- TrueRuslan Landing;
- Vlezet;
- NODE ZERO where public/proprietary boundaries permit.

### 10.1 Required order

1. **Hero / one-line project definition**
2. **Primary visual** — product screenshot when available; architecture diagram when it is the best truthful visual
3. **At a glance**
4. **Problem / user or engineering challenge**
5. **My contribution**
6. **Three key decisions**
7. **Results / accepted state**
8. **Architecture and deep dive**
9. **Evidence**
10. **Limitations/current boundary**
11. **Related notes / repository**

### 10.2 `At a glance`

Target fields:

- Role / contribution;
- Stack — approximately 4–6 most relevant items;
- Challenge — one sentence;
- Result/current accepted state — one sentence or 1–3 facts;
- Project state.

No exact SHA/run IDs in `At a glance` unless artifact identity itself is the central project result.

### 10.3 My contribution

Case studies must explicitly distinguish project description from Ruslan's contribution.

For solo projects, say so naturally without artificial team language.

For commercial/proprietary work, remain within approved public boundaries.

### 10.4 Engineering evidence

Existing exact evidence remains available. It moves lower in the hierarchy; it is not deleted.

Allowed evidence vocabulary includes:

- exact SHA;
- PR/run IDs;
- accepted/deferred/not tested;
- verified/stale/unverified;
- repository/artifact/deployment/product layers.

This vocabulary belongs primarily to the evidence/deep-dive layer rather than the marketing summary layer.

### 10.5 Current-state freshness

No case study may retain a `next step`, current version or active PR claim that contradicts canonical current project evidence at the time of implementation.

The known TrueRuslan Landing stale `P3.2 → P3.3 next step` narrative must be corrected in the appropriate project-content slice.

---

## 11. Experience contract

Experience should read like a high-signal professional profile, not a duplicated CV plus embedded PDF.

### Hero

Keep:

- Java Backend Engineer;
- 5+ years commercial experience;
- direct PDF/GitHub/contact actions;
- 2–3 high-signal stats.

Reduce duplication between hero, `Профиль / Profile` and Core stack.

### Employment entries

Each role should prioritize:

1. company / role / dates;
2. **2–3 concise impact/responsibility bullets**;
3. compact stack line.

Long paragraphs should be converted to bullets where scanning improves without losing factual accuracy.

### Core stack

The current large chip wall must be reduced/grouped.

Preferred grouping:

- Core backend;
- Data & messaging;
- Platform & delivery;
- Testing / API;
- AI/tooling.

Do not display every historically touched technology at equal weight.

### PDF

PDF remains a bounded distribution artifact and must not dominate the web experience. Existing semantic/no-JS/PDF integrity contracts remain.

---

## 12. Work with me contract

The page becomes useful before defensive scope language.

### Required opening

Within the first screen/section, communicate:

- what kinds of problems Ruslan can help with;
- main professional tracks;
- availability state;
- direct handoff/CTA.

### Primary tracks

Expected three presentation groups:

1. **Backend & architecture**
2. **AI & developer tooling / integrations**
3. **Teaching & mentoring**

`Startup / individual projects` may be expressed as audience/context rather than a fourth equal service taxonomy.

### Process

Current five-step `Context → Scope → Estimate → Implementation → Handover` should be simplified at surface level to approximately:

**Задача → Scope и оценка → Работа и передача результата**

Detailed acceptance/ownership explanation may remain below.

### Copy boundary

Avoid opening with:

- `Это не каталог услуг`;
- `Это не означает, что я берусь за всё`;
- equivalent English defensive phrasing.

Prefer a positive first statement. Limitations remain explicit below when they help qualification.

No public pricing is introduced by this redesign unless separately approved.

No form, CRM, booking, payments or lead database is introduced.

---

## 13. About contract

About stops duplicating Resume/Projects and becomes the most human page in the professional site.

Target structure:

1. **Engineer** — one concise professional paragraph;
2. **Teaching & research**;
3. **Outside code** — photography/travel/history/philosophy or other current public interests;
4. optional personal photo if an appropriate approved asset exists.

Long explanations of Java stack, testing philosophy, CI/CD and project architecture should link to Experience/Projects/Notes instead of being repeated.

The page remains professional but does not need to justify every personal interest as part of a personal-brand strategy.

---

## 14. Now contract

`Сейчас / Now` must show current content immediately.

Required order:

1. H1;
2. updated date/state;
3. generated current content;
4. optional short canonical-source note at the bottom.

Opening meta-copy such as `Это не roadmap и не список обещаний` must not precede the actual current snapshot.

If suitable canonical data exists, the presentation may group current activity into concise categories such as:

- Work;
- Building;
- Learning;
- Writing.

The implementation must not invent new current-state registries solely for this layout.

---

## 15. Engineering Notes index contract

Engineering Notes remain long-form and technically deep. The index becomes significantly easier to scan.

Each index item should target:

- title;
- one concise summary sentence;
- optional date/read-time/tags when deterministically available;
- direct link.

The index should not contain a mini-essay for every note.

Category headings remain useful if they shorten discovery.

### Individual Note enhancement

Long Notes may receive a compact opening summary such as:

- TL;DR;
- Problem;
- Decision;
- Result.

This summary must not replace or oversimplify the article body.

Do not manufacture read-time metadata if there is no deterministic generator/contract; it is optional.

---

## 16. Publications contract

The page should start with published work rather than catalogue methodology.

Target order:

1. H1 + one-line scope;
2. Featured / recent verified publications;
3. catalogue;
4. short verification methodology note.

Existing canonical external publication identity remains unchanged.

Drafts, submissions and future talks remain excluded.

English presentation may explain source-language titles briefly, but this explanation must not delay the actual featured content.

---

## 17. Engineering Map, Sources, Photos and Contacts

### Engineering Map

Show the map/interactive content before the long explanation of how to read it.

Keep one short explanatory paragraph and move taxonomy details below the primary content.

### Sources

Remain a secondary knowledge utility.

Do not promote to primary navigation.

Current filtering/search-owner boundaries remain unchanged.

### Photos

Remain a secondary human/personal layer, reachable from About/footer.

Do not force photo content into the professional conversion path.

### Contacts

Direct Telegram/email handoff must appear immediately after H1/short lead.

`Work with me` may be referenced as qualification context, but contact availability must not be hidden behind explanatory prose.

Social profiles move below direct contact.

---

## 18. Copy system

### 18.1 Voice

Target voice:

- technically credible;
- concise;
- calm;
- specific;
- personal;
- confident without exaggeration.

Avoid both extremes:

- generic startup/LinkedIn hype;
- internal RFC/legal-review prose on public surface pages.

### 18.2 Positive-first rule

On surface pages, state what something **is** before explaining what it is not.

Preferred:

> Здесь — то, над чем я работаю сейчас.

Not preferred as opening:

> Это не roadmap и не список обещаний.

Preferred:

> Помогаю с Java/backend, интеграциями, архитектурными рисками и AI-интеграциями.

Not preferred as opening:

> Эта страница не каталог услуг.

### 18.3 Controlled vocabulary by layer

Words such as these are allowed freely in technical evidence/deep-dive content:

- bounded;
- authority;
- exact artifact;
- accepted boundary;
- deterministic;
- evidence layer;
- NOT TESTED / DEFERRED.

On Homepage/About/Projects index/Work with me/Contacts they should be used only when no simpler phrase preserves the required meaning.

### 18.4 Front-loading

- first paragraph: core meaning;
- heading: information-bearing words first;
- first sentence of each card: differentiating value/problem;
- limitations: later, unless safety/legal accuracy requires immediate disclosure.

### 18.5 English is editorial, not literal translation

RU and EN share facts and canonical data but may use independently natural sentence structure and terminology.

English surface copy must avoid unnecessary RFC-like phrasing such as `bounded implementation`, `explicit engineering boundary` or `accepted product truth` where ordinary professional English conveys the same decision.

---

## 19. Typography

### 19.1 Primary candidate

Preferred primary family for implementation experiment:

**Onest Variable**

Rationale:

- strong Cyrillic/Latin coverage;
- contemporary but not generic-system appearance;
- suitable for both professional surface and long-form text;
- variable family can reduce the number of font resources.

Fallback candidates if Onest fails visual/performance/legibility acceptance:

1. Golos Text Variable;
2. IBM Plex Sans.

Existing/system fallback stack must remain usable while the font loads.

### 19.2 Selection gate

Before finalizing the font, compare the same three representative surfaces:

- Homepage hero/cards;
- Experience timeline;
- one long Engineering Note.

Compare:

- Cyrillic readability;
- Latin readability;
- numerals/version strings;
- heading personality;
- paragraph density;
- mobile rendering;
- payload;
- layout shift/fallback behavior.

The preferred Onest candidate should be accepted unless one of these checks demonstrates a material regression.

### 19.3 Type targets

Initial targets, subject to screenshot/browser verification:

- body desktop: approximately `17–18px`;
- body mobile: approximately `16–17px`;
- prose line-height: approximately `1.6`;
- prose max width: approximately `68–72ch`;
- H1 homepage: responsive `clamp(...)`, large but not oversized startup-style display typography;
- headings: usually 600/650 equivalent;
- body: 400;
- labels: 500 where needed;
- monospace reserved for code, identifiers and evidence, not general navigation/body copy.

Reduce ALL CAPS labels where they create noise without hierarchy value.

### 19.4 Font-loading requirements

- self-hosted or repository-owned legal font files only;
- do not expose font binaries as downloadable user artifacts outside the site;
- WOFF2 preferred;
- one variable file/subset strategy preferred where licensing/build allows;
- `font-display` must keep text visible;
- preload only if evidence shows the primary font is truly critical;
- no new font-related CLS regression;
- Lighthouse/performance matrix remains green.

---

## 20. Visual hierarchy and interaction rules

This initiative is not `minimalism at any cost`. Controls must remain discoverable.

### Required rules

- one obvious primary action per meaningful section;
- no more than 3–4 flagship cards in a major spotlight group;
- avoid card-inside-card/border-inside-border presentation unless state requires it;
- use whitespace to separate semantic groups instead of repeated decorative containers;
- results/numbers may receive stronger typographic weight than explanatory prose;
- keep hover/focus states restrained and accessible;
- no decorative animation is required for acceptance;
- existing `prefers-reduced-motion` behavior must not regress;
- mobile is a first-class layout, not compressed desktop.

### Images and diagrams

Prefer a product screenshot when it communicates user-visible value better than an architecture diagram.

Architecture diagrams remain important lower in case studies.

Do not add decorative stock illustrations or generic AI imagery.

---

## 21. SEO presentation contract

### 21.1 Titles

Every key route requires a concise, descriptive and route-specific `<title>`.

Target patterns include:

- Homepage: `Руслан Немыкин — Java Backend Engineer`;
- Projects: `Проекты — Java Backend, AI и distributed systems | Руслан Немыкин`;
- Experience: `Опыт — Java Backend Engineer, 5+ лет | Руслан Немыкин`;
- Notes: `Engineering Notes — Java, AI и reliability | Руслан Немыкин`;
- Work with me: `Backend-разработка, AI и наставничество | Руслан Немыкин`.

Exact final copy is reviewed during implementation to avoid boilerplate and truncation.

### 21.2 H1 and descriptions

- exactly one clear primary H1 per key surface;
- description should summarize the page's real value, not keyword lists;
- no hidden keyword text or search-engine-only prose.

### 21.3 Structured data

Inspect and, where consistent with rendered truth, support:

- `Person` / `ProfilePage` for personal profile surfaces;
- `Article` for Engineering Notes where date/author data is reliable;
- `BreadcrumbList` for hierarchical knowledge/project pages.

Structured data must be generated from real canonical page facts and must not imply unsupported credentials, employment, ratings or commercial claims.

### 21.4 Internal linking

Strengthen intentional cross-links:

- Homepage → Experience / selected projects / Writing / Work with me;
- Experience → selected projects where they prove relevant capability;
- Project → related Notes;
- Note → relevant project;
- About → Experience / Publications;
- Work with me → selected proof, not generic link dumps.

The generated site-wide search remains the only full-text search owner.

---

## 22. Accessibility requirements

Existing accessibility gates are preserved and expanded where new UI introduces risk.

Required:

- semantic heading order;
- keyboard-reachable navigation and interactive cards/controls;
- visible focus;
- no link purpose that depends solely on surrounding decorative copy;
- sufficient text/background contrast;
- no justified long-form text;
- responsive text reflow and 200% zoom checks remain green;
- reduced-motion behavior preserved;
- no important content available only on hover;
- language switching and RU/EN `lang`/hreflang remain correct;
- `noscript`/semantic fallbacks remain readable after typography/layout changes.

---

## 23. Performance requirements

The redesign must not trade perceived lightness for a heavier runtime.

Required:

- no new application runtime framework;
- no large animation library;
- no client-side CMS/data fetch for core content;
- font payload measured and documented;
- no material Core Web Vitals/Lighthouse regression attributable to the redesign;
- no layout shift caused by font metrics or late content injection beyond existing accepted thresholds;
- images/screenshots use appropriate dimensions/formats/loading policy;
- standalone homepage remains independent from unnecessary Diplodoc runtime.

---

## 24. P3.6 measurement boundary

This initiative changes presentation, navigation, content density and potentially typography. Therefore it changes the measured product surface.

Rule:

> A major accepted Portfolio Clarity deployment establishes a **new presentation baseline**. P3.6 must not compare post-redesign behavior against a window as if the interface had remained unchanged.

P3.6 remains **NEXT / WAITING** throughout implementation.

After the final major redesign slice is production accepted:

1. record the new exact production baseline identity;
2. begin/label the appropriate post-change observation window;
3. use only equal-duration, real `operator-observed` aggregate windows compatible with the documented P3.6 rules;
4. retain traffic-sufficiency assessment and human review;
5. do not infer engagement or causal improvement from a small sample merely because the redesign shipped.

Synthetic measurement evidence remains non-production evidence.

---

## 25. Rollout slices

Implementation must be split into reviewable product slices rather than one site-wide visual rewrite.

### C0 — Design/spec — this document

Outcome:

- one approved source of redesign intent, boundaries and acceptance criteria.

No runtime/product behavior changes.

### C1 — Presentation foundation

Scope:

- typography experiment and final font selection;
- type scale/tokens;
- prose width/spacing rules;
- primary/secondary navigation hierarchy;
- shared surface/card/section primitives only where they reduce duplication;
- contract tests for IA/font/performance/a11y invariants.

Acceptance:

- representative Homepage/Experience/Note screenshots reviewed;
- mobile and desktop browser gates pass;
- font-loading/performance evidence is green;
- no content rewrite outside what is necessary for navigation labels.

### C2 — Homepage clarity

Scope:

- hero;
- proof strip;
- selected work;
- professional/writing/collaboration/personal bridges;
- remove redundant equal-weight sections;
- RU/EN homepage parity where corresponding surfaces exist.

Acceptance:

- scan-path contract passes;
- primary navigation remains within limit;
- homepage content is materially shorter/less repetitive than current baseline;
- existing production/SEO/privacy gates pass.

### C3 — Projects and flagship summary layer

Scope:

- Projects index hierarchy;
- selected/commercial/labs separation;
- common flagship `At a glance` pattern;
- progressive disclosure for VillAIgence, NotchHub, TrueLanding and Vlezet;
- NODE ZERO where proprietary boundary permits;
- stale TrueLanding next-step copy corrected.

Acceptance:

- evidence preserved;
- no lifecycle promotion;
- project index no longer contains multi-paragraph mini-case-studies;
- current project claims reconcile to canonical registries/evidence.

### C4 — Professional surfaces

Scope:

- Experience;
- Work with me;
- About;
- Now;
- Contacts.

Acceptance:

- Experience entries are scan-friendly;
- Work with me presents useful scope before defensive limitations;
- About no longer duplicates a full professional philosophy essay;
- Now content precedes meta-explanation;
- Contacts exposes direct handoff immediately.

### C5 — Knowledge surfaces

Scope:

- Engineering Notes index;
- Publications;
- Engineering Map;
- Sources presentation only where needed;
- optional article summary pattern.

Acceptance:

- long-form content remains intact;
- index surfaces become shorter and more scannable;
- no second content/search registry introduced.

### C6 — English editorial and SEO reconciliation

English copy should preferably be improved within each relevant slice. C6 exists as a final cross-site consistency gate rather than permission to ship poor literal English temporarily.

Scope:

- review all EN surface copy for natural professional tone;
- final title/description/H1 audit;
- structured-data reconciliation;
- internal-link audit;
- RU/EN canonical/hreflang verification.

### C7 — Final production baseline and measurement handoff

Scope:

- exact final Pages deployment;
- deployment-triggered Production Live acceptance;
- durable redesign acceptance record;
- P3.6 new presentation-baseline note/window handoff.

No causal analytics conclusion is part of C7.

---

## 26. Testing strategy

Each implementation PR uses RED-first regression contracts where behavior is deterministic.

### Required automated categories

- primary navigation item contract;
- required routes remain present;
- canonical/hreflang/OG/Sitemap/feed integrity;
- no-JS semantic content;
- generated search discoverability;
- homepage scan-content markers;
- flagship summary-layer required fields;
- project-evidence preservation;
- Work with me direct handoff/privacy boundaries;
- current-state registry derivation;
- typography asset/font-display/loading-policy contract;
- mobile overflow;
- Chromium accessibility/Lighthouse;
- Firefox/WebKit compatibility;
- visual regression;
- custom-domain artifact;
- production smokes for changed flagship/surface contracts.

### Visual-review rules

Visual baseline changes are never accepted merely because the diff is expected.

For each slice:

1. inspect representative desktop screenshots;
2. inspect representative mobile screenshots;
3. verify information hierarchy, wrapping, font rendering and focus/interactive state;
4. rebase only intentionally changed visual baselines;
5. leave unrelated thresholds/baselines unchanged.

### Human content review

Before merging a surface-copy slice, review for:

- first-scan comprehension;
- factual accuracy;
- duplication;
- generic AI/marketing language;
- unnecessary negative framing;
- accidental confidentiality claims;
- natural RU and EN wording.

---

## 27. Acceptance criteria

The initiative is complete only when all relevant criteria are true on exact deployed production.

### Information architecture

- primary navigation has no more than five semantic destinations;
- secondary knowledge/personal destinations remain reachable without competing at primary weight;
- stable canonical routes are preserved.

### Homepage

- first scan exposes identity, Java/backend role, 5+ years experience/proof and selected work;
- no standalone redundant `Engineering focus` + six-card sitemap-style discovery duplication;
- no more than 3–4 selected flagship cards;
- clear primary CTA hierarchy.

### Copy

- surface pages lead with positive useful statements;
- defensive `not X / does not mean Y` wording is moved lower unless immediately necessary;
- internal evidence terminology is concentrated in evidence/deep layers;
- English reads as native professional presentation, not literal RFC translation.

### Projects

- Projects index is divided into selected/commercial/other hierarchy;
- flagship case studies expose `At a glance`, contribution, key decisions and result before exact evidence detail;
- exact evidence and limitations remain available;
- no stale project-next-step statement remains knowingly inconsistent with canonical current state.

### Professional pages

- Experience uses concise impact/responsibility entries rather than paragraph walls;
- technology chips/lists are grouped and de-emphasized;
- Work with me exposes task categories and CTA before limitations;
- About is materially less duplicative of Experience/Projects;
- Now shows current content before meta-contract copy;
- Contacts exposes direct handoff immediately.

### Knowledge pages

- Notes/Publications indexes are materially easier to scan;
- long-form technical depth remains intact;
- Engineering Map content precedes detailed reading instructions.

### Typography

- one preferred primary variable family is selected through representative comparison;
- Onest is the default candidate unless acceptance shows a material regression;
- long-form prose remains around the documented readable width/spacing target;
- font loading causes no accepted CLS/performance regression.

### SEO/accessibility/performance

- key titles/H1/descriptions are distinct and descriptive;
- existing canonical/hreflang/OpenGraph/Sitemap/feed/search contracts remain green;
- structured data, if added, matches visible canonical truth;
- no accessibility quality-gate weakening;
- no privacy expansion;
- no significant runtime/payload regression incompatible with the site's light static-first goal.

### Production

- every slice distinguishes exact-head CI from production acceptance;
- final redesign accepted only after exact Pages deployment and deployment-triggered Production Live success;
- new presentation baseline is recorded for future P3.6 observation.

---

## 28. Non-goals

This initiative does **not** include:

- replacing Diplodoc;
- migrating to React/Next/Vue or another runtime framework;
- adding a runtime CMS/backend/database;
- adding a second site-wide search;
- creating accounts/comments/community features;
- adding forms/CRM/booking/payment to Work with me;
- adding public pricing without a separate product decision;
- session replay, fingerprinting or expanded behavioural analytics;
- deleting deep evidence because it is visually complex;
- hiding project failures/NOT TESTED states;
- removing older public projects solely to create artificial scarcity;
- renaming stable URLs for aesthetic consistency;
- publishing confidential commercial architecture or invented outcome metrics;
- `npm audit fix --force`, dependency hacks or unrelated security-policy weakening;
- automatic claim that redesign improved engagement/SEO before sufficient external observations exist.

---

## 29. Risks and mitigations

### Risk — oversimplification removes the site's differentiation

Mitigation:

- use progressive disclosure, not deletion;
- preserve evidence/deep-dive layers and Notes.

### Risk — redesign becomes subjective visual churn

Mitigation:

- each change maps to explicit scan/content/IA acceptance criteria;
- visual baseline updates require inspected screenshots.

### Risk — shorter copy causes SEO anxiety and content re-expansion

Mitigation:

- keep original first-hand technical depth on focused pages;
- follow people-first intent and unique titles/internal linking;
- do not manufacture word count.

### Risk — new font makes the site visually nicer but slower

Mitigation:

- variable WOFF2 strategy;
- font-display/fallback checks;
- payload/Lighthouse/CLS gate.

### Risk — redesign invalidates analytics comparison

Mitigation:

- explicitly establish a new post-redesign presentation baseline;
- keep P3.6 open and observation-only.

### Risk — RU/EN drift

Mitigation:

- shared facts remain canonical;
- editorial wording may differ but acceptance requires semantic parity where a paired page exists.

---

## 30. Implementation handoff

Recommended next implementation sequence after this design/spec PR is reviewed and merged:

1. **C1 Presentation foundation** — typography + IA/navigation + shared layout rules.
2. **C2 Homepage clarity**.
3. **C3 Projects + flagship summary layer**.
4. **C4 professional surfaces**.
5. **C5 knowledge surfaces**.
6. **C6 final EN/SEO reconciliation**.
7. **C7 production baseline + P3.6 handoff**.

Each slice should be small enough to receive independent exact-head browser/visual evidence and independent exact-deployment production acceptance.

Do not begin a broad site-wide copy/CSS rewrite before C1 establishes the typography and hierarchy contracts.

---

## 31. Approval record

Product direction explicitly approved by the owner on **2026-08-09** after a full marketing/UX/SEO/engineering content audit.

Approved direction:

- make the public professional surface substantially lighter and easier to scan;
- preserve deep engineering evidence rather than deleting it;
- reduce generic/over-engineered copy on surface pages;
- introduce a more pleasant, Cyrillic-friendly typography system with Onest as the preferred candidate;
- prioritize employers/technical leads and potential clients before deep technical readers in the first-level hierarchy;
- preserve all existing reliability, security, privacy, SEO identity and exact-production verification boundaries;
- treat the final redesign as a new presentation baseline for future P3.6 measurement.
