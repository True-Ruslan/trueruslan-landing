import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const SOURCE_PATH = 'scripts/production-work-with-me-smoke.cjs';

test('production Work with me no-JS smoke uses locale-specific copy contracts', async () => {
  const source = await readFile(SOURCE_PATH, 'utf8');

  assert.match(source, /const NO_JS_REQUIRED_TOKENS = Object\.freeze\(\{/);
  assert.match(source, /ru:\s*Object\.freeze\(\[\s*'Backend и интеграции'[\s\S]*?'Обучение и наставничество'[\s\S]*?'Задача и рамки'[\s\S]*?'Оценка и работа'[\s\S]*?'Передача результата'[\s\S]*?\]\)/);
  assert.match(source, /en:\s*Object\.freeze\(\[\s*'Engineering'[\s\S]*?'Teaching & Mentoring'[\s\S]*?'Context'[\s\S]*?'Scope'[\s\S]*?'Estimate'[\s\S]*?'Implementation'[\s\S]*?'Handover'[\s\S]*?\]\)/);
  assert.match(source, /for \(const token of \[\.\.\.NO_JS_REQUIRED_TOKENS\[locale\], '2026-08-08'\]\)/);
  assert.doesNotMatch(source, /for \(const token of \['Engineering', 'Teaching & Mentoring', 'Context', 'Scope', 'Estimate', 'Implementation', 'Handover'/);
});

test('production Work with me smoke uses bounded transient retry without weakening fail-closed response assertions', async () => {
  const source = await readFile(SOURCE_PATH, 'utf8');

  assert.match(source, /require\('\.\/production-navigation-retry\.cjs'\)/);
  assert.match(source, /gotoWithTransientHttpRetry/);
  assert.doesNotMatch(source, /const response = await page\.goto\(/);
  assert.match(source, /assert\(response\?\.ok\(\), `\$\{locale\} Work with me HTTP/);
  assert.match(source, /assert\(response\?\.ok\(\), `\$\{locale\} Work with me no-JS HTTP/);
  assert.match(source, /assert\(response\?\.ok\(\), `Contacts HTTP/);
  assert.match(source, /assert\(response\?\.ok\(\), `search HTTP/);
});
