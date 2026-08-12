import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const EXPECTED_ROOTS = ['Проекты', 'Опыт', 'Материалы', 'Работа со мной', 'Обо мне'];
const EXPECTED_MATERIALS = ['Публикации', 'Engineering Map', 'Engineering Notes', 'Источники'];
const EXPECTED_ABOUT = ['Сейчас', 'Фото', 'Контакты'];
const EXPECTED_NOTES = [
  './landing/notes/portfolio-runtime-boundary.md',
  './landing/notes/static-site-quality-gates.md',
  './landing/notes/server-authoritative-ai-npcs.md',
  './landing/notes/llm-output-is-a-protocol-boundary.md',
  './landing/notes/intersection-observer-giant-table.md',
  './landing/notes/static-first-sources-no-js.md',
  './landing/notes/green-ci-is-not-product-verification.md',
  './landing/notes/deployment-success-is-not-production-verification.md',
  './landing/notes/evidence-driven-project-state.md',
  './landing/notes/clean-urls-without-cloudflare-routing.md',
  './landing/notes/source-tests-to-installed-acceptance.md',
  './landing/notes/gametests-vs-installed-gameplay-acceptance.md',
  './landing/notes/passive-pdf-validation-vs-semantic-completeness.md',
  './landing/notes/probabilistic-proposals-deterministic-authority.md',
  './landing/notes/hybrid-cv-ai-recognition-boundaries.md',
  './landing/notes/restart-persistence-is-a-product-contract.md',
];

function parseNamedTocItems(source) {
  const lines = source.split(/\r?\n/);
  const rootItemsLine = lines.findIndex((line) => line === 'items:');
  assert.notEqual(rootItemsLine, -1, 'docs/toc.yaml must contain root items');

  const roots = [];
  const stack = [];
  let current = null;

  for (const line of lines.slice(rootItemsLine + 1)) {
    const itemMatch = line.match(/^(\s*)- name:\s*(.+)$/);
    if (itemMatch) {
      const indent = itemMatch[1].length;
      const node = {name: itemMatch[2].trim(), href: null, hidden: false, items: [], indent};
      while (stack.length && stack.at(-1).indent >= indent) stack.pop();
      if (stack.length) stack.at(-1).items.push(node);
      else roots.push(node);
      stack.push(node);
      current = node;
      continue;
    }

    const propertyMatch = line.match(/^(\s+)(href|hidden):\s*(.+)$/);
    if (!propertyMatch || !current) continue;
    if (propertyMatch[1].length <= current.indent) continue;
    if (propertyMatch[2] === 'href') current.href = propertyMatch[3].trim();
    if (propertyMatch[2] === 'hidden') current.hidden = propertyMatch[3].trim() === 'true';
  }

  return roots;
}

function findByName(items, name) {
  return items.find((item) => item.name === name);
}

function flatten(items) {
  return items.flatMap((item) => [item, ...flatten(item.items)]);
}

function sourcePathForGeneratedPath(generatedPath) {
  if (generatedPath === 'index.html') return 'templates/index.html';
  if (generatedPath === 'en/index.html') return 'templates/index.en.html';
  return `docs/${generatedPath.replace(/\.html$/, '.md')}`;
}

test('visible sidebar follows the approved five-root information architecture', () => {
  const roots = parseNamedTocItems(read('docs/toc.yaml'));
  const visibleRoots = roots.filter((item) => !item.hidden);
  assert.deepEqual(visibleRoots.map((item) => item.name), EXPECTED_ROOTS);

  const materials = findByName(visibleRoots, 'Материалы');
  assert.ok(materials, 'Материалы must be a visible root item');
  assert.equal(materials.href, './landing/materials.md');
  assert.deepEqual(materials.items.map((item) => item.name), EXPECTED_MATERIALS);

  const notes = findByName(materials.items, 'Engineering Notes');
  assert.ok(notes, 'Engineering Notes must remain inside Материалы');
  assert.deepEqual(notes.items.map((item) => item.href), ['./landing/notes.md', ...EXPECTED_NOTES]);
  assert.equal(notes.items[0].name, 'Все заметки');

  const about = findByName(visibleRoots, 'Обо мне');
  assert.ok(about, 'Обо мне must be a visible root item');
  assert.deepEqual(about.items.map((item) => item.name), EXPECTED_ABOUT);
});

test('English remains a hidden build-only TOC branch', () => {
  const roots = parseNamedTocItems(read('docs/toc.yaml'));
  const english = findByName(roots, 'English');
  assert.ok(english, 'English build branch must not be deleted');
  assert.equal(english.hidden, true);
  assert.equal(roots.filter((item) => !item.hidden).some((item) => item.name === 'English'), false);
});

test('RU standalone header keeps canonical root order and points Materials to the hub', () => {
  const html = read('templates/index.html');
  const navStart = html.indexOf('<nav class="tr-site-nav"');
  const navEnd = html.indexOf('</nav>', navStart);
  assert.notEqual(navStart, -1);
  assert.notEqual(navEnd, -1);
  const nav = html.slice(navStart, navEnd);

  let previous = -1;
  for (const label of EXPECTED_ROOTS) {
    const index = nav.indexOf(`>${label}</a>`);
    assert.ok(index > previous, `expected ${label} after previous root item`);
    previous = index;
  }
  assert.match(nav, /href="landing\/materials\.html">Материалы<\/a>/);
});

test('all current canonical RU/EN pairs retain source ownership and TOC build ownership', () => {
  const manifest = JSON.parse(read('data/i18n.json'));
  const tocItems = flatten(parseNamedTocItems(read('docs/toc.yaml')));
  const tocHrefs = new Set(tocItems.map((item) => item.href).filter(Boolean));

  for (const pair of manifest) {
    for (const generatedPath of [pair.ru, pair.en]) {
      const sourcePath = sourcePathForGeneratedPath(generatedPath);
      assert.equal(fs.existsSync(path.join(ROOT, sourcePath)), true, `${sourcePath} must remain present`);
      if (!generatedPath.endsWith('index.html')) {
        const tocHref = `./${generatedPath.replace(/\.html$/, '.md')}`;
        assert.equal(tocHrefs.has(tocHref), true, `${tocHref} must remain owned by docs/toc.yaml`);
      }
    }
  }
});
