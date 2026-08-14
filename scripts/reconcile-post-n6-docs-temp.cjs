const fs = require('node:fs');

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(before)) throw new Error(`${file}: expected block not found`);
  const next = source.replace(before, after);
  if (next === source) throw new Error(`${file}: replacement made no change`);
  fs.writeFileSync(file, next, 'utf8');
}

function insertBefore(file, marker, block) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(marker)) throw new Error(`${file}: insertion marker not found`);
  if (source.includes(block.trim())) throw new Error(`${file}: reconciliation block already present`);
  fs.writeFileSync(file, source.replace(marker, `${block}\n${marker}`), 'utf8');
}

const stateFile = 'docs/PROJECT_STATE.md';
replaceOnce(
  stateFile,
  '> Последнее смысловое обновление: **2026-08-14**, N6 full-site editorial UX + bounded copy polish production-accepted на exact product SHA `635b4a0760765a515277ad8abcbb1500bf646027`; durable acceptance #236 production-verified на `01b4508355c33a81a5e9d1b5f5815a6c37318a9b`; controlled launch остаётся `not-published`, P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C — WAITING.',
  '> Последнее смысловое обновление: **2026-08-14**, post-N6 evidence/security/flagship/production-verifier reconciliation production-accepted на exact deployed SHA `733a8f5342da6fd5a8c9f8995a2383367145db04`; controlled launch остаётся `not-published`, P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C — WAITING.',
);
insertBefore(
  stateFile,
  '## 0.6 2026-08-14 — N6 full-site editorial UX + bounded copy polish — PRODUCTION ACCEPTED',
  `## 0.7 2026-08-14 — Post-N6 evidence, security, flagship and verifier reconciliation — PRODUCTION ACCEPTED\n\nПосле завершения N6 репозиторий прошёл отдельный bounded maintenance/reconciliation цикл. Он не открывал новый redesign или SEO-rewrite, а синхронизировал volatile project evidence, закрыл новый high-severity dependency finding и устранил расхождение между production verifier и уже принятой homepage/link architecture.\n\n### Accepted reconciliation\n\n- **Project evidence freshness — DONE** via PR #238: Vlezet/VillAIgence/Node Zero evidence и browser expectations синхронизированы с фактическим GitHub state. Content Freshness Guard после повторной проверки завершился с **0 findings**; issue #78 закрыт как completed.\n- **VillAIgence flagship truth — DONE** via PR #240: официальный current release — **0.3.1+1.21.1**, lifecycle остаётся **Release Candidate / ACCEPTANCE IN PROGRESS**; exact installed corrective canary \`VAI-PCM-MULTI-001\` остаётся **PENDING**. Исторический \`0.2.0+1.21.1 — 7 PASS / 0 FAIL\` остаётся последним installed baseline с завершённой acceptance; \`VAI-M2-INST-005\` и \`VAI-CONCUR-004\` остаются NOT TESTED, переход к 0.4 заблокирован до corrective acceptance.\n- **Homepage collaboration presentation — DONE** via PR #241: Work with me bridge приведён к принятой homepage visual system без изменения canonical route или collaboration truth.\n- **nanoid high-severity remediation — DONE** via PR #242: explicit \`nanoid@3\` floor обновлён до \`3.3.18\`, lockfile регенерирован, high/critical footprint устранён; issue #239 закрыт. Шесть известных moderate markdown-it package records остаются отдельным upstream blocker #82 и не маскируются forced major override.\n- **Production Work with me verifier reconciliation — DONE** via PRs #243–#245. Финальная #245 устранила неверное rebasing raw \`href\` на EN homepage: verifier теперь проверяет DOM-resolved URL и тем самым учитывает принятый \`<base href="../">\` contract, не меняя корректную product markup.\n\n### Exact production acceptance\n\n\`\`\`text\nPR #245 exact head:               4af1a86b8d8c32591fd477ca4940bd1810cfbf95\nBuild:                            #2125 / 31805517531 — SUCCESS\nDependency Review:                #1546 / 31805517697 — SUCCESS\nCodeQL:                           #1706 / 31805517623 — SUCCESS\nPR-safe Production Live:          #600 / 31805517636 — SUCCESS\naccepted squash / deployed SHA:   733a8f5342da6fd5a8c9f8995a2383367145db04\nPages:                            #264 / 31806002715 — SUCCESS\nPages deployment ID:              5907193488\nProduction Live exact deployment: #601 / 31806002659 — SUCCESS\nmaster CodeQL:                    #1707 / 31806002667 — SUCCESS\nproduction artifact:              9221259935\nproduction digest:                sha256:07f4c3fcb5c0ded81b0c82d954d8de21eb0a2c7fcc6c668f9b3c22a440f21c84\n\`\`\`\n\nProduction Live #601 дождался exact deployment \`733a8f...\` и на нём прошёл baseline production, Yandex pre-consent, Portfolio Platform, flagship normalization, English Now/Publications, Work with me, P3.4A–F и favicon gates.\n\nЭтот цикл закрывает repository-side post-N6 reconciliation, но не имитирует внешний запуск или search impact. **Controlled launch остаётся \`not-published\`; launch pack остаётся 10 targets / 38 manual drafts; P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; P4.1C — WAITING; P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE.** Clean-URL observation clock не сбрасывается: \`2026-08-05T00:00:00Z\`. Следующий продуктовый шаг — deliberate manual launch, затем реальные Search Console / Yandex Webmaster observations.\n\n`,
);

const roadmapFile = 'docs/ROADMAP.md';
replaceOnce(
  roadmapFile,
  '> Обновлено: **2026-08-14**, N6 full-site editorial UX + bounded copy polish production-accepted; controlled launch остаётся `not-published`, P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C остаются evidence-gated.',
  '> Обновлено: **2026-08-14**, post-N6 evidence/security/flagship/production-verifier reconciliation production-accepted на `733a8f5342da6fd5a8c9f8995a2383367145db04`; controlled launch остаётся `not-published`, P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C остаются evidence-gated.',
);
insertBefore(
  roadmapFile,
  '## 2026-08-14 accepted N6 full-site editorial UX + bounded copy polish',
  `## 2026-08-14 accepted post-N6 reconciliation\n\n- **Freshness reconciliation — DONE** via PR #238; Content Freshness Guard clean, issue #78 CLOSED / completed.\n- **VillAIgence current flagship truth — DONE** via PR #240; current official release \`0.3.1+1.21.1\`, lifecycle remains \`Release Candidate / ACCEPTANCE IN PROGRESS\`, corrective installed canary remains \`PENDING\`; no false promotion to 0.4.\n- **Homepage Work with me visual alignment — DONE** via PR #241.\n- **nanoid high-severity remediation — DONE** via PR #242; issue #239 CLOSED. Residual six moderate markdown-it records remain owned by upstream blocker #82; next review remains 2026-08-17.\n- **Production verifier repair chain — DONE / PRODUCTION ACCEPTED** via PRs #243–#245. Final deployed SHA \`733a8f5342da6fd5a8c9f8995a2383367145db04\`: Pages #264 / \`31806002715\` SUCCESS, exact-deployment Production Live #601 / \`31806002659\` SUCCESS, master CodeQL #1707 / \`31806002667\` SUCCESS.\n- **No new visual/SEO rewrite is selected.** Repository-side reconciliation is complete.\n- **Next product/operator action remains controlled manual launch** from the accepted 10-target / 38-draft pack. Repository automation must not post, authenticate, schedule or mutate external publication state.\n- After launch, continue P4.1B only from real authenticated/operator-supplied Search Console / Yandex Webmaster evidence. P4.1C and P3.6 remain evidence-gated; clean-URL clock remains \`2026-08-05T00:00:00Z\`.\n- Maintenance boundary: #78 and #239 are closed; #82 remains the upstream Diplodoc/markdown-it blocker; #111 and #212 remain authenticated operator/external-observation work.\n\n`,
);
replaceOnce(
  roadmapFile,
  '- Maintenance remains independent: issue #82 is the upstream Diplodoc/markdown-it blocker (next review 2026-08-17); #78 requires fresh cross-repository evidence; #111 and #212 require authenticated operator/external observations.',
  '- Maintenance remains independent: issue #82 is the upstream Diplodoc/markdown-it blocker (next review 2026-08-17); #78 is closed after a clean freshness pass; #239 is closed after nanoid remediation; #111 and #212 require authenticated operator/external observations.',
);

const changelogFile = 'docs/CHANGELOG.md';
replaceOnce(
  changelogFile,
  '> Обновлено: **2026-08-14**, N6 full-site editorial UX + bounded copy polish production-reconciled; controlled launch остаётся `not-published`, P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C остаются открытыми.',
  '> Обновлено: **2026-08-14**, post-N6 evidence/security/flagship/production-verifier reconciliation production-accepted на `733a8f5342da6fd5a8c9f8995a2383367145db04`; controlled launch остаётся `not-published`, P4.1B review — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE, P3.6/P4.1C остаются открытыми.',
);
insertBefore(
  changelogFile,
  '## 2026-08-14 — N6 full-site editorial UX + bounded copy polish — PRODUCTION ACCEPTED',
  `## 2026-08-14 — Post-N6 evidence/security/flagship/production verifier reconciliation — PRODUCTION ACCEPTED\n\n- PR #238 reconciled volatile project evidence and stale browser expectations; a clean Content Freshness rerun ended with 0 findings and closed issue #78.\n- PR #240 reconciled VillAIgence case-study truth to official release \`0.3.1+1.21.1\` while preserving \`Release Candidate / ACCEPTANCE IN PROGRESS\`, the pending exact installed corrective canary and the historical accepted \`0.2.0+1.21.1\` installed baseline.\n- PR #241 aligned the homepage Work with me bridge with the accepted C2 visual system without changing canonical routes or collaboration semantics.\n- PR #242 remediated the newly effective nanoid high-severity advisory with the minimal \`3.3.18\` patch, regenerated the lockfile and closed #239. The six known markdown-it moderate records remain isolated under upstream blocker #82.\n- PRs #243/#244 repaired stale production Work with me selectors/contracts. Deployment-bound verification then exposed one EN-only verifier bug: raw \`href="en/work-with-me/"\` was rebased against the page URL instead of the document \`<base href="../">\`. Product markup itself was correct.\n- PR #245 fixed the verifier at the correct abstraction boundary by validating the browser-resolved anchor URL and strengthened the local regression contract. Exact head \`4af1a86b8d8c32591fd477ca4940bd1810cfbf95\`: Build #2125 / \`31805517531\`, Dependency Review #1546 / \`31805517697\`, CodeQL #1706 / \`31805517623\`, PR-safe Production Live #600 / \`31805517636\` — all SUCCESS.\n- PR #245 squash / deployed SHA \`733a8f5342da6fd5a8c9f8995a2383367145db04\`: Pages #264 / \`31806002715\` — SUCCESS; deployment \`5907193488\`; exact-deployment Production Live #601 / \`31806002659\` — SUCCESS; master CodeQL #1707 / \`31806002667\` — SUCCESS. Production artifact \`9221259935\`, digest \`sha256:07f4c3fcb5c0ded81b0c82d954d8de21eb0a2c7fcc6c668f9b3c22a440f21c84\`.\n- No external launch/search-impact claim is introduced. Controlled launch remains **not-published**; launch pack remains **10 targets / 38 manual drafts**; P4.1B remains **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**; P4.1C remains **WAITING**; P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; clean-URL clock remains \`2026-08-05T00:00:00Z\`.\n\n`,
);

console.log('Post-N6 project state, roadmap and changelog reconciled.');
