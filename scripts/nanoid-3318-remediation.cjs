const fs = require('node:fs');

const packagePath = 'package.json';
const testPath = 'scripts/dependency-security.test.js';

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (packageJson.overrides?.['nanoid@3'] !== '3.3.17') {
  throw new Error(`Expected nanoid@3 override 3.3.17, got ${packageJson.overrides?.['nanoid@3'] ?? 'missing'}`);
}
packageJson.overrides['nanoid@3'] = '3.3.18';
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

let testSource = fs.readFileSync(testPath, 'utf8');
const replacements = [
  ["assert.equal(packageJson.overrides?.['nanoid@3'], '3.3.17');", "assert.equal(packageJson.overrides?.['nanoid@3'], '3.3.18');"],
  ["compareVersion(version, [3, 3, 17]) < 0", "compareVersion(version, [3, 3, 18]) < 0"],
];
for (const [from, to] of replacements) {
  if (!testSource.includes(from)) throw new Error(`Expected dependency-security marker missing: ${from}`);
  testSource = testSource.replace(from, to);
}
fs.writeFileSync(testPath, testSource);
