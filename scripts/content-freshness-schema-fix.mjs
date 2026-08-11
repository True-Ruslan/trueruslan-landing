import fs from 'node:fs';

const path = 'data/project-evidence.json';
const evidence = JSON.parse(fs.readFileSync(path, 'utf8'));
const snapshot = evidence.find((entry) => entry.project === 'vlezet');
if (!snapshot) throw new Error('missing Vlezet evidence snapshot');

for (const number of [85, 87]) {
  const url = `https://github.com/True-Ruslan/vlezet/pull/${number}`;
  const signal = snapshot.signals.find((entry) => entry.url === url);
  if (!signal) throw new Error(`missing reconciled PR #${number}`);
  if (signal.kind !== 'pr') throw new Error(`PR #${number} kind changed unexpectedly`);
  if (signal.mode !== 'manual') throw new Error(`PR #${number} expected manual mode before schema fix`);
  signal.mode = 'automated';
}

fs.writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`);
