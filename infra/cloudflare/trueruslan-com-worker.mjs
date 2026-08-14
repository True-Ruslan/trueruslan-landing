const CANONICAL_ORIGIN = new URL('https://trueruslan.ru/');
const ALIAS_HOSTS = new Set(['trueruslan.com', 'www.trueruslan.com']);
const SAFE_METHODS = new Set(['GET', 'HEAD']);
const SENSITIVE_FORWARD_HEADERS = ['authorization', 'cookie', 'host'];

function plainTextResponse(message, status, headers = {}) {
  return new Response(`${message}\n`, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      ...headers,
    },
  });
}

function upstreamUrlFor(incomingUrl) {
  const upstream = new URL(incomingUrl.pathname + incomingUrl.search, CANONICAL_ORIGIN);
  return upstream;
}

function upstreamRequestFor(request, upstreamUrl) {
  const headers = new Headers(request.headers);
  for (const name of SENSITIVE_FORWARD_HEADERS) headers.delete(name);

  return new Request(upstreamUrl, {
    method: request.method,
    headers,
    redirect: 'manual',
  });
}

function rewrittenLocation(location, incomingUrl) {
  if (!location) return null;

  let target;
  try {
    target = new URL(location, CANONICAL_ORIGIN);
  } catch {
    return location;
  }

  const canonicalHost = target.hostname.toLowerCase();
  if (!['trueruslan.ru', 'www.trueruslan.ru'].includes(canonicalHost)) return location;
  if (!['http:', 'https:'].includes(target.protocol)) return location;

  const aliasTarget = new URL(target.href);
  aliasTarget.protocol = incomingUrl.protocol;
  aliasTarget.host = incomingUrl.host;
  return aliasTarget.href;
}

export async function handleRequest(request, fetchImpl = fetch) {
  const incomingUrl = new URL(request.url);
  const incomingHost = incomingUrl.hostname.toLowerCase();

  if (!ALIAS_HOSTS.has(incomingHost)) {
    return plainTextResponse('Misdirected Request', 421);
  }

  if (!SAFE_METHODS.has(request.method)) {
    return plainTextResponse('Method Not Allowed', 405, {allow: 'GET, HEAD'});
  }

  const upstreamUrl = upstreamUrlFor(incomingUrl);
  const upstreamRequest = upstreamRequestFor(request, upstreamUrl);
  const upstreamResponse = await fetchImpl(upstreamRequest);

  const headers = new Headers(upstreamResponse.headers);
  const location = rewrittenLocation(headers.get('location'), incomingUrl);
  if (location) headers.set('location', location);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}

export default {
  fetch(request) {
    return handleRequest(request);
  },
};
