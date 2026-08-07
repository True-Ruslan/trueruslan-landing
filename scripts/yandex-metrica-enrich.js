import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import {enrichMeasurementWithYandexMetrica} from './yandex-metrica-reporting.js';

export function parseYandexMetricaEnrichArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === '--input') {
      if (!value) throw new Error('--input requires a path');
      result.inputPath = value;
      index += 1;
    } else if (arg === '--output') {
      if (!value) throw new Error('--output requires a path');
      result.outputPath = value;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return result;
}

function loadObservations(inputPath) {
  if (typeof inputPath !== 'string' || !inputPath.trim()) {
    throw new Error('Yandex Metrica enrichment input path is required');
  }
  let source;
  try {
    source = fs.readFileSync(inputPath, 'utf8');
  } catch (error) {
    throw new Error(`Yandex Metrica enrichment input cannot be read: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Yandex Metrica enrichment input is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function runYandexMetricaEnrichment({
  inputPath,
  outputPath,
  counterId,
  oauthToken,
  fetchTotals,
} = {}) {
  if (typeof outputPath !== 'string' || !outputPath.trim()) {
    throw new Error('Yandex Metrica enrichment output path is required');
  }
  const observations = loadObservations(inputPath);
  const enriched = await enrichMeasurementWithYandexMetrica(observations, {
    counterId,
    oauthToken,
    ...(fetchTotals ? {fetchTotals} : {}),
  });

  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, `${JSON.stringify(enriched, null, 2)}\n`, {encoding: 'utf8', mode: 0o600});
  fs.chmodSync(outputPath, 0o600);
  return Object.freeze({observations: enriched, outputPath});
}

async function main() {
  try {
    const args = parseYandexMetricaEnrichArgs(process.argv.slice(2));
    await runYandexMetricaEnrichment({
      ...args,
      counterId: process.env.YANDEX_METRIKA_COUNTER_ID,
      oauthToken: process.env.YANDEX_METRIKA_OAUTH_TOKEN,
    });
    console.log('Yandex Metrica aggregate enrichment completed.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
