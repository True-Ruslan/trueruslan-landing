import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function headerTextsFromTemplate(relativePath) {
  const html = read(relativePath);
  const start = html.indexOf('<nav class="tr-site-nav"');
  const end = html.indexOf('</nav>', start);
  assert.ok(start !== -1 && end > start);
  return [...html.slice(start, end).matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
}

function tocHeaderTexts() {
  const toc = read('docs/toc.yaml');
  const start = toc.indexOf('    leftItems:');
  const end = toc.indexOf('    rightItems:', start);
  assert.ok(start !== -1 && end > start);
  return [...toc.slice(start, end).matchAll(/- text: ([^\n]+)/g)].map((match) => match[1].trim());
}

test('RU standalone and Diplodoc headers expose the same visible primary navigation order', () => {
  assert.deepEqual(tocHeaderTexts(), headerTextsFromTemplate('templates/index.html'));
});

test('generated-page header chrome is normalized onto the standalone class contract after utilities', () => {
  const script = read('docs/_assets/script/header-chrome-unifier.js');
  const config = read('docs/.yfm');

  for (const marker of [
    "classList.add('tr-site-header')",
    "classList.add('tr-site-header__inner')",
    "classList.add('tr-site-brand')",
    "classList.add('tr-site-nav')",
    'MutationObserver',
    'observer.disconnect()',
  ]) assert.ok(script.includes(marker), `missing header unifier marker: ${marker}`);

  assert.doesNotMatch(script, /setInterval|setTimeout|innerHTML\s*=/);
  assert.ok(config.indexOf('_assets/script/header-chrome-unifier.js') > config.indexOf('_assets/script/header-utilities.js'));
});

test('standalone header remains canonical markup and does not load the generated-page normalizer', () => {
  for (const relativePath of ['templates/index.html', 'templates/index.en.html']) {
    const html = read(relativePath);
    assert.match(html, /<header class="tr-site-header">/);
    assert.match(html, /<div class="tr-site-header__inner">/);
    assert.match(html, /<nav class="tr-site-nav"/);
    assert.doesNotMatch(html, /header-chrome-unifier\.js/);
  }
});
