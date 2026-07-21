import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';

import {applyEngineeringGraph, loadEngineeringGraph} from './engineering-graph.js';
import {
  applyFeedDiscovery,
  applyNoteEnhancements,
  loadNotesManifest,
  writeAtomFeed,
} from './notes-content.js';
import {applyNowPage, loadNowData} from './now-page.js';
import {writeOgCards} from './og-image.js';
import {applyPageMeta, loadPageMeta} from './page-meta.js';
import {DEFAULT_HISTORY_DIR, loadProjectRegistry} from './project-registry.js';
import {applyProjectTimelines} from './project-timeline.js';
import {normalizeSearchPageHtml} from './search-page.js';
import {
  collectPagesFromToc,
  getSiteUrl,
  injectPersonSchemaIntoHtml,
} from './seo.js';
import {writeStandaloneHome} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const STANDALONE_HOME_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const PAGE_META_MANIFEST = path.join(ROOT, 'data', 'page-meta.json');
const ENGINEERING_GRAPH_MANIFEST = path.join(ROOT, 'data', 'engineering-graph.json');
const PROJECTS_MANIFEST = path.join(ROOT, 'data', 'projects.json');
const NOW_MANIFEST = path.join(ROOT, 'data', 'now.json');
const NOTES_MANIFEST = path.join(ROOT, 'data', 'notes.json');

const ASSET_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);
const SEARCH_RESOURCES = [
  ['_assets', 'style', 'search.css'],
  ['_assets', 'script', 'search-ui.js'],
];

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.copyFileSync(source, target);
}

export function walkAssets(dir, outputRoot, docsDir = DOCS_DIR) {
  const copied = [];
  if (!fs.existsSync(dir)) return copied;

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const sourcePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      copied.push(...walkAssets(sourcePath, outputRoot, docsDir));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!ASSET_EXTENSIONS.has(extension)) continue;

    const relativePath = path.relative(docsDir, sourcePath);
    const targetPath = path.join(outputRoot, relativePath);
    copyFile(sourcePath, targetPath);
    copied.push(relativePath);
  }

  return copied;
}

export function copySearchResources(docsDir = DOCS_DIR, outputDir = OUTPUT_DIR) {
  return SEARCH_RESOURCES.map((segments) => {
    const relativePath = path.join(...segments);
    const source = path.join(docsDir, relativePath);
    if (!fs.existsSync(source)) throw new Error(`Search UI resource missing: ${relativePath}`);
    copyFile(source, path.join(outputDir, relativePath));
    return relativePath;
  });
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

export function normalizeSearchPages(outputDir = OUTPUT_DIR) {
  const pattern = path.join(outputDir, '_search', '*', 'index.html');
  const htmlFiles = globSync(pattern, {nodir: true});
  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const relativePath = path.relative(outputDir, htmlPath).replaceAll(path.sep, '/');
    fs.writeFileSync(htmlPath, normalizeSearchPageHtml(html, relativePath), 'utf8');
  }
  return htmlFiles.length;
}

export function applyPersonSchemaToIndex(outputDir = OUTPUT_DIR, siteUrl = getSiteUrl()) {
  const indexPath = path.join(outputDir, 'index.html');
  if (!fs.existsSync(indexPath)) return false;
  const html = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(indexPath, injectPersonSchemaIntoHtml(html, siteUrl), 'utf8');
  return true;
}

export function postprocessOutput({
  outputDir = OUTPUT_DIR,
  docsDir = DOCS_DIR,
  standaloneTemplatePath = STANDALONE_HOME_TEMPLATE,
  pageMetaPath = PAGE_META_MANIFEST,
  engineeringGraphPath = ENGINEERING_GRAPH_MANIFEST,
  projectRegistryPath = PROJECTS_MANIFEST,
  projectHistoryDir = DEFAULT_HISTORY_DIR,
  nowPath = NOW_MANIFEST,
  notesPath = NOTES_MANIFEST,
  siteUrl = getSiteUrl(),
  copyAssets = true,
} = {}) {
  if (!fs.existsSync(outputDir)) {
    throw new Error('docs-html directory not found. Run build:docs:fast first.');
  }

  const projects = loadProjectRegistry(projectRegistryPath, {historyDir: projectHistoryDir});
  const nowData = loadNowData(nowPath);
  const notes = loadNotesManifest(notesPath, {docsDir});
  const copied = copyAssets ? walkAssets(path.join(docsDir, 'assets'), outputDir, docsDir) : [];
  const copiedSearchResources = copyAssets ? copySearchResources(docsDir, outputDir) : [];

  createNoJekyllFile(outputDir);
  writeRobotsTxt(outputDir, siteUrl);
  writeSitemap(outputDir, siteUrl, path.join(docsDir, 'toc.yaml'));

  const normalizedSearchPages = normalizeSearchPages(outputDir);
  const standaloneHomePath = writeStandaloneHome({
    templatePath: standaloneTemplatePath,
    outputPath: path.join(outputDir, 'index.html'),
    projectRegistryPath,
    siteUrl,
  });
  const nowPageTarget = applyNowPage(outputDir, nowData, projects);
  const timelineTargets = applyProjectTimelines(outputDir, projects, projectHistoryDir);
  const noteTargets = applyNoteEnhancements(outputDir, notes);
  const feedPath = writeAtomFeed(outputDir, notes, siteUrl);

  const engineeringGraph = loadEngineeringGraph(engineeringGraphPath);
  const engineeringGraphTarget = applyEngineeringGraph(outputDir, engineeringGraph);

  const pageMeta = loadPageMeta(pageMetaPath);
  const ogCards = writeOgCards(outputDir, pageMeta);
  const metadataUpdated = applyPageMeta(outputDir, pageMeta, siteUrl);
  const personSchemaInjected = applyPersonSchemaToIndex(outputDir, siteUrl);
  const feedDiscoveryUpdated = applyFeedDiscovery(outputDir, siteUrl);

  return {
    copied: [...copied, ...copiedSearchResources],
    normalizedSearchPages,
    standaloneHomePath,
    nowPageTarget,
    timelineTargets,
    noteTargets,
    feedPath,
    feedDiscoveryUpdated,
    engineeringGraphTarget,
    ogCards,
    metadataUpdated,
    personSchemaInjected,
  };
}

function main() {
  try {
    console.log('Post-processing generated site...');
    const result = postprocessOutput();
    for (const file of result.copied) console.log(`Copied: ${file}`);
    if (result.normalizedSearchPages) console.log(`Normalized ${result.normalizedSearchPages} local-search HTML page(s).`);
    console.log(`Standalone homepage written: ${result.standaloneHomePath}`);
    console.log(`Now page injected: ${result.nowPageTarget}`);
    console.log(`Injected ${result.timelineTargets.length} project timeline(s).`);
    console.log(`Enhanced ${result.noteTargets.length} Engineering Note page(s).`);
    console.log(`Atom feed written: ${result.feedPath}`);
    console.log(`Engineering Map injected: ${result.engineeringGraphTarget}`);
    console.log(`Generated ${result.ogCards.length} OpenGraph PNG card(s).`);
    console.log(`Injected page metadata into ${result.metadataUpdated} HTML page(s).`);
    if (result.feedDiscoveryUpdated) console.log(`Injected feed discovery into ${result.feedDiscoveryUpdated} page(s).`);
    if (result.personSchemaInjected) console.log('Person schema injected into index.html.');
    console.log('Assets and SEO files created successfully.');
  } catch (error) {
    console.error(`Post-processing failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
