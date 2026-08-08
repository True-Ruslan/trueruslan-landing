# Work with me / Private practice — design specification

Date: 2026-08-08
Status: APPROVED DESIGN / IMPLEMENTATION PLANNED
Repository: `True-Ruslan/trueruslan-landing`
Implementation plan: `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`

## Product contract

TrueLanding remains an evidence-backed personal engineering brand first. The collaboration capability creates this path:

**experience / projects / notes / publications → trust → relevance → Work with me → direct conversation → qualification → fixed scope**.

Primary identity: **Ruslan Nemykin — Backend Engineer**. Engineering is primary. Teaching & Mentoring is a full but secondary professional line. Startup/individual projects are secondary. Relevant adjacent development/technology/education/technical-content requests keep an open door without implying “I do anything”.

## Work with me UX

Canonical routes: `/landing/work-with-me/` and `/en/work-with-me/`; RU/EN ship together.

The page includes a calm hero + live availability + one Describe-the-task CTA; Engineering situations; Startup/individual projects; Teaching & Mentoring; a smaller Expert contribution section; `Context → Scope → Estimate → Implementation → Handover`; fit guidance; open door; direct Telegram/email handoff and self-employed/receipt note.

No Hire-me pressure, discounts, countdowns, public prices, forms or unsupported speed/quality claims.

## Canonical truth

`data/collaboration.json` owns mutable/reused facts.

```text
engineering availability: limited
education availability:   limited
updated:                  2026-08-08
Telegram:                 https://t.me/TrueRuslan
email:                    ruslan.nemikin@gmail.com
pricing:                  estimate-only
legal format:             self-employed-receipt-supported
```

Allowed availability: `available`, `limited`, `consulting-only`, `unavailable`. It is manual public truth: no automatic mutation/fake scarcity. Long-form copy stays Markdown.

## Bounded surfaces

Allowed: homepage, Work with me, Contacts and explicit curated case studies/Notes/Publications. No automatic CTA on About, Experience, Photos, Sources, Engineering Map or keyword matches.

Homepage keeps exactly Experience / Projects / Materials as its three primary paths. Collaboration is a restrained bridge after proof.

Initial RU contextual mappings:

```text
landing/projects/portfolio-platform.html                         engineering
landing/projects/notchhub.html                                  engineering
landing/notes/deployment-success-is-not-production-verification.html engineering
landing/notes/server-authoritative-ai-npcs.html                  ai-integration
```

Categories: `engineering`, `ai-integration`, `education`, `expert-content`. EN CTA only from an existing exact i18n pair; no heuristics/new content solely for CTA symmetry.

## Contacts, pricing and navigation

Contacts remains general-purpose, preserves external profiles and obtains direct contacts from the same canonical model. Add only a concise qualification hint and Work with me link.

V1 has no public price list. Flow is task description → scope/result clarification → timing/cost proposal where appropriate.

Work with me is a normal primary-nav item, not a sales button. Targeted header-density rebalancing is allowed; broad navigation redesign is not.

## Marketing, SEO, privacy

Copy follows **client situation → expected result → working boundary → relevant proof**. No unsupported “best”, guarantees, cheap-sales language, fake scarcity/social proof/testimonials/client/outcome claims.

One indexable route per locale, with clean canonical, hreflang, OpenGraph, sitemap, generated search, approved internal links and semantic no-JS content. `Person` remains primary; no fictional Organization/reviews/ratings.

No form means no lead backend/CAPTCHA/database/provider. No new third-party runtime dependency. Existing analytics boundaries remain: no session replay, custom events, user parameters or conversion fingerprinting. Optimize for qualified conversations rather than CTR. P3.6 remains independent.

## Quality / acceptance

RED-first and fail-closed on unknown state/category, malformed contacts, unsafe target, missing/duplicate placeholder or missing approved generated target.

Require RU/EN parity, no-JS direct flow, search, keyboard/focus, Axe serious/critical gate, mobile overflow, Chromium/Firefox/WebKit and inspected visuals without threshold weakening.

Exact-head CI is not production acceptance. Final acceptance is verified head → squash → exact Pages deployment identity → deployment-triggered Production Live on that SHA → dedicated private-practice assertions → durable evidence. Production failure gets preserved evidence + RED reproduction + bounded hotfix; never verifier weakening.

## V1 non-goals

No forms, CRM, booking/calendar, payments, public price list/packages, service-page SEO farm, conversion events/lead scoring, session replay/fingerprinting, AI seller, automatic availability/order decisions or invented testimonials/ratings.

## Acceptance criteria

Collaboration must be clear without making the site sales-led; Engineering remains primary; Teaching/Mentoring is credible secondary; startup/open-door remains; mutable truth has one owner; no public price/form; self-employed support is calm; CTA bounded; RU/EN/no-JS/privacy boundaries hold; automated/visual/a11y gates pass; exact production passes; durable docs do not promote P3.6.

## Implementation boundary

Execution is specified in `docs/superpowers/plans/2026-08-09-work-with-me-private-practice.md`. Implementation starts from current `master` only after this planning slice is integrated.