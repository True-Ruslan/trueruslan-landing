import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const lockfilePath = path.join(root, 'package-lock.json');
const minimumSafeFastXmlParser = [5, 7, 0];

function compareVersion(version, minimum) {
  const parts = String(version)
    .split('-', 1)[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10));

  if (parts.length < 3 || parts.some(Number.isNaN)) {
    return -1;
  }

  for (let index = 0; index < minimum.length; index += 1) {
    const current = parts[index] ?? 0;
    if (current !== minimum[index]) {
      return current > minimum[index] ? 1 : -1;
    }
  }

  return 0;
}

test('lockfile contains no fast-xml-parser release affected by GHSA-gh4j-gqv2-49f6', () => {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const violations = Object.entries(lockfile.packages ?? {})
    .filter(([packagePath]) => /(^|\/)node_modules\/fast-xml-parser$/.test(packagePath))
    .filter(([, metadata]) => compareVersion(metadata?.version, minimumSafeFastXmlParser) < 0)
    .map(([packagePath, metadata]) => `${packagePath}: ${metadata?.version ?? 'unknown'}`);

  assert.deepEqual(
    violations,
    [],
    `Affected fast-xml-parser versions remain in package-lock.json:\n${violations.join('\n')}`,
  );
});
