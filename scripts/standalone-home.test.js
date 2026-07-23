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

test('renderStandaloneHome injects site URL and active project cards without Diplodoc runtime bundles', () => {
  const template = `<!doctype html><html><head>
    <link rel="canonical" href="{{SITE_URL}}/">
    <meta property="og:image" content="{{SITE_URL}}/assets/images/avatar.png">
    <link rel="stylesheet" href="_assets/style/home.css">
  </head><body><h1>Руслан Немыкин</h1><section>{{CURRENTLY_BUILDING}}</section></body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects);

  assert.match(html, /https:\/\/example\.test\//);
  assert.match(html, /https:\/\/example\.test\/assets\/images\/avatar\.png/);
  assert.match(html, /LivingWorld/);
  assert.match(html, /RELEASE CANDIDATE/);
  assert.doesNotMatch(html, /Old project/);
  assert.match(html, /landing\/projects\/livingworld\.html/);
  assert.doesNotMatch(html, /\{\{SITE_URL\}\}|\{\{CURRENTLY_BUILDING\}\}/);
  assert.doesNotMatch(html, /_bundle\//);
});

test('renderStandaloneHome supports English UI copy and transformed active-project links', () => {
  const template = `<!doctype html><html lang="en"><head>
    <link rel="canonical" href="{{SITE_URL}}/en/">
  </head><body><h1>Ruslan Nemykin</h1><section>{{CURRENTLY_BUILDING}}</section></body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects, {
    locale: 'en',
    hrefTransform: () => 'projects/livingworld.html',
  });

  assert.match(html, /LivingWorld/);
  assert.match(html, /Technologies and areas/);
  assert.match(html, /Open case study →/);
  assert.match(html, /href="projects\/livingworld\.html"/);
  assert.doesNotMatch(html, /Открыть case study/);
});
