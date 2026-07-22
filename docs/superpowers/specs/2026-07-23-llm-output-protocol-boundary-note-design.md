# Grounded LLM Protocol Boundary Engineering Note Design

## Goal

Publish one new repository-grounded Engineering Note explaining why a successful LLM/provider response is not the same thing as a valid application-level decision.

The note should turn a concrete LivingWorld contract into a reusable engineering lesson: model output is untrusted external protocol input and must pass strict parsing, schema validation, bounded domain validation, deterministic policy, and fallback handling before it can affect durable or live state.

## Source verification basis

The public note must rely only on repository facts that were directly verified in `True-Ruslan/minecraft-botics-ai`.

Verified sources:

- `src/main/java/dev/trueruslan/livingworld/ai/AiDecisionParser.java`
  - strict Jackson mapper;
  - unknown fields rejected;
  - trailing tokens rejected;
  - null for primitives rejected;
  - floating-point-to-integer coercion disabled;
  - scalar coercion disabled;
  - bounded speech, memories, relationship deltas and actions;
  - sanitized failure categories.
- `src/test/java/dev/trueruslan/livingworld/ai/AiDecisionParserTest.java`
  - regression/contract cases for unknown actions, trailing tokens, string/floating/null relationship values, null memories/actions, duplicates and conflicting actions.
- `docs/ARCHITECTURE.md`
  - `LLM proposal -> strict JSON validation -> deterministic persistence policy -> live action authorization`;
  - model output is explicitly untrusted data.
- `docs/RC_E2E_RUNBOOK.md`
  - malformed provider response is an explicit provider-degradation acceptance scenario;
  - failures must degrade to bounded sanitized fallback without unsafe state/world mutation.

Historical incidents from the older MCA fork are useful context known from prior work, but that repository is not currently available through the connected GitHub source. Therefore the public note must not claim specific old stack traces, exact historical payloads, release numbers, or root-cause chronology as independently verified facts.

## Chosen scope

Publish exactly one new note in P1.4:

- slug: `llm-output-is-a-protocol-boundary`
- working title: `Почему успешный ответ LLM ещё не означает успешный контракт`

Do not publish a second voice-pipeline note in this milestone. The existing `server-authoritative-ai-npcs` note already covers text/voice convergence, session ownership, provider orchestration, cancellation and fallback at the architecture level. A second voice note would currently overlap too much.

## Narrative structure

The note should use a calm first-person engineering-diary tone and explain:

1. **The false happy-path assumption**
   - HTTP/provider success only means transport/provider execution succeeded;
   - it does not prove the returned payload satisfies the application contract.

2. **“Almost correct JSON” is still invalid protocol data**
   - trailing tokens after a valid object;
   - unknown fields;
   - wrong scalar types;
   - nulls where the domain requires concrete values;
   - arrays containing null/duplicate/conflicting elements.

3. **Why permissive coercion is dangerous**
   - accepting `"1"`, `1.0` or `null` as an integer silently changes semantics;
   - tolerant parsing can turn provider mistakes into valid-looking domain state.

4. **The parser is a trust boundary, not a convenience helper**
   - parse into a strict schema;
   - validate required fields and bounds;
   - whitelist actions;
   - reject unknown/ambiguous shapes;
   - expose sanitized failure categories rather than raw provider bodies.

5. **Validation is not yet authority**
   - a structurally valid `AiDecision` is still only a proposal;
   - persistence policy and live action authorization remain separate downstream gates.

6. **Fallback is part of the protocol design**
   - malformed responses must settle into deterministic bounded behavior;
   - no unsafe state/world mutation;
   - later healthy turns must be able to recover.

7. **General lesson**
   - provider success != contract success;
   - structured LLM output should be treated like any other external API boundary.

## Product/content boundaries

Keep existing architecture unchanged:

- Markdown source remains `docs/landing/notes/*.md`;
- canonical Notes metadata/relations remain in `data/notes.json`;
- page metadata remains in `data/page-meta.json`;
- Notes hub remains authored in `docs/landing/notes.md`;
- route discovery remains in `docs/toc.yaml`;
- Atom/search/sitemap/SEO continue through the existing build-time pipeline.

Do not add:

- a new Notes renderer;
- a new content schema;
- runtime GitHub/source fetching;
- CMS/backend/database;
- CSS or visual redesign;
- a second search index;
- invented incident metrics or unverifiable historical details.

## Relations

The new note should relate to:

- `server-authoritative-ai-npcs` — broader authority/session architecture;
- `green-ci-is-not-product-verification` — evidence/claim boundaries;

The existing `server-authoritative-ai-npcs` note should link back to the new protocol-boundary note so the relationship graph is navigable in both directions.

## Contract protection

Extend the existing canonical Notes content contract in `scripts/notes-content.test.js` so P1.4 requires `llm-output-is-a-protocol-boundary` in the canonical manifest.

The test should not freeze prose. It should protect only canonical presence/integration.

## Verification

Use TDD:

1. add the required P1.4 slug to the canonical Notes contract first;
2. confirm exact-head CI fails because the note/manifest integration is absent;
3. add the note and all canonical integrations;
4. run the complete configured quality matrix on the exact feature head.

Definition of Done:

- exactly one new grounded note is published;
- all factual technical claims are supported by the verified LivingWorld repository sources above;
- no specific unavailable historical incident is presented as independently verified;
- the note is meaningfully distinct from `server-authoritative-ai-npcs`;
- metadata, relations, Notes hub, TOC, page metadata, Atom/search/sitemap/SEO are integrated through existing architecture;
- canonical Notes contract includes the new slug;
- no new runtime/rendering architecture is introduced;
- exact-head full CI matrix is green.
