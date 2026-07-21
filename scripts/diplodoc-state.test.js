import test from 'node:test';
import assert from 'node:assert/strict';

import {transformGeneratedContent} from './diplodoc-state.js';

function encodedStateHtml(content) {
  const state = JSON.stringify({data: {html: content}})
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<!doctype html><html><head></head><body><script type="application/json" id="diplodoc-state">${state}</script></body></html>`;
}

test('transformGeneratedContent prefers a direct document match', () => {
  const input = '<!doctype html><html><body><div data-slot></div></body></html>';
  const result = transformGeneratedContent(
    input,
    (html) => html.replace('<div data-slot></div>', '<section>Ready</section>'),
    'direct slot',
  );

  assert.equal(result.source, 'document');
  assert.match(result.html, /<section>Ready<\/section>/);
});

test('transformGeneratedContent mutates escaped Diplodoc state html when content is not in rendered DOM', () => {
  const input = encodedStateHtml('<h1>Now</h1><div data-slot></div>');
  const result = transformGeneratedContent(
    input,
    (html) => html.replace('<div data-slot></div>', '<section data-ready>Ready & safe</section>'),
    'state slot',
  );

  assert.equal(result.source, 'diplodoc-state');
  assert.match(result.html, /id="diplodoc-state"/);
  assert.match(result.html, /data-ready/);
  assert.match(result.html, /Ready &amp;amp; safe/);
});

test('transformGeneratedContent reports no source when neither document nor state changes', () => {
  const input = encodedStateHtml('<p>No slot</p>');
  const result = transformGeneratedContent(input, (html) => html, 'missing slot');
  assert.equal(result.source, null);
  assert.equal(result.html, input);
});
