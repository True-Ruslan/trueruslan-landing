import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function sectionFrom(text, heading) {
  const start = text.indexOf(heading);
  assert.notEqual(start, -1, `missing section ${heading}`);
  const tail = text.slice(start + heading.length);
  const nextHeading = tail.search(/\n#{2,3}\s/);
  return nextHeading === -1 ? tail : tail.slice(0, nextHeading);
}

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

test('N3 gives Work with me a page-specific generated styling hook and light surface contract', () => {
  const collaboration = read('scripts/collaboration.js');
  const css = read('docs/_assets/style/collaboration.css');

  assert.ok(collaboration.includes('tr-work-with-me-page'), 'generated Work with me main must get a dedicated page hook');
  assert.ok(css.includes('.tr-work-with-me-page .tr-work-tracks .tr-resume-panel'), 'work-track panels need bounded page-specific styling');
  assert.ok(css.includes('.tr-work-with-me-page .tr-work-process'), 'work process needs bounded page-specific rhythm styling');
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
    assert.ok(source.includes('_assets/style/now-refinement.css'), `${file}: bounded Now refinement stylesheet missing`);
    assert.ok(source.includes(contextLabel), `${file}: concise current commercial framing missing`);
    assert.ok(source.includes(employer), `${file}: current full-time employer context missing`);
    assert.ok(!source.includes('> **Generated snapshot:**'), `${file}: internal-style generated snapshot callout must be removed`);
  }

  assert.equal(fs.existsSync(path.join(ROOT, 'docs/_assets/style/now-refinement.css')), true, 'Now refinement stylesheet must exist');
});

test('N3c keeps QWEP current full-time and makes MarketDB explicitly closed historical without inventing an end date', () => {
  const ruResume = read('docs/landing/resume.md');
  const enResume = read('docs/en/resume.md');

  const ruQwep = sectionFrom(ruResume, '### Java backend-разработчик — QWEP');
  const enQwep = sectionFrom(enResume, '### Java Backend Developer — QWEP');
  assert.ok(ruQwep.includes('настоящее время') && ruQwep.includes('полная занятость'), 'RU QWEP must remain current full-time');
  assert.ok(enQwep.includes('present') && enQwep.includes('full-time'), 'EN QWEP must remain current full-time');

  const ruMarketDb = sectionFrom(ruResume, '### IT-директор / Java-разработчик — MarketDB');
  const enMarketDb = sectionFrom(enResume, '### IT Director / Java Developer — MarketDB');
  assert.ok(ruMarketDb.toLowerCase().includes('закрыт'), 'RU MarketDB resume entry must explicitly say closed');
  assert.ok(!ruMarketDb.includes('настоящее время'), 'RU MarketDB must not be presented as current');
  assert.ok(enMarketDb.toLowerCase().includes('closed'), 'EN MarketDB resume entry must explicitly say closed');
  assert.ok(!enMarketDb.includes('present'), 'EN MarketDB must not be presented as current');
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
