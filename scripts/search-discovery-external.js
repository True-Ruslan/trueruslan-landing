const SOURCES = new Set(['google-search-console', 'yandex-webmaster']);
const COLLECTION_METHODS = new Set(['export', 'api']);
const KINDS = new Set(['performance', 'indexing']);
const DIMENSIONS = new Set(['query', 'page']);
const INDEX_STATES = new Set(['indexed', 'not-indexed', 'excluded', 'unknown']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value;
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function requireEnum(value, allowed, label) {
  const normalized = requireString(value, label);
  if (!allowed.has(normalized)) throw new Error(`${label} is unsupported: ${normalized}`);
  return normalized;
}

function requireKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  }
}

function requireIsoDate(value, label) {
  const normalized = requireString(value, label);
  if (!ISO_DATE.test(normalized) || Number.isNaN(Date.parse(`${normalized}T00:00:00Z`))) {
    throw new Error(`${label} must be an ISO date`);
  }
  return normalized;
}

function requireCollectedAt(value) {
  const normalized = requireString(value, 'collectedAt');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw new Error('collectedAt must be a valid ISO timestamp');
  return date.toISOString();
}

function requireIntegerMetric(value, label) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer`);
  return value;
}

function requireFiniteMetric(value, label, {min = 0, max = Number.POSITIVE_INFINITY} = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} must be a finite number between ${min} and ${max}`);
  }
  return value;
}

function normalizeSiteUrl(siteUrl) {
  const value = requireString(siteUrl, 'siteUrl');
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('siteUrl must be an absolute URL');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('siteUrl must be a credential-free HTTPS URL without query or fragment');
  }
  return new URL('/', url);
}

function normalizeSameOriginUrl(value, site, label) {
  const normalized = requireString(value, label);
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`${label} must be an absolute URL`);
  }
  if (url.protocol !== 'https:' || url.origin !== site.origin) {
    throw new Error(`${label} must belong to the configured property origin ${site.origin}`);
  }
  if (url.username || url.password || url.hash) throw new Error(`${label} must not contain credentials or fragments`);
  return url.toString();
}

function normalizeWindow(raw, collectedDate, label) {
  const value = requireObject(raw, `${label} window`);
  requireKeys(value, new Set(['start', 'end']), `${label} window`);
  const start = requireIsoDate(value.start, `${label} window start`);
  const end = requireIsoDate(value.end, `${label} window end`);
  if (start > end) throw new Error(`${label} window start must not be after end`);
  if (end > collectedDate) throw new Error(`${label} window end must not be after collectedAt`);
  return {start, end};
}

function normalizePerformanceRow(raw, site, label) {
  const row = requireObject(raw, label);
  requireKeys(row, new Set(['dimension', 'value', 'clicks', 'impressions', 'ctr', 'position']), label);
  const dimension = requireEnum(row.dimension, DIMENSIONS, `${label} dimension`);
  const rawValue = requireString(row.value, `${label} value`);
  const value = dimension === 'page' ? normalizeSameOriginUrl(rawValue, site, `${label} page value`) : rawValue;
  const clicks = requireIntegerMetric(row.clicks, `${label} clicks`);
  const impressions = requireIntegerMetric(row.impressions, `${label} impressions`);
  if (clicks > impressions) throw new Error(`${label} clicks must not exceed impressions`);
  const normalized = {dimension, value, clicks, impressions};
  if (row.ctr !== undefined) normalized.ctr = requireFiniteMetric(row.ctr, `${label} ctr`, {min: 0, max: 1});
  if (row.position !== undefined) normalized.position = requireFiniteMetric(row.position, `${label} position`);
  return normalized;
}

function normalizeIndexingRow(raw, site, label) {
  const row = requireObject(raw, label);
  requireKeys(row, new Set(['url', 'state', 'canonicalUrl', 'reason']), label);
  const normalized = {
    url: normalizeSameOriginUrl(row.url, site, `${label} url`),
    state: requireEnum(row.state, INDEX_STATES, `${label} state`),
  };
  if (row.canonicalUrl !== undefined) {
    normalized.canonicalUrl = normalizeSameOriginUrl(row.canonicalUrl, site, `${label} canonicalUrl`);
  }
  if (row.reason !== undefined) normalized.reason = requireString(row.reason, `${label} reason`);
  return normalized;
}

export function validateExternalSearchEvidence(raw, {siteUrl = 'https://trueruslan.ru'} = {}) {
  const input = requireObject(raw, 'External search evidence');
  requireKeys(input, new Set(['schemaVersion', 'evidenceClass', 'property', 'collectedAt', 'observations']), 'External search evidence');
  if (input.schemaVersion !== 1) throw new Error('External search evidence schemaVersion must be 1');
  if (input.evidenceClass !== 'external-search-observations') {
    throw new Error('External search evidence evidenceClass must be external-search-observations');
  }

  const site = normalizeSiteUrl(siteUrl);
  const property = normalizeSameOriginUrl(input.property, site, 'property');
  const propertyUrl = new URL(property);
  if (propertyUrl.pathname !== '/' || propertyUrl.search || propertyUrl.hash) {
    throw new Error('property must identify the root URL-prefix property');
  }
  const collectedAt = requireCollectedAt(input.collectedAt);
  const collectedDate = collectedAt.slice(0, 10);
  if (!Array.isArray(input.observations) || input.observations.length === 0) {
    throw new Error('External search evidence observations must be a non-empty array');
  }

  const observations = input.observations.map((rawObservation, observationIndex) => {
    const label = `observation ${observationIndex + 1}`;
    const observation = requireObject(rawObservation, label);
    requireKeys(observation, new Set(['source', 'collectionMethod', 'kind', 'window', 'rows']), label);
    const source = requireEnum(observation.source, SOURCES, `${label} source`);
    const collectionMethod = requireEnum(observation.collectionMethod, COLLECTION_METHODS, `${label} collectionMethod`);
    const kind = requireEnum(observation.kind, KINDS, `${label} kind`);
    const window = normalizeWindow(observation.window, collectedDate, label);
    if (!Array.isArray(observation.rows) || observation.rows.length === 0) throw new Error(`${label} rows must be a non-empty array`);
    const rows = observation.rows.map((row, rowIndex) => (
      kind === 'performance'
        ? normalizePerformanceRow(row, site, `${label} performance row ${rowIndex + 1}`)
        : normalizeIndexingRow(row, site, `${label} indexing row ${rowIndex + 1}`)
    ));
    return {source, collectionMethod, kind, window, rows};
  });

  return {
    schemaVersion: 1,
    evidenceClass: 'external-search-observations',
    property: site.toString(),
    collectedAt,
    observations,
  };
}

function routeFromUrl(value) {
  const url = new URL(value);
  return `${url.pathname}${url.search}`;
}

function routeClass(value) {
  const url = new URL(value);
  if (/\.html$/i.test(url.pathname)) return 'legacy-html';
  if (url.pathname === '/' || url.pathname.endsWith('/')) return 'clean';
  return 'other';
}

function localeForUrl(value) {
  const pathname = new URL(value).pathname;
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ru';
}

function strategicMap(routes) {
  const map = new Map();
  for (const route of routes || []) {
    if (!route || typeof route.publicRoute !== 'string') continue;
    map.set(route.publicRoute, {surfaceId: route.surfaceId ?? null, locale: route.locale ?? null});
  }
  return map;
}

function finding(code, message, details = {}) {
  return {code, message, ...details};
}

function summarizeLocale(pageRows) {
  const summary = {
    ru: {clicks: 0, impressions: 0, rows: 0},
    en: {clicks: 0, impressions: 0, rows: 0},
  };
  for (const row of pageRows) {
    if (routeClass(row.value) !== 'clean') continue;
    const locale = localeForUrl(row.value);
    summary[locale].clicks += row.clicks;
    summary[locale].impressions += row.impressions;
    summary[locale].rows += 1;
  }
  return summary;
}

function topRows(rows, limit = 20) {
  return [...rows]
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || a.value.localeCompare(b.value, 'en'))
    .slice(0, limit);
}

export function buildExternalSearchEvidenceReport({input, strategicRoutes = [], siteUrl = 'https://trueruslan.ru'} = {}) {
  const normalized = validateExternalSearchEvidence(input, {siteUrl});
  const routes = strategicMap(strategicRoutes);
  const performanceObservations = normalized.observations.filter(({kind}) => kind === 'performance');
  const indexingObservations = normalized.observations.filter(({kind}) => kind === 'indexing');
  const performanceRows = performanceObservations.flatMap((observation) => observation.rows.map((row) => ({...row, source: observation.source, window: observation.window})));
  const indexingRows = indexingObservations.flatMap((observation) => observation.rows.map((row) => ({...row, source: observation.source, window: observation.window})));
  const queryRows = performanceRows.filter(({dimension}) => dimension === 'query');
  const pageRows = performanceRows.filter(({dimension}) => dimension === 'page');
  const cleanPageRows = pageRows.filter(({value}) => routeClass(value) === 'clean');
  const legacyHtmlRows = pageRows.filter(({value}) => routeClass(value) === 'legacy-html');
  const findings = [];

  for (const row of legacyHtmlRows) {
    if (row.clicks === 0 && row.impressions === 0) continue;
    findings.push(finding('legacy-html-performance', `Legacy .html URL has external search visibility: ${routeFromUrl(row.value)}`, {
      source: row.source,
      route: routeFromUrl(row.value),
      clicks: row.clicks,
      impressions: row.impressions,
    }));
  }

  for (const row of indexingRows) {
    const route = new URL(row.url).pathname;
    const strategic = routes.get(route);
    if (strategic && row.state !== 'indexed') {
      findings.push(finding('strategic-route-not-indexed', `Strategic route is not reported as indexed: ${route}`, {
        source: row.source,
        route,
        surfaceId: strategic.surfaceId,
        locale: strategic.locale,
        state: row.state,
        ...(row.reason ? {reason: row.reason} : {}),
      }));
    }
    if (row.canonicalUrl && new URL(row.canonicalUrl).pathname !== route) {
      findings.push(finding('canonical-mismatch', `Observed canonical differs from inspected URL: ${route}`, {
        source: row.source,
        route,
        canonicalRoute: new URL(row.canonicalUrl).pathname,
      }));
    }
  }

  findings.sort((a, b) => `${a.code}:${a.route ?? ''}`.localeCompare(`${b.code}:${b.route ?? ''}`, 'en'));
  const sources = [...new Set(normalized.observations.map(({source}) => source))].sort();
  const starts = normalized.observations.map(({window}) => window.start).sort();
  const ends = normalized.observations.map(({window}) => window.end).sort();
  const indexingIssues = indexingRows.filter(({state, canonicalUrl, url}) => (
    state !== 'indexed' || (canonicalUrl && new URL(canonicalUrl).pathname !== new URL(url).pathname)
  )).length;

  return {
    schemaVersion: 1,
    evidenceClass: 'external-search-observations',
    externalEvidence: 'collected',
    provenance: 'operator-supplied-read-only',
    property: normalized.property,
    collectedAt: normalized.collectedAt,
    observationWindow: {start: starts[0], end: ends.at(-1)},
    summary: {
      sources: sources.length,
      observations: normalized.observations.length,
      performanceRows: performanceRows.length,
      indexingRows: indexingRows.length,
      nonzeroQueries: queryRows.filter(({clicks, impressions}) => clicks > 0 || impressions > 0).length,
      nonzeroPages: cleanPageRows.filter(({clicks, impressions}) => clicks > 0 || impressions > 0).length,
      cleanPageRows: cleanPageRows.length,
      legacyHtmlPageRows: legacyHtmlRows.length,
      indexingIssues,
    },
    sources,
    localePerformance: summarizeLocale(pageRows),
    topQueries: topRows(queryRows),
    topPages: topRows(pageRows),
    indexing: indexingRows,
    findings,
    boundaries: {
      p36: 'unchanged',
      p41aRepositoryReadiness: 'separate',
      p41c: 'requires-reviewed-external-evidence',
    },
  };
}

export function renderExternalSearchEvidenceMarkdown(report) {
  const lines = [
    '# P4.1B External Search Evidence',
    '',
    `Evidence class: \`${report.evidenceClass}\``,
    `External evidence: **${report.externalEvidence}**`,
    `Provenance: \`${report.provenance}\``,
    `Property: \`${report.property}\``,
    `Collected at: ${report.collectedAt}`,
    `Observation window: ${report.observationWindow.start} — ${report.observationWindow.end}`,
    '',
    'This report validates operator-supplied aggregate observations only. It does not authenticate the upstream account or collect data itself.',
    '**This P4.1B evidence does not close, reset, or reinterpret P3.6.**',
    'P4.1C may use only reviewed findings from real external input; repository readiness remains a separate evidence class.',
    '',
    '## Summary',
    '',
    `- Sources: ${report.summary.sources}`,
    `- Observations: ${report.summary.observations}`,
    `- Performance rows: ${report.summary.performanceRows}`,
    `- Indexing rows: ${report.summary.indexingRows}`,
    `- Nonzero clean pages: ${report.summary.nonzeroPages}`,
    `- Legacy .html page rows: ${report.summary.legacyHtmlPageRows}`,
    `- Indexing issues: ${report.summary.indexingIssues}`,
    '',
    '## RU / EN page performance',
    '',
    '| Locale | Clicks | Impressions | Rows |',
    '| --- | ---: | ---: | ---: |',
    `| RU | ${report.localePerformance.ru.clicks} | ${report.localePerformance.ru.impressions} | ${report.localePerformance.ru.rows} |`,
    `| EN | ${report.localePerformance.en.clicks} | ${report.localePerformance.en.impressions} | ${report.localePerformance.en.rows} |`,
    '',
    '## Top queries',
    '',
  ];

  if (report.topQueries.length === 0) lines.push('No query rows supplied.');
  else {
    lines.push('| Query | Clicks | Impressions | Position |', '| --- | ---: | ---: | ---: |');
    for (const row of report.topQueries) {
      lines.push(`| ${row.value.replaceAll('|', '\\|')} | ${row.clicks} | ${row.impressions} | ${row.position ?? '—'} |`);
    }
  }

  lines.push('', '## Findings', '');
  if (report.findings.length === 0) lines.push('No discovery findings in the supplied external observations.');
  else for (const item of report.findings) lines.push(`- **${item.code}** — ${item.message}`);
  lines.push('');
  return lines.join('\n');
}
