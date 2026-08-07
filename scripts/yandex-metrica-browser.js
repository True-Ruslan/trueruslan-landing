const POLICY_FIELDS = Object.freeze([
  'provider',
  'measurement',
  'activation',
  'providerCookies',
  'consentStorage',
  'sessionReplay',
  'clickMap',
  'linkTracking',
  'accurateBounce',
  'trackHash',
  'sendTitle',
  'customEvents',
  'userParameters',
  'ecommerce',
  'noscriptTracking',
]);

const POLICY_FIELD_SET = new Set(POLICY_FIELDS);
const FORBIDDEN_FLAGS = Object.freeze([
  'sessionReplay',
  'clickMap',
  'linkTracking',
  'accurateBounce',
  'trackHash',
  'sendTitle',
  'customEvents',
  'userParameters',
  'ecommerce',
  'noscriptTracking',
]);

export function validateMetricaBrowserPolicy(policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new Error('Yandex Metrica browser policy must be an object');
  }

  for (const key of Object.keys(policy)) {
    if (!POLICY_FIELD_SET.has(key)) {
      throw new Error(`unknown Yandex Metrica browser policy field: ${key}`);
    }
  }

  for (const field of POLICY_FIELDS) {
    if (!(field in policy)) {
      throw new Error(`Yandex Metrica browser policy is missing required field: ${field}`);
    }
  }

  if (policy.provider !== 'yandex-metrica') {
    throw new Error(`unsupported Yandex Metrica browser provider: ${policy.provider}`);
  }
  if (policy.measurement !== 'aggregate-traffic') {
    throw new Error(`unsupported Yandex Metrica browser measurement: ${policy.measurement}`);
  }
  if (policy.activation !== 'explicit-consent-required') {
    throw new Error('explicit consent is required for Yandex Metrica browser analytics');
  }
  if (policy.providerCookies !== 'after-consent-only') {
    throw new Error('provider cookies must be allowed only after consent');
  }
  if (policy.consentStorage !== 'first-party-preference-only') {
    throw new Error('consent storage must be first-party preference only');
  }

  for (const field of FORBIDDEN_FLAGS) {
    if (policy[field] !== false) {
      throw new Error(`${field} is forbidden by the Yandex Metrica browser privacy policy`);
    }
  }

  return Object.freeze({...policy});
}

export function normalizeMetricaCounterId(counterId) {
  if (counterId === undefined || counterId === null) return null;
  const normalized = String(counterId).trim();
  if (!normalized) return null;
  if (!/^[1-9][0-9]*$/.test(normalized)) {
    throw new Error('Yandex Metrica counter ID must be a positive decimal identifier');
  }
  return normalized;
}
