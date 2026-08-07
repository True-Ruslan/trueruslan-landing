import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadNotesManifest} from './notes-content.js';
import {loadProjectRegistry} from './project-registry.js';
import {loadPublicationRegistry} from './publication-registry.js';
import {renderPublicationCatalogue} from './publication-renderer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const PROJECTS_PATH = path.join(ROOT, 'data', 'projects.json');
const NOTES_PATH = path.join(ROOT, 'data', 'notes.json');
const PUBLICATIONS_PATH = path.join(ROOT, 'data', 'publications.json');
export const DEFAULT_PUBLICATION_INCLUDE_PATH = path.join(
  DOCS_DIR,
  '_includes',
  'publications-catalogue.md',
);
export const DEFAULT_PUBLICATION_EN_INCLUDE_PATH = path.join(
  DOCS_DIR,
  '_includes',
  'publications-catalogue.en.md',
);

export function renderPublicationCatalogueInclude(publications, {
  projectLabels,
  noteLabels,
  locale = 'ru',
} = {}) {
  const catalogue = renderPublicationCatalogue(publications, {
    projectLabels,
    noteLabels,
    locale,
  });

  return `<!-- GENERATED: data/publications.json; DO NOT EDIT -->
<div data-tr-publications-prebuild data-tr-publications-locale="${locale}">
${catalogue}
</div>
`;
}

export function writePublicationCatalogueInclude({
  outputPath = DEFAULT_PUBLICATION_INCLUDE_PATH,
  publications,
  projectLabels,
  noteLabels,
  locale = 'ru',
} = {}) {
  if (!Array.isArray(publications) || publications.length === 0) {
    throw new Error('publications are required to generate the catalogue include');
  }

  const content = renderPublicationCatalogueInclude(publications, {
    projectLabels,
    noteLabels,
    locale,
  });
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

export function generatePublicationContent({
  outputPath = DEFAULT_PUBLICATION_INCLUDE_PATH,
  enOutputPath = DEFAULT_PUBLICATION_EN_INCLUDE_PATH,
  docsDir = DOCS_DIR,
  projectsPath = PROJECTS_PATH,
  notesPath = NOTES_PATH,
  publicationsPath = PUBLICATIONS_PATH,
} = {}) {
  const projects = loadProjectRegistry(projectsPath);
  const notes = loadNotesManifest(notesPath, {docsDir});
  const publications = loadPublicationRegistry(publicationsPath, {
    projectSlugs: new Set(projects.map(({slug}) => slug)),
    noteSlugs: new Set(notes.map(({slug}) => slug)),
  });
  const projectLabels = new Map(projects.map(({slug, name}) => [slug, name]));
  const noteLabels = new Map(notes.map(({slug, title}) => [slug, title]));

  return Object.freeze({
    ru: writePublicationCatalogueInclude({
      outputPath,
      publications,
      projectLabels,
      noteLabels,
      locale: 'ru',
    }),
    en: writePublicationCatalogueInclude({
      outputPath: enOutputPath,
      publications,
      projectLabels,
      noteLabels,
      locale: 'en',
    }),
  });
}

function main() {
  try {
    const outputPaths = generatePublicationContent();
    console.log(`Generated publication catalogue include: ${outputPaths.ru}`);
    console.log(`Generated English publication catalogue include: ${outputPaths.en}`);
  } catch (error) {
    console.error(`Publication catalogue generation failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
