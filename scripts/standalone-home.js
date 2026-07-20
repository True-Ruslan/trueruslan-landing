import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const DEFAULT_OUTPUT = path.join(ROOT, 'docs-html', 'index.html');
const DEFAULT_CURRENTLY_BUILDING = path.join(ROOT, 'data', 'currently-building.json');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function validateCurrentlyBuilding(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('currently-building manifest must be a non-empty array.');
  }

  const slugs = new Set();
  const requiredFields = ['slug', 'name', 'status', 'summary', 'href', 'tags'];

  for (const entry of entries) {
    for (const field of requiredFields) {
      if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
        throw new Error(`currently-building entry is missing required field: ${field}`);
      }
    }

    if (!/^[a-z0-9-]+$/.test(entry.slug)) {
      throw new Error(`invalid currently-building slug: ${entry.slug}`);
    }
    if (slugs.has(entry.slug)) {
      throw new Error(`duplicate currently-building slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);

    if (!/^(?!\/)(?!.*\.\.)(?!https?:\/\/)[a-zA-Z0-9_./-]+\.html$/.test(entry.href)) {
      throw new Error(`unsafe currently-building href: ${entry.href}`);
    }

    if (!Array.isArray(entry.tags) || entry.tags.length < 2 || entry.tags.length > 5) {
      throw new Error(`currently-building tags must contain 2–5 items for ${entry.slug}`);
    }
    if (entry.tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
      throw new Error(`currently-building tags must be non-empty strings for ${entry.slug}`);
    }
  }

  return entries;
}

export function renderCurrentlyBuilding(entries) {
  validateCurrentlyBuilding(entries);

  return entries.map((entry) => {
    const tags = entry.tags
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join('');

    return `<a class="tr-active-card" href="${escapeHtml(entry.href)}" data-project="${escapeHtml(entry.slug)}">
  <div class="tr-active-card__head">
    <span class="tr-active-card__pulse" aria-hidden="true"></span>
    <span class="tr-active-card__status">${escapeHtml(entry.status)}</span>
  </div>
  <h3>${escapeHtml(entry.name)}</h3>
  <p>${escapeHtml(entry.summary)}</p>
  <div class="tr-active-card__tags" aria-label="Технологии и направления">${tags}</div>
  <span class="tr-active-card__cta">Открыть case study →</span>
</a>`;
  }).join('\n');
}

export function renderStandaloneHome(template, siteUrl, currentlyBuilding = []) {
  const normalizedSiteUrl = siteUrl.trim().replace(/\/$/, '');
  if (!normalizedSiteUrl) {
    throw new Error('siteUrl is required to render the standalone homepage.');
  }

  const activeProjects = currentlyBuilding.length
    ? renderCurrentlyBuilding(currentlyBuilding)
    : '';

  return template
    .replaceAll('{{SITE_URL}}', normalizedSiteUrl)
    .replace('{{CURRENTLY_BUILDING}}', activeProjects);
}

export function writeStandaloneHome({
  templatePath = DEFAULT_TEMPLATE,
  outputPath = DEFAULT_OUTPUT,
  currentlyBuildingPath = DEFAULT_CURRENTLY_BUILDING,
  siteUrl,
} = {}) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Standalone homepage template not found: ${templatePath}`);
  }
  if (!fs.existsSync(currentlyBuildingPath)) {
    throw new Error(`Currently-building manifest not found: ${currentlyBuildingPath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const currentlyBuilding = JSON.parse(fs.readFileSync(currentlyBuildingPath, 'utf8'));
  const html = renderStandaloneHome(template, siteUrl, currentlyBuilding);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}
