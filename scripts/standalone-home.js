import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {renderFeaturedPublications} from './publication-renderer.js';
import {
  DEFAULT_PROJECTS_PATH,
  getActiveProjects,
  loadProjectRegistry,
  renderProjectCards,
} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const DEFAULT_OUTPUT = path.join(ROOT, 'docs-html', 'index.html');

export function renderStandaloneHome(template, siteUrl, projects = [], {
  locale = 'ru',
  publications = [],
  hrefTransform = (href) => href,
  ctaTransform = (_project, cta) => cta,
} = {}) {
  const normalizedSiteUrl = siteUrl.trim().replace(/\/$/, '');
  if (!normalizedSiteUrl) {
    throw new Error('siteUrl is required to render the standalone homepage.');
  }

  const activeProjects = projects.length
    ? renderProjectCards(getActiveProjects(projects), {locale, hrefTransform, ctaTransform})
    : '';
  const featuredPublications = locale === 'ru' && publications.length
    ? renderFeaturedPublications(publications, {
      surface: 'home',
      catalogueHref: 'landing/publications.html',
    })
    : '';

  return template
    .replaceAll('{{SITE_URL}}', normalizedSiteUrl)
    .replace('{{CURRENTLY_BUILDING}}', activeProjects)
    .replace('{{FEATURED_PUBLICATIONS}}', featuredPublications);
}

export function writeStandaloneHome({
  templatePath = DEFAULT_TEMPLATE,
  outputPath = DEFAULT_OUTPUT,
  projectRegistryPath = DEFAULT_PROJECTS_PATH,
  publications = [],
  siteUrl,
  locale = 'ru',
  hrefTransform = (href) => href,
  ctaTransform = (_project, cta) => cta,
} = {}) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Standalone homepage template not found: ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const projects = loadProjectRegistry(projectRegistryPath);
  const html = renderStandaloneHome(template, siteUrl, projects, {
    locale,
    publications,
    hrefTransform,
    ctaTransform,
  });
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}
