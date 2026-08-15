const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';
const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const MAX_QUERY_CHARS = 500;
const REQUEST_TIMEOUT_MS = 8000;

function jsonResponse(status, payload, {origin = null, headers = {}} = {}) {
  const responseHeaders = new Headers({
    'Content-Type': JSON_CONTENT_TYPE,
    'Cache-Control': 'no-store',
    ...headers,
  });
  if (origin) {
    responseHeaders.set('Access-Control-Allow-Origin', origin);
    responseHeaders.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(payload), {status, headers: responseHeaders});
}

function errorResponse(status, code, error, options = {}) {
  return jsonResponse(status, {error, code}, options);
}

function requestOrigin(request) {
  const value = request.headers.get('Origin');
  return value ? value.trim() : null;
}

function allowedOrigin(request, env) {
  const origin = requestOrigin(request);
  if (!origin) return {origin: null, allowed: true};
  return {origin, allowed: origin === env.AI_ALLOWED_ORIGIN};
}

function parseDimensions(env) {
  const value = Number(env.AI_EMBEDDING_DIMENSIONS);
  if (!Number.isInteger(value) || value !== 512) return null;
  return value;
}

function isJsonContentType(request) {
  const value = request.headers.get('Content-Type') || '';
  return /^application\/json(?:\s*;|$)/i.test(value.trim());
}

async function readJsonBody(request) {
  try {
    return {ok: true, value: await request.json()};
  } catch {
    return {ok: false, value: null};
  }
}

function validateEmbedBody(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {ok: false, code: 'invalid_request', error: 'Request body must be a JSON object.'};
  }
  const keys = Object.keys(value);
  if (keys.length !== 1 || keys[0] !== 'query') {
    return {ok: false, code: 'invalid_request', error: 'Request body must contain only query.'};
  }
  if (typeof value.query !== 'string') {
    return {ok: false, code: 'invalid_query', error: 'Query must be a string.'};
  }
  const query = value.query.trim();
  if (query.length < 1 || query.length > MAX_QUERY_CHARS) {
    return {ok: false, code: 'invalid_query', error: `Query length must be between 1 and ${MAX_QUERY_CHARS} characters.`};
  }
  return {ok: true, query};
}

function validateEmbeddingPayload(payload, dimensions) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.data) || payload.data.length !== 1) {
    return null;
  }
  const item = payload.data[0];
  if (!item || (item.index !== undefined && item.index !== 0) || !Array.isArray(item.embedding)) return null;
  if (item.embedding.length !== dimensions || !item.embedding.every(Number.isFinite)) return null;
  return item.embedding;
}

function mapProviderFailure(status) {
  if (status === 429) return 429;
  if ([400, 401, 402].includes(status)) return status;
  return 502;
}

async function handleEmbed(request, env, fetchImpl, corsOrigin) {
  if (env.AI_ENABLED !== 'true') {
    return errorResponse(503, 'feature_disabled', 'AI feature is disabled.', {origin: corsOrigin});
  }
  if (typeof env.OPENROUTER_API_KEY !== 'string' || !env.OPENROUTER_API_KEY.trim()) {
    return errorResponse(503, 'provider_unconfigured', 'AI provider is not configured.', {origin: corsOrigin});
  }
  if (env.AI_EMBEDDING_MODEL !== 'openai/text-embedding-3-small') {
    return errorResponse(503, 'provider_unconfigured', 'AI embedding model is not configured.', {origin: corsOrigin});
  }
  const dimensions = parseDimensions(env);
  if (!dimensions) {
    return errorResponse(503, 'provider_unconfigured', 'AI embedding dimensions are not configured.', {origin: corsOrigin});
  }
  if (!isJsonContentType(request)) {
    return errorResponse(415, 'unsupported_media_type', 'Content-Type must be application/json.', {origin: corsOrigin});
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return errorResponse(400, 'invalid_json', 'Request body is not valid JSON.', {origin: corsOrigin});
  }
  const validated = validateEmbedBody(parsed.value);
  if (!validated.ok) {
    return errorResponse(400, validated.code, validated.error, {origin: corsOrigin});
  }

  const body = {
    model: env.AI_EMBEDDING_MODEL,
    dimensions,
    input_type: 'search_query',
    input: validated.query,
    provider: {
      zdr: true,
      data_collection: 'deny',
    },
  };

  let response;
  try {
    response = await fetchImpl(OPENROUTER_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return errorResponse(502, 'provider_unavailable', 'AI provider is temporarily unavailable.', {origin: corsOrigin});
  }

  if (!response?.ok) {
    return errorResponse(
      mapProviderFailure(response?.status),
      'provider_http_error',
      'AI provider request failed.',
      {origin: corsOrigin},
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return errorResponse(502, 'provider_invalid_response', 'AI provider returned an invalid response.', {origin: corsOrigin});
  }
  const embedding = validateEmbeddingPayload(payload, dimensions);
  if (!embedding) {
    return errorResponse(502, 'provider_invalid_response', 'AI provider returned an invalid response.', {origin: corsOrigin});
  }

  return jsonResponse(200, {
    embedding,
    model: env.AI_EMBEDDING_MODEL,
    dimensions,
  }, {origin: corsOrigin});
}

export async function handleRequest(request, env, fetchImpl = globalThis.fetch) {
  const url = new URL(request.url);
  if (url.pathname !== '/v1/embed') {
    return errorResponse(404, 'not_found', 'Route not found.');
  }
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Method not allowed.', {
      headers: {Allow: 'POST'},
    });
  }

  const originState = allowedOrigin(request, env);
  if (!originState.allowed) {
    return errorResponse(403, 'origin_forbidden', 'Origin is not allowed.');
  }
  const corsOrigin = originState.origin && originState.origin === env.AI_ALLOWED_ORIGIN
    ? originState.origin
    : null;
  return handleEmbed(request, env, fetchImpl, corsOrigin);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env, globalThis.fetch);
  },
};
