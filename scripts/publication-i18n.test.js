import assert from 'node:assert/strict';
import test from 'node:test';

import {validatePublicationRegistry} from './publication-registry.js';
import {renderPublicationCatalogue, renderFeaturedPublications} from './publication-renderer.js';
import {renderPublicationCatalogueInclude} from './publication-content-generator.js';

const AS_OF = '2026-08-07';

function publication(overrides = {}) {
  return {
    id: 'diplodoc-github-pages',
    title: "Простенький лендинг/wiki для вас и вашего проекта или как покорить Diplodoc'а и опубликовать на GitHub Pages",
    kind: 'technical-article',
    platform: 'Habr',
    date: '2025-08-23',
    role: 'author',
    language: 'ru',
    summary: 'Русское описание публикации.',
    topics: ['Diplodoc', 'Документация'],
    en: {
      summary: 'English publication summary.',
      topics: ['Diplodoc', 'Documentation'],
    },
    canonicalUrl: 'https://habr.com/ru/articles/936508/',
    links: [],
    featured: true,
    featuredOrder: 1,
    relatedProjects: [],
    relatedNotes: [],
    verifiedAt: '2026-08-02',
    ...overrides,
  };
}

function validate(raw) {
  return validatePublicationRegistry(raw, {asOf: AS_OF});
}

test('localized publication presentation is bounded, normalized and frozen', () => {
  const [entry] = validate([publication()]);
  assert.deepEqual(entry.en, {
    summary: 'English publication summary.',
    topics: ['Diplodoc', 'Documentation'],
  });
  assert.equal(Object.isFrozen(entry.en), true);
  assert.equal(Object.isFrozen(entry.en.topics), true);

  assert.throws(() => validate([publication({en: {summary: '', topics: ['Docs']}})]), /English summary/i);
  assert.throws(() => validate([publication({en: {summary: 'English', topics: []}})]), /en\.topics/i);
  assert.throws(() => validate([publication({en: {summary: 'English', topics: ['Docs'], title: 'Translated identity'}})]), /unsupported publication English presentation field/i);
});

test('English renderer preserves canonical identity while localizing presentation', () => {
  const [entry] = validate([publication()]);
  const html = renderPublicationCatalogue([entry], {locale: 'en'});
  assert.match(html, /Technical articles/);
  assert.match(html, /Habr · Technical article/);
  assert.match(html, /August 23, 2025/);
  assert.match(html, /Author/);
  assert.match(html, /lang="ru"/);
  assert.match(html, /покорить Diplodoc/);
  assert.match(html, /English publication summary/);
  assert.match(html, /Documentation/);
  assert.match(html, /tr-publication-card__topics-label">Topics<\/span>/);
  assert.match(html, /<ul class="tr-publication-card__topics">/);
  assert.doesNotMatch(html, /tr-publication-card__topics" aria-label=/);
  assert.match(html, /Read on Habr ↗/);
  assert.doesNotMatch(html, /Технические статьи|Техническая статья|Автор|Темы|Читать на/);
});

test('English featured and prebuild catalogue are rendered from the same canonical records', () => {
  const [entry] = validate([publication()]);
  const featured = renderFeaturedPublications([entry], {surface: 'page', locale: 'en'});
  assert.match(featured, /Featured/);
  assert.match(featured, /English publication summary/);
  assert.match(featured, /tr-publication-card__topics-label">Topics<\/span>/);

  const include = renderPublicationCatalogueInclude([entry], {locale: 'en'});
  assert.match(include, /data-tr-publications-locale="en"/);
  assert.match(include, /Technical articles/);
  assert.match(include, /English publication summary/);
  assert.match(include, /tr-publication-card__topics-label">Topics<\/span>/);
  assert.match(include, /покорить Diplodoc/);
});
