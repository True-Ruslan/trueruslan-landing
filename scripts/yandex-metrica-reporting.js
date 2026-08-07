const REPORTS_API_URL = 'https://api-metrika.yandex.net/stat/v1/data';
const REPORT_METRICS = Object.freeze(['ym:s:visits', 'ym:s:pageviews', 'ym:s:users']);

function requireDate(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be a YYYY-MM-DD date`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a real calendar date`);
  }
  return value;
}

function windowDate(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be an ISO timestamp`);
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error(`${label} must be an ISO timestamp`);
  }
  return parsed.toISOString().slice(0, 10);
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function requireAggregate(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }
  return value;
}

export function normalizeYandexMetricaCounterId(value) {
  const normalized = typeof value === 'number' ? String(value) : String(value ?? '').trim();
  if (!/^[1-9]\d{0,19}$/.test(normalized)) {
    throw new Error('Yandex Metrica counter ID must be a positive decimal identifier');
  }
  return normalized;
}

export function normalizeYandexMetricaOAuthToken(value) {
  if (typeof value !== 'string') {
    throw new Error('Yandex Metrica OAuth token is required');
  }
  const normalized = value.trim();
  if (normalized.length < 16 || normalized.length > 512 || /[\r\n\t\0]/.test(normalized) || /\s/.test(normalized)) {
    throw new Error('Yandex Metrica OAuth token must be a bounded single-line credential');
  }
  return normalized;
}

export function buildYandexMetricaReportUrl({counterId, date1, date2}) {
  const url = new URL(REPORTS_API_URL);
  url.searchParams.set('ids', normalizeYandexMetricaCounterId(counterId));
  url.searchParams.set('metrics', REPORT_METRICS.join(','));
  url.searchParams.set('date1', requireDate(date1, 'Yandex Metrica date1'));
  url.searchParams.set('date2', requireDate(date2, 'Yandex Metrica date2'));
  url.searchParams.set('accuracy', 'full');
  url.searchParams.set('timezone', '+00:00');
  url.searchParams.set('limit', '1');
  return url.toString();
}

function validateApiBody(body, {date1, date2}) {
  const root = requireObject(body, 'Yandex Metrica Reports API response');
  if (root.sampled !== false) {
    throw new Error(`Yandex Metrica Reports API response is sampled (sample_share=${String(root.sample_share ?? 'unknown')})`);
  }

  if (!Array.isArray(root.totals) || root.totals.length !== REPORT_METRICS.length) {
    throw new Error(`Yandex Metrica Reports API totals must contain exactly ${REPORT_METRICS.length} aggregate metrics`);
  }

  if (root.query && typeof root.query === 'object') {
    const metrics = Array.isArray(root.query.metrics) ? root.query.metrics : [];
    if (metrics.length && metrics.join(',') !== REPORT_METRICS.join(',')) {
      throw new Error('Yandex Metrica Reports API response metrics do not match the requested aggregate contract');
    }
    if (Array.isArray(root.query.dimensions) && root.query.dimensions.length > 0) {
      throw new Error('Yandex Metrica Reports API response unexpectedly contains dimensions');
    }
    if (root.query.date1 && root.query.date1 !== date1) {
      throw new Error('Yandex Metrica Reports API response date1 does not match the requested window');
    }
    if (root.query.date2 && root.query.date2 !== date2) {
      throw new Error('Yandex Metrica Reports API response date2 does not match the requested window');
    }
  }

  return Object.freeze({
    visits: requireAggregate(root.totals[0], 'Yandex Metrica visits'),
    pageviews: requireAggregate(root.totals[1], 'Yandex Metrica pageviews'),
    users: requireAggregate(root.totals[2], 'Yandex Metrica users'),
  });
}

export async function fetchYandexMetricaTotals({
  counterId,
  oauthToken,
  date1,
  date2,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('Yandex Metrica Reports API fetch implementation is required');
  }
  const normalizedToken = normalizeYandexMetricaOAuthToken(oauthToken);
  const url = buildYandexMetricaReportUrl({counterId, date1, date2});

  let response;
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Authorization: `OAuth ${normalizedToken}`,
        Accept: 'application/json',
      },
      redirect: 'error',
    });
  } catch (error) {
    throw new Error(`Yandex Metrica Reports API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response?.ok) {
    throw new Error(`Yandex Metrica Reports API request failed with HTTP ${String(response?.status ?? 'unknown')}`);
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`Yandex Metrica Reports API returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  return validateApiBody(body, {date1, date2});
}

export async function enrichMeasurementWithYandexMetrica(input, {
  counterId,
  oauthToken,
  fetchTotals = fetchYandexMetricaTotals,
} = {}) {
  const root = requireObject(input, 'measurement checkpoint input');
  const baseline = requireObject(root.baseline, 'measurement baseline');
  const current = requireObject(root.current, 'measurement current');
  const baselineWindow = requireObject(baseline.window, 'measurement baseline window');
  const currentWindow = requireObject(current.window, 'measurement current window');

  if ('metrica' in baseline || 'metrica' in current) {
    throw new Error('measurement input already contains Yandex Metrica aggregates; API enrichment refuses to overwrite them');
  }
  if (typeof fetchTotals !== 'function') {
    throw new Error('Yandex Metrica aggregate fetcher is required');
  }

  const credentials = {
    counterId: normalizeYandexMetricaCounterId(counterId),
    oauthToken: normalizeYandexMetricaOAuthToken(oauthToken),
  };
  const baselineDates = {
    date1: windowDate(baselineWindow.start, 'measurement baseline window start'),
    date2: windowDate(baselineWindow.end, 'measurement baseline window end'),
  };
  const currentDates = {
    date1: windowDate(currentWindow.start, 'measurement current window start'),
    date2: windowDate(currentWindow.end, 'measurement current window end'),
  };

  const baselineTotals = await fetchTotals({...credentials, ...baselineDates});
  const currentTotals = await fetchTotals({...credentials, ...currentDates});

  const enriched = structuredClone(root);
  enriched.baseline.metrica = {
    visits: requireAggregate(baselineTotals.visits, 'baseline Yandex Metrica visits'),
    pageviews: requireAggregate(baselineTotals.pageviews, 'baseline Yandex Metrica pageviews'),
    users: requireAggregate(baselineTotals.users, 'baseline Yandex Metrica users'),
  };
  enriched.current.metrica = {
    visits: requireAggregate(currentTotals.visits, 'current Yandex Metrica visits'),
    pageviews: requireAggregate(currentTotals.pageviews, 'current Yandex Metrica pageviews'),
    users: requireAggregate(currentTotals.users, 'current Yandex Metrica users'),
  };
  return enriched;
}
