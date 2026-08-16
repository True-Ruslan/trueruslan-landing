const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 1000;

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientHttpStatus(status) {
  return Number.isInteger(status) && status >= 500 && status <= 599;
}

async function gotoWithTransientHttpRetry(
  page,
  url,
  gotoOptions = {},
  {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    sleep = defaultSleep,
  } = {},
) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > DEFAULT_MAX_ATTEMPTS) {
    throw new TypeError(`maxAttempts must be an integer between 1 and ${DEFAULT_MAX_ATTEMPTS}`);
  }
  if (!Number.isInteger(baseDelayMs) || baseDelayMs < 0 || baseDelayMs > 5000) {
    throw new TypeError('baseDelayMs must be an integer between 0 and 5000');
  }
  if (typeof sleep !== 'function') {
    throw new TypeError('sleep must be a function');
  }

  let response;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    response = await page.goto(url, gotoOptions);
    const status = response?.status?.();
    if (!isTransientHttpStatus(status) || attempt === maxAttempts) {
      return response;
    }
    await sleep(baseDelayMs * attempt);
  }

  return response;
}

module.exports = {
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_BASE_DELAY_MS,
  isTransientHttpStatus,
  gotoWithTransientHttpRetry,
};
