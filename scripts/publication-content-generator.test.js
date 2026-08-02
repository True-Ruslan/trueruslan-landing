import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  renderPublicationCatalogueInclude,
  writePublicationCatalogueInclude,
} from './publication-content-generator.js';

function publication(overrides = {}) {
  return {
    id: 'diplodoc-github-pages',
    title: "Простенький лендинг/wiki для вас и вашего проекта или как покорить Diplodoc'а и опубликовать на GitHub Pages",
    kind: 'technical-article',
    platform: 'Habr',
    date: '2025-08-23',
    role: 'author',
    language: 'ru',
    summary: 'Практический разбор статической документационной платформы.',
    topics: Object.freeze(['Diplodoc', 'GitHub Pages']),
    canonicalUrl: 'https://habr.com/ru/articles/936508/',
    links: Object.freeze([]),
    featured: true,
    featuredOrder: 1,
    relatedProjects: Object.freeze([]),
    relatedNotes: Object.freeze(['portfolio-runtime-boundary']),
    verifiedAt: '2026-08-02',
    ...overrides,
  };
}

test('renderPublicationCatalogueInclude emits deterministic searchable catalogue HTML from the registry', () => {
  const html = renderPublicationCatalogueInclude([publication()], {
    noteLabels: new Map([['portfolio-runtime-boundary', 'Runtime boundary']]),
  });

  assert.match(html, /^<!-- GENERATED: data\/publications\.json; DO NOT EDIT -->\n/);
  assert.match(html, /data-tr-publications-prebuild/);
  assert.match(html, /data-tr-publications-root/);
  assert.match(html, /Технические статьи/);
  assert.match(html, /покорить Diplodoc/);
  assert.match(html, /Практический разбор статической документационной платформы/);
  assert.match(html, /landing\/notes\/portfolio-runtime-boundary\.html">Runtime boundary<\/a>/);
  assert.doesNotMatch(html, /Избранное|featured-publications-title/);
  assert.equal((html.match(/data-tr-publication-id=/g) ?? []).length, 1);
});

test('writePublicationCatalogueInclude creates parent directories and writes stable UTF-8 content', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-include-'));
  const outputPath = path.join(root, 'docs', '_includes', 'publications-catalogue.md');

  const first = writePublicationCatalogueInclude({
    outputPath,
    publications: [publication()],
  });
  const firstContent = fs.readFileSync(outputPath, 'utf8');
  const second = writePublicationCatalogueInclude({
    outputPath,
    publications: [publication()],
  });

  assert.equal(first, outputPath);
  assert.equal(second, outputPath);
  assert.equal(fs.readFileSync(outputPath, 'utf8'), firstContent);
  assert.match(firstContent, /data-tr-publications-prebuild/);
  assert.equal(firstContent.endsWith('\n'), true);
});
