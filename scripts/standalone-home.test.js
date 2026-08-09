import test from 'node:test';
import assert from 'node:assert/strict';

import {loadCollaboration} from './collaboration.js';
import {
  renderHomepageBridge,
  renderHomepageProofStrip,
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
    tags: ['Java 21', 'Fabric', 'AI', 'Memory 2.0'],
  },
  {
    slug: 'vlezet',
    name: 'Vlezet',
    status: 'pre-production',
    statusLabel: 'ACTIVE DEVELOPMENT',
    summary: 'Local-first apartment planning.',
    featured: false,
    active: true,
    visibility: 'public',
    href: 'landing/projects/vlezet.html',
    tags: ['TypeScript', 'Geometry'],
  },
  {
    slug: 'notchhub',
    name: 'NotchHub',
    status: 'pre-production',
    statusLabel: 'M1 IN DEVELOPMENT',
    summary: 'Native local-first macOS productivity hub.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/notchhub.html',
    tags: ['Swift 6', 'AppKit', 'macOS', 'Performance'],
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
    href: 'landing/projects/portfolio-platform.html',
    tags: ['Diplodoc', 'Playwright', 'Lighthouse', 'CI'],
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
];

const collaboration = loadCollaboration();

function count(source, marker) {
  return source.split(marker).length - 1;
}

test('homepage proof strip presents four concise professional facts without acceptance language', () => {
  const ru = renderHomepageProofStrip('ru');
  assert.equal(count(ru, 'data-home-proof='), 4);
  assert.match(ru, /5\+ лет/);
  assert.match(ru, /Java 11–25/);
  assert.match(ru, /Spring Boot · Kafka/);
  assert.match(ru, /PostgreSQL · ClickHouse/);
  assert.doesNotMatch(ru, /accepted|принят|NOT TESTED|SHA|PR #/i);

  const en = renderHomepageProofStrip('en');
  assert.equal(count(en, 'data-home-proof='), 4);
  assert.match(en, /5\+ years/);
  assert.match(en, /data-intensive systems/);
});

test('homepage bridge renderer exposes concise experience, writing and personal routes', () => {
  const ruExperience = renderHomepageBridge('experience', 'ru');
  assert.match(ruExperience, /data-home-bridge="experience"/);
  assert.match(ruExperience, /Коммерческая разработка/);
  assert.match(ruExperience, /href="landing\/resume\.html"/);

  const ruWriting = renderHomepageBridge('writing', 'ru');
  assert.match(ruWriting, /data-home-bridge="writing"/);
  assert.match(ruWriting, /href="landing\/notes\.html"/);
  assert.match(ruWriting, /href="landing\/publications\.html"/);

  const enPersonal = renderHomepageBridge('personal', 'en');
  assert.match(enPersonal, /data-home-bridge="personal"/);
  assert.match(enPersonal, /href="en\/about\.html"/);
  assert.match(enPersonal, /href="en\/now\.html"/);

  assert.throws(() => renderHomepageBridge('unknown', 'ru'), /unsupported homepage bridge/);
});

test('homepage flagship selection is explicit, public and stable', () => {
  const flagships = selectHomepageFlagships(validProjects);
  assert.deepEqual(flagships.map(({slug}) => slug), [
    'livingworld',
    'notchhub',
    'portfolio-platform',
  ]);
  assert.ok(flagships.every(({visibility, active}) => visibility === 'public' && active));
  assert.ok(flagships.every(({slug}) => slug !== 'node-zero' && slug !== 'vlezet'));
});

test('renderStandaloneHome injects the C2 fast-scan structure without Diplodoc runtime bundles', () => {
  const template = `<!doctype html><html><head>
    <link rel="canonical" href="{{SITE_URL}}/">
    <meta property="og:image" content="{{SITE_URL}}/assets/images/avatar.png">
  </head><body><h1>Руслан Немыкин</h1>{{HOME_PROOF_STRIP}}<section>{{HOME_FLAGSHIPS}}</section>{{HOME_EXPERIENCE_BRIDGE}}{{HOME_WRITING_BRIDGE}}{{HOME_COLLABORATION_BRIDGE}}{{HOME_PERSONAL_BRIDGE}}</body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects, {collaboration});

  assert.match(html, /https:\/\/example\.test\//);
  assert.match(html, /https:\/\/example\.test\/assets\/images\/avatar\.png/);
  assert.equal(count(html, 'data-home-proof='), 4);
  assert.equal(count(html, 'data-home-flagship='), 3);
  assert.equal(count(html, 'data-home-bridge="experience"'), 1);
  assert.equal(count(html, 'data-home-bridge="writing"'), 1);
  assert.equal(count(html, 'data-home-collaboration='), 1);
  assert.equal(count(html, 'data-home-bridge="personal"'), 1);
  assert.doesNotMatch(html, /data-home-flagship="vlezet"|NODE ZERO/);
  assert.doesNotMatch(html, /Memory 2\.0|Performance|\{\{HOME_/);
  assert.doesNotMatch(html, /_bundle\//);
});

test('renderStandaloneHome supports the English C2 structure and localized flagship routes', () => {
  const template = `<!doctype html><html lang="en"><head>
    <link rel="canonical" href="{{SITE_URL}}/en/">
  </head><body><h1>Ruslan Nemykin</h1>{{HOME_PROOF_STRIP}}<section>{{HOME_FLAGSHIPS}}</section>{{HOME_EXPERIENCE_BRIDGE}}{{HOME_WRITING_BRIDGE}}{{HOME_COLLABORATION_BRIDGE}}{{HOME_PERSONAL_BRIDGE}}</body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validProjects, {
    locale: 'en',
    collaboration,
    hrefTransform: (href, project) => {
      if (project.slug === 'livingworld') return 'en/projects/livingworld.html';
      if (project.slug === 'notchhub') return 'en/projects/notchhub.html';
      if (project.slug === 'portfolio-platform') return 'en/projects/portfolio-platform.html';
      return href;
    },
  });

  assert.equal(count(html, 'data-home-proof='), 4);
  assert.match(html, /data-home-flagship="livingworld"/);
  assert.match(html, /href="en\/projects\/livingworld\.html"/);
  assert.match(html, /data-home-flagship="notchhub"/);
  assert.match(html, /href="en\/projects\/notchhub\.html"/);
  assert.match(html, /data-home-flagship="portfolio-platform"/);
  assert.match(html, /href="en\/projects\/portfolio-platform\.html"/);
  assert.match(html, /data-home-bridge="experience"/);
  assert.match(html, /data-home-bridge="writing"/);
  assert.match(html, /data-home-bridge="personal"/);
  assert.doesNotMatch(html, /data-home-flagship="vlezet"|NODE ZERO|\{\{HOME_/);
});
