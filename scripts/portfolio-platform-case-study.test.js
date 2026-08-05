import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY_URL = 'https://github.com/True-Ruslan/trueruslan-landing';
const REPOSITORY_LINK_TARGET = `](${REPOSITORY_URL})`;

const files = Object.freeze({
  projects: path.join(ROOT, 'data', 'projects.json'),
  evidence: path.join(ROOT, 'data', 'project-evidence.json'),
  history: path.join(ROOT, 'data', 'project-history', 'portfolio-platform.json'),
  meta: path.join(ROOT, 'data', 'page-meta.json'),
  i18n: path.join(ROOT, 'data', 'i18n.json'),
  toc: path.join(ROOT, 'docs', 'toc.yaml'),
  ruHub: path.join(ROOT, 'docs', 'landing', 'projects.md'),
  enHub: path.join(ROOT, 'docs', 'en', 'projects.md'),
  ruPage: path.join(ROOT, 'docs', 'landing', 'projects', 'portfolio-platform.md'),
  enPage: path.join(ROOT, 'docs', 'en', 'projects', 'portfolio-platform.md'),
  copyAssets: path.join(ROOT, 'scripts', 'copy-assets.js'),
});

function read(file) {
  assert.ok(fs.existsSync(file), `missing required case-study file: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

const CASE_STUDY_MARKERS = Object.freeze([
  '<!-- case-study:problem -->',
  '<!-- case-study:constraints -->',
  '<!-- case-study:current-state -->',
  '<!-- case-study:decisions -->',
  '<!-- case-study:alternatives -->',
  '<!-- case-study:evidence -->',
  '<!-- case-study:limitations -->',
  '<!-- case-study:next -->',
  '<!-- case-study:related -->',
]);

test('portfolio platform registry owns a dedicated public case-study route and timeline', () => {
  const projects = readJson(files.projects);
  const project = projects.find(({slug}) => slug === 'portfolio-platform');

  assert.ok(project, 'portfolio-platform project must exist');
  assert.equal(project.visibility, 'public');
  assert.equal(project.active, true);
  assert.equal(project.featured, true);
  assert.equal(project.status, 'production');
  assert.equal(project.href, 'landing/projects/portfolio-platform.html');
  assert.equal(project.timeline, 'portfolio-platform');
  assert.deepEqual(project.noteSlugs, [
    'portfolio-runtime-boundary',
    'static-site-quality-gates',
    'green-ci-is-not-product-verification',
  ]);
});

test('portfolio platform evidence separates CI, Pages deployment and live production proof', () => {
  const evidence = readJson(files.evidence);
  const snapshot = evidence.find(({project}) => project === 'portfolio-platform');

  assert.ok(snapshot, 'portfolio-platform evidence snapshot must exist');
  assert.equal(snapshot.status, 'verified');
  assert.equal(snapshot.lastVerified, '2026-08-05');
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Public route model' && value.includes('directory')));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Hosting' && value === 'GitHub Pages'));

  const labels = snapshot.signals.map(({label}) => label);
  assert.ok(labels.some((label) => label.includes('PR #114')));
  assert.ok(labels.some((label) => label.includes('Build #836')));
  assert.ok(labels.some((label) => /Pages.*#147|#147.*Pages/.test(label)));
  assert.ok(labels.some((label) => label.includes('Production Live Smoke #58')));

  const live = snapshot.signals.find(({label}) => label.includes('Production Live Smoke #58'));
  assert.equal(live.state, 'passed');
  assert.match(live.scope, /deployed/i);
  assert.match(live.scope, /does not prove audience growth|не подтверждает рост аудитории/i);
});

test('RU and EN case studies follow the evidence-first flagship contract', () => {
  const ru = read(files.ruPage);
  const en = read(files.enPage);

  for (const page of [ru, en]) {
    for (const marker of CASE_STUDY_MARKERS) {
      assert.ok(page.includes(marker), `missing case-study marker: ${marker}`);
    }
    assert.match(page, /static-first/i);
    assert.match(page, /GitHub Pages/i);
    assert.match(page, /Production Live Smoke/i);
    assert.match(page, /legacy `?\.html`?/i);
    assert.match(page, /Cloudflare/i);
    assert.match(page, /second search|втор.*поиск/i);
    assert.match(page, /backend|runtime API/i);
    assert.ok(page.includes(REPOSITORY_LINK_TARGET), `missing exact repository link target: ${REPOSITORY_URL}`);
  }

  assert.match(ru, /data-tr-project-status="portfolio-platform"/);
  assert.match(ru, /data-tr-project-timeline="portfolio-platform"/);
  assert.match(ru, /data-tr-project-evidence="portfolio-platform"/);
  assert.match(ru, /notes\/portfolio-runtime-boundary\.md/);
  assert.match(ru, /notes\/static-site-quality-gates\.md/);
  assert.match(ru, /notes\/green-ci-is-not-product-verification\.md/);

  assert.match(en, /data-tr-project-status="portfolio-platform"/);
  assert.doesNotMatch(en, /data-tr-project-evidence=/);
  assert.match(en, /\.\.\/\.\.\/landing\/notes\/portfolio-runtime-boundary\.md/);
});

test('case study is wired into hubs, navigation, metadata and RU/EN pairing', () => {
  const ruHub = read(files.ruHub);
  const enHub = read(files.enHub);
  const toc = read(files.toc);
  const copyAssets = read(files.copyAssets);
  const i18n = readJson(files.i18n);
  const meta = readJson(files.meta);

  assert.match(ruHub, /projects\/portfolio-platform\.md/);
  assert.match(enHub, /projects\/portfolio-platform\.md/);
  assert.match(toc, /\.\/landing\/projects\/portfolio-platform\.md/);
  assert.match(toc, /\.\/en\/projects\/portfolio-platform\.md/);

  assert.ok(i18n.some(({id, ru, en}) => (
    id === 'portfolio-platform'
      && ru === 'landing/projects/portfolio-platform.html'
      && en === 'en/projects/portfolio-platform.html'
  )));

  assert.ok(meta.some(({path: route}) => route === 'landing/projects/portfolio-platform.html'));
  assert.ok(meta.some(({path: route}) => route === 'en/projects/portfolio-platform.html'));

  assert.match(copyAssets, /'portfolio-platform'/);
  assert.match(copyAssets, /landing\/projects\/portfolio-platform\.html/);
  assert.match(copyAssets, /en\/projects\/portfolio-platform\.html/);
});

test('portfolio platform history keeps accepted, current and next states distinct', () => {
  const history = readJson(files.history);
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.ok(history.some(({state, title}) => state === 'past' && /clean URL/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'current' && /P3\.2|case study/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'next' && /P3\.3|normalization/i.test(title)));
});
