const fs = require('node:fs');

const file = 'docs/PROJECT_STATE.md';
const source = fs.readFileSync(file, 'utf8');
const from = `## 6. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

Continue with:

**P3.5C — English Publications — NEXT**.

P3.5B уже публикует \`/en/now/\` из того же canonical now-data contract без второго English state registry. Следующий bounded этап локализует Publications presentation поверх существующего publication registry и одного generated search. Draft или непроверенные external-project claims не продвигаются.`;
const to = `## 6. Approved next product slice

Portfolio 1.0 remains **IN PROGRESS**.

Continue with:

**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**

P3.6A measurement-readiness tooling уже принято на exact SHA \`7cc56d024fbde53156a9136b14b00c81c6718811\`. Сам P3.6 остаётся observation checkpoint: запускать его только с реальными \`operator-observed\` aggregate observations после минимального post-migration window, с equal-duration baseline/current windows, explicit traffic-sufficiency assessment после закрытия current window и human review. Synthetic \`synthetic-pipeline-proof\` не является production measurement evidence и не разрешает engagement, causality или product-impact claims.`;

const count = source.split(from).length - 1;
if (count !== 1) {
  throw new Error(`${file}: expected exactly one stale P3.5C next-state block, got ${count}`);
}

fs.writeFileSync(file, source.replace(from, to), 'utf8');
console.log('PROJECT_STATE next slice advanced to P3.6 waiting state.');
