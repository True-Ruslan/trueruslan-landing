import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ICON_LINK_PATTERN = /<link\b(?=[^>]*\brel\s*=\s*(["'])[^"']*\bicon\b[^"']*\1)[^>]*>/gi;
const HREF_PATTERN = /\bhref\s*=\s*(["'])[^"']*\1/i;

function listHtmlFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listHtmlFiles(entryPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(entryPath);
  }

  return files;
}

function normalizeIconTag(tag, href) {
  if (HREF_PATTERN.test(tag)) return tag.replace(HREF_PATTERN, `href="${href}"`);
  if (/\s*\/>$/.test(tag)) return tag.replace(/\s*\/>$/, ` href="${href}" />`);
  return tag.replace(/>$/, ` href="${href}">`);
}

export function copyRootFavicon({docsDir, outputDir}) {
  const sourcePath = path.join(docsDir, 'assets', 'images', 'favicon.svg');
  if (!fs.existsSync(sourcePath)) throw new Error(`Canonical favicon source missing: ${sourcePath}`);
  if (!fs.existsSync(outputDir)) throw new Error(`Generated site directory missing: ${outputDir}`);

  const targetPath = path.join(outputDir, 'favicon.svg');
  fs.copyFileSync(sourcePath, targetPath);
  return 'favicon.svg';
}

export function normalizeFaviconLinks(outputDir, href = '/favicon.svg') {
  const normalizedOutput = path.resolve(outputDir);
  if (!fs.existsSync(normalizedOutput)) throw new Error(`Generated site directory missing: ${normalizedOutput}`);

  const updated = [];
  for (const htmlPath of listHtmlFiles(normalizedOutput)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const normalized = html.replace(ICON_LINK_PATTERN, (tag) => normalizeIconTag(tag, href));
    if (normalized === html) continue;

    fs.writeFileSync(htmlPath, normalized, 'utf8');
    updated.push(path.relative(normalizedOutput, htmlPath).replaceAll(path.sep, '/'));
  }

  return updated.sort();
}

function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.join(scriptDir, '..');
  const docsDir = path.join(root, 'docs');
  const outputDir = path.join(root, 'docs-html');

  try {
    const rootFaviconPath = copyRootFavicon({docsDir, outputDir});
    const faviconLinksUpdated = normalizeFaviconLinks(outputDir);
    console.log(`Root favicon published: ${rootFaviconPath}`);
    console.log(`Normalized favicon links in ${faviconLinksUpdated.length} HTML page(s).`);
  } catch (error) {
    console.error(`Favicon post-processing failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
