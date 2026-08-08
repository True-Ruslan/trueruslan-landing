import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {renderHomepagePrimaryPaths} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('homepage puts the terminal slot between the lead and primary paths in both locales', () => {
  for (const relativePath of ['templates/index.html', 'templates/index.en.html']) {
    const template = read(relativePath);
    const hero = sliceBetween(template, '<section class="tr-home-hero">', '</section>');
    const lead = hero.indexOf('class="tr-home-lead"');
    const terminal = hero.indexOf('data-tr-terminal-slot');
    const paths = hero.indexOf('{{HOME_PRIMARY_PATHS}}');

    assert.ok(lead !== -1 && terminal > lead && paths > terminal, `${relativePath}: expected lead -> terminal -> primary paths`);
  }
});

test('terminal enhancement mounts into the explicit homepage slot without name-dependent heading lookup', () => {
  const source = read('docs/_assets/script/custom.js');
  const mount = sliceBetween(source, 'function mountTerminal(document, page) {', '\n  function setupReveal');

  assert.match(mount, /querySelector\('\[data-tr-terminal-slot\]'\)/);
  assert.doesNotMatch(mount, /Руслан Немыкин|querySelectorAll\('h1, h2'\)/);
});

test('primary path copy presents experience without resume or PDF emphasis', () => {
  const ru = renderHomepagePrimaryPaths('ru');
  assert.match(ru, />Опыт</);
  assert.match(ru, /Посмотреть опыт →/);
  assert.doesNotMatch(ru, /резюме|PDF/i);

  const en = renderHomepagePrimaryPaths('en');
  assert.match(en, />Experience</);
  assert.match(en, /Explore experience →/);
  assert.doesNotMatch(en, /resume|PDF/i);
});

test('visible navigation is Experience-first while the stable resume route is preserved', () => {
  const ruHome = read('templates/index.html');
  const enHome = read('templates/index.en.html');
  const toc = read('docs/toc.yaml');

  assert.match(ruHome, /href="landing\/resume\.html">Опыт<\/a>/);
  assert.doesNotMatch(ruHome, /href="landing\/resume\.html">Резюме<\/a>/);
  assert.match(enHome, /href="en\/resume\.html">Experience<\/a>/);
  assert.doesNotMatch(enHome, /href="en\/resume\.html">Resume<\/a>/);

  assert.match(toc, /- text: Опыт\s+type: link\s+url: landing\/resume\.html/);
  assert.match(toc, /- name: Опыт\s+href: \.\/landing\/resume\.md/);
});

test('experience page demotes the PDF to a Resume section and gives the domains metric intentional typography', () => {
  const ru = read('docs/landing/resume.md');
  const en = read('docs/en/resume.md');
  const css = read('docs/_assets/style/resume.css');

  assert.match(ru, /^# Опыт$/m);
  assert.match(ru, /^## Резюме$/m);
  assert.doesNotMatch(ru, /^## PDF-версия$/m);
  assert.match(en, /^# Experience$/m);
  assert.match(en, /^## Resume$/m);

  assert.match(ru, /class="tr-resume-stat__domains"/);
  assert.match(css, /\.tr-resume-stat__domains\s*\{/);
  assert.match(css, /line-height:/);
});

test('homepage owns a single compact top-spacing rhythm instead of stacked shell and hero gaps', () => {
  const css = read('docs/_assets/style/home.css');
  const shell = sliceBetween(css, '.tr-home-shell {', '\n}');
  const hero = sliceBetween(css, '.tr-home-hero {', '\n}');

  assert.match(shell, /padding:\s*0\s+0\s+/);
  assert.match(hero, /padding:\s*clamp\(1\.5rem,\s*3vw,\s*2\.5rem\)\s+0/);
  assert.doesNotMatch(shell, /clamp\(2\.5rem,\s*7vw,\s*6rem\)/);
});
