import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';

import {applyAnalytics, loadAnalyticsPolicy} from './analytics.js';
import {applyEngineeringGraph, loadEngineeringGraph} from './engineering-graph.js';
import {applyI18n, loadI18nManifest} from './i18n.js';
import {
  applyFeedDiscovery,
  applyNoteEnhancements,
  loadNotesManifest,
  writeAtomFeed,
} from './notes-content.js';
import {applyNowPage, loadNowData} from './now-page.js';
import {writeOgCards} from './og-image.js';
import {applyPageMeta, loadPageMeta} from './page-meta.js';
import {
  validatePhotoAlbums,
  validatePhotoArchive,
  writePhotoStories,
} from './photo-stories.js';
import {applyProjectEvidence, loadProjectEvidence} from './project-evidence.js';
import {
  applyProjectRegistryContent,
  DEFAULT_HISTORY_DIR,
  loadProjectRegistry,
} from './project-registry.js';
import {applyProjectTimelines} from './project-timeline.js';
import {loadPublicationRegistry} from './publication-registry.js';
import {applyPublicationsShowcase} from './publications-showcase.js';
import {normalizeSearchPageHtml} from './search-page.js';
import {
  collectPagesFromToc,
  getSiteUrl,
  injectPersonSchemaIntoHtml,
} from './seo.js';
import {applySourcesKnowledgeBase, loadSourcesRegistry} from './sources-registry.js';
import {writeStandaloneHome} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const STANDALONE_HOME_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const STANDALONE_HOME_EN_TEMPLATE = path.join(ROOT, 'templates', 'index.en.html');
const PAGE_META_MANIFEST = path.join(ROOT, 'data', 'page-meta.json');
const ANALYTICS_POLICY_MANIFEST = path.join(ROOT, 'data', 'analytics.json');
const I18N_MANIFEST = path.join(ROOT, 'data', 'i18n.json');
const ENGINEERING_GRAPH_MANIFEST = path.join(ROOT, 'data', 'engineering-graph.json');
const PROJECTS_MANIFEST = path.join(ROOT, 'data', 'projects.json');
const PROJECT_EVIDENCE_MANIFEST = path.join(ROOT, 'data', 'project-evidence.json');
const NOW_MANIFEST = path.join(ROOT, 'data', 'now.json');
const NOTES_MANIFEST = path.join(ROOT, 'data', 'notes.json');
const PUBLICATIONS_MANIFEST = path.join(ROOT, 'data', 'publications.json');
const SOURCES_MANIFEST = path.join(ROOT, 'data', 'sources.json');
const PHOTO_ALBUMS_MANIFEST = path.join(ROOT, 'data', 'photo-albums.json');
const PHOTO_ARCHIVE_MANIFEST = path.join(ROOT, 'data', 'photo-archive.json');
export const REQUIRED_PROJECT_EVIDENCE = Object.freeze([
  'livingworld',
  'node-zero',
  'vlezet',
  'portfolio-platform',
]);
export const LOCALIZED_PROJECT_EVIDENCE_TARGETS = Object.freeze({
  vlezet: Object.freeze([
    Object.freeze({path: 'en/projects/vlezet.html', locale: 'en'}),
  ]),
});
const PROJECT_EVIDENCE_STYLESHEET = '_assets/style/project-evidence.css';

const ASSET_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff2', '.txt']);
const SEARCH_RESOURCES = [
  ['_assets', 'style', 'search.css'],
  ['_assets', 'script', 'search-ui.js'],
  ['_assets', 'style', 'project-evidence.css'],
  ['_assets', 'style', 'publications.css'],
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

function normalizeExtraRoute(route) {
  const normalized = String(route).replace(/^\/+/, '');
  if (!normalized || normalized.includes('..') || /^[a-z][a-z\d+.-]*:/i.test(normalized)) {
    throw new Error(`Unsafe sitemap route: ${route}`);
  }
  return normalized;
}

export function writeSitemap(
  outputDir = OUTPUT_DIR,
  siteUrl = getSiteUrl(),
  tocPath = path.join(DOCS_DIR, 'toc.yaml'),
  extraRoutes = [],
) {
  const tocContent = fs.readFileSync(tocPath, 'utf8');
  const pages = [...new Set([
    ...collectPagesFromToc(tocContent),
    ...extraRoutes.map(normalizeExtraRoute),
  ])];
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

function resolveStylesheetHref(html, relativePath) {
  const normalizedTarget = relativePath.replaceAll(path.sep, '/');
  const documentDirectory = path.posix.dirname(normalizedTarget);
  const baseMatch = html.match(/<base\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (!baseMatch) return path.posix.relative(documentDirectory, PROJECT_EVIDENCE_STYLESHEET);

  const baseHref = baseMatch[1].split(/[?#]/, 1)[0];
  if (!baseHref || /^[a-z][a-z\d+.-]*:/i.test(baseHref) || baseHref.startsWith('//')) {
    return path.posix.relative(documentDirectory, PROJECT_EVIDENCE_STYLESHEET);
  }

  const baseDirectory = baseHref.startsWith('/')
    ? path.posix.dirname(baseHref)
    : path.posix.normalize(path.posix.join(documentDirectory, baseHref));
  return path.posix.relative(baseDirectory === '.' ? '' : baseDirectory, PROJECT_EVIDENCE_STYLESHEET);
}

export function applyProjectEvidenceStylesheet(outputDir, targetPaths) {
  const updated = [];
  for (const relativePath of targetPaths) {
    const htmlPath = path.join(outputDir, relativePath);
    if (!fs.existsSync(htmlPath)) throw new Error(`Project Evidence stylesheet target not found: ${relativePath}`);
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (/data-tr-project-evidence-stylesheet/i.test(html)) continue;
    if (!/<\/head>/i.test(html)) continue;

    const normalizedTarget = relativePath.replaceAll(path.sep, '/');
    const href = resolveStylesheetHref(html, normalizedTarget);
    const link = `<link rel="stylesheet" href="${href}" data-tr-project-evidence-stylesheet>`;
    fs.writeFileSync(htmlPath, html.replace(/<\/head>/i, `${link}</head>`), 'utf8');
    updated.push(normalizedTarget);
  }
  return updated;
}

function loadPhotoRegistries(photoAlbumsPath, photoArchivePath, docsDir) {
  const rawAlbums = JSON.parse(fs.readFileSync(photoAlbumsPath, 'utf8'));
  const rawArchive = JSON.parse(fs.readFileSync(photoArchivePath, 'utf8'));
  return {
    albums: validatePhotoAlbums(rawAlbums, {docsDir, requireFiles: true}),
    archive: validatePhotoArchive(rawArchive, {docsDir, requireFiles: true}),
  };
}

function englishProjectHref(href) {
  if (href === 'landing/projects/livingworld.html') return 'en/projects/livingworld.html';
  if (href === 'landing/projects/vlezet.html') return 'en/projects/vlezet.html';
  if (href === 'landing/projects/notchhub.html') return 'en/projects/notchhub.html';
  if (href === 'landing/projects/portfolio-platform.html') return 'en/projects/portfolio-platform.html';
  if (href === 'landing/projects.html') return 'en/projects.html';
  return href;
}

function englishProjectCta(project, defaultCta) {
  return englishProjectHref(project.href) === project.href ? 'Open case study (RU) →' : defaultCta;
}

export function postprocessOutput({
  outputDir = OUTPUT_DIR,
  docsDir = DOCS_DIR,
  standaloneTemplatePath = STANDALONE_HOME_TEMPLATE,
  standaloneEnTemplatePath = STANDALONE_HOME_EN_TEMPLATE,
  pageMetaPath = PAGE_META_MANIFEST,
  analyticsPolicyPath,
  analyticsToken = process.env.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN,
  i18nPath,
  engineeringGraphPath = ENGINEERING_GRAPH_MANIFEST,
  projectRegistryPath = PROJECTS_MANIFEST,
  projectHistoryDir = DEFAULT_HISTORY_DIR,
  projectEvidencePath,
  nowPath = NOW_MANIFEST,
  notesPath = NOTES_MANIFEST,
  publicationsPath,
  sourcesPath,
  photoAlbumsPath,
  photoArchivePath,
  siteUrl = getSiteUrl(),
  copyAssets = true,
} = {}) {
  if (!fs.existsSync(outputDir)) {
    throw new Error('docs-html directory not found. Run build:docs:fast first.');
  }

  const projects = loadProjectRegistry(projectRegistryPath, {historyDir: projectHistoryDir});
  const nowData = loadNowData(nowPath);
  const notes = loadNotesManifest(notesPath, {docsDir});

  const isProductionDocs = path.resolve(docsDir) === path.resolve(DOCS_DIR);
  const resolvedAnalyticsPolicyPath = analyticsPolicyPath ?? (isProductionDocs ? ANALYTICS_POLICY_MANIFEST : null);
  const analyticsPolicy = resolvedAnalyticsPolicyPath ? loadAnalyticsPolicy(resolvedAnalyticsPolicyPath) : null;
  const resolvedI18nPath = i18nPath ?? (isProductionDocs ? I18N_MANIFEST : null);
  const i18nPairs = resolvedI18nPath ? loadI18nManifest(resolvedI18nPath) : null;
  const resolvedProjectEvidencePath = projectEvidencePath ?? (isProductionDocs ? PROJECT_EVIDENCE_MANIFEST : null);
  const projectEvidence = resolvedProjectEvidencePath
    ? loadProjectEvidence(resolvedProjectEvidencePath, {projects})
    : null;
  const resolvedPublicationsPath = publicationsPath ?? (isProductionDocs ? PUBLICATIONS_MANIFEST : null);
  const publications = resolvedPublicationsPath
    ? loadPublicationRegistry(resolvedPublicationsPath, {
      projectSlugs: new Set(projects.map(({slug}) => slug)),
      noteSlugs: new Set(notes.map(({slug}) => slug)),
    })
    : null;
  const resolvedSourcesPath = sourcesPath ?? (isProductionDocs ? SOURCES_MANIFEST : null);
  const sources = resolvedSourcesPath ? loadSourcesRegistry(resolvedSourcesPath) : null;
  const resolvedPhotoAlbumsPath = photoAlbumsPath ?? (isProductionDocs ? PHOTO_ALBUMS_MANIFEST : null);
  const resolvedPhotoArchivePath = photoArchivePath ?? (isProductionDocs ? PHOTO_ARCHIVE_MANIFEST : null);
  if (Boolean(resolvedPhotoAlbumsPath) !== Boolean(resolvedPhotoArchivePath)) {
    throw new Error('photoAlbumsPath and photoArchivePath must be provided together');
  }
  const photoContent = resolvedPhotoAlbumsPath
    ? loadPhotoRegistries(resolvedPhotoAlbumsPath, resolvedPhotoArchivePath, docsDir)
    : null;

  const copied = copyAssets ? walkAssets(path.join(docsDir, 'assets'), outputDir, docsDir) : [];
  const copiedSearchResources = copyAssets ? copySearchResources(docsDir, outputDir) : [];

  createNoJekyllFile(outputDir);
  writeRobotsTxt(outputDir, siteUrl);

  const normalizedSearchPages = normalizeSearchPages(outputDir);
  const standaloneHomePath = writeStandaloneHome({
    templatePath: standaloneTemplatePath,
    outputPath: path.join(outputDir, 'index.html'),
    projectRegistryPath,
    publications: publications ?? [],
    siteUrl,
  });
  const standaloneHomeEnPath = i18nPairs
    ? writeStandaloneHome({
      templatePath: standaloneEnTemplatePath,
      outputPath: path.join(outputDir, 'en', 'index.html'),
      projectRegistryPath,
      publications: [],
      siteUrl,
      locale: 'en',
      hrefTransform: englishProjectHref,
      ctaTransform: englishProjectCta,
    })
    : null;

  const projectStatusTargets = applyProjectRegistryContent(
    outputDir,
    projects,
    i18nPairs
      ? {
        targets: [
          'landing/projects.html',
          'en/projects.html',
          'en/projects/livingworld.html',
          'en/projects/vlezet.html',
          'en/projects/notchhub.html',
          'en/projects/portfolio-platform.html',
        ],
      }
      : undefined,
  );
  const nowPageTarget = applyNowPage(outputDir, nowData, projects);
  const nowPageEnTarget = i18nPairs
    ? applyNowPage(outputDir, nowData, projects, {
      target: 'en/now.html',
      locale: 'en',
      hrefTransform: englishProjectHref,
      ctaTransform: englishProjectCta,
    })
    : null;
  const timelineTargets = applyProjectTimelines(outputDir, projects, projectHistoryDir);
  const projectEvidenceTargets = projectEvidence
    ? applyProjectEvidence(outputDir, projectEvidence, {
      requiredProjects: REQUIRED_PROJECT_EVIDENCE,
      targetsByProject: i18nPairs ? LOCALIZED_PROJECT_EVIDENCE_TARGETS : {},
    })
    : [];
  const projectEvidenceStylesheetTargets = applyProjectEvidenceStylesheet(outputDir, projectEvidenceTargets);
  const noteTargets = applyNoteEnhancements(outputDir, notes);
  const feedPath = writeAtomFeed(outputDir, notes, siteUrl);
  const publicationProjectLabels = new Map(projects.map(({slug, name}) => [slug, name]));
  const publicationNoteLabels = new Map(notes.map(({slug, title}) => [slug, title]));
  const publicationShowcaseTarget = publications
    ? applyPublicationsShowcase(outputDir, publications, {
      locale: 'ru',
      projectLabels: publicationProjectLabels,
      noteLabels: publicationNoteLabels,
    })
    : null;
  const publicationShowcaseEnTarget = publications && i18nPairs
    ? applyPublicationsShowcase(outputDir, publications, {
      target: 'en/publications.html',
      locale: 'en',
      projectLabels: publicationProjectLabels,
      noteLabels: publicationNoteLabels,
    })
    : null;
  const sourcesKnowledgeBaseTarget = sources
    ? applySourcesKnowledgeBase(outputDir, sources)
    : null;

  const photoStories = photoContent
    ? writePhotoStories({
      outputDir,
      albums: photoContent.albums,
      archive: photoContent.archive,
      siteUrl,
    })
    : {routes: [], albumRoutes: [], indexPath: null, legacyPath: null};

  writeSitemap(
    outputDir,
    siteUrl,
    path.join(docsDir, 'toc.yaml'),
    [...photoStories.routes, ...(i18nPairs ? ['en/'] : [])],
  );

  const engineeringGraph = loadEngineeringGraph(engineeringGraphPath, {projects});
  const engineeringGraphTarget = applyEngineeringGraph(outputDir, engineeringGraph);

  const pageMeta = loadPageMeta(pageMetaPath);
  const ogCards = writeOgCards(outputDir, pageMeta);
  const metadataUpdated = applyPageMeta(outputDir, pageMeta, siteUrl);
  const i18nTargets = i18nPairs ? applyI18n(outputDir, i18nPairs, siteUrl) : [];
  const personSchemaInjected = applyPersonSchemaToIndex(outputDir, siteUrl);
  const feedDiscoveryUpdated = applyFeedDiscovery(outputDir, siteUrl);
  const analytics = analyticsPolicy
    ? applyAnalytics(outputDir, analyticsPolicy, analyticsToken)
    : {enabled: false, updated: [], provider: null};

  return {
    copied: [...copied, ...copiedSearchResources],
    normalizedSearchPages,
    standaloneHomePath,
    standaloneHomeEnPath,
    projectStatusTargets,
    nowPageTarget,
    nowPageEnTarget,
    timelineTargets,
    projectEvidenceTargets,
    projectEvidenceStylesheetTargets,
    noteTargets,
    feedPath,
    feedDiscoveryUpdated,
    publicationShowcaseTarget,
    publicationShowcaseEnTarget,
    sourcesKnowledgeBaseTarget,
    photoStoryRoutes: photoStories.routes,
    photoStoryIndexPath: photoStories.indexPath,
    photoStoryLegacyPath: photoStories.legacyPath,
    engineeringGraphTarget,
    ogCards,
    metadataUpdated,
    i18nTargets,
    personSchemaInjected,
    analytics,
  };
}

function main() {
  try {
    console.log('Post-processing generated site...');
    const result = postprocessOutput();
    for (const file of result.copied) console.log(`Copied: ${file}`);
    if (result.normalizedSearchPages) console.log(`Normalized ${result.normalizedSearchPages} local-search HTML page(s).`);
    console.log(`Standalone homepage written: ${result.standaloneHomePath}`);
    if (result.standaloneHomeEnPath) console.log(`English standalone homepage written: ${result.standaloneHomeEnPath}`);
    console.log(`Injected ${result.projectStatusTargets} registry-derived project status badge(s).`);
    console.log(`Now page injected: ${result.nowPageTarget}`);
    if (result.nowPageEnTarget) console.log(`English Now page injected: ${result.nowPageEnTarget}`);
    console.log(`Injected ${result.timelineTargets.length} project timeline(s).`);
    if (result.projectEvidenceTargets.length) console.log(`Injected ${result.projectEvidenceTargets.length} Project Evidence block(s).`);
    if (result.projectEvidenceStylesheetTargets.length) console.log(`Wired Project Evidence stylesheet into ${result.projectEvidenceStylesheetTargets.length} page(s).`);
    console.log(`Enhanced ${result.noteTargets.length} Engineering Note page(s).`);
    console.log(`Atom feed written: ${result.feedPath}`);
    if (result.publicationShowcaseTarget) console.log(`Publications showcase injected: ${result.publicationShowcaseTarget}`);
    if (result.publicationShowcaseEnTarget) console.log(`English Publications showcase injected: ${result.publicationShowcaseEnTarget}`);
    if (result.sourcesKnowledgeBaseTarget) console.log(`Sources Knowledge Base injected: ${result.sourcesKnowledgeBaseTarget}`);
    if (result.photoStoryIndexPath) console.log(`Photo Stories written: ${result.photoStoryIndexPath}`);
    console.log(`Engineering Map injected: ${result.engineeringGraphTarget}`);
    console.log(`Generated ${result.ogCards.length} OpenGraph PNG card(s).`);
    console.log(`Injected page metadata into ${result.metadataUpdated} HTML page(s).`);
    if (result.i18nTargets.length) console.log(`Injected RU/EN alternates into ${result.i18nTargets.length} localized HTML page(s).`);
    if (result.feedDiscoveryUpdated) console.log(`Injected feed discovery into ${result.feedDiscoveryUpdated} page(s).`);
    if (result.personSchemaInjected) console.log('Person schema injected into index.html.');
    if (result.analytics.enabled) {
      console.log(`Analytics: ${result.analytics.provider} enabled on ${result.analytics.updated.length} HTML page(s).`);
    } else {
      console.log('Analytics: disabled (no token).');
    }
    console.log('Assets and SEO files created successfully.');
  } catch (error) {
    console.error(`Post-processing failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
