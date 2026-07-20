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

test('postprocessOutput writes homepage, Engineering Map, metadata, OG card and SEO output', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-postprocess-'));
  const docsDir = path.join(tempRoot, 'docs');
  const templatePath = path.join(tempRoot, 'templates', 'index.html');
  const pageMetaPath = path.join(tempRoot, 'data', 'page-meta.json');
  const engineeringGraphPath = path.join(tempRoot, 'data', 'engineering-graph.json');
  const outputDir = path.join(tempRoot, 'docs-html');
  const engineeringMapPath = path.join(outputDir, 'landing', 'engineering-map.html');

  fs.mkdirSync(path.dirname(templatePath), {recursive: true});
  fs.mkdirSync(path.dirname(pageMetaPath), {recursive: true});
  fs.mkdirSync(path.dirname(engineeringMapPath), {recursive: true});
  fs.mkdirSync(docsDir, {recursive: true});
  fs.writeFileSync(path.join(docsDir, 'toc.yaml'), 'items:\n  - name: About\n    href: ./landing/about.md\n');
  fs.writeFileSync(
    templatePath,
    '<!doctype html><html><head><link rel="canonical" href="{{SITE_URL}}/"></head><body class="g-root"><h1>Руслан Немыкин</h1></body></html>',
  );
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

  const result = postprocessOutput({
    outputDir,
    docsDir,
    standaloneTemplatePath: templatePath,
    pageMetaPath,
    engineeringGraphPath,
    siteUrl: 'https://example.test',
    copyAssets: false,
  });

  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  const mapHtml = fs.readFileSync(engineeringMapPath, 'utf8');
  const robots = fs.readFileSync(path.join(outputDir, 'robots.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(outputDir, 'sitemap.xml'), 'utf8');
  const ogPath = path.join(outputDir, 'assets', 'og', 'home.png');

  assert.equal(result.copied.length, 0);
  assert.equal(result.engineeringGraphTarget, 'landing/engineering-map.html');
  assert.equal(result.ogCards.length, 1);
  assert.equal(result.metadataUpdated, 1);
  assert.equal(result.personSchemaInjected, true);
  assert.match(mapHtml, /data-tr-engineering-graph-build="ready"/);
  assert.match(mapHtml, /data-tr-engineering-graph-data/);
  assert.match(mapHtml, /Java/);
  assert.match(html, /Руслан Немыкин/);
  assert.match(html, /https:\/\/example\.test\/assets\/og\/home\.png/);
  assert.match(html, /summary_large_image/);
  assert.match(html, /data-tr-local-path="\/assets\/og\/home\.png"/);
  assert.doesNotMatch(html, /g-root_theme_light/);
  assert.doesNotMatch(html, /_bundle\//);
  assert.match(html, /application\/ld\+json/);
  assert.match(robots, /https:\/\/example\.test\/sitemap\.xml/);
  assert.match(sitemap, /landing\/about\.html/);
  assert.ok(fs.existsSync(path.join(outputDir, '.nojekyll')));
  assert.deepEqual(readPngDimensions(fs.readFileSync(ogPath)), {width: 1200, height: 630});
});
