import test from 'node:test';
import assert from 'node:assert/strict';

import {renderStandaloneHome} from './standalone-home.js';

test('renderStandaloneHome injects site URL without Diplodoc runtime bundles', () => {
  const template = `<!doctype html><html><head>
    <link rel="canonical" href="{{SITE_URL}}/">
    <meta property="og:image" content="{{SITE_URL}}/assets/images/avatar.png">
    <link rel="stylesheet" href="_assets/style/home.css">
  </head><body><h1>Руслан Немыкин</h1></body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/');

  assert.match(html, /https:\/\/example\.test\//);
  assert.match(html, /https:\/\/example\.test\/assets\/images\/avatar\.png/);
  assert.doesNotMatch(html, /\{\{SITE_URL\}\}/);
  assert.doesNotMatch(html, /_bundle\//);
});

test('renderStandaloneHome expands portfolio placeholders with semantic HTML', () => {
  const template = '<main>{{CURRENTLY_BUILDING}}{{ENGINEERING_GRAPH}}</main>';
  const portfolioData = {
    currentProjects: [{
      id: 'alpha',
      title: 'Alpha',
      status: 'ACTIVE',
      summary: 'Active project.',
      href: 'landing/projects/alpha.html',
      tags: ['Java'],
    }],
    graphTopics: [{
      id: 'backend',
      label: 'Backend',
      description: 'Backend systems.',
      links: [{label: 'Alpha', href: 'landing/projects/alpha.html'}],
    }],
  };

  const html = renderStandaloneHome(template, 'https://example.test/', portfolioData);

  assert.match(html, /Currently building/);
  assert.match(html, /Engineering Graph/);
  assert.match(html, /data-tr-engineering-graph/);
  assert.doesNotMatch(html, /\{\{CURRENTLY_BUILDING\}\}/);
  assert.doesNotMatch(html, /\{\{ENGINEERING_GRAPH\}\}/);
});
