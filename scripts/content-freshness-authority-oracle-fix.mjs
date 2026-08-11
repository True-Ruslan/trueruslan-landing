import fs from 'node:fs';

const files = [
  'scripts/flagship-normalization.test.js',
  'scripts/product-evidence-reconciliation.test.js',
  'scripts/villaigence-flagship.test.js',
];
const before = '/no AI-to-FACT path/i';
const after = '/Server-owned provenance.*FACT authority remain unchanged/i';
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${file}: expected exactly one authority assertion, got ${count}`);
  fs.writeFileSync(file, source.replace(before, after));
}
