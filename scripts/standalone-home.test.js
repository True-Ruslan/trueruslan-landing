import test from 'node:test';
import assert from 'node:assert/strict';

import {renderStandaloneHome} from './standalone-home.js';

const validProjects = [
  {
    slug: 'livingworld',
    name: 'LivingWorld',
    status: 'release-candidate',
    statusLabel: 'RELEASE CANDIDATE',
    summary: 'Server-authoritative AI NPC conversations.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/livingworld.html',
    tags: ['Java 21', 'Fabric'],
  },
  {
    slug: 'old-project',
    name: 'Old project',
    status: 'maintained',
    statusLabel: 'MAINTAINED',
    summary: 'Not currently active.',
    featured: false,
    active: false,
    visibility: 'public',
    href: 'landing/projects/old-project.html',
    tags: ['Java', 'Testing'],
  },
];

const validPublications = [
  {
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
  },
];

test('renderStandaloneHome injects site URL, active projects and featured publications without Diplodoc runtime bundles', () => {
  const template = `<!doctype html><html><head>
    <link rel="canonical" href="{{SITE_URL}}/">
    <meta property="og:image" content="{{SITE_URL}}/assets/images/avatar.png">
    <link rel="stylesheet" href="_assets/style/home.css">
  </head><body><h1>Руслан Немыкин</h1><section>{{CURRENTLY_BUILDING}}</section>{{FEATURED_PUBLICATIONS}}</body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects, {
    publications: validPublications,
  });

  assert.match(html, /https:\/\/example\.test\//);
  assert.match(html, /https:\/\/example\.test\/assets\/images\/avatar\.png/);
  assert.match(html, /LivingWorld/);
  assert.match(html, /RELEASE CANDIDATE/);
  assert.doesNotMatch(html, /Old project/);
  assert.match(html, /landing\/projects\/livingworld\.html/);
  assert.match(html, /Избранные публикации/);
  assert.match(html, /Diplodoc и GitHub Pages/);
  assert.match(html, /data-tr-publication-id="diplodoc-github-pages"/);
  assert.match(html, /href="landing\/publications\.html"/);
  assert.doesNotMatch(html, /\{\{SITE_URL\}\}|\{\{CURRENTLY_BUILDING\}\}|\{\{FEATURED_PUBLICATIONS\}\}/);
  assert.doesNotMatch(html, /_bundle\//);
});

test('renderStandaloneHome supports English UI copy and removes the untranslated publication placeholder', () => {
  const template = `<!doctype html><html lang="en"><head>
    <link rel="canonical" href="{{SITE_URL}}/en/">
  </head><body><h1>Ruslan Nemykin</h1><section>{{CURRENTLY_BUILDING}}</section>{{FEATURED_PUBLICATIONS}}</body></html>`;

  const projects = [
    validProjects[0],
    {...validProjects[1], active: true, slug: 'node-zero', name: 'NODE ZERO', href: 'landing/projects/node-zero.html'},
  ];
  const html = renderStandaloneHome(template, 'https://example.test/', projects, {
    locale: 'en',
    publications: validPublications,
    hrefTransform: (href, project) => project.slug === 'livingworld' ? 'en/projects/livingworld.html' : href,
    ctaTransform: (project, defaultCta) => project.slug === 'livingworld' ? defaultCta : 'Open case study (RU) →',
  });

  assert.match(html, /LivingWorld/);
  assert.match(html, /Technologies and areas/);
  assert.match(html, /href="en\/projects\/livingworld\.html"/);
  assert.match(html, /Open case study →/);
  assert.match(html, /NODE ZERO/);
  assert.match(html, /href="landing\/projects\/node-zero\.html"/);
  assert.match(html, /Open case study \(RU\) →/);
  assert.doesNotMatch(html, /Открыть case study/);
  assert.doesNotMatch(html, /Избранные публикации|Diplodoc и GitHub Pages|\{\{FEATURED_PUBLICATIONS\}\}/);
});
