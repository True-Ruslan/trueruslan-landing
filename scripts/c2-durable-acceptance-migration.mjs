import fs from 'node:fs';

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  const first = source.indexOf(before);
  if (first === -1) throw new Error(`${file}: migration anchor missing`);
  if (source.indexOf(before, first + before.length) !== -1) throw new Error(`${file}: migration anchor duplicated`);
  fs.writeFileSync(file, source.replace(before, after));
}

const stateBlock = `### C2 — Homepage clarity — PRODUCTION ACCEPTED

The second runtime slice of **Portfolio Clarity & Scanability** is production-accepted. RU/EN homepage presentation now follows the fast-scan hierarchy **Hero → Proof → Selected work → Experience → Writing → Work with me → Personal** while canonical project/evidence truth, no-JavaScript behavior, generated search, privacy and SEO ownership remain unchanged.

- feature PR #183 squash: \`5fe5c6e15a61e54edd39e94140c7554ba19c5203\`;
- final verifier PR #184 squash / deployed SHA: \`361543c383b394d1f4cb061a97473038972340cf\`;
- verifier exact-head Build #1633 / \`31341749976\` — SUCCESS;
- final Pages #211 / \`31342012579\` — SUCCESS;
- Pages deployment \`5823994260\` — success;
- Pages artifact \`9046113610\`, digest \`sha256:c1d3dfec2f2c171ad4d224c04bb4765ef2d7d5099e2feacb6ee3bab35cb88ea1\`;
- deployment-triggered Production Live #471 / \`31342042518\` — SUCCESS;
- production artifact \`9046144255\`, digest \`sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6\`;
- production homepage acceptance: RU/EN \`proofFacts=4\`, \`selectedProjects=3\`, \`primaryNavigationItems=5\`.

The first C2 deployment was product-correct but Production Live #467 exposed a stale C1-only Work with me verifier. PR #184 corrected only that verification contract; final acceptance is therefore tied to exact deployed SHA \`361543c383b394d1f4cb061a97473038972340cf\` and deployment \`5823994260\`.

Durable ledger: \`docs/acceptance/2026-08-10-portfolio-clarity-c2.md\`. C2 does not start, reset or close P3.6 Measurement.

Next redesign slice: **C3 — Projects and flagship summary layer**.

`;

replaceOnce(
  'docs/PROJECT_STATE.md',
  '> Последнее смысловое обновление: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement остаётся открытым.',
  '> Последнее смысловое обновление: **2026-08-10**, после exact-production acceptance C2 — Homepage clarity; P3.6 measurement остаётся открытым.',
);
replaceOnce(
  'docs/PROJECT_STATE.md',
  'The durable acceptance ledger is `docs/acceptance/2026-08-09-portfolio-clarity-c1.md`. This is an isolated foundation slice, not the final redesign measurement baseline: **P3.6 — Measurement checkpoint — NEXT / WAITING** remains unchanged until the full accepted redesign and its new observation window exist.\n\n## 3. External project evidence boundaries',
  `The durable acceptance ledger is \`docs/acceptance/2026-08-09-portfolio-clarity-c1.md\`. This is an isolated foundation slice, not the final redesign measurement baseline: **P3.6 — Measurement checkpoint — NEXT / WAITING** remains unchanged until the full accepted redesign and its new observation window exist.\n\n${stateBlock}## 3. External project evidence boundaries`,
);
replaceOnce(
  'docs/PROJECT_STATE.md',
  'Continue with:\n\n**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**',
  'Continue with:\n\n**C3 — Projects and flagship summary layer — NEXT IMPLEMENTATION SLICE.**\n\nP3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** in parallel; it is not closed or reset by C2/C3 presentation work.',
);

const roadmapBlock = `### C2 — Homepage clarity — PRODUCTION ACCEPTED

Accepted production hierarchy: **Hero → Proof → Selected work → Experience → Writing → Work with me → Personal**. The first exact deployment exposed only a stale C1 production-verifier assumption; PR #184 corrected that verifier without weakening product gates.

- feature PR #183 squash: \`5fe5c6e15a61e54edd39e94140c7554ba19c5203\`;
- final accepted / deployed SHA: \`361543c383b394d1f4cb061a97473038972340cf\`;
- verifier exact-head Build #1633 / \`31341749976\` — SUCCESS;
- Pages #211 / \`31342012579\` — SUCCESS;
- Pages deployment \`5823994260\` — success;
- deployment-triggered Production Live #471 / \`31342042518\` — SUCCESS;
- production artifact digest: \`sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6\`.

C2 keeps exactly four proof facts, three selected projects and five semantic primary-navigation destinations in RU/EN. It does not start/reset/close P3.6.

Next redesign slice: **C3 — Projects and flagship summary layer**. Implement Selected work → Commercial work → Labs & experiments, concise project cards, a shared flagship At a glance layer, progressive disclosure and current-state reconciliation without lifecycle promotion.
`;

replaceOnce(
  'docs/ROADMAP.md',
  '> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement ожидает внешние aggregate observations.',
  '> Обновлено: **2026-08-10**, после exact-production acceptance C2 — Homepage clarity; C3 — Projects and flagship summary layer является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.',
);
replaceOnce(
  'docs/ROADMAP.md',
  'Next redesign slice: **C2 — Homepage structure**. C1 does not start/reset/close P3.6; the final accepted redesign remains the new presentation-baseline boundary.\n\n## P3.6 — Measurement checkpoint — NEXT / WAITING',
  `${roadmapBlock}\n## P3.6 — Measurement checkpoint — NEXT / WAITING`,
);

const changelogBlock = `## 2026-08-10 — C2 Homepage clarity — PRODUCTION ACCEPTED

- Implemented the approved C2 fast-scan homepage hierarchy in RU/EN: **Hero → Proof → Selected work → Experience → Writing → Work with me → Personal**.
- Replaced first-scan Layer-3 evidence density with four concise professional proof facts and kept the spotlight to three selected projects.
- Kept exactly five semantic primary-navigation destinations; Contacts remains secondary and directly reachable.
- Preserved canonical registries, no-JavaScript content, generated search, canonical clean routes, privacy/Metrica and SEO contracts.
- Feature PR #183 squash: \`5fe5c6e15a61e54edd39e94140c7554ba19c5203\`; exact-head Build #1631 / \`31341099744\` — SUCCESS, 636 tests and all 31 quality stages.
- First C2 Pages #210 / \`31341477318\` deployed successfully, but deployment-triggered Production Live #467 / \`31341502294\` failed only because the Work with me production verifier still required removed C1 homepage cards.
- PR #184 corrected that verifier with RED-first coverage; exact-head Build #1633 / \`31341749976\`, CodeQL #1167 and Dependency Review #1061 — SUCCESS.
- Final accepted / deployed SHA: \`361543c383b394d1f4cb061a97473038972340cf\`.
- Final Pages #211 / \`31342012579\` — SUCCESS; deployment \`5823994260\`; Pages artifact \`9046113610\`, digest \`sha256:c1d3dfec2f2c171ad4d224c04bb4765ef2d7d5099e2feacb6ee3bab35cb88ea1\`.
- Deployment-triggered Production Live #471 / \`31342042518\` — SUCCESS; artifact \`9046144255\`, digest \`sha256:7ebdb095887ab210df33f0a743ee1af371c23dd2939f9151a7b500341b2dbce6\`.
- Exact production Work with me/C2 evidence reports RU/EN \`proofFacts=4\`, \`selectedProjects=3\`, \`primaryNavigationItems=5\`, with no product-side browser errors on that surface.

C2 remains an intermediate redesign slice and does not start, reset or close P3.6 Measurement. Next implementation slice: **C3 — Projects and flagship summary layer**.

`;

replaceOnce(
  'docs/CHANGELOG.md',
  '> Обновлено: **2026-08-09**, после exact-production acceptance Work with me / private practice; P3.6 measurement остаётся открытым.',
  '> Обновлено: **2026-08-10**, после exact-production acceptance C2 — Homepage clarity; P3.6 measurement остаётся открытым.',
);
replaceOnce(
  'docs/CHANGELOG.md',
  '## 2026-08-09 — C1 Presentation foundation — PRODUCTION ACCEPTED',
  `${changelogBlock}## 2026-08-09 — C1 Presentation foundation — PRODUCTION ACCEPTED`,
);

for (const temporary of [
  'scripts/c2-durable-acceptance-migration.mjs',
  '.github/workflows/c2-durable-acceptance-migration.yml',
]) {
  fs.rmSync(temporary, {force: true});
}
