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

Primary identity remains **Ruslan Nemykin — Backend Engineer**.

Commercial positioning: **Backend Engineer with a private engineering and educational practice who can be engaged for bounded work with a clear outcome.**

The site must not lead with freelancing, generic services, availability hype, or sales language. Existing evidence remains the persuasion layer; the commercial surface only explains how a visitor can engage the same demonstrated expertise.

### Audience priority

1. **Primary — professional engineering work.** Product teams, companies, technical leaders and founders with a reasonably concrete engineering problem or deliverable.
2. **Secondary — startups and individual clients.** MVPs, small services, automations, bots, prototypes and bounded parts of a product are welcome when scope can be clarified before implementation.
3. **Open door — adjacent or unusual work.** The listed formats are examples, not a closed catalogue. Relevant requests around development, technology, education or technical content may still be discussed.

Never imply “I take any work” or “I build anything”. Preserve specialization while allowing useful unexpected requests.

## 3. Practice structure

### Engineering — primary

Organize around client situations, not a technology inventory:

- backend modules, services and APIs;
- external integrations;
- architecture/backend audit;
- bounded engineering code review;
- modernization/refactoring;
- difficult defects;
- performance/reliability analysis;
- AI/LLM/RAG/agent/MCP integration with explicit system boundaries.

### Startup & individual projects — secondary

New ideas, small MVPs, bot backends, automations and prototypes are acceptable after defining the intended outcome and a bounded first slice. Avoid undefined whole-startup commitments and open-ended outsourcing.

### Teaching & Mentoring — full secondary professional line

Supported formats include individual Java/Spring/backend sessions, mentoring/tutoring, junior→middle development guidance, educational code review, interview preparation, project-based learning, technical consultations, learning-path design, course/module design, workshops/corporate training, labs/exercises/tests and educational/technical materials.

Prefer mentoring/teaching/tutoring/course language over making `репетитор` the top-level personal-site identity.

### Expert contribution — bounded adjacent capability

Technical articles, documentation, technical/material review, educational/methodological content and other work where engineering expertise + clear writing is the primary value. It must not become a third equal pillar.

## 4. Core routes

- RU: `/landing/work-with-me/`
- EN: `/en/work-with-me/`

Legacy `.html` remains compatibility-only. RU/EN ship together with functional parity and natural editorial localization.

## 5. Work with me UX

The page is a calm qualification surface, not a sales landing. It must let a visitor answer: is my task a fit, how does Ruslan work, how do I start?

Required sections:

1. Hero: title, concise positioning, live availability, one `Описать задачу`/EN equivalent CTA.
2. Engineering situations: Backend & integrations; Architecture & audit; Complex engineering problem; Modernization; AI-enabled features.
3. Startup & individual projects.
4. Teaching & Mentoring.
5. Expert contribution.
6. How I work: **Context → Scope → Estimate → Implementation → Handover**; engineering principle **Architecture → Implementation → Verification → Delivery → Handover**.
7. Good-fit guidance: clear outcome, bounded scope, verifiable result, handover boundary.
8. Open door: “не нашли формат — всё равно напишите”, without implying generalist outsourcing.
9. Direct handoff through Telegram/email, including what context to send and a calm self-employed/receipt note.

Forbidden in hero: Hire-me visual pressure, discounts, countdowns/urgency, public prices, lead forms, unsupported speed/quality promises.

## 6. Availability

Allowed states: `available`, `limited`, `consulting-only`, `unavailable`. Engineering and education may differ.

Availability is manual public truth: no date-, analytics-, traffic- or repository-driven automatic mutation; no fake scarcity; unknown state fails validation. `unavailable` changes copy but never hides the page.

Initial launch truth: `engineering: limited`, `education: limited`, `updated: 2026-08-08`.

## 7. Canonical collaboration truth

Create `data/collaboration.json` as the only owner of mutable/reused facts:

- availability;
- enabled practice categories;
- direct contacts;
- self-employed capability;
- pricing policy (`estimate-only` in V1);
- explicit contextual-surface allowlist.

Long-form explanations/examples remain Markdown. Do not create a JSON CMS or duplicate mutable truth.

V1 direct-contact/policy truth:

- Telegram: `https://t.me/TrueRuslan`
- email: `ruslan.nemikin@gmail.com`
- pricing: `estimate-only`
- legal format: `self-employed-receipt-supported`

## 8. Navigation

`Работа со мной / Work with me` is directly available in primary navigation as a normal item, not a highlighted sales button. Header density is a UX requirement. Targeted primary/secondary rebalancing is allowed; broad navigation redesign is not.

## 9. Bounded commercial surfaces

Allowed: homepage, Work with me, Contacts, explicitly selected case studies, explicitly selected Notes/Publications.

No automatic CTA on About, Experience, Photos, Sources, Engineering Map or keyword-matched arbitrary content.

Principle: **value/proof first → collaboration bridge second**. No site-wide promotional banner.

## 10. Homepage bridge

Do not turn Work with me into primary path #4. Preserve Experience / Projects / Materials. Add one restrained collaboration bridge only after enough project/evidence proof; project current availability and one link. Keep it present with honest paused copy when unavailable.

## 11. Contextual CTA model

Allowed semantic categories: `engineering`, `ai-integration`, `education`, `expert-content`.

Initial RU mappings:

```text
landing/projects/portfolio-platform.html                         engineering
landing/projects/notchhub.html                                  engineering
landing/notes/deployment-success-is-not-production-verification.html engineering
landing/notes/server-authoritative-ai-npcs.html                  ai-integration
```

English contextual CTA is derived only when an existing i18n pair has exactly the approved RU source. No keyword inference and no new EN content solely for CTA symmetry.

## 12. Contacts

Contacts remains general-purpose. Preserve external profiles and overall contact framing. Add a Work with me link, task-qualification hint and canonical direct contacts. No form and no duplicated service catalogue.

## 13. Marketing/copy contract

Message architecture: **client situation → expected result → working boundary → relevant proof**. Technology names are supporting evidence.

Preferred language: “могу помочь”, “иногда беру”, “лучше всего подходят”, “предпочитаю”, “уточняю границы”, “согласуем результат”, “скажу, смогу ли быть полезен”.

Forbidden unsupported patterns: best/guaranteed/fast-and-high-quality/any-complexity claims, cheap generic filler, discounts, countdowns, fake scarcity/social proof/client counters/testimonials/clients/outcome metrics.

## 14. Pricing

No public V1 price list. Visitor describes task → scope/result clarified → timing/cost estimate proposed where appropriate. Public mentoring/session prices/packages are future evidence-driven decisions.

## 15. SEO

One indexable Work with me route per locale, not a service-page farm. Require clean canonical, hreflang, OpenGraph, sitemap, generated search, internal links from allowed surfaces and semantic no-JS content. Existing case studies/Notes remain independent entrypoints.

RU title: `Работа со мной — Backend-разработка, консультации и наставничество | Руслан Немыкин`.

EN title: `Work with me — Backend engineering, consulting and mentoring | Ruslan Nemykin`.

## 16. Structured data

`Person` remains primary. No fictional Organization, AggregateRating or Review. Optional service schema may be omitted unless final published content can be modeled accurately.

## 17. Privacy/runtime

No form → no lead backend/CAPTCHA/lead database/form provider. No new third-party runtime dependency. Existing consent analytics boundaries stay unchanged: no session replay, custom events, user parameters or conversion fingerprinting.

## 18. Measurement

Optimize for qualified conversations, not clicks. Site aggregates and real business outcomes remain separate; no client identities/correspondence/commercial details enter public telemetry. No invented conversion baseline. P3.6 remains independent.

## 19. Testing/fail-closed behavior

RED-first coverage includes availability, independent Engineering/Education states, contacts, pricing/legal policy, categories, explicit contextual mapping, no automatic availability mutation, no public price and no lead runtime.

Build failures include unknown state, malformed contacts, unknown category, unsafe path, missing/duplicate required collaboration placeholder, or missing approved generated target.

## 20. RU/EN parity

Both routes share canonical availability, practice lines, contacts, legal/pricing meaning, functional structure and canonical/hreflang symmetry. Copy remains idiomatic rather than literal.

## 21. Browser/accessibility/visual

Verify semantic headings, textual availability, no-JS direct links, keyboard/focus, serious/critical Axe gate, mobile overflow, Chromium/Firefox/WebKit, RU/EN no-JS, generated search and intentional screenshot review. Do not relax visual thresholds.

## 22. Production acceptance

Exact-head CI is necessary but not sufficient. Acceptance requires verified feature head → squash merge → exact Pages deployment → deployment identity → deployment-triggered Production Live for that SHA → dedicated private-practice assertions → durable acceptance record afterward.

Production failure preserves evidence and triggers RED reproduction + bounded hotfix. Never weaken the verifier to obtain green.

## 23. V1 non-goals

No form, CRM, booking/calendar, payments, public price list, service packages, service-page SEO farm, conversion events, lead scoring, session replay/fingerprinting, AI seller, automatic availability/order decisions, invented testimonials/clients/ratings.

## 24. Acceptance criteria

V1 is complete only when collaboration is clear without making the site sales-led; Engineering remains primary; Teaching/Mentoring is a credible secondary practice; startup/open-door remains; mutable truth has one owner; no public pricing/form exists; self-employed support is stated calmly; CTA is bounded; RU/EN parity/no-JS/privacy boundaries hold; automated/visual/a11y gates pass; exact production passes; durable docs record evidence without promoting P3.6.

## 25. Implementation boundary

Execution is fully specified in `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md` and starts from `master` only after this planning slice is integrated.