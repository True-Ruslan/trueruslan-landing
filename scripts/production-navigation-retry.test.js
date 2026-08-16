import assert from 'node:assert/strict';
import test from 'node:test';

import retryModule from './production-navigation-retry.cjs';

const {gotoWithTransientHttpRetry} = retryModule;

function response(status) {
  return {
    status: () => status,
    ok: () => status >= 200 && status < 400,
  };
}

function fakePage(statuses) {
  const calls = [];
  return {
    calls,
    async goto(url, options) {
      calls.push({url, options});
      return response(statuses[calls.length - 1]);
    },
  };
}

test('transient production navigation retries one 503 and returns the successful response', async () => {
  const page = fakePage([503, 200]);
  const sleeps = [];
  const result = await gotoWithTransientHttpRetry(page, 'https://trueruslan.ru/en/work-with-me/', {waitUntil: 'networkidle'}, {
    sleep: async (ms) => sleeps.push(ms),
  });

  assert.equal(result.status(), 200);
  assert.equal(page.calls.length, 2);
  assert.deepEqual(sleeps, [1000]);
});

test('transient production navigation never retries deterministic 4xx responses', async () => {
  const page = fakePage([404, 200]);
  const sleeps = [];
  const result = await gotoWithTransientHttpRetry(page, 'https://trueruslan.ru/en/work-with-me/', {}, {
    sleep: async (ms) => sleeps.push(ms),
  });

  assert.equal(result.status(), 404);
  assert.equal(page.calls.length, 1);
  assert.deepEqual(sleeps, []);
});

test('transient production navigation stays bounded and returns persistent 5xx to the existing fail-closed assertion', async () => {
  const page = fakePage([503, 503, 503]);
  const sleeps = [];
  const result = await gotoWithTransientHttpRetry(page, 'https://trueruslan.ru/en/work-with-me/', {}, {
    sleep: async (ms) => sleeps.push(ms),
  });

  assert.equal(result.status(), 503);
  assert.equal(page.calls.length, 3);
  assert.deepEqual(sleeps, [1000, 2000]);
});

test('transient production navigation does not retry thrown browser/navigation errors', async () => {
  let calls = 0;
  const page = {
    async goto() {
      calls += 1;
      throw new Error('net::ERR_CONNECTION_RESET');
    },
  };

  await assert.rejects(
    gotoWithTransientHttpRetry(page, 'https://trueruslan.ru/en/work-with-me/', {}, {sleep: async () => {}}),
    /ERR_CONNECTION_RESET/,
  );
  assert.equal(calls, 1);
});