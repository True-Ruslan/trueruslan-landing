import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function indexOfOrFail(source, needle, label) {
  const index = source.indexOf(needle);
  assert.notEqual(index, -1, `${label}: missing ${needle}`);
  return index;
}

for (const [locale, relativePath] of [
  ['ru', 'docs/landing/resume.md'],
  ['en', 'docs/en/resume.md'],
]) {
  test(`C4 Experience ${locale} is scan-first without a flat technology wall`, () => {
    const source = read(relativePath);
    assert.match(source, /tr-resume-hero/);
    assert.match(source, /5\+ (?:лет|years)/i);
    assert.match(source, /data-tr-resume-link/);
    assert.match(source, /GitHub/);
    assert.match(source, locale === 'ru' ? /Связаться/ : /Contact/);

    assert.doesNotMatch(source, locale === 'ru' ? /^## Профиль$/m : /^## Profile$/m);
    assert.equal(count(source, /data-tr-resume-stack-group(?:=|>)/g), 5, `${locale}: expected five grouped stack areas`);
    assert.equal(count(source, /class="tr-resume-item"/g), 5, `${locale}: employment item count drifted`);
    assert.equal(count(source, /class="tr-resume-impact"/g), 5, `${locale}: every employment item needs compact impact bullets`);
    assert.equal(count(source, /class="tr-resume-stack-line"/g), 5, `${locale}: every employment item needs a compact stack line`);
  });
}

for (const [locale, relativePath] of [
  ['ru', 'docs/landing/work-with-me.md'],
  ['en', 'docs/en/work-with-me.md'],
]) {
  test(`C4 Work with me ${locale} leads with useful tracks and direct handoff`, () => {
    const source = read(relativePath);
    const availability = indexOfOrFail(source, '<div data-tr-collaboration-availability></div>', `${locale} availability`);
    const handoff = indexOfOrFail(source, '<div data-tr-collaboration-handoff></div>', `${locale} handoff`);
    const boundary = indexOfOrFail(source, locale === 'ru' ? '## Границы' : '## Boundaries', `${locale} boundary`);
    assert.ok(handoff < boundary, `${locale}: direct handoff must precede defensive boundaries`);
    assert.ok(availability < boundary, `${locale}: availability must precede defensive boundaries`);

    assert.equal(count(source, /data-tr-work-track=/g), 3, `${locale}: expected exactly three primary work tracks`);
    assert.match(source, /data-tr-work-track="backend"/);
    assert.match(source, /data-tr-work-track="ai-tooling"/);
    assert.match(source, /data-tr-work-track="teaching"/);
    assert.equal(count(source, /data-tr-work-step=/g), 3, `${locale}: process must be reduced to three steps`);
    assert.doesNotMatch(source, /Startup \/ individual projects|Expert contribution|Когда мы, скорее всего, подходим друг другу|When this is likely a good fit/);
  });
}

test('C4 About RU is a concise three-part personal-professional page', () => {
  const source = read('docs/landing/about.md');
  assert.deepEqual([...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]), [
    'Инженер',
    'Преподавание и исследование',
    'Вне кода',
  ]);
  assert.doesNotMatch(source, /^## (?:Работа|Что для меня стало важным в разработке|AI и разработка|Собственные проекты|Кроме основной работы)$/m);
  assert.match(source, /resume\.md/);
  assert.match(source, /projects\.md/);
});

test('C4 About EN is a concise three-part personal-professional page', () => {
  const source = read('docs/en/about.md');
  assert.deepEqual([...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]), [
    'Engineer',
    'Teaching & research',
    'Outside code',
  ]);
  assert.doesNotMatch(source, /^## (?:Work|What became important to me in engineering|AI and development|Personal projects|Outside my main job)$/m);
  assert.match(source, /resume\.md/);
  assert.match(source, /projects\.md/);
});

for (const [locale, relativePath] of [
  ['ru', 'docs/landing/now.md'],
  ['en', 'docs/en/now.md'],
]) {
  test(`C4 Now ${locale} renders current canonical snapshot before meta explanation`, () => {
    const source = read(relativePath);
    const placeholder = indexOfOrFail(source, '<div data-tr-now-placeholder></div>', `${locale} now placeholder`);
    const metaNeedle = locale === 'ru' ? 'Не roadmap' : 'not a roadmap';
    const meta = indexOfOrFail(source, metaNeedle, `${locale} now meta`);
    assert.ok(placeholder < meta, `${locale}: current snapshot must precede meta explanation`);
    assert.match(source, locale === 'ru' ? /источник контекста/i : /context source/i);
  });
}

test('C4 Contacts exposes Telegram and email before qualification/social layers', () => {
  const source = read('docs/landing/contacts.md');
  const telegram = indexOfOrFail(source, 'https://t.me/TrueRuslan_Blog', 'Contacts Telegram');
  const email = indexOfOrFail(source, 'mailto:nemykin@true-ruslan.ru', 'Contacts email');
  const firstH2 = source.indexOf('\n## ');
  assert.ok(firstH2 === -1 || (telegram < firstH2 && email < firstH2), 'direct contacts must appear before the first H2');
  assert.match(source, /work-with-me\.md/);
  assert.match(source, /## Профили/);
  assert.doesNotMatch(source, /data-tr-collaboration-handoff/);
});
