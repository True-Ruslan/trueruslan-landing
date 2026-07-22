# LLM Output Protocol Boundary Engineering Note Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one repository-grounded Engineering Note showing why successful LLM/provider execution is not equivalent to a valid application contract.

**Architecture:** Keep the existing Markdown-first Notes pipeline. Protect canonical presence with the existing Notes manifest contract, then integrate one new note through `data/notes.json`, Notes hub, page metadata and TOC; Atom/search/sitemap/SEO remain derived by the existing build pipeline.

**Tech Stack:** Node.js 24 test runner, JSON registries, Diplodoc Markdown/YAML, existing static build/postprocess pipeline.

## Global Constraints

- Publish exactly one new note: `llm-output-is-a-protocol-boundary`.
- Base factual claims only on verified `True-Ruslan/minecraft-botics-ai` source/tests/docs.
- Do not present unavailable historical MCA-fork incidents as independently verified facts.
- Do not add a new Notes renderer, schema, runtime source fetch, CMS, backend, database, CSS redesign, second search index, invented metrics or unverifiable incident details.
- Keep `data/notes.json` as canonical Notes metadata/relations source.
- Keep Markdown as the authored prose source.
- Preserve existing build-derived Atom/search/sitemap/SEO architecture.
- Full exact-head configured CI matrix must pass before merge.

---

### Task 1: Add the P1.4 canonical presence contract first

**Files:**
- Modify: `scripts/notes-content.test.js`

**Interfaces:**
- Consumes: `loadNotesManifest()` from `scripts/notes-content.js`.
- Produces: a failing canonical-content assertion requiring `llm-output-is-a-protocol-boundary`.

- [ ] **Step 1: Add the failing contract**

Extend the canonical grounded-notes test so `requiredGroundedNotes` includes:

```js
'llm-output-is-a-protocol-boundary',
```

Keep the existing three P0.5 required slugs unchanged.

- [ ] **Step 2: Verify RED on the exact branch head**

Run through the repository PR CI equivalent of:

```bash
npm test
```

Expected: `Test` fails because `loadNotesManifest()` does not yet contain `llm-output-is-a-protocol-boundary`, with the assertion message identifying the missing grounded Engineering Note.

- [ ] **Step 3: Commit the RED contract**

```bash
git add scripts/notes-content.test.js
git commit -m "test: require LLM protocol boundary note"
```

---

### Task 2: Publish the grounded note and canonical metadata

**Files:**
- Create: `docs/landing/notes/llm-output-is-a-protocol-boundary.md`
- Modify: `data/notes.json`

**Interfaces:**
- Consumes: verified LivingWorld parser/test/architecture facts from the design spec.
- Produces: one authored note plus canonical metadata used by note navigation/feed/build integrations.

- [ ] **Step 1: Write the note source**

Create `docs/landing/notes/llm-output-is-a-protocol-boundary.md` with this semantic structure and no unverifiable historical claims:

```markdown
# Почему успешный ответ LLM ещё не означает успешный контракт

[Opening: provider/HTTP success proves transport/provider execution, not domain validity.]

## 1. Самая опасная ошибка — считать transport success contract success
[Explain 200/success vs application contract.]

## 2. «Почти правильный JSON» всё равно остаётся неверным входом
[Grounded cases: trailing tokens, unknown fields, wrong scalar types, nulls, invalid array elements.]

## 3. Почему я отключаю удобные coercion
[Grounded examples: "1", 1.0, null must not silently become an integer domain value.]

## 4. Parser здесь — trust boundary
[Strict schema, required fields, bounds, whitelisted actions, sanitized categories.]

## 5. Валидный JSON всё ещё не authority
[Validated AiDecision remains proposal; deterministic persistence policy and live action authorization are separate gates.]

## 6. Fallback — часть protocol design
[Malformed response -> bounded deterministic fallback, no unsafe state/world mutation, later recovery.]

## Что я в итоге для себя сформулировал
> Provider success не равен contract success.
[Generalize to external API/protocol boundaries.]
```

The prose must explicitly distinguish repository-verified current design from broader engineering inference.

- [ ] **Step 2: Add canonical note metadata**

Append to `data/notes.json`:

```json
{
  "slug": "llm-output-is-a-protocol-boundary",
  "title": "Почему успешный ответ LLM ещё не означает успешный контракт",
  "description": "Почему structured output модели нужно обрабатывать как внешний protocol boundary: strict JSON, type validation, no coercion, bounded fallback и отдельная authorization граница.",
  "published": "2026-07-23",
  "updated": "2026-07-23",
  "readingMinutes": 7,
  "tags": ["AI", "Protocols", "Validation", "Reliability"],
  "related": ["server-authoritative-ai-npcs", "green-ci-is-not-product-verification"]
}
```

Update the existing `server-authoritative-ai-npcs` entry so its `related` list includes `llm-output-is-a-protocol-boundary` while preserving `static-site-quality-gates`.

- [ ] **Step 3: Run the Notes/unit contract**

```bash
npm test
```

Expected: the canonical-note presence test now passes; any manifest relation/file validation failure must be fixed without weakening validation.

- [ ] **Step 4: Commit the note + canonical metadata**

```bash
git add docs/landing/notes/llm-output-is-a-protocol-boundary.md data/notes.json
git commit -m "content: add grounded LLM protocol boundary note"
```

---

### Task 3: Integrate discovery and page metadata

**Files:**
- Modify: `docs/landing/notes.md`
- Modify: `data/page-meta.json`
- Modify: `docs/toc.yaml`

**Interfaces:**
- Consumes: canonical slug/title from Task 2.
- Produces: Notes hub discovery, navigation entry and page-specific SEO/social metadata. Atom/search/sitemap continue to derive from existing build-time systems.

- [ ] **Step 1: Add the note to the AI systems hub section**

Under `## AI systems`, after `server-authoritative-ai-npcs`, add:

```markdown
### Почему успешный ответ LLM ещё не означает успешный контракт

HTTP 200 или успешный вызов provider ещё не означает, что модель вернула допустимое решение для приложения. Здесь я разбираю strict structured output как внешний protocol boundary: trailing tokens, неверные типы, null, coercion, schema validation и bounded fallback.

[Читать заметку →](notes/llm-output-is-a-protocol-boundary.md)
```

- [ ] **Step 2: Add page metadata**

Append to `data/page-meta.json`:

```json
{
  "path": "landing/notes/llm-output-is-a-protocol-boundary.html",
  "card": "note-llm-protocol-boundary",
  "title": "Почему успешный ответ LLM ещё не означает успешный контракт",
  "description": "Structured LLM output как внешний protocol boundary: strict JSON, type validation, coercion, bounded fallback и отдельная authorization граница.",
  "displayTitle": "LLM PROTOCOL BOUNDARY",
  "kicker": "ENGINEERING NOTE",
  "tags": ["AI", "PROTOCOLS", "VALIDATION"],
  "accent": "violet"
}
```

- [ ] **Step 3: Add the TOC route**

Under Engineering Notes items in `docs/toc.yaml`, add:

```yaml
      - name: LLM protocol boundary
        href: ./landing/notes/llm-output-is-a-protocol-boundary.md
```

- [ ] **Step 4: Run unit/build checks**

```bash
npm test
npm run build:docs
npm run check:site
```

Expected: all commands exit 0; generated note route exists and passes site integrity.

- [ ] **Step 5: Commit integration**

```bash
git add docs/landing/notes.md data/page-meta.json docs/toc.yaml
git commit -m "content: integrate LLM protocol boundary note"
```

---

### Task 4: Exact-head quality verification and merge preparation

**Files:**
- Review only: all files changed by Tasks 1–3 plus design/plan.

**Interfaces:**
- Consumes: complete feature branch.
- Produces: exact-head evidence suitable for merge and durable continuity docs.

- [ ] **Step 1: Review feature scope**

Expected changed files exactly:

```text
data/notes.json
data/page-meta.json
docs/landing/notes.md
docs/landing/notes/llm-output-is-a-protocol-boundary.md
docs/superpowers/plans/2026-07-23-llm-output-protocol-boundary-note.md
docs/superpowers/specs/2026-07-23-llm-output-protocol-boundary-note-design.md
docs/toc.yaml
scripts/notes-content.test.js
```

No renderer/CSS/runtime/workflow/visual-baseline change is expected.

- [ ] **Step 2: Run/observe the full exact-head configured matrix**

Required green gates:

```text
npm test
production Diplodoc build
generated-site integrity
mobile overflow
Chromium browser/Axe/Lighthouse
Sources Knowledge Base smoke
Project Evidence smoke
Photo Stories smoke
Portfolio v0.3 regression
Firefox/WebKit compatibility
generated search
metadata/OpenGraph
Engineering Map
visual regression
quality diagnostics/evidence upload
```

- [ ] **Step 3: Merge only the verified exact head**

Use squash merge with expected head SHA protection. Record feature PR number, exact implementation head, Build/run number and actual squash SHA for the post-merge continuity sync.
