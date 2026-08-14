const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, 'v03-browser-smoke.cjs');
const before = "requiredText: ['0.2.0+1.21.1', '7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004', 'PR #110', 'PR #123', 'PR #125', 'Draft/RED', 'SYSTEM_OBSERVED'],";
const after = "requiredText: ['0.3.1+1.21.1', '0.2.0+1.21.1', '7 PASS / 0 FAIL', 'VAI-PCM-MULTI-001', 'VAI-M2-INST-005', 'VAI-CONCUR-004', 'PR #110', 'PR #123', 'PR #125', 'PR #165', 'PR #167', 'PENDING', 'SYSTEM_OBSERVED'],";

const source = fs.readFileSync(target, 'utf8');
const occurrences = source.split(before).length - 1;
if (occurrences !== 2) {
  throw new Error(`Expected exactly 2 stale VillAIgence v0.3 marker sets, found ${occurrences}.`);
}

const updated = source.split(before).join(after);
if (updated.includes("'Draft/RED'")) {
  throw new Error('Stale Draft/RED marker remains in v03 browser smoke.');
}
for (const marker of ['0.3.1+1.21.1', 'VAI-PCM-MULTI-001', 'PR #165', 'PR #167', 'PENDING']) {
  const count = updated.split(`'${marker}'`).length - 1;
  if (count < 2) throw new Error(`Expected RU/EN v0.3 smoke coverage for ${marker}, found ${count}.`);
}

fs.writeFileSync(target, updated, 'utf8');
console.log('Aligned RU/EN v0.3 flagship browser-smoke markers with VillAIgence 0.3.1 acceptance boundary.');
