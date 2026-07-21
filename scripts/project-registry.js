import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_PROJECTS_PATH = path.join(ROOT, 'data', 'projects.json');
export const DEFAULT_HISTORY_DIR = path.join(ROOT, 'data', 'project-history');

export const PROJECT_STATUS_VALUES = Object.freeze([
  'prototype',
  'pre-production',
  'release-candidate',
  'production',
  'maintained',
  'archived',
]);

const STATUS_SET = new Set(PROJECT_STATUS_VALUES);
const VISIBILITY_SET = new Set(['public', 'private']);
const SAFE_LOCAL_HTML = /^(?!\/)(?!.*\.\.)(?!https?:\/\/)[a-zA-Z0-9_./-]+\.html$/;
const SAFE_EXTERNAL = /^https:\/\/[a-zA-Z0-9.-]+(?:[/:?#][^\s]*)?$/;

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function isSafeLocalHtmlHref(href) {
  return typeof href === 'string' && SAFE_LOCAL_HTML.test(href);
}

function validateLinks(project) {
  if (project.links === undefined) return;
  if (!project.links || typeof project.links !== 'object' || Array.isArray(project.links)) {
    throw new Error(`project links must be an object for ${project.slug}`);
  }
  for (const [name, href] of Object.entries(project.links)) {
    if (!name.trim() || typeof href !== 'string' || (!SAFE_EXTERNAL.test(href) && !isSafeLocalHtmlHref(href))) {
      throw new Error(`unsafe project link for ${project.slug}: ${name}`);
    }
  }
}

export function validateProjectRegistry(projects, {
  historyDir = DEFAULT_HISTORY_DIR,
  requireTimelineFiles = true,
} = {}) {
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('project registry must be a non-empty array.');
  }

  const slugs = new Set();
  const requiredStrings = ['slug', 'name', 'status', 'statusLabel', 'summary', 'visibility', 'href'];

  for (const project of projects) {
    for (const field of requiredStrings) {
      if (typeof project[field] !== 'string' || project[field].trim() === '') {
        throw new Error(`project entry is missing required field: ${field}`);
      }
    }

    if (!/^[a-z0-9-]+$/.test(project.slug)) {
      throw new Error(`invalid project slug: ${project.slug}`);
    }
    if (slugs.has(project.slug)) {
      throw new Error(`duplicate project slug: ${project.slug}`);
    }
    slugs.add(project.slug);

    if (!STATUS_SET.has(project.status)) {
      throw new Error(`unknown project status for ${project.slug}: ${project.status}`);
    }
    if (!VISIBILITY_SET.has(project.visibility)) {
      throw new Error(`unknown project visibility for ${project.slug}: ${project.visibility}`);
    }
    if (typeof project.featured !== 'boolean' || typeof project.active !== 'boolean') {
      throw new Error(`project featured/active flags must be boolean for ${project.slug}`);
    }
    if (!isSafeLocalHtmlHref(project.href)) {
      throw new Error(`unsafe project href: ${project.href}`);
    }
    if (project.active && !project.href) {
      throw new Error(`active project must have a usable destination: ${project.slug}`);
    }

    if (!Array.isArray(project.tags) || project.tags.length < 2 || project.tags.length > 5) {
      throw new Error(`project tags must contain 2–5 items for ${project.slug}`);
    }
    if (project.tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
      throw new Error(`project tags must be non-empty strings for ${project.slug}`);
    }

    if (project.noteSlugs !== undefined) {
      if (!Array.isArray(project.noteSlugs) || project.noteSlugs.some((slug) => !/^[a-z0-9-]+$/.test(slug))) {
        throw new Error(`invalid noteSlugs for ${project.slug}`);
      }
    }

    if (project.timeline !== undefined) {
      if (typeof project.timeline !== 'string' || !/^[a-z0-9-]+$/.test(project.timeline)) {
        throw new Error(`invalid timeline reference for ${project.slug}`);
      }
      if (requireTimelineFiles && !fs.existsSync(path.join(historyDir, `${project.timeline}.json`))) {
        throw new Error(`missing timeline data for ${project.slug}: ${project.timeline}`);
      }
    }

    validateLinks(project);
  }

  return projects;
}

export function loadProjectRegistry(manifestPath = DEFAULT_PROJECTS_PATH, options = {}) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`project registry not found: ${manifestPath}`);
  }
  const projects = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return validateProjectRegistry(projects, options);
}

export function getActiveProjects(projects) {
  return projects.filter((project) => project.active === true);
}

export function renderProjectCards(projects) {
  return projects.map((project) => {
    const tags = project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<a class="tr-active-card" href="${escapeHtml(project.href)}" data-project="${escapeHtml(project.slug)}">
  <div class="tr-active-card__head">
    <span class="tr-active-card__pulse" aria-hidden="true"></span>
    <span class="tr-active-card__status">${escapeHtml(project.statusLabel)}</span>
  </div>
  <h3>${escapeHtml(project.name)}</h3>
  <p>${escapeHtml(project.summary)}</p>
  <div class="tr-active-card__tags" aria-label="Технологии и направления">${tags}</div>
  <span class="tr-active-card__cta">Открыть case study →</span>
</a>`;
  }).join('\n');
}
