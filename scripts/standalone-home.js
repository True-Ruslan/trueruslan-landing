import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadCollaboration, validateCollaboration} from './collaboration.js';
import {
  DEFAULT_PROJECTS_PATH,
  escapeHtml,
  getActiveProjects,
  isSafeLocalHtmlHref,
  loadProjectRegistry,
  renderProjectCards,
} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const DEFAULT_OUTPUT = path.join(ROOT, 'docs-html', 'index.html');

const HOMEPAGE_FLAGSHIP_SLUGS = Object.freeze([
  'livingworld',
  'notchhub',
  'portfolio-platform',
]);

const HOME_COPY = Object.freeze({
  ru: Object.freeze({
    proofLabel: 'Коротко о профессиональном профиле',
    proof: Object.freeze([
      Object.freeze({value: '5+ лет', label: 'коммерческой разработки'}),
      Object.freeze({value: 'Java 11–25', label: 'основной backend-стек'}),
      Object.freeze({value: 'Spring Boot · Kafka', label: 'сервисы и интеграции'}),
      Object.freeze({value: 'PostgreSQL · ClickHouse', label: 'data-heavy системы'}),
    ]),
    bridges: Object.freeze({
      experience: Object.freeze({
        eyebrow: 'ОПЫТ',
        title: 'Коммерческая разработка',
        text: 'Более 5 лет работаю с Java-backend: продуктовыми и внутренними сервисами, банковскими и B2B-интеграциями, данными, legacy-модернизацией и инженерной автоматизацией.',
        actions: Object.freeze([
          Object.freeze({href: 'landing/resume.html', label: 'Посмотреть опыт →', primary: true}),
        ]),
      }),
      writing: Object.freeze({
        eyebrow: 'МАТЕРИАЛЫ',
        title: 'Инженерные материалы',
        text: 'Пишу о конкретных инженерных решениях, границах надёжности и практике разработки. Отдельно собраны внешние технические и научные публикации.',
        actions: Object.freeze([
          Object.freeze({href: 'landing/notes.html', label: 'Engineering Notes →', primary: true}),
          Object.freeze({href: 'landing/publications.html', label: 'Публикации →'}),
        ]),
      }),
      personal: Object.freeze({
        eyebrow: 'ЛИЧНЫЙ КОНТЕКСТ',
        title: 'Преподавание, исследование и личный контекст',
        text: 'Помимо разработки, преподаю IT-дисциплины и учусь в аспирантуре МПГУ. На сайте также сохраняю личный контекст и короткий текущий срез работы.',
        actions: Object.freeze([
          Object.freeze({href: 'landing/about.html', label: 'Обо мне →', primary: true}),
          Object.freeze({href: 'landing/now.html', label: 'Сейчас →'}),
          Object.freeze({href: 'landing/photos.html', label: 'Фото →'}),
        ]),
      }),
    }),
    collaboration: Object.freeze({
      eyebrow: 'РАБОТА СО МНОЙ',
      title: 'Можно подключиться к конкретной инженерной задаче',
      text: 'Помогаю с backend-сервисами, интеграциями, архитектурными разборами, AI-инструментами и техническим наставничеством. Если задача похожа — можно сразу посмотреть форматы работы и написать напрямую.',
      availability: 'Текущая доступность',
      action: 'Посмотреть форматы работы →',
      handoff: 'Написать напрямую',
    }),
    flagshipCta: 'Открыть проект →',
    tagsLabel: 'Технологии и направления',
  }),
  en: Object.freeze({
    proofLabel: 'Professional profile at a glance',
    proof: Object.freeze([
      Object.freeze({value: '5+ years', label: 'commercial engineering'}),
      Object.freeze({value: 'Java 11–25', label: 'primary backend stack'}),
      Object.freeze({value: 'Spring Boot · Kafka', label: 'services and integrations'}),
      Object.freeze({value: 'PostgreSQL · ClickHouse', label: 'data-intensive systems'}),
    ]),
    bridges: Object.freeze({
      experience: Object.freeze({
        eyebrow: 'EXPERIENCE',
        title: 'Commercial experience',
        text: 'I have 5+ years of Java backend experience across product and internal services, banking and B2B integrations, data-heavy systems, legacy modernization and engineering automation.',
        actions: Object.freeze([
          Object.freeze({href: 'en/resume.html', label: 'Explore experience →', primary: true}),
        ]),
      }),
      writing: Object.freeze({
        eyebrow: 'WRITING',
        title: 'Engineering writing',
        text: 'I write about concrete engineering decisions, reliability boundaries and development practice, with external technical and research publications collected separately.',
        actions: Object.freeze([
          Object.freeze({href: 'en/notes/server-authoritative-ai-npcs.html', label: 'Engineering Notes →', primary: true}),
          Object.freeze({href: 'en/publications.html', label: 'Publications →'}),
        ]),
      }),
      personal: Object.freeze({
        eyebrow: 'PERSONAL',
        title: 'Teaching, research and personal context',
        text: 'Alongside engineering, I teach software-development subjects and pursue postgraduate research at MPGU. The site also keeps a concise view of what I am working on now.',
        actions: Object.freeze([
          Object.freeze({href: 'en/about.html', label: 'About me →', primary: true}),
          Object.freeze({href: 'en/now.html', label: 'Now →'}),
        ]),
      }),
    }),
    collaboration: Object.freeze({
      eyebrow: 'WORK WITH ME',
      title: 'I can join a concrete engineering problem',
      text: 'I help with backend services, integrations, architecture reviews, AI tooling and technical mentoring. If that matches the problem, you can review the available formats and contact me directly.',
      availability: 'Current availability',
      action: 'Review work formats →',
      handoff: 'Contact me directly',
    }),
    flagshipCta: 'Open project →',
    tagsLabel: 'Technologies and areas',
  }),
});

function getHomeCopy(locale) {
  const copy = HOME_COPY[locale];
  if (!copy) throw new Error(`unsupported homepage locale: ${locale}`);
  return copy;
}

function collaborationStatusLabel(status) {
  return String(status).replaceAll('-', ' ').toUpperCase();
}

export function renderHomepageProofStrip(locale = 'ru') {
  const copy = getHomeCopy(locale);
  const items = copy.proof.map(({value, label}, index) => `<div class="tr-home-proof" data-home-proof="${index + 1}">
  <dt>${escapeHtml(value)}</dt>
  <dd>${escapeHtml(label)}</dd>
</div>`).join('\n');

  return `<dl class="tr-home-proof-strip" aria-label="${escapeHtml(copy.proofLabel)}">
${items}
</dl>`;
}

export function renderHomepageBridge(kind, locale = 'ru') {
  const copy = getHomeCopy(locale);
  const bridge = copy.bridges[kind];
  if (!bridge) throw new Error(`unsupported homepage bridge: ${kind}`);

  const actions = bridge.actions.map(({href, label, primary = false}) => {
    if (!isSafeLocalHtmlHref(href)) throw new Error(`unsafe homepage bridge href: ${href}`);
    const modifier = primary ? ' tr-home-bridge__action--primary' : '';
    return `<a class="tr-home-bridge__action${modifier}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  }).join('\n');

  return `<section class="tr-home-section tr-home-bridge" data-home-bridge="${escapeHtml(kind)}" aria-labelledby="home-${escapeHtml(kind)}-${locale}-title">
  <div class="tr-home-bridge__copy">
    <p class="tr-home-bridge__eyebrow">${escapeHtml(bridge.eyebrow)}</p>
    <h2 id="home-${escapeHtml(kind)}-${locale}-title">${escapeHtml(bridge.title)}</h2>
    <p>${escapeHtml(bridge.text)}</p>
  </div>
  <div class="tr-home-bridge__actions">
${actions}
  </div>
</section>`;
}

export function renderHomepageCollaborationSummary(collaboration, locale = 'ru') {
  const value = validateCollaboration(collaboration);
  const copy = getHomeCopy(locale).collaboration;
  const workWithMeHref = locale === 'en' ? 'en/work-with-me.html' : 'landing/work-with-me.html';
  const directHref = value.contact.telegram;
  const status = value.availability.engineering;

  return `<section class="tr-home-section tr-home-collaboration" data-home-collaboration="true" aria-labelledby="home-collaboration-${escapeHtml(locale)}-title">
  <div class="tr-home-collaboration__copy">
    <p class="tr-home-collaboration__eyebrow">${escapeHtml(copy.eyebrow)}</p>
    <h2 id="home-collaboration-${escapeHtml(locale)}-title">${escapeHtml(copy.title)}</h2>
    <p>${escapeHtml(copy.text)}</p>
  </div>
  <div class="tr-home-collaboration__meta">
    <p><span>${escapeHtml(copy.availability)}:</span> <strong data-tr-collaboration-home-availability data-status="${escapeHtml(status)}">${escapeHtml(collaborationStatusLabel(status))}</strong></p>
    <div class="tr-home-collaboration__actions">
      <a class="tr-home-collaboration__action tr-home-collaboration__action--primary" href="${escapeHtml(workWithMeHref)}">${escapeHtml(copy.action)}</a>
      <a class="tr-home-collaboration__action" href="${escapeHtml(directHref)}">${escapeHtml(copy.handoff)}</a>
    </div>
  </div>
</section>`;
}

export function selectHomepageFlagships(projects) {
  if (!Array.isArray(projects)) throw new Error('homepage projects must be an array');
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  return HOMEPAGE_FLAGSHIP_SLUGS.map((slug) => {
    const project = bySlug.get(slug);
    if (!project) throw new Error(`homepage flagship missing from project registry: ${slug}`);
    if (project.visibility !== 'public' || project.active !== true || project.featured !== true) {
      throw new Error(`homepage flagship must be active, featured and public: ${slug}`);
    }
    return project;
  });
}

function renderHomepageFlagships(projects, {
  hrefTransform = (href) => href,
  ctaTransform = (_project, cta) => cta,
  locale = 'ru',
} = {}) {
  const copy = getHomeCopy(locale);
  return selectHomepageFlagships(projects).map((project) => {
    const href = hrefTransform(project.href, project);
    if (!isSafeLocalHtmlHref(href)) throw new Error(`unsafe rendered homepage flagship href: ${href}`);
    const cta = ctaTransform(project, copy.flagshipCta);
    if (typeof cta !== 'string' || !cta.trim()) throw new Error(`invalid homepage flagship CTA for ${project.slug}`);
    const tags = project.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

    return `<a class="tr-home-flagship" data-home-flagship="${escapeHtml(project.slug)}" href="${escapeHtml(href)}">
  <span class="tr-home-flagship__status">${escapeHtml(project.statusLabel)}</span>
  <div class="tr-home-flagship__body">
    <h3>${escapeHtml(project.name)}</h3>
    <p>${escapeHtml(project.summary)}</p>
  </div>
  <span class="tr-home-flagship__tags" aria-label="${escapeHtml(copy.tagsLabel)}">${tags}</span>
  <span class="tr-home-flagship__cta">${escapeHtml(cta)}</span>
</a>`;
  }).join('\n');
}

export function renderStandaloneHome(template, siteUrl, projects = [], {
  locale = 'ru',
  collaboration = null,
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
  const proofStrip = template.includes('{{HOME_PROOF_STRIP}}')
    ? renderHomepageProofStrip(locale)
    : '';
  const flagships = template.includes('{{HOME_FLAGSHIPS}}')
    ? renderHomepageFlagships(projects, {locale, hrefTransform, ctaTransform})
    : '';
  const experienceBridge = template.includes('{{HOME_EXPERIENCE_BRIDGE}}')
    ? renderHomepageBridge('experience', locale)
    : '';
  const writingBridge = template.includes('{{HOME_WRITING_BRIDGE}}')
    ? renderHomepageBridge('writing', locale)
    : '';
  const collaborationBridge = template.includes('{{HOME_COLLABORATION_BRIDGE}}')
    ? (() => {
      if (!collaboration) throw new Error('collaboration data is required for the homepage collaboration bridge.');
      return renderHomepageCollaborationSummary(collaboration, locale);
    })()
    : '';
  const personalBridge = template.includes('{{HOME_PERSONAL_BRIDGE}}')
    ? renderHomepageBridge('personal', locale)
    : '';

  return template
    .replaceAll('{{SITE_URL}}', normalizedSiteUrl)
    .replace('{{HOME_PROOF_STRIP}}', proofStrip)
    .replace('{{HOME_FLAGSHIPS}}', flagships)
    .replace('{{HOME_EXPERIENCE_BRIDGE}}', experienceBridge)
    .replace('{{HOME_WRITING_BRIDGE}}', writingBridge)
    .replace('{{HOME_COLLABORATION_BRIDGE}}', collaborationBridge)
    .replace('{{HOME_PERSONAL_BRIDGE}}', personalBridge)
    .replace('{{CURRENTLY_BUILDING}}', activeProjects);
}

export function writeStandaloneHome({
  templatePath = DEFAULT_TEMPLATE,
  outputPath = DEFAULT_OUTPUT,
  projectRegistryPath = DEFAULT_PROJECTS_PATH,
  collaboration = null,
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
  const resolvedCollaboration = collaboration ?? (
    template.includes('{{HOME_COLLABORATION_BRIDGE}}') ? loadCollaboration() : null
  );
  const html = renderStandaloneHome(template, siteUrl, projects, {
    locale,
    collaboration: resolvedCollaboration,
    hrefTransform,
    ctaTransform,
  });
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}
