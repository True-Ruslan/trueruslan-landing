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
const copyAssets = fs.readFileSync(path.join(root, 'scripts', 'copy-assets.js'), 'utf8');
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

test('P3.5A keeps the controlled English Vlezet flagship on the current canonical state model', () => {
  assert.ok(fs.existsSync(englishCaseStudyPath), 'missing English Vlezet case study');
  const page = fs.readFileSync(englishCaseStudyPath, 'utf8');

  for (const marker of REQUIRED_MARKERS) {
    assert.ok(page.includes(marker), `missing English Vlezet narrative marker: ${marker}`);
  }

  for (const marker of [
    '# Vlezet',
    'data-tr-project-status="vlezet"',
    'data-tr-project-evidence="vlezet"',
    'https://github.com/True-Ruslan/vlezet',
    'VlezetDocument',
    'millimetres',
    'M7.8B',
    'PR #42',
    'PR #44',
    'PR #45',
    'PR #52',
    'Draft',
    'product-owner usefulness acceptance',
    'closed unmerged',
    'Assisted Tracing',
    'explicit Apply',
    'AI may not silently move walls',
    'registry-backed evidence',
  ]) {
    assert.ok(page.includes(marker), `missing English Vlezet evidence boundary: ${marker}`);
  }

  assert.doesNotMatch(page, /PR #42 remains Draft work awaiting/i);
  assert.doesNotMatch(page, /next acceptance boundary is \*\*M7\.8C/i);
  assert.doesNotMatch(page, /data-tr-project-timeline=/, 'English page must not inject the Russian timeline presentation');
  assert.doesNotMatch(page, /[А-Яа-яЁё]/, 'English Vlezet page contains Cyrillic copy');
  assert.doesNotMatch(page, /\b[0-9a-f]{40}\b/i, 'volatile commit identities must remain registry-owned');
  assert.doesNotMatch(
    page,
    /\b(?:CI|Recognition Benchmark|M7 Browser Audit) #\d+\b/,
    'volatile workflow identities must remain registry-owned',
  );
  assert.doesNotMatch(
    page,
    /PR #(42|44|45)\s+(?:is|was|has been)\s+(?:merged|accepted)/i,
    'closed-unmerged R&D work must not be promoted to merged or accepted',
  );

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
  assert.match(
    englishProjects,
    /(?:data-c3-lab=["']vlezet["'][\s\S]*?href=["']projects\/vlezet\.html["']|\[Open English case study →\]\(projects\/vlezet\.md\))/,
    'English Projects hub must expose the canonical English Vlezet case study directly',
  );
  assert.doesNotMatch(
    englishProjects,
    /(?:data-c3-lab=["']vlezet["'][\s\S]*?href=["']\.\.\/landing\/projects\/vlezet\.html["']|\[Open case study — Russian \(RU\) →\]\(\.\.\/landing\/projects\/vlezet\.md\))/,
    'English Projects hub must not demote Vlezet to a Russian fallback',
  );

  assert.match(copyAssets, /if \(href === 'landing\/projects\/vlezet\.html'\) return 'en\/projects\/vlezet\.html';/);
  assert.match(copyAssets, /path: 'en\/projects\/vlezet\.html', locale: 'en'/);
  assert.match(copyAssets, /'en\/projects\/vlezet\.html'/);

  assert.match(browserSmoke, /id: 'vlezet', ru: '\/projects\/vlezet\/', en: '\/en\/projects\/vlezet\/'/);
  assert.doesNotMatch(browserSmoke, /id: 'vlezet', ru: '\/landing\/projects\/vlezet\//);
  assert.match(browserSmoke, /name: 'vlezet-mobile', route: '\/en\/projects\/vlezet\/'/);
  assert.match(browserSmoke, /async function assertEnglishVlezetNoJsEvidence/);
  assert.match(browserSmoke, /data-tr-project-evidence-noscript=\"vlezet-en\"/);
  assert.match(browserSmoke, /localizedEvidence = await assertEnglishVlezetNoJsEvidence\(page\)/);

  assert.match(searchSmoke, /async function assertEnglishVlezetSearchCoverage/);
  assert.match(searchSmoke, /includes\('en\/projects\/vlezet\/'\)/);
  assert.match(searchSmoke, /await assertEnglishVlezetSearchCoverage\(page\)/);

  assert.match(productionRoutes, /const VLEZET_EN_PATH = 'en\/projects\/vlezet\/';/);
  assert.match(productionRoutes, /const VLEZET_EN_URL = new URL\(VLEZET_EN_PATH, APEX\)\.href;/);
  assert.match(productionSmoke, /VLEZET_EN_URL/);
  assert.match(productionSmoke, /summary\.vlezetEn = await verifyCaseStudy/);
  assert.match(productionSmoke, /alternateUrl: VLEZET_URL/);
  assert.match(productionSmoke, /requireEvidence: true,/);
  assert.match(productionSmoke, /requireTimeline: false,/);
});