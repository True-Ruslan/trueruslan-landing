import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export const DEFAULT_PROJECT_EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

export const PROJECT_EVIDENCE_STATUS_VALUES = Object.freeze(['verified', 'stale', 'unverified']);
export const PROJECT_EVIDENCE_KIND_VALUES = Object.freeze(['ci', 'release', 'pr', 'build', 'manual']);
export const PROJECT_EVIDENCE_MODE_VALUES = Object.freeze(['automated', 'manual']);
export const PROJECT_EVIDENCE_SIGNAL_STATE_VALUES = Object.freeze([
  'green',
  'published',
  'merged',
  'passed',
  'accepted',
  'pending',
  'failed',
  'unavailable',
]);

const STATUS_SET = new Set(PROJECT_EVIDENCE_STATUS_VALUES);
const KIND_SET = new Set(PROJECT_EVIDENCE_KIND_VALUES);
const MODE_SET = new Set(PROJECT_EVIDENCE_MODE_VALUES);
const SIGNAL_STATE_SET = new Set(PROJECT_EVIDENCE_SIGNAL_STATE_VALUES);
const SAFE_EXTERNAL = /^https:\/\/[a-zA-Z0-9.-]+(?:[/:?#][^\s]*)?$/;
const SLUG = /^[a-z0-9-]+$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const STATUS_COPY = Object.freeze({
  verified: 'ПРОВЕРЕНО',
  stale: 'ТРЕБУЕТ ПЕРЕПРОВЕРКИ',
  unverified: 'НЕ ПРОВЕРЕНО',
});

const MODE_COPY = Object.freeze({
  automated: 'Автоматическое доказательство',
  manual: 'Ручная проверка',
});

const STATE_COPY = Object.freeze({
  green: 'green',
  published: 'published',
  merged: 'merged',
  passed: 'passed',
  accepted: 'accepted',
  pending: 'pending',
  failed: 'failed',
  unavailable: 'unavailable',
});

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function isValidIsoCalendarDate(value) {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function normalizeKey(value) {
  return value.trim().toLocaleLowerCase('en-US');
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function validateVersionFacts(snapshot) {
  if (!Array.isArray(snapshot.versions)) {
    throw new Error(`versions must be an array for ${snapshot.project}`);
  }

  const labels = new Set();
  for (const version of snapshot.versions) {
    requireObject(version, `version fact for ${snapshot.project}`);
    requireNonEmptyString(version.label, `version label for ${snapshot.project}`);
    requireNonEmptyString(version.value, `version value for ${snapshot.project}`);

    const key = normalizeKey(version.label);
    if (labels.has(key)) {
      throw new Error(`duplicate version label for ${snapshot.project}: ${version.label}`);
    }
    labels.add(key);
  }
}

function validateSignals(snapshot) {
  if (!Array.isArray(snapshot.signals)) {
    throw new Error(`signals must be an array for ${snapshot.project}`);
  }

  if (snapshot.status !== 'unverified' && snapshot.signals.length === 0) {
    throw new Error(`${snapshot.status} evidence requires at least one signal for ${snapshot.project}`);
  }

  const identities = new Set();
  for (const signal of snapshot.signals) {
    requireObject(signal, `evidence signal for ${snapshot.project}`);

    if (!KIND_SET.has(signal.kind)) {
      throw new Error(`invalid signal kind for ${snapshot.project}: ${signal.kind}`);
    }
    if (!MODE_SET.has(signal.mode)) {
      throw new Error(`invalid signal mode for ${snapshot.project}: ${signal.mode}`);
    }
    if (!SIGNAL_STATE_SET.has(signal.state)) {
      throw new Error(`invalid signal state for ${snapshot.project}: ${signal.state}`);
    }

    if (signal.kind === 'manual' && signal.mode !== 'manual') {
      throw new Error(`manual signal must use manual mode for ${snapshot.project}`);
    }
    if (signal.kind !== 'manual' && signal.mode !== 'automated') {
      throw new Error(`${signal.kind} signal must use automated mode for ${snapshot.project}`);
    }

    requireNonEmptyString(signal.label, `signal label for ${snapshot.project}`);
    requireNonEmptyString(signal.scope, `signal scope for ${snapshot.project}`);

    if (!isValidIsoCalendarDate(signal.observedAt)) {
      throw new Error(`invalid observedAt date for ${snapshot.project}: ${signal.observedAt}`);
    }

    if (signal.url !== undefined) {
      if (typeof signal.url !== 'string' || !SAFE_EXTERNAL.test(signal.url)) {
        throw new Error(`invalid evidence url for ${snapshot.project}: ${signal.url}`);
      }
    }

    const identity = [signal.kind, normalizeKey(signal.label), signal.observedAt].join('|');
    if (identities.has(identity)) {
      throw new Error(`duplicate signal for ${snapshot.project}: ${signal.label}`);
    }
    identities.add(identity);
  }
}

export function validateProjectEvidence(snapshots, {projects} = {}) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) {
    throw new Error('project evidence registry must be a non-empty array');
  }
  if (!Array.isArray(projects)) {
    throw new Error('projects must be provided for project evidence validation');
  }

  const knownProjects = new Set(projects.map((project) => project?.slug).filter(Boolean));
  const projectSnapshots = new Set();

  for (const snapshot of snapshots) {
    requireObject(snapshot, 'project evidence snapshot');
    requireNonEmptyString(snapshot.project, 'project slug');

    if (!SLUG.test(snapshot.project)) {
      throw new Error(`invalid project slug: ${snapshot.project}`);
    }
    if (!knownProjects.has(snapshot.project)) {
      throw new Error(`unknown project reference: ${snapshot.project}`);
    }
    if (projectSnapshots.has(snapshot.project)) {
      throw new Error(`duplicate project snapshot: ${snapshot.project}`);
    }
    projectSnapshots.add(snapshot.project);

    if (!STATUS_SET.has(snapshot.status)) {
      throw new Error(`invalid project evidence status for ${snapshot.project}: ${snapshot.status}`);
    }

    if (snapshot.status !== 'unverified' && snapshot.lastVerified === undefined) {
      throw new Error(`lastVerified is required for ${snapshot.status} evidence: ${snapshot.project}`);
    }
    if (snapshot.lastVerified !== undefined && !isValidIsoCalendarDate(snapshot.lastVerified)) {
      throw new Error(`invalid lastVerified date for ${snapshot.project}: ${snapshot.lastVerified}`);
    }

    validateVersionFacts(snapshot);
    validateSignals(snapshot);
  }

  return snapshots;
}

export function loadProjectEvidence(manifestPath = DEFAULT_PROJECT_EVIDENCE_PATH, {projects} = {}) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`project evidence registry not found: ${manifestPath}`);
  }

  const snapshots = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return validateProjectEvidence(snapshots, {projects});
}

function renderVersions(versions) {
  if (versions.length === 0) return '';
  const rows = versions.map((version) => `<div class="tr-project-evidence__version">
    <dt>${escapeHtml(version.label)}</dt>
    <dd>${escapeHtml(version.value)}</dd>
  </div>`).join('\n');
  return `<dl class="tr-project-evidence__versions" aria-label="Проверенные версии и параметры">
${rows}
  </dl>`;
}

function renderSignal(signal) {
  const link = signal.url
    ? `<a class="tr-project-evidence__link" href="${escapeHtml(signal.url)}" target="_blank" rel="noopener noreferrer">Открыть доказательство ↗</a>`
    : '';

  return `<article class="tr-project-evidence__signal" data-evidence-kind="${signal.kind}" data-evidence-mode="${signal.mode}">
    <div class="tr-project-evidence__signal-head">
      <span class="tr-project-evidence__mode">${MODE_COPY[signal.mode]}</span>
      <time datetime="${signal.observedAt}">${signal.observedAt}</time>
    </div>
    <h4>${escapeHtml(signal.label)}</h4>
    <p class="tr-project-evidence__signal-state"><strong>Состояние:</strong> ${STATE_COPY[signal.state]}</p>
    <p class="tr-project-evidence__scope"><strong>Что подтверждает:</strong> ${escapeHtml(signal.scope)}</p>
    ${link}
  </article>`;
}

export function renderProjectEvidence(snapshot) {
  const project = escapeHtml(snapshot.project);
  const status = snapshot.status;
  const lastVerified = snapshot.lastVerified
    ? `<p class="tr-project-evidence__checked">Последняя проверка: <time datetime="${snapshot.lastVerified}">${snapshot.lastVerified}</time></p>`
    : '<p class="tr-project-evidence__checked">Дата текущей проверки не зафиксирована.</p>';
  const versions = renderVersions(snapshot.versions);
  const signals = snapshot.signals.length > 0
    ? `<div class="tr-project-evidence__signals" aria-label="Доказательства состояния проекта">
${snapshot.signals.map(renderSignal).join('\n')}
  </div>`
    : '<p class="tr-project-evidence__empty">Текущие доказательства состояния проекта не зафиксированы.</p>';

  return `<section class="tr-project-evidence tr-project-evidence--${status}" data-project-evidence="${project}" data-evidence-status="${status}" aria-labelledby="project-evidence-${project}-title">
  <header class="tr-project-evidence__header">
    <div>
      <p class="tr-project-evidence__eyebrow">Project Evidence</p>
      <h2 id="project-evidence-${project}-title">Проверяемое состояние проекта</h2>
    </div>
    <span class="tr-project-evidence__status">${STATUS_COPY[status]}</span>
  </header>
  ${lastVerified}
  ${versions}
  ${signals}
</section>`;
}

function evidencePlaceholderPattern(project, flags = 'i') {
  return new RegExp(
    `<div[^>]*data-tr-project-evidence=["']${project}["'][^>]*>\\s*</div>`,
    flags,
  );
}

function injectNoJavaScriptFallback(html, project, content) {
  const existing = new RegExp(`data-tr-project-evidence-noscript=["']${project}["']`, 'i');
  if (existing.test(html)) return html;

  const rootMarker = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
  if (!rootMarker.test(html)) {
    throw new Error(`Project Evidence could not place no-JavaScript fallback for ${project}: #root host not found.`);
  }

  const fallback = `<noscript data-tr-project-evidence-noscript="${project}">
  <div class="tr-project-evidence-noscript">
    ${content}
  </div>
</noscript>`;
  return html.replace(rootMarker, (rootHost) => `${rootHost}\n${fallback}`);
}

export function applyProjectEvidence(outputDir, snapshots, {requiredProjects = []} = {}) {
  if (!Array.isArray(snapshots)) {
    throw new Error('project evidence snapshots must be an array');
  }
  if (!Array.isArray(requiredProjects) || requiredProjects.some((project) => typeof project !== 'string' || !SLUG.test(project))) {
    throw new Error('requiredProjects must contain valid project slugs');
  }

  const byProject = new Map(snapshots.map((snapshot) => [snapshot.project, snapshot]));
  const targets = [];

  for (const project of requiredProjects) {
    const snapshot = byProject.get(project);
    if (!snapshot) throw new Error(`missing required project evidence: ${project}`);

    const relativePath = path.join('landing', 'projects', `${project}.html`);
    const htmlPath = path.join(outputDir, relativePath);
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`generated project page not found for evidence: ${relativePath.replaceAll(path.sep, '/')}`);
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const content = renderProjectEvidence(snapshot);
    let replacements = 0;
    const transformed = transformGeneratedContent(
      html,
      (contentHtml) => {
        const matches = contentHtml.match(evidencePlaceholderPattern(project, 'gi')) ?? [];
        if (matches.length === 0) return contentHtml;
        if (matches.length !== 1) {
          throw new Error(`Project Evidence requires exactly one placeholder for ${project}; found ${matches.length}.`);
        }
        replacements += 1;
        return contentHtml.replace(evidencePlaceholderPattern(project), content);
      },
      `Project Evidence for ${project}`,
    );

    if (!transformed.source || replacements !== 1) {
      throw new Error(`Project Evidence placeholder not found for required project: ${project}`);
    }

    const finalHtml = transformed.source === 'diplodoc-state'
      ? injectNoJavaScriptFallback(transformed.html, project, content)
      : transformed.html;
    fs.writeFileSync(htmlPath, finalHtml, 'utf8');
    targets.push(relativePath.replaceAll(path.sep, '/'));
  }

  return targets;
}
