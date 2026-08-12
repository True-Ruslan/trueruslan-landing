import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function marketDbCard(text) {
  const marker = 'data-c3-commercial="marketdb"';
  const markerIndex = text.indexOf(marker);
  assert.notEqual(markerIndex, -1, 'MarketDB historical card must remain present');
  const articleStart = text.lastIndexOf('<article', markerIndex);
  const articleEnd = text.indexOf('</article>', markerIndex);
  assert.notEqual(articleStart, -1, 'MarketDB article start missing');
  assert.notEqual(articleEnd, -1, 'MarketDB article end missing');
  return text.slice(articleStart, articleEnd + '</article>'.length);
}

test('N3 gives Work with me a lighter bounded surface and rhythm contract', () => {
  const ru = read('docs/landing/work-with-me.md');
  const en = read('docs/en/work-with-me.md');
  const css = read('docs/_assets/style/collaboration.css');

  for (const source of [ru, en]) {
    assert.ok(source.includes('class="tr-resume-grid tr-work-tracks"'), 'work tracks must keep their bounded page primitive');
    assert.ok(source.includes('class="tr-work-process"'), 'work process must keep its bounded page primitive');
  }
  assert.ok(css.includes('.tr-work-tracks .tr-resume-panel'), 'work-track panels need bounded styling');
  assert.ok(css.includes('.tr-work-process'), 'work process needs bounded rhythm styling');
  assert.ok(css.includes('--tr-collaboration-surface'), 'collaboration surfaces need a shared light surface token');
  assert.ok(css.includes('--tr-collaboration-border'), 'collaboration borders need a shared lighter border token');
});

test('N3b replaces the Now technical callout with a readable RU/EN public intro', () => {
  const pairs = [
    ['docs/landing/now.md', 'Основной коммерческий контекст', 'QWEP'],
    ['docs/en/now.md', 'Primary commercial context', 'QWEP'],
  ];

  for (const [file, contextLabel, employer] of pairs) {
    const source = read(file);
    assert.ok(source.includes('class="tr-now-intro"'), `${file}: semantic Now intro wrapper missing`);
    assert.ok(source.includes(contextLabel), `${file}: concise current commercial framing missing`);
    assert.ok(source.includes(employer), `${file}: current full-time employer context missing`);
    assert.ok(!source.includes('> **Generated snapshot:**'), `${file}: internal-style generated snapshot callout must be removed`);
  }

  const yfm = read('docs/.yfm');
  assert.ok(yfm.includes('_assets/style/now-refinement.css'), 'Diplodoc must own the Now refinement stylesheet globally');
  assert.equal(fs.existsSync(path.join(ROOT, 'docs/_assets/style/now-refinement.css')), true, 'Now refinement stylesheet must exist');
});

test('N3c preserves the current QWEP resume truth without reintroducing MarketDB as employment', () => {
  const ruResume = read('docs/landing/resume.md');
  const enResume = read('docs/en/resume.md');

  assert.ok(
    ruResume.includes('QWEP · Java-разработчик, middle · сентябрь 2025 — настоящее время'),
    'RU QWEP must remain current in the canonical resume',
  );
  assert.ok(
    enResume.includes('QWEP · Middle Java Developer · September 2025 — present'),
    'EN QWEP must remain current in the canonical resume',
  );
  assert.ok(!ruResume.includes('MarketDB'), 'RU canonical employment timeline must not reintroduce MarketDB as a current job');
  assert.ok(!enResume.includes('MarketDB'), 'EN canonical employment timeline must not reintroduce MarketDB as a current job');
});

test('N3c moves MarketDB out of current commercial work while preserving it as history and aligns About copy', () => {
  const ruProjects = read('docs/landing/projects.md');
  const enProjects = read('docs/en/projects.md');
  const ruCard = marketDbCard(ruProjects);
  const enCard = marketDbCard(enProjects);

  assert.ok(ruProjects.includes('## Исторический коммерческий контекст'), 'RU projects need an explicit historical commercial section');
  assert.ok(enProjects.includes('## Historical commercial context'), 'EN projects need an explicit historical commercial section');
  assert.ok(ruCard.toLowerCase().includes('закрыт'), 'RU MarketDB card must explicitly say closed');
  assert.ok(enCard.toLowerCase().includes('closed'), 'EN MarketDB card must explicitly say closed');
  assert.ok(!ruCard.includes('Active development'), 'RU MarketDB card must not claim active development');
  assert.ok(!enCard.includes('Active development'), 'EN MarketDB card must not claim active development');

  const ruAbout = read('docs/landing/about.md');
  const enAbout = read('docs/en/about.md');
  assert.ok(ruAbout.includes('QWEP') && ruAbout.includes('полная занятость'), 'RU About must identify QWEP as current full-time commercial context');
  assert.ok(enAbout.includes('QWEP') && enAbout.includes('full-time'), 'EN About must identify QWEP as current full-time commercial context');
});
