import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

function readDoc(name) {
  return fs.readFileSync(path.join(ROOT, 'docs', name), 'utf8');
}

function writeDoc(name, content) {
  fs.writeFileSync(path.join(ROOT, 'docs', name), content, 'utf8');
}

function replaceOnce(text, from, to, label) {
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`Missing reconciliation anchor: ${label}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`Ambiguous reconciliation anchor: ${label}`);
  return `${text.slice(0, first)}${to}${text.slice(first + from.length)}`;
}

function insertBeforeOnce(text, anchor, insertion, label) {
  const first = text.indexOf(anchor);
  if (first < 0) throw new Error(`Missing insertion anchor: ${label}`);
  if (text.indexOf(anchor, first + anchor.length) >= 0) throw new Error(`Ambiguous insertion anchor: ${label}`);
  return `${text.slice(0, first)}${insertion}${text.slice(first)}`;
}

function reconcileProjectState() {
  let text = readDoc('PROJECT_STATE.md');
  if (text.includes('## 0.3 2026-08-12 — Real GSC baseline + controlled launch pack')) {
    throw new Error('PROJECT_STATE reconciliation appears to be already applied');
  }

  text = replaceOnce(
    text,
    '> Последнее смысловое обновление: **2026-08-12**, после current evidence reconciliation и production acceptance P4.1B intake tooling; P3.6 measurement и реальные P4.1B external observations остаются открытыми.',
    '> Последнее смысловое обновление: **2026-08-12**, после production acceptance реального Google Search Console adapter и controlled launch pack; P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, actual launch — `not-published`, P3.6 — WAITING.',
    'PROJECT_STATE header',
  );

  const section = `## 0.3 2026-08-12 — Real GSC baseline + controlled launch pack\n\n### P4.1B Google Search Console adapter — PRODUCTION ACCEPTED\n\n\`\`\`text\nPR #213 squash / deployed SHA:   831535461f3c72d53e3510574ae7ae9c52ab54f6\nBuild:                           #1933 — SUCCESS\nCodeQL:                          #1487 — SUCCESS\nDependency Review:               #1355 — SUCCESS\nPages:                           #236 / 31606858974 — SUCCESS\nProduction Live Smoke:           #524 / 31606858968 — SUCCESS\nfollow-up Production Live:       #525 / 31606948825 — SUCCESS\n\`\`\`\n\nНа реальном authenticated/operator-supplied Google Search Console Search Performance export реализован первый raw adapter без guessed schema. Сам export остаётся private и не коммитится. Текущие observations образуют только **sparse pre-public-launch / clean-URL-migration baseline**: query evidence пока пустое, а legacy URL visibility ещё наблюдается. Этого недостаточно для стабильных CTR/ranking/engagement или causal SEO выводов.\n\n**P4.1B real external evidence review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**, но не DONE и не measurement acceptance.\n\n### Controlled launch pack — PRODUCTION ACCEPTED / NOT PUBLISHED\n\n\`\`\`text\nPR #214 squash / deployed SHA:   bed23ac0330ca112b94259998adcd8187203988a\nBuild:                           #1939 / 31610400124 — SUCCESS\nDistribution Readiness:          #185 / 31610400129 — SUCCESS\nlaunch pack:                     10 targets / 38 manual drafts / not-published\nCodeQL:                          #1494 / 31610400405 — SUCCESS\nDependency Review:               #1361 / 31610400141 — SUCCESS\nPages:                           #237 / 31611168208 — SUCCESS\nProduction Live Smoke:           #526 / 31611168202 — SUCCESS\nfollow-up Production Live:       #527 / 31611259926 — SUCCESS\n\`\`\`\n\nLaunch pack остаётся derived/manual-only/read-only preparation layer поверх canonical Distribution Readiness. Он не аутентифицируется во внешних каналах, не постит, не планирует публикации, не добавляет UTM и не меняет publication state. **Фактический controlled launch ещё не опубликован (`not-published`)**.\n\nСледующий внешний шаг — deliberate manual controlled launch, после которого нужно накопить реальные external observations до любых evidence-backed SEO/copy решений. **P4.1C остаётся WAITING. P3.6 остаётся NEXT / WAITING FOR EXTERNAL EVIDENCE**, а clean-URL observation clock не сбрасывается: \`2026-08-05T00:00:00Z\`.\n\n`;
  text = insertBeforeOnce(text, '## 0.2 2026-08-12 — Current evidence reconciliation + P4.1B intake tooling', section, 'PROJECT_STATE 0.2 section');

  text = replaceOnce(
    text,
    'Raw CSV/API adapters intentionally wait for an actual operator export/API response; upstream shapes are not guessed. **P4.1B intake tooling is accepted, but real external evidence collection/review remains NEXT. P4.1C remains WAITING. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE**, and the clean-URL observation clock remains `2026-08-05T00:00:00Z`.',
    'PR #210 intentionally deferred raw adapters until a real operator export/API shape existed; PR #213 subsequently implemented the observed Google Search Console CSV adapter without guessing upstream schema. **P4.1B review is now IN PROGRESS / SPARSE PRE-LAUNCH BASELINE. P4.1C remains WAITING. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE**, and the clean-URL observation clock remains `2026-08-05T00:00:00Z`.',
    'PROJECT_STATE P4.1B intake boundary',
  );

  text = replaceOnce(
    text,
    'Maintenance не меняет продуктовую или external-evidence семантику: P3.6 остаётся **NEXT / WAITING FOR EXTERNAL EVIDENCE**, clean-URL clock `2026-08-05T00:00:00Z` не сбрасывается, P4.1B остаётся **NEXT**, P4.1C — **WAITING**.',
    'Maintenance сама по себе не меняет продуктовую или external-evidence семантику: после более позднего PR #213 P4.1B review находится **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**, P3.6 остаётся **NEXT / WAITING FOR EXTERNAL EVIDENCE**, clean-URL clock `2026-08-05T00:00:00Z` не сбрасывается, P4.1C — **WAITING**.',
    'PROJECT_STATE maintenance boundary',
  );

  text = replaceOnce(
    text,
    'P4.1A доказывает repository/build/deployment readiness, а не Search Console или Yandex Webmaster performance. **P4.1B — NEXT** только после реальных external observations; **P4.1C — WAITING** и остаётся evidence-gated. P3.6 остаётся **NEXT / WAITING FOR EXTERNAL EVIDENCE**; исходный clean-URL observation clock `2026-08-05T00:00:00Z` не сбрасывается.',
    'P4.1A доказывает repository/build/deployment readiness, а не Search Console или Yandex Webmaster performance. Этот historical gate позже был продолжен PR #213: **P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**; **P4.1C — WAITING** и остаётся evidence-gated. P3.6 остаётся **NEXT / WAITING FOR EXTERNAL EVIDENCE**; исходный clean-URL observation clock `2026-08-05T00:00:00Z` не сбрасывается.',
    'PROJECT_STATE launch discovery boundary',
  );

  writeDoc('PROJECT_STATE.md', text);
}

function reconcileRoadmap() {
  let text = readDoc('ROADMAP.md');
  if (text.includes('## 2026-08-12 accepted real search baseline / controlled launch pack')) {
    throw new Error('ROADMAP reconciliation appears to be already applied');
  }

  text = replaceOnce(
    text,
    '> Обновлено: **2026-08-12**, current evidence и P4.1B intake tooling production-reconciled; P3.6 measurement и реальные P4.1B external observations ожидают evidence.',
    '> Обновлено: **2026-08-12**, real GSC adapter и controlled launch pack production-accepted; P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, actual launch — `not-published`, P3.6/P4.1C остаются evidence-gated.',
    'ROADMAP header',
  );

  const section = `## 2026-08-12 accepted real search baseline / controlled launch pack\n\n- **P4.1B real Google Search Console adapter — DONE / PRODUCTION ACCEPTED** via PR #213 / \`831535461f3c72d53e3510574ae7ae9c52ab54f6\`: exact-head Build #1933, CodeQL #1487 and Dependency Review #1355 — SUCCESS; Pages #236 / 31606858974 — SUCCESS; Production Live #524 / 31606858968 and #525 / 31606948825 — SUCCESS.\n- First authenticated/operator-supplied Google Search Console Search Performance export is available privately and established the real Russian CSV shape. Public durable state records only that it is a **sparse pre-public-launch / clean-URL-migration baseline**; raw metrics remain outside Git.\n- **P4.1B real external evidence review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**: query evidence is currently empty and traffic/migration maturity is insufficient for stable CTR, ranking or causal SEO conclusions.\n- **Controlled launch pack — DONE / PRODUCTION ACCEPTED** via PR #214 / \`bed23ac0330ca112b94259998adcd8187203988a\`: Build #1939 / 31610400124 — SUCCESS; Distribution Readiness #185 / 31610400129 — SUCCESS; **10 targets / 38 manual drafts / not-published**; Pages #237 / 31611168208 — SUCCESS; Production Live #526 / 31611168202 and #527 / 31611259926 — SUCCESS.\n- **Controlled manual launch — NEXT OPERATOR ACTION / NOT PUBLISHED**: review the generated drafts and publish deliberately through the selected external channels. Repository automation must not post, schedule, authenticate to external accounts or mutate canonical URLs.\n- After the real launch, accumulate external observations before choosing any P4.1C metadata/copy/internal-link change.\n- **P4.1C — WAITING** for reviewed evidence strong enough to justify a concrete change.\n- **P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE** remains separate; clean-URL observation clock stays \`2026-08-05T00:00:00Z\`.\n\n`;
  text = insertBeforeOnce(text, '## 2026-08-12 accepted evidence / P4.1B intake baseline', section, 'ROADMAP intake section');

  text = replaceOnce(
    text,
    '- **P4.1B real external evidence collection/review — NEXT**: supply an actual authenticated Google Search Console / Yandex Webmaster export or read-only API result, validate it through the accepted intake contract, then review query/page, RU/EN, legacy-URL and indexing observations.',
    '- **P4.1B real external evidence review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**: PR #213 consumed the first actual Google Search Console export shape; continue review only as real query/page/indexing observations accumulate.',
    'ROADMAP P4.1B next line',
  );

  text = replaceOnce(
    text,
    '- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; `2026-08-05T00:00:00Z` remains the clean-URL observation clock. **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED; P4.1B collection/review — NEXT; P4.1C — WAITING**.',
    '- P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; `2026-08-05T00:00:00Z` remains the clean-URL observation clock. **P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; P4.1C — WAITING**.',
    'ROADMAP maintenance current state',
  );

  text = replaceOnce(
    text,
    '- **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED** via PR #210; **P4.1B collection/review — NEXT**: collect real Search Console / Yandex Webmaster observations only when meaningful external evidence exists.',
    '- **P4.1B intake tooling — DONE / PRODUCTION ACCEPTED** via PR #210; after PR #213, **P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE** while further Search Console / Yandex Webmaster observations accumulate.',
    'ROADMAP launch discovery current state',
  );

  writeDoc('ROADMAP.md', text);
}

function reconcileChangelog() {
  let text = readDoc('CHANGELOG.md');
  if (text.includes('## 2026-08-12 — Real GSC baseline + controlled launch pack')) {
    throw new Error('CHANGELOG reconciliation appears to be already applied');
  }

  text = replaceOnce(
    text,
    '> Обновлено: **2026-08-12**, current evidence и P4.1B intake tooling reconciled; P3.6 measurement и реальные P4.1B external observations остаются открытыми.',
    '> Обновлено: **2026-08-12**, real GSC adapter и controlled launch pack production-reconciled; P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, actual launch — `not-published`, P3.6/P4.1C остаются открытыми.',
    'CHANGELOG header',
  );

  const section = `## 2026-08-12 — Real GSC baseline + controlled launch pack\n\n- PR #213 implemented the first raw adapter against an actual authenticated/operator-supplied Google Search Console Russian Search Performance CSV export, without guessed schema or committed private metrics. The first observations are recorded only as a **sparse pre-public-launch / clean-URL-migration baseline**; query evidence is currently empty and legacy URL visibility is still observable.\n- PR #213 squash / deployed SHA \`831535461f3c72d53e3510574ae7ae9c52ab54f6\`; exact-head Build #1933, CodeQL #1487 and Dependency Review #1355 — SUCCESS; Pages #236 / 31606858974 — SUCCESS; Production Live Smoke #524 / 31606858968 and #525 / 31606948825 — SUCCESS.\n- PR #214 added a controlled manual launch pack derived from canonical Distribution Readiness, with exact clean URLs, no UTM/query mutation and no external posting/auth/scheduling behavior. Final exact-head Build #1939 / 31610400124, Distribution Readiness #185 / 31610400129, Dependency Review #1361 and CodeQL #1494 — SUCCESS.\n- PR #214 squash / deployed SHA \`bed23ac0330ca112b94259998adcd8187203988a\`; launch artifact **10 targets / 38 manual drafts / not-published**; Pages #237 / 31611168208 — SUCCESS; Production Live Smoke #526 / 31611168202 and #527 / 31611259926 — SUCCESS.\n- **P4.1B real evidence review is IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, not complete. The actual controlled launch remains not-published. P4.1C remains WAITING. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE**, and the clean-URL clock remains \`2026-08-05T00:00:00Z\`.\n\n`;
  text = insertBeforeOnce(text, '## 2026-08-12 — Current evidence reconciliation + P4.1B intake tooling', section, 'CHANGELOG current evidence section');

  text = replaceOnce(
    text,
    '- **P4.1B intake tooling is accepted; real external evidence collection/review remains NEXT. P4.1C remains WAITING. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE**; no search-performance, CTR, ranking, engagement or causal product-impact claim was introduced.',
    '- PR #210 intake tooling remained the historical prerequisite; subsequent PR #213 advanced the first real GSC observations to **P4.1B IN PROGRESS / SPARSE PRE-LAUNCH BASELINE** without making search-performance, CTR, ranking, engagement or causal product-impact claims. P4.1C remains WAITING and P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE.',
    'CHANGELOG intake boundary',
  );

  text = replaceOnce(
    text,
    '- No P3.6 or P4.1 external-evidence state changed: clean-URL clock remains `2026-08-05T00:00:00Z`, P4.1B remains **NEXT**, P4.1C remains **WAITING**.',
    '- This maintenance slice itself did not change external evidence; later PR #213 advanced P4.1B review to **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**. The clean-URL clock remains `2026-08-05T00:00:00Z`, P4.1C remains **WAITING**, and P3.6 remains **WAITING FOR EXTERNAL EVIDENCE**.',
    'CHANGELOG maintenance boundary',
  );

  text = replaceOnce(
    text,
    '- No search-performance, CTR, ranking, engagement or causal product-impact claim was introduced. P4.1B remains **NEXT**, P4.1C remains **WAITING**, and P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** with clean-URL clock `2026-08-05T00:00:00Z`.',
    '- No search-performance, CTR, ranking, engagement or causal product-impact claim was introduced. Later PR #213 advanced P4.1B review to **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**; P4.1C remains **WAITING**, and P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** with clean-URL clock `2026-08-05T00:00:00Z`.',
    'CHANGELOG launch discovery boundary',
  );

  writeDoc('CHANGELOG.md', text);
}

reconcileProjectState();
reconcileRoadmap();
reconcileChangelog();
console.log('Pre-launch evidence durable state reconciled.');
