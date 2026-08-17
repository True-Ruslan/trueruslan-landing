import {handleRequest as handleWorkerRequest} from './ai-navigator-worker.mjs';

const VALID_AI_MODES = new Set(['off', 'search', 'full']);
const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

function runtimeMode(env = {}) {
  if (env.AI_ENABLED !== 'true') return 'off';
  const value = typeof env.AI_MODE === 'string' ? env.AI_MODE.trim().toLowerCase() : '';
  return VALID_AI_MODES.has(value) ? value : 'off';
}

function featureDisabledResponse(request, env, pathname) {
  const headers = new Headers({
    'Content-Type': JSON_CONTENT_TYPE,
    'Cache-Control': 'no-store',
  });
  const origin = request.headers.get('Origin')?.trim();
  if (origin && origin === env.AI_ALLOWED_ORIGIN) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  const error = pathname === '/v1/answer'
    ? 'AI answer feature is disabled.'
    : 'AI feature is disabled.';
  return new Response(JSON.stringify({error, code: 'feature_disabled'}), {
    status: 503,
    headers,
  });
}

export async function handleRequest(request, env, fetchImpl = globalThis.fetch) {
  const pathname = new URL(request.url).pathname;
  const mode = runtimeMode(env);

  if (pathname === '/v1/embed' && mode !== 'search' && mode !== 'full') {
    return featureDisabledResponse(request, env, pathname);
  }
  if (pathname === '/v1/answer' && mode !== 'full') {
    return featureDisabledResponse(request, env, pathname);
  }

  return handleWorkerRequest(request, env, fetchImpl);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env, globalThis.fetch);
  },
};
