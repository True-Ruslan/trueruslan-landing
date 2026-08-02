import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {validatePublicationRegistry} from './publication-registry.js';
import {applyPublicationsShowcase} from './publications-showcase.js';

function publications() {
  return validatePublicationRegistry([{
    id: 'diplodoc-github-pages',
    title: 'Diplodoc и GitHub Pages',
    kind: 'technical-article',
    platform: 'Habr',
    date: '2025-08-23',
    role: 'author',
    language: 'ru',
    summary: 'Практический разбор статической публикации.',
    topics: ['Diplodoc'],
    canonicalUrl: 'https://habr.com/ru/articles/936508/',
    links: [],
    featured: true,
    featuredOrder: 1,
    relatedProjects: [],
    relatedNotes: [],
    verifiedAt: '2026-08-02',
  }], {asOf: '2026-08-02'});
}

function encodedStateHtml(content) {
  const state = JSON.stringify({data: {html: content}})
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<!doctype html><html><head><base href="../"></head><body><div id="root"></div><script type="application/json" id="diplodoc-state">${state}</script></body></html>`;
}

test('applyPublicationsShowcase replaces both direct DOM placeholders and injects page CSS once', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-apply-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, '<!doctype html><html><head><base href="../"></head><body><main><p>Keep intro</p><div data-tr-publications-featured></div><div data-tr-publications-catalogue></div><p>Keep outro</p></main></body></html>');

  assert.equal(applyPublicationsShowcase(outputDir, publications()), 'landing/publications.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.match(html, /Keep intro/);
  assert.match(html, /Избранное/);
  assert.match(html, /Технические статьи/);
  assert.match(html, /Diplodoc и GitHub Pages/);
  assert.match(html, /Keep outro/);
  assert.doesNotMatch(html, /data-tr-publications-featured(?:=|>)/);
  assert.doesNotMatch(html, /data-tr-publications-catalogue(?:=|>)/);
  assert.equal((html.match(/_assets\/style\/publications\.css/g) ?? []).length, 1);
  assert.doesNotMatch(html, /data-tr-publications-noscript/);
});

test('applyPublicationsShowcase patches Diplodoc state and adds semantic no-JS fallback', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-state-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, encodedStateHtml('<h1>Публикации и выступления</h1><div data-tr-publications-featured></div><div data-tr-publications-catalogue></div>'));

  applyPublicationsShowcase(outputDir, publications());
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.match(html, /id="diplodoc-state"/);
  assert.match(html, /Diplodoc и GitHub Pages/);
  assert.match(html, /<noscript data-tr-publications-noscript>/);
  assert.match(html, /<h1>Публикации и выступления<\/h1>/);
  assert.equal((html.match(/data-tr-publication-id/g) ?? []).length >= 2, true);
  assert.equal((html.match(/data-tr-publications-noscript/g) ?? []).length, 1);
});

test('applyPublicationsShowcase fails closed when a required placeholder is missing', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-missing-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, '<!doctype html><html><head></head><body><div data-tr-publications-featured></div></body></html>');

  assert.throws(() => applyPublicationsShowcase(outputDir, publications()), /catalogue placeholder/i);
});
