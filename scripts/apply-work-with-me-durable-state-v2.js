import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHA = '433ee076f3f90dfe14feea97f59ad84bca0c337a';
const PAGES = '31285875710';
const DEPLOYMENT = '5814010976';
const PROD = '31285898990';
const PROD_DIGEST = 'sha256:e01e5baf0675d826334b2d75dd865e66833eaf2f804181a2061f7389b3505577';

const evidence = `\`\`\`text
feature PR:                       #171 — MERGED
accepted squash / deployed SHA:  ${SHA}
exact-head Build:                 #1427 / 31285618671 — SUCCESS
quality artifact:                 9029759379
quality digest:                   sha256:cc321f83f41539df0e256fcb23c5d28801d5f70093ab79b97bca594796a28987
CodeQL:                          #949 / 31285618637 — SUCCESS
Dependency Review:               #855 / 31285618645 — SUCCESS
Pages:                           #199 / ${PAGES} — SUCCESS
Pages deployment ID:             ${DEPLOYMENT}
Pages artifact:                  9029779285
Pages artifact digest:           sha256:a22a8436e963650ddb89a22e2d6914b449575933a2a4b3a1618561503e469a86
Production Live Smoke:           #350 / ${PROD} — SUCCESS
Work with me production smoke:   PASS
production artifact:             9029804820
production digest:               ${PROD_DIGEST}
observedAt:                      2026-08-09T00:20:13.227Z
\`\`\``;

const stateBlock = `### Work with me / private practice — PRODUCTION ACCEPTED

PR #171 publishes bounded RU/EN collaboration routes from one fail-closed \`data/collaboration.json\`. Engineering remains primary, Teaching & Mentoring a full secondary line, homepage retains exactly three primary paths, Contacts derives the same direct handoff, and contextual CTA stays exact-allowlist only. No form, CRM, booking, payments, public price list, lead database or conversion tracking was added.

Acceptance caught and fixed an incomplete semantic no-JavaScript Diplodoc artifact, inspected mobile fallback presentation, and a CodeQL TOCTOU finding reproduced by a dedicated RED contract before direct-read + fail-closed \`ENOENT\` remediation.

${evidence}

Accepted only on exact deployed SHA \`${SHA}\` and deployment-triggered Production Live #350. The later durable-docs deployment is not replacement product evidence. P3.6 measurement remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**.

`;

const roadmapBlock = `### Work with me / private practice — PRODUCTION ACCEPTED

Accepted routes: \`/landing/work-with-me/\` and \`/en/work-with-me/\`. One canonical collaboration model owns mutable availability/contact/policy truth; static/no-JS content, Contacts, homepage bridge, generated search, Chromium/Firefox/WebKit, accessibility, visual and exact-deployment production gates are accepted without adding a lead runtime.

${evidence}

This capability is independent of P3.6. **P3.6 remains NEXT / WAITING** for real equal-duration operator-observed aggregate evidence and human review.

`;

const changelogBlock = `## 2026-08-09 — Work with me / private practice — PRODUCTION ACCEPTED

PR #171 implemented the approved evidence-led private-practice design from PR #170: RU/EN Work with me routes, one canonical collaboration model, restrained homepage bridge, canonical Contacts handoff and exact contextual CTA allowlist, with no form/CRM/booking/payments/public pricing/lead tracking runtime.

Dedicated browser acceptance exposed incomplete no-JavaScript Diplodoc output; manual screenshot review then removed empty hydration-root space and duplicate anchor labels. Final Advanced Security review exposed a postprocessor TOCTOU race; Build #1426 reproduced it before direct-read + fail-closed \`ENOENT\` remediation.

${evidence}

Production verification passed RU/EN rendered and no-JavaScript pages, canonical availability/contact truth, homepage ordering, Contacts, 7 allowed versus 5 forbidden contextual surfaces, generated search and first-party diagnostics. P3.6 remains open / NEXT / WAITING.

`;

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(ROOT, p), v, 'utf8');

function header(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`${label}: update header not found`);
  return source.replace(pattern, replacement);
}

function before(source, marker, block, label) {
  if (source.includes(SHA)) return source;
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`${label}: marker not found`);
  return `${source.slice(0, index)}${block}${source.slice(index)}`;
}

let state = read('docs/PROJECT_STATE.md');
state = header(state, /> Последнее смысловое обновление: \*\*2026-08-08\*\*[^\n]*/, '> Последнее смысловое обновление: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement остаётся открытым.', 'PROJECT_STATE');
state = before(state, '**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**', stateBlock, 'PROJECT_STATE');
write('docs/PROJECT_STATE.md', state);

let roadmap = read('docs/ROADMAP.md');
roadmap = header(roadmap, /> Обновлено: \*\*2026-08-08\*\*[^\n]*/, '> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement ожидает внешние aggregate observations.', 'ROADMAP');
roadmap = before(roadmap, '## P3.6 — Measurement checkpoint — NEXT / WAITING', roadmapBlock, 'ROADMAP');
write('docs/ROADMAP.md', roadmap);

let changelog = read('docs/CHANGELOG.md');
changelog = header(changelog, /> Обновлено: \*\*2026-08-08\*\*[^\n]*/, '> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement остаётся открытым.', 'CHANGELOG');
if (!changelog.includes(SHA)) {
  const firstSection = changelog.indexOf('\n## ');
  if (firstSection < 0) throw new Error('CHANGELOG: first dated section not found');
  changelog = `${changelog.slice(0, firstSection + 1)}${changelogBlock}${changelog.slice(firstSection + 1)}`;
}
write('docs/CHANGELOG.md', changelog);

for (const p of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
  const s = read(p);
  for (const token of [SHA, PAGES, DEPLOYMENT, PROD, PROD_DIGEST]) {
    if (!s.includes(token)) throw new Error(`${p}: missing ${token}`);
  }
}
console.log('Durable Work with me acceptance applied exactly.');
