import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderHomepageEvidenceSignals,
  renderHomepagePrimaryPaths,
  renderStandaloneHome,
  selectHomepageFlagships,
} from './standalone-home.js';

const validProjects = [
  {
    slug: 'livingworld',
    name: 'VillAIgence',
    status: 'release-candidate',
    statusLabel: 'ACCEPTANCE IN PROGRESS',
    summary: 'Server-authoritative AI NPC conversations.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/livingworld.html',
    tags: ['Java 21', 'Fabric'],
  },
  {
    slug: 'vlezet',
    name: 'Vlezet',
    status: 'pre-production',
    statusLabel: 'ACTIVE DEVELOPMENT',
    summary: 'Local-first apartment planning.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/vlezet.html',
    tags: ['TypeScript', 'Geometry'],
  },
  {
    slug: 'portfolio-platform',
    name: 'Engineering Portfolio Platform',
    status: 'production',
    statusLabel: 'PRODUCTION',
    summary: 'Static-first engineering portfolio and knowledge platform.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects.html',
    tags: ['Diplodoc', 'Playwright'],
  },
  {
    slug: 'node-zero',
    name: 'NODE ZERO',
    status: 'pre-production',
    statusLabel: 'PRE-PRODUCTION',
    summary: 'Private game project.',
    featured: true,
    active: true,
    visibility: 'private',
    href: 'landing/projects/node-zero.html',
    tags: ['Unity', 'C#'],
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

const validEvidence = [
  {
    project: 'livingworld',
    status: 'verified',
    lastVerified: '2026-08-08',
    versions: [
      {label: 'Current official release', value: '0.2.0+1.21.1'},
      {label: 'Installed 0.2.0 result', value: '7 PASS / 0 FAIL'},
      {label: 'Deferred installed boundaries', value: 'VAI-M2-INST-005 NOT TESTED; VAI-CONCUR-004 NOT TESTED / DEFERRED'},
    ],
    signals: [],
  },
  {
    project: 'vlezet',
    status: 'verified',
    lastVerified: '2026-08-08',
    versions: [
      {label: 'Accepted recognition slice', value: 'M7.8B'},
      {label: 'Automatic M7.8C result', value: 'product-owner usefulness FAIL / closed unmerged'},
      {label: 'Next acceptance boundary', value: 'Assisted Tracing design gate and product-owner acceptance'},
    ],
    signals: [],
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

test('homepage primary paths expose experience, projects and engineering materials', () => {
  const ru = renderHomepagePrimaryPaths('ru');
  assert.match(ru, /data-home-path="resume"/);
  assert.match(ru, /href="landing\/resume\.html"/);
  assert.match(ru, /data-home-path="projects"/);
  assert.match(ru, /href="landing\/projects\.html"/);
  assert.match(ru, /data-home-path="materials"/);
  assert.match(ru, /href="landing\/notes\.html"/);
  assert.match(ru, /Публикации/);

  const en = renderHomepagePrimaryPaths('en');
  assert.match(en, /href="en\/resume\.html"/);
  assert.match(en, /href="en\/projects\.html"/);
  assert.match(en, /href="en\/notes\/server-authoritative-ai-npcs\.html"/);
});

test('homepage flagship selection is explicit, public and stable', () => {
  const flagships = selectHomepageFlagships(validProjects);
  assert.deepEqual(flagships.map(({slug}) => slug), [
    'livingworld',
    'vlezet',
    'portfolio-platform',
  ]);
  assert.ok(flagships.every(({visibility, active}) => visibility === 'public' && active));
  assert.ok(flagships.every(({slug}) => slug !== 'node-zero'));
});

test('homepage evidence signals stay bounded to canonical project and evidence state', () => {
  const html = renderHomepageEvidenceSignals(validProjects, validEvidence, {locale: 'ru'});

  assert.match(html, /data-home-evidence="livingworld"/);
  assert.match(html, /Принятый installed результат/);
  assert.match(html, /7 PASS \/ 0 FAIL/);
  assert.match(html, /ACCEPTANCE IN PROGRESS/);
  assert.match(html, /data-home-evidence="vlezet"/);
  assert.match(html, /M7\.8B/);
  assert.match(html, /ACTIVE DEVELOPMENT/);
  assert.match(html, /data-home-evidence="portfolio-platform"/);
  assert.match(html, /PRODUCTION/);
  assert.doesNotMatch(html, /NODE ZERO|M7\.8C accepted|full acceptance|VAI-M2-INST-005[^<]*PASS|VAI-CONCUR-004[^<]*PASS/i);
});

test('renderStandaloneHome injects evidence-first paths and public flagships without Diplodoc runtime bundles', () => {
  const template = `<!doctype html><html><head>
    <link rel="canonical" href="{{SITE_URL}}/">
    <meta property="og:image" content="{{SITE_URL}}/assets/images/avatar.png">
    <link rel="stylesheet" href="_assets/style/home.css">
  </head><body><h1>Руслан Немыкин</h1>{{HOME_PRIMARY_PATHS}}{{HOME_EVIDENCE_SIGNALS}}<section>{{HOME_FLAGSHIPS}}</section>{{FEATURED_PUBLICATIONS}}</body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects, {
    evidence: validEvidence,
    publications: validPublications,
  });

  assert.match(html, /https:\/\/example\.test\//);
  assert.match(html, /https:\/\/example\.test\/assets\/images\/avatar\.png/);
  assert.match(html, /data-home-path="resume"/);
  assert.match(html, /data-home-evidence="livingworld"/);
  assert.match(html, /7 PASS \/ 0 FAIL/);
  assert.match(html, /data-home-flagship="livingworld"/);
  assert.match(html, /data-home-flagship="vlezet"/);
  assert.match(html, /data-home-flagship="portfolio-platform"/);
  assert.doesNotMatch(html, /NODE ZERO|Old project/);
  assert.match(html, /Избранные публикации/);
  assert.match(html, /Diplodoc и GitHub Pages/);
  assert.match(html, /data-tr-publication-id="diplodoc-github-pages"/);
  assert.match(html, /href="landing\/publications\.html"/);
  assert.doesNotMatch(html, /\{\{SITE_URL\}\}|\{\{HOME_PRIMARY_PATHS\}\}|\{\{HOME_EVIDENCE_SIGNALS\}\}|\{\{HOME_FLAGSHIPS\}\}|\{\{FEATURED_PUBLICATIONS\}\}/);
  assert.doesNotMatch(html, /_bundle\//);
});

test('renderStandaloneHome supports English evidence paths and bounded Russian fallbacks', () => {
  const template = `<!doctype html><html lang="en"><head>
    <link rel="canonical" href="{{SITE_URL}}/en/">
  </head><body><h1>Ruslan Nemykin</h1>{{HOME_PRIMARY_PATHS}}{{HOME_EVIDENCE_SIGNALS}}<section>{{HOME_FLAGSHIPS}}</section>{{FEATURED_PUBLICATIONS}}</body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects, {
    locale: 'en',
    evidence: validEvidence,
    publications: validPublications,
    hrefTransform: (href, project) => project.slug === 'livingworld' ? 'en/projects/livingworld.html' : href,
    ctaTransform: (project, defaultCta) => project.slug === 'livingworld' ? defaultCta : 'Open case study (RU) →',
  });

  assert.match(html, /data-home-path="resume"/);
  assert.match(html, /href="en\/resume\.html"/);
  assert.match(html, /data-home-evidence="livingworld"/);
  assert.match(html, /Accepted installed result/);
  assert.match(html, /7 PASS \/ 0 FAIL/);
  assert.match(html, /data-home-flagship="livingworld"/);
  assert.match(html, /href="en\/projects\/livingworld\.html"/);
  assert.match(html, /data-home-flagship="vlezet"/);
  assert.match(html, /Open case study \(RU\) →/);
  assert.doesNotMatch(html, /NODE ZERO/);
  assert.doesNotMatch(html, /Избранные публикации|Diplodoc и GitHub Pages|\{\{FEATURED_PUBLICATIONS\}\}/);
});
