import crypto from 'node:crypto';
import fs from 'node:fs';

const LATIN_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/onest:vf@5.3.0/latin-wght-normal.woff2';
const LATIN_PATH = 'docs/assets/fonts/Onest-latin-wght-normal.woff2';
const LATIN_SHA256 = '67849bcc11e02177442da14ad954bfe1cc709553dad137b5003449b303e83fc3';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function replaceOnce(path, source, before, after) {
  const first = source.indexOf(before);
  if (first === -1) throw new Error(`${path}: expected migration anchor missing`);
  if (source.indexOf(before, first + before.length) !== -1) throw new Error(`${path}: migration anchor ambiguous`);
  return source.replace(before, after);
}

async function repairLatinFont() {
  const response = await fetch(LATIN_URL, {signal: AbortSignal.timeout(15_000)});
  if (response.status !== 200) throw new Error(`font fetch failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 4).toString('ascii') !== 'wOF2') throw new Error('upstream Latin asset is not WOFF2');
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== LATIN_SHA256) throw new Error(`upstream Latin asset digest drift: ${digest}`);
  fs.writeFileSync(LATIN_PATH, bytes);
}

await repairLatinFont();

{
  const path = 'scripts/portfolio-p3-5c-english-publications.test.js';
  let source = read(path);
  source = replaceOnce(
    path,
    source,
    `  assert.match(home, /href="en\\/now\\.html">Now<\\/a>/);\n  assert.match(home, /href="en\\/publications\\.html">Publications<\\/a>/);`,
    `  assert.match(home, /href="en\\/now\\.html"/);\n  assert.match(home, /href="en\\/publications\\.html">Writing<\\/a>/);\n  assert.match(home, /<h3>Publications<\\/h3>/);`,
  );
  write(path, source);
}

{
  const path = 'scripts/publications-showcase.test.js';
  let source = read(path);
  source = replaceOnce(
    path,
    source,
    `const HOME_TEMPLATE_PATH = path.join(ROOT, 'templates', 'index.html');\nconst TOC_PATH`,
    `const HOME_TEMPLATE_PATH = path.join(ROOT, 'templates', 'index.html');\nconst STANDALONE_HOME_PATH = path.join(ROOT, 'scripts', 'standalone-home.js');\nconst TOC_PATH`,
  );
  source = replaceOnce(
    path,
    source,
    `  assert.ok(publicationsIndex < remainingPlatformIndex, 'featured publications must precede secondary platform links');\n  assert.match(home, /landing\\/publications\\.html/);`,
    `  assert.ok(publicationsIndex < remainingPlatformIndex, 'featured publications must precede secondary platform links');\n\n  const renderer = read(STANDALONE_HOME_PATH);\n  assert.match(renderer, /catalogueHref: 'landing\\/publications\\.html'/);`,
  );
  source = replaceOnce(
    path,
    source,
    `  assert.doesNotMatch(home, /<nav[^>]*tr-site-nav[\\s\\S]*?>[\\s\\S]*?<a[^>]+>Публикации<\\/a>[\\s\\S]*?<\\/nav>/);\n  assert.match(home, /landing\\/publications\\.html/);`,
    `  assert.doesNotMatch(home, /<nav[^>]*tr-site-nav[\\s\\S]*?>[\\s\\S]*?<a[^>]+>Публикации<\\/a>[\\s\\S]*?<\\/nav>/);\n\n  const renderer = read(STANDALONE_HOME_PATH);\n  assert.match(renderer, /catalogueHref: 'landing\\/publications\\.html'/);`,
  );
  write(path, source);
}

console.log('C1 unit fixes applied');
