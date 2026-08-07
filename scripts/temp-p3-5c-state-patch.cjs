const fs = require('node:fs');

function replaceExactly(file, from, to) {
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${file}: expected exactly one anchor, got ${count}`);
  fs.writeFileSync(file, source.replace(from, to), 'utf8');
}

const SHA = 'f189d100785f0aea363df306fb7a923c06ee61a2';
const PAGES_RUN = '31180427543';
const DEPLOYMENT = '5794904843';
const PAGES_ARTIFACT = '8994536006';
const PAGES_DIGEST = 'sha256:847a0705f2ce1896a2046abdfec428b4c4ef43cf39270f62fb675b3e785468b1';
const PROD_RUN = '31180478038';
const PROD_ARTIFACT = '8994603193';
const PROD_DIGEST = 'sha256:f7eedbffc29f7f8ed322cf14d654ad19f0cc35fca3e53aa1bcd64000ca652d80';
const QUALITY_ARTIFACT = '8994422472';
const QUALITY_DIGEST = 'sha256:60ccfc9a37515a6a78bea2b8876e05e3119581d72b90ab4a1a8d2954a3da26d0';

// PROJECT_STATE
replaceExactly(
  'docs/PROJECT_STATE.md',
  '> Последнее смысловое обновление: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5B English /now.',
  '> Последнее смысловое обновление: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5C English Publications.',
);
replaceExactly(
  'docs/PROJECT_STATE.md',
  '**P3.5B — English /now**.\n\nProduction route:\n\n```text\n/en/now/\n```',
  '**P3.5C — English Publications**.\n\nProduction route:\n\n```text\n/en/publications/\n```',
);
replaceExactly(
  'docs/PROJECT_STATE.md',
  `P3.5B is accepted only on exact deployed SHA \`96ea3ec5de18d99a811405b36a5b60066d9c374c\`; PR #150 repository/build success and the earlier failed production-verifier run are not treated as equivalent production acceptance.\n\n---`,
  `P3.5B is accepted only on exact deployed SHA \`96ea3ec5de18d99a811405b36a5b60066d9c374c\`; PR #150 repository/build success and the earlier failed production-verifier run are not treated as equivalent production acceptance.\n\n### P3.5C exact production acceptance\n\nP3.5C publishes \`/en/publications/\` without creating a second publication registry or search owner. \`data/publications.json\` remains canonical: original publication titles, source language and Habr canonical URLs remain bibliographic identity, while English summaries and topics are bounded presentation fields in the same records. Catalogue, Featured, semantic no-JavaScript fallback and the single generated Diplodoc search are verified independently.\n\nFeature verification exposed two test-model boundaries without weakening product requirements: localization assertions were scoped to UI nodes so original Russian bibliographic titles remain valid, and the Topics label moved from sanitizer-sensitive \`aria-label\` to real screen-reader-only DOM text that survives Diplodoc output. Search acceptance uses unique registry-derived English text \`syntax overhead\` and asserts the \`/en/publications/\` route rather than depending on bounded snippet wording.\n\n\`\`\`text\nPR #153 squash / deployed SHA:  ${SHA}\nBuild:                          #1158 / 31179795922 — SUCCESS\nquality artifact:               ${QUALITY_ARTIFACT}\nquality digest:                 ${QUALITY_DIGEST}\nCodeQL:                         #663 / 31179795959 — SUCCESS\nDependency Review:              #586 / 31179796022 — SUCCESS\nDistribution Readiness:         #137 / 31179795919 — SUCCESS\nPages:                          #182 / ${PAGES_RUN} — SUCCESS\nPages deployment ID:            ${DEPLOYMENT}\nPages artifact:                 ${PAGES_ARTIFACT}\nPages artifact digest:          ${PAGES_DIGEST}\nProduction Live Smoke:          #263 / ${PROD_RUN} — SUCCESS\nP3.5C English Publications smoke: PASS\nproduction artifact:            ${PROD_ARTIFACT}\nproduction digest:              ${PROD_DIGEST}\n\`\`\`\n\nP3.5C is accepted only on exact deployed SHA \`${SHA}\`; exact-head CI without the corresponding Pages deployment identity and Production Live Smoke is not equivalent production acceptance.\n\n---`,
);

// ROADMAP
replaceExactly(
  'docs/ROADMAP.md',
  '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5B English /now.',
  '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5C English Publications.',
);
replaceExactly(
  'docs/ROADMAP.md',
  '- P3.5B English /now — PR #150/#151.',
  '- P3.5B English /now — PR #150/#151.\n- P3.5C English Publications — PR #153.',
);
replaceExactly(
  'docs/ROADMAP.md',
  `### P3.5C — English Publications — NEXT\n\nTranslate the Publications presentation as a separate bounded slice while preserving the same canonical publication registry and single generated search. Do not create a second publication-state registry or a second site-wide search owner.\n\n## P3.6 — Measurement checkpoint\n\nAfter sufficient aggregate traffic, compare aggregate traffic and clean-route indexing without making engagement claims from insufficient data.`,
  `### P3.5C — English Publications — DONE\n\nAccepted route: \`/en/publications/\`. English presentation reuses the same canonical \`data/publications.json\`; original titles, source language and Habr canonical URLs remain bibliographic identity. English summaries/topics, Catalogue, Featured and semantic no-JavaScript fallback are localized without a second publication registry or search owner. The single generated Diplodoc search is verified with registry-derived English content rather than snippet wording.\n\n\`\`\`text\nPR #153 squash / deployed SHA:  ${SHA}\nBuild:                          #1158 / 31179795922 — SUCCESS\nquality artifact:               ${QUALITY_ARTIFACT}\nquality digest:                 ${QUALITY_DIGEST}\nPages:                          #182 / ${PAGES_RUN} — SUCCESS\nPages deployment ID:            ${DEPLOYMENT}\nPages artifact:                 ${PAGES_ARTIFACT}\nPages artifact digest:          ${PAGES_DIGEST}\nProduction Live Smoke:          #263 / ${PROD_RUN} — SUCCESS\nP3.5C English Publications smoke: PASS\nproduction artifact:            ${PROD_ARTIFACT}\nproduction digest:              ${PROD_DIGEST}\n\`\`\`\n\n## P3.6 — Measurement checkpoint — NEXT\n\nAfter sufficient aggregate traffic, compare aggregate traffic and clean-route indexing without making engagement claims from insufficient data. P3.6 is an observation checkpoint, not permission to infer engagement or product impact from an insufficient sample.`,
);
replaceExactly(
  'docs/ROADMAP.md',
  'Continue with **P3.5C — English Publications**.',
  `Confirm P3.5C exact production acceptance for SHA \`${SHA}\`, Pages run \`${PAGES_RUN}\`, deployment \`${DEPLOYMENT}\` and Production Live run \`${PROD_RUN}\`. Continue with **P3.6 — Measurement checkpoint**, but do not infer engagement until sufficient aggregate traffic exists.`,
);

// Portfolio 1.0 spec
replaceExactly(
  'docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md',
  '> Status: **IN PROGRESS — P3.5B ACCEPTED IN PRODUCTION**',
  '> Status: **IN PROGRESS — P3.5C ACCEPTED IN PRODUCTION**',
);
replaceExactly(
  'docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md',
  `### P3.5C — English Publications — NEXT\n\nLocalize the Publications presentation over the existing canonical publication registry. Preserve original publication identities and external canonical URLs, one generated site-wide search and the existing Notes-only Atom feed. Do not create a second publication registry, English-only lifecycle state or a second search index.\n\n\n---`,
  `### P3.5C — English Publications — DONE\n\nControlled route \`/en/publications/\` localizes presentation over the existing canonical publication registry. Original publication titles, source language and external canonical URLs remain bibliographic identity; English summaries/topics remain bounded presentation fields in the same records. One generated site-wide search remains authoritative, and the Notes Atom feed remains Notes-only. No second publication registry, English-only lifecycle state or second search index was introduced.\n\nThe accepted accessibility contract uses real screen-reader-only Topics text instead of relying on an \`aria-label\` that Diplodoc may sanitize in prebuilt Catalogue state. Search acceptance uses unique registry-derived English content and verifies the English Publications route without treating snippet formatting as product truth.\n\n\`\`\`text\nPR #153 squash / deployed SHA:  ${SHA}\nBuild:                          #1158 / 31179795922 — SUCCESS\nquality artifact:               ${QUALITY_ARTIFACT}\nquality digest:                 ${QUALITY_DIGEST}\nPages:                          #182 / ${PAGES_RUN} — SUCCESS\nPages deployment ID:            ${DEPLOYMENT}\nPages artifact:                 ${PAGES_ARTIFACT}\nPages artifact digest:          ${PAGES_DIGEST}\nProduction Live Smoke:          #263 / ${PROD_RUN} — SUCCESS\nP3.5C English Publications smoke: PASS\nproduction artifact:            ${PROD_ARTIFACT}\nproduction digest:              ${PROD_DIGEST}\n\`\`\`\n\n### P3.6 — Measurement checkpoint — NEXT\n\nMeasurement remains bounded by sufficient aggregate traffic. Until that evidence exists, no engagement or product-impact conclusion is promoted from sparse analytics.\n\n---`,
);

// CHANGELOG
replaceExactly(
  'docs/CHANGELOG.md',
  '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5B English /now.',
  '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5C English Publications.',
);
replaceExactly(
  'docs/CHANGELOG.md',
  '## 2026-08-07 — P3.5B English /now',
  `## 2026-08-07 — P3.5C English Publications\n\nPR #153 published \`/en/publications/\` as a controlled English catalogue over the same canonical \`data/publications.json\`. Original Russian publication titles, source language and canonical Habr URLs remain bibliographic identity; English summaries/topics are presentation fields in the same records. No second publication registry, second site-wide search index or English-only publication state was introduced.\n\nVerification found and corrected two model mismatches without weakening acceptance. First, broad Russian-copy checks could match substrings inside legitimate original titles, so localization assertions were scoped to actual UI nodes. Second, Diplodoc sanitized \`aria-label\` from prebuilt Catalogue state, so the Topics semantic label was moved to real screen-reader-only DOM text. Generated-search acceptance now queries unique registry-derived English content (\`syntax overhead\`) and requires the \`/en/publications/\` result rather than assuming a specific bounded snippet.\n\n\`\`\`text\nPR #153 squash / deployed SHA:  ${SHA}\nBuild:                          #1158 / 31179795922 — SUCCESS\nquality artifact:               ${QUALITY_ARTIFACT}\nquality digest:                 ${QUALITY_DIGEST}\nCodeQL:                         #663 / 31179795959 — SUCCESS\nDependency Review:              #586 / 31179796022 — SUCCESS\nDistribution Readiness:         #137 / 31179795919 — SUCCESS\nPages:                          #182 / ${PAGES_RUN} — SUCCESS\nPages deployment ID:            ${DEPLOYMENT}\nPages artifact:                 ${PAGES_ARTIFACT}\nPages artifact digest:          ${PAGES_DIGEST}\nProduction Live Smoke:          #263 / ${PROD_RUN} — SUCCESS\nP3.5C English Publications smoke: PASS\nproduction artifact:            ${PROD_ARTIFACT}\nproduction digest:              ${PROD_DIGEST}\n\`\`\`\n\nNext bounded checkpoint: **P3.6 — Measurement checkpoint — NEXT**, only after sufficient aggregate traffic.\n\n## 2026-08-07 — P3.5B English /now`,
);

console.log('P3.5C durable state patched successfully.');
