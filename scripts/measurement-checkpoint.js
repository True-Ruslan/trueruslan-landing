const DAY_MS = 24 * 60 * 60 * 1000;
const EVIDENCE_CLASSES = new Set(['operator-observed', 'synthetic']);

const PRIVACY_FORBIDDEN_KEYS = new Set([
  'sessionid',
  'userid',
  'visitorid',
  'clientid',
  'deviceid',
  'ip',
  'ipaddress',
  'cookie',
  'cookies',
  'email',
  'referrer',
  'useragent',
]);

const SEARCH_METRICS = Object.freeze([
  'impressions',
  'clicks',
  'indexedCleanUrls',
  'indexedLegacyHtmlUrls',
]);

const METRICA_METRICS = Object.freeze([
  'visits',
  'pageviews',
  'users',
]);

function normalizedKey(value) {
  return String(value).replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function assertPrivacyBoundary(value, path = 'input') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertPrivacyBoundary(entry, `${path}[${index}]`));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (PRIVACY_FORBIDDEN_KEYS.has(normalizedKey(key))) {
      throw new Error(`measurement privacy boundary rejects raw/user-level field ${path}.${key}`);
    }
    assertPrivacyBoundary(child, `${path}.${key}`);
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function requireTimestamp(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be an ISO timestamp`);
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be an ISO timestamp`);
  return parsed;
}

function requireNonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }
  return value;
}

function validateMetricObject(value, label, metrics) {
  const source = requireObject(value, label);
  const result = {};
  for (const metric of metrics) {
    result[metric] = requireNonNegativeInteger(source[metric], `${label}.${metric}`);
  }
  const unknown = Object.keys(source).filter((key) => !metrics.includes(key));
  if (unknown.length) throw new Error(`${label} contains unsupported field(s): ${unknown.join(', ')}`);
  return Object.freeze(result);
}

function validateSearchEngine(value, label) {
  return validateMetricObject(value, label, SEARCH_METRICS);
}

function validateMetrica(value, label) {
  return validateMetricObject(value, label, METRICA_METRICS);
}

function validateSnapshot(value, label) {
  const snapshot = requireObject(value, label);
  const allowed = new Set(['window', 'cloudflare', 'search', 'metrica']);
  const unknown = Object.keys(snapshot).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`${label} contains unsupported field(s): ${unknown.join(', ')}`);

  const window = requireObject(snapshot.window, `${label}.window`);
  const windowUnknown = Object.keys(window).filter((key) => !['start', 'end'].includes(key));
  if (windowUnknown.length) throw new Error(`${label}.window contains unsupported field(s): ${windowUnknown.join(', ')}`);
  const startMs = requireTimestamp(window.start, `${label}.window.start`);
  const endMs = requireTimestamp(window.end, `${label}.window.end`);
  if (endMs < startMs) throw new Error(`${label}.window.end must be on or after ${label}.window.start`);

  const cloudflare = requireObject(snapshot.cloudflare, `${label}.cloudflare`);
  const cloudflareUnknown = Object.keys(cloudflare).filter((key) => key !== 'pageviews');
  if (cloudflareUnknown.length) throw new Error(`${label}.cloudflare contains unsupported field(s): ${cloudflareUnknown.join(', ')}`);
  const pageviews = requireNonNegativeInteger(cloudflare.pageviews, `${label}.cloudflare.pageviews`);

  const search = requireObject(snapshot.search, `${label}.search`);
  const searchUnknown = Object.keys(search).filter((key) => !['google', 'yandex'].includes(key));
  if (searchUnknown.length) throw new Error(`${label}.search contains unsupported field(s): ${searchUnknown.join(', ')}`);

  return Object.freeze({
    window: Object.freeze({start: window.start, end: window.end, startMs, endMs}),
    cloudflare: Object.freeze({pageviews}),
    search: Object.freeze({
      google: validateSearchEngine(search.google, `${label}.search.google`),
      yandex: validateSearchEngine(search.yandex, `${label}.search.yandex`),
    }),
    metrica: snapshot.metrica === undefined ? null : validateMetrica(snapshot.metrica, `${label}.metrica`),
  });
}

function validateOperatorAssessment(value) {
  const assessment = requireObject(value, 'operatorAssessment');
  const allowed = new Set(['aggregateTrafficSufficient', 'assessedAt', 'basis']);
  const unknown = Object.keys(assessment).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`operatorAssessment contains unsupported field(s): ${unknown.join(', ')}`);
  if (typeof assessment.aggregateTrafficSufficient !== 'boolean') {
    throw new Error('operatorAssessment.aggregateTrafficSufficient must be boolean');
  }
  const assessedMs = requireTimestamp(assessment.assessedAt, 'operatorAssessment.assessedAt');
  if (typeof assessment.basis !== 'string' || assessment.basis.trim().length < 12) {
    throw new Error('operatorAssessment.basis must explain the aggregate-traffic judgement');
  }
  return Object.freeze({
    aggregateTrafficSufficient: assessment.aggregateTrafficSufficient,
    assessedAt: assessment.assessedAt,
    assessedMs,
    basis: assessment.basis.trim(),
  });
}

function delta(baseline, current) {
  return Object.freeze({baseline, current, delta: current - baseline});
}

function compareMetrics(baseline, current, metrics) {
  return Object.freeze(Object.fromEntries(
    metrics.map((metric) => [metric, delta(baseline[metric], current[metric])]),
  ));
}

function compareEngine(baseline, current) {
  return compareMetrics(baseline, current, SEARCH_METRICS);
}

function evidenceSources(evidenceClass, hasMetrica) {
  const sources = evidenceClass === 'synthetic'
    ? {
      cloudflare: 'synthetic aggregate Cloudflare fixture (not production measurement evidence)',
      google: 'synthetic aggregate Google Search Console fixture (not production measurement evidence)',
      yandex: 'synthetic aggregate Yandex Webmaster fixture (not production measurement evidence)',
    }
    : {
      cloudflare: 'operator-observed aggregate Cloudflare Web Analytics',
      google: 'operator-observed aggregate Google Search Console',
      yandex: 'operator-observed aggregate Yandex Webmaster',
    };

  if (hasMetrica) {
    sources.metrica = evidenceClass === 'synthetic'
      ? 'synthetic aggregate Yandex Metrica Reports API fixture (not production measurement evidence)'
      : 'operator-retrieved aggregate Yandex Metrica Reports API';
  }
  return Object.freeze(sources);
}

export function analyzeMeasurementCheckpoint(input, {minimumObservationDays = 10} = {}) {
  assertPrivacyBoundary(input);
  const root = requireObject(input, 'measurement checkpoint input');
  const allowed = new Set(['schemaVersion', 'evidenceClass', 'cleanUrlMigrationAt', 'baseline', 'current', 'operatorAssessment']);
  const unknown = Object.keys(root).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`measurement checkpoint input contains unsupported field(s): ${unknown.join(', ')}`);
  if (root.schemaVersion !== 1) throw new Error('measurement checkpoint schemaVersion must be 1');
  if (!EVIDENCE_CLASSES.has(root.evidenceClass)) {
    throw new Error('measurement checkpoint evidenceClass must be operator-observed or synthetic');
  }
  if (!Number.isInteger(minimumObservationDays) || minimumObservationDays < 1) {
    throw new Error('minimumObservationDays must be a positive integer');
  }

  const evidenceClass = root.evidenceClass;
  const migrationMs = requireTimestamp(root.cleanUrlMigrationAt, 'cleanUrlMigrationAt');
  const baseline = validateSnapshot(root.baseline, 'baseline');
  const current = validateSnapshot(root.current, 'current');
  const operatorAssessment = validateOperatorAssessment(root.operatorAssessment);

  const hasBaselineMetrica = baseline.metrica !== null;
  const hasCurrentMetrica = current.metrica !== null;
  if (hasBaselineMetrica !== hasCurrentMetrica) {
    throw new Error('Yandex Metrica aggregates must be present in both comparison windows or neither');
  }
  const hasMetrica = hasBaselineMetrica && hasCurrentMetrica;

  if (baseline.window.endMs >= migrationMs) {
    throw new Error('baseline observation window must end before clean URL migration');
  }
  if (current.window.startMs < migrationMs) {
    throw new Error('current observation window must start on or after clean URL migration');
  }
  if (current.window.startMs <= baseline.window.endMs) {
    throw new Error('current observation window must start after the baseline window');
  }
  if (operatorAssessment.assessedMs < current.window.endMs) {
    throw new Error('operator assessment must be recorded after the current observation window ends');
  }

  const observationDays = Math.max(0, Math.floor((current.window.endMs - migrationMs) / DAY_MS));
  const windowSufficient = observationDays >= minimumObservationDays;
  const baselineDurationMs = baseline.window.endMs - baseline.window.startMs;
  const currentDurationMs = current.window.endMs - current.window.startMs;
  const comparisonWindowDurationsMatch = baselineDurationMs === currentDurationMs;
  if (windowSufficient && !comparisonWindowDurationsMatch) {
    throw new Error('baseline and current comparison window durations must match before descriptive deltas are reviewed');
  }

  const isSynthetic = evidenceClass === 'synthetic';
  const operatorTrafficSufficient = isSynthetic ? false : operatorAssessment.aggregateTrafficSufficient;
  const readyForHumanReview = !isSynthetic && windowSufficient && operatorTrafficSufficient;
  const status = isSynthetic
    ? 'synthetic-pipeline-proof'
    : (!windowSufficient
      ? 'insufficient-observation-window'
      : (!operatorTrafficSufficient ? 'insufficient-aggregate-traffic' : 'ready-for-human-review'));

  const report = {
    schemaVersion: 1,
    status,
    cleanUrlMigrationAt: root.cleanUrlMigrationAt,
    evidence: {
      class: evidenceClass,
      baselineWindow: {start: baseline.window.start, end: baseline.window.end},
      currentWindow: {start: current.window.start, end: current.window.end},
      sources: evidenceSources(evidenceClass, hasMetrica),
    },
    readiness: {
      readyForHumanReview,
      minimumObservationDays,
      observationDays,
      observationWindowSufficient: windowSufficient,
      comparisonWindowDurationsMatch,
      operatorTrafficSufficient,
      operatorAssessedAt: operatorAssessment.assessedAt,
      operatorBasis: operatorAssessment.basis,
      operatorAssertionClass: isSynthetic ? 'synthetic fixture field' : 'operator assertion',
    },
    comparisons: {
      cloudflarePageviews: delta(baseline.cloudflare.pageviews, current.cloudflare.pageviews),
      google: compareEngine(baseline.search.google, current.search.google),
      yandex: compareEngine(baseline.search.yandex, current.search.yandex),
      metrica: hasMetrica ? compareMetrics(baseline.metrica, current.metrica, METRICA_METRICS) : null,
    },
    claims: {
      automaticConclusionsAllowed: false,
      engagementConclusion: null,
      productImpactConclusion: null,
      boundary: isSynthetic
        ? 'Synthetic pipeline proof only; these values are not production measurement evidence and cannot support engagement, causality or product-impact conclusions.'
        : 'Descriptive aggregate deltas only. Human review is required for any engagement, causality or product-impact conclusion.',
    },
  };

  return Object.freeze(report);
}

function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function comparisonRow(label, comparison) {
  return `| ${label} | ${comparison.baseline} | ${comparison.current} | ${signed(comparison.delta)} |`;
}

export function renderMeasurementCheckpointMarkdown(report) {
  requireObject(report, 'measurement report');
  const comparisonRows = [
    comparisonRow('Cloudflare pageviews', report.comparisons.cloudflarePageviews),
    comparisonRow('Google impressions', report.comparisons.google.impressions),
    comparisonRow('Google clicks', report.comparisons.google.clicks),
    comparisonRow('Google clean URLs indexed', report.comparisons.google.indexedCleanUrls),
    comparisonRow('Google legacy HTML URLs indexed', report.comparisons.google.indexedLegacyHtmlUrls),
    comparisonRow('Yandex impressions', report.comparisons.yandex.impressions),
    comparisonRow('Yandex clicks', report.comparisons.yandex.clicks),
    comparisonRow('Yandex clean URLs indexed', report.comparisons.yandex.indexedCleanUrls),
    comparisonRow('Yandex legacy HTML URLs indexed', report.comparisons.yandex.indexedLegacyHtmlUrls),
  ];
  if (report.comparisons.metrica) {
    comparisonRows.push(
      comparisonRow('Yandex Metrica visits', report.comparisons.metrica.visits),
      comparisonRow('Yandex Metrica pageviews', report.comparisons.metrica.pageviews),
      comparisonRow('Yandex Metrica users', report.comparisons.metrica.users),
    );
  }

  const lines = [
    '# Portfolio measurement checkpoint',
    '',
    `Evidence class: **${report.evidence.class}**`,
    '',
    `Status: **${report.status}**`,
    '',
    `Observation window after clean-URL migration: **${report.readiness.observationDays} day(s)**; minimum: **${report.readiness.minimumObservationDays}**.`,
    '',
    `Comparison windows have equal duration: **${report.readiness.comparisonWindowDurationsMatch}**.`,
    '',
    `${report.evidence.class === 'synthetic' ? 'Synthetic fixture field' : 'Operator assertion'}: aggregate traffic sufficient = **${report.readiness.operatorTrafficSufficient}**.`,
    '',
    `Operator basis: ${report.readiness.operatorBasis}`,
    '',
    '| Aggregate metric | Baseline | Current | Delta |',
    '| --- | ---: | ---: | ---: |',
    ...comparisonRows,
    '',
    '## Evidence boundary',
    '',
    `- ${report.claims.boundary}`,
    '- No automatic engagement conclusion.',
    '- No automatic product-impact conclusion.',
    '- No causal claim is derived from these descriptive aggregate deltas.',
    '- Raw visitor, session, device, IP, cookie, referrer and user-level fields are rejected by the input contract.',
    '- `ready-for-human-review` means only that an operator-observed bounded evidence package is complete enough to inspect.',
    '',
  ];
  return lines.join('\n');
}
