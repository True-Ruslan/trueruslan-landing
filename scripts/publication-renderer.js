import {escapeHtml} from './project-registry.js';
import {getFeaturedPublications, groupPublications} from './publication-registry.js';

const KIND_LABELS = Object.freeze({
  'technical-article': 'Техническая статья',
  'scientific-publication': 'Научная публикация',
  talk: 'Доклад',
  interview: 'Интервью',
  'proceedings-publication': 'Публикация в сборнике',
});

const ROLE_LABELS = Object.freeze({
  author: 'Автор',
  'co-author': 'Соавтор',
  speaker: 'Докладчик',
  panellist: 'Участник дискуссии',
  'interview-subject': 'Участник интервью',
});

const GROUP_IDS = Object.freeze({
  'technical-article': 'technical-articles',
  'scientific-publication': 'scientific-publications',
  talk: 'talks',
  interview: 'interviews',
  'proceedings-publication': 'proceedings',
});

const MONTHS_RU = Object.freeze([
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]);

function formatPublicationDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return `${day} ${MONTHS_RU[month - 1]} ${year}`;
}

function primaryActionLabel(publication) {
  if (publication.kind === 'talk') return 'Открыть выступление ↗';
  if (publication.kind === 'interview') return 'Открыть интервью ↗';
  return `Читать на ${publication.platform} ↗`;
}

function renderTopics(publication) {
  return `<ul class="tr-publication-card__topics" aria-label="Темы">${publication.topics
    .map((topic) => `<li>${escapeHtml(topic)}</li>`)
    .join('')}</ul>`;
}

function renderSecondaryLinks(publication) {
  if (!publication.links.length) return '';
  return `<ul class="tr-publication-card__secondary" aria-label="Дополнительные материалы">${publication.links
    .map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} ↗</a></li>`)
    .join('')}</ul>`;
}

function normalizeLabelMap(value) {
  if (value instanceof Map) return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) return new Map(Object.entries(value));
  return new Map();
}

function renderRelated(publication, {projectLabels, noteLabels}) {
  const projects = publication.relatedProjects.map((slug) => ({
    href: `landing/projects/${slug}.html`,
    label: projectLabels.get(slug) || slug,
  }));
  const notes = publication.relatedNotes.map((slug) => ({
    href: `landing/notes/${slug}.html`,
    label: noteLabels.get(slug) || slug,
  }));
  const links = [...projects, ...notes];
  if (!links.length) return '';

  return `<div class="tr-publication-card__related"><strong>Связано с сайтом</strong><ul>${links
    .map(({href, label}) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join('')}</ul></div>`;
}

function renderPublicationCard(publication, {
  variant,
  projectLabels,
  noteLabels,
}) {
  const headingLevel = variant === 'featured' ? 'h3' : 'h3';
  return `<article class="tr-publication-card tr-publication-card--${variant}" data-tr-publication-id="${escapeHtml(publication.id)}">
  <div class="tr-publication-card__meta">
    <span>${escapeHtml(publication.platform)} · ${KIND_LABELS[publication.kind]}</span>
    <time datetime="${escapeHtml(publication.date)}">${formatPublicationDate(publication.date)}</time>
    <span>${ROLE_LABELS[publication.role]}</span>
  </div>
  <${headingLevel}><a href="${escapeHtml(publication.canonicalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(publication.title)}</a></${headingLevel}>
  <p class="tr-publication-card__summary">${escapeHtml(publication.summary)}</p>
  ${renderTopics(publication)}
  ${variant === 'catalogue' ? renderRelated(publication, {projectLabels, noteLabels}) : ''}
  <div class="tr-publication-card__actions">
    <a class="tr-publication-card__primary" href="${escapeHtml(publication.canonicalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(primaryActionLabel(publication))}</a>
    ${renderSecondaryLinks(publication)}
  </div>
</article>`;
}

export function renderFeaturedPublications(publications, {
  surface = 'home',
  catalogueHref = 'landing/publications.html',
} = {}) {
  if (!['home', 'page'].includes(surface)) throw new Error(`unsupported featured publication surface: ${surface}`);
  const limit = surface === 'home' ? 3 : 4;
  const selected = getFeaturedPublications(publications, limit);
  if (!selected.length) return '';

  const heading = surface === 'home' ? 'Избранные публикации' : 'Избранное';
  const intro = surface === 'home'
    ? 'Статьи и другие внешние материалы, которые лучше всего показывают мой технический и исследовательский опыт.'
    : 'Несколько материалов, с которых удобнее начать знакомство с моими внешними публикациями.';
  const catalogueLink = surface === 'home'
    ? `<a class="tr-publications-featured__all" href="${escapeHtml(catalogueHref)}">Все публикации →</a>`
    : '';

  return `<section class="tr-publications-featured tr-publications-featured--${surface}" aria-labelledby="featured-publications-title">
  <div class="tr-publications-featured__head">
    <div>
      <h2 id="featured-publications-title">${heading}</h2>
      <p>${intro}</p>
    </div>
    ${catalogueLink}
  </div>
  <div class="tr-publications-featured__grid">
${selected.map((publication) => renderPublicationCard(publication, {
    variant: 'featured',
    projectLabels: new Map(),
    noteLabels: new Map(),
  })).join('\n')}
  </div>
</section>`;
}

export function renderPublicationCatalogue(publications, {
  projectLabels: projectLabelsInput,
  noteLabels: noteLabelsInput,
} = {}) {
  const groups = groupPublications(publications);
  const projectLabels = normalizeLabelMap(projectLabelsInput);
  const noteLabels = normalizeLabelMap(noteLabelsInput);

  const navigation = groups.length > 1
    ? `<nav class="tr-publications__group-nav" aria-label="Разделы публикаций"><ul>${groups
      .map((group) => `<li><a href="#${GROUP_IDS[group.kind]}">${escapeHtml(group.title)}</a></li>`)
      .join('')}</ul></nav>`
    : '';

  const sections = groups.map((group) => `<section id="${GROUP_IDS[group.kind]}" class="tr-publications__group" aria-labelledby="${GROUP_IDS[group.kind]}-title">
  <div class="tr-publications__group-head">
    <h2 id="${GROUP_IDS[group.kind]}-title">${escapeHtml(group.title)}</h2>
    <span>${group.publications.length}</span>
  </div>
  <div class="tr-publications__list">
${group.publications.map((publication) => renderPublicationCard(publication, {
    variant: 'catalogue',
    projectLabels,
    noteLabels,
  })).join('\n')}
  </div>
</section>`).join('\n');

  return `<div class="tr-publications" data-tr-publications-root>
  ${navigation}
  ${sections}
</div>`;
}
