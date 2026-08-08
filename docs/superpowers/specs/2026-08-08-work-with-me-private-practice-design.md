# Work with me / Private practice — design specification

Date: 2026-08-08
Status: APPROVED DESIGN / IMPLEMENTATION PLANNED
Repository: `True-Ruslan/trueruslan-landing`
Implementation plan: `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`

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

Suggested states:

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

## 7. Canonical collaboration model

Add one canonical data record, expected path:

`data/collaboration.json`

The exact schema is an implementation detail, but the semantic model should be close to:

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
- direct contact endpoints if the implementation chooses to centralize them here;
- self-employed capability;
- pricing policy state (`estimate-only` in V1).

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

Suggested semantic mappings:

- `engineering`
- `ai-integration`
- `education`
- `expert-content`

A page may opt into one mapping. If there is no explicit mapping, there is no contextual commercial CTA.

This prevents accidental advertising in editorial content and keeps the commercial layer reviewable.

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

## 18. Measurement

The feature optimizes for **qualified conversation**, not click volume.

Website-level aggregate observations may include page traffic and search visibility within the existing privacy contract. Business outcomes are evaluated separately and must not put client identities, correspondence or commercial details into public repository telemetry.

V1 does not invent a conversion baseline or promise a target number of leads/orders.

P3.6 measurement remains an independent evidence checkpoint; this feature does not satisfy or close it.

## 19. Testing and fail-closed behavior

Implementation is RED-first.

Required model/contract coverage:

- allowed availability states;
- independent engineering/education availability;
- valid direct contacts;
- exact V1 pricing policy;
- self-employed capability;
- safe/known engagement categories;
- explicit contextual CTA categories and surface mapping;
- no automatic availability mutation;
- no public V1 price;
- no form/runtime lead dependency.

Required build failures:

- unknown availability state;
- malformed contact endpoint;
- unknown contextual CTA category;
- unsafe contextual path;
- missing/duplicate required collaboration placeholder;
- approved contextual target missing from generated output.

## 20. RU/EN parity

Both Work with me routes must exist in the same release and share:

- canonical availability truth;
- enabled practice lines;
- direct contact endpoints;
- legal/pricing policy meaning;
- functional page structure;
- canonical/hreflang symmetry.

Editorial copy should be idiomatic rather than literal.

## 21. Browser, accessibility and visual quality

Required checks:

- semantic heading hierarchy;
- textual availability state, not color-only meaning;
- direct links usable without JavaScript;
- keyboard/focus quality;
- serious/critical Axe gate;
- mobile overflow;
- Chromium, Firefox and WebKit coverage;
- RU/EN no-JS behavior;
- generated-search discoverability;
- intentional visual screenshot review.

Header density is an explicit UX constraint. `Работа со мной / Work with me` must be primary-navigation discoverable without creating desktop/mobile overflow. Targeted primary/secondary rebalancing is allowed; broad navigation redesign is not.

Visual regression thresholds must not be relaxed to accept the feature.

## 22. Production acceptance

Exact-head CI is necessary but not sufficient.

Production acceptance requires:

1. verified exact feature PR head;
2. squash merge;
3. successful GitHub Pages deployment of the exact squash SHA;
4. Pages deployment identity resolution;
5. deployment-triggered Production Live smoke against that exact SHA;
6. dedicated private-practice production assertions;
7. durable acceptance evidence recorded only afterward.

If the first deployment exposes a real defect, preserve the failed evidence, add a RED reproduction, fix through a bounded hotfix PR, and repeat exact deployment verification. Do not weaken the smoke.

## 23. V1 non-goals

Explicitly out of scope:

- contact/lead forms;
- CRM;
- online booking/calendar slots;
- payments;
- public price list;
- Basic/Pro/Premium packages;
- service-page SEO farm;
- conversion events or lead scoring;
- session replay/fingerprinting;
- AI sales assistant;
- automatic availability changes;
- automatic order acceptance/rejection;
- invented testimonials/clients/ratings.

## 24. Launch facts fixed by design review

Initial canonical launch truth:

```text
engineering availability: limited
education availability:   limited
updated:                  2026-08-08
pricing:                  estimate-only
legal format:             self-employed / receipt supported
Telegram:                 https://t.me/TrueRuslan
email:                    ruslan.nemikin@gmail.com
```

Initial curated RU contextual CTA set:

```text
landing/projects/portfolio-platform.html                         engineering
landing/projects/notchhub.html                                  engineering
landing/notes/deployment-success-is-not-production-verification.html engineering
landing/notes/server-authoritative-ai-npcs.html                  ai-integration
```

English contextual CTA is derived only from existing RU/EN pairs for those exact RU sources.

## 25. Acceptance criteria

V1 is complete only when all are true:

1. collaboration is obvious without making the site sales-led;
2. Engineering remains primary;
3. Teaching/Mentoring is a credible full secondary practice;
4. startup and unusual relevant requests remain welcome;
5. no freelancer-catalogue feel;
6. one canonical availability/contact/policy truth;
7. no public pricing;
8. direct Telegram/email handoff;
9. self-employed/receipt capability stated calmly;
10. CTA only on approved surfaces;
11. RU/EN functional parity;
12. static/no-JS core flow;
13. no new privacy/runtime dependency;
14. full automated quality gates pass;
15. intentional visual/mobile/a11y result is accepted;
16. exact deployed production verification passes;
17. durable docs record accepted evidence without promoting P3.6.

## 26. Implementation boundary

The approved execution sequence is defined in:

`docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`

Implementation must start from `master` after this planning slice is integrated and must preserve RED→GREEN and exact-deployment evidence separation.