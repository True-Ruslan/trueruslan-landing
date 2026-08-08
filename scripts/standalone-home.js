import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {renderFeaturedPublications} from './publication-renderer.js';
import {loadProjectEvidence} from './project-evidence.js';
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
const DEFAULT_PROJECT_EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

const HOMEPAGE_FLAGSHIP_SLUGS = Object.freeze([
  'livingworld',
  'vlezet',
  'portfolio-platform',
]);

const HOME_COPY = Object.freeze({
  ru: Object.freeze({
    pathsLabel: 'Основные разделы',
    paths: Object.freeze([
      Object.freeze({
        id: 'resume',
        index: '01 / ОПЫТ',
        href: 'landing/resume.html',
        title: 'Опыт',
        description: 'Коммерческая разработка, текущий стек, инженерная практика, образование и преподавание.',
        detail: '5+ лет · Java · Backend',
        cta: 'Посмотреть опыт →',
      }),
      Object.freeze({
        id: 'projects',
        index: '02 / ПРОЕКТЫ',
        href: 'landing/projects.html',
        title: 'Инженерные проекты',
        description: 'Архитектура, ограничения, принятые границы и проверяемые результаты собственных систем.',
        detail: 'VillAIgence · Vlezet · Portfolio',
        cta: 'Изучить проекты →',
      }),
      Object.freeze({
        id: 'materials',
        index: '03 / МАТЕРИАЛЫ',
        href: 'landing/notes.html',
        title: 'Заметки и публикации',
        description: 'Engineering Notes о конкретных решениях и Публикации, вышедшие на внешних площадках.',
        detail: 'Notes · Публикации · Sources',
        cta: 'Читать материалы →',
      }),
    ]),
    evidenceLabel: 'Проверяемый текущий статус',
    evidenceKicker: 'EVIDENCE / CURRENT BOUNDARY',
    verifiedAt: 'Проверено',
    registrySource: 'Статус из реестра проектов',
    facts: Object.freeze({
      livingworld: Object.freeze({label: 'Принятый installed результат', version: 'Installed 0.2.0 result'}),
      vlezet: Object.freeze({label: 'Принятый срез распознавания', version: 'Accepted recognition slice'}),
      'portfolio-platform': Object.freeze({label: 'Публичный контур', fallback: 'Static-first production platform'}),
    }),
    flagshipCta: 'Открыть case study →',
    tagsLabel: 'Технологии и направления',
  }),
  en: Object.freeze({
    pathsLabel: 'Primary sections',
    paths: Object.freeze([
      Object.freeze({
        id: 'resume',
        index: '01 / EXPERIENCE',
        href: 'en/resume.html',
        title: 'Experience',
        description: 'Commercial engineering work, current stack, engineering practice, education and teaching.',
        detail: '5+ years · Java · Backend',
        cta: 'Explore experience →',
      }),
      Object.freeze({
        id: 'projects',
        index: '02 / PROJECTS',
        href: 'en/projects.html',
        title: 'Engineering projects',
        description: 'Architecture, constraints, accepted boundaries and reviewable evidence from long-running systems.',
        detail: 'VillAIgence · Vlezet · Portfolio',
        cta: 'Explore projects →',
      }),
      Object.freeze({
        id: 'materials',
        index: '03 / MATERIALS',
        href: 'en/notes/server-authoritative-ai-npcs.html',
        title: 'Notes and publications',
        description: 'Selected English Engineering Notes plus the broader Russian knowledge and publication layer.',
        detail: 'Selected EN · Full RU archive',
        cta: 'Read engineering notes →',
      }),
    ]),
    evidenceLabel: 'Reviewable current status',
    evidenceKicker: 'EVIDENCE / CURRENT BOUNDARY',
    verifiedAt: 'Verified',
    registrySource: 'Status from the project registry',
    facts: Object.freeze({
      livingworld: Object.freeze({label: 'Accepted installed result', version: 'Installed 0.2.0 result'}),
      vlezet: Object.freeze({label: 'Accepted recognition slice', version: 'Accepted recognition slice'}),
      'portfolio-platform': Object.freeze({label: 'Public boundary', fallback: 'Static-first production platform'}),
    }),
    flagshipCta: 'Open case study →',
    tagsLabel: 'Technologies and areas',
  }),
});

function getHomeCopy(locale) {
  const copy = HOME_COPY[locale];
  if (!copy) throw new Error(`unsupported homepage locale: ${locale}`);
  return copy;
}

function renderPathCard(pathItem) {
  if (!isSafeLocalHtmlHref(pathItem.href)) throw new Error(`unsafe homepage path: ${pathItem.href}`);
  return `<a class="tr-home-path" data-home-path="${escapeHtml(pathItem.id)}" href="${escapeHtml(pathItem.href)}">
  <span class="tr-home-path__index">${escapeHtml(pathItem.index)}</span>
  <span class="tr-home-path__body">
    <strong>${escapeHtml(pathItem.title)}</strong>
    <span>${escapeHtml(pathItem.description)}</span>
  </span>
  <span class="tr-home-path__meta">${escapeHtml(pathItem.detail)}</span>
  <span class="tr-home-path__cta">${escapeHtml(pathItem.cta)}</span>
</a>`;
}

export function renderHomepagePrimaryPaths(locale = 'ru') {
  const copy = getHomeCopy(locale);
  return `<nav class="tr-home-paths" aria-label="${escapeHtml(copy.pathsLabel)}">
${copy.paths.map(renderPathCard).join('\n')}
</nav>`;
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

function findVersionValue(evidence, label) {
  return evidence?.versions?.find((version) => version.label === label)?.value ?? null;
}

export function renderHomepageEvidenceSignals(projects, evidence = [], {locale = 'ru'} = {}) {
  const copy = getHomeCopy(locale);
  const flagships = selectHomepageFlagships(projects);
  const evidenceByProject = new Map(evidence.map((snapshot) => [snapshot.project, snapshot]));

  const cards = flagships.map((project) => {
    const fact = copy.facts[project.slug];
    const snapshot = evidenceByProject.get(project.slug);
    const value = fact.version ? findVersionValue(snapshot, fact.version) : fact.fallback;
    if (!value) throw new Error(`homepage evidence fact missing for ${project.slug}: ${fact.version}`);
    const source = snapshot?.lastVerified
      ? `${copy.verifiedAt}: ${snapshot.lastVerified}`
      : copy.registrySource;

    return `<article class="tr-home-evidence-card" data-home-evidence="${escapeHtml(project.slug)}">
  <span class="tr-home-evidence-card__status">${escapeHtml(project.statusLabel)}</span>
  <h3>${escapeHtml(project.name)}</h3>
  <p><span>${escapeHtml(fact.label)}</span><strong>${escapeHtml(value)}</strong></p>
  <small>${escapeHtml(source)}</small>
</article>`;
  }).join('\n');

  return `<section class="tr-home-evidence" aria-label="${escapeHtml(copy.evidenceLabel)}">
  <p class="tr-home-evidence__kicker">${escapeHtml(copy.evidenceKicker)}</p>
  <div class="tr-home-evidence__grid">
${cards}
  </div>
</section>`;
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
    const tags = project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

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
  evidence = [],
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
  const primaryPaths = template.includes('{{HOME_PRIMARY_PATHS}}')
    ? renderHomepagePrimaryPaths(locale)
    : '';
  const evidenceSignals = template.includes('{{HOME_EVIDENCE_SIGNALS}}')
    ? renderHomepageEvidenceSignals(projects, evidence, {locale})
    : '';
  const flagships = template.includes('{{HOME_FLAGSHIPS}}')
    ? renderHomepageFlagships(projects, {locale, hrefTransform, ctaTransform})
    : '';
  const featuredPublications = locale === 'ru' && publications.length
    ? renderFeaturedPublications(publications, {
      surface: 'home',
      catalogueHref: 'landing/publications.html',
    })
    : '';

  return template
    .replaceAll('{{SITE_URL}}', normalizedSiteUrl)
    .replace('{{HOME_PRIMARY_PATHS}}', primaryPaths)
    .replace('{{HOME_EVIDENCE_SIGNALS}}', evidenceSignals)
    .replace('{{HOME_FLAGSHIPS}}', flagships)
    .replace('{{CURRENTLY_BUILDING}}', activeProjects)
    .replace('{{FEATURED_PUBLICATIONS}}', featuredPublications);
}

export function writeStandaloneHome({
  templatePath = DEFAULT_TEMPLATE,
  outputPath = DEFAULT_OUTPUT,
  projectRegistryPath = DEFAULT_PROJECTS_PATH,
  evidence = null,
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
  const resolvedEvidence = evidence ?? (
    path.resolve(projectRegistryPath) === path.resolve(DEFAULT_PROJECTS_PATH)
      ? loadProjectEvidence(DEFAULT_PROJECT_EVIDENCE_PATH, {projects})
      : []
  );
  const html = renderStandaloneHome(template, siteUrl, projects, {
    locale,
    evidence: resolvedEvidence,
    publications,
    hrefTransform,
    ctaTransform,
  });
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}
