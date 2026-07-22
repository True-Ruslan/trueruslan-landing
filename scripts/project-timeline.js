import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';
import {escapeHtml} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_HISTORY_DIR = path.join(ROOT, 'data', 'project-history');
const STATES = new Set(['past', 'current', 'next']);
const SAFE_EXTERNAL = /^https:\/\/[a-zA-Z0-9.-]+(?:[/:?#][^\s]*)?$/;
const SAFE_LOCAL = /^(?!\/)(?!.*\.\.)[a-zA-Z0-9_./#-]+$/;

export function validateTimeline(slug, entries) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`invalid timeline slug: ${slug}`);
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`timeline must be a non-empty array for ${slug}`);
  }

  let currentCount = 0;
  for (const entry of entries) {
    for (const field of ['date', 'title', 'description', 'state']) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        throw new Error(`timeline entry is missing required field ${field} for ${slug}`);
      }
    }
    if (!STATES.has(entry.state)) throw new Error(`invalid timeline state for ${slug}: ${entry.state}`);
    if (entry.state === 'current') currentCount += 1;
    if (entry.version !== undefined && (typeof entry.version !== 'string' || entry.version.trim() === '')) {
      throw new Error(`invalid timeline version for ${slug}`);
    }
    if (entry.evidence !== undefined) {
      if (typeof entry.evidence !== 'string' || (!SAFE_EXTERNAL.test(entry.evidence) && !SAFE_LOCAL.test(entry.evidence))) {
        throw new Error(`unsafe timeline evidence link for ${slug}`);
      }
    }
  }
  if (currentCount > 1) throw new Error(`timeline has more than one current entry for ${slug}`);
  return entries;
}

export function loadTimeline(slug, historyDir = DEFAULT_HISTORY_DIR) {
  const timelinePath = path.join(historyDir, `${slug}.json`);
  if (!fs.existsSync(timelinePath)) throw new Error(`timeline file not found: ${timelinePath}`);
  return validateTimeline(slug, JSON.parse(fs.readFileSync(timelinePath, 'utf8')));
}

function renderDate(date) {
  if (/^\d{4}-\d{2}(?:-\d{2})?$/.test(date)) {
    return `<time datetime="${escapeHtml(date)}">${escapeHtml(date)}</time>`;
  }
  return `<span>${escapeHtml(date)}</span>`;
}

export function renderTimeline(slug, entries) {
  validateTimeline(slug, entries);
  const items = entries.map((entry) => {
    const version = entry.version ? `<span class="tr-project-timeline__version">${escapeHtml(entry.version)}</span>` : '';
    const evidence = entry.evidence
      ? `<a class="tr-project-timeline__evidence" href="${escapeHtml(entry.evidence)}"${SAFE_EXTERNAL.test(entry.evidence) ? ' target="_blank" rel="noopener noreferrer"' : ''}>Evidence ↗</a>`
      : '';
    return `<li class="tr-project-timeline__item tr-project-timeline__item--${entry.state}">
  <div class="tr-project-timeline__marker" aria-hidden="true"></div>
  <div class="tr-project-timeline__content">
    <div class="tr-project-timeline__meta">${renderDate(entry.date)}${version}<span>${escapeHtml(entry.state.toUpperCase())}</span></div>
    <h3>${escapeHtml(entry.title)}</h3>
    <p>${escapeHtml(entry.description)}</p>
    ${evidence}
  </div>
</li>`;
  }).join('\n');

  return `<section class="tr-project-timeline" aria-labelledby="tr-${escapeHtml(slug)}-timeline-title">
  <div class="tr-project-timeline__head">
    <p class="tr-project-timeline__eyebrow">PROJECT EVOLUTION</p>
    <h2 id="tr-${escapeHtml(slug)}-timeline-title">Как развивается проект</h2>
  </div>
  <ol class="tr-project-timeline__list">${items}</ol>
</section>`;
}

export function applyProjectTimelines(outputDir, projects, historyDir = DEFAULT_HISTORY_DIR) {
  const updated = [];
  for (const project of projects) {
    if (!project.timeline) continue;
    const htmlPath = path.join(outputDir, project.href);
    if (!fs.existsSync(htmlPath)) throw new Error(`timeline target page not found: ${project.href}`);
    const html = fs.readFileSync(htmlPath, 'utf8');
    const marker = new RegExp(`<div[^>]*data-tr-project-timeline=["']${project.timeline}["'][^>]*>\\s*</div>`, 'i');
    const timeline = loadTimeline(project.timeline, historyDir);
    const rendered = renderTimeline(project.slug, timeline);
    const transformed = transformGeneratedContent(
      html,
      (contentHtml) => marker.test(contentHtml) ? contentHtml.replace(marker, rendered) : contentHtml,
      `timeline for ${project.slug}`,
    );
    if (!transformed.source) throw new Error(`timeline placeholder not found for ${project.slug} in rendered DOM or Diplodoc state payload`);
    fs.writeFileSync(htmlPath, transformed.html, 'utf8');
    updated.push(project.href);
  }
  return updated;
}
