import fs from 'node:fs';

const files = {
  state: 'docs/PROJECT_STATE.md',
  roadmap: 'docs/ROADMAP.md',
  changelog: 'docs/CHANGELOG.md',
  acceptance: 'docs/acceptance/2026-08-10-portfolio-clarity-c3.md',
};

const PR_HEAD_SHA = 'd58e4fe53e53ab52c59d63222642c87f36aa4662';
const ACCEPTED_SHA = 'c54fd7c0e3554ffb6063fecfaa8135d02e9a6679';
const BUILD_RUN = '31385511275';
const CODEQL_RUN = '31385511279';
const DEP_REVIEW_RUN = '31385511434';
const QUALITY_ARTIFACT = '9061720498';
const QUALITY_DIGEST = 'sha256:254e5a9ffadc5327777fcd9b65a149bfc5f3b75a1d4c08d7a87fa8ddbe3e5e59';
const PAGES_RUN = '31388753309';
const DEPLOYMENT_ID = '5832077852';
const PAGES_ARTIFACT = '9062771335';
const PAGES_DIGEST = 'sha256:e1781720e49e152b8d6dcc9ee1f34e1a718116ee5cac70c091358c01b28b40ed';
const PAGES_REPORTS = '9062785516';
const PAGES_REPORTS_DIGEST = 'sha256:2b2344c7a8f5e584293285af757dce9ddaa05aec657176995c0f284791f0dbe2';
const LIVE_RUN = '31388848079';
const LIVE_ARTIFACT = '9062864420';
const PRODUCTION_DIGEST = 'sha256:413205da34291556eabae8bf4d7f46f2af04be4fc63ce9cd42d8da801730c544';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first === -1) throw new Error(`${label}: anchor not found`);
  if (source.indexOf(needle, first + needle.length) !== -1) {
    throw new Error(`${label}: anchor is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}

if (fs.existsSync(files.acceptance)) {
  throw new Error(`${files.acceptance} already exists; refusing non-idempotent migration`);
}

const evidenceBlock = `- PR #189 integrated head: \`${PR_HEAD_SHA}\`;\n- integrated exact-head Build #1686 / \`${BUILD_RUN}\` — SUCCESS;\n- CodeQL #1224 / \`${CODEQL_RUN}\` — SUCCESS;\n- Dependency Review #1114 / \`${DEP_REVIEW_RUN}\` — SUCCESS;\n- quality artifact \`${QUALITY_ARTIFACT}\`, digest \`${QUALITY_DIGEST}\`;\n- accepted squash / deployed SHA: \`${ACCEPTED_SHA}\`;\n- Pages #214 / \`${PAGES_RUN}\` — SUCCESS;\n- Pages deployment \`${DEPLOYMENT_ID}\` — success;\n- Pages artifact \`${PAGES_ARTIFACT}\`, digest \`${PAGES_DIGEST}\`;\n- Pages verification reports \`${PAGES_REPORTS}\`, digest \`${PAGES_REPORTS_DIGEST}\`;\n- deployment-triggered Production Live #478 / \`${LIVE_RUN}\` — SUCCESS;\n- production artifact \`${LIVE_ARTIFACT}\`, digest \`${PRODUCTION_DIGEST}\`.`;

const ledger = `# C3 — Projects and flagship summary layer — PRODUCTION ACCEPTED\n\n> Date: **2026-08-10**\n>\n> Initiative: **Portfolio Clarity & Scanability**\n>\n> Scope: RU/EN Projects scan hierarchy and the shared flagship summary layer for VillAIgence, NotchHub, TrueRuslan Landing and Vlezet.\n\n## Accepted identity\n\nC3 is accepted only on the exact deployed squash SHA below. PR-head CI proves repository readiness; Pages plus deployment-triggered Production Live prove the production boundary.\n\n${evidenceBlock}\n\n## Accepted product boundary\n\nThe RU/EN Projects index now follows the scan-first hierarchy **Selected work → Commercial work → Labs & experiments**. Selected work contains exactly VillAIgence, NotchHub and TrueRuslan Landing. MarketDB is presented as bounded public-safe commercial work. Vlezet remains directly reachable in the labs layer rather than returning to the spotlight, and NODE ZERO retains its explicit private/proprietary boundary.\n\nVillAIgence, NotchHub, TrueRuslan Landing and Vlezet each expose one shared RU/EN \`Коротко / At a glance\` summary before deep evidence. The summary has five fields — contribution, stack, challenge, result/current accepted state and registry-derived project status. Exact SHA/run evidence remains in the evidence/deep-dive layer and project lifecycle is not promoted by presentation.\n\nThe Projects desktop/mobile baselines were explicitly reviewed as intentionally shorter scan-first layouts. Global visual thresholds were not increased. Photo Stories test synchronization waits for active reveal transitions before Axe without changing runtime presentation.\n\n## Evidence and security boundary\n\nC3 inherited the remediated dependency base from PR #188: no high or critical audit finding was introduced by C3. The existing markdown-it moderate upstream boundary remains tracked separately under issue #82. Canonical registries remain the owners of volatile project status/current-state truth, and the single Diplodoc generated search remains the site-wide full-text search owner.\n\n## Measurement boundary\n\nC3 does not start, reset or close P3.6 Measurement. It establishes another accepted presentation slice but does not claim that engagement, conversion, SEO or causal product impact improved. P3.6 remains **NEXT / WAITING** for the final redesign baseline and real operator-observed aggregate evidence with human review.\n\n## Next implementation slice\n\nThe next approved slice is **C4 — Professional surfaces**:\n\n- Experience;\n- Work with me;\n- About;\n- Now;\n- Contacts.\n\nC4 keeps the same static-first, no-JavaScript, registry, privacy, SEO, accessibility and exact-production acceptance boundaries.\n`;

write(files.acceptance, ledger);

let state = read(files.state);
state = replaceOnce(
  state,
  '> Последнее смысловое обновление: **2026-08-10**, после exact-production acceptance C2 — Homepage clarity; P3.6 measurement остаётся открытым.',
  '> Последнее смысловое обновление: **2026-08-10**, после exact-production acceptance C3 — Projects and flagship summary layer; P3.6 measurement остаётся открытым.',
  'PROJECT_STATE header',
);
state = replaceOnce(
  state,
  'Next redesign slice: **C3 — Projects and flagship summary layer**.',
  `### C3 — Projects and flagship summary layer — PRODUCTION ACCEPTED\n\nThe third runtime slice of **Portfolio Clarity & Scanability** is production-accepted. RU/EN Projects now use **Selected work → Commercial work → Labs & experiments**, while the four public flagships — VillAIgence, NotchHub, TrueRuslan Landing and Vlezet — expose one shared five-field \`Коротко / At a glance\` layer before deep evidence. Canonical registries continue to own volatile project status and evidence truth.\n\n${evidenceBlock}\n\nDurable ledger: \`${files.acceptance}\`. C3 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.\n\nNext redesign slice: **C4 — Professional surfaces**.`,
  'PROJECT_STATE C3 insertion',
);
state = replaceOnce(
  state,
  '**C3 — Projects and flagship summary layer — NEXT IMPLEMENTATION SLICE.**',
  '**C4 — Professional surfaces — NEXT IMPLEMENTATION SLICE.**',
  'PROJECT_STATE next slice',
);
write(files.state, state);

let roadmap = read(files.roadmap);
roadmap = replaceOnce(
  roadmap,
  '> Обновлено: **2026-08-10**, после exact-production acceptance C2 — Homepage clarity; C3 — Projects and flagship summary layer является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.',
  '> Обновлено: **2026-08-10**, после exact-production acceptance C3 — Projects and flagship summary layer; C4 — Professional surfaces является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.',
  'ROADMAP header',
);
roadmap = replaceOnce(
  roadmap,
  'Next redesign slice: **C3 — Projects and flagship summary layer**. Implement Selected work → Commercial work → Labs & experiments, concise project cards, a shared flagship At a glance layer, progressive disclosure and current-state reconciliation without lifecycle promotion.',
  `### C3 — Projects and flagship summary layer — PRODUCTION ACCEPTED\n\nAccepted production hierarchy: **Selected work → Commercial work → Labs & experiments**. Selected work is exactly VillAIgence, NotchHub and TrueRuslan Landing; MarketDB is the bounded commercial proof; Vlezet and lower-priority projects remain directly reachable without equal spotlight weight. VillAIgence, NotchHub, TrueRuslan Landing and Vlezet each expose a shared five-field registry-backed \`Коротко / At a glance\` layer before the deep-dive/evidence layer.\n\n${evidenceBlock}\n\nC3 preserves project lifecycle/evidence ownership and does not start, reset or close P3.6.\n\nNext redesign slice: **C4 — Professional surfaces**. Apply the approved scan-first contracts to Experience, Work with me, About, Now and Contacts without changing their canonical data/privacy/URL ownership.`,
  'ROADMAP C3 insertion',
);
roadmap = replaceOnce(
  roadmap,
  'Continue with **C3 — Projects and flagship summary layer** as the next product implementation slice.',
  'Continue with **C4 — Professional surfaces** as the next product implementation slice.',
  'ROADMAP new-session pointer',
);
write(files.roadmap, roadmap);

let changelog = read(files.changelog);
changelog = replaceOnce(
  changelog,
  '> Обновлено: **2026-08-10**, после exact-production acceptance C2 — Homepage clarity; P3.6 measurement остаётся открытым.',
  '> Обновлено: **2026-08-10**, после exact-production acceptance C3 — Projects and flagship summary layer; P3.6 measurement остаётся открытым.',
  'CHANGELOG header',
);
const c3Entry = `## 2026-08-10 — C3 Projects and flagship summary layer — PRODUCTION ACCEPTED\n\n- Rebuilt RU/EN Projects into **Selected work → Commercial work → Labs & experiments**.\n- Kept the spotlight to VillAIgence, NotchHub and TrueRuslan Landing; MarketDB is public-safe commercial proof, while Vlezet remains directly reachable without returning to the spotlight.\n- Added one shared five-field registry-backed \`Коротко / At a glance\` layer to VillAIgence, NotchHub, TrueRuslan Landing and Vlezet in RU/EN before deep evidence.\n- Preserved NODE ZERO private/proprietary boundaries, canonical project/evidence ownership, clean routes, one Diplodoc search owner, no-JavaScript semantics, privacy, SEO and accessibility.\n- Reviewed only the intentionally changed Projects desktop/mobile visual baselines; global visual thresholds remain unchanged.\n${evidenceBlock}\n\nC3 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C4 — Professional surfaces**.\n\n`;
changelog = replaceOnce(
  changelog,
  '## 2026-08-10 — C2 Homepage clarity — PRODUCTION ACCEPTED',
  `${c3Entry}## 2026-08-10 — C2 Homepage clarity — PRODUCTION ACCEPTED`,
  'CHANGELOG C3 insertion',
);
write(files.changelog, changelog);

console.log('C3 durable migration completed deterministically.');
