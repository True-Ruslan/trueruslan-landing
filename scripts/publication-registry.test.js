import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  PUBLICATION_GROUPS,
  PUBLICATION_KINDS,
  PUBLICATION_LINK_TYPES,
  PUBLICATION_ROLES,
  getFeaturedPublications,
  groupPublications,
  loadPublicationRegistry,
  validatePublicationRegistry,
} from './publication-registry.js';

const AS_OF = '2026-08-02';
const PROJECT_SLUGS = new Set(['trueruslan-landing', 'livingworld']);
const NOTE_SLUGS = new Set(['portfolio-runtime-boundary', 'static-site-quality-gates']);

function publication(overrides = {}) {
  return {
    id: 'diplodoc-github-pages',
    title: "Простенький лендинг/wiki для вас и вашего проекта или как покорить Diplodoc'а и опубликовать на GitHub Pages",
    kind: 'technical-article',
    platform: 'Habr',
    date: '2025-08-23',
    role: 'author',
    language: 'ru',
    summary: 'Практический разбор сборки многостраничного сайта на Diplodoc и публикации через GitHub Pages.',
    topics: ['Diplodoc', 'GitHub Pages', 'Documentation'],
    canonicalUrl: 'https://habr.com/ru/articles/936508/',
    links: [],
    featured: true,
    featuredOrder: 1,
    relatedProjects: [],
    relatedNotes: ['portfolio-runtime-boundary'],
    verifiedAt: AS_OF,
    ...overrides,
  };
}

function validate(raw, overrides = {}) {
  return validatePublicationRegistry(raw, {
    asOf: AS_OF,
    projectSlugs: PROJECT_SLUGS,
    noteSlugs: NOTE_SLUGS,
    ...overrides,
  });
}

test('publication registry exposes the approved controlled vocabulary', () => {
  assert.deepEqual(PUBLICATION_KINDS, [
    'technical-article',
    'scientific-publication',
    'talk',
    'interview',
    'proceedings-publication',
  ]);
  assert.deepEqual(PUBLICATION_ROLES, [
    'author',
    'co-author',
    'speaker',
    'panellist',
    'interview-subject',
  ]);
  assert.deepEqual(PUBLICATION_LINK_TYPES, ['video', 'slides', 'doi', 'pdf', 'event', 'source']);
  assert.deepEqual(PUBLICATION_GROUPS.map(({kind, title}) => [kind, title]), [
    ['technical-article', 'Технические статьи'],
    ['scientific-publication', 'Научные публикации'],
    ['talk', 'Доклады и конференции'],
    ['interview', 'Интервью и приглашённые материалы'],
    ['proceedings-publication', 'Публикации в сборниках'],
  ]);
  assert.equal(Object.isFrozen(PUBLICATION_KINDS), true);
  assert.equal(Object.isFrozen(PUBLICATION_GROUPS), true);
});

test('validatePublicationRegistry normalizes a valid externally verified record', () => {
  const [entry] = validate([publication({links: undefined, relatedProjects: undefined})]);

  assert.equal(entry.id, 'diplodoc-github-pages');
  assert.deepEqual(entry.links, []);
  assert.deepEqual(entry.relatedProjects, []);
  assert.equal(Object.isFrozen(entry), true);
  assert.equal(Object.isFrozen(entry.topics), true);
});

test('validatePublicationRegistry rejects an empty registry', () => {
  assert.throws(() => validate([]), /non-empty array/i);
});

test('validatePublicationRegistry rejects duplicate IDs', () => {
  assert.throws(
    () => validate([publication(), publication({canonicalUrl: 'https://habr.com/ru/articles/932998/'})]),
    /duplicate publication id: diplodoc-github-pages/i,
  );
});

test('validatePublicationRegistry rejects duplicate canonical URLs', () => {
  assert.throws(
    () => validate([publication(), publication({id: 'other'})]),
    /duplicate publication canonical url/i,
  );
});

test('validatePublicationRegistry rejects missing required fields', () => {
  for (const field of ['id', 'title', 'kind', 'platform', 'date', 'role', 'language', 'summary', 'canonicalUrl', 'verifiedAt']) {
    assert.throws(
      () => validate([publication({[field]: ''})]),
      new RegExp(`missing required field: ${field}`, 'i'),
      field,
    );
  }
});

test('validatePublicationRegistry rejects unsupported kinds and roles', () => {
  assert.throws(() => validate([publication({kind: 'blog-post'})]), /unsupported publication kind/i);
  assert.throws(() => validate([publication({role: 'attendee'})]), /unsupported publication role/i);
});

test('validatePublicationRegistry rejects unsafe or non-HTTPS URLs', () => {
  assert.throws(() => validate([publication({canonicalUrl: 'http://habr.com/ru/articles/936508/'})]), /https/i);
  assert.throws(() => validate([publication({canonicalUrl: 'javascript:alert(1)'})]), /https/i);
  assert.throws(() => validate([publication({links: [{type: 'video', label: 'Видео', url: 'http://example.test/video'}]})]), /https/i);
});

test('validatePublicationRegistry rejects malformed and future dates', () => {
  assert.throws(() => validate([publication({date: '23-08-2025'})]), /date.*YYYY-MM-DD/i);
  assert.throws(() => validate([publication({date: '2026-08-03'})]), /future publication date/i);
  assert.throws(() => validate([publication({verifiedAt: '2026-08-03'})]), /future verification date/i);
});

test('validatePublicationRegistry rejects invalid featured ordering', () => {
  assert.throws(() => validate([publication({featuredOrder: undefined})]), /featuredOrder/i);
  assert.throws(() => validate([publication({featuredOrder: 0})]), /featuredOrder/i);
  assert.throws(() => validate([publication({featured: false})]), /featuredOrder.*non-featured/i);
  assert.throws(
    () => validate([
      publication(),
      publication({id: 'algorithms', canonicalUrl: 'https://habr.com/ru/articles/932998/', featuredOrder: 1}),
    ]),
    /duplicate featured order/i,
  );
});

test('validatePublicationRegistry rejects invalid topics, links and relationships', () => {
  assert.throws(() => validate([publication({topics: []})]), /topics/i);
  assert.throws(() => validate([publication({links: [{type: 'repository', label: 'Код', url: 'https://github.com/example/repo'}]})]), /unsupported publication link type/i);
  assert.throws(() => validate([publication({links: [{type: 'video', label: '', url: 'https://example.test/video'}]})]), /link label/i);
  assert.throws(() => validate([publication({relatedProjects: ['missing-project']})]), /unknown related project/i);
  assert.throws(() => validate([publication({relatedNotes: ['missing-note']})]), /unknown related note/i);
});

test('validatePublicationRegistry rejects duplicate secondary and canonical URLs', () => {
  assert.throws(
    () => validate([publication({links: [
      {type: 'source', label: 'Источник 1', url: 'https://example.test/source'},
      {type: 'pdf', label: 'Источник 2', url: 'https://example.test/source'},
    ]})]),
    /duplicate publication link url/i,
  );
  assert.throws(
    () => validate([publication({links: [
      {type: 'source', label: 'Каноническая страница', url: 'https://habr.com/ru/articles/936508/'},
    ]})]),
    /duplicates canonical url/i,
  );
});

test('featured and grouped projections are deterministic without mutating input', () => {
  const source = validate([
    publication({id: 'older', date: '2025-03-04', canonicalUrl: 'https://habr.com/ru/articles/887770/', featuredOrder: 3, title: 'Конвейер'}),
    publication({id: 'newer-b', date: '2025-08-23', canonicalUrl: 'https://habr.com/ru/articles/936509/', featuredOrder: 2, title: 'Яблоко'}),
    publication({id: 'newer-a', date: '2025-08-23', canonicalUrl: 'https://habr.com/ru/articles/936510/', featuredOrder: 1, title: 'Алгоритмы'}),
  ]);

  assert.deepEqual(getFeaturedPublications(source, 2).map(({id}) => id), ['newer-a', 'newer-b']);
  const groups = groupPublications(source);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].title, 'Технические статьи');
  assert.deepEqual(groups[0].publications.map(({id}) => id), ['newer-a', 'newer-b', 'older']);
  assert.deepEqual(source.map(({id}) => id), ['older', 'newer-b', 'newer-a']);
});

test('groupPublications omits empty groups and preserves the fixed public order', () => {
  const source = validate([
    publication({id: 'talk', kind: 'talk', role: 'speaker', canonicalUrl: 'https://example.test/talk', featured: false, featuredOrder: undefined}),
    publication({id: 'science', kind: 'scientific-publication', role: 'co-author', canonicalUrl: 'https://example.test/paper', featured: false, featuredOrder: undefined}),
  ]);

  assert.deepEqual(groupPublications(source).map(({kind}) => kind), ['scientific-publication', 'talk']);
});

test('loadPublicationRegistry reads JSON and applies cross-reference validation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-registry-'));
  const filePath = path.join(dir, 'publications.json');
  fs.writeFileSync(filePath, JSON.stringify([publication()]), 'utf8');

  const entries = loadPublicationRegistry(filePath, {
    asOf: AS_OF,
    projectSlugs: PROJECT_SLUGS,
    noteSlugs: NOTE_SLUGS,
  });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].platform, 'Habr');
});
