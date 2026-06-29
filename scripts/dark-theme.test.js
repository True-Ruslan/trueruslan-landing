import test from 'node:test';
import assert from 'node:assert/strict';

import {injectDarkThemeIntoHtml, DARK_THEME_MARKER} from './dark-theme.js';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="ru">
  <head><title>Test</title></head>
  <body class="g-root g-root_theme_light">
    <div id="root"></div>
  </body>
</html>`;

test('injectDarkThemeIntoHtml switches SSR body class and injects script', () => {
  const result = injectDarkThemeIntoHtml(SAMPLE_HTML);

  assert.match(result, /<body class="g-root g-root_theme_dark">/);
  assert.match(result, new RegExp(DARK_THEME_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(result, /name="color-scheme" content="dark"/);
});

test('injectDarkThemeIntoHtml is idempotent', () => {
  const once = injectDarkThemeIntoHtml(SAMPLE_HTML);
  const twice = injectDarkThemeIntoHtml(once);

  assert.equal(once, twice);
});
