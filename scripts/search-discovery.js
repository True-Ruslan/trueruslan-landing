import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {toPublicRoute} from './clean-urls.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_SEARCH_DISCOVERY_POLICY = path.join(ROOT, 'data', 'search-discovery.json');

const SAFE_HTML_PATH = /^(?!\/)(?!.*\.\.)(?!.*\\)(?![a-z][a-z\d+.-]*:)[a-zA-Z0-9_./-]+\.html$/;
const ID = /^[a-z0-9][a-z0-9-]*$/;

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function cleanPublicRoute(sourcePath, siteUrl) {
  const projected = toPublicRoute(sourcePath, siteUrl);
  if (projected === './') return '/';
  const withoutDot = projected.startsWith('./') ? projected.slice(2) : projected;
  return withoutDot.startsWith('/') ? withoutDot : `/${withoutDot}`;
}

export function validateSearchDiscoveryPolicy(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Search discovery policy must be an object');
  }
  if (raw.schemaVersion !== 1) throw new Error('Search discovery schemaVersion must be 1');
  if (raw.evidenceClass !== 'repository-readiness') {
    throw new Error('Search discovery evidenceClass must be repository-readiness');
  }
  if (raw.externalEvidence !== 'not-collected') {
    throw new Error('Search discovery externalEvidence must remain not-collected in P4.1A');
  }
  if (!Array.isArray(raw.surfaces) || raw.surfaces.length === 0) {
    throw new Error('Search discovery surfaces must be a non-empty array');
  }

  const ids = new Set();
  const locators = new Set();
  const surfaces = raw.surfaces.map((surface) => {
    const id = requireString(surface?.id, 'Search discovery surface id');
    const role = requireString(surface?.role, `Search discovery role for ${id}`);
    const intentClass = requireString(surface?.intentClass, `Search discovery intentClass for ${id}`);
    if (!ID.test(id)) throw new Error(`Invalid search discovery surface id: ${id}`);
    if (!ID.test(role)) throw new Error(`Invalid search discovery role for ${id}: ${role}`);
    if (!ID.test(intentClass)) throw new Error(`Invalid search discovery intentClass for ${id}: ${intentClass}`);
    if (ids.has(id)) throw new Error(`Duplicate search discovery surface id: ${id}`);
    ids.add(id);

    const hasI18n = typeof surface.i18nId === 'string' && surface.i18nId.trim().length > 0;
    const hasPath = typeof surface.path === 'string' && surface.path.trim().length > 0;
    if (hasI18n === hasPath) {
      throw new Error(`Search discovery surface ${id} must define exactly one of i18nId or path`);
    }

    if (hasI18n) {
      const i18nId = surface.i18nId.trim();
      if (!ID.test(i18nId)) throw new Error(`Invalid search discovery i18nId for ${id}: ${i18nId}`);
      const locator = `i18n:${i18nId}`;
      if (locators.has(locator)) throw new Error(`Duplicate search discovery locator: ${locator}`);
      locators.add(locator);
      return {id, role, intentClass, i18nId};
    }

    const directPath = surface.path.trim();
    if (!SAFE_HTML_PATH.test(directPath) || path.posix.normalize(directPath) !== directPath) {
      throw new Error(`Unsafe search discovery path for ${id}: ${directPath}`);
    }
    const locator = `path:${directPath}`;
    if (locators.has(locator)) throw new Error(`Duplicate search discovery locator: ${locator}`);
    locators.add(locator);
    return {id, role, intentClass, path: directPath};
  });

  return {
    schemaVersion: 1,
    evidenceClass: 'repository-readiness',
    externalEvidence: 'not-collected',
    surfaces,
  };
}

export function loadSearchDiscoveryPolicy(policyPath = DEFAULT_SEARCH_DISCOVERY_POLICY) {
  return validateSearchDiscoveryPolicy(JSON.parse(fs.readFileSync(policyPath, 'utf8')));
}

function addFinding(findings, code, message, context = {}) {
  findings.push({code, message, ...context});
}

function resolveSurfacePaths(surface, i18nById, findings) {
  if (surface.path) return [{locale: 'ru', sourcePath: surface.path}];
  const pair = i18nById.get(surface.i18nId);
  if (!pair) {
    addFinding(findings, 'missing-i18n-pair', `Missing canonical i18n pair ${surface.i18nId} for ${surface.id}`, {
      surfaceId: surface.id,
      i18nId: surface.i18nId,
    });
    return [];
  }
  return [
    {locale: 'ru', sourcePath: pair.ru},
    {locale: 'en', sourcePath: pair.en},
  ];
}

function duplicateFindings(routes, field, code, findings) {
  const owners = new Map();
  for (const route of routes) {
    const value = route[field];
    if (!value) continue;
    const normalized = value.trim().toLocaleLowerCase('en-US');
    const existing = owners.get(normalized);
    if (!existing) {
      owners.set(normalized, route);
      continue;
    }
    if (existing.surfaceId === route.surfaceId) continue;
    addFinding(findings, code, `Strategic routes ${existing.sourcePath} and ${route.sourcePath} share ${field}`, {
      sourcePath: route.sourcePath,
      conflictingPath: existing.sourcePath,
    });
  }
}

export function buildSearchDiscoveryReadiness({policy, pageMeta, i18n, siteUrl}) {
  const validatedPolicy = validateSearchDiscoveryPolicy(policy);
  if (!Array.isArray(pageMeta)) throw new Error('pageMeta must be an array');
  if (!Array.isArray(i18n)) throw new Error('i18n must be an array');
  const normalizedSiteUrl = requireString(siteUrl, 'siteUrl').replace(/\/$/, '');

  const metaByPath = new Map(pageMeta.map((entry) => [entry.path, entry]));
  const i18nById = new Map(i18n.map((pair) => [pair.id, pair]));
  const findings = [];
  const routes = [];

  for (const surface of validatedPolicy.surfaces) {
    const resolvedPaths = resolveSurfacePaths(surface, i18nById, findings);
    for (const {locale, sourcePath} of resolvedPaths) {
      const meta = metaByPath.get(sourcePath);
      if (!meta) {
        addFinding(findings, 'missing-page-meta', `Missing canonical page metadata for ${sourcePath}`, {
          surfaceId: surface.id,
          sourcePath,
        });
        continue;
      }

      const publicRoute = cleanPublicRoute(sourcePath, normalizedSiteUrl);
      if (/\.html(?:$|[?#])/.test(publicRoute) || publicRoute.startsWith('/landing/')) {
        addFinding(findings, 'non-clean-public-route', `Strategic route did not project to a clean public route: ${sourcePath}`, {
          surfaceId: surface.id,
          sourcePath,
          publicRoute,
        });
      }

      routes.push({
        surfaceId: surface.id,
        role: surface.role,
        intentClass: surface.intentClass,
        locale,
        sourcePath,
        publicRoute,
        title: meta.title,
        description: meta.description,
      });
    }
  }

  duplicateFindings(routes, 'title', 'duplicate-title', findings);
  duplicateFindings(routes, 'description', 'duplicate-description', findings);

  findings.sort((a, b) => `${a.code}:${a.sourcePath || a.surfaceId || ''}`.localeCompare(`${b.code}:${b.sourcePath || b.surfaceId || ''}`));
  routes.sort((a, b) => `${a.surfaceId}:${a.locale}:${a.sourcePath}`.localeCompare(`${b.surfaceId}:${b.locale}:${b.sourcePath}`));

  return {
    schemaVersion: 1,
    evidenceClass: validatedPolicy.evidenceClass,
    externalEvidence: validatedPolicy.externalEvidence,
    generatedFrom: {
      metadataOwner: 'data/page-meta.json',
      i18nOwner: 'data/i18n.json',
      discoveryPolicy: 'data/search-discovery.json',
    },
    ready: findings.length === 0,
    summary: {
      surfaces: validatedPolicy.surfaces.length,
      routes: routes.length,
      findings: findings.length,
    },
    routes,
    findings,
  };
}

export function renderSearchDiscoveryMarkdown(report) {
  const status = report.ready ? 'READY' : 'NOT READY';
  const lines = [
    '# P4.1A Search Discovery Readiness',
    '',
    `Status: **${status}**`,
    `Evidence class: \`${report.evidenceClass}\``,
    `External evidence: ${report.externalEvidence}`,
    '',
    'This repository-readiness report does not contain Search Console or Yandex Webmaster performance observations.',
    'It verifies only canonical repository structure and must not be interpreted as search-performance evidence.',
    '',
    `Strategic surfaces: ${report.summary.surfaces}`,
    `Resolved routes: ${report.summary.routes}`,
    `Findings: ${report.summary.findings}`,
    '',
    '## Routes',
    '',
    '| Surface | Locale | Public route | Metadata |',
    '| --- | --- | --- | --- |',
    ...report.routes.map((route) => `| ${route.surfaceId} | ${route.locale} | \`${route.publicRoute}\` | ${route.title} |`),
    '',
    '## Findings',
    '',
  ];

  if (report.findings.length === 0) lines.push('No structural search-discovery findings.');
  else for (const finding of report.findings) lines.push(`- **${finding.code}** — ${finding.message}`);
  lines.push('');
  return lines.join('\n');
}
