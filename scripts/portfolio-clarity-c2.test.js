import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadCollaboration} from './collaboration.js';
import {loadProjectEvidence} from './project-evidence.js';
import {loadProjectRegistry} from './project-registry.js';
import {renderStandaloneHome} from './standalone-home.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = path.join(ROOT, 'data', 'projects.json');
const EVIDENCE = path.join(ROOT, 'data', 'project-evidence.json');
const RU_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const EN_TEMPLATE = path.join(ROOT, 'templates', 'index.en.html');
const TOC = path.join(ROOT, 'docs', 'toc.yaml');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const count = (source, marker) => source.split(marker).length - 1;

function assertOrdered(source, markers, label) {
  let previous = -1;
  for (const marker of markers) {
    const index = source.indexOf(marker);
    assert.notEqual(index, -1, `${label}: missing ${marker}`);
    assert.ok(index > previous, `${label}: expected ${marker} after previous homepage layer`);
    previous = index;
  }
}

function primaryNavTexts(template) {
  const start = template.indexOf('<nav class="tr-site-nav"');
  const end = template.indexOf('</nav>', start);
  assert.ok(start !== -1 && end > start, 'primary navigation must exist');
  return [...template.slice(start, end).matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
}

function tocHeaderTexts() {
  const toc = read(TOC);
  const start = toc.indexOf('    leftItems:');
  const end = toc.indexOf('    rightItems:', start);
  assert.ok(start !== -1 && end > start, 'Diplodoc primary header must exist');
  return [...toc.slice(start, end).matchAll(/- text: ([^\n]+)/g)].map((match) => match[1].trim());
}

function englishProjectHref(href) {
  return ({
    'landing/projects/livingworld.html': 'en/projects/livingworld.html',
    'landing/projects/notchhub.html': 'en/projects/notchhub.html',
    'landing/projects/portfolio-platform.html': 'en/projects/portfolio-platform.html',
  })[href] ?? href;
}

test('C2 templates reserve one ordered fast-scan hierarchy in both locales', () => {
  for (const [templatePath, locale] of [[RU_TEMPLATE, 'ru'], [EN_TEMPLATE, 'en']]) {
    const template = read(templatePath);

    assert.equal(count(template, '{{HOME_PROOF_STRIP}}'), 1, `${locale}: proof strip placeholder`);
    assert.equal(count(template, '{{HOME_FLAGSHIPS}}'), 1, `${locale}: selected work placeholder`);
    assert.equal(count(template, '{{HOME_EXPERIENCE_BRIDGE}}'), 1, `${locale}: experience bridge placeholder`);
    assert.equal(count(template, '{{HOME_WRITING_BRIDGE}}'), 1, `${locale}: writing bridge placeholder`);
    assert.equal(count(template, '{{HOME_COLLABORATION_BRIDGE}}'), 1, `${locale}: collaboration bridge placeholder`);
    assert.equal(count(template, '{{HOME_PERSONAL_BRIDGE}}'), 1, `${locale}: personal bridge placeholder`);

    assert.doesNotMatch(template, /\{\{HOME_PRIMARY_PATHS\}\}|\{\{HOME_EVIDENCE_SIGNALS\}\}|\{\{FEATURED_PUBLICATIONS\}\}/);
    assert.doesNotMatch(template, /id="now-title"|id="explore-title"|id="english-layer-title"/);

    assertOrdered(template, [
      'class="tr-home-hero"',
      '{{HOME_PROOF_STRIP}}',
      '{{HOME_FLAGSHIPS}}',
      '{{HOME_EXPERIENCE_BRIDGE}}',
      '{{HOME_WRITING_BRIDGE}}',
      '{{HOME_COLLABORATION_BRIDGE}}',
      '{{HOME_PERSONAL_BRIDGE}}',
    ], locale);
  }
});

test('C2 primary navigation is bounded to five semantic destinations and Contacts remains secondary', () => {
  const expectedRu = ['Проекты', 'Опыт', 'Материалы', 'Работа со мной', 'Обо мне'];
  const expectedEn = ['Projects', 'Experience', 'Writing', 'Work with me', 'About'];

  assert.deepEqual(primaryNavTexts(read(RU_TEMPLATE)), expectedRu);
  assert.deepEqual(primaryNavTexts(read(EN_TEMPLATE)), expectedEn);
  assert.deepEqual(tocHeaderTexts(), expectedRu);

  const toc = read(TOC);
  assert.match(toc, /- name: Контакты\s+href: \.\/landing\/contacts\.md/);
  assert.doesNotMatch(toc.slice(toc.indexOf('    leftItems:'), toc.indexOf('    rightItems:')), /text: Контакты/);
});

test('C2 rendered homepage exposes four proof facts, three selected projects and three compact bridges', () => {
  const projects = loadProjectRegistry(PROJECTS);
  const evidence = loadProjectEvidence(EVIDENCE, {projects});
  const collaboration = loadCollaboration();

  for (const [templatePath, locale] of [[RU_TEMPLATE, 'ru'], [EN_TEMPLATE, 'en']]) {
    const html = renderStandaloneHome(read(templatePath), 'https://trueruslan.ru', projects, {
      locale,
      evidence,
      collaboration,
      hrefTransform: locale === 'en' ? englishProjectHref : (href) => href,
    });

    assert.equal(count(html, 'data-home-proof='), 4, `${locale}: proof facts`);
    assert.equal(count(html, 'data-home-flagship='), 3, `${locale}: selected work`);
    assert.equal(count(html, 'data-home-bridge="experience"'), 1, `${locale}: experience bridge`);
    assert.equal(count(html, 'data-home-bridge="writing"'), 1, `${locale}: writing bridge`);
    assert.equal(count(html, 'data-home-collaboration='), 1, `${locale}: collaboration bridge`);
    assert.equal(count(html, 'data-home-bridge="personal"'), 1, `${locale}: personal bridge`);

    assert.doesNotMatch(html, /EVIDENCE \/ CURRENT BOUNDARY|Принятый installed результат|Accepted installed result/);
    assert.doesNotMatch(html, /data-home-path=|data-home-evidence=/);
    assert.doesNotMatch(html, /NODE ZERO|data-home-flagship="vlezet"/);
    assert.doesNotMatch(html, /\{\{HOME_/);
  }
});

test('C2 hero front-loads role, experience and no more than three actions', () => {
  const ru = read(RU_TEMPLATE);
  const en = read(EN_TEMPLATE);

  assert.match(ru, /Java Backend Engineer[^<]*5\+ лет/);
  assert.match(ru, /backend-инженер[^<]*5\+ год/i);
  assert.match(ru, /сервис[^<]*интеграц[^<]*data-heavy/is);
  assert.equal(count(ru, 'class="tr-home-actions__link'), 3);
  assert.match(ru, /tr-home-actions__link--primary[^>]*href="landing\/projects\.html"/);
  assert.match(ru, /href="landing\/resume\.html"/);
  assert.match(ru, /href="landing\/work-with-me\.html"/);

  assert.match(en, /Java Backend Engineer[^<]*5\+ years/);
  assert.match(en, /backend engineer[^<]*5\+ years/i);
  assert.match(en, /services[^<]*integrations[^<]*data-intensive/is);
  assert.equal(count(en, 'class="tr-home-actions__link'), 3);
  assert.match(en, /tr-home-actions__link--primary[^>]*href="en\/projects\.html"/);
  assert.match(en, /href="en\/resume\.html"/);
  assert.match(en, /href="en\/work-with-me\.html"/);
});

test('C2 removes equal-weight sitemap and current-focus sections from the homepage surface', () => {
  const combined = `${read(RU_TEMPLATE)}\n${read(EN_TEMPLATE)}`;

  assert.doesNotMatch(combined, /Остальная платформа|Selected English layer|Открыть актуальный `?\/now|Open the current `?\/now snapshot/);
  assert.doesNotMatch(combined, /tr-home-grid--explore|tr-home-now--link/);
  assert.doesNotMatch(combined, /Проверяемый текущий статус|Reviewable current status/);
});
