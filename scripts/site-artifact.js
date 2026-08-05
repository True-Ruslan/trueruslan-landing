import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REQUIRED_FILES = Object.freeze([
  'index.html',
  'en/index.html',
  'robots.txt',
  'sitemap.xml',
  'feed.xml',
]);

function normalizeOrigin(value, label) {
  const raw = String(value || '').trim();
  if (!raw || raw.endsWith('/')) throw new Error(`${label} must be a non-empty origin without trailing slash`);
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
  if (parsed.protocol !== 'https:' || parsed.search || parsed.hash) {
    throw new Error(`${label} must be a normalized HTTPS origin`);
  }
  if (parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname) !== raw) {
    throw new Error(`${label} must be a normalized HTTPS origin`);
  }
  return raw;
}

function htmlAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? null;
}

function canonicalFromHtml(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = htmlAttribute(tag, 'rel');
    if (!rel?.toLowerCase().split(/\s+/).includes('canonical')) continue;
    return htmlAttribute(tag, 'href');
  }
  return null;
}

function readRequiredFiles(outputDir, errors) {
  const contents = new Map();
  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(outputDir, ...relativePath.split('/'));
    if (!fs.existsSync(absolutePath)) {
      errors.push(`${relativePath} is missing.`);
      continue;
    }
    contents.set(relativePath, fs.readFileSync(absolutePath, 'utf8'));
  }
  return contents;
}

function containsPublicHtmlRoute(content) {
  return /https?:\/\/[^\s"'<>]+\.html(?:[?#\s"'<>]|$)/i.test(content);
}

export function verifySiteArtifact(outputDir, {
  expectedOrigin,
  forbiddenOrigin = '',
} = {}) {
  const expected = normalizeOrigin(expectedOrigin, 'expectedOrigin');
  const forbidden = forbiddenOrigin ? normalizeOrigin(forbiddenOrigin, 'forbiddenOrigin') : '';
  const errors = [];
  const contents = readRequiredFiles(outputDir, errors);

  const expectedCanonicals = new Map([
    ['index.html', `${expected}/`],
    ['en/index.html', `${expected}/en/`],
  ]);
  for (const [relativePath, expectedCanonical] of expectedCanonicals) {
    const html = contents.get(relativePath);
    if (!html) continue;
    const actualCanonical = canonicalFromHtml(html);
    if (actualCanonical !== expectedCanonical) {
      errors.push(
        `${relativePath} canonical must be ${expectedCanonical}, got ${actualCanonical || 'missing'}.`,
      );
    }
  }

  const expectedFragments = new Map([
    ['index.html', [`${expected}/`, `${expected}/en/`]],
    ['en/index.html', [`${expected}/`, `${expected}/en/`]],
    ['robots.txt', [`Sitemap: ${expected}/sitemap.xml`]],
    ['sitemap.xml', [`<loc>${expected}/</loc>`, `${expected}/en/`]],
    ['feed.xml', [`${expected}/feed.xml`, `${expected}/landing/notes/`]],
  ]);
  for (const [relativePath, fragments] of expectedFragments) {
    const content = contents.get(relativePath);
    if (!content) continue;
    for (const fragment of fragments) {
      if (!content.includes(fragment)) {
        errors.push(`${relativePath} does not contain expected public identity: ${fragment}`);
      }
    }
  }

  for (const relativePath of ['sitemap.xml', 'feed.xml']) {
    const content = contents.get(relativePath);
    if (content && containsPublicHtmlRoute(content)) {
      errors.push(`${relativePath} contains a public .html route.`);
    }
  }

  if (forbidden) {
    for (const [relativePath, content] of contents) {
      if (content.includes(forbidden)) {
        errors.push(`${relativePath} contains forbidden origin ${forbidden}.`);
      }
    }
  }

  return {
    expectedOrigin: expected,
    forbiddenOrigin: forbidden || null,
    ok: errors.length === 0,
    checkedFiles: [...REQUIRED_FILES],
    errors,
  };
}

function main() {
  const outputDir = process.argv[2];
  const expectedOrigin = process.argv[3];
  const forbiddenOrigin = process.argv[4] || '';
  if (!outputDir || !expectedOrigin) {
    throw new Error('Usage: node scripts/site-artifact.js <output-dir> <expected-origin> [forbidden-origin]');
  }

  const result = verifySiteArtifact(path.resolve(outputDir), {expectedOrigin, forbiddenOrigin});
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }
}
