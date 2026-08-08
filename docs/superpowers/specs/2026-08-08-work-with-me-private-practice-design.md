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

Canonical routes: `/landing/work-with-me/` and `/en/work-with-me/`. RU/EN ship together.

The page is a calm qualification surface with hero + live availability + one Describe-the-task CTA; Engineering situations; startup/individual projects; Teaching & Mentoring; smaller Expert contribution; `Context → Scope → Estimate → Implementation → Handover`; good-fit guidance; open door; direct Telegram/email handoff and calm self-employed/receipt note.

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

Allowed availability states: `available`, `limited`, `consulting-only`, `unavailable`. Availability is manual public truth; no automatic mutation/fake scarcity. Long-form editorial copy remains Markdown.

## Bounded commercial surfaces

Allowed: homepage, Work with me, Contacts, explicit curated case studies/Notes/Publications. No automatic CTA on About, Experience, Photos, Sources, Engineering Map or keyword-matched arbitrary content.

Homepage keeps exactly Experience / Projects / Materials as its three primary paths. Collaboration is a restrained bridge after proof.

Initial RU contextual mappings:

```text
landing/projects/portfolio-platform.html                         engineering
landing/projects/notchhub.html                                  engineering
landing/notes/deployment-success-is-not-production-verification.html engineering
landing/notes/server-authoritative-ai-npcs.html                  ai-integration
```

Allowed categories: `engineering`, `ai-integration`, `education`, `expert-content`. EN contextual CTA is derived only from an existing exact i18n pair; no heuristics or new EN content solely for CTA symmetry.

## Contacts / pricing / navigation

Contacts stays general-purpose with external profiles; direct contacts come from the same canonical model, plus a short task-qualification hint and Work with me link. No duplicate service catalogue.

V1 has no public price list. Task description → scope/result clarification → timing/cost proposal where appropriate.

Work with me is a normal primary-nav item, not a sales button. Targeted header-density rebalancing is allowed; broad navigation redesign is not.

## Marketing / SEO / privacy

Commercial copy follows **client situation → expected result → working boundary → relevant proof**. Technologies support rather than replace the proposition. No best/guaranteed/cheap-sales/fake-proof patterns.

One indexable route per locale; require clean canonical, hreflang, OpenGraph, sitemap, generated search, approved internal links and semantic no-JS content. `Person` remains primary; no fictional Organization/reviews/ratings.

No form means no lead backend/CAPTCHA/database/provider. No new third-party runtime dependency. Existing consent analytics remains: no session replay, custom events, user parameters or conversion fingerprinting. Optimize for qualified conversations, not CTR. P3.6 remains independent.

## Quality / acceptance

RED-first; fail closed on unknown state/category, malformed contacts, unsafe target, missing/duplicate placeholder or missing approved generated target.

Require RU/EN parity, no-JS direct flow, search, keyboard/focus, Axe serious/critical gate, mobile overflow, Chromium/Firefox/WebKit and inspected visuals without threshold weakening.

Exact-head CI is necessary but not production acceptance. Final acceptance is verified head → squash → exact Pages deployment identity → deployment-triggered Production Live on that SHA → dedicated private-practice assertions → durable evidence. Production failure triggers preserved evidence + RED reproduction + bounded hotfix, never verifier weakening.

## V1 non-goals

No forms, CRM, booking/calendar, payments, public price list/packages, service-page SEO farm, conversion events/lead scoring, session replay/fingerprinting, AI seller, automatic availability/order decisions or invented testimonials/ratings.

## Acceptance criteria

V1 is complete only when collaboration is clear without making the site sales-led; Engineering remains primary; Teaching/Mentoring is credible secondary; startup/open-door remains; mutable truth has one owner; no public price/form exists; self-employed support is calm; CTA is bounded; RU/EN/no-JS/privacy boundaries hold; all automated/visual/a11y gates pass; exact production passes; durable docs record evidence without promoting P3.6.

## Implementation boundary

The approved executable sequence is `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`. Implementation starts from current `master` after this planning slice is integrated.