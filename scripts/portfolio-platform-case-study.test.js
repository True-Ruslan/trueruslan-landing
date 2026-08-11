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

test('portfolio platform evidence records C7 production acceptance while P3.6 measurement remains open', () => {
  const evidence = readJson(files.evidence);
  const snapshot = evidence.find(({project}) => project === 'portfolio-platform');

  assert.ok(snapshot, 'portfolio-platform evidence snapshot must exist');
  assert.equal(snapshot.status, 'verified');
  assert.equal(snapshot.lastVerified, '2026-08-11');
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Public route model' && value.includes('directory')));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Hosting' && value === 'GitHub Pages'));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Analytics' && /Cloudflare.*Yandex Metrica/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));

  const p36c = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/158');
  assert.ok(p36c, 'missing historical P3.6C implementation evidence');
  assert.equal(p36c.state, 'merged');
  assert.match(p36c.scope, /explicit-consent|consent/i);
  assert.match(p36c.scope, /P3\.6 measurement remains open/i);

  const c7 = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/198');
  assert.ok(c7, 'missing C7 feature evidence');
  assert.equal(c7.state, 'merged');
  assert.match(c7.scope, /context-only presentation baseline/i);
  assert.match(c7.scope, /134043fa2bb5f6612266a04eab2853f71b207328/);

  const pages = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516118934');
  assert.ok(pages, 'missing C7 Pages evidence');
  assert.equal(pages.state, 'published');
  assert.match(pages.scope, /5855067883/);

  const live = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516213818');
  assert.ok(live, 'missing C7 Production Live evidence');
  assert.equal(live.state, 'passed');
  assert.match(live.scope, /P3\.6 measurement remains NEXT \/ WAITING/i);
  assert.match(live.scope, /no product-impact claim/i);
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

  assert.match(ruHub, /projects\/portfolio-platform\.html/);
  assert.match(enHub, /projects\/portfolio-platform\.html/);
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

test('portfolio platform history keeps historical acceptance, C7 current and P3.6 next states distinct', () => {
  const history = readJson(files.history);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.ok(history.some(({state, title}) => state === 'past' && /clean URL/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'past' && /P3\.2|case study/i.test(title)));
  assert.match(current[0].title, /C7.*production baseline/i);
  assert.match(current[0].description, /P3\.6.*NEXT|WAITING/i);
  assert.match(next[0].title, /P3\.6.*WAITING/i);
  assert.match(next[0].description, /operator-observed aggregate evidence/i);
});
