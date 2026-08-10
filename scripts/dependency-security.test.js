import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import {XMLValidator} from 'fast-xml-parser';
import {compose, extract} from '@diplodoc/translation';

const root = path.resolve(import.meta.dirname, '..');
const lockfilePath = path.join(root, 'package-lock.json');
const packageJsonPath = path.join(root, 'package.json');
const minimumSafeFastXmlParser = [5, 7, 0];

function versionParts(version) {
  return String(version)
    .split('-', 1)[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10));
}

function compareVersion(version, minimum) {
  const parts = versionParts(version);

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

function lockfileEntriesFor(lockfile, packageName) {
  const suffix = `/node_modules/${packageName}`;
  return Object.entries(lockfile.packages ?? {}).filter(
    ([packagePath]) => packagePath === `node_modules/${packageName}` || packagePath.endsWith(suffix),
  );
}

test('lockfile contains no fast-xml-parser release affected by GHSA-gh4j-gqv2-49f6', () => {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const violations = lockfileEntriesFor(lockfile, 'fast-xml-parser')
    .filter(([, metadata]) => compareVersion(metadata?.version, minimumSafeFastXmlParser) < 0)
    .map(([packagePath, metadata]) => `${packagePath}: ${metadata?.version ?? 'unknown'}`);

  assert.deepEqual(
    violations,
    [],
    `Affected fast-xml-parser versions remain in package-lock.json:\n${violations.join('\n')}`,
  );
});

test('fast-xml-parser 5.x remains compatible with the Diplodoc translation round trip', () => {
  assert.equal(XMLValidator.validate('<root><value>safe</value></root>'), true);
  assert.notEqual(XMLValidator.validate('<root>'), true);

  const markdown = '# Heading\n\nParagraph';
  const {skeleton, xliff} = extract(markdown, {
    source: {language: 'en', locale: 'US'},
    target: {language: 'ru', locale: 'RU'},
  });
  const composed = compose(skeleton, xliff, {useSource: true});

  assert.match(xliff, /<xliff\b/);
  assert.match(composed, /Heading/);
  assert.match(composed, /Paragraph/);
});

test('unused page-constructor dependency and its vulnerable-only graph are absent', () => {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));

  assert.equal(packageJson.dependencies?.['@gravity-ui/page-constructor'], undefined);
  assert.deepEqual(lockfileEntriesFor(lockfile, '@gravity-ui/page-constructor'), []);
});

test('brace-expansion and undici are beyond every current high-severity advisory range', () => {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const violations = [];

  for (const [packagePath, metadata] of lockfileEntriesFor(lockfile, 'brace-expansion')) {
    const version = metadata?.version;
    const [major] = versionParts(version);
    const affected =
      (major === 2 && compareVersion(version, [2, 1, 4]) < 0) ||
      (major >= 3 && major < 5) ||
      (major === 5 && compareVersion(version, [5, 0, 9]) < 0);
    if (affected) violations.push(`${packagePath}: ${version}`);
  }

  for (const [packagePath, metadata] of lockfileEntriesFor(lockfile, 'undici')) {
    if (compareVersion(metadata?.version, [7, 29, 0]) < 0) {
      violations.push(`${packagePath}: ${metadata?.version ?? 'unknown'}`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `High-severity dependency versions remain in package-lock.json:\n${violations.join('\n')}`,
  );
});

test('low-risk audit packages remain on fixed patch or minor releases', () => {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const violations = [];

  const minimums = new Map([
    ['katex', [0, 16, 21]],
    ['lodash', [4, 18, 0]],
    ['sanitize-html', [2, 17, 5]],
    ['svgo', [3, 3, 4]],
    ['uuid', [11, 1, 1]],
  ]);

  for (const [packageName, minimum] of minimums) {
    for (const [packagePath, metadata] of lockfileEntriesFor(lockfile, packageName)) {
      if (compareVersion(metadata?.version, minimum) < 0) {
        violations.push(`${packagePath}: ${metadata?.version ?? 'unknown'}`);
      }
    }
  }

  for (const [packagePath, metadata] of lockfileEntriesFor(lockfile, 'js-yaml')) {
    const [major] = versionParts(metadata?.version);
    if (major === 4 && compareVersion(metadata?.version, [4, 3, 1]) < 0) {
      violations.push(`${packagePath}: ${metadata?.version ?? 'unknown'}`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Affected low-risk dependency versions remain in package-lock.json:\n${violations.join('\n')}`,
  );
});

test('js-yaml and nanoid patch overrides own the current high-severity remediation', () => {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assert.equal(packageJson.overrides?.['js-yaml@3'], '3.15.1');
  assert.equal(packageJson.overrides?.['js-yaml@4'], '4.3.1');
  assert.equal(packageJson.overrides?.['nanoid@3'], '3.3.17');
});

test('js-yaml and nanoid are beyond the current high-severity advisory ranges', () => {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const violations = [];

  for (const [packagePath, metadata] of lockfileEntriesFor(lockfile, 'js-yaml')) {
    const version = metadata?.version;
    const [major] = versionParts(version);
    const affected =
      (major === 3 && compareVersion(version, [3, 15, 1]) < 0) ||
      (major === 4 && compareVersion(version, [4, 3, 1]) < 0);
    if (affected) violations.push(`${packagePath}: ${version} (GHSA-5p4m-2wfm-xmqj)`);
  }

  for (const [packagePath, metadata] of lockfileEntriesFor(lockfile, 'nanoid')) {
    const version = metadata?.version;
    const [major] = versionParts(version);
    if (major === 3 && compareVersion(version, [3, 3, 17]) < 0) {
      violations.push(`${packagePath}: ${version} (GHSA-2v37-7h3g-55p8)`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Current high-severity dependency versions remain in package-lock.json:\n${violations.join('\n')}`,
  );
});

test('linkify-it is beyond every currently affected advisory range', () => {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const violations = lockfileEntriesFor(lockfile, 'linkify-it')
    .filter(([, metadata]) => compareVersion(metadata?.version, [5, 0, 2]) < 0)
    .map(([packagePath, metadata]) => `${packagePath}: ${metadata?.version ?? 'unknown'}`);

  assert.deepEqual(
    violations,
    [],
    `Affected linkify-it versions remain in package-lock.json:\n${violations.join('\n')}`,
  );
});

test('the supported markdown-it line preserves core Diplodoc-facing rendering semantics', () => {
  const markdown = new MarkdownIt({html: false, linkify: true, typographer: true});
  const rendered = markdown.render([
    '# Heading',
    '',
    'Visit https://example.com and "quoted text".',
    '',
    '| Name | Value |',
    '| --- | --- |',
    '| alpha | beta |',
  ].join('\n'));

  assert.match(rendered, /<h1>Heading<\/h1>/);
  assert.match(rendered, /href="https:\/\/example\.com"/);
  assert.match(rendered, /“quoted text”/);
  assert.match(rendered, /<table>/);
  assert.doesNotMatch(rendered, /<script\b/i);
});