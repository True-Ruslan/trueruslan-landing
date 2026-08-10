import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function section(source, heading, nextHeading) {
  const start = source.indexOf(heading);
  assert.notEqual(start, -1, `missing section heading: ${heading}`);
  const end = nextHeading ? source.indexOf(nextHeading, start + heading.length) : source.length;
  assert.notEqual(end, -1, `missing following section heading: ${nextHeading}`);
  return source.slice(start, end);
}

function markerValues(source, attribute) {
  return [...source.matchAll(new RegExp(`${attribute}=["']([^"']+)["']`, 'g'))].map((match) => match[1]);
}

function assertOrdered(source, markers, label) {
  let previous = -1;
  for (const marker of markers) {
    const index = source.indexOf(marker, previous + 1);
    assert.notEqual(index, -1, `${label} missing ordered marker: ${marker}`);
    assert.ok(index > previous, `${label} has out-of-order marker: ${marker}`);
    previous = index;
  }
}

function assertProjectHub({path: relativePath, headings}) {
  const source = read(relativePath);
  assertOrdered(source, headings, relativePath);

  const selected = section(source, headings[0], headings[1]);
  assert.deepEqual(
    markerValues(selected, 'data-c3-project'),
    ['livingworld', 'notchhub', 'portfolio-platform'],
    `${relativePath} selected work must contain exactly the three current public flagships`,
  );

  const commercial = section(source, headings[1], headings[2]);
  assert.deepEqual(markerValues(commercial, 'data-c3-commercial'), ['marketdb']);

  const labs = section(source, headings[2]);
  assert.deepEqual(
    markerValues(labs, 'data-c3-lab'),
    ['vlezet', 'node-zero', 'taskhub', 'minichess', 'godot-horror-template'],
    `${relativePath} labs section must preserve the bounded non-spotlight project set`,
  );
  assert.doesNotMatch(selected, /data-c3-project=["']vlezet["']/);
}

function assertFlagshipGlance(relativePath, slug, locale) {
  const source = read(relativePath);
  const problemMarker = '<!-- case-study:problem -->';
  const problemIndex = source.indexOf(problemMarker);
  assert.notEqual(problemIndex, -1, `${relativePath} is missing the case-study problem marker`);

  const glancePattern = new RegExp(
    `<dl[^>]*class=["'][^"']*tr-project-glance[^"']*["'][^>]*data-tr-project-glance=["']${slug}["'][^>]*>[\\s\\S]*?<span[^>]*data-tr-project-status=["']${slug}["'][^>]*>\\s*</span>[\\s\\S]*?</dl>`,
    'i',
  );
  const match = source.match(glancePattern);
  assert.ok(match, `${relativePath} must expose one registry-backed flagship glance block`);
  const glanceIndex = source.indexOf(match[0]);
  assert.ok(glanceIndex < problemIndex, `${relativePath} glance block must precede the deep-dive sections`);

  const timelineIndex = source.indexOf(`data-tr-project-timeline="${slug}"`);
  if (timelineIndex !== -1) {
    assert.ok(glanceIndex < timelineIndex, `${relativePath} glance block must precede the project timeline`);
  }

  assert.equal((source.match(new RegExp(`data-tr-project-glance=["']${slug}["']`, 'g')) ?? []).length, 1);

  if (locale === 'ru') {
    assert.match(match[0], /Моя роль/);
    assert.match(match[0], /Стек/);
    assert.match(match[0], /Задача/);
    assert.match(match[0], /Результат/);
    assert.match(match[0], /Статус/);
    assert.doesNotMatch(source.slice(0, problemIndex), /\*\*Текущий статус:\*\*/);
  } else {
    assert.match(match[0], /My contribution/);
    assert.match(match[0], /Stack/);
    assert.match(match[0], /Challenge/);
    assert.match(match[0], /Result/);
    assert.match(match[0], /Status/);
    assert.doesNotMatch(source.slice(0, problemIndex), /\*\*Current status:\*\*/);
  }

  assert.doesNotMatch(match[0], /\b[0-9a-f]{40}\b/i, `${relativePath} glance must not duplicate commit identities`);
  assert.doesNotMatch(match[0], /\b(?:Build|Pages|Production Live)(?: Smoke)?\s*#?\d+/i, `${relativePath} glance must not duplicate run identities`);
}

test('C3 source surfaces expose the approved scan-first Projects hierarchy and flagship summary layer', () => {
  assertProjectHub({
    path: 'docs/landing/projects.md',
    headings: ['## Избранные проекты', '## Коммерческая разработка', '## Лаборатория и эксперименты'],
  });
  assertProjectHub({
    path: 'docs/en/projects.md',
    headings: ['## Selected work', '## Commercial work', '## Labs & experiments'],
  });

  const flagships = [
    ['livingworld', 'docs/landing/projects/livingworld.md', 'docs/en/projects/livingworld.md'],
    ['notchhub', 'docs/landing/projects/notchhub.md', 'docs/en/projects/notchhub.md'],
    ['portfolio-platform', 'docs/landing/projects/portfolio-platform.md', 'docs/en/projects/portfolio-platform.md'],
    ['vlezet', 'docs/landing/projects/vlezet.md', 'docs/en/projects/vlezet.md'],
  ];
  for (const [slug, ruPath, enPath] of flagships) {
    assertFlagshipGlance(ruPath, slug, 'ru');
    assertFlagshipGlance(enPath, slug, 'en');
  }

  const platformRu = read('docs/landing/projects/portfolio-platform.md');
  assert.doesNotMatch(platformRu, /`\/landing\/(?:projects|resume|notes)\//, 'platform case study must use root-level canonical RU routes');
});

test('C3 browser smoke owns generated-DOM acceptance for the projects hub and flagship glance layer', () => {
  const browserSmoke = read('scripts/v03-browser-smoke.cjs');

  assert.match(browserSmoke, /async function assertC3ProjectsHub\(/);
  assert.match(browserSmoke, /async function assertC3FlagshipGlance\(/);
  assert.match(browserSmoke, /\[data-c3-project\]/);
  assert.match(browserSmoke, /\[data-c3-commercial/);
  assert.match(browserSmoke, /\[data-c3-lab\]/);
  assert.match(browserSmoke, /\[data-tr-project-glance=/);
  assert.match(browserSmoke, /await assertC3ProjectsHub\(page\)/);
  assert.match(browserSmoke, /await assertC3FlagshipGlance\(page, 'livingworld'/);
  assert.match(browserSmoke, /await assertC3FlagshipGlance\(page, 'notchhub'/);
  assert.match(browserSmoke, /await assertC3FlagshipGlance\(page, 'portfolio-platform'/);
  assert.match(browserSmoke, /await assertC3FlagshipGlance\(page, 'vlezet'/);
});
