import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  postprocessOutput,
  walkAssets,
  writeRobotsTxt,
  writeSitemap,
} from './copy-assets.js';
import {readPngDimensions} from './og-image.js';
import {injectSseIntoHtml} from './serve.js';

test('walkAssets copies supported image and PDF files preserving paths', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-assets-'));
  const docsDir = path.join(tempRoot, 'docs');
  const imagesDir = path.join(docsDir, 'assets', 'images');
  const documentsDir = path.join(docsDir, 'assets', 'documents');
  const outputDir = path.join(tempRoot, 'docs-html');

  fs.mkdirSync(imagesDir, {recursive: true});
  fs.mkdirSync(documentsDir, {recursive: true});
  fs.mkdirSync(outputDir);
  fs.writeFileSync(path.join(imagesDir, 'avatar.png'), 'png');
  fs.writeFileSync(path.join(documentsDir, 'cv.pdf'), '%PDF-test');

  const copied = walkAssets(path.join(docsDir, 'assets'), outputDir, docsDir);

  assert.deepEqual(copied.sort(), [
    path.join('assets', 'documents', 'cv.pdf'),
    path.join('assets', 'images', 'avatar.png'),
  ]);
  assert.ok(fs.existsSync(path.join(outputDir, 'assets', 'images', 'avatar.png')));
  assert.ok(fs.existsSync(path.join(outputDir, 'assets', 'documents', 'cv.pdf')));
});

test('injectSseIntoHtml is idempotent', () => {
  const html = '<!DOCTYPE html><html><head></head><body></body></html>';
  const sseScript = 'const events = new EventSource("/events");';
  const once = injectSseIntoHtml(html, sseScript);
  const twice = injectSseIntoHtml(once, sseScript);

  assert.match(once, /EventSource/);
  assert.equal(once, twice);
});

test('writeRobotsTxt and writeSitemap create files', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-seo-'));
  const original = process.env.SITE_URL;
  process.env.SITE_URL = 'https://example.test';

  try {
    writeRobotsTxt(tempRoot);
    writeSitemap(tempRoot);

    const robots = fs.readFileSync(path.join(tempRoot, 'robots.txt'), 'utf8');
    const sitemap = fs.readFileSync(path.join(tempRoot, 'sitemap.xml'), 'utf8');

    assert.match(robots, /https:\/\/example\.test\/sitemap\.xml/);
    assert.match(sitemap, /https:\/\/example\.test\/landing\/about\.html/);
  } finally {
    if (original === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = original;
  }
});

test('postprocessOutput writes v0.3 content, Engineering Map, metadata, OG card and SEO output', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-postprocess-'));
  const docsDir = path.join(tempRoot, 'docs');
  const templatePath = path.join(tempRoot, 'templates', 'index.html');
  const dataDir = path.join(tempRoot, 'data');
  const pageMetaPath = path.join(dataDir, 'page-meta.json');
  const engineeringGraphPath = path.join(dataDir, 'engineering-graph.json');
  const projectRegistryPath = path.join(dataDir, 'projects.json');
  const nowPath = path.join(dataDir, 'now.json');
  const notesPath = path.join(dataDir, 'notes.json');
  const historyDir = path.join(dataDir, 'project-history');
  const outputDir = path.join(tempRoot, 'docs-html');
  const engineeringMapPath = path.join(outputDir, 'landing', 'engineering-map.html');
  const nowHtmlPath = path.join(outputDir, 'landing', 'now.html');
  const noteHtmlPath = path.join(outputDir, 'landing', 'notes', 'test-note.html');
  const noteSourcePath = path.join(docsDir, 'landing', 'notes', 'test-note.md');

  fs.mkdirSync(path.dirname(templatePath), {recursive: true});
  fs.mkdirSync(dataDir, {recursive: true});
  fs.mkdirSync(historyDir, {recursive: true});
  fs.mkdirSync(path.dirname(engineeringMapPath), {recursive: true});
  fs.mkdirSync(path.dirname(noteHtmlPath), {recursive: true});
  fs.mkdirSync(path.dirname(noteSourcePath), {recursive: true});
  fs.writeFileSync(path.join(docsDir, 'toc.yaml'), 'items:\n  - name: About\n    href: ./landing/about.md\n  - name: Now\n    href: ./landing/now.md\n');
  fs.writeFileSync(noteSourcePath, '# Test note\n');
  fs.writeFileSync(
    templatePath,
    '<!doctype html><html><head><link rel="canonical" href="{{SITE_URL}}/"></head><body class="g-root"><h1>Руслан Немыкин</h1><section>{{CURRENTLY_BUILDING}}</section></body></html>',
  );
  fs.writeFileSync(projectRegistryPath, JSON.stringify([{
    slug: 'test-project',
    name: 'Test Project',
    status: 'production',
    statusLabel: 'PRODUCTION',
    summary: 'A test project.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/test-project.html',
    tags: ['Node.js', 'Testing'],
  }]));
  fs.writeFileSync(nowPath, JSON.stringify({
    updated: '2026-07-22',
    focus: 'Testing the integrated build.',
    learning: ['Deterministic generation'],
    writing: ['Integration tests'],
  }));
  fs.writeFileSync(notesPath, JSON.stringify([{
    slug: 'test-note',
    title: 'Test note',
    description: 'Feed entry.',
    published: '2026-07-20',
    updated: '2026-07-22',
    readingMinutes: 3,
    tags: ['Testing'],
    related: [],
  }]));
  fs.writeFileSync(pageMetaPath, JSON.stringify([{
    path: 'index.html',
    card: 'home',
    title: 'Руслан Немыкин — Backend Engineer',
    description: 'Portfolio test description.',
    displayTitle: 'RUSLAN NEMYKIN',
    kicker: 'BACKEND ENGINEER',
    tags: ['JAVA', 'AI'],
    accent: 'cyan',
  }]));
  fs.writeFileSync(engineeringGraphPath, JSON.stringify({
    filters: [{id:'backend',label:'Backend'}],
    nodes: [
      {id:'java',label:'Java',kind:'technology',description:'Language',column:1,row:1,tags:['backend']},
      {id:'systems',label:'Systems',kind:'domain',description:'Domain',column:2,row:2,tags:['backend'],href:'resume.html'},
    ],
    edges: [{from:'java',to:'systems',label:'builds'}],
  }));
  fs.writeFileSync(
    path.join(outputDir, 'index.html'),
    '<!doctype html><html><head><title>Generated</title></head><body class="g-root g-root_theme_light"></body></html>',
  );
  fs.writeFileSync(
    engineeringMapPath,
    '<!doctype html><html><head><title>Map</title></head><body><div data-tr-engineering-graph-root></div></body></html>',
  );
  fs.writeFileSync(
    nowHtmlPath,
    '<!doctype html><html><head><title>Now</title></head><body><main><h1>Now</h1><div data-tr-now-placeholder></div></main></body></html>',
  );
  fs.writeFileSync(
    noteHtmlPath,
    '<!doctype html><html><head><title>Note</title></head><body><main><h1>Test note</h1><p>Body</p></main></body></html>',
  );

  const result = postprocessOutput({
    outputDir,
    docsDir,
    standaloneTemplatePath: templatePath,
    pageMetaPath,
    engineeringGraphPath,
    projectRegistryPath,
    projectHistoryDir: historyDir,
    nowPath,
    notesPath,
    siteUrl: 'https://example.test',
    copyAssets: false,
  });

  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  const mapHtml = fs.readFileSync(engineeringMapPath, 'utf8');
  const nowHtml = fs.readFileSync(nowHtmlPath, 'utf8');
  const noteHtml = fs.readFileSync(noteHtmlPath, 'utf8');
  const feed = fs.readFileSync(path.join(outputDir, 'feed.xml'), 'utf8');
  const robots = fs.readFileSync(path.join(outputDir, 'robots.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(outputDir, 'sitemap.xml'), 'utf8');
  const ogPath = path.join(outputDir, 'assets', 'og', 'home.png');

  assert.equal(result.copied.length, 0);
  assert.equal(result.nowPageTarget, 'landing/now.html');
  assert.equal(result.timelineTargets.length, 0);
  assert.equal(result.noteTargets.length, 1);
  assert.equal(result.engineeringGraphTarget, 'landing/engineering-map.html');
  assert.equal(result.ogCards.length, 1);
  assert.equal(result.metadataUpdated, 1);
  assert.equal(result.personSchemaInjected, true);
  assert.match(mapHtml, /data-tr-engineering-graph-build="ready"/);
  assert.match(mapHtml, /data-tr-engineering-graph-data/);
  assert.match(mapHtml, /Java/);
  assert.match(nowHtml, /Test Project/);
  assert.match(noteHtml, /3 мин/);
  assert.match(noteHtml, /tr-note-nav/);
  assert.match(feed, /Test note/);
  assert.match(html, /Руслан Немыкин/);
  assert.match(html, /Test Project/);
  assert.match(html, /application\/atom\+xml/);
  assert.match(html, /https:\/\/example\.test\/assets\/og\/home\.png/);
  assert.match(html, /summary_large_image/);
  assert.match(html, /data-tr-local-path="\/assets\/og\/home\.png"/);
  assert.doesNotMatch(html, /g-root_theme_light/);
  assert.doesNotMatch(html, /_bundle\//);
  assert.match(html, /application\/ld\+json/);
  assert.match(robots, /https:\/\/example\.test\/sitemap\.xml/);
  assert.match(sitemap, /landing\/now\.html/);
  assert.ok(fs.existsSync(path.join(outputDir, '.nojekyll')));
  assert.deepEqual(readPngDimensions(fs.readFileSync(ogPath)), {width: 1200, height: 630});
});
