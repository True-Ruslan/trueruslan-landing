import assert from 'node:assert/strict';
import test from 'node:test';

import {
  renderFeaturedPublications,
  renderPublicationCatalogue,
} from './publication-renderer.js';

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

test('renderFeaturedPublications renders a semantic homepage section with safe external actions', () => {
  const html = renderFeaturedPublications([publication()], {
    surface: 'home',
    catalogueHref: 'landing/publications.html',
  });

  assert.match(html, /<section[^>]*aria-labelledby="featured-publications-title"/);
  assert.match(html, /<h2 id="featured-publications-title">Избранные публикации<\/h2>/);
  assert.match(html, /data-tr-publication-id="diplodoc-github-pages"/);
  assert.match(html, /<time datetime="2025-08-23">23 августа 2025<\/time>/);
  assert.match(html, /Habr · Техническая статья/);
  assert.match(html, /Автор/);
  assert.match(html, /Читать на Habr ↗/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /href="landing\/publications\.html"/);
  assert.equal((html.match(/data-tr-publication-id=/g) ?? []).length, 1);
});

test('renderFeaturedPublications applies editorial ordering and surface limits', () => {
  const publications = [
    publication({id: 'third', canonicalUrl: 'https://example.test/third', featuredOrder: 3}),
    publication({id: 'first', canonicalUrl: 'https://example.test/first', featuredOrder: 1}),
    publication({id: 'second', canonicalUrl: 'https://example.test/second', featuredOrder: 2}),
    publication({id: 'not-featured', canonicalUrl: 'https://example.test/other', featured: false, featuredOrder: undefined}),
  ];

  const home = renderFeaturedPublications(publications, {surface: 'home'});
  assert.ok(home.indexOf('data-tr-publication-id="first"') < home.indexOf('data-tr-publication-id="second"'));
  assert.ok(home.indexOf('data-tr-publication-id="second"') < home.indexOf('data-tr-publication-id="third"'));
  assert.doesNotMatch(home, /not-featured/);

  const page = renderFeaturedPublications(publications, {surface: 'page'});
  assert.match(page, /<h2 id="featured-publications-title">Избранное<\/h2>/);
  assert.equal((page.match(/data-tr-publication-id=/g) ?? []).length, 3);
});

test('renderPublicationCatalogue groups records, omits empty groups and orders newest first', () => {
  const publications = [
    publication({id: 'old', date: '2025-03-04', title: 'Старая статья', canonicalUrl: 'https://example.test/old', featuredOrder: 3}),
    publication({id: 'talk', kind: 'talk', role: 'speaker', date: '2025-09-01', title: 'Доклад', canonicalUrl: 'https://example.test/talk', featured: false, featuredOrder: undefined}),
    publication({id: 'new', date: '2025-08-23', title: 'Новая статья', canonicalUrl: 'https://example.test/new', featuredOrder: 1}),
  ];

  const html = renderPublicationCatalogue(publications);

  assert.match(html, /href="#technical-articles"/);
  assert.match(html, /href="#talks"/);
  assert.match(html, /<section id="technical-articles"/);
  assert.match(html, /<section id="talks"/);
  assert.doesNotMatch(html, /Научные публикации/);
  assert.ok(html.indexOf('Новая статья') < html.indexOf('Старая статья'));
  assert.equal((html.match(/data-tr-publication-id=/g) ?? []).length, 3);
});

test('renderPublicationCatalogue omits in-page navigation when only one group exists', () => {
  const html = renderPublicationCatalogue([publication()]);

  assert.doesNotMatch(html, /tr-publications__group-nav/);
  assert.match(html, /<section id="technical-articles"/);
});

test('renderer escapes registry text and preserves only validated URLs', () => {
  const html = renderPublicationCatalogue([publication({
    title: '<script>alert(1)</script>',
    platform: 'Habr & Co',
    summary: 'A < B & C',
    topics: Object.freeze(['Java < 21']),
  })]);

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Habr &amp; Co/);
  assert.match(html, /A &lt; B &amp; C/);
  assert.match(html, /Java &lt; 21/);
});

test('renderer exposes optional secondary and contextual links without duplicating records', () => {
  const html = renderPublicationCatalogue([publication({
    links: Object.freeze([
      Object.freeze({type: 'slides', label: 'Слайды', url: 'https://example.test/slides'}),
      Object.freeze({type: 'video', label: 'Видео', url: 'https://example.test/video'}),
    ]),
    relatedProjects: Object.freeze(['livingworld']),
    relatedNotes: Object.freeze(['portfolio-runtime-boundary']),
  })]);

  assert.match(html, /href="https:\/\/example\.test\/slides"[^>]*>Слайды ↗<\/a>/);
  assert.match(html, /href="https:\/\/example\.test\/video"[^>]*>Видео ↗<\/a>/);
  assert.match(html, /href="landing\/projects\/livingworld\.html">LivingWorld<\/a>/);
  assert.match(html, /href="landing\/notes\/portfolio-runtime-boundary\.html">Runtime boundary<\/a>/);
  assert.equal((html.match(/data-tr-publication-id=/g) ?? []).length, 1);
});

test('renderer uses kind-specific labels and actions', () => {
  const html = renderPublicationCatalogue([
    publication({id: 'science', kind: 'scientific-publication', role: 'co-author', platform: 'Журнал', canonicalUrl: 'https://example.test/science', featured: false, featuredOrder: undefined}),
    publication({id: 'talk', kind: 'talk', role: 'speaker', platform: 'Конференция', canonicalUrl: 'https://example.test/talk', featured: false, featuredOrder: undefined}),
    publication({id: 'interview', kind: 'interview', role: 'interview-subject', platform: 'Подкаст', canonicalUrl: 'https://example.test/interview', featured: false, featuredOrder: undefined}),
    publication({id: 'proceedings', kind: 'proceedings-publication', role: 'author', platform: 'Сборник', canonicalUrl: 'https://example.test/proceedings', featured: false, featuredOrder: undefined}),
  ]);

  assert.match(html, /Журнал · Научная публикация/);
  assert.match(html, /Соавтор/);
  assert.match(html, /Конференция · Доклад/);
  assert.match(html, /Докладчик/);
  assert.match(html, /Открыть выступление ↗/);
  assert.match(html, /Подкаст · Интервью/);
  assert.match(html, /Участник интервью/);
  assert.match(html, /Открыть интервью ↗/);
  assert.match(html, /Сборник · Публикация в сборнике/);
});
