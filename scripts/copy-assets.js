import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';

import {injectDarkThemeIntoHtml} from './dark-theme.js';
import {
  collectPagesFromToc,
  getSiteUrl,
  injectPersonSchemaIntoHtml,
} from './seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');

const ASSET_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.copyFileSync(source, target);
}

export function walkAssets(dir, outputRoot, docsDir = DOCS_DIR) {
  const copied = [];

  if (!fs.existsSync(dir)) {
    return copied;
  }

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const sourcePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      copied.push(...walkAssets(sourcePath, outputRoot, docsDir));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!ASSET_EXTENSIONS.has(extension)) {
      continue;
    }

    const relativePath = path.relative(docsDir, sourcePath);
    const targetPath = path.join(outputRoot, relativePath);
    copyFile(sourcePath, targetPath);
    copied.push(relativePath);
  }

  return copied;
}

export function syncAssets(sourceDir, outputRoot, docsDir = DOCS_DIR) {
  const relativeAssetsPath = path.relative(docsDir, sourceDir);
  const targetAssetsDir = path.join(outputRoot, relativeAssetsPath);

  fs.rmSync(targetAssetsDir, {recursive: true, force: true});
  return walkAssets(sourceDir, outputRoot, docsDir);
}

export function createNoJekyllFile(outputDir = OUTPUT_DIR) {
  fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');
}

export function writeRobotsTxt(outputDir = OUTPUT_DIR, siteUrl = getSiteUrl()) {
  const content = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), content);
}

export function writeSitemap(outputDir = OUTPUT_DIR, siteUrl = getSiteUrl(), tocPath = path.join(DOCS_DIR, 'toc.yaml')) {
  const tocContent = fs.readFileSync(tocPath, 'utf8');
  const pages = collectPagesFromToc(tocContent);

  const urls = pages.map((page) => {
    const loc = page ? `${siteUrl}/${page}` : `${siteUrl}/`;
    return `  <url><loc>${loc}</loc></url>`;
  }).join('\n');

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), content);
}

export function applyDarkThemeToHtmlFiles(outputDir = OUTPUT_DIR) {
  const pattern = path.join(outputDir, '**', '*.html');
  const htmlFiles = globSync(pattern, {nodir: true});

  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const transformed = injectDarkThemeIntoHtml(html);
    fs.writeFileSync(htmlPath, transformed, 'utf8');
  }

  return htmlFiles.length;
}

export function applyPersonSchemaToIndex(outputDir = OUTPUT_DIR, siteUrl = getSiteUrl()) {
  const indexPath = path.join(outputDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return false;
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const transformed = injectPersonSchemaIntoHtml(html, siteUrl);
  fs.writeFileSync(indexPath, transformed, 'utf8');
  return true;
}

export function postprocessOutput({
  outputDir = OUTPUT_DIR,
  docsDir = DOCS_DIR,
  siteUrl = getSiteUrl(),
  copyAssets = true,
} = {}) {
  if (!fs.existsSync(outputDir)) {
    throw new Error('docs-html directory not found. Run build:docs:fast first.');
  }

  const copied = copyAssets
    ? syncAssets(path.join(docsDir, 'assets'), outputDir, docsDir)
    : [];

  createNoJekyllFile(outputDir);
  writeRobotsTxt(outputDir, siteUrl);
  writeSitemap(outputDir, siteUrl, path.join(docsDir, 'toc.yaml'));

  const themedPages = applyDarkThemeToHtmlFiles(outputDir);
  const personSchemaInjected = applyPersonSchemaToIndex(outputDir, siteUrl);

  return {copied, themedPages, personSchemaInjected};
}

function main() {
  try {
    console.log('Post-processing generated site...');
    const result = postprocessOutput();

    for (const file of result.copied) {
      console.log(`Copied: ${file}`);
    }

    console.log(`Dark theme applied to ${result.themedPages} HTML file(s).`);
    if (result.personSchemaInjected) {
      console.log('Person schema injected into index.html.');
    }

    console.log('Assets and SEO files created successfully.');
  } catch (error) {
    console.error(`Post-processing failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
