import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = fs.readFileSync(path.join(ROOT, 'docs/_assets/script/ai-search.js'), 'utf8');

test('enabled AI SEARCH intercepts the live search button even when a form exists', () => {
  assert.match(
    SOURCE,
    /if \(form\?\.addEventListener\) form\.addEventListener\('submit', submitAi\);/,
    'native form submit must remain bound for Enter and ordinary submit semantics',
  );
  assert.match(
    SOURCE,
    /if \(searchButton\?\.addEventListener\) searchButton\.addEventListener\('click', onSearchButtonClick, true\);/,
    'the live Diplodoc search button must always have a capture-phase AI interceptor',
  );
  assert.doesNotMatch(
    SOURCE,
    /else if \(searchButton\?\.addEventListener\)/,
    'button interception must not be mutually exclusive with form submit binding',
  );
});

test('button interceptor is transparent while AI is OFF and blocks ordinary click handling only when AI is ON', () => {
  assert.match(
    SOURCE,
    /function onSearchButtonClick\(event\) \{\s*if \(!enabled\) return;\s*event\?\.preventDefault\?\.\(\);\s*event\?\.stopImmediatePropagation\?\.\(\);\s*void submitAi\(event\);\s*\}/s,
    'OFF must pass through untouched; ON must stop the same-button Diplodoc handler before semantic submit',
  );
});
