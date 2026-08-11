import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildPersonJsonLd} from './seo.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function pageMetaByPath() {
  return new Map(JSON.parse(read('data/page-meta.json')).map((entry) => [entry.path, entry]));
}

test('C6 i18n browser acceptance derives every controlled pair from the canonical manifest', () => {
  const manifest = JSON.parse(read('data/i18n.json'));
  const browserSmoke = read('scripts/i18n-browser-smoke.cjs');

  assert.equal(manifest.length, 13, 'controlled bilingual milestone unexpectedly changed');
  assert.match(browserSmoke, /data\/i18n\.json/);
  assert.doesNotMatch(browserSmoke, /const\s+PAIRS\s*=\s*\[/, 'browser acceptance may not maintain a second hard-coded i18n pair list');
  assert.ok(manifest.some((pair) => pair.id === 'work-with-me'), 'canonical manifest must include work-with-me');
  assert.match(browserSmoke, /generatedHtmlPathToPublicRoute/);
});

test('C6 gives every controlled English route one canonical page-metadata owner', () => {
  const pairs = JSON.parse(read('data/i18n.json'));
  const metadata = pageMetaByPath();

  for (const pair of pairs) {
    assert.ok(metadata.has(pair.en), `missing explicit page metadata for ${pair.en}`);
    const entry = metadata.get(pair.en);
    assert.ok(entry.title.length >= 10, `${pair.en}: title too short`);
    assert.ok(entry.description.length >= 50, `${pair.en}: description too short`);
  }

  assert.equal(metadata.get('en/index.html').title, 'Ruslan Nemykin — Java Backend Engineer');
  assert.equal(metadata.get('en/resume.html').title, 'Experience — Ruslan Nemykin');
});

test('C6 metadata browser gate covers the English homepage through canonical generated metadata', () => {
  const smoke = read('scripts/metadata-smoke.cjs');
  assert.match(smoke, /path:\s*['"]\/en\/['"]/);
  assert.match(smoke, /card:\s*['"]home-en['"]/);
  assert.match(smoke, /Ruslan Nemykin — Java Backend Engineer/);
});

test('C6 reconciles Person structured data across RU and EN home surfaces', () => {
  const schema = buildPersonJsonLd('https://example.test');
  const postprocessor = read('scripts/copy-assets.js');

  assert.equal(schema.name, 'Руслан Немыкин');
  assert.equal(schema.alternateName, 'Ruslan Nemykin');
  assert.match(postprocessor, /en[^\n]{0,80}index\.html|index\.html[^\n]{0,80}en/);
  assert.match(postprocessor, /Person schema[^\n]*2|personSchema[^\n]*2|personSchemaTargets/i);
});

test('C6 English professional surfaces keep paired links in English and label RU-only deep links', () => {
  const resume = read('docs/en/resume.md');
  const about = read('docs/en/about.md');

  assert.match(resume, /\[Publications\]\(publications\.md\)/);
  assert.doesNotMatch(resume, /\[Publications\]\(\.\.\/landing\/publications\.html\)/);
  assert.match(resume, /Engineering Notes \(RU\)|Engineering Notes \(Russian\)/);

  assert.match(about, /\[Publications\]\(publications\.md\)/);
  assert.match(about, /Sources \(RU\)|Sources \(Russian\)/);
  assert.match(about, /Engineering Notes \(RU\)|Engineering Notes \(Russian\)/);
});

test('C6 removes internal implementation jargon from top-level English discovery copy', () => {
  const projects = read('docs/en/projects.md');
  const now = read('docs/en/now.md');

  assert.doesNotMatch(projects, /where authority lives|what counts as verified/i);
  assert.doesNotMatch(now, /shared Project Registry|source of truth|authority boundary/i);
  assert.match(projects, /backend|systems|engineering/i);
  assert.match(now, /building|learning|writing|engineering focus/i);
});
