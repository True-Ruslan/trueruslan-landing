import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const englishCaseStudyPath = path.join(root, 'docs', 'en', 'projects', 'vlezet.md');
const i18n = JSON.parse(fs.readFileSync(path.join(root, 'data', 'i18n.json'), 'utf8'));
const pageMeta = JSON.parse(fs.readFileSync(path.join(root, 'data', 'page-meta.json'), 'utf8'));
const toc = fs.readFileSync(path.join(root, 'docs', 'toc.yaml'), 'utf8');
const englishProjects = fs.readFileSync(path.join(root, 'docs', 'en', 'projects.md'), 'utf8');
const browserSmoke = fs.readFileSync(path.join(root, 'scripts', 'i18n-browser-smoke.cjs'), 'utf8');
const searchSmoke = fs.readFileSync(path.join(root, 'scripts', 'search-smoke.cjs'), 'utf8');
const productionRoutes = fs.readFileSync(path.join(root, 'scripts', 'production-live-routes.cjs'), 'utf8');
const productionSmoke = fs.readFileSync(
  path.join(root, 'scripts', 'production-flagship-normalization-smoke.cjs'),
  'utf8',
);

const REQUIRED_MARKERS = [
  '<!-- case-study:problem -->',
  '<!-- case-study:constraints -->',
  '<!-- case-study:current-state -->',
  '<!-- case-study:decisions -->',
  '<!-- case-study:alternatives -->',
  '<!-- case-study:evidence -->',
  '<!-- case-study:limitations -->',
  '<!-- case-study:next -->',
  '<!-- case-study:related -->',
  '<!-- case-study:retrospective -->',
];

test('P3.5A publishes a controlled English Vlezet flagship without a second state model', () => {
  assert.ok(fs.existsSync(englishCaseStudyPath), 'missing English Vlezet case study');
  const page = fs.readFileSync(englishCaseStudyPath, 'utf8');

  for (const marker of REQUIRED_MARKERS) {
    assert.ok(page.includes(marker), `missing English Vlezet narrative marker: ${marker}`);
  }

  for (const marker of [
    '# Vlezet',
    'data-tr-project-status="vlezet"',
    'data-tr-project-timeline="vlezet"',
    'data-tr-project-evidence="vlezet"',
    'https://github.com/True-Ruslan/vlezet',
    'VlezetDocument',
    'millimetres',
    'M7.8B',
    'PR #42',
    'PR #44',
    'PR #45',
    'Draft',
    '0.85',
    'product-owner retest',
    'explicit Apply',
    'AI geometry authority',
  ]) {
    assert.ok(page.includes(marker), `missing English Vlezet evidence boundary: ${marker}`);
  }

  assert.doesNotMatch(page, /[А-Яа-яЁё]/, 'English Vlezet page contains Cyrillic copy');
  assert.doesNotMatch(page, /PR #(42|44|45)[^\n]*(?:merged|accepted)/i);

  assert.deepEqual(
    i18n.find((pair) => pair.id === 'vlezet'),
    {id: 'vlezet', ru: 'landing/projects/vlezet.html', en: 'en/projects/vlezet.html'},
  );

  const meta = pageMeta.find((entry) => entry.path === 'en/projects/vlezet.html');
  assert.ok(meta, 'missing English Vlezet page metadata');
  assert.equal(meta.card, 'vlezet-en');
  assert.match(meta.title, /^Vlezet —/);
  assert.match(meta.description, /local-first|millimetre|recognition/i);

  assert.match(toc, /- name: Vlezet\n\s+href: \.\/en\/projects\/vlezet\.md/);
  assert.match(englishProjects, /\[Open English case study →\]\(projects\/vlezet\.md\)/);
  assert.doesNotMatch(englishProjects, /\[Open case study — Russian \(RU\) →\]\(\.\.\/landing\/projects\/vlezet\.md\)/);

  assert.match(browserSmoke, /id: 'vlezet', ru: '\/landing\/projects\/vlezet\/', en: '\/en\/projects\/vlezet\/'/);
  assert.match(browserSmoke, /name: 'vlezet-mobile', route: '\/en\/projects\/vlezet\/'/);
  assert.match(searchSmoke, /async function assertEnglishVlezetSearchCoverage/);
  assert.match(searchSmoke, /includes\('en\/projects\/vlezet\/'\)/);
  assert.match(searchSmoke, /await assertEnglishVlezetSearchCoverage\(page\)/);

  assert.match(productionRoutes, /const VLEZET_EN_PATH = 'en\/projects\/vlezet\/';/);
  assert.match(productionRoutes, /const VLEZET_EN_URL = new URL\(VLEZET_EN_PATH, APEX\)\.href;/);
  assert.match(productionSmoke, /VLEZET_EN_URL/);
  assert.match(productionSmoke, /summary\.vlezetEn = await verifyCaseStudy/);
  assert.match(productionSmoke, /alternateUrl: VLEZET_URL/);
  assert.match(productionSmoke, /requireEvidence: true/);
});
