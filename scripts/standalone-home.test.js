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
