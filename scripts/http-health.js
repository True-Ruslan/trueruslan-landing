const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_REDIRECTS = 5;
const REACHABLE_ANTI_BOT_STATUSES = new Set([401, 403, 429]);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export function classifyHttpStatus(status) {
  if (status >= 200 && status < 400) {
    return {ok: true, classification: 'healthy'};
  }

  if (REACHABLE_ANTI_BOT_STATUSES.has(status)) {
    return {ok: true, classification: 'reachable'};
  }

  return {ok: false, classification: 'broken'};
}

function normalizeContentType(value = '') {
  return value.split(';', 1)[0].trim().toLowerCase();
}

function createTimeoutSignal(timeoutMs) {
  if (typeof AbortSignal?.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }
  return undefined;
}

export async function checkUrl(url, {
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxRedirects = DEFAULT_MAX_REDIRECTS,
  expectedContentType,
  headers = {},
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('fetchImpl must be a function');
  }

  let currentUrl = new URL(url).href;
  let redirects = 0;

  try {
    while (true) {
      const response = await fetchImpl(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: createTimeoutSignal(timeoutMs),
        headers: {
          'user-agent': 'TrueRuslan-Portfolio-Health/1.0',
          accept: '*/*',
          ...headers,
        },
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            url,
            finalUrl: currentUrl,
            ok: false,
            classification: 'broken',
            status: response.status,
            redirects,
            error: 'Redirect response is missing Location header.',
          };
        }

        if (redirects >= maxRedirects) {
          return {
            url,
            finalUrl: currentUrl,
            ok: false,
            classification: 'broken',
            status: response.status,
            redirects,
            error: `Redirect limit exceeded (${maxRedirects}).`,
          };
        }

        currentUrl = new URL(location, currentUrl).href;
        redirects += 1;
        continue;
      }

      const policy = classifyHttpStatus(response.status);
      const contentType = normalizeContentType(response.headers.get('content-type') || '');

      if (policy.ok && expectedContentType) {
        const expected = normalizeContentType(expectedContentType);
        if (contentType !== expected) {
          return {
            url,
            finalUrl: currentUrl,
            ok: false,
            classification: 'broken',
            status: response.status,
            redirects,
            contentType,
            error: `Unexpected content-type: expected ${expected}, got ${contentType || 'missing'}.`,
          };
        }
      }

      return {
        url,
        finalUrl: currentUrl,
        ok: policy.ok,
        classification: policy.classification,
        status: response.status,
        redirects,
        contentType,
        error: policy.ok ? null : `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const message = error?.name === 'TimeoutError' || error?.name === 'AbortError'
      ? `Request timed out after ${timeoutMs}ms.`
      : error?.message || String(error);

    return {
      url,
      finalUrl: currentUrl,
      ok: false,
      classification: 'broken',
      status: null,
      redirects,
      error: message,
    };
  }
}

export async function checkUrls(entries, {
  concurrency = 4,
  ...options
} = {}) {
  const results = new Array(entries.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= entries.length) return;

      const entry = entries[index];
      const result = await checkUrl(entry.url, {
        ...options,
        expectedContentType: entry.expectedContentType,
        headers: entry.headers,
      });
      results[index] = {...entry, ...result};
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, entries.length || 1));
  await Promise.all(Array.from({length: workerCount}, () => worker()));
  return results;
}
