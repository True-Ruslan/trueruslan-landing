import {escapeHtml} from './project-registry.js';
import {getFeaturedPublications, groupPublications} from './publication-registry.js';

const COPY = Object.freeze({
  ru: Object.freeze({
    kinds: Object.freeze({
      'technical-article': 'Техническая статья',
      'scientific-publication': 'Научная публикация',
      talk: 'Доклад',
      interview: 'Интервью',
      'proceedings-publication': 'Публикация в сборнике',
    }),
    roles: Object.freeze({
      author: 'Автор',
      'co-author': 'Соавтор',
      speaker: 'Докладчик',
      panellist: 'Участник дискуссии',
      'interview-subject': 'Участник интервью',
    }),
    groups: Object.freeze({
      'technical-article': 'Технические статьи',
      'scientific-publication': 'Научные публикации',
      talk: 'Доклады и конференции',
      interview: 'Интервью и приглашённые материалы',
      'proceedings-publication': 'Публикации в сборниках',
    }),
    featuredHome: 'Избранные публикации',
    featuredPage: 'Избранное',
    featuredHomeIntro: 'Статьи и другие внешние материалы, которые лучше всего показывают мой технический и исследовательский опыт.',
    featuredPageIntro: 'Несколько материалов, с которых удобнее начать знакомство с моими внешними публикациями.',
    allPublications: 'Все публикации →',
    topics: 'Темы',
    secondary: 'Дополнительные материалы',
    related: 'Связано с сайтом',
    groupsNavigation: 'Разделы публикаций',
    openTalk: 'Открыть выступление ↗',
    openInterview: 'Открыть интервью ↗',
    readOn: (platform) => `Читать на ${platform} ↗`,
    secondaryLabels: Object.freeze({}),
  }),
  en: Object.freeze({
    kinds: Object.freeze({
      'technical-article': 'Technical article',
      'scientific-publication': 'Scientific publication',
      talk: 'Talk',
      interview: 'Interview',
      'proceedings-publication': 'Proceedings publication',
    }),
    roles: Object.freeze({
      author: 'Author',
      'co-author': 'Co-author',
      speaker: 'Speaker',
      panellist: 'Panellist',
      'interview-subject': 'Interview participant',
    }),
    groups: Object.freeze({
      'technical-article': 'Technical articles',
      'scientific-publication': 'Scientific publications',
      talk: 'Talks and conferences',
      interview: 'Interviews and invited material',
      'proceedings-publication': 'Proceedings publications',
    }),
    featuredHome: 'Featured publications',
    featuredPage: 'Featured',
    featuredHomeIntro: 'Externally published work that best represents my engineering and research experience.',
    featuredPageIntro: 'A small set of externally published material to start with.',
    allPublications: 'All publications →',
    topics: 'Topics',
    secondary: 'Additional material',
    related: 'Related on this site',
    groupsNavigation: 'Publication sections',
    openTalk: 'Open talk ↗',
    openInterview: 'Open interview ↗',
    readOn: (platform) => `Read on ${platform} ↗`,
    secondaryLabels: Object.freeze({
      video: 'Video',
      slides: 'Slides',
      doi: 'DOI',
      pdf: 'PDF',
      event: 'Event',
      source: 'Source',
    }),
  }),
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

const MONTHS_EN = Object.freeze([
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]);

function localeCopy(locale) {
  const copy = COPY[locale];
  if (!copy) throw new Error(`unsupported publication locale: ${locale}`);
  return copy;
}

function formatPublicationDate(value, locale) {
  const [year, month, day] = value.split('-').map(Number);
  if (locale === 'en') return `${MONTHS_EN[month - 1]} ${day}, ${year}`;
  return `${day} ${MONTHS_RU[month - 1]} ${year}`;
}

function publicationPresentation(publication, locale) {
  if (locale === 'ru') return {summary: publication.summary, topics: publication.topics};
  if (locale === 'en') {
    if (!publication.en?.summary || !Array.isArray(publication.en?.topics) || publication.en.topics.length === 0) {
      throw new Error(`publication English presentation is missing for ${publication.id}`);
    }
    return publication.en;
  }
  throw new Error(`unsupported publication locale: ${locale}`);
}

function primaryActionLabel(publication, copy) {
  if (publication.kind === 'talk') return copy.openTalk;
  if (publication.kind === 'interview') return copy.openInterview;
  return copy.readOn(publication.platform);
}

function renderTopics(topics, copy) {
  return `<div class="tr-publication-card__topics-block"><span class="tr-publication-card__topics-label">${escapeHtml(copy.topics)}</span><ul class="tr-publication-card__topics">${topics
    .map((topic) => `<li>${escapeHtml(topic)}</li>`)
    .join('')}</ul></div>`;
}

function renderSecondaryLinks(publication, copy, locale) {
  if (!publication.links.length) return '';
  return `<ul class="tr-publication-card__secondary" aria-label="${escapeHtml(copy.secondary)}">${publication.links
    .map((link) => {
      const label = locale === 'en' ? (copy.secondaryLabels[link.type] || link.label) : link.label;
      return `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a></li>`;
    })
    .join('')}</ul>`;
}

function normalizeLabelMap(value) {
  if (value instanceof Map) return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) return new Map(Object.entries(value));
  return new Map();
}

function renderRelated(publication, {projectLabels, noteLabels, copy, locale}) {
  const suffix = locale === 'en' ? ' (RU)' : '';
  const projects = publication.relatedProjects.map((slug) => ({
    href: `landing/projects/${slug}.html`,
    label: `${projectLabels.get(slug) || slug}${suffix}`,
  }));
  const notes = publication.relatedNotes.map((slug) => ({
    href: `landing/notes/${slug}.html`,
    label: `${noteLabels.get(slug) || slug}${suffix}`,
  }));
  const links = [...projects, ...notes];
  if (!links.length) return '';

  return `<div class="tr-publication-card__related"><strong>${escapeHtml(copy.related)}</strong><ul>${links
    .map(({href, label}) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join('')}</ul></div>`;
}

function renderPublicationCard(publication, {
  variant,
  projectLabels,
  noteLabels,
  locale,
}) {
  const copy = localeCopy(locale);
  const presentation = publicationPresentation(publication, locale);
  const headingLevel = 'h3';
  const titleLanguage = publication.language !== locale ? ` lang="${escapeHtml(publication.language)}"` : '';
  return `<article class="tr-publication-card tr-publication-card--${variant}" data-tr-publication-id="${escapeHtml(publication.id)}">
  <div class="tr-publication-card__meta">
    <span>${escapeHtml(publication.platform)} · ${escapeHtml(copy.kinds[publication.kind])}</span>
    <time datetime="${escapeHtml(publication.date)}">${formatPublicationDate(publication.date, locale)}</time>
    <span>${escapeHtml(copy.roles[publication.role])}</span>
  </div>
  <${headingLevel}><a href="${escapeHtml(publication.canonicalUrl)}" target="_blank" rel="noopener noreferrer"${titleLanguage}>${escapeHtml(publication.title)}</a></${headingLevel}>
  <p class="tr-publication-card__summary">${escapeHtml(presentation.summary)}</p>
  ${renderTopics(presentation.topics, copy)}
  ${variant === 'catalogue' ? renderRelated(publication, {projectLabels, noteLabels, copy, locale}) : ''}
  <div class="tr-publication-card__actions">
    <a class="tr-publication-card__primary" href="${escapeHtml(publication.canonicalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(primaryActionLabel(publication, copy))}</a>
    ${renderSecondaryLinks(publication, copy, locale)}
  </div>
</article>`;
}

export function renderFeaturedPublications(publications, {
  surface = 'home',
  catalogueHref,
  locale = 'ru',
} = {}) {
  if (!['home', 'page'].includes(surface)) throw new Error(`unsupported featured publication surface: ${surface}`);
  const copy = localeCopy(locale);
  const limit = surface === 'home' ? 3 : 4;
  const selected = getFeaturedPublications(publications, limit);
  if (!selected.length) return '';

  const heading = surface === 'home' ? copy.featuredHome : copy.featuredPage;
  const intro = surface === 'home' ? copy.featuredHomeIntro : copy.featuredPageIntro;
  const resolvedCatalogueHref = catalogueHref || (locale === 'en' ? 'en/publications.html' : 'landing/publications.html');
  const catalogueLink = surface === 'home'
    ? `<a class="tr-publications-featured__all" href="${escapeHtml(resolvedCatalogueHref)}">${escapeHtml(copy.allPublications)}</a>`
    : '';

  return `<section class="tr-publications-featured tr-publications-featured--${surface}" aria-labelledby="featured-publications-title">
  <div class="tr-publications-featured__head">
    <div>
      <h2 id="featured-publications-title">${escapeHtml(heading)}</h2>
      <p>${escapeHtml(intro)}</p>
    </div>
    ${catalogueLink}
  </div>
  <div class="tr-publications-featured__grid">
${selected.map((publication) => renderPublicationCard(publication, {
    variant: 'featured',
    projectLabels: new Map(),
    noteLabels: new Map(),
    locale,
  })).join('\n')}
  </div>
</section>`;
}

export function renderPublicationCatalogue(publications, {
  projectLabels: projectLabelsInput,
  noteLabels: noteLabelsInput,
  locale = 'ru',
} = {}) {
  const copy = localeCopy(locale);
  const groups = groupPublications(publications);
  const projectLabels = normalizeLabelMap(projectLabelsInput);
  const noteLabels = normalizeLabelMap(noteLabelsInput);

  const navigation = groups.length > 1
    ? `<nav class="tr-publications__group-nav" aria-label="${escapeHtml(copy.groupsNavigation)}"><ul>${groups
      .map((group) => `<li><a href="#${GROUP_IDS[group.kind]}">${escapeHtml(copy.groups[group.kind])}</a></li>`)
      .join('')}</ul></nav>`
    : '';

  const sections = groups.map((group) => `<section id="${GROUP_IDS[group.kind]}" class="tr-publications__group" aria-labelledby="${GROUP_IDS[group.kind]}-title">
  <div class="tr-publications__group-head">
    <h2 id="${GROUP_IDS[group.kind]}-title">${escapeHtml(copy.groups[group.kind])}</h2>
    <span>${group.publications.length}</span>
  </div>
  <div class="tr-publications__list">
${group.publications.map((publication) => renderPublicationCard(publication, {
    variant: 'catalogue',
    projectLabels,
    noteLabels,
    locale,
  })).join('\n')}
  </div>
</section>`).join('\n');

  return `<div class="tr-publications" data-tr-publications-root>
  ${navigation}
  ${sections}
</div>`;
}
