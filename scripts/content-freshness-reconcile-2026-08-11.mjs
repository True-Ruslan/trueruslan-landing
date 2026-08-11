import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const writeJson = (relativePath, value) => fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`);
const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const writeText = (relativePath, value) => fs.writeFileSync(path.join(ROOT, relativePath), value);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function findProject(projects, slug) {
  const value = projects.find((entry) => entry.slug === slug);
  invariant(value, `missing project ${slug}`);
  return value;
}

function findSnapshot(evidence, slug) {
  const value = evidence.find((entry) => entry.project === slug);
  invariant(value, `missing evidence ${slug}`);
  return value;
}

function setVersion(snapshot, label, value) {
  const existing = snapshot.versions.find((entry) => entry.label === label);
  if (existing) existing.value = value;
  else snapshot.versions.push({label, value});
}

function signalByUrl(snapshot, url) {
  return snapshot.signals.find((entry) => entry.url === url);
}

function upsertSignal(snapshot, signal) {
  const existing = signalByUrl(snapshot, signal.url);
  if (existing) Object.assign(existing, signal);
  else snapshot.signals.push(signal);
}

function replaceExact(relativePath, before, after) {
  const source = readText(relativePath);
  invariant(source.includes(before), `${relativePath}: missing exact anchor`);
  writeText(relativePath, source.replace(before, after));
}

function replaceBetween(relativePath, startMarker, endMarker, replacement) {
  const source = readText(relativePath);
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  invariant(start >= 0 && end > start, `${relativePath}: missing bounded section ${startMarker}`);
  const next = `${source.slice(0, start)}${replacement.trim()}\n\n${source.slice(end)}`;
  writeText(relativePath, next);
}

const projects = readJson('data/projects.json');
const evidence = readJson('data/project-evidence.json');
const vlezet = findSnapshot(evidence, 'vlezet');
const livingworld = findSnapshot(evidence, 'livingworld');
const portfolio = findSnapshot(evidence, 'portfolio-platform');

invariant(vlezet.lastVerified === '2026-08-08', 'Vlezet expected pre-reconciliation date 2026-08-08');
invariant(livingworld.lastVerified === '2026-08-08', 'VillAIgence expected pre-reconciliation date 2026-08-08');
invariant(portfolio.lastVerified === '2026-08-08', 'Portfolio expected pre-reconciliation date 2026-08-08');

const vlezetProject = findProject(projects, 'vlezet');
invariant(vlezetProject.status === 'pre-production' && vlezetProject.statusLabel === 'ACTIVE DEVELOPMENT', 'Vlezet lifecycle changed unexpectedly');
vlezetProject.summary = 'Precise local-first apartment planning with authoritative millimetre geometry, manual editing and precision drawing, explainable furniture fit and reviewable CV/LLM assistance.';

vlezet.lastVerified = '2026-08-11';
setVersion(vlezet, 'Accepted recognition slice', 'M7.8B');
setVersion(vlezet, 'Accepted editor slice', 'M8.1 — product-owner accepted and merged');
setVersion(vlezet, 'Active product slice', 'M8.2 top toolbar — Draft; focused clipboard retest pending');
const old52 = signalByUrl(vlezet, 'https://github.com/True-Ruslan/vlezet/pull/52');
invariant(old52?.state === 'pending', 'Vlezet PR #52 expected pending before reconciliation');
Object.assign(old52, {
  label: 'Assisted Tracing design gate PR #52 — closed unmerged',
  state: 'unavailable',
  observedAt: '2026-08-11',
  scope: 'PR #52 is closed unmerged and superseded by later accepted editor work. It remains historical design/R&D evidence only; it is not the current acceptance boundary and does not change the pre-production lifecycle.',
});
upsertSignal(vlezet, {
  kind: 'pr', mode: 'manual', label: 'M8.1 precision drawing PR #85', state: 'merged',
  url: 'https://github.com/True-Ruslan/vlezet/pull/85', observedAt: '2026-08-09',
  scope: 'PR #85 was product-owner accepted and merged after the M8.1 acceptance set passed 9/9. It establishes the current accepted editor slice for precision drawing/manual editing without promoting Vlezet beyond pre-production.',
});
upsertSignal(vlezet, {
  kind: 'pr', mode: 'manual', label: 'M8.2 top toolbar Draft PR #87', state: 'pending',
  url: 'https://github.com/True-Ruslan/vlezet/pull/87', observedAt: '2026-08-11',
  scope: 'PR #87 is the current Draft M8.2 product slice. Product-owner scenarios 01–07 passed, while the focused clipboard retest remains pending; no merge, release or product-owner closure is claimed before that retest.',
});

invariant(livingworld.status === 'verified', 'VillAIgence evidence trust state changed unexpectedly');
livingworld.lastVerified = '2026-08-11';
setVersion(livingworld, 'Latest merged source capability', 'causal NPC↔NPC social mutation — PR #153 merged');
setVersion(livingworld, 'Active development slice', 'Personality / social snapshot consolidation — Draft PR #155');
const old125 = signalByUrl(livingworld, 'https://github.com/True-Ruslan/villAIgence/pull/125');
invariant(old125?.state === 'pending', 'VillAIgence PR #125 expected pending before reconciliation');
Object.assign(old125, {
  label: 'PLAYER_TOLD BELIEF candidate extraction PR #125',
  state: 'merged',
  observedAt: '2026-08-08',
  scope: 'PR #125 is merged bounded source evidence for PLAYER_TOLD BELIEF candidate extraction. Server-owned provenance and FACT authority remain unchanged. This source capability does not expand the installed 0.2.0 acceptance set or resolve deferred installed boundaries.',
});
upsertSignal(livingworld, {
  kind: 'pr', mode: 'automated', label: 'Causal NPC↔NPC social mutation PR #153', state: 'merged',
  url: 'https://github.com/True-Ruslan/villAIgence/pull/153', observedAt: '2026-08-11',
  scope: 'PR #153 merged causal nearby NPC-to-NPC social influence with the full source acceptance suite green (620/620 tests and 146 gates). This is post-release source capability only; the official installed release remains 0.2.0+1.21.1 with 7 PASS / 0 FAIL and the documented NOT TESTED boundaries.',
});
upsertSignal(livingworld, {
  kind: 'pr', mode: 'automated', label: 'Personality / social snapshot Draft PR #155', state: 'pending',
  url: 'https://github.com/True-Ruslan/villAIgence/pull/155', observedAt: '2026-08-11',
  scope: 'PR #155 is the current Draft TDD follow-up consolidating personality/social snapshot state. It is development evidence only and is not an installed release, cumulative acceptance or lifecycle promotion.',
});

portfolio.lastVerified = '2026-08-11';
setVersion(portfolio, 'Portfolio Clarity redesign', 'C7 — production accepted');
setVersion(portfolio, 'Measurement checkpoint', 'P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE');
upsertSignal(portfolio, {
  kind: 'pr', mode: 'automated', label: 'Portfolio Clarity C7 PR #198', state: 'merged',
  url: 'https://github.com/True-Ruslan/trueruslan-landing/pull/198', observedAt: '2026-08-11',
  scope: 'PR #198 delivered the tracked context-only presentation baseline and P3.6 handoff without resetting the clean-URL observation clock or creating a second measurement owner. Exact production acceptance is tied to deployed SHA 134043fa2bb5f6612266a04eab2853f71b207328.',
});
upsertSignal(portfolio, {
  kind: 'build', mode: 'automated', label: 'C7 GitHub Pages #223', state: 'published',
  url: 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516118934', observedAt: '2026-08-11',
  scope: 'Pages #223 successfully published exact C7 SHA 134043fa2bb5f6612266a04eab2853f71b207328 as deployment 5855067883.',
});
upsertSignal(portfolio, {
  kind: 'ci', mode: 'automated', label: 'C7 Production Live #498', state: 'passed',
  url: 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516213818', observedAt: '2026-08-11',
  scope: 'Deployment-triggered Production Live #498 passed all production-only gates for exact deployed C7 SHA 134043fa2bb5f6612266a04eab2853f71b207328. P3.6 measurement remains NEXT / WAITING and no product-impact claim is inferred.',
});

writeJson('data/projects.json', projects);
writeJson('data/project-evidence.json', evidence);

const vlezetHistory = readJson('data/project-history/vlezet.json');
for (const entry of vlezetHistory) if (entry.state === 'current' || entry.state === 'next') entry.state = 'past';
vlezetHistory.push(
  {
    date: '2026-08', title: 'M8.1 precision drawing accepted',
    description: 'PR #85 was product-owner accepted and merged after the M8.1 acceptance set passed 9/9. Manual editing and precision drawing are the latest accepted editor slice; Vlezet remains pre-production.',
    state: 'past', evidence: 'https://github.com/True-Ruslan/vlezet/pull/85',
  },
  {
    date: '2026-08', title: 'M8.2 top toolbar — Draft / focused retest pending',
    description: 'PR #87 is the current Draft product slice. Scenarios 01–07 passed in product-owner testing, while the focused clipboard retest is still pending. No merge, release or product-owner closure is claimed before that retest.',
    state: 'current', evidence: 'https://github.com/True-Ruslan/vlezet/pull/87',
  },
  {
    date: 'NEXT', title: 'Close the M8.2 clipboard retest and acceptance boundary',
    description: 'Run the focused clipboard retest, reconcile only observed defects, then require exact-head CI and explicit product-owner closure before merge or any lifecycle promotion.',
    state: 'next',
  },
);
writeJson('data/project-history/vlezet.json', vlezetHistory);

const livingHistory = readJson('data/project-history/livingworld.json');
for (const entry of livingHistory) if (entry.state === 'current' || entry.state === 'next') entry.state = 'past';
livingHistory.push(
  {
    date: '2026-08', title: 'Post-release causal NPC↔NPC social mutation merged',
    description: 'PR #153 merged causal nearby NPC social influence with 620/620 tests and 146 source gates green. It is accepted source capability, not a new installed release; official installed acceptance stays 0.2.0+1.21.1 at 7 PASS / 0 FAIL with explicit NOT TESTED boundaries.',
    state: 'past', evidence: 'https://github.com/True-Ruslan/villAIgence/pull/153',
  },
  {
    date: '2026-08', title: 'Personality / social snapshot consolidation — Draft',
    description: 'PR #155 is the current Draft TDD follow-up for personality/social snapshot state. It remains development evidence and cannot expand installed acceptance, release identity or lifecycle status.',
    state: 'current', evidence: 'https://github.com/True-Ruslan/villAIgence/pull/155',
  },
  {
    date: 'NEXT', title: 'Finish PR #155 without collapsing source and installed evidence',
    description: 'Complete the TDD contract and source review for PR #155. Any later release or installed acceptance must use its own exact-artifact and installed gates; deferred VAI-M2-INST-005 and VAI-CONCUR-004 remain explicit until directly tested.',
    state: 'next',
  },
);
writeJson('data/project-history/livingworld.json', livingHistory);

const portfolioHistory = readJson('data/project-history/portfolio-platform.json');
for (const entry of portfolioHistory) if (entry.state === 'current' || entry.state === 'next') entry.state = 'past';
portfolioHistory.push(
  {
    date: '2026-08', title: 'C7 production baseline + P3.6 handoff accepted',
    description: 'Portfolio Clarity C7 is production-accepted on exact deployed SHA 134043fa2bb5f6612266a04eab2853f71b207328 after Pages #223 and deployment-triggered Production Live #498. The tracked presentation baseline is context-only provenance and does not reset measurement.',
    state: 'current', evidence: 'https://github.com/True-Ruslan/trueruslan-landing/pull/198',
  },
  {
    date: 'NEXT', title: 'P3.6 measurement checkpoint — WAITING',
    description: 'Wait for real equal-duration operator-observed aggregate evidence, explicit traffic-sufficiency assessment and human review. Synthetic pipeline proof or C7 acceptance cannot produce engagement, SEO or causal product-impact conclusions.',
    state: 'next',
  },
);
writeJson('data/project-history/portfolio-platform.json', portfolioHistory);

replaceExact(
  'docs/ROADMAP.md',
  'Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`. M7.8B remains the accepted recognition slice. The later automatic M7.8C path failed representative product-owner usefulness acceptance on 2026-08-08: PR #42 is closed unmerged, stacked PR #44/#45 are closed unmerged R&D evidence, and PR #52 is the new **Draft design-only Assisted Tracing gate** with no accepted product code yet.\n\nVillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`. The current official release is `0.2.0+1.21.1`; the byte-identical clean-world candidate passed the required installed Memory 2.0 suite **7 PASS / 0 FAIL**, while `VAI-M2-INST-005` remains NOT TESTED / automated evidence only and `VAI-CONCUR-004` remains NOT TESTED / DEFERRED. PR #110 and PR #123 are merged bounded evidence; PR #125 is the current Draft/RED PLAYER_TOLD BELIEF candidate-extraction slice and is not accepted product truth.',
  'Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`. M7.8B remains the accepted recognition slice; later automatic M7.8C R&D stayed closed-unmerged. PR #52 is now closed unmerged/superseded, **M8.1 is product-owner accepted and merged via PR #85**, and **M8.2 PR #87 is the current Draft product boundary** with scenarios 01–07 passed but a focused clipboard retest still pending. No merge/release/lifecycle promotion is claimed for M8.2 before that retest and explicit closure.\n\nVillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`. The current official release is `0.2.0+1.21.1`; the byte-identical clean-world candidate passed the required installed Memory 2.0 suite **7 PASS / 0 FAIL**, while `VAI-M2-INST-005` remains NOT TESTED / automated evidence only and `VAI-CONCUR-004` remains NOT TESTED / DEFERRED. Post-release source work advanced independently: PR #125 is merged bounded BELIEF-extraction evidence, PR #153 merged causal NPC↔NPC social mutation, and PR #155 is the current Draft Personality/social-snapshot follow-up. None of these source milestones expands installed 0.2.0 acceptance.'
);

replaceExact(
  'docs/PROJECT_STATE.md',
  'Routes: `/landing/projects/livingworld/`, `/landing/projects/vlezet/`, `/en/projects/livingworld/`. Historical P3.3 acceptance keeps M7.8B and later recognition work as separate evidence layers; current reconciliation records PR #42/#44/#45 as closed-unmerged and PR #52 as the pending Assisted Tracing design gate.',
  'Routes: `/landing/projects/livingworld/`, `/landing/projects/vlezet/`, `/en/projects/livingworld/`. Historical P3.3 acceptance remains unchanged, while the 2026-08-11 controlled reconciliation advances current external truth without lifecycle promotion: Vlezet keeps M7.8B as accepted recognition history, records M8.1 PR #85 as product-owner accepted/merged and M8.2 PR #87 as Draft with focused clipboard retest pending; VillAIgence keeps official installed 0.2.0+1.21.1 at 7 PASS / 0 FAIL, records merged source capability through PR #153 and keeps PR #155 Draft/pending.'
);
replaceExact(
  'docs/PROJECT_STATE.md',
  'Accepted M7.8B remains separate from later unaccepted recognition R&D. The representative retest later rejected automatic M7.8C usefulness; PR #42/#44/#45 are closed unmerged, while PR #52 is a new pending design-only Assisted Tracing boundary. This later reconciliation does not rewrite P3.4C\'s historical production acceptance.',
  'Accepted M7.8B remains separate from later recognition R&D. The representative retest rejected automatic M7.8C usefulness and PR #42/#44/#45 stayed closed unmerged. Later product development advanced separately: PR #52 is now closed unmerged/superseded, M8.1 PR #85 is product-owner accepted/merged, and M8.2 PR #87 is Draft with focused clipboard retest pending. This reconciliation updates current evidence without rewriting P3.4C\'s historical production acceptance or promoting Vlezet beyond pre-production.'
);
replaceExact(
  'docs/PROJECT_STATE.md',
  '- `issue #78` — 2026-08-08 external-project evidence reconciliation выполнен в canonical data; default-branch Content Freshness refresh должен подтвердить отсутствие оставшихся findings после merge;',
  '- `issue #78` — 2026-08-11 controlled reconciliation updates Vlezet, VillAIgence and Portfolio Platform canonical evidence without lifecycle promotion; close only after the post-merge default-branch Content Freshness run reports 0 findings;'
);

const changelog = readText('docs/CHANGELOG.md');
invariant(!changelog.includes('## 2026-08-11 — Content Freshness reconciliation — CURRENT EXTERNAL EVIDENCE'), 'changelog reconciliation entry already exists');
const changelogAnchor = '## 2026-08-11 — C7 production baseline + P3.6 handoff — PRODUCTION ACCEPTED';
const changelogEntry = `## 2026-08-11 — Content Freshness reconciliation — CURRENT EXTERNAL EVIDENCE\n\n- Reconciled the three repository-drift warnings from issue #78 against current GitHub state instead of promoting freshness automatically.\n- Vlezet stays \`pre-production / ACTIVE DEVELOPMENT\`: PR #52 is closed unmerged/superseded, M8.1 PR #85 is product-owner accepted/merged, and M8.2 PR #87 remains Draft with the focused clipboard retest pending.\n- VillAIgence stays \`release-candidate / ACCEPTANCE IN PROGRESS\`: official installed \`0.2.0+1.21.1\` remains \`7 PASS / 0 FAIL\` with explicit NOT TESTED boundaries; post-release source capability includes merged PR #153 while PR #155 remains Draft.\n- Portfolio Platform stays production and records C7 exact production acceptance as the latest controlled evidence; P3.6 remains NEXT / WAITING.\n- Advanced controlled \`lastVerified\` to 2026-08-11 only after manual reconciliation. Issue #78 may close only after a post-merge default-branch Content Freshness run reports zero findings.\n\n`;
invariant(changelog.includes(changelogAnchor), 'missing changelog C7 anchor');
writeText('docs/CHANGELOG.md', changelog.replace(changelogAnchor, `${changelogEntry}${changelogAnchor}`));

const vlezetRu = `<!-- case-study:current-state -->\n## Текущая lifecycle- и acceptance-граница\n\nПубличный lifecycle остаётся **pre-production — ACTIVE DEVELOPMENT**. Исторически принятая recognition-граница M7.8B не переписывается более поздними экспериментами.\n\n8 августа automatic M7.8C не прошёл product-owner usefulness acceptance; PR #42/#44/#45 остались closed-unmerged R&D evidence. Design-only PR #52 позже также был закрыт unmerged и больше не является current boundary.\n\nСледующая принятая продуктовая ступень — **M8.1**: PR #85 прошёл product-owner acceptance **9/9** и merged. Он закрепляет manual editing / precision drawing как актуальную принятую editor-функциональность без promotion в production lifecycle.\n\nТекущий product slice — **M8.2, Draft PR #87**. Сценарии 01–07 прошли, но focused clipboard retest остаётся pending. До этого retest, exact-head CI и explicit product-owner closure M8.2 не считается merged/released/accepted.\n\nCanonical Project Evidence и timeline ниже являются владельцами изменчивых run/PR границ; этот case study не создаёт второй lifecycle source of truth.\n`;
const vlezetEn = `<!-- case-study:current-state -->\n## Current lifecycle and acceptance boundary\n\nThe public lifecycle remains **pre-production — ACTIVE DEVELOPMENT**. The historically accepted M7.8B recognition boundary is not rewritten by later experiments.\n\nOn 8 August the automatic M7.8C direction failed product-owner usefulness acceptance; PR #42/#44/#45 stayed closed-unmerged R&D evidence. Design-only PR #52 was later closed unmerged as well and is no longer the current boundary.\n\nThe next accepted product step is **M8.1**: PR #85 passed product-owner acceptance **9/9** and merged. It establishes manual editing / precision drawing as the current accepted editor slice without promoting the project to production.\n\nThe active product slice is **M8.2, Draft PR #87**. Scenarios 01–07 passed, while a focused clipboard retest remains pending. Until that retest, exact-head CI and explicit product-owner closure, M8.2 is not represented as merged, released or accepted.\n\nCanonical Project Evidence and the timeline below own volatile PR/run truth; this case study does not create a second lifecycle source of truth.\n`;
replaceBetween('docs/landing/projects/vlezet.md', '<!-- case-study:current-state -->', '<!-- case-study:decisions -->', vlezetRu);
replaceBetween('docs/en/projects/vlezet.md', '<!-- case-study:current-state -->', '<!-- case-study:decisions -->', vlezetEn);

const livingRu = `<!-- case-study:current-state -->\n## Текущая lifecycle- и acceptance-граница\n\nПубличный lifecycle остаётся **release-candidate — ACCEPTANCE IN PROGRESS**. Текущий официальный installed release — **0.2.0+1.21.1**; byte-identical clean-world candidate прошёл обязательный installed set **7 PASS / 0 FAIL**. \`VAI-M2-INST-005\` остаётся NOT TESTED / automated evidence only, \`VAI-CONCUR-004\` — NOT TESTED / DEFERRED.\n\nПосле release source development продолжился отдельным evidence layer. PR #125 merged bounded PLAYER_TOLD BELIEF candidate extraction без AI-to-FACT authority. PR #153 merged causal nearby NPC↔NPC social mutation with the full source suite green. Эти source milestones не расширяют installed acceptance автоматически.\n\nТекущий development boundary — **Draft PR #155**, Personality / social snapshot consolidation. До собственного TDD/review/merge и отдельной installed/release acceptance эта работа остаётся pending source evidence.\n\nТак release identity, source capability и installed gameplay acceptance остаются разными фактами.\n`;
const livingEn = `<!-- case-study:current-state -->\n## Current lifecycle and acceptance boundary\n\nThe public lifecycle remains **release-candidate — ACCEPTANCE IN PROGRESS**. The current official installed release is **0.2.0+1.21.1**; the byte-identical clean-world candidate passed the required installed set at **7 PASS / 0 FAIL**. \`VAI-M2-INST-005\` remains NOT TESTED / automated evidence only and \`VAI-CONCUR-004\` remains NOT TESTED / DEFERRED.\n\nPost-release source development continued as a separate evidence layer. PR #125 merged bounded PLAYER_TOLD BELIEF candidate extraction without creating an AI-to-FACT authority path. PR #153 merged causal nearby NPC↔NPC social mutation with the full source suite green. These source milestones do not automatically expand installed acceptance.\n\nThe current development boundary is **Draft PR #155**, the Personality / social snapshot consolidation follow-up. Until its own TDD/review/merge and any separate installed/release acceptance, it remains pending source evidence.\n\nRelease identity, source capability and installed gameplay acceptance therefore remain separate facts.\n`;
replaceBetween('docs/landing/projects/livingworld.md', '<!-- case-study:current-state -->', '<!-- case-study:decisions -->', livingRu);
replaceBetween('docs/en/projects/livingworld.md', '<!-- case-study:current-state -->', '<!-- case-study:decisions -->', livingEn);

console.log('2026-08-11 Content Freshness reconciliation migration applied.');
