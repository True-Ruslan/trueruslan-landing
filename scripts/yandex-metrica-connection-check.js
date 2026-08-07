import path from 'node:path';
import {pathToFileURL} from 'node:url';

import {
  fetchYandexMetricaTotals,
  normalizeYandexMetricaCounterId,
  normalizeYandexMetricaOAuthToken,
} from './yandex-metrica-reporting.js';

function previousCompletedUtcDate(now) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new Error('Yandex Metrica connection-check clock/date is invalid');
  }
  const previous = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
  ));
  return previous.toISOString().slice(0, 10);
}

export async function runYandexMetricaConnectionCheck({
  counterId,
  oauthToken,
  now = new Date(),
  fetchTotals = fetchYandexMetricaTotals,
} = {}) {
  if (typeof fetchTotals !== 'function') {
    throw new Error('Yandex Metrica connection-check aggregate fetcher is required');
  }

  const normalizedCounterId = normalizeYandexMetricaCounterId(counterId);
  const normalizedOAuthToken = normalizeYandexMetricaOAuthToken(oauthToken);
  const probeDate = previousCompletedUtcDate(now);

  await fetchTotals({
    counterId: normalizedCounterId,
    oauthToken: normalizedOAuthToken,
    date1: probeDate,
    date2: probeDate,
  });

  return Object.freeze({status: 'connected', probeDate});
}

async function main() {
  try {
    const result = await runYandexMetricaConnectionCheck({
      counterId: process.env.YANDEX_METRIKA_COUNTER_ID,
      oauthToken: process.env.YANDEX_METRIKA_OAUTH_TOKEN,
    });
    console.log(`Yandex Metrica Reports API connection check succeeded for completed UTC day ${result.probeDate}.`);
  } catch (error) {
    console.error(`Yandex Metrica Reports API connection check failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
