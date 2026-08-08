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

Allowed states:

- `available`
- `limited`
- `consulting-only`
- `unavailable`

Engineering and education/mentoring availability may differ.

Requirements:

- no automatic date-driven state changes;
- no analytics-driven state changes;
- no fake scarcity;
- no automatic inference from repository activity;
- unknown state is a validation failure;
- `unavailable` must not hide the page; it changes the message honestly.

Initial accepted launch truth is `engineering: limited`, `education: limited`, updated `2026-08-08`.

## 7. Canonical collaboration model

Add one canonical data record: `data/collaboration.json`.

Canonical data owns volatile/reused public facts: availability, enabled categories, direct contacts, self-employed capability and pricing-policy state. Markdown owns long-form human editorial explanation. Do not build a JSON CMS and do not duplicate mutable truth.

V1 direct contact truth:

- Telegram: `https://t.me/TrueRuslan`
- email: `ruslan.nemikin@gmail.com`
- pricing: `estimate-only`
- legal format: `self-employed-receipt-supported`

## 8. Navigation policy

`Работа со мной` / `Work with me` must be directly accessible from primary navigation and must look like a normal navigation item, not a highlighted sales button.

Current navigation is already dense. Targeted primary/secondary rebalancing is allowed to preserve desktop/mobile quality; broad navigation redesign is not.

## 9. Bounded commercial surface policy

Allowed surfaces:

- homepage;
- Work with me;
- Contacts;
- explicitly selected relevant case studies;
- explicitly selected relevant Engineering Notes/Publications.

No automatic commercial CTA on About, Experience, Photos, Sources, Engineering Map or arbitrary keyword-matched content.

Principle: **value/proof first → collaboration bridge second**.

No site-wide promotional banner.

## 10. Homepage bridge

Work with me is not a fourth primary card beside Experience / Projects / Materials. Add one restrained collaboration section after enough proof has been shown. It may project one short collaboration statement, current availability and one link. `unavailable` keeps the bridge discoverable with honest paused copy.

## 11. Contextual CTA model

Allowed categories:

- `engineering`
- `ai-integration`
- `education`
- `expert-content`

Initial curated RU surfaces:

```text
landing/projects/portfolio-platform.html                         engineering
landing/projects/notchhub.html                                  engineering
landing/notes/deployment-success-is-not-production-verification.html engineering
landing/notes/server-authoritative-ai-npcs.html                  ai-integration
```

English contextual CTA is derived only when an existing i18n pair has exactly the approved RU source. No keyword inference and no new EN content solely to host a CTA.

## 12. Contacts integration

Contacts remains a general page. Preserve external profiles and general-purpose contact framing. Add a Work with me link, a short task-qualification hint and canonical direct contacts. No form and no duplicated service catalogue.

## 13. Marketing and copy contract

Commercial copy follows **client situation → expected result → working boundary → relevant proof**. Technology names are supporting evidence.

Preferred concepts include “могу помочь”, “иногда беру”, “лучше всего подходят”, “предпочитаю”, “уточняю границы”, “согласуем результат”, “скажу, смогу ли быть полезен”.

Forbidden unsupported patterns include best/guaranteed/fast-and-high-quality/any-complexity claims, generic price filler, discounts, countdowns, fake scarcity, social proof, client counters, testimonials, clients or revenue/performance improvements.

## 14. Pricing policy

V1 has no public price list. The visitor describes the task; scope/result are clarified; timing/cost estimate is proposed where appropriate. Fixed mentoring prices or packages are future evidence-driven decisions, not V1.

## 15. SEO design

One new indexable route per locale, not a service-page farm. Required: clean canonical, RU/EN hreflang, OpenGraph, sitemap, generated search, internal links from approved surfaces, semantic no-JS content. Existing case studies/Notes remain independent search entrypoints, not doorway pages.

RU title direction: `Работа со мной — Backend-разработка, консультации и наставничество | Руслан Немыкин`.

EN title direction: `Work with me — Backend engineering, consulting and mentoring | Ruslan Nemykin`.

## 16. Structured data

`Person` remains the primary real-world entity. Do not create a fictional Organization, AggregateRating or fake Review. Additional service schema is optional only if it accurately models published content; V1 may ship without it.

## 17. Privacy and runtime boundaries

No form means no lead backend, CAPTCHA, lead database or form provider. No new third-party runtime dependency is required. Existing consent-gated analytics boundaries remain unchanged: no session replay, custom events, user parameters or conversion fingerprinting.

## 18. Measurement

Optimize for qualified conversations, not CTR. Aggregate site observations and real business outcomes remain separate. No client identities/correspondence/commercial details enter public repository telemetry. No invented conversion baseline. P3.6 remains independent.

## 19. Testing and fail-closed behavior

RED-first coverage must include availability, contacts, pricing/legal policy, categories, explicit surface mapping, no automatic availability mutation, no public price and no lead runtime. Build fails for unknown state, malformed contact, unknown category, unsafe path, missing/duplicate required placeholder or missing approved generated target.

## 20. RU/EN parity

Both routes ship together and share canonical availability, enabled practice lines, direct contacts, legal/pricing meaning, functional page structure and canonical/hreflang symmetry. Editorial copy is idiomatic, not literal.

## 21. Browser, accessibility and visual quality

Verify heading semantics, textual availability, no-JS direct links, keyboard/focus, serious/critical Axe gate, mobile overflow, Chromium/Firefox/WebKit, RU/EN no-JS, generated-search discoverability and intentional screenshot review. Visual thresholds must not be relaxed.

## 22. Production acceptance

Exact-head CI is necessary but insufficient. Acceptance requires verified feature head → squash merge → exact Pages deployment → deployment identity → deployment-triggered Production Live on that SHA → dedicated private-practice assertions → durable acceptance evidence afterward. Production failures trigger RED reproduction + bounded hotfix; never verifier weakening.

## 23. V1 non-goals

No forms, CRM, booking/calendar, payments, public price list, service packages, service-page SEO farm, conversion events, lead scoring, session replay/fingerprinting, AI seller, automatic availability changes, automatic order decisions or invented testimonials/ratings.

## 24. Acceptance criteria

V1 is complete only when collaboration is clear but the brand stays engineering-led; Engineering is primary; Teaching/Mentoring is credible secondary; startup/open-door remains; canonical truth is singular; no public pricing/form exists; self-employed support is stated calmly; CTA is bounded; RU/EN parity/no-JS/privacy boundaries hold; all automated/visual/a11y gates pass; exact deployed production passes; durable docs record evidence without promoting P3.6.

## 25. Implementation boundary

Execution is fixed in `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`. Implementation starts from `master` after this planning slice is integrated and preserves RED→GREEN and repository/artifact/deployment/acceptance separation.