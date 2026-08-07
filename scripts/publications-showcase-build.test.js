import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {validatePublicationRegistry} from './publication-registry.js';
import {renderPublicationCatalogue} from './publication-renderer.js';
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
    en: {
      summary: 'A practical static publishing walkthrough.',
      topics: ['Diplodoc'],
    },
    canonicalUrl: 'https://habr.com/ru/articles/936508/',
    links: [],
    featured: true,
    featuredOrder: 1,
    relatedProjects: [],
    relatedNotes: [],
    verifiedAt: '2026-08-02',
  }], {asOf: '2026-08-02'});
}

function catalogueHtml(locale = 'ru') {
  return `<div data-tr-publications-prebuild>${renderPublicationCatalogue(publications(), {locale})}</div>`;
}

function encodedStateHtml(content) {
  const state = JSON.stringify({data: {html: content}})
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<!doctype html><html><head><base href="../"></head><body><div id="root"></div><script type="application/json" id="diplodoc-state">${state}</script></body></html>`;
}

test('applyPublicationsShowcase replaces the direct featured placeholder and preserves the prebuilt catalogue', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-apply-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, `<!doctype html><html><head><base href="../"></head><body><main><p>Keep intro</p><div data-tr-publications-featured></div>${catalogueHtml()}<p>Keep outro</p></main></body></html>`);

  assert.equal(applyPublicationsShowcase(outputDir, publications()), 'landing/publications.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.match(html, /Keep intro/);
  assert.match(html, /Избранное/);
  assert.match(html, /data-tr-publications-prebuild/);
  assert.match(html, /Технические статьи/);
  assert.match(html, /Diplodoc и GitHub Pages/);
  assert.match(html, /Keep outro/);
  assert.doesNotMatch(html, /data-tr-publications-featured(?:=|>)/);
  assert.equal((html.match(/data-tr-publication-id/g) ?? []).length, 2);
  assert.equal((html.match(/_assets\/style\/publications\.css/g) ?? []).length, 1);
  assert.doesNotMatch(html, /data-tr-publications-noscript/);
});

test('applyPublicationsShowcase patches Diplodoc state and adds one compact locale-addressable no-JS catalogue', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-state-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, encodedStateHtml(`<h1>Публикации и выступления</h1><div data-tr-publications-featured></div>${catalogueHtml()}`));

  applyPublicationsShowcase(outputDir, publications());
  const html = fs.readFileSync(htmlPath, 'utf8');
  const fallbackStart = html.indexOf('<noscript data-tr-publications-noscript="ru">');
  const fallbackEnd = html.indexOf('</noscript>', fallbackStart);
  const fallback = html.slice(fallbackStart, fallbackEnd);

  assert.match(html, /id="diplodoc-state"/);
  assert.match(html, /Diplodoc и GitHub Pages/);
  assert.match(html, /<noscript data-tr-publications-noscript="ru">/);
  assert.match(fallback, /#root\{display:none!important\}/);
  assert.match(fallback, /<h1>Публикации и выступления<\/h1>/);
  assert.match(fallback, /Технические статьи/);
  assert.doesNotMatch(fallback, /Избранное/);
  assert.equal((fallback.match(/data-tr-publication-id/g) ?? []).length, 1);
  assert.equal((html.match(/data-tr-publications-noscript/g) ?? []).length, 1);
});

test('applyPublicationsShowcase writes the English target from the same publication records', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-en-state-'));
  const htmlPath = path.join(outputDir, 'en', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, encodedStateHtml(`<h1>Publications and talks</h1><div data-tr-publications-featured></div>${catalogueHtml('en')}`));

  assert.equal(applyPublicationsShowcase(outputDir, publications(), {
    target: 'en/publications.html',
    locale: 'en',
  }), 'en/publications.html');

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /data-tr-publications-noscript="en"/);
  assert.match(html, /Publications and talks/);
  assert.match(html, /Technical articles/);
  assert.match(html, /A practical static publishing walkthrough/);
  assert.match(html, /lang=\\?"ru\\?"/);
  assert.doesNotMatch(html, /Технические статьи|Техническая статья|Автор|Темы|Читать на/);
});

test('applyPublicationsShowcase fails closed when the generated catalogue is missing', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-missing-catalogue-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, '<!doctype html><html><head></head><body><div data-tr-publications-featured></div></body></html>');

  assert.throws(() => applyPublicationsShowcase(outputDir, publications()), /generated publication catalogue/i);
});

test('applyPublicationsShowcase fails closed when the featured placeholder is missing', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-publications-missing-featured-'));
  const htmlPath = path.join(outputDir, 'landing', 'publications.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(htmlPath, `<!doctype html><html><head></head><body>${catalogueHtml()}</body></html>`);

  assert.throws(() => applyPublicationsShowcase(outputDir, publications()), /featured placeholder/i);
});
