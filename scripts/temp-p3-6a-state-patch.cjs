const fs = require('node:fs');

function replaceExactly(file, from, to) {
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${file}: expected exactly one anchor, got ${count}`);
  fs.writeFileSync(file, source.replace(from, to), 'utf8');
}

const SHA = '7cc56d024fbde53156a9136b14b00c81c6718811';
const PR_BUILD_RUN = '31185270870';
const PR_QUALITY_ARTIFACT = '8996659434';
const PR_QUALITY_DIGEST = 'sha256:07b6c53547894d1456525ed5574ecb9554c15a2178c16193435cf91937b06a32';
const PR_MEASUREMENT_RUN = '31185271128';
const PR_MEASUREMENT_ARTIFACT = '8996446081';
const PR_MEASUREMENT_DIGEST = 'sha256:7a1f05c829867c7bc0fff757a512a95f11e2c1fcb27a3684d2acc90ecfbef87a';
const POST_MERGE_MEASUREMENT_RUN = '31185967995';
const POST_MERGE_MEASUREMENT_ARTIFACT = '8996722305';
const POST_MERGE_MEASUREMENT_DIGEST = 'sha256:d6ab858824c2284a964a4b37f0e7377bb322af8baed922b8af83b27bbb36bce9';
const PAGES_RUN = '31185967012';
const PAGES_DEPLOYMENT = '5795968137';
const PAGES_ARTIFACT = '8996733610';
const PAGES_DIGEST = 'sha256:bda25b1331e9843a7b6f3364f47fdbea8f5fa7ef09a6445c55729062f3e6bfbf';
const PRODUCTION_RUN = '31186078593';
const PRODUCTION_ARTIFACT = '8996831585';
const PRODUCTION_DIGEST = 'sha256:d8e4fae2cf63bfc1d2c8742eea68d4fbdb3d9ef588df834d2e65473fa22a475d';

const evidenceBlock = `\`\`\`text\nPR #155 squash / deployed SHA:       ${SHA}\nPR Build:                            #1187 / ${PR_BUILD_RUN} — SUCCESS\nPR quality artifact:                 ${PR_QUALITY_ARTIFACT}\nPR quality digest:                   ${PR_QUALITY_DIGEST}\nPR Measurement Checkpoint:           #16 / ${PR_MEASUREMENT_RUN} — SUCCESS\nPR synthetic artifact:               ${PR_MEASUREMENT_ARTIFACT}\nPR synthetic digest:                 ${PR_MEASUREMENT_DIGEST}\npost-merge Measurement Checkpoint:   #17 / ${POST_MERGE_MEASUREMENT_RUN} — SUCCESS\npost-merge synthetic artifact:       ${POST_MERGE_MEASUREMENT_ARTIFACT}\npost-merge synthetic digest:         ${POST_MERGE_MEASUREMENT_DIGEST}\nPages:                               #184 / ${PAGES_RUN} — SUCCESS\nPages deployment ID:                 ${PAGES_DEPLOYMENT}\nPages artifact:                      ${PAGES_ARTIFACT}\nPages artifact digest:               ${PAGES_DIGEST}\nProduction Live Smoke:               #267 / ${PRODUCTION_RUN} — SUCCESS\nproduction artifact:                 ${PRODUCTION_ARTIFACT}\nproduction digest:                   ${PRODUCTION_DIGEST}\n\`\`\``;

const boundary = `Synthetic workflow evidence is classified as \`synthetic-pipeline-proof\`, has \`readyForHumanReview=false\`, and is **not production measurement evidence**. Real P3.6 remains open until \`operator-observed\` aggregate observations exist, the minimum post-migration window has elapsed, baseline/current windows have equal duration, the operator assessment occurs after the current window closes, traffic sufficiency is explicitly assessed, and a human reviews the descriptive report. No automatic engagement, causality or product-impact conclusion is permitted.`;

// PROJECT_STATE
replaceExactly(
  'docs/PROJECT_STATE.md',
  '> Последнее смысловое обновление: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5C English Publications.',
  '> Последнее смысловое обновление: **2026-08-07**, после exact acceptance P3.6A Measurement readiness; реальный P3.6 measurement остаётся открытым.',
);
replaceExactly(
  'docs/PROJECT_STATE.md',
  `P3.5C is accepted only on exact deployed SHA \`f189d100785f0aea363df306fb7a923c06ee61a2\`; exact-head CI without the corresponding Pages deployment identity and Production Live Smoke is not equivalent production acceptance.\n\n---\n\n## 3. External project evidence boundaries`,
  `P3.5C is accepted only on exact deployed SHA \`f189d100785f0aea363df306fb7a923c06ee61a2\`; exact-head CI without the corresponding Pages deployment identity and Production Live Smoke is not equivalent production acceptance.\n\n### P3.6A — Measurement readiness — DONE\n\nP3.6A is the latest accepted engineering/tooling milestone. It adds a privacy-bounded aggregate measurement analyzer, deterministic JSON/Markdown report CLI, manual secret-backed workflow and synthetic PR/master proof without changing the latest accepted user-facing product truth (P3.5C).\n\n${evidenceBlock}\n\n${boundary}\n\n**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**\n\n---\n\n## 3. External project evidence boundaries`,
);

// ROADMAP
replaceExactly(
  'docs/ROADMAP.md',
  '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5C English Publications.',
  '> Обновлено: **2026-08-07**, после exact acceptance P3.6A Measurement readiness; P3.6 measurement ожидает внешние aggregate observations.',
);
replaceExactly(
  'docs/ROADMAP.md',
  `## P3.6 — Measurement checkpoint — NEXT\n\nAfter sufficient aggregate traffic, compare aggregate traffic and clean-route indexing without making engagement claims from insufficient data. P3.6 is an observation checkpoint, not permission to infer engagement or product impact from an insufficient sample.`,
  `### P3.6A — Measurement readiness — DONE\n\nAccepted tooling provides a fail-closed aggregate-only analyzer, deterministic report CLI and minimally privileged Measurement Checkpoint workflow. Synthetic PR/master executions are permanently classified as \`synthetic-pipeline-proof\`; they cannot become \`ready-for-human-review\` and are not production measurement evidence. Manual real observations must declare \`evidenceClass: "operator-observed"\`.\n\n${evidenceBlock}\n\n${boundary}\n\n## P3.6 — Measurement checkpoint — NEXT / WAITING\n\nAfter sufficient aggregate traffic, run the manual checkpoint with real \`operator-observed\` Cloudflare Web Analytics, Google Search Console and Yandex Webmaster aggregates. P3.6 remains an observation checkpoint, not permission to infer engagement or product impact from an insufficient sample or from synthetic pipeline proof.`,
);
replaceExactly(
  'docs/ROADMAP.md',
  `Confirm P3.5C exact production acceptance for SHA \`f189d100785f0aea363df306fb7a923c06ee61a2\`, Pages run \`31180427543\`, deployment \`5794904843\` and Production Live run \`31180478038\`. Continue with **P3.6 — Measurement checkpoint**, but do not infer engagement until sufficient aggregate traffic exists.`,
  `Confirm P3.5C exact production acceptance for SHA \`f189d100785f0aea363df306fb7a923c06ee61a2\`, Pages run \`31180427543\`, deployment \`5794904843\` and Production Live run \`31180478038\`. Confirm P3.6A Measurement readiness acceptance for SHA \`${SHA}\`, post-merge Measurement Checkpoint run \`${POST_MERGE_MEASUREMENT_RUN}\`, Pages run \`${PAGES_RUN}\`, deployment \`${PAGES_DEPLOYMENT}\` and Production Live run \`${PRODUCTION_RUN}\`. Continue with **P3.6 — Measurement checkpoint — NEXT / WAITING** only when real \`operator-observed\` aggregate evidence satisfies the documented window and human-review boundaries.`,
);

// Main Portfolio 1.0 specification
replaceExactly(
  'docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md',
  '> Status: **IN PROGRESS — P3.5C ACCEPTED IN PRODUCTION**',
  '> Status: **IN PROGRESS — P3.6A MEASUREMENT READINESS ACCEPTED; P3.6 MEASUREMENT WAITING**',
);
replaceExactly(
  'docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md',
  `### P3.6 — Measurement checkpoint — NEXT\n\nMeasurement remains bounded by sufficient aggregate traffic. Until that evidence exists, no engagement or product-impact conclusion is promoted from sparse analytics.`,
  `### P3.6A — Measurement readiness — DONE\n\nThe repository now owns the bounded measurement machinery, not the missing external evidence. Inputs are aggregate-only and explicitly classified as \`operator-observed\` or \`synthetic\`. Synthetic executions always produce \`synthetic-pipeline-proof\`, preserve \`readyForHumanReview=false\`, and are not production measurement evidence. Raw/user-level telemetry is rejected; raw observation input is never uploaded.\n\n${evidenceBlock}\n\n${boundary}\n\n### P3.6 — Measurement checkpoint — NEXT / WAITING\n\nReal measurement remains bounded by sufficient \`operator-observed\` aggregate traffic and the documented minimum-window/equal-duration/operator-timestamp rules. Until that evidence exists and is reviewed by a human, no engagement, causality or product-impact conclusion is promoted.`,
);

// CHANGELOG
replaceExactly(
  'docs/CHANGELOG.md',
  '> Обновлено: **2026-08-07**, после exact production-acceptance Portfolio 1.0 P3.5C English Publications.',
  '> Обновлено: **2026-08-07**, после exact acceptance P3.6A Measurement readiness; P3.6 measurement остаётся открытым.',
);
replaceExactly(
  'docs/CHANGELOG.md',
  '## 2026-08-07 — P3.5C English Publications',
  `## 2026-08-07 — P3.6A Measurement readiness\n\nPR #155 added the bounded P3.6 measurement-readiness layer without manufacturing external analytics evidence. The analyzer accepts aggregate Cloudflare/Search Console/Yandex observations only, rejects raw/user-level telemetry, enforces the migration observation window, equal-duration comparison windows and post-window operator assessment, and emits descriptive deltas without automatic engagement or product-impact conclusions.\n\nSynthetic PR/master proof is explicitly separated from real measurement: it reports \`synthetic-pipeline-proof\`, keeps \`readyForHumanReview=false\` and is **not production measurement evidence**. Manual real input must be \`operator-observed\`; raw observations live only under \`$RUNNER_TEMP\` and are never uploaded.\n\n${evidenceBlock}\n\n${boundary}\n\nP3.6 remains **NEXT / WAITING** for real external aggregate evidence and human review.\n\n## 2026-08-07 — P3.5C English Publications`,
);

// Dedicated P3.6 runbook
replaceExactly(
  'docs/keystone/specs/2026-08-07-p3-6-measurement-readiness.md',
  '> Status: **P3.6A IMPLEMENTED / P3.6 MEASUREMENT NOT YET ACCEPTED**',
  '> Status: **P3.6A ACCEPTED / P3.6 MEASUREMENT NOT YET ACCEPTED**',
);
replaceExactly(
  'docs/keystone/specs/2026-08-07-p3-6-measurement-readiness.md',
  `## Acceptance of P3.6\n\nP3.6A can be accepted when the analyzer, CLI, workflow contract and synthetic post-merge workflow proof are green. That post-merge artifact must identify itself as \`synthetic\` / \`synthetic-pipeline-proof\` and is evidence of pipeline operation only.\n\n**P3.6 itself must remain open** until real \`operator-observed\` aggregate observations exist, the minimum external observation window has elapsed, comparable equal-duration windows are available, the operator has explicitly assessed traffic sufficiency after the current window closes, and the resulting report has been reviewed without promoting unsupported engagement or causality claims.`,
  `## Acceptance of P3.6\n\nP3.6A is accepted on exact squash SHA \`${SHA}\`. The analyzer, CLI, workflow contract, PR synthetic proof, post-merge synthetic proof, Pages deployment and Production Live regressions are green.\n\n${evidenceBlock}\n\nThe post-merge measurement artifact identifies itself as \`synthetic\` / \`synthetic-pipeline-proof\`, keeps \`readyForHumanReview=false\`, and is evidence of pipeline operation only — not production measurement evidence.\n\n**P3.6 itself remains open** until real \`operator-observed\` aggregate observations exist, the minimum external observation window has elapsed, comparable equal-duration windows are available, the operator has explicitly assessed traffic sufficiency after the current window closes, and the resulting report has been reviewed without promoting unsupported engagement or causality claims.`,
);

console.log('P3.6A durable acceptance patched successfully.');
