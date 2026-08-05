import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const URLS = Object.freeze({
  github: 'https://github.com/True-Ruslan',
  habr: 'https://habr.com/ru/users/TrueRuslan/',
  telegram: 'https://t.me/TrueRuslan_Blog',
});

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

function assertOrdered(source, markers, label) {
  let previous = -1;
  for (const marker of markers) {
    const index = source.indexOf(marker);
    assert.ok(index > previous, `${label}: expected ${marker} after previous utility`);
    previous = index;
  }
}

function assertStandaloneTemplate(relativePath, {searchLabel, languageLabel}) {
  const html = read(relativePath);
  const header = sliceBetween(html, '<header class="tr-site-header">', '</header>');
  const hero = sliceBetween(html, '<section class="tr-home-hero">', '</section>');

  assert.match(header, /data-tr-header-utilities/);
  assertOrdered(header, [
    'data-tr-utility="github"',
    'data-tr-utility="habr"',
    'data-tr-utility="telegram"',
    'data-tr-utility="search"',
    'data-tr-language="true"',
  ], relativePath);

  assert.match(header, new RegExp(`aria-label="${searchLabel}"`));
  assert.match(header, new RegExp(`aria-label="${languageLabel}"`));
  assert.match(header, /data-tr-language-trigger/);
  assert.match(header, /data-tr-language-menu/);
  assert.match(header, /<svg[^>]*aria-hidden="true"/);
  assert.doesNotMatch(header, />Поиск<\/a>|>Search<\/a>/);

  for (const url of Object.values(URLS)) {
    assert.match(header, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(header, /target="_blank" rel="noopener noreferrer"/);

  assert.equal(hero.split('{{HOME_PRIMARY_PATHS}}').length - 1, 1);
  assert.equal(hero.split('{{HOME_EVIDENCE_SIGNALS}}').length - 1, 1);
  assert.doesNotMatch(hero, /tr-home-actions/);
  for (const url of Object.values(URLS)) {
    assert.doesNotMatch(hero, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
}

test('RU and EN standalone headers expose canonical icon utilities and evidence-first hero surfaces', () => {
  assertStandaloneTemplate('templates/index.html', {
    searchLabel: 'Поиск по сайту',
    languageLabel: 'Выбрать язык',
  });
  assertStandaloneTemplate('templates/index.en.html', {
    searchLabel: 'Search the site',
    languageLabel: 'Choose language',
  });
});

test('Diplodoc right-side navigation preserves the canonical utility order without the legacy controls item', () => {
  const toc = read('docs/toc.yaml');
  const rightItems = sliceBetween(toc, '    rightItems:', '\ntitle:');

  assertOrdered(rightItems, [
    'https://github.com/True-Ruslan',
    'https://habr.com/ru/users/TrueRuslan/',
    'https://t.me/TrueRuslan_Blog',
    '_search/ru/index.html',
  ], 'docs/toc.yaml rightItems');
  assert.doesNotMatch(rightItems, /type: controls/);
});

test('dedicated runtime and stylesheet own header utility enhancement and language menu behavior', () => {
  const script = read('docs/_assets/script/header-utilities.js');
  const css = read('docs/_assets/style/header-utilities.css');
  const config = read('docs/.yfm');

  assert.match(script, /function setupHeaderUtilities\(/);
  assert.match(script, /function setupLanguageMenu\(/);
  assert.match(script, /https:\/\/habr\.com\/ru\/users\/TrueRuslan\//);
  assert.match(script, /https:\/\/t\.me\/TrueRuslan_Blog/);
  assert.match(script, /data-tr-language-switcher/);
  assert.match(script, /tr-cta--external/);

  assert.match(css, /\.tr-header-utilities/);
  assert.match(css, /\.tr-header-utility/);
  assert.match(css, /\.tr-language-menu/);
  assert.match(css, /min-(?:width|inline-size):\s*40px/);
  assert.match(css, /min-height:\s*40px/);

  assert.match(config, /_assets\/style\/header-utilities\.css/);
  assert.match(config, /_assets\/script\/header-utilities\.js/);
});
