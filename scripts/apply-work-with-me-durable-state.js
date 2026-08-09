import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ACCEPTED_SHA = '433ee076f3f90dfe14feea97f59ad84bca0c337a';

const evidence = `\`\`\`text
feature PR:                       #171 — MERGED
accepted squash / deployed SHA:  ${ACCEPTED_SHA}
exact-head Build:                 #1427 / 31285618671 — SUCCESS
quality artifact:                 9029759379
quality digest:                   sha256:cc321f83f41539df0e256fcb23c5d28801d5f70093ab79b97bca594796a28987
CodeQL:                          #949 / 31285618637 — SUCCESS
Dependency Review:               #855 / 31285618645 — SUCCESS
Pages:                           #199 / 31285875710 — SUCCESS
Pages deployment ID:             5814010976
Pages artifact:                  9029779285
Pages artifact digest:           sha256:a22a8436e963650ddb89a22e2d6914b449575933a2a4b3a1618561503e469a86
Production Live Smoke:           #350 / 31285898990 — SUCCESS
Work with me production smoke:   PASS
production artifact:             9029804820
production digest:               sha256:e01e5baf0675d826334b2d75dd865e66833eaf2f804181a2061f7389b3505577
observedAt:                      2026-08-09T00:20:13.227Z
\`\`\``;

const stateBlock = `### Work with me / private practice — PRODUCTION ACCEPTED

PR #171 publishes a bounded RU/EN collaboration capability at \`/landing/work-with-me/\` and \`/en/work-with-me/\` without changing TrueLanding into a generic freelancer catalogue. One fail-closed \`data/collaboration.json\` owns reusable availability, direct contacts, pricing/legal policy and the curated contextual CTA allowlist. Core content remains static/no-JavaScript; homepage keeps exactly three primary paths; Contacts derives the same direct handoff; no form, CRM, booking, payments, public price list, lead database or conversion tracking was added.

Acceptance required more than green source CI. Dedicated browser verification exposed and corrected an incomplete no-JavaScript Diplodoc artifact; manual screenshot review then removed empty hydration-root space and duplicate anchor labels from the semantic fallback. Final review also reproduced a CodeQL TOCTOU finding with a RED contract and fixed it through direct reads plus fail-closed \`ENOENT\` handling before the final exact-head matrix.

${evidence}

The feature is accepted only on exact deployed SHA \`${ACCEPTED_SHA}\` and Production Live #350. The later durable-docs deployment is not replacement product evidence. P3.6 measurement remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** and receives no engagement, causality or product-impact promotion from this feature.

`;

const roadmapBlock = `### Work with me / private practice — PRODUCTION ACCEPTED

Accepted routes:

\`\`\`text
/landing/work-with-me/
/en/work-with-me/
\`\`\`

One canonical collaboration model owns mutable availability/contact/policy truth. Engineering remains primary, Teaching & Mentoring a full secondary line, and direct Telegram/email handoff replaces forms/CRM/booking/public pricing. Homepage, Contacts and exactly curated contextual CTA surfaces are verified in RU/EN, semantic no-JavaScript, generated search, Chromium/Firefox/WebKit, Axe/overflow/visual and exact-deployment production gates.

${evidence}

This capability is accepted independently of P3.6. **P3.6 remains NEXT / WAITING** for real equal-duration operator-observed aggregate evidence and human review.

`;

const changelogBlock = `## 2026-08-09 — Work with me / private practice — PRODUCTION ACCEPTED

PR #171 implemented the approved evidence-led private-practice design from PR #170. It adds RU/EN Work with me routes backed by one fail-closed \`data/collaboration.json\`, a restrained homepage bridge, canonical Contacts handoff and an exact contextual CTA allowlist. There is no form, CRM, booking, payment flow, public pricing, lead database, conversion tracking, session replay or AI seller.

TDD and acceptance caught three important boundaries before merge: the initial product RED established the missing surfaces; a dedicated browser gate exposed incomplete no-JavaScript Diplodoc output; and final Advanced Security review exposed a postprocessor TOCTOU race. The no-JS artifact became a full semantic fallback with inspected mobile presentation, and the race was reproduced by Build #1426 before direct read + fail-closed \`ENOENT\` remediation.

Final feature production evidence:

${evidence}

Production Work with me verification passed RU/EN rendered and no-JavaScript pages, canonical availability/contact truth, homepage ordering and exactly three primary paths, Contacts handoff, 7 allowed versus 5 forbidden contextual surfaces, generated search and first-party runtime diagnostics. P3.6 measurement remains open / NEXT / WAITING; this feature does not imply engagement or product-impact evidence.

`;

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(ROOT, relativePath), content, 'utf8');
}

function insertOnce(source, marker, block, label) {
  if (source.includes(ACCEPTED_SHA)) return source;
  const index = source.indexOf(marker);
  if (index === -1) throw new Error(`${label}: insertion marker not found`);
  return `${source.slice(0, index)}${block}${source.slice(index)}`;
}

function updateHeader(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`${label}: update header not found`);
  return source.replace(pattern, replacement);
}

let state = read('docs/PROJECT_STATE.md');
state = updateHeader(
  state,
  /> Последнее смысловое обновление: \*\*2026-08-08\*\*[^\n]*/,
  '> Последнее смысловое обновление: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement остаётся открытым.',
  'PROJECT_STATE',
);
state = insertOnce(state, '**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**', stateBlock, 'PROJECT_STATE');
write('docs/PROJECT_STATE.md', state);

let roadmap = read('docs/ROADMAP.md');
roadmap = updateHeader(
  roadmap,
  /> Обновлено: \*\*2026-08-08\*\*[^\n]*/,
  '> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement ожидает внешние aggregate observations.',
  'ROADMAP',
);
roadmap = insertOnce(roadmap, '## P3.6 — Measurement checkpoint — NEXT / WAITING', roadmapBlock, 'ROADMAP');
write('docs/ROADMAP.md', roadmap);

let changelog = read('docs/CHANGELOG.md');
changelog = updateHeader(
  changelog,
  /> Обновлено: \*\*2026-08-08\*\*[^\n]*/,
  '> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement остаётся открытым.',
  'CHANGELOG',
);
changelog = insertOnce(changelog, '## 2026-08-08 — Homepage density, Experience, unified header and NotchHub — PRODUCTION ACCEPTED', changelogBlock, 'CHANGELOG');
write('docs/CHANGELOG.md', changelog);

for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
  const source = read(relativePath);
  if (!source.includes(ACCEPTED_SHA)) throw new Error(`${relativePath}: accepted SHA not recorded`);
  if (!source.includes('31285875710') || !source.includes('5814010976') || !source.includes('31285898990')) {
    throw new Error(`${relativePath}: exact production identity incomplete`);
  }
}

console.log('Work with me durable state applied to PROJECT_STATE, ROADMAP and CHANGELOG.');
