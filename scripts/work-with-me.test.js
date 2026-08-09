import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {loadI18nManifest} from './i18n.js';
import {renderStandaloneHome} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(ROOT, relativePath));

function navigationTexts(templatePath) {
  const html = read(templatePath);
  const start = html.indexOf('<nav class="tr-site-nav"');
  const end = html.indexOf('</nav>', start);
  assert.ok(start !== -1 && end > start, `primary navigation missing in ${templatePath}`);
  return [...html.slice(start, end).matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
}

function tocHeaderTexts() {
  const toc = read('docs/toc.yaml');
  const start = toc.indexOf('    leftItems:');
  const end = toc.indexOf('    rightItems:', start);
  assert.ok(start !== -1 && end > start);
  return [...toc.slice(start, end).matchAll(/- text: ([^\n]+)/g)].map((match) => match[1].trim());
}

test('RU and EN Work with me pages keep reusable collaboration truth out of Markdown', () => {
  for (const [relativePath, expected] of [
    ['docs/landing/work-with-me.md', [/Работа со мной/i, /Engineering/i, /Teaching.*Mentoring/i, /Context.*Scope.*Estimate.*Implementation.*Handover/is]],
    ['docs/en/work-with-me.md', [/Work with me/i, /Engineering/i, /Teaching.*Mentoring/i, /Context.*Scope.*Estimate.*Implementation.*Handover/is]],
  ]) {
    assert.equal(exists(relativePath), true, `${relativePath} must exist`);
    const source = read(relativePath);
    assert.match(source, /data-tr-collaboration-availability/);
    assert.match(source, /data-tr-collaboration-handoff/);
    for (const pattern of expected) assert.match(source, pattern);
    assert.doesNotMatch(source, /ruslan\.nemikin@gmail\.com|https:\/\/t\.me\/TrueRuslan/);
    assert.doesNotMatch(source, /<form\b|\b(?:₽|руб(?:\.|лей)?|USD|EUR|\$\d|€\d)/i);
  }
});

test('collaboration renderer derives localized availability and direct handoff from one canonical model', async () => {
  const modulePath = path.join(__dirname, 'collaboration.js');
  const collaboration = await import(pathToFileURL(modulePath).href);
  const value = collaboration.loadCollaboration();

  for (const locale of ['ru', 'en']) {
    const availability = collaboration.renderCollaborationAvailability(value, {locale});
    const handoff = collaboration.renderCollaborationHandoff(value, {locale});
    assert.match(availability, /data-tr-collaboration-rendered="availability"/);
    assert.match(availability, /limited/i);
    assert.match(availability, /2026-08-08/);
    assert.match(handoff, /data-tr-collaboration-rendered="handoff"/);
    assert.match(handoff, /https:\/\/t\.me\/TrueRuslan/);
    assert.match(handoff, /mailto:ruslan\.nemikin@gmail\.com/);
    assert.doesNotMatch(`${availability}${handoff}`, /<form\b|public price|прайс|hourly|за час|\b(?:₽|USD|EUR)\b/i);
  }
});

test('Work with me is the thirteenth controlled RU EN route pair with bounded metadata', () => {
  const pair = loadI18nManifest().find(({id}) => id === 'work-with-me');
  assert.deepEqual(pair, {
    id: 'work-with-me',
    ru: 'landing/work-with-me.html',
    en: 'en/work-with-me.html',
  });

  const meta = JSON.parse(read('data/page-meta.json'));
  const ru = meta.find(({path: pagePath}) => pagePath === 'landing/work-with-me.html');
  const en = meta.find(({path: pagePath}) => pagePath === 'en/work-with-me.html');
  assert.equal(ru?.card, 'work-with-me');
  assert.equal(en?.card, 'work-with-me-en');
  assert.match(ru?.title ?? '', /Работа со мной/);
  assert.match(en?.title ?? '', /Work with me/i);
});

test('primary navigation keeps collaboration and direct Contacts visible while secondary content stays out of the header', () => {
  const ruExpected = ['Проекты', 'Опыт', 'Материалы', 'Работа со мной', 'Обо мне', 'Контакты'];
  const enExpected = ['Projects', 'Experience', 'Writing', 'Work with me', 'About'];
  assert.deepEqual(navigationTexts('templates/index.html'), ruExpected);
  assert.deepEqual(tocHeaderTexts(), ruExpected);
  assert.deepEqual(navigationTexts('templates/index.en.html'), enExpected);

  const toc = read('docs/toc.yaml');
  for (const secondary of ['Сейчас', 'Engineering Map', 'Engineering Notes', 'Публикации', 'Источники', 'Фото']) {
    assert.match(toc, new RegExp(`name: ${secondary}`));
  }
  assert.match(toc, /name: Контакты/);
});

test('homepage collaboration bridge sits after flagship proof and preserves exactly three primary paths', async () => {
  const modulePath = path.join(__dirname, 'collaboration.js');
  const collaborationModule = await import(pathToFileURL(modulePath).href);
  const collaboration = collaborationModule.loadCollaboration();
  const projects = JSON.parse(read('data/projects.json'));
  const evidence = JSON.parse(read('data/project-evidence.json'));

  for (const [templatePath, locale] of [['templates/index.html', 'ru'], ['templates/index.en.html', 'en']]) {
    const template = read(templatePath);
    const bridgeIndex = template.indexOf('{{HOME_COLLABORATION_BRIDGE}}');
    assert.ok(bridgeIndex > template.indexOf('{{HOME_FLAGSHIPS}}'), `${locale} bridge must follow flagship proof`);
    assert.ok(bridgeIndex < template.indexOf('now-title'), `${locale} bridge must precede current focus`);

    const html = renderStandaloneHome(template, 'https://trueruslan.ru', projects, {
      locale,
      evidence,
      collaboration,
      hrefTransform: locale === 'en'
        ? (href) => ({
          'landing/projects/livingworld.html': 'en/projects/livingworld.html',
          'landing/projects/notchhub.html': 'en/projects/notchhub.html',
          'landing/projects/portfolio-platform.html': 'en/projects/portfolio-platform.html',
        }[href] ?? href)
        : (href) => href,
    });
    assert.equal((html.match(/data-home-path=/g) ?? []).length, 3);
    assert.equal((html.match(/data-home-collaboration=/g) ?? []).length, 1);
    assert.doesNotMatch(html, /<form\b|public price|публичн(?:ый|ого) прайс/i);
  }
});

test('Contacts exposes a simple direct handoff independent of the Work with me collaboration renderer', () => {
  const source = read('docs/landing/contacts.md');
  assert.match(source, /## Основные контакты/);
  assert.match(source, /\[@TrueRuslan_Blog\]\(https:\/\/t\.me\/TrueRuslan_Blog\)/);
  assert.match(source, /\[contact@trueruslan\.ru\]\(mailto:contact@trueruslan\.ru\)/);
  assert.doesNotMatch(source, /data-tr-collaboration-handoff/);
  assert.doesNotMatch(source, /Описать задачу/i);
  assert.match(source, /GitHub|Habr|LinkedIn/);
});

test('contextual collaboration CTA is exact allowlist-only and EN derives only from existing i18n pairs', async () => {
  const modulePath = path.join(__dirname, 'collaboration.js');
  const collaborationModule = await import(pathToFileURL(modulePath).href);
  const value = collaborationModule.loadCollaboration();
  const pairs = loadI18nManifest();
  const targets = collaborationModule.resolveContextualCollaborationTargets(value, pairs);

  assert.deepEqual(targets.ru, [
    {path: 'landing/projects/portfolio-platform.html', category: 'engineering'},
    {path: 'landing/projects/notchhub.html', category: 'engineering'},
    {path: 'landing/notes/deployment-success-is-not-production-verification.html', category: 'engineering'},
    {path: 'landing/notes/server-authoritative-ai-npcs.html', category: 'ai-integration'},
  ]);
  assert.deepEqual(targets.en, [
    {path: 'en/projects/portfolio-platform.html', category: 'engineering'},
    {path: 'en/projects/notchhub.html', category: 'engineering'},
    {path: 'en/notes/server-authoritative-ai-npcs.html', category: 'ai-integration'},
  ]);
  assert.equal(targets.en.some(({path: pagePath}) => /deployment-success/.test(pagePath)), false);

  for (const forbidden of [
    'landing/about.html',
    'landing/resume.html',
    'landing/photos.html',
    'landing/bibliography.html',
    'landing/engineering-map.html',
  ]) assert.equal(collaborationModule.resolveContextualCollaboration(value, forbidden), null);
});
