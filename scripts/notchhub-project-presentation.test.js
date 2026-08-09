import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadCollaboration} from './collaboration.js';
import {renderStandaloneHome, selectHomepageFlagships} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

function projectBySlug(projects, slug) {
  const project = projects.find((candidate) => candidate.slug === slug);
  assert.ok(project, `missing project ${slug}`);
  return project;
}

test('NotchHub replaces Vlezet in the homepage flagship set without deleting Vlezet history', () => {
  const projects = json('data/projects.json');
  const notchhub = projectBySlug(projects, 'notchhub');
  const vlezet = projectBySlug(projects, 'vlezet');

  assert.equal(notchhub.visibility, 'public');
  assert.equal(notchhub.active, true);
  assert.equal(notchhub.featured, true);
  assert.equal(notchhub.href, 'landing/projects/notchhub.html');
  assert.equal(notchhub.links?.github, 'https://github.com/True-Ruslan/notch-hub');
  assert.match(notchhub.statusLabel, /development|in progress/i);

  assert.equal(vlezet.visibility, 'public');
  assert.equal(vlezet.active, true);
  assert.equal(vlezet.featured, false);
  assert.equal(vlezet.href, 'landing/projects/vlezet.html');
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/landing/projects/vlezet.md')));
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/en/projects/vlezet.md')));

  assert.deepEqual(
    selectHomepageFlagships(projects).map((project) => project.slug),
    ['livingworld', 'notchhub', 'portfolio-platform'],
  );
});

test('C2 selected work highlights NotchHub instead of Vlezet while Now keeps current project truth', () => {
  const projects = json('data/projects.json');
  const collaboration = loadCollaboration();

  const ru = renderStandaloneHome(read('templates/index.html'), 'https://trueruslan.ru', projects, {collaboration});
  const en = renderStandaloneHome(read('templates/index.en.html'), 'https://trueruslan.ru', projects, {
    locale: 'en',
    collaboration,
    hrefTransform: (href) => ({
      'landing/projects/livingworld.html': 'en/projects/livingworld.html',
      'landing/projects/notchhub.html': 'en/projects/notchhub.html',
      'landing/projects/portfolio-platform.html': 'en/projects/portfolio-platform.html',
    })[href] ?? href,
  });

  for (const html of [ru, en]) {
    assert.match(html, /data-home-flagship="notchhub"/);
    assert.doesNotMatch(html, /data-home-flagship="vlezet"/);
  }

  const now = JSON.stringify(json('data/now.json'));
  assert.match(now, /NotchHub/);
  assert.doesNotMatch(now, /Vlezet/);
});

test('NotchHub case studies expose accepted 0.1.0 foundation separately from pending M1', () => {
  for (const relativePath of ['docs/landing/projects/notchhub.md', 'docs/en/projects/notchhub.md']) {
    assert.ok(fs.existsSync(path.join(ROOT, relativePath)), `missing ${relativePath}`);
    const source = read(relativePath);

    for (const marker of ['0.1.0', 'M0', 'R0.1', 'P0', 'P0.1', 'SwiftUI', 'AppKit', 'App Sandbox', 'Hardened Runtime']) {
      assert.ok(source.includes(marker), `${relativePath}: missing accepted-boundary marker ${marker}`);
    }
    assert.match(source, /Draft PR #10/i);
    assert.match(source, /M1/i);
    assert.match(source, /not accepted|не принят|не принято/i);
    assert.match(source, /not notarized|не нотарифицирован/i);
    assert.doesNotMatch(source, /M1[^\n]{0,80}(?:status|статус)\s*:\s*(?:ACCEPTED|ПРИНЯТ(?:О|А)?)/i);
  }
});

test('NotchHub has localized routing and canonical timeline while Vlezet remains directly reachable', () => {
  const i18n = json('data/i18n.json');
  assert.deepEqual(i18n.find((entry) => entry.id === 'notchhub'), {
    id: 'notchhub',
    ru: 'landing/projects/notchhub.html',
    en: 'en/projects/notchhub.html',
  });

  const history = json('data/project-history/notchhub.json');
  assert.ok(Array.isArray(history));
  assert.ok(history.some((event) => event.state === 'past' && /0\.1\.0|Personal Release/i.test(`${event.title} ${event.description}`)));
  assert.ok(history.some((event) => event.state === 'current' && /M1|PR #10/i.test(`${event.title} ${event.description}`)));

  const toc = read('docs/toc.yaml');
  assert.match(toc, /NotchHub[^\n]*\n\s+href: \.\/landing\/projects\/notchhub\.md/);
  assert.match(toc, /NotchHub[^\n]*\n\s+href: \.\/en\/projects\/notchhub\.md/);
  assert.match(toc, /Vlezet[^\n]*\n\s+href: \.\/landing\/projects\/vlezet\.md/);
});

test('NotchHub participates in the complete RU EN metadata and generated-project post-processing contract', () => {
  const pageMeta = json('data/page-meta.json');
  const ruMeta = pageMeta.find((entry) => entry.path === 'landing/projects/notchhub.html');
  const enMeta = pageMeta.find((entry) => entry.path === 'en/projects/notchhub.html');

  assert.ok(ruMeta, 'missing RU NotchHub page metadata');
  assert.ok(enMeta, 'missing EN NotchHub page metadata');
  assert.equal(ruMeta.card, 'notchhub');
  assert.equal(enMeta.card, 'notchhub-en');
  assert.match(ruMeta.title, /NotchHub/);
  assert.match(enMeta.title, /NotchHub/);

  const postprocessor = read('scripts/copy-assets.js');
  assert.match(
    postprocessor,
    /if \(href === 'landing\/projects\/notchhub\.html'\) return 'en\/projects\/notchhub\.html';/,
  );
  assert.match(
    postprocessor,
    /targets:\s*\[[\s\S]*?'en\/projects\/notchhub\.html'[\s\S]*?\]/,
  );
});
