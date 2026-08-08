import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';
import {escapeHtml, getActiveProjects, renderProjectCards} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_NOW_PATH = path.join(ROOT, 'data', 'now.json');

const NOW_COPY = Object.freeze({
  ru: Object.freeze({
    currentWork: 'Сейчас в работе',
    learning: 'Что изучаю',
    writing: 'Что пишу',
  }),
  en: Object.freeze({
    currentWork: 'Current work',
    learning: "What I'm learning",
    writing: "What I'm writing",
  }),
});

function validateEditorialSlice(slice, label) {
  if (!slice || typeof slice !== 'object' || Array.isArray(slice)) throw new Error(`${label} must be an object.`);
  if (typeof slice.focus !== 'string' || slice.focus.trim() === '') throw new Error(`${label}.focus is required.`);
  for (const field of ['learning', 'writing']) {
    if (!Array.isArray(slice[field]) || slice[field].length === 0 || slice[field].some((item) => typeof item !== 'string' || item.trim() === '')) {
      throw new Error(`${label}.${field} must be a non-empty string array.`);
    }
  }
}

export function validateNowData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('now data must be an object.');
  if (typeof data.updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
    throw new Error('now.updated must be an ISO date.');
  }
  if (Number.isNaN(Date.parse(`${data.updated}T00:00:00Z`))) throw new Error('now.updated must be a valid date.');
  validateEditorialSlice(data, 'now');
  if (data.en !== undefined) validateEditorialSlice(data.en, 'now.en');
  return data;
}

export function loadNowData(nowPath = DEFAULT_NOW_PATH) {
  let raw;
  try {
    raw = fs.readFileSync(nowPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`now data not found: ${nowPath}`);
    throw error;
  }
  return validateNowData(JSON.parse(raw));
}

function localeCopy(locale) {
  const copy = NOW_COPY[locale];
  if (!copy) throw new Error(`unsupported now locale: ${locale}`);
  return copy;
}

function editorialSlice(nowData, locale) {
  if (locale === 'ru') return nowData;
  const slice = nowData[locale];
  validateEditorialSlice(slice, `now.${locale}`);
  return slice;
}

function renderList(title, items) {
  return `<section class="tr-now-block">
  <h2>${escapeHtml(title)}</h2>
  <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
</section>`;
}

export function renderNowContent(nowData, projects, {
  locale = 'ru',
  hrefTransform = (href) => href,
  ctaTransform,
} = {}) {
  validateNowData(nowData);
  const copy = localeCopy(locale);
  const editorial = editorialSlice(nowData, locale);
  const spotlightProjects = getActiveProjects(projects).filter((project) => project.featured === true);
  const projectCards = renderProjectCards(spotlightProjects, {
    locale,
    hrefTransform,
    ...(ctaTransform ? {ctaTransform} : {}),
  });
  const titleId = `tr-now-building-${locale}-title`;

  return `<div class="tr-now" data-tr-now lang="${locale}">
  <p class="tr-now__updated">UPDATED <time datetime="${escapeHtml(nowData.updated)}">${escapeHtml(nowData.updated)}</time></p>
  <p class="tr-now__focus">${escapeHtml(editorial.focus)}</p>
  <section class="tr-now-block" aria-labelledby="${titleId}">
    <h2 id="${titleId}">${escapeHtml(copy.currentWork)}</h2>
    <div class="tr-active-grid">${projectCards}</div>
  </section>
  ${renderList(copy.learning, editorial.learning)}
  ${renderList(copy.writing, editorial.writing)}
</div>`;
}

function injectNoJavaScriptFallback(html, content, locale) {
  const marker = new RegExp(`data-tr-now-noscript=["']${locale}["']`, 'i');
  if (marker.test(html)) return html;
  const rootMarker = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
  if (!rootMarker.test(html)) throw new Error(`now page could not place no-JavaScript fallback for ${locale}: #root host not found.`);
  const fallback = `<noscript data-tr-now-noscript="${locale}">
  <div class="tr-now-noscript">${content}</div>
</noscript>`;
  return html.replace(rootMarker, (rootHost) => `${rootHost}\n${fallback}`);
}

export function applyNowPage(outputDir, nowData, projects, {
  target = 'landing/now.html',
  locale = 'ru',
  hrefTransform = (href) => href,
  ctaTransform,
} = {}) {
  const htmlPath = path.join(outputDir, ...target.split('/'));
  let html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`generated now page not found: ${target}`);
    throw error;
  }
  const marker = /<div[^>]*data-tr-now-placeholder(?:=["'][^"']*["'])?[^>]*>\s*<\/div>/i;
  const content = renderNowContent(nowData, projects, {locale, hrefTransform, ctaTransform});
  const transformed = transformGeneratedContent(
    html,
    (contentHtml) => marker.test(contentHtml) ? contentHtml.replace(marker, content) : contentHtml,
    `now page placeholder (${locale})`,
  );
  if (!transformed.source) throw new Error(`now page placeholder not found for ${target} in rendered DOM or Diplodoc state payload.`);
  const finalHtml = transformed.source === 'diplodoc-state'
    ? injectNoJavaScriptFallback(transformed.html, content, locale)
    : transformed.html;
  fs.writeFileSync(htmlPath, finalHtml, 'utf8');
  return target;
}
