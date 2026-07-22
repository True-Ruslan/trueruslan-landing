import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {postprocessOutput} from './copy-assets.js';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, JSON.stringify(value));
}

test('postprocessOutput generates canonical photo archive, legacy bridge and sitemap route', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-photo-postprocess-'));
  const docsDir = path.join(root, 'docs');
  const outputDir = path.join(root, 'docs-html');
  const dataDir = path.join(root, 'data');
  const templatesDir = path.join(root, 'templates');
  const historyDir = path.join(dataDir, 'project-history');
  const noteSource = path.join(docsDir, 'landing', 'notes', 'test-note.md');
  const noteOutput = path.join(outputDir, 'landing', 'notes', 'test-note.html');

  fs.mkdirSync(path.join(outputDir, 'landing'), {recursive: true});
  fs.mkdirSync(path.join(docsDir, 'landing'), {recursive: true});
  fs.mkdirSync(path.dirname(noteSource), {recursive: true});
  fs.mkdirSync(path.dirname(noteOutput), {recursive: true});
  fs.mkdirSync(historyDir, {recursive: true});
  fs.mkdirSync(templatesDir, {recursive: true});

  fs.writeFileSync(path.join(docsDir, 'toc.yaml'), 'items:\n  - name: Фото\n    href: ./landing/photos.md\n');
  fs.writeFileSync(path.join(docsDir, 'landing', 'photos.md'), '# Фотографии\n');
  fs.writeFileSync(noteSource, '# Test note\n');
  fs.writeFileSync(noteOutput, '<!doctype html><html><head><title>Note</title></head><body><main><h1>Test note</h1><p>Body</p></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'photos.html'), '<html><body>Old photos</body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'projects.html'), '<!doctype html><html><head><title>Projects</title></head><body><main><h1>Projects</h1><span data-tr-project-status="test-project"></span></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'engineering-map.html'), '<html><body><div data-tr-engineering-graph-root></div></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'now.html'), '<html><body><div data-tr-now-placeholder></div></body></html>');
  fs.writeFileSync(path.join(outputDir, 'index.html'), '<!doctype html><html><head></head><body></body></html>');
  fs.writeFileSync(
    path.join(templatesDir, 'index.html'),
    '<!doctype html><html><head><link rel="canonical" href="{{SITE_URL}}/"></head><body><section>{{CURRENTLY_BUILDING}}</section></body></html>',
  );

  writeJson(path.join(dataDir, 'projects.json'), [{
    slug: 'test-project',
    name: 'Test Project',
    status: 'production',
    statusLabel: 'PRODUCTION',
    summary: 'Test project.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/test-project.html',
    tags: ['Node.js', 'Testing'],
  }]);
  writeJson(path.join(dataDir, 'now.json'), {
    updated: '2026-07-22',
    focus: 'Testing photo stories.',
    learning: ['Static generation'],
    writing: ['Photo stories'],
  });
  writeJson(path.join(dataDir, 'notes.json'), [{
    slug: 'test-note',
    title: 'Test note',
    description: 'A valid fixture note.',
    published: '2026-07-20',
    updated: '2026-07-22',
    readingMinutes: 2,
    tags: ['Testing'],
    related: [],
  }]);
  writeJson(path.join(dataDir, 'page-meta.json'), [{
    path: 'index.html',
    card: 'home',
    title: 'Test portfolio',
    description: 'Test portfolio description.',
    displayTitle: 'TEST PORTFOLIO',
    kicker: 'BACKEND ENGINEER',
    tags: ['TEST'],
    accent: 'cyan',
  }]);
  writeJson(path.join(dataDir, 'engineering-graph.json'), {
    filters: [{id: 'backend', label: 'Backend'}],
    nodes: [
      {id: 'java', label: 'Java', kind: 'technology', description: 'Language', column: 1, row: 1, tags: ['backend']},
      {id: 'systems', label: 'Systems', kind: 'domain', description: 'Domain', column: 2, row: 2, tags: ['backend'], href: 'resume.html'},
    ],
    edges: [{from: 'java', to: 'systems', label: 'builds'}],
  });
  writeJson(path.join(dataDir, 'photo-albums.json'), []);
  writeJson(path.join(dataDir, 'photo-archive.json'), [{
    id: 'archive-one',
    src: 'assets/images/archive-one.jpg',
    alt: 'Архивная фотография',
    title: 'Из архива',
    order: 1,
  }]);

  fs.mkdirSync(path.join(docsDir, 'assets', 'images'), {recursive: true});
  fs.writeFileSync(path.join(docsDir, 'assets', 'images', 'archive-one.jpg'), 'jpg');

  const result = postprocessOutput({
    outputDir,
    docsDir,
    standaloneTemplatePath: path.join(templatesDir, 'index.html'),
    pageMetaPath: path.join(dataDir, 'page-meta.json'),
    engineeringGraphPath: path.join(dataDir, 'engineering-graph.json'),
    projectRegistryPath: path.join(dataDir, 'projects.json'),
    projectHistoryDir: historyDir,
    nowPath: path.join(dataDir, 'now.json'),
    notesPath: path.join(dataDir, 'notes.json'),
    photoAlbumsPath: path.join(dataDir, 'photo-albums.json'),
    photoArchivePath: path.join(dataDir, 'photo-archive.json'),
    siteUrl: 'https://example.test',
    copyAssets: false,
  });

  const photoIndex = fs.readFileSync(path.join(outputDir, 'photos', 'index.html'), 'utf8');
  const legacy = fs.readFileSync(path.join(outputDir, 'landing', 'photos.html'), 'utf8');
  const sitemap = fs.readFileSync(path.join(outputDir, 'sitemap.xml'), 'utf8');

  assert.deepEqual(result.photoStoryRoutes, ['photos/']);
  assert.match(photoIndex, /data-tr-photo-page="index"/);
  assert.match(photoIndex, /Из архива/);
  assert.match(legacy, /http-equiv="refresh"/);
  assert.match(legacy, /\.\.\/photos\//);
  assert.match(sitemap, /https:\/\/example\.test\/photos\//);
});
