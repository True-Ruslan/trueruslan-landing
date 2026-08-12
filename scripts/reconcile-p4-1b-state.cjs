const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`${label}: anchor not found`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`${label}: anchor is not unique`);
  return `${source.slice(0, first)}${to}${source.slice(first + from.length)}`;
}

function update(relativePath, transform) {
  const file = path.join(ROOT, relativePath);
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`${relativePath}: migration produced no change`);
  fs.writeFileSync(file, after, 'utf8');
}

update('docs/PROJECT_STATE.md', (source) => {
  let next = replaceOnce(
    source,
    '> Последнее смысловое обновление: **2026-08-12**, после production acceptance launch/discovery и maintenance reconciliation; P3.6 measurement и P4.1B external evidence остаются открытыми.',
    '> Последнее смысловое обновление: **2026-08-12**, после current evidence reconciliation и production acceptance P4.1B intake tooling; P3.6 measurement и реальные P4.1B external observations остаются открытыми.',
    'PROJECT_STATE header',
  );

  const anchor = 'Repository readiness, generated artifact, deployed production, search-engine observation и external-product acceptance остаются разными фактами.\n\n';
  const section = `## 0.2 2026-08-12 — Current evidence reconciliation + P4.1B intake tooling\n\n### Current evidence reconciliation — ACCEPTED\n\n\`\`\`text\nPR #209 squash:                  ccf1996ced5c90511812ad435bb5829df56d30b3\nexact-head Build:                #1914 / 31597254382 — SUCCESS\nunit tests:                      723 PASS / 0 FAIL\nContent Freshness:               #191 / 31597254358 — SUCCESS\nCodeQL:                          #1465 / 31597254387 — SUCCESS\nDependency Review:               #1336 / 31597254439 — SUCCESS\nPages:                           #233 / 31598153664 — SUCCESS\nProduction Live Smoke:           #519 / 31598218971 — SUCCESS\n\`\`\`\n\nPR #209 reconciled Vlezet, VillAIgence и Portfolio Platform against current evidence without lifecycle or installed-acceptance promotion. Vlezet M8.2 remains Draft/pending focused product-owner retest; VillAIgence official installed release remains \`0.2.0+1.21.1\` / \`7 PASS / 0 FAIL\`; Portfolio P3.6 remains NEXT / WAITING.\n\n### P4.1B intake tooling — PRODUCTION ACCEPTED\n\n\`\`\`text\nPR #210 exact head:              c5153ee6e9d55e44507a0a11ef302fd54a0aa6af\nPR #210 squash / deployed SHA:   6083e4d950d74b272cce199fedccc730dfcc4fed\nBuild:                           #1922 / 31599699918 — SUCCESS\nunit tests:                      731 PASS / 0 FAIL\nCodeQL:                          #1474 / 31599699781 — SUCCESS\nDependency Review:               #1344 / 31599699860 — SUCCESS\nPages:                           #234 / 31600575541 — SUCCESS\nProduction Live Smoke:           #520 / 31600575540 — SUCCESS\npost-merge CodeQL:               #1475 / 31600575547 — SUCCESS\nexternalEvidence:                not-collected\n\`\`\`\n\nP4.1B intake tooling accepts only explicit operator-supplied aggregate Google Search Console / Yandex Webmaster observations, validates same-property URLs and bounded metrics, ties local reports to the exact input SHA-256 and keeps real files under ignored \`private/search-discovery/\`. Ordinary \`npm test\` and Build do not collect or fabricate external evidence.\n\nRaw CSV/API adapters intentionally wait for an actual operator export/API response; upstream shapes are not guessed. **P4.1B intake tooling is accepted, but real external evidence collection/review remains NEXT. P4.1C remains WAITING. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE**, and the clean-URL observation clock remains \`2026-08-05T00:00:00Z\`.\n\n`;
  next = replaceOnce(next, anchor, `${anchor}${section}`, 'PROJECT_STATE section insertion');
  return next;
});

update('docs/ROADMAP.md', (source) => {
  let next = replaceOnce(
    source,
    '> Обновлено: **2026-08-12**, launch/discovery и maintenance baseline reconciled; P3.6 measurement и P4.1B external evidence ожидают реальные observations.',
    '> Обновлено: **2026-08-12**, current evidence и P4.1B intake tooling production-reconciled; P3.6 measurement и реальные P4.1B external observations ожидают evidence.',
    'ROADMAP header',
  );

  const anchor = '## 2026-08-12 accepted maintenance baseline\n\n';
  const section = `## 2026-08-12 accepted evidence / P4.1B intake baseline\n\n- PR #209 / \`ccf1996ced5c90511812ad435bb5829df56d30b3\`: current Vlezet/VillAIgence/Portfolio evidence reconciled; final Build #1914 / 31597254382 — SUCCESS; **723 PASS / 0 FAIL**; Content Freshness #191 — SUCCESS; Pages #233 and Production Live #519 — SUCCESS. Lifecycle, installed-release and P3.6 boundaries were preserved.\n- **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED** via PR #210 / \`6083e4d950d74b272cce199fedccc730dfcc4fed\`: Build #1922 / 31599699918 — SUCCESS; **731 PASS / 0 FAIL**; Pages #234 / 31600575541 — SUCCESS; Production Live #520 / 31600575540 — SUCCESS; post-merge CodeQL #1475 / 31600575547 — SUCCESS.\n- **P4.1B real external evidence collection/review — NEXT**: supply an actual authenticated Google Search Console / Yandex Webmaster export or read-only API result, validate it through the accepted intake contract, then review query/page, RU/EN, legacy-URL and indexing observations.\n- Raw export adapters are implemented only against an actual operator-provided shape; no sample metrics or guessed schemas become evidence.\n- **P4.1C — WAITING** for reviewed real P4.1B evidence or a concrete structural finding.\n- **P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE** remains separate; clean-URL observation clock stays \`2026-08-05T00:00:00Z\`.\n\n`;
  next = replaceOnce(next, anchor, `${section}${anchor}`, 'ROADMAP section insertion');

  next = next.replace(
    '- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; `2026-08-05T00:00:00Z` remains the clean-URL observation clock. **P4.1B — NEXT**, **P4.1C — WAITING**.',
    '- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; `2026-08-05T00:00:00Z` remains the clean-URL observation clock. **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED; P4.1B collection/review — NEXT; P4.1C — WAITING**.',
  );
  next = next.replace(
    '- **P4.1B — NEXT**: collect real Search Console / Yandex Webmaster observations only when meaningful external evidence exists.',
    '- **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED** via PR #210; **P4.1B collection/review — NEXT**: collect real Search Console / Yandex Webmaster observations only when meaningful external evidence exists.',
  );
  return next;
});

update('docs/CHANGELOG.md', (source) => {
  let next = replaceOnce(
    source,
    '> Обновлено: **2026-08-12**, launch/discovery и maintenance evidence reconciled; P3.6 measurement и P4.1B external evidence остаются открытыми.',
    '> Обновлено: **2026-08-12**, current evidence и P4.1B intake tooling reconciled; P3.6 measurement и реальные P4.1B external observations остаются открытыми.',
    'CHANGELOG header',
  );

  const anchor = '## 2026-08-12 — Maintenance evidence reconciliation\n\n';
  const section = `## 2026-08-12 — Current evidence reconciliation + P4.1B intake tooling\n\n- PR #209 reconciled current Vlezet, VillAIgence and Portfolio Platform evidence without promoting lifecycle or external acceptance. Final exact-head Build #1914 / 31597254382 — SUCCESS with **723 PASS / 0 FAIL**; Content Freshness #191, CodeQL #1465 and Dependency Review #1336 — SUCCESS; squash \`ccf1996ced5c90511812ad435bb5829df56d30b3\`; Pages #233 / 31598153664 and Production Live #519 / 31598218971 — SUCCESS.\n- PR #210 added P4.1B intake tooling for explicit operator-supplied aggregate Google Search Console / Yandex Webmaster observations: strict provenance/metric/same-property validation, RU/EN and clean-vs-legacy reporting, indexing findings, ignored private inputs and SHA-256-bound local reports. Raw export adapters remain intentionally deferred until an actual operator export/API response exists.\n- PR #210 exact head \`c5153ee6e9d55e44507a0a11ef302fd54a0aa6af\`; Build #1922 / 31599699918 — SUCCESS with **731 PASS / 0 FAIL**; CodeQL #1474, Dependency Review #1344 and Dependency Audit #227 — SUCCESS; quality artifact \`9142767935\`, digest \`sha256:64d4f70f291c6fb6403ca6a2db635f3db132f64d91314faef4198d59ed20a866\`.\n- PR #210 squash / deployed SHA \`6083e4d950d74b272cce199fedccc730dfcc4fed\`; Pages #234 / 31600575541 — SUCCESS; Production Live Smoke #520 / 31600575540 — SUCCESS; post-merge CodeQL #1475 / 31600575547 — SUCCESS.\n- P4.1A remains **READY / 11 strategic surfaces / 21 clean routes / 0 findings / externalEvidence=not-collected**. Ordinary Build does not produce a P4.1B external-evidence artifact.\n- **P4.1B intake tooling is accepted; real external evidence collection/review remains NEXT. P4.1C remains WAITING. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE**; no search-performance, CTR, ranking, engagement or causal product-impact claim was introduced.\n\n`;
  next = replaceOnce(next, anchor, `${section}${anchor}`, 'CHANGELOG section insertion');
  return next;
});

console.log('Reconciled P4.1B intake tooling state in PROJECT_STATE, ROADMAP and CHANGELOG.');
