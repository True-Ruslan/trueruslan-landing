import fs from 'node:fs';

const ACCEPTED_SHA = '96ea3ec5de18d99a811405b36a5b60066d9c374c';
const EVIDENCE = `\`\`\`text
PR #150 feature squash:         b0b041968b955ed619cbfe560640dde1244833de
PR #151 final squash/deployed:  ${ACCEPTED_SHA}
feature Build:                  #1105 / 31158466856 — SUCCESS
feature quality artifact:       8986214202
feature quality digest:         sha256:e89e69f84cdcc00bc6b0656caee9e2282211eb3fba57c1e1b46b64cece1861eb
correction Build:               #1107 / 31159529244 — SUCCESS
correction quality artifact:    8986592511
correction quality digest:      sha256:e519aa06bca1d2a9c1a581c9504daef0b4933f21bfc6596a19299bae137af0bf
Pages:                          #180 / 31161876484 — SUCCESS
Pages deployment ID:            5791352097
Pages artifact:                 8987394027
Pages artifact digest:          sha256:7c456d8e8f534bed6c2f2c410f615004c7d2dff37b71fe0ea7709cfb7129f999
Production Live Smoke:          #230 / 31161925498 — SUCCESS
P3.5B English Now smoke:        PASS
production artifact:            8987452957
production digest:              sha256:2fe174a95fca6daa28d261f281576597d6d383d432a7a0cc32f9cdbb231d08b5
\`\`\``;

function patchFile(file, replacements) {
  let text = fs.readFileSync(file, 'utf8');
  for (const [label, from, to] of replacements) {
    const first = text.indexOf(from);
    if (first < 0) throw new Error(`${file}: missing anchor ${label}`);
    if (text.indexOf(from, first + from.length) >= 0) throw new Error(`${file}: ambiguous anchor ${label}`);
    text = text.slice(0, first) + to + text.slice(first + from.length);
  }
  fs.writeFileSync(file, text, 'utf8');
}

patchFile('docs/ROADMAP.md', [
  ['header', '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5A English Vlezet flagship.', '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5B English /now.'],
  ['completed milestone', '- P3.5A English Vlezet flagship — PR #148.', '- P3.5A English Vlezet flagship — PR #148.\n- P3.5B English /now — PR #150/#151.'],
  ['P3.5 slices', `### P3.5B — English /now — NEXT

Add a controlled English \`/now\` surface from the same canonical now-data contract. Keep one updated date, one evidence boundary and one build/search architecture; do not create \`now-en.json\` or a second current-state model.

### P3.5C — English Publications — PLANNED

Translate the Publications presentation as a separate bounded slice while preserving the same publication registry and single generated search.`, `### P3.5B — English /now — DONE

Accepted route: \`/en/now/\`. English editorial presentation derives from the same canonical \`data/now.json\`, keeps one shared \`updated\` date, and reuses Project Registry cards, the same generated search, canonical RU/EN pairing, metadata/OpenGraph and semantic no-JavaScript fallback. No \`now-en.json\` or second current-state model exists.

The first exact deployment after PR #150 exposed a verifier false negative rather than a product defect: the deployed page used Diplodoc \`<base href="../../">\` with valid relative project links. PR #151 corrected the production verifier to resolve raw hrefs through \`document.baseURI\` before exact canonical comparison; no product behavior was weakened or changed.

${EVIDENCE}

### P3.5C — English Publications — NEXT

Translate the Publications presentation as a separate bounded slice while preserving the same canonical publication registry and single generated search. Do not create a second publication-state registry or a second site-wide search owner.`],
  ['new session', 'Confirm P3.5A exact production acceptance for SHA `17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87`, Pages run `31155442788`, deployment `5790177102` and Production Live run `31155442779`. Continue with **P3.5B — English /now**.', `Confirm P3.5A exact production acceptance for SHA \`17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87\`, Pages run \`31155442788\`, deployment \`5790177102\` and Production Live run \`31155442779\`. Confirm P3.5B exact production acceptance for SHA \`${ACCEPTED_SHA}\`, Pages run \`31161876484\`, deployment \`5791352097\` and Production Live run \`31161925498\`. Continue with **P3.5C — English Publications**.`],
]);

patchFile('docs/PROJECT_STATE.md', [
  ['header', '> Последнее смысловое обновление: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5A English Vlezet flagship.', '> Последнее смысловое обновление: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5B English /now.'],
  ['latest milestone', `**P3.5A — English Vlezet flagship**.

Production route:

\`\`\`text
/en/projects/vlezet/
\`\`\``, `**P3.5B — English /now**.

Production route:

\`\`\`text
/en/now/
\`\`\``],
  ['P3.5B acceptance', 'GitHub Advanced Security TOCTOU finding in Project Evidence file reads was reproduced with a RED contract, fixed by direct reads plus fail-closed `ENOENT` handling, and automatically resolved by the subsequent CodeQL scan. P3.5A is accepted only on the exact deployed squash SHA above.\n\n---', `GitHub Advanced Security TOCTOU finding in Project Evidence file reads was reproduced with a RED contract, fixed by direct reads plus fail-closed \`ENOENT\` handling, and automatically resolved by the subsequent CodeQL scan. P3.5A is accepted only on the exact deployed squash SHA above.

### P3.5B exact production acceptance

P3.5B publishes \`/en/now/\` without creating a second current-state source of truth. RU and EN editorial slices share one canonical \`data/now.json\` and one \`updated\` date; active project identity, lifecycle labels and links remain derived from Project Registry; one generated Diplodoc search remains the site-wide search owner. Canonical/hreflang, metadata/OpenGraph, mobile/accessibility and semantic no-JavaScript behavior are verified separately.

The first exact deployment of PR #150 was product-correct but exposed a production-verifier false negative caused by comparing a raw relative project href without applying the document base URI. The exact Pages artifact showed \`<base href="../../">\` plus valid relative links. PR #151 changed only the verifier and its regression contract: raw hrefs are now resolved through \`document.baseURI\` and compared to exact canonical EN routes.

${EVIDENCE}

P3.5B is accepted only on exact deployed SHA \`${ACCEPTED_SHA}\`; PR #150 repository/build success and the earlier failed production-verifier run are not treated as equivalent production acceptance.

---`],
  ['next', `Portfolio 1.0 remains **IN PROGRESS**.

Continue with:

**P3.5B — English /now — NEXT**.

P3.5A уже закрыл третий flagship: \`/en/projects/vlezet/\`. Следующий bounded этап переводит \`/now\` из того же canonical data contract без отдельного English state registry. После него P3.5C отдельно покрывает Publications. Draft или непроверенные external-project claims не продвигаются.`, `Portfolio 1.0 remains **IN PROGRESS**.

Continue with:

**P3.5C — English Publications — NEXT**.

P3.5B уже публикует \`/en/now/\` из того же canonical now-data contract без второго English state registry. Следующий bounded этап локализует Publications presentation поверх существующего publication registry и одного generated search. Draft или непроверенные external-project claims не продвигаются.`],
]);

patchFile('docs/CHANGELOG.md', [
  ['header', '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5A English Vlezet flagship.', '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5B English /now.'],
  ['entry', '## 2026-08-07 — P3.5A English Vlezet flagship', `## 2026-08-07 — P3.5B English /now

PR #150 published the controlled English current-work route \`/en/now/\` from the same canonical \`data/now.json\`: one shared update date, localized presentation, Project Registry-derived cards, RU/EN canonical pairing, metadata/OpenGraph, generated search and semantic no-JavaScript fallback. No \`now-en.json\` or second current-state model was introduced.

The first exact deployment was healthy, but the new P3.5B production verifier failed because it inspected raw relative project hrefs without applying Diplodoc's \`<base href="../../">\`. The exact Pages artifact proved the page itself resolved correctly in browsers. PR #151 added a RED regression and corrected the verifier to resolve hrefs through \`document.baseURI\` before exact canonical comparison; product code and content did not need a corrective change.

${EVIDENCE}

Next bounded slice: **P3.5C — English Publications — NEXT**.

## 2026-08-07 — P3.5A English Vlezet flagship`],
]);

patchFile('docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md', [
  ['status', '> Status: **IN PROGRESS — P3.5A ACCEPTED IN PRODUCTION**', '> Status: **IN PROGRESS — P3.5B ACCEPTED IN PRODUCTION**'],
  ['P3.5B', `### P3.5B — English /now — NEXT

Publish English current-work context from the same canonical \`now\` data contract. Preserve one updated date, one acceptance boundary and one build/search architecture. P3.5C Publications remains a separate later slice.`, `### P3.5B — English /now — DONE

Controlled route \`/en/now/\` reuses the canonical \`data/now.json\`, one shared \`updated\` date, Project Registry-derived active cards and the single generated Diplodoc search. English presentation, metadata/hreflang, mobile/accessibility and semantic no-JavaScript fallback are localized without a second current-state registry.

The first exact deployment of PR #150 exposed a verifier false negative: valid relative project links were interpreted without the document \`<base>\`. PR #151 corrected only the verifier by resolving hrefs through \`document.baseURI\` and comparing exact canonical EN routes. Final acceptance therefore uses the corrected verifier on the later exact deployed squash SHA.

${EVIDENCE}

### P3.5C — English Publications — NEXT

Localize the Publications presentation over the existing canonical publication registry. Preserve original publication identities and external canonical URLs, one generated site-wide search and the existing Notes-only Atom feed. Do not create a second publication registry, English-only lifecycle state or a second search index.`],
]);

for (const file of [
  'docs/ROADMAP.md',
  'docs/PROJECT_STATE.md',
  'docs/CHANGELOG.md',
  'docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md',
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const required of [ACCEPTED_SHA, '31161876484', '5791352097', '31161925498']) {
    if (!text.includes(required)) throw new Error(`${file}: missing required P3.5B evidence ${required}`);
  }
}

fs.rmSync('scripts/_p3-5b-durable-closure-patch.mjs');
fs.rmSync('.github/workflows/_p3-5b-durable-closure-patch.yml');
