import fs from 'node:fs';

const file = 'docs/ROADMAP.md';
const source = fs.readFileSync(file, 'utf8');
const before = 'Continue with **P3.6 — Measurement checkpoint — NEXT / WAITING** only when real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.';
const after = 'Continue with **C3 — Projects and flagship summary layer** as the next product implementation slice. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** parallel and untouched until real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.';
const first = source.indexOf(before);
if (first === -1) throw new Error(`${file}: session-rule anchor missing`);
if (source.indexOf(before, first + before.length) !== -1) throw new Error(`${file}: session-rule anchor duplicated`);
fs.writeFileSync(file, source.replace(before, after));
fs.rmSync('scripts/c2-roadmap-new-session-migration.mjs', {force: true});
fs.rmSync('.github/workflows/c2-roadmap-new-session-migration.yml', {force: true});
