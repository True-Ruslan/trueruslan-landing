import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

import {transformGeneratedContent} from './diplodoc-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export const DEFAULT_COLLABORATION_PATH = path.join(ROOT, 'data', 'collaboration.json');
export const AVAILABILITY_VALUES = Object.freeze(['available', 'limited', 'consulting-only', 'unavailable']);
export const COLLABORATION_CATEGORIES = Object.freeze(['engineering', 'ai-integration', 'education', 'expert-content']);

const AVAILABILITY_SET = new Set(AVAILABILITY_VALUES);
const CATEGORY_SET = new Set(COLLABORATION_CATEGORIES);
const SAFE_LOCAL_HTML = /^(?!\/)(?!.*\.\.)(?!.*\\)(?![a-z][a-z\d+.-]*:)[a-zA-Z0-9_./-]+\.html$/;
const TELEGRAM_URL = /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ROOT_FIELDS = new Set(['updated', 'availability', 'contact', 'pricing', 'legalFormat', 'contextualTargets']);
const PAGE_TARGETS = Object.freeze([
  Object.freeze({path: 'landing/work-with-me.html', locale: 'ru'}),
  Object.freeze({path: 'en/work-with-me.html', locale: 'en'}),
]);

const COPY = Object.freeze({
  ru: Object.freeze({
    availabilityLabel: 'Текущая доступность',
    engineering: 'Engineering',
    education: 'Teaching & Mentoring',
    updated: 'Обновлено вручную',
    status: Object.freeze({
      available: 'доступен',
      limited: 'ограниченная доступность',
      'consulting-only': 'только консультации',
      unavailable: 'временно недоступен',
    }),
    handoffTitle: 'Описать задачу',
    handoffIntro: 'Напишите контекст, желаемый результат и важные ограничения. Я отвечу напрямую и предложу следующий осмысленный шаг.',
    telegram: 'Написать в Telegram',
    email: 'Написать по email',
    estimate: 'Срок и стоимость обсуждаются после уточнения результата и границ задачи.',
    legal: 'При необходимости могу оформить работу как самозанятый с чеком.',
    bridgeEyebrow: 'COLLABORATION',
    bridgeTitle: 'Работа со мной',
    bridgeText: 'Если мой подход и доказанные инженерные границы подходят вашей задаче, можно перейти к короткому прямому обсуждению без формы и промежуточной CRM.',
    bridgeCta: 'Посмотреть форматы работы →',
    contextual: Object.freeze({
      engineering: 'Нужен похожий инженерный разбор или реализация?',
      'ai-integration': 'Нужна надёжная AI-интеграция с явными границами?',
      education: 'Нужен разбор, наставничество или учебный формат?',
      'expert-content': 'Нужен технический материал или экспертный вклад?',
    }),
    contextualCta: 'Обсудить задачу →',
  }),
  en: Object.freeze({
    availabilityLabel: 'Current availability',
    engineering: 'Engineering',
    education: 'Teaching & Mentoring',
    updated: 'Manually updated',
    status: Object.freeze({
      available: 'available',
      limited: 'limited availability',
      'consulting-only': 'consulting only',
      unavailable: 'currently unavailable',
    }),
    handoffTitle: 'Describe the task',
    handoffIntro: 'Send the context, desired outcome and important constraints. I will reply directly and suggest the next useful step.',
    telegram: 'Message on Telegram',
    email: 'Send an email',
    estimate: 'Timing and cost are proposed after the outcome and scope are clear.',
    legal: 'For relevant engagements I can work as a registered self-employed professional and provide a receipt.',
    bridgeEyebrow: 'COLLABORATION',
    bridgeTitle: 'Work with me',
    bridgeText: 'If my engineering approach and evidence boundaries fit your problem, we can move to a short direct conversation without a form or intermediary CRM.',
    bridgeCta: 'See ways to work together →',
    contextual: Object.freeze({
      engineering: 'Need a similar engineering review or implementation?',
      'ai-integration': 'Need a reliable AI integration with explicit boundaries?',
      education: 'Need mentoring, a technical review or an educational format?',
      'expert-content': 'Need technical content or an expert contribution?',
    }),
    contextualCta: 'Discuss the task →',
  }),
});

function requirePlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function assertExactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`unknown ${label} field: ${key}`);
  }
}

function isRealIsoDate(value) {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function localeCopy(locale) {
  const copy = COPY[locale];
  if (!copy) throw new Error(`unsupported collaboration locale: ${locale}`);
  return copy;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function validateAvailability(value) {
  requirePlainObject(value, 'collaboration availability');
  assertExactKeys(value, new Set(['engineering', 'education']), 'collaboration availability');
  for (const field of ['engineering', 'education']) {
    if (!AVAILABILITY_SET.has(value[field])) {
      throw new Error(`unknown collaboration availability for ${field}: ${value[field]}`);
    }
  }
}

function validateContact(value) {
  requirePlainObject(value, 'collaboration contact');
  assertExactKeys(value, new Set(['telegram', 'email']), 'collaboration contact');
  if (typeof value.telegram !== 'string' || !TELEGRAM_URL.test(value.telegram)) {
    throw new Error(`invalid collaboration Telegram: ${value.telegram}`);
  }
  if (typeof value.email !== 'string' || !EMAIL.test(value.email)) {
    throw new Error(`invalid collaboration email: ${value.email}`);
  }
}

function validateContextualTargets(value) {
  requirePlainObject(value, 'collaboration contextualTargets');
  for (const [target, category] of Object.entries(value)) {
    if (!SAFE_LOCAL_HTML.test(target) || path.posix.normalize(target) !== target) {
      throw new Error(`unsafe collaboration target: ${target}`);
    }
    if (!CATEGORY_SET.has(category)) {
      throw new Error(`unknown collaboration category for ${target}: ${category}`);
    }
  }
}

function readRequiredUtf8File(filePath, message) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(message);
    throw error;
  }
}

function placeholderPattern(kind, context = null, flags = 'i') {
  const contextPart = context ? `=["']${context}["']` : '(?:=["'][^"']+["'])?';
  return new RegExp(`<div[^>]*data-tr-collaboration-${kind}${contextPart}[^>]*>\\s*</div>`, flags);
}

function injectNoJavaScriptFallback(html, key, content) {
  if (html.includes(`data-tr-collaboration-noscript="${key}"`)) return html;
  const rootMarker = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
  if (!rootMarker.test(html)) return html;
  return html.replace(
    rootMarker,
    (rootHost) => `${rootHost}\n<noscript data-tr-collaboration-noscript="${key}">${content}</noscript>`,
  );
}

function replaceGeneratedPlaceholder(html, {kind, context = null, content, label, fallbackKey}) {
  let replacements = 0;
  const transformed = transformGeneratedContent(
    html,
    (contentHtml) => {
      const pattern = placeholderPattern(kind, context, 'gi');
      const matches = contentHtml.match(pattern) ?? [];
      if (matches.length === 0) return contentHtml;
      if (matches.length !== 1) throw new Error(`${label} requires exactly one placeholder; found ${matches.length}.`);
      replacements += 1;
      return contentHtml.replace(placeholderPattern(kind, context), content);
    },
    label,
  );
  if (!transformed.source || replacements !== 1) throw new Error(`${label} placeholder not found.`);
  return transformed.source === 'diplodoc-state'
    ? injectNoJavaScriptFallback(transformed.html, fallbackKey, content)
    : transformed.html;
}

function nodeHasClass(node, className) {
  const value = node.attrs?.find((attribute) => attribute.name === 'class')?.value ?? '';
  return value.split(/\s+/).includes(className);
}

function findNode(root, predicate) {
  if (predicate(root)) return root;
  for (const child of root.childNodes ?? []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

function appendCtaToDocument(html, cta) {
  if (html.includes('data-tr-contextual-collaboration="true"')) return {html, appended: false};
  const document = parse(html);
  const main = findNode(document, (node) => node.nodeName === 'main' && nodeHasClass(node, 'dc-doc-page__content'));
  if (!main) return {html, appended: false};
  const fragment = parse(`<body>${cta}</body>`);
  const body = findNode(fragment, (node) => node.nodeName === 'body');
  for (const child of [...(body?.childNodes ?? [])]) utils.append(main, child);
  return {html: serialize(document), appended: true};
}

function appendCtaToState(html, cta, label) {
  let appended = false;
  const transformed = transformGeneratedContent(
    html,
    (contentHtml, {source}) => {
      if (source !== 'diplodoc-state') return contentHtml;
      if (contentHtml.includes('data-tr-contextual-collaboration="true"')) return contentHtml;
      appended = true;
      return `${contentHtml}\n${cta}`;
    },
    label,
  );
  return {html: transformed.html, appended};
}

function relativeWorkWithMeHref(targetPath, locale) {
  const destination = locale === 'en' ? 'en/work-with-me.html' : 'landing/work-with-me.html';
  const relative = path.posix.relative(path.posix.dirname(targetPath), destination);
  return relative || path.posix.basename(destination);
}

export function validateCollaboration(value) {
  requirePlainObject(value, 'collaboration manifest');
  assertExactKeys(value, ROOT_FIELDS, 'collaboration');

  if (!isRealIsoDate(value.updated)) throw new Error(`invalid collaboration updated date: ${value.updated}`);
  validateAvailability(value.availability);
  validateContact(value.contact);
  if (value.pricing !== 'estimate-only') {
    throw new Error(`unsupported collaboration pricing policy: ${value.pricing}`);
  }
  if (value.legalFormat !== 'self-employed-receipt-supported') {
    throw new Error(`unsupported collaboration legal format: ${value.legalFormat}`);
  }
  validateContextualTargets(value.contextualTargets);

  return value;
}

export function loadCollaboration(manifestPath = DEFAULT_COLLABORATION_PATH) {
  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`collaboration manifest not found: ${manifestPath}`);
    throw error;
  }
  return validateCollaboration(JSON.parse(raw));
}

export function resolveContextualCollaboration(collaboration, target) {
  const validated = validateCollaboration(collaboration);
  if (typeof target !== 'string' || !SAFE_LOCAL_HTML.test(target) || path.posix.normalize(target) !== target) {
    return null;
  }
  const category = validated.contextualTargets[target];
  return category ? {target, category} : null;
}

export function renderCollaborationAvailability(collaboration, {locale = 'ru'} = {}) {
  const value = validateCollaboration(collaboration);
  const copy = localeCopy(locale);
  const row = (key, label) => {
    const state = value.availability[key];
    return `<li class="tr-collaboration-availability__item" data-area="${key}" data-status="${state}"><span>${label}</span><strong>${copy.status[state]}</strong></li>`;
  };
  return `<section class="tr-collaboration-availability" data-tr-collaboration-rendered="availability" lang="${locale}" aria-label="${copy.availabilityLabel}">
  <p class="tr-collaboration-kicker">${copy.availabilityLabel}</p>
  <ul>
    ${row('engineering', copy.engineering)}
    ${row('education', copy.education)}
  </ul>
  <p class="tr-collaboration-updated">${copy.updated}: <time datetime="${value.updated}">${value.updated}</time></p>
</section>`;
}

export function renderCollaborationHandoff(collaboration, {locale = 'ru'} = {}) {
  const value = validateCollaboration(collaboration);
  const copy = localeCopy(locale);
  const telegram = escapeHtml(value.contact.telegram);
  const email = escapeHtml(value.contact.email);
  return `<section class="tr-collaboration-handoff" data-tr-collaboration-rendered="handoff" lang="${locale}">
  <h2>${copy.handoffTitle}</h2>
  <p>${copy.handoffIntro}</p>
  <div class="tr-collaboration-actions">
    <a class="tr-collaboration-action tr-collaboration-action--primary" href="${telegram}">${copy.telegram}</a>
    <a class="tr-collaboration-action" href="mailto:${email}">${copy.email}</a>
  </div>
  <p class="tr-collaboration-boundary">${copy.estimate}</p>
  <p class="tr-collaboration-boundary">${copy.legal}</p>
</section>`;
}

export function renderHomepageCollaborationBridge(collaboration, {locale = 'ru'} = {}) {
  const value = validateCollaboration(collaboration);
  const copy = localeCopy(locale);
  const href = locale === 'en' ? 'en/work-with-me.html' : 'landing/work-with-me.html';
  return `<section class="tr-home-section tr-home-collaboration" data-home-collaboration="true" aria-labelledby="home-collaboration-${locale}-title">
  <div class="tr-home-section-head">
    <p class="tr-collaboration-kicker">${copy.bridgeEyebrow}</p>
    <h2 id="home-collaboration-${locale}-title">${copy.bridgeTitle}</h2>
    <p>${copy.bridgeText}</p>
  </div>
  <div class="tr-home-collaboration__meta">
    <span data-status="${value.availability.engineering}">${copy.engineering}: ${copy.status[value.availability.engineering]}</span>
    <span data-status="${value.availability.education}">${copy.education}: ${copy.status[value.availability.education]}</span>
  </div>
  <a class="tr-home-collaboration__cta" href="${href}">${copy.bridgeCta}</a>
</section>`;
}

export function renderContextualCollaborationCta(collaboration, {locale = 'ru', category, href}) {
  const value = validateCollaboration(collaboration);
  const copy = localeCopy(locale);
  if (!CATEGORY_SET.has(category)) throw new Error(`unknown collaboration category: ${category}`);
  if (typeof href !== 'string' || !href.trim() || href.includes('://')) throw new Error(`unsafe contextual collaboration href: ${href}`);
  return `<aside class="tr-contextual-collaboration" data-tr-contextual-collaboration="true" data-category="${category}" lang="${locale}">
  <strong>${copy.contextual[category]}</strong>
  <a href="${escapeHtml(href)}">${copy.contextualCta}</a>
</aside>`;
}

export function resolveContextualCollaborationTargets(collaboration, i18nPairs = []) {
  const value = validateCollaboration(collaboration);
  if (!Array.isArray(i18nPairs)) throw new Error('i18nPairs must be an array');
  const enByRu = new Map(i18nPairs.map((pair) => [pair.ru, pair.en]));
  const ru = Object.entries(value.contextualTargets).map(([target, category]) => ({path: target, category}));
  const en = ru.flatMap(({path: ruPath, category}) => {
    const enPath = enByRu.get(ruPath);
    return enPath ? [{path: enPath, category}] : [];
  });
  return {ru, en};
}

export function applyCollaborationPages(outputDir, collaboration) {
  const value = validateCollaboration(collaboration);
  const updated = [];
  for (const target of PAGE_TARGETS) {
    const htmlPath = path.join(outputDir, ...target.path.split('/'));
    let html = readRequiredUtf8File(htmlPath, `generated collaboration page not found: ${target.path}`);
    html = replaceGeneratedPlaceholder(html, {
      kind: 'availability',
      content: renderCollaborationAvailability(value, {locale: target.locale}),
      label: `collaboration availability for ${target.path}`,
      fallbackKey: `availability-${target.locale}`,
    });
    html = replaceGeneratedPlaceholder(html, {
      kind: 'handoff',
      content: renderCollaborationHandoff(value, {locale: target.locale}),
      label: `collaboration handoff for ${target.path}`,
      fallbackKey: `handoff-${target.locale}`,
    });
    fs.writeFileSync(htmlPath, html, 'utf8');
    updated.push(target.path);
  }

  const contactsPath = 'landing/contacts.html';
  const contactsHtmlPath = path.join(outputDir, ...contactsPath.split('/'));
  let contactsHtml = readRequiredUtf8File(contactsHtmlPath, `generated contacts page not found: ${contactsPath}`);
  contactsHtml = replaceGeneratedPlaceholder(contactsHtml, {
    kind: 'handoff',
    context: 'contacts',
    content: renderCollaborationHandoff(value, {locale: 'ru'}),
    label: 'collaboration handoff for Contacts',
    fallbackKey: 'handoff-contacts-ru',
  });
  fs.writeFileSync(contactsHtmlPath, contactsHtml, 'utf8');
  updated.push(contactsPath);
  return updated;
}

export function applyContextualCollaborationCtas(outputDir, collaboration, i18nPairs = []) {
  const value = validateCollaboration(collaboration);
  const targets = resolveContextualCollaborationTargets(value, i18nPairs);
  const updated = [];

  for (const [locale, entries] of Object.entries(targets)) {
    for (const entry of entries) {
      const htmlPath = path.join(outputDir, ...entry.path.split('/'));
      let html = readRequiredUtf8File(htmlPath, `generated contextual collaboration target not found: ${entry.path}`);
      const cta = renderContextualCollaborationCta(value, {
        locale,
        category: entry.category,
        href: relativeWorkWithMeHref(entry.path, locale),
      });
      const stateResult = appendCtaToState(html, cta, `contextual collaboration for ${entry.path}`);
      const documentResult = appendCtaToDocument(stateResult.html, cta);
      if (!stateResult.appended && !documentResult.appended) {
        throw new Error(`contextual collaboration content container not found: ${entry.path}`);
      }
      fs.writeFileSync(htmlPath, documentResult.html, 'utf8');
      updated.push(entry.path);
    }
  }

  return updated;
}
