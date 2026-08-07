import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  applyConsentGatedMetrica,
  DEFAULT_METRICA_BROWSER_POLICY_PATH,
  loadMetricaBrowserPolicy,
} from './yandex-metrica-browser.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'docs-html');

export function runMetricaBrowserPostprocess({
  outputDir = DEFAULT_OUTPUT_DIR,
  policyPath = DEFAULT_METRICA_BROWSER_POLICY_PATH,
  counterId = process.env.TR_YANDEX_METRIKA_COUNTER_ID,
} = {}) {
  const policy = loadMetricaBrowserPolicy(policyPath);
  return applyConsentGatedMetrica(outputDir, policy, counterId);
}

function main() {
  try {
    const result = runMetricaBrowserPostprocess();
    if (result.enabled) {
      console.log(`Yandex Metrica consent controller injected into ${result.updated.length} final HTML page(s).`);
    } else {
      console.log('Yandex Metrica browser analytics: disabled (no deployment counter ID).');
    }
  } catch (error) {
    console.error(`Yandex Metrica browser postprocess failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
