const DEFAULT_IGNORED_REQUEST_FAILURE_REASONS = Object.freeze(['ERR_ABORTED', 'NS_BINDING_ABORTED']);

function sameOrigin(url, baseUrl) {
  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function shouldIgnoreRequestFailure(reason, ignoredReasons = DEFAULT_IGNORED_REQUEST_FAILURE_REASONS) {
  const text = String(reason || '');
  return ignoredReasons.some((ignored) => text.includes(ignored));
}

function dedupeDiagnostics(items) {
  return [...new Set(items)];
}

function installPageDiagnostics(page, {
  baseUrl,
  ignoredRequestFailureReasons = ['ERR_ABORTED'],
  captureRequestFailures = true,
  captureHttpErrors = true,
} = {}) {
  const pageErrors = [];
  const requestFailures = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));

  if (captureRequestFailures) {
    page.on('requestfailed', (request) => {
      if (baseUrl && !sameOrigin(request.url(), baseUrl)) return;
      const reason = request.failure()?.errorText || 'unknown failure';
      if (shouldIgnoreRequestFailure(reason, ignoredRequestFailureReasons)) return;
      requestFailures.push(`${request.method()} ${request.url()} -> ${reason}`);
    });
  }

  if (captureHttpErrors) {
    page.on('response', (response) => {
      if (baseUrl && !sameOrigin(response.url(), baseUrl)) return;
      if (response.status() >= 400) requestFailures.push(`${response.status()} ${response.url()}`);
    });
  }

  function assertClean(label) {
    if (pageErrors.length) {
      throw new Error(`${label}: page errors: ${dedupeDiagnostics(pageErrors).join('; ')}`);
    }
    if (requestFailures.length) {
      throw new Error(`${label}: request failures: ${dedupeDiagnostics(requestFailures).join('; ')}`);
    }
  }

  return {
    pageErrors,
    requestFailures,
    assertClean,
  };
}

module.exports = {
  DEFAULT_IGNORED_REQUEST_FAILURE_REASONS,
  sameOrigin,
  shouldIgnoreRequestFailure,
  dedupeDiagnostics,
  installPageDiagnostics,
};
