# Work with me / Private practice — design specification

Date: 2026-08-08
Status: APPROVED DESIGN / IMPLEMENTATION PLANNED
Repository: `True-Ruslan/trueruslan-landing`
Implementation plan: `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`

## Product contract

TrueLanding remains first and foremost the personal engineering brand and evidence-backed portfolio of Ruslan Nemykin. The new capability creates a natural path from demonstrated expertise to bounded collaboration:

**experience / projects / notes / publications → trust → relevance → Work with me → direct conversation → qualification → fixed scope**.

Primary identity remains **Ruslan Nemykin — Backend Engineer**. Engineering is the primary commercial stream; Teaching & Mentoring is a full but secondary professional line; startup/individual projects are secondary; unusual relevant development/technology/education/technical-content requests remain welcome through an open-door message without implying generalist outsourcing.

## Work with me UX

Canonical routes:

- `/landing/work-with-me/`
- `/en/work-with-me/`

RU/EN ship together. The page is a calm qualification surface with:

1. concise hero + live availability + one Describe-the-task CTA;
2. Engineering situations: backend/integrations, architecture/audit, difficult engineering problems, modernization, AI-enabled features;
3. startup/individual projects with scoping-first boundaries;
4. Teaching & Mentoring: individual sessions, tutoring/mentoring, consultations, course/material design, workshops/corporate education;
5. smaller Expert contribution for technical writing/docs/review;
6. process `Context → Scope → Estimate → Implementation → Handover`, with engineering principle `Architecture → Implementation → Verification → Delivery → Handover`;
7. good-fit guidance;
8. open door for nonstandard relevant work;
9. direct Telegram/email handoff and calm self-employed/receipt note.

No Hire-me pressure, discounts, countdowns, public prices, forms or unsupported speed/quality claims.

## Canonical collaboration truth

`data/collaboration.json` is the only owner of mutable/reused collaboration facts.

Initial launch truth:

```text
engineering availability: limited
education availability:   limited
updated:                  2026-08-08
Telegram:                 https://t.me/TrueRuslan
email:                    ruslan.nemikin@gmail.com
pricing:                  estimate-only
legal format:             self-employed-receipt-supported
```

Allowed availability states: `available`, `limited`, `consulting-only`, `unavailable`.

Availability is manual public truth: no date-, analytics-, traffic- or repository-driven automatic mutation and no fake scarcity. `unavailable` keeps the route discoverable with honest paused copy.

Long-form copy remains Markdown; JSON does not become a prose CMS.

## Bounded commercial surfaces

Allowed surfaces:

- homepage;
- Work with me;
- Contacts;
- explicit curated case studies/Notes/Publications.

No automatic CTA on About, Experience, Photos, Sources, Engineering Map or arbitrary keyword matches.

Homepage keeps exactly the three primary Experience / Projects / Materials paths. Work with me is a restrained bridge after sufficient project/evidence proof, not primary path #4.

Initial RU contextual mappings:

```text
landing/projects/portfolio-platform.html                         engineering
landing/projects/notchhub.html                                  engineering
landing/notes/deployment-success-is-not-production-verification.html engineering
landing/notes/server-authoritative-ai-npcs.html                  ai-integration
```

Allowed categories: `engineering`, `ai-integration`, `education`, `expert-content`. EN contextual CTA is derived only from an existing exact RU/EN pair; no keyword inference or new EN content solely for CTA symmetry.

## Contacts and pricing

Contacts remains general-purpose and keeps external profiles. Direct Telegram/email is projected from the same canonical model. A short task-qualification hint links to Work with me; no duplicated catalogue.

V1 has no public price list. Flow: task description → clarify scope/result → propose timing/cost where appropriate. Public mentoring prices/packages remain future evidence-driven decisions.

## Navigation / SEO

Work with me is a normal primary-navigation item, not a visual sales button. Header density is an explicit desktop/mobile constraint; targeted primary/secondary rebalancing is allowed, broad redesign is not.

One indexable Work with me route per locale, not a service-page farm. Require clean canonical, RU/EN hreflang, OpenGraph, sitemap, generated search, internal links from approved surfaces and semantic no-JS content.

RU title: `Работа со мной — Backend-разработка, консультации и наставничество | Руслан Немыкин`.

EN title: `Work with me — Backend engineering, consulting and mentoring | Ruslan Nemykin`.

`Person` remains primary structured entity. No fictional Organization, reviews or ratings.

## Privacy / measurement

No form means no lead backend, CAPTCHA, lead database or form provider. No new third-party runtime dependency. Existing consent-gated analytics boundaries remain unchanged: no session replay, custom events, user parameters or conversion fingerprinting.

Success optimizes for qualified conversations, not raw CTR. No client identities/correspondence/commercial details enter public repository telemetry. P3.6 remains an independent measurement checkpoint and is not satisfied by this feature.

## Marketing/copy policy

Message architecture: **client situation → expected result → working boundary → relevant proof**. Technologies support the proposition rather than replace it.

Never invent or use unsupported best/guaranteed/fast-and-high-quality/any-complexity claims, discounts/countdowns, fake scarcity, social proof, client counters, testimonials, clients or outcome metrics.

## Quality / acceptance

Implementation is RED-first. Fail closed on unknown state/category, malformed contacts, unsafe target path, missing/duplicate required placeholder or missing approved generated target.

Require RU/EN parity, no-JS direct flow, generated search, keyboard/focus, Axe serious/critical gate, mobile overflow, Chromium/Firefox/WebKit and intentional visual inspection without threshold weakening.

Exact-head CI is necessary but not production acceptance. Final acceptance is verified feature head → squash → exact Pages deployment identity → deployment-triggered Production Live on that SHA → dedicated private-practice production assertions → durable acceptance evidence. Any production defect gets preserved evidence + RED reproduction + bounded hotfix, never verifier weakening.

## V1 non-goals

No forms, CRM, booking/calendar, payments, public price list, service packages, service-page SEO farm, conversion events/lead scoring, session replay/fingerprinting, AI seller, automatic availability/order decisions or invented testimonials/ratings.

## Acceptance criteria

The feature is complete only when collaboration is clear without making the site sales-led; Engineering remains primary; Teaching/Mentoring is credible secondary; startup/open-door remains; mutable truth has one owner; no public price/form exists; self-employed support is calm; CTA is bounded; RU/EN/no-JS/privacy boundaries hold; all automated/visual/a11y gates pass; exact deployed production passes; durable docs record evidence without promoting P3.6.

## Implementation boundary

The approved executable sequence is `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`. Implementation starts from current `master` after this planning slice is integrated.