import fs from 'node:fs';

const path = 'data/project-history/portfolio-platform.json';
const history = JSON.parse(fs.readFileSync(path, 'utf8'));
const current = history.find((entry) => entry.state === 'current');
if (!current || !/C7.*production baseline/i.test(current.title)) {
  throw new Error('missing migrated C7 current timeline entry');
}
if (!/P3\.6.*NEXT|WAITING/i.test(current.description)) {
  current.description += ' P3.6 remains NEXT / WAITING for real operator-observed aggregate evidence and human review.';
}
fs.writeFileSync(path, `${JSON.stringify(history, null, 2)}\n`);
