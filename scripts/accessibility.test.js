import test from 'node:test';
import assert from 'node:assert/strict';

import {fixGeneratedAccessibilityHtml} from './accessibility.js';

test('fixGeneratedAccessibilityHtml removes aria-hidden heading anchors from keyboard tab order', () => {
  const html = `<!doctype html><html><body>
    <h2 id="section">
      <a href="#section" class="yfm-anchor yfm-clipboard-anchor" aria-hidden="true">anchor</a>
      Section
    </h2>
    <a href="/real-link">Real link</a>
  </body></html>`;

  const fixed = fixGeneratedAccessibilityHtml(html);

  assert.match(fixed, /class="yfm-anchor yfm-clipboard-anchor" aria-hidden="true" tabindex="-1"/);
  assert.match(fixed, /<a href="\/real-link">Real link<\/a>/);
});

test('fixGeneratedAccessibilityHtml is idempotent', () => {
  const html = '<!doctype html><html><body><a class="yfm-anchor" aria-hidden="true" href="#x">x</a></body></html>';
  const once = fixGeneratedAccessibilityHtml(html);
  const twice = fixGeneratedAccessibilityHtml(once);

  assert.equal(once, twice);
  assert.equal((once.match(/tabindex="-1"/g) || []).length, 1);
});
