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

test('portfolio platform evidence preserves C7 and N6 history while AI Navigator advances current production and P3.6 stays open', () => {
  const evidence = readJson(files.evidence);
  const snapshot = evidence.find(({project}) => project === 'portfolio-platform');

  assert.ok(snapshot, 'portfolio-platform evidence snapshot must exist');
  assert.equal(snapshot.status, 'verified');
  assert.equal(snapshot.lastVerified, '2026-08-15');
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Public route model' && value.includes('directory')));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Hosting' && value === 'GitHub Pages'));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Analytics' && /Cloudflare.*Yandex Metrica/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Current production baseline' && /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/.test(value) && /AI Navigator.*public AI OFF/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Search Discovery' && /P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published/i.test(value)));

  const p36c = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/158');
  assert.ok(p36c, 'missing historical P3.6C implementation evidence');
  assert.equal(p36c.state, 'merged');
  assert.match(p36c.scope, /P3\.6 measurement remains open/i);

  const c7 = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/198');
  assert.ok(c7, 'missing C7 feature evidence');
  assert.equal(c7.state, 'merged');
  assert.match(c7.scope, /134043fa2bb5f6612266a04eab2853f71b207328/);

  const verifier = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/234');
  const reconciliation = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/237');
  assert.ok(verifier && reconciliation, 'missing historical N6 exact production evidence');
  assert.equal(verifier.state, 'merged');
  assert.equal(reconciliation.state, 'merged');
  assert.match(verifier.scope, /635b4a0760765a515277ad8abcbb1500bf646027/);
  assert.match(verifier.scope, /Pages #255.*Production Live #564\/#565.*CodeQL #1662/i);
  assert.match(reconciliation.scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(reconciliation.scope, /not-published/i);
  assert.match(reconciliation.scope, /P4\.1B.*in progress.*P4\.1C\/P3\.6.*evidence gated/i);

  const aiBaseline = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/253');
  const aiReconciliation = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/254');
  assert.ok(aiBaseline && aiReconciliation, 'missing current AI Navigator production evidence');
  assert.equal(aiBaseline.state, 'merged');
  assert.equal(aiReconciliation.state, 'merged');
  assert.match(aiBaseline.scope, /OFF-by-default.*AI Navigator engineering baseline/i);
  assert.match(aiBaseline.scope, /Public mode remained off/i);
  assert.match(aiBaseline.scope, /no live-provider.*SEARCH\/FULL canary.*product-impact acceptance/i);
  assert.match(aiReconciliation.scope, /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/);
  assert.match(aiReconciliation.scope, /Pages #273.*Production Live #620.*CodeQL #1752/i);
  assert.match(aiReconciliation.scope, /Production AI remains OFF/i);
  assert.match(aiReconciliation.scope, /P4\.1B\/P4\.1C\/P3\.6 external-evidence boundaries are unchanged/i);
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

test('portfolio platform history keeps C7 and N6 historical, AI Navigator current and manual launch next', () => {
  const history = readJson(files.history);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.ok(history.some(({state, title}) => state === 'past' && /clean URL/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'past' && /P3\.2|case study/i.test(title)));
  assert.ok(history.some(({state, title, description}) => state === 'past' && /C7.*production baseline/i.test(title) && /134043fa2bb5f6612266a04eab2853f71b207328/.test(description)));
  assert.ok(history.some(({state, title, description}) => state === 'past' && /N6.*editorial UX.*production accepted/i.test(title) && /f0e489d75f5bcb1f64057e1046faad877bf3f952/.test(description)));
  assert.match(current[0].title, /AI Navigator.*production accepted.*public AI off/i);
  assert.match(current[0].description, /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/);
  assert.match(current[0].description, /Pages #273.*Production Live #620.*CodeQL #1752/i);
  assert.match(current[0].description, /No live provider.*SEARCH\/FULL canary.*SEO, engagement or causal product-impact claim/i);
  assert.match(next[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
  assert.match(next[0].description, /10-target \/ 38-draft/i);
  assert.match(next[0].description, /Search Console.*Yandex Webmaster/i);
  assert.match(next[0].description, /P4\.1C and P3\.6 remain evidence-gated/i);
});
