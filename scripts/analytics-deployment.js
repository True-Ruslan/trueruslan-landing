import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {normalizeAnalyticsToken} from './analytics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_REPORT_PATH = path.join(ROOT, 'analytics-deployment-contract.json');
const MODES = new Set(['auto', 'required', 'disabled']);

export function resolveAnalyticsDeployment({mode = 'auto', token} = {}) {
  const normalizedMode = String(mode || 'auto').trim().toLowerCase();
  if (!MODES.has(normalizedMode)) {
    throw new Error(`invalid analytics deployment mode: ${mode}`);
  }

  if (normalizedMode === 'disabled') {
    return Object.freeze({
      mode: normalizedMode,
      enabled: false,
      expectation: 'disabled',
      reason: 'forced-disabled',
    });
  }

  const normalizedToken = normalizeAnalyticsToken(token);
  if (!normalizedToken) {
    if (normalizedMode === 'required') {
      throw new Error('analytics token is required for required deployment mode');
    }
    return Object.freeze({
      mode: normalizedMode,
      enabled: false,
      expectation: 'disabled',
      reason: 'token-not-configured',
    });
  }

  return Object.freeze({
    mode: normalizedMode,
    enabled: true,
    expectation: 'enabled',
    reason: 'configured-token',
  });
}

export function writeAnalyticsDeploymentContract(result, reportPath = DEFAULT_REPORT_PATH) {
  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

function appendWorkflowFile(filePath, line) {
  if (!filePath) return;
  fs.appendFileSync(filePath, `${line}\n`, 'utf8');
}

function main() {
  const mode = process.env.ANALYTICS_DEPLOYMENT_MODE || 'auto';
  const rawToken = process.env.ANALYTICS_SITE_TOKEN ?? '';
  if (String(rawToken).trim()) console.log(`::add-mask::${String(rawToken).trim()}`);

  const result = resolveAnalyticsDeployment({mode, token: rawToken});
  const reportPath = process.env.ANALYTICS_DEPLOYMENT_REPORT_PATH || DEFAULT_REPORT_PATH;
  writeAnalyticsDeploymentContract(result, reportPath);

  appendWorkflowFile(process.env.GITHUB_ENV, `ANALYTICS_EXPECTATION=${result.expectation}`);
  appendWorkflowFile(
    process.env.GITHUB_ENV,
    `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN=${result.enabled ? String(rawToken).trim() : ''}`,
  );
  appendWorkflowFile(process.env.GITHUB_OUTPUT, `analytics_expectation=${result.expectation}`);

  console.log(
    `Analytics deployment: mode=${result.mode} expectation=${result.expectation} reason=${result.reason}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(`Analytics deployment preflight failed: ${error.message}`);
    process.exit(1);
  }
}
