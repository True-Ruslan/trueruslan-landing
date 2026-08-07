import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {runYandexMetricaConnectionCheck} from './yandex-metrica-connection-check.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const COUNTER_ID = '12345678';
const TOKEN = 'secret-oauth-token-value';

test('connection check probes only the previous completed UTC day and returns no aggregates or credentials', async () => {
  const calls = [];
  const result = await runYandexMetricaConnectionCheck({
    counterId: COUNTER_ID,
    oauthToken: TOKEN,
    now: new Date('2026-08-07T19:00:00Z'),
    fetchTotals: async (args) => {
      calls.push(args);
      return {visits: 4, pageviews: 7, users: 3};
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].date1, '2026-08-06');
  assert.equal(calls[0].date2, '2026-08-06');
  assert.equal(calls[0].counterId, COUNTER_ID);
  assert.equal(calls[0].oauthToken, TOKEN);
  assert.deepEqual(result, {status: 'connected', probeDate: '2026-08-06'});
  assert.equal(JSON.stringify(result).includes(COUNTER_ID), false);
  assert.equal(JSON.stringify(result).includes(TOKEN), false);
  assert.equal('visits' in result, false);
});

test('connection check rejects invalid clocks and propagates API failure', async () => {
  await assert.rejects(
    () => runYandexMetricaConnectionCheck({
      counterId: COUNTER_ID,
      oauthToken: TOKEN,
      now: new Date('invalid'),
      fetchTotals: async () => ({visits: 0, pageviews: 0, users: 0}),
    }),
    /clock|date/i,
  );

  await assert.rejects(
    () => runYandexMetricaConnectionCheck({
      counterId: COUNTER_ID,
      oauthToken: TOKEN,
      now: new Date('2026-08-07T19:00:00Z'),
      fetchTotals: async () => {
        throw new Error('HTTP 403');
      },
    }),
    /403/,
  );
});

test('connection-check workflow is manual-only, minimally privileged and never publishes metrics', () => {
  const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'yandex-metrica-connection-check.yml'), 'utf8');

  assert.match(workflow, /name: Yandex Metrica Connection Check/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request:|push:|schedule:/);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.doesNotMatch(workflow, /contents: write|issues: write|pull-requests: write/);
  assert.match(workflow, /YANDEX_METRIKA_COUNTER_ID:\s*\$\{\{ vars\.YANDEX_METRIKA_COUNTER_ID \}\}/);
  assert.match(workflow, /YANDEX_METRIKA_OAUTH_TOKEN:\s*\$\{\{ secrets\.YANDEX_METRIKA_OAUTH_TOKEN \}\}/);
  assert.match(workflow, /node scripts\/yandex-metrica-connection-check\.js/);
  assert.doesNotMatch(workflow, /upload-artifact|GITHUB_STEP_SUMMARY|metrics=|Authorization:|P3_6_MEASUREMENT_OBSERVATIONS_JSON/);
});
