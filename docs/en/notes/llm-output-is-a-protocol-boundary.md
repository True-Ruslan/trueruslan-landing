# Why successful LLM output still may violate the contract

When an application calls an LLM, it is easy to simplify the happy path mentally:

```text
request → provider → 200 OK → JSON → decision
```

The important engineering boundary is hidden between `200 OK` and “decision”.

A provider can accept the request, the model can generate a response and the HTTP call can complete successfully while the result is still **invalid input for the application**.

In LivingWorld I treat structured model output as an external protocol boundary rather than as a convenient shortcut from JSON to a domain object.

## 1. Transport success is not contract success

There are several different layers of success:

```text
transport success
        ↓
provider success
        ↓
syntactically valid response
        ↓
valid application contract
        ↓
authorized domain effect
```

They are not equivalent.

A response may not be JSON. Valid JSON may contain unknown fields. Correctly named fields may have the wrong types. And a perfectly valid object still does not automatically have permission to change persistent state or the game world.

The useful mental model is:

```text
LLM proposal
→ strict JSON validation
→ deterministic persistence policy
→ live action authorization
→ bounded effects
```

The word **proposal** matters. External model output becomes authoritative only after the application accepts it through its own boundaries.

## 2. “Almost correct JSON” is still incorrect input

The dangerous responses are often not obviously broken.

An application may expect an integer:

```json
{"trust": 1}
```

while the external system returns:

```json
{"trust": "1"}
```

or:

```json
{"trust": 1.0}
```

or `null` where the domain requires a concrete value.

Another case is a fully valid JSON object followed by a trailing token. Arrays can contain `null`, duplicate actions or logically conflicting actions such as `FOLLOW` and `STOP_FOLLOWING` together.

A permissive parser can “repair” many of those values, but then the application is silently inventing meaning on behalf of the external producer. That is a different contract.

## 3. Why I disable convenient coercion at this boundary

Serializers often try to be helpful:

- `"1"` can become `1`;
- `1.0` can become an integer;
- missing or `null` values can become defaults.

That tolerance can be useful for some user input. At an external structured-output trust boundary it can hide protocol violations.

The LivingWorld parser intentionally treats these as different protocol states:

```text
1
"1"
1.0
null
```

Unknown fields are rejected, trailing tokens are forbidden, `null` for required primitive values is rejected, and scalar/float coercion is disabled.

If the contract requires an integer, the producer has to send an integer.

## 4. The parser is a trust boundary, not a convenience helper

Instead of thinking only in terms of:

```text
JSON string → Java object
```

I prefer this model:

```text
untrusted external output
        ↓
strict syntax/schema parsing
        ↓
required-field validation
        ↓
domain bounds
        ↓
whitelists + consistency checks
        ↓
accepted proposal
```

Domain validation goes beyond basic deserialization. In LivingWorld it includes bounded speech/memory sizes, bounded relationship deltas, action-count limits, an exact action whitelist and rejection of duplicate or conflicting actions.

A technically deserializable object can still be meaningless or unsafe for a specific domain.

Errors should also be normalized into bounded categories such as `malformed JSON`, `unknown field` or `invalid field type` rather than exposing an arbitrary raw provider payload to users.

## 5. Valid JSON still is not authority

Suppose the model proposes a perfectly valid action:

```json
{"type": "FOLLOW"}
```

The server still has to check current reality:

- does the conversation session still exist;
- does this player own it;
- is the NPC alive and in the expected world/context;
- is the action allowed right now.

The same principle applies to persistent state. Relationship deltas and memory candidates are proposals, not an automatic right to mutate durable truth.

That is why the stages stay separate:

```text
parse / validate
≠
persist
≠
authorize live action
```

Combining them gives one malformed or misleading external payload too large a blast radius.

## 6. Fallback is part of protocol design

Malformed provider output is not a rare edge case that can be left for later. It belongs to the normal failure model next to timeouts, rate limits and unavailable endpoints.

The desired degradation path is bounded:

```text
invalid external response
        ↓
controlled rejection
        ↓
sanitized bounded fallback
        ↓
no unsafe state/world mutation
        ↓
a later healthy turn can recover
```

The last property matters: a bad turn should fail safely without poisoning the next healthy request.

## 7. Negative tests become an executable protocol specification

Strict boundaries make negative tests unusually valuable.

The LivingWorld parser contract explicitly rejects cases such as:

- unknown actions;
- unknown fields;
- trailing tokens;
- strings instead of integers;
- floating-point values instead of required integers;
- `null` required values;
- `null` elements in collections;
- too many actions;
- duplicates;
- conflicting actions.

A happy-path test proves one valid example. Negative contract tests describe what the system promises **not to interpret**.

## The principle I keep

> **Provider success is not contract success.**

An LLM may be probabilistic, but the application boundary around it does not have to be.

I try to treat structured LLM output like data from any external API that is not fully trusted:

1. accept a bounded response;
2. parse it strictly;
3. validate schema and types;
4. validate domain constraints;
5. convert it only into a proposal;
6. apply persistence policy and authorization separately;
7. provide controlled fallback when any previous boundary fails.

This removes unnecessary magic from LLM integration. Outside is a powerful but unreliable producer of data. Inside is an ordinary engineering system with explicit contracts and deterministic rules for what it is willing to accept.

---

Related:

- [LivingWorld case study](../projects/livingworld.md)
- [Designing a server-authoritative AI NPC pipeline](server-authoritative-ai-npcs.md)
