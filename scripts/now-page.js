import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';
import {escapeHtml, getActiveProjects, renderProjectCards} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_NOW_PATH = path.join(ROOT, 'data', 'now.json');

export function validateNowData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('now data must be an object.');
  if (typeof data.updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
    throw new Error('now.updated must be an ISO date.');
  }
  if (Number.isNaN(Date.parse(`${data.updated}T00:00:00Z`))) throw new Error('now.updated must be a valid date.');
  if (typeof data.focus !== 'string' || data.focus.trim() === '') throw new Error('now.focus is required.');
  for (const field of ['learning', 'writing']) {
    if (!Array.isArray(data[field]) || data[field].length === 0 || data[field].some((item) => typeof item !== 'string' || item.trim() === '')) {
      throw new Error(`now.${field} must be a non-empty string array.`);
    }
  }
  return data;
}

export function loadNowData(nowPath = DEFAULT_NOW_PATH) {
  if (!fs.existsSync(nowPath)) throw new Error(`now data not found: ${nowPath}`);
  return validateNowData(JSON.parse(fs.readFileSync(nowPath, 'utf8')));
}

function renderList(title, items) {
  return `<section class="tr-now-block">
  <h2>${escapeHtml(title)}</h2>
  <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
</section>`;
}

export function renderNowContent(nowData, projects) {
  validateNowData(nowData);
  const activeProjects = getActiveProjects(projects);
  const projectCards = renderProjectCards(activeProjects);

  return `<div class="tr-now" data-tr-now>
  <p class="tr-now__updated">UPDATED <time datetime="${escapeHtml(nowData.updated)}">${escapeHtml(nowData.updated)}</time></p>
  <p class="tr-now__focus">${escapeHtml(nowData.focus)}</p>
  <section class="tr-now-block" aria-labelledby="tr-now-building-title">
    <h2 id="tr-now-building-title">Сейчас в работе</h2>
    <div class="tr-active-grid">${projectCards}</div>
  </section>
  ${renderList('Что изучаю', nowData.learning)}
  ${renderList('Что пишу', nowData.writing)}
</div>`;
}

export function applyNowPage(outputDir, nowData, projects) {
  const htmlPath = path.join(outputDir, 'landing', 'now.html');
  if (!fs.existsSync(htmlPath)) throw new Error('generated now page not found: landing/now.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const marker = /<div[^>]*data-tr-now-placeholder(?:=["'][^"']*["'])?[^>]*>\s*<\/div>/i;
  const content = renderNowContent(nowData, projects);
  const transformed = transformGeneratedContent(
    html,
    (contentHtml) => marker.test(contentHtml) ? contentHtml.replace(marker, content) : contentHtml,
    'now page placeholder',
  );
  if (!transformed.source) throw new Error('now page placeholder not found in rendered DOM or Diplodoc state payload.');
  fs.writeFileSync(htmlPath, transformed.html, 'utf8');
  return 'landing/now.html';
}
