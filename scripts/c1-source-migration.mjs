import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function replaceOnce(path, source, before, after) {
  if (!source.includes(before)) throw new Error(`${path}: expected migration anchor missing`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`${path}: migration anchor is ambiguous`);
  return source.replace(before, after);
}

function replacePattern(path, source, pattern, after) {
  const matches = source.match(pattern);
  if (!matches) throw new Error(`${path}: expected migration pattern missing`);
  return source.replace(pattern, after);
}

// Diplodoc: replace only the presentation header. The full content tree below remains untouched.
{
  const path = 'docs/toc.yaml';
  let source = read(path);
  for (const legacy of ['Notes', 'Публикации', 'Контакты']) {
    if (!source.match(new RegExp(`^      - text: ${legacy}$`, 'm'))) throw new Error(`${path}: expected legacy header item ${legacy} missing`);
  }
  source = replacePattern(path, source, /    leftItems:\n[\s\S]*?\n    rightItems:/, `    leftItems:
      - text: Проекты
        type: link
        url: landing/projects.html
        target: _self
      - text: Опыт
        type: link
        url: landing/resume.html
        target: _self
      - text: Материалы
        type: link
        url: landing/notes.html
        target: _self
      - text: Работа со мной
        type: link
        url: landing/work-with-me.html
        target: _self
      - text: Обо мне
        type: link
        url: landing/about.html
        target: _self
    rightItems:`);
  write(path, source);
}

const standalone = [
  {
    path: 'templates/index.html',
    nav: `      <nav class="tr-site-nav" aria-label="Основная навигация">
        <a href="landing/projects.html">Проекты</a>
        <a href="landing/resume.html">Опыт</a>
        <a href="landing/notes.html">Материалы</a>
        <a href="landing/work-with-me.html">Работа со мной</a>
        <a href="landing/about.html">Обо мне</a>
      </nav>`,
  },
  {
    path: 'templates/index.en.html',
    nav: `      <nav class="tr-site-nav" aria-label="Main navigation">
        <a href="en/projects.html">Projects</a>
        <a href="en/resume.html">Experience</a>
        <a href="en/publications.html">Writing</a>
        <a href="en/work-with-me.html">Work with me</a>
        <a href="en/about.html">About</a>
      </nav>`,
  },
];

for (const {path, nav} of standalone) {
  let source = read(path);
  if (source.includes('_assets/style/typography.css')) throw new Error(`${path}: typography stylesheet already linked`);
  source = replaceOnce(
    path,
    source,
    '  <link rel="stylesheet" href="_assets/style/custom.css">\n',
    '  <link rel="stylesheet" href="_assets/style/custom.css">\n  <link rel="stylesheet" href="_assets/style/typography.css">\n',
  );
  source = replacePattern(path, source, /      <nav class="tr-site-nav"[\s\S]*?      <\/nav>/, nav);
  write(path, source);
}

// Diplodoc resources load the same typography contract as standalone pages.
{
  const path = 'docs/.yfm';
  let source = read(path);
  if (source.includes('_assets/style/typography.css')) throw new Error(`${path}: typography stylesheet already registered`);
  source = replaceOnce(
    path,
    source,
    '    - _assets/style/custom.css\n',
    '    - _assets/style/custom.css\n    - _assets/style/typography.css\n',
  );
  write(path, source);
}

// Production artifact must carry WOFF2 bytes and the OFL text alongside existing media assets.
{
  const path = 'scripts/copy-assets.js';
  let source = read(path);
  source = replaceOnce(
    path,
    source,
    "const ASSET_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);",
    "const ASSET_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff2', '.txt']);",
  );
  write(path, source);
}

// Keep existing acceptance intent, but align old presentation assertions with the accepted C1 IA.
{
  const path = 'scripts/work-with-me.test.js';
  let source = read(path);
  source = replacePattern(
    path,
    source,
    /test\('primary navigation gives collaboration a normal bounded position without removing secondary content',[\s\S]*?\n\}\);\n\ntest\('homepage collaboration bridge/,
    `test('primary navigation keeps collaboration visible while secondary content moves out of the header', () => {
  const ruExpected = ['Проекты', 'Опыт', 'Материалы', 'Работа со мной', 'Обо мне'];
  const enExpected = ['Projects', 'Experience', 'Writing', 'Work with me', 'About'];
  assert.deepEqual(navigationTexts('templates/index.html'), ruExpected);
  assert.deepEqual(tocHeaderTexts(), ruExpected);
  assert.deepEqual(navigationTexts('templates/index.en.html'), enExpected);

  const toc = read('docs/toc.yaml');
  for (const secondary of ['Сейчас', 'Engineering Map', 'Engineering Notes', 'Публикации', 'Источники', 'Фото', 'Контакты']) {
    assert.match(toc, new RegExp(\`name: \${secondary}\`));
  }
});

test('homepage collaboration bridge`,
  );
  write(path, source);
}

{
  const path = 'scripts/publications-showcase.test.js';
  let source = read(path);
  source = replacePattern(
    path,
    source,
    /test\('primary and side navigation expose Publications after Notes',[\s\S]*?\n\}\);\n\ntest\('publications page has canonical metadata/,
    `test('Publications stays first-class in the content tree while primary navigation uses one Materials entry', () => {
  const toc = read(TOC_PATH);
  assert.match(toc, /- text: Материалы[\\s\\S]{0,160}url: landing\\/notes\\.html/);

  const notesIndex = toc.indexOf('  - name: Engineering Notes');
  const publicationsIndex = toc.indexOf('  - name: Публикации');
  const aboutIndex = toc.indexOf('  - name: Обо мне');
  assert.notEqual(notesIndex, -1);
  assert.notEqual(publicationsIndex, -1);
  assert.ok(publicationsIndex > notesIndex, 'Publications must follow the complete Engineering Notes tree');
  assert.ok(publicationsIndex < aboutIndex, 'Publications must remain a first-class content surface before About');
  assert.match(toc, /href: \\.\\/landing\\/publications\\.md/);

  const home = read(HOME_TEMPLATE_PATH);
  assert.match(home, /landing\\/notes\\.html">Материалы<\\/a>/);
  assert.doesNotMatch(home, /<nav[^>]*tr-site-nav[\\s\\S]*?>[\\s\\S]*?<a[^>]+>Публикации<\\/a>[\\s\\S]*?<\\/nav>/);
  assert.match(home, /landing\\/publications\\.html/);
});

test('publications page has canonical metadata`,
  );
  write(path, source);
}

console.log('C1 source migration applied successfully');
