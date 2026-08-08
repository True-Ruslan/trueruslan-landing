# Work with me / Private practice — design specification

Date: 2026-08-08
Status: APPROVED DESIGN / PRE-IMPLEMENTATION
Repository: `True-Ruslan/trueruslan-landing`

## 1. Goal

Extend TrueLanding with a bounded commercial capability layer that can generate qualified inbound work without turning the site into a conventional freelancer landing page.

The site remains first and foremost the personal engineering brand and evidence-backed portfolio of Ruslan Nemykin. The new layer must help a visitor move naturally from visible expertise to a concrete collaboration opportunity:

**experience / projects / notes / publications → trust → relevance → Work with me → direct conversation → qualification → fixed scope**.

The feature is not a general lead-generation platform. It is a static-first, evidence-led private engineering and educational practice integrated into the existing portfolio architecture.

## 2. Product positioning

Primary identity remains:

**Ruslan Nemykin — Backend Engineer.**

Commercial positioning:

**Backend Engineer with a private engineering and educational practice who can be engaged for bounded work with a clear outcome.**

The site must not lead with freelancing, generic services, availability hype, or sales language. Existing evidence remains the persuasion layer; the commercial surface only explains how a visitor can engage the same demonstrated expertise.

### 2.1 Audience priority

The audience hierarchy is intentional.

1. **Primary — professional engineering work.** Product teams, companies, technical leaders and founders with a reasonably concrete engineering problem or deliverable.
2. **Secondary — startups and individual clients.** MVPs, small services, automations, bots, prototypes and bounded parts of a product are welcome when scope can be clarified before implementation.
3. **Open door — adjacent or unusual work.** The listed formats are examples, not a closed catalogue. Relevant requests around development, technology, education or technical content may still be discussed.

The site must never say or imply “I take any work” or “I build anything”. The open-door copy should preserve specialization while allowing useful unexpected requests.

## 3. Practice structure

### 3.1 Engineering — primary commercial stream

The main commercial section is organized around client situations, not a technology inventory.

Expected categories:

- backend modules, services and APIs;
- external integrations;
- architecture and backend audit;
- code review where the outcome is a concrete engineering assessment;
- modernization and bounded refactoring;
- difficult production defects;
- performance and reliability analysis;
- AI/LLM/RAG/agent/MCP integration with explicit engineering boundaries.

Copy should answer “what situation can I bring here?” before “which technologies are used?”. Java, Spring Boot, Kafka, PostgreSQL and similar technologies remain supporting evidence.

### 3.2 Startup & individual projects — secondary engineering stream

A visitor may bring a new product idea, a small MVP, a backend for a bot, an automation, a prototype or another compact project.

The page must explicitly set the working model:

- clarify the intended outcome first;
- define a bounded first slice;
- avoid undefined “build my whole startup” commitments;
- prefer fixed deliverables over open-ended outsourcing.

### 3.3 Teaching & Mentoring — secondary professional line

This is a full professional capability, not a footnote, but it remains visually and semantically secondary to Engineering.

Supported formats may include:

- individual Java/Spring/backend sessions;
- mentoring and tutoring;
- junior-to-middle development guidance;
- educational code review;
- interview preparation;
- project-based learning;
- one-off technical consultations;
- learning-path design;
- course or module design;
- lectures, workshops and small corporate training;
- labs, exercises, tests and assessment materials;
- methodological and technical educational content.

The personal-site wording should prefer **mentoring, individual sessions, teaching, tutoring, courses and educational content** over making “репетитор” the top-level identity. Platform-specific profiles may later use “репетитор” where search intent requires it.

### 3.4 Expert contribution — bounded adjacent capability

A smaller section may offer:

- technical articles;
- technical documentation;
- expert review of technical material;
- educational or methodological content;
- other work where engineering expertise and clear technical writing are the primary value.

This must not become a third equal commercial pillar.

## 4. Core UX route

Canonical routes:

- RU: `/landing/work-with-me/`
- EN: `/en/work-with-me/`

Legacy `.html` paths remain compatibility entrypoints only, consistent with repository-native clean URL policy.

RU and EN ship together. Functional parity is required; editorial copy may be adapted naturally rather than translated literally.

## 5. Work with me page structure

The page is a calm qualification surface, not a sales landing page.

The visitor should be able to answer:

1. Is my task a reasonable fit?
2. How does Ruslan work?
3. How do I start a conversation?

### 5.1 Hero

Purpose: declare collaboration availability without changing the site identity.

Required elements:

- title `Работа со мной` / `Work with me`;
- one concise positioning paragraph;
- live availability state;
- one primary CTA: `Описать задачу` / equivalent English copy.

Forbidden in hero:

- `Hire me`-style visual emphasis;
- discount/sales copy;
- countdowns or urgency;
- public price;
- giant lead form;
- promises such as “fast and high quality”.

Suggested semantic direction:

> Иногда беру внешние инженерные и образовательные задачи. Лучше всего подходят проекты и консультации с понятной целью, ограниченным scope и результатом, который можно проверить и передать.

Final editorial wording may improve rhythm but must preserve this meaning.

### 5.2 Engineering situations

The most prominent section. Use 4–6 recognizable situations such as:

- Backend & integrations
- Architecture & audit
- Complex engineering problem
- Modernization
- AI-enabled features

Each item should describe a client problem and intended result. Do not turn this into a technology badge wall.

### 5.3 Startup & individual projects

A smaller section explains that new ideas, MVPs, bots, services, automations and prototypes are welcome, while scope is clarified before work begins.

### 5.4 Teaching & Mentoring

A full section with several formats:

- individual work;
- mentoring/tutoring;
- technical consultation;
- courses and educational content;
- workshops/corporate education.

### 5.5 Expert contribution

Small supporting section for technical articles, documentation, educational materials and review.

### 5.6 How I work

Use a simple five-step flow:

**Context → Scope → Estimate → Implementation → Handover**

For engineering work, the deeper principle may be expressed as:

**Architecture → Implementation → Verification → Delivery → Handover**

The page should explain that the client first describes the current state and desired outcome; boundaries, timing and cost are then agreed before implementation.

### 5.7 Good-fit guidance

Explain what tends to work well:

- clear expected outcome;
- bounded scope;
- verifiable result;
- reasonable handover boundary.

Use soft examples rather than exclusionary language. Example semantics:

- a specific integration — strong fit;
- audit of an existing system — strong fit;
- small MVP — potentially a fit after scoping;
- indefinite “be our developer for everything” — usually not the intended format.

### 5.8 Open door

Required concept:

> Не нашли свой формат? Всё равно напишите. Здесь перечислены задачи, с которыми я работаю чаще всего, но возможное сотрудничество ими не ограничивается. Если задача связана с разработкой, технологиями, обучением или техническим контентом — её можно описать, и я скажу, смогу ли быть полезен.

English copy should preserve the same openness without implying generalist outsourcing.

### 5.9 Direct contact handoff

V1 uses direct contact only:

- Telegram;
- email.

No site form.

The page should briefly tell the visitor what information is useful in the first message:

- what exists now;
- desired outcome;
- important technical/context constraints;
- desired timing;
- relevant links/materials if available.

Operational note:

> Сотрудничество можно оформить официально. Для оплачиваемых задач могу работать как самозанятый и предоставлять чек.

This statement belongs near process/contact details, not in the hero.

## 6. Availability model

Availability is public truth and must have one canonical owner.

Allowed states:

- `available`
- `limited`
- `consulting-only`
- `unavailable`

Engineering and education/mentoring availability may differ.

The model must support real states such as “not taking projects, but mentoring slots are available”.

Requirements:

- no automatic date-driven state changes;
- no analytics-driven state changes;
- no fake scarcity;
- no automatic inference from repository activity;
- unknown state is a validation failure;
- `unavailable` must not hide the page; it changes the message honestly.

Editorial principle:

> Обычно беру ограниченное количество внешних задач одновременно, чтобы сохранять нормальный уровень вовлечения.

Do not hard-code “only one project forever” as a permanent brand promise.

### 6.1 Initial V1 launch truth

The initial public state for V1 is explicitly fixed as:

```text
engineering: limited
education: limited
updated: 2026-08-08
```

`limited` means the site may invite a conversation about bounded external work while making no claim of full-time or unlimited capacity. This launch state is intentionally conservative and can later be changed only through the canonical collaboration record and normal review.

## 7. Canonical collaboration model

Add one canonical data record:

`data/collaboration.json`

The semantic model is:

```text
availability
  engineering
  education
  updated

engagements
  engineering
  startup
  education
  expertContribution

contact
  telegram
  email

commercialPolicy
  pricing
  legalFormat
```

### 7.1 Canonical facts vs editorial content

Canonical data owns volatile/reused public facts:

- availability;
- enabled practice categories;
- priority/order where relevant;
- direct contact endpoints;
- self-employed capability;
- pricing policy state (`estimate-only` in V1).

V1 contact truth must resolve to the already published direct endpoints:

```text
telegram: https://t.me/TrueRuslan
email: ruslan.nemikin@gmail.com
```

Markdown owns editorial explanation:

- human-facing long-form copy;
- examples;
- qualification guidance;
- working process narrative;
- contextual explanations.

Do not create a JSON CMS for paragraphs. Do not duplicate volatile truth in multiple pages.

## 8. Navigation policy

`Работа со мной` / `Work with me` must be directly accessible from primary navigation.

It must look like a normal navigation item, not a highlighted sales button.

Current navigation is already dense, therefore implementation must treat navigation density as a UX requirement rather than blindly add another item.

Potential hierarchy if density requires adjustment:

- Projects
- Experience
- Work with me
- Notes
- Publications
- About
- Contacts

Secondary destinations such as Now, Engineering Map, Photos and Sources may remain reachable through secondary/in-page navigation if needed.

This is not authorization for a broad navigation redesign. Only targeted restructuring needed to preserve desktop/mobile quality is in scope.

## 9. Bounded commercial surface policy

Commercial CTA is intentionally restricted.

Allowed surfaces:

- homepage;
- Work with me;
- Contacts;
- explicitly selected relevant case studies;
- explicitly selected relevant Engineering Notes/Publications.

No automatic commercial CTA on:

- About;
- Experience;
- Photos;
- Sources;
- Engineering Map;
- arbitrary content merely because a keyword appears.

Principle:

**value/proof first → collaboration bridge second**.

No site-wide promotional banner.

## 10. Homepage bridge

Do not turn Work with me into a fourth primary card beside Experience / Projects / Materials.

Preserve the homepage identity architecture.

Add one restrained collaboration section only after enough proof has been shown, expected near flagship/evidence content rather than at the top of the page.

It may project:

- one short collaboration statement;
- current availability;
- one link to Work with me.

If unavailable, the section remains present with honest copy such as “new projects are currently paused; see the kinds of work I usually take”.

## 11. Contextual CTA model

Contextual commercial bridges must be explicit, not inferred from keywords.

Allowed semantic mappings:

- `engineering`
- `ai-integration`
- `education`
- `expert-content`

A page may opt into one mapping. If there is no explicit mapping, there is no contextual commercial CTA.

This prevents accidental advertising in editorial content and keeps the commercial layer reviewable.

### 11.1 Initial curated V1 mapping set

V1 starts deliberately small. The initial explicitly opted-in editorial surfaces are:

```text
docs/landing/projects/portfolio-platform.md
  → engineering

docs/landing/projects/notchhub.md
  → engineering

docs/landing/notes/deployment-success-is-not-production-verification.md
  → engineering

docs/landing/notes/server-authoritative-ai-npcs.md
  → ai-integration
```

No other Project, Note or Publication gets a contextual commercial CTA in V1 unless it is added through a reviewed spec/implementation change. In particular, Teaching/Education does not get an arbitrary contextual CTA merely to balance category counts; its V1 discovery paths are Work with me, navigation, homepage bridge and Contacts.

The English side may use only existing English counterparts of an approved mapped source. Missing EN counterpart means no invented EN content solely for CTA symmetry.

## 12. Contacts integration

Contacts remains a general contact page, not a duplicate commercial page.

Preserve current Telegram/email and external-profile purpose.

Add only:

- a clear link to Work with me;
- a short qualification hint for people writing about a task;
- no form;
- no duplicated service catalogue.

## 13. Marketing and copy contract

### 13.1 Message architecture

Commercial copy should follow:

**client situation → expected result → working boundary → relevant proof**.

Technology names are supporting evidence, not the main proposition.

### 13.2 Evidence-led persuasion

Where useful, Work with me should link to existing evidence:

- Experience;
- relevant Projects;
- relevant Engineering Notes;
- Publications;
- teaching evidence already present in the portfolio.

No testimonials or client logos are invented. Real testimonials may be considered later only with real evidence and permission.

### 13.3 Allowed tone

Preferred language includes concepts such as:

- “могу помочь”;
- “иногда беру”;
- “лучше всего подходят”;
- “предпочитаю”;
- “уточняю границы”;
- “согласуем результат”;
- “скажу, смогу ли быть полезен”.

### 13.4 Prohibited patterns

Do not introduce unsupported or cheap sales claims such as:

- “лучший”;
- “быстро и качественно”;
- “гарантированно”;
- “любой сложности”;
- “индивидуальный подход” as generic filler;
- “лучшие/доступные цены”;
- discounts;
- countdowns;
- fake scarcity;
- fake social proof;
- fake client counters;
- invented revenue/performance improvements;
- invented testimonials;
- invented clients.

## 14. Pricing policy

V1 has **no public price list**.

Standard message:

- visitor describes task;
- scope and result are clarified;
- fixed timing/cost estimate is proposed where appropriate.

Future options such as a fixed mentoring-session price or package pricing must be based on real demand and are explicitly outside V1.

## 15. SEO design

V1 creates one new indexable commercial route per locale, not a network of artificial service landing pages.

Expected RU title direction:

`Работа со мной — Backend-разработка, консультации и наставничество | Руслан Немыкин`

Expected EN semantic direction:

`Work with me — Backend engineering, consulting and mentoring | Ruslan Nemykin`

Metadata must be natural and not keyword stuffed.

Required SEO behavior:

- clean canonical URL;
- RU/EN hreflang symmetry;
- OpenGraph metadata;
- sitemap inclusion;
- generated search inclusion;
- no duplicate canonical;
- internal links from approved surfaces;
- semantic no-JavaScript content.

Case studies and Engineering Notes remain independent search entrypoints; they are not converted into doorway pages.

## 16. Structured data

`Person` remains the primary real-world entity.

Additional professional-service structured data may be added only if the final implementation can model the published content accurately and without creating a fictional company/agency.

Forbidden without real evidence:

- `Organization` representing a non-existent agency;
- `AggregateRating`;
- fake Reviews;
- unsupported claims or service guarantees.

If additional service schema is ambiguous or not useful, V1 should ship without it.

## 17. Privacy and runtime boundaries

V1 intentionally has no form and therefore adds no lead backend, CAPTCHA, lead database or form provider.

No new third-party runtime dependency is required for the core flow.

Existing analytics privacy boundaries remain unchanged:

- consent-gated Yandex Metrica;
- no session replay;
- no custom events;
- no user parameters;
- no conversion fingerprinting.

Do not add lead-conversion events in V1.

## 18. Measurement model

The feature is not optimized around raw click-through rate.

Primary business concept is **qualified conversation**.

Separate two evidence layers.

### 18.1 Site aggregates

Within current privacy/analytics boundaries, observe only supported aggregate signals such as:

- Work with me page traffic;
- search visibility/indexing;
- aggregate entry-page behavior available through accepted measurement tooling.

### 18.2 Business outcomes

Outside public repository telemetry, manually observe:

- number of incoming conversations;
- whether they are relevant;
- broad category: engineering / education / other;
- whether collaboration happens;
- approximate acquisition source if naturally known.

Do not store client names, private correspondence or commercial detail in public repository measurement artifacts.

V1 has no fabricated KPI like “five clients in one month”. The first purpose is to establish real demand and learn which incoming requests appear.

## 19. Technical architecture constraints

The feature must preserve existing TrueLanding principles:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core flow with no runtime API;
- one canonical source of mutable public truth;
- Diplodoc as the single site-wide full-text search owner;
- repository-native clean directory URLs;
- compatibility `.html` only;
- evidence layers remain separate;
- no quality-gate weakening.

The expected data flow is:

**canonical collaboration facts**
→ **RU/EN Work with me rendering**
→ **bounded homepage/contextual projections**
→ **direct Telegram/email handoff**.

No projection becomes a second source of collaboration truth.

## 20. Validation and fail-closed behavior

The implementation should fail closed on invalid commercial state.

At minimum:

- unknown availability state → validation/test failure;
- missing RU/EN route pair → failure;
- invalid or absent required contact endpoint → failure;
- unknown contextual CTA category → failure;
- automatic CTA on a forbidden surface → regression failure;
- public pricing accidentally introduced in V1 commercial generated surfaces → regression failure;
- availability inferred from analytics/date/activity → prohibited;
- analytics failure must not change page availability or commercial truth.

## 21. TDD strategy

Implementation begins RED-first.

Expected test layers:

### 21.1 Canonical model contracts

- schema validation;
- allowed availability states;
- separate engineering/education availability;
- contact validation;
- pricing policy is estimate-only/no-public-price;
- legal/self-employed capability representation;
- engagement category validation;
- contextual CTA category validation.

### 21.2 Rendering contracts

- RU/EN Work with me rendering;
- availability projection;
- contact projection;
- homepage bridge;
- Contacts integration;
- explicit contextual CTA rendering only.

### 21.3 RU/EN parity

- both routes exist;
- same functional structure;
- same canonical availability truth;
- same contact endpoints;
- canonical/hreflang symmetry;
- English editorial adaptation remains semantically equivalent.

### 21.4 Commercial surface guard

Assert that commercial bridge output only exists on approved surfaces.

### 21.5 Copy integrity

Use bounded regression checks for controlled commercial copy to prevent accidental introduction of the prohibited cheap-sales patterns or public prices. This is not a general NLP scanner.

### 21.6 Accessibility

Verify:

- heading hierarchy;
- availability not communicated by color alone;
- accessible CTA names;
- Telegram/email without JavaScript;
- keyboard behavior;
- focus states;
- contrast;
- semantic DOM;
- reduced-motion behavior if any new motion exists.

### 21.7 Browser/mobile/visual

Required visual acceptance includes:

- Work with me desktop/mobile;
- header density desktop/mobile;
- homepage bridge;
- Contacts integration;
- no accidental layout regression on core identity surfaces.

Do not weaken existing visual thresholds merely to make intentional changes pass; inspect and update baselines only for approved changes.

### 21.8 SEO/search

Verify:

- canonical;
- hreflang;
- sitemap;
- OpenGraph;
- generated search;
- clean URLs;
- legacy compatibility;
- semantic no-JS content;
- internal discoverability.

## 22. Production acceptance

Exact-head CI is not production acceptance.

After merge:

1. GitHub Pages must deploy the exact merged SHA successfully.
2. Deployment identity must be resolved.
3. Production Live verification must target that exact deployment.
4. Production smoke must verify at least:
   - RU Work with me;
   - EN Work with me;
   - canonical availability;
   - direct contacts;
   - primary navigation access;
   - homepage bridge;
   - canonical/hreflang;
   - semantic no-JS content;
   - absence of a form/lead runtime dependency;
   - existing analytics privacy boundary.
5. Only then may the feature be recorded as `PRODUCTION ACCEPTED`.

Durable docs must record exact accepted SHA/deployment evidence and must not close unrelated measurement milestones.

## 23. Implementation slice

Prefer one bounded feature PR, implemented through internal RED→GREEN stages:

1. canonical collaboration model + tests;
2. RU/EN Work with me;
3. navigation + Contacts;
4. homepage bridge;
5. contextual CTA infrastructure + the exact initial curated mapping set from §11.1;
6. SEO/search/accessibility/browser/visual verification;
7. exact production acceptance;
8. durable PROJECT_STATE / ROADMAP / CHANGELOG acceptance update.

A separately discovered infrastructure defect may use a dedicated hotfix PR rather than being hidden inside feature work.

## 24. Explicit non-goals for V1

Do not implement:

- contact forms;
- CRM;
- booking/calendar UI;
- payments;
- public pricing;
- Basic/Pro/Premium packages;
- generic client testimonials;
- dozens of SEO service pages;
- site-wide advertising banners;
- conversion events;
- session replay;
- lead scoring;
- AI sales chat;
- automatic availability state changes;
- automatic acceptance/rejection of work;
- a fictional agency/organization identity.

## 25. Acceptance criteria

The feature is complete only when all of the following are true:

1. A visitor can quickly understand that external collaboration is possible.
2. Backend Engineering remains the primary professional identity.
3. Teaching/Mentoring is a credible full secondary practice.
4. Startup/individual and unusual relevant work remains welcome without becoming the primary positioning.
5. The site does not feel like a generic freelancer services catalogue.
6. Availability is honest and owned by one canonical source.
7. No public price list exists in V1.
8. Contact handoff is direct through Telegram/email.
9. Official self-employed collaboration capability is stated calmly.
10. Commercial CTA appears only in approved contexts.
11. RU/EN are functionally equivalent.
12. Core flow remains static-first and usable without JavaScript.
13. No new privacy/runtime dependency is introduced for lead capture.
14. Existing quality gates remain green without weakening.
15. Visual/mobile/accessibility changes are explicitly accepted.
16. Exact deployed production verification is green.
17. Durable docs record the accepted production result separately from later measurement.

## 26. Future decisions intentionally deferred until evidence exists

After real inbound data exists, reconsider independently:

- public fixed price for consultation/mentoring;
- productized service pages;
- stronger or weaker CTA prominence;
- platform-specific profiles and offers;
- scheduling tools;
- contact form;
- service structured data;
- additional measurement within privacy constraints.

None of these should be implemented speculatively in V1.

## 27. Final product formula

**TrueLanding remains a personal engineering brand.**

Projects, Experience, Notes and Publications create trust by showing real work and reasoning. Work with me adds a bounded private engineering and educational practice that converts already-earned trust into a clear way to collaborate.

**Evidence → trust → relevance → collaboration → direct conversation.**
