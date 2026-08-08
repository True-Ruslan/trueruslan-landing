import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {renderHomepagePrimaryPaths, selectHomepageFlagships} from './standalone-home.js';

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

test('homepage project path and current-focus copy highlight NotchHub instead of Vlezet', () => {
  for (const locale of ['ru', 'en']) {
    const paths = renderHomepagePrimaryPaths(locale);
    assert.match(paths, /NotchHub/);
    assert.doesNotMatch(paths, /Vlezet/);
  }

  for (const relativePath of ['templates/index.html', 'templates/index.en.html']) {
    const source = read(relativePath);
    assert.match(source, /NotchHub/);
    assert.doesNotMatch(source, /VillAIgence · Vlezet|Vlezet · Portfolio/);
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
    assert.doesNotMatch(source, /M1[^\n]*(?:ACCEPTED|ПРИНЯТ)/i);
  }
});

test('NotchHub has localized routing and project history while Vlezet remains directly reachable', () => {
  const i18n = json('data/i18n.json');
  assert.deepEqual(i18n.find((entry) => entry.id === 'notchhub'), {
    id: 'notchhub',
    ru: 'landing/projects/notchhub.html',
    en: 'en/projects/notchhub.html',
  });

  const history = json('data/project-history/notchhub.json');
  assert.equal(history.project, 'notchhub');
  assert.ok(history.events.some((event) => event.id === 'personal-release-0-1-0'));
  assert.ok(history.events.some((event) => event.id === 'm1-in-progress'));

  const toc = read('docs/toc.yaml');
  assert.match(toc, /NotchHub[^\n]*\n\s+href: \.\/landing\/projects\/notchhub\.md/);
  assert.match(toc, /NotchHub[^\n]*\n\s+href: \.\/en\/projects\/notchhub\.md/);
  assert.match(toc, /Vlezet[^\n]*\n\s+href: \.\/landing\/projects\/vlezet\.md/);
});
