# Canonical Domain Link Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `https://trueruslan.ru/` consistently from the primary GitHub repositories and CV, close the custom-host Cloudflare telemetry gate, and synchronize durable project state without weakening rollback or CI contracts.

**Architecture:** Use one reviewable feature PR per repository, followed by documentation-only continuity PRs where canonical state files exist. The legacy Pages origin remains untouched in deployment, rollback, tests and historical evidence. The PDF edit is annotation-metadata-only and must produce a zero-pixel visual diff.

**Tech Stack:** GitHub branches/PRs and Actions; Node.js 24/npm 11.5.1 for `trueruslan-landing`; Node.js 22.13+/pnpm 11.15.1/Turborepo for Vlezet; Java 21/Gradle for VillAIgence; PyMuPDF plus the repository-independent PDF render/diff scripts for CV verification.

## Global Constraints

- Canonical public origin is exactly `https://trueruslan.ru/`.
- Do not replace the legacy Pages origin where it is required for rollback, compatibility, tests or historical evidence.
- Do not create project-specific case-study URLs before those routes exist.
- Do not add dependencies or change runtime, hosting, search, analytics or privacy architecture.
- Merge only after all available checks pass for the exact PR head.
- Use squash merge unless an existing repository rule requires another method.
- Cloudflare data closes only the binary telemetry-observed gate; keep the 3–4 week evidence window for product decisions.

---

### Task 1: Land the approved design and plan

**Files:**
- Existing: `docs/superpowers/specs/2026-08-01-canonical-link-rollout-design.md`
- Create: `docs/superpowers/plans/2026-08-01-canonical-link-rollout.md`

**Interfaces:**
- Consumes: approved conversation design.
- Produces: durable design/plan baseline on `master` for all later PRs.

- [ ] **Step 1: Open a documentation PR**

Create a PR from `docs/canonical-link-rollout-design` to `master` titled:

```text
docs: plan canonical domain link rollout
```

The PR body must list the approved scope, the Cloudflare evidence boundary, the three target repositories and the unsupported manual profile surfaces.

- [ ] **Step 2: Verify the exact PR head**

Wait for the landing `Build` workflow. Expected: all existing test, build, browser, accessibility, cross-browser, search, metadata, visual and custom-domain artifact steps succeed.

- [ ] **Step 3: Squash merge**

Merge only after exact-head success. Record PR number, head SHA, run ID and squash SHA for the final continuity entry.

---

### Task 2: Add a CI guard for the landing public links

**Files:**
- Create: `scripts/canonical-public-links.test.js`
- Modify later in this task: `README.md`
- Modify later in this task: `docs/assets/documents/cv.pdf`

**Interfaces:**
- Consumes: repository root `README.md` and `docs/assets/documents/cv.pdf`.
- Produces: a Node test that fails if the canonical README or CV URI regresses.

- [ ] **Step 1: Write the failing test**

Create `scripts/canonical-public-links.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonical = 'https://trueruslan.ru/';
const legacy = 'https://true-ruslan.github.io/trueruslan-landing/';

test('repository README exposes the canonical production site once', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.equal(readme.split(canonical).length - 1, 1);
});

test('CV contains the canonical website URI and no public legacy URI', () => {
  const pdf = fs.readFileSync(path.join(root, 'docs/assets/documents/cv.pdf')).toString('latin1');
  assert.match(pdf, /https:\/\/trueruslan\.ru\//);
  assert.doesNotMatch(pdf, /https:\/\/true-ruslan\.github\.io\/trueruslan-landing\//);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm test -- --test-name-pattern='canonical production site|CV contains'
```

Expected: README and/or CV assertions fail because the rollout is not implemented yet.

- [ ] **Step 3: Commit the RED boundary**

```bash
git add scripts/canonical-public-links.test.js
git commit -m "test: guard canonical public links"
```

---

### Task 3: Update the landing README and CV annotation

**Files:**
- Modify: `README.md` immediately after the introductory paragraph.
- Modify: `docs/assets/documents/cv.pdf` annotation URI only.
- Test: `scripts/canonical-public-links.test.js`

**Interfaces:**
- Consumes: canonical URL and existing PDF annotation.
- Produces: public repository link and visually identical PDF with canonical URI metadata.

- [ ] **Step 1: Add the README link**

Insert exactly:

```markdown
**Production:** [trueruslan.ru](https://trueruslan.ru/)
```

Place it between the introductory paragraph and `## Архитектура`.

- [ ] **Step 2: Render the original PDF**

```bash
python /home/oai/skills/pdfs/scripts/render_pdf.py \
  docs/assets/documents/cv.pdf \
  --out_dir /tmp/trueruslan-cv-before \
  --dpi 200
cp docs/assets/documents/cv.pdf /tmp/trueruslan-cv-before.pdf
```

Expected: every page renders without missing glyphs, clipping or black rectangles.

- [ ] **Step 3: Replace only the legacy URI annotation**

Run from the repository root:

```bash
python - <<'PY'
from pathlib import Path
import fitz

pdf_path = Path('docs/assets/documents/cv.pdf')
legacy = 'https://true-ruslan.github.io/trueruslan-landing/'
canonical = 'https://trueruslan.ru/'
tmp_path = pdf_path.with_suffix('.canonical.tmp.pdf')

doc = fitz.open(pdf_path)
updated = 0
for page in doc:
    for link in page.get_links():
        if link.get('uri') != legacy:
            continue
        link['uri'] = canonical
        page.update_link(link)
        updated += 1

if updated != 1:
    raise SystemExit(f'Expected exactly one legacy URI annotation, updated {updated}')

doc.save(tmp_path, garbage=4, deflate=True, clean=True)
doc.close()
tmp_path.replace(pdf_path)
PY
```

- [ ] **Step 4: Verify annotation semantics**

```bash
python - <<'PY'
import fitz

uris = []
with fitz.open('docs/assets/documents/cv.pdf') as doc:
    for page in doc:
        uris.extend(link.get('uri') for link in page.get_links() if link.get('uri'))

assert 'https://trueruslan.ru/' in uris, uris
assert 'https://true-ruslan.github.io/trueruslan-landing/' not in uris, uris
print(uris)
PY
```

Expected: canonical URI present; legacy URI absent.

- [ ] **Step 5: Verify zero visual change**

```bash
python /home/oai/skills/pdfs/scripts/compare_renders.py \
  /tmp/trueruslan-cv-before.pdf \
  docs/assets/documents/cv.pdf \
  --out_dir /tmp/trueruslan-cv-diff \
  --dpi 200 \
  --engine pdfium
cat /tmp/trueruslan-cv-diff/summary.json
```

Expected: zero changed pages. Any pixel difference blocks the change.

- [ ] **Step 6: Run focused and repository validation**

```bash
npm test -- --test-name-pattern='canonical production site|CV contains'
npm test
npm run build:docs
npm run check:site
```

Expected: all commands pass.

- [ ] **Step 7: Commit the feature**

```bash
git add README.md docs/assets/documents/cv.pdf scripts/canonical-public-links.test.js
git commit -m "docs: publish canonical site links"
```

---

### Task 4: Review and merge the landing feature PR

**Files:**
- PR changes from Tasks 2–3 only.

**Interfaces:**
- Produces: merged canonical README/CV and green full quality evidence.

- [ ] **Step 1: Create feature PR**

Branch from the updated `master` and open a PR titled:

```text
docs: publish canonical site links
```

Include the PDF annotation verification and zero-pixel diff result in the PR body.

- [ ] **Step 2: Inspect changed files**

Expected changed files only:

```text
README.md
docs/assets/documents/cv.pdf
scripts/canonical-public-links.test.js
```

- [ ] **Step 3: Verify exact-head CI**

Expected green steps include unit tests, production build, site integrity, Chromium/Axe/Lighthouse, Firefox/WebKit, generated search, RU/EN, analytics smoke, metadata/OpenGraph, Engineering Map, visual regression and custom-domain artifact verification.

- [ ] **Step 4: Squash merge and record evidence**

Record PR number, exact feature head, CI run and squash SHA.

---

### Task 5: Publish the Vlezet portfolio link

**Files:**
- Modify: `README.md` after the product description and before the context blockquote.

**Interfaces:**
- Produces: one canonical author/portfolio link without changing project-relative documentation links.

- [ ] **Step 1: Create a branch from current `main`**

```text
docs/canonical-portfolio-link
```

- [ ] **Step 2: Add the README line**

Insert exactly:

```markdown
**Автор и инженерное портфолио:** [trueruslan.ru](https://trueruslan.ru/)
```

- [ ] **Step 3: Verify the diff mechanically**

Check that the only changed file is `README.md`, the canonical URL occurs once, and no relative links changed.

- [ ] **Step 4: Run local quality commands when a checkout is available**

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all pass. For a README-only PR, GitHub Actions remains the authoritative exact-head gate.

- [ ] **Step 5: Commit and open PR**

```bash
git add README.md
git commit -m "docs: link canonical engineering portfolio"
```

PR title:

```text
docs: link canonical engineering portfolio
```

- [ ] **Step 6: Merge after exact-head CI**

Wait for standard and browser workflows required by the repository, then squash merge. Record PR, head, workflow runs and squash SHA.

---

### Task 6: Publish the VillAIgence portfolio link

**Files:**
- Modify: `README.md` after the public-product identity paragraph and before the experimental warning.

**Interfaces:**
- Produces: one canonical author/portfolio link while preserving upstream MCA attribution and compatibility documentation.

- [ ] **Step 1: Create a branch from current `1.21.1`**

```text
docs/canonical-portfolio-link
```

- [ ] **Step 2: Add the README line**

Insert exactly:

```markdown
**Author and engineering portfolio:** [trueruslan.ru](https://trueruslan.ru/)
```

- [ ] **Step 3: Verify scope**

Expected changed file: `README.md` only. Confirm the MCA attribution section, installation guidance and compatibility identifiers are byte-for-byte unchanged outside the insertion.

- [ ] **Step 4: Run available local checks when a checkout is available**

```bash
./gradlew test
./gradlew build
```

If repository CI defines broader Fabric/NeoForge/package/security jobs, those exact-head workflows are mandatory even when local checks pass.

- [ ] **Step 5: Commit and open PR**

```bash
git add README.md
git commit -m "docs: link canonical engineering portfolio"
```

PR title:

```text
docs: link canonical engineering portfolio
```

- [ ] **Step 6: Merge after exact-head CI**

Require all available VillAIgence CI, Java PR CI and repository security checks to pass, then squash merge. Record PR, head, workflow runs and squash SHA.

---

### Task 7: Synchronize Vlezet and VillAIgence continuity docs

**Files:**
- Vlezet: `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`
- VillAIgence: `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: merged README PR evidence.
- Produces: durable history without changing each project’s selected next milestone.

- [ ] **Step 1: Create one docs-only continuity branch per repository**

Use names such as:

```text
docs/sync-canonical-portfolio-link
```

- [ ] **Step 2: Record bounded facts**

For each repository record:

- README now links to `https://trueruslan.ru/`;
- feature PR number, exact accepted head, CI runs and squash SHA;
- no runtime, architecture, product milestone or release status changed;
- the existing next milestone remains unchanged.

Do not promote the link update into a product milestone.

- [ ] **Step 3: Open and verify docs-only PRs**

Require all repository checks that run for documentation changes. Merge only after exact-head green status.

---

### Task 8: Close landing telemetry and rollout state

**Files:**
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes: Cloudflare screenshot evidence and all merged feature/continuity PR identifiers.
- Produces: final durable P2.4 operational status and next product priority.

- [ ] **Step 1: Update `PROJECT_STATE.md`**

Replace `Cloudflare provider telemetry ... OBSERVATION PENDING` with verified status and record:

```text
window: last 24 hours, GMT+3, bots excluded
visits: 7
page views: 8
page load time: 656 ms
LCP P50/P75/P90/P99: 648/744/829/829 ms
LCP observed sample: 100% Good
```

Explicitly state that this closes provider observation only and does not establish audience validation.

Record GitHub-side canonical link completion for landing README/CV, Vlezet README and VillAIgence README.

- [ ] **Step 2: Update `ROADMAP.md`**

Mark as completed:

- first Cloudflare telemetry confirmation;
- repository README/CV canonical link rollout.

Keep as manual/outstanding:

- GitHub profile Website field;
- Habr;
- Telegram;
- other external profiles.

Keep the 3–4 week aggregate observation window. Set the next development priority to the Vlezet flagship case study, followed by VillAIgence.

- [ ] **Step 3: Update `CHANGELOG.md`**

Add a new 2026-08-01 entry containing:

- Cloudflare evidence and interpretation boundary;
- all rollout PR/head/CI/merge evidence;
- PDF zero-visual-diff confirmation;
- unsupported manual external surfaces;
- no runtime/dependency/privacy/analytics-policy changes.

- [ ] **Step 4: Open a docs-only continuity PR**

PR title:

```text
docs: close canonical link rollout
```

- [ ] **Step 5: Verify exact-head full CI and merge**

Require the complete landing Build matrix to pass. Squash merge and verify current `master` has no newer unrecorded commit.

---

### Task 9: Final verification and handoff

**Files:**
- No additional repository changes unless verification finds a defect.

**Interfaces:**
- Produces: trustworthy completion report and manual-action list.

- [ ] **Step 1: Re-fetch all public files from default branches**

Verify:

```text
True-Ruslan/trueruslan-landing README.md
True-Ruslan/trueruslan-landing docs/assets/documents/cv.pdf
True-Ruslan/vlezet README.md
True-Ruslan/villAIgence README.md
```

Each intended surface must contain/open `https://trueruslan.ru/`.

- [ ] **Step 2: Verify repository state**

Check open PRs, latest commits and exact-head CI in all three repositories. No rollout PR may remain open accidentally.

- [ ] **Step 3: Report unsupported manual work accurately**

Final manual list:

```text
GitHub profile Website field
Habr profile/articles
Telegram profile/channel descriptions
other professional profiles actually used
```

- [ ] **Step 4: State the next product step**

The rollout ends infrastructure/distribution preparation. The next development item remains the Vlezet flagship case study, not another hosting or analytics change.
